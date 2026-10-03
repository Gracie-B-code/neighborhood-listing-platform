import { z } from 'zod';

export const AddressSchema = z.object({
  street: z.string().min(1, 'Street is required'),
  city: z.string().min(1, 'City is required'),
  state: z.string().length(2, 'State must be a 2-letter abbreviation'),
});

export const AmenitySchema = z.enum([
  'PARKING',
  'LAUNDRY',
  'PETS_ALLOWED',
  'POOL',
  'GYM',
  'AIR_CONDITIONING',
  'BALCONY',
]);

export const BusinessTypeSchema = z.enum([
  'CAFE',
  'RESTAURANT',
  'GROCERY',
  'GYM',
  'SERVICES',
  'OTHER',
]);

export const SponsorSchema = z.object({
  sponsor_id: z.string().min(1),
  name: z.string().min(1),
  business_type: BusinessTypeSchema,
  website_url: z.string().url().optional(),
});

export const PropertySchema = z.object({
  property_id: z.string().min(1, 'Property ID is required'),
  title: z.string().min(1, 'Title is required'),
  price: z.number().positive('Price must be greater than 0'),
  bedrooms: z.number().int().nonnegative(),
  bathrooms: z.number().positive(),
  square_feet: z.number().positive(),
  address: AddressSchema,
  zip_code: z.string().regex(/^\d{5}$/, 'ZIP code must be exactly 5 digits'),
  amenities: z.array(AmenitySchema).default([]),
  local_sponsors: z.array(SponsorSchema).optional(),
});

export type Property = z.infer<typeof PropertySchema>;
export type Sponsor = z.infer<typeof SponsorSchema>;
export type Address = z.infer<typeof AddressSchema>;
export type Amenity = z.infer<typeof AmenitySchema>;
export type BusinessType = z.infer<typeof BusinessTypeSchema>;
