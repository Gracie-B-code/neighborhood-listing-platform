import ListingsExplorer from "./listings-explorer";
import ServicesExplorer from "./services-explorer";
import SponsorsExplorer from "./sponsors-explorer";

export default function Home() {
  return (
    <main className="min-h-screen bg-slate-50 px-6 py-12 text-slate-900">
      <div className="mx-auto max-w-5xl">
        <header className="mb-12 text-center">
          <h1 className="text-4xl font-extrabold tracking-tight sm:text-5xl">
            Neighborhood Listing Platform
          </h1>
          <p className="mt-4 text-lg text-slate-600">
            Connecting local residents, businesses, and essential services in one community hub.
          </p>
        </header>

        <section aria-labelledby="listings-heading" className="mb-12">
          <h2 id="listings-heading" className="mb-5 text-2xl font-bold">
            Approved property listings
          </h2>
          <ListingsExplorer />
        </section>

        <section aria-labelledby="services-heading" className="mb-12">
          <h2 id="services-heading" className="mb-5 text-2xl font-bold">
            Local services
          </h2>
          <ServicesExplorer />
        </section>

        <section aria-labelledby="sponsors-heading" className="mb-12">
          <h2 id="sponsors-heading" className="mb-5 text-2xl font-bold">
            Neighborhood sponsors
          </h2>
          <SponsorsExplorer />
        </section>

        <section aria-label="More platform concepts">
          <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
            <article className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
              <h2 className="text-xl font-bold text-slate-800">Voice Help</h2>
              <p className="mt-2 text-sm text-slate-600">
                Voice-guided navigation remains a future concept and is not currently available.
              </p>
            </article>
          </div>
        </section>
      </div>
    </main>
  );
}