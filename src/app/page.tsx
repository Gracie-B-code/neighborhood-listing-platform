export default function Home() {
    return (
        <main className="min-h-screen bg-slate-50 px-6 py-12 text-slate-900">
            <div className="mx-auto max-w-5xl">
                {/* Header Section */}
                <header className="mb-12 text-center">
                    <h1 className="text-4xl font-extrabold tracking-tight sm:text-5xl">
                        Neighborhood Listing Platform
                    </h1>
                    <p className="mt-4 text-lg text-slate-600">
                        Connecting local residents, businesses, and essential services in one community hub.
                    </p>
                </header>

                {/* Feature Cards Section */}
                <section aria-label="Core Features">
                    <div className="grid grid-cols-1 gap-6 md:grid-cols-3">

                        {/* Card 1: Local Listings */}
                        <article className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm transition hover:shadow-md">
                            <h2 className="text-xl font-bold text-slate-800">Local Listings</h2>
                            <p className="mt-2 text-sm text-slate-600">
                                Discover neighborhood services, items for trade, and community events submitted by verified locals.
                            </p>
                        </article>

                        {/* Card 2: Neighborhood Sponsors */}
                        <article className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm transition hover:shadow-md">
                            <h2 className="text-xl font-bold text-slate-800">Neighborhood Sponsors</h2>
                            <p className="mt-2 text-sm text-slate-600">
                                Support local small businesses and community sponsors backing our neighborhood programs.
                            </p>
                        </article>

                        {/* Card 3: Voice Help */}
                        <article className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm transition hover:shadow-md">
                            <h2 className="text-xl font-bold text-slate-800">Voice Help</h2>
                            <p className="mt-2 text-sm text-slate-600">
                                Access quick hands-free assistance and voice-guided navigation for local services.
                            </p>
                        </article>

                    </div>
                </section>
            </div>
        </main>
    );
}