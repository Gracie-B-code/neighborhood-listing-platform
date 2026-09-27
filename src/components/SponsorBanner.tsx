import { Sponsor } from '@/types';

interface SponsorBannerProps {
  sponsor: Sponsor;
}

export default function SponsorBanner({ sponsor }: SponsorBannerProps) {
  return (
    <aside className="my-6 p-4 bg-slate-100 rounded-lg border border-slate-200">
      <p className="text-xs uppercase tracking-wide text-slate-500 font-semibold">
        Sponsored By
      </p>
      <h3 className="text-lg font-bold text-slate-800">{sponsor.name}</h3>
      <p className="text-sm text-slate-600">{sponsor.tagline}</p>
    </aside>
  );
}