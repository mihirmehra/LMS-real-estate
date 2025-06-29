/** @type {import('next').NextConfig} */
const nextConfig = {
  eslint: {
    ignoreDuringBuilds: true,
  },
  images: { unoptimized: true },
  env: {
    MONGODB_URI: process.env.MONGODB_URI,
    NEXT_PUBLIC_GOOGLE_CLIENT_ID: process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID,
    NEXT_PUBLIC_GOOGLE_API_KEY: process.env.NEXT_PUBLIC_GOOGLE_API_KEY,
  },
  // Webpack configuration to prevent cache corruption
  webpack: (config, { dev, isServer }) => {
    // Disable webpack cache in development to prevent corruption
    if (dev) {
      config.cache = false;
    }
    
    // Configure cache settings for production
    if (!dev) {
      config.cache = {
        type: 'filesystem',
        buildDependencies: {
          config: [__filename],
        },
        cacheDirectory: '.next/cache/webpack',
        compression: 'gzip',
        hashAlgorithm: 'xxhash64',
      };
    }

    // Optimize chunk splitting to reduce cache invalidation
    if (!isServer) {
      config.optimization = {
        ...config.optimization,
        splitChunks: {
          ...config.optimization.splitChunks,
          cacheGroups: {
            ...config.optimization.splitChunks.cacheGroups,
            vendor: {
              test: /[\\/]node_modules[\\/]/,
              name: 'vendors',
              chunks: 'all',
              priority: 10,
              reuseExistingChunk: true,
            },
          },
        },
      };
    }

    return config;
  },
  // Experimental features to improve caching
  experimental: {
    // Disable SWC file system cache in development
    swcFileReading: false,
    // Enable better error recovery
    optimizePackageImports: ['lucide-react'],
  },
  // Configure build output
  output: 'standalone',
  // Disable source maps in development to reduce cache size
  productionBrowserSourceMaps: false,
};

module.exports = nextConfig;