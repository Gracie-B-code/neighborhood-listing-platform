alter table public.services
  drop constraint services_title_check,
  add constraint services_title_check check (char_length(title) between 5 and 120),
  drop constraint services_status_check,
  add constraint services_status_check
    check (status in ('draft', 'pending', 'approved', 'rejected', 'suspended')),
  alter column status set default 'draft',
  add column duration_minutes integer not null default 60
    check (duration_minutes between 15 and 1440),
  add column coverage_radius_miles integer not null default 15
    check (coverage_radius_miles between 1 and 500);

alter table public.services
  alter column duration_minutes drop default,
  alter column coverage_radius_miles drop default;

drop policy "Providers can submit their own pending services" on public.services;
create policy "Providers can submit their own draft services"
  on public.services for insert to authenticated
  with check (
    provider_id = (select auth.uid())
    and (select public.current_service_role()) = 'provider'
    and status = 'draft'
  );

drop policy "Providers can edit their own unapproved services" on public.services;
create policy "Providers can edit their own draft or suspended services"
  on public.services for update to authenticated
  using (
    (provider_id = (select auth.uid()) and status in ('draft', 'suspended'))
    or (select public.is_service_admin())
  )
  with check (
    (provider_id = (select auth.uid()) and status in ('draft', 'suspended'))
    or (select public.is_service_admin())
  );

drop policy "Providers can delete their own unapproved services" on public.services;
create policy "Providers can delete their own draft or suspended services"
  on public.services for delete to authenticated
  using (
    (provider_id = (select auth.uid()) and status in ('draft', 'suspended'))
    or (select public.is_service_admin())
  );

drop policy "Clients providers and admins can read authorized bookings"
  on public.service_bookings;
create policy "Providers and admins can read authorized bookings"
  on public.service_bookings for select to authenticated
  using (
    exists (
      select 1 from public.services
      where id = service_id and provider_id = (select auth.uid())
    )
    or (select public.is_service_admin())
  );

grant select (duration_minutes, coverage_radius_miles)
  on public.services to anon, authenticated;
grant insert (duration_minutes, coverage_radius_miles)
  on public.services to authenticated;
grant update (duration_minutes, coverage_radius_miles)
  on public.services to authenticated;
