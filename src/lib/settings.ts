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
  quote:
    "I'm Mark Scott. I work across residential and commercial real estate in San Diego, but what interests me most is what makes places work — the buildings, neighborhoods, businesses and people that give them value. I try to bring that curiosity to every property, whether someone's buying a first home or looking at an investment.",
  name: "Mark Scott",
  headshot_url: "/images/mark-illustration.png",
  portrait_url: "",
  location_label: "San Diego, CA",
  handwritten_note: "Curious people build better places.",
};

export const DEFAULT_NEWSLETTER: NewsletterSettings = {
  image_url: "",
  tagline_line1: "The Weekly Edit",
  tagline_line2: "",
  heading: "Worth Your Inbox",
  subhead:
    "Market updates, interesting properties, development, and architecture — San Diego and the bigger picture, sent weekly. No spam, just the numbers.",
};

export const DEFAULT_CONTACT: ContactSettings = {
  city_state: "San Diego, CA",
  dre_number: "DRE# 01234567",
  instagram_url: "https://instagram.com",
  linkedin_url: "https://linkedin.com",
  email: "hello@markscottre.com",
  phone: "(619) 555-0100",
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
