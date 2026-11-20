// How each neighborhood maps onto the listings feed. The feed's keyword
// search alone is too loose ("Vista" also matches Chula Vista), so each
// place is pinned to its city or zip, with a keyword only where several
// neighborhoods share one zip.

export type FeedArea = { city?: string; zip?: string; q?: string };

const CITY = (city: string): FeedArea => ({ city });

export const NEIGHBORHOOD_FEED: Record<string, FeedArea> = {
  oceanside: CITY("Oceanside"),
  carlsbad: CITY("Carlsbad"),
  leucadia: { city: "Encinitas", q: "Leucadia" },
  encinitas: CITY("Encinitas"),
  cardiff: CITY("Cardiff By The Sea"),
  "solana-beach": CITY("Solana Beach"),
  "del-mar": CITY("Del Mar"),
  "rancho-santa-fe": CITY("Rancho Santa Fe"),
  "carmel-valley": { zip: "92130" },
  "4s-ranch": { zip: "92127", q: "4S" },
  "san-marcos": CITY("San Marcos"),
  escondido: CITY("Escondido"),
  "la-jolla": CITY("La Jolla"),
  "pacific-beach": { zip: "92109", q: "Pacific Beach" },
  "mission-beach": { zip: "92109", q: "Mission Beach" },
  "point-loma": { zip: "92106" },
  "ocean-beach": { zip: "92107" },
  "little-italy": { zip: "92101", q: "Little Italy" },
  "north-park": { zip: "92104" },
  "south-park": { zip: "92102", q: "South Park" },
  hillcrest: { zip: "92103", q: "Hillcrest" },
  kensington: { zip: "92116", q: "Kensington" },
  "mission-hills": { zip: "92103", q: "Mission Hills" },
  coronado: CITY("Coronado"),
  "imperial-beach": CITY("Imperial Beach"),
  "chula-vista": CITY("Chula Vista"),
  eastlake: { city: "Chula Vista", q: "Eastlake" },
  "la-mesa": CITY("La Mesa"),
  alpine: CITY("Alpine"),
  olivenhain: { city: "Encinitas", q: "Olivenhain" },
  vista: CITY("Vista"),
  fallbrook: CITY("Fallbrook"),
  "valley-center": CITY("Valley Center"),
  "rancho-bernardo": { zip: "92128" },
  poway: CITY("Poway"),
  bonita: CITY("Bonita"),
  "el-cajon": CITY("El Cajon"),
  santee: CITY("Santee"),
  lakeside: CITY("Lakeside"),
  ramona: CITY("Ramona"),
  julian: CITY("Julian"),
};

export function buyHref(slug: string, name: string) {
  const area = NEIGHBORHOOD_FEED[slug];
  const params = new URLSearchParams();
  if (area?.city) params.set("city", area.city);
  if (area?.zip) params.set("zip", area.zip);
  if (area?.q) params.set("q", area.q);
  if (!area) params.set("q", name);
  params.set("area", name);
  return `/buy?${params}`;
}
