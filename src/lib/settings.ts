import { createClient } from "@/lib/supabase/server";
import type {
  AboutSettings,
  ContactSettings,
  HeroSettings,
  MarketChartSettings,
  NewsletterSettings,
  ServiceItem,
} from "@/lib/types";

export const DEFAULT_HERO: HeroSettings = {
  headline: "What Is San Diego Actually Worth?",
  subhead:
    "A closer look at inventory, affordability, development, and where the market is heading.",
  cta_primary_label: "Read the Report",
  cta_primary_href: "/insights",
  cta_secondary_label: "View Properties",
  cta_secondary_href: "/listings",
  image_url: "/images/hero-san-diego.jpeg",
  location_label: "San Diego",
  dateline: "The Market Report",
};

export const DEFAULT_MARKET_CHART: MarketChartSettings = {
  years: [2019, 2020, 2021, 2022, 2023, 2024],
  households: [1120, 1132, 1140, 1151, 1163, 1176],
  housing_units: [1180, 1186, 1190, 1196, 1201, 1206],
  source_note:
    "Source: San Diego Association of Governments (SANDAG), households and housing units in thousands.",
};

export const DEFAULT_SERVICES: ServiceItem[] = [
  {
    title: "Residential",
    description:
      "Buying or selling a home in San Diego, from first offer to closing day.",
    href: "/buy",
    icon: "home",
  },
  {
    title: "Commercial",
    description:
      "Multifamily and development opportunities backed by real underwriting.",
    href: "/invest",
    icon: "building",
  },
  {
    title: "Market Insights",
    description:
      "Data-driven reporting on what's actually happening in the market, not what sells headlines.",
    href: "/insights",
    icon: "chart",
  },
];

export const DEFAULT_ABOUT: AboutSettings = {
  quote: "Homes are where community starts.",
  name: "Mark Scott",
  headshot_url: "/images/mark-illustration-v2.png",
  portrait_url: "/images/about-photo.jpg",
  location_label: "San Diego, CA",
  handwritten_note: "Curious people build better places.",
  bio: `Where you live shapes a lot more than your address. It shapes the people you know, the places you frequent, and the way you spend your days. Deciding where to live is a big deal. I would know—I moved across the country to Encinitas because it had so much of what I was looking for: beautiful beaches, a strong sense of community, good food, and easy access to mountains and desert.

I studied interior design, entrepreneurship, and marketing at Florida State University, graduating early to spend time traveling. Circling the world, I found a sense of home and community in cities where housing, neighborhoods, and daily life looked nothing like they do in the U.S. It made me curious about why some places work so well—and why others don't.

When I came back, real estate felt like the natural place to put that curiosity to work. Today, I work across residential and commercial real estate, with an interest not just in properties themselves, but in the neighborhoods, buildings, economics, and people that give them value.`,
};

export const DEFAULT_NEWSLETTER: NewsletterSettings = {
  image_url: "",
  tagline_line1: "Ride the Market",
  tagline_line2: "",
  heading: "Join the Newsletter.",
  subhead:
    "Monthly data on San Diego real estate, interesting properties, development, and the bigger picture — delivered straight to your inbox.",
};

export const DEFAULT_CONTACT: ContactSettings = {
  city_state: "San Diego, CA",
  dre_number: "DRE# 01234567",
  instagram_url: "https://instagram.com",
  linkedin_url: "https://linkedin.com",
  email: "hello@markscottre.com",
  phone: "(619) 555-0100",
  name: "Mark Scott",
  photo_url: "/images/mark-illustration-v2.png",
  photo_caption: "",
  handwritten_note: "Coffee works too.",
};

export async function getSetting<T>(
  key: string,
  fallback: T
): Promise<T> {
  const supabase = await createClient();
  const { data } = await supabase
    .from("site_settings")
    .select("value")
    .eq("key", key)
    .maybeSingle();

  if (!data?.value) return fallback;

  // Arrays (e.g. the "services" setting) must not be object-spread-merged —
  // spreading two arrays with {...a, ...b} produces a plain object with
  // numeric keys instead of an array, which breaks any .map() call on it.
  if (Array.isArray(fallback)) {
    return (Array.isArray(data.value) ? data.value : fallback) as T;
  }

  return { ...fallback, ...(data.value as object) } as T;
}
