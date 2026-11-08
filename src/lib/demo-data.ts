import type { PropertyRecord } from "@/lib/properties/schema";
import type { ServiceRecord } from "@/schemas/service";
import type { Sponsor } from "@/types";

export const demoProperties: PropertyRecord[] = [
  {
    property_id: "11111111-1111-4111-8111-111111111111",
    street_address: "100 Example Lane",
    city: "Sampleton",
    state: "CA",
    zip_code: "90001",
    price: 480000,
    price_basis: "purchase",
    currency: "USD",
    bedrooms: 3,
    bathrooms: 2,
    square_feet: 1450,
    amenities: ["parking", "laundry"],
    local_sponsors: [{
      sponsor_id: "aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa",
      name: "Fictional Oak Market",
    }],
  },
  {
    property_id: "44444444-4444-4444-8444-444444444444",
    street_address: "400 Model Avenue",
    city: "Fictional Bay",
    state: "OR",
    zip_code: "97036",
    price: 1750,
    price_basis: "monthly_rent",
    currency: "USD",
    bedrooms: 2,
    bathrooms: 1,
    square_feet: 860,
    amenities: ["balcony", "dishwasher"],
    local_sponsors: [],
  },
  {
    property_id: "55555555-5555-4555-8555-555555555555",
    street_address: "55 Mockingbird Way",
    city: "Example Heights",
    state: "WA",
    zip_code: "98001",
    price: 725000,
    price_basis: "purchase",
    currency: "USD",
    bedrooms: 4,
    bathrooms: 3,
    square_feet: 2200,
    amenities: ["gym", "yard"],
    local_sponsors: [],
  },
];

export const demoServices: ServiceRecord[] = [
  {
    id: "dddddddd-dddd-4ddd-8ddd-dddddddddddd",
    title: "Fictional home repair",
    description: "Synthetic approved service used for local API and authorization tests.",
    category: "home_repair",
    city: "Sampleton",
    state: "CA",
    zip_code: "90001",
    rate_amount: 75,
    currency: "USD",
    rate_unit: "hour",
    duration_minutes: 60,
    coverage_radius_miles: 15,
    created_at: "2026-11-07T20:28:54.656231+00:00",
  },
];

export const demoSponsors: Sponsor[] = [
  {
    sponsor_id: "aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa",
    name: "Fictional Oak Market",
    category: "Grocery",
    website_url: "https://oak-market.example.invalid",
    claims: ["Synthetic sponsor example"],
  },
  {
    sponsor_id: "bbbbbbbb-bbbb-4bbb-8bbb-bbbbbbbbbbbb",
    name: "Imaginary Garden Co-op",
    category: "Community",
    website_url: "https://garden-coop.example.invalid",
    claims: ["Synthetic sponsor example"],
  },
];
