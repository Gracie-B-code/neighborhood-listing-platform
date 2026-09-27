'use client';

import { Property, Sponsor } from '@/types';
import { PropertyCard } from '@/components/PropertyCard';
import { SponsorBanner } from '@/components/SponsorBanner';
import { SearchFilters } from '@/components/SearchFilter';

const sampleSponsor: Sponsor = {
  id: 'sponsor-1',
  name: 'Oakwood Community Bank',
  tagline: 'Supporting local housing and community growth.',
  websiteUrl: 'https://example.com/oakwood',
};

const sampleProperties: Property[] = [
  {
    id: 'prop-101',
    title: 'Sunny Oakwood Apartment',
    address: '124 Maple Street, Oakwood',
    price: 1850,
    bedrooms: 2,
    bathrooms: 1,
    squareFeet: 850,
    imageUrl: 'https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?w=500',
    imageAlt: 'Living room of a modern two-bedroom apartment with wood floors',
  },
  {
    id: 'prop-102',
    title: 'Spacious Family Home',
    address: '458 Birch Lane, Oakwood',
    price: 3200,
    bedrooms: 4,
    bathrooms: 2.5,
    squareFeet: 2100,
    imageUrl: 'https://images.unsplash.com/photo-1568605117036-5fe5e7bab0b7?w=500',
    imageAlt: 'Two-story brick house with a green lawn and front yard',
  },
  {
    id: 'prop-103',
    title: 'Downtown Studio Condo',
    address: '89 Main Street, Apt 4B',
    price: 1400,
    bedrooms: 1,
    bathrooms: 1,
    squareFeet: 550,
    imageUrl: 'https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?w=500',
    imageAlt: 'Compact studio apartment featuring large windows and modern lighting',
  },
];

export default function Home() {
  return (
    <main className="max-w-7xl mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-6">Neighborhood Listings</h1>

      <SearchFilters onFilterSubmit={(filters) => console.log(filters)} />

      <SponsorBanner sponsor={sampleSponsor} />

      {/* Responsive Grid: 1 col on small, 2 on medium, 3 on large */}
      <section aria-labelledby="listings-heading">
        <h2 id="listings-heading" className="text-2xl font-semibold mb-4">
          Available Properties
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {sampleProperties.map((property) => (
            <PropertyCard key={property.id} property={property} />
          ))}
        </div>
      </section>
    </main>
  );
}