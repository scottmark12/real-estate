import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    // AVIF first (about half the size of WebP), cached for a month at the edge.
    formats: ["image/avif", "image/webp"],
    minimumCacheTTL: 2678400,
    // Skip the 3840 size: nothing on the site is shown that wide.
    deviceSizes: [640, 828, 1080, 1200, 1920, 2560],
    remotePatterns: [
      { protocol: "https", hostname: "images.unsplash.com" },
      { protocol: "https", hostname: "*.supabase.co" },
      // Premier Agency brokerage logo, shown in the footer.
      {
        protocol: "https",
        hostname: "www.premieragencyre.com",
        pathname: "/images/branding/**",
      },
    ],
  },
};

export default nextConfig;
