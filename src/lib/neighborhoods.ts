// San Diego neighborhoods for the neighborhood pages and the match quiz.
//
// Trait scores are 0 to 3 and describe the place, never who lives there.
// Price tiers are rough ranges for a typical house, not medians: verify
// with current MLS data before quoting a number anywhere.

export type Region =
  | "Coastal North County"
  | "Inland North County"
  | "Central Coast"
  | "Urban Core"
  | "South Bay & Coronado"
  | "East County";

export const REGIONS: Region[] = [
  "Coastal North County",
  "Inland North County",
  "Central Coast",
  "Urban Core",
  "South Bay & Coronado",
  "East County",
];

export type Traits = {
  urban: number; // 0 rural, 3 dense and walkable with nightlife
  beach: number; // 0 a long drive, 3 walk to the sand
  commuteDowntown: number;
  commuteNorth: number; // Carlsbad, Sorrento Valley, UTC
  surf: number;
  trails: number;
  dining: number;
  golf: number; // golf and horses
  condo: number;
  house: number;
  land: number;
};

export type Neighborhood = {
  slug: string;
  name: string;
  region: Region;
  priceTier: 1 | 2 | 3 | 4;
  tagline: string;
  about: string[];
  highlights: string[];
  tradeoffs: string;
  tags: string[];
  traits: Traits;
  lat: number;
  lng: number;
  markTake?: string;
};

export const PRICE_TIERS: Record<Neighborhood["priceTier"], string> = {
  1: "Mostly under $1M",
  2: "About $1M to $1.5M",
  3: "About $1.5M to $2.5M",
  4: "$2.5M and up",
};

export const TRAIT_LABELS: { key: keyof Traits; label: string }[] = [
  { key: "beach", label: "Beach access" },
  { key: "urban", label: "Walkable, city energy" },
  { key: "dining", label: "Restaurants and bars" },
  { key: "surf", label: "Surf" },
  { key: "trails", label: "Trails and outdoors" },
  { key: "golf", label: "Golf and horses" },
  { key: "commuteDowntown", label: "Commute downtown" },
  { key: "commuteNorth", label: "Commute to North County jobs" },
];

const t = (
  urban: number,
  beach: number,
  commuteDowntown: number,
  commuteNorth: number,
  surf: number,
  trails: number,
  dining: number,
  golf: number,
  condo: number,
  house: number,
  land: number
): Traits => ({
  urban,
  beach,
  commuteDowntown,
  commuteNorth,
  surf,
  trails,
  dining,
  golf,
  condo,
  house,
  land,
});

export const NEIGHBORHOODS: Neighborhood[] = [
  // Coastal North County
  {
    slug: "oceanside",
    lat: 33.1959,
    lng: -117.3795,
    name: "Oceanside",
    region: "Coastal North County",
    priceTier: 1,
    tagline: "A real beach city with a pier, a harbor and a downtown that keeps getting better.",
    about: [
      "Oceanside is the northernmost beach city in the county, with a long pier, a busy harbor and wide sandy beaches. Downtown has filled in with new restaurants, breweries and hotels in the last few years.",
      "It has more range in housing than most of the coast, from condos near the water to single family neighborhoods inland, which makes it one of the more approachable ways to live near the ocean in North County.",
    ],
    highlights: ["Oceanside Pier and Harbor", "A growing downtown food scene", "The Coaster and Sprinter train lines"],
    tradeoffs: "It's a long drive to downtown San Diego, and the feel changes a lot block to block, so the specific street matters.",
    tags: ["Beach city", "Surf", "More approachable prices"],
    traits: t(2, 3, 0, 2, 3, 1, 2, 1, 3, 2, 0),
  },
  {
    slug: "carlsbad",
    lat: 33.1581,
    lng: -117.3506,
    name: "Carlsbad",
    region: "Coastal North County",
    priceTier: 3,
    tagline: "A polished coastal city with a walkable village, lagoons and plenty of room inland.",
    about: [
      "Carlsbad Village sits right by the beach, with shops, restaurants and the train station a short walk from the sand. Inland, master planned neighborhoods like La Costa and Aviara spread out around golf courses, lagoons and trails.",
      "It's also a real job center, with a lot of North County's tech and life science employers close by.",
    ],
    highlights: ["Carlsbad Village by the beach", "Batiquitos and Agua Hedionda lagoons", "Aviara and La Costa golf"],
    tradeoffs: "Prices near the Village and the coast are high, and a lot of the inland housing is newer and more uniform.",
    tags: ["Village and beach", "Golf", "Close to North County jobs"],
    traits: t(1, 2, 0, 3, 2, 2, 2, 3, 2, 3, 1),
  },
  {
    slug: "leucadia",
    lat: 33.067,
    lng: -117.303,
    name: "Leucadia",
    region: "Coastal North County",
    priceTier: 3,
    tagline: "Old school beach town along the 101, with eucalyptus trees and quiet surf breaks.",
    about: [
      "Leucadia is the north end of Encinitas, strung along Highway 101 under a canopy of eucalyptus. The vibe is laid back: small beach cottages, coffee shops, surf breaks like Beacon's and Grandview, and a lot of people on bikes.",
      "Streets west of the 101 put you a short walk from the bluffs and beach stairs.",
    ],
    highlights: ["Beacon's and Grandview beaches", "The 101 corridor of cafes and shops", "A slower, artsy beach town feel"],
    tradeoffs: "Older homes on small lots, limited inventory near the water, and a long commute south.",
    tags: ["Surf", "Laid back", "Walk to the beach"],
    traits: t(2, 3, 0, 3, 3, 1, 2, 0, 1, 3, 0),
  },
  {
    slug: "encinitas",
    lat: 33.0459,
    lng: -117.293,
    name: "Encinitas",
    region: "Coastal North County",
    priceTier: 3,
    tagline: "Small town on the coast with Moonlight Beach, Swami's and a downtown you can walk.",
    about: [
      "Downtown Encinitas runs along the 101 with restaurants, coffee, bars and the La Paloma Theatre, a few blocks from Moonlight Beach. Swami's, one of the best known surf breaks in California, is just south.",
      "It feels like a small town where you run into people, with big city amenities and the airport within reach.",
    ],
    highlights: ["Moonlight Beach and Swami's", "A walkable downtown on the 101", "San Diego Botanic Garden"],
    tradeoffs: "Very little inventory near the coast, prices to match, and summer beach traffic.",
    tags: ["Walkable village", "Surf", "Small town feel"],
    traits: t(2, 3, 0, 3, 3, 1, 3, 0, 2, 3, 0),
  },
  {
    slug: "cardiff",
    lat: 33.0197,
    lng: -117.2797,
    name: "Cardiff by the Sea",
    region: "Coastal North County",
    priceTier: 4,
    tagline: "A tight knit beach village with a long state beach and some of the best views on the coast.",
    about: [
      "Cardiff sits between Encinitas and Solana Beach, with a small cluster of shops and restaurants and Cardiff State Beach running along the 101. Neighborhoods climb the hills behind it, many with ocean views.",
      "It's quieter than downtown Encinitas, with a strong neighborhood feel and the San Elijo Lagoon right next door.",
    ],
    highlights: ["Cardiff State Beach and Seaside", "San Elijo Lagoon trails", "Restaurant Row on the water"],
    tradeoffs: "Among the priciest in North County, and homes rarely come up for sale.",
    tags: ["Surf", "Ocean views", "Quiet village"],
    traits: t(1, 3, 1, 3, 3, 1, 2, 0, 1, 3, 0),
  },
  {
    slug: "solana-beach",
    lat: 32.9912,
    lng: -117.2711,
    name: "Solana Beach",
    region: "Coastal North County",
    priceTier: 4,
    tagline: "A small, walkable beach city with a design district and its own train station.",
    about: [
      "Solana Beach packs a lot into a small footprint: Cedros Avenue's design shops and restaurants, Fletcher Cove, and a Coaster and Amtrak station in the middle of town.",
      "Much of the housing near the water is condos and townhomes, with single family neighborhoods on the east side.",
    ],
    highlights: ["Cedros Avenue Design District", "Fletcher Cove", "Train station in town"],
    tradeoffs: "Very high prices for a small city, and bluff top properties come with erosion questions to check.",
    tags: ["Walkable", "Beach", "Train access"],
    traits: t(2, 3, 1, 3, 2, 1, 3, 1, 2, 3, 0),
  },
  {
    slug: "del-mar",
    lat: 32.9595,
    lng: -117.2653,
    name: "Del Mar",
    region: "Coastal North County",
    priceTier: 4,
    tagline: "A tiny, upscale village by the sea, home to the racetrack and the fairgrounds.",
    about: [
      "Del Mar is a small beach city with a walkable village, dog friendly beaches and Torrey Pines State Reserve just south. The Del Mar Fairgrounds and racetrack bring big summer crowds.",
      "It's close to Sorrento Valley and UTC, which makes it one of the easier coastal commutes to the big job centers.",
    ],
    highlights: ["Torrey Pines State Reserve", "Del Mar Racetrack and Fair", "A walkable village by the beach"],
    tradeoffs: "Among the most expensive places in the county, with very limited inventory and busy summers.",
    tags: ["Upscale", "Beach", "Close to tech jobs"],
    traits: t(2, 3, 1, 3, 2, 2, 3, 2, 2, 3, 0),
  },

  // Inland North County
  {
    slug: "rancho-santa-fe",
    lat: 33.0203,
    lng: -117.2028,
    name: "Rancho Santa Fe",
    region: "Inland North County",
    priceTier: 4,
    tagline: "Estates, eucalyptus and riding trails, ten minutes from the coast.",
    about: [
      "Rancho Santa Fe is a rural, estate community with big lots, horse properties, golf clubs and miles of riding trails. The small village center, the Covenant, has a handful of shops and restaurants.",
      "It's quiet and private, with the beaches of Del Mar and Solana Beach a short drive west.",
    ],
    highlights: ["Equestrian trails", "Golf and country clubs", "Acre plus lots"],
    tradeoffs: "You'll drive for almost everything, and prices are among the highest in the country.",
    tags: ["Estates", "Golf and horses", "Privacy"],
    traits: t(0, 1, 1, 3, 0, 2, 1, 3, 0, 2, 3),
  },
  {
    slug: "carmel-valley",
    lat: 32.944,
    lng: -117.216,
    name: "Carmel Valley",
    region: "Inland North County",
    priceTier: 3,
    tagline: "Newer neighborhoods, parks and shopping, minutes from Del Mar and Sorrento Valley.",
    about: [
      "Carmel Valley is a planned community in the City of San Diego, with newer homes, lots of parks and One Paseo for shopping and dining. Torrey Pines and the Del Mar beaches are a short drive.",
      "It's one of the closest places to live for the Sorrento Valley and UTC job centers.",
    ],
    highlights: ["One Paseo", "Lots of neighborhood parks", "Quick drive to Del Mar beaches"],
    tradeoffs: "Suburban and car dependent, and HOAs and Mello Roos taxes are common, so check those costs.",
    tags: ["Suburban", "Parks", "Close to tech jobs"],
    traits: t(1, 1, 2, 3, 0, 2, 2, 1, 2, 3, 0),
  },
  {
    slug: "4s-ranch",
    lat: 33.016,
    lng: -117.108,
    name: "4S Ranch",
    region: "Inland North County",
    priceTier: 3,
    tagline: "A newer planned community with trails, parks and a neighborhood center.",
    about: [
      "4S Ranch is a master planned community off the 15, with newer single family homes, a lot of parks and trails, and a neighborhood shopping center.",
      "It's an easy drive to the Rancho Bernardo and Poway job areas, with the coast about 25 minutes west.",
    ],
    highlights: ["Trails and open space", "Newer homes", "Close to Rancho Bernardo"],
    tradeoffs: "Car dependent, far from the beach, and HOA and Mello Roos costs are common.",
    tags: ["Newer homes", "Trails", "Suburban"],
    traits: t(1, 0, 1, 2, 0, 2, 1, 1, 1, 3, 0),
  },
  {
    slug: "san-marcos",
    lat: 33.1434,
    lng: -117.1661,
    name: "San Marcos",
    region: "Inland North County",
    priceTier: 2,
    tagline: "A growing inland city with mountain trails, a university and more room for the money.",
    about: [
      "San Marcos sits along the 78 with Cal State San Marcos, newer neighborhoods like San Elijo Hills, and a big network of hiking trails including Double Peak and Owens Peak.",
      "You get more space for the money than on the coast, with Carlsbad and the beaches about 20 minutes away.",
    ],
    highlights: ["Double Peak Park trails", "San Elijo Hills town center", "Cal State San Marcos"],
    tradeoffs: "Warmer and farther from the beach, and the 78 gets congested at rush hour.",
    tags: ["Trails", "More space", "Newer neighborhoods"],
    traits: t(1, 0, 0, 3, 0, 3, 1, 1, 2, 3, 1),
  },
  {
    slug: "escondido",
    lat: 33.1192,
    lng: -117.0864,
    name: "Escondido",
    region: "Inland North County",
    priceTier: 1,
    tagline: "A real downtown, wineries and hills, with some of North County's best values.",
    about: [
      "Escondido has a historic downtown on Grand Avenue, the California Center for the Arts, and easy access to Lake Hodges, Daley Ranch and the San Diego Zoo Safari Park.",
      "It's one of the more affordable places in North County, with everything from older bungalows to homes on larger lots in the hills.",
    ],
    highlights: ["Grand Avenue downtown", "Daley Ranch and Lake Hodges", "Room for larger lots"],
    tradeoffs: "Hotter summers, a longer drive to the coast, and a lot of variation between neighborhoods.",
    tags: ["Value", "Trails", "Larger lots"],
    traits: t(1, 0, 0, 2, 0, 3, 2, 2, 2, 3, 2),
  },

  // Central Coast
  {
    slug: "la-jolla",
    lat: 32.8328,
    lng: -117.2713,
    name: "La Jolla",
    region: "Central Coast",
    priceTier: 4,
    tagline: "Coves, cliffs and a village by the sea, with UCSD next door.",
    about: [
      "La Jolla's village sits above the cove, with galleries, restaurants and the seals and sea lions of La Jolla Cove. La Jolla Shores is one of the friendliest beaches for swimming, kayaking and beginner surf.",
      "Torrey Pines, UCSD and the UTC job center are all close by.",
    ],
    highlights: ["La Jolla Cove and Shores", "Torrey Pines golf and trails", "UCSD and UTC nearby"],
    tradeoffs: "Very expensive, tourist traffic in the village, and limited parking.",
    tags: ["Coastal village", "Surf", "Upscale"],
    traits: t(2, 3, 2, 3, 3, 2, 3, 3, 2, 3, 0),
  },
  {
    slug: "pacific-beach",
    lat: 32.7978,
    lng: -117.24,
    name: "Pacific Beach",
    region: "Central Coast",
    priceTier: 3,
    tagline: "The lively beach neighborhood, with a boardwalk, bars and surf.",
    about: [
      "Pacific Beach, or PB, is San Diego's most social beach neighborhood, with Crystal Pier, a boardwalk for biking and skating, and Garnet Avenue full of bars and restaurants.",
      "North PB and the streets near Kate Sessions Park are quieter, with more single family homes.",
    ],
    highlights: ["The boardwalk and Crystal Pier", "Garnet Avenue nightlife", "Mission Bay next door"],
    tradeoffs: "Busy and loud near Garnet and the beach, especially on summer weekends, and parking is tough.",
    tags: ["Nightlife", "Surf", "Boardwalk"],
    traits: t(2, 3, 2, 2, 3, 1, 3, 0, 3, 2, 0),
  },
  {
    slug: "mission-beach",
    lat: 32.77,
    lng: -117.252,
    name: "Mission Beach",
    region: "Central Coast",
    priceTier: 4,
    tagline: "A narrow strip between the ocean and the bay, made for beach life.",
    about: [
      "Mission Beach is a thin peninsula with the Pacific on one side and Mission Bay on the other. Belmont Park, the boardwalk and walk streets of beach cottages give it a classic summer town feel.",
      "Bayside homes look out on calmer water for paddleboarding and kayaking.",
    ],
    highlights: ["Ocean on one side, bay on the other", "Belmont Park and the boardwalk", "Walk streets"],
    tradeoffs: "Crowded in summer, very little parking, and a lot of vacation rentals.",
    tags: ["Beach life", "Surf", "Bayfront"],
    traits: t(2, 3, 2, 2, 3, 0, 2, 0, 3, 1, 0),
  },
  {
    slug: "point-loma",
    lat: 32.728,
    lng: -117.238,
    name: "Point Loma",
    region: "Central Coast",
    priceTier: 3,
    tagline: "A quiet peninsula with harbor views, sunsets and old established streets.",
    about: [
      "Point Loma wraps around the mouth of San Diego Bay, with neighborhoods like La Playa and Sunset Cliffs, Liberty Station's food hall and parks, and the tide pools at Cabrillo National Monument.",
      "It feels residential and established, with quick access to downtown and the airport.",
    ],
    highlights: ["Sunset Cliffs", "Liberty Station", "Cabrillo National Monument"],
    tradeoffs: "Older housing stock, and only one or two roads in and out of the peninsula.",
    tags: ["Harbor views", "Established", "Close to the airport"],
    traits: t(1, 2, 3, 1, 2, 2, 2, 1, 1, 3, 0),
  },
  {
    slug: "ocean-beach",
    lat: 32.749,
    lng: -117.248,
    name: "Ocean Beach",
    region: "Central Coast",
    priceTier: 3,
    tagline: "Funky, independent and proud of it, with a pier and a main street of local shops.",
    about: [
      "Ocean Beach, or OB, has a long fishing pier, Dog Beach, and Newport Avenue lined with antique shops, taco spots and bars. There's a weekly farmers market and a strong local identity.",
      "It's close to downtown and the airport, and Sunset Cliffs is just south.",
    ],
    highlights: ["OB Pier and Dog Beach", "Newport Avenue", "Wednesday farmers market"],
    tradeoffs: "Small, older homes and some flight path noise depending on the street.",
    tags: ["Surf", "Local shops", "Walkable"],
    traits: t(2, 3, 3, 1, 3, 1, 3, 0, 2, 2, 0),
  },

  // Urban Core
  {
    slug: "little-italy",
    lat: 32.723,
    lng: -117.169,
    name: "Little Italy",
    region: "Urban Core",
    priceTier: 2,
    tagline: "Downtown living with piazzas, a famous farmers market and the bay a few blocks away.",
    about: [
      "Little Italy is one of downtown's most walkable neighborhoods, with Piazza della Famiglia, a long run of restaurants and the Saturday Mercato farmers market. The waterfront and Waterfront Park are a short walk.",
      "Housing is almost all condos and lofts.",
    ],
    highlights: ["Mercato farmers market", "Restaurants on India Street", "Walk to the waterfront"],
    tradeoffs: "Condo living with HOA dues, airport noise, and busy weekends.",
    tags: ["City energy", "Restaurants", "Condos"],
    traits: t(3, 0, 3, 1, 0, 0, 3, 0, 3, 0, 0),
  },
  {
    slug: "north-park",
    lat: 32.748,
    lng: -117.13,
    name: "North Park",
    region: "Urban Core",
    priceTier: 2,
    tagline: "San Diego's go to neighborhood for breweries, restaurants and craftsman bungalows.",
    about: [
      "North Park is packed with independent restaurants, coffee shops and breweries along University Avenue and 30th Street, with Balboa Park on its western edge.",
      "Side streets are lined with craftsman and Spanish style bungalows.",
    ],
    highlights: ["30th Street and University Avenue", "Balboa Park next door", "Craftsman bungalows"],
    tradeoffs: "Parking is tight, older homes need work, and it's a drive to the beach.",
    tags: ["City energy", "Breweries", "Bungalows"],
    traits: t(3, 0, 3, 1, 0, 1, 3, 0, 2, 2, 0),
  },
  {
    slug: "south-park",
    lat: 32.724,
    lng: -117.129,
    name: "South Park",
    region: "Urban Core",
    priceTier: 2,
    tagline: "A quieter, leafy cousin to North Park, with a small main street and historic homes.",
    about: [
      "South Park centers on 30th Street and Juniper and Fern, with a handful of beloved restaurants and shops. Historic craftsman homes line the streets, and Balboa Park is a short walk.",
      "It's walkable and neighborly without North Park's crowds.",
    ],
    highlights: ["Historic craftsman homes", "Walk to Balboa Park", "Small local main street"],
    tradeoffs: "Older homes, limited inventory, and a drive to the coast.",
    tags: ["Historic homes", "Walkable", "Neighborly"],
    traits: t(2, 0, 3, 1, 0, 2, 3, 1, 1, 3, 0),
  },
  {
    slug: "hillcrest",
    lat: 32.748,
    lng: -117.164,
    name: "Hillcrest",
    region: "Urban Core",
    priceTier: 1,
    tagline: "Central, walkable and full of restaurants, minutes from everything.",
    about: [
      "Hillcrest is a dense, walkable neighborhood just north of Balboa Park, with a long stretch of restaurants, bars and shops along University Avenue and Fifth Avenue, plus a big Sunday farmers market.",
      "Housing is mostly condos and apartments, with a few older homes on the edges.",
    ],
    highlights: ["Sunday farmers market", "University and Fifth Avenue", "Close to Balboa Park and downtown"],
    tradeoffs: "Busy, mostly condos, and parking is a challenge.",
    tags: ["City energy", "Restaurants", "Condos"],
    traits: t(3, 0, 3, 1, 0, 1, 3, 0, 3, 1, 0),
  },
  {
    slug: "kensington",
    lat: 32.764,
    lng: -117.106,
    name: "Kensington",
    region: "Urban Core",
    priceTier: 3,
    tagline: "A tucked away pocket of Spanish revival homes above Mission Valley.",
    about: [
      "Kensington is a small, quiet neighborhood of curving streets and Spanish revival homes, with a little village strip on Adams Avenue that has a cafe, a library and the Ken Cinema building.",
      "It's central, with quick access to the 8 and 15.",
    ],
    highlights: ["Spanish revival homes", "Adams Avenue village", "Central location"],
    tradeoffs: "Few homes come up for sale, and there's not much nightlife nearby.",
    tags: ["Historic homes", "Quiet", "Central"],
    traits: t(1, 0, 3, 1, 0, 1, 2, 0, 0, 3, 0),
  },
  {
    slug: "mission-hills",
    lat: 32.752,
    lng: -117.184,
    name: "Mission Hills",
    region: "Urban Core",
    priceTier: 3,
    tagline: "Historic homes on canyon rimmed streets, with views of the bay and downtown.",
    about: [
      "Mission Hills is one of San Diego's oldest neighborhoods, with craftsman and Spanish homes, canyon views, and a small business district on Washington Street and India Street.",
      "Old Town, Little Italy and the airport are all minutes away.",
    ],
    highlights: ["Historic architecture", "Canyon and bay views", "Minutes to downtown and the airport"],
    tradeoffs: "Older homes come with older systems, and some streets sit under the flight path.",
    tags: ["Historic homes", "Views", "Central"],
    traits: t(2, 0, 3, 1, 0, 1, 2, 0, 1, 3, 0),
  },

  // South Bay & Coronado
  {
    slug: "coronado",
    lat: 32.6859,
    lng: -117.1831,
    name: "Coronado",
    region: "South Bay & Coronado",
    priceTier: 4,
    tagline: "A storybook island town with a wide beach, the Hotel del and bikes everywhere.",
    about: [
      "Coronado has one of the widest, calmest beaches in Southern California, the historic Hotel del Coronado, and an Orange Avenue main street that's easy to walk or bike.",
      "It's connected to downtown by the bridge and a ferry, with a strong small town feel.",
    ],
    highlights: ["Coronado Beach and the Hotel del", "Orange Avenue", "Ferry to downtown"],
    tradeoffs: "Very expensive, bridge traffic at rush hour, and busy with visitors.",
    tags: ["Beach", "Small town", "Bikeable"],
    traits: t(2, 3, 2, 0, 2, 1, 3, 3, 2, 3, 0),
  },
  {
    slug: "imperial-beach",
    lat: 32.5839,
    lng: -117.1131,
    name: "Imperial Beach",
    region: "South Bay & Coronado",
    priceTier: 1,
    tagline: "A low key surf town at the south end of the county, with some of the coast's best values.",
    about: [
      "Imperial Beach is a small beach city with a pier, a growing Seacoast Drive and the Tijuana River Estuary trails to the south. It's one of the most affordable ways to live near the sand in San Diego.",
      "Downtown and Coronado are about 20 minutes north.",
    ],
    highlights: ["IB Pier", "Tijuana River Estuary", "Approachable beach prices"],
    tradeoffs: "Ocean water quality closures happen often near the border, so check current conditions.",
    tags: ["Surf town", "Value", "Beach"],
    traits: t(1, 3, 2, 0, 3, 1, 1, 0, 2, 2, 0),
  },
  {
    slug: "chula-vista",
    lat: 32.6401,
    lng: -117.0842,
    name: "Chula Vista",
    region: "South Bay & Coronado",
    priceTier: 1,
    tagline: "A big, varied city with a bayfront, older neighborhoods and newer planned ones.",
    about: [
      "Chula Vista is the county's second largest city, with a growing bayfront, the historic Third Avenue village downtown, and newer master planned areas to the east.",
      "It offers a lot of house for the money compared to the coast.",
    ],
    highlights: ["Third Avenue Village", "Chula Vista bayfront", "A wide range of housing"],
    tradeoffs: "Big differences between neighborhoods, and freeway commutes north can be slow.",
    tags: ["Value", "Variety", "Bayfront"],
    traits: t(1, 1, 2, 0, 0, 2, 1, 2, 2, 3, 1),
  },
  {
    slug: "eastlake",
    lat: 32.643,
    lng: -116.969,
    name: "Eastlake",
    region: "South Bay & Coronado",
    priceTier: 2,
    tagline: "A planned community in eastern Chula Vista with a lake, golf and newer homes.",
    about: [
      "Eastlake is a master planned area with newer homes, a private lake, a golf course and shopping at Otay Ranch Town Center nearby.",
      "It's suburban and organized, with Lower Otay Lake and trails to the east.",
    ],
    highlights: ["Eastlake Country Club", "Newer homes", "Otay Ranch Town Center"],
    tradeoffs: "Far from the beach and downtown, and Mello Roos and HOA costs are common.",
    tags: ["Newer homes", "Golf", "Suburban"],
    traits: t(1, 0, 1, 0, 0, 2, 1, 3, 1, 3, 0),
  },

  // East County
  {
    slug: "la-mesa",
    lat: 32.7678,
    lng: -117.0231,
    name: "La Mesa",
    region: "East County",
    priceTier: 1,
    tagline: "A friendly small city with a walkable village and quick trolley access.",
    about: [
      "La Mesa Village has a classic main street with restaurants, bars and a weekly farmers market, and the trolley connects to downtown and San Diego State.",
      "Neighborhoods like Mount Helix offer bigger lots and views.",
    ],
    highlights: ["La Mesa Village", "Trolley to downtown", "Mount Helix views"],
    tradeoffs: "Warmer than the coast and a drive to the beach.",
    tags: ["Walkable village", "Value", "Transit"],
    traits: t(2, 0, 2, 0, 0, 2, 2, 1, 2, 3, 0),
  },
  {
    slug: "alpine",
    lat: 32.8351,
    lng: -116.7664,
    name: "Alpine",
    region: "East County",
    priceTier: 1,
    tagline: "Mountain town living with big lots, oak trees and starry nights.",
    about: [
      "Alpine is a small mountain community off the 8, with large lots, horse properties and quick access to the Cuyamaca and Laguna Mountains for hiking and camping.",
      "It's quiet and rural, with downtown about 30 minutes west.",
    ],
    highlights: ["Big lots and horse property", "Mountain trails nearby", "Quiet and rural"],
    tradeoffs: "Fire risk and insurance costs are real here, and it's a long drive to the coast.",
    tags: ["Rural", "Land and space", "Trails"],
    traits: t(0, 0, 1, 0, 0, 3, 1, 1, 0, 2, 3),
  },
];

export function getNeighborhood(slug: string) {
  return NEIGHBORHOODS.find((n) => n.slug === slug);
}

export function nearbyNeighborhoods(n: Neighborhood, count = 3) {
  return NEIGHBORHOODS.filter((o) => o.region === n.region && o.slug !== n.slug).slice(0, count);
}
