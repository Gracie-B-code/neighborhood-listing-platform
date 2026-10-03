# ADR 001: Data Contract and Schema Single Source of Truth

## Status
Accepted

## Context
The neighborhood property listing platform requires consistent data validation across components, local mock state, and synthetic JSON outputs generated via AI Studio. We need a clear strategy for schema definitions, entity relationships (Property, Sponsor, PropertySponsor), and field normalization (e.g., amenities, address fields).

## Decision
1. **Single Source of Truth**: We maintain a single source of truth in TypeScript/Zod at `src/lib/schemas/property.ts`. All TypeScript types (`Property`, `Sponsor`, `Address`, `Amenity`) are inferred directly using `z.infer<typeof Schema>`.
2. **Schema Mirroring**: JSON Schemas for external tools (AI Studio structured outputs) mirror the Zod schema contracts and reside under `docs/schemas/property.json`.
3. **Data Normalization**:
   - **Property vs. Sponsor**: Decoupled into distinct entities. Sponsors are linked optionally to properties (`sponsor_id` or embedded `SponsorSchema`) to avoid duplicating business meta-data across multiple property listings.
   - **Amenities**: Modeled as controlled objects (`{ id, name }`) rather than unstructured free text to ensure predictable UI rendering and filtering capabilities.
   - **Strict Validation**: Properties utilize `.strict()` validation to fail fast when unrecognized or unexpected extra fields are provided.

## Consequences
- **Pros**:
  - Type definitions and runtime validation contracts are automatically kept in sync via Zod inference.
  - Fail-safe component rendering using `PropertySchema.safeParse()`.
  - Strict input rules prevent invalid synthetic data injection during batch testing.
- **Cons**:
  - Updates to the data contract require maintaining both the Zod source schema and any exported static JSON Schema definitions.
