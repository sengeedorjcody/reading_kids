import path from 'path'
import { fileURLToPath } from 'url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))

/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    remotePatterns: [
      { hostname: 'res.cloudinary.com' },
      { hostname: 'images.unsplash.com' },
      { hostname: 'png.pngtree.com' },
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
      const serverOnlyPackages = ['mongoose', 'mongodb', 'cloudinary', 'pdf-parse', 'xlsx']
      const existingExternals = Array.isArray(config.externals)
        ? config.externals
        : config.externals
        ? [config.externals]
        : []
      config.externals = [...existingExternals, ...serverOnlyPackages]
    }

    // Inject data-inspector-* attributes into JSX before SWC compiles.
    // This lets react-dev-inspector know which file/line each element maps to.
    if (dev) {
      config.module.rules.push({
        test: /\.(tsx|jsx)$/,
        include: [path.resolve(__dirname, 'src')],
        use: [path.resolve(__dirname, 'scripts/dev-inspector-loader.js')],
        enforce: 'pre', // run before SWC
      })
    }

    return config
  },
}

export default nextConfig
