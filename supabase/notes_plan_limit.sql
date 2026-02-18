-- Apply in Supabase SQL editor to prevent bypassing the 3-note free limit.
-- Assumes RLS is enabled and notes.user_id stores auth.uid().

-- Ensure RLS is on.
alter table if exists public.notes enable row level security;

-- Allow users to insert notes only if they have fewer than 3 existing notes.
create policy if not exists "Free plan note limit"
  on public.notes
  for insert
  to authenticated
  with check (
    (select count(*) from public.notes n where n.user_id = auth.uid()) < 3
    and user_id = auth.uid()
  );

-- Optional: keep update/delete scoped to own records if not already set.
create policy if not exists "Users can update own notes"
  on public.notes
  for update
  to authenticated
  using (user_id = auth.uid())
  with check (user_id = auth.uid());

create policy if not exists "Users can delete own notes"
  on public.notes
  for delete
  to authenticated
  using (user_id = auth.uid());
