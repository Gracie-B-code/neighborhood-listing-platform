import { describe, it, expect } from 'vitest';
import { PropertySchema } from './property';

describe('PropertySchema Validation', () => {
  const validPropertyData = {
    property_id: 'prop-101',
    title: 'Modern Sunset Apartment',
    price: 2500,
    bedrooms: 2,
    bathrooms: 1.5,
    square_feet: 950,
    address: {
      street: '123 Sunset Blvd',
      city: 'Los Angeles',
      state: 'CA',
    },
    zip_code: '90028',
    amenities: ['PARKING', 'LAUNDRY'],
    local_sponsors: [
      {
        sponsor_id: 'spons-1',
        name: 'Sunset Coffee',
        business_type: 'CAFE',
        website_url: 'https://sunsetcoffee.example.com',
      },
    ],
  };

  it('should successfully validate a complete, valid property record', () => {
    const result = PropertySchema.safeParse(validPropertyData);
    expect(result.success).toBe(true);
  });

  it('should fail validation when property_id is missing', () => {
    const { property_id, ...dataWithoutId } = validPropertyData;
    const result = PropertySchema.safeParse(dataWithoutId);
    
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.issues.some((issue) => issue.path.includes('property_id'))).toBe(true);
    }
  });

  it('should fail validation when price is negative', () => {
    const invalidData = {
      ...validPropertyData,
      price: -1200,
    };
    const result = PropertySchema.safeParse(invalidData);

    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.issues.some((issue) => issue.path.includes('price'))).toBe(true);
    }
  });

  it('should fail validation when zip_code format is invalid', () => {
    const invalidData = {
      ...validPropertyData,
      zip_code: '9002',
    };
    const result = PropertySchema.safeParse(invalidData);

    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.issues.some((issue) => issue.path.includes('zip_code'))).toBe(true);
    }
  });

  it('should reject unrecognized extra fields when using strict parsing', () => {
    const invalidData = {
      ...validPropertyData,
      unknown_field: 'unauthorized_extra_value',
    };
    const result = PropertySchema.strict().safeParse(invalidData);

    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.issues.some((issue) => issue.code === 'unrecognized_keys')).toBe(true);
    }
  });
});
