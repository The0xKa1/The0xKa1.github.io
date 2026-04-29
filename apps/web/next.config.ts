import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    unoptimized: true,
  },
  // ESLint handled separately
  typescript: {
    ignoreBuildErrors: true,
  },
  async redirects() {
    return [
      {
        source: "/index",
        destination: "/",
        permanent: true,
      },
    ];
  },
};

export default nextConfig;
