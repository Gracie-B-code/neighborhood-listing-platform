"use client";

import { useEffect, useState } from "react";

import { ServiceCardGrid } from "@/components/ServiceCard";
import {
  ServiceBookingRecordSchema,
  ServiceRecordListSchema,
  type ServiceRecord,
} from "@/schemas/service";

type ServicesExplorerProps = {
  readOnly?: boolean;
};

type ServicesState =
  | { status: "loading" }
  | { status: "error" }
  | { status: "empty" }
  | { status: "ready"; services: ServiceRecord[] };

type RequestState =
  | { status: "idle" }
  | { status: "submitting"; serviceId: string }
  | { status: "success"; serviceId: string }
  | { status: "error"; serviceId: string; message: string };

export default function ServicesExplorer({ readOnly = false }: ServicesExplorerProps) {
  const [attempt, setAttempt] = useState(0);
  const [state, setState] = useState<ServicesState>({ status: "loading" });
  const [requestState, setRequestState] = useState<RequestState>({ status: "idle" });

  useEffect(() => {
    const controller = new AbortController();

    async function loadServices() {
      try {
        const response = await fetch("/api/services", {
          cache: "no-store",
          signal: controller.signal,
        });
        if (!response.ok) {
          setState({ status: "error" });
          return;
        }

        const payload: unknown = await response.json();
        const result = ServiceRecordListSchema.safeParse(payload);
        if (!result.success) {
          setState({ status: "error" });
          return;
        }

        setState(result.data.length === 0
          ? { status: "empty" }
          : { status: "ready", services: result.data });
      } catch {
        if (!controller.signal.aborted) {
          setState({ status: "error" });
        }
      }
    }

    void loadServices();
    return () => controller.abort();
  }, [attempt]);

  async function requestService(serviceId: string) {
    setRequestState({ status: "submitting", serviceId });
    try {
      const response = await fetch(`/api/services/${serviceId}/bookings`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({}),
      });

      if (!response.ok) {
        const payload: unknown = await response.json().catch(() => null);
        const message = typeof payload === "object" && payload !== null
          && "error" in payload && typeof payload.error === "string"
          ? payload.error
          : "Your request could not be submitted.";
        setRequestState({ status: "error", serviceId, message });
        return;
      }

      const payload: unknown = await response.json();
      if (!ServiceBookingRecordSchema.safeParse(payload).success) {
        setRequestState({
          status: "error",
          serviceId,
          message: "Your request could not be confirmed.",
        });
        return;
      }

      setRequestState({ status: "success", serviceId });
    } catch {
      setRequestState({
        status: "error",
        serviceId,
        message: "Your request could not be submitted. Try again.",
      });
    }
  }

  if (state.status === "loading") {
    return <p role="status" className="text-slate-600">Loading approved services…</p>;
  }

  if (state.status === "error") {
    return (
      <div role="alert" className="rounded-lg border border-rose-200 bg-rose-50 p-4 text-rose-900">
        <p>Services could not be loaded right now.</p>
        <button
          className="mt-3 min-h-11 rounded-md border border-rose-400 px-3 py-2 font-semibold focus-visible:ring-2 focus-visible:ring-rose-700 focus-visible:ring-offset-2"
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
    return <p className="text-slate-600">There are no approved services yet.</p>;
  }

  return (
    <>
      <ServiceCardGrid
        services={state.services}
        onRequestService={(serviceId) => void requestService(serviceId)}
        readOnly={readOnly}
      />
      {!readOnly && requestState.status === "submitting" && (
        <p className="mt-4 text-sm text-slate-700" role="status">
          Sending service request…
        </p>
      )}
      {!readOnly && requestState.status === "success" && (
        <p className="mt-4 text-sm text-emerald-800" role="status">
          Your service request was sent.
        </p>
      )}
      {!readOnly && requestState.status === "error" && (
        <p className="mt-4 text-sm text-rose-800" role="alert">
          {requestState.message}
        </p>
      )}
    </>
  );
}
