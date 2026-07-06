-- Transactions: expense/income rows, one user's data per row.
create table if not exists public.transactions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  amount numeric not null,
  currency text not null default 'INR',
  category text not null default 'Uncategorized',
  merchant text,
  description text,
  transaction_date date not null default current_date,
  is_recurring boolean not null default false,
  ai_category_reasoning text,
  created_at timestamptz not null default now()
);

create index if not exists transactions_user_id_idx on public.transactions (user_id);
create index if not exists transactions_transaction_date_idx on public.transactions (transaction_date);

alter table public.transactions enable row level security;

create policy "Transactions are viewable by their owner"
  on public.transactions for select
  using (auth.uid() = user_id);

create policy "Transactions are insertable by their owner"
  on public.transactions for insert
  with check (auth.uid() = user_id);

create policy "Transactions are updatable by their owner"
  on public.transactions for update
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

create policy "Transactions are deletable by their owner"
  on public.transactions for delete
  using (auth.uid() = user_id);
