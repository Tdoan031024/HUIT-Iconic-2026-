import StatusPage from '@/src/components/StatusPage';
import { getStatusPreset } from '@/src/components/status-page-presets';

export default function Custom500Page() {
  const preset = getStatusPreset(500);

  return (
    <StatusPage
      {...preset}
      actions={[
        { label: 'Thử lại', href: '/500', variant: 'primary' },
        { label: 'Về trang chủ', href: '/', variant: 'secondary' },
      ]}
    />
  );
}
