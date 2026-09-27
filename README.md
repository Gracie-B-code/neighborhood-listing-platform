
# Neighborhood Listing Platform

=======

## Live Deployment
- **URL:** https://neighborhood-listing-platform-sigma.vercel.app/

## Project Architecture

src/app/page.tsx (Page)
│
├── SearchFilters (Form with Accessible Controls)
│
├── SponsorBanner (Sponsored Label + Named Link)
│
└── ListingGrid (Responsive Grid Layout)
└── PropertyCard (Article, Heading, Facts, Button/Link)

=======
    └── PropertyCard (Article, Heading, Facts, Button/Link)

Component Hierarchy
===================
src/app/page.tsx (Page)
├── SearchFilters (Form, Labels, Select Controls, Submit)
├── SponsorBanner (Sponsored Label, Accessible Link)
└── Listing Grid (Tailwind: 1 col mobile, 2 md, 3 lg)
    ├── PropertyCard (Article, Heading, Address, Price, Facts, Image)
    ├── PropertyCard
    └── PropertyCard