import type { Metadata } from 'next';

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000';
const SITE_NAME = "HUIT's ICONIC 2026";

export const metadata: Metadata = {
  title: `The le & Huong dan tham gia - ${SITE_NAME}`,
  description: `The le cuoc thi, huong dan tham gia va quy dinh binh chon tai ${SITE_NAME}.`,
  keywords: `the le cuoc thi, huong dan tham gia, quy dinh binh chon, ${SITE_NAME}`,
  alternates: { canonical: `${SITE_URL}/the-le` },
  openGraph: { type: 'website', title: `The le & Huong dan tham gia - ${SITE_NAME}`, description: `Thong tin tham gia va binh chon ${SITE_NAME}.`, url: `${SITE_URL}/the-le`, siteName: SITE_NAME, locale: 'vi_VN', images: [{ url: `${SITE_URL}/images/og-default.png`, width: 1200, height: 630 }] },
  twitter: { card: 'summary_large_image', title: `The le - ${SITE_NAME}`, description: `The le va huong dan tham gia ${SITE_NAME}.`, images: [`${SITE_URL}/images/og-default.png`] },
};

export default function TheLeLayout({ children }: { children: React.ReactNode }) { return <>{children}</>; }
