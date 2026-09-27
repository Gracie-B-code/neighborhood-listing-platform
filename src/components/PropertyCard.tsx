import Image from 'next/image';
import Link from 'next/link';
import { Property } from '@/types';

interface PropertyCardProps {
  property: Property;
}

export const PropertyCard = ({ property }: PropertyCardProps) => {
  return (
    <article className="flex flex-col border rounded-lg overflow-hidden shadow-sm hover:shadow-md focus-within:ring-2 focus-within:ring-blue-600 bg-white">
      <div className="relative h-48 w-full bg-gray-100">
        <Image
          src={property.imageUrl}
          alt={property.imageAlt}
          fill
          className="object-cover"
          sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
        />
      </div>

      <div className="p-4 flex flex-col flex-1">
        <h3 className="text-xl font-bold text-gray-900 mb-1">
          <Link
            href={`/properties/${property.id}`}
            className="focus:outline-none focus-visible:underline hover:underline text-blue-800"
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

        {/* Facts List */}
        <ul className="flex gap-4 text-xs text-gray-600 mb-4 border-t pt-3 mt-auto">
          <li><strong>{property.bedrooms}</strong> beds</li>
          <li><strong>{property.bathrooms}</strong> baths</li>
          <li><strong>{property.squareFeet.toLocaleString()}</strong> sqft</li>
        </ul>

        <Link
          href={`/properties/${property.id}`}
          className="inline-block text-center bg-blue-600 text-white font-medium py-2 px-4 rounded hover:bg-blue-700 focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-blue-600"
          aria-label={`View details for ${property.title} at ${property.address}`}
        >
          View Listing Details
        </Link>
      </div>
    </article>
  );
};