/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  // TODO Remove this bit of configuration
  // Added only to support JIMP 0.16.13 - this package should be updated and this error handled
  webpack: (config, { isServer }) => {
    if (isServer) return config;
    else {
      config.resolve.fallback.fs = false;
      return config;
    }
  },
};

module.exports = nextConfig;
