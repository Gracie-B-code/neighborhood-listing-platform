# Lab 2 AI prompts and evidence

## AI Studio: TypeScript prop interfaces only

**Status:** Prompt prepared; no AI Studio response is claimed.

Paste this prompt into AI Studio:

> Using only the component requirements below, return TypeScript prop interfaces only. Do not return React components, implementation code, sample data, imports, prose, or styling. Define props for `PropertyCard`, `SponsorBanner`, and `SearchFilters`.
>
> Requirements: A Property has a stable property ID, street address, city, state, ZIP code, price, an explicit purchase/rent basis, bedroom count, bathroom count, square feet, amenities, and zero or more local sponsor references. A Sponsor has a stable sponsor ID, business name, category, optional website URL, and claims. `PropertyCard` needs the property and a handler for its accessible details action. `SponsorBanner` must receive a sponsor with a usable website link. `SearchFilters` needs an apply handler and filter values for price basis, minimum bedrooms, and optional maximum price. Mark a field optional only when the requirements say it may be absent. Keep external records and UI-only callback props distinct. Return only interfaces.

### Required review before accepting external AI output

- Compare every required/optional decision to `src/lib/properties/schema.ts`; do not make a required database field optional just because a fixture omits it.
- The database property ID and required address, price, measurements, amenities, and sponsor relationship are required for `Property`.
- `address_line_2` and a sponsor's website URL may be absent; sponsor lists may be empty.
- UI callback props belong to the relevant component props, not to the persisted `Property` or `Sponsor` record.
- Keep the runtime Zod schemas as the validation source of truth; `src/types/index.ts` derives TypeScript aliases from them.

Save the unedited response in the instructor-approved evidence location and record the actual model/date and review outcome in `docs/ai-log.md`. Do not replace project types with generated output without checking schema alignment.

## ChatGPT semantics critique

**Status:** Prompt prepared; no ChatGPT critique is claimed.

> Review the Lab 2 property listing components for semantic HTML, heading order, form labels, image alternatives, link/button names, keyboard focus visibility, error/status announcements, and responsive layout. Give specific findings only; do not rewrite code. Separate verified code observations from issues that require a browser test.

## Gemini accessibility critique

**Status:** Prompt prepared; no Gemini critique is claimed.

> Critique this property listing UI for keyboard accessibility and screen-reader clarity. Check form labels and errors, visible focus, button/link names, heading hierarchy, sponsor disclosure, image alternatives, and narrow-screen layout. Return concrete testable recommendations and distinguish code-level observations from things that need a browser check. Do not invent test results.

For each real review, record the exact response or an accurate summary, accepted/rejected suggestions, and how the behavior was checked. No model feedback is recorded as completed until it is actually obtained.
