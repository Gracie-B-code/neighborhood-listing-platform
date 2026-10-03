import { describe, it, expect } from 'vitest';
import { PropertySchema } from './property';

describe('PropertySchema Validation', () => {
  const validProperty = {
    property_id: 'prop-101',
    title: 'Modern Downtown Apartment',
    description: 'Spacious 2-bedroom apartment in the city center.',
    price: 2500,
    address: {
      street: '123 Main St',
      city: 'Los Angeles',
      state: 'CA',
      zip_code: '90012',
    },
    amenities: [{ id: 'a1', name: 'Parking' }],
  };

  it('validates a valid property record', () => {
    const result = PropertySchema.safeParse(validProperty);
    expect(result.success).toBe(true);
  });

  it('fails when property_id is missing', () => {
    const { property_id, ...invalid } = validProperty;
    const result = PropertySchema.safeParse(invalid);
    expect(result.success).toBe(false);
  });

  it('fails when price is negative', () => {
    const invalid = { ...validProperty, price: -500 };
    const result = PropertySchema.safeParse(invalid);
    expect(result.success).toBe(false);
  });

  it('fails when zip_code format is invalid', () => {
    const invalid = {
      ...validProperty,
      address: { ...validProperty.address, zip_code: 'INVALID' },
    };
    const result = PropertySchema.safeParse(invalid);
    expect(result.success).toBe(false);
  });

  it('fails when unknown extra fields are passed', () => {
    const invalid = { ...validProperty, extraField: 'not_allowed' };
    const result = PropertySchema.safeParse(invalid);
    expect(result.success).toBe(false);
  });
});
