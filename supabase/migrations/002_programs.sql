create table if not exists public.programs (
  id text primary key,
  title text not null,
  description text not null,
  program_type text not null check (program_type in ('adventure', 'training')),
  duration_days integer not null check (duration_days > 0),
  weekly_miles_target numeric(6, 2),
  difficulty text not null check (difficulty in ('easy', 'moderate', 'hard')),
  created_at timestamptz not null default timezone('utc', now())
);

create table if not exists public.user_programs (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.users (id) on delete cascade,
  program_id text not null references public.programs (id) on delete cascade,
  program_type text not null check (program_type in ('adventure', 'training')),
  started_at timestamptz not null default timezone('utc', now()),
  current_day integer not null default 1 check (current_day > 0),
  completed_at timestamptz,
  unique (user_id, program_id, program_type)
);

create index if not exists idx_user_programs_user_id on public.user_programs (user_id);
create index if not exists idx_user_programs_program_id on public.user_programs (program_id);

alter table public.programs enable row level security;
alter table public.user_programs enable row level security;

create policy "programs_select_authenticated" on public.programs
  for select using (auth.role() = 'authenticated');

create policy "user_programs_select_own" on public.user_programs
  for select using (auth.uid() = user_id);
create policy "user_programs_insert_own" on public.user_programs
  for insert with check (auth.uid() = user_id);
create policy "user_programs_update_own" on public.user_programs
  for update using (auth.uid() = user_id) with check (auth.uid() = user_id);
create policy "user_programs_delete_own" on public.user_programs
  for delete using (auth.uid() = user_id);

insert into public.programs (id, title, description, program_type, duration_days, weekly_miles_target, difficulty)
values
  ('sd-coastal-starter', 'San Diego Coastal Starter', 'A gentle beach-to-park routine to build consistency and confidence.', 'adventure', 14, 10, 'easy'),
  ('trail-pack-builder', 'Trail Pack Builder', 'Progressive trail mileage for active dogs and handlers.', 'adventure', 21, 16, 'moderate'),
  ('urban-park-circuit', 'Urban Park Circuit', 'Rotate city parks to add novelty while keeping mileage manageable.', 'adventure', 14, 12, 'moderate'),
  ('torrey-pines-challenge', 'Torrey Pines Challenge', 'Conditioning-focused coastal climbs with rest-balanced recovery days.', 'adventure', 28, 20, 'hard'),
  ('senior-gentle-miles', 'Senior Gentle Miles', 'Low-impact routine to keep senior dogs active without overloading joints.', 'adventure', 14, 7, 'easy'),
  ('8-week-loose-leash', '8-Week Loose Leash', 'A structured leash skills progression with daily drills and accountability.', 'training', 56, null, 'moderate'),
  ('puppy-foundations', 'Puppy Foundations', 'Core obedience, confidence building, and socialization for young dogs.', 'training', 28, null, 'easy'),
  ('senior-wellness', 'Senior Wellness', 'Low-impact routine that blends mobility, calm handling, and confidence.', 'training', 21, null, 'easy')
on conflict (id) do update
set
  title = excluded.title,
  description = excluded.description,
  program_type = excluded.program_type,
  duration_days = excluded.duration_days,
  weekly_miles_target = excluded.weekly_miles_target,
  difficulty = excluded.difficulty;
