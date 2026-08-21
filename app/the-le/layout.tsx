import type { Metadata } from 'next';

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000';

export const metadata: Metadata = {
  title: 'Thể lệ & Hướng dẫn tham gia - HUIT Startup 2026',
  description: 'Tìm hiểu thể lệ cuộc thi, hướng dẫn đăng ký dự án và quy định bình chọn tại HUIT Startup 2026.',
  keywords: 'thể lệ cuộc thi, hướng dẫn đăng ký, quy định bình chọn, HUIT Startup 2026',
  alternates: { canonical: `${SITE_URL}/the-le` },
  openGraph: {
    type: 'website',
    title: 'Thể lệ & Hướng dẫn tham gia - HUIT Startup 2026',
    description: 'Tìm hiểu thể lệ cuộc thi và hướng dẫn tham gia bình chọn.',
    url: `${SITE_URL}/the-le`,
    siteName: 'HUIT Startup 2026',
    locale: 'vi_VN',
    images: [{ url: `${SITE_URL}/images/og-default.png`, width: 1200, height: 630 }],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Thể lệ - HUIT Startup 2026',
    description: 'Thể lệ và hướng dẫn tham gia cuộc thi.',
    images: [`${SITE_URL}/images/og-default.png`],
  },
};

export default function TheLeLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
