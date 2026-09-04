import type { Metadata } from 'next';

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000';

export const metadata: Metadata = {
  title: 'Giới thiệu Đề án Cuộc thi - HUIT’s ICONIC 2026',
  description: 'Tìm hiểu về Cuộc thi Tìm kiếm Đại sứ Truyền thông HUIT’s ICONIC 2026 do Trường Đại học Công Thương TP.HCM (HUIT) tổ chức. Tôn vinh vẻ đẹp, trí tuệ, tài năng và khả năng truyền cảm hứng của sinh viên.',
  keywords: 'HUIT ICONIC 2026, đại sứ truyền thông HUIT, cuộc thi đại sứ, sinh viên HUIT, Trường Đại học Công Thương TP.HCM, thể lệ HUIT ICONIC',
  alternates: { canonical: `${SITE_URL}/gioi-thieu` },
  openGraph: {
    type: 'website',
    title: 'Giới thiệu Đề án Cuộc thi - HUIT’s ICONIC 2026',
    description: 'Cuộc thi Tìm kiếm Đại sứ Truyền thông Trường Đại học Công Thương TP.HCM - HUIT’s ICONIC 2026.',
    url: `${SITE_URL}/gioi-thieu`,
    siteName: 'HUIT ICONIC 2026',
    locale: 'vi_VN',
    images: [{ url: `${SITE_URL}/images/og-default.png`, width: 1200, height: 630 }],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Giới thiệu Đề án - HUIT’s ICONIC 2026',
    description: 'Cuộc thi Tìm kiếm Đại sứ Truyền thông Trường Đại học Công Thương TP.HCM - HUIT’s ICONIC 2026.',
    images: [`${SITE_URL}/images/og-default.png`],
  },
};

export default function GioiThieuLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
