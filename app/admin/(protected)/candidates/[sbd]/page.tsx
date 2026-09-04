'use client';

import { useEffect, useMemo, useState, useRef } from 'react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import { Candidate } from '@/lib/types';
import { apiUrl, formatAssetUrl } from '../../../api';
import { useAlert } from '../../../AlertProvider';
import ImageDropzone from '../../../components/ImageDropzone';

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000';

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

function displayValue(value?: string | number | boolean | null) {
  if (typeof value === 'boolean') return value ? 'Có' : 'Không';
  return value || 'Chưa cập nhật';
}

function Badge({
  children,
  tone = 'slate',
}: {
  children: React.ReactNode;
  tone?: 'pink' | 'blue' | 'green' | 'orange' | 'red' | 'slate';
}) {
  const classes = {
    pink: 'border-pink-200 bg-pink-50 text-pink-700',
    blue: 'border-sky-200 bg-sky-50 text-sky-700',
    green: 'border-emerald-200 bg-emerald-50 text-emerald-700',
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
    <div className="rounded-xl border border-slate-200 bg-slate-50/70 p-4">
      <p className="text-[10px] font-black uppercase tracking-[0.14em] text-slate-400">{label}</p>
      <p className="mt-1.5 whitespace-pre-line text-sm font-bold leading-6 text-slate-800">{displayValue(value)}</p>
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
      <div className="border-b border-slate-100 pb-3">
        <h2 className="text-base font-black text-slate-900">{title}</h2>
        {description ? <p className="mt-0.5 text-xs font-semibold text-slate-500">{description}</p> : null}
      </div>
      <div className="mt-4">{children}</div>
    </section>
  );
}

function CandidateEditModal({
  candidate,
  onClose,
  onSaved,
}: {
  candidate: Candidate;
  onClose: () => void;
  onSaved: (updated: Candidate) => void;
}) {
  const [form, setForm] = useState<Partial<Candidate>>({ ...candidate });
  const [uploadingIndex, setUploadingIndex] = useState<number | 'main' | null>(null);
  const modalFileRef = useRef<HTMLInputElement>(null);

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

  const handleModalFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || uploadingIndex === null) return;
    const sbd = form.sbd?.trim() || candidate.sbd;
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
          const list = (form.showcaseImages || '').split(',').map(s => s.trim()).filter(Boolean);
          list[indexToUpdate] = url;
          update('showcaseImages', list.join(','));
        }
        alert('Tải ảnh thành công!');
      } else {
        alert('Tải ảnh thất bại.');
      }
    } catch {
      alert('Lỗi kết nối khi tải ảnh.');
    } finally {
      setUploadingIndex(null);
      if (modalFileRef.current) modalFileRef.current.value = '';
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await fetch(apiUrl(`/api/admin/candidates/${candidate.id}`), {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      });
      if (!res.ok) throw new Error('Không thể lưu hồ sơ thí sinh');
      const updated = await res.json();
      onSaved(updated);
      onClose();
    } catch (err: any) {
      alert(err.message || 'Lỗi khi lưu.');
    }
  };

  const inputClass = 'h-10 w-full rounded-lg border border-slate-200 bg-slate-50 px-3 text-xs font-semibold text-slate-800 outline-none transition focus:border-pink-500 focus:bg-white';
  const labelText = 'text-[10px] font-black uppercase tracking-[0.12em] text-slate-500';

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-950/55 p-4 backdrop-blur-sm flex items-center justify-center">
      <form onSubmit={handleSubmit} className="w-full max-w-4xl max-h-[90vh] overflow-y-auto rounded-2xl border border-slate-200 bg-white p-6 shadow-2xl space-y-5">
        <div className="flex items-center justify-between border-b border-slate-100 pb-3">
          <h3 className="text-lg font-black text-slate-900">Cập nhật hồ sơ: {candidate.name} (SBD: {candidate.sbd})</h3>
          <button type="button" onClick={onClose} className="text-slate-400 hover:text-slate-600 font-bold text-sm">✕</button>
        </div>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 md:grid-cols-4">
          <label className="space-y-1 sm:col-span-2">
            <span className={labelText}>Họ và tên thí sinh</span>
            <input className={inputClass} value={form.name || ''} onChange={(e) => update('name', e.target.value)} required />
          </label>
          <label className="space-y-1">
            <span className={labelText}>SBD</span>
            <input className={inputClass} value={form.sbd || ''} onChange={(e) => update('sbd', e.target.value)} required />
          </label>
          <label className="space-y-1">
            <span className={labelText}>Giới tính</span>
            <select className={inputClass} value={form.gender || 'Nữ'} onChange={(e) => update('gender', e.target.value)}>
              <option value="Nữ">Nữ ♀</option>
              <option value="Nam">Nam ♂</option>
            </select>
          </label>
          <label className="space-y-1">
            <span className={labelText}>Bảng thi</span>
            <select className={inputClass} value={form.contestTable || 'FEMALE'} onChange={(e) => update('contestTable', e.target.value)}>
              <option value="FEMALE">Bảng Nữ</option>
              <option value="MALE">Bảng Nam</option>
              <option value="STUDENT">Bảng Sinh viên</option>
            </select>
          </label>
          <label className="space-y-1">
            <span className={labelText}>Vòng thi</span>
            <select className={inputClass} value={form.currentRound || 'Vòng sơ khảo'} onChange={(e) => update('currentRound', e.target.value)}>
              <option value="Vòng sơ khảo">Vòng sơ khảo</option>
              <option value="Vòng bán kết">Vòng bán kết</option>
              <option value="Vòng chung kết">Vòng chung kết</option>
            </select>
          </label>
          <label className="space-y-1">
            <span className={labelText}>Trạng thái</span>
            <select className={inputClass} value={form.status || 'Đủ hồ sơ'} onChange={(e) => update('status', e.target.value)}>
              <option value="Đủ hồ sơ">Đủ hồ sơ</option>
              <option value="Chờ duyệt">Chờ duyệt</option>
              <option value="Cần bổ sung ảnh">Cần bổ sung ảnh</option>
              <option value="Đã vào vòng trong">Đã vào vòng trong</option>
            </select>
          </label>
          <label className="space-y-1">
            <span className={labelText}>Lượt bình chọn</span>
            <input type="number" className={inputClass} value={form.votes || 0} onChange={(e) => update('votes', Number(e.target.value))} />
          </label>
        </div>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
          <label className="space-y-1 sm:col-span-2">
            <span className={labelText}>Khoa đào tạo HUIT</span>
            <select className={inputClass} value={form.faculty || HUIT_FACULTIES[0]} onChange={(e) => update('faculty', e.target.value)}>
              {HUIT_FACULTIES.map(fac => <option key={fac} value={fac}>{fac}</option>)}
            </select>
          </label>
          <label className="space-y-1">
            <span className={labelText}>Lớp học</span>
            <input className={inputClass} value={form.className || ''} onChange={(e) => update('className', e.target.value)} />
          </label>
          <label className="space-y-1">
            <span className={labelText}>MSSV</span>
            <input className={inputClass} value={form.studentId || ''} onChange={(e) => update('studentId', e.target.value)} />
          </label>
          <label className="space-y-1">
            <span className={labelText}>SĐT</span>
            <input className={inputClass} value={form.leaderPhone || ''} onChange={(e) => update('leaderPhone', e.target.value)} />
          </label>
          <label className="space-y-1">
            <span className={labelText}>Email</span>
            <input className={inputClass} value={form.leaderEmail || ''} onChange={(e) => update('leaderEmail', e.target.value)} />
          </label>
        </div>

        <div className="grid grid-cols-2 gap-3 sm:grid-cols-5">
          <label className="space-y-1">
            <span className={labelText}>Chiều cao (cm)</span>
            <input type="number" step="0.5" className={inputClass} value={form.heightCm || ''} onChange={(e) => update('heightCm', e.target.value)} />
          </label>
          <label className="space-y-1">
            <span className={labelText}>Cân nặng (kg)</span>
            <input type="number" step="0.5" className={inputClass} value={form.weightKg || ''} onChange={(e) => update('weightKg', e.target.value)} />
          </label>
          <label className="space-y-1">
            <span className={labelText}>Vòng 1 (cm)</span>
            <input type="number" step="0.5" className={inputClass} value={form.measurementBust || ''} onChange={(e) => update('measurementBust', e.target.value)} />
          </label>
          <label className="space-y-1">
            <span className={labelText}>Vòng 2 (cm)</span>
            <input type="number" step="0.5" className={inputClass} value={form.measurementWaist || ''} onChange={(e) => update('measurementWaist', e.target.value)} />
          </label>
          <label className="space-y-1">
            <span className={labelText}>Vòng 3 (cm)</span>
            <input type="number" step="0.5" className={inputClass} value={form.measurementHip || ''} onChange={(e) => update('measurementHip', e.target.value)} />
          </label>
        </div>

        <div className="space-y-3">
          <label className="block space-y-1">
            <span className={labelText}>Năng khiếu / Tài năng</span>
            <input className={inputClass} value={form.talent || ''} onChange={(e) => update('talent', e.target.value)} />
          </label>
          <label className="block space-y-1">
            <span className={labelText}>Link Video sơ khảo</span>
            <input className={inputClass} value={form.videoUrl || ''} onChange={(e) => update('videoUrl', e.target.value)} />
          </label>
          <label className="block space-y-1">
            <span className={labelText}>Thành tích nổi bật</span>
            <input className={inputClass} value={form.achievements || ''} onChange={(e) => update('achievements', e.target.value)} />
          </label>
          <label className="block space-y-1">
            <span className={labelText}>Thông điệp truyền cảm hứng</span>
            <textarea className="h-16 w-full rounded-lg border border-slate-200 bg-slate-50 p-2.5 text-xs" value={form.inspirationalMessage || ''} onChange={(e) => update('inspirationalMessage', e.target.value)} />
          </label>
          <label className="block space-y-1">
            <span className={labelText}>Mô tả tóm tắt</span>
            <textarea className="h-20 w-full rounded-lg border border-slate-200 bg-slate-50 p-2.5 text-xs" value={form.description || ''} onChange={(e) => update('description', e.target.value)} />
          </label>
        </div>

        <div>
          <ImageDropzone
            label="Ảnh chân dung đại diện"
            value={form.imageUrl || ''}
            onChange={(url) => update('imageUrl', url)}
          />
        </div>

        <div className="flex justify-end gap-2 border-t border-slate-100 pt-3">
          <button type="button" onClick={onClose} className="rounded-lg border px-4 py-2 text-xs font-bold text-slate-600">Hủy</button>
          <button type="submit" className="rounded-lg bg-pink-600 text-white px-5 py-2 text-xs font-bold hover:bg-pink-700">Lưu thay đổi</button>
        </div>

        <input type="file" ref={modalFileRef} onChange={handleModalFileUpload} accept="image/*" className="hidden" />
      </form>
    </div>
  );
}

export default function CandidateDetailPage() {
  const rawParams = useParams();
  const sbdParam = typeof rawParams?.sbd === 'string' ? rawParams.sbd : Array.isArray(rawParams?.sbd) ? rawParams?.sbd[0] : '';
  const [candidate, setCandidate] = useState<Candidate | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [activeImage, setActiveImage] = useState<string>('');
  const [allCandidates, setAllCandidates] = useState<Candidate[]>([]);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const { showAlert, showConfirm } = useAlert();

  const loadData = async () => {
    try {
      const res = await fetch(apiUrl('/api/candidates'));
      if (res.ok) {
        const list: Candidate[] = await res.json();
        setAllCandidates(list);
        const found = list.find((c) => c.sbd === sbdParam || c.id === sbdParam);
        if (found) {
          setCandidate(found);
          setActiveImage(found.imageUrl);
        }
      }
    } catch {
      showAlert('Không thể tải thông tin thí sinh.', 'error');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [sbdParam]);

  const rank = useMemo(() => {
    if (!candidate || !allCandidates.length) return null;
    const sorted = [...allCandidates].sort((a, b) => b.votes - a.votes);
    const index = sorted.findIndex((c) => c.id === candidate.id);
    return index >= 0 ? index + 1 : null;
  }, [candidate, allCandidates]);

  const allImages = useMemo(() => {
    if (!candidate) return [];
    const showcases = (candidate.showcaseImages || '')
      .split(',')
      .map((s) => s.trim())
      .filter(Boolean);
    return [candidate.imageUrl, ...showcases].filter(Boolean);
  }, [candidate]);

  const handleDelete = async () => {
    if (!candidate) return;
    const ok = await showConfirm('Chuyển hồ sơ thí sinh này vào thùng rác? Bạn có thể khôi phục sau.', 'Xác nhận xóa thí sinh', 'error', 'Xóa ngay');
    if (!ok) return;
    try {
      const res = await fetch(apiUrl(`/api/admin/candidates/${candidate.id}`), { method: 'DELETE' });
      if (res.ok) {
        window.location.href = '/admin/candidates';
      } else {
        showAlert('Không thể xóa thí sinh.', 'error');
      }
    } catch {
      showAlert('Lỗi khi xóa thí sinh.', 'error');
    }
  };

  if (isLoading) {
    return (
      <div className="rounded-2xl border border-slate-200 bg-white p-12 text-center text-sm font-semibold text-slate-500 shadow-sm">
        Đang tải hồ sơ thí sinh HUIT...
      </div>
    );
  }

  if (!candidate) {
    return (
      <div className="rounded-2xl border border-slate-200 bg-white p-12 text-center shadow-sm">
        <h2 className="text-xl font-black text-slate-900">Không tìm thấy thí sinh với SBD: {sbdParam}</h2>
        <Link href="/admin/candidates" className="mt-4 inline-flex rounded-xl bg-pink-600 px-4 py-2 text-xs font-black text-white hover:bg-pink-700">
          Quay lại danh sách thí sinh
        </Link>
      </div>
    );
  }

  const tableLabel = candidate.contestTableLabel || tableLabels[candidate.contestTable || ''] || 'Bảng thi';
  const isFemale = candidate.gender === 'Nữ' || candidate.contestTable === 'FEMALE';

  return (
    <div className="space-y-5">
      {/* Top action bar */}
      <section className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
        <div className="border-b border-slate-100 px-5 py-3.5 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <Link href="/admin/candidates" className="inline-flex items-center gap-1.5 text-xs font-black text-slate-500 hover:text-pink-600 transition">
            <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="2.5">
              <path d="m15 18-6-6 6-6" />
            </svg>
            Quay lại danh sách
          </Link>
          <div className="flex flex-wrap gap-2">
            <a
              href={`${SITE_URL}/thi-sinh/${candidate.sbd}`}
              target="_blank"
              rel="noopener noreferrer"
              className="rounded-lg border border-slate-200 bg-white px-3.5 py-1.5 text-xs font-bold text-slate-700 hover:border-pink-500 hover:text-pink-600 transition"
            >
              Xem ngoài website ↗
            </a>
            <button
              type="button"
              onClick={() => setIsEditModalOpen(true)}
              className="rounded-lg bg-pink-600 px-3.5 py-1.5 text-xs font-bold text-white shadow-sm hover:bg-pink-700 transition"
            >
              Chỉnh sửa hồ sơ
            </button>
            <button
              type="button"
              onClick={handleDelete}
              className="rounded-lg border border-rose-200 bg-rose-50 px-3.5 py-1.5 text-xs font-bold text-rose-600 hover:bg-rose-100 transition"
            >
              Xóa hồ sơ
            </button>
          </div>
        </div>

        {/* Hero details */}
        <div className="grid gap-0 lg:grid-cols-[380px_1fr]">
          <div className="bg-slate-50/70 p-5 flex flex-col items-center justify-center border-b lg:border-b-0 lg:border-r border-slate-100 space-y-3">
            <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white w-full shadow-inner aspect-[3/4] max-h-[420px] flex items-center justify-center">
              <img
                src={formatAssetUrl(activeImage || candidate.imageUrl)}
                alt={candidate.name}
                className="h-full w-full object-cover"
              />
            </div>

            {/* Gallery thumbnails */}
            {allImages.length > 1 && (
              <div className="flex flex-wrap gap-2 justify-center w-full">
                {allImages.map((imgUrl, index) => (
                  <button
                    key={index}
                    onClick={() => setActiveImage(imgUrl)}
                    className={`h-14 w-11 rounded-lg overflow-hidden border-2 bg-white transition ${
                      (activeImage || candidate.imageUrl) === imgUrl ? 'border-pink-600 shadow-md scale-105' : 'border-slate-200 opacity-70 hover:opacity-100'
                    }`}
                  >
                    <img src={formatAssetUrl(imgUrl)} alt="" className="h-full w-full object-cover" />
                  </button>
                ))}
              </div>
            )}
          </div>

          <div className="p-6 space-y-5">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
              <div>
                <p className="text-[11px] font-black uppercase tracking-[0.18em] text-pink-600">Thí sinh Đại sứ Truyền thông HUIT 2026</p>
                <h1 className="mt-1.5 text-2xl sm:text-3xl font-black text-slate-950">{candidate.name}</h1>
                <div className="mt-3 flex flex-wrap gap-2">
                  <Badge tone="slate">SBD: {candidate.sbd}</Badge>
                  <Badge tone={isFemale ? 'pink' : 'blue'}>{tableLabel} ({candidate.gender || 'Nữ'})</Badge>
                  <Badge tone="green">{candidate.currentRound || 'Vòng sơ khảo'}</Badge>
                  <Badge tone="orange">{candidate.status || 'Đủ hồ sơ'}</Badge>
                </div>
              </div>

              <div className="flex gap-3">
                <div className="rounded-2xl border border-pink-100 bg-pink-50 p-4 text-center min-w-[120px]">
                  <p className="text-[10px] font-black uppercase tracking-wider text-pink-500">Lượt vote</p>
                  <p className="mt-1 text-2xl font-black text-pink-700 tabular-nums">🗳️ {candidate.votes.toLocaleString()}</p>
                </div>
                <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4 text-center min-w-[100px]">
                  <p className="text-[10px] font-black uppercase tracking-wider text-slate-400">Xếp hạng</p>
                  <p className="mt-1 text-2xl font-black text-slate-800">{rank ? `#${rank}` : '--'}</p>
                </div>
              </div>
            </div>

            <p className="text-sm leading-relaxed text-slate-600 border-t border-slate-100 pt-3">
              {candidate.description || 'Chưa cập nhật mô tả ngắn về thí sinh.'}
            </p>

            <div className="grid gap-3 sm:grid-cols-3">
              <InfoItem label="Khoa đào tạo" value={candidate.faculty || 'Khoa HUIT'} />
              <InfoItem label="Lớp & MSSV" value={`${candidate.className || '--'} • ${candidate.studentId || '--'}`} />
              <InfoItem
                label="Chỉ số hình thể"
                value={`${candidate.heightCm ? candidate.heightCm + 'cm' : '--'} / ${candidate.weightKg ? candidate.weightKg + 'kg' : '--'} (${candidate.measurementBust || '-'}/${candidate.measurementWaist || '-'}/${candidate.measurementHip || '-'})`}
              />
            </div>
          </div>
        </div>
      </section>

      {/* Detail info cards */}
      <div className="grid gap-5 lg:grid-cols-2">
        <SectionCard title="Thông tin học tập & Liên hệ" description="Hồ sơ sinh viên tại Trường Đại học Công Thương TP.HCM">
          <div className="grid gap-3 sm:grid-cols-2">
            <InfoItem label="Khoa" value={candidate.faculty} />
            <InfoItem label="Lớp" value={candidate.className} />
            <InfoItem label="Mã số sinh viên (MSSV)" value={candidate.studentId} />
            <InfoItem label="Đơn vị trường" value={candidate.representativeSchool || 'Trường Đại học Công Thương TP.HCM'} />
            <InfoItem label="Số điện thoại" value={candidate.leaderPhone} />
            <InfoItem label="Email" value={candidate.leaderEmail} />
          </div>
        </SectionCard>

        <SectionCard title="Chỉ số hình thể & Nhân trắc học" description="Các số đo nhân trắc học chính thức của thí sinh">
          <div className="grid gap-3 grid-cols-2 sm:grid-cols-3">
            <InfoItem label="Chiều cao" value={candidate.heightCm ? `${candidate.heightCm} cm` : 'Chưa cập nhật'} />
            <InfoItem label="Cân nặng" value={candidate.weightKg ? `${candidate.weightKg} kg` : 'Chưa cập nhật'} />
            <InfoItem label="Vòng 1 (Ngực)" value={candidate.measurementBust ? `${candidate.measurementBust} cm` : '--'} />
            <InfoItem label="Vòng 2 (Eo)" value={candidate.measurementWaist ? `${candidate.measurementWaist} cm` : '--'} />
            <InfoItem label="Vòng 3 (Mông)" value={candidate.measurementHip ? `${candidate.measurementHip} cm` : '--'} />
            <InfoItem label="Tỷ lệ chuẩn" value={candidate.measurementWaist && candidate.measurementHip ? `${(candidate.measurementWaist / candidate.measurementHip).toFixed(2)} (Eo/Mông)` : '--'} />
          </div>
        </SectionCard>

        <SectionCard title="Năng khiếu, Video sơ khảo & Thành tích" description="Kỹ năng nghệ thuật và tư liệu dự thi">
          <div className="space-y-3">
            <InfoItem label="Năng khiếu sở trường" value={candidate.talent} />
            <div className="rounded-xl border border-slate-200 bg-slate-50/70 p-4">
              <p className="text-[10px] font-black uppercase tracking-[0.14em] text-slate-400">Video clip dự thi sơ khảo</p>
              {candidate.videoUrl ? (
                <div className="mt-2 flex items-center gap-2">
                  <a
                    href={candidate.videoUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1.5 rounded-lg bg-indigo-600 px-3 py-1.5 text-xs font-bold text-white hover:bg-indigo-700 transition"
                  >
                    <span>▶ Mở xem Video dự thi</span>
                  </a>
                  <span className="text-xs text-slate-500 truncate max-w-xs">{candidate.videoUrl}</span>
                </div>
              ) : (
                <p className="mt-1 text-sm font-semibold text-slate-400 italic">Chưa cung cấp liên kết video clip.</p>
              )}
            </div>
            <InfoItem label="Thành tích cá nhân / Đoàn - Hội" value={candidate.achievements} />
          </div>
        </SectionCard>

        <SectionCard title="Thông điệp truyền cảm hứng & Tự sự" description="Ý kiến và chia sẻ của thí sinh gửi gắm tới cộng đồng HUIT">
          <div className="space-y-3">
            <div className="rounded-xl border border-pink-100 bg-pink-50/50 p-4">
              <p className="text-[10px] font-black uppercase tracking-[0.14em] text-pink-600">Thông điệp truyền cảm hứng</p>
              <p className="mt-2 text-sm font-bold italic text-slate-800">
                "{candidate.inspirationalMessage || 'Đại sứ truyền thông HUIT tự tin lan tỏa những giá trị tích cực!'}"
              </p>
            </div>
            <InfoItem label="Tiểu sử / Tự sự chi tiết" value={candidate.biography} />
          </div>
        </SectionCard>
      </div>

      {isEditModalOpen && (
        <CandidateEditModal
          candidate={candidate}
          onClose={() => setIsEditModalOpen(false)}
          onSaved={(updated) => {
            setCandidate(updated);
            setActiveImage(updated.imageUrl);
          }}
        />
      )}
    </div>
  );
}
