"use client";

import { useRef, useState, type FormEvent } from "react";

import type { PropertySearchFilters } from "@/types";

type SearchFiltersProps = {
  onApply: (filters: PropertySearchFilters) => void;
};

const initialFilters: PropertySearchFilters = {
  priceBasis: "all",
  minBedrooms: "",
  maxPrice: "",
};

export default function SearchFilters({ onApply }: SearchFiltersProps) {
  const [filters, setFilters] = useState(initialFilters);
  const [error, setError] = useState<string | null>(null);
  const maxPriceInput = useRef<HTMLInputElement>(null);

  function submitFilters(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const formData = new FormData(event.currentTarget);
    const rawMaxPrice = String(formData.get("max-price") ?? "").trim();
    const parsedMaxPrice = rawMaxPrice === "" ? "" : Number(rawMaxPrice);

    if (
      maxPriceInput.current?.validity.badInput
      || (parsedMaxPrice !== "" && (
        !Number.isFinite(parsedMaxPrice)
        || parsedMaxPrice < 0
        || parsedMaxPrice > 100_000_000
      ))
    ) {
      setError("Enter a maximum price from zero to 100,000,000.");
      return;
    }

    const nextFilters: PropertySearchFilters = {
      priceBasis: String(formData.get("price-basis") ?? "all") as PropertySearchFilters["priceBasis"],
      minBedrooms: String(formData.get("min-bedrooms") ?? "") === ""
        ? ""
        : Number(formData.get("min-bedrooms")),
      maxPrice: parsedMaxPrice,
    };

    setError(null);
    setFilters(nextFilters);
    onApply(nextFilters);
  }

  function clearFilters() {
    setError(null);
    setFilters(initialFilters);
    onApply(initialFilters);
  }

  return (
    <form
      className="mb-6 grid gap-4 rounded-xl border border-slate-200 bg-white p-4 sm:grid-cols-2 lg:grid-cols-[1fr_1fr_1fr_auto_auto]"
      noValidate
      onReset={clearFilters}
      onSubmit={submitFilters}
    >
      <div>
        <label className="mb-1 block text-sm font-semibold text-slate-800" htmlFor="price-basis">
          Listing type
        </label>
        <select
          className="min-h-11 w-full rounded-md border border-slate-300 bg-white px-3 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-teal-800"
          id="price-basis"
          name="price-basis"
          onChange={(event) => setFilters((current) => ({
            ...current,
            priceBasis: event.target.value as PropertySearchFilters["priceBasis"],
          }))}
          value={filters.priceBasis}
        >
          <option value="all">All listing types</option>
          <option value="purchase">For purchase</option>
          <option value="monthly_rent">Monthly rent</option>
          <option value="weekly_rent">Weekly rent</option>
          <option value="daily_rent">Daily rent</option>
          <option value="other">Other price basis</option>
        </select>
      </div>

      <div>
        <label className="mb-1 block text-sm font-semibold text-slate-800" htmlFor="min-bedrooms">
          Minimum bedrooms
        </label>
        <select
          className="min-h-11 w-full rounded-md border border-slate-300 bg-white px-3 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-teal-800"
          id="min-bedrooms"
          name="min-bedrooms"
          onChange={(event) => setFilters((current) => ({
            ...current,
            minBedrooms: event.target.value === "" ? "" : Number(event.target.value),
          }))}
          value={filters.minBedrooms}
        >
          <option value="">Any number</option>
          {[0, 1, 2, 3, 4, 5].map((bedrooms) => (
            <option key={bedrooms} value={bedrooms}>{bedrooms} or more</option>
          ))}
        </select>
      </div>

      <div>
        <label className="mb-1 block text-sm font-semibold text-slate-800" htmlFor="max-price">
          Maximum price
        </label>
        <input
          aria-describedby={error ? "max-price-error" : undefined}
          aria-invalid={Boolean(error)}
          className="min-h-11 w-full rounded-md border border-slate-300 px-3 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-teal-800"
          id="max-price"
          max="100000000"
          min="0"
          name="max-price"
          onBlur={() => {
            if (error && !maxPriceInput.current?.validity.badInput) {
              const value = maxPriceInput.current?.value ?? "";
              if (value === "" || (Number(value) >= 0 && Number(value) <= 100_000_000)) {
                setError(null);
              }
            }
          }}
          onChange={(event) => setFilters((current) => ({
            ...current,
            maxPrice: event.target.value === "" ? "" : Number(event.target.value),
          }))}
          placeholder="No maximum"
          ref={maxPriceInput}
          step="1000"
          type="number"
          value={filters.maxPrice}
        />
        {error && (
          <p className="mt-1 text-sm text-rose-800" id="max-price-error" role="alert">
            {error}
          </p>
        )}
      </div>

      <button
        className="min-h-11 self-end rounded-md bg-teal-800 px-4 py-2 font-semibold text-white hover:bg-teal-900 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-teal-800"
        type="submit"
      >
        Apply filters
      </button>
      <button
        className="min-h-11 self-end rounded-md border border-slate-400 px-4 py-2 font-semibold text-slate-800 hover:bg-slate-100 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-teal-800"
        type="reset"
      >
        Clear filters
      </button>
    </form>
  );
}
