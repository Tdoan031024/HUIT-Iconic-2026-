import type { Metadata } from 'next';

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000';

export const metadata: Metadata = {
  title: 'Lịch trình & Thời gian - HUIT Startup 2026',
  description: 'Xem lịch trình chi tiết các vòng thi, mốc thời gian quan trọng và lịch trình hoạt động của cuộc thi HUIT Startup 2026.',
  keywords: 'lịch trình cuộc thi, mốc thời gian, vòng loại, vòng bán kết, vòng chung kết, HUIT Startup 2026',
  alternates: { canonical: `${SITE_URL}/thoi-gian` },
  openGraph: {
    type: 'website',
    title: 'Lịch trình & Thời gian - HUIT Startup 2026',
    description: 'Xem lịch trình và các mốc thời gian quan trọng của cuộc thi.',
    url: `${SITE_URL}/thoi-gian`,
    siteName: 'HUIT Startup 2026',
    locale: 'vi_VN',
    images: [{ url: `${SITE_URL}/images/og-default.png`, width: 1200, height: 630 }],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Lịch trình - HUIT Startup 2026',
    description: 'Lịch trình các vòng thi của cuộc thi HUIT Startup 2026.',
    images: [`${SITE_URL}/images/og-default.png`],
  },
};

export default function ThoiGianLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
