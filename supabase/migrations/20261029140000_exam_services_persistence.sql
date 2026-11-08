create table public.service_profiles (
  id uuid primary key references auth.users (id) on delete cascade,
  role text not null default 'client'
    check (role in ('provider', 'client', 'admin')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.services (
  id uuid primary key default gen_random_uuid(),
  provider_id uuid not null default auth.uid()
    references public.service_profiles (id) on delete cascade,
  title text not null check (char_length(title) between 3 and 120),
  description text not null check (char_length(description) between 10 and 2000),
  category text not null
    check (category in ('cleaning', 'home_repair', 'landscaping', 'pet_care', 'tutoring', 'other')),
  city text not null check (char_length(city) between 1 and 80),
  state text not null check (state ~ '^[A-Z]{2}$'),
  zip_code text not null check (zip_code ~ '^[0-9]{5}(-[0-9]{4})?$'),
  rate_amount numeric(12, 2) check (rate_amount is null or rate_amount between 0 and 1000000),
  currency text not null default 'USD' check (currency ~ '^[A-Z]{3}$'),
  rate_unit text not null check (rate_unit in ('hour', 'visit', 'project', 'day')),
  status text not null default 'pending'
    check (status in ('pending', 'approved', 'rejected')),
  reviewed_by uuid references auth.users (id) on delete set null,
  reviewed_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index services_public_status_created_idx
  on public.services (status, created_at desc);
create index services_provider_idx on public.services (provider_id);

create table public.service_bookings (
  id uuid primary key default gen_random_uuid(),
  service_id uuid not null references public.services (id) on delete cascade,
  client_id uuid not null default auth.uid()
    references public.service_profiles (id) on delete cascade,
  status text not null default 'requested'
    check (status in ('requested', 'accepted', 'declined', 'cancelled')),
  requested_at timestamptz not null default now(),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index service_bookings_service_idx on public.service_bookings (service_id, created_at desc);
create index service_bookings_client_idx on public.service_bookings (client_id, created_at desc);

create or replace function public.create_service_profile_for_auth_user()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  insert into public.service_profiles (id)
  values (new.id)
  on conflict (id) do nothing;
  return new;
end;
$$;

revoke all on function public.create_service_profile_for_auth_user() from public, anon, authenticated;

create trigger on_auth_user_created_service_profile
  after insert on auth.users
  for each row execute function public.create_service_profile_for_auth_user();

create or replace function public.is_service_admin()
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select exists (
    select 1
    from public.service_profiles
    where id = (select auth.uid())
      and role = 'admin'
  );
$$;

revoke all on function public.is_service_admin() from public, anon;
grant execute on function public.is_service_admin() to authenticated;

create or replace function public.current_service_role()
returns text
language sql
stable
security definer
set search_path = ''
as $$
  select role
  from public.service_profiles
  where id = (select auth.uid());
$$;

revoke all on function public.current_service_role() from public, anon;
grant execute on function public.current_service_role() to authenticated;

create or replace function public.protect_service_review_fields()
returns trigger
language plpgsql
set search_path = ''
as $$
begin
  if coalesce(auth.role(), '') <> 'service_role'
    and not (select public.is_service_admin())
    and (
      new.provider_id is distinct from old.provider_id
      or new.status is distinct from old.status
      or new.reviewed_by is distinct from old.reviewed_by
      or new.reviewed_at is distinct from old.reviewed_at
    )
  then
    raise exception 'Only a trusted administrator may change service ownership or review fields'
      using errcode = '42501';
  end if;

  new.updated_at := now();
  return new;
end;
$$;

revoke all on function public.protect_service_review_fields() from public, anon, authenticated;

create trigger services_protect_review_fields
  before update on public.services
  for each row execute function public.protect_service_review_fields();

create or replace function public.touch_service_updated_at()
returns trigger
language plpgsql
set search_path = ''
as $$
begin
  new.updated_at := now();
  return new;
end;
$$;

revoke all on function public.touch_service_updated_at() from public, anon, authenticated;

create trigger service_profiles_touch_updated_at
  before update on public.service_profiles
  for each row execute function public.touch_service_updated_at();

create trigger service_bookings_touch_updated_at
  before update on public.service_bookings
  for each row execute function public.touch_service_updated_at();

alter table public.service_profiles enable row level security;
alter table public.services enable row level security;
alter table public.service_bookings enable row level security;

create policy "Service users can read their own role"
  on public.service_profiles for select to authenticated
  using (id = (select auth.uid()) or (select public.is_service_admin()));

create policy "Public can read approved services"
  on public.services for select to anon, authenticated
  using (status = 'approved');

create policy "Providers and admins can read private service records"
  on public.services for select to authenticated
  using (
    provider_id = (select auth.uid())
    or (select public.is_service_admin())
  );

create policy "Providers can submit their own pending services"
  on public.services for insert to authenticated
  with check (
    provider_id = (select auth.uid())
    and (select public.current_service_role()) = 'provider'
    and status = 'pending'
  );

create policy "Providers can edit their own unapproved services"
  on public.services for update to authenticated
  using (
    provider_id = (select auth.uid())
    or (select public.is_service_admin())
  )
  with check (
    (provider_id = (select auth.uid()) and status <> 'approved')
    or (select public.is_service_admin())
  );

create policy "Providers can delete their own unapproved services"
  on public.services for delete to authenticated
  using (
    (provider_id = (select auth.uid()) and status <> 'approved')
    or (select public.is_service_admin())
  );

create policy "Clients can request approved services"
  on public.service_bookings for insert to authenticated
  with check (
    client_id = (select auth.uid())
    and (select public.current_service_role()) = 'client'
    and status = 'requested'
    and exists (
      select 1 from public.services
      where id = service_id and status = 'approved'
    )
  );

create policy "Clients providers and admins can read authorized bookings"
  on public.service_bookings for select to authenticated
  using (
    client_id = (select auth.uid())
    or exists (
      select 1 from public.services
      where id = service_id and provider_id = (select auth.uid())
    )
    or (select public.is_service_admin())
  );

revoke all on public.service_profiles, public.services, public.service_bookings
  from public, anon, authenticated;

grant select (id, role, created_at, updated_at)
  on public.service_profiles to authenticated;

grant select (
  id, title, description, category, city, state, zip_code,
  rate_amount, currency, rate_unit, status, created_at, updated_at
) on public.services to anon;
grant select (
  id, provider_id, title, description, category, city, state, zip_code,
  rate_amount, currency, rate_unit, status, created_at, updated_at,
  reviewed_by, reviewed_at
) on public.services to authenticated;

grant insert (
  title, description, category, city, state, zip_code,
  rate_amount, currency, rate_unit
) on public.services to authenticated;

grant update (
  title, description, category, city, state, zip_code, rate_amount, currency,
  rate_unit, status, reviewed_by, reviewed_at
) on public.services to authenticated;
grant delete on public.services to authenticated;

grant select (id, service_id, client_id, status, requested_at, created_at, updated_at)
  on public.service_bookings to authenticated;
grant insert (service_id) on public.service_bookings to authenticated;

grant all on public.service_profiles, public.services, public.service_bookings
  to service_role;
