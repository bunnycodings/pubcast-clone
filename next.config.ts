import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "pubcastplusstorage132639-prod.s3.ap-southeast-1.amazonaws.com",
      },
      {
        protocol: "https",
        hostname: "resize-img.pubcastplus.com",
      },
    ],
  },
};

export default nextConfig;
