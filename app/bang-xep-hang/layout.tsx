import type { Metadata } from 'next';

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000';
const SITE_NAME = "HUIT's ICONIC 2026";

export const metadata: Metadata = {
  title: `Bang xep hang binh chon - ${SITE_NAME}`,
  description: `Theo doi thu hang va binh chon cho thi sinh yeu thich tai ${SITE_NAME}.`,
  keywords: `bang xep hang, binh chon thi sinh, ${SITE_NAME}`,
  alternates: { canonical: `${SITE_URL}/bang-xep-hang` },
  openGraph: { type: 'website', title: `Bang xep hang binh chon - ${SITE_NAME}`, description: `Theo doi bang xep hang ${SITE_NAME}.`, url: `${SITE_URL}/bang-xep-hang`, siteName: SITE_NAME, locale: 'vi_VN', images: [{ url: `${SITE_URL}/images/og-default.png`, width: 1200, height: 630 }] },
  twitter: { card: 'summary_large_image', title: `Bang xep hang - ${SITE_NAME}`, description: `Theo doi va binh chon cho thi sinh yeu thich.`, images: [`${SITE_URL}/images/og-default.png`] },
};

export default function BangXepHangLayout({ children }: { children: React.ReactNode }) { return <>{children}</>; }
