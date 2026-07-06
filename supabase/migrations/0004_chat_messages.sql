-- Chat messages: AI advisor conversation history, persisted per user.
create table if not exists public.chat_messages (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  role text not null check (role in ('user', 'assistant')),
  content text not null,
  created_at timestamptz not null default now()
);

create index if not exists chat_messages_user_id_created_at_idx
  on public.chat_messages (user_id, created_at);

alter table public.chat_messages enable row level security;

create policy "Chat messages are viewable by their owner"
  on public.chat_messages for select
  using (auth.uid() = user_id);

create policy "Chat messages are insertable by their owner"
  on public.chat_messages for insert
  with check (auth.uid() = user_id);

create policy "Chat messages are deletable by their owner"
  on public.chat_messages for delete
  using (auth.uid() = user_id);
