# AI Development Log

## Stack Comparison Note
- **Difference 1 (Architecture & Rendering):** ChatGPT focused on server-side component streaming and Server Actions for data mutations, whereas Gemini emphasized initial page speed, local SEO benefits, and automatic Vercel deployment routes. Simple explanation no metaphors but did give a code as an example of how the three languages work together. 
- **Difference 2 (Developer Experience):** ChatGPT highlighted TypeScript's compile-time data validation and interface safety, while Gemini focused heavily on Tailwind CSS for rapid responsive design and built-in accessibility semantics. Gave metaphors and examples to help understand how each language work together and what their roles are in building websites. As well as asked follow up questions for the user.

---

## Log Entries

| Tool | Prompt | Output Used | Output Rejected | Verification | Commit |
| :--- | :--- | :--- | :--- | :--- | :--- |
| **ChatGPT** | "Explain the proposed stack in plain language for a neighborhood platform." | Architectural summary of React Server Components vs Client Components. | Excessive boilerplate code snippets for custom backend APIs. | Cross-referenced Next.js documentation on App Router defaults. | `docs: add initial ai comparison log` |
| **Gemini** | "Explain the proposed stack in plain language for a neighborhood platform." | High-level summary of Tailwind CSS utility classes and TypeScript props interface structure. | Suggestions to use custom CSS modules alongside Tailwind. | Verified utility class availability in Tailwind configuration. | `docs: add initial ai comparison log` |
| **Google AI Studio** | *App Shell Architect Prompt:* "Provide scaffolding commands and a clean file plan for Next.js + TS + Tailwind with zero secrets." | Recommended `npx create-next-app@latest` flags and file tree plan. | Direct full-file React code block dumps. | Ran `npm run lint` and `npm run build` locally to confirm scaffold integrity. | `setup: scaffold app shell structure` |

# AI Development Log - Neighborhood Listing Platform

| Tool | Prompt Summary | Output Used | Output Rejected | Verification | Commit |
| :--- | :--- | :--- | :--- | :--- | :--- |
| **ChatGPT & Gemini** | Explain Next.js App Router vs Pages Router and Tailwind CSS for plain-language comparison. | Plain language breakdown of server/client components and utility-first styling. | Overly complex microservices architecture proposals. | Verified local conceptual understanding against project requirements. | `(Initial setup)` |
| **Google AI Studio** ("App Shell Architect") | Scaffold file structure and initial React/Tailwind app shell with accessible cards for listings, sponsors, and voice help. | Semantic HTML structure (`<main>`, `<section>`, `<article>`), Tailwind grid layout, and accessible headings. | Non-semantic `<div>` soup without ARIA labeling or responsive grid rules. | `npm run lint` and `npm run build` passed with zero errors. | `feat: initialize Next.js app shell with feature cards and AI log` |

---

## Current Lab 3–5 implementation session

The earlier entries above are preserved as historical project records and were not independently verified during this session.

| Tool/model | Prompt summary | Output used | Output rejected or pending | Verification | Commit |
| :--- | :--- | :--- | :--- | :--- | :--- |
| Copilot SDK in VS Code (model identity not surfaced) | Audit the current repository against the supplied Labs 3–5 requirements, preserve prior work and attribution, implement missing local work, and do not invent external evidence. | Reused the existing Lab 3–5 implementation on this repository's `origin/exam/services-booking-eval` branch; corrected the optional `address_line_2` mismatch between the Zod create input and database RPC, and added regression checks. | No other repository was used. No AI Studio, Gemini, participant, partner, or instructor output is claimed; those activities remain pending. | `npm test` passed (6 tests); `npm run lint`, `npm run typecheck`, and `npm run build` passed. Docker Desktop was installed per-user from Docker's signed official installer. Local `supabase db reset` succeeded; `supabase test db` passed all 16 tests. With local configuration, `GET /api/properties` returned HTTP 200 and one approved synthetic record; the home page returned HTTP 200. The earlier unconfigured 503 check was a separate run. | None; changes remain uncommitted on `feature/database`. |

### Separate exam Services/Bookings slice

| Tool/model | Prompt summary | Output used | Output rejected or pending | Verification | Commit |
| :--- | :--- | :--- | :--- | :--- | :--- |
| Copilot SDK in VS Code (model identity not surfaced) | Ensure the explicitly listed Services migration, RLS audit, Zod API, and accessible card slice are present without replacing the Properties/Sponsors Labs 3–5 work. | Added an isolated services schema, migration, seed fixtures, API, card/grid component, role matrix, and regression tests. | No student, partner, instructor, Gemini, or AI Studio evidence is claimed. | `npm test`: 10 passed; `npm run lint`, `npm run typecheck`, and `npm run build` passed. Local database reset succeeded; both RLS files passed (36 assertions total, including 20 service assertions). `GET /api/services`: 200 with one approved fixture; invalid POST: 400; anonymous POST: 401; authenticated synthetic provider POST: 201 pending. The temporary local test identity and record were deleted. | None; these new changes remain uncommitted. |

| Copilot SDK in VS Code (model identity not surfaced) | Fix local listings by connecting the existing service cards to the local services API without replacing property listings. | Added the home-page Local services section, client-side loading/empty/error UI, and authenticated booking requests through a user-scoped route. | No visual/browser screenshot is claimed; the browser page was not shared for inspection. | `GET /api/services`: 200 with one approved record; authenticated client booking request: 201 requested; temporary client and booking deleted. `npm test` (10 tests), lint, typecheck, and production build passed. Existing pgTAP suite passed 36 assertions in the services-slice run. | None; changes remain uncommitted. |

### Exam services requirements and verification journal

The following journal uses the required provenance fields. External AI
critiques are not claimed because they were not performed.

| Step / Tool | Prompt Summary | Model Output Used | Model Output Rejected & Rationale | Verification Method | Associated Git Commit |
| :--- | :--- | :--- | :--- | :--- | :--- |
| Copilot SDK in VS Code | Check the supplied services/booking specification against the current branch; preserve the service-specific role model and authenticated booking security where the rubric conflicts with the existing property schema. | Added duration and coverage fields, draft submissions, stricter booking-read privacy, UI details/accessibility improvements, and requirements traceability. | Did not replace `public.profiles`, allow anonymous bookings, or claim district/active-zone and admin HTTP moderation features that are not present. | Local Supabase reset and 46 pgTAP assertions passed; 17 unit tests, lint, typecheck, and production build passed. Browser keyboard checks used Tab traversal, Shift+Tab, Enter, and Space on the service CTA; unauthenticated requests announced the expected sign-in error. Gemini/ChatGPT reviews were not performed. | This commit |

### Lab 4 discovery follow-up

| Tool/model | Prompt summary | Output used | Output rejected or pending | Verification | Commit |
|---|---|---|---|---|---|
| Copilot SDK in VS Code (model identity not surfaced) | Turn the user-provided instructor-approved café-owner simulation into one traceable story and GitHub issue without presenting it as real outreach. | Updated the discovery package with SIM-03 and candidate story B-01; created issue [#4](https://github.com/Gracie-B-code/neighborhood-listing-platform/issues/4) with two Gherkin scenarios, branch link, `enhancement` label, Lab 4 — Week 8 MVP milestone, and assignee `Gracie-B-code`. Created [Lab 4 Board](https://github.com/users/Gracie-B-code/projects/3/views/2) with the five requested statuses and added issues #3 and #4. | No real realtor/café-owner interview, exact quote, Gemini critique, or AI Studio theme output is claimed. The board remains private; team access has not been granted. | Verified issue #4 metadata and contents through GitHub; verified board column order and its two issue items in the project UI. | Pending |

---

## Stakeholder Discovery Package (2026-11-02)

See [discovery-package.md](./discovery-package.md). The package is a planning draft based on the project brief and current landing-page copy; no stakeholder interview, outreach, or approval is claimed.

| Tool | Prompt | Output used | Output rejected / pending | Verification | Commit |
| :--- | :--- | :--- | :--- | :--- | :--- |
| **ChatGPT** | “Using only the project description and repository facts provided, draft neutral discovery questions for property professionals and local sponsors. Separate known facts from assumptions. Do not invent interview findings; identify what needs stakeholder confirmation.” | Neutral question topics and separation of interface copy from verified evidence. | Unsupported claims about stakeholder needs, implemented features, and success metrics. | Compared against the assignment topics and repository landing-page copy; no interview evidence was supplied. | Pending |
| **Gemini** | “Review this de-identified discovery guide for leading, double-barreled, or privacy-invasive questions. Suggest neutral alternatives. Do not infer stakeholder preferences.” | Pending; review has not been run. | No output claimed. | Pending. | Pending |
| **Google AI Studio** | “Convert these de-identified interview notes into themes, uncertainties, and candidate requirements. Quote no more than necessary. Mark every inference as an inference and list questions that require stakeholder confirmation.” | Pending; no source notes exist yet. | No output claimed. | Pending notes and line-by-line comparison. | Pending |