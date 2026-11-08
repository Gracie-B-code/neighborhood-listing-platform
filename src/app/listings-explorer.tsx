"use client";

import { useEffect, useState } from "react";

import {
  PropertyRecordListSchema,
  type PropertyRecord,
} from "@/lib/properties/schema";
import { filterProperties } from "@/lib/properties/filter";
import PropertyCard from "@/components/PropertyCard";
import SearchFilters from "@/components/SearchFilters";
import type { PropertySearchFilters } from "@/types";

type ListingState =
  | { status: "loading" }
  | { status: "error" }
  | { status: "empty" }
  | { status: "ready"; properties: PropertyRecord[] };

export default function ListingsExplorer() {
  const [attempt, setAttempt] = useState(0);
  const [state, setState] = useState<ListingState>({ status: "loading" });
  const [filters, setFilters] = useState<PropertySearchFilters>({
    priceBasis: "all",
    minBedrooms: "",
    maxPrice: "",
  });

  useEffect(() => {
    const controller = new AbortController();

    async function loadListings() {
      try {
        const response = await fetch("/api/properties", {
          cache: "no-store",
          signal: controller.signal,
        });

        if (!response.ok) {
          setState({ status: "error" });
          return;
        }

        const payload: unknown = await response.json();
        const validated = PropertyRecordListSchema.safeParse(payload);

        if (!validated.success) {
          setState({ status: "error" });
          return;
        }

        setState(validated.data.length === 0
          ? { status: "empty" }
          : { status: "ready", properties: validated.data });
      } catch {
        if (!controller.signal.aborted) {
          setState({ status: "error" });
        }
      }
    }

    void loadListings();
    return () => controller.abort();
  }, [attempt]);

  if (state.status === "loading") {
    return <p role="status" className="text-slate-600">Loading approved listings…</p>;
  }

  if (state.status === "error") {
    return (
      <div role="alert" className="rounded-lg border border-rose-200 bg-rose-50 p-4 text-rose-900">
        <p>Listings could not be loaded right now.</p>
        <button
          className="mt-3 rounded-md border border-rose-400 px-3 py-2 font-semibold focus-visible:outline-2 focus-visible:outline-offset-2"
          onClick={() => {
            setState({ status: "loading" });
            setAttempt((current) => current + 1);
          }}
          type="button"
        >
          Try again
        </button>
      </div>
    );
  }

  if (state.status === "empty") {
    return <p className="text-slate-600">There are no approved listings yet.</p>;
  }

  const properties = filterProperties(state.properties, filters);

  return (
    <>
      <SearchFilters onApply={setFilters} />
      <p className="mb-3 text-sm text-slate-600" aria-live="polite">
        Showing {properties.length} of {state.properties.length} approved listings.
      </p>
      {properties.length === 0
        ? <p className="rounded-lg bg-white p-4 text-slate-700">No listings match those filters. Change or clear your filters and try again.</p>
        : (
          <ul
            aria-label="Approved property listings"
            className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3"
          >
            {properties.map((property) => (
              <li key={property.property_id}>
                <PropertyCard property={property} />
              </li>
            ))}
          </ul>
        )}
    </>
  );
}
