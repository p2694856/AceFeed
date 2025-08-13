import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  reactStrictMode: true,
  eslint: {
    // allow builds to succeed even if there are ESLint errors
    ignoreDuringBuilds: true,
  },

};

export default nextConfig;
