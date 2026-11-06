"use client";

import type { ServiceRecord } from "@/schemas/service";

type ServiceCardProps = {
  service: ServiceRecord;
  onRequestService: (serviceId: string) => void;
};

type ServiceCardGridProps = {
  services: ServiceRecord[];
  onRequestService: (serviceId: string) => void;
};

function formatRate(service: ServiceRecord) {
  if (service.rate_amount === null) {
    return "Contact provider for pricing";
  }

  const price = new Intl.NumberFormat(undefined, {
    style: "currency",
    currency: service.currency,
    maximumFractionDigits: 2,
  }).format(service.rate_amount);

  return `${price} / ${service.rate_unit}`;
}

export function ServiceCard({ service, onRequestService }: ServiceCardProps) {
  return (
    <article className="flex h-full flex-col rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
      <p className="text-sm font-semibold uppercase tracking-wide text-teal-800">
        {service.category.replaceAll("_", " ")}
      </p>
      <h2 className="mt-2 text-xl font-bold text-slate-900">{service.title}</h2>
      <p className="mt-2 flex-1 text-sm leading-6 text-slate-700">
        {service.description}
      </p>
      <p className="mt-4 text-sm text-slate-700">
        {service.city}, {service.state} {service.zip_code}
      </p>
      <p className="mt-1 font-semibold text-slate-900">{formatRate(service)}</p>
      <button
        className="mt-5 min-h-11 rounded-md bg-teal-800 px-4 py-2 font-semibold text-white hover:bg-teal-900 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-teal-800"
        onClick={() => onRequestService(service.id)}
        type="button"
      >
        Request {service.title}
      </button>
    </article>
  );
}

export function ServiceCardGrid({ services, onRequestService }: ServiceCardGridProps) {
  if (services.length === 0) {
    return <p className="text-slate-600">No approved services are available yet.</p>;
  }

  return (
    <ul
      aria-label="Approved local services"
      className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3"
    >
      {services.map((service) => (
        <li key={service.id}>
          <ServiceCard service={service} onRequestService={onRequestService} />
        </li>
      ))}
    </ul>
  );
}
