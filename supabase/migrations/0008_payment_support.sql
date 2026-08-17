-- Payment support: guests can create a pending payment only when they
-- present the booking reference + guest email that belongs to the booking.
create or replace function public.create_payment_for_booking(
  p_booking_reference text,
  p_guest_email text,
  p_amount numeric,
  p_provider text default 'flutterwave'
)
returns public.payments
language plpgsql
security definer
set search_path = public
as $$
declare v_booking public.bookings%rowtype; v_payment public.payments%rowtype;
begin
  select * into v_booking from public.bookings where booking_reference=p_booking_reference and lower(guest_email)=lower(p_guest_email);
  if not found then raise exception 'Booking could not be verified'; end if;
  if v_booking.status in ('cancelled','completed','no_show') then raise exception 'This booking cannot be paid'; end if;
  if p_amount <= 0 or p_amount <> v_booking.total_amount then raise exception 'Invalid payment amount'; end if;
  insert into public.payments(booking_id,amount,currency,provider,status) values(v_booking.id,p_amount,'NGN',p_provider,'pending') returning * into v_payment;
  return v_payment;
end;
$$;
grant execute on function public.create_payment_for_booking(text,text,numeric,text) to anon, authenticated;

create or replace function public.confirm_paid_booking(p_reference text)
returns public.bookings
language plpgsql
security definer
set search_path = public
as $$
declare v_booking public.bookings%rowtype;
begin
  update public.bookings set status='confirmed' where booking_reference=p_reference and status='pending' returning * into v_booking;
  if not found then raise exception 'Booking not found or already confirmed'; end if;
  return v_booking;
end;
$$;
grant execute on function public.confirm_paid_booking(text) to anon, authenticated;
