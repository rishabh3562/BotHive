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

// Disable Sentry webpack plugins in CI/test environments to avoid module resolution issues
const shouldDisableSentry = process.env.NODE_ENV === 'test' || !process.env.SENTRY_AUTH_TOKEN;

module.exports = withSentryConfig(
  nextConfig,
  {
    silent: true,
    disableServerWebpackPlugin: shouldDisableSentry,
    disableClientWebpackPlugin: shouldDisableSentry,
  },
  sentryWebpackPluginOptions
);
