-- =====================================================================
-- LakeSprings Hotels — 0003: Indexes
-- =====================================================================

create index idx_rooms_active on public.rooms (active) where archived = false;
create index idx_rooms_featured on public.rooms (featured) where active = true and archived = false;
create index idx_rooms_slug on public.rooms (slug);
create index idx_rooms_type on public.rooms (room_type);
create index idx_rooms_price on public.rooms (price_per_night);

create index idx_room_images_room_id on public.room_images (room_id, display_order);

create index idx_room_amenities_room_id on public.room_amenities (room_id);
create index idx_room_amenities_amenity_id on public.room_amenities (amenity_id);

create index idx_bookings_room_id on public.bookings (room_id);
create index idx_bookings_status on public.bookings (status);
create index idx_bookings_dates on public.bookings (check_in_date, check_out_date);
create index idx_bookings_email on public.bookings (guest_email);
create index idx_bookings_reference on public.bookings (booking_reference);
create index idx_bookings_created_at on public.bookings (created_at desc);

create index idx_blocked_dates_room_id on public.blocked_dates (room_id);

create index idx_payments_booking_id on public.payments (booking_id);
create index idx_payments_status on public.payments (status);

create index idx_offers_active on public.offers (active, start_date, end_date);
create index idx_offer_rooms_room_id on public.offer_rooms (room_id);

create index idx_gallery_category on public.gallery (category, display_order);

create index idx_testimonials_published on public.testimonials (published, featured);

create index idx_blog_posts_published on public.blog_posts (published, published_at desc);
create index idx_blog_posts_slug on public.blog_posts (slug);
create index idx_blog_posts_category on public.blog_posts (category_id);

create index idx_visit_requests_status on public.visit_requests (status, visit_date);
create index idx_contact_messages_status on public.contact_messages (status);
create index idx_newsletter_status on public.newsletter_subscribers (status);
