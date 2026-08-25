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
  let name = 'Promotion đang chạy';

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
    name = 'Promotion ngày mai';
  }

  if (preset === 'WEEKEND') {
    start = new Date(now);
    const daysUntilSaturday = (6 - start.getDay() + 7) % 7 || 7;
    start.setDate(start.getDate() + daysUntilSaturday);
    start.setHours(8, 0, 0, 0);
    end = new Date(start);
    end.setDate(end.getDate() + 1);
    end.setHours(22, 0, 0, 0);
    name = 'Promotion cuối tuần';
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
  HIGH_SCHOOL: 'Bảng học sinh',
  STUDENT: 'Bảng sinh viên',
  ENTERPRISE: 'Bảng doanh nghiệp',
};

const emptyCandidate: Partial<Candidate> = {
  sbd: '',
  name: '',
  votes: 0,
  imageUrl: '/duan/anhmauduan.png',
  description: '',
  biography: '',
  contestTable: 'STUDENT',
  contestTableLabel: tableLabels.STUDENT,
  sector: '',
  status: 'Đang cập nhật',
  currentRound: 'Vòng loại',
  teamName: '',
  representativeSchool: '',
  leaderName: '',
  leaderPhone: '',
  leaderEmail: '',
  advisorName: '',
  members: '',
  supportNeeds: '',
  expectations: '',
  implementationLocation: '',
  intellectualPropertyCommitment: true,
  showcaseImages: '',
};

function Pill({
  children,
  tone = 'slate',
}: {
  children: React.ReactNode;
  tone?: 'green' | 'blue' | 'orange' | 'red' | 'slate';
}) {
  const classes = {
    green: 'border-emerald-200/80 bg-emerald-50 text-emerald-700 shadow-[inset_0_1px_0_rgba(255,255,255,0.6)]',
    blue: 'border-sky-200/80 bg-sky-50 text-sky-700 shadow-[inset_0_1px_0_rgba(255,255,255,0.6)]',
    orange: 'border-orange-200/80 bg-orange-50 text-orange-700 shadow-[inset_0_1px_0_rgba(255,255,255,0.6)]',
    red: 'border-rose-200/80 bg-rose-50 text-rose-700 shadow-[inset_0_1px_0_rgba(255,255,255,0.6)]',
    slate: 'border-slate-200/80 bg-slate-50 text-slate-600 shadow-[inset_0_1px_0_rgba(255,255,255,0.6)]',
  };

  return (
    <span className={`inline-flex items-center rounded-full border px-3 py-1.5 text-[11px] font-extrabold leading-none tracking-[-0.01em] ${classes[tone]}`}>
      {children}
    </span>
  );
}

function ActionButton({
  title,
  tone,
  children,
  onClick,
  href,
}: {
  title: string;
  tone: 'view' | 'edit' | 'delete';
  children: React.ReactNode;
  onClick?: () => void;
  href?: string;
}) {
  const classes = {
    view: 'border-slate-200 bg-white text-slate-500 hover:border-slate-300 hover:bg-slate-50 hover:text-slate-900',
    edit: 'border-emerald-200/80 bg-emerald-50 text-emerald-700 hover:border-emerald-300 hover:bg-emerald-100',
    delete: 'border-rose-200/80 bg-rose-50 text-rose-600 hover:border-rose-300 hover:bg-rose-100',
  };
  const className = `grid h-9 w-9 place-items-center rounded-lg border shadow-sm transition duration-150 hover:-translate-y-[1px] ${classes[tone]}`;

  if (href) {
    return (
      <Link href={href} title={title} aria-label={title} className={className}>
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

function roundTone(round?: string): 'green' | 'blue' | 'orange' | 'slate' {
  if (!round) return 'slate';
  if (round.includes('chung')) return 'orange';
  if (round.includes('bán')) return 'blue';
  if (round.includes('loại')) return 'green';
  return 'slate';
}

function parseMembers(membersStr: string, isEnterprise: boolean): any[] {
  if (!membersStr || !membersStr.trim()) return [];
  const lines = membersStr.split('\n').map(line => line.trim()).filter(Boolean);
  return lines.map((line) => {
    let cleanLine = line.replace(/^\d+[\.\/\-\s]*/, '').trim();
    const parts = cleanLine.split(/\s*-\s*/).map(p => p.trim());
    if (isEnterprise) {
      return {
        fullName: parts[0] || '',
        dob: parts[1] || '',
        role: parts[2] || '',
        company: parts[3] || '',
        phone: parts[4] || '',
        email: parts[5] || '',
        experience: parts[6] || '',
      };
    } else {
      return {
        fullName: parts[0] || '',
        studentId: parts[1] || '',
        school: parts[2] || '',
        phone: parts[3] || '',
        email: parts[4] || '',
      };
    }
  });
}

function serializeMembers(membersList: any[], isEnterprise: boolean): string {
  return membersList
    .map((m, index) => {
      const parts = isEnterprise ? [
        m.fullName || '',
        m.dob || '',
        m.role || '',
        m.company || '',
        m.phone || '',
        m.email || '',
        m.experience || ''
      ] : [
        m.fullName || '',
        m.studentId || '',
        m.school || '',
        m.phone || '',
        m.email || ''
      ];
      const content = parts.map(p => p.trim()).join(' - ');
      return `${index + 1}. ${content}`;
    })
    .join('\n');
}

function CandidateModal({
  title,
  form,
  setForm,
  onClose,
  onSubmit,
}: {
  title: string;
  form: Partial<Candidate>;
  setForm: (value: Partial<Candidate>) => void;
  onClose: () => void;
  onSubmit: (event: React.FormEvent) => void;
}) {
  const update = (key: keyof Candidate, value: any) => {
    const next = { ...form, [key]: value };
    if (key === 'contestTable') next.contestTableLabel = tableLabels[value] || value;
    if (key === 'sbd') {
      const sbdVal = value?.trim();
      if (sbdVal && (!form.imageUrl || form.imageUrl === '/duan/anhmauduan.png' || form.imageUrl.startsWith('/duan/'))) {
        next.imageUrl = `/duan/${sbdVal}/main.jpg`;
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
        // Cập nhật cục bộ và lưu
        const newList = [...showcaseList];
        newList[indexToUpdate] = url;
        setShowcaseList(newList);
        update('showcaseImages', newList.filter(Boolean).join(','));
      }
      alert('Tải ảnh lên thành công!');
    } else {
      alert('Tải ảnh thất bại. Vui lòng kiểm tra backend.');
    }
    setUploadingIndex(null);
    if (modalFileRef.current) modalFileRef.current.value = '';
  };

  const isEnterprise = form.contestTable === 'ENTERPRISE';
  const [membersList, setMembersList] = useState<any[]>(() => {
    return parseMembers(form.members || '', isEnterprise);
  });

  const handleMemberFieldChange = (index: number, field: string, value: string) => {
    const newList = membersList.map((m, idx) => {
      if (idx === index) {
        return { ...m, [field]: value };
      }
      return m;
    });
    setMembersList(newList);
    update('members', serializeMembers(newList, form.contestTable === 'ENTERPRISE'));
  };

  const handleAddMember = () => {
    const isEnt = form.contestTable === 'ENTERPRISE';
    const newMember = isEnt ? {
      fullName: '',
      dob: '',
      role: '',
      company: '',
      phone: '',
      email: '',
      experience: '',
    } : {
      fullName: '',
      studentId: '',
      school: '',
      phone: '',
      email: '',
    };
    const newList = [...membersList, newMember];
    setMembersList(newList);
    update('members', serializeMembers(newList, isEnt));
  };

  const handleRemoveMember = (index: number) => {
    const newList = membersList.filter((_, idx) => idx !== index);
    setMembersList(newList);
    update('members', serializeMembers(newList, form.contestTable === 'ENTERPRISE'));
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
    const sbd = form.sbd?.trim() || 'TEMP';
    const nextIndex = showcaseList.length + 1;
    const newUrl = `/duan/${sbd}/${nextIndex}.jpg`;
    const newList = [...showcaseList, newUrl];
    setShowcaseList(newList);
    update('showcaseImages', newList.filter(Boolean).join(','));
  };

  const handleRemoveShowcase = (index: number) => {
    const newList = showcaseList.filter((_, idx) => idx !== index);
    setShowcaseList(newList);
    update('showcaseImages', newList.filter(Boolean).join(','));
  };

  const inputClass = 'h-10 w-full rounded-lg border border-slate-200 bg-slate-50 px-3 text-xs font-semibold text-slate-800 outline-none transition focus:border-emerald-600 focus:bg-white';
  const rowInputClass = 'h-9 w-full rounded-md border border-slate-200 bg-slate-50 px-2.5 text-xs font-semibold text-slate-800 outline-none transition focus:border-emerald-600 focus:bg-white';
  const labelText = 'text-[10px] font-black uppercase tracking-[0.12em] text-slate-500';

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-950/55 p-4 backdrop-blur-sm">
      <form onSubmit={onSubmit} className="mx-auto my-6 w-full max-w-5xl rounded-2xl border border-slate-200 bg-white p-5 shadow-2xl">
        <div className="flex items-start justify-between gap-4 border-b border-slate-100 pb-4">
          <div>
            <p className="text-[10px] font-black uppercase tracking-[0.18em] text-emerald-700">Hồ sơ thí sinh dự thi</p>
            <h3 className="mt-1 text-xl font-black text-slate-900">{title}</h3>
          </div>
          <button type="button" onClick={onClose} className="rounded-lg border border-slate-200 px-3 py-2 text-xs font-bold text-slate-600 hover:border-emerald-600 hover:text-emerald-700">
            Đóng
          </button>
        </div>

        <div className="mt-5 grid grid-cols-1 gap-4 md:grid-cols-3">
          <label className="space-y-1.5 md:col-span-2">
            <span className={labelText}>Tên thí sinh <span className="text-red-500 font-bold">*</span></span>
            <input className={inputClass} value={form.name || ''} onChange={(event) => update('name', event.target.value)} required />
          </label>
          <label className="space-y-1.5">
            <span className={labelText}>Mã thí sinh / SBD <span className="text-red-500 font-bold">*</span></span>
            <input className={inputClass} value={form.sbd || ''} onChange={(event) => update('sbd', event.target.value)} required />
          </label>
          <label className="space-y-1.5">
            <span className={labelText}>Bảng thi</span>
            <select
              className={inputClass}
              value={form.contestTable || 'STUDENT'}
              onChange={(event) => {
                const val = event.target.value;
                const oldIsEnterprise = form.contestTable === 'ENTERPRISE';
                const newIsEnterprise = val === 'ENTERPRISE';
                update('contestTable', val);
                
                const currentSerialized = serializeMembers(membersList, oldIsEnterprise);
                const newParsed = parseMembers(currentSerialized, newIsEnterprise);
                setMembersList(newParsed);
                update('members', serializeMembers(newParsed, newIsEnterprise));
              }}
            >
              <option value="HIGH_SCHOOL">Bảng học sinh</option>
              <option value="STUDENT">Bảng sinh viên</option>
              <option value="ENTERPRISE">Bảng doanh nghiệp</option>
            </select>
          </label>
          <label className="space-y-1.5">
            <span className={labelText}>Lĩnh vực</span>
            <input className={inputClass} value={form.sector || ''} onChange={(event) => update('sector', event.target.value)} placeholder="AI, thực phẩm, giáo dục..." />
          </label>
          <label className="space-y-1.5">
            <span className={labelText}>Vòng hiện tại</span>
            <select className={inputClass} value={form.currentRound || 'Vòng loại'} onChange={(event) => update('currentRound', event.target.value)}>
              <option>Vòng loại</option>
              <option>Vòng bán kết</option>
              <option>Vòng chung kết</option>
            </select>
          </label>
          <label className="space-y-1.5">
            <span className={labelText}>Trạng thái</span>
            <input className={inputClass} value={form.status || ''} onChange={(event) => update('status', event.target.value)} />
          </label>
          <label className="space-y-1.5">
            <span className={labelText}>Điểm bình chọn</span>
            <input type="number" min={0} className={inputClass} value={form.votes || 0} onChange={(event) => update('votes', Number(event.target.value))} />
          </label>
          <div className="md:col-span-2">
            <ImageDropzone
              label="Hình ảnh chân dung đại diện"
              value={form.imageUrl || ''}
              onChange={(url) => update('imageUrl', url)}
              aspectRatioHint="Khuyên dùng ảnh chân dung rõ nét (3:4 hoặc 1:1)"
            />
          </div>
          <label className="space-y-1.5">
            <span className={labelText}>Tên nhóm</span>
            <input className={inputClass} value={form.teamName || ''} onChange={(event) => update('teamName', event.target.value)} />
          </label>
          <label className="space-y-1.5">
            <span className={labelText}>Đơn vị / trường</span>
            <input className={inputClass} value={form.representativeSchool || ''} onChange={(event) => update('representativeSchool', event.target.value)} />
          </label>
          <label className="space-y-1.5">
            <span className={labelText}>Trưởng nhóm</span>
            <input className={inputClass} value={form.leaderName || ''} onChange={(event) => update('leaderName', event.target.value)} />
          </label>
          <label className="space-y-1.5">
            <span className={labelText}>SĐT trưởng nhóm</span>
            <input type="tel" pattern="0[0-9]{9,10}" title="Số điện thoại phải gồm 10 hoặc 11 chữ số và bắt đầu bằng số 0" placeholder="Ví dụ: 0987654321" className={inputClass} value={form.leaderPhone || ''} onChange={(event) => update('leaderPhone', event.target.value)} />
          </label>
          <label className="space-y-1.5">
            <span className={labelText}>Email trưởng nhóm</span>
            <input type="email" placeholder="Ví dụ: email@domain.com" className={inputClass} value={form.leaderEmail || ''} onChange={(event) => update('leaderEmail', event.target.value)} />
          </label>
          <label className="space-y-1.5">
            <span className={labelText}>Cố vấn</span>
            <input className={inputClass} value={form.advisorName || ''} onChange={(event) => update('advisorName', event.target.value)} />
          </label>

          {/* Showcase Images Gallery */}
          <div className="rounded-xl border border-slate-200 bg-slate-50/50 p-4 md:col-span-3 space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex flex-col">
                <span className={labelText}>Hình ảnh trưng bày thí sinh</span>
                <span className="text-[10px] font-bold text-slate-400 italic">Tối đa 5 hình ảnh để trưng bày trên trang chi tiết</span>
              </div>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  disabled={showcaseList.length >= 5}
                  onClick={handleAddShowcase}
                  className="flex items-center gap-1.5 rounded-lg bg-slate-800 px-3 py-1.5 text-xs font-bold text-white shadow-sm hover:bg-slate-700 transition duration-150 ease-in-out active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M5 12h14" />
                    <path d="M12 5v14" />
                  </svg>
                  Thêm ảnh ({showcaseList.length}/5)
                </button>
              </div>
            </div>

            {showcaseList.length === 0 ? (
              <div className="rounded-xl border border-dashed border-slate-300 bg-white py-6 px-4 text-center">
                <p className="text-xs font-semibold text-slate-400">Chưa có hình ảnh trưng bày nào.</p>
                <p className="mt-1 text-[10px] text-slate-400">Nhấn nút "Thêm ảnh" ở trên để tải lên tối đa 5 hình ảnh.</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {showcaseList.map((url, index) => (
                  <div key={index} className="flex items-center gap-3 bg-white p-3 rounded-lg border border-slate-200 shadow-sm relative hover:border-slate-300 transition">
                    <div className="h-12 w-16 shrink-0 border border-slate-100 rounded-lg overflow-hidden bg-slate-50 flex items-center justify-center">
                      {url ? (
                        <img src={formatAssetUrl(url)} alt={`Trưng bày ${index + 1}`} className="h-full w-full object-cover" />
                      ) : (
                        <span className="text-[9px] text-slate-400 font-bold text-center px-1">Chưa có ảnh</span>
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <span className="text-[9px] font-black text-slate-500 uppercase tracking-wider block mb-1">Đường dẫn ảnh #{index + 1}</span>
                      <div className="flex gap-1.5">
                        <input
                          type="text"
                          placeholder="Ví dụ: /duan/anh1.png hoặc link ảnh online"
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
                          className="h-9 shrink-0 rounded-md border border-slate-200 bg-slate-50 px-2 text-xs font-bold text-slate-700 hover:border-emerald-500 hover:text-emerald-700 transition"
                        >
                          Tải lên
                        </button>
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={() => handleRemoveShowcase(index)}
                      className="rounded-lg border border-slate-100 bg-slate-50 p-1.5 text-slate-400 hover:border-red-200 hover:bg-red-50 hover:text-red-600 transition"
                      title="Xóa ảnh"
                    >
                      <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M18 6 6 18" />
                        <path d="m6 6 12 12" />
                      </svg>
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="rounded-xl border border-slate-200 bg-slate-50/50 p-4 md:col-span-3 space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex flex-col">
                <span className={labelText}>Thành viên nhóm</span>
                <span className="text-[10px] font-bold text-slate-400 italic">Không bao gồm Trưởng nhóm</span>
              </div>
              <button
                type="button"
                onClick={handleAddMember}
                className="flex items-center gap-1.5 rounded-lg bg-emerald-600 px-3 py-1.5 text-xs font-bold text-white shadow-sm hover:bg-emerald-700 transition duration-150 ease-in-out active:scale-95"
              >
                <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M5 12h14" />
                  <path d="M12 5v14" />
                </svg>
                Thêm thành viên
              </button>
            </div>

            {membersList.length === 0 ? (
              <div className="rounded-xl border border-dashed border-slate-300 bg-white py-8 px-4 text-center">
                <p className="text-xs font-semibold text-slate-400">Chưa có thành viên nào trong danh sách.</p>
                <p className="mt-1 text-[10px] text-slate-400">Nhấn nút "Thêm thành viên" ở trên để bắt đầu.</p>
              </div>
            ) : (
              <div className="space-y-3 max-h-[400px] overflow-y-auto pr-1">
                {membersList.map((member, index) => (
                  <div key={index} className="relative rounded-xl border border-slate-200 bg-white p-4 shadow-sm hover:border-slate-300 hover:shadow transition duration-150">
                    <div className="absolute right-3 top-3">
                      <button
                        type="button"
                        onClick={() => handleRemoveMember(index)}
                        className="rounded-lg border border-slate-100 bg-slate-50 p-1.5 text-slate-400 hover:border-red-200 hover:bg-red-50 hover:text-red-600 transition"
                        title="Xóa thành viên"
                      >
                        <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                          <path d="M18 6 6 18" />
                          <path d="m6 6 12 12" />
                        </svg>
                      </button>
                    </div>

                    <p className="text-[11px] font-black text-emerald-700 mb-3 flex items-center gap-1.5">
                      <span className="grid h-5 w-5 place-items-center rounded-full bg-emerald-50 text-[10px] font-bold text-emerald-700">
                        {index + 1}
                      </span>
                      Thành viên #{index + 1}
                    </p>

                    {form.contestTable === 'ENTERPRISE' ? (
                      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 md:grid-cols-4">
                        <label className="space-y-1 col-span-1 sm:col-span-2 md:col-span-1">
                          <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Họ và tên <span className="text-red-500 font-bold">*</span></span>
                          <input
                            required
                            type="text"
                            placeholder="Ví dụ: Nguyễn Văn A"
                            className={rowInputClass}
                            value={member.fullName || ''}
                            onChange={(e) => handleMemberFieldChange(index, 'fullName', e.target.value)}
                          />
                        </label>
                        <label className="space-y-1">
                          <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Ngày sinh</span>
                          <input
                            type="text"
                            placeholder="Ví dụ: 01/01/1990"
                            className={rowInputClass}
                            value={member.dob || ''}
                            onChange={(e) => handleMemberFieldChange(index, 'dob', e.target.value)}
                          />
                        </label>
                        <label className="space-y-1">
                          <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Chức vụ trong thí sinh</span>
                          <input
                            type="text"
                            placeholder="Ví dụ: Lập trình viên"
                            className={rowInputClass}
                            value={member.role || ''}
                            onChange={(e) => handleMemberFieldChange(index, 'role', e.target.value)}
                          />
                        </label>
                        <label className="space-y-1">
                          <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Đơn vị công tác</span>
                          <input
                            type="text"
                            placeholder="Ví dụ: Công ty A"
                            className={rowInputClass}
                            value={member.company || ''}
                            onChange={(e) => handleMemberFieldChange(index, 'company', e.target.value)}
                          />
                        </label>
                        <label className="space-y-1">
                          <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Số điện thoại</span>
                          <input
                            type="tel"
                            pattern="0[0-9]{9,10}"
                            title="Số điện thoại phải gồm 10 hoặc 11 chữ số và bắt đầu bằng số 0"
                            placeholder="Ví dụ: 0987654321"
                            className={rowInputClass}
                            value={member.phone || ''}
                            onChange={(e) => handleMemberFieldChange(index, 'phone', e.target.value)}
                          />
                        </label>
                        <label className="space-y-1">
                          <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Email</span>
                          <input
                            type="email"
                            placeholder="Ví dụ: email@domain.com"
                            className={rowInputClass}
                            value={member.email || ''}
                            onChange={(e) => handleMemberFieldChange(index, 'email', e.target.value)}
                          />
                        </label>
                        <label className="space-y-1 col-span-1 sm:col-span-2 md:col-span-2">
                          <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Chuyên môn/kinh nghiệm</span>
                          <input
                            type="text"
                            placeholder="Ví dụ: 3 năm kinh nghiệm lập trình React"
                            className={rowInputClass}
                            value={member.experience || ''}
                            onChange={(e) => handleMemberFieldChange(index, 'experience', e.target.value)}
                          />
                        </label>
                      </div>
                    ) : (
                      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 md:grid-cols-5">
                        <label className="space-y-1 col-span-1 sm:col-span-2 md:col-span-1">
                          <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Họ và tên <span className="text-red-500 font-bold">*</span></span>
                          <input
                            required
                            type="text"
                            placeholder="Ví dụ: Nguyễn Văn A"
                            className={rowInputClass}
                            value={member.fullName || ''}
                            onChange={(e) => handleMemberFieldChange(index, 'fullName', e.target.value)}
                          />
                        </label>
                        <label className="space-y-1">
                          <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">MSHS/MSSV</span>
                          <input
                            type="text"
                            placeholder="Ví dụ: 2001211234"
                            className={rowInputClass}
                            value={member.studentId || ''}
                            onChange={(e) => handleMemberFieldChange(index, 'studentId', e.target.value)}
                          />
                        </label>
                        <label className="space-y-1 col-span-1 sm:col-span-2 md:col-span-1">
                          <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Trường học</span>
                          <input
                            type="text"
                            placeholder="Ví dụ: ĐH Công Thương"
                            className={rowInputClass}
                            value={member.school || ''}
                            onChange={(e) => handleMemberFieldChange(index, 'school', e.target.value)}
                          />
                        </label>
                        <label className="space-y-1">
                          <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Số điện thoại</span>
                          <input
                            type="tel"
                            pattern="0[0-9]{9,10}"
                            title="Số điện thoại phải gồm 10 hoặc 11 chữ số và bắt đầu bằng số 0"
                            placeholder="Ví dụ: 0987654321"
                            className={rowInputClass}
                            value={member.phone || ''}
                            onChange={(e) => handleMemberFieldChange(index, 'phone', e.target.value)}
                          />
                        </label>
                        <label className="space-y-1">
                          <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Email</span>
                          <input
                            type="email"
                            placeholder="Ví dụ: email@domain.com"
                            className={rowInputClass}
                            value={member.email || ''}
                            onChange={(e) => handleMemberFieldChange(index, 'email', e.target.value)}
                          />
                        </label>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>

          <label className="space-y-1.5">
            <span className={labelText}>Địa điểm triển khai</span>
            <input className={inputClass} value={form.implementationLocation || ''} onChange={(event) => update('implementationLocation', event.target.value)} placeholder="Ví dụ: TP. Hồ Chí Minh" />
          </label>
          <label className="space-y-1.5">
            <span className={labelText}>Cam kết sở hữu trí tuệ</span>
            <select className={inputClass} value={form.intellectualPropertyCommitment === false ? 'false' : 'true'} onChange={(event) => update('intellectualPropertyCommitment', event.target.value === 'true')}>
              <option value="true">Có cam kết</option>
              <option value="false">Không cam kết</option>
            </select>
          </label>
          <label className="space-y-1.5 md:col-span-3">
            <span className={labelText}>Mô tả ngắn <span className="text-red-500 font-bold">*</span></span>
            <textarea className="h-20 w-full resize-y rounded-lg border border-slate-200 bg-slate-50 p-3 text-xs font-medium text-slate-800 outline-none transition focus:border-emerald-600 focus:bg-white" value={form.description || ''} onChange={(event) => update('description', event.target.value)} required />
          </label>
          <label className="space-y-1.5 md:col-span-3">
            <span className={labelText}>Thuyết minh / nội dung chi tiết</span>
            <textarea className="h-28 w-full resize-y rounded-lg border border-slate-200 bg-slate-50 p-3 text-xs font-medium text-slate-800 outline-none transition focus:border-emerald-600 focus:bg-white" value={form.biography || ''} onChange={(event) => update('biography', event.target.value)} />
          </label>
          <label className="space-y-1.5 md:col-span-3">
            <span className={labelText}>Nhu cầu hỗ trợ</span>
            <textarea className="h-20 w-full resize-y rounded-lg border border-slate-200 bg-slate-50 p-3 text-xs font-medium text-slate-800 outline-none transition focus:border-emerald-600 focus:bg-white" value={form.supportNeeds || ''} onChange={(event) => update('supportNeeds', event.target.value)} placeholder="Nhu cầu về vốn, công nghệ, mentor, mặt bằng..." />
          </label>
          <label className="space-y-1.5 md:col-span-3">
            <span className={labelText}>Kỳ vọng sau cuộc thi</span>
            <textarea className="h-20 w-full resize-y rounded-lg border border-slate-200 bg-slate-50 p-3 text-xs font-medium text-slate-800 outline-none transition focus:border-emerald-600 focus:bg-white" value={form.expectations || ''} onChange={(event) => update('expectations', event.target.value)} placeholder="Kết nối đầu tư, thương mại hóa sản phẩm, truyền thông..." />
          </label>
        </div>

        <div className="mt-5 flex justify-end gap-2 border-t border-slate-100 pt-4">
          <button type="button" onClick={onClose} className="rounded-lg border border-slate-200 bg-white px-4 py-2 text-xs font-bold text-slate-600 hover:border-emerald-600 hover:text-emerald-700">
            Hủy
          </button>
          <button type="submit" className="rounded-lg bg-slate-900 px-4 py-2 text-xs font-bold text-white shadow hover:bg-emerald-700">
            Lưu hồ sơ
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
  'Bảng thi': 'contestTable',
  'Lĩnh vực': 'sector',
  'Vòng hiện tại': 'currentRound',
  'Trạng thái': 'status',
  'Điểm bình chọn': 'votes',
  'Đường dẫn ảnh': 'imageUrl',
  'Tên nhóm': 'teamName',
  'Đơn vị trường': 'representativeSchool',
  'Trưởng nhóm': 'leaderName',
  'SĐT trưởng nhóm': 'leaderPhone',
  'Email trưởng nhóm': 'leaderEmail',
  'Cố vấn': 'advisorName',
  'Thành viên nhóm': 'members',
  'Hình ảnh trưng bày': 'showcaseImages',
  'Địa điểm triển khai': 'implementationLocation',
  'Cam kết sở hữu trí tuệ': 'intellectualPropertyCommitment',
  'Mô tả ngắn': 'description',
  'Thuyết minh chi tiết': 'biography',
  'Nhu cầu hỗ trợ': 'supportNeeds',
  'Kỳ vọng sau cuộc thi': 'expectations',
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
            if (fieldKey === 'intellectualPropertyCommitment') {
              item[fieldKey] = val.toLowerCase() === 'có' || val.toLowerCase() === 'true' || val === '1';
            } else if (fieldKey === 'votes') {
              item[fieldKey] = Number(val) || 0;
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
      'Bảng thi',
      'Lĩnh vực',
      'Vòng hiện tại',
      'Trạng thái',
      'Điểm bình chọn',
      'Đường dẫn ảnh',
      'Tên nhóm',
      'Đơn vị trường',
      'Trưởng nhóm',
      'SĐT trưởng nhóm',
      'Email trưởng nhóm',
      'Cố vấn',
      'Thành viên nhóm',
      'Hình ảnh trưng bày',
      'Địa điểm triển khai',
      'Cam kết sở hữu trí tuệ',
      'Mô tả ngắn',
      'Thuyết minh chi tiết',
      'Nhu cầu hỗ trợ',
      'Kỳ vọng sau cuộc thi'
    ];

    const sampleRow = [
      'SBD001',
      'Thí sinh 1',
      'STUDENT',
      'Công nghệ thông tin',
      'Vòng loại',
      'Đang cập nhật',
      '150',
      '/duan/anhmauduan.png',
      'Nhóm CNTT HUIT',
      'Đại học Công Thương',
      'Nguyễn Văn A',
      '0987654321',
      'nguyenvana@gmail.com',
      'Thầy Advisor',
      '1. Nguyễn Văn B - 2001211234 - ĐH Công Thương\n2. Nguyễn Văn C - 2001215678 - ĐH Công Thương',
      '/duan/SBD001/1.jpg,/duan/SBD001/2.jpg',
      'TP.HCM',
      'Có',
      'Mô tả ngắn thí sinh công nghệ thông tin tuyển dụng việc làm.',
      'Thuyết minh chi tiết thí sinh công nghệ thông tin gồm đầy đủ kế hoạch kinh doanh và lộ trình phát triển.',
      'Hỗ trợ vốn và kết nối doanh nghiệp',
      'Thương mại hóa sản phẩm'
    ];

    const csvContent = '\uFEFF' + [headers.join(','), sampleRow.map(escapeCSVValue).join(',')].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', 'candidates_import_template.csv');
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
        headers: {
          'Content-Type': 'application/json',
        },
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
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-950/55 p-4 backdrop-blur-sm flex items-center justify-center">
      <div className="w-full max-w-2xl rounded-2xl border border-slate-200 bg-white p-6 shadow-2xl space-y-5">
        <div className="flex items-start justify-between gap-4 border-b border-slate-100 pb-4">
          <div>
            <p className="text-[10px] font-black uppercase tracking-[0.18em] text-emerald-700">Nhập dữ liệu thí sinh</p>
            <h3 className="mt-1 text-xl font-black text-slate-900">Nhập danh sách từ CSV</h3>
          </div>
          <button type="button" onClick={onClose} className="rounded-lg border border-slate-200 px-3 py-2 text-xs font-bold text-slate-600 hover:border-emerald-600 hover:text-emerald-700">
            Đóng
          </button>
        </div>

        <div className="space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-slate-50 p-4 rounded-xl border border-slate-200">
            <div>
              <p className="text-xs font-bold text-slate-800">Tải tệp tin CSV mẫu để điền thông tin</p>
              <p className="text-[10px] text-slate-500 font-semibold mt-1">Đảm bảo cấu trúc cột và định dạng tiếng Việt đúng chuẩn.</p>
            </div>
            <button
              onClick={handleDownloadTemplate}
              className="shrink-0 flex items-center gap-1.5 rounded-lg border border-slate-300 bg-white px-3 py-2 text-xs font-bold text-slate-700 hover:border-emerald-500 hover:text-emerald-500 transition animate-pulse"
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
            <p className="mt-2 text-xs font-bold text-slate-700">Kéo thả hoặc nhấp để chọn tệp tin CSV</p>
            <p className="text-[10px] text-slate-400 font-bold mt-1">Chỉ chấp nhận file định dạng .csv</p>
            {fileName && (
              <div className="mt-3 px-3 py-1.5 bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs rounded-lg font-bold">
                Tệp đã chọn: {fileName} ({fileData.length} dòng hợp lệ)
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
          <button type="button" onClick={onClose} className="rounded-lg border border-slate-200 bg-white px-4 py-2 text-xs font-bold text-slate-600 hover:border-emerald-600 hover:text-emerald-700">
            Hủy
          </button>
          <button
            type="button"
            disabled={loading || fileData.length === 0}
            onClick={handleImport}
            className="flex items-center gap-1.5 rounded-lg bg-slate-900 px-4 py-2 text-xs font-bold text-white shadow hover:bg-emerald-700 transition disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? (
              <>
                <svg className="animate-spin -ml-1 mr-1.5 h-4 w-4 text-white" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                </svg>
                Đang xử lý...
              </>
            ) : (
              <>Nhập dữ liệu ({fileData.length})</>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}

export default function CandidatesAdminPage() {
  const [projects, setCandidates] = useState<Candidate[]>([]);
  const [search, setSearch] = useState('');
  const [tableFilter, setTableFilter] = useState('ALL');
  const [roundFilter, setRoundFilter] = useState('ALL');
  const [modalMode, setModalMode] = useState<'add' | 'edit' | null>(null);
  const [selectedCandidate, setSelectedCandidate] = useState<Candidate | null>(null);
  const [form, setForm] = useState<Partial<Candidate>>(emptyCandidate);
  const [isImportModalOpen, setIsImportModalOpen] = useState(false);
  const [isRegistrationOpen, setIsRegistrationOpen] = useState(true);
  const [registrationDeadline, setRegistrationDeadline] = useState('2026-06-20T23:59');
  const [votingPromotions, setVotingPromotions] = useState<VotingPromotion[]>([]);
  const [isGateOpen, setIsGateOpen] = useState(true);
  const [settingsSaving, setSettingsSaving] = useState(false);
  const [showPromotionManager, setShowPromotionManager] = useState(false);
  const [openPromotionApplyId, setOpenPromotionApplyId] = useState<string | null>(null);
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [currentTime, setCurrentTime] = useState(() => Date.now());

  useEffect(() => {
    const interval = setInterval(() => setCurrentTime(Date.now()), 30_000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    setSelectedIds([]);
  }, [search, tableFilter, roundFilter]);

  const [isTableFilterOpen, setIsTableFilterOpen] = useState(false);
  const [isRoundFilterOpen, setIsRoundFilterOpen] = useState(false);
  const [isViewConfigOpen, setIsViewConfigOpen] = useState(false);
  const tableDropdownRef = useRef<HTMLDivElement>(null);
  const roundDropdownRef = useRef<HTMLDivElement>(null);
  const viewConfigRef = useRef<HTMLDivElement>(null);

  // View Mode & Column Visibility Controls
  const [viewMode, setViewMode] = useState<'table' | 'grid'>('table');
  const [gridCols, setGridCols] = useState<number>(4);
  const [visibleColumns, setVisibleColumns] = useState({
    select: true,
    project: true,
    table: true,
    leader: true,
    votes: true,
    actions: true,
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
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
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
        setVotingPromotions(Array.isArray(data.votingPromotions) ? data.votingPromotions : []);
      } catch {}
    }

    loadSettings();
  }, []);

  const rankedCandidates = useMemo(() => [...projects].sort((a, b) => b.votes - a.votes), [projects]);

  const filteredCandidates = useMemo(() => {
    const keyword = search.trim().toLowerCase();
    return rankedCandidates
      .filter((project) => tableFilter === 'ALL' || project.contestTable === tableFilter)
      .filter((project) => roundFilter === 'ALL' || project.currentRound === roundFilter)
      .filter((project) =>
        !keyword ||
        project.name.toLowerCase().includes(keyword) ||
        project.sbd.toLowerCase().includes(keyword) ||
        (project.teamName || '').toLowerCase().includes(keyword) ||
        (project.leaderName || '').toLowerCase().includes(keyword) ||
        (project.representativeSchool || '').toLowerCase().includes(keyword)
      );
  }, [rankedCandidates, roundFilter, search, tableFilter]);

  const missingInfo = projects.filter((project) => !project.teamName || !project.leaderName || !project.contestTable).length;
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

  const saveVotingSettings = async (
    nextPromotions = votingPromotions,
    nextRegistrationOpen = isRegistrationOpen,
    nextRegistrationDeadline = registrationDeadline,
    nextGateOpen = isGateOpen,
  ) => {
    setSettingsSaving(true);
    try {
      const currentRes = await fetch(apiUrl('/api/admin/settings'));
      if (!currentRes.ok) {
        const errorText = await currentRes.text().catch(() => '');
        throw new Error(`Tải cấu hình hiện tại thất bại (HTTP ${currentRes.status}: ${errorText || currentRes.statusText})`);
      }
      const currentSettings = await currentRes.json();
      const res = await fetch(apiUrl('/api/admin/settings'), {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...currentSettings,
          isRegistrationOpen: nextRegistrationOpen,
          registrationDeadline: nextRegistrationDeadline,
          votingPromotions: nextPromotions,
          isGateOpen: nextGateOpen,
        }),
      });
      if (!res.ok) {
        const errorText = await res.text().catch(() => '');
        throw new Error(`Lưu cấu hình thất bại (HTTP ${res.status}: ${errorText || res.statusText})`);
      }
    } catch (err: any) {
      console.error('Lỗi khi lưu cấu hình:', err);
      alert(`Không thể lưu cấu hình promotion / đăng ký. Chi tiết: ${err.message || err}`);
    } finally {
      setSettingsSaving(false);
    }
  };

  const updatePromotion = (id: string, field: keyof VotingPromotion, value: string | number | boolean) => {
    setVotingPromotions((prev) => prev.map((promotion) => (
      promotion.id === id ? { ...promotion, [field]: value } : promotion
    )));
  };

  const addPromotion = () => {
    setVotingPromotions((prev) => [...prev, createPromotionDraft()]);
  };

  const addQuickPromotion = (preset: PromotionQuickPreset, multiplier = 2) => {
    setVotingPromotions((prev) => [createPromotionDraft(preset, multiplier), ...prev]);
    setShowPromotionManager(true);
  };

  const duplicatePromotion = (promotion: VotingPromotion) => {
    setVotingPromotions((prev) => [
      {
        ...promotion,
        id: `promo-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
        name: `${promotion.name} (bản sao)`,
      },
      ...prev,
    ]);
  };

  const removePromotion = (id: string) => {
    setVotingPromotions((prev) => prev.filter((promotion) => promotion.id !== id));
  };

  const openAddModal = () => {
    setSelectedCandidate(null);
    setForm({ ...emptyCandidate });
    setModalMode('add');
  };

  const openEditModal = (project: Candidate) => {
    setSelectedCandidate(project);
    setForm({ ...emptyCandidate, ...project });
    setModalMode('edit');
  };

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    const isEdit = modalMode === 'edit' && selectedCandidate;
    const endpoint = isEdit ? `/api/admin/candidates/${selectedCandidate.id}` : '/api/admin/candidates';
    const method = isEdit ? 'PUT' : 'POST';
    const res = await fetch(apiUrl(endpoint), {
      method,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(form),
    });

    if (!res.ok) {
      alert('Không thể lưu hồ sơ thí sinh. Vui lòng kiểm tra backend.');
      return;
    }

    const saved = await res.json();
    setCandidates((prev) => isEdit ? prev.map((project) => project.id === saved.id ? saved : project) : [saved, ...prev]);
    
    if (isEdit) {
      alert('Cập nhật hồ sơ thí sinh thành công!');
    } else {
      alert('Thêm thí sinh mới thành công!');
    }
    
    setModalMode(null);
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Xóa hồ sơ thí sinh này khỏi hệ thống?')) return;
    const res = await fetch(apiUrl(`/api/admin/candidates/${id}`), { method: 'DELETE' });
    if (res.ok) setCandidates((prev) => prev.filter((project) => project.id !== id));
  };

  const handleBulkDelete = async () => {
    if (selectedIds.length === 0) return;
    if (!confirm(`Bạn có chắc chắn muốn xóa ${selectedIds.length} thí sinh đã chọn? Hành động này không thể hoàn tác.`)) return;

    let successCount = 0;
    let failCount = 0;

    await Promise.all(
      selectedIds.map(async (id) => {
        try {
          const res = await fetch(apiUrl(`/api/admin/candidates/${id}`), { method: 'DELETE' });
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

    alert(`Đã xóa thành công ${successCount} thí sinh.${failCount > 0 ? ` Thất bại ${failCount} thí sinh.` : ''}`);
    if (successCount > 0) {
      setCandidates((prev) => prev.filter((project) => !selectedIds.includes(project.id)));
    }
    setSelectedIds([]);
  };

  const handleExportCandidates = () => {
    const headers = [
      'SBD',
      'Tên thí sinh',
      'Bảng thi',
      'Lĩnh vực',
      'Vòng hiện tại',
      'Trạng thái',
      'Điểm bình chọn',
      'Đường dẫn ảnh',
      'Tên nhóm',
      'Đơn vị trường',
      'Trưởng nhóm',
      'SĐT trưởng nhóm',
      'Email trưởng nhóm',
      'Cố vấn',
      'Thành viên nhóm',
      'Hình ảnh trưng bày',
      'Địa điểm triển khai',
      'Cam kết sở hữu trí tuệ',
      'Mô tả ngắn',
      'Thuyết minh chi tiết',
      'Nhu cầu hỗ trợ',
      'Kỳ vọng sau cuộc thi'
    ];

    const csvRows = [headers.join(',')];

    for (const project of projects) {
      const row = [
        escapeCSVValue(project.sbd),
        escapeCSVValue(project.name),
        escapeCSVValue(project.contestTable),
        escapeCSVValue(project.sector),
        escapeCSVValue(project.currentRound),
        escapeCSVValue(project.status),
        escapeCSVValue(project.votes),
        escapeCSVValue(project.imageUrl),
        escapeCSVValue(project.teamName),
        escapeCSVValue(project.representativeSchool),
        escapeCSVValue(project.leaderName),
        escapeCSVValue(project.leaderPhone),
        escapeCSVValue(project.leaderEmail),
        escapeCSVValue(project.advisorName),
        escapeCSVValue(project.members),
        escapeCSVValue(project.showcaseImages),
        escapeCSVValue(project.implementationLocation),
        project.intellectualPropertyCommitment ? 'Có' : 'Không',
        escapeCSVValue(project.description),
        escapeCSVValue(project.biography),
        escapeCSVValue(project.supportNeeds),
        escapeCSVValue(project.expectations)
      ];
      csvRows.push(row.join(','));
    }

    const csvContent = '\uFEFF' + csvRows.join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', `candidates_export_${new Date().toISOString().slice(0, 10)}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleDownloadCandidateTemplate = () => {
    const headers = [
      'SBD',
      'Tên thí sinh',
      'Bảng thi',
      'Lĩnh vực',
      'Vòng hiện tại',
      'Trạng thái',
      'Điểm bình chọn',
      'Đường dẫn ảnh',
      'Tên nhóm',
      'Đơn vị trường',
      'Trưởng nhóm',
      'SĐT trưởng nhóm',
      'Email trưởng nhóm',
      'Cố vấn',
      'Thành viên nhóm',
      'Hình ảnh trưng bày',
      'Địa điểm triển khai',
      'Cam kết sở hữu trí tuệ',
      'Mô tả ngắn',
      'Thuyết minh chi tiết',
      'Nhu cầu hỗ trợ',
      'Kỳ vọng sau cuộc thi',
    ];
    const sampleRow = [
      'DA001',
      'Thí sinh mẫu HUIT ICONIC',
      'STUDENT',
      'Công nghệ, AI',
      'Vòng loại',
      'Đủ hồ sơ',
      '0',
      '/duan/anhmauduan.png',
      'Nhóm mẫu',
      'Trường Đại học Công Thương TP.HCM',
      'Nguyễn Văn A',
      '0987654321',
      'email@example.com',
      'TS. Trần Văn B',
      '1. Nguyễn Văn A - 20000001 - HUIT - 0987654321 - email@example.com',
      '',
      'TP. Hồ Chí Minh',
      'Có',
      'Mô tả ngắn về thí sinh mẫu.',
      'Thuyết minh chi tiết thí sinh mẫu.',
      'Cần mentor và kết nối doanh nghiệp.',
      'Hoàn thiện sản phẩm sau cuộc thi.',
    ];
    const csvContent = '\uFEFF' + [headers.join(','), sampleRow.map(escapeCSVValue).join(',')].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', 'candidates_import_template.csv');
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  return (
    <div className="w-full max-w-full space-y-3.5">
      <section className="admin-card relative z-[80] overflow-visible p-0">
        <div className="flex flex-col gap-2.5 border-b border-slate-200/70 px-4 py-3.5 lg:flex-row lg:items-center lg:justify-between">
          <div className="min-w-0">
            <p className="text-[11px] font-black uppercase tracking-[0.22em] text-[var(--primary-strong)]">Quản lý cuộc thi</p>
            <h2 className="mt-0.5 text-[20px] font-extrabold tracking-[-0.04em] text-slate-950">Danh sách thí sinh tham gia</h2>
          </div>
          <div className="flex flex-wrap items-center gap-2.5">
            <button onClick={handleExportCandidates} className="admin-btn admin-btn-secondary !h-8 !min-h-0 px-2.5 text-xs gap-1.5 rounded-lg">
              <svg viewBox="0 0 24 24" className="h-3.5 w-3.5" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="M4 12v8a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-8" />
                <polyline points="16 6 12 2 8 6" />
                <line x1="12" y1="2" x2="12" y2="15" />
              </svg>
              Xuất
            </button>
            <button onClick={handleDownloadCandidateTemplate} className="admin-btn admin-btn-secondary !h-8 !min-h-0 px-2.5 text-xs gap-1.5 rounded-lg">
              <svg viewBox="0 0 24 24" className="h-3.5 w-3.5" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
                <polyline points="14 2 14 8 20 8" />
                <path d="M12 18v-6" />
                <path d="m9 15 3 3 3-3" />
              </svg>
              Tai mau
            </button>
            <button onClick={() => setIsImportModalOpen(true)} className="admin-btn admin-btn-secondary !h-8 !min-h-0 px-2.5 text-xs gap-1.5 rounded-lg">
              <svg viewBox="0 0 24 24" className="h-3.5 w-3.5" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="M4 12v8a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-8" />
                <polyline points="8 10 12 14 16 10" />
                <line x1="12" y1="14" x2="12" y2="2" />
              </svg>
              Nhập
            </button>
            <button onClick={openAddModal} className="admin-btn admin-btn-primary min-w-[132px]">
              Thêm thí sinh mới
            </button>
          </div>
        </div>

        <div className="relative z-[90] grid gap-2 overflow-visible p-3 xl:grid-cols-8">
          {[
            ['Tổng thí sinh', projects.length.toLocaleString()],
            ['Thiếu thông tin', missingInfo.toLocaleString()],
          ].map(([label, value]) => (
            <div key={label} className="dashboard-stat-card flex min-h-[104px] flex-col justify-center xl:col-span-1">
              <div>
                <p className="text-[10px] font-black uppercase tracking-[0.18em] text-slate-400">{label}</p>
                <p className="mt-1.5 text-[20px] font-extrabold tracking-[-0.04em] text-slate-950">{value}</p>
              </div>
            </div>
          ))}

          <div className="dashboard-stat-card relative z-[220] flex min-h-[118px] flex-col justify-between !overflow-visible xl:col-span-2">
            <div className="flex items-start justify-between gap-3">
              <div className="min-w-0">
                <p className="text-[10px] font-black uppercase tracking-[0.18em] text-slate-400">Đăng ký</p>
                <p className="mt-2 text-[22px] font-extrabold tracking-[-0.04em] text-slate-950">
                  {isRegistrationOpen ? 'Đang mở' : 'Đang đóng'}
                </p>
              </div>
              <button
                type="button"
                disabled={settingsSaving}
                onClick={async () => {
                  const nextValue = !isRegistrationOpen;
                  setIsRegistrationOpen(nextValue);
                  await saveVotingSettings(votingPromotions, nextValue, registrationDeadline);
                }}
                className={`relative mt-1 flex h-7 w-12 items-center rounded-full transition ${isRegistrationOpen ? 'bg-emerald-500' : 'bg-slate-300'} ${settingsSaving ? 'opacity-60' : ''}`}
              >
                <span className={`absolute h-5 w-5 rounded-full bg-white shadow-md transition ${isRegistrationOpen ? 'translate-x-6' : 'translate-x-1'}`} />
              </button>
            </div>
            <div className="space-y-1">
              <label className="block text-[10px] font-bold uppercase tracking-[0.16em] text-slate-400">Hạn đăng ký</label>
              <DateTimeInput
                value={registrationDeadline}
                onChange={(val) => setRegistrationDeadline(val)}
                className="admin-input-dti"
              />
            </div>
          </div>

          <div className="dashboard-stat-card flex min-h-[118px] flex-col justify-between xl:col-span-2">
            <div className="flex items-start justify-between gap-3">
              <div className="min-w-0">
                <p className="text-[10px] font-black uppercase tracking-[0.18em] text-slate-400">Bình chọn</p>
                <p className="mt-2 text-[22px] font-extrabold tracking-[-0.04em] text-slate-950">
                  {isGateOpen ? 'Đang mở' : 'Đang đóng'}
                </p>
              </div>
              <button
                type="button"
                disabled={settingsSaving}
                onClick={async () => {
                  const nextValue = !isGateOpen;
                  setIsGateOpen(nextValue);
                  await saveVotingSettings(votingPromotions, isRegistrationOpen, registrationDeadline, nextValue);
                }}
                className={`relative mt-1 flex h-7 w-12 items-center rounded-full transition ${isGateOpen ? 'bg-emerald-500' : 'bg-slate-300'} ${settingsSaving ? 'opacity-60' : ''}`}
              >
                <span className={`absolute h-5 w-5 rounded-full bg-white shadow-md transition ${isGateOpen ? 'translate-x-6' : 'translate-x-1'}`} />
              </button>
            </div>
            <div className="space-y-1 text-left">
              <span className="block text-[10px] font-bold uppercase tracking-[0.16em] text-slate-400">Trạng thái cổng</span>
              <p className="text-[11px] font-semibold text-slate-500 truncate leading-normal">
                {isGateOpen ? 'Đang mở nhận lượt vote' : 'Đã đóng nhận lượt vote'}
              </p>
            </div>
          </div>

          <div className="dashboard-stat-card relative z-40 flex min-h-[118px] flex-col justify-between !overflow-visible xl:col-span-2">
            <div className="flex items-start justify-between gap-3">
              <div className="min-w-0">
                <p className="text-[10px] font-black uppercase tracking-[0.18em] text-slate-400">Promotion</p>
                <p className="mt-2 truncate text-[22px] font-extrabold tracking-[-0.04em] text-slate-950">
                  {activePromotion ? `Đang chạy x${activePromotion.multiplier}` : 'Chưa chạy'}
                </p>
                <p className="mt-1 text-[11px] font-semibold text-slate-500">{votingPromotions.length} khung giờ</p>
              </div>
              <button type="button" onClick={() => setShowPromotionManager((prev) => !prev)} className="admin-btn admin-btn-secondary min-w-[92px]">
                {showPromotionManager ? 'Ẩn' : 'Quản lý'}
              </button>
            </div>
            <div className="grid grid-cols-2 gap-1.5">
              <button type="button" onClick={() => addQuickPromotion('NOW', 2)} className="admin-btn admin-btn-secondary !h-8 text-xs">
                Tạo nhanh
              </button>
              <button type="button" disabled={settingsSaving} onClick={() => saveVotingSettings()} className="admin-btn admin-btn-primary !h-8 text-xs">
                {settingsSaving ? 'Đang lưu...' : 'Lưu'}
              </button>
            </div>
          </div>
        </div>

        {showPromotionManager && (
          <div className="relative z-[100] border-t border-slate-200/70 px-3 py-3">
            <div className="mb-3 flex flex-col gap-3 xl:flex-row xl:items-start xl:justify-between">
              <div className="min-w-0">
                <p className="text-[11px] font-black uppercase tracking-[0.18em] text-slate-400">Quy trình tạo Promotion</p>
                <p className="mt-1 text-[13px] font-medium text-slate-500">Chọn mẫu thời gian, kiểm tra hệ số nhân điểm, sau đó bấm Lưu để áp dụng.</p>
              </div>
              <div className="flex flex-wrap gap-2">
                <button type="button" onClick={() => addQuickPromotion('NOW', 2)} className="admin-btn admin-btn-secondary !h-8 px-3 text-xs">Bắt đầu ngay x2</button>
                <button type="button" onClick={() => addQuickPromotion('TONIGHT', 2)} className="admin-btn admin-btn-secondary !h-8 px-3 text-xs">Tối nay x2</button>
                <button type="button" onClick={() => addQuickPromotion('TOMORROW', 3)} className="admin-btn admin-btn-secondary !h-8 px-3 text-xs">Ngày mai x3</button>
                <button type="button" onClick={() => addQuickPromotion('WEEKEND', 2)} className="admin-btn admin-btn-secondary !h-8 px-3 text-xs">Cuối tuần</button>
              </div>
            </div>

            <div className="grid gap-2 xl:grid-cols-2">
              {votingPromotions.length === 0 ? (
                <div className="rounded-[14px] border border-dashed border-slate-200 bg-slate-50/80 px-4 py-5 text-sm font-medium text-slate-500">
                  Chưa có promotion nhân điểm nào. Chọn một mẫu tạo nhanh để bắt đầu.
                </div>
              ) : (
                votingPromotions.map((promotion) => {
                  const status = getPromotionStatus(promotion, currentTime);
                  return (
                    <div key={promotion.id} className="relative z-[110] overflow-visible rounded-[14px] border border-slate-200 bg-white/90 p-3 shadow-sm">
                      <div className="grid gap-2.5">
                        <div className="flex items-center justify-between gap-2">
                          <input value={promotion.name} onChange={(event) => updatePromotion(promotion.id, 'name', event.target.value)} className="admin-input min-w-0" />
                          <span className={`shrink-0 rounded-full border px-2 py-1 text-[11px] font-bold ${status.className}`}>{status.label}</span>
                        </div>

                        <div className="grid gap-2 sm:grid-cols-[1fr_120px]">
                          <label className="grid gap-1">
                            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">Hệ số nhân điểm</span>
                            <div className="flex gap-1.5">
                              {[2, 3, 5].map((value) => (
                                <button
                                  key={value}
                                  type="button"
                                  onClick={() => updatePromotion(promotion.id, 'multiplier', value)}
                                  className={`admin-btn !h-8 flex-1 text-xs ${promotion.multiplier === value ? 'admin-btn-primary' : 'admin-btn-secondary'}`}
                                >
                                  x{value}
                                </button>
                              ))}
                              <input type="number" min={2} max={10} value={promotion.multiplier} onChange={(event) => updatePromotion(promotion.id, 'multiplier', Number(event.target.value))} className="admin-input h-8 w-16" />
                            </div>
                          </label>
                          <div className="relative z-40 grid gap-1">
                            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">Áp dụng</span>
                            <button
                              type="button"
                              onClick={() => setOpenPromotionApplyId((current) => current === promotion.id ? null : promotion.id)}
                              className="flex h-8 w-full items-center justify-between rounded-lg border border-slate-200 bg-white px-3 text-left text-xs font-bold text-slate-700 shadow-sm transition hover:border-blue-300 hover:bg-blue-50/40 focus:outline-none focus:ring-2 focus:ring-blue-100"
                            >
                              <span className="truncate">
                                {promotion.appliesTo === 'PAID' ? 'Vote trả phí' : promotion.appliesTo === 'ALL' ? 'Tất cả vote' : 'Vote miễn phí'}
                              </span>
                              <svg viewBox="0 0 24 24" className={`h-3.5 w-3.5 shrink-0 text-slate-400 transition ${openPromotionApplyId === promotion.id ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                                <polyline points="6 9 12 15 18 9" />
                              </svg>
                            </button>
                            {openPromotionApplyId === promotion.id && (
                              <div className="absolute left-0 right-0 top-full z-[120] mt-1 overflow-hidden rounded-xl border border-slate-200 bg-white p-1 shadow-xl">
                                {[
                                  ['FREE', 'Vote miễn phí'],
                                  ['PAID', 'Vote trả phí'],
                                  ['ALL', 'Tất cả vote'],
                                ].map(([value, label]) => (
                                  <button
                                    key={value}
                                    type="button"
                                    onClick={() => {
                                      updatePromotion(promotion.id, 'appliesTo', value);
                                      setOpenPromotionApplyId(null);
                                    }}
                                    className={`flex h-8 w-full items-center rounded-lg px-2.5 text-left text-xs font-bold transition ${
                                      promotion.appliesTo === value ? 'bg-blue-600 text-white' : 'text-slate-600 hover:bg-slate-50'
                                    }`}
                                  >
                                    {label}
                                  </button>
                                ))}
                              </div>
                            )}
                          </div>
                        </div>

                        <div className="relative z-30 grid grid-cols-1 gap-2 2xl:grid-cols-2">
                          <label className="grid gap-1">
                            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">Bắt đầu</span>
                            <DateTimeInput value={promotion.startAt} onChange={(val) => updatePromotion(promotion.id, 'startAt', val)} />
                          </label>
                          <label className="grid gap-1">
                            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">Kết thúc</span>
                            <DateTimeInput value={promotion.endAt} onChange={(val) => updatePromotion(promotion.id, 'endAt', val)} />
                          </label>
                        </div>

                        <div className="flex flex-wrap items-center justify-between gap-2 border-t border-slate-100 pt-2">
                          <label className="flex items-center gap-2 text-xs font-bold text-slate-600">
                            <input type="checkbox" checked={promotion.isEnabled} onChange={(event) => updatePromotion(promotion.id, 'isEnabled', event.target.checked)} />
                            Kích hoạt
                          </label>
                          <div className="flex gap-1.5">
                            <button type="button" onClick={() => duplicatePromotion(promotion)} className="admin-btn admin-btn-secondary !h-8 px-3 text-xs">Nhân bản</button>
                            <button type="button" onClick={() => removePromotion(promotion.id)} className="admin-btn admin-btn-danger !h-8 px-3 text-xs">Xóa</button>
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>
        )}
      </section>

      <section className="dashboard-filter-bar relative z-0 p-2.5">
        <div className="flex flex-wrap items-center justify-between gap-2.5">
          {/* Left filters: Compact Search & Select Dropdowns */}
          <div className="flex flex-wrap items-center gap-2 max-w-full">
            <div className="w-full sm:w-[260px] md:w-[290px] shrink-0">
              <input
                value={search}
                onChange={(event) => setSearch(event.target.value)}
                placeholder="Tìm theo tên thí sinh, SBD, trưởng nhóm..."
                className="admin-input w-full"
              />
            </div>
            
            {/* Custom Bảng thi Dropdown */}
            <div className="relative w-[150px] shrink-0" ref={tableDropdownRef}>
              <button
                type="button"
                onClick={() => {
                  setIsTableFilterOpen(!isTableFilterOpen);
                  setIsRoundFilterOpen(false);
                  setIsViewConfigOpen(false);
                }}
                className="flex h-[38px] w-full items-center justify-between rounded-[10px] border border-slate-200 bg-[#fbfdfc] px-3 text-xs font-bold text-slate-700 shadow-sm transition hover:border-[#0f766e] focus:outline-none"
              >
                <span className="truncate">
                  {tableFilter === 'ALL' && 'Tất cả bảng thi'}
                  {tableFilter === 'HIGH_SCHOOL' && 'Bảng học sinh'}
                  {tableFilter === 'STUDENT' && 'Bảng sinh viên'}
                  {tableFilter === 'ENTERPRISE' && 'Bảng doanh nghiệp'}
                </span>
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="14"
                  height="14"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  className={`text-slate-500 transition-transform duration-200 shrink-0 ${isTableFilterOpen ? 'rotate-180' : ''}`}
                >
                  <polyline points="6 9 12 15 18 9" />
                </svg>
              </button>

              {isTableFilterOpen && (
                <div className="absolute left-0 right-0 z-[60] mt-1.5 rounded-xl border border-slate-200 bg-white/95 p-1 shadow-lg backdrop-blur-md">
                  {[
                    ['ALL', 'Tất cả bảng thi'],
                    ['HIGH_SCHOOL', 'Bảng học sinh'],
                    ['STUDENT', 'Bảng sinh viên'],
                    ['ENTERPRISE', 'Bảng doanh nghiệp'],
                  ].map(([val, label]) => (
                    <button
                      key={val}
                      type="button"
                      onClick={() => {
                        setTableFilter(val);
                        setIsTableFilterOpen(false);
                      }}
                      className={`flex w-full items-center rounded-lg px-3 py-2 text-left text-xs font-bold transition-colors ${
                        tableFilter === val
                          ? 'bg-[#0f766e]/10 text-[#0f766e]'
                          : 'text-slate-700 hover:bg-slate-50'
                      }`}
                    >
                      {label}
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Custom Vòng thi Dropdown */}
            <div className="relative w-[150px] shrink-0" ref={roundDropdownRef}>
              <button
                type="button"
                onClick={() => {
                  setIsRoundFilterOpen(!isRoundFilterOpen);
                  setIsTableFilterOpen(false);
                  setIsViewConfigOpen(false);
                }}
                className="flex h-[38px] w-full items-center justify-between rounded-[10px] border border-slate-200 bg-[#fbfdfc] px-3 text-xs font-bold text-slate-700 shadow-sm transition hover:border-[#0f766e] focus:outline-none"
              >
                <span className="truncate">
                  {roundFilter === 'ALL' ? 'Tất cả vòng thi' : roundFilter}
                </span>
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="14"
                  height="14"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  className={`text-slate-500 transition-transform duration-200 shrink-0 ${isRoundFilterOpen ? 'rotate-180' : ''}`}
                >
                  <polyline points="6 9 12 15 18 9" />
                </svg>
              </button>

              {isRoundFilterOpen && (
                <div className="absolute left-0 right-0 z-[60] mt-1.5 rounded-xl border border-slate-200 bg-white/95 p-1 shadow-lg backdrop-blur-md">
                  {[
                    'ALL',
                    'Vòng loại',
                    'Vòng bán kết',
                    'Vòng chung kết',
                  ].map((val) => (
                    <button
                      key={val}
                      type="button"
                      onClick={() => {
                        setRoundFilter(val);
                        setIsRoundFilterOpen(false);
                      }}
                      className={`flex w-full items-center rounded-lg px-3 py-2 text-left text-xs font-bold transition-colors ${
                        roundFilter === val
                          ? 'bg-[#0f766e]/10 text-[#0f766e]'
                          : 'text-slate-700 hover:bg-slate-50'
                      }`}
                    >
                      {val === 'ALL' ? 'Tất cả vòng thi' : val}
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Right: Single View Config Popover Button & Modal Dropdown */}
          <div className="relative shrink-0" ref={viewConfigRef}>
            <button
              type="button"
              onClick={() => {
                setIsViewConfigOpen(!isViewConfigOpen);
                setIsTableFilterOpen(false);
                setIsRoundFilterOpen(false);
              }}
              className="flex h-[38px] items-center gap-2 rounded-[10px] border border-slate-200 bg-white px-3.5 text-xs font-extrabold text-slate-800 shadow-sm transition hover:border-blue-600 hover:text-blue-700"
            >
              <svg viewBox="0 0 24 24" className="h-4 w-4 text-blue-600" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                <rect x="3" y="3" width="7" height="7" rx="1.5" />
                <rect x="14" y="3" width="7" height="7" rx="1.5" />
                <rect x="14" y="14" width="7" height="7" rx="1.5" />
                <rect x="3" y="14" width="7" height="7" rx="1.5" />
              </svg>
              <span>Hiển thị</span>
              <span className="rounded-full bg-blue-50 text-blue-700 px-2 py-0.5 text-[10px] font-black border border-blue-200">
                {viewMode === 'table' ? 'Bảng' : 'Thẻ'}
              </span>
              <svg viewBox="0 0 24 24" className={`h-3.5 w-3.5 text-slate-400 transition-transform duration-200 ${isViewConfigOpen ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" strokeWidth="2.5"><polyline points="6 9 12 15 18 9"/></svg>
            </button>

            {isViewConfigOpen && (
              <div className="absolute right-0 z-[70] mt-2 w-72 rounded-2xl border border-slate-200 bg-white p-4 shadow-xl space-y-4 animate-in fade-in zoom-in-95 duration-150">
                {/* 1. Chọn Dạng hiển thị */}
                <div>
                  <p className="text-[11px] font-black uppercase tracking-wider text-slate-400 mb-2">Dạng hiển thị</p>
                  <div className="grid grid-cols-2 gap-2">
                    <button
                      type="button"
                      onClick={() => setViewMode('table')}
                      className={`flex items-center justify-center gap-1.5 p-2 rounded-xl text-xs font-bold border transition ${
                        viewMode === 'table' ? 'bg-blue-50 border-blue-300 text-blue-700 font-extrabold shadow-sm' : 'bg-slate-50 border-slate-200 text-slate-600 hover:bg-slate-100'
                      }`}
                    >
                      Bảng
                    </button>
                    <button
                      type="button"
                      onClick={() => setViewMode('grid')}
                      className={`flex items-center justify-center gap-1.5 p-2 rounded-xl text-xs font-bold border transition ${
                        viewMode === 'grid' ? 'bg-blue-50 border-blue-300 text-blue-700 font-extrabold shadow-sm' : 'bg-slate-50 border-slate-200 text-slate-600 hover:bg-slate-100'
                      }`}
                    >
                      Thẻ
                    </button>
                  </div>
                </div>

                      The
                {viewMode === 'grid' && (
                  <div>
                    <p className="text-[11px] font-black uppercase tracking-wider text-slate-400 mb-2">Số ô vuông 1 hàng</p>
                    <div className="grid grid-cols-4 gap-1.5">
                      {[2, 3, 4, 6].map((num) => (
                        <button
                          key={num}
                          type="button"
                          onClick={() => setGridCols(num)}
                          className={`py-1.5 rounded-lg text-xs font-bold border text-center transition ${
                            gridCols === num ? 'bg-blue-600 text-white border-blue-600 shadow-sm' : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
                          }`}
                        >
                          {num} ô
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                {/* 3. Ẩn / Hiện cột nếu dạng Bảng */}
                {viewMode === 'table' && (
                  <div>
                    <p className="text-[11px] font-black uppercase tracking-wider text-slate-400 mb-2">⚙️ Ẩn / Hiện cột hiển thị</p>
                    <div className="space-y-2">
                      <label className="flex items-center gap-2 text-xs font-semibold text-slate-700 cursor-pointer">
                        <input type="checkbox" checked={visibleColumns.project} onChange={(e) => setVisibleColumns({ ...visibleColumns, project: e.target.checked })} className="rounded text-blue-600" />
                        Cột Thí sinh
                      </label>
                      <label className="flex items-center gap-2 text-xs font-semibold text-slate-700 cursor-pointer">
                        <input type="checkbox" checked={visibleColumns.table} onChange={(e) => setVisibleColumns({ ...visibleColumns, table: e.target.checked })} className="rounded text-blue-600" />
                        Cột Bảng thi
                      </label>
                      <label className="flex items-center gap-2 text-xs font-semibold text-slate-700 cursor-pointer">
                        <input type="checkbox" checked={visibleColumns.leader} onChange={(e) => setVisibleColumns({ ...visibleColumns, leader: e.target.checked })} className="rounded text-blue-600" />
                        Cột Đại diện / Trưởng nhóm
                      </label>
                      <label className="flex items-center gap-2 text-xs font-semibold text-slate-700 cursor-pointer">
                        <input type="checkbox" checked={visibleColumns.votes} onChange={(e) => setVisibleColumns({ ...visibleColumns, votes: e.target.checked })} className="rounded text-blue-600" />
                        Cột Điểm bình chọn
                      </label>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </section>

      {/* RENDER VIEW (TABLE OR GRID) */}
      {viewMode === 'grid' ? (
        <div className={`grid gap-4 ${
          gridCols === 2 ? 'grid-cols-1 sm:grid-cols-2' :
          gridCols === 3 ? 'grid-cols-1 sm:grid-cols-2 md:grid-cols-3' :
          gridCols === 6 ? 'grid-cols-2 sm:grid-cols-3 md:grid-cols-6' :
          'grid-cols-1 sm:grid-cols-2 md:grid-cols-4'
        }`}>
          {filteredCandidates.map((p) => (
            <div key={p.id} className="bg-white border border-slate-200 rounded-2xl p-4 shadow-sm hover:shadow-md transition flex flex-col justify-between space-y-3 group">
              <div className="flex items-center justify-between">
                <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-blue-50 text-blue-700 border border-blue-200">
                  {p.sbd}
                </span>
                <span className="text-xs font-black text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full">
                  🗳️ {p.votes} vote
                </span>
              </div>
              <div className="flex flex-col items-center text-center space-y-2 py-2">
                <div className="w-20 h-20 rounded-full border border-slate-200 bg-slate-50 overflow-hidden shadow-inner">
                  <img src={formatAssetUrl(p.imageUrl)} className="h-full w-full object-cover cursor-pointer" alt={p.name} />
                </div>
                <h3 className="font-extrabold text-slate-900 text-xs leading-snug line-clamp-2">{p.name}</h3>
                <p className="text-[11px] font-semibold text-slate-500">{p.teamName || p.representativeSchool || 'HUIT ICONIC'}</p>
              </div>
              <div className="pt-2 border-t border-slate-100 flex items-center justify-between">
                <button onClick={() => openEditModal(p)} className="text-xs font-bold text-blue-600 hover:underline">Sửa</button>
                <button onClick={() => handleDelete(p.id)} className="text-xs font-bold text-rose-600 hover:underline">Xóa</button>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <section className="admin-card overflow-hidden p-0">
          {selectedIds.length > 0 && (
            <div className="flex items-center justify-between border-b border-rose-100 bg-rose-50/60 px-5 py-3 backdrop-blur-sm transition-all duration-300">
              <span className="text-xs font-bold text-rose-700">
                Đã chọn <b className="text-[14px]">{selectedIds.length}</b> thí sinh
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
          <div className="w-full overflow-x-auto">
          <table className="dashboard-table min-w-[860px] text-left">
            <thead>
              <tr className="text-[10px] font-black uppercase tracking-[0.14em] text-slate-500">
                <th className="px-4 py-3 w-10">
                  <input
                    type="checkbox"
                    checked={filteredCandidates.length > 0 && selectedIds.length === filteredCandidates.length}
                    onChange={(e) => {
                      if (e.target.checked) {
                        setSelectedIds(filteredCandidates.map((p) => p.id));
                      } else {
                        setSelectedIds([]);
                      }
                    }}
                    className="rounded border-slate-300 text-teal-600 focus:ring-teal-500 cursor-pointer"
                  />
                </th>
                <th className="px-4 py-3">Thí sinh</th>
                <th className="px-4 py-3">Bảng thi</th>
                <th className="px-4 py-3">Đại diện</th>
                <th className="px-4 py-3 text-right">Điểm bình chọn</th>
                <th className="px-4 py-3 text-right">Thao tác</th>
              </tr>
            </thead>
            <tbody className="text-sm">
              {filteredCandidates.map((project) => {
                const projectTableLabel = project.contestTableLabel || tableLabels[project.contestTable || ''] || 'Chưa phân bảng';
 
                return (
                  <tr key={project.id} className="align-middle transition hover:bg-slate-50/80">
                    <td className="px-4 py-3 w-10">
                      <input
                        type="checkbox"
                        checked={selectedIds.includes(project.id)}
                        onChange={(e) => {
                          if (e.target.checked) {
                            setSelectedIds((prev) => [...prev, project.id]);
                          } else {
                            setSelectedIds((prev) => prev.filter((id) => id !== project.id));
                          }
                        }}
                        className="rounded border-slate-300 text-teal-600 focus:ring-teal-500 cursor-pointer"
                      />
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex min-w-[220px] items-center gap-3">
                        <img src={formatAssetUrl(project.imageUrl)} alt={project.name} className="h-11 w-11 shrink-0 rounded-[14px] border border-slate-200 object-cover shadow-sm" />
                        <div className="min-w-0">
                          <p className="truncate text-[14px] font-extrabold tracking-[-0.02em] text-slate-950">{project.name}</p>
                          <div className="mt-1 flex flex-wrap items-center gap-1.5">
                            <span className="rounded-md bg-slate-100 px-2 py-1 text-[10px] font-bold text-slate-600">
                              {project.sbd}
                            </span>
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <span className="inline-flex rounded-md border border-emerald-200/80 bg-emerald-50 px-2.5 py-1 text-[11px] font-bold text-emerald-700">
                        {projectTableLabel}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <div className="max-w-[180px]">
                        <p className="truncate text-[13px] font-bold text-slate-900">{project.leaderName || 'Chưa có đại diện'}</p>
                        <p className="mt-0.5 truncate text-[12px] text-slate-500 font-medium">{project.representativeSchool || 'Chưa cập nhật đơn vị'}</p>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-right">
                      <p className="text-[20px] font-bold tracking-[-0.02em] tabular-nums text-slate-800">{project.votes.toLocaleString()}</p>
                      <p className="mt-0.5 text-[10px] font-semibold uppercase tracking-[0.12em] text-slate-400">điểm</p>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex justify-end gap-1.5">
                        <ActionButton href={`/candidates/${project.sbd}`} title="Xem chi tiết" tone="view">
                          <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <path d="M2 12s3.5-7 10-7 10 7 10 7-3.5 7-10 7-10-7-10-7Z" />
                            <circle cx="12" cy="12" r="3" />
                          </svg>
                        </ActionButton>
                        <ActionButton onClick={() => openEditModal(project)} title="Chỉnh sửa" tone="edit">
                          <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <path d="M12 20h9" />
                            <path d="M16.5 3.5a2.1 2.1 0 0 1 3 3L7 19l-4 1 1-4Z" />
                          </svg>
                        </ActionButton>
                        <ActionButton onClick={() => handleDelete(project.id)} title="Xóa hồ sơ" tone="delete">
                          <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <path d="M3 6h18" />
                            <path d="M8 6V4h8v2" />
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
                  <td colSpan={6} className="px-5 py-12 text-center text-sm font-semibold text-slate-500">
                    Không có thí sinh phù hợp bộ lọc hiện tại.
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
          title={modalMode === 'add' ? 'Thêm thí sinh dự thi' : 'Cập nhật hồ sơ thí sinh'}
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
