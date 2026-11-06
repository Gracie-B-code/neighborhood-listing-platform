import { z } from "zod";

export const ServiceCategorySchema = z.enum([
  "cleaning",
  "home_repair",
  "landscaping",
  "pet_care",
  "tutoring",
  "other",
]);

export const ServiceRateUnitSchema = z.enum([
  "hour",
  "visit",
  "project",
  "day",
]);

const ServiceFields = {
  title: z.string().trim().min(3).max(120),
  description: z.string().trim().min(10).max(2000),
  category: ServiceCategorySchema,
  city: z.string().trim().min(1).max(80),
  state: z.string().regex(/^[A-Z]{2}$/, "Use a two-letter state code"),
  zip_code: z.string().regex(/^\d{5}(?:-\d{4})?$/, "Use ZIP or ZIP+4 format"),
  rate_amount: z.number().finite().min(0).max(1_000_000).nullable(),
  currency: z.string().regex(/^[A-Z]{3}$/, "Use a three-letter currency code"),
  rate_unit: ServiceRateUnitSchema,
};

export const ServiceRecordSchema = z.object({
  id: z.string().uuid(),
  ...ServiceFields,
  created_at: z.iso.datetime({ offset: true }),
}).strict();

export const ServiceRecordListSchema = z.array(ServiceRecordSchema).max(500);

export const CreateServiceInputSchema = z.object(ServiceFields).strict();

export type ServiceRecord = z.infer<typeof ServiceRecordSchema>;
export type CreateServiceInput = z.infer<typeof CreateServiceInputSchema>;
