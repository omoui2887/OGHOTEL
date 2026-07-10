import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: "standalone",
  typescript: {
    // 🔒 Ne pas ignorer les erreurs TypeScript en build — les erreurs de
    // type peuvent masquer des bugs de sécurité (ex: establishment_id wrong type).
    ignoreBuildErrors: false,
  },
  reactStrictMode: true,
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "images.unsplash.com",
        pathname: "/**",
      },
    ],
  },
  // 🔒 Security headers (defense-in-depth)
  async headers() {
    return [
      {
        source: "/(.*)",
        headers: [
          { key: "X-Content-Type-Options", value: "nosniff" },
          { key: "X-Frame-Options", value: "DENY" },
          { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
          {
            key: "Permissions-Policy",
            value: "camera=(), microphone=(), geolocation=()",
          },
          {
            key: "X-DNS-Prefetch-Control",
            value: "on",
          },
        ],
      },
    ];
  },
  // Les pages qui utilisent Supabase (cookies, auth) ne peuvent pas être
  // pré-rendues statiquement. On les force en dynamique.
  experimental: {
    // dynamicIO n'est plus dans le type ExperimentalConfig de Next 16,
    // mais fonctionne à runtime. On garde le cast pour éviter l'erreur TS.
    ...(({ dynamicIO: true }) as Record<string, unknown>),
  },
};

export default nextConfig;
