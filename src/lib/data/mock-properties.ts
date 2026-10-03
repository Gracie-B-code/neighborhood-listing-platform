import { Property, PropertySchema } from '@/lib/schemas/property';

export const mockPropertiesData = [
  {
    property_id: 'prop-1',
    title: 'Modern Downtown Loft',
    price: 2800,
    bedrooms: 2,
    bathrooms: 2,
    square_feet: 1100,
    address: {
      street: '456 Grand Ave',
      city: 'Los Angeles',
      state: 'CA',
    },
    zip_code: '90012',
    amenities: ['PARKING', 'AIR_CONDITIONING', 'GYM'],
    local_sponsors: [
      {
        sponsor_id: 'spons-1',
        name: 'Daily Grind Cafe',
        business_type: 'CAFE',
        website_url: 'https://example.com/dailygrind',
      },
    ],
  },
  {
    property_id: 'prop-2',
    title: 'Cozy Oakwood Apartment',
    price: 1950,
    bedrooms: 1,
    bathrooms: 1,
    square_feet: 750,
    address: {
      street: '789 Oakwood Dr',
      city: 'Los Angeles',
      state: 'CA',
    },
    zip_code: '90028',
    amenities: ['PETS_ALLOWED', 'LAUNDRY'],
  },
];

export function getValidatedProperties(): Property[] {
  return mockPropertiesData.map((data) => PropertySchema.parse(data));
}
