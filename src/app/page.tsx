export default function Home() {
  return (
    <main className="min-h-screen p-8 max-w-4xl mx-auto font-sans bg-gray-50 text-gray-900">
      <header className="mb-8 border-b pb-4">
        <h1 className="text-3xl font-bold tracking-tight text-gray-900">
          Neighborhood Listing Platform
        </h1>
        <p className="mt-2 text-gray-600 leading-relaxed">
          Connecting local residents with neighborhood housing, trusted community sponsors, and voice-assisted help.
        </p>
      </header>

      <section aria-labelledby="features-heading">
        <h2 id="features-heading" className="sr-only">
          Platform Features
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Card 1: Listings */}
          <article className="p-6 border rounded-lg shadow-sm hover:shadow-md transition bg-white border-gray-200">
            <h3 className="text-xl font-semibold mb-2 text-gray-800">
              Property Listings
            </h3>
            <p className="text-gray-600 text-sm leading-relaxed">
              Browse verified local apartments, homes, and rental spaces in your neighborhood.
            </p>
          </article>

          {/* Card 2: Sponsors */}
          <article className="p-6 border rounded-lg shadow-sm hover:shadow-md transition bg-white border-gray-200">
            <h3 className="text-xl font-semibold mb-2 text-gray-800">
              Neighborhood Sponsors
            </h3>
            <p className="text-gray-600 text-sm leading-relaxed">
              Discover local business partners supporting community growth and housing initiatives.
            </p>
          </article>

          {/* Card 3: Voice Help */}
          <article className="p-6 border rounded-lg shadow-sm hover:shadow-md transition bg-white border-gray-200">
            <h3 className="text-xl font-semibold mb-2 text-gray-800">
              Voice Help
            </h3>
            <p className="text-gray-600 text-sm leading-relaxed">
              Access hands-free navigation and audio guidance for accessibility and ease of use.
            </p>
          </article>
        </div>
      </section>
    </main>
  );
}