# Lab 5 database and server setup

## Status and scope

The local Supabase stack is running for this workspace. `supabase db reset` applied the numbered migrations and local-only synthetic seed successfully, and `supabase test db` passed all 22 property/sponsor and 24 services/bookings RLS assertions. The property/sponsor tests include approved-content revision capture when owners edit published records. The app's `GET /api/properties` returned HTTP 200 with one approved synthetic listing. Local values are in ignored `.env.local`; no database credentials are committed or recorded here.

The optional `supabase_vector` container was restarting during the final status check. The database, REST API, and tested property workflow were available; vector functionality is not used by this lab's schema or routes.

## Separate services/bookings exercise

The exam services subsystem is separate from the Properties/Sponsors Labs 3–5 model above. Its migrations are `20261029140000_exam_services_persistence.sql` and `20261107150000_exam_services_duration_and_privacy.sql`; together they create `service_profiles`, `services`, and `service_bookings` with independent role and RLS policies. `src/app/api/services/route.ts` uses the session-scoped server client, so normal reads and provider inserts remain subject to RLS. See [the services authorization audit](./security-audit.md) and [services requirements](./requirements.md) for role-by-role test evidence and schema boundaries.

Run the seed only against a disposable local Supabase development database. It creates fictional `auth.users` identities, including a test administrator, with no usable password. Do not apply `supabase/seed.sql` to a hosted project.

## Clean local rebuild

1. Install Docker Desktop and the Supabase CLI using their official instructions. For this per-user Docker Desktop installation, add its CLI to the current PowerShell session:

   ```powershell
   $env:PATH = "$env:LOCALAPPDATA\Programs\DockerDesktop\resources\bin;$env:PATH"
   ```

2. From the repository root, start the local stack:

   ```powershell
   npx.cmd --yes supabase start
   ```

3. Reset the disposable database. This applies the numbered migration and local seed:

   ```powershell
   npx.cmd --yes supabase db reset
   ```

4. Run the row-level-security tests:

   ```powershell
   npx.cmd --yes supabase test db
   ```

5. Copy `.env.example` to `.env.local`. Obtain the local API URL, anon key, and service-role key from `npx.cmd --yes supabase status`; that command prints local credentials, so copy them directly into the ignored local file and never share its full output in logs, issues, or chat.
6. Start the application:

   ```powershell
   npm.cmd run dev
   ```

7. Verify that `GET /api/properties` returns only approved synthetic listings and that the home page shows loading, empty, and safe error states as appropriate.

To rebuild from a clean database, repeat `supabase db reset`. The migration is the source of schema truth; do not make manual schema changes in a hosted project.

## Environment and secret hygiene

- `NEXT_PUBLIC_SUPABASE_URL` and `NEXT_PUBLIC_SUPABASE_ANON_KEY` are the public Supabase endpoint and anon key; they are used by the server-side user-scoped client.
- `SUPABASE_SERVICE_ROLE_KEY` is a server-only secret used only by trusted admin route handlers. It must not be renamed with a `NEXT_PUBLIC_` prefix.
- `.env.example` contains placeholders only. `.env*` is ignored, with the example explicitly allow-listed.
- The browser calls the same-origin application API. The service-role key is not imported by any client component.

## Authorization matrix

| Actor | Public approved properties / active sponsors | Own unapproved content | Another owner's unapproved content | Approve or change owner / role |
|---|---|---|---|---|
| Anonymous | Read only | Denied | Denied | Denied |
| Authenticated owner | Read public content | Read/update own content; edits to approved property/sponsor create a private revision and return it to review | Denied | Denied by RLS and column grants |
| Different authenticated user | Read public content | Own records only | Denied | Denied |
| Administrator | Read through trusted admin API after server-side profile-role check | Trusted review routes may approve/return | Trusted review routes may approve/return | Only server-verified admin route with service-role key; never client-controlled role metadata |

`supabase/tests/rls.test.sql` exercises anonymous read/write rules, owner read/update, cross-owner denial, immutable ownership and role, inquiry privacy, admin visibility, approved property/sponsor revision capture, and a trusted service-role approval operation. The service-role cases alone are not proof of RLS; run the full suite with the anonymous/authenticated roles in the local database before claiming verification.

## Data flow

`request JSON → strict Zod validation → same-origin Next.js Route Handler → verified user session → Supabase RPC or query using the user-scoped client and RLS → database constraints/review state → explicit public-column query → strict output validation → UI`.

Admin approvals follow a separate path: verified user JWT → server-side `profiles.role` lookup → server-only service-role client → constrained status update. The service-role client is never used for ordinary owner operations.

## Design and operational notes

- Public reads filter approved properties and active sponsors, and the query names public columns explicitly.
- Ownership is derived from `auth.uid()`/verified user ID, not request payloads. Normal update grants do not include owner, status, or profile role.
- A security-definer RPC creates the property plus pending sponsor links atomically. It rejects unauthenticated calls, unexpected payload keys, and links to inactive sponsors; table checks and RLS continue to protect ordinary access.
- Editing approved property or active sponsor content captures the previously approved row in a private revision table and returns the changed record to review.
- Inquiries require authentication; table-level RLS prevents anonymous reads. Only the author, associated property owner, or admin can read the message/contact fields.
- The migration includes `properties`, `sponsors`, `property_sponsors`, `profiles`, `inquiries`, and private revision tables. The seed contains fictional records only.

## Remaining checks

- Configure disposable local auth sessions and verify POST and admin routes end-to-end under the intended identities.
- Review RLS and SQL with a peer/instructor; do not treat local test seed admin as production authorization.
