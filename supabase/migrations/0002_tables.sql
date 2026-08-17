-- =====================================================================
-- LakeSprings Hotels — 0002: Tables
-- =====================================================================

-- ---------------------------------------------------------------------
-- profiles — one row per Supabase Auth user who is hotel staff
-- ---------------------------------------------------------------------
create table public.profiles (
  id          uuid primary key references auth.users (id) on delete cascade,
  full_name   text not null,
  email       text not null,
  role        user_role not null default 'staff',
  active      boolean not null default true,
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now()
);

comment on table public.profiles is 'Hotel staff accounts. Guests never get a row here — bookings are taken as a guest, not as a signed-in user.';

-- ---------------------------------------------------------------------
-- hotel_settings — singleton row of global hotel info
-- ---------------------------------------------------------------------
create table public.hotel_settings (
  id                integer primary key default 1,
  name              text not null default 'LakeSprings Hotels',
  tagline           text not null default 'Comfort. Stillness. Exceptional Hospitality.',
  description       text not null default '',
  address           text not null default '',
  phone             text not null default '',
  whatsapp          text not null default '',
  email             text not null default '',
  check_in_time     text not null default '14:00',
  check_out_time    text not null default '11:00',
  currency          text not null default 'NGN',
  google_maps_url   text,
  instagram_url     text,
  facebook_url      text,
  twitter_url       text,
  min_stay_nights   integer not null default 1,
  max_stay_nights   integer not null default 30,
  updated_at        timestamptz not null default now(),
  constraint hotel_settings_singleton check (id = 1)
);

comment on table public.hotel_settings is 'Exactly one row (id=1). Everything the manager can edit under Hotel Settings.';

-- ---------------------------------------------------------------------
-- rooms
-- ---------------------------------------------------------------------
create table public.rooms (
  id              uuid primary key default gen_random_uuid(),
  name            text not null,
  room_number     text,
  slug            text not null unique,
  room_type       text not null,
  description     text not null default '',
  price_per_night numeric(12,2) not null check (price_per_night >= 0),
  max_guests      integer not null check (max_guests > 0),
  bed_type        text,
  size_sqm        numeric(6,2),
  floor           text,
  featured        boolean not null default false,
  active          boolean not null default true,
  archived        boolean not null default false,
  created_at      timestamptz not null default now(),
  updated_at      timestamptz not null default now()
);

create table public.room_images (
  id            uuid primary key default gen_random_uuid(),
  room_id       uuid not null references public.rooms (id) on delete cascade,
  storage_path  text not null,
  alt_text      text not null default '',
  display_order integer not null default 0,
  is_primary    boolean not null default false,
  created_at    timestamptz not null default now()
);

-- ---------------------------------------------------------------------
-- amenities (shared master list) + room <-> amenity join
-- ---------------------------------------------------------------------
create table public.amenities (
  id          uuid primary key default gen_random_uuid(),
  name        text not null unique,
  description text not null default '',
  icon        text not null default 'sparkles',
  active      boolean not null default true,
  created_at  timestamptz not null default now()
);

create table public.room_amenities (
  room_id     uuid not null references public.rooms (id) on delete cascade,
  amenity_id  uuid not null references public.amenities (id) on delete cascade,
  primary key (room_id, amenity_id)
);

-- ---------------------------------------------------------------------
-- bookings — the core reservation record
-- ---------------------------------------------------------------------
create table public.bookings (
  id                  uuid primary key default gen_random_uuid(),
  booking_reference   text not null unique,
  room_id             uuid not null references public.rooms (id),
  guest_name          text not null,
  guest_email         text not null,
  guest_phone         text not null,
  guest_whatsapp      text,
  adults              integer not null default 1 check (adults > 0),
  children            integer not null default 0 check (children >= 0),
  check_in_date       date not null,
  check_out_date      date not null,
  nights              integer generated always as (check_out_date - check_in_date) stored,
  room_rate           numeric(12,2) not null,       -- snapshot of price/night at booking time
  subtotal            numeric(12,2) not null,
  discount_amount     numeric(12,2) not null default 0,
  taxes_fees          numeric(12,2) not null default 0,
  total_amount        numeric(12,2) not null,
  special_requests    text,
  status              booking_status not null default 'pending',
  stay_range          daterange generated always as (
                        daterange(check_in_date, check_out_date, '[)')
                      ) stored,
  created_at          timestamptz not null default now(),
  updated_at          timestamptz not null default now(),
  constraint bookings_dates_valid check (check_out_date > check_in_date),
  -- The database is the final authority on double-booking: two rows for
  -- the same room with overlapping stay_range can never both be
  -- pending/confirmed, even under concurrent requests.
  constraint bookings_no_overlap exclude using gist (
    room_id with =,
    stay_range with &&
  ) where (status in ('pending', 'confirmed'))
);

-- ---------------------------------------------------------------------
-- blocked_dates — manual holds / maintenance blocks set by staff
-- ---------------------------------------------------------------------
create table public.blocked_dates (
  id           uuid primary key default gen_random_uuid(),
  room_id      uuid not null references public.rooms (id) on delete cascade,
  start_date   date not null,
  end_date     date not null,
  block_range  daterange generated always as (
                 daterange(start_date, end_date, '[)')
               ) stored,
  block_type   block_type not null default 'manual',
  reason       text,
  created_by   uuid references public.profiles (id),
  created_at   timestamptz not null default now(),
  constraint blocked_dates_valid check (end_date > start_date),
  constraint blocked_dates_no_overlap exclude using gist (
    room_id with =,
    block_range with &&
  )
);

-- ---------------------------------------------------------------------
-- payments — architecture only; no live gateway wired in yet
-- ---------------------------------------------------------------------
create table public.payments (
  id                    uuid primary key default gen_random_uuid(),
  booking_id            uuid not null references public.bookings (id) on delete cascade,
  amount                numeric(12,2) not null,
  currency              text not null default 'NGN',
  provider              text,                       -- e.g. 'flutterwave'
  transaction_reference text,
  status                payment_status not null default 'pending',
  payment_date          timestamptz,
  created_at            timestamptz not null default now()
);

-- ---------------------------------------------------------------------
-- offers
-- ---------------------------------------------------------------------
create table public.offers (
  id             uuid primary key default gen_random_uuid(),
  title          text not null,
  slug           text not null unique,
  description    text not null default '',
  image_path     text,
  discount_type  discount_type not null default 'percentage',
  discount_value numeric(12,2) not null check (discount_value >= 0),
  start_date     date not null,
  end_date       date not null,
  active         boolean not null default true,
  created_at     timestamptz not null default now(),
  constraint offers_dates_valid check (end_date >= start_date)
);

create table public.offer_rooms (
  offer_id uuid not null references public.offers (id) on delete cascade,
  room_id  uuid not null references public.rooms (id) on delete cascade,
  primary key (offer_id, room_id)
);

-- ---------------------------------------------------------------------
-- gallery
-- ---------------------------------------------------------------------
create table public.gallery (
  id            uuid primary key default gen_random_uuid(),
  storage_path  text not null,
  category      gallery_category not null default 'hotel',
  caption       text,
  display_order integer not null default 0,
  created_at    timestamptz not null default now()
);

-- ---------------------------------------------------------------------
-- testimonials
-- ---------------------------------------------------------------------
create table public.testimonials (
  id           uuid primary key default gen_random_uuid(),
  guest_name   text not null,
  location     text,
  rating       integer not null check (rating between 1 and 5),
  review       text not null,
  image_path   text,
  featured     boolean not null default false,
  published    boolean not null default true,
  created_at   timestamptz not null default now()
);

-- ---------------------------------------------------------------------
-- blog
-- ---------------------------------------------------------------------
create table public.blog_categories (
  id   uuid primary key default gen_random_uuid(),
  name text not null unique,
  slug text not null unique
);

create table public.blog_posts (
  id                  uuid primary key default gen_random_uuid(),
  title               text not null,
  slug                text not null unique,
  excerpt             text,
  content             text not null default '',
  featured_image_path text,
  category_id         uuid references public.blog_categories (id),
  tags                text[] not null default '{}',
  seo_title           text,
  seo_description     text,
  published           boolean not null default false,
  published_at        timestamptz,
  author_id           uuid references public.profiles (id),
  created_at          timestamptz not null default now(),
  updated_at          timestamptz not null default now()
);

-- ---------------------------------------------------------------------
-- visit_requests
-- ---------------------------------------------------------------------
create table public.visit_requests (
  id             uuid primary key default gen_random_uuid(),
  name           text not null,
  email          text not null,
  phone          text not null,
  visit_date     date not null,
  preferred_time text not null,
  num_visitors   integer not null default 1 check (num_visitors > 0),
  message        text,
  status         visit_status not null default 'pending',
  created_at     timestamptz not null default now()
);

-- ---------------------------------------------------------------------
-- contact_messages
-- ---------------------------------------------------------------------
create table public.contact_messages (
  id         uuid primary key default gen_random_uuid(),
  name       text not null,
  email      text not null,
  phone      text,
  subject    text,
  message    text not null,
  status     contact_status not null default 'unread',
  created_at timestamptz not null default now()
);

-- ---------------------------------------------------------------------
-- newsletter_subscribers
-- ---------------------------------------------------------------------
create table public.newsletter_subscribers (
  id             uuid primary key default gen_random_uuid(),
  name           text,
  email          text not null unique,
  status         subscriber_status not null default 'active',
  subscribed_at  timestamptz not null default now()
);
