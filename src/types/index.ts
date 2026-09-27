export interface Sponsor {
  id: string;
  name: string;
  logoUrl?: string;
  websiteUrl?: string;
}

export interface Property {
  id: string;
  title: string;
  description: string;
  address: string;
  price: number;
  sponsor?: Sponsor;
  createdAt: string;
}
