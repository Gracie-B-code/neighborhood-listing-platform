"use client";

import { useEffect, useState } from "react";

import SponsorBanner from "@/components/SponsorBanner";
import { SponsorRecordSchema } from "@/lib/properties/schema";
import type { Sponsor } from "@/types";

type SponsorsState =
  | { status: "loading" }
  | { status: "error" }
  | { status: "empty" }
  | { status: "ready"; sponsors: Sponsor[] };

export default function SponsorsExplorer() {
  const [attempt, setAttempt] = useState(0);
  const [state, setState] = useState<SponsorsState>({ status: "loading" });

  useEffect(() => {
    const controller = new AbortController();

    async function loadSponsors() {
      try {
        const response = await fetch("/api/sponsors", {
          cache: "no-store",
          signal: controller.signal,
        });
        if (!response.ok) {
          setState({ status: "error" });
          return;
        }

        const payload: unknown = await response.json();
        const result = SponsorRecordSchema.array().max(100).safeParse(payload);
        if (!result.success) {
          setState({ status: "error" });
          return;
        }

        setState(result.data.length === 0
          ? { status: "empty" }
          : { status: "ready", sponsors: result.data });
      } catch {
        if (!controller.signal.aborted) {
          setState({ status: "error" });
        }
      }
    }

    void loadSponsors();
    return () => controller.abort();
  }, [attempt]);

  if (state.status === "loading") {
    return <p role="status" className="text-slate-600">Loading approved sponsors…</p>;
  }

  if (state.status === "error") {
    return (
      <div role="alert" className="rounded-lg border border-rose-200 bg-rose-50 p-4 text-rose-900">
        <p>Sponsor information could not be loaded right now.</p>
        <button
          className="mt-3 min-h-11 rounded-md border border-rose-400 px-3 py-2 font-semibold focus-visible:outline-2 focus-visible:outline-offset-2"
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
    return <p className="text-slate-600">There are no approved sponsors yet.</p>;
  }

  return (
    <ul
      aria-label="Approved sponsors"
      className="grid grid-cols-1 gap-5 md:grid-cols-2 lg:grid-cols-3"
    >
      {state.sponsors.map((sponsor) => (
        <li key={sponsor.sponsor_id}>
          <SponsorBanner sponsor={sponsor} />
        </li>
      ))}
    </ul>
  );
}
