begin;

select plan(22);

set local role anon;
select set_config('request.jwt.claim.role', 'anon', true);
select is(
  (select count(id)::integer from public.properties),
  3,
  'anonymous users see approved properties only'
);
select is(
  (select count(id)::integer from public.sponsors),
  2,
  'anonymous users see active sponsors only'
);
select is(
  (select count(property_id)::integer from public.property_sponsors),
  1,
  'anonymous users see approved relationships for public content only'
);
select throws_ok(
  $$insert into public.properties (street_address, city, state, zip_code, price, price_basis, bedrooms, bathrooms, square_feet)
    values ('1 Test Road', 'Sampleton', 'CA', '90001', 100, 'purchase', 1, 1, 500)$$,
  '42501',
  null,
  'anonymous users cannot create properties'
);
reset role;

set local role authenticated;
select set_config('request.jwt.claim.role', 'authenticated', true);
select set_config('request.jwt.claim.sub', '10000000-0000-4000-8000-000000000001', true);
select set_config(
  'request.jwt.claims',
  '{"sub":"10000000-0000-4000-8000-000000000001","role":"authenticated"}',
  true
);
select is(
  (select count(id)::integer from public.properties where id = '22222222-2222-4222-8222-222222222222'),
  1,
  'owner can read their own pending property'
);
select is(
  (select count(id)::integer from public.properties where id = '33333333-3333-4333-8333-333333333333'),
  0,
  'owner cannot read another owner pending property'
);
update public.properties
set street_address = '22 Updated Demo Street'
where id = '22222222-2222-4222-8222-222222222222';
select is(
  (select street_address from public.properties where id = '22222222-2222-4222-8222-222222222222'),
  '22 Updated Demo Street',
  'owner can update their own unapproved property'
);
select throws_ok(
  $$update public.properties set owner_id = '20000000-0000-4000-8000-000000000002'
    where id = '22222222-2222-4222-8222-222222222222'$$,
  '42501',
  null,
  'owner cannot transfer property ownership'
);
select throws_ok(
  $$update public.properties set status = 'approved'
    where id = '22222222-2222-4222-8222-222222222222'$$,
  '42501',
  null,
  'owner cannot approve their own property'
);
select is(
  (select count(id)::integer from public.inquiries where id = 'eeeeeeee-eeee-4eee-8eee-eeeeeeeeeeee'),
  0,
  'unrelated owner cannot read another user inquiry'
);
select throws_ok(
  $$update public.profiles set role = 'admin'
    where id = '10000000-0000-4000-8000-000000000001'$$,
  '42501',
  null,
  'member cannot assign themselves administrator role'
);
select ok(
  public.create_property_with_sponsors(
    '{
      "street_address": "5 Optional Lane",
      "city": "Sampleton",
      "state": "CA",
      "zip_code": "90003",
      "price": 100,
      "price_basis": "purchase",
      "currency": "USD",
      "bedrooms": 1,
      "bathrooms": 1,
      "square_feet": 500,
      "amenities": [],
      "local_sponsors": []
    }'::jsonb
  ) is not null,
  'property submission accepts omitted optional address_line_2'
);
update public.properties
set street_address = '100 Revised Example Lane'
where id = '11111111-1111-4111-8111-111111111111';
select is(
  (select status from public.properties where id = '11111111-1111-4111-8111-111111111111'),
  'pending',
  'editing an approved property returns it to review'
);
reset role;

set local role service_role;
select is(
  (select count(*)::integer from public.property_revisions
   where property_id = '11111111-1111-4111-8111-111111111111'),
  1,
  'approved property edit stores one private revision'
);
select is(
  (select approved_snapshot ->> 'street_address' from public.property_revisions
   where property_id = '11111111-1111-4111-8111-111111111111'),
  '100 Example Lane',
  'property revision preserves the prior approved address'
);
reset role;

set local role authenticated;
select set_config('request.jwt.claim.role', 'authenticated', true);
select set_config('request.jwt.claim.sub', '20000000-0000-4000-8000-000000000002', true);
select set_config(
  'request.jwt.claims',
  '{"sub":"20000000-0000-4000-8000-000000000002","role":"authenticated"}',
  true
);
select is(
  (select count(id)::integer from public.properties where id = '22222222-2222-4222-8222-222222222222'),
  0,
  'different authenticated user cannot read an owner draft'
);
select is(
  (select count(id)::integer from public.inquiries where id = 'eeeeeeee-eeee-4eee-8eee-eeeeeeeeeeee'),
  1,
  'inquiry author can read their own inquiry'
);
update public.sponsors
set name = 'Revised Fictional Oak Market'
where id = 'aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa';
select is(
  (select status from public.sponsors where id = 'aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa'),
  'pending',
  'editing an active sponsor returns it to review'
);
reset role;

set local role service_role;
select is(
  (select count(*)::integer from public.sponsor_revisions
   where sponsor_id = 'aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa'),
  1,
  'active sponsor edit stores one private revision'
);
select is(
  (select approved_snapshot ->> 'name' from public.sponsor_revisions
   where sponsor_id = 'aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa'),
  'Fictional Oak Market',
  'sponsor revision preserves the prior approved name'
);
reset role;

set local role authenticated;
select set_config('request.jwt.claim.role', 'authenticated', true);
select set_config('request.jwt.claim.sub', '30000000-0000-4000-8000-000000000003', true);
select set_config(
  'request.jwt.claims',
  '{"sub":"30000000-0000-4000-8000-000000000003","role":"authenticated"}',
  true
);
select is(
  (select count(id)::integer from public.properties),
  6,
  'administrator can read all properties through the admin policy'
);
reset role;

set local role service_role;
update public.properties
set status = 'approved',
    reviewed_by = '30000000-0000-4000-8000-000000000003',
    reviewed_at = now(),
    approved_at = now()
where id = '22222222-2222-4222-8222-222222222222';
select is(
  (select status from public.properties where id = '22222222-2222-4222-8222-222222222222'),
  'approved',
  'trusted server role can persist an approval after server-side admin authorization'
);

select * from finish();
rollback;
