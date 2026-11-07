import type { PropertyRecord } from "@/lib/properties/schema";
import type { PropertySearchFilters } from "@/types";

export function filterProperties(
  properties: readonly PropertyRecord[],
  filters: PropertySearchFilters,
) {
  return properties.filter((property) => (
    (filters.priceBasis === "all" || property.price_basis === filters.priceBasis)
    && (filters.minBedrooms === "" || property.bedrooms >= filters.minBedrooms)
    && (filters.maxPrice === "" || property.price <= filters.maxPrice)
  ));
}
