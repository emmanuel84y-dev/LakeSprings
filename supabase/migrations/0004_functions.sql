-- =====================================================================
-- LakeSprings Hotels — 0004: Functions & Triggers
-- =====================================================================

-- ---------------------------------------------------------------------
-- updated_at maintenance
-- ---------------------------------------------------------------------
create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create trigger trg_profiles_updated_at        before update on public.profiles        for each row execute function public.set_updated_at();
create trigger trg_hotel_settings_updated_at  before update on public.hotel_settings  for each row execute function public.set_updated_at();
create trigger trg_rooms_updated_at           before update on public.rooms           for each row execute function public.set_updated_at();
create trigger trg_bookings_updated_at        before update on public.bookings        for each row execute function public.set_updated_at();
create trigger trg_blog_posts_updated_at      before update on public.blog_posts      for each row execute function public.set_updated_at();

-- ---------------------------------------------------------------------
-- Role helpers — SECURITY DEFINER so they can read `profiles` without
-- getting tangled in the RLS policies that themselves call these
-- functions (which would otherwise recurse).
-- ---------------------------------------------------------------------
create or replace function public.current_staff_role()
returns user_role
language sql
security definer
set search_path = public
stable
as $$
  select role from public.profiles where id = auth.uid() and active = true;
$$;

create or replace function public.is_staff()
returns boolean
language sql
security definer
set search_path = public
stable
as $$
  select exists (
    select 1 from public.profiles where id = auth.uid() and active = true
  );
$$;

create or replace function public.is_manager_or_above()
returns boolean
language sql
security definer
set search_path = public
stable
as $$
  select coalesce(public.current_staff_role() in ('manager', 'super_admin'), false);
$$;

create or replace function public.is_super_admin()
returns boolean
language sql
security definer
set search_path = public
stable
as $$
  select coalesce(public.current_staff_role() = 'super_admin', false);
$$;

-- ---------------------------------------------------------------------
-- Booking reference generator, e.g. LSH-7K2P9Q
-- ---------------------------------------------------------------------
create or replace function public.generate_booking_reference()
returns text
language plpgsql
as $$
declare
  chars text := 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'; -- no 0/O/1/I ambiguity
  ref text;
  exists_already boolean;
begin
  loop
    ref := 'LSH-';
    for i in 1..6 loop
      ref := ref || substr(chars, 1 + floor(random() * length(chars))::int, 1);
    end loop;
    select exists(select 1 from public.bookings where booking_reference = ref) into exists_already;
    exit when not exists_already;
  end loop;
  return ref;
end;
$$;

-- ---------------------------------------------------------------------
-- Availability check used by both the room-detail page and search
-- ---------------------------------------------------------------------
create or replace function public.is_room_available(
  p_room_id uuid,
  p_check_in date,
  p_check_out date
)
returns boolean
language plpgsql
security definer
set search_path = public
stable
as $$
declare
  v_active boolean;
  v_range daterange := daterange(p_check_in, p_check_out, '[)');
begin
  if p_check_out <= p_check_in then
    return false;
  end if;

  select active and not archived into v_active from public.rooms where id = p_room_id;
  if v_active is not true then
    return false;
  end if;

  if exists (
    select 1 from public.bookings
    where room_id = p_room_id
      and status in ('pending', 'confirmed')
      and stay_range && v_range
  ) then
    return false;
  end if;

  if exists (
    select 1 from public.blocked_dates
    where room_id = p_room_id
      and block_range && v_range
  ) then
    return false;
  end if;

  return true;
end;
$$;

grant execute on function public.is_room_available(uuid, date, date) to anon, authenticated;

-- ---------------------------------------------------------------------
-- Search available rooms for the homepage/rooms-page search widget
-- ---------------------------------------------------------------------
create or replace function public.search_available_rooms(
  p_check_in   date,
  p_check_out  date,
  p_guests     integer default 1,
  p_room_type  text default null
)
returns setof public.rooms
language sql
security definer
set search_path = public
stable
as $$
  select r.*
  from public.rooms r
  where r.active = true
    and r.archived = false
    and r.max_guests >= coalesce(p_guests, 1)
    and (p_room_type is null or r.room_type = p_room_type)
    and public.is_room_available(r.id, p_check_in, p_check_out)
  order by r.featured desc, r.price_per_night asc;
$$;

grant execute on function public.search_available_rooms(date, date, integer, text) to anon, authenticated;

-- ---------------------------------------------------------------------
-- create_booking — the single, database-enforced entry point for
-- creating a reservation. Runs as SECURITY DEFINER so anonymous guests
-- can call it (via Supabase RPC) without needing direct INSERT rights
-- on `bookings`. An advisory lock on the room serializes concurrent
-- attempts for the same room, and the exclusion constraint on
-- `bookings` is the final, unconditional guarantee against
-- double-booking even if two requests race past the lock at the same
-- instant on different connections.
-- ---------------------------------------------------------------------
create or replace function public.create_booking(
  p_room_id          uuid,
  p_check_in         date,
  p_check_out        date,
  p_adults           integer,
  p_children         integer,
  p_guest_name       text,
  p_guest_email      text,
  p_guest_phone      text,
  p_guest_whatsapp   text,
  p_special_requests text
)
returns public.bookings
language plpgsql
security definer
set search_path = public
as $$
declare
  v_room        public.rooms%rowtype;
  v_nights      integer;
  v_subtotal    numeric(12,2);
  v_booking     public.bookings%rowtype;
begin
  if p_check_out <= p_check_in then
    raise exception 'Check-out date must be after check-in date';
  end if;

  if p_check_in < current_date then
    raise exception 'Check-in date cannot be in the past';
  end if;

  -- Serialize concurrent booking attempts for the same room.
  perform pg_advisory_xact_lock(hashtext(p_room_id::text));

  select * into v_room from public.rooms where id = p_room_id;
  if not found or v_room.active = false or v_room.archived = true then
    raise exception 'This room is not available for booking';
  end if;

  if (p_adults + coalesce(p_children, 0)) > v_room.max_guests then
    raise exception 'This room accommodates a maximum of % guests', v_room.max_guests;
  end if;

  if not public.is_room_available(p_room_id, p_check_in, p_check_out) then
    raise exception 'This room is no longer available for the selected dates';
  end if;

  v_nights   := p_check_out - p_check_in;
  v_subtotal := v_room.price_per_night * v_nights;

  insert into public.bookings (
    booking_reference, room_id, guest_name, guest_email, guest_phone,
    guest_whatsapp, adults, children, check_in_date, check_out_date,
    room_rate, subtotal, discount_amount, taxes_fees, total_amount,
    special_requests, status
  ) values (
    public.generate_booking_reference(), p_room_id, p_guest_name, p_guest_email, p_guest_phone,
    p_guest_whatsapp, p_adults, coalesce(p_children, 0), p_check_in, p_check_out,
    v_room.price_per_night, v_subtotal, 0, 0, v_subtotal,
    p_special_requests, 'pending'
  )
  returning * into v_booking;

  return v_booking;
exception
  when exclusion_violation then
    raise exception 'This room was just booked for an overlapping date by another guest. Please choose different dates.';
end;
$$;

grant execute on function public.create_booking(
  uuid, date, date, integer, integer, text, text, text, text, text
) to anon, authenticated;

-- ---------------------------------------------------------------------
-- get_booking_by_reference — powers the public /booking/success page.
-- `bookings` has no public SELECT policy (see 0005_rls.sql), so a
-- guest can only ever look up the exact reference they were just
-- handed by create_booking() — never browse or enumerate bookings.
-- ---------------------------------------------------------------------
create or replace function public.get_booking_by_reference(p_reference text)
returns table (
  booking_reference text,
  guest_name text,
  guest_email text,
  room_name text,
  check_in_date date,
  check_out_date date,
  nights integer,
  adults integer,
  children integer,
  total_amount numeric,
  status booking_status
)
language sql
security definer
set search_path = public
stable
as $$
  select
    b.booking_reference, b.guest_name, b.guest_email, r.name as room_name,
    b.check_in_date, b.check_out_date, b.nights, b.adults, b.children,
    b.total_amount, b.status
  from public.bookings b
  join public.rooms r on r.id = b.room_id
  where b.booking_reference = p_reference;
$$;

grant execute on function public.get_booking_by_reference(text) to anon, authenticated;

-- ---------------------------------------------------------------------
-- Dashboard stats — single round trip for the admin overview page
-- ---------------------------------------------------------------------
create or replace function public.admin_dashboard_stats()
returns json
language plpgsql
security definer
set search_path = public
stable
as $$
declare
  v_result json;
begin
  if not public.is_staff() then
    raise exception 'Not authorized';
  end if;

  select json_build_object(
    'total_rooms', (select count(*) from public.rooms where archived = false),
    'active_rooms', (select count(*) from public.rooms where active = true and archived = false),
    'occupied_today', (
      select count(distinct room_id) from public.bookings
      where status in ('confirmed', 'checked_in')
        and stay_range @> current_date
    ),
    'todays_arrivals', (
      select count(*) from public.bookings
      where check_in_date = current_date and status in ('pending', 'confirmed')
    ),
    'todays_departures', (
      select count(*) from public.bookings
      where check_out_date = current_date and status in ('confirmed', 'checked_in')
    ),
    'pending_bookings', (select count(*) from public.bookings where status = 'pending'),
    'confirmed_bookings', (select count(*) from public.bookings where status = 'confirmed'),
    'revenue_30d', (
      select coalesce(sum(total_amount), 0) from public.bookings
      where status in ('confirmed', 'checked_in', 'checked_out', 'completed')
        and created_at >= now() - interval '30 days'
    ),
    'new_messages', (select count(*) from public.contact_messages where status = 'unread'),
    'pending_visits', (select count(*) from public.visit_requests where status = 'pending')
  ) into v_result;

  return v_result;
end;
$$;

grant execute on function public.admin_dashboard_stats() to authenticated;

-- ---------------------------------------------------------------------
-- Auto-create a `profiles` row whenever a staff member is invited /
-- signs up through Supabase Auth. Defaults to 'staff'; promote via the
-- admin dashboard (super_admin only) or directly in the table for the
-- very first account (see README → Admin Setup).
-- ---------------------------------------------------------------------
create or replace function public.handle_new_auth_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.profiles (id, full_name, email, role)
  values (
    new.id,
    coalesce(new.raw_user_meta_data ->> 'full_name', new.email),
    new.email,
    'staff'
  )
  on conflict (id) do nothing;
  return new;
end;
$$;

create trigger trg_on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_auth_user();
