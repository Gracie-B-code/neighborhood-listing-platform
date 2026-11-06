# Services persistence and RLS audit

## Scope and evidence

This audit covers the separate exam Services/Bookings subsystem implemented by `supabase/migrations/20261029140000_exam_services_persistence.sql`. It does not replace or alter the Properties/Sponsors Labs 3–5 tables and policies. All records used in the test matrix are fictional local seed data.

The migration enables RLS on `service_profiles`, `services`, and `service_bookings`, revokes ordinary table privileges before adding least-privilege column grants, and does not rely on an elevated service-role API client for normal requests. Service-role credentials remain server-only.

### Verification status

- `npx.cmd --yes supabase db reset` applied both the services migration and fictional seed successfully on the local Supabase stack.
- `npx.cmd --yes supabase test db` passed both pgTAP files: 36 total assertions (16 property/sponsor and 20 services/bookings).
- `GET /api/services` returned HTTP 200 with one approved synthetic service.
- Invalid `POST /api/services` returned HTTP 400, and unauthenticated `POST` returned HTTP 401.
- Authenticated local provider `POST /api/services` returned HTTP 201 and a pending record. The temporary test identity and its service were removed afterward.
- Authenticated route verification used the same user-scoped server client and RLS policies; no service-role API client was used for the request.

## Authorization matrix

| Actor | Read approved services | Read own pending service | Read another provider's pending service | Submit service | Approve service | Booking access |
|---|---|---|---|---|---|---|
| Anonymous | Allowed | Denied | Denied | Denied | Denied | Denied |
| Provider | Allowed | Allowed | Denied | Own pending service only | Denied; review fields protected by trigger | Can read bookings for own services |
| Client | Allowed | Denied | Denied | Denied | Denied | Can request an approved service and read only own bookings |
| Admin | Allowed | Allowed | Allowed | Trusted administrative operation | Allowed; admin role is provisioned outside ordinary client updates | Can read all bookings |

RLS is enabled and there is no permissive anonymous policy for profile or booking data. Public service reads are limited to `approved` rows. A provider's ownership and role come from the verified Supabase session and protected `service_profiles` row, never from request JSON. Review fields and ownership cannot be changed by providers. Ordinary client updates cannot assign the admin role.

## Test evidence checklist

The pgTAP script verifies:

- Anonymous users see only approved services and cannot submit.
- A provider can see and edit their own pending service but cannot read another provider's draft, approve their own record, or transfer ownership.
- A client cannot see drafts, can request an approved service, cannot book a pending service, and cannot read another client's booking.
- An administrator can read all services/bookings and approve a service.
- An administrator cannot assign a role through an ordinary client update.

The route uses the user-scoped server client, validates input with Zod, and relies on the same database RLS rules. Local HTTP checks verified an approved GET, invalid and anonymous denials, and a successful authenticated provider POST. A full browser/manual usability check remains separate.

All created and updated times use PostgreSQL `timestamptz` columns with `now()` defaults/triggers. PostgreSQL stores these as absolute instants independently of client time zone; API timestamps retain their timezone offset.
