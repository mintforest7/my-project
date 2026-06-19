-- Style Rush cloud backend.
-- Apply with: npm run db:push

create table if not exists public.users (
  id uuid primary key references auth.users (id) on delete cascade,
  username text not null,
  level integer not null default 1 check (level >= 1),
  experience integer not null default 0 check (experience >= 0),
  coins integer not null default 150 check (coins >= 0),
  gems integer not null default 0 check (gems >= 0),
  created_at timestamptz not null default now()
);

create table if not exists public.clothing_items (
  id text primary key,
  name text not null,
  category text not null,
  theme text not null,
  rarity text not null default 'standard',
  price integer not null default 0 check (price >= 0),
  premium boolean not null default false,
  image_path text not null
);

create table if not exists public.owned_items (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null default auth.uid() references public.users (id) on delete cascade,
  item_id text not null,
  purchased_at timestamptz not null default now(),
  unique (user_id, item_id)
);

create table if not exists public.saved_outfits (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null default auth.uid() references public.users (id) on delete cascade,
  outfit_name text not null,
  hair text,
  bangs text,
  makeup text,
  top text,
  bottom text,
  dress text,
  shoes text,
  accessories text,
  created_at timestamptz not null default now()
);

create table if not exists public.daily_rewards (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null default auth.uid() references public.users (id) on delete cascade,
  last_claim_date date,
  unique (user_id)
);

create table if not exists public.achievements (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null default auth.uid() references public.users (id) on delete cascade,
  achievement_name text not null,
  unlocked_at timestamptz not null default now(),
  unique (user_id, achievement_name)
);

alter table public.users enable row level security;
alter table public.clothing_items enable row level security;
alter table public.owned_items enable row level security;
alter table public.saved_outfits enable row level security;
alter table public.daily_rewards enable row level security;
alter table public.achievements enable row level security;

create policy "read own profile"
  on public.users for select
  using (auth.uid() = id);

create policy "insert own profile"
  on public.users for insert
  with check (auth.uid() = id);

create policy "update own profile"
  on public.users for update
  using (auth.uid() = id)
  with check (auth.uid() = id);

create policy "read clothing catalog"
  on public.clothing_items for select
  using (auth.role() = 'authenticated');

create policy "read own owned items"
  on public.owned_items for select
  using (auth.uid() = user_id);

create policy "insert own owned items"
  on public.owned_items for insert
  with check (auth.uid() = user_id);

create policy "read own saved outfits"
  on public.saved_outfits for select
  using (auth.uid() = user_id);

create policy "insert own saved outfits"
  on public.saved_outfits for insert
  with check (auth.uid() = user_id);

create policy "delete own saved outfits"
  on public.saved_outfits for delete
  using (auth.uid() = user_id);

create policy "read own daily rewards"
  on public.daily_rewards for select
  using (auth.uid() = user_id);

create policy "insert own daily rewards"
  on public.daily_rewards for insert
  with check (auth.uid() = user_id);

create policy "update own daily rewards"
  on public.daily_rewards for update
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

create policy "read own achievements"
  on public.achievements for select
  using (auth.uid() = user_id);

create policy "insert own achievements"
  on public.achievements for insert
  with check (auth.uid() = user_id);

create or replace function public.create_style_rush_profile()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.users (id, username)
  values (
    new.id,
    coalesce(split_part(new.email, '@', 1), 'player')
  )
  on conflict (id) do nothing;

  insert into public.daily_rewards (user_id, last_claim_date)
  values (new.id, null)
  on conflict (user_id) do nothing;

  return new;
end;
$$;

drop trigger if exists create_style_rush_profile on auth.users;

create trigger create_style_rush_profile
after insert on auth.users
for each row execute function public.create_style_rush_profile();
