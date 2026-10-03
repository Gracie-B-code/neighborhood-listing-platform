import { Property, PropertySchema } from "@/lib/schemas/property";

export const MOCK_PROPERTIES: Property[] = [
  {
    property_id: "prop-arts-01",
    title: "Arts District Industrial Loft",
    address: {
      street: "740 E 3rd St",
      city: "Los Angeles",
      state: "CA",
    },
    zip_code: "90013",
    price: 3450,
    bedrooms: 1,
    bathrooms: 1.5,
    square_feet: 1100,
    amenities: ["In-Unit Laundry", "Central AC", "Pet Friendly", "Parking Spot"],
    local_sponsors: [
      {
        sponsor_id: "sp-dailyroast",
        name: "Daily Roast Coffee",
        business_type: "Coffee Shop",
        website_url: "https://dailyroast.example.com",
      },
    ],
  },
  {
    property_id: "prop-dtla-02",
    title: "Skyline Tower Luxury Suite",
    address: {
      street: "888 S Hope St",
      city: "Los Angeles",
      state: "CA",
    },
    zip_code: "90017",
    price: 4200,
    bedrooms: 2,
    bathrooms: 2.0,
    square_feet: 1350,
    amenities: ["Pool", "Fitness Center", "EV Charging", "Balcony"],
    local_sponsors: [
      {
        sponsor_id: "sp-metrofit",
        name: "MetroFit DTLA",
        business_type: "Gym / Fitness",
        website_url: "https://metrofit.example.com",
      },
    ],
  },
];

// Helper function to safely parse and validate listings at runtime
export function getValidatedProperties(): Property[] {
  return MOCK_PROPERTIES.map((property, index) => {
    const result = PropertySchema.safeParse(property);
    if (!result.success) {
      console.error(`Validation failed for property index ${index}:`, result.error.format());
      throw new Error(`Invalid mock property data at index ${index}`);
    }
    return result.data;
  });
}