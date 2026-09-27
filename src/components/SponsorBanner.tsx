import React from 'react';
import { Sponsor } from '@/types';

interface SponsorBannerProps {
  sponsor: Sponsor;
}

export const SponsorBanner: React.FC<SponsorBannerProps> = ({ sponsor }) => {
  return (
    <aside 
      aria-label="Community Sponsor"
      className="my-6 p-4 border border-amber-300 bg-amber-50 rounded-lg flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4"
    >
      <div>
        <span className="inline-block text-xs font-bold uppercase tracking-wider bg-amber-200 text-amber-950 px-2 py-0.5 rounded">
          Sponsored
        </span>
        <h3 className="text-lg font-semibold text-gray-900 mt-1">
          {sponsor.name}
        </h3>
        <p className="text-sm text-gray-700">{sponsor.tagline}</p>
      </div>

      <a
        href={sponsor.websiteUrl}
        target="_blank"
        rel="noopener noreferrer"
        aria-label={`Visit ${sponsor.name} website (opens in a new tab)`}
        className="self-start sm:self-auto inline-block text-center px-4 py-2 bg-amber-800 text-white font-medium text-sm rounded hover:bg-amber-900 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-800 focus-visible:ring-offset-2 focus-visible:ring-offset-amber-50"
      >
        Learn More
      </a>
    </aside>
  );
};