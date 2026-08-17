/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    remotePatterns: [
      // Supabase Storage — replace YOUR_PROJECT_REF once you have a project.
      { protocol: 'https', hostname: '**.supabase.co', pathname: '/storage/v1/object/public/**' },
      // Seed-data placeholders only; safe to remove once real photography is uploaded.
      { protocol: 'https', hostname: 'picsum.photos' },
    ],
  },
  eslint: { ignoreDuringBuilds: false },
};

export default nextConfig;
