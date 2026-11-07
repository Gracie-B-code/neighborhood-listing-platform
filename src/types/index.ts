import type {
  PropertyRecordSchema,
  SponsorRecordSchema,
} from "@/lib/properties/schema";
import type { z } from "zod";

export type Property = z.infer<typeof PropertyRecordSchema>;
export type Sponsor = z.infer<typeof SponsorRecordSchema>;

export type PropertySearchFilters = {
  priceBasis: Property["price_basis"] | "all";
  minBedrooms: number | "";
  maxPrice: number | "";
};
