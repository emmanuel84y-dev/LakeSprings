type JsonLdProps = {
  data: Record<string, unknown> | Record<string, unknown>[];
};

export function JsonLd({ data }: JsonLdProps) {
  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(data).replace(/</g, '\\u003c') }}
    />
  );
}

export const siteUrl = 'https://www.lakespringshotels.com.ng';

export function hotelJsonLd() {
  return {
    '@context': 'https://schema.org',
    '@graph': [
      {
        '@type': ['Hotel', 'LodgingBusiness'],
        '@id': `${siteUrl}/#hotel`,
        name: 'LakeSprings Hotels',
        url: siteUrl,
        description: 'LakeSprings Hotels is a hotel in Ibadan, Oyo State, Nigeria, offering comfortable rooms and a calm stay beside the lake.',
        address: {
          '@type': 'PostalAddress',
          streetAddress: '14 Agodi Reservoir Road',
          addressLocality: 'Ibadan',
          addressRegion: 'Oyo State',
          addressCountry: 'NG',
        },
      },
      {
        '@type': 'Organization',
        '@id': `${siteUrl}/#organization`,
        name: 'LakeSprings Hotels',
        url: siteUrl,
      },
      {
        '@type': 'WebSite',
        '@id': `${siteUrl}/#website`,
        name: 'LakeSprings Hotels',
        url: siteUrl,
        publisher: { '@id': `${siteUrl}/#organization` },
      },
    ],
  };
}

export function breadcrumbJsonLd(items: { name: string; url: string }[]) {
  return {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: items.map((item, index) => ({
      '@type': 'ListItem',
      position: index + 1,
      name: item.name,
      item: item.url,
    })),
  };
}
