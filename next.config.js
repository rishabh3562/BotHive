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
  webpack: (config, { isServer }) => {
    // Handle MongoDB module resolution
    if (!isServer) {
      // Client-side: prevent MongoDB imports
      config.resolve.fallback = {
        ...config.resolve.fallback,
        net: false,
        tls: false,
        fs: false,
        dns: false,
        child_process: false,
        aws4: false,
      };
    }
    return config;
  },
};

module.exports = nextConfig;