import type { Metadata } from 'next';

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000';

export const metadata: Metadata = {
  title: 'Đăng nhập - HUIT Startup 2026',
  description: 'Đăng nhập vào tài khoản HUIT Startup 2026 để bình chọn cho dự án yêu thích của bạn.',
  robots: 'noindex, nofollow',
  alternates: { canonical: `${SITE_URL}/dang-nhap` },
};

export default function DangNhapLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
