export interface Property {
  id: string;
  title: string;
  address: string;
  price: number;
  bedrooms: number;
  bathrooms: number;
  squareFeet: number;
  imageUrl: string;
  imageAlt: string;
}

export interface Sponsor {
  id: string;
  name: string;
  tagline: string;
  websiteUrl: string;
}

export interface FilterState {
  searchQuery?: string;
  minPrice?: number;
  maxPrice?: number;
  bedrooms?: number;
  propertyType?: string;
}