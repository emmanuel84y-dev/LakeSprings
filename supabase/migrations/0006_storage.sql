-- =====================================================================
-- LakeSprings Hotels — 0006: Storage Buckets & Policies
--
-- All buckets are public-READ (so <img> tags can hit the public URL
-- directly) but writes require an authenticated staff account with at
-- least 'staff' role. Run this after 0005_rls.sql.
-- =====================================================================

insert into storage.buckets (id, name, public)
values
  ('room-images', 'room-images', true),
  ('gallery-images', 'gallery-images', true),
  ('blog-images', 'blog-images', true),
  ('testimonial-images', 'testimonial-images', true),
  ('hotel-images', 'hotel-images', true)
on conflict (id) do nothing;

-- Public read for every bucket above
create policy "public can view room-images"
  on storage.objects for select
  using (bucket_id = 'room-images');

create policy "public can view gallery-images"
  on storage.objects for select
  using (bucket_id = 'gallery-images');

create policy "public can view blog-images"
  on storage.objects for select
  using (bucket_id = 'blog-images');

create policy "public can view testimonial-images"
  on storage.objects for select
  using (bucket_id = 'testimonial-images');

create policy "public can view hotel-images"
  on storage.objects for select
  using (bucket_id = 'hotel-images');

-- Staff-only writes (INSERT/UPDATE/DELETE) for every bucket above.
-- is_staff() is defined in 0004_functions.sql.
create policy "staff can upload room-images"
  on storage.objects for insert
  with check (bucket_id = 'room-images' and public.is_staff());
create policy "staff can modify room-images"
  on storage.objects for update
  using (bucket_id = 'room-images' and public.is_staff());
create policy "staff can delete room-images"
  on storage.objects for delete
  using (bucket_id = 'room-images' and public.is_staff());

create policy "staff can upload gallery-images"
  on storage.objects for insert
  with check (bucket_id = 'gallery-images' and public.is_staff());
create policy "staff can modify gallery-images"
  on storage.objects for update
  using (bucket_id = 'gallery-images' and public.is_staff());
create policy "staff can delete gallery-images"
  on storage.objects for delete
  using (bucket_id = 'gallery-images' and public.is_staff());

create policy "staff can upload blog-images"
  on storage.objects for insert
  with check (bucket_id = 'blog-images' and public.is_staff());
create policy "staff can modify blog-images"
  on storage.objects for update
  using (bucket_id = 'blog-images' and public.is_staff());
create policy "staff can delete blog-images"
  on storage.objects for delete
  using (bucket_id = 'blog-images' and public.is_staff());

create policy "staff can upload testimonial-images"
  on storage.objects for insert
  with check (bucket_id = 'testimonial-images' and public.is_staff());
create policy "staff can modify testimonial-images"
  on storage.objects for update
  using (bucket_id = 'testimonial-images' and public.is_staff());
create policy "staff can delete testimonial-images"
  on storage.objects for delete
  using (bucket_id = 'testimonial-images' and public.is_staff());

create policy "staff can upload hotel-images"
  on storage.objects for insert
  with check (bucket_id = 'hotel-images' and public.is_staff());
create policy "staff can modify hotel-images"
  on storage.objects for update
  using (bucket_id = 'hotel-images' and public.is_staff());
create policy "staff can delete hotel-images"
  on storage.objects for delete
  using (bucket_id = 'hotel-images' and public.is_staff());
