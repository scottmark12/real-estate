export type ListingStatus = "for_sale" | "investment" | "off_market" | "sold";
export type ListingCategory = "residential" | "multifamily" | "development";
export type ArticleCategory =
  | "southern-california"
  | "national"
  | "rates"
  | "development"
  | "alternative-construction"
  | "architectural-spotlight";

export interface Listing {
  id: string;
  title: string;
  slug: string;
  status: ListingStatus;
  category: ListingCategory;
  price_cents: number | null;
  price_display: string | null;
  beds: number | null;
  baths: number | null;
  sqft: number | null;
  acres: number | null;
  units: number | null;
  location: string;
  description: string | null;
  image_url: string | null;
  gallery_urls: string[];
  featured: boolean;
  sort_order: number;
  published: boolean;
  homepage_elsewhere: boolean;
  homepage_elsewhere_order: number;
  created_at: string;
  updated_at: string;
}

export interface Article {
  id: string;
  title: string;
  slug: string;
  category: ArticleCategory;
  tags: string[];
  excerpt: string | null;
  body: string | null;
  image_url: string | null;
  image_caption: string | null;
  image_position: string | null;
  read_time: string | null;
  is_feature_story: boolean;
  is_market_report: boolean;
  featured: boolean;
  architectural_feature: boolean;
  eyebrow: string | null;
  stat: string | null;
  secondary_stat: string | null;
  annotation: string | null;
  metadata: string | null;
  cta_label: string | null;
  published: boolean;
  on_my_radar: boolean;
  homepage_elsewhere: boolean;
  homepage_elsewhere_order: number;
  published_at: string;
  created_at: string;
  updated_at: string;
}

export interface SiteSettingRow<T> {
  key: string;
  value: T;
  updated_at: string;
}

export interface HeroSettings {
  headline: string;
  subhead: string;
  cta_primary_label: string;
  cta_primary_href: string;
  cta_secondary_label: string;
  cta_secondary_href: string;
  image_url: string;
  location_label: string;
  dateline: string;
}

export interface MarketChartSettings {
  years: number[];
  households: number[];
  housing_units: number[];
  source_note: string;
}

export interface ServiceItem {
  title: string;
  description: string;
  href: string;
  icon: string;
}

export interface AboutSettings {
  quote: string;
  name: string;
  headshot_url: string;
  portrait_url: string;
  location_label: string;
  handwritten_note: string;
  bio: string;
  // About page — real headshot (small byline photo, distinct from the
  // illustrated headshot_url used elsewhere on the site)
  headshot_photo_url: string;
  // About page — editorial photo slots. Each is admin-supplied; the site
  // never sources or generates imagery for these. focal is a CSS
  // object-position value (e.g. "50% 40%") so a supplied photo can be
  // recropped without re-exporting the file.
  opening_photo_url: string;
  opening_photo_caption: string;
  opening_photo_focal: string;
  community_photo_url: string;
  community_photo_caption: string;
  community_photo_focal: string;
  travel_photo_1_url: string;
  travel_photo_1_caption: string;
  travel_photo_1_focal: string;
  travel_photo_2_url: string;
  travel_photo_2_caption: string;
  travel_photo_2_focal: string;
  travel_photo_3_url: string;
  travel_photo_3_caption: string;
  travel_photo_3_focal: string;
}

export interface NewsletterSettings {
  image_url: string;
  tagline_line1: string;
  tagline_line2: string;
  heading: string;
  subhead: string;
}

export interface ContactSettings {
  city_state: string;
  dre_number: string;
  instagram_url: string;
  linkedin_url: string;
  email: string;
  phone?: string;
  name?: string;
  photo_url?: string;
  photo_caption?: string;
  handwritten_note?: string;
}
