import Image from 'next/image';
import Link from 'next/link';
import { Property } from '@/types';

interface PropertyCardProps {
  property: Property;
}

export const PropertyCard = ({ property }: PropertyCardProps) => {
  return (
    <article className="relative flex flex-col border rounded-lg overflow-hidden shadow-sm hover:shadow-md bg-white transition-shadow focus-within:ring-2 focus-within:ring-blue-600 focus-within:ring-offset-2">
      {/* Image Container */}
      <div className="relative h-48 w-full bg-gray-100">
        <Image
          src={property.imageUrl}
          alt={property.imageAlt}
          fill
          className="object-cover"
          sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
        />
      </div>

      {/* Card Content */}
      <div className="p-4 flex flex-col flex-1">
        <h3 className="text-xl font-bold text-gray-900 mb-1">
          {/* Single primary link stretching over the whole card via after:inset-0 */}
          <Link
            href={`/properties/${property.id}`}
            className="focus:outline-none after:absolute after:inset-0"
            aria-label={`View details for ${property.title} at ${property.address}`}
          >
            {property.title}
          </Link>
        </h3>

        <address className="not-italic text-sm text-gray-600 mb-3">
          {property.address}
        </address>

        <p className="text-lg font-bold text-green-700 mb-4">
          ${property.price.toLocaleString()}/mo
        </p>

        {/* Property Specs List */}
        <ul className="flex gap-4 text-xs text-gray-600 mb-4 border-t pt-3 mt-auto">
          <li><strong>{property.bedrooms}</strong> beds</li>
          <li><strong>{property.bathrooms}</strong> baths</li>
          <li><strong>{property.squareFeet.toLocaleString()}</strong> sqft</li>
        </ul>

        {/* Visual Call-to-Action (pointer-events-none prevents double click targets) */}
        <span 
          aria-hidden="true" 
          className="block text-center bg-blue-600 text-white font-medium py-2 px-4 rounded pointer-events-none"
        >
          View Listing Details
        </span>
      </div>
    </article>
  );
};