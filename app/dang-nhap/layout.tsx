import type { Metadata } from 'next';

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000';

export const metadata: Metadata = {
  title: "Dang nhap - HUIT's ICONIC 2026",
  description: "Dang nhap de binh chon cho thi sinh yeu thich tai HUIT's ICONIC 2026.",
  robots: 'noindex, nofollow',
  alternates: { canonical: `${SITE_URL}/dang-nhap` },
};

export default function DangNhapLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
