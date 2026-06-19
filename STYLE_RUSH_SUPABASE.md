# Style Rush Supabase Setup

Style Rush now uses Supabase for authentication, player profiles, cloud inventory, saved outfits, rewards, and achievements.

## 1. Environment

Keep keys in `.env.local` locally and in Vercel Environment Variables in production:

```bash
VITE_SUPABASE_URL=your-project-url
VITE_SUPABASE_ANON_KEY=your-anon-key
```

Do not commit real keys.

## 2. Apply Database Schema

The schema is in:

```bash
supabase/migrations/20260618000000_style_rush_cloud.sql
```

Apply it with:

```bash
npm run db:push
```

Do not paste SQL manually into the Supabase SQL Editor.

## 3. Tables

The migration creates:

- `users`: player profile, level, experience, coins, gems
- `owned_items`: permanent purchased/unlocked inventory
- `clothing_items`: catalog table for item metadata
- `saved_outfits`: saved outfit slots
- `daily_rewards`: last claim date
- `achievements`: unlocked achievements

All user-owned tables have Row Level Security enabled so players can only read/write their own rows.

## 4. Auth Flow

`src/App.tsx` checks the Supabase session:

- signed out: shows `Auth`
- signed in: opens `StyleRushGame`

`src/components/Auth.tsx` supports:

- email and password sign in
- email and password registration
- Google sign in through Supabase OAuth

To enable Google sign in in Supabase:

1. Open Supabase Dashboard -> Authentication -> Providers -> Google.
2. Enable Google.
3. Add the Google OAuth client ID and client secret from Google Cloud.
4. In Supabase Authentication -> URL Configuration, add your site URLs to Redirect URLs:
   - `http://localhost:5173`
   - your Vercel production URL
5. In Google Cloud OAuth settings, add the callback URL shown by Supabase for the Google provider.

Do not put the Google OAuth client secret in frontend code.

After registration, the database trigger `create_style_rush_profile` automatically creates:

- a `users` profile
- a `daily_rewards` row

## 5. Cloud Save

Cloud save logic is in:

```bash
src/game/cloudData.ts
```

It handles:

- loading the player profile from `users`
- syncing starter and purchased items in `owned_items`
- saving coins, gems, level, and experience instantly
- saving outfits to `saved_outfits`

The game still uses the local generated wardrobe for rendering image assets, while Supabase stores permanent ownership and progress.
