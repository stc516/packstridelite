create extension if not exists "pgcrypto";

create table if not exists public.users (
  id uuid primary key references auth.users (id) on delete cascade,
  display_name text not null,
  avatar_url text,
  created_at timestamptz not null default timezone('utc', now())
);

create table if not exists public.dogs (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.users (id) on delete cascade,
  name text not null,
  breed text not null,
  birthday date,
  weight_lbs numeric(5, 2),
  avatar_url text,
  created_at timestamptz not null default timezone('utc', now())
);

create table if not exists public.adventures (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.users (id) on delete cascade,
  dog_id uuid references public.dogs (id) on delete set null,
  title text not null,
  notes text,
  distance_miles numeric(6, 2),
  duration_minutes integer,
  location_name text,
  latitude numeric(9, 6),
  longitude numeric(9, 6),
  photo_url text,
  logged_at timestamptz not null default timezone('utc', now()),
  created_at timestamptz not null default timezone('utc', now())
);

create table if not exists public.streaks (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null unique references public.users (id) on delete cascade,
  current_streak integer not null default 0,
  longest_streak integer not null default 0,
  last_activity_date date,
  updated_at timestamptz not null default timezone('utc', now())
);

create table if not exists public.xp_events (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.users (id) on delete cascade,
  dog_id uuid references public.dogs (id) on delete set null,
  event_type text not null,
  xp_amount integer not null,
  created_at timestamptz not null default timezone('utc', now())
);

create table if not exists public.badges (
  id uuid primary key default gen_random_uuid(),
  slug text not null unique,
  name text not null,
  description text not null,
  xp_required integer not null default 0
);

create table if not exists public.user_badges (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.users (id) on delete cascade,
  badge_id uuid not null references public.badges (id) on delete cascade,
  earned_at timestamptz not null default timezone('utc', now()),
  unique (user_id, badge_id)
);

create table if not exists public.training_modules (
  id uuid primary key default gen_random_uuid(),
  slug text not null unique,
  title text not null,
  description text not null,
  category text not null,
  order_index integer not null
);

create table if not exists public.training_progress (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.users (id) on delete cascade,
  module_id uuid not null references public.training_modules (id) on delete cascade,
  completed boolean not null default false,
  completed_at timestamptz,
  unique (user_id, module_id)
);

create index if not exists idx_dogs_user_id on public.dogs (user_id);
create index if not exists idx_adventures_user_id on public.adventures (user_id);
create index if not exists idx_adventures_dog_id on public.adventures (dog_id);
create index if not exists idx_streaks_user_id on public.streaks (user_id);
create index if not exists idx_xp_events_user_id on public.xp_events (user_id);
create index if not exists idx_xp_events_dog_id on public.xp_events (dog_id);
create index if not exists idx_user_badges_user_id on public.user_badges (user_id);
create index if not exists idx_training_progress_user_id on public.training_progress (user_id);

alter table public.users enable row level security;
alter table public.dogs enable row level security;
alter table public.adventures enable row level security;
alter table public.streaks enable row level security;
alter table public.xp_events enable row level security;
alter table public.badges enable row level security;
alter table public.user_badges enable row level security;
alter table public.training_modules enable row level security;
alter table public.training_progress enable row level security;

create policy "users_select_own" on public.users
  for select using (auth.uid() = id);
create policy "users_insert_own" on public.users
  for insert with check (auth.uid() = id);
create policy "users_update_own" on public.users
  for update using (auth.uid() = id) with check (auth.uid() = id);
create policy "users_delete_own" on public.users
  for delete using (auth.uid() = id);

create policy "dogs_select_own" on public.dogs
  for select using (auth.uid() = user_id);
create policy "dogs_insert_own" on public.dogs
  for insert with check (auth.uid() = user_id);
create policy "dogs_update_own" on public.dogs
  for update using (auth.uid() = user_id) with check (auth.uid() = user_id);
create policy "dogs_delete_own" on public.dogs
  for delete using (auth.uid() = user_id);

create policy "adventures_select_own" on public.adventures
  for select using (auth.uid() = user_id);
create policy "adventures_insert_own" on public.adventures
  for insert
  with check (
    auth.uid() = user_id
    and (dog_id is null or exists (
      select 1
      from public.dogs
      where dogs.id = adventures.dog_id
        and dogs.user_id = auth.uid()
    ))
  );
create policy "adventures_update_own" on public.adventures
  for update
  using (auth.uid() = user_id)
  with check (
    auth.uid() = user_id
    and (dog_id is null or exists (
      select 1
      from public.dogs
      where dogs.id = adventures.dog_id
        and dogs.user_id = auth.uid()
    ))
  );
create policy "adventures_delete_own" on public.adventures
  for delete using (auth.uid() = user_id);

create policy "streaks_select_own" on public.streaks
  for select using (auth.uid() = user_id);
create policy "streaks_insert_own" on public.streaks
  for insert with check (auth.uid() = user_id);
create policy "streaks_update_own" on public.streaks
  for update using (auth.uid() = user_id) with check (auth.uid() = user_id);
create policy "streaks_delete_own" on public.streaks
  for delete using (auth.uid() = user_id);

create policy "xp_events_select_own" on public.xp_events
  for select using (auth.uid() = user_id);
create policy "xp_events_insert_own" on public.xp_events
  for insert
  with check (
    auth.uid() = user_id
    and (dog_id is null or exists (
      select 1
      from public.dogs
      where dogs.id = xp_events.dog_id
        and dogs.user_id = auth.uid()
    ))
  );
create policy "xp_events_update_own" on public.xp_events
  for update
  using (auth.uid() = user_id)
  with check (
    auth.uid() = user_id
    and (dog_id is null or exists (
      select 1
      from public.dogs
      where dogs.id = xp_events.dog_id
        and dogs.user_id = auth.uid()
    ))
  );
create policy "xp_events_delete_own" on public.xp_events
  for delete using (auth.uid() = user_id);

create policy "badges_select_authenticated" on public.badges
  for select using (auth.role() = 'authenticated');

create policy "user_badges_select_own" on public.user_badges
  for select using (auth.uid() = user_id);
create policy "user_badges_insert_own" on public.user_badges
  for insert with check (auth.uid() = user_id);
create policy "user_badges_update_own" on public.user_badges
  for update using (auth.uid() = user_id) with check (auth.uid() = user_id);
create policy "user_badges_delete_own" on public.user_badges
  for delete using (auth.uid() = user_id);

create policy "training_modules_select_authenticated" on public.training_modules
  for select using (auth.role() = 'authenticated');

create policy "training_progress_select_own" on public.training_progress
  for select using (auth.uid() = user_id);
create policy "training_progress_insert_own" on public.training_progress
  for insert with check (auth.uid() = user_id);
create policy "training_progress_update_own" on public.training_progress
  for update using (auth.uid() = user_id) with check (auth.uid() = user_id);
create policy "training_progress_delete_own" on public.training_progress
  for delete using (auth.uid() = user_id);
