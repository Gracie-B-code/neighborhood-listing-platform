begin;

select plan(24);

set local role anon;
select set_config('request.jwt.claim.role', 'anon', true);
select is(
  (select count(id)::integer from public.services),
  1,
  'anonymous users can read approved services only'
);
select is(
  (select count(id)::integer from public.services where status = 'pending'),
  0,
  'anonymous users cannot read pending services'
);
select throws_ok(
  $$insert into public.services (
      title, description, category, city, state, zip_code, rate_unit,
      duration_minutes, coverage_radius_miles
    ) values (
      'Anonymous service', 'An unauthenticated service submission.',
      'other', 'Sampleton', 'CA', '90001', 'visit', 60, 10
    )$$,
  '42501',
  null,
  'anonymous users cannot submit services'
);
select throws_ok(
  $$select * from public.service_bookings$$,
  '42501',
  null,
  'anonymous users cannot read client booking records'
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
  (select count(id)::integer from public.services where id = 'eeeeeeee-eeee-4eee-8eee-eeeeeeeeee01'),
  1,
  'provider can read their own draft service'
);
select is(
  (select count(id)::integer from public.services where id = 'eeeeeeee-eeee-4eee-8eee-eeeeeeeeee02'),
  0,
  'provider cannot read another provider draft service'
);
update public.services
set title = 'Unauthorized provider update'
where id = 'eeeeeeee-eeee-4eee-8eee-eeeeeeeeee02';
reset role;

set local role service_role;
select is(
  (select title from public.services where id = 'eeeeeeee-eeee-4eee-8eee-eeeeeeeeee02'),
  'Synthetic second provider draft',
  'provider cannot update another provider service'
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
insert into public.services (
  title, description, category, city, state, zip_code, rate_amount, currency,
  rate_unit, duration_minutes, coverage_radius_miles
)
values (
  'Provider-created synthetic service',
  'A new draft service inserted by its authenticated provider.',
  'cleaning', 'Sampleton', 'CA', '90004', null, 'USD', 'visit', 60, 10
);
select is(
  (select count(id)::integer from public.services where provider_id = auth.uid() and status = 'draft'),
  2,
  'provider can submit a new draft service owned by their account'
);
update public.services
set title = 'Updated synthetic provider draft'
where id = 'eeeeeeee-eeee-4eee-8eee-eeeeeeeeee01';
select is(
  (select title from public.services where id = 'eeeeeeee-eeee-4eee-8eee-eeeeeeeeee01'),
  'Updated synthetic provider draft',
  'provider can update their own draft service'
);
update public.services
set title = 'Unauthorized approved service edit'
where id = 'dddddddd-dddd-4ddd-8ddd-dddddddddddd';
reset role;

set local role service_role;
select is(
  (select title from public.services where id = 'dddddddd-dddd-4ddd-8ddd-dddddddddddd'),
  'Fictional home repair',
  'provider cannot edit an approved service'
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
select throws_ok(
  $$update public.services set status = 'approved'
    where id = 'eeeeeeee-eeee-4eee-8eee-eeeeeeeeee01'$$,
  '42501',
  null,
  'provider cannot approve their own service'
);
select throws_ok(
  $$update public.services set provider_id = '40000000-0000-4000-8000-000000000004'
    where id = 'eeeeeeee-eeee-4eee-8eee-eeeeeeeeee01'$$,
  '42501',
  null,
  'provider cannot transfer service ownership'
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
  (select count(id)::integer from public.services where status = 'draft'),
  0,
  'client cannot read provider drafts'
);
insert into public.service_bookings (service_id)
values ('dddddddd-dddd-4ddd-8ddd-dddddddddddd');
reset role;

set local role service_role;
select is(
  (select count(id)::integer from public.service_bookings),
  1,
  'client can request an approved service'
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
  (select count(id)::integer from public.service_bookings),
  0,
  'client cannot read any booking rows, including their own'
);
select throws_ok(
  $$insert into public.service_bookings (service_id)
    values ('eeeeeeee-eeee-4eee-8eee-eeeeeeeeee02')$$,
  '42501',
  null,
  'client cannot request a draft service'
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
  (select count(id)::integer from public.service_bookings),
  1,
  'provider can read a booking for their service'
);
reset role;

set local role authenticated;
select set_config('request.jwt.claim.role', 'authenticated', true);
select set_config('request.jwt.claim.sub', '40000000-0000-4000-8000-000000000004', true);
select set_config(
  'request.jwt.claims',
  '{"sub":"40000000-0000-4000-8000-000000000004","role":"authenticated"}',
  true
);
select is(
  (select count(id)::integer from public.service_bookings),
  0,
  'another provider cannot read a booking for a different provider service'
);
reset role;

set local role authenticated;
select set_config('request.jwt.claim.role', 'authenticated', true);
select set_config('request.jwt.claim.sub', '50000000-0000-4000-8000-000000000005', true);
select set_config(
  'request.jwt.claims',
  '{"sub":"50000000-0000-4000-8000-000000000005","role":"authenticated"}',
  true
);
select is(
  (select count(id)::integer from public.service_bookings),
  0,
  'a different client cannot read another client booking'
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
  (select count(id)::integer from public.services),
  4,
  'administrator can read all services'
);
update public.services
set status = 'approved',
    reviewed_by = '30000000-0000-4000-8000-000000000003',
    reviewed_at = now()
where id = 'eeeeeeee-eeee-4eee-8eee-eeeeeeeeee01';
select is(
  (select status from public.services where id = 'eeeeeeee-eeee-4eee-8eee-eeeeeeeeee01'),
  'approved',
  'administrator can approve a service'
);
update public.services
set status = 'suspended',
    reviewed_by = '30000000-0000-4000-8000-000000000003',
    reviewed_at = now()
where id = 'eeeeeeee-eeee-4eee-8eee-eeeeeeeeee02';
select is(
  (select status from public.services where id = 'eeeeeeee-eeee-4eee-8eee-eeeeeeeeee02'),
  'suspended',
  'administrator can suspend a service'
);
select is(
  (select count(id)::integer from public.service_bookings),
  1,
  'administrator can read service bookings'
);
select throws_ok(
  $$update public.service_profiles set role = 'admin'
    where id = '20000000-0000-4000-8000-000000000002'$$,
  '42501',
  null,
  'administrator role cannot be assigned through an ordinary client update'
);

select * from finish();
rollback;
