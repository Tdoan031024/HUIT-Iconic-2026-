import type { Metadata } from 'next';

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000';
const SITE_NAME = "HUIT's ICONIC 2026";

export const metadata: Metadata = {
  title: `Tin tuc & Thong bao - ${SITE_NAME}`,
  description: `Cap nhat tin tuc, thong bao va hoat dong moi nhat cua ${SITE_NAME}.`,
  keywords: `tin tuc, thong bao cuoc thi, ${SITE_NAME}`,
  alternates: { canonical: `${SITE_URL}/tin-tuc` },
  openGraph: { type: 'website', title: `Tin tuc & Thong bao - ${SITE_NAME}`, description: `Tin tuc va thong bao moi nhat tu ${SITE_NAME}.`, url: `${SITE_URL}/tin-tuc`, siteName: SITE_NAME, locale: 'vi_VN', images: [{ url: `${SITE_URL}/images/og-default.png`, width: 1200, height: 630 }] },
  twitter: { card: 'summary_large_image', title: `Tin tuc - ${SITE_NAME}`, description: `Cap nhat tin tuc moi nhat cua cuoc thi.`, images: [`${SITE_URL}/images/og-default.png`] },
};

export default function TinTucLayout({ children }: { children: React.ReactNode }) { return <>{children}</>; }
