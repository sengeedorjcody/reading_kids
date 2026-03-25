import path from 'path'
import { fileURLToPath } from 'url'
import withPWAInit from '@ducanh2912/next-pwa'

const __dirname = path.dirname(fileURLToPath(import.meta.url))

const withPWA = withPWAInit({
  dest: 'public',
  cacheOnFrontEndNav: true,
  aggressiveFrontEndNavCaching: true,
  reloadOnOnline: true,
  disable: process.env.NODE_ENV === 'development',
  workboxOptions: {
    disableDevLogs: true,
  },
})

/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    remotePatterns: [
      { protocol: 'https', hostname: '**' },
      { protocol: 'http', hostname: '**' },
    ],
  },
  experimental: {
    serverComponentsExternalPackages: ['mongoose', 'pdf-parse', 'cloudinary', 'xlsx'],
    instrumentationHook: true,
  },
  webpack: (config, { isServer, dev }) => {
    if (isServer) {
      // Prevent webpack from bundling server-only packages that use Node.js built-ins.
      // Required for instrumentation.ts which cannot use serverComponentsExternalPackages.
      const serverOnlyPackages = ['mongoose', 'mongodb', 'cloudinary', 'pdf-parse', 'xlsx'];
      const existingExternals = Array.isArray(config.externals)
        ? config.externals
        : config.externals
        ? [config.externals]
        : [];
      config.externals = [...existingExternals, ...serverOnlyPackages];
    }

    if (dev) {
      config.module.rules.push({
        test: /\.(tsx|jsx)$/,
        include: [path.resolve(__dirname, 'src')],
        use: [path.resolve(__dirname, 'scripts/dev-inspector-loader.js')],
        enforce: 'pre',
      })
    }

    return config;
  },
};

export default withPWA(nextConfig);
