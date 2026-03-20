import path from 'path'
import { fileURLToPath } from 'url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))

/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    remotePatterns: [
      { hostname: 'res.cloudinary.com' },
      { hostname: 'images.unsplash.com' },
      { hostname: 'plus.unsplash.com' },
      { hostname: '*.unsplash.com' },
      { hostname: 'png.pngtree.com' },
      { hostname: '*.pngtree.com' },
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

export default nextConfig;
