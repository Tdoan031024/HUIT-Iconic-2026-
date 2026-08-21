import type { Metadata } from 'next';

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000';

export const metadata: Metadata = {
  title: 'Tin tức & Thông báo - HUIT Startup 2026',
  description: 'Cập nhật tin tức mới nhất, thông báo và hoạt động liên quan đến cuộc thi khởi nghiệp sáng tạo HUIT Startup 2026.',
  keywords: 'tin tức HUIT Startup, thông báo cuộc thi, khởi nghiệp, startup, đổi mới sáng tạo',
  alternates: { canonical: `${SITE_URL}/tin-tuc` },
  openGraph: {
    type: 'website',
    title: 'Tin tức & Thông báo - HUIT Startup 2026',
    description: 'Cập nhật tin tức và thông báo mới nhất từ cuộc thi HUIT Startup 2026.',
    url: `${SITE_URL}/tin-tuc`,
    siteName: 'HUIT Startup 2026',
    locale: 'vi_VN',
    images: [{ url: `${SITE_URL}/images/og-default.png`, width: 1200, height: 630 }],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Tin tức - HUIT Startup 2026',
    description: 'Cập nhật tin tức mới nhất từ cuộc thi.',
    images: [`${SITE_URL}/images/og-default.png`],
  },
};

export default function TinTucLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
