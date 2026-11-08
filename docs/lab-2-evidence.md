# Lab 2 accessibility and review evidence

## Local implementation checklist

- [x] Component hierarchy documented in the README Mermaid diagram.
- [x] Property and sponsor TypeScript types exported from `src/types/index.ts` and derived from the runtime schemas.
- [x] Property cards use an article, third-level heading, descriptive local illustration alternative text, price, property facts, and a specifically named details button.
- [x] Sponsor banners show a visible `Sponsored` label and a business-specific accessible website link when a URL exists.
- [x] Search form uses explicit labels, selects, a submit button, a reset button, and connected validation feedback.
- [x] Three approved fictional properties are seeded for the local listings grid; records render with stable property IDs.
- [x] Property, sponsor, and service card layouts use one, two, and three columns at the small, medium, and large breakpoints.
- [x] Focus-visible styles are provided for interactive controls.
- [x] Filter logic has tests for matching and empty results.

## Activities requiring the student's actual evidence

These are not claimed as completed:

- [ ] Run the prepared AI Studio prompt and review required versus optional prop fields; save the actual response.
- [ ] Obtain the ChatGPT semantics critique and Gemini accessibility critique, then record actual accepted/rejected recommendations.
- [ ] Manually traverse the entire page with only Tab, Shift+Tab, Enter, and Space. Record browser/device, paths, success/failure, and any corrections. Do not treat automated keyboard automation as this personal walkthrough.
- [ ] Run Lighthouse accessibility (or the instructor-approved audit), save the actual score and issue list, and rerun after corrections.
- [ ] Ask a partner to identify one strength, one risk, and one tested recommendation. Record their real feedback and test.
- [ ] Open a pull request after the feature branch is published and include the actual peer feedback; do not merge until the partner/instructor review is complete.

## Test evidence from this implementation session

- `npm test`: passed, 13 tests.
- `npm run lint`: passed.
- `npm run typecheck`: passed.
- `npm run build`: passed.
- The last local Supabase reset and `supabase test db` run reported all 36 pgTAP assertions passing after the three-property seed update. The CLI/test runner was unavailable for a fresh rerun during final validation; no database or seed files have changed since that passing run.
- Local API check: `/api/properties` returned 3 approved fictional listings and `/api/sponsors` returned 2 fictional sponsors. The hydrated homepage displayed all three property cards, the service section, and both sponsor banners.
- Automated keyboard sequence passed: Listing type, Minimum bedrooms, Maximum price, Apply filters, Clear filters, all 3 property details buttons, the service request button, both sponsor links, then the injected Next.js Dev Tools control. Enter submitted filters; Space reset them and expanded the first property's details; focus remained visible. Sponsor links were not activated. The injected development-tools focus stop is tooling, not page content.
- Manual keyboard walkthrough remains the student's activity. Automated keyboard evidence is not a substitute.
- Lighthouse accessibility score and issue list remain pending; record the actual score/findings and rerun after corrections.
