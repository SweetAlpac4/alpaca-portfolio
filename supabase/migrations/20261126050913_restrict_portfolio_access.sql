begin;

-- The claim is set by the project owner in auth.users.raw_app_meta_data.
do $$
declare
  entity text;
  admin_check constant text := $auth$(select auth.jwt()) -> 'app_metadata' @> '{"portfolio_admin":true}'::jsonb$auth$;
begin
  foreach entity in array array['profile','projects','achievements','skills','experiences','socials','settings']
  loop
    execute format('revoke all privileges on table public.%I from public, anon, authenticated', entity);
    execute format('grant select on table public.%I to anon, authenticated', entity);
    execute format('grant insert, update, delete on table public.%I to authenticated', entity);
    execute format('drop policy if exists %I on public.%I', entity || '_admin_write', entity);
    execute format('create policy %I on public.%I for all to authenticated using (%s) with check (%s)',
      entity || '_admin_write', entity, admin_check, admin_check);
  end loop;
end $$;

drop policy if exists projects_public_read on public.projects;
create policy projects_public_read on public.projects for select to anon, authenticated using (published);
drop policy if exists achievements_public_read on public.achievements;
create policy achievements_public_read on public.achievements for select to anon, authenticated using (published);

drop policy if exists settings_public_read on public.settings;
create policy settings_public_read on public.settings for select to anon, authenticated
  using (key in ('seo_title', 'seo_description', 'credits'));

drop policy if exists media_admin_insert on storage.objects;
create policy media_admin_insert on storage.objects for insert to authenticated
  with check (bucket_id = 'media' and (select auth.jwt()) -> 'app_metadata' @> '{"portfolio_admin":true}'::jsonb);
drop policy if exists media_admin_update on storage.objects;
create policy media_admin_update on storage.objects for update to authenticated
  using (bucket_id = 'media' and (select auth.jwt()) -> 'app_metadata' @> '{"portfolio_admin":true}'::jsonb)
  with check (bucket_id = 'media' and (select auth.jwt()) -> 'app_metadata' @> '{"portfolio_admin":true}'::jsonb);
drop policy if exists media_admin_delete on storage.objects;
create policy media_admin_delete on storage.objects for delete to authenticated
  using (bucket_id = 'media' and (select auth.jwt()) -> 'app_metadata' @> '{"portfolio_admin":true}'::jsonb);

update storage.buckets
set file_size_limit = least(coalesce(file_size_limit, 12582912), 12582912),
    allowed_mime_types = array['image/webp','image/png','image/jpeg','image/avif']
where id = 'media';

-- This platform-installed helper is an event trigger, not a client RPC.
do $$
begin
  if exists (select 1 from pg_proc where oid = to_regprocedure('public.rls_auto_enable()')
             and prorettype = 'event_trigger'::regtype) then
    revoke execute on function public.rls_auto_enable() from public, anon, authenticated;
  end if;
end $$;

commit;
