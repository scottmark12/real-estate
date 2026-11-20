import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
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
