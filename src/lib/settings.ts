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
  handwritten_note: "Still paying attention.",
  bio: `Before real estate, I studied interior design, entrepreneurship, and marketing at Florida State University. I graduated early, packed a bag, and spent a good amount of time seeing the world.

What stuck with me wasn't that other places looked different. Of course they did. It was how differently they worked.

I've felt completely at home in places where the houses were smaller, streets were tighter, cars were less important, and public space did more of the work. I've also seen incredible buildings that didn't make particularly good places around them.

Travel made me pay attention to the relationship between a home and the life happening around it, not just what it looks like inside.

That curiosity followed me home.

Eventually it became my job. My first real education in property wasn't theoretical. I renovated and managed a six bedroom property near Florida State and saw firsthand how design decisions, costs, and the surrounding neighborhood all shape whether a place actually works for the people living in it.

That's the lens I bring now, helping people buy and sell homes in San Diego. Whether you're picking a neighborhood, weighing what's worth fixing up, or figuring out what a place is really worth, I'm thinking about how it all fits your life, not just the transaction.

A house is a big decision. I want it to feel like a good one.`,
  headshot_photo_url: "/images/mark-headshot.jpeg",
  opening_photo_url: "",
  opening_photo_caption: "",
  opening_photo_focal: "50% 50%",
  community_photo_url: "/images/about-community.webp",
  community_photo_caption: "",
  community_photo_focal: "50% 50%",
  travel_photo_1_url: "/images/travel-giza.jpeg",
  travel_photo_1_caption: "Giza, Egypt",
  travel_photo_1_focal: "50% 50%",
  travel_photo_2_url: "/images/travel-thatched-roof.jpeg",
  travel_photo_2_caption: "Chiang Mai, Thailand",
  travel_photo_2_focal: "50% 50%",
  travel_photo_3_url: "/images/travel-minaret.jpeg",
  travel_photo_3_caption: "Casablanca, Morocco",
  travel_photo_3_focal: "50% 30%",
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
