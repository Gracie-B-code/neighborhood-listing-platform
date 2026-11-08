# Services persistence and RLS audit

## Scope and evidence

This audit covers the separate exam Services/Bookings subsystem implemented by `supabase/migrations/20261029140000_exam_services_persistence.sql` and `supabase/migrations/20261107150000_exam_services_duration_and_privacy.sql`. It does not replace or alter the Properties/Sponsors Labs 3–5 tables and policies. All records used in the test matrix are fictional local seed data.

The migration enables RLS on `service_profiles`, `services`, and `service_bookings`, revokes ordinary table privileges before adding least-privilege column grants, and does not rely on an elevated service-role API client for normal requests. Service-role credentials remain server-only.

### Verification status

- `npx.cmd --yes supabase db reset` applied both the services migration and fictional seed successfully on the local Supabase stack.
- `npx.cmd --yes supabase test db` passed both pgTAP files: 46 total assertions (22 property/sponsor and 24 services/bookings).
- A local browser request to `GET /api/services` returned HTTP 200 with one approved synthetic service including duration and coverage fields.
- Invalid `POST /api/services` returned HTTP 400 with field errors, and a valid unauthenticated POST returned HTTP 401.
- An earlier authenticated provider POST returned HTTP 201 with a pending record. The forward migration now defaults provider submissions to draft; current pgTAP coverage verifies provider-scoped draft insertion. An authenticated HTTP POST was not repeated after this status change.
- Authenticated local client `POST /api/services/{serviceId}/bookings` returned HTTP 201 with a requested booking. The temporary client identity and associated booking were removed afterward.
- Authenticated route verification used the same user-scoped server client and RLS policies; no service-role API client was used for the request.

## Authorization matrix

| Actor | Read approved services | Read own draft service | Read another provider's draft service | Submit service | Approve service | Booking access |
|---|---|---|---|---|---|---|
| Anonymous | Allowed | Denied | Denied | Denied | Denied | Denied |
| Provider | Allowed | Allowed | Denied | Own draft service only | Denied; review fields protected by trigger | Can read bookings for own services |
| Client | Allowed | Denied | Denied | Denied | Denied | Can request an approved service; cannot read any booking |
| Admin | Allowed | Allowed | Allowed | Trusted administrative operation | Can approve or suspend services; admin role is provisioned outside ordinary client updates | Can read all bookings |

RLS is enabled and there is no permissive anonymous policy for profile or booking data. Public service reads are limited to `approved` rows. A provider's ownership and role come from the verified Supabase session and protected `service_profiles` row, never from request JSON. Review fields and ownership cannot be changed by providers. Ordinary client updates cannot assign the admin role. Clients cannot select booking rows, including their own; the create endpoint returns only the newly created request confirmation.

## Test evidence checklist

The pgTAP script verifies:

- Anonymous users see only approved services and cannot submit.
- A provider can see and edit their own draft service but cannot read or update another provider's draft, modify an approved service, approve their own record, or transfer ownership.
- A client cannot see drafts, can request an approved service, cannot book a pending service, and cannot select any booking row.
- An administrator can read all services/bookings, approve a service, and suspend a service.
- An administrator cannot assign a role through an ordinary client update.

The services and booking routes use the user-scoped server client and rely on the same database RLS rules. A local browser check rendered the approved service and exercised the CTA with Tab, Shift+Tab, Enter, and Space; the unauthenticated attempt announced the expected sign-in error. A full screen-reader and cross-device usability review remains separate.

All created and updated times use PostgreSQL `timestamptz` columns with `now()` defaults/triggers. PostgreSQL stores these as absolute instants independently of client time zone; API timestamps retain their timezone offset.

The service slice deliberately uses `service_profiles`, a controlled category
enum, ZIP/radius location, and authenticated client bookings rather than
replacing the shared property `profiles` table or introducing public
email-based bookings. District/active-zone records and a dedicated admin
HTTP moderation route are not implemented; see
[`requirements.md`](./requirements.md) for traceability and remaining scope.
