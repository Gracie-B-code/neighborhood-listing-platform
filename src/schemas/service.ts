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
  title: z.string().trim().min(5).max(120),
  description: z.string().trim().min(10).max(2000),
  category: ServiceCategorySchema,
  city: z.string().trim().min(1).max(80),
  state: z.string().regex(/^[A-Z]{2}$/, "Use a two-letter state code"),
  zip_code: z.string().regex(/^\d{5}(?:-\d{4})?$/, "Use ZIP or ZIP+4 format"),
  rate_amount: z.number().finite().min(0).max(1_000_000).nullable(),
  currency: z.string().regex(/^[A-Z]{3}$/, "Use a three-letter currency code"),
  rate_unit: ServiceRateUnitSchema,
  duration_minutes: z.number().int().min(15).max(1440),
  coverage_radius_miles: z.number().int().positive().max(500),
};

export const ServiceRecordSchema = z.object({
  id: z.string().uuid(),
  ...ServiceFields,
  created_at: z.iso.datetime({ offset: true }),
}).strict();

export const ServiceRecordListSchema = z.array(ServiceRecordSchema).max(500);

export const CreateServiceInputSchema = z.object(ServiceFields).strict();

export const CreateServiceBookingInputSchema = z.object({
  service_id: z.string().uuid(),
}).strict();

export const ServiceBookingRecordSchema = z.object({
  id: z.string().uuid(),
  service_id: z.string().uuid(),
  status: z.enum(["requested", "accepted", "declined", "cancelled"]),
  requested_at: z.iso.datetime({ offset: true }),
  created_at: z.iso.datetime({ offset: true }),
}).strict();

export type ServiceRecord = z.infer<typeof ServiceRecordSchema>;
export type CreateServiceInput = z.infer<typeof CreateServiceInputSchema>;
export type ServiceBookingRecord = z.infer<typeof ServiceBookingRecordSchema>;
