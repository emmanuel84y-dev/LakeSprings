-- =====================================================================
-- LakeSprings Hotels — 0007: Seed Data
--
-- Demo content so the site isn't empty on first run. Every image path
-- below points at picsum.photos placeholders — replace them with real
-- photography from the admin dashboard (Rooms → Images, Gallery, etc).
-- Safe to re-run: every insert is idempotent.
-- =====================================================================

insert into public.hotel_settings (id, name, tagline, description, address, phone, whatsapp, email, google_maps_url, instagram_url, facebook_url)
values (
  1,
  'LakeSprings Hotels',
  'Comfort. Stillness. Exceptional Hospitality.',
  'Set beside the quiet water at Agodi, LakeSprings Hotels pairs warm Nigerian hospitality with calm, considered design. Every room looks out over the lake gardens, and every stay starts with someone who already knows your name.',
  '14 Agodi Reservoir Road, Ibadan, Oyo State, Nigeria',
  '+234 800 000 0000',
  '+234 800 000 0000',
  'reservations@lakesprings.example',
  'https://maps.google.com',
  'https://instagram.com/lakespringshotels',
  'https://facebook.com/lakespringshotels'
)
on conflict (id) do nothing;

-- ---------------------------------------------------------------------
-- Amenities
-- ---------------------------------------------------------------------
insert into public.amenities (name, description, icon) values
  ('Free Wi-Fi', 'High-speed wireless internet throughout the room and hotel', 'wifi'),
  ('Air Conditioning', 'Individually controlled climate in every room', 'wind'),
  ('24/7 Electricity', 'Full backup power, day and night', 'zap'),
  ('Smart TV', 'Streaming-enabled flat screen television', 'tv'),
  ('Mini Fridge', 'In-room refrigerator', 'refrigerator'),
  ('Private Bathroom', 'En-suite bathroom with hot water', 'bath'),
  ('Workspace', 'Dedicated desk and chair', 'briefcase'),
  ('Balcony', 'Private balcony or terrace', 'door-open'),
  ('Breakfast Included', 'Complimentary breakfast for the room''s guests', 'coffee'),
  ('Free Parking', 'On-site parking for guests', 'car'),
  ('Swimming Pool Access', 'Access to the hotel''s outdoor pool', 'waves'),
  ('24/7 Security', 'Round-the-clock on-site security', 'shield')
on conflict (name) do nothing;

-- ---------------------------------------------------------------------
-- Rooms
-- ---------------------------------------------------------------------
insert into public.rooms (name, room_number, slug, room_type, description, price_per_night, max_guests, bed_type, size_sqm, floor, featured, active)
values
  ('Deluxe Room', '101', 'deluxe-room', 'Deluxe',
   'A calm, sunlit room with garden views — ideal for a short stay in comfort.',
   75000, 2, 'Queen Bed', 28, '1st Floor', true, true),
  ('Executive Room', '205', 'executive-room', 'Executive',
   'A larger room with a dedicated workspace and a partial lake view, built for the business traveller who still wants to unwind.',
   95000, 2, 'King Bed', 34, '2nd Floor', true, true),
  ('Premium Suite', '301', 'premium-suite', 'Suite',
   'A separate living area, a soaking tub, and an unobstructed view of the lake gardens at sunset.',
   145000, 3, 'King Bed + Sofa Bed', 52, '3rd Floor', true, true),
  ('Family Suite', '302', 'family-suite', 'Suite',
   'Two connected sleeping areas and a shared lounge, sized for a family of five without anyone feeling boxed in.',
   170000, 5, 'King Bed + 2 Twin Beds', 65, '3rd Floor', false, true),
  ('Presidential Suite', '401', 'presidential-suite', 'Presidential',
   'The whole top floor corner: a private terrace over the lake, a dining table for six, and a butler on call.',
   320000, 4, 'King Bed + Twin Bed', 110, '4th Floor', true, true)
on conflict (slug) do nothing;

-- ---------------------------------------------------------------------
-- Room images (placeholders — replace via Admin → Rooms → Images)
-- ---------------------------------------------------------------------
insert into public.room_images (room_id, storage_path, alt_text, display_order, is_primary)
select r.id, 'https://picsum.photos/seed/' || r.slug || '-1/1600/1000', r.name || ' — main view', 0, true
from public.rooms r
where not exists (select 1 from public.room_images ri where ri.room_id = r.id);

insert into public.room_images (room_id, storage_path, alt_text, display_order, is_primary)
select r.id, 'https://picsum.photos/seed/' || r.slug || '-2/1600/1000', r.name || ' — bathroom', 1, false
from public.rooms r;

insert into public.room_images (room_id, storage_path, alt_text, display_order, is_primary)
select r.id, 'https://picsum.photos/seed/' || r.slug || '-3/1600/1000', r.name || ' — view', 2, false
from public.rooms r;

-- ---------------------------------------------------------------------
-- Room <-> amenity assignments (every room gets the base set; suites
-- and above also get pool + breakfast)
-- ---------------------------------------------------------------------
insert into public.room_amenities (room_id, amenity_id)
select r.id, a.id
from public.rooms r
cross join public.amenities a
where a.name in ('Free Wi-Fi', 'Air Conditioning', '24/7 Electricity', 'Smart TV', 'Mini Fridge', 'Private Bathroom', '24/7 Security')
on conflict do nothing;

insert into public.room_amenities (room_id, amenity_id)
select r.id, a.id
from public.rooms r
cross join public.amenities a
where r.room_type in ('Suite', 'Presidential')
  and a.name in ('Breakfast Included', 'Swimming Pool Access', 'Balcony', 'Workspace', 'Free Parking')
on conflict do nothing;

-- ---------------------------------------------------------------------
-- Offer
-- ---------------------------------------------------------------------
insert into public.offers (title, slug, description, discount_type, discount_value, start_date, end_date, active)
select 'Weekend Escape', 'weekend-escape',
  'Book a Friday or Saturday night and save 15% on the room rate — breakfast included.',
  'percentage', 15, current_date, current_date + interval '90 days', true
where not exists (select 1 from public.offers where slug = 'weekend-escape');

insert into public.offer_rooms (offer_id, room_id)
select o.id, r.id
from public.offers o
cross join public.rooms r
where o.slug = 'weekend-escape'
on conflict do nothing;

-- ---------------------------------------------------------------------
-- Testimonials
-- ---------------------------------------------------------------------
insert into public.testimonials (guest_name, location, rating, review, featured, published)
select * from (values
  ('Adaeze O.', 'Lagos, Nigeria', 5, 'Quiet, spotless, and the staff remembered my coffee order by day two. Exactly what I needed after a long work trip.', true, true),
  ('James T.', 'London, UK', 5, 'The lake view from the Premium Suite alone is worth the stay. Breakfast was outstanding.', true, true),
  ('Funmilayo A.', 'Ibadan, Nigeria', 4, 'Booked the Family Suite for my parents'' anniversary — plenty of space and the kids had their own corner.', false, true)
) as t(guest_name, location, rating, review, featured, published)
where not exists (select 1 from public.testimonials);

-- ---------------------------------------------------------------------
-- Blog
-- ---------------------------------------------------------------------
insert into public.blog_categories (name, slug)
values ('Hotel News', 'hotel-news'), ('Local Guide', 'local-guide')
on conflict (name) do nothing;

insert into public.blog_posts (title, slug, excerpt, content, category_id, tags, published, published_at)
select
  'Five Quiet Corners of Ibadan Worth the Short Drive',
  'five-quiet-corners-of-ibadan',
  'From the reservoir gardens to a hillside bookshop — where to spend a slow afternoon near the hotel.',
  'Full article content goes here — edit from Admin → Blog.',
  (select id from public.blog_categories where slug = 'local-guide'),
  array['ibadan', 'travel'],
  true,
  now()
where not exists (select 1 from public.blog_posts where slug = 'five-quiet-corners-of-ibadan');
