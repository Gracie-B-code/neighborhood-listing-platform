# Services and bookings requirements

## Scope and implementation boundary

This is the separate Local Merchant Services & Client Appointment slice. It
does not replace the property platform's existing `public.profiles` table or
its role model. The service slice uses `public.service_profiles` so service
roles cannot broaden property-platform permissions. In the service slice,
`provider` is the implemented equivalent of merchant/service provider.

The user stories below describe the implemented behavior and identify
rubric-level differences explicitly. No neighborhood district taxonomy or
active coverage-zone source has been supplied, so the app does not invent one.

## Story 1 — Provider service drafts

**As an authenticated local service provider, I want to submit service listing
drafts with pricing and appointment details, so that clients can request
appointments after an administrator approves the service.**

**Estimate:** Medium

**Traceability:** [service persistence migration](../supabase/migrations/20261029140000_exam_services_persistence.sql),
[service details and privacy migration](../supabase/migrations/20261107150000_exam_services_duration_and_privacy.sql),
[service schema](../src/schemas/service.ts),
[service API](../src/app/api/services/route.ts),
[service RLS tests](../supabase/tests/services_rls.test.sql).

### Acceptance criteria

```gherkin
Given an authenticated account with the provider role
When it submits a valid service payload with title, category, location, rate, duration, and coverage radius
Then the service is stored with status draft and provider_id set from auth.uid()

Given a provider submits a payload with an unknown field, too-short title, negative rate, invalid duration, or invalid radius
When the API validates the payload
Then it returns HTTP 400 with field-level errors and does not create a service

Given an anonymous visitor or authenticated non-provider
When it submits a service payload
Then the API denies the request and no service is created
```

The service database contract currently allows a nullable, nonnegative
`rate_amount` and `rate_unit` values (`hour`, `visit`, `project`, `day`) rather
than requiring a non-null `hourly_rate`. This preserves the existing explicit
"contact provider for pricing" case.

## Story 2 — Residents find services and request appointments

**As a neighborhood resident, I want to view approved services by category and
location and request an appointment, so that I can find local help without
accessing other clients' booking records.**

**Estimate:** Large

**Traceability:** [public service query and submission route](../src/app/api/services/route.ts),
[booking route](../src/app/api/services/%5BserviceId%5D/bookings/route.ts),
[service card and grid](../src/components/ServiceCard.tsx),
[service explorer](../src/app/services-explorer.tsx),
[service migrations](../supabase/migrations/20261029140000_exam_services_persistence.sql)
and [privacy update](../supabase/migrations/20261107150000_exam_services_duration_and_privacy.sql).

### Acceptance criteria

```gherkin
Given an anonymous visitor
When the visitor queries services
Then only approved service records and explicitly selected public fields are returned

Given an approved service and an authenticated account with the client role
When the client requests that service
Then a requested booking is created for the authenticated client

Given a client attempts to select booking rows
When row-level security evaluates the query
Then no booking rows, including the client's own, are visible to that client

Given an anonymous visitor or a client requests a draft service
When the booking route or database policy validates the request
Then the request is denied
```

**Deliberate privacy adaptation:** The provided rubric permits public booking
inserts, but the current application requires an authenticated client account.
The database stores the authenticated `client_id`, not a caller-supplied email.
This avoids anonymous booking abuse and keeps identity tied to the verified
session. Clients have no direct booking read access; the booking POST response
only confirms the newly created request.

**Location/category gap:** Services currently carry a controlled category,
city, state, ZIP, and a numeric coverage radius. There is no separate
neighborhood-district taxonomy or independently activated coverage-zone
relation. The app must not describe a ZIP/radius as an approved active zone
until that model and its source are confirmed.

## Story 3 — Platform administrator oversight

**As a platform administrator, I want to review and suspend service listings
and inspect bookings for provider response, so that I can moderate the
marketplace without allowing ordinary users to elevate their privileges.**

**Estimate:** Medium

**Traceability:** [service persistence migration](../supabase/migrations/20261029140000_exam_services_persistence.sql),
[service RLS tests](../supabase/tests/services_rls.test.sql), and the
server-only [Supabase client](../src/lib/supabase/server.ts).

### Acceptance criteria

```gherkin
Given a server-verified administrator role
When the administrator reads services or bookings through an authorized database session
Then the administrator can read all service records and booking records

Given a server-verified administrator role
When the administrator changes a service to approved or suspended
Then the review change is persisted and ordinary provider updates cannot set that status

Given a client or provider attempts to assign an administrator role
When the database evaluates the update
Then the role change is denied
```

The database policies support administrator review and suspension, and tests
cover approval and booking visibility. This repository does not yet include a
dedicated administrator HTTP review/deactivation route or account
deactivation workflow; do not treat direct database authorization as a
finished moderation UI.

## Schema and security mapping

| Rubric concept | Current implementation |
|---|---|
| `profiles` with merchant/provider/client roles | Separate `service_profiles`; the existing shared `profiles` table is intentionally unchanged |
| `service_categories` and mapping junction | Controlled `services.category` enum; no lookup/junction tables yet |
| Service rate, duration, and coverage | `rate_amount`, `currency`, `rate_unit`, `duration_minutes`, `coverage_radius_miles` |
| Coverage districts/active zones | City/state/ZIP plus radius only; district and active-zone lifecycle remain unimplemented pending a defined source |
| Booking identity and contact fields | Authenticated `client_id`; no client email, appointment date, or notes fields |
| Public approved services | Anonymous and authenticated reads are filtered to `status = 'approved'` |
| Booking privacy | Providers for their own services and administrators can select; clients and anonymous visitors cannot select |
| Service-role key | Read only in server-only code; ordinary requests use the session-scoped client and RLS |

These are intentional compatibility and privacy decisions, not claims that the
omitted lookup, zone, anonymous booking, or admin UI features are complete.
