import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  serverExternalPackages: ["node:sqlite", "bcryptjs"],
  async redirects() {
    return [
      {
        source: "/flower",
        destination: "/flower-bouquets",
        permanent: true,
      },
    ];
  },
};

export default nextConfig;
