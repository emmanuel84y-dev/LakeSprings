/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    remotePatterns: [
      // Supabase Storage — replace YOUR_PROJECT_REF once you have a project.
      { protocol: 'https', hostname: '**.supabase.co', pathname: '/storage/v1/object/public/**' },
      // Seed-data placeholders only; safe to remove once real photography is uploaded.
      { protocol: 'https', hostname: 'picsum.photos' },
    ],
    // Serve modern formats and keep optimized variants cached for longer.
    formats: ['image/avif', 'image/webp'],
    minimumCacheTTL: 60 * 60 * 24 * 30,
    deviceSizes: [640, 750, 828, 1080, 1200, 1440, 1920],
    imageSizes: [32, 48, 64, 96, 128, 256, 384],
  },
  eslint: { ignoreDuringBuilds: false },
};

export default nextConfig;
