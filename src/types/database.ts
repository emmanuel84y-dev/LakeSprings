// =====================================================================
// Hand-written types mirroring supabase/migrations/*.sql.
//
// For a larger team, prefer generating this file instead:
//   npx supabase gen types typescript --project-id YOUR_PROJECT_REF > src/types/database.ts
// The shapes below match the schema exactly, so either source works.
// =====================================================================

export type UserRole = 'super_admin' | 'manager' | 'staff';

export type BookingStatus =
  | 'pending'
  | 'confirmed'
  | 'cancelled'
  | 'checked_in'
  | 'checked_out'
  | 'completed'
  | 'no_show';

export type BlockType = 'maintenance' | 'manual' | 'other';
export type PaymentStatus = 'pending' | 'successful' | 'failed' | 'refunded';
export type DiscountType = 'percentage' | 'fixed';
export type GalleryCategory =
  | 'hotel' | 'rooms' | 'restaurant' | 'pool' | 'facilities' | 'events' | 'exterior';
export type VisitStatus = 'pending' | 'confirmed' | 'completed' | 'cancelled';
export type ContactStatus = 'unread' | 'read' | 'resolved';
export type SubscriberStatus = 'active' | 'unsubscribed';

export interface Profile {
  id: string;
  full_name: string;
  email: string;
  role: UserRole;
  active: boolean;
  created_at: string;
  updated_at: string;
}

export interface HotelSettings {
  id: 1;
  name: string;
  tagline: string;
  description: string;
  address: string;
  phone: string;
  whatsapp: string;
  email: string;
  check_in_time: string;
  check_out_time: string;
  currency: string;
  google_maps_url: string | null;
  instagram_url: string | null;
  facebook_url: string | null;
  twitter_url: string | null;
  min_stay_nights: number;
  max_stay_nights: number;
  updated_at: string;
}

export interface Room {
  id: string;
  name: string;
  room_number: string | null;
  slug: string;
  room_type: string;
  description: string;
  price_per_night: number;
  max_guests: number;
  bed_type: string | null;
  size_sqm: number | null;
  floor: string | null;
  featured: boolean;
  active: boolean;
  archived: boolean;
  created_at: string;
  updated_at: string;
}

export interface RoomImage {
  id: string;
  room_id: string;
  storage_path: string;
  alt_text: string;
  display_order: number;
  is_primary: boolean;
  created_at: string;
}

export interface Amenity {
  id: string;
  name: string;
  description: string;
  icon: string;
  active: boolean;
  created_at: string;
}

export interface Booking {
  id: string;
  booking_reference: string;
  room_id: string;
  guest_name: string;
  guest_email: string;
  guest_phone: string;
  guest_whatsapp: string | null;
  adults: number;
  children: number;
  check_in_date: string;
  check_out_date: string;
  nights: number;
  room_rate: number;
  subtotal: number;
  discount_amount: number;
  taxes_fees: number;
  total_amount: number;
  special_requests: string | null;
  status: BookingStatus;
  created_at: string;
  updated_at: string;
}

export interface BlockedDate {
  id: string;
  room_id: string;
  start_date: string;
  end_date: string;
  block_type: BlockType;
  reason: string | null;
  created_by: string | null;
  created_at: string;
}

export interface Payment {
  id: string;
  booking_id: string;
  amount: number;
  currency: string;
  provider: string | null;
  transaction_reference: string | null;
  status: PaymentStatus;
  payment_date: string | null;
  created_at: string;
}

export interface Offer {
  id: string;
  title: string;
  slug: string;
  description: string;
  image_path: string | null;
  discount_type: DiscountType;
  discount_value: number;
  start_date: string;
  end_date: string;
  active: boolean;
  created_at: string;
}

export interface GalleryItem {
  id: string;
  storage_path: string;
  category: GalleryCategory;
  caption: string | null;
  display_order: number;
  created_at: string;
}

export interface Testimonial {
  id: string;
  guest_name: string;
  location: string | null;
  rating: number;
  review: string;
  image_path: string | null;
  featured: boolean;
  published: boolean;
  created_at: string;
}

export interface BlogCategory {
  id: string;
  name: string;
  slug: string;
}

export interface BlogPost {
  id: string;
  title: string;
  slug: string;
  excerpt: string | null;
  content: string;
  featured_image_path: string | null;
  category_id: string | null;
  tags: string[];
  seo_title: string | null;
  seo_description: string | null;
  published: boolean;
  published_at: string | null;
  author_id: string | null;
  created_at: string;
  updated_at: string;
}

export interface VisitRequest {
  id: string;
  name: string;
  email: string;
  phone: string;
  visit_date: string;
  preferred_time: string;
  num_visitors: number;
  message: string | null;
  status: VisitStatus;
  created_at: string;
}

export interface ContactMessage {
  id: string;
  name: string;
  email: string;
  phone: string | null;
  subject: string | null;
  message: string;
  status: ContactStatus;
  created_at: string;
}

export interface NewsletterSubscriber {
  id: string;
  name: string | null;
  email: string;
  status: SubscriberStatus;
  subscribed_at: string;
}

// Convenience composite types used by the UI layer
export interface RoomWithImages extends Room {
  room_images: RoomImage[];
}

export interface RoomWithDetails extends Room {
  room_images: RoomImage[];
  amenities: Amenity[];
}

export interface DashboardStats {
  total_rooms: number;
  active_rooms: number;
  occupied_today: number;
  todays_arrivals: number;
  todays_departures: number;
  pending_bookings: number;
  confirmed_bookings: number;
  revenue_30d: number;
  new_messages: number;
  pending_visits: number;
}
