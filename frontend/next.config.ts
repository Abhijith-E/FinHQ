import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // TypeScript configuration
  typescript: {
    ignoreBuildErrors: false,
  },
  // Optimize package imports for faster dev
  experimental: {
    optimizePackageImports: ["recharts", "lightweight-charts"],
  },
  // Production optimizations
  productionBrowserSourceMaps: false,
  // Turbopack configuration (Next.js 16+ uses Turbopack by default)
  turbopack: {},
};

export default nextConfig;
