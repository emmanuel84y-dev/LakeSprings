-- =====================================================================
-- LakeSprings Hotels — 0005: Row Level Security
--
-- Convention used throughout:
--   - "public read" tables expose only what a guest should see
--     (active rooms, published posts, active offers, etc).
--   - Writes are gated by is_manager_or_above() / is_staff() /
--     is_super_admin() — helper functions defined in 0004_functions.sql.
--   - Guest-submitted tables (bookings, contact_messages,
--     visit_requests, newsletter_subscribers) do NOT grant anon INSERT
--     directly; bookings go through the create_booking() RPC, and the
--     other three intentionally do to keep simple public forms working,
--     but SELECT/UPDATE/DELETE are staff-only.
-- =====================================================================

alter table public.profiles                enable row level security;
alter table public.hotel_settings          enable row level security;
alter table public.rooms                   enable row level security;
alter table public.room_images             enable row level security;
alter table public.amenities               enable row level security;
alter table public.room_amenities          enable row level security;
alter table public.bookings                enable row level security;
alter table public.blocked_dates           enable row level security;
alter table public.payments                enable row level security;
alter table public.offers                  enable row level security;
alter table public.offer_rooms             enable row level security;
alter table public.gallery                 enable row level security;
alter table public.testimonials            enable row level security;
alter table public.blog_categories         enable row level security;
alter table public.blog_posts              enable row level security;
alter table public.visit_requests          enable row level security;
alter table public.contact_messages        enable row level security;
alter table public.newsletter_subscribers  enable row level security;

-- ---------------------------------------------------------------------
-- profiles
-- ---------------------------------------------------------------------
create policy "staff can read own profile" on public.profiles
  for select using (id = auth.uid());

create policy "super_admin can read all profiles" on public.profiles
  for select using (public.is_super_admin());

create policy "super_admin can manage profiles" on public.profiles
  for update using (public.is_super_admin());

create policy "super_admin can insert profiles" on public.profiles
  for insert with check (public.is_super_admin());

-- ---------------------------------------------------------------------
-- hotel_settings
-- ---------------------------------------------------------------------
create policy "anyone can read hotel settings" on public.hotel_settings
  for select using (true);

create policy "manager can update hotel settings" on public.hotel_settings
  for update using (public.is_manager_or_above());

-- ---------------------------------------------------------------------
-- rooms
-- ---------------------------------------------------------------------
create policy "anyone can read active rooms" on public.rooms
  for select using (active = true and archived = false);

create policy "staff can read all rooms" on public.rooms
  for select using (public.is_staff());

create policy "manager can insert rooms" on public.rooms
  for insert with check (public.is_manager_or_above());

create policy "manager can update rooms" on public.rooms
  for update using (public.is_manager_or_above());

create policy "manager can delete rooms" on public.rooms
  for delete using (public.is_manager_or_above());

-- ---------------------------------------------------------------------
-- room_images
-- ---------------------------------------------------------------------
create policy "anyone can read room images" on public.room_images
  for select using (true);

create policy "manager can manage room images" on public.room_images
  for all using (public.is_manager_or_above()) with check (public.is_manager_or_above());

-- ---------------------------------------------------------------------
-- amenities / room_amenities
-- ---------------------------------------------------------------------
create policy "anyone can read active amenities" on public.amenities
  for select using (active = true);

create policy "staff can read all amenities" on public.amenities
  for select using (public.is_staff());

create policy "manager can manage amenities" on public.amenities
  for all using (public.is_manager_or_above()) with check (public.is_manager_or_above());

create policy "anyone can read room_amenities" on public.room_amenities
  for select using (true);

create policy "manager can manage room_amenities" on public.room_amenities
  for all using (public.is_manager_or_above()) with check (public.is_manager_or_above());

-- ---------------------------------------------------------------------
-- bookings — no public SELECT/INSERT/UPDATE at all. Guests create
-- bookings exclusively through the create_booking() RPC (SECURITY
-- DEFINER, defined in 0004_functions.sql), which returns the created
-- row directly to the caller for the confirmation page. Nothing here
-- lets a guest read another guest's booking.
-- ---------------------------------------------------------------------
create policy "staff can read bookings" on public.bookings
  for select using (public.is_staff());

create policy "staff can update bookings" on public.bookings
  for update using (public.is_staff());

create policy "manager can delete bookings" on public.bookings
  for delete using (public.is_manager_or_above());

-- ---------------------------------------------------------------------
-- blocked_dates — staff only, in both directions. Public availability
-- is derived through is_room_available()/search_available_rooms(),
-- which never expose the block reason or raw rows.
-- ---------------------------------------------------------------------
create policy "staff can read blocked_dates" on public.blocked_dates
  for select using (public.is_staff());

create policy "manager can manage blocked_dates" on public.blocked_dates
  for all using (public.is_manager_or_above()) with check (public.is_manager_or_above());

-- ---------------------------------------------------------------------
-- payments — staff only
-- ---------------------------------------------------------------------
create policy "staff can read payments" on public.payments
  for select using (public.is_staff());

create policy "manager can manage payments" on public.payments
  for all using (public.is_manager_or_above()) with check (public.is_manager_or_above());

-- ---------------------------------------------------------------------
-- offers / offer_rooms
-- ---------------------------------------------------------------------
create policy "anyone can read active offers" on public.offers
  for select using (active = true and current_date between start_date and end_date);

create policy "staff can read all offers" on public.offers
  for select using (public.is_staff());

create policy "manager can manage offers" on public.offers
  for all using (public.is_manager_or_above()) with check (public.is_manager_or_above());

create policy "anyone can read offer_rooms" on public.offer_rooms
  for select using (true);

create policy "manager can manage offer_rooms" on public.offer_rooms
  for all using (public.is_manager_or_above()) with check (public.is_manager_or_above());

-- ---------------------------------------------------------------------
-- gallery
-- ---------------------------------------------------------------------
create policy "anyone can read gallery" on public.gallery
  for select using (true);

create policy "manager can manage gallery" on public.gallery
  for all using (public.is_manager_or_above()) with check (public.is_manager_or_above());

-- ---------------------------------------------------------------------
-- testimonials
-- ---------------------------------------------------------------------
create policy "anyone can read published testimonials" on public.testimonials
  for select using (published = true);

create policy "staff can read all testimonials" on public.testimonials
  for select using (public.is_staff());

create policy "manager can manage testimonials" on public.testimonials
  for all using (public.is_manager_or_above()) with check (public.is_manager_or_above());

-- ---------------------------------------------------------------------
-- blog
-- ---------------------------------------------------------------------
create policy "anyone can read blog categories" on public.blog_categories
  for select using (true);

create policy "manager can manage blog categories" on public.blog_categories
  for all using (public.is_manager_or_above()) with check (public.is_manager_or_above());

create policy "anyone can read published posts" on public.blog_posts
  for select using (published = true);

create policy "staff can read all posts" on public.blog_posts
  for select using (public.is_staff());

create policy "staff can manage posts" on public.blog_posts
  for all using (public.is_staff()) with check (public.is_staff());

-- ---------------------------------------------------------------------
-- visit_requests — anon can submit, staff manage
-- ---------------------------------------------------------------------
create policy "anyone can submit a visit request" on public.visit_requests
  for insert with check (true);

create policy "staff can read visit_requests" on public.visit_requests
  for select using (public.is_staff());

create policy "staff can update visit_requests" on public.visit_requests
  for update using (public.is_staff());

-- ---------------------------------------------------------------------
-- contact_messages — anon can submit, staff manage
-- ---------------------------------------------------------------------
create policy "anyone can submit a contact message" on public.contact_messages
  for insert with check (true);

create policy "staff can read contact_messages" on public.contact_messages
  for select using (public.is_staff());

create policy "staff can update contact_messages" on public.contact_messages
  for update using (public.is_staff());

-- ---------------------------------------------------------------------
-- newsletter_subscribers — anon can subscribe, staff manage
-- ---------------------------------------------------------------------
create policy "anyone can subscribe to newsletter" on public.newsletter_subscribers
  for insert with check (true);

create policy "staff can read newsletter_subscribers" on public.newsletter_subscribers
  for select using (public.is_staff());

create policy "staff can update newsletter_subscribers" on public.newsletter_subscribers
  for update using (public.is_staff());
