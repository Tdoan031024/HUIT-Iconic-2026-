import { MetadataRoute } from 'next';

export default function robots(): MetadataRoute.Robots {
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000';

  return {
    rules: [
      {
        userAgent: '*',
        allow: '/',
        disallow: [
          '/admin',
          '/api/',
          '/dang-nhap',
          '/preview',
          '/_next/',
        ],
      },
      {
        // Prevent AI bots from bulk-crawling without attribution
        userAgent: 'GPTBot',
        allow: ['/tin-tuc/', '/thi-sinh/', '/gioi-thieu', '/the-le'],
        disallow: '/api/',
      },
      {
        userAgent: 'Google-Extended',
        allow: '/',
      },
    ],
    sitemap: `${siteUrl}/sitemap.xml`,
    host: siteUrl,
  };
}
