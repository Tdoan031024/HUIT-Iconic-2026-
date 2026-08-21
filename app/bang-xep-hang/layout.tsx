import type { Metadata } from 'next';

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000';

export const metadata: Metadata = {
  title: 'Bảng xếp hạng bình chọn - HUIT Startup 2026',
  description: 'Theo dõi bảng xếp hạng bình chọn dự án khởi nghiệp tại HUIT Startup 2026. Xem điểm số, thứ hạng và bình chọn cho dự án yêu thích của bạn.',
  keywords: 'bảng xếp hạng, bình chọn startup, xếp hạng dự án, HUIT Startup 2026, điểm bình chọn',
  alternates: { canonical: `${SITE_URL}/bang-xep-hang` },
  openGraph: {
    type: 'website',
    title: 'Bảng xếp hạng bình chọn - HUIT Startup 2026',
    description: 'Theo dõi bảng xếp hạng và bình chọn dự án khởi nghiệp yêu thích.',
    url: `${SITE_URL}/bang-xep-hang`,
    siteName: 'HUIT Startup 2026',
    locale: 'vi_VN',
    images: [{ url: `${SITE_URL}/images/og-default.png`, width: 1200, height: 630 }],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Bảng xếp hạng - HUIT Startup 2026',
    description: 'Theo dõi và bình chọn cho dự án yêu thích của bạn.',
    images: [`${SITE_URL}/images/og-default.png`],
  },
};

export default function BangXepHangLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
