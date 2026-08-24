'use client';

import StatusPage from '@/src/components/StatusPage';
import { getStatusPreset } from '@/src/components/status-page-presets';

export default function TooManyRequestsPage() {
  const preset = getStatusPreset(429);

  return (
    <StatusPage
      {...preset}
      actions={[
        { label: 'Thử lại', onClick: () => window.location.reload(), variant: 'primary' },
        { label: 'Đăng nhập', href: '/dang-nhap', variant: 'secondary' },
        { label: 'Về trang chủ', href: '/', variant: 'ghost' },
      ]}
    />
  );
}
