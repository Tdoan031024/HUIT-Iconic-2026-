import type { Metadata } from 'next';

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000';

export const metadata: Metadata = {
  title: 'Giới thiệu cuộc thi - HUIT Startup 2026',
  description: 'Tìm hiểu về cuộc thi khởi nghiệp sáng tạo HUIT Startup 2026, mục tiêu, ý nghĩa và các thông tin cơ bản về cuộc thi khởi nghiệp lớn nhất Trường Đại học Công nghiệp TP.HCM.',
  keywords: 'giới thiệu HUIT Startup, cuộc thi khởi nghiệp, startup HUIT, đổi mới sáng tạo, Đại học Công nghiệp TP.HCM',
  alternates: { canonical: `${SITE_URL}/gioi-thieu` },
  openGraph: {
    type: 'website',
    title: 'Giới thiệu cuộc thi - HUIT Startup 2026',
    description: 'Tìm hiểu về cuộc thi khởi nghiệp sáng tạo HUIT Startup 2026.',
    url: `${SITE_URL}/gioi-thieu`,
    siteName: 'HUIT Startup 2026',
    locale: 'vi_VN',
    images: [{ url: `${SITE_URL}/images/og-default.png`, width: 1200, height: 630 }],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Giới thiệu - HUIT Startup 2026',
    description: 'Tìm hiểu về cuộc thi khởi nghiệp sáng tạo HUIT Startup 2026.',
    images: [`${SITE_URL}/images/og-default.png`],
  },
};

export default function GioiThieuLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
