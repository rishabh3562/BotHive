/** @type {import('next').NextConfig} */
const { withSentryConfig } = require('@sentry/nextjs');

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
    // Explicitly resolve TypeScript path aliases for webpack
    // This ensures @/* imports work correctly even when wrapped by Sentry
    const path = require('path');
    config.resolve.alias = {
      ...config.resolve.alias,
      '@': path.resolve(__dirname),
    };

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

const sentryWebpackPluginOptions = {
  org: process.env.SENTRY_ORG,
  project: process.env.SENTRY_PROJECT || 'bothive',
  authToken: process.env.SENTRY_AUTH_TOKEN,
  hideSourceMaps: true,
  transpileClientSDK: true,
  dryRun: !process.env.SENTRY_AUTH_TOKEN,
};

module.exports = withSentryConfig(
  nextConfig,
  {
    silent: true,
    // Disable webpack plugins in CI when no auth token (dryRun handles this)
    disableServerWebpackPlugin: false,
    disableClientWebpackPlugin: false,
  },
  sentryWebpackPluginOptions
);
