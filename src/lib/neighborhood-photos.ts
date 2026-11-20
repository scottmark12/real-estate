// One photo per neighborhood, from Unsplash (free to use, credited on the
// page). "placeholder" marks a regional stand-in rather than a photo of that
// exact place — swap those for Mark's own shots first. To use your own,
// drop the file in /public/images/neighborhoods/ and set src to its path.

export type NeighborhoodPhoto = {
  src: string;
  by: string;
  user: string;
  id: string;
  placeholder?: boolean;
};

export const NEIGHBORHOOD_PHOTOS: Record<string, NeighborhoodPhoto> = {
  "oceanside": { src: "https://images.unsplash.com/photo-1681156996604-692741e8f305", by: "Spencer Bergen", user: "spencerbergen", id: "FOxzWrGpauQ" },
  "carlsbad": { src: "https://images.unsplash.com/photo-1632074480971-19241d4d422b", by: "Samantha Jean", user: "samanthadeestudio", id: "7QyFeYIOQAo" },
  "leucadia": { src: "https://images.unsplash.com/photo-1628049898108-5ad8214cb342", by: "Carlos Bastias", user: "bastiascarlos", id: "a-UWalAxRwM", placeholder: true },
  "encinitas": { src: "https://images.unsplash.com/photo-1665017668361-5f1d4169cbe6", by: "Unseen Beaches", user: "unseenbeaches", id: "FDdoex63m1Q" },
  "cardiff": { src: "https://images.unsplash.com/photo-1625757215857-b14986476b38", by: "Katie Bush", user: "katiebush", id: "EYMK4L3q_88", placeholder: true },
  "solana-beach": { src: "https://images.unsplash.com/photo-1566836981997-7c3f148133b3", by: "Maddie Metzger", user: "mmetz711", id: "jGx-IF2wrpY" },
  "la-jolla": { src: "https://images.unsplash.com/photo-1615856530122-bfac378b313b", by: "Alexia Laiter", user: "alaiterg", id: "NQqM9xQgcn8" },
  "pacific-beach": { src: "https://images.unsplash.com/photo-1611459711466-5926ba1a3d43", by: "KC Welch", user: "kcwelch330", id: "gJ0rhpCs3Zs" },
  "mission-beach": { src: "https://images.unsplash.com/photo-1630375604571-4e370942fa65", by: "Sean Mullowney", user: "sean_mullowney", id: "3BgUBmDKwiI" },
  "ocean-beach": { src: "https://images.unsplash.com/photo-1617142584114-730e9bda61b2", by: "Andres Garcia", user: "andrgar", id: "3_ROcQaL1uw", placeholder: true },
  "point-loma": { src: "https://images.unsplash.com/photo-1650149044634-a36c732b256e", by: "Kevin Dunlap", user: "kevinadunlap", id: "1Onumg48GL0" },
  "little-italy": { src: "https://images.unsplash.com/photo-1628237834470-795cf1ec58c7", by: "Kara Peak", user: "karapeakdesign", id: "uQLA85riEJA" },
  "north-park": { src: "https://images.unsplash.com/photo-1574731907493-ab1e5447054b", by: "Taylor Rooney", user: "rooney", id: "z9vnSicY_WA" },
  "hillcrest": { src: "https://images.unsplash.com/photo-1574731947907-b6cb422cbbbd", by: "Taylor Rooney", user: "rooney", id: "4LbH5G4RZ4Q" },
  "coronado": { src: "https://images.unsplash.com/photo-1671683886944-6478e6c84cbc", by: "Ana Lanza", user: "anitalanza", id: "aroQQ_iz0Jg" },
  "imperial-beach": { src: "https://images.unsplash.com/photo-1645217923596-f4d31dd0f548", by: "Trevor Gerzen", user: "tgerz", id: "ZLbQjFrR4MM" },
  "escondido": { src: "https://images.unsplash.com/photo-1635814081683-addf0706c795", by: "Jimmy Hu", user: "woomantsing", id: "qJa5dHPbcPM" },
  "julian": { src: "https://images.unsplash.com/photo-1585248991867-541c4a76cedb", by: "Aubrey Odom", user: "octoberroses", id: "ukTcfBSGxHo" },
  "del-mar": { src: "https://images.unsplash.com/photo-1647670545038-84090e69c79b", by: "KC Welch", user: "kcwelch330", id: "sIncdE6Z7Zs", placeholder: true },
  "carmel-valley": { src: "https://images.unsplash.com/photo-1647670545038-84090e69c79b", by: "KC Welch", user: "kcwelch330", id: "sIncdE6Z7Zs", placeholder: true },
  "south-park": { src: "https://images.unsplash.com/photo-1707078515416-d86759251d21", by: "Caroline Ross", user: "caroline_ross", id: "--bULIJx9ec", placeholder: true },
  "kensington": { src: "https://images.unsplash.com/photo-1707078515416-d86759251d21", by: "Caroline Ross", user: "caroline_ross", id: "--bULIJx9ec", placeholder: true },
  "mission-hills": { src: "https://images.unsplash.com/photo-1707078515416-d86759251d21", by: "Caroline Ross", user: "caroline_ross", id: "--bULIJx9ec", placeholder: true },
  "chula-vista": { src: "https://images.unsplash.com/photo-1641353190354-a1d4c14df4da", by: "Alyssa Best", user: "alyssa_best", id: "4e7h5Fsjh8w", placeholder: true },
  "eastlake": { src: "https://images.unsplash.com/photo-1641353190354-a1d4c14df4da", by: "Alyssa Best", user: "alyssa_best", id: "4e7h5Fsjh8w", placeholder: true },
  "bonita": { src: "https://images.unsplash.com/photo-1641353190354-a1d4c14df4da", by: "Alyssa Best", user: "alyssa_best", id: "4e7h5Fsjh8w", placeholder: true },
  "alpine": { src: "https://images.unsplash.com/photo-1618942239192-9a77c29dd8f8", by: "israel palacio", user: "othentikisra", id: "IZOiAJ6zFG8", placeholder: true },
  "lakeside": { src: "https://images.unsplash.com/photo-1618942239192-9a77c29dd8f8", by: "israel palacio", user: "othentikisra", id: "IZOiAJ6zFG8", placeholder: true },
  "ramona": { src: "https://images.unsplash.com/photo-1618942239192-9a77c29dd8f8", by: "israel palacio", user: "othentikisra", id: "IZOiAJ6zFG8", placeholder: true },
  "santee": { src: "https://images.unsplash.com/photo-1618942239192-9a77c29dd8f8", by: "israel palacio", user: "othentikisra", id: "IZOiAJ6zFG8", placeholder: true },
  "el-cajon": { src: "https://images.unsplash.com/photo-1618942239192-9a77c29dd8f8", by: "israel palacio", user: "othentikisra", id: "IZOiAJ6zFG8", placeholder: true },
  "la-mesa": { src: "https://images.unsplash.com/photo-1618942239192-9a77c29dd8f8", by: "israel palacio", user: "othentikisra", id: "IZOiAJ6zFG8", placeholder: true },
  "fallbrook": { src: "https://images.unsplash.com/photo-1670022291994-7a3a57f7bc6f", by: "Remy K", user: "remy_kreuz", id: "JEfv2vCnNTg", placeholder: true },
  "valley-center": { src: "https://images.unsplash.com/photo-1670022291994-7a3a57f7bc6f", by: "Remy K", user: "remy_kreuz", id: "JEfv2vCnNTg", placeholder: true },
  "san-marcos": { src: "https://images.unsplash.com/photo-1738775764076-952d8a3a65fa", by: "Carolina Ramirez", user: "carolina_25", id: "89jby4tbLpI", placeholder: true },
  "vista": { src: "https://images.unsplash.com/photo-1738775764076-952d8a3a65fa", by: "Carolina Ramirez", user: "carolina_25", id: "89jby4tbLpI", placeholder: true },
  "4s-ranch": { src: "https://images.unsplash.com/photo-1738775764076-952d8a3a65fa", by: "Carolina Ramirez", user: "carolina_25", id: "89jby4tbLpI", placeholder: true },
  "rancho-bernardo": { src: "https://images.unsplash.com/photo-1738775764076-952d8a3a65fa", by: "Carolina Ramirez", user: "carolina_25", id: "89jby4tbLpI", placeholder: true },
  "poway": { src: "https://images.unsplash.com/photo-1738775764076-952d8a3a65fa", by: "Carolina Ramirez", user: "carolina_25", id: "89jby4tbLpI", placeholder: true },
  "rancho-santa-fe": { src: "https://images.unsplash.com/photo-1738775764076-952d8a3a65fa", by: "Carolina Ramirez", user: "carolina_25", id: "89jby4tbLpI", placeholder: true },
  "olivenhain": { src: "https://images.unsplash.com/photo-1738775764076-952d8a3a65fa", by: "Carolina Ramirez", user: "carolina_25", id: "89jby4tbLpI", placeholder: true },
};

export function photoUrl(p: NeighborhoodPhoto, width = 1200) {
  if (!p.src.startsWith("https://images.unsplash.com/")) return p.src;
  return `${p.src}?auto=format&fit=crop&w=${width}&q=75`;
}

export function photoCredit(p: NeighborhoodPhoto) {
  if (!p.src.startsWith("https://images.unsplash.com/")) return null;
  return {
    name: p.by,
    href: `https://unsplash.com/@${p.user}?utm_source=markscott&utm_medium=referral`,
    unsplash: "https://unsplash.com/?utm_source=markscott&utm_medium=referral",
  };
}
