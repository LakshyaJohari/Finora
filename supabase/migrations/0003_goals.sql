-- Goals: savings targets a user is tracking progress toward.
create table if not exists public.goals (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  name text not null,
  target_amount numeric not null,
  current_amount numeric not null default 0,
  target_date date,
  category text,
  created_at timestamptz not null default now()
);

create index if not exists goals_user_id_idx on public.goals (user_id);

alter table public.goals enable row level security;

create policy "Goals are viewable by their owner"
  on public.goals for select
  using (auth.uid() = user_id);

create policy "Goals are insertable by their owner"
  on public.goals for insert
  with check (auth.uid() = user_id);

create policy "Goals are updatable by their owner"
  on public.goals for update
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

create policy "Goals are deletable by their owner"
  on public.goals for delete
  using (auth.uid() = user_id);
