-- Synthetic local-development identities only; these users have no usable password.
insert into auth.users (
  instance_id,
  id,
  aud,
  role,
  email,
  encrypted_password,
  email_confirmed_at,
  raw_app_meta_data,
  raw_user_meta_data,
  created_at,
  updated_at
)
values
  (
    '00000000-0000-0000-0000-000000000000',
    '10000000-0000-4000-8000-000000000001',
    'authenticated',
    'authenticated',
    'synthetic-owner@example.invalid',
    null,
    now(),
    '{"provider":"email","providers":["email"]}'::jsonb,
    '{"display_name":"Synthetic Property Owner"}'::jsonb,
    now(),
    now()
  ),
  (
    '00000000-0000-0000-0000-000000000000',
    '20000000-0000-4000-8000-000000000002',
    'authenticated',
    'authenticated',
    'synthetic-sponsor@example.invalid',
    null,
    now(),
    '{"provider":"email","providers":["email"]}'::jsonb,
    '{"display_name":"Synthetic Sponsor Owner"}'::jsonb,
    now(),
    now()
  ),
  (
    '00000000-0000-0000-0000-000000000000',
    '30000000-0000-4000-8000-000000000003',
    'authenticated',
    'authenticated',
    'synthetic-admin@example.invalid',
    null,
    now(),
    '{"provider":"email","providers":["email"]}'::jsonb,
    '{"display_name":"Synthetic Local Admin"}'::jsonb,
    now(),
    now()
  ),
  (
    '00000000-0000-0000-0000-000000000000',
    '40000000-0000-4000-8000-000000000004',
    'authenticated',
    'authenticated',
    'synthetic-provider-two@example.invalid',
    null,
    now(),
    '{"provider":"email","providers":["email"]}'::jsonb,
    '{"display_name":"Synthetic Second Provider"}'::jsonb,
    now(),
    now()
  ),
  (
    '00000000-0000-0000-0000-000000000000',
    '50000000-0000-4000-8000-000000000005',
    'authenticated',
    'authenticated',
    'synthetic-client-two@example.invalid',
    null,
    now(),
    '{"provider":"email","providers":["email"]}'::jsonb,
    '{"display_name":"Synthetic Second Client"}'::jsonb,
    now(),
    now()
  )
on conflict (id) do nothing;

update public.profiles
set role = 'admin'
where id = '30000000-0000-4000-8000-000000000003';

insert into public.service_profiles (id, role)
values
  ('10000000-0000-4000-8000-000000000001', 'provider'),
  ('20000000-0000-4000-8000-000000000002', 'client'),
  ('30000000-0000-4000-8000-000000000003', 'admin'),
  ('40000000-0000-4000-8000-000000000004', 'provider'),
  ('50000000-0000-4000-8000-000000000005', 'client')
on conflict (id) do update set role = excluded.role;

insert into public.services (
  id, provider_id, title, description, category, city, state, zip_code,
  rate_amount, currency, rate_unit, duration_minutes, coverage_radius_miles, status
)
values
  (
    'dddddddd-dddd-4ddd-8ddd-dddddddddddd',
    '10000000-0000-4000-8000-000000000001',
    'Fictional home repair',
    'Synthetic approved service used for local API and authorization tests.',
    'home_repair', 'Sampleton', 'CA', '90001', 75, 'USD', 'hour', 60, 15, 'approved'
  ),
  (
    'eeeeeeee-eeee-4eee-8eee-eeeeeeeeee01',
    '10000000-0000-4000-8000-000000000001',
    'Synthetic provider draft',
    'Synthetic pending service owned by the first fictional provider.',
    'cleaning', 'Sampleton', 'CA', '90002', null, 'USD', 'visit', 60, 10, 'draft'
  ),
  (
    'eeeeeeee-eeee-4eee-8eee-eeeeeeeeee02',
    '40000000-0000-4000-8000-000000000004',
    'Synthetic second provider draft',
    'Synthetic pending service owned by a different fictional provider.',
    'tutoring', 'Sampleton', 'CA', '90003', 40, 'USD', 'hour', 45, 20, 'draft'
  )
on conflict (id) do nothing;

insert into public.properties (
  id, owner_id, street_address, city, state, zip_code, price, price_basis,
  currency, bedrooms, bathrooms, square_feet, amenities, status, approved_at
)
values
  (
    '11111111-1111-4111-8111-111111111111',
    '10000000-0000-4000-8000-000000000001',
    '100 Example Lane', 'Sampleton', 'CA', '90001', 480000, 'purchase',
    'USD', 3, 2, 1450, array['parking', 'laundry'], 'approved', now()
  ),
  (
    '22222222-2222-4222-8222-222222222222',
    '10000000-0000-4000-8000-000000000001',
    '22 Demo Street', 'Sampleton', 'CA', '90002', 2100, 'monthly_rent',
    'USD', 2, 1.5, 980, array['air_conditioning'], 'pending', null
  ),
  (
    '33333333-3333-4333-8333-333333333333',
    '20000000-0000-4000-8000-000000000002',
    '3 Placeholder Court', 'Fictional Bay', 'OR', '97035', 0, 'other',
    'USD', 0, 1, 420, array['pool'], 'pending', null
  ),
  (
    '44444444-4444-4444-8444-444444444444',
    '10000000-0000-4000-8000-000000000001',
    '400 Model Avenue', 'Fictional Bay', 'OR', '97036', 1750, 'monthly_rent',
    'USD', 2, 1, 860, array['balcony', 'dishwasher'], 'approved', now()
  ),
  (
    '55555555-5555-4555-8555-555555555555',
    '10000000-0000-4000-8000-000000000001',
    '55 Mockingbird Way', 'Example Heights', 'WA', '98001', 725000, 'purchase',
    'USD', 4, 3, 2200, array['gym', 'yard'], 'approved', now()
  )
on conflict (id) do nothing;

insert into public.sponsors (
  id, owner_id, name, category, website_url, claims, status, active_at
)
values
  (
    'aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa',
    '20000000-0000-4000-8000-000000000002',
    'Fictional Oak Market', 'Grocery',
    'https://oak-market.example.invalid',
    array['Synthetic sponsor example'], 'active', now()
  ),
  (
    'bbbbbbbb-bbbb-4bbb-8bbb-bbbbbbbbbbbb',
    '20000000-0000-4000-8000-000000000002',
    'Imaginary Garden Co-op', 'Community',
    'https://garden-coop.example.invalid',
    array['Synthetic sponsor example'], 'active', now()
  ),
  (
    'cccccccc-cccc-4ccc-8ccc-cccccccccccc',
    '20000000-0000-4000-8000-000000000002',
    'Unreviewed Demo Sponsor', 'Community',
    null, array[]::text[], 'pending', null
  )
on conflict (id) do nothing;

insert into public.property_sponsors (property_id, sponsor_id, created_by, status, reviewed_at)
values (
  '11111111-1111-4111-8111-111111111111',
  'aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa',
  '10000000-0000-4000-8000-000000000001',
  'approved',
  now()
)
on conflict (property_id, sponsor_id) do nothing;

insert into public.inquiries (
  id, property_id, user_id, contact_name, email, message
)
values (
  'eeeeeeee-eeee-4eee-8eee-eeeeeeeeeeee',
  '33333333-3333-4333-8333-333333333333',
  '20000000-0000-4000-8000-000000000002',
  'Synthetic Inquiry Sender',
  'inquiry@example.invalid',
  'Synthetic inquiry used only for local authorization tests.'
)
on conflict (id) do nothing;
