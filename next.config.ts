import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: "standalone",
  typescript: {
    ignoreBuildErrors: true,
  },
  reactStrictMode: false,
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "images.unsplash.com",
        pathname: "/**",
      },
    ],
  },
  // Les pages qui utilisent Supabase (cookies, auth) ne peuvent pas être
  // pré-rendues statiquement. On les force en dynamique.
  experimental: {
    dynamicIO: true,
  },
};

export default nextConfig;
