import { z } from "zod";

export const AmenitySchema = z.enum([
  "air_conditioning",
  "balcony",
  "dishwasher",
  "gym",
  "laundry",
  "parking",
  "pets_allowed",
  "pool",
  "yard",
]);

export const PriceBasisSchema = z.enum([
  "purchase",
  "monthly_rent",
  "weekly_rent",
  "daily_rent",
  "other",
]);

const PropertyFields = {
  street_address: z.string().trim().min(1).max(160),
  address_line_2: z.string().trim().max(80).optional(),
  city: z.string().trim().min(1).max(80),
  state: z.string().regex(/^[A-Z]{2}$/, "Use a two-letter state code"),
  zip_code: z.string().regex(/^\d{5}(?:-\d{4})?$/, "Use ZIP or ZIP+4 format"),
  price: z.number().finite().min(0).max(100_000_000),
  price_basis: PriceBasisSchema,
  currency: z.string().regex(/^[A-Z]{3}$/, "Use a three-letter currency code"),
  bedrooms: z.number().finite().int().min(0).max(100),
  bathrooms: z.number().finite().min(0).max(100).multipleOf(0.5),
  square_feet: z.number().finite().int().min(0).max(1_000_000),
  amenities: z.array(AmenitySchema).max(30).refine(
    (amenities) => new Set(amenities).size === amenities.length,
    "Amenities must be unique",
  ),
};

export const SponsorReferenceSchema = z.object({
  sponsor_id: z.string().uuid(),
  name: z.string().trim().min(1).max(120),
}).strict();

export const PropertyRecordSchema = z.object({
  property_id: z.string().uuid(),
  ...PropertyFields,
  local_sponsors: z.array(SponsorReferenceSchema).max(20),
}).strict();

export const PropertyRecordListSchema = z.array(PropertyRecordSchema).max(500);

export const SponsorRecordSchema = z.object({
  sponsor_id: z.string().uuid(),
  name: z.string().trim().min(1).max(120),
  category: z.string().trim().min(1).max(80),
  website_url: z.string().url().max(2048).nullable(),
  claims: z.array(z.string().trim().min(1).max(500)).max(20),
}).strict();

export const CreatePropertyInputSchema = z.object({
  ...PropertyFields,
  local_sponsors: z.array(z.string().uuid()).max(20).refine(
    (sponsors) => new Set(sponsors).size === sponsors.length,
    "Sponsor IDs must be unique",
  ).default([]),
}).strict();

export const PropertyReviewInputSchema = z.object({
  decision: z.enum(["approve", "reject"]),
  reason: z.string().trim().max(500).optional(),
}).strict().superRefine((value, context) => {
  if (value.decision === "reject" && !value.reason) {
    context.addIssue({
      code: "custom",
      path: ["reason"],
      message: "A reason is required when returning a property",
    });
  }
});

export type PropertyRecord = z.infer<typeof PropertyRecordSchema>;
export type CreatePropertyInput = z.infer<typeof CreatePropertyInputSchema>;
