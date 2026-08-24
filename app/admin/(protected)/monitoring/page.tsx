'use client';

import { useEffect, useState } from 'react';
import { apiUrl } from '../../api';

type MonitoringData = {
  audit: Array<{ id: string; adminUser: string; action: string; targetType: string; details?: string | null; ipAddress?: string | null; createdAt: string }>;
  errors: { total: number; recentCount: number; logs: Array<{ id: string; method: string; path: string; statusCode: number; message: string; ipAddress?: string | null; createdAt: string }> };
};

export default function MonitoringPage() {
  const [data, setData] = useState<MonitoringData | null>(null);
  const [loading, setLoading] = useState(true);

  const load = async () => {
    setLoading(true);
    try {
      const response = await fetch(apiUrl('/api/admin/monitoring'), { cache: 'no-store' });
      if (response.ok) setData(await response.json());
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, []);

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <p className="admin-eyebrow">Bảo mật & vận hành</p>
          <h1 className="admin-page-title">Giám sát hệ thống</h1>
          <p className="admin-page-description">Theo dõi hoạt động quản trị và lỗi API gần đây.</p>
        </div>
        <button type="button" onClick={load} className="admin-button-secondary">Làm mới</button>
      </div>

      <div className="grid gap-4 sm:grid-cols-3">
        {[
          ['Lỗi API trong 24 giờ', data?.errors.recentCount ?? '--'],
          ['Tổng lỗi đã ghi nhận', data?.errors.total ?? '--'],
          ['Hoạt động quản trị', data?.audit.length ?? '--'],
        ].map(([label, value]) => (
          <div key={label} className="admin-card p-5">
            <p className="text-xs font-bold uppercase tracking-wider text-slate-500">{label}</p>
            <p className="mt-2 text-3xl font-black text-slate-900">{loading ? '...' : value}</p>
          </div>
        ))}
      </div>

      <section className="admin-card overflow-hidden">
        <div className="border-b border-slate-200 px-5 py-4"><h2 className="text-sm font-black text-slate-900">Lỗi API</h2></div>
        <div className="overflow-x-auto">
          <table className="dashboard-table">
            <thead><tr><th>Thời gian</th><th>Mã</th><th>Phương thức</th><th>Đường dẫn</th><th>Thông báo</th></tr></thead>
            <tbody>
              {(data?.errors.logs || []).map((item) => (
                <tr key={item.id}><td>{new Date(item.createdAt).toLocaleString('vi-VN')}</td><td><span className="rounded-full bg-rose-50 px-2 py-1 text-xs font-bold text-rose-700">{item.statusCode}</span></td><td>{item.method}</td><td className="font-mono text-xs">{item.path}</td><td>{item.message}</td></tr>
              ))}
              {!loading && !data?.errors.logs.length && <tr><td colSpan={5} className="py-8 text-center text-slate-500">Chưa có lỗi API.</td></tr>}
            </tbody>
          </table>
        </div>
      </section>

      <section className="admin-card overflow-hidden">
        <div className="border-b border-slate-200 px-5 py-4"><h2 className="text-sm font-black text-slate-900">Nhật ký bảo mật</h2></div>
        <div className="overflow-x-auto">
          <table className="dashboard-table">
            <thead><tr><th>Thời gian</th><th>Tài khoản</th><th>Hành động</th><th>Đối tượng</th><th>Chi tiết</th></tr></thead>
            <tbody>
              {(data?.audit || []).map((item) => <tr key={item.id}><td>{new Date(item.createdAt).toLocaleString('vi-VN')}</td><td>{item.adminUser}</td><td className="font-bold">{item.action}</td><td>{item.targetType}</td><td>{item.details || '--'}</td></tr>)}
              {!loading && !data?.audit.length && <tr><td colSpan={5} className="py-8 text-center text-slate-500">Chưa có hoạt động.</td></tr>}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
}
