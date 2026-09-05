'use client';

import { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { apiUrl, formatAssetUrl } from '../../api';
import { useAlert } from '../../AlertProvider';

type Registration = {
  id: string;
  fullName: string;
  gender: string;
  dateOfBirth?: string;
  faculty?: string;
  major: string;
  className: string;
  studentId: string;
  placeOfBirth: string;
  identityNumber: string;
  identityIssuedDate?: string;
  identityIssuedPlace: string;
  address: string;
  phone: string;
  email: string;
  facebookUrl?: string;
  videoUrl?: string;
  talent?: string;
  achievements?: string;
  selfIntroduction?: string;
  inspirationalMessage?: string;
  facultyIntroduction?: string;
  ambassadorPlan?: string;
  portraitImageUrl: string;
  fullBodyImageUrl: string;
  heightCm?: number;
  weightKg?: number;
  measurementBust?: number;
  measurementWaist?: number;
  measurementHip?: number;
  status: string;
  adminNote?: string;
  assignedSbd?: string;
  candidateId?: string;
  createdAt: string;
};

const statusLabels: Record<string, string> = {
  PENDING: 'Chờ xem xét',
  REVIEWING: 'Đang xem xét',
  APPROVED: 'Đã duyệt',
  REJECTED: 'Từ chối',
};

const statusStyles: Record<string, string> = {
  PENDING: 'border-amber-200 bg-amber-50 text-amber-700',
  REVIEWING: 'border-blue-200 bg-blue-50 text-blue-700',
  APPROVED: 'border-emerald-200 bg-emerald-50 text-emerald-700',
  REJECTED: 'border-rose-200 bg-rose-50 text-rose-700',
};

function date(value?: string) {
  if (!value) return 'Chưa cập nhật';
  try {
    return new Date(value).toLocaleDateString('vi-VN', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
    });
  } catch {
    return value;
  }
}

function dateTime(value?: string) {
  if (!value) return 'Chưa cập nhật';
  try {
    const d = new Date(value);
    const time = d.toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' });
    const dateStr = d.toLocaleDateString('vi-VN', { day: '2-digit', month: '2-digit', year: 'numeric' });
    return `${time} · ${dateStr}`;
  } catch {
    return value;
  }
}

function Info({
  label,
  value,
  isLink = false,
}: {
  label: string;
  value?: string | number | null;
  isLink?: boolean;
}) {
  return (
    <div className="rounded-xl border border-slate-100 bg-slate-50/60 p-3">
      <dt className="text-[10.5px] font-black uppercase tracking-wider text-slate-400">{label}</dt>
      <dd className="mt-1 whitespace-pre-wrap text-xs sm:text-sm font-bold leading-relaxed text-slate-800">
        {value ? (
          isLink ? (
            <a
              href={String(value)}
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center gap-1.5 text-blue-600 underline hover:text-blue-800 break-all"
            >
              {String(value)}
              <svg viewBox="0 0 24 24" className="h-3 w-3 shrink-0" fill="none" stroke="currentColor" strokeWidth="2.5">
                <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6" />
                <polyline points="15 3 21 3 21 9" />
                <line x1="10" y1="14" x2="21" y2="3" />
              </svg>
            </a>
          ) : (
            String(value)
          )
        ) : (
          <span className="text-slate-400 font-normal">Chưa cập nhật</span>
        )}
      </dd>
    </div>
  );
}

function escapeCSV(val: any): string {
  if (val === null || val === undefined) return '""';
  const str = String(val).replace(/"/g, '""');
  return `"${str}"`;
}

export default function RegistrationsPage() {
  const { showAlert, showConfirm } = useAlert();
  const [items, setItems] = useState<Registration[]>([]);
  const [filter, setFilter] = useState('ALL');
  const [genderFilter, setGenderFilter] = useState('ALL');
  const [sbdFilter, setSbdFilter] = useState('ALL');
  const [facultyFilter, setFacultyFilter] = useState('ALL');
  const [search, setSearch] = useState('');
  const [selected, setSelected] = useState<Registration | null>(null);
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  // Note editing in modal
  const [noteInput, setNoteInput] = useState('');
  const [savingNote, setSavingNote] = useState(false);

  // SBD creation modal state
  const [sbdModalOpen, setSbdModalOpen] = useState(false);
  const [inputSbd, setInputSbd] = useState('');
  const [contestTable, setContestTable] = useState('FEMALE');
  const [converting, setConverting] = useState(false);

  // Image preview modal
  const [previewImage, setPreviewImage] = useState<string | null>(null);

  async function load() {
    setLoading(true);
    try {
      const response = await fetch(apiUrl('/api/admin/registrations'));
      if (!response.ok) throw new Error('Không thể tải hồ sơ đăng ký.');
      setItems(await response.json());
    } catch (error: any) {
      showAlert(error.message || 'Lỗi tải danh sách hồ sơ', 'error');
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    load();
  }, []);

  // Update note input when selected modal opens
  useEffect(() => {
    if (selected) {
      setNoteInput(selected.adminNote || '');
    }
  }, [selected]);

  // Unique faculties for filter dropdown
  const uniqueFaculties = useMemo(() => {
    const set = new Set<string>();
    items.forEach((item) => {
      if (item.faculty?.trim()) set.add(item.faculty.trim());
    });
    return Array.from(set).sort();
  }, [items]);

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    return items.filter((item) => {
      if (filter !== 'ALL' && item.status !== filter) return false;
      if (genderFilter !== 'ALL' && item.gender !== genderFilter) return false;
      if (sbdFilter === 'HAS_SBD' && !item.assignedSbd) return false;
      if (sbdFilter === 'NO_SBD' && Boolean(item.assignedSbd)) return false;
      if (facultyFilter !== 'ALL' && item.faculty !== facultyFilter) return false;
      if (q) {
        const hay = `${item.fullName} ${item.email} ${item.studentId} ${item.phone} ${item.faculty || ''} ${item.className || ''} ${item.assignedSbd || ''} ${item.identityNumber || ''}`.toLowerCase();
        if (!hay.includes(q)) return false;
      }
      return true;
    });
  }, [items, filter, genderFilter, sbdFilter, facultyFilter, search]);

  // Clear selections when filter changes
  useEffect(() => {
    setSelectedIds([]);
  }, [filter, genderFilter, sbdFilter, facultyFilter, search]);

  async function updateStatus(status: string, targetItem = selected) {
    if (!targetItem) return;
    setSaving(true);
    try {
      const response = await fetch(apiUrl('/api/admin/registrations'), {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: targetItem.id, status, adminNote: targetItem.adminNote }),
      });
      if (!response.ok) throw new Error('Không thể cập nhật trạng thái.');
      setItems((prev) => prev.map((item) => (item.id === targetItem.id ? { ...item, status } : item)));
      if (selected && selected.id === targetItem.id) {
        setSelected({ ...selected, status });
      }
      showAlert(`Đã cập nhật trạng thái thành: ${statusLabels[status] || status}`, 'success');
    } catch (error: any) {
      showAlert(error.message || 'Lỗi cập nhật trạng thái', 'error');
    } finally {
      setSaving(false);
    }
  }

  async function saveAdminNote() {
    if (!selected) return;
    setSavingNote(true);
    try {
      const response = await fetch(apiUrl('/api/admin/registrations'), {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: selected.id, status: selected.status, adminNote: noteInput }),
      });
      if (!response.ok) throw new Error('Không thể lưu ghi chú.');
      setItems((prev) =>
        prev.map((item) => (item.id === selected.id ? { ...item, adminNote: noteInput } : item))
      );
      setSelected({ ...selected, adminNote: noteInput });
      showAlert('Đã lưu ghi chú quản trị thành công!', 'success');
    } catch (error: any) {
      showAlert(error.message || 'Lỗi khi lưu ghi chú', 'error');
    } finally {
      setSavingNote(false);
    }
  }

  function openApproveModal(reg: Registration) {
    const prefix = reg.gender === 'MALE' ? 'IC-M' : 'IC-F';
    const randomNum = Math.floor(100 + Math.random() * 900);
    setInputSbd(`${prefix}${randomNum}`);
    setContestTable(reg.gender === 'MALE' ? 'MALE' : 'FEMALE');
    setSbdModalOpen(true);
  }

  async function confirmApproveAndConvert() {
    if (!selected) return;
    if (!inputSbd.trim()) {
      showAlert('Vui lòng nhập Số Báo Danh (SBD).', 'warning');
      return;
    }
    setConverting(true);
    try {
      const response = await fetch(apiUrl('/api/admin/registrations'), {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'APPROVE_AND_CONVERT',
          registrationId: selected.id,
          sbd: inputSbd.trim().toUpperCase(),
          contestTable,
        }),
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.message || 'Không thể duyệt hồ sơ.');
      showAlert(data.message || 'Duyệt hồ sơ và cấp SBD tạo thí sinh thành công!', 'success');
      const updatedSbd = inputSbd.trim().toUpperCase();
      const candidateId = data.candidate?.id;
      setItems((prev) =>
        prev.map((item) =>
          item.id === selected.id
            ? { ...item, status: 'APPROVED', assignedSbd: updatedSbd, candidateId }
            : item
        )
      );
      setSelected((prev) =>
        prev ? { ...prev, status: 'APPROVED', assignedSbd: updatedSbd, candidateId } : null
      );
      setSbdModalOpen(false);
    } catch (error: any) {
      showAlert(error.message || 'Lỗi xử lý duyệt hồ sơ.', 'error');
    } finally {
      setConverting(false);
    }
  }

  // Delete single registration
  async function handleDeleteSingle(id: string, name: string) {
    const ok = await showConfirm(
      `Bạn có chắc chắn muốn chuyển hồ sơ đăng ký của "${name}" vào Thùng rác không? Bạn có thể khôi phục lại bất kỳ lúc nào trong vòng 30 ngày.`,
      'Chuyển vào Thùng rác',
      'warning',
      'Xóa vào thùng rác',
      'Hủy'
    );
    if (!ok) return;

    try {
      const res = await fetch(apiUrl('/api/admin/registrations'), {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ids: [id] }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || 'Xóa hồ sơ thất bại.');
      setItems((prev) => prev.filter((item) => item.id !== id));
      setSelectedIds((prev) => prev.filter((i) => i !== id));
      if (selected?.id === id) setSelected(null);
      showAlert(`Đã chuyển hồ sơ của "${name}" vào Thùng rác.`, 'success');
    } catch (err: any) {
      showAlert(err.message || 'Lỗi khi xóa hồ sơ.', 'error');
    }
  }

  // Bulk Delete
  async function handleBulkDelete() {
    if (selectedIds.length === 0) return;
    const ok = await showConfirm(
      `Bạn có chắc chắn muốn chuyển ${selectedIds.length} hồ sơ đăng ký đã chọn vào Thùng rác không? Bạn có thể khôi phục lại trong vòng 30 ngày.`,
      'Chuyển hàng loạt vào Thùng rác',
      'warning',
      `Xóa ${selectedIds.length} hồ sơ`,
      'Hủy'
    );
    if (!ok) return;

    try {
      const res = await fetch(apiUrl('/api/admin/registrations'), {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ids: selectedIds }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || 'Xóa hàng loạt thất bại.');
      setItems((prev) => prev.filter((item) => !selectedIds.includes(item.id)));
      if (selected && selectedIds.includes(selected.id)) setSelected(null);
      showAlert(`Đã chuyển ${selectedIds.length} hồ sơ vào Thùng rác thành công.`, 'success');
      setSelectedIds([]);
    } catch (err: any) {
      showAlert(err.message || 'Lỗi khi xóa hàng loạt.', 'error');
    }
  }

  // Bulk Status Update
  async function handleBulkStatus(newStatus: string) {
    if (selectedIds.length === 0) return;
    const statusLabel = statusLabels[newStatus] || newStatus;
    const ok = await showConfirm(
      `Chuyển ${selectedIds.length} hồ sơ đã chọn sang trạng thái "${statusLabel}"?`,
      'Cập nhật trạng thái hàng loạt',
      'info',
      'Cập nhật',
      'Hủy'
    );
    if (!ok) return;

    try {
      const res = await fetch(apiUrl('/api/admin/registrations'), {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ids: selectedIds, status: newStatus }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || 'Cập nhật trạng thái thất bại.');
      setItems((prev) =>
        prev.map((item) => (selectedIds.includes(item.id) ? { ...item, status: newStatus } : item))
      );
      showAlert(`Đã chuyển ${selectedIds.length} hồ sơ sang "${statusLabel}".`, 'success');
      setSelectedIds([]);
    } catch (err: any) {
      showAlert(err.message || 'Lỗi khi cập nhật hàng loạt.', 'error');
    }
  }

  // Export CSV
  const handleExportCSV = () => {
    if (filtered.length === 0) {
      showAlert('Không có hồ sơ nào để xuất CSV.', 'warning');
      return;
    }

    const headers = [
      'Họ và tên',
      'Giới tính',
      'Ngày sinh',
      'MSSV',
      'Khoa đào tạo',
      'Ngành học',
      'Lớp',
      'Số điện thoại',
      'Email',
      'Nơi sinh',
      'Số CCCD/CMND',
      'Ngày cấp',
      'Nơi cấp',
      'Địa chỉ thường trú',
      'Chiều cao (cm)',
      'Cân nặng (kg)',
      'Vòng 1 (Bust)',
      'Vòng 2 (Waist)',
      'Vòng 3 (Hip)',
      'Năng khiếu',
      'Thành tích',
      'Facebook',
      'Link Video',
      'Giới thiệu bản thân',
      'Thông điệp truyền cảm hứng',
      'Giới thiệu khoa ngành',
      'Kế hoạch đại sứ',
      'Trạng thái hồ sơ',
      'Số báo danh (SBD)',
      'Ghi chú Admin',
      'Ngày nộp hồ sơ',
    ];

    const rows = filtered.map((r) => [
      escapeCSV(r.fullName),
      escapeCSV(r.gender === 'FEMALE' ? 'Nữ' : r.gender === 'MALE' ? 'Nam' : r.gender),
      escapeCSV(date(r.dateOfBirth)),
      escapeCSV(r.studentId),
      escapeCSV(r.faculty || ''),
      escapeCSV(r.major),
      escapeCSV(r.className),
      escapeCSV(r.phone),
      escapeCSV(r.email),
      escapeCSV(r.placeOfBirth),
      escapeCSV(r.identityNumber),
      escapeCSV(date(r.identityIssuedDate)),
      escapeCSV(r.identityIssuedPlace),
      escapeCSV(r.address),
      escapeCSV(r.heightCm || ''),
      escapeCSV(r.weightKg || ''),
      escapeCSV(r.measurementBust || ''),
      escapeCSV(r.measurementWaist || ''),
      escapeCSV(r.measurementHip || ''),
      escapeCSV(r.talent || ''),
      escapeCSV(r.achievements || ''),
      escapeCSV(r.facebookUrl || ''),
      escapeCSV(r.videoUrl || ''),
      escapeCSV(r.selfIntroduction || ''),
      escapeCSV(r.inspirationalMessage || ''),
      escapeCSV(r.facultyIntroduction || ''),
      escapeCSV(r.ambassadorPlan || ''),
      escapeCSV(statusLabels[r.status] || r.status),
      escapeCSV(r.assignedSbd || ''),
      escapeCSV(r.adminNote || ''),
      escapeCSV(dateTime(r.createdAt)),
    ]);

    const csvContent = '\uFEFF' + [headers.join(','), ...rows.map((e) => e.join(','))].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', `danh_sach_ho_so_dang_ky_iconic_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    showAlert(`Đã xuất file CSV gồm ${filtered.length} hồ sơ thành công!`, 'success');
  };

  return (
    <div className="space-y-4">
      {/* HEADER & CONTROLS */}
      <div className="flex flex-col justify-between gap-3 sm:flex-row sm:items-center">
        <div>
          <p className="text-[11px] font-black uppercase tracking-[.18em] text-blue-600">Tuyển chọn HUIT&apos;s ICONIC 2026</p>
          <h1 className="mt-1 text-xl sm:text-2xl font-black tracking-tight text-slate-950">Hồ sơ đăng ký</h1>
          <p className="mt-0.5 text-xs text-slate-500">
            Quản lý, duyệt hồ sơ trực tuyến, cấp Số Báo Danh và xuất dữ liệu thí sinh dự thi.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2 shrink-0">
          <button
            type="button"
            onClick={load}
            disabled={loading}
            className="cursor-pointer inline-flex items-center gap-1.5 rounded-xl border border-slate-200 bg-white px-3.5 py-2 text-xs font-bold text-slate-700 hover:bg-slate-50 shadow-2xs transition"
            title="Tải lại danh sách"
          >
            <svg viewBox="0 0 24 24" className={`h-3.5 w-3.5 ${loading ? 'animate-spin' : ''}`} fill="none" stroke="currentColor" strokeWidth="2.5">
              <path d="M23 4v6h-6" />
              <path d="M1 20v-6h6" />
              <path d="M3.51 9a9 9 0 0 1 14.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0 0 20.49 15" />
            </svg>
            Làm mới
          </button>

          <button
            type="button"
            onClick={handleExportCSV}
            className="cursor-pointer inline-flex items-center gap-1.5 rounded-xl border border-slate-200 bg-white px-3.5 py-2 text-xs font-bold text-slate-700 hover:border-slate-300 hover:bg-slate-50 shadow-2xs transition"
          >
            <svg viewBox="0 0 24 24" className="h-3.5 w-3.5 text-emerald-600" fill="none" stroke="currentColor" strokeWidth="2.5">
              <path d="M4 12v8a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-8" />
              <polyline points="16 6 12 2 8 6" />
              <line x1="12" y1="2" x2="12" y2="15" />
            </svg>
            Xuất CSV ({filtered.length})
          </button>
        </div>
      </div>

      {/* THỐNG KÊ NHANH CÓ THỂ CLICK LỌC */}
      <div className="grid grid-cols-2 gap-2.5 sm:grid-cols-5">
        <button
          type="button"
          onClick={() => setFilter('ALL')}
          className={`cursor-pointer rounded-2xl border p-3.5 text-left transition ${
            filter === 'ALL'
              ? 'border-blue-500 bg-blue-50/50 shadow-sm ring-2 ring-blue-500/20'
              : 'border-slate-200/80 bg-white hover:border-slate-300'
          }`}
        >
          <p className="text-[10px] font-black uppercase tracking-wider text-slate-400">Tất cả hồ sơ</p>
          <p className="mt-1 text-2xl font-black text-slate-900">{items.length}</p>
          <p className="mt-0.5 text-[10.5px] font-semibold text-slate-500">Toàn bộ hồ sơ</p>
        </button>

        <button
          type="button"
          onClick={() => setFilter('PENDING')}
          className={`cursor-pointer rounded-2xl border p-3.5 text-left transition ${
            filter === 'PENDING'
              ? 'border-amber-500 bg-amber-50/50 shadow-sm ring-2 ring-amber-500/20'
              : 'border-slate-200/80 bg-white hover:border-amber-300'
          }`}
        >
          <p className="text-[10px] font-black uppercase tracking-wider text-amber-600">Chờ xem xét</p>
          <p className="mt-1 text-2xl font-black text-amber-600">
            {items.filter((i) => i.status === 'PENDING').length}
          </p>
          <p className="mt-0.5 text-[10.5px] font-semibold text-slate-500">Cần phản hồi</p>
        </button>

        <button
          type="button"
          onClick={() => setFilter('REVIEWING')}
          className={`cursor-pointer rounded-2xl border p-3.5 text-left transition ${
            filter === 'REVIEWING'
              ? 'border-blue-500 bg-blue-50/50 shadow-sm ring-2 ring-blue-500/20'
              : 'border-slate-200/80 bg-white hover:border-blue-300'
          }`}
        >
          <p className="text-[10px] font-black uppercase tracking-wider text-blue-600">Đang xem xét</p>
          <p className="mt-1 text-2xl font-black text-blue-600">
            {items.filter((i) => i.status === 'REVIEWING').length}
          </p>
          <p className="mt-0.5 text-[10.5px] font-semibold text-slate-500">Đang đối soát</p>
        </button>

        <button
          type="button"
          onClick={() => setFilter('APPROVED')}
          className={`cursor-pointer rounded-2xl border p-3.5 text-left transition ${
            filter === 'APPROVED'
              ? 'border-emerald-500 bg-emerald-50/50 shadow-sm ring-2 ring-emerald-500/20'
              : 'border-slate-200/80 bg-white hover:border-emerald-300'
          }`}
        >
          <p className="text-[10px] font-black uppercase tracking-wider text-emerald-600">Đã duyệt / Cấp SBD</p>
          <p className="mt-1 text-2xl font-black text-emerald-600">
            {items.filter((i) => i.status === 'APPROVED').length}
          </p>
          <p className="mt-0.5 text-[10.5px] font-semibold text-slate-500">
            {items.filter((i) => Boolean(i.assignedSbd)).length} đã có SBD
          </p>
        </button>

        <button
          type="button"
          onClick={() => setFilter('REJECTED')}
          className={`cursor-pointer rounded-2xl border p-3.5 text-left transition col-span-2 sm:col-span-1 ${
            filter === 'REJECTED'
              ? 'border-rose-500 bg-rose-50/50 shadow-sm ring-2 ring-rose-500/20'
              : 'border-slate-200/80 bg-white hover:border-rose-300'
          }`}
        >
          <p className="text-[10px] font-black uppercase tracking-wider text-rose-600">Từ chối</p>
          <p className="mt-1 text-2xl font-black text-rose-600">
            {items.filter((i) => i.status === 'REJECTED').length}
          </p>
          <p className="mt-0.5 text-[10.5px] font-semibold text-slate-500">Không đạt yêu cầu</p>
        </button>
      </div>

      {/* THANH TÌM KIẾM & BỘ LỌC ĐA NĂNG */}
      <div className="rounded-2xl border border-slate-200 bg-white p-3.5 shadow-sm space-y-3">
        <div className="flex flex-col gap-2.5 sm:flex-row sm:items-center">
          <div className="relative flex-1">
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Tìm theo họ tên, SBD, MSSV, khoa, lớp, email, điện thoại, CCCD..."
              className="h-9 w-full rounded-xl border border-slate-200 pl-9 pr-3.5 text-xs outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
            />
            <svg
              viewBox="0 0 24 24"
              className="absolute left-3 top-2.5 h-4 w-4 text-slate-400"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
            >
              <circle cx="11" cy="11" r="8" />
              <line x1="21" y1="21" x2="16.65" y2="16.65" />
            </svg>
            {search && (
              <button
                type="button"
                onClick={() => setSearch('')}
                className="absolute right-2.5 top-2 text-xs text-slate-400 hover:text-slate-600"
              >
                ✕
              </button>
            )}
          </div>

          <div className="flex flex-wrap items-center gap-2">
            {/* Lọc Trạng thái */}
            <select
              value={filter}
              onChange={(e) => setFilter(e.target.value)}
              className="h-9 rounded-xl border border-slate-200 bg-slate-50/50 px-3 text-xs font-bold text-slate-700 outline-none focus:border-blue-500"
            >
              <option value="ALL">Tất cả trạng thái</option>
              <option value="PENDING">Chờ xem xét</option>
              <option value="REVIEWING">Đang xem xét</option>
              <option value="APPROVED">Đã duyệt</option>
              <option value="REJECTED">Từ chối</option>
            </select>

            {/* Lọc Giới tính */}
            <select
              value={genderFilter}
              onChange={(e) => setGenderFilter(e.target.value)}
              className="h-9 rounded-xl border border-slate-200 bg-slate-50/50 px-3 text-xs font-bold text-slate-700 outline-none focus:border-blue-500"
            >
              <option value="ALL">Tất cả giới tính</option>
              <option value="FEMALE">Nữ ♀</option>
              <option value="MALE">Nam ♂</option>
            </select>

            {/* Lọc SBD */}
            <select
              value={sbdFilter}
              onChange={(e) => setSbdFilter(e.target.value)}
              className="h-9 rounded-xl border border-slate-200 bg-slate-50/50 px-3 text-xs font-bold text-slate-700 outline-none focus:border-blue-500"
            >
              <option value="ALL">Tất cả SBD</option>
              <option value="HAS_SBD">✓ Đã cấp SBD</option>
              <option value="NO_SBD">○ Chưa cấp SBD</option>
            </select>

            {/* Lọc Khoa */}
            {uniqueFaculties.length > 0 && (
              <select
                value={facultyFilter}
                onChange={(e) => setFacultyFilter(e.target.value)}
                className="h-9 max-w-[180px] truncate rounded-xl border border-slate-200 bg-slate-50/50 px-3 text-xs font-bold text-slate-700 outline-none focus:border-blue-500"
              >
                <option value="ALL">Tất cả khoa ({uniqueFaculties.length})</option>
                {uniqueFaculties.map((f) => (
                  <option key={f} value={f}>
                    {f}
                  </option>
                ))}
              </select>
            )}
          </div>
        </div>

        {/* THANH THAO TÁC HÀNG LOẠT (KHI CÓ CHỌN DÒNG) */}
        {selectedIds.length > 0 && (
          <div className="flex flex-wrap items-center justify-between gap-2 rounded-xl bg-blue-50/80 border border-blue-200 p-2.5 text-xs text-blue-900 animate-in fade-in">
            <div className="flex items-center gap-2">
              <span className="font-bold">
                Đã chọn <span className="font-black text-blue-700">{selectedIds.length}</span> hồ sơ
              </span>
              <button
                type="button"
                onClick={() => setSelectedIds([])}
                className="text-[11px] text-blue-600 underline hover:text-blue-800 cursor-pointer"
              >
                Bỏ chọn
              </button>
            </div>

            <div className="flex flex-wrap items-center gap-1.5">
              <button
                type="button"
                onClick={() => handleBulkStatus('REVIEWING')}
                className="cursor-pointer rounded-lg border border-blue-300 bg-white px-2.5 py-1 text-xs font-bold text-blue-700 hover:bg-blue-100 transition"
              >
                Chuyển sang Xem xét
              </button>
              <button
                type="button"
                onClick={() => handleBulkStatus('REJECTED')}
                className="cursor-pointer rounded-lg border border-rose-300 bg-white px-2.5 py-1 text-xs font-bold text-rose-700 hover:bg-rose-50 transition"
              >
                Từ chối hàng loạt
              </button>
              <button
                type="button"
                onClick={handleBulkDelete}
                className="cursor-pointer rounded-lg bg-rose-600 px-3 py-1 text-xs font-bold text-white hover:bg-rose-700 shadow-2xs transition"
              >
                Xóa {selectedIds.length} mục
              </button>
            </div>
          </div>
        )}
      </div>

      {/* BẢNG DỮ LIỆU CHÍNH */}
      <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
        <div className="overflow-x-auto">
          <table className="min-w-[1000px] w-full text-left">
            <thead className="bg-slate-50 text-[12px] font-bold text-slate-700 border-b border-slate-200">
              <tr>
                <th className="px-3 py-3 w-10 text-center">
                  <input
                    type="checkbox"
                    checked={filtered.length > 0 && selectedIds.length === filtered.length}
                    onChange={(e) => {
                      if (e.target.checked) {
                        setSelectedIds(filtered.map((item) => item.id));
                      } else {
                        setSelectedIds([]);
                      }
                    }}
                    className="h-4 w-4 rounded border-slate-300 text-blue-600 focus:ring-blue-500 cursor-pointer"
                  />
                </th>
                <th className="px-3.5 py-3">Hồ sơ ứng viên</th>
                <th className="px-3.5 py-3">Khoa / Lớp</th>
                <th className="px-3.5 py-3">Thông tin liên hệ</th>
                <th className="px-3.5 py-3">Chiều cao / Cân nặng</th>
                <th className="px-3.5 py-3">Video giới thiệu</th>
                <th className="px-3.5 py-3">Trạng thái / SBD</th>
                <th className="px-3.5 py-3">Ngày nộp hồ sơ</th>
                <th className="px-3.5 py-3 text-right">Thao tác</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-xs">
              {loading ? (
                <tr>
                  <td colSpan={9} className="px-5 py-16 text-center text-sm font-semibold text-slate-500">
                    <div className="flex flex-col items-center justify-center gap-2">
                      <div className="h-6 w-6 animate-spin rounded-full border-2 border-blue-600 border-t-transparent" />
                      <span>Đang tải danh sách hồ sơ đăng ký...</span>
                    </div>
                  </td>
                </tr>
              ) : filtered.length === 0 ? (
                <tr>
                  <td colSpan={9} className="px-5 py-16 text-center text-sm font-semibold text-slate-500">
                    Không tìm thấy hồ sơ đăng ký nào phù hợp bộ lọc.
                  </td>
                </tr>
              ) : (
                filtered.map((item) => {
                  const isSelectedRow = selectedIds.includes(item.id);
                  const isFemale = item.gender === 'FEMALE';
                  return (
                    <tr
                      key={item.id}
                      className={`align-middle transition hover:bg-slate-50/80 ${
                        isSelectedRow ? 'bg-blue-50/30' : ''
                      }`}
                    >
                      <td className="px-3 py-3 w-10 text-center">
                        <input
                          type="checkbox"
                          checked={isSelectedRow}
                          onChange={(e) => {
                            if (e.target.checked) {
                              setSelectedIds((prev) => [...prev, item.id]);
                            } else {
                              setSelectedIds((prev) => prev.filter((id) => id !== item.id));
                            }
                          }}
                          className="h-4 w-4 rounded border-slate-300 text-blue-600 focus:ring-blue-500 cursor-pointer"
                        />
                      </td>
                      <td className="px-3.5 py-3">
                        <div className="flex min-w-[210px] items-center gap-3">
                          <button
                            type="button"
                            onClick={() => setPreviewImage(formatAssetUrl(item.portraitImageUrl))}
                            className="cursor-pointer relative h-12 w-10 shrink-0 rounded-lg border border-slate-200 overflow-hidden shadow-2xs group"
                            title="Bấm để xem ảnh phóng to"
                          >
                            <img
                              src={formatAssetUrl(item.portraitImageUrl)}
                              alt={item.fullName}
                              className="h-full w-full object-cover group-hover:scale-105 transition"
                            />
                          </button>
                          <div className="min-w-0">
                            <p
                              onClick={() => setSelected(item)}
                              className="truncate text-[13.5px] font-black text-slate-900 hover:text-blue-600 cursor-pointer"
                            >
                              {item.fullName}
                            </p>
                            <div className="mt-0.5 flex items-center gap-1.5 text-[11px]">
                              <span className="font-bold text-slate-500">MSSV: {item.studentId}</span>
                              <span className="text-slate-300">•</span>
                              <span className={`font-bold ${isFemale ? 'text-pink-600' : 'text-blue-600'}`}>
                                {isFemale ? 'Nữ ♀' : 'Nam ♂'}
                              </span>
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="px-3.5 py-3 min-w-[160px]">
                        <p className="font-bold text-slate-900 truncate">{item.faculty || item.major}</p>
                        <p className="mt-0.5 text-[11px] text-slate-500 truncate">
                          {item.major} · Lớp {item.className}
                        </p>
                      </td>
                      <td className="px-3.5 py-3 min-w-[150px]">
                        <p className="font-bold text-slate-800">
                          <a href={`tel:${item.phone}`} className="hover:text-blue-600">
                            {item.phone}
                          </a>
                        </p>
                        <p className="mt-0.5 text-[11px] text-slate-500 truncate">
                          <a href={`mailto:${item.email}`} className="hover:text-blue-600">
                            {item.email}
                          </a>
                        </p>
                      </td>
                      <td className="px-3.5 py-3 whitespace-nowrap">
                        <p className="font-bold text-slate-800">
                          {item.heightCm || '-'} cm · {item.weightKg || '-'} kg
                        </p>
                        {(item.measurementBust || item.measurementWaist || item.measurementHip) && (
                          <p className="mt-0.5 text-[10.5px] font-semibold text-slate-500">
                            Số đo: {item.measurementBust || '-'}-{item.measurementWaist || '-'}-{item.measurementHip || '-'}
                          </p>
                        )}
                      </td>
                      <td className="px-3.5 py-3 whitespace-nowrap">
                        {item.videoUrl ? (
                          <a
                            href={item.videoUrl}
                            target="_blank"
                            rel="noreferrer"
                            className="inline-flex items-center gap-1 rounded-lg bg-blue-50 px-2.5 py-1 text-xs font-bold text-blue-700 hover:bg-blue-100 transition"
                          >
                            <svg viewBox="0 0 24 24" className="h-3.5 w-3.5" fill="none" stroke="currentColor" strokeWidth="2">
                              <polygon points="5 3 19 12 5 21 5 3" />
                            </svg>
                            Xem video
                          </a>
                        ) : (
                          <span className="text-slate-400 font-medium">Chưa có</span>
                        )}
                      </td>
                      <td className="px-3.5 py-3 whitespace-nowrap">
                        <div className="flex flex-col gap-1">
                          <span
                            className={`inline-flex w-fit rounded-full border px-2.5 py-0.5 text-[10.5px] font-black ${
                              statusStyles[item.status] || statusStyles.PENDING
                            }`}
                          >
                            {statusLabels[item.status] || item.status}
                          </span>
                          {item.assignedSbd && (
                            <span className="inline-flex w-fit rounded-full bg-emerald-600 px-2.5 py-0.5 text-[10.5px] font-black text-white shadow-2xs">
                              SBD: {item.assignedSbd}
                            </span>
                          )}
                        </div>
                      </td>
                      <td className="px-3.5 py-3 text-[11px] font-semibold text-slate-500 whitespace-nowrap">
                        {dateTime(item.createdAt)}
                      </td>
                      <td className="px-3.5 py-3 text-right whitespace-nowrap">
                        <div className="flex items-center justify-end gap-1.5">
                          <button
                            type="button"
                            onClick={() => setSelected(item)}
                            className="cursor-pointer rounded-lg border border-slate-200 bg-white px-2.5 py-1.5 text-xs font-bold text-blue-700 hover:border-blue-300 hover:bg-blue-50 transition"
                          >
                            Chi tiết
                          </button>
                          {!item.assignedSbd && (
                            <button
                              type="button"
                              onClick={() => {
                                setSelected(item);
                                openApproveModal(item);
                              }}
                              className="cursor-pointer rounded-lg bg-emerald-600 hover:bg-emerald-700 px-2.5 py-1.5 text-xs font-bold text-white shadow-2xs transition"
                              title="Duyệt hồ sơ & Cấp SBD"
                            >
                              Duyệt
                            </button>
                          )}
                          <button
                            type="button"
                            onClick={() => handleDeleteSingle(item.id, item.fullName)}
                            className="cursor-pointer rounded-lg p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition"
                            title="Xóa hồ sơ này"
                          >
                            <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="2">
                              <polyline points="3 6 5 6 21 6" />
                              <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6" />
                            </svg>
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* MODAL CHI TIẾT HỒ SƠ TOÀN DIỆN */}
      {selected && (
        <div
          className="fixed inset-0 z-[1200] flex items-start justify-center overflow-y-auto bg-slate-950/60 p-4 backdrop-blur-sm print:p-0 print:bg-white"
          onMouseDown={(e) => e.target === e.currentTarget && setSelected(null)}
        >
          <div className="my-5 w-full max-w-5xl rounded-3xl bg-white shadow-2xl overflow-hidden print:m-0 print:shadow-none print:w-full">
            {/* Modal Header */}
            <div className="flex items-start justify-between gap-4 border-b border-slate-100 p-6 sm:p-8 bg-slate-50/50">
              <div>
                <p className="text-xs font-black uppercase tracking-[.18em] text-blue-600">
                  Hồ sơ tuyển chọn HUIT&apos;s ICONIC 2026
                </p>
                <div className="mt-2 flex flex-wrap items-center gap-3">
                  <h2 className="text-2xl sm:text-3xl font-black text-slate-950">{selected.fullName}</h2>
                  {selected.assignedSbd ? (
                    <span className="rounded-xl bg-emerald-600 px-3 py-1 text-xs font-black text-white shadow-sm">
                      SBD: {selected.assignedSbd} (Đã là thí sinh chính thức)
                    </span>
                  ) : (
                    <span
                      className={`rounded-xl border px-3 py-1 text-xs font-black ${
                        statusStyles[selected.status] || statusStyles.PENDING
                      }`}
                    >
                      {statusLabels[selected.status] || selected.status}
                    </span>
                  )}
                </div>
                <p className="mt-1 text-xs text-slate-500">
                  Nộp hồ sơ lúc: {dateTime(selected.createdAt)} · Mã hồ sơ: <span className="font-mono">{selected.id}</span>
                </p>
              </div>

              <div className="flex items-center gap-2 print:hidden">
                <button
                  type="button"
                  onClick={() => window.print()}
                  className="cursor-pointer inline-flex items-center gap-1 rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs font-bold text-slate-700 hover:bg-slate-50 shadow-2xs"
                  title="In hồ sơ ứng viên"
                >
                  <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="2">
                    <polyline points="6 9 6 2 18 2 18 9" />
                    <path d="M6 18H4a2 2 0 0 1-2-2v-5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2h-2" />
                    <rect x="6" y="14" width="12" height="8" />
                  </svg>
                  In
                </button>
                <button
                  type="button"
                  onClick={() => setSelected(null)}
                  className="cursor-pointer grid h-9 w-9 place-items-center rounded-xl border border-slate-200 text-lg text-slate-500 hover:bg-slate-100"
                  aria-label="Đóng"
                >
                  ✕
                </button>
              </div>
            </div>

            <div className="space-y-7 p-6 sm:p-8 max-h-[75vh] overflow-y-auto">
              {/* Hình ảnh đăng ký */}
              <div className="grid gap-6 sm:grid-cols-2">
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <p className="text-xs font-black uppercase tracking-wider text-slate-500">
                      Ảnh chân dung chính diện
                    </p>
                    <button
                      type="button"
                      onClick={() => setPreviewImage(formatAssetUrl(selected.portraitImageUrl))}
                      className="text-[11px] font-bold text-blue-600 underline cursor-pointer"
                    >
                      Xem phóng to
                    </button>
                  </div>
                  <img
                    src={formatAssetUrl(selected.portraitImageUrl)}
                    alt="Ảnh chân dung"
                    className="h-80 w-full rounded-2xl object-cover border border-slate-200 shadow-sm cursor-pointer hover:opacity-95"
                    onClick={() => setPreviewImage(formatAssetUrl(selected.portraitImageUrl))}
                  />
                </div>
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <p className="text-xs font-black uppercase tracking-wider text-slate-500">
                      Ảnh toàn thân nghệ thuật
                    </p>
                    <button
                      type="button"
                      onClick={() => setPreviewImage(formatAssetUrl(selected.fullBodyImageUrl))}
                      className="text-[11px] font-bold text-blue-600 underline cursor-pointer"
                    >
                      Xem phóng to
                    </button>
                  </div>
                  <img
                    src={formatAssetUrl(selected.fullBodyImageUrl)}
                    alt="Ảnh toàn thân"
                    className="h-80 w-full rounded-2xl object-cover border border-slate-200 shadow-sm cursor-pointer hover:opacity-95"
                    onClick={() => setPreviewImage(formatAssetUrl(selected.fullBodyImageUrl))}
                  />
                </div>
              </div>

              {/* Thông tin cá nhân & Học tập */}
              <section>
                <h3 className="mb-3 text-base font-black text-slate-950 flex items-center gap-2">
                  <span>🎓</span> Thông tin cá nhân & Học tập HUIT
                </h3>
                <dl className="grid gap-3 sm:grid-cols-3">
                  <Info label="Họ và tên" value={selected.fullName} />
                  <Info
                    label="Giới tính"
                    value={selected.gender === 'FEMALE' ? 'Nữ ♀' : selected.gender === 'MALE' ? 'Nam ♂' : selected.gender}
                  />
                  <Info label="Ngày sinh" value={date(selected.dateOfBirth)} />
                  <Info label="Khoa đào tạo" value={selected.faculty || 'Chưa cập nhật'} />
                  <Info label="Ngành học" value={selected.major} />
                  <Info label="Lớp học" value={selected.className} />
                  <Info label="Mã số sinh viên (MSSV)" value={selected.studentId} />
                  <Info label="Nơi sinh" value={selected.placeOfBirth} />
                  <Info label="Số CMND / CCCD" value={selected.identityNumber} />
                  <Info label="Ngày cấp CCCD" value={date(selected.identityIssuedDate)} />
                  <Info label="Nơi cấp CCCD" value={selected.identityIssuedPlace} />
                  <Info label="Số điện thoại liên hệ" value={selected.phone} />
                  <Info label="Địa chỉ Email" value={selected.email} />
                  <Info label="Địa chỉ thường trú" value={selected.address} />
                  <Info label="Facebook cá nhân" value={selected.facebookUrl} isLink />
                  <Info label="Video clip sơ loại / giới thiệu" value={selected.videoUrl} isLink />
                  <Info label="Năng khiếu nổi bật" value={selected.talent} />
                  <Info label="Thành tích / Minh chứng" value={selected.achievements} />
                </dl>
              </section>

              {/* Chỉ số hình thể */}
              <section>
                <h3 className="mb-3 text-base font-black text-slate-950 flex items-center gap-2">
                  <span>📏</span> Chỉ số hình thể
                </h3>
                <dl className="grid gap-3 grid-cols-2 sm:grid-cols-5">
                  <Info label="Chiều cao" value={selected.heightCm ? `${selected.heightCm} cm` : null} />
                  <Info label="Cân nặng" value={selected.weightKg ? `${selected.weightKg} kg` : null} />
                  <Info label="Vòng 1 (Ngực)" value={selected.measurementBust ? `${selected.measurementBust} cm` : null} />
                  <Info label="Vòng 2 (Eo)" value={selected.measurementWaist ? `${selected.measurementWaist} cm` : null} />
                  <Info label="Vòng 3 (Mông)" value={selected.measurementHip ? `${selected.measurementHip} cm` : null} />
                </dl>
              </section>

              {/* Nội dung tự bạch & Tầm nhìn */}
              <section>
                <h3 className="mb-3 text-base font-black text-slate-950 flex items-center gap-2">
                  <span>✨</span> Nội dung tự bạch & Tầm nhìn
                </h3>
                <dl className="grid gap-3">
                  <Info label="Giới thiệu bản thân" value={selected.selfIntroduction} />
                  <Info label="Câu nói truyền cảm hứng & Diễn giải" value={selected.inspirationalMessage} />
                  <Info label="Giới thiệu về ngành và khoa đang học tại HUIT" value={selected.facultyIntroduction} />
                  <Info label="Kế hoạch hành động nếu trở thành Đại sứ truyền thông" value={selected.ambassadorPlan} />
                </dl>
              </section>

              {/* Ghi chú quản trị (Admin Note) */}
              <section className="rounded-2xl border border-blue-100 bg-blue-50/40 p-4 space-y-3">
                <div className="flex items-center justify-between">
                  <h3 className="text-xs font-black uppercase tracking-wider text-blue-900 flex items-center gap-1.5">
                    <span>📝</span> Ghi chú của Ban Giám Khảo / Ban Tổ Chức
                  </h3>
                  <button
                    type="button"
                    onClick={saveAdminNote}
                    disabled={savingNote}
                    className="cursor-pointer rounded-lg bg-blue-600 hover:bg-blue-700 px-3 py-1 text-xs font-bold text-white transition disabled:opacity-50"
                  >
                    {savingNote ? 'Đang lưu...' : 'Lưu ghi chú'}
                  </button>
                </div>
                <textarea
                  rows={3}
                  value={noteInput}
                  onChange={(e) => setNoteInput(e.target.value)}
                  placeholder="Nhập nhận xét, lý do từ chối, yêu cầu bổ sung giấy tờ hoặc đánh giá sơ loại cho ứng viên này..."
                  className="w-full rounded-xl border border-slate-200 bg-white p-3 text-xs font-medium text-slate-800 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100 resize-y"
                />
              </section>
            </div>

            {/* Thanh điều khiển chân Modal */}
            <div className="flex flex-col gap-4 border-t border-slate-100 p-6 sm:p-8 bg-slate-50/50 sm:flex-row sm:items-center sm:justify-between print:hidden">
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => handleDeleteSingle(selected.id, selected.fullName)}
                  className="cursor-pointer inline-flex items-center gap-1 rounded-xl border border-rose-200 bg-white px-3 py-2 text-xs font-bold text-rose-600 hover:bg-rose-50 transition"
                >
                  <svg viewBox="0 0 24 24" className="h-3.5 w-3.5" fill="none" stroke="currentColor" strokeWidth="2">
                    <polyline points="3 6 5 6 21 6" />
                    <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6" />
                  </svg>
                  Xóa hồ sơ này
                </button>
              </div>

              <div className="flex flex-wrap items-center gap-2">
                <button
                  type="button"
                  disabled={saving || selected.status === 'PENDING'}
                  onClick={() => updateStatus('PENDING')}
                  className="cursor-pointer rounded-xl border border-amber-300 bg-white px-3.5 py-2 text-xs font-bold text-amber-700 hover:bg-amber-50 transition disabled:opacity-40"
                >
                  Chờ xem xét
                </button>
                <button
                  type="button"
                  disabled={saving || selected.status === 'REVIEWING'}
                  onClick={() => updateStatus('REVIEWING')}
                  className="cursor-pointer rounded-xl border border-blue-300 bg-white px-3.5 py-2 text-xs font-bold text-blue-700 hover:bg-blue-50 transition disabled:opacity-40"
                >
                  Đang xem xét
                </button>
                <button
                  type="button"
                  disabled={saving || selected.status === 'REJECTED'}
                  onClick={() => updateStatus('REJECTED')}
                  className="cursor-pointer rounded-xl border border-rose-300 bg-white px-3.5 py-2 text-xs font-bold text-rose-700 hover:bg-rose-50 transition disabled:opacity-40"
                >
                  Từ chối
                </button>

                {selected.assignedSbd ? (
                  <div className="flex gap-2">
                    <Link
                      href={`/thi-sinh/${selected.assignedSbd}`}
                      target="_blank"
                      className="cursor-pointer inline-flex items-center gap-1.5 rounded-xl bg-blue-600 px-4 py-2 text-xs font-black text-white hover:bg-blue-700 shadow-sm"
                    >
                      Xem trên website
                      <svg viewBox="0 0 24 24" className="h-3.5 w-3.5" fill="none" stroke="currentColor" strokeWidth="2">
                        <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6" />
                        <polyline points="15 3 21 3 21 9" />
                        <line x1="10" y1="14" x2="21" y2="3" />
                      </svg>
                    </Link>
                    <Link
                      href="/admin/candidates"
                      className="cursor-pointer rounded-xl border border-slate-200 bg-white px-3.5 py-2 text-xs font-black text-slate-700 hover:bg-slate-50"
                    >
                      Quản lý thí sinh
                    </Link>
                  </div>
                ) : (
                  <button
                    type="button"
                    onClick={() => openApproveModal(selected)}
                    className="cursor-pointer inline-flex items-center gap-2 rounded-xl bg-emerald-600 px-5 py-2 text-xs font-black text-white hover:bg-emerald-700 shadow-md shadow-emerald-600/20 active:scale-95 transition"
                  >
                    <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="2.5">
                      <polyline points="20 6 9 17 4 12" />
                    </svg>
                    Duyệt & Cấp SBD tạo Thí sinh
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* MODAL CẤP SBD & TẠO THÍ SINH */}
      {sbdModalOpen && selected && (
        <div className="fixed inset-0 z-[1300] flex items-center justify-center overflow-y-auto bg-slate-950/70 p-4 backdrop-blur-sm">
          <div className="w-full max-w-md rounded-3xl bg-white p-6 shadow-2xl sm:p-8 animate-in fade-in zoom-in-95">
            <div className="flex items-center justify-between border-b border-slate-100 pb-4">
              <h3 className="text-lg font-black text-slate-950">Duyệt & Cấp Số Báo Danh</h3>
              <button
                type="button"
                onClick={() => setSbdModalOpen(false)}
                className="cursor-pointer text-slate-400 hover:text-slate-600 text-xl font-bold"
              >
                ✕
              </button>
            </div>

            <div className="mt-5 space-y-4">
              <div className="rounded-2xl border border-blue-100 bg-blue-50/80 p-4">
                <p className="text-xs font-bold text-blue-900">
                  Ứng viên: <span className="font-black text-base text-blue-950">{selected.fullName}</span>
                </p>
                <p className="mt-1 text-xs text-blue-700">
                  {selected.faculty || selected.major} · {selected.gender === 'FEMALE' ? 'Nữ ♀' : 'Nam ♂'} · MSSV: {selected.studentId}
                </p>
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-600">
                  Số Báo Danh (SBD) <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={inputSbd}
                  onChange={(e) => setInputSbd(e.target.value.toUpperCase())}
                  placeholder="Ví dụ: IC-001 hoặc 012"
                  className="mt-2 h-12 w-full rounded-xl border border-slate-200 px-4 font-mono text-base font-black tracking-wider text-slate-900 outline-none focus:border-emerald-500 focus:ring-4 focus:ring-emerald-100"
                />
                <p className="mt-1.5 text-[11px] text-slate-500">
                  Số báo danh sẽ hiển thị trên trang chủ, bảng xếp hạng và dùng để bình chọn trực tuyến.
                </p>
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-600">
                  Bảng dự thi
                </label>
                <select
                  value={contestTable}
                  onChange={(e) => setContestTable(e.target.value)}
                  className="mt-2 h-12 w-full rounded-xl border border-slate-200 px-4 text-xs font-bold text-slate-800 outline-none focus:border-emerald-500 focus:ring-4 focus:ring-emerald-100"
                >
                  <option value="FEMALE">Bảng Nữ</option>
                  <option value="MALE">Bảng Nam</option>
                  <option value="STUDENT">Bảng Sinh viên</option>
                </select>
              </div>
            </div>

            <div className="mt-7 flex items-center justify-end gap-3">
              <button
                type="button"
                onClick={() => setSbdModalOpen(false)}
                disabled={converting}
                className="cursor-pointer h-11 rounded-xl border border-slate-200 px-5 text-xs font-bold text-slate-600 hover:bg-slate-50"
              >
                Hủy
              </button>
              <button
                type="button"
                onClick={confirmApproveAndConvert}
                disabled={converting}
                className="cursor-pointer h-11 rounded-xl bg-emerald-600 px-6 text-xs font-black text-white hover:bg-emerald-700 shadow-md shadow-emerald-600/20 disabled:opacity-50 transition"
              >
                {converting ? 'Đang tạo thí sinh...' : 'Xác nhận & Cấp SBD'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL XEM PHÓNG TO ẢNH */}
      {previewImage && (
        <div
          className="fixed inset-0 z-[1400] flex items-center justify-center bg-slate-950/85 p-4 backdrop-blur-md"
          onClick={() => setPreviewImage(null)}
        >
          <div className="relative max-w-4xl max-h-[90vh] overflow-hidden rounded-2xl bg-black">
            <button
              type="button"
              onClick={() => setPreviewImage(null)}
              className="cursor-pointer absolute right-3 top-3 z-10 grid h-8 w-8 place-items-center rounded-full bg-black/60 text-white hover:bg-black"
            >
              ✕
            </button>
            <img src={previewImage} alt="Ảnh phóng to" className="max-h-[85vh] w-auto object-contain" />
          </div>
        </div>
      )}
    </div>
  );
}
