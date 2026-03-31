

# Solo Unicorn League — Full Leaderboard Platform

## Overview
Transform the current static chart into a dynamic leaderboard platform where solo founders sign up, self-report their MRR, and appear on a public ranked list. Backend powered by Lovable Cloud.

## Step 1: Enable Lovable Cloud
- Enable Lovable Cloud to get database, auth (email + Google), and storage
- Create the `founders` table with RLS policies
- Create the `founder-logos` storage bucket (public read)

## Step 2: Database Schema

**`founders` table:**
- `id` (uuid, PK), `user_id` (uuid, references auth.users, not null), `company_name`, `logo_url`, `x_url`, `one_liner`, `mrr_cents` (bigint, default 0), `is_solo_attested` (boolean), `is_visible` (boolean, default true), `created_at`, `updated_at`

**RLS policies:**
- Anon SELECT where `is_visible = true`
- Authenticated INSERT/SELECT/UPDATE own rows (`user_id = auth.uid()`)

**Admin access:**
- Create `user_roles` table with `has_role()` security definer function
- Admin policy on founders for full SELECT/UPDATE

## Step 3: Auth — `/join` page
- Email + password sign up/sign in
- Google OAuth
- Redirect to `/dashboard` on success
- "Join the Leaderboard" link in header nav

## Step 4: Founder Dashboard — `/dashboard`
- Auth-protected (redirect to `/join` if not logged in)
- Profile form: MRR (dollars → stored as cents), company name, logo upload, X/Twitter URL, one-liner, solo attestation checkbox
- Shows current MRR and estimated valuation (MRR × 12 × 5) above form
- "Go Live on Leaderboard" button: upserts founder row, redirects to `/`
- Pre-fills existing data for returning founders

## Step 5: Public Leaderboard — `/` (redesign)
- Replace current static chart with dynamic leaderboard fetched from Supabase
- Each row shows: rank, logo, company name, @handle (from x_url), one-liner, MRR (`$X,XXX/mo`), est. valuation (`$X,XXX,XXX`), progress bar toward $1B MRR
- Progress bar: `(mrr_cents / 100_000_000_00) * 100`, capped at 100%
- Header: title, subtitle, "Join the Leaderboard" button
- Keep dark theme and existing styling

## Step 6: Admin — `/admin`
- Auth-protected, admin-role only
- Table of all founders with company name, MRR, valuation, visibility status, join date
- Hide/Show toggle per founder (updates `is_visible`)

## Files to create/modify
- **Migrations**: `founders` table, `user_roles` table, `founder-logos` bucket, RLS policies
- **`src/pages/Join.tsx`**: Auth page
- **`src/pages/Dashboard.tsx`**: Founder profile form
- **`src/pages/Admin.tsx`**: Admin table
- **`src/pages/Index.tsx`**: Rewrite as dynamic leaderboard
- **`src/App.tsx`**: Add routes for `/join`, `/dashboard`, `/admin`
- **`src/integrations/supabase/`**: Generated types and client
- **`src/components/LeaderboardRow.tsx`**: Row component with progress bar
- **`src/hooks/useAuth.tsx`**: Auth context/hook
- Remove static `src/data/founders.ts`, `src/components/ARRChart.tsx`, `src/components/Leaderboard.tsx`

## Technical notes
- Valuation formula: `(mrr_cents / 100) * 12 * 5`
- Progress bar formula: `(mrr_cents / 100_000_000_00) * 100` (toward $1B MRR)
- Logo upload goes to `founder-logos` bucket, URL saved as `logo_url`
- X handle extracted from URL for display (e.g., `https://x.com/john` → `@john`)
- Admin role checked via `has_role(auth.uid(), 'admin')` security definer function

