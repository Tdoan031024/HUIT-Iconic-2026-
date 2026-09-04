'use client';

import { useEffect, useMemo, useState } from 'react';
import { WebUser } from '@/lib/types';
import { apiUrl } from '../../api';
import { useAlert } from '../../AlertProvider';

const providerLabel: Record<string, string> = {
  email: 'Đăng ký thường',
  quick: 'Đăng ký nhanh',
  google: 'Google',
};

function formatDate(value?: string) {
  if (!value) return 'Chưa có';
  try {
    const d = new Date(value);
    const pad = (n: number) => String(n).padStart(2, '0');
    const utc7 = new Date(d.getTime() + 7 * 60 * 60 * 1000);
    return `${pad(utc7.getUTCHours())}:${pad(utc7.getUTCMinutes())} ngày ${pad(utc7.getUTCDate())}/${pad(utc7.getUTCMonth() + 1)}/${utc7.getUTCFullYear()}`;
  } catch {
    return value;
  }
}

function UserModal({
  title,
  form,
  setForm,
  onClose,
  onSubmit,
}: {
  title: string;
  form: Partial<WebUser> & { password?: string };
  setForm: (value: Partial<WebUser> & { password?: string }) => void;
  onClose: () => void;
  onSubmit: (event: React.FormEvent) => void;
}) {
  const update = (key: string, value: any) => {
    setForm({ ...form, [key]: value });
  };

  const inputClass = 'h-10 w-full rounded-lg border border-slate-200 bg-slate-50 px-3 text-xs font-semibold text-slate-800 outline-none transition focus:border-emerald-600 focus:bg-white';
  const labelText = 'text-[10px] font-black uppercase tracking-[0.12em] text-slate-500';

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-950/55 p-4 backdrop-blur-sm" onMouseDown={(event) => event.target === event.currentTarget && onClose()}>
      <form onSubmit={onSubmit} onMouseDown={(event) => event.stopPropagation()} className="mx-auto my-6 w-full max-w-xl rounded-2xl border border-slate-200 bg-white p-5 shadow-2xl animate-in fade-in zoom-in duration-200">
        <div className="flex items-start justify-between gap-4 border-b border-slate-100 pb-4">
          <div>
            <p className="text-[10px] font-black uppercase tracking-[0.18em] text-emerald-700">Tài khoản người dùng</p>
            <h3 className="mt-1 text-lg font-black text-slate-900">{title}</h3>
          </div>
          <button type="button" onClick={onClose} className="rounded-lg border border-slate-200 px-3 py-1.5 text-xs font-bold text-slate-600 hover:border-emerald-600 hover:text-emerald-700">
            Đóng
          </button>
        </div>

        <div className="mt-5 grid grid-cols-1 gap-4 sm:grid-cols-2">
          <label className="space-y-1.5 col-span-2">
            <span className={labelText}>Họ và tên <span className="text-red-500 font-bold">*</span></span>
            <input className={inputClass} value={form.fullName || ''} onChange={(event) => update('fullName', event.target.value)} required />
          </label>
          
          <label className="space-y-1.5 col-span-2 sm:col-span-1">
            <span className={labelText}>Email <span className="text-red-500 font-bold">*</span></span>
            <input type="email" className={inputClass} value={form.email || ''} onChange={(event) => update('email', event.target.value)} required />
          </label>
          
          <label className="space-y-1.5 col-span-2 sm:col-span-1">
            <span className={labelText}>Số điện thoại</span>
            <input type="tel" className={inputClass} value={form.phone || ''} onChange={(event) => update('phone', event.target.value)} placeholder="Ví dụ: 0987654321" />
          </label>

          <label className="space-y-1.5 col-span-2 sm:col-span-1">
            <span className={labelText}>Mật khẩu {title.includes('Thêm') && <span className="text-red-500 font-bold">*</span>}</span>
            <input 
              type="password" 
              className={inputClass} 
              value={form.password || ''} 
              onChange={(event) => update('password', event.target.value)} 
              placeholder={title.includes('Cập nhật') ? 'Để trống nếu không muốn đổi' : 'Nhập mật khẩu'} 
              required={title.includes('Thêm')} 
            />
          </label>

          <label className="space-y-1.5 col-span-2 sm:col-span-1">
            <span className={labelText}>Hình thức đăng ký</span>
            <select className={inputClass} value={form.provider || 'email'} onChange={(event) => update('provider', event.target.value)}>
              <option value="email">Đăng ký thường (email)</option>
              <option value="google">Đăng nhập Google</option>
              <option value="quick">Đăng ký nhanh (quick)</option>
            </select>
          </label>

          <label className="space-y-1.5 col-span-2 sm:col-span-1">
            <span className={labelText}>Trạng thái tài khoản</span>
            <select className={inputClass} value={form.status || 'ACTIVE'} onChange={(event) => update('status', event.target.value)}>
              <option value="ACTIVE">Đang hoạt động</option>
              <option value="LOCKED">Đã khóa</option>
            </select>
          </label>

          <label className="space-y-1.5 col-span-2 sm:col-span-1">
            <span className={labelText}>Đối tượng khán giả</span>
            <select className={inputClass} value={form.audienceType || ''} onChange={(event) => update('audienceType', event.target.value)}>
              <option value="">Chưa chọn</option>
              <option value="Sinh viên HUIT">Sinh viên HUIT</option>
              <option value="Cán bộ / Giảng viên HUIT">Cán bộ / Giảng viên HUIT</option>
              <option value="Cựu sinh viên HUIT">Cựu sinh viên HUIT</option>
              <option value="Khán giả tự do / Bạn bè, người thân thí sinh">Khán giả tự do / Bạn bè, người thân</option>
            </select>
          </label>

          <label className="space-y-1.5 col-span-2 sm:col-span-1">
            <span className={labelText}>Bảng quan tâm</span>
            <select className={inputClass} value={form.contestTable || ''} onChange={(event) => update('contestTable', event.target.value)}>
              <option value="">Chưa chọn bảng</option>
              <option value="ALL">Cả hai bảng (King & Queen)</option>
              <option value="FEMALE">Bảng Nữ (HUIT's Queen)</option>
              <option value="MALE">Bảng Nam (HUIT's King)</option>
            </select>
          </label>

          <label className="space-y-1.5 col-span-2 sm:col-span-1">
            <span className={labelText}>Khoa / Viện trực thuộc</span>
            <input className={inputClass} value={form.faculty || ''} onChange={(event) => update('faculty', event.target.value)} placeholder="Ví dụ: Khoa Công nghệ Thông tin" />
          </label>

          <label className="space-y-1.5 col-span-2 sm:col-span-1">
            <span className={labelText}>Mã số sinh viên (MSSV)</span>
            <input className={inputClass} value={form.studentId || ''} onChange={(event) => update('studentId', event.target.value)} placeholder="Ví dụ: 2001210123" />
          </label>

          <label className="space-y-1.5 col-span-2">
            <span className={labelText}>Đơn vị công tác / Trường học</span>
            <input className={inputClass} value={form.schoolOrCompany || ''} onChange={(event) => update('schoolOrCompany', event.target.value)} placeholder="Ví dụ: Trường Đại học Công Thương TP.HCM" />
          </label>
        </div>

        <div className="mt-6 flex justify-end gap-2 border-t border-slate-100 pt-4">
          <button type="button" onClick={onClose} className="rounded-lg border border-slate-200 bg-white px-4 py-2 text-xs font-bold text-slate-600 hover:border-[#0f766e] hover:text-[#0f766e]">
            Hủy
          </button>
          <button type="submit" className="rounded-lg bg-slate-900 px-4 py-2 text-xs font-bold text-white shadow hover:bg-emerald-700">
            Lưu tài khoản
          </button>
        </div>
      </form>
    </div>
  );
}

function DetailModal({
  user,
  onClose,
}: {
  user: WebUser;
  onClose: () => void;
}) {
  const labelText = 'text-[9px] font-black uppercase tracking-[0.14em] text-slate-400';
  const valText = 'text-xs font-bold text-slate-800 mt-1';

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-950/55 p-4 backdrop-blur-sm" onMouseDown={(event) => event.target === event.currentTarget && onClose()}>
      <div onMouseDown={(event) => event.stopPropagation()} className="mx-auto my-12 w-full max-w-lg rounded-2xl border border-slate-200 bg-white p-6 shadow-2xl animate-in fade-in zoom-in duration-200">
        <div className="flex items-start justify-between gap-4 border-b border-slate-100 pb-4">
          <div className="flex items-center gap-3">
            <span className="grid h-12 w-12 place-items-center rounded-full bg-[#123c34] text-sm font-black text-white shadow">
              {user.fullName.slice(0, 2).toUpperCase()}
            </span>
            <div>
              <p className="text-[10px] font-black uppercase tracking-[0.18em] text-emerald-700">Chi tiết tài khoản</p>
              <h3 className="text-base font-black text-slate-900">{user.fullName}</h3>
            </div>
          </div>
          <button type="button" onClick={onClose} className="rounded-lg border border-slate-200 px-3 py-1.5 text-xs font-bold text-slate-600 hover:border-emerald-600 hover:text-emerald-700">
            Đóng
          </button>
        </div>

        <div className="mt-5 grid grid-cols-2 gap-4">
          <div className="rounded-xl border border-slate-100 bg-slate-50/50 p-3">
            <p className={labelText}>ID Tài khoản</p>
            <p className="text-[11px] font-mono font-bold text-slate-700 mt-1">{user.id}</p>
          </div>
          <div className="rounded-xl border border-[#fceee9] bg-[#fff5f2] p-3">
            <p className="text-[9px] font-black uppercase tracking-[0.14em] text-[#e45136]">Điểm đã bình chọn</p>
            <p className="text-lg font-black text-[#e45136] mt-0.5">{(user.votedPoints || 0).toLocaleString()} điểm</p>
          </div>

          <div className="rounded-xl border border-slate-100 bg-slate-50/50 p-3 col-span-2 sm:col-span-1">
            <p className={labelText}>Địa chỉ Email</p>
            <p className={valText}>{user.email}</p>
          </div>
          <div className="rounded-xl border border-slate-100 bg-slate-50/50 p-3 col-span-2 sm:col-span-1">
            <p className={labelText}>Số điện thoại</p>
            <p className={valText}>{user.phone || 'Chưa cập nhật'}</p>
          </div>

          <div className="rounded-xl border border-slate-100 bg-slate-50/50 p-3 col-span-2 sm:col-span-1">
            <p className={labelText}>Hình thức đăng ký</p>
            <span className="inline-block mt-2 rounded-full border border-[#b9d8cf] bg-[#edf8f4] px-2.5 py-0.5 text-[10px] font-bold text-[#0f766e]">
              {providerLabel[user.provider] || user.provider}
            </span>
          </div>
          <div className="rounded-xl border border-slate-100 bg-slate-50/50 p-3 col-span-2 sm:col-span-1">
            <p className={labelText}>Trạng thái hoạt động</p>
            <span className={`inline-block mt-2 rounded-full border px-2.5 py-0.5 text-[10px] font-bold ${user.status === 'ACTIVE' ? 'border-[#b9d8cf] bg-[#edf8f4] text-[#0f766e]' : 'border-[#f0c9bd] bg-[#fff5f2] text-[#c83f28]'}`}>
              {user.status === 'ACTIVE' ? 'Đang hoạt động' : 'Đã khóa'}
            </span>
          </div>

          <div className="rounded-xl border border-slate-100 bg-slate-50/50 p-3 col-span-2 sm:col-span-1">
            <p className={labelText}>Đối tượng khán giả</p>
            <p className={valText}>{user.audienceType || 'Chưa cập nhật'}</p>
          </div>
          <div className="rounded-xl border border-slate-100 bg-slate-50/50 p-3 col-span-2 sm:col-span-1">
            <p className={labelText}>Bảng theo dõi bình chọn</p>
            <p className={valText}>
              {user.contestTable === 'ALL' && 'Cả hai bảng (King & Queen)'}
              {user.contestTable === 'FEMALE' && "Bảng Nữ (HUIT's Queen)"}
              {user.contestTable === 'MALE' && "Bảng Nam (HUIT's King)"}
              {(!user.contestTable || (user.contestTable !== 'ALL' && user.contestTable !== 'FEMALE' && user.contestTable !== 'MALE')) && (user.contestTable || 'Chưa chọn bảng')}
            </p>
          </div>

          {user.faculty ? (
            <div className="rounded-xl border border-slate-100 bg-slate-50/50 p-3 col-span-2 sm:col-span-1">
              <p className={labelText}>Khoa / Viện trực thuộc</p>
              <p className={valText}>{user.faculty}</p>
            </div>
          ) : null}

          {user.studentId ? (
            <div className="rounded-xl border border-slate-100 bg-slate-50/50 p-3 col-span-2 sm:col-span-1">
              <p className={labelText}>Mã số sinh viên (MSSV)</p>
              <p className={valText}>{user.studentId}</p>
            </div>
          ) : null}

          <div className="rounded-xl border border-slate-100 bg-slate-50/50 p-3 col-span-2 sm:col-span-1">
            <p className={labelText}>Đơn vị / Trường học</p>
            <p className={valText}>{user.schoolOrCompany || 'Chưa cập nhật'}</p>
          </div>

          <div className="rounded-xl border border-slate-100 bg-slate-50/50 p-3 col-span-2 sm:col-span-1">
            <p className={labelText}>Ngày đăng ký tài khoản</p>
            <p className="text-[11px] font-semibold text-slate-600 mt-1">{formatDate(user.registeredAt)}</p>
          </div>
          <div className="rounded-xl border border-slate-100 bg-slate-50/50 p-3 col-span-2 sm:col-span-1">
            <p className={labelText}>Lần đăng nhập cuối</p>
            <p className="text-[11px] font-semibold text-slate-600 mt-1">{formatDate(user.lastLoginAt)}</p>
          </div>
        </div>

        <div className="mt-6 flex justify-end border-t border-slate-100 pt-4">
          <button type="button" onClick={onClose} className="rounded-xl bg-slate-900 px-5 py-2 text-xs font-black text-white hover:bg-emerald-700 transition">
            Đóng chi tiết
          </button>
        </div>
      </div>
    </div>
  );
}
function escapeCSVValue(val: any): string {
  if (val === null || val === undefined) return '';
  let str = String(val);
  if (str.includes(',') || str.includes('"') || str.includes('\n') || str.includes('\r')) {
    str = str.replace(/"/g, '""');
    return `"${str}"`;
  }
  return str;
}

export default function UsersAdminPage() {
  const { showAlert, showConfirm } = useAlert();
  const [users, setUsers] = useState<WebUser[]>([]);
  const [search, setSearch] = useState('');
  const [provider, setProvider] = useState('ALL');
  const [selectedIds, setSelectedIds] = useState<string[]>([]);

  useEffect(() => {
    setSelectedIds([]);
  }, [search, provider]);

  // CRUD States
  const [modalMode, setModalMode] = useState<'add' | 'edit' | 'detail' | null>(null);
  const [selectedUser, setSelectedUser] = useState<WebUser | null>(null);
  const [form, setForm] = useState<Partial<WebUser> & { password?: string }>({});

  const handleExportUsers = () => {
    const headers = [
      'ID',
      'Họ và tên',
      'Email',
      'Số điện thoại',
      'Hình thức đăng ký',
      'Trạng thái tài khoản',
      'Bảng quan tâm',
      'Đơn vị công tác / Trường học',
      'Điểm đã bình chọn',
      'Ngày đăng ký',
      'Đăng nhập cuối'
    ];

    const csvRows = [headers.join(',')];

    for (const u of users) {
      const row = [
        escapeCSVValue(u.id),
        escapeCSVValue(u.fullName),
        escapeCSVValue(u.email),
        escapeCSVValue(u.phone),
        escapeCSVValue(providerLabel[u.provider] || u.provider),
        u.status === 'ACTIVE' ? 'Đang hoạt động' : 'Đã khóa',
        escapeCSVValue(u.contestTable),
        escapeCSVValue(u.schoolOrCompany),
        escapeCSVValue(u.votedPoints || 0),
        escapeCSVValue(u.registeredAt),
        escapeCSVValue(u.lastLoginAt)
      ];
      csvRows.push(row.join(','));
    }

    const csvContent = '\uFEFF' + csvRows.join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', `web_users_export_${new Date().toISOString().slice(0, 10)}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const loadUsers = async () => {
    try {
      const res = await fetch(apiUrl('/api/admin/web-users'));
      if (res.ok) {
        setUsers(await res.json());
      }
    } catch (err) {
      console.error('Lỗi tải danh sách người dùng:', err);
      setUsers([]);
    }
  };

  useEffect(() => {
    loadUsers();
  }, []);

  const openAddModal = () => {
    setForm({
      fullName: '',
      email: '',
      phone: '',
      password: '',
      provider: 'email',
      status: 'ACTIVE',
      contestTable: '',
      schoolOrCompany: '',
    });
    setModalMode('add');
  };

  const openEditModal = (user: WebUser) => {
    setSelectedUser(user);
    setForm({
      fullName: user.fullName,
      email: user.email,
      phone: user.phone || '',
      password: '',
      provider: user.provider,
      status: user.status,
      contestTable: user.contestTable || '',
      schoolOrCompany: user.schoolOrCompany || '',
    });
    setModalMode('edit');
  };

  const openDetailModal = (user: WebUser) => {
    setSelectedUser(user);
    setModalMode('detail');
  };

  const handleDelete = async (id: string) => {
    const ok = await showConfirm(
      'Bạn có chắc chắn muốn xóa người dùng này không? Hành động này không thể hoàn tác.',
      'Xác nhận xóa người dùng',
      'error',
      'Xóa ngay'
    );
    if (!ok) return;
    try {
      const res = await fetch(apiUrl(`/api/admin/web-users/${id}`), {
        method: 'DELETE',
      });
      if (res.ok) {
        showAlert('Xóa người dùng thành công!', 'success');
        loadUsers();
      } else {
        const errorData = await res.json();
        showAlert(errorData.message || 'Xóa người dùng thất bại.', 'error');
      }
    } catch (err) {
      console.error(err);
      showAlert('Đã xảy ra lỗi kết nối đến server.', 'error');
    }
  };

  const handleBulkDelete = async () => {
    if (selectedIds.length === 0) return;
    const ok = await showConfirm(
      `Bạn có chắc chắn muốn xóa ${selectedIds.length} người dùng đã chọn? Hành động này không thể hoàn tác.`,
      'Xác nhận xóa hàng loạt',
      'error',
      `Xóa ${selectedIds.length} người dùng`
    );
    if (!ok) return;

    let successCount = 0;
    let failCount = 0;

    await Promise.all(
      selectedIds.map(async (id) => {
        try {
          const res = await fetch(apiUrl(`/api/admin/web-users/${id}`), { method: 'DELETE' });
          if (res.ok) {
            successCount++;
          } else {
            failCount++;
          }
        } catch (err) {
          console.error(err);
          failCount++;
        }
      })
    );

    showAlert(
      `Đã xóa thành công ${successCount} người dùng.${failCount > 0 ? ` Thất bại ${failCount} người dùng.` : ''}`,
      failCount === 0 ? 'success' : 'warning'
    );
    setSelectedIds([]);
    loadUsers();
  };

  const handleSubmitModal = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.fullName?.trim()) {
      showAlert('Vui lòng nhập họ và tên', 'warning');
      return;
    }
    if (!form.email?.trim()) {
      showAlert('Vui lòng nhập địa chỉ email', 'warning');
      return;
    }

    const isAdd = modalMode === 'add';
    const url = isAdd ? apiUrl('/api/admin/web-users') : apiUrl(`/api/admin/web-users/${selectedUser?.id}`);
    const method = isAdd ? 'POST' : 'PUT';

    try {
      const bodyPayload = { ...form };
      if (!isAdd && !bodyPayload.password) {
        delete bodyPayload.password;
      }

      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(bodyPayload),
      });

      if (res.ok) {
        showAlert(isAdd ? 'Thêm người dùng mới thành công!' : 'Cập nhật thông tin người dùng thành công!', 'success');
        setModalMode(null);
        loadUsers();
      } else {
        const errorData = await res.json();
        alert(errorData.message || 'Thao tác thất bại. Vui lòng kiểm tra lại thông tin.');
      }
    } catch (err) {
      console.error(err);
      alert('Đã xảy ra lỗi kết nối đến server.');
    }
  };

  const filteredUsers = useMemo(() => {
    const keyword = search.trim().toLowerCase();
    return users
      .filter((user) => provider === 'ALL' || user.provider === provider)
      .filter((user) =>
        !keyword ||
        user.fullName.toLowerCase().includes(keyword) ||
        user.email.toLowerCase().includes(keyword) ||
        (user.phone || '').includes(keyword) ||
        (user.schoolOrCompany || '').toLowerCase().includes(keyword)
      );
  }, [provider, search, users]);

  const activeCount = users.filter((user) => user.status === 'ACTIVE').length;
  const googleCount = users.filter((user) => user.provider === 'google').length;

  return (
    <div className="space-y-4">
      <section className="flex flex-col gap-3 rounded-xl border border-[#dce5e1] bg-white p-4 shadow-sm md:flex-row md:items-center md:justify-between">
        <div>
          <p className="text-[10px] font-bold uppercase tracking-[0.16em] text-[#0f766e]">Quản lý người dùng web</p>
          <h2 className="mt-0.5 text-lg font-black text-[#123c34]">Người dùng đã đăng ký ở website chính</h2>
          <p className="text-xs text-[#6b7773] mt-0.5">Theo dõi tài khoản bình chọn, hình thức đăng ký, thông tin liên hệ và lịch sử đăng nhập gần nhất.</p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={handleExportUsers}
            className="inline-flex items-center justify-center gap-1.5 rounded-lg border border-slate-200 bg-white px-3.5 py-2 text-xs font-bold text-slate-700 shadow transition hover:border-[#0f766e] hover:text-[#0f766e] active:scale-[0.98] shrink-0"
          >
            <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="2.5">
              <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
              <polyline points="17 8 12 3 7 8" />
              <line x1="12" y1="3" x2="12" y2="15" />
            </svg>
            Xuất CSV
          </button>
          <button 
            onClick={openAddModal} 
            className="inline-flex items-center justify-center gap-1.5 rounded-lg bg-[#e45136] px-3.5 py-2 text-xs font-bold text-white shadow transition hover:bg-[#c83f28] active:scale-[0.98] shrink-0"
          >
            <span className="text-lg leading-none">+</span>
            Thêm người dùng mới
          </button>
        </div>
      </section>

      <section className="grid grid-cols-1 gap-3 md:grid-cols-4">
        {[
          ['Tổng tài khoản', users.length.toLocaleString()],
          ['Đang hoạt động', activeCount.toLocaleString()],
          ['Đăng nhập Google', googleCount.toLocaleString()],
          ['Kết quả lọc', filteredUsers.length.toLocaleString()],
        ].map(([label, value]) => (
          <div key={label} className="rounded-xl border border-[#dce5e1] bg-white p-4 shadow-sm">
            <p className="text-[10px] font-bold uppercase tracking-[0.14em] text-[#7a8b85]">{label}</p>
            <p className="mt-1 text-2xl font-black text-[#123c34]">{value}</p>
          </div>
        ))}
      </section>

      <section className="rounded-xl border border-[#dce5e1] bg-white shadow-sm">
        <div className="grid gap-3 border-b border-[#edf2f0] p-4 md:grid-cols-[1fr_220px]">
          <input
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            placeholder="Tìm theo họ tên, email, số điện thoại hoặc đơn vị..."
            className="h-10 rounded-lg border border-[#dce5e1] bg-[#fbfdfc] px-3 text-xs font-semibold text-[#18211f] outline-none focus:border-[#0f766e] focus:bg-white"
          />
          <select value={provider} onChange={(event) => setProvider(event.target.value)} className="h-10 rounded-lg border border-[#dce5e1] bg-[#fbfdfc] px-3 text-xs font-bold text-[#52605b] outline-none focus:border-[#0f766e]">
            <option value="ALL">Tất cả hình thức</option>
            <option value="email">Đăng ký thường</option>
            <option value="quick">Đăng ký nhanh</option>
            <option value="google">Google</option>
          </select>
        </div>

        <div className="overflow-x-auto">
          {selectedIds.length > 0 && (
            <div className="flex items-center justify-between border border-rose-100 bg-rose-50/60 px-5 py-3 rounded-t-xl backdrop-blur-sm transition-all duration-300">
              <span className="text-xs font-bold text-rose-700">
                Đã chọn <b className="text-[14px]">{selectedIds.length}</b> tài khoản người dùng
              </span>
              <button
                type="button"
                onClick={handleBulkDelete}
                className="flex items-center gap-1.5 rounded-lg bg-rose-600 hover:bg-rose-700 px-3.5 py-1.5 text-xs font-bold text-white shadow-sm transition"
              >
                <svg viewBox="0 0 24 24" className="h-3.5 w-3.5" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M3 6h18" />
                  <path d="M8 6V4h8v2" />
                  <path d="M19 6l-1 14H6L5 6" />
                </svg>
                Xóa các mục đã chọn
              </button>
            </div>
          )}
          <table className="w-full min-w-[1100px] border-collapse text-left">
            <thead>
              <tr className="border-b border-[#edf2f0] bg-[#fbfdfc] text-[10px] font-black uppercase tracking-[0.12em] text-[#7a8b85]">
                <th className="px-5 py-3 w-10">
                  <input
                    type="checkbox"
                    checked={filteredUsers.length > 0 && selectedIds.length === filteredUsers.length}
                    onChange={(e) => {
                      if (e.target.checked) {
                        setSelectedIds(filteredUsers.map((u) => u.id));
                      } else {
                        setSelectedIds([]);
                      }
                    }}
                    className="rounded border-slate-300 text-teal-600 focus:ring-teal-500 cursor-pointer"
                  />
                </th>
                <th className="px-5 py-3 min-w-[220px]">Tên Người dùng</th>
                <th className="px-5 py-3">Liên hệ</th>
                <th className="px-5 py-3">Đơn vị / bảng</th>
                <th className="px-5 py-3">Hình thức</th>
                <th className="px-5 py-3 text-right">Đã bình chọn</th>
                <th className="px-5 py-3">Ngày đăng ký</th>
                <th className="px-5 py-3 text-center">Hành động</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#edf2f0] text-xs">
              {filteredUsers.map((user) => (
                <tr key={user.id} className="hover:bg-[#edf4f1]/25">
                  <td className="px-5 py-3 w-10">
                    <input
                      type="checkbox"
                      checked={selectedIds.includes(user.id)}
                      onChange={(e) => {
                        if (e.target.checked) {
                          setSelectedIds((prev) => [...prev, user.id]);
                        } else {
                          setSelectedIds((prev) => prev.filter((id) => id !== user.id));
                        }
                      }}
                      className="rounded border-slate-300 text-teal-600 focus:ring-teal-500 cursor-pointer"
                    />
                  </td>
                  <td className="px-5 py-3">
                    <div>
                      <p className="font-black text-[#123c34] whitespace-nowrap">{user.fullName}</p>
                    </div>
                  </td>
                  <td className="px-5 py-3">
                    <p className="font-bold text-[#123c34]">{user.email}</p>
                    <p className="mt-1 text-[11px] text-[#6b7773]">{user.phone || 'Chưa cập nhật SĐT'}</p>
                  </td>
                  <td className="px-5 py-3">
                    <p className="font-bold text-[#52605b]">{user.schoolOrCompany || 'Chưa cập nhật'}</p>
                    <p className="mt-1 text-[11px] text-[#6b7773]">{user.contestTable || 'Chưa chọn bảng thi'}</p>
                  </td>
                  <td className="px-5 py-3">
                    <span className="rounded-full border border-[#b9d8cf] bg-[#edf8f4] px-3 py-1 text-[11px] font-bold text-[#0f766e]">
                      {providerLabel[user.provider] || user.provider}
                    </span>
                  </td>
                  <td className="px-5 py-3 text-right font-black text-[#e45136] text-sm tabular-nums">
                    {(user.votedPoints || 0).toLocaleString()}
                  </td>
                  <td className="px-5 py-3 font-semibold text-[#52605b]">{formatDate(user.registeredAt)}</td>
                  <td className="px-5 py-3">
                    <div className="flex items-center justify-center gap-1.5">
                      <button
                        type="button"
                        onClick={() => openDetailModal(user)}
                        className="grid h-7 w-7 place-items-center rounded-md border border-slate-200 bg-white text-slate-500 hover:border-sky-300 hover:bg-sky-50 hover:text-sky-700 transition"
                        title="Xem chi tiết"
                      >
                        <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                          <path d="M2 12s3-7 10-7 10 7 10 7-3 7-10 7-10-7-10-7Z" />
                          <circle cx="12" cy="12" r="3" />
                        </svg>
                      </button>
                      <button
                        type="button"
                        onClick={() => openEditModal(user)}
                        className="grid h-7 w-7 place-items-center rounded-md border border-emerald-200 bg-emerald-50 text-emerald-700 hover:border-emerald-400 hover:bg-emerald-100 transition"
                        title="Chỉnh sửa"
                      >
                        <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                          <path d="M12 20h9" />
                          <path d="M16.5 3.5a2.12 2.12 0 0 1 3 3L7 19l-4 1 1-4Z" />
                        </svg>
                      </button>
                      <button
                        type="button"
                        onClick={() => handleDelete(user.id)}
                        className="grid h-7 w-7 place-items-center rounded-md border border-red-200 bg-red-50 text-red-600 hover:border-red-400 hover:bg-red-100 transition"
                        title="Xóa tài khoản"
                      >
                        <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                          <path d="M3 6h18" />
                          <path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6" />
                          <path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2" />
                        </svg>
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
              {filteredUsers.length === 0 && (
                <tr>
                  <td colSpan={8} className="px-5 py-10 text-center text-sm font-semibold text-[#7a8b85]">
                    Chưa có người dùng web phù hợp bộ lọc.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </section>

      {(modalMode === 'add' || modalMode === 'edit') && (
        <UserModal
          title={modalMode === 'add' ? 'Thêm người dùng mới' : 'Cập nhật tài khoản'}
          form={form}
          setForm={setForm}
          onClose={() => setModalMode(null)}
          onSubmit={handleSubmitModal}
        />
      )}

      {modalMode === 'detail' && selectedUser && (
        <DetailModal
          user={selectedUser}
          onClose={() => setModalMode(null)}
        />
      )}
    </div>
  );
}
