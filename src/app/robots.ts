import type { MetadataRoute } from 'next';

const siteUrl = 'https://www.lakespringshotels.com.ng';

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: '*',
        allow: '/',
        disallow: ['/admin', '/api', '/login', '/booking/checkout', '/booking/success'],
      },
    ],
    sitemap: `${siteUrl}/sitemap.xml`,
    host: siteUrl,
  };
}
