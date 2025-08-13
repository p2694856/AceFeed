// next.config.js
/** @type {import('next').NextConfig} */
module.exports = {
  eslint: {
    // allow production builds to succeed even if your project has ESLint errors
    ignoreDuringBuilds: true,
  },
  // keep any other settings you need here
  reactStrictMode: true,
};

