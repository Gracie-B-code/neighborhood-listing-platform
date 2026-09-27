'use client';

import { useState } from 'react';
import { FilterState } from '@/types';

interface SearchFiltersProps {
  onFilterSubmit: (filters: FilterState) => void;
}

export const SearchFilters = ({ onFilterSubmit }: SearchFiltersProps) => {
  const [query, setQuery] = useState('');
  const [minPrice, setMinPrice] = useState('0');
  const [propertyType, setPropertyType] = useState('all');
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (query.length > 0 && query.length < 2) {
      setError('Search term must be at least 2 characters long.');
      return;
    }
    setError(null);
    
    // Parse minPrice from string to number here
    onFilterSubmit({ 
      searchQuery: query, 
      minPrice: Number(minPrice), 
      propertyType 
    });
  };

  return (
    <form onSubmit={handleSubmit} role="search" className="bg-gray-50 p-4 rounded-lg border mb-6">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
        {/* Search Input */}
        <div>
          <label htmlFor="search-input" className="block text-sm font-medium text-gray-700 mb-1">
            Search Neighborhood
          </label>
          <input
            id="search-input"
            type="search"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="w-full px-3 py-2 border rounded-md focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-600"
            aria-describedby={error ? 'search-error' : undefined}
            aria-invalid={!!error}
          />
        </div>

        {/* Min Price Select */}
        <div>
          <label htmlFor="price-select" className="block text-sm font-medium text-gray-700 mb-1">
            Minimum Rent
          </label>
          <select
            id="price-select"
            value={minPrice}
            onChange={(e) => setMinPrice(e.target.value)}
            className="w-full px-3 py-2 border rounded-md focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-600"
          >
            <option value="0">Any Price</option>
            <option value="1000">$1,000 / month</option>
            <option value="2000">$2,000 / month</option>
            <option value="3000">$3,000 / month</option>
          </select>
        </div>

        {/* Property Type Select */}
        <div>
          <label htmlFor="type-select" className="block text-sm font-medium text-gray-700 mb-1">
            Property Type
          </label>
          <select
            id="type-select"
            value={propertyType}
            onChange={(e) => setPropertyType(e.target.value)}
            className="w-full px-3 py-2 border rounded-md focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-600"
          >
            <option value="all">All Types</option>
            <option value="apartment">Apartment</option>
            <option value="house">House</option>
            <option value="condo">Condo</option>
          </select>
        </div>
      </div>

      {/* Error Messaging */}
      {error && (
        <p id="search-error" className="text-sm text-red-600 font-medium mb-3" role="alert">
          {error}
        </p>
      )}

      <button
        type="submit"
        className="px-6 py-2 bg-blue-600 text-white font-medium rounded hover:bg-blue-700 focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-blue-600"
      >
        Apply Filters
      </button>
    </form>
  );
};