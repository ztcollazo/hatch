-- Unpublishing runs as the authenticated user (the RPC is security invoker),
-- so RLS must explicitly allow profile owners to delete their snapshots.
-- Without this policy PostgreSQL silently filters the DELETE to zero rows,
-- while the RPC still returns successfully for an owned profile.
create policy "Owners can delete profile snapshots"
  on public.profile_snapshots for delete
  using (auth.uid() = owner_id);
