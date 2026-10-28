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