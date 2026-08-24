'use client';

import StatusPage from '@/src/components/StatusPage';
import { getStatusPreset } from '@/src/components/status-page-presets';

export default function ForbiddenPage() {
  const preset = getStatusPreset(403);

  return (
    <StatusPage
      {...preset}
      actions={[
        { label: 'Đăng nhập', href: '/dang-nhap', variant: 'primary' },
        { label: 'Về trang chủ', href: '/', variant: 'secondary' },
        { label: 'Thử lại', onClick: () => window.location.reload(), variant: 'ghost' },
      ]}
    />
  );
}
