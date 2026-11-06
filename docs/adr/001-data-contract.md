# ADR 001: Property data contract and normalization

- **Status:** Accepted for the Lab 3–5 implementation; stakeholder validation pending.
- **Date:** 2026-11-02

## Context

The starter repository contains only a landing page. It has no Lab 2 property records, cards, filters, or shared property interface to migrate. Lab 3 requires a strict property contract with property ID, address, price, bedrooms, bathrooms, square feet, amenities, ZIP code, and local sponsors. Labs 4–5 add sponsor approval, ownership, inquiries, and PostgreSQL persistence.

## Decision

Use the strict Zod schemas in `src/lib/properties/schema.ts` as the single runtime contract and infer TypeScript types from those schemas. `.strict()` rejects unknown fields; finite, bounded numbers and explicit formats reject malformed values before database operations. Tests exercise one valid fixture and the four required failure cases.

The property contract keeps `price` as a nonnegative amount and adds a required `price_basis` (`purchase`, `monthly_rent`, `weekly_rent`, `daily_rent`, or `other`) plus an ISO-style three-letter currency code. This avoids silently treating an unspecified legacy `price` as either rent or purchase price. There is no existing Lab 2 field or record to map; `local_sponsors` is represented in the API contract as sponsor ID/name references and normalized in storage through `property_sponsors`.

Amenities use a controlled enumeration (`air_conditioning`, `balcony`, `dishwasher`, `gym`, `laundry`, `parking`, `pets_allowed`, `pool`, `yard`) rather than free text. The small controlled list improves filtering and voice-output consistency; adding values requires a reviewed contract/migration update.

## Data relationships and normalization

- `properties.id` is the primary key; `properties.owner_id` references `auth.users.id`.
- `sponsors.id` is the primary key; each sponsor has an owner in `auth.users`.
- `property_sponsors` is a many-to-many join with a unique `(property_id, sponsor_id)` pair and its own review status.
- `profiles.id` is a one-to-one role/display profile for `auth.users`; ordinary users may not write the role column.
- `inquiries` references both a property and its authenticated author.
- Address components and property measurements are stored as columns for validation and filtering. Amenities are a controlled `text[]`; a separate amenity join table is not warranted for this small MVP.
- `address_line_2` is optional in the create contract and nullable in storage; the database RPC accepts its omission and stores it as `NULL`.
- Sponsor names and claims are stored once in `sponsors`; the property contract projects sponsor references from the join rather than duplicating sponsor content.
- Revision tables retain the last approved snapshot when a material owner edit sends a published property or sponsor back to review.

## Alternatives considered

1. **Free-form JSON properties:** rejected because it weakens required-field, type, and unknown-field enforcement.
2. **Hand-maintained TypeScript interface plus separate JSON Schema:** rejected because the two sources can drift. A single Zod schema provides runtime parsing and inferred TypeScript types.
3. **Free-text amenities:** rejected for inconsistent filtering and accessibility/voice labels.
4. **Store local sponsor names on properties:** rejected because sponsor edits would create duplicated, inconsistent records; the join table is canonical.
5. **Assume all prices are sale prices:** rejected because the starter has no price field or examples and rent/purchase semantics must not be invented.

## Consequences

- Callers must provide an explicit price basis and currency; new clients must use the current schema.
- API output includes sponsor names from active, approved sponsor relationships; database storage remains normalized.
- Synthetic fixtures are local examples, not model output, listing data, or stakeholder evidence.
- The real AI Studio structured-output experiment, screenshot, and schema feedback remain student actions. No response was fabricated.
- A future Lab 2 integration must document its actual fields before adding a compatibility mapper.
