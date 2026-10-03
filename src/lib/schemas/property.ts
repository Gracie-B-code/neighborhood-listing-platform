import { z } from 'zod';

export const AddressSchema = z.object({
  street: z.string().min(1),
  city: z.string().min(1),
  state: z.string().length(2),
  zip_code: z.string().regex(/^\d{5}(-\d{4})?$/),
});

export const AmenitySchema = z.object({
  id: z.string(),
  name: z.string(),
});

export const SponsorSchema = z.object({
  id: z.string(),
  name: z.string(),
  business_type: z.enum(['Local Business', 'Corporate', 'Non-Profit']),
});

export const PropertySchema = z.object({
  property_id: z.string().min(1),
  title: z.string().min(1),
  description: z.string(),
  price: z.number().positive(),
  address: AddressSchema,
  amenities: z.array(AmenitySchema),
  sponsor: SponsorSchema.optional(),
}).strict();

export type Property = z.infer<typeof PropertySchema>;
export type Address = z.infer<typeof AddressSchema>;
export type Amenity = z.infer<typeof AmenitySchema>;
export type Sponsor = z.infer<typeof SponsorSchema>;
