'use client';

import { Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import StatusPage from '@/src/components/StatusPage';
import { getStatusPreset } from '@/src/components/status-page-presets';

function UnauthorizedContent() {
  const searchParams = useSearchParams();
  const redirectPath = searchParams?.get('redirect');
  const loginHref = `/dang-nhap${redirectPath ? `?redirect=${encodeURIComponent(redirectPath)}` : ''}`;
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

export default function UnauthorizedPage() {
  return (
    <Suspense fallback={null}>
      <UnauthorizedContent />
    </Suspense>
  );
}
