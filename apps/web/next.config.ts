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
        source: "/courses/machine-learning/python-data",
        destination: "/courses/machine-learning/projects/python-data",
        permanent: true,
      },
      {
        source: "/courses",
        destination: "/NOTE/CS",
        permanent: true,
      },
      {
        source: "/courses/index",
        destination: "/NOTE/CS",
        permanent: true,
      },
      {
        source: "/index",
        destination: "/",
        permanent: true,
      },
    ];
  },
};

export default nextConfig;
