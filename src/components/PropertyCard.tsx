"use client";

import Image from "next/image";
import { useState } from "react";

import type { Property } from "@/types";

type PropertyCardProps = {
  property: Property;
};

function formatPrice(property: Property) {
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

export default function PropertyCard({ property }: PropertyCardProps) {
  const [detailsOpen, setDetailsOpen] = useState(false);
  const detailsId = `property-details-${property.property_id}`;
  const address = `${property.street_address}${property.address_line_2 ? `, ${property.address_line_2}` : ""}`;

  return (
    <article className="flex h-full flex-col overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
      <Image
        alt="Illustration of a fictional neighborhood home"
        className="h-48 w-full object-cover"
        height={384}
        loading="eager"
        src="/property-home-illustration.svg"
        width={640}
      />
      <div className="flex flex-1 flex-col p-5">
        <h3 className="text-xl font-bold text-slate-900">{address}</h3>
        <p className="mt-1 text-sm text-slate-600">
          {property.city}, {property.state} {property.zip_code}
        </p>
        <p className="mt-4 text-lg font-semibold text-slate-900">{formatPrice(property)}</p>
        <ul aria-label="Property facts" className="mt-3 flex flex-wrap gap-x-4 gap-y-1 text-sm text-slate-700">
          <li>{property.bedrooms} {property.bedrooms === 1 ? "bedroom" : "bedrooms"}</li>
          <li>{property.bathrooms} {property.bathrooms === 1 ? "bathroom" : "bathrooms"}</li>
          <li>{property.square_feet.toLocaleString()} sq ft</li>
        </ul>
        <button
          aria-controls={detailsId}
          aria-expanded={detailsOpen}
          aria-label={`${detailsOpen ? "Hide" : "View"} details for ${address}`}
          className="mt-auto self-start rounded-md px-2 py-2 font-semibold text-teal-900 underline decoration-2 underline-offset-4 hover:text-teal-700 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-teal-800"
          onClick={() => setDetailsOpen((open) => !open)}
          type="button"
        >
          {detailsOpen ? "Hide details" : "View details"}
        </button>
        <div className="mt-2" hidden={!detailsOpen} id={detailsId}>
          {property.amenities.length > 0 && (
            <p className="text-sm text-slate-700">
              Amenities: {property.amenities.map((amenity) => amenity.replaceAll("_", " ")).join(", ")}
            </p>
          )}
          {property.local_sponsors.length > 0 && (
            <p className="mt-2 text-sm text-slate-700">
              Local sponsors: {property.local_sponsors.map((sponsor) => sponsor.name).join(", ")}
            </p>
          )}
        </div>
      </div>
    </article>
  );
}
