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
  async rewrites() {
    return [
      {
        source: '/api/:path*',
        destination: 'http://api-50tkak3xvgkgqxw7ypy6s3jt-20261113T234129:8080/:path*',
      },
    ];
  },
};

module.exports = nextConfig;