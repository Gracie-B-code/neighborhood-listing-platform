create table public.profiles (
  id uuid primary key references auth.users (id) on delete cascade,
  display_name text check (display_name is null or char_length(display_name) between 1 and 120),
  role text not null default 'member' check (role in ('member', 'admin')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.properties (
  id uuid primary key default gen_random_uuid(),
  owner_id uuid not null default auth.uid() references auth.users (id) on delete cascade,
  street_address text not null check (char_length(street_address) between 1 and 160),
  address_line_2 text check (address_line_2 is null or char_length(address_line_2) <= 80),
  city text not null check (char_length(city) between 1 and 80),
  state text not null check (state ~ '^[A-Z]{2}$'),
  zip_code text not null check (zip_code ~ '^[0-9]{5}(-[0-9]{4})?$'),
  price numeric(12, 2) not null check (price >= 0 and price <= 100000000),
  price_basis text not null check (
    price_basis in ('purchase', 'monthly_rent', 'weekly_rent', 'daily_rent', 'other')
  ),
  currency text not null default 'USD' check (currency ~ '^[A-Z]{3}$'),
  bedrooms smallint not null check (bedrooms between 0 and 100),
  bathrooms numeric(4, 1) not null check (
    bathrooms between 0 and 100 and bathrooms * 2 = trunc(bathrooms * 2)
  ),
  square_feet integer not null check (square_feet between 0 and 1000000),
  amenities text[] not null default '{}'
    check (
      cardinality(amenities) <= 30
      and amenities <@ array[
        'air_conditioning', 'balcony', 'dishwasher', 'gym', 'laundry',
        'parking', 'pets_allowed', 'pool', 'yard'
      ]::text[]
    ),
  status text not null default 'draft'
    check (status in ('draft', 'pending', 'approved', 'rejected')),
  review_note text check (review_note is null or char_length(review_note) <= 500),
  reviewed_by uuid references auth.users (id) on delete set null,
  reviewed_at timestamptz,
  approved_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index properties_public_status_created_idx
  on public.properties (status, created_at desc);
create index properties_owner_idx on public.properties (owner_id);

create table public.sponsors (
  id uuid primary key default gen_random_uuid(),
  owner_id uuid not null default auth.uid() references auth.users (id) on delete cascade,
  name text not null check (char_length(name) between 1 and 120),
  category text not null check (char_length(category) between 1 and 80),
  website_url text check (website_url is null or char_length(website_url) <= 2048),
  claims text[] not null default '{}'
    check (cardinality(claims) <= 20 and array_position(claims, null) is null),
  status text not null default 'draft'
    check (status in ('draft', 'pending', 'active', 'rejected')),
  review_note text check (review_note is null or char_length(review_note) <= 500),
  reviewed_by uuid references auth.users (id) on delete set null,
  reviewed_at timestamptz,
  active_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index sponsors_public_status_name_idx on public.sponsors (status, name);
create index sponsors_owner_idx on public.sponsors (owner_id);

create table public.property_sponsors (
  property_id uuid not null references public.properties (id) on delete cascade,
  sponsor_id uuid not null references public.sponsors (id) on delete cascade,
  created_by uuid not null default auth.uid() references auth.users (id) on delete cascade,
  status text not null default 'pending'
    check (status in ('pending', 'approved', 'rejected')),
  review_note text check (review_note is null or char_length(review_note) <= 500),
  reviewed_by uuid references auth.users (id) on delete set null,
  reviewed_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  primary key (property_id, sponsor_id)
);

create index property_sponsors_sponsor_idx on public.property_sponsors (sponsor_id);
create index property_sponsors_public_idx on public.property_sponsors (status, property_id);

create table public.inquiries (
  id uuid primary key default gen_random_uuid(),
  property_id uuid not null references public.properties (id) on delete cascade,
  user_id uuid not null default auth.uid() references auth.users (id) on delete cascade,
  contact_name text not null check (char_length(contact_name) between 1 and 120),
  email text not null check (char_length(email) between 3 and 254),
  message text not null check (char_length(message) between 1 and 2000),
  status text not null default 'new' check (status in ('new', 'reviewed', 'closed')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index inquiries_property_created_idx on public.inquiries (property_id, created_at desc);
create index inquiries_user_created_idx on public.inquiries (user_id, created_at desc);

create table public.property_revisions (
  id bigint generated always as identity primary key,
  property_id uuid not null references public.properties (id) on delete cascade,
  approved_snapshot jsonb not null,
  captured_at timestamptz not null default now()
);

create table public.sponsor_revisions (
  id bigint generated always as identity primary key,
  sponsor_id uuid not null references public.sponsors (id) on delete cascade,
  approved_snapshot jsonb not null,
  captured_at timestamptz not null default now()
);

create or replace function public.touch_updated_at()
returns trigger
language plpgsql
set search_path = ''
as $$
begin
  new.updated_at := now();
  return new;
end;
$$;

create or replace function public.is_platform_admin()
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select exists (
    select 1
    from public.profiles
    where id = (select auth.uid())
      and role = 'admin'
  );
$$;

revoke all on function public.is_platform_admin() from public, anon;
grant execute on function public.is_platform_admin() to authenticated;

create or replace function public.owns_property(property_uuid uuid)
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select exists (
    select 1
    from public.properties
    where id = property_uuid
      and owner_id = (select auth.uid())
  );
$$;

create or replace function public.owns_sponsor(sponsor_uuid uuid)
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select exists (
    select 1
    from public.sponsors
    where id = sponsor_uuid
      and owner_id = (select auth.uid())
  );
$$;

revoke all on function public.owns_property(uuid) from public, anon;
revoke all on function public.owns_sponsor(uuid) from public, anon;
grant execute on function public.owns_property(uuid) to authenticated;
grant execute on function public.owns_sponsor(uuid) to authenticated;

create or replace function public.handle_new_auth_user()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  insert into public.profiles (id, display_name)
  values (new.id, nullif(new.raw_user_meta_data ->> 'display_name', ''))
  on conflict (id) do nothing;
  return new;
end;
$$;

revoke all on function public.handle_new_auth_user() from public, anon, authenticated;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_auth_user();

create or replace function public.capture_approved_property_revision()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  if old.status = 'approved' and (
    new.street_address is distinct from old.street_address
    or new.address_line_2 is distinct from old.address_line_2
    or new.city is distinct from old.city
    or new.state is distinct from old.state
    or new.zip_code is distinct from old.zip_code
    or new.price is distinct from old.price
    or new.price_basis is distinct from old.price_basis
    or new.currency is distinct from old.currency
    or new.bedrooms is distinct from old.bedrooms
    or new.bathrooms is distinct from old.bathrooms
    or new.square_feet is distinct from old.square_feet
    or new.amenities is distinct from old.amenities
  ) then
    insert into public.property_revisions (property_id, approved_snapshot)
    values (old.id, to_jsonb(old));
    new.status := 'pending';
    new.review_note := null;
    new.reviewed_by := null;
    new.reviewed_at := null;
    new.approved_at := null;
  end if;

  new.updated_at := now();
  return new;
end;
$$;

create or replace function public.capture_active_sponsor_revision()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  if old.status = 'active' and (
    new.name is distinct from old.name
    or new.category is distinct from old.category
    or new.website_url is distinct from old.website_url
    or new.claims is distinct from old.claims
  ) then
    insert into public.sponsor_revisions (sponsor_id, approved_snapshot)
    values (old.id, to_jsonb(old));
    new.status := 'pending';
    new.review_note := null;
    new.reviewed_by := null;
    new.reviewed_at := null;
    new.active_at := null;
  end if;

  new.updated_at := now();
  return new;
end;
$$;

revoke all on function public.capture_approved_property_revision() from public, anon, authenticated;
revoke all on function public.capture_active_sponsor_revision() from public, anon, authenticated;
revoke all on function public.touch_updated_at() from public, anon, authenticated;

create trigger properties_revision_before_update
  before update on public.properties
  for each row execute function public.capture_approved_property_revision();

create trigger sponsors_revision_before_update
  before update on public.sponsors
  for each row execute function public.capture_active_sponsor_revision();

create trigger property_sponsors_touch_updated_at
  before update on public.property_sponsors
  for each row execute function public.touch_updated_at();

create trigger profiles_touch_updated_at
  before update on public.profiles
  for each row execute function public.touch_updated_at();

create trigger inquiries_touch_updated_at
  before update on public.inquiries
  for each row execute function public.touch_updated_at();

create or replace function public.create_property_with_sponsors(p_input jsonb)
returns uuid
language plpgsql
security definer
set search_path = ''
as $$
declare
  new_property_id uuid;
begin
  if auth.uid() is null then
    raise exception 'Authentication required' using errcode = '42501';
  end if;

  if jsonb_typeof(p_input) <> 'object'
    or not (p_input ?& array[
      'street_address', 'address_line_2', 'city', 'state', 'zip_code',
      'price', 'price_basis', 'currency', 'bedrooms', 'bathrooms',
      'square_feet', 'amenities', 'local_sponsors'
    ])
    or p_input - array[
      'street_address', 'address_line_2', 'city', 'state', 'zip_code',
      'price', 'price_basis', 'currency', 'bedrooms', 'bathrooms',
      'square_feet', 'amenities', 'local_sponsors'
    ] <> '{}'::jsonb
  then
    raise exception 'Property payload shape is invalid' using errcode = '22023';
  end if;

  if exists (
    select 1
    from jsonb_array_elements_text(p_input -> 'local_sponsors') as requested(sponsor_id)
    left join public.sponsors s on s.id = requested.sponsor_id::uuid
    where s.id is null or s.status <> 'active'
  ) then
    raise exception 'Only active sponsors may be linked' using errcode = '42501';
  end if;

  insert into public.properties (
    owner_id, street_address, address_line_2, city, state, zip_code,
    price, price_basis, currency, bedrooms, bathrooms, square_feet, amenities, status
  )
  values (
    auth.uid(),
    p_input ->> 'street_address',
    nullif(p_input ->> 'address_line_2', ''),
    p_input ->> 'city',
    p_input ->> 'state',
    p_input ->> 'zip_code',
    (p_input ->> 'price')::numeric,
    p_input ->> 'price_basis',
    p_input ->> 'currency',
    (p_input ->> 'bedrooms')::smallint,
    (p_input ->> 'bathrooms')::numeric,
    (p_input ->> 'square_feet')::integer,
    array(select jsonb_array_elements_text(p_input -> 'amenities')),
    'pending'
  )
  returning id into new_property_id;

  insert into public.property_sponsors (property_id, sponsor_id, created_by)
  select new_property_id, sponsor_id::uuid, auth.uid()
  from jsonb_array_elements_text(coalesce(p_input -> 'local_sponsors', '[]'::jsonb)) as sponsor_id;

  return new_property_id;
end;
$$;

revoke all on function public.create_property_with_sponsors(jsonb) from public, anon;
grant execute on function public.create_property_with_sponsors(jsonb) to authenticated;

alter table public.profiles enable row level security;
alter table public.properties enable row level security;
alter table public.sponsors enable row level security;
alter table public.property_sponsors enable row level security;
alter table public.inquiries enable row level security;
alter table public.property_revisions enable row level security;
alter table public.sponsor_revisions enable row level security;

create policy "Profiles are visible to their owner and admins"
  on public.profiles for select to authenticated
  using (id = (select auth.uid()) or (select public.is_platform_admin()));

create policy "Owners may update their profile display name"
  on public.profiles for update to authenticated
  using (id = (select auth.uid()))
  with check (id = (select auth.uid()));

create policy "Public can read approved properties"
  on public.properties for select to anon, authenticated
  using (status = 'approved');

create policy "Owners and admins can read their property records"
  on public.properties for select to authenticated
  using ((select public.owns_property(id)) or (select public.is_platform_admin()));

create policy "Owners can create their own draft property"
  on public.properties for insert to authenticated
  with check (owner_id = (select auth.uid()) and status in ('draft', 'pending'));

create policy "Owners can update their own property content"
  on public.properties for update to authenticated
  using ((select public.owns_property(id)) or (select public.is_platform_admin()))
  with check (
    ((select public.owns_property(id)) and status <> 'approved')
    or (select public.is_platform_admin())
  );

create policy "Owners can delete unapproved properties"
  on public.properties for delete to authenticated
  using (
    ((select public.owns_property(id)) and status <> 'approved')
    or (select public.is_platform_admin())
  );

create policy "Public can read active sponsors"
  on public.sponsors for select to anon, authenticated
  using (status = 'active');

create policy "Owners and admins can read their sponsor records"
  on public.sponsors for select to authenticated
  using ((select public.owns_sponsor(id)) or (select public.is_platform_admin()));

create policy "Owners can create their own draft sponsors"
  on public.sponsors for insert to authenticated
  with check (owner_id = (select auth.uid()) and status = 'draft');

create policy "Owners can update their own sponsor content"
  on public.sponsors for update to authenticated
  using ((select public.owns_sponsor(id)) or (select public.is_platform_admin()))
  with check (
    ((select public.owns_sponsor(id)) and status <> 'active')
    or (select public.is_platform_admin())
  );

create policy "Owners can delete unapproved sponsors"
  on public.sponsors for delete to authenticated
  using (
    ((select public.owns_sponsor(id)) and status <> 'active')
    or (select public.is_platform_admin())
  );

create policy "Public can read approved sponsor relationships"
  on public.property_sponsors for select to anon, authenticated
  using (
    status = 'approved'
    and exists (
      select 1 from public.properties p
      where p.id = property_id and p.status = 'approved'
    )
    and exists (
      select 1 from public.sponsors s
      where s.id = sponsor_id and s.status = 'active'
    )
  );

create policy "Property owners and admins can read relationship records"
  on public.property_sponsors for select to authenticated
  using (
    (select public.owns_property(property_id))
    or (select public.is_platform_admin())
  );

create policy "Property owners can add pending sponsor relationships"
  on public.property_sponsors for insert to authenticated
  with check (
    created_by = (select auth.uid())
    and status = 'pending'
    and (select public.owns_property(property_id))
    and exists (
      select 1 from public.sponsors s
      where s.id = sponsor_id and s.status = 'active'
    )
  );

create policy "Property owners can remove unapproved relationships"
  on public.property_sponsors for delete to authenticated
  using (
    status <> 'approved'
    and (select public.owns_property(property_id))
  );

create policy "Inquiry authors and property owners can read inquiries"
  on public.inquiries for select to authenticated
  using (
    user_id = (select auth.uid())
    or (select public.owns_property(property_id))
    or (select public.is_platform_admin())
  );

create policy "Authenticated users can inquire on approved properties"
  on public.inquiries for insert to authenticated
  with check (
    user_id = (select auth.uid())
    and exists (
      select 1 from public.properties p
      where p.id = property_id and p.status = 'approved'
    )
  );

create policy "Inquiry authors can delete their own new inquiry"
  on public.inquiries for delete to authenticated
  using (user_id = (select auth.uid()) and status = 'new');

revoke all on public.profiles, public.properties, public.sponsors,
  public.property_sponsors, public.inquiries,
  public.property_revisions, public.sponsor_revisions
  from public, anon, authenticated;

grant select (id, display_name, role, created_at, updated_at)
  on public.profiles to authenticated;
grant insert (id, display_name) on public.profiles to authenticated;
grant update (display_name) on public.profiles to authenticated;

grant select (
  id, street_address, address_line_2, city, state, zip_code, price, price_basis,
  currency, bedrooms, bathrooms, square_feet, amenities, status, created_at,
  updated_at, approved_at
) on public.properties to anon;
grant select (
  id, street_address, address_line_2, city, state, zip_code, price,
  price_basis, currency, bedrooms, bathrooms, square_feet, amenities, status,
  created_at, updated_at, approved_at
) on public.properties to authenticated;
grant insert (
  street_address, address_line_2, city, state, zip_code, price, price_basis,
  currency, bedrooms, bathrooms, square_feet, amenities
) on public.properties to authenticated;
grant update (
  street_address, address_line_2, city, state, zip_code, price, price_basis,
  currency, bedrooms, bathrooms, square_feet, amenities
) on public.properties to authenticated;
grant delete on public.properties to authenticated;

grant select (id, name, category, website_url, claims, status, created_at, updated_at)
  on public.sponsors to anon, authenticated;
grant insert (name, category, website_url, claims) on public.sponsors to authenticated;
grant update (name, category, website_url, claims) on public.sponsors to authenticated;
grant delete on public.sponsors to authenticated;

grant select (
  property_id, sponsor_id, status, created_at
) on public.property_sponsors to anon, authenticated;
grant insert (property_id, sponsor_id) on public.property_sponsors to authenticated;
grant delete on public.property_sponsors to authenticated;

grant select (id, property_id, user_id, contact_name, email, message, status, created_at)
  on public.inquiries to authenticated;
grant insert (property_id, contact_name, email, message) on public.inquiries to authenticated;
grant delete on public.inquiries to authenticated;

grant all on public.profiles, public.properties, public.sponsors,
  public.property_sponsors, public.inquiries,
  public.property_revisions, public.sponsor_revisions to service_role;
grant usage, select on all sequences in schema public to service_role;
