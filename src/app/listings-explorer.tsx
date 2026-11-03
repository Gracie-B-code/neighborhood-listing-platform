"use client";

import { useEffect, useState } from "react";

import {
  PropertyRecordListSchema,
  type PropertyRecord,
} from "@/lib/properties/schema";

type ListingState =
  | { status: "loading" }
  | { status: "error" }
  | { status: "empty" }
  | { status: "ready"; properties: PropertyRecord[] };

function formatPrice(property: PropertyRecord) {
  const amount = new Intl.NumberFormat(undefined, {
    style: "currency",
    currency: property.currency,
    maximumFractionDigits: 0,
  }).format(property.price);

  const basis = {
    purchase: "purchase price",
    monthly_rent: "per month",
    weekly_rent: "per week",
    daily_rent: "per day",
    other: "listed amount",
  }[property.price_basis];

  return `${amount} ${basis}`;
}

function formatAmenity(amenity: string) {
  return amenity.replaceAll("_", " ");
}

export default function ListingsExplorer() {
  const [attempt, setAttempt] = useState(0);
  const [state, setState] = useState<ListingState>({ status: "loading" });

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

  return (
    <ul className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
      {state.properties.map((property) => (
        <li key={property.property_id}>
          <article className="h-full rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
            <h3 className="text-lg font-bold text-slate-900">
              {property.street_address}
              {property.address_line_2 ? `, ${property.address_line_2}` : ""}
            </h3>
            <p className="mt-1 text-sm text-slate-600">
              {property.city}, {property.state} {property.zip_code}
            </p>
            <p className="mt-4 font-semibold text-slate-800">{formatPrice(property)}</p>
            <p className="mt-1 text-sm text-slate-600">
              {property.bedrooms} bedrooms · {property.bathrooms} bathrooms · {property.square_feet} sq ft
            </p>
            {property.amenities.length > 0 && (
              <p className="mt-3 text-sm text-slate-600">
                Amenities: {property.amenities.map(formatAmenity).join(", ")}
              </p>
            )}
            {property.local_sponsors.length > 0 && (
              <p className="mt-3 text-sm text-slate-600">
                Sponsors: {property.local_sponsors.map((sponsor) => sponsor.name).join(", ")}
              </p>
            )}
          </article>
        </li>
      ))}
    </ul>
  );
}
