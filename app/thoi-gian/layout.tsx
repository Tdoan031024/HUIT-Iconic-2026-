import type { Metadata } from 'next';

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000';
const SITE_NAME = "HUIT's ICONIC 2026";

export const metadata: Metadata = {
  title: `Lich trinh & Thoi gian - ${SITE_NAME}`,
  description: `Lich trinh cac vong thi va cac moc thoi gian quan trong cua ${SITE_NAME}.`,
  keywords: `lich trinh cuoc thi, moc thoi gian, vong thi, ${SITE_NAME}`,
  alternates: { canonical: `${SITE_URL}/thoi-gian` },
  openGraph: { type: 'website', title: `Lich trinh & Thoi gian - ${SITE_NAME}`, description: `Theo doi lich trinh ${SITE_NAME}.`, url: `${SITE_URL}/thoi-gian`, siteName: SITE_NAME, locale: 'vi_VN', images: [{ url: `${SITE_URL}/images/og-default.png`, width: 1200, height: 630 }] },
  twitter: { card: 'summary_large_image', title: `Lich trinh - ${SITE_NAME}`, description: `Lich trinh cac vong thi ${SITE_NAME}.`, images: [`${SITE_URL}/images/og-default.png`] },
};

export default function ThoiGianLayout({ children }: { children: React.ReactNode }) { return <>{children}</>; }
