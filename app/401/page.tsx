'use client';

import { useSearchParams } from 'next/navigation';
import StatusPage from '@/src/components/StatusPage';
import { getStatusPreset } from '@/src/components/status-page-presets';

export default function UnauthorizedPage() {
  const searchParams = useSearchParams();
  const loginHref = `/dang-nhap${searchParams.get('redirect') ? `?redirect=${encodeURIComponent(searchParams.get('redirect') as string)}` : ''}`;
  const preset = getStatusPreset(401);

  return (
    <StatusPage
      {...preset}
      actions={[
        { label: 'Đăng nhập', href: loginHref, variant: 'primary' },
        { label: 'Về trang chủ', href: '/', variant: 'secondary' },
        { label: 'Thử lại', onClick: () => window.location.reload(), variant: 'ghost' },
      ]}
    />
  );
}
