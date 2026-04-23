/** @type {import('next').NextConfig} */
const nextConfig = {
  experimental: {
    appDir: true,
  },
  // Ensure proper ES module handling
  webpack: (config, { dev, isServer }) => {
    config.resolve.extensions.push('.ts', '.tsx');
    return config;
  },
};

module.exports = nextConfig;