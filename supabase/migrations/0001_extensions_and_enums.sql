-- =====================================================================
-- LakeSprings Hotels — 0001: Extensions & Enum Types
-- =====================================================================

create extension if not exists "pgcrypto";   -- gen_random_uuid()
create extension if not exists "btree_gist"; -- required for the exclusion
                                              -- constraint that prevents
                                              -- double-booking a room

-- ---------------------------------------------------------------------
-- Enums
-- ---------------------------------------------------------------------
create type user_role as enum ('super_admin', 'manager', 'staff');

create type booking_status as enum (
  'pending', 'confirmed', 'cancelled',
  'checked_in', 'checked_out', 'completed', 'no_show'
);

create type block_type as enum ('maintenance', 'manual', 'other');

create type payment_status as enum ('pending', 'successful', 'failed', 'refunded');

create type discount_type as enum ('percentage', 'fixed');

create type gallery_category as enum (
  'hotel', 'rooms', 'restaurant', 'pool', 'facilities', 'events', 'exterior'
);

create type visit_status as enum ('pending', 'confirmed', 'completed', 'cancelled');

create type contact_status as enum ('unread', 'read', 'resolved');

create type subscriber_status as enum ('active', 'unsubscribed');
