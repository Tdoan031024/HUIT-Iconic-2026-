/**
 * SEO / AEO / GEO Helper Library
 * Generates metadata, Open Graph, Twitter Card and JSON-LD structured data.
 */

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000';
const SITE_NAME = 'HUIT Startup 2026';
const DEFAULT_TITLE = 'HUIT STARTUP 2026 - Đổi mới sáng tạo hướng tới phát triển bền vững';
const DEFAULT_DESC = 'Nền tảng cuộc thi khởi nghiệp sáng tạo HUIT Startup 2026, nơi các dự án tiềm năng được bình chọn và kết nối với nhà đầu tư, doanh nghiệp đồng hành.';
const DEFAULT_OG_IMAGE = `${SITE_URL}/images/og-default.png`;
const ORGANIZER = 'Trường Đại học Công nghiệp TP.HCM (HUIT)';
const ORGANIZER_URL = 'https://www.huit.edu.vn';

// ─── Base Metadata ──────────────────────────────────────────────────────────

export interface PageSEO {
  title?: string;
  description?: string;
  image?: string;
  url?: string;
  type?: 'website' | 'article';
  keywords?: string[];
  noIndex?: boolean;
  publishedAt?: string;
  updatedAt?: string;
  author?: string;
}

export function buildMetadata(seo: PageSEO = {}) {
  const title = seo.title || DEFAULT_TITLE;
  const description = seo.description || DEFAULT_DESC;
  const image = seo.image || DEFAULT_OG_IMAGE;
  const url = seo.url ? `${SITE_URL}${seo.url}` : SITE_URL;
  const type = seo.type || 'website';

  return {
    metadataBase: new URL(SITE_URL),
    title,
    description,
    keywords: seo.keywords?.join(', '),
    robots: seo.noIndex ? 'noindex, nofollow' : 'index, follow',
    alternates: {
      canonical: url,
    },
    openGraph: {
      title,
      description,
      url,
      siteName: SITE_NAME,
      type,
      locale: 'vi_VN',
      images: [
        {
          url: image,
          width: 1200,
          height: 630,
          alt: title,
        },
      ],
    },
    twitter: {
      card: 'summary_large_image' as const,
      title,
      description,
      images: [image],
    },
  };
}

// ─── JSON-LD Helpers ─────────────────────────────────────────────────────────

export function buildOrganizationSchema() {
  return {
    '@context': 'https://schema.org',
    '@type': 'Organization',
    name: ORGANIZER,
    url: ORGANIZER_URL,
    logo: `${SITE_URL}/images/logo-huit.png`,
    sameAs: [
      'https://www.facebook.com/trungtamhotrokhoinghiep.huit',
    ],
    contactPoint: {
      '@type': 'ContactPoint',
      contactType: 'customer support',
      email: 'startup@huit.edu.vn',
    },
  };
}

export function buildWebsiteSchema() {
  return {
    '@context': 'https://schema.org',
    '@type': 'WebSite',
    name: SITE_NAME,
    url: SITE_URL,
    description: DEFAULT_DESC,
    inLanguage: 'vi-VN',
    potentialAction: {
      '@type': 'SearchAction',
      target: {
        '@type': 'EntryPoint',
        urlTemplate: `${SITE_URL}/tin-tuc?search={search_term_string}`,
      },
      'query-input': 'required name=search_term_string',
    },
  };
}

export function buildArticleSchema(post: {
  title: string;
  summary?: string;
  thumbnailUrl?: string;
  createdAt?: string;
  updatedAt?: string;
  slug: string;
  category?: string;
}) {
  return {
    '@context': 'https://schema.org',
    '@type': 'Article',
    headline: post.title,
    description: post.summary || '',
    image: post.thumbnailUrl ? `${SITE_URL}${post.thumbnailUrl}` : DEFAULT_OG_IMAGE,
    datePublished: post.createdAt || new Date().toISOString(),
    dateModified: post.updatedAt || post.createdAt || new Date().toISOString(),
    author: {
      '@type': 'Organization',
      name: ORGANIZER,
      url: ORGANIZER_URL,
    },
    publisher: {
      '@type': 'Organization',
      name: ORGANIZER,
      logo: {
        '@type': 'ImageObject',
        url: `${SITE_URL}/images/logo-huit.png`,
      },
    },
    mainEntityOfPage: {
      '@type': 'WebPage',
      '@id': `${SITE_URL}/tin-tuc/${post.slug}`,
    },
    articleSection: post.category || 'Tin tức',
    inLanguage: 'vi-VN',
  };
}

export function buildBreadcrumbSchema(items: Array<{ name: string; url: string }>) {
  return {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: items.map((item, index) => ({
      '@type': 'ListItem',
      position: index + 1,
      name: item.name,
      item: `${SITE_URL}${item.url}`,
    })),
  };
}

export function buildCandidateSchema(candidate: {
  name: string;
  description?: string;
  sbd: string;
  imageUrl?: string;
  votes?: number;
  sector?: string;
  representativeSchool?: string;
}) {
  return {
    '@context': 'https://schema.org',
    '@type': 'Event',
    name: `Dự án ${candidate.name} - HUIT Startup 2026`,
    description: candidate.description || `Dự án ${candidate.name} tham gia cuộc thi HUIT Startup 2026.`,
    image: candidate.imageUrl || DEFAULT_OG_IMAGE,
    url: `${SITE_URL}/thi-sinh/${candidate.sbd}`,
    startDate: '2026-01-01',
    endDate: '2026-12-31',
    eventStatus: 'https://schema.org/EventScheduled',
    eventAttendanceMode: 'https://schema.org/OnlineEventAttendanceMode',
    organizer: {
      '@type': 'Organization',
      name: ORGANIZER,
      url: ORGANIZER_URL,
    },
    location: {
      '@type': 'VirtualLocation',
      url: SITE_URL,
    },
    about: {
      '@type': 'Thing',
      name: candidate.sector || 'Khởi nghiệp sáng tạo',
    },
  };
}

export function buildFAQSchema(items: Array<{ question: string; answer: string }>) {
  return {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: items.map(({ question, answer }) => ({
      '@type': 'Question',
      name: question,
      acceptedAnswer: {
        '@type': 'Answer',
        text: answer,
      },
    })),
  };
}

export function buildEventSchema(event: {
  name: string;
  description: string;
  startDate: string;
  endDate: string;
  image?: string;
}) {
  return {
    '@context': 'https://schema.org',
    '@type': 'Event',
    name: event.name,
    description: event.description,
    image: event.image || DEFAULT_OG_IMAGE,
    startDate: event.startDate,
    endDate: event.endDate,
    eventStatus: 'https://schema.org/EventScheduled',
    eventAttendanceMode: 'https://schema.org/OnlineEventAttendanceMode',
    location: {
      '@type': 'VirtualLocation',
      url: SITE_URL,
    },
    organizer: {
      '@type': 'Organization',
      name: ORGANIZER,
      url: ORGANIZER_URL,
    },
  };
}
