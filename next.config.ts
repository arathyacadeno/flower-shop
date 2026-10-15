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
      {
        source: "/car-decorations",
        destination: "/our-highlights",
        permanent: true,
      },
      {
        source: "/table-arrangements",
        destination: "/table-decor",
        permanent: true,
      },
      {
        source: "/church-arrangements",
        destination: "/our-highlights",
        permanent: true,
      },
    ];
  },
};

export default nextConfig;
