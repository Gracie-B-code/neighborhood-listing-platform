# Lab 3 implementation evidence

## Completed in the repository

- **Contract source:** `src/lib/properties/schema.ts` (Zod is the single source of truth; TypeScript types are inferred from it).
- **JSON Schema:** `data/generated/property-records.schema.json` (Draft 2020-12; exactly five records; additional properties are disallowed).
- **Synthetic seed:** `data/generated/synthetic-property-examples.json` (five locally authored fictional records, explicitly not AI output).
- **Commands:** `npm run schema:export`, `npm run validate:properties`, and `npm test`.
- **Required negative tests:** missing property ID, negative price, malformed ZIP, and unknown property field.
- **Decision record:** `docs/adr/001-data-contract.md`.

## Validator output

Run `npm run validate:properties` from the repository root. Expected output for the checked-in fixture:

```text
Validation passed: 5 synthetic property records conform to the Zod source schema.
```

The validator reports JSON parse or Zod validation errors to stderr and exits unsuccessfully; it never rewrites malformed input.

## Evidence still required from the student

- Run the prompt in AI Studio, save the original response with model/date metadata, and capture the requested screenshot with personal data removed.
- Record malformed-response errors, then explain which prompt/schema layer fixed each issue while preserving the original response.
- Ask ChatGPT and Gemini to critique normalization; record their actual suggestions and decisions. No third-party critique or AI Studio run is claimed in this repository.
- Add the instructor-approved accessibility/audit evidence if the course requires it for this lab.
