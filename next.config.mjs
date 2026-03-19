/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    remotePatterns: [
      { hostname: 'res.cloudinary.com' },
      { hostname: 'images.unsplash.com' },
    ],
  },
  experimental: {
    serverComponentsExternalPackages: ['mongoose', 'pdf-parse', 'cloudinary', 'xlsx'],
    instrumentationHook: true,
  },
  webpack: (config, { isServer }) => {
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
    return config;
  },
};

export default nextConfig;
