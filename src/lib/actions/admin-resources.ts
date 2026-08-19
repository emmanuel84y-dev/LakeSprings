'use server';

import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';

const allowed: Record<string, { table: string; path: string; manager?: boolean }> = {
  offers: { table: 'offers', path: '/admin/offers', manager: true },
  amenities: { table: 'amenities', path: '/admin/amenities', manager: true },
  gallery: { table: 'gallery', path: '/admin/gallery', manager: true },
  testimonials: { table: 'testimonials', path: '/admin/testimonials', manager: true },
  blog_categories: { table: 'blog_categories', path: '/admin/blog', manager: true },
  blog_posts: { table: 'blog_posts', path: '/admin/blog', manager: false },
  visit_requests: { table: 'visit_requests', path: '/admin/visits' },
  contact_messages: { table: 'contact_messages', path: '/admin/messages' },
  newsletter_subscribers: { table: 'newsletter_subscribers', path: '/admin/newsletter' },
  hotel_settings: { table: 'hotel_settings', path: '/admin/settings', manager: true },
  profiles: { table: 'profiles', path: '/admin/staff', manager: true },
  blocked_dates: { table: 'blocked_dates', path: '/admin/calendar', manager: true },
  payments: { table: 'payments', path: '/admin/payments', manager: true },
};

const IMAGE_FIELDS = ['storage_path', 'image_path', 'featured_image_path'];
const IMAGE_BUCKETS: Record<string, string> = {
  gallery: 'gallery-images',
  offers: 'hotel-images',
  testimonials: 'testimonial-images',
  blog_posts: 'blog-images',
};
const MAX_IMAGE_BYTES = 5 * 1024 * 1024;
const ALLOWED_IMAGE_TYPES = ['image/jpeg', 'image/png', 'image/webp'];

async function requireStaff(manager = false, superAdmin = false) {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect('/login?redirect=/admin');
  const { data: profile } = await supabase.from('profiles').select('role, active').eq('id', user.id).single();
  if (!profile?.active || (superAdmin && profile.role !== 'super_admin') || (manager && !['manager', 'super_admin'].includes(profile.role))) redirect('/admin?error=not_authorized');
  return { supabase, user, profile };
}

function value(form: FormData, key: string, fallback = '') { const v = form.get(key); return v === null ? fallback : String(v); }
function bool(form: FormData, key: string) { return form.get(key) === 'on'; }
function num(form: FormData, key: string, fallback = 0) { const n = Number(form.get(key)); return Number.isFinite(n) ? n : fallback; }
function nullable(v: string) { return v.trim() ? v.trim() : null; }

async function prepareImageField(supabase: ReturnType<typeof createClient>, form: FormData, resource: string, field: string, currentValue: string | null) {
  const url = String(form.get(field) ?? '').trim();
  const file = form.get(`${field}__file`) as File | null;
  if (!file || file.size === 0) return url || currentValue || null;
  if (!ALLOWED_IMAGE_TYPES.includes(file.type)) throw new Error('Use a JPEG, PNG, or WebP image');
  if (file.size > MAX_IMAGE_BYTES) throw new Error('Image must be under 5MB');

  const bucket = IMAGE_BUCKETS[resource];
  if (!bucket) throw new Error('Image uploads are not configured for this resource');
  const ext = file.name.split('.').pop()?.toLowerCase() || 'jpg';
  const path = `${resource}/${crypto.randomUUID()}.${ext}`;
  const { error } = await supabase.storage.from(bucket).upload(path, file, { contentType: file.type, upsert: false });
  if (error) throw new Error('Upload failed. Please try again.');
  return path;
}

export async function adminResourceAction(form: FormData) {
  const resource = value(form, '_resource');
  const config = allowed[resource];
  if (!config) throw new Error('Unsupported admin resource');
  const superAdmin = resource === 'profiles';
  const { supabase } = await requireStaff(Boolean(config.manager), superAdmin);
  const id = value(form, '_id');
  const action = value(form, '_action', 'save');
  const path = config.path;

  if (action === 'delete') {
    const { error } = await supabase.from(config.table).delete().eq('id', id);
    if (error) redirect(`${path}?error=${encodeURIComponent(error.message)}`);
    revalidatePath(path);
    redirect(`${path}?saved=1`);
  }

  let row: Record<string, unknown> = {};
  switch (resource) {
    case 'offers': row = { title:value(form,'title'), slug:value(form,'slug'), description:value(form,'description'), discount_type:value(form,'discount_type','percentage'), discount_value:num(form,'discount_value'), start_date:value(form,'start_date'), end_date:value(form,'end_date'), active:bool(form,'active') }; break;
    case 'amenities': row = { name:value(form,'name'), description:value(form,'description'), icon:value(form,'icon','sparkles'), active:bool(form,'active') }; break;
    case 'gallery': row = { storage_path:value(form,'storage_path'), category:value(form,'category','hotel'), caption:nullable(value(form,'caption')), display_order:num(form,'display_order') }; break;
    case 'testimonials': row = { guest_name:value(form,'guest_name'), location:nullable(value(form,'location')), rating:num(form,'rating',5), review:value(form,'review'), image_path:nullable(value(form,'image_path')), featured:bool(form,'featured'), published:bool(form,'published') }; break;
    case 'blog_categories': row = { name:value(form,'name'), slug:value(form,'slug') }; break;
    case 'blog_posts': row = { title:value(form,'title'), slug:value(form,'slug'), excerpt:nullable(value(form,'excerpt')), content:value(form,'content'), featured_image_path:nullable(value(form,'featured_image_path')), category_id:nullable(value(form,'category_id')), tags:value(form,'tags').split(',').map(s=>s.trim()).filter(Boolean), seo_title:nullable(value(form,'seo_title')), seo_description:nullable(value(form,'seo_description')), published:bool(form,'published'), published_at:bool(form,'published') ? (value(form,'published_at') || new Date().toISOString()) : null }; break;
    case 'visit_requests': row = { name:value(form,'name'), email:value(form,'email'), phone:value(form,'phone'), visit_date:value(form,'visit_date'), preferred_time:value(form,'preferred_time'), num_visitors:num(form,'num_visitors',1), message:nullable(value(form,'message')), status:value(form,'status','pending') }; break;
    case 'contact_messages': row = { name:value(form,'name'), email:value(form,'email'), phone:nullable(value(form,'phone')), subject:nullable(value(form,'subject')), message:value(form,'message'), status:value(form,'status','unread') }; break;
    case 'newsletter_subscribers': row = { name:nullable(value(form,'name')), email:value(form,'email'), status:value(form,'status','active') }; break;
    case 'hotel_settings': row = { id:1, name:value(form,'name'), tagline:value(form,'tagline'), description:value(form,'description'), address:value(form,'address'), phone:value(form,'phone'), whatsapp:value(form,'whatsapp'), email:value(form,'email'), check_in_time:value(form,'check_in_time','14:00'), check_out_time:value(form,'check_out_time','11:00'), currency:value(form,'currency','NGN'), google_maps_url:nullable(value(form,'google_maps_url')), instagram_url:nullable(value(form,'instagram_url')), facebook_url:nullable(value(form,'facebook_url')), twitter_url:nullable(value(form,'twitter_url')), min_stay_nights:num(form,'min_stay_nights',1), max_stay_nights:num(form,'max_stay_nights',30) }; break;
    case 'profiles': row = { full_name:value(form,'full_name'), email:value(form,'email'), role:value(form,'role','staff'), active:bool(form,'active') }; break;
    case 'blocked_dates': row = { room_id:value(form,'room_id'), start_date:value(form,'start_date'), end_date:value(form,'end_date'), block_type:value(form,'block_type','manual'), reason:nullable(value(form,'reason')) }; break;
    case 'payments': row = { booking_id:value(form,'booking_id'), amount:num(form,'amount'), currency:value(form,'currency','NGN'), provider:nullable(value(form,'provider')), transaction_reference:nullable(value(form,'transaction_reference')), status:value(form,'status','pending'), payment_date:nullable(value(form,'payment_date')) }; break;
  }

  try {
    for (const field of IMAGE_FIELDS) {
      if (Object.prototype.hasOwnProperty.call(row, field)) {
        const current = id ? String((await supabase.from(config.table).select(field).eq('id', id).maybeSingle()).data?.[field] ?? '') : '';
        row[field] = await prepareImageField(supabase, form, resource, field, current);
      }
    }
  } catch (error) {
    redirect(`${path}?error=${encodeURIComponent(error instanceof Error ? error.message : 'Image upload failed')}`);
  }

  const query = id ? supabase.from(config.table).update(row).eq('id', id) : supabase.from(config.table).insert(row);
  const { error } = await query;
  if (error) redirect(`${path}?error=${encodeURIComponent(error.message)}`);
  revalidatePath(path);
  if (resource === 'hotel_settings') { revalidatePath('/'); revalidatePath('/rooms'); }
  redirect(`${path}?saved=1`);
}

export async function updatePaymentStatus(paymentId: string, status: string) {
  const { supabase } = await requireStaff(true);
  const { error } = await supabase.from('payments').update({ status, payment_date: status === 'successful' ? new Date().toISOString() : null }).eq('id', paymentId);
  if (error) return { ok:false, error:error.message };
  revalidatePath('/admin/payments');
  return { ok:true };
}
