alter table public.training_progress
  add column if not exists lesson_id text not null default 'module';

alter table public.training_progress
  drop constraint if exists training_progress_user_id_module_id_key;

alter table public.training_progress
  add constraint training_progress_user_id_module_id_lesson_id_key
  unique (user_id, module_id, lesson_id);

create index if not exists idx_training_progress_module_id on public.training_progress (module_id);

insert into public.training_modules (slug, title, description, category, order_index)
values
  (
    'loose-leash',
    'Loose leash walking',
    'Build polite walking habits with five short practical lessons.',
    'obedience',
    1
  ),
  (
    'recall',
    'Recall training',
    'Strengthen your dog''s come-back reliability in four progressive lessons.',
    'obedience',
    2
  ),
  (
    'crate-training',
    'Crate training',
    'Create a calm crate routine with four comfort-first lessons.',
    'wellness',
    3
  )
on conflict (slug) do update
set
  title = excluded.title,
  description = excluded.description,
  category = excluded.category,
  order_index = excluded.order_index;
