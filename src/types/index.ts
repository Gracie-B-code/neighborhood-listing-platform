export type { Property, Sponsor, Address, Amenity, BusinessType } from "@/lib/schemas/property";

export interface FilterState {
  searchQuery: string;
  minPrice: number;
  propertyType: string;
}
