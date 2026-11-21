/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'standalone',
  images: {
    remotePatterns: [
      {
        protocol: 'http',
        hostname: '31.97.69.178',
        port: '8082',
        pathname: '/uploads/**',
      },
    ],
  },
};

module.exports = nextConfig;