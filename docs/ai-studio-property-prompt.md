# Lab 3: AI Studio structured-output experiment

**Status:** Prepared prompt only. No AI Studio response or screenshot has been supplied or generated in this repository.

## Fictional source notes

Use only these invented examples; they do not describe real property, people, or stakeholder findings:

- Fictional record A: a three-bedroom home at 100 Example Lane, Sampleton, CA 90001; amount 480000 USD for purchase; 1450 square feet; parking and laundry; associated fictional sponsor “Fictional Oak Market.”
- Fictional record B: a two-bedroom rental at 22 Demo Street, Unit 4, Sampleton, CA 90002-1234; amount 2100 USD per month; 980 square feet; air conditioning and pets allowed; no sponsor.
- Fictional record C: a studio at 3 Placeholder Court, Fictional Bay, OR 97035; amount 0 USD, basis other; 420 square feet; pool; associated fictional sponsor “Imaginary Garden Co-op.”
- Fictional record D: a two-bedroom rental at 400 Model Avenue, Fictional Bay, OR 97036; amount 1750 USD per month; 860 square feet; balcony and dishwasher; no sponsor.
- Fictional record E: a four-bedroom home at 55 Mockingbird Way, Example Heights, WA 98001; amount 725000 USD for purchase; 2200 square feet; gym and yard; two fictional sponsors.

## Prompt to run in Google AI Studio

> Return exactly five fictional property records as valid JSON only, with no Markdown fences or commentary. Follow the strict property contract shown below. Do not invent personal data, real listings, or claims that a sponsor is verified. Keep `price` as the supplied numeric amount and preserve the explicit `price_basis`; never infer rent versus purchase. Use only these amenity values: `air_conditioning`, `balcony`, `dishwasher`, `gym`, `laundry`, `parking`, `pets_allowed`, `pool`, `yard`. Use ZIP or ZIP+4 format and a two-letter uppercase state. Each record must have a unique UUID `property_id`; each `local_sponsors` entry must have a UUID `sponsor_id` and a fictional `name`. Include every required field: `property_id`, `street_address`, `city`, `state`, `zip_code`, `price`, `price_basis`, `currency`, `bedrooms`, `bathrooms`, `square_feet`, `amenities`, and `local_sponsors`. `price_basis` must be one of `purchase`, `monthly_rent`, `weekly_rent`, `daily_rent`, `other`. Do not add any fields. Use the five fictional source notes above and do not claim the output is factual.

## Student evidence to add after running

1. Save the unedited model response separately under `data/generated/` and label it as actual AI Studio output with model and date. Do not overwrite `synthetic-property-examples.json`.
2. Run `npm test` and record each validation failure before making a correction.
3. For each correction, identify whether the prompt, contract, or generated output changed; retain the raw response unchanged.
4. Save the requested screenshot outside source control or in the instructor-approved evidence location. No screenshot is included yet.
