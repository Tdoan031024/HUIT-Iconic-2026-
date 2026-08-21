'use client';

import { useEffect, useMemo, useState, useRef } from 'react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import { Candidate } from '@/lib/types';
import { apiUrl, formatAssetUrl } from '../../../api';

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000';

const tableLabels: Record<string, string> = {
  HIGH_SCHOOL: 'Bảng học sinh',
  STUDENT: 'Bảng sinh viên',
  ENTERPRISE: 'Bảng doanh nghiệp',
};

function displayValue(value?: string | number | boolean | null) {
  if (typeof value === 'boolean') return value ? 'Có' : 'Không';
  return value || 'Chưa cập nhật';
}

function Badge({
  children,
  tone = 'slate',
}: {
  children: React.ReactNode;
  tone?: 'green' | 'blue' | 'orange' | 'red' | 'slate';
}) {
  const classes = {
    green: 'border-emerald-200 bg-emerald-50 text-emerald-700',
    blue: 'border-sky-200 bg-sky-50 text-sky-700',
    orange: 'border-orange-200 bg-orange-50 text-orange-700',
    red: 'border-red-200 bg-red-50 text-red-700',
    slate: 'border-slate-200 bg-slate-50 text-slate-600',
  };

  return (
    <span className={`inline-flex items-center rounded-full border px-3 py-1 text-xs font-black ${classes[tone]}`}>
      {children}
    </span>
  );
}

function InfoItem({ label, value }: { label: string; value?: string | number | boolean | null }) {
  return (
    <div className="rounded-xl border border-slate-200 bg-slate-50 p-4">
      <p className="text-[10px] font-black uppercase tracking-[0.14em] text-slate-400">{label}</p>
      <p className="mt-2 whitespace-pre-line text-sm font-bold leading-6 text-slate-800">{displayValue(value)}</p>
    </div>
  );
}

function SectionCard({
  title,
  description,
  children,
}: {
  title: string;
  description?: string;
  children: React.ReactNode;
}) {
  return (
    <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
      <div className="border-b border-slate-100 pb-4">
        <h2 className="text-lg font-black text-slate-950">{title}</h2>
        {description ? <p className="mt-1 text-xs font-semibold text-slate-500">{description}</p> : null}
      </div>
      <div className="mt-4">{children}</div>
    </section>
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

function ProjectModal({
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
            <p className="text-[10px] font-black uppercase tracking-[0.18em] text-emerald-700">Hồ sơ dự án dự thi</p>
            <h3 className="mt-1 text-xl font-black text-slate-900">{title}</h3>
          </div>
          <button type="button" onClick={onClose} className="rounded-lg border border-slate-200 px-3 py-2 text-xs font-bold text-slate-600 hover:border-emerald-600 hover:text-emerald-700">
            Đóng
          </button>
        </div>

        <div className="mt-5 grid grid-cols-1 gap-4 md:grid-cols-3">
          <label className="space-y-1.5 md:col-span-2">
            <span className={labelText}>Tên dự án <span className="text-red-500 font-bold">*</span></span>
            <input className={inputClass} value={form.name || ''} onChange={(event) => update('name', event.target.value)} required />
          </label>
          <label className="space-y-1.5">
            <span className={labelText}>Mã dự án / SBD <span className="text-red-500 font-bold">*</span></span>
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
          <div className="space-y-1.5">
            <span className={labelText}>Đường dẫn ảnh</span>
            <div className="flex gap-2">
              <input className={inputClass} value={form.imageUrl || ''} onChange={(event) => update('imageUrl', event.target.value)} />
              <button
                type="button"
                onClick={() => {
                  setUploadingIndex('main');
                  modalFileRef.current?.click();
                }}
                className="h-10 shrink-0 rounded-lg border border-slate-200 bg-slate-50 px-3 text-xs font-bold text-slate-700 hover:border-emerald-500 hover:text-emerald-700 transition"
              >
                Tải lên
              </button>
            </div>
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
                <span className={labelText}>Hình ảnh trưng bày dự án</span>
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
                          <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Chức vụ trong dự án</span>
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

export default function CandidateDetailAdminPage() {
  const params = useParams();
  const sbd = params.sbd as string;
  const [project, setProject] = useState<Candidate | null>(null);
  const [projects, setProjects] = useState<Candidate[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [activeImage, setActiveImage] = useState<string>('');

  const [modalMode, setModalMode] = useState<'edit' | null>(null);
  const [form, setForm] = useState<Partial<Candidate>>({});
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleUploadAndAddImage = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file || !project) return;

    const formData = new FormData();
    formData.append('file', file);

    const uploadRes = await fetch(apiUrl(`/api/admin/candidates/${project.sbd}/upload`), {
      method: 'POST',
      body: formData,
    });

    if (!uploadRes.ok) {
      alert('Không thể tải ảnh lên. Vui lòng kiểm tra backend.');
      return;
    }

    const { url } = await uploadRes.json();
    
    const currentUrls = project.showcaseImages ? project.showcaseImages.split(',').map(u => u.trim()).filter(Boolean) : [];
    if (currentUrls.length >= 5) {
      alert('Dự án đã đạt giới hạn tối đa 5 ảnh trưng bày.');
      return;
    }
    const updatedUrls = [...currentUrls, url];
    const newShowcaseImages = updatedUrls.join(',');

    const res = await fetch(apiUrl(`/api/admin/candidates/${project.id}`), {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ showcaseImages: newShowcaseImages }),
    });

    if (res.ok) {
      const saved = await res.json();
      setProject(saved);
      setActiveImage(url);
      alert('Tải ảnh trưng bày mới thành công!');
    } else {
      alert('Không thể cập nhật hồ sơ dự án.');
    }
    
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const handleSetAsMainImage = async (targetUrl: string) => {
    if (!project) return;
    const currentMain = project.imageUrl;
    if (currentMain === targetUrl) return;

    const currentUrls = project.showcaseImages ? project.showcaseImages.split(',').map(u => u.trim()).filter(Boolean) : [];
    const targetIdx = currentUrls.indexOf(targetUrl);

    let newShowcaseImages = '';
    if (targetIdx >= 0) {
      const updatedUrls = [...currentUrls];
      if (currentMain && currentMain !== '/duan/anhmauduan.png') {
        updatedUrls[targetIdx] = currentMain;
      } else {
        updatedUrls.splice(targetIdx, 1);
      }
      newShowcaseImages = updatedUrls.join(',');
    } else {
      newShowcaseImages = project.showcaseImages || '';
    }

    const res = await fetch(apiUrl(`/api/admin/candidates/${project.id}`), {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        imageUrl: targetUrl,
        showcaseImages: newShowcaseImages,
      }),
    });

    if (res.ok) {
      const saved = await res.json();
      setProject(saved);
      setActiveImage(targetUrl);
      alert('Đã thiết lập ảnh được chọn làm ảnh chính!');
    } else {
      alert('Không thể thiết lập làm ảnh chính.');
    }
  };

  const handleDeleteImage = async (targetUrl: string) => {
    if (!project) return;
    
    if (project.imageUrl === targetUrl) {
      const currentUrls = project.showcaseImages ? project.showcaseImages.split(',').map(u => u.trim()).filter(Boolean) : [];
      let newMain = '/duan/anhmauduan.png';
      let newShowcaseImages = '';
      
      if (currentUrls.length > 0) {
        newMain = currentUrls[0];
        newShowcaseImages = currentUrls.slice(1).join(',');
      }
      
      if (!confirm('Xóa ảnh này là ảnh chính hiện tại của dự án?')) return;
      
      const res = await fetch(apiUrl(`/api/admin/candidates/${project.id}`), {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          imageUrl: newMain,
          showcaseImages: newShowcaseImages,
        }),
      });
      
      if (res.ok) {
        const saved = await res.json();
        setProject(saved);
        setActiveImage(newMain);
        alert('Đã xóa ảnh chính!');
      } else {
        alert('Không thể xóa ảnh.');
      }
      return;
    }

    const currentUrls = project.showcaseImages ? project.showcaseImages.split(',').map(u => u.trim()).filter(Boolean) : [];
    const targetIdx = currentUrls.indexOf(targetUrl);
    if (targetIdx >= 0) {
      if (!confirm('Xóa ảnh trưng bày này khỏi dự án?')) return;
      const updatedUrls = currentUrls.filter(u => u !== targetUrl);
      const newShowcaseImages = updatedUrls.join(',');
      
      const res = await fetch(apiUrl(`/api/admin/candidates/${project.id}`), {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ showcaseImages: newShowcaseImages }),
      });
      
      if (res.ok) {
        const saved = await res.json();
        setProject(saved);
        if (activeImage === targetUrl) {
          setActiveImage(saved.imageUrl || '');
        }
        alert('Đã xóa ảnh trưng bày!');
      } else {
        alert('Không thể xóa ảnh.');
      }
    }
  };

  useEffect(() => {
    async function loadProject() {
      setIsLoading(true);
      const [detailRes, listRes] = await Promise.all([
        fetch(apiUrl(`/api/candidates/${sbd}`)),
        fetch(apiUrl('/api/candidates')),
      ]);
      if (detailRes.ok) {
        const data = await detailRes.json();
        setProject(data);
        if (data) {
          setActiveImage(data.imageUrl || '');
        }
      }
      if (listRes.ok) setProjects(await listRes.json());
      setIsLoading(false);
    }

    loadProject().catch(() => setIsLoading(false));
  }, [sbd]);

  const rank = useMemo(() => {
    const sorted = [...projects].sort((a, b) => b.votes - a.votes);
    const index = sorted.findIndex((item) => item.sbd === sbd);
    return index >= 0 ? index + 1 : null;
  }, [projects, sbd]);

  const showcaseUrls = useMemo(() => {
    if (!project || !project.showcaseImages) return [];
    return project.showcaseImages.split(',').map(url => url.trim()).filter(Boolean);
  }, [project?.showcaseImages]);

  const allImages = useMemo(() => {
    if (!project) return [];
    const list: string[] = [];
    if (project.imageUrl) list.push(project.imageUrl);
    showcaseUrls.forEach(url => {
      if (url && !list.includes(url)) {
        list.push(url);
      }
    });
    return list;
  }, [project?.imageUrl, showcaseUrls]);

  const openEditModal = () => {
    if (project) {
      setForm({ ...project });
      setModalMode('edit');
    }
  };

  const handleEditSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!project) return;
    const res = await fetch(apiUrl(`/api/admin/candidates/${project.id}`), {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(form),
    });

    if (!res.ok) {
      alert('Không thể lưu hồ sơ dự án. Vui lòng kiểm tra backend.');
      return;
    }

    const saved = await res.json();
    setProject(saved);
    setActiveImage(saved.imageUrl || '');
    alert('Cập nhật hồ sơ dự án thành công!');
    setModalMode(null);
  };

  const handleQuickAddImage = async () => {
    if (!project) return;
    const currentUrls = project.showcaseImages ? project.showcaseImages.split(',').map(url => url.trim()).filter(Boolean) : [];
    if (currentUrls.length >= 5) {
      alert('Dự án đã đạt giới hạn tối đa 5 ảnh trưng bày.');
      return;
    }
    const sbd = project.sbd?.trim() || 'TEMP';
    const nextIndex = currentUrls.length + 1;
    const newUrl = `/duan/${sbd}/${nextIndex}.jpg`;
    const updatedUrls = [...currentUrls, newUrl];
    const newShowcaseImages = updatedUrls.join(',');

    const res = await fetch(apiUrl(`/api/admin/candidates/${project.id}`), {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ showcaseImages: newShowcaseImages }),
    });

    if (!res.ok) {
      alert('Không thể thêm ảnh trưng bày nhanh. Vui lòng kiểm tra backend.');
      return;
    }

    const saved = await res.json();
    setProject(saved);
    setActiveImage(newUrl);
    alert(`Đã thêm nhanh đường dẫn ảnh trưng bày: ${newUrl}`);
  };

  const handleDelete = async () => {
    if (!project) return;
    if (!confirm('Xóa hồ sơ dự án này khỏi hệ thống?')) return;
    const res = await fetch(apiUrl(`/api/admin/candidates/${project.id}`), { method: 'DELETE' });
    if (res.ok) {
      window.location.href = '/candidates';
    } else {
      alert('Không thể xóa hồ sơ dự án.');
    }
  };

  if (isLoading) {
    return (
      <div className="rounded-2xl border border-slate-200 bg-white p-10 text-center text-sm font-semibold text-slate-500 shadow-sm">
        Đang tải hồ sơ dự án...
      </div>
    );
  }

  if (!project) {
    return (
      <div className="rounded-2xl border border-slate-200 bg-white p-10 text-center shadow-sm">
        <h2 className="text-xl font-black text-slate-900">Không tìm thấy dự án</h2>
        <Link href="/candidates" className="mt-4 inline-flex rounded-xl bg-slate-900 px-4 py-2 text-xs font-black text-white">
          Quay lại danh sách
        </Link>
      </div>
    );
  }

  const tableLabel = project.contestTableLabel || tableLabels[project.contestTable || ''] || 'Chưa phân bảng';
  const hasMissingInfo = !project.teamName || !project.leaderName || !project.contestTable;

  return (
    <div className="space-y-5">
      <section className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
        <div className="border-b border-slate-100 px-5 py-4">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <Link href="/candidates" className="inline-flex items-center gap-2 text-xs font-black text-slate-500 transition hover:text-emerald-700">
              <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="m15 18-6-6 6-6" />
              </svg>
              Quay lại danh sách
            </Link>
            <div className="flex flex-wrap gap-2">
              <a href={`${SITE_URL}/thi-sinh/${project.sbd}`} target="_blank" rel="noopener noreferrer" className="rounded-xl border border-slate-200 bg-white px-4 py-2 text-xs font-black text-slate-700 transition hover:border-emerald-600 hover:text-emerald-700">
                Xem ngoài website
              </a>
            </div>
          </div>
        </div>

        <div className="grid gap-0 xl:grid-cols-[420px_1fr]">
          <div className="bg-slate-50/60 p-5 flex flex-col gap-4 items-center justify-center border-b xl:border-b-0 xl:border-r border-slate-100">
            <div className="overflow-hidden rounded-2xl border border-slate-200/80 bg-white w-full shadow-sm">
              <img src={formatAssetUrl(activeImage || project.imageUrl)} alt={project.name} className="aspect-[4/3] w-full object-cover transition duration-300" />
            </div>
            
            {/* Gallery thumbnails */}
            {allImages.length > 1 && (
              <div className="flex flex-wrap gap-2 justify-center w-full">
                {allImages.map((imgUrl, index) => {
                  const isActive = (activeImage || project.imageUrl) === imgUrl;
                  return (
                    <button
                      key={index}
                      onClick={() => setActiveImage(imgUrl)}
                      className={`h-12 w-16 rounded-lg overflow-hidden border-2 bg-white transition duration-150 active:scale-95 shrink-0 ${
                        isActive ? 'border-emerald-600 shadow-md scale-105' : 'border-slate-200 hover:border-slate-300 opacity-80 hover:opacity-100'
                      }`}
                    >
                      <img src={formatAssetUrl(imgUrl)} alt={`${project.name} ${index + 1}`} className="h-full w-full object-cover" />
                    </button>
                  );
                })}
              </div>
            )}

          </div>

          <div className="p-6">
            <div className="flex flex-col gap-5 lg:flex-row lg:items-start lg:justify-between">
              <div className="min-w-0">
                <p className="text-[11px] font-black uppercase tracking-[0.18em] text-emerald-700">Hồ sơ dự án dự thi</p>
                <h1 className="mt-2 text-3xl font-black leading-tight text-slate-950">{project.name}</h1>
                <p className="mt-3 max-w-3xl text-sm leading-6 text-slate-600">{project.description || 'Chưa cập nhật mô tả ngắn.'}</p>
                <div className="mt-5 flex flex-wrap gap-2">
                  <Badge>Mã {project.sbd}</Badge>
                  <Badge tone="blue">{tableLabel}</Badge>
                  <Badge tone={roundTone(project.currentRound)}>{project.currentRound || 'Vòng loại'}</Badge>
                  {hasMissingInfo ? <Badge tone="red">Thiếu thông tin</Badge> : <Badge tone="green">Đủ hồ sơ</Badge>}
                </div>
              </div>

              <div className="grid min-w-[260px] grid-cols-2 gap-3">
                <div className="rounded-2xl border border-orange-100 bg-orange-50 p-5 text-center">
                  <p className="text-[10px] font-black uppercase tracking-[0.14em] text-orange-500">Điểm bình chọn</p>
                  <p className="mt-2 text-3xl font-black tabular-nums text-[#e45136]">{project.votes.toLocaleString()}</p>
                </div>
                <div className="rounded-2xl border border-slate-200 bg-slate-50 p-5 text-center">
                  <p className="text-[10px] font-black uppercase tracking-[0.14em] text-slate-400">Thứ hạng</p>
                  <p className="mt-2 text-3xl font-black text-slate-950">{rank ? `#${rank}` : '-'}</p>
                </div>
              </div>
            </div>

            <div className="mt-6 grid gap-3 md:grid-cols-4">
              <InfoItem label="Nhóm dự thi" value={project.teamName} />
              <InfoItem label="Trưởng nhóm" value={project.leaderName} />
              <InfoItem label="Lĩnh vực" value={project.sector} />
              <InfoItem label="Trạng thái" value={project.status} />
            </div>
          </div>
        </div>
      </section>

      <section className="grid gap-5 xl:grid-cols-[1fr_380px]">
        <div className="space-y-5">
          <SectionCard title="Thông tin nhóm dự thi" description="Thông tin định danh, liên hệ và thành viên đại diện hồ sơ.">
            <div className="grid gap-3 md:grid-cols-2">
              <InfoItem label="Tên nhóm" value={project.teamName} />
              <InfoItem label="Đơn vị / trường" value={project.representativeSchool} />
              <InfoItem label="Trưởng nhóm" value={project.leaderName} />
              <InfoItem label="Số điện thoại" value={project.leaderPhone} />
              <InfoItem label="Email" value={project.leaderEmail} />
              <InfoItem label="Cố vấn" value={project.advisorName} />
              <InfoItem label="Thành viên" value={project.members} />
              <InfoItem label="Cam kết sở hữu trí tuệ" value={project.intellectualPropertyCommitment} />
            </div>
          </SectionCard>

          <SectionCard title="Thuyết minh dự án" description="Nội dung mô tả chi tiết, định hướng giải pháp và giá trị đề xuất.">
            <div className="rounded-2xl border border-slate-200 bg-slate-50 p-5">
              <p className="whitespace-pre-line text-sm leading-7 text-slate-700">
                {project.biography || project.description || 'Chưa cập nhật nội dung thuyết minh.'}
              </p>
            </div>
          </SectionCard>

          <SectionCard title="Nhu cầu & kỳ vọng" description="Nhu cầu hỗ trợ của dự án và các kỳ vọng sau cuộc thi.">
            <div className="grid gap-3 md:grid-cols-2">
              <InfoItem label="Nhu cầu hỗ trợ" value={project.supportNeeds} />
              <InfoItem label="Kỳ vọng sau cuộc thi" value={project.expectations} />
            </div>
          </SectionCard>

          <SectionCard title="Quản lý hình ảnh trưng bày" description="Quản lý ảnh chính và tối đa 5 ảnh trưng bày. Bạn có thể tải ảnh lên từ máy tính, đặt làm ảnh chính hoặc xóa ảnh.">
            <input
              type="file"
              ref={fileInputRef}
              onChange={handleUploadAndAddImage}
              accept="image/*"
              className="hidden"
            />
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-4">
              {/* Ảnh chính */}
              <div className="relative rounded-xl border border-emerald-200 bg-emerald-50/20 p-2 shadow-sm flex flex-col justify-between group">
                <div className="overflow-hidden rounded-lg border border-slate-200 aspect-[4/3] bg-white">
                  <img src={formatAssetUrl(project.imageUrl)} alt="Ảnh chính" className="h-full w-full object-cover" />
                </div>
                <div className="mt-2 text-center">
                  <span className="inline-flex items-center gap-1 rounded bg-emerald-50 px-2 py-0.5 text-[10px] font-black text-emerald-700 uppercase tracking-wider">
                    Ảnh chính
                  </span>
                </div>
                {project.imageUrl && project.imageUrl !== '/duan/anhmauduan.png' && (
                  <button
                    type="button"
                    onClick={() => handleDeleteImage(project.imageUrl)}
                    className="absolute -top-1.5 -right-1.5 h-6 w-6 rounded-full border border-red-200 bg-red-50 text-red-600 shadow flex items-center justify-center hover:bg-red-100 transition duration-150"
                    title="Xóa ảnh chính"
                  >
                    <svg viewBox="0 0 24 24" className="h-3.5 w-3.5" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M18 6 6 18" />
                      <path d="m6 6 12 12" />
                    </svg>
                  </button>
                )}
              </div>

              {/* Các ảnh trưng bày */}
              {showcaseUrls.map((url, idx) => (
                <div key={idx} className="relative rounded-xl border border-slate-200 bg-slate-50/50 p-2 shadow-sm flex flex-col justify-between group hover:border-slate-300 transition">
                  <div className="overflow-hidden rounded-lg border border-slate-200 aspect-[4/3] bg-white">
                    <img src={formatAssetUrl(url)} alt={`Trưng bày ${idx + 1}`} className="h-full w-full object-cover" />
                  </div>
                  <div className="mt-2 text-center">
                    <button
                      type="button"
                      onClick={() => handleSetAsMainImage(url)}
                      className="w-full text-center rounded border border-slate-200 bg-white hover:border-emerald-500 hover:text-emerald-700 px-2 py-0.5 text-[9px] font-bold text-slate-500 transition"
                    >
                      Làm ảnh chính
                    </button>
                  </div>
                  <button
                    type="button"
                    onClick={() => handleDeleteImage(url)}
                    className="absolute -top-1.5 -right-1.5 h-6 w-6 rounded-full border border-red-200 bg-red-50 text-red-600 shadow flex items-center justify-center hover:bg-red-100 transition duration-150"
                    title="Xóa ảnh trưng bày"
                  >
                    <svg viewBox="0 0 24 24" className="h-3.5 w-3.5" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M18 6 6 18" />
                      <path d="m6 6 12 12" />
                    </svg>
                  </button>
                </div>
              ))}

              {/* Ô Tải ảnh mới */}
              {showcaseUrls.length < 5 && (
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="rounded-xl border-2 border-dashed border-slate-300 hover:border-emerald-500 bg-slate-50/50 hover:bg-emerald-50/10 transition aspect-[4/3] flex flex-col items-center justify-center p-3 text-center shadow-inner group"
                >
                  <svg viewBox="0 0 24 24" className="h-6 w-6 text-slate-400 group-hover:text-emerald-600 mb-1" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                    <polyline points="17 8 12 3 7 8" />
                    <line x1="12" y1="3" x2="12" y2="15" />
                  </svg>
                  <span className="text-[10px] font-black text-slate-500 uppercase tracking-wider block">Tải ảnh lên</span>
                  <span className="text-[8px] font-bold text-slate-400 italic block mt-0.5">({showcaseUrls.length}/5)</span>
                </button>
              )}
            </div>
          </SectionCard>
        </div>

        <aside className="space-y-5">
          <SectionCard title="Phân loại & tiến độ">
            <div className="space-y-3">
              <InfoItem label="Bảng thi" value={tableLabel} />
              <InfoItem label="Lĩnh vực" value={project.sector} />
              <InfoItem label="Vòng hiện tại" value={project.currentRound} />
              <InfoItem label="Trạng thái hồ sơ" value={project.status} />
              <InfoItem label="Địa điểm triển khai" value={project.implementationLocation} />
            </div>
          </SectionCard>

          <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
            <h2 className="text-base font-black text-slate-950">Thao tác nhanh</h2>
            <div className="mt-4 grid gap-2">
              <button
                onClick={openEditModal}
                className="rounded-xl bg-emerald-600 px-4 py-3 text-center text-xs font-black text-white shadow-sm transition hover:bg-emerald-700 active:scale-98"
              >
                Chỉnh sửa dự án
              </button>
              <button
                onClick={handleDelete}
                className="rounded-xl border border-red-200 bg-red-50 text-red-600 px-4 py-3 text-center text-xs font-black transition hover:border-red-300 hover:bg-red-100 active:scale-98"
              >
                Xóa dự án
              </button>
              <Link href="/candidates" className="rounded-xl border border-slate-200 bg-white px-4 py-3 text-center text-xs font-black text-slate-700 transition hover:border-emerald-600 hover:text-emerald-700">
                Quay lại danh sách
              </Link>
              <a href={`${SITE_URL}/thi-sinh/${project.sbd}`} target="_blank" rel="noopener noreferrer" className="rounded-xl bg-slate-900 px-4 py-3 text-center text-xs font-black text-white shadow-sm transition hover:bg-emerald-700">
                Xem trang công khai
              </a>
            </div>
          </div>
        </aside>
      </section>

      {modalMode && (
        <ProjectModal
          title="Cập nhật hồ sơ dự án"
          form={form}
          setForm={setForm}
          onClose={() => setModalMode(null)}
          onSubmit={handleEditSubmit}
        />
      )}
    </div>
  );
}
