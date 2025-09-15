/** @type {import('next').NextConfig} */
const nextConfig = {
  experimental: {
    appDir: true,
  },
  webpack: (config) => {
    // Handle .proto files
    config.module.rules.push({
      test: /\.proto$/,
      type: 'asset/source',
    });
    return config;
  },
};

module.exports = nextConfig;