# LakeSprings Hotels

A real, database-backed hotel booking platform: Next.js (App Router) + TypeScript
+ Tailwind CSS on the frontend, Supabase (PostgreSQL, Auth, Storage, Row Level
Security) on the backend. No hardcoded rooms, prices, or fake local arrays —
everything the admin dashboard changes is reflected on the public site because
they're reading and writing the same database.

## What's implemented right now

This is being built in phases. **Phase 1 (this drop)** is a complete,
working vertical slice — not a mockup — covering:

- **Full database schema** for all 19 entities in the spec (rooms, bookings,
  payments, offers, gallery, testimonials, blog, visit requests, contact
  messages, newsletter, hotel settings, staff roles, etc.), with indexes,
  constraints, and enums. See `supabase/migrations/`.
- **Row Level Security on every table**, enforced by Postgres — not just
  hidden frontend buttons. See `0005_rls.sql` and `0006_storage.sql`.
- **Real double-booking prevention** at the database level: an exclusion
  constraint plus an advisory-lock-guarded `create_booking()` function, so two
  guests racing for the same room/dates can never both succeed. See
  `0004_functions.sql`.
- **Public site**: homepage with a real availability search, rooms listing
  with live filters/sorting, a dynamic room detail page with a gallery/
  lightbox, a 3-step booking flow that writes to Supabase, a booking
  confirmation page, gallery, offers, about, blog (list + detail), contact
  form, and visit-request form — all reading real data, all with proper
  empty states.
- **Admin dashboard** (`/admin`, protected by Supabase Auth + middleware +
  RLS): live stats overview, full Room CRUD with Supabase Storage image
  upload/reorder/primary-image management, and full Booking management
  (search, filter, status changes).
- **SEO**: dynamic per-room and per-post metadata, sitemap.xml, robots.txt.
- **Tests**: unit tests for price/date math and form validation
  (`npm test`). See "Testing" below for what's covered vs. what's next.

### Phase 2 — implemented in this drop

The previously listed admin sections are now wired to the database and are clickable from the sidebar:

- **Visual booking calendar** — 30-day rooms × dates view with booking and blocked-date indicators, plus room blocking.
- **Guest management** — guest directory aggregated from bookings.
- **Payments** — Flutterwave checkout initialization, transaction verification, signed webhook verification, payment records, and automatic booking confirmation after successful payment.
- **Offers, Gallery, Amenities, Testimonials, Blog** — admin create/update/delete management screens backed by the existing tables and RLS.
- **Visit Requests, Contact Messages, Newsletter** — staff inbox/list views with status management.
- **Hotel Settings** — manager/super-admin editing of the singleton hotel configuration.
- **Staff** — super-admin role and active-status management for existing Supabase Auth users.

Payment configuration remains environment-dependent: set `FLW_SECRET_KEY` and `FLW_SECRET_HASH`, and keep `SUPABASE_SECRET_KEY` server-only for payment verification/webhook processing. Without those secrets the application still builds and the rest of the platform remains usable; Flutterwave simply reports that payments are not configured.

## Tech stack

- Next.js 14 (App Router) + TypeScript + Tailwind CSS
- Supabase: PostgreSQL, Auth, Storage, Row Level Security
- Deployment target: Vercel

## Local Setup

### 1. Install dependencies

```bash
npm install
```

### 2. Create a Supabase project

1. Go to [supabase.com](https://supabase.com) → New Project.
2. Once it's ready, go to **Project Settings → Data API** and copy the
   **Project URL**.
3. Go to **Project Settings → API Keys** and copy the **Publishable key** for browser/client use and the **Secret key** for trusted server-side operations.

### 3. Run the database migrations

In the Supabase Dashboard, open **SQL Editor** and run each file in
`supabase/migrations/` **in order** (0001 → 0008). Alternatively, with the
[Supabase CLI](https://supabase.com/docs/guides/cli):

```bash
supabase link --project-ref YOUR_PROJECT_REF
supabase db push
```

This creates every table, enum, index, function, RLS policy, storage
bucket, and demo/seed data (5 rooms, amenities, an offer, testimonials, one
blog post — all with placeholder `picsum.photos` images you'll replace).

### 4. Configure environment variables

```bash
cp .env.example .env.local
```

Fill in `NEXT_PUBLIC_SUPABASE_URL` and `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY` from
step 2. Keep `SUPABASE_SECRET_KEY` server-only. Leave the payment gateway variables commented out until you're
ready to wire up payments.

### 5. Create your first admin account

1. In the Supabase Dashboard, go to **Authentication → Users → Add user**
   and create a user with your email + a password (or invite yourself by
   email).
2. A `profiles` row is created for you automatically (defaulting to the
   `staff` role) — this is handled by the `handle_new_auth_user()` trigger
   in `0004_functions.sql`.
3. Promote yourself to `super_admin` by running this once in the SQL
   Editor (replace the email):

   ```sql
   update public.profiles set role = 'super_admin' where email = 'you@example.com';
   ```

4. Run the app (`npm run dev`), go to `/login`, sign in, and you'll land in
   `/admin`.

### 6. Run the app

```bash
npm run dev
```

Visit `http://localhost:3000`.

### 7. Run tests

```bash
npm test
```

## Environment Variables Reference

| Variable | Where it's used | Where to get it |
|---|---|---|
| `NEXT_PUBLIC_SUPABASE_URL` | Browser + server | Supabase → Project Settings → Data API |
| `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY` | Browser + server | Supabase → Project Settings → API Keys |
| `SUPABASE_SECRET_KEY` | Server-only scripts (optional) | Supabase → Project Settings → API Keys. **Never** expose this to the browser. |
| `NEXT_PUBLIC_SITE_URL` | Metadata, sitemap, payment callbacks | Your deployed URL (or `http://localhost:3000` locally) |
| `FLW_SECRET_KEY` | Server-side Flutterwave checkout initialization and transaction verification | Flutterwave Dashboard → API Keys |
| `FLW_SECRET_HASH` | Webhook signature verification | Flutterwave Dashboard → Webhooks / Secret Hash |

## Deploying to Vercel

1. Push this project to a Git repository.
2. In Vercel: **New Project** → import the repo.
3. Add the environment variables above in **Project → Settings →
   Environment Variables** (for Production, Preview, and Development).
4. Deploy. Vercel auto-detects Next.js — no extra build configuration
   needed.
5. Update `NEXT_PUBLIC_SITE_URL` to your production domain and redeploy so
   sitemap/OG metadata use the right URL.
6. In `next.config.mjs`, the Supabase Storage `remotePatterns` entry already
   matches any `*.supabase.co` host, so no changes are needed there.

## Admin Usage

- **Add a room**: `/admin/rooms` → *Add Room* → fill in details → *Create
  Room*. It's bookable on the public site immediately.
- **Change a price**: `/admin/rooms/[id]/edit` → change *Price per night* →
  *Save Changes*. The room detail page and all listings reflect the new
  price on next load — nothing is cached or hardcoded.
- **Upload/manage room images**: same edit page → *Images* panel → upload,
  reorder, set primary, or delete. Files go to the `room-images` Storage
  bucket.
- **View/manage bookings**: `/admin/bookings` → search by name/email/
  reference, filter by status, or change a booking's status inline
  (confirm, cancel, check in, check out, etc).
- **Archive a room**: edit page → *Archive Room*. Archived rooms disappear
  from the public site but keep their booking history (rooms are never hard
  -deleted while they have bookings attached).

## Database Design Notes

- **No double-booking, guaranteed by Postgres, not application code.**
  `bookings` has a `daterange` exclusion constraint scoped to
  `pending`/`confirmed` rows, and `create_booking()` additionally takes a
  per-room advisory lock before checking availability and inserting. Even
  if two requests hit the database at the exact same instant, only one can
  win — see `0002_tables.sql` and `0004_functions.sql`.
- **RLS is the real authorization boundary.** Every table has RLS enabled;
  policies are defined in `0005_rls.sql`. The Next.js middleware
  (`src/middleware.ts`) also blocks unauthenticated access to `/admin`
  routes, but that's a UX convenience — the database would refuse the
  underlying queries either way.
- **Guests never get a Supabase Auth account.** Bookings, contact messages,
  and visit requests are taken anonymously; only hotel staff sign in.

## Project Structure

```
supabase/migrations/     Numbered SQL migrations — schema, RLS, functions, storage, seed data
src/app/(site)/          Public website routes
src/app/admin/           Protected admin dashboard routes
src/components/          ui/, layout/, booking/, rooms/, admin/, forms/
src/lib/actions/         Server Actions (booking, contact, visit, newsletter, auth, admin CRUD)
src/lib/data/            Server-side read queries, organized by domain
src/lib/supabase/        Browser/server/middleware Supabase client factories
src/lib/validation/      Zod schemas shared by forms and server actions
src/types/database.ts    TypeScript types mirroring the SQL schema
tests/                   Vitest unit tests
```

## Testing

`npm test` runs Vitest unit tests covering:

- Night/price calculation (`nightsBetween`, `formatCurrency`)
- Booking form validation (date ordering, past-date rejection, guest counts,
  email format)
- Room form validation (slug format, price/capacity bounds)

Not yet covered (next milestone): integration tests against a live Supabase
instance for the booking-overlap exclusion constraint, RLS policy behavior
per role, and Storage upload permissions. These need a running Postgres
instance (e.g. via the Supabase CLI's local dev stack) rather than pure unit
tests, which is why they're called out separately here instead of silently
omitted.

## Security Notes

- The service role key is never used in this app's runtime code — all
  privileged writes go through the authenticated staff session + RLS, which
  is the safer default. It's documented in `.env.example` only for optional
  one-off admin scripts you might write yourself.
- File uploads are restricted to JPEG/PNG/WebP, capped at 5MB, and validated
  both client-side (for UX) and by Storage bucket policy (for enforcement).
- All guest-facing forms validate input with Zod before it ever reaches
  Supabase, and Postgres exceptions from `create_booking()` are rewritten
  into guest-readable messages rather than exposing raw database errors.
