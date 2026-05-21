import type { NextConfig } from "next";

import path from "path";

const nextConfig: NextConfig = {
  poweredByHeader: false,
  compress: true,
  outputFileTracingRoot: path.join(process.cwd(), ".."),
  images: {
    formats: ['image/avif', 'image/webp'],
    minimumCacheTTL: 60 * 60 * 24 * 30,
    deviceSizes: [640, 750, 828, 1080, 1200, 1920, 2048],
    imageSizes: [16, 32, 48, 64, 96, 128, 256, 384],
  },
  productionBrowserSourceMaps: false,
};

export default nextConfig;
