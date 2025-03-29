/** @type {import('next').NextConfig} */
const nextConfig = {
  // Remove output: 'export' as Vercel handles this automatically
  eslint: {
    ignoreDuringBuilds: true,
  },
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'images.unsplash.com',
      },
    ],
  },
};

module.exports = nextConfig;