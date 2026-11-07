import type { Sponsor } from "@/types";

type SponsorBannerProps = {
  sponsor: Sponsor;
};

export default function SponsorBanner({ sponsor }: SponsorBannerProps) {
  return (
    <article className="flex h-full flex-col justify-between rounded-xl border border-amber-300 bg-amber-50 p-5">
      <div>
        <p className="inline-flex rounded-full bg-amber-200 px-3 py-1 text-xs font-bold uppercase tracking-wide text-amber-950">
          Sponsored
        </p>
        <h3 className="mt-3 text-lg font-bold text-slate-900">{sponsor.name}</h3>
        <p className="mt-1 text-sm text-slate-700">{sponsor.category}</p>
        {sponsor.claims.length > 0 && (
          <p className="mt-3 text-sm text-slate-700">{sponsor.claims[0]}</p>
        )}
      </div>
      {sponsor.website_url && (
        <a
          aria-label={`Visit ${sponsor.name} website (opens in a new tab)`}
          className="mt-4 inline-flex min-h-11 items-center self-start rounded-md px-2 font-semibold text-amber-950 underline decoration-2 underline-offset-4 hover:text-amber-800 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-amber-900"
          href={sponsor.website_url}
          rel="noopener noreferrer"
          target="_blank"
        >
          Visit website
        </a>
      )}
    </article>
  );
}
