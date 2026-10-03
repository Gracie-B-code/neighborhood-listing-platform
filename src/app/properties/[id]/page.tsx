import Link from 'next/link';
import { notFound } from 'next/navigation';
import { getValidatedProperties } from '@/lib/data/mock-properties';

interface PropertyDetailPageProps {
  params: Promise<{ id: string }>;
}

export default async function PropertyDetailPage({ params }: PropertyDetailPageProps) {
  const { id } = await params;
  const properties = getValidatedProperties();
  const property = properties.find((p) => p.property_id === id);

  if (!property) {
    notFound();
  }

  const formattedAddress = property.address
    ? `${property.address.street}, ${property.address.city}, ${property.address.state} ${property.zip_code}`
    : 'Address unavailable';

  return (
    <main className="min-h-screen bg-slate-50 px-4 py-12 dark:bg-slate-950">
      <div className="mx-auto max-w-4xl rounded-xl border border-slate-200 bg-white p-8 shadow-sm dark:border-slate-800 dark:bg-slate-900">
        <Link
          href="/"
          className="mb-6 inline-flex items-center text-sm font-medium text-blue-600 hover:text-blue-800 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-600"
        >
          ← Back to listings
        </Link>

        <header className="mb-6">
          <h1 className="text-3xl font-bold text-slate-900 dark:text-white">
            {property.title}
          </h1>
          <p className="mt-1 text-slate-600 dark:text-slate-400">
            {formattedAddress}
          </p>
        </header>

        <div className="mb-8 grid grid-cols-1 gap-6 md:grid-cols-3">
          <div className="rounded-lg border border-slate-200 bg-slate-50 p-4 text-center dark:border-slate-700 dark:bg-slate-800">
            <span className="block text-xs font-semibold uppercase text-slate-500 dark:text-slate-400">Monthly Rent</span>
            <span className="text-2xl font-bold text-green-700 dark:text-green-400">${property.price.toLocaleString()}</span>
          </div>
          <div className="rounded-lg border border-slate-200 bg-slate-50 p-4 text-center dark:border-slate-700 dark:bg-slate-800">
            <span className="block text-xs font-semibold uppercase text-slate-500 dark:text-slate-400">Bedrooms / Baths</span>
            <span className="text-xl font-bold text-slate-900 dark:text-white">{property.bedrooms} Beds / {property.bathrooms} Baths</span>
          </div>
          <div className="rounded-lg border border-slate-200 bg-slate-50 p-4 text-center dark:border-slate-700 dark:bg-slate-800">
            <span className="block text-xs font-semibold uppercase text-slate-500 dark:text-slate-400">Square Feet</span>
            <span className="text-xl font-bold text-slate-900 dark:text-white">{property.square_feet.toLocaleString()} sqft</span>
          </div>
        </div>

        {property.local_sponsors && property.local_sponsors.length > 0 && (
          <section className="mt-6 border-t border-slate-200 pt-6 dark:border-slate-800">
            <h2 className="mb-3 text-lg font-bold text-slate-900 dark:text-white">
              Featured Neighborhood Sponsors
            </h2>
            <div className="flex flex-wrap gap-3">
              {property.local_sponsors.map((sponsor) => (
                <a
                  key={sponsor.sponsor_id}
                  href={sponsor.website_url || '#'}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 rounded-md border border-amber-200 bg-amber-50 px-3 py-2 text-sm text-amber-900 hover:bg-amber-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-600"
                >
                  <span>📍 {sponsor.name}</span>
                </a>
              ))}
            </div>
          </section>
        )}
      </div>
    </main>
  );
}
