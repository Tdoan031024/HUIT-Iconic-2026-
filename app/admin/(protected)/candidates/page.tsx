'use client';

import React, { useEffect, useMemo, useState, useRef } from 'react';
import Link from 'next/link';
import { Candidate } from '@/lib/types';
import { apiUrl, formatAssetUrl } from '../../api';
import DateTimeInput from '../../components/DateTimeInput';
import ImageDropzone from '../../components/ImageDropzone';

type VotingPromotion = {
  id: string;
  name: string;
  multiplier: number;
  startAt: string;
  endAt: string;
  isEnabled: boolean;
  appliesTo: 'FREE' | 'PAID' | 'ALL';
  note?: string;
};

type PromotionQuickPreset = 'NOW' | 'TONIGHT' | 'TOMORROW' | 'WEEKEND';

function toLocalInput(value: Date) {
  const offset = value.getTimezoneOffset();
  const local = new Date(value.getTime() - offset * 60 * 1000);
  return local.toISOString().slice(0, 16);
}

function createPromotionDraft(preset: PromotionQuickPreset = 'NOW', multiplier = 2): VotingPromotion {
  const now = new Date();
  let start = new Date(now);
  let end = new Date(now.getTime() + 2 * 60 * 60 * 1000);
  let name = 'Chương trình nhân điểm đang chạy';

  if (preset === 'TONIGHT') {
    start = new Date(now);
    start.setHours(19, 0, 0, 0);
    if (start.getTime() <= now.getTime()) start.setDate(start.getDate() + 1);
    end = new Date(start.getTime() + 3 * 60 * 60 * 1000);
    name = 'Khung vàng buổi tối';
  }

  if (preset === 'TOMORROW') {
    start = new Date(now);
    start.setDate(start.getDate() + 1);
    start.setHours(8, 0, 0, 0);
    end = new Date(start);
    end.setHours(17, 0, 0, 0);
    name = 'Chương trình nhân điểm ngày mai';
  }

  if (preset === 'WEEKEND') {
    start = new Date(now);
    const daysUntilSaturday = (6 - start.getDay() + 7) % 7 || 7;
    start.setDate(start.getDate() + daysUntilSaturday);
    start.setHours(8, 0, 0, 0);
    end = new Date(start);
    end.setDate(end.getDate() + 1);
    end.setHours(22, 0, 0, 0);
    name = 'Chương trình nhân điểm cuối tuần';
  }

  return {
    id: `promo-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
    name,
    multiplier,
    startAt: toLocalInput(start),
    endAt: toLocalInput(end),
    isEnabled: true,
    appliesTo: 'FREE',
    note: '',
  };
}

function parsePromotionTime(value: string) {
  if (!value) return NaN;
  let normalized = value.trim();
  if (!normalized.includes('Z') && !/\+\d{2}:?\d{2}$/.test(normalized) && !/-\d{2}:?\d{2}$/.test(normalized)) {
    normalized = `${normalized}+07:00`;
  }
  return new Date(normalized).getTime();
}

function getPromotionStatus(promotion: VotingPromotion, now = Date.now()) {
  if (!promotion.isEnabled) return { label: 'Tạm tắt', className: 'bg-slate-100 text-slate-500 border-slate-200' };
  const start = parsePromotionTime(promotion.startAt);
  const end = parsePromotionTime(promotion.endAt);
  if (!Number.isFinite(start) || !Number.isFinite(end) || start >= end) {
    return { label: 'Cần kiểm tra giờ', className: 'bg-rose-50 text-rose-700 border-rose-200' };
  }
  if (start <= now && end >= now) return { label: 'Đang chạy', className: 'bg-emerald-50 text-emerald-700 border-emerald-200' };
  if (start > now) return { label: 'Đã lên lịch', className: 'bg-blue-50 text-blue-700 border-blue-200' };
  return { label: 'Đã kết thúc', className: 'bg-amber-50 text-amber-700 border-amber-200' };
}

const tableLabels: Record<string, string> = {
  FEMALE: 'Bảng Nữ',
  MALE: 'Bảng Nam',
  STUDENT: 'Bảng Sinh viên',
  HIGH_SCHOOL: 'Bảng Học sinh',
  ENTERPRISE: 'Bảng Mở rộng',
};

const HUIT_FACULTIES = [
  'Khoa Công nghệ Thông tin',
  'Khoa Công nghệ Thực phẩm',
  'Khoa Quản trị Kinh doanh',
  'Khoa Tài chính - Kế toán',
  'Khoa Ngoại ngữ',
  'Khoa Du lịch & Ẩm thực',
  'Khoa May & Thời trang',
  'Khoa Công nghệ Hóa học',
  'Khoa Công nghệ Sinh học & Kỹ thuật Môi trường',
  'Khoa Điện - Điện tử',
  'Khoa Cơ khí',
  'Khoa Luật',
  'Khoa Khoa học Ứng dụng',
  'Khoa Chính trị - Luật',
  'Khoa Giáo dục Thể chất & Quốc phòng',
  'Viện Đào tạo Quốc tế',
  'Khác'
];

const roundOptions = ['Vòng sơ khảo', 'Vòng bán kết', 'Vòng chung kết'];

const emptyCandidate: Partial<Candidate> = {
  sbd: '',
  name: '',
  votes: 0,
  imageUrl: '/images/default-avatar.png',
  gender: 'Nữ',
  faculty: 'Khoa Công nghệ Thông tin',
  className: '',
  studentId: '',
  heightCm: undefined,
  weightKg: undefined,
  measurementBust: undefined,
  measurementWaist: undefined,
  measurementHip: undefined,
  contestTable: 'FEMALE',
  contestTableLabel: 'Bảng Nữ',
  currentRound: 'Vòng sơ khảo',
  status: 'Đủ hồ sơ',
  leaderPhone: '',
  leaderEmail: '',
  talent: '',
  videoUrl: '',
  inspirationalMessage: '',
  achievements: '',
  description: '',
  biography: '',
  showcaseImages: '',
  source: 'MANUAL',
};

function formatCandidateSource(source?: string, registrationId?: string) {
  const actualSource = source || (registrationId ? 'WEB' : 'MANUAL');
  if (actualSource === 'WEB') return 'Đăng ký qua Web';
  if (actualSource === 'IMPORT') return 'Nhập từ CSV';
  return 'Thêm thủ công';
}

function getSourceBadge(source?: string, registrationId?: string) {
  const actualSource = source || (registrationId ? 'WEB' : 'MANUAL');
  if (actualSource === 'WEB') {
    return (
      <span className="inline-flex items-center gap-1 rounded-full border border-sky-200 bg-sky-50 px-2 py-0.5 text-[10px] font-bold text-sky-700 whitespace-nowrap shadow-2xs" title="Thí sinh gửi hồ sơ qua trang đăng ký trực tuyến của website">
        <span className="h-1.5 w-1.5 rounded-full bg-sky-500" />
        Đăng ký qua Web
      </span>
    );
  }
  if (actualSource === 'IMPORT') {
    return (
      <span className="inline-flex items-center gap-1 rounded-full border border-violet-200 bg-violet-50 px-2 py-0.5 text-[10px] font-bold text-violet-700 whitespace-nowrap shadow-2xs" title="Dữ liệu thí sinh được nạp hàng loạt từ file Excel/CSV">
        <span className="h-1.5 w-1.5 rounded-full bg-violet-500" />
        Nhập từ CSV
      </span>
    );
  }
  return (
    <span className="inline-flex items-center gap-1 rounded-full border border-amber-200 bg-amber-50 px-2 py-0.5 text-[10px] font-bold text-amber-700 whitespace-nowrap shadow-2xs" title="Thí sinh được tạo trực tiếp bằng tay trên giao diện admin">
      <span className="h-1.5 w-1.5 rounded-full bg-amber-500" />
      Thêm thủ công
    </span>
  );
}

function ActionButton({
  title,
  tone,
  children,
  onClick,
  href,
  target,
}: {
  title: string;
  tone: 'view' | 'edit' | 'delete';
  children: React.ReactNode;
  onClick?: () => void;
  href?: string;
  target?: string;
}) {
  const classes = {
    view: 'border-slate-200 bg-white text-slate-500 hover:border-slate-300 hover:bg-slate-50 hover:text-slate-900',
    edit: 'border-emerald-200/80 bg-emerald-50 text-emerald-700 hover:border-emerald-300 hover:bg-emerald-100',
    delete: 'border-rose-200/80 bg-rose-50 text-rose-600 hover:border-rose-300 hover:bg-rose-100',
  };
  const className = `grid h-9 w-9 place-items-center rounded-lg border shadow-sm transition duration-150 hover:-translate-y-[1px] ${classes[tone]}`;

  if (href) {
    return (
      <Link href={href} target={target} title={title} aria-label={title} className={className}>
        {children}
      </Link>
    );
  }

  return (
    <button type="button" onClick={onClick} title={title} aria-label={title} className={className}>
      {children}
    </button>
  );
}

function CandidateModal({
  title,
  mode,
  form,
  setForm,
  onClose,
  onSubmit,
}: {
  title: string;
  mode: 'add' | 'edit';
  form: Partial<Candidate>;
  setForm: (value: Partial<Candidate>) => void;
  onClose: () => void;
  onSubmit: (event: React.FormEvent) => void;
}) {
  const update = (key: keyof Candidate, value: any) => {
    const next = { ...form, [key]: value };
    if (key === 'contestTable') next.contestTableLabel = tableLabels[value] || value;
    if (key === 'gender') {
      if (value === 'Nam' && (!form.contestTable || form.contestTable === 'FEMALE')) {
        next.contestTable = 'MALE';
        next.contestTableLabel = 'Bảng Nam';
      } else if (value === 'Nữ' && (!form.contestTable || form.contestTable === 'MALE')) {
        next.contestTable = 'FEMALE';
        next.contestTableLabel = 'Bảng Nữ';
      }
    }
    setForm(next);
  };

  const modalFileRef = useRef<HTMLInputElement>(null);
  const [uploadingIndex, setUploadingIndex] = useState<number | 'main' | null>(null);

  const handleModalFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || uploadingIndex === null) return;
    const sbd = form.sbd?.trim() || 'temp';
    const formData = new FormData();
    formData.append('file', file);

    try {
      const uploadRes = await fetch(apiUrl(`/api/admin/candidates/${sbd}/upload`), {
        method: 'POST',
        body: formData,
      });
      if (uploadRes.ok) {
        const { url } = await uploadRes.json();
        if (uploadingIndex === 'main') {
          update('imageUrl', url);
        } else {
          const indexToUpdate = uploadingIndex as number;
          const newList = [...showcaseList];
          newList[indexToUpdate] = url;
          setShowcaseList(newList);
          update('showcaseImages', newList.filter(Boolean).join(','));
        }
        alert('Tải ảnh lên thành công!');
      } else {
        alert('Tải ảnh thất bại. Vui lòng kiểm tra backend.');
      }
    } catch {
      alert('Lỗi khi tải ảnh lên.');
    } finally {
      setUploadingIndex(null);
      if (modalFileRef.current) modalFileRef.current.value = '';
    }
  };

  const [showcaseList, setShowcaseList] = useState<string[]>(() => {
    return (form.showcaseImages || '').split(',').map(img => img.trim()).filter(Boolean);
  });

  const handleShowcaseChange = (index: number, value: string) => {
    const newList = [...showcaseList];
    newList[index] = value;
    setShowcaseList(newList);
    update('showcaseImages', newList.filter(Boolean).join(','));
  };

  const handleAddShowcase = () => {
    if (showcaseList.length >= 5) return;
    const sbd = form.sbd?.trim() || 'CAND';
    const nextIndex = showcaseList.length + 1;
    const newUrl = `/candidates/${sbd}/${nextIndex}.jpg`;
    const newList = [...showcaseList, newUrl];
    setShowcaseList(newList);
    update('showcaseImages', newList.filter(Boolean).join(','));
  };

  const handleRemoveShowcase = (index: number) => {
    const newList = showcaseList.filter((_, idx) => idx !== index);
    setShowcaseList(newList);
    update('showcaseImages', newList.filter(Boolean).join(','));
  };

  const inputClass = 'h-10 w-full rounded-lg border border-slate-200 bg-slate-50 px-3 text-xs font-semibold text-slate-800 outline-none transition focus:border-pink-500 focus:bg-white';
  const rowInputClass = 'h-9 w-full rounded-md border border-slate-200 bg-slate-50 px-2.5 text-xs font-semibold text-slate-800 outline-none transition focus:border-pink-500 focus:bg-white';
  const labelText = 'text-[10px] font-black uppercase tracking-[0.12em] text-slate-500';

  return (
    <div className="fixed inset-0 z-[1000] overflow-y-auto bg-slate-950/55 p-4 backdrop-blur-sm" role="dialog" aria-modal="true" onMouseDown={(event) => event.target === event.currentTarget && onClose()}>
      <form onSubmit={onSubmit} onMouseDown={(event) => event.stopPropagation()} className="mx-auto my-6 w-full max-w-4xl rounded-2xl border border-slate-200 bg-white p-6 shadow-2xl space-y-6">
        <div className="flex items-start justify-between gap-4 border-b border-slate-100 pb-4">
          <div>
            <p className="text-[10px] font-black uppercase tracking-[0.18em] text-pink-600">Hồ sơ Thí sinh HUIT's ICONIC 2026</p>
            <h3 id="candidate-modal-title" className="mt-1 text-xl font-black text-slate-900">{title}</h3>
          </div>
          <button type="button" onClick={onClose} className="rounded-lg border border-slate-200 px-3 py-2 text-xs font-bold text-slate-600 hover:border-pink-500 hover:text-pink-600">
            Đóng
          </button>
        </div>

        {/* Section 1: Định danh & Cuộc thi */}
        <div className="space-y-3">
          <div className="border-b border-pink-100 pb-1 text-[11px] font-black uppercase tracking-[0.16em] text-pink-700 flex items-center gap-2">
            <span>👤</span> Thông tin cơ bản & Bảng thi
          </div>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 md:grid-cols-4">
            <label className="space-y-1 sm:col-span-2">
              <span className={labelText}>Họ và tên thí sinh <span className="text-red-500 font-bold">*</span></span>
              <input className={inputClass} value={form.name || ''} onChange={(event) => update('name', event.target.value)} placeholder="Ví dụ: Nguyễn Thảo Vy" required />
            </label>
            <label className="space-y-1">
              <span className={labelText}>Số báo danh (SBD) <span className="text-red-500 font-bold">*</span></span>
              <input className={inputClass} value={form.sbd || ''} onChange={(event) => update('sbd', event.target.value)} placeholder="Ví dụ: ICONIC-01" required />
            </label>
            <label className="space-y-1">
              <span className={labelText}>Giới tính</span>
              <select className={inputClass} value={form.gender || 'Nữ'} onChange={(event) => update('gender', event.target.value)}>
                <option value="Nữ">Nữ ♀</option>
                <option value="Nam">Nam ♂</option>
                <option value="Khác">Khác</option>
              </select>
            </label>
            <label className="space-y-1">
              <span className={labelText}>Bảng dự thi</span>
              <select className={inputClass} value={form.contestTable || 'FEMALE'} onChange={(event) => update('contestTable', event.target.value)}>
                <option value="FEMALE">Bảng Nữ</option>
                <option value="MALE">Bảng Nam</option>
                <option value="STUDENT">Bảng Sinh viên</option>
              </select>
            </label>
            <label className="space-y-1">
              <span className={labelText}>Vòng hiện tại</span>
              <select className={inputClass} value={form.currentRound || 'Vòng sơ khảo'} onChange={(event) => update('currentRound', event.target.value)}>
                {roundOptions.map((round) => (
                  <option key={round} value={round}>{round}</option>
                ))}
              </select>
            </label>
            <label className="space-y-1">
              <span className={labelText}>Trạng thái hồ sơ</span>
              <select className={inputClass} value={form.status || 'Đủ hồ sơ'} onChange={(event) => update('status', event.target.value)}>
                <option value="Đủ hồ sơ">Đủ hồ sơ</option>
                <option value="Chờ duyệt">Chờ duyệt</option>
                <option value="Cần bổ sung ảnh">Cần bổ sung ảnh</option>
                <option value="Đã vào vòng trong">Đã vào vòng trong</option>
                <option value="Tạm dừng">Tạm dừng</option>
              </select>
            </label>
            <label className="space-y-1">
              <span className={labelText}>Nguồn hồ sơ</span>
              <select
                className={inputClass}
                value={form.source || (form.registrationId ? 'WEB' : 'MANUAL')}
                onChange={(event) => update('source', event.target.value)}
              >
                <option value="MANUAL">✍️ Tự thêm bằng tay</option>
                <option value="WEB">🌐 Đăng ký qua Web</option>
                <option value="IMPORT">📁 Nhập từ file CSV</option>
              </select>
            </label>
            {mode === 'edit' && (
              <label className="space-y-1">
                <span className={labelText}>Điểm bình chọn</span>
                <div className="flex h-10 items-center rounded-lg border border-slate-200 bg-slate-100 px-3 text-xs font-bold text-slate-700">
                  🗳️ {(form.votes || 0).toLocaleString()} lượt
                </div>
              </label>
            )}
          </div>
        </div>

        {/* Section 2: Học tập HUIT & Liên hệ */}
        <div className="space-y-3">
          <div className="border-b border-indigo-100 pb-1 text-[11px] font-black uppercase tracking-[0.16em] text-indigo-700 flex items-center gap-2">
            <span>🎓</span> Thông tin học tập HUIT & Liên hệ
          </div>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 md:grid-cols-3">
            <label className="space-y-1 sm:col-span-2">
              <span className={labelText}>Khoa/ Viện/ Phòng quản lý sinh viên:</span>
              <input type="text" className={inputClass} value={form.faculty || ''} onChange={(event) => update('faculty', event.target.value)} placeholder="Nhập Khoa, Viện hoặc Phòng quản lý sinh viên..." />
            </label>
            <label className="space-y-1">
              <span className={labelText}>Lớp học</span>
              <input className={inputClass} value={form.className || ''} onChange={(event) => update('className', event.target.value)} placeholder="Ví dụ: 12DHTH01" />
            </label>
            <label className="space-y-1">
              <span className={labelText}>Mã số sinh viên (MSSV)</span>
              <input className={inputClass} value={form.studentId || ''} onChange={(event) => update('studentId', event.target.value)} placeholder="Ví dụ: 2001211234" />
            </label>
            <label className="space-y-1">
              <span className={labelText}>Quê quán / Nơi sinh</span>
              <input className={inputClass} value={form.implementationLocation || ''} onChange={(event) => update('implementationLocation', event.target.value)} placeholder="Ví dụ: TP. Hồ Chí Minh" />
            </label>
            <label className="space-y-1">
              <span className={labelText}>Số điện thoại</span>
              <input className={inputClass} value={form.leaderPhone || ''} onChange={(event) => update('leaderPhone', event.target.value)} placeholder="09xxxx..." />
            </label>
            <label className="space-y-1">
              <span className={labelText}>Email</span>
              <input className={inputClass} value={form.leaderEmail || ''} onChange={(event) => update('leaderEmail', event.target.value)} placeholder="email@gmail.com" />
            </label>
          </div>

          <div className="border-b border-indigo-100 pb-1 text-[11px] font-black uppercase tracking-[0.16em] text-indigo-700 flex items-center gap-2">
            <span>🌟</span> Giới thiệu & Định vị bản thân
          </div>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <label className="space-y-1 sm:col-span-2">
              <span className={labelText}>Tài năng / Năng khiếu</span>
              <input className={inputClass} value={form.talent || ''} onChange={(event) => update('talent', event.target.value)} placeholder="Hát, nhảy hiện đại, MC song ngữ..." />
            </label>
            <label className="space-y-1 sm:col-span-2">
              <span className={labelText}>Link Facebook cá nhân</span>
              <input className={inputClass} value={form.advisorName || ''} onChange={(event) => update('advisorName', event.target.value)} placeholder="https://facebook.com/..." />
            </label>
            <label className="space-y-1 sm:col-span-2">
              <span className={labelText}>Mô tả ngắn / Giới thiệu thí sinh <span className="text-red-500 font-bold">*</span></span>
              <textarea className="h-20 w-full resize-y rounded-lg border border-slate-200 bg-slate-50 p-2.5 text-xs font-medium text-slate-800 outline-none transition focus:border-pink-500 focus:bg-white" value={form.description || ''} onChange={(event) => update('description', event.target.value)} placeholder="Tóm tắt về thí sinh, tính cách, đam mê..." required />
            </label>
            <label className="space-y-1 sm:col-span-2">
              <span className={labelText}>Tiểu sử chi tiết / Bài viết tự sự</span>
              <textarea className="h-24 w-full resize-y rounded-lg border border-slate-200 bg-slate-50 p-2.5 text-xs font-medium text-slate-800 outline-none transition focus:border-pink-500 focus:bg-white" value={form.biography || ''} onChange={(event) => update('biography', event.target.value)} placeholder="Chia sẻ quá trình phát triển bản thân, hành trình đến với cuộc thi HUIT's ICONIC..." />
            </label>
          </div>
        </div>

        {/* Section 3: Chỉ số hình thể */}
        <div className="space-y-3">
          <div className="border-b border-rose-100 pb-1 text-[11px] font-black uppercase tracking-[0.16em] text-rose-700 flex items-center gap-2">
            <span>📏</span> Chỉ số hình thể
          </div>
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-2">
            <label className="space-y-1">
              <span className={labelText}>Chiều cao (cm)</span>
              <input type="number" step="0.5" className={inputClass} value={form.heightCm || ''} onChange={(event) => update('heightCm', event.target.value)} placeholder="170" />
            </label>
            <label className="space-y-1">
              <span className={labelText}>Cân nặng (kg)</span>
              <input type="number" step="0.5" className={inputClass} value={form.weightKg || ''} onChange={(event) => update('weightKg', event.target.value)} placeholder="52" />
            </label>
          </div>
        </div>



        {/* Section 5: Hình ảnh & Bộ ảnh photoshoot */}
        <div className="space-y-4">
          <div className="border-b border-emerald-100 pb-1 text-[11px] font-black uppercase tracking-[0.16em] text-emerald-700 flex items-center gap-2">
            <span>📸</span> Hình ảnh chân dung & Bộ ảnh photoshoot
          </div>

          <div>
            <ImageDropzone
              label="Ảnh chân dung đại diện chính"
              value={form.imageUrl || ''}
              onChange={(url) => update('imageUrl', url)}
              aspectRatioHint="Khuyên dùng ảnh chân dung tỉ lệ 3:4 hoặc 1:1, dung lượng dưới 5MB"
            />
          </div>

          <div className="rounded-xl border border-slate-200 bg-slate-50/70 p-4 space-y-3">
            <div className="flex items-center justify-between">
              <div>
                <span className={labelText}>Bộ ảnh photoshoot / nghệ thuật</span>
                <span className="block text-[10px] text-slate-400 font-medium">Tối đa 5 ảnh để hiển thị trên trang chi tiết thí sinh</span>
              </div>
              <button
                type="button"
                disabled={showcaseList.length >= 5}
                onClick={handleAddShowcase}
                className="flex items-center gap-1.5 rounded-lg bg-pink-600 px-3 py-1.5 text-xs font-bold text-white shadow-sm hover:bg-pink-700 transition disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="2.5">
                  <path d="M5 12h14" />
                  <path d="M12 5v14" />
                </svg>
                Thêm ảnh ({showcaseList.length}/5)
              </button>
            </div>

            {showcaseList.length === 0 ? (
              <div className="rounded-xl border border-dashed border-slate-300 bg-white py-6 text-center text-xs text-slate-400">
                Chưa có ảnh photoshoot nào. Nhấn "Thêm ảnh" để tải lên.
              </div>
            ) : (
              <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                {showcaseList.map((url, index) => (
                  <div key={index} className="flex items-center gap-3 bg-white p-2.5 rounded-lg border border-slate-200 shadow-sm">
                    <div className="h-14 w-14 shrink-0 rounded-lg overflow-hidden bg-slate-100 border border-slate-200 flex items-center justify-center">
                      {url ? (
                        <img src={formatAssetUrl(url)} alt={`Ảnh ${index + 1}`} className="h-full w-full object-cover" />
                      ) : (
                        <span className="text-[10px] text-slate-400 font-bold">Trống</span>
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <span className="text-[9px] font-black text-slate-400 uppercase tracking-wider block mb-1">Ảnh photoshoot #{index + 1}</span>
                      <div className="flex gap-1.5">
                        <input
                          type="text"
                          placeholder="/images/... hoặc link online"
                          className={rowInputClass}
                          value={url}
                          onChange={(e) => handleShowcaseChange(index, e.target.value)}
                        />
                        <button
                          type="button"
                          onClick={() => {
                            setUploadingIndex(index);
                            modalFileRef.current?.click();
                          }}
                          className="h-9 shrink-0 rounded-md border border-slate-200 bg-slate-50 px-2.5 text-xs font-bold text-slate-700 hover:border-pink-500 hover:text-pink-600"
                        >
                          Tải lên
                        </button>
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={() => handleRemoveShowcase(index)}
                      className="rounded-lg p-1.5 text-slate-400 hover:bg-red-50 hover:text-red-600 transition"
                      title="Xóa ảnh"
                    >
                      <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="2">
                        <path d="M18 6 6 18" />
                        <path d="m6 6 12 12" />
                      </svg>
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        <div className="flex justify-end gap-2 border-t border-slate-100 pt-4">
          <button type="button" onClick={onClose} className="rounded-lg border border-slate-200 bg-white px-4 py-2 text-xs font-bold text-slate-600 hover:bg-slate-50">
            Hủy bỏ
          </button>
          <button type="submit" className="rounded-lg bg-pink-600 px-5 py-2 text-xs font-bold text-white shadow hover:bg-pink-700 transition">
            {mode === 'add' ? 'Thêm thí sinh' : 'Lưu cập nhật'}
          </button>
        </div>

        <input
          type="file"
          ref={modalFileRef}
          onChange={handleModalFileUpload}
          accept="image/*"
          className="hidden"
        />
      </form>
    </div>
  );
}

const csvHeadersMap: Record<string, string> = {
  'SBD': 'sbd',
  'Tên thí sinh': 'name',
  'Giới tính': 'gender',
  'Bảng thi': 'contestTable',
  'Khoa': 'faculty',
  'Lớp': 'className',
  'MSSV': 'studentId',
  'Số điện thoại': 'leaderPhone',
  'Email': 'leaderEmail',
  'Chiều cao (cm)': 'heightCm',
  'Cân nặng (kg)': 'weightKg',
  'Vòng 1': 'measurementBust',
  'Vòng 2': 'measurementWaist',
  'Vòng 3': 'measurementHip',
  'Năng khiếu': 'talent',
  'Link Video': 'videoUrl',
  'Thông điệp': 'inspirationalMessage',
  'Thành tích': 'achievements',
  'Giới thiệu': 'description',
  'Tiểu sử': 'biography',
  'Vòng hiện tại': 'currentRound',
  'Trạng thái': 'status',
  'Điểm bình chọn': 'votes',
  'Đường dẫn ảnh': 'imageUrl',
  'Bộ ảnh photoshoot': 'showcaseImages',
};

function parseCSVText(text: string): Record<string, string>[] {
  const lines: string[][] = [];
  let row: string[] = [];
  let inQuotes = false;
  let currentVal = '';

  for (let i = 0; i < text.length; i++) {
    const char = text[i];
    const nextChar = text[i + 1];

    if (char === '"') {
      if (inQuotes && nextChar === '"') {
        currentVal += '"';
        i++;
      } else {
        inQuotes = !inQuotes;
      }
    } else if (char === ',' && !inQuotes) {
      row.push(currentVal);
      currentVal = '';
    } else if ((char === '\r' || char === '\n') && !inQuotes) {
      if (char === '\r' && nextChar === '\n') {
        i++;
      }
      row.push(currentVal);
      lines.push(row);
      row = [];
      currentVal = '';
    } else {
      currentVal += char;
    }
  }
  if (currentVal || row.length > 0) {
    row.push(currentVal);
    lines.push(row);
  }

  if (lines.length < 2) return [];

  const headers = lines[0].map(h => h.trim());
  const result: Record<string, string>[] = [];

  for (let i = 1; i < lines.length; i++) {
    const values = lines[i];
    if (values.length === 1 && values[0] === '') continue;

    const obj: Record<string, string> = {};
    for (let j = 0; j < headers.length; j++) {
      obj[headers[j]] = values[j] ? values[j].trim() : '';
    }
    result.push(obj);
  }

  return result;
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

function ImportModal({
  onClose,
  onSuccess,
}: {
  onClose: () => void;
  onSuccess: () => void;
}) {
  const [fileData, setFileData] = useState<any[]>([]);
  const [fileName, setFileName] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(false);
  const [errorLogs, setErrorLogs] = useState<string[]>([]);
  const [successMsg, setSuccessMsg] = useState<string>('');

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setFileName(file.name);
    setErrorLogs([]);
    setSuccessMsg('');

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const text = event.target?.result as string;
        const parsedRows = parseCSVText(text);

        if (parsedRows.length === 0) {
          alert('File CSV trống hoặc không đúng định dạng!');
          return;
        }

        const candidates = parsedRows.map((row) => {
          const item: any = {};
          for (const [colName, fieldKey] of Object.entries(csvHeadersMap)) {
            const val = row[colName] || '';
            if (['heightCm', 'weightKg', 'measurementBust', 'measurementWaist', 'measurementHip'].includes(fieldKey)) {
              item[fieldKey] = val ? Number(val) : undefined;
            } else if (fieldKey === 'votes') {
              item[fieldKey] = Number(val) || 0;
            } else if (fieldKey === 'contestTable') {
              const upper = val.toUpperCase();
              if (upper.includes('NỮ') || upper === 'FEMALE') item[fieldKey] = 'FEMALE';
              else if (upper.includes('NAM') || upper === 'MALE') item[fieldKey] = 'MALE';
              else item[fieldKey] = 'STUDENT';
            } else {
              item[fieldKey] = val;
            }
          }
          return item;
        }).filter(item => item.sbd && item.name);

        setFileData(candidates);
      } catch (err: any) {
        alert('Lỗi đọc file: ' + err.message);
      }
    };
    reader.readAsText(file, 'UTF-8');
  };

  const handleDownloadTemplate = () => {
    const headers = [
      'SBD',
      'Tên thí sinh',
      'Giới tính',
      'Bảng thi',
      'Khoa',
      'Lớp',
      'MSSV',
      'Số điện thoại',
      'Email',
      'Chiều cao (cm)',
      'Cân nặng (kg)',
      'Vòng 1',
      'Vòng 2',
      'Vòng 3',
      'Năng khiếu',
      'Link Video',
      'Thông điệp',
      'Thành tích',
      'Giới thiệu',
      'Vòng hiện tại',
      'Trạng thái',
      'Điểm bình chọn',
      'Đường dẫn ảnh',
      'Bộ ảnh photoshoot'
    ];

    const sampleRow = [
      'ICONIC-01',
      'Nguyễn Thảo Vy',
      'Nữ',
      'FEMALE',
      'Khoa Công nghệ Thông tin',
      '12DHTH01',
      '2001211234',
      '0987654321',
      'thaovy@gmail.com',
      '170',
      '50',
      '86',
      '60',
      '90',
      'Múa đương đại, MC dẫn chương trình',
      'https://youtube.com/watch?v=sample',
      'Tự tin tỏa sáng cùng vẻ đẹp trí tuệ sinh viên HUIT.',
      'Cán bộ Đoàn xuất sắc, Giải Nhì Nghiên cứu khoa học 2025',
      'Thí sinh đại diện nét đẹp duyên dáng và thanh lịch HUIT.',
      'Vòng sơ khảo',
      'Đủ hồ sơ',
      '100',
      '/images/candidates/c1.jpg',
      '/images/candidates/c1-1.jpg,/images/candidates/c1-2.jpg'
    ];

    const csvContent = '\uFEFF' + [headers.join(','), sampleRow.map(escapeCSVValue).join(',')].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', 'mau_danh_sach_thi_sinh_huit_iconic.csv');
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleImport = async () => {
    if (fileData.length === 0) {
      alert('Vui lòng chọn file CSV chứa dữ liệu hợp lệ trước!');
      return;
    }

    setLoading(true);
    setErrorLogs([]);
    setSuccessMsg('');

    try {
      const res = await fetch(apiUrl('/api/admin/candidates/bulk'), {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(fileData),
      });

      if (!res.ok) {
        throw new Error('Lỗi từ hệ thống server hoặc chưa đăng nhập quản trị.');
      }

      const result = await res.json();
      if (result.errors && result.errors.length > 0) {
        setErrorLogs(result.errors);
      }
      setSuccessMsg(`Đã nhập thành công ${result.successCount}/${fileData.length} thí sinh!`);
      if (result.successCount > 0) {
        onSuccess();
      }
    } catch (err: any) {
      setErrorLogs([err.message || 'Lỗi không xác định khi tải lên hệ thống.']);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[1000] flex items-center justify-center overflow-y-auto bg-slate-950/55 p-4 backdrop-blur-sm" role="dialog" aria-modal="true" onMouseDown={(event) => event.target === event.currentTarget && onClose()}>
      <div onMouseDown={(event) => event.stopPropagation()} className="w-full max-w-2xl rounded-2xl border border-slate-200 bg-white p-6 shadow-2xl space-y-5">
        <div className="flex items-start justify-between gap-4 border-b border-slate-100 pb-4">
          <div>
            <p className="text-[10px] font-black uppercase tracking-[0.18em] text-pink-600">Nhập dữ liệu thí sinh</p>
            <h3 className="mt-1 text-xl font-black text-slate-900">Nhập danh sách từ CSV</h3>
          </div>
          <button type="button" onClick={onClose} className="rounded-lg border border-slate-200 px-3 py-2 text-xs font-bold text-slate-600 hover:border-pink-500 hover:text-pink-600">
            Đóng
          </button>
        </div>

        <div className="space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-slate-50 p-4 rounded-xl border border-slate-200">
            <div>
              <p className="text-xs font-bold text-slate-800">Tải tệp tin CSV mẫu để điền thông tin thí sinh</p>
              <p className="text-[10px] text-slate-500 font-semibold mt-1">Bao gồm đầy đủ các cột hình thể, khoa, lớp, video, ảnh.</p>
            </div>
            <button
              onClick={handleDownloadTemplate}
              className="shrink-0 flex items-center gap-1.5 rounded-lg border border-pink-200 bg-pink-50 text-pink-700 px-3 py-2 text-xs font-bold hover:bg-pink-100 transition"
            >
              <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="2.5">
                <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                <polyline points="7 10 12 15 17 10" />
                <line x1="12" y1="15" x2="12" y2="3" />
              </svg>
              Tải CSV mẫu
            </button>
          </div>

          <div className="flex flex-col items-center justify-center border-2 border-dashed border-slate-300 rounded-xl p-6 bg-slate-50 hover:bg-slate-100 transition relative">
            <input
              type="file"
              accept=".csv"
              onChange={handleFileChange}
              className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
            />
            <svg viewBox="0 0 24 24" className="h-10 w-10 text-slate-400" fill="none" stroke="currentColor" strokeWidth="1.5">
              <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
              <polyline points="14 2 14 8 20 8" />
              <line x1="12" y1="18" x2="12" y2="12" />
              <polyline points="9 15 12 12 15 15" />
            </svg>
            <p className="mt-2 text-xs font-bold text-slate-700">Kéo thả hoặc nhấp để chọn tệp CSV</p>
            <p className="text-[10px] text-slate-400 font-bold mt-1">Chấp nhận định dạng file .csv bảng mã UTF-8</p>
            {fileName && (
              <div className="mt-3 px-3 py-1.5 bg-pink-50 border border-pink-200 text-pink-800 text-xs rounded-lg font-bold">
                Tệp đã chọn: {fileName} ({fileData.length} thí sinh hợp lệ)
              </div>
            )}
          </div>
        </div>

        {successMsg && (
          <div className="p-3.5 bg-emerald-50 border border-emerald-200 rounded-xl text-emerald-800 text-xs font-bold">
            {successMsg}
          </div>
        )}

        {errorLogs.length > 0 && (
          <div className="rounded-xl border border-red-200 bg-red-50 p-4 space-y-2 max-h-40 overflow-y-auto">
            <p className="text-xs font-bold text-red-800 uppercase tracking-wide">Danh sách lỗi / cảnh báo:</p>
            <ul className="list-disc list-inside text-[11px] text-red-700 font-semibold space-y-1">
              {errorLogs.map((log, idx) => (
                <li key={idx}>{log}</li>
              ))}
            </ul>
          </div>
        )}

        <div className="flex justify-end gap-2 border-t border-slate-100 pt-4">
          <button type="button" onClick={onClose} className="rounded-lg border border-slate-200 bg-white px-4 py-2 text-xs font-bold text-slate-600 hover:bg-slate-50">
            Hủy
          </button>
          <button
            type="button"
            disabled={loading || fileData.length === 0}
            onClick={handleImport}
            className="flex items-center gap-1.5 rounded-lg bg-pink-600 px-4 py-2 text-xs font-bold text-white shadow hover:bg-pink-700 transition disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? 'Đang xử lý...' : `Nhập dữ liệu (${fileData.length})`}
          </button>
        </div>
      </div>
    </div>
  );
}

function formatRemainingTime(endTimestamp: number, now: number) {
  const diffMs = endTimestamp - now;
  if (diffMs <= 0) return 'Vừa kết thúc';
  const totalMins = Math.floor(diffMs / 60000);
  const hours = Math.floor(totalMins / 60);
  const mins = totalMins % 60;
  if (hours === 0) return `Còn ${mins} phút`;
  if (mins === 0) return `Còn ${hours} giờ`;
  return `Còn ${hours}h ${mins}p`;
}

function formatTimeToStart(startTimestamp: number, now: number) {
  const diffMs = startTimestamp - now;
  if (diffMs <= 0) return 'Đang bắt đầu';
  const totalMins = Math.floor(diffMs / 60000);
  const hours = Math.floor(totalMins / 60);
  const mins = totalMins % 60;
  if (hours === 0) return `Sau ${mins} phút`;
  if (hours < 24) return `Sau ${hours}h ${mins}p`;
  const days = Math.floor(hours / 24);
  return `Sau ${days} ngày`;
}

function formatDateTimeDisplay(dateStr: string) {
  if (!dateStr) return '--:--';
  try {
    let normalized = dateStr.trim();
    if (!normalized.includes('Z') && !/\+\d{2}:?\d{2}$/.test(normalized) && !/-\d{2}:?\d{2}$/.test(normalized)) {
      normalized = `${normalized}+07:00`;
    }
    const d = new Date(normalized);
    if (isNaN(d.getTime())) return dateStr;
    const hh = String(d.getHours()).padStart(2, '0');
    const mm = String(d.getMinutes()).padStart(2, '0');
    const dd = String(d.getDate()).padStart(2, '0');
    const mo = String(d.getMonth() + 1).padStart(2, '0');
    const yy = d.getFullYear();
    return `${hh}:${mm} · ${dd}/${mo}/${yy}`;
  } catch {
    return dateStr;
  }
}

export default function CandidatesAdminPage() {
  const [candidates, setCandidates] = useState<Candidate[]>([]);
  const [search, setSearch] = useState('');
  const [tableFilter, setTableFilter] = useState('ALL');
  const [roundFilter, setRoundFilter] = useState('ALL');
  const [genderFilter, setGenderFilter] = useState('ALL');
  const [sourceFilter, setSourceFilter] = useState<'ALL' | 'WEB' | 'MANUAL' | 'IMPORT'>('ALL');
  const [modalMode, setModalMode] = useState<'add' | 'edit' | null>(null);
  const [form, setForm] = useState<Partial<Candidate>>(emptyCandidate);
  const [isImportModalOpen, setIsImportModalOpen] = useState(false);
  const [isRegistrationOpen, setIsRegistrationOpen] = useState(true);
  const [registrationDeadline, setRegistrationDeadline] = useState('2026-06-20T23:59');
  const [votingPromotions, setVotingPromotions] = useState<VotingPromotion[]>([]);
  const [isGateOpen, setIsGateOpen] = useState(true);
  const [hideCandidatesSection, setHideCandidatesSection] = useState(false);
  const [settingsSaving, setSettingsSaving] = useState(false);
  const [showPromotionManager, setShowPromotionManager] = useState(false);
  const [savedIndicator, setSavedIndicator] = useState(false);
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [currentTime, setCurrentTime] = useState(() => Date.now());

  useEffect(() => {
    const interval = setInterval(() => setCurrentTime(Date.now()), 30_000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    setSelectedIds([]);
  }, [search, tableFilter, roundFilter, genderFilter, sourceFilter]);

  const [isTableFilterOpen, setIsTableFilterOpen] = useState(false);
  const [isRoundFilterOpen, setIsRoundFilterOpen] = useState(false);
  const [isViewConfigOpen, setIsViewConfigOpen] = useState(false);
  const tableDropdownRef = useRef<HTMLDivElement>(null);
  const roundDropdownRef = useRef<HTMLDivElement>(null);
  const viewConfigRef = useRef<HTMLDivElement>(null);

  const [viewMode, setViewMode] = useState<'table' | 'grid'>('table');
  const [gridCols, setGridCols] = useState<number>(4);
  const [visibleColumns, setVisibleColumns] = useState({
    candidate: true,
    table: true,
    academic: true,
    measurements: true,
    status: true,
    votes: true,
  });

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (tableDropdownRef.current && !tableDropdownRef.current.contains(event.target as Node)) {
        setIsTableFilterOpen(false);
      }
      if (roundDropdownRef.current && !roundDropdownRef.current.contains(event.target as Node)) {
        setIsRoundFilterOpen(false);
      }
      if (viewConfigRef.current && !viewConfigRef.current.contains(event.target as Node)) {
        setIsViewConfigOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const loadCandidates = async () => {
    try {
      const res = await fetch(apiUrl('/api/candidates'));
      if (res.ok) setCandidates(await res.json());
    } catch {
      setCandidates([]);
    }
  };

  useEffect(() => {
    loadCandidates();
  }, []);

  useEffect(() => {
    async function loadSettings() {
      try {
        const res = await fetch(apiUrl('/api/admin/settings'));
        if (!res.ok) return;
        const data = await res.json();
        setIsRegistrationOpen(data.isRegistrationOpen ?? true);
        setRegistrationDeadline(data.registrationDeadline || '2026-06-20T23:59');
        setIsGateOpen(data.isGateOpen ?? false);
        setHideCandidatesSection(!!data.hideCandidatesSection);
        setVotingPromotions(Array.isArray(data.votingPromotions) ? data.votingPromotions : []);
      } catch {}
    }
    loadSettings();
  }, []);

  const rankedCandidates = useMemo(() => [...candidates].sort((a, b) => b.votes - a.votes), [candidates]);

  const filteredCandidates = useMemo(() => {
    const keyword = search.trim().toLowerCase();
    return rankedCandidates
      .filter((c) => tableFilter === 'ALL' || c.contestTable === tableFilter)
      .filter((c) => roundFilter === 'ALL' || c.currentRound === roundFilter)
      .filter((c) => genderFilter === 'ALL' || c.gender === genderFilter)
      .filter((c) => {
        if (sourceFilter === 'ALL') return true;
        const actualSource = c.source || (c.registrationId ? 'WEB' : 'MANUAL');
        return actualSource === sourceFilter;
      })
      .filter((c) =>
        !keyword ||
        c.name.toLowerCase().includes(keyword) ||
        c.sbd.toLowerCase().includes(keyword) ||
        (c.faculty || '').toLowerCase().includes(keyword) ||
        (c.className || '').toLowerCase().includes(keyword) ||
        (c.studentId || '').toLowerCase().includes(keyword) ||
        (c.leaderPhone || '').toLowerCase().includes(keyword) ||
        (c.leaderEmail || '').toLowerCase().includes(keyword) ||
        (c.talent || '').toLowerCase().includes(keyword)
      );
  }, [rankedCandidates, roundFilter, search, tableFilter, genderFilter, sourceFilter]);

  const femaleCount = useMemo(() => candidates.filter(c => c.gender === 'Nữ' || c.contestTable === 'FEMALE').length, [candidates]);
  const maleCount = useMemo(() => candidates.filter(c => c.gender === 'Nam' || c.contestTable === 'MALE').length, [candidates]);
  const webCount = useMemo(() => candidates.filter(c => (c.source || (c.registrationId ? 'WEB' : 'MANUAL')) === 'WEB').length, [candidates]);
  const manualCount = useMemo(() => candidates.filter(c => (c.source || (c.registrationId ? 'WEB' : 'MANUAL')) === 'MANUAL').length, [candidates]);
  const importCount = useMemo(() => candidates.filter(c => (c.source || (c.registrationId ? 'WEB' : 'MANUAL')) === 'IMPORT').length, [candidates]);

  const activePromotion = useMemo(() => {
    const now = currentTime;
    const parseVN = (dStr: string) => {
      if (!dStr) return NaN;
      let val = dStr.trim();
      if (!val.includes('Z') && !/\+\d{2}:?\d{2}$/.test(val) && !/-\d{2}:?\d{2}$/.test(val)) {
        val = `${val}+07:00`;
      }
      return new Date(val).getTime();
    };

    return votingPromotions.find((promotion) => {
      if (!promotion.isEnabled) return false;
      const start = parseVN(promotion.startAt);
      const end = parseVN(promotion.endAt);
      return Number.isFinite(start) && Number.isFinite(end) && start <= now && end >= now;
    }) || null;
  }, [votingPromotions, currentTime]);

  const upcomingPromotion = useMemo(() => {
    const now = currentTime;
    const parseVN = (dStr: string) => {
      if (!dStr) return NaN;
      let val = dStr.trim();
      if (!val.includes('Z') && !/\+\d{2}:?\d{2}$/.test(val) && !/-\d{2}:?\d{2}$/.test(val)) {
        val = `${val}+07:00`;
      }
      return new Date(val).getTime();
    };

    return (
      votingPromotions
        .filter((p) => {
          if (!p.isEnabled) return false;
          const start = parseVN(p.startAt);
          return Number.isFinite(start) && start > now;
        })
        .sort((a, b) => parseVN(a.startAt) - parseVN(b.startAt))[0] || null
    );
  }, [votingPromotions, currentTime]);

  const saveVotingSettings = async (
    nextPromotions = votingPromotions,
    nextRegistrationOpen = isRegistrationOpen,
    nextDeadline = registrationDeadline,
    nextGateOpen = isGateOpen
  ) => {
    setSettingsSaving(true);
    try {
      await fetch(apiUrl('/api/admin/settings'), {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          votingPromotions: nextPromotions,
          isRegistrationOpen: nextRegistrationOpen,
          registrationDeadline: nextDeadline,
          isGateOpen: nextGateOpen,
        }),
      });
      setSavedIndicator(true);
      setTimeout(() => setSavedIndicator(false), 2000);
    } catch {
      alert('Không thể lưu cài đặt bình chọn');
    } finally {
      setSettingsSaving(false);
    }
  };

  const handleToggleHideCandidates = async () => {
    const nextVal = !hideCandidatesSection;
    setHideCandidatesSection(nextVal);
    try {
      let res = await fetch(apiUrl('/api/admin/settings'), {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ hideCandidatesSection: nextVal }),
      });
      if (!res.ok && (res.status === 405 || res.status === 403)) {
        res = await fetch(apiUrl('/api/admin/settings'), {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ hideCandidatesSection: nextVal }),
        });
      }
      if (res.ok) {
        alert(nextVal ? 'Đã tạm ẩn mục Danh sách thí sinh trên trang chủ!' : 'Đã hiển thị mục Danh sách thí sinh trên trang chủ!');
      }
    } catch {
      alert('Không thể lưu cài đặt ẩn/hiện thí sinh');
    }
  };

  const addQuickPromotion = async (preset: PromotionQuickPreset, multiplier: number) => {
    const draft = createPromotionDraft(preset, multiplier);
    const nextList = [draft, ...votingPromotions];
    setVotingPromotions(nextList);
    setShowPromotionManager(true);
    await saveVotingSettings(nextList);
  };

  const handleAddNewPromotion = async () => {
    const draft = createPromotionDraft('NOW', 2);
    draft.name = 'Khung giờ nhân x2 mới';
    const nextList = [draft, ...votingPromotions];
    setVotingPromotions(nextList);
    setShowPromotionManager(true);
    await saveVotingSettings(nextList);
  };

  const updatePromotionField = (id: string, key: keyof VotingPromotion, val: any) => {
    const nextList = votingPromotions.map((p) => (p.id === id ? { ...p, [key]: val } : p));
    setVotingPromotions(nextList);
  };

  const savePromotionField = async (id: string, key: keyof VotingPromotion, val: any) => {
    const nextList = votingPromotions.map((p) => (p.id === id ? { ...p, [key]: val } : p));
    setVotingPromotions(nextList);
    await saveVotingSettings(nextList);
  };

  const deletePromotion = async (id: string) => {
    if (!confirm('Bạn có chắc muốn xóa khung giờ nhân điểm này?')) return;
    const nextList = votingPromotions.filter((p) => p.id !== id);
    setVotingPromotions(nextList);
    await saveVotingSettings(nextList);
  };

  const handleClearExpiredPromotions = async () => {
    if (!confirm('Dọn dẹp tất cả các khung giờ đã kết thúc khỏi danh sách?')) return;
    const nextList = votingPromotions.filter((p) => {
      const end = parsePromotionTime(p.endAt);
      return !Number.isFinite(end) || end >= currentTime;
    });
    setVotingPromotions(nextList);
    await saveVotingSettings(nextList);
  };

  const openAddModal = () => {
    setForm(emptyCandidate);
    setModalMode('add');
  };

  const openEditModal = (c: Candidate) => {
    setForm({
      ...c,
      contestTable: c.contestTable || 'FEMALE',
      contestTableLabel: c.contestTableLabel || tableLabels[c.contestTable || 'FEMALE'] || 'Bảng Nữ',
    });
    setModalMode('edit');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name || !form.sbd) {
      alert('Vui lòng điền Họ tên và SBD!');
      return;
    }

    try {
      if (modalMode === 'add') {
        const res = await fetch(apiUrl('/api/admin/candidates'), {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(form),
        });
        if (!res.ok) {
          const errData = await res.json().catch(() => null);
          throw new Error(errData?.error || errData?.message || 'Không thể tạo thí sinh');
        }
        alert('Thêm thí sinh mới thành công!');
      } else if (modalMode === 'edit' && form.id) {
        const res = await fetch(apiUrl(`/api/admin/candidates/${form.id}`), {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(form),
        });
        if (!res.ok) {
          const errData = await res.json().catch(() => null);
          throw new Error(errData?.error || errData?.message || 'Không thể cập nhật thí sinh');
        }
        alert('Cập nhật thông tin thí sinh thành công!');
      }

      setModalMode(null);
      loadCandidates();
    } catch (err: any) {
      alert(err.message || 'Lỗi khi lưu dữ liệu');
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Bạn có chắc muốn xóa thí sinh này vào thùng rác?')) return;
    try {
      const res = await fetch(apiUrl(`/api/admin/candidates/${id}`), { method: 'DELETE' });
      if (res.ok) {
        loadCandidates();
      } else {
        alert('Xóa thí sinh thất bại.');
      }
    } catch {
      alert('Lỗi kết nối khi xóa thí sinh.');
    }
  };

  const handleBulkDelete = async () => {
    if (selectedIds.length === 0) return;
    if (!confirm(`Bạn có chắc muốn xóa ${selectedIds.length} thí sinh đã chọn?`)) return;

    try {
      for (const id of selectedIds) {
        await fetch(apiUrl(`/api/admin/candidates/${id}`), { method: 'DELETE' });
      }
      setSelectedIds([]);
      loadCandidates();
    } catch {
      alert('Lỗi khi xóa hàng loạt.');
    }
  };

  const handleExportCandidates = () => {
    const headers = [
      'SBD',
      'Tên thí sinh',
      'Nguồn hồ sơ',
      'Giới tính',
      'Bảng thi',
      'Khoa',
      'Lớp',
      'MSSV',
      'Số điện thoại',
      'Email',
      'Chiều cao (cm)',
      'Cân nặng (kg)',
      'Vòng 1',
      'Vòng 2',
      'Vòng 3',
      'Năng khiếu',
      'Link Video',
      'Thông điệp',
      'Thành tích',
      'Giới thiệu',
      'Vòng hiện tại',
      'Trạng thái',
      'Điểm bình chọn',
      'Đường dẫn ảnh',
      'Bộ ảnh photoshoot',
    ];

    const csvRows = [headers.join(',')];

    for (const c of filteredCandidates) {
      const row = [
        escapeCSVValue(c.sbd),
        escapeCSVValue(c.name),
        escapeCSVValue(formatCandidateSource(c.source, c.registrationId)),
        escapeCSVValue(c.gender || 'Nữ'),
        escapeCSVValue(c.contestTableLabel || tableLabels[c.contestTable || ''] || c.contestTable),
        escapeCSVValue(c.faculty || ''),
        escapeCSVValue(c.className || ''),
        escapeCSVValue(c.studentId || ''),
        escapeCSVValue(c.leaderPhone || ''),
        escapeCSVValue(c.leaderEmail || ''),
        escapeCSVValue(c.heightCm || ''),
        escapeCSVValue(c.weightKg || ''),
        escapeCSVValue(c.measurementBust || ''),
        escapeCSVValue(c.measurementWaist || ''),
        escapeCSVValue(c.measurementHip || ''),
        escapeCSVValue(c.talent || ''),
        escapeCSVValue(c.videoUrl || ''),
        escapeCSVValue(c.inspirationalMessage || ''),
        escapeCSVValue(c.achievements || ''),
        escapeCSVValue(c.description || ''),
        escapeCSVValue(c.currentRound || ''),
        escapeCSVValue(c.status || ''),
        escapeCSVValue(c.votes || 0),
        escapeCSVValue(c.imageUrl || ''),
        escapeCSVValue(c.showcaseImages || ''),
      ];
      csvRows.push(row.join(','));
    }

    const csvContent = '\uFEFF' + csvRows.join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', `danh_sach_thi_sinh_iconic_${new Date().toISOString().slice(0, 10)}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="w-full max-w-full space-y-4">
      {/* SECTION HEADER & CONTROL BAR */}
      <section className="admin-card relative z-[80] overflow-visible p-0 border border-slate-200/80 shadow-sm bg-white rounded-2xl">
        <div className="flex flex-col gap-3 border-b border-slate-200/70 px-5 py-4 lg:flex-row lg:items-center lg:justify-between">
          <div className="min-w-0">
            <p className="text-[11px] font-black uppercase tracking-[0.22em] text-pink-600">Quản trị Cuộc thi</p>
            <h1 className="mt-0.5 text-xl font-extrabold tracking-tight text-slate-950">
              Danh sách Thí sinh
            </h1>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <button
              onClick={handleToggleHideCandidates}
              className={`admin-btn !h-8 text-xs font-bold gap-1.5 rounded-lg px-3 border transition ${
                hideCandidatesSection
                  ? 'border-amber-300 bg-amber-50 text-amber-800 hover:bg-amber-100'
                  : 'border-emerald-300 bg-emerald-50 text-emerald-800 hover:bg-emerald-100'
              }`}
              title={hideCandidatesSection ? 'Đang TẠM ẨN mục này trên trang chủ. Bấm để hiển thị lại.' : 'Đang HIỂN THỊ mục này trên trang chủ. Bấm để tạm ẩn.'}
            >
              <span>{hideCandidatesSection ? '👁️‍🗨️ Đang ẩn trang chủ' : '👁️ Đang hiện trang chủ'}</span>
            </button>
            <button onClick={handleExportCandidates} className="admin-btn admin-btn-secondary !h-8 text-xs gap-1.5 rounded-lg px-3">
              <svg viewBox="0 0 24 24" className="h-3.5 w-3.5" fill="none" stroke="currentColor" strokeWidth="2.5">
                <path d="M4 12v8a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-8" />
                <polyline points="16 6 12 2 8 6" />
                <line x1="12" y1="2" x2="12" y2="15" />
              </svg>
              Xuất CSV
            </button>
            <button onClick={() => setIsImportModalOpen(true)} className="admin-btn admin-btn-secondary !h-8 text-xs gap-1.5 rounded-lg px-3">
              <svg viewBox="0 0 24 24" className="h-3.5 w-3.5" fill="none" stroke="currentColor" strokeWidth="2.5">
                <path d="M4 12v8a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-8" />
                <polyline points="8 10 12 14 16 10" />
                <line x1="12" y1="14" x2="12" y2="2" />
              </svg>
              Nhập CSV
            </button>
            <button onClick={openAddModal} className="admin-btn bg-pink-600 hover:bg-pink-700 text-white !h-8 text-xs font-bold gap-1.5 rounded-lg px-4 shadow-sm transition">
              <svg viewBox="0 0 24 24" className="h-3.5 w-3.5" fill="none" stroke="currentColor" strokeWidth="2.5">
                <path d="M5 12h14" />
                <path d="M12 5v14" />
              </svg>
              Thêm thí sinh
            </button>
          </div>
        </div>

        {/* THỐNG KÊ NHANH */}
        <div className="grid gap-2.5 p-3.5 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-6 border-b border-slate-100 bg-slate-50/50">
          <div className="rounded-xl border border-slate-200/80 bg-white p-3 shadow-sm">
            <p className="text-[10px] font-black uppercase tracking-wider text-slate-400">Tổng thí sinh</p>
            <p className="mt-1 text-2xl font-extrabold text-slate-900">{candidates.length}</p>
            <div className="mt-1 flex flex-wrap items-center gap-x-1.5 gap-y-0.5 text-[10.5px] font-semibold text-slate-500">
              <span className="text-pink-600 font-bold">♀ {femaleCount}</span>
              <span>•</span>
              <span className="text-blue-600 font-bold">♂ {maleCount}</span>
              <span className="text-slate-300">|</span>
              <span className="text-sky-600 font-bold" title="Đăng ký qua Web">🌐 {webCount}</span>
              <span>•</span>
              <span className="text-amber-600 font-bold" title="Thêm thủ công">✍️ {manualCount}</span>
              <span>•</span>
              <span className="text-violet-600 font-bold" title="Nhập từ CSV">📥 {importCount}</span>
            </div>
          </div>

          <div className="rounded-xl border border-slate-200/80 bg-white p-3 shadow-sm">
            <div className="flex items-center justify-between">
              <p className="text-[10px] font-black uppercase tracking-wider text-slate-400">Cổng Đăng ký</p>
              <button
                type="button"
                disabled={settingsSaving}
                onClick={async () => {
                  const nextVal = !isRegistrationOpen;
                  setIsRegistrationOpen(nextVal);
                  await saveVotingSettings(votingPromotions, nextVal, registrationDeadline);
                }}
                className={`relative flex h-5 w-9 items-center rounded-full transition ${isRegistrationOpen ? 'bg-emerald-500' : 'bg-slate-300'}`}
              >
                <span className={`absolute h-3.5 w-3.5 rounded-full bg-white shadow transition ${isRegistrationOpen ? 'translate-x-4' : 'translate-x-1'}`} />
              </button>
            </div>
            <p className="mt-1 text-sm sm:text-base font-extrabold text-slate-900">
              {isRegistrationOpen ? '🟢 Đang mở' : '🔴 Đã đóng'}
            </p>
            <p className="text-[10px] text-slate-400 mt-0.5 truncate">Hạn: {registrationDeadline.replace('T', ' ')}</p>
          </div>

          <div className="rounded-xl border border-slate-200/80 bg-white p-3 shadow-sm">
            <div className="flex items-center justify-between">
              <p className="text-[10px] font-black uppercase tracking-wider text-slate-400">Cổng Bình chọn</p>
              <button
                type="button"
                disabled={settingsSaving}
                onClick={async () => {
                  const nextVal = !isGateOpen;
                  setIsGateOpen(nextVal);
                  await saveVotingSettings(votingPromotions, isRegistrationOpen, registrationDeadline, nextVal);
                }}
                className={`relative flex h-5 w-9 items-center rounded-full transition ${isGateOpen ? 'bg-emerald-500' : 'bg-slate-300'}`}
              >
                <span className={`absolute h-3.5 w-3.5 rounded-full bg-white shadow transition ${isGateOpen ? 'translate-x-4' : 'translate-x-1'}`} />
              </button>
            </div>
            <p className="mt-1 text-sm sm:text-base font-extrabold text-slate-900">
              {isGateOpen ? '🟢 Nhận vote' : '🔴 Đóng vote'}
            </p>
            <p className="text-[10px] text-slate-400 mt-0.5">Thời gian thực</p>
          </div>

          <div className="rounded-xl border border-slate-200/80 bg-white p-3 shadow-sm sm:col-span-2 md:col-span-3 xl:col-span-3 flex flex-col justify-between">
            <div className="flex items-center justify-between gap-2">
              <div className="flex items-center gap-1.5 min-w-0">
                <span className={`flex h-2 w-2 rounded-full ${activePromotion ? 'bg-emerald-500 animate-pulse' : 'bg-amber-400'}`} />
                <p className="text-[10px] font-black uppercase tracking-wider text-slate-400">Khung giờ nhân điểm</p>
              </div>
              <button
                type="button"
                onClick={() => setShowPromotionManager(!showPromotionManager)}
                className={`rounded-lg border px-2.5 py-1 text-[11px] font-bold transition shrink-0 shadow-2xs ${
                  showPromotionManager
                    ? 'border-pink-300 bg-pink-50 text-pink-700'
                    : 'border-slate-200 bg-slate-50 text-slate-700 hover:border-pink-400 hover:text-pink-600'
                }`}
              >
                {showPromotionManager ? '▲ Ẩn cài đặt' : `▼ Quản lý giờ${votingPromotions.length > 0 ? ` (${votingPromotions.length})` : ''}`}
              </button>
            </div>

            <div className="my-1.5 flex items-center justify-between gap-2">
              <div>
                <p className="text-sm sm:text-base font-extrabold text-slate-900 truncate">
                  {activePromotion ? `🔥 Đang x${activePromotion.multiplier} (${activePromotion.name})` : '⚪ Chưa kích hoạt'}
                </p>
                <p className="text-[10px] text-slate-400 mt-0.5">
                  {activePromotion
                    ? `Thời gian còn lại: ${formatRemainingTime(parsePromotionTime(activePromotion.endAt), currentTime)}`
                    : 'Bình chọn tính điểm chuẩn (x1)'}
                </p>
              </div>

              {activePromotion && (
                <button
                  type="button"
                  disabled={settingsSaving}
                  onClick={async () => {
                    const next = votingPromotions.map((p) => (p.id === activePromotion.id ? { ...p, isEnabled: false } : p));
                    setVotingPromotions(next);
                    await saveVotingSettings(next);
                  }}
                  className="rounded-lg border border-rose-200 bg-rose-50 px-2 py-1 text-[11px] font-extrabold text-rose-700 hover:bg-rose-100 transition shrink-0"
                  title="Tắt ngay chương trình nhân điểm hiện tại"
                >
                  ⛔ Dừng ngay
                </button>
              )}
            </div>

            <div className="flex flex-wrap items-center gap-1.5 pt-1 border-t border-slate-100">
              <span className="text-[10px] text-slate-400 font-bold">Tạo nhanh:</span>
              <button
                type="button"
                onClick={() => addQuickPromotion('NOW', 2)}
                className="rounded bg-pink-50 text-pink-700 px-2 py-0.5 text-[10.5px] font-bold hover:bg-pink-100 transition whitespace-nowrap"
              >
                + Ngay x2 (2h)
              </button>
              <button
                type="button"
                onClick={() => addQuickPromotion('TONIGHT', 2)}
                className="rounded bg-indigo-50 text-indigo-700 px-2 py-0.5 text-[10.5px] font-bold hover:bg-indigo-100 transition whitespace-nowrap"
              >
                + Tối nay x2
              </button>
              <button
                type="button"
                onClick={() => addQuickPromotion('TOMORROW', 3)}
                className="rounded bg-amber-50 text-amber-700 px-2 py-0.5 text-[10.5px] font-bold hover:bg-amber-100 transition whitespace-nowrap"
              >
                + Ngày mai x3
              </button>
            </div>
          </div>
        </div>

        {/* QUẢN LÝ KHUNG GIỜ NHÂN ĐIỂM INLINE - TINH GỌN, TỰ ĐỘNG LƯU */}
        {showPromotionManager && (
          <div className="border-b border-slate-200 bg-slate-50/80 p-3.5 sm:p-4 space-y-3">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <div className="flex items-center gap-2">
                <span className="text-xs font-black uppercase tracking-wider text-slate-800 flex items-center gap-1.5">
                  <span>⚡</span> Danh sách Khung giờ nhân điểm
                </span>
                {savedIndicator && (
                  <span className="inline-flex items-center gap-1 rounded-full bg-emerald-100 px-2 py-0.5 text-[10.5px] font-extrabold text-emerald-800 animate-in fade-in">
                    ✓ Đã tự động lưu
                  </span>
                )}
                {settingsSaving && (
                  <span className="text-[10.5px] font-bold text-slate-400">
                    Đang lưu...
                  </span>
                )}
              </div>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={handleAddNewPromotion}
                  disabled={settingsSaving}
                  className="rounded-lg bg-pink-600 hover:bg-pink-700 text-white px-3 py-1 text-xs font-bold transition flex items-center gap-1 shadow-2xs"
                >
                  <span>+ Thêm khung giờ</span>
                </button>
                {votingPromotions.some((p) => parsePromotionTime(p.endAt) < currentTime) && (
                  <button
                    type="button"
                    onClick={handleClearExpiredPromotions}
                    disabled={settingsSaving}
                    className="rounded-lg border border-slate-200 bg-white hover:bg-rose-50 hover:text-rose-600 text-slate-600 px-2.5 py-1 text-xs font-bold transition"
                    title="Xóa tất cả các khung giờ đã kết thúc"
                  >
                    Dọn dẹp lịch cũ
                  </button>
                )}
                <button
                  type="button"
                  onClick={() => setShowPromotionManager(false)}
                  className="rounded-lg border border-slate-200 bg-white hover:bg-slate-100 text-slate-600 px-2.5 py-1 text-xs font-bold transition"
                >
                  ▲ Thu gọn
                </button>
              </div>
            </div>

            {votingPromotions.length === 0 ? (
              <div className="rounded-xl border border-dashed border-slate-200 bg-white p-6 text-center text-xs text-slate-500">
                Chưa có khung giờ nhân điểm nào. Hãy bấm các nút tạo nhanh ở trên hoặc{' '}
                <button type="button" onClick={handleAddNewPromotion} className="text-pink-600 font-bold underline">
                  + Thêm khung giờ
                </button>.
              </div>
            ) : (
              <div className="overflow-x-auto rounded-xl border border-slate-200 bg-white shadow-2xs">
                <table className="w-full text-left text-xs border-collapse">
                  <thead>
                    <tr className="border-b border-slate-200 bg-slate-100/70 text-[11px] font-extrabold uppercase tracking-wider text-slate-600">
                      <th className="py-2.5 px-3">Trạng thái</th>
                      <th className="py-2.5 px-3 min-w-[180px]">Tên chương trình</th>
                      <th className="py-2.5 px-3 min-w-[130px]">Hệ số nhân</th>
                      <th className="py-2.5 px-3 min-w-[160px]">Bắt đầu</th>
                      <th className="py-2.5 px-3 min-w-[160px]">Kết thúc</th>
                      <th className="py-2.5 px-3 text-center">Bật/Tắt</th>
                      <th className="py-2.5 px-3 text-center">Xóa</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {votingPromotions.map((p) => {
                      const st = getPromotionStatus(p, currentTime);
                      const start = parsePromotionTime(p.startAt);
                      const end = parsePromotionTime(p.endAt);
                      const isRunning = p.isEnabled && start <= currentTime && end >= currentTime;
                      return (
                        <tr
                          key={p.id}
                          className={`hover:bg-slate-50/80 transition ${isRunning ? 'bg-emerald-50/40' : ''}`}
                        >
                          <td className="py-2 px-3 whitespace-nowrap">
                            <span className={`inline-flex items-center gap-1 text-[10px] font-black px-2 py-0.5 rounded-full border ${st.className}`}>
                              {isRunning && <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-ping" />}
                              {st.label}
                            </span>
                            {isRunning && (
                              <p className="text-[10px] font-bold text-emerald-700 mt-0.5">
                                {formatRemainingTime(end, currentTime)}
                              </p>
                            )}
                          </td>
                          <td className="py-2 px-3">
                            <input
                              type="text"
                              value={p.name}
                              onChange={(e) => updatePromotionField(p.id, 'name', e.target.value)}
                              onBlur={(e) => savePromotionField(p.id, 'name', e.target.value)}
                              placeholder="Tên sự kiện..."
                              className="h-8 w-full rounded-lg border border-slate-200 px-2.5 text-xs font-bold text-slate-800 focus:border-pink-500 focus:bg-white outline-none"
                            />
                          </td>
                          <td className="py-2 px-3">
                            <div className="flex items-center gap-1">
                              {[2, 3, 5].map((m) => (
                                <button
                                  key={m}
                                  type="button"
                                  onClick={() => savePromotionField(p.id, 'multiplier', m)}
                                  className={`h-7 px-2 rounded text-[10.5px] font-black transition ${
                                    p.multiplier === m
                                      ? 'bg-pink-600 text-white shadow-2xs'
                                      : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                                  }`}
                                >
                                  x{m}
                                </button>
                              ))}
                              <input
                                type="number"
                                step="0.5"
                                min="1.1"
                                max="100"
                                value={p.multiplier}
                                onChange={(e) => updatePromotionField(p.id, 'multiplier', parseFloat(e.target.value) || 2)}
                                onBlur={(e) => savePromotionField(p.id, 'multiplier', parseFloat(e.target.value) || 2)}
                                className="h-7 w-12 rounded border border-slate-200 px-1 text-center text-xs font-black text-slate-800 outline-none focus:border-pink-500"
                                title="Nhập hệ số khác"
                              />
                            </div>
                          </td>
                          <td className="py-2 px-3">
                            <input
                              type="datetime-local"
                              value={p.startAt}
                              onChange={(e) => {
                                updatePromotionField(p.id, 'startAt', e.target.value);
                                savePromotionField(p.id, 'startAt', e.target.value);
                              }}
                              className="h-8 w-full rounded-lg border border-slate-200 px-2 text-[11px] font-semibold text-slate-700 outline-none focus:border-pink-500"
                            />
                          </td>
                          <td className="py-2 px-3">
                            <input
                              type="datetime-local"
                              value={p.endAt}
                              onChange={(e) => {
                                updatePromotionField(p.id, 'endAt', e.target.value);
                                savePromotionField(p.id, 'endAt', e.target.value);
                              }}
                              className="h-8 w-full rounded-lg border border-slate-200 px-2 text-[11px] font-semibold text-slate-700 outline-none focus:border-pink-500"
                            />
                          </td>
                          <td className="py-2 px-3 text-center">
                            <button
                              type="button"
                              onClick={() => savePromotionField(p.id, 'isEnabled', !p.isEnabled)}
                              className={`relative inline-flex h-5 w-9 items-center rounded-full transition ${
                                p.isEnabled ? 'bg-emerald-500' : 'bg-slate-300'
                              }`}
                              title={p.isEnabled ? 'Đang bật. Bấm để tắt' : 'Đang tắt. Bấm để bật'}
                            >
                              <span
                                className={`absolute h-3.5 w-3.5 rounded-full bg-white shadow transition ${
                                  p.isEnabled ? 'translate-x-4' : 'translate-x-1'
                                }`}
                              />
                            </button>
                          </td>
                          <td className="py-2 px-3 text-center">
                            <button
                              type="button"
                              onClick={() => deletePromotion(p.id)}
                              className="rounded-lg p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition"
                              title="Xóa khung giờ"
                            >
                              <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="2">
                                <polyline points="3 6 5 6 21 6" />
                                <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6" />
                              </svg>
                            </button>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}

        {/* THANH TÌM KIẾM & BỘ LỌC */}
        <div className="flex flex-col gap-2.5 p-4 md:flex-row md:items-center md:justify-between">
          <div className="flex flex-1 flex-wrap items-center gap-2">
            <div className="relative min-w-[240px] flex-1">
              <svg viewBox="0 0 24 24" className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" fill="none" stroke="currentColor" strokeWidth="2">
                <circle cx="11" cy="11" r="8" />
                <path d="m21 21-4.35-4.35" />
              </svg>
              <input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Tìm tên, SBD, khoa, lớp, MSSV, SĐT..."
                className="h-9 w-full rounded-lg border border-slate-200 bg-white pl-9 pr-3 text-xs font-semibold text-slate-800 outline-none transition focus:border-pink-500"
              />
            </div>

            {/* Lọc Bảng thi */}
            <select
              value={tableFilter}
              onChange={(e) => setTableFilter(e.target.value)}
              className="h-9 rounded-lg border border-slate-200 bg-white px-3 text-xs font-bold text-slate-700 outline-none focus:border-pink-500"
            >
              <option value="ALL">Tất cả bảng</option>
              <option value="FEMALE">Bảng Nữ</option>
              <option value="MALE">Bảng Nam</option>
              <option value="STUDENT">Bảng Sinh viên</option>
            </select>

            {/* Lọc Giới tính */}
            <select
              value={genderFilter}
              onChange={(e) => setGenderFilter(e.target.value)}
              className="h-9 rounded-lg border border-slate-200 bg-white px-3 text-xs font-bold text-slate-700 outline-none focus:border-pink-500"
            >
              <option value="ALL">Tất cả giới tính</option>
              <option value="Nữ">Nữ ♀</option>
              <option value="Nam">Nam ♂</option>
            </select>

            {/* Lọc Nguồn hồ sơ */}
            <select
              value={sourceFilter}
              onChange={(e) => setSourceFilter(e.target.value as any)}
              className="h-9 rounded-lg border border-slate-200 bg-white px-3 text-xs font-bold text-slate-700 outline-none focus:border-pink-500"
            >
              <option value="ALL">Tất cả nguồn ({candidates.length})</option>
              <option value="WEB">🌐 Đăng ký Web ({webCount})</option>
              <option value="MANUAL">✍️ Thêm thủ công ({manualCount})</option>
              <option value="IMPORT">📥 Nhập CSV ({importCount})</option>
            </select>

            {/* Lọc Vòng thi */}
            <select
              value={roundFilter}
              onChange={(e) => setRoundFilter(e.target.value)}
              className="h-9 rounded-lg border border-slate-200 bg-white px-3 text-xs font-bold text-slate-700 outline-none focus:border-pink-500"
            >
              <option value="ALL">Tất cả vòng thi</option>
              {roundOptions.map((r) => (
                <option key={r} value={r}>{r}</option>
              ))}
            </select>
          </div>

          {/* Dạng hiển thị: Bảng / Thẻ */}
          <div className="flex items-center gap-1.5 self-end md:self-auto">
            <div className="flex rounded-lg border border-slate-200 bg-slate-100 p-0.5">
              <button
                type="button"
                onClick={() => setViewMode('table')}
                className={`flex items-center gap-1 rounded-md px-2.5 py-1 text-xs font-bold transition ${viewMode === 'table' ? 'bg-white text-pink-700 shadow-sm' : 'text-slate-600'}`}
              >
                <svg viewBox="0 0 24 24" className="h-3.5 w-3.5" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M3 3h18v18H3z" />
                  <path d="M3 9h18" />
                  <path d="M3 15h18" />
                  <path d="M9 3v18" />
                </svg>
                Bảng
              </button>
              <button
                type="button"
                onClick={() => setViewMode('grid')}
                className={`flex items-center gap-1 rounded-md px-2.5 py-1 text-xs font-bold transition ${viewMode === 'grid' ? 'bg-white text-pink-700 shadow-sm' : 'text-slate-600'}`}
              >
                <svg viewBox="0 0 24 24" className="h-3.5 w-3.5" fill="none" stroke="currentColor" strokeWidth="2">
                  <rect x="3" y="3" width="7" height="7" rx="1" />
                  <rect x="14" y="3" width="7" height="7" rx="1" />
                  <rect x="14" y="14" width="7" height="7" rx="1" />
                  <rect x="3" y="14" width="7" height="7" rx="1" />
                </svg>
                Thẻ
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* DANH SÁCH THÍ SINH THEO VIEW MODE */}
      {viewMode === 'grid' ? (
        <div className="grid gap-3.5 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5">
          {filteredCandidates.map((c) => {
            const tableLabel = c.contestTableLabel || tableLabels[c.contestTable || ''] || 'Bảng thi';
            const isFemale = c.gender === 'Nữ' || c.contestTable === 'FEMALE';

            return (
              <div key={c.id} className="bg-white border border-slate-200 rounded-2xl p-3.5 shadow-sm hover:shadow-md transition flex flex-col justify-between space-y-2.5 group">
                <div className="flex items-center justify-between gap-1">
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-black bg-slate-100 text-slate-800 border border-slate-200">
                    {c.sbd}
                  </span>
                  <div className="flex items-center gap-1 flex-wrap justify-end">
                    {getSourceBadge(c.source, c.registrationId)}
                    <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${isFemale ? 'bg-pink-50 text-pink-700 border border-pink-200' : 'bg-blue-50 text-blue-700 border border-blue-200'}`}>
                      {tableLabel}
                    </span>
                  </div>
                </div>

                <div className="flex flex-col items-center text-center space-y-1.5 py-1">
                  <div className="w-22 h-28 sm:w-24 sm:h-32 rounded-xl border border-slate-200 bg-slate-50 overflow-hidden shadow-inner relative">
                    <img src={formatAssetUrl(c.imageUrl)} className="h-full w-full object-cover" alt={c.name} />
                    <span className="absolute bottom-1 right-1 rounded bg-black/60 px-1 py-0.5 text-[9px] font-bold text-white backdrop-blur-sm">
                      {c.gender || 'Nữ'}
                    </span>
                  </div>
                  <h3 className="font-extrabold text-slate-900 text-[13px] leading-snug line-clamp-1">{c.name}</h3>
                  <p className="text-[11px] font-semibold text-slate-500 line-clamp-1">{c.faculty || 'HUIT'}</p>
                  <p className="text-[10px] text-slate-400">
                    {c.heightCm ? `${c.heightCm}cm` : ''} {c.weightKg ? `• ${c.weightKg}kg` : ''}
                  </p>
                </div>

                <div className="rounded-xl bg-pink-50/60 p-1.5 text-center border border-pink-100">
                  <span className="text-[9px] uppercase tracking-wider text-pink-500 font-black">Bình chọn</span>
                  <p className="text-sm font-black text-pink-700 tabular-nums">🗳️ {c.votes.toLocaleString()}</p>
                </div>

                <div className="pt-1.5 border-t border-slate-100 flex items-center justify-between text-xs font-bold">
                  <a href={`/thi-sinh/${c.sbd}`} target="_blank" rel="noopener noreferrer" className="text-slate-600 hover:text-pink-600 transition text-[11px]">
                    Xem web ↗
                  </a>
                  <button onClick={() => openEditModal(c)} className="text-blue-600 hover:underline text-[11px]">Sửa</button>
                  <button onClick={() => handleDelete(c.id)} className="text-rose-600 hover:underline text-[11px]">Xóa</button>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <section className="admin-card overflow-hidden p-0 border border-slate-200/80 shadow-sm bg-white rounded-2xl">
          {selectedIds.length > 0 && (
            <div className="flex items-center justify-between border-b border-rose-100 bg-rose-50/70 px-4 py-2">
              <span className="text-xs font-bold text-rose-700">
                Đã chọn <b>{selectedIds.length}</b> thí sinh
              </span>
              <button
                type="button"
                onClick={handleBulkDelete}
                className="flex items-center gap-1.5 rounded-lg bg-rose-600 hover:bg-rose-700 px-2.5 py-1 text-xs font-bold text-white shadow-sm transition"
              >
                <svg viewBox="0 0 24 24" className="h-3.5 w-3.5" fill="none" stroke="currentColor" strokeWidth="2.5">
                  <path d="M3 6h18" />
                  <path d="M19 6l-1 14H6L5 6" />
                </svg>
                Xóa các mục đã chọn
              </button>
            </div>
          )}

          <div className="w-full overflow-x-auto">
            <table className="dashboard-table min-w-[960px] text-left">
              <thead>
                <tr className="text-[10px] font-black uppercase tracking-[0.14em] text-slate-500 border-b border-slate-200/70 bg-slate-50/60">
                  <th className="px-3 py-3 w-10">
                    <input
                      type="checkbox"
                      checked={filteredCandidates.length > 0 && selectedIds.length === filteredCandidates.length}
                      onChange={(e) => {
                        if (e.target.checked) {
                          setSelectedIds(filteredCandidates.map((c) => c.id));
                        } else {
                          setSelectedIds([]);
                        }
                      }}
                      className="rounded border-slate-300 text-pink-600 focus:ring-pink-500 cursor-pointer"
                    />
                  </th>
                  <th className="px-3 py-3">Thí sinh</th>
                  <th className="px-3 py-3">Nguồn hồ sơ</th>
                  <th className="px-3 py-3">Bảng thi & Vòng</th>
                  <th className="px-3 py-3">Học tập HUIT</th>
                  <th className="px-3 py-3">Hình thể (Cao/Nặng)</th>
                  <th className="px-3 py-3">Trạng thái</th>
                  <th className="px-3 py-3 text-right">Lượt vote</th>
                  <th className="px-3 py-3 text-right">Thao tác</th>
                </tr>
              </thead>
              <tbody className="text-sm divide-y divide-slate-100">
                {filteredCandidates.map((c) => {
                  const tableLabel = c.contestTableLabel || tableLabels[c.contestTable || ''] || 'Bảng thi';
                  const isFemale = c.gender === 'Nữ' || c.contestTable === 'FEMALE';

                  return (
                    <tr key={c.id} className="align-middle transition hover:bg-slate-50/80">
                      <td className="px-4 py-3 w-10">
                        <input
                          type="checkbox"
                          checked={selectedIds.includes(c.id)}
                          onChange={(e) => {
                            if (e.target.checked) {
                              setSelectedIds((prev) => [...prev, c.id]);
                            } else {
                              setSelectedIds((prev) => prev.filter((id) => id !== c.id));
                            }
                          }}
                          className="rounded border-slate-300 text-pink-600 focus:ring-pink-500 cursor-pointer"
                        />
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex min-w-[210px] items-center gap-3">
                          <img
                            src={formatAssetUrl(c.imageUrl)}
                            alt={c.name}
                            className="h-12 w-10 shrink-0 rounded-lg border border-slate-200 object-cover shadow-sm"
                          />
                          <div className="min-w-0">
                            <p className="truncate text-[14px] font-extrabold text-slate-950">{c.name}</p>
                            <div className="mt-0.5 flex items-center gap-1.5">
                              <span className="rounded bg-slate-100 px-1.5 py-0.5 text-[10px] font-bold text-slate-600">
                                {c.sbd}
                              </span>
                              <span className={`text-[11px] font-bold ${isFemale ? 'text-pink-600' : 'text-blue-600'}`}>
                                {c.gender || 'Nữ'}
                              </span>
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-3 whitespace-nowrap">
                        {getSourceBadge(c.source, c.registrationId)}
                      </td>
                      <td className="px-4 py-3">
                        <span className={`inline-flex rounded-md border px-2.5 py-0.5 text-[11px] font-extrabold ${isFemale ? 'border-pink-200 bg-pink-50 text-pink-700' : 'border-blue-200 bg-blue-50 text-blue-700'}`}>
                          {tableLabel}
                        </span>
                        <p className="mt-1 text-[11px] font-semibold text-slate-500">{c.currentRound || 'Vòng sơ khảo'}</p>
                      </td>
                      <td className="px-4 py-3">
                        <div className="max-w-[200px]">
                          <p className="truncate text-xs font-bold text-slate-800">{c.faculty || 'Chưa chọn khoa'}</p>
                          <p className="text-[11px] text-slate-500 font-medium">{c.className || 'Chưa rõ lớp'} {c.studentId ? `• ${c.studentId}` : ''}</p>
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        <div className="text-xs font-semibold text-slate-700">
                          {c.heightCm ? `${c.heightCm} cm` : '--'} • {c.weightKg ? `${c.weightKg} kg` : '--'}
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex flex-col gap-1 items-start">
                          <span className={`inline-flex rounded-md border px-2 py-0.5 text-[10px] font-bold ${c.status === 'Đủ hồ sơ' ? 'border-emerald-200 bg-emerald-50 text-emerald-700' : 'border-amber-200 bg-amber-50 text-amber-700'}`}>
                            {c.status || 'Đủ hồ sơ'}
                          </span>
                          {c.videoUrl && (
                            <a href={c.videoUrl} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1 text-[10px] font-bold text-indigo-600 hover:underline">
                              <span>▶ Video clip</span>
                            </a>
                          )}
                        </div>
                      </td>
                      <td className="px-4 py-3 text-right">
                        <p className="text-lg font-black tabular-nums text-pink-600">{c.votes.toLocaleString()}</p>
                        <p className="text-[10px] font-bold uppercase text-slate-400">lượt vote</p>
                      </td>
                      <td className="px-4 py-3 text-right">
                        <div className="flex justify-end gap-1.5">
                          <ActionButton href={`/thi-sinh/${c.sbd}`} target="_blank" title="Xem công khai ngoài website" tone="view">
                            <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="2">
                              <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6" />
                              <polyline points="15 3 21 3 21 9" />
                              <line x1="10" y1="14" x2="21" y2="3" />
                            </svg>
                          </ActionButton>
                          <ActionButton onClick={() => openEditModal(c)} title="Chỉnh sửa hồ sơ" tone="edit">
                            <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="2">
                              <path d="M12 20h9" />
                              <path d="M16.5 3.5a2.1 2.1 0 0 1 3 3L7 19l-4 1 1-4Z" />
                            </svg>
                          </ActionButton>
                          <ActionButton onClick={() => handleDelete(c.id)} title="Xóa hồ sơ" tone="delete">
                            <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="2">
                              <path d="M3 6h18" />
                              <path d="M19 6l-1 14H6L5 6" />
                              <path d="M10 11v6" />
                              <path d="M14 11v6" />
                            </svg>
                          </ActionButton>
                        </div>
                      </td>
                    </tr>
                  );
                })}

                {filteredCandidates.length === 0 && (
                  <tr>
                    <td colSpan={9} className="px-5 py-12 text-center text-sm font-semibold text-slate-500">
                      Không có thí sinh nào phù hợp bộ lọc tìm kiếm.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </section>
      )}

      {modalMode && (
        <CandidateModal
          title={modalMode === 'add' ? 'Thêm thí sinh HUIT mới' : `Cập nhật hồ sơ: ${form.name || form.sbd}`}
          mode={modalMode}
          form={form}
          setForm={setForm}
          onClose={() => setModalMode(null)}
          onSubmit={handleSubmit}
        />
      )}

      {isImportModalOpen && (
        <ImportModal
          onClose={() => setIsImportModalOpen(false)}
          onSuccess={() => {
            loadCandidates();
          }}
        />
      )}
    </div>
  );
}
