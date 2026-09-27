import React from 'react';
import { Sponsor } from '@/types';

interface SponsorBannerProps {
  sponsor: Sponsor;
}

export const SponsorBanner: React.FC<SponsorBannerProps> = ({ sponsor }) => {
  return (
    <aside className="my-6 p-4 border border-amber-300 bg-amber-50 rounded-lg flex items-center justify-between">
      <div>
        <span className="text-xs font-bold uppercase tracking-wider bg-amber-200 text-amber-900 px-2 py-1 rounded">
          Sponsored
        </span>
        <h2 className="text-lg font-semibold text-gray-900 mt-2">
          {sponsor.name}
        </h2>
        {/* Changed sponsor.description to sponsor.tagline */}
        <p className="text-sm text-gray-700">{sponsor.tagline}</p>
      </div>
      <a
        href={sponsor.websiteUrl}
        target="_blank"
        rel="noopener noreferrer"
        aria-label={`Visit ${sponsor.name} website`}
        className="px-4 py-2 bg-amber-800 text-white font-medium text-sm rounded hover:bg-amber-900 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-600 focus-visible:ring-offset-2"
      >
        Learn More
      </a>
    </aside>
  );
};