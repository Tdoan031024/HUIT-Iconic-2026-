'use client';

import { FormEvent, ReactNode, useState, useEffect } from 'react';
import { apiUrl } from '../api';
import { useAlert } from '../AlertProvider';

type RegistrationForm = {
  fullName: string; gender: string; dateOfBirth: string; faculty: string; major: string; className: string;
  studentId: string; placeOfBirth: string; identityNumber: string; identityIssuedDate: string;
  identityIssuedPlace: string; address: string; phone: string; email: string; facebookUrl: string;
  videoUrl: string; talent: string; achievements: string; selfIntroduction: string; inspirationalMessage: string;
  facultyIntroduction: string; ambassadorPlan: string; heightCm: string; weightKg: string; measurementBust: string;
  measurementWaist: string; measurementHip: string; portraitImageUrl: string; fullBodyImageUrl: string;
  consentAccepted: boolean;
};

type PhotoSlot = {
  file: File | null;
  previewUrl: string | null;
  serverUrl: string | null;
  fileName: string;
  fileSize: number;
  isUploading: boolean;
  error: string | null;
};

const initialPhotoSlot: PhotoSlot = {
  file: null,
  previewUrl: null,
  serverUrl: null,
  fileName: '',
  fileSize: 0,
  isUploading: false,
  error: null,
};

function formatFileSize(bytes: number): string {
  if (!bytes || bytes === 0) return '0 KB';
  const mb = bytes / (1024 * 1024);
  if (mb >= 1) return `${mb.toFixed(1)} MB`;
  return `${Math.round(bytes / 1024)} KB`;
}

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
  'Khoa / Viện khác',
];

const initialForm: RegistrationForm = {
  fullName: '', gender: '', dateOfBirth: '', faculty: '', major: '', className: '', studentId: '', placeOfBirth: '',
  identityNumber: '', identityIssuedDate: '', identityIssuedPlace: '', address: '', phone: '', email: '',
  facebookUrl: '', videoUrl: '', talent: '', achievements: '', selfIntroduction: '', inspirationalMessage: '', facultyIntroduction: '',
  ambassadorPlan: '', heightCm: '', weightKg: '', measurementBust: '', measurementWaist: '', measurementHip: '',
  portraitImageUrl: '', fullBodyImageUrl: '', consentAccepted: false,
};

const inputClass = 'mt-2 h-12 w-full rounded-xl border border-slate-200 bg-white px-4 text-sm text-slate-900 outline-none transition focus:border-[#0A2FFF] focus:ring-4 focus:ring-blue-100';
const textareaClass = 'mt-2 min-h-28 w-full resize-y rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-[#0A2FFF] focus:ring-4 focus:ring-blue-100';

function Section({ number, title, description, children }: { number: string; title: string; description: string; children: ReactNode }) {
  return <section className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm sm:p-8">
    <div className="mb-6 flex items-start gap-4 border-b border-slate-100 pb-5">
      <span className="grid h-10 w-10 shrink-0 place-items-center rounded-2xl bg-[#0A2FFF] text-sm font-black text-white">{number}</span>
      <div><h2 className="text-xl font-black text-slate-950">{title}</h2><p className="mt-1 text-sm leading-6 text-slate-500">{description}</p></div>
    </div>
    {children}
  </section>;
}

function Label({ children, required = false }: { children: ReactNode; required?: boolean }) {
  return <span className="text-sm font-bold text-slate-700">{children}{required && <b className="ml-1 text-red-500">*</b>}</span>;
}

export default function RegistrationPage() {
  const { showAlert } = useAlert();
  const [form, setForm] = useState(initialForm);
  const [portrait, setPortrait] = useState<PhotoSlot>(initialPhotoSlot);
  const [fullBody, setFullBody] = useState<PhotoSlot>(initialPhotoSlot);
  const [lightbox, setLightbox] = useState<{ url: string; title: string; fileName: string } | null>(null);
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const update = (key: keyof RegistrationForm, value: string | boolean) => setForm((prev) => ({ ...prev, [key]: value }));

  // Listen for Escape key to close lightbox
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setLightbox(null);
    };
    if (lightbox) {
      window.addEventListener('keydown', handleKeyDown);
      document.body.style.overflow = 'hidden';
    }
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      document.body.style.overflow = '';
    };
  }, [lightbox]);

  const handlePhotoSelect = async (
    file: File | null,
    slotKey: 'portrait' | 'fullBody',
    slotLabel: string
  ) => {
    if (!file) return;

    const setSlot = slotKey === 'portrait' ? setPortrait : setFullBody;
    const ext = file.name.split('.').pop()?.toLowerCase() || '';
    const validExtensions = ['jpg', 'jpeg', 'png', 'webp'];

    // 1. Kiểm tra định dạng tệp ảnh
    if (!validExtensions.includes(ext)) {
      const errMsg = `Định dạng tệp "${ext ? `.${ext}` : 'không rõ'}" không được hỗ trợ. Vui lòng chỉ chọn ảnh có định dạng JPG, PNG hoặc WEBP.`;
      setSlot((prev) => ({ ...prev, error: errMsg }));
      showAlert(errMsg, 'error', 'Định dạng không hỗ trợ');
      return;
    }

    // 2. Kiểm tra dung lượng tối đa 15MB
    const MAX_SIZE = 15 * 1024 * 1024;
    if (file.size > MAX_SIZE) {
      const sizeMb = (file.size / (1024 * 1024)).toFixed(1);
      const errMsg = `Ảnh "${file.name}" có dung lượng ${sizeMb}MB, vượt quá giới hạn tối đa cho phép là 15MB. Vui lòng chọn hoặc nén ảnh nhỏ hơn.`;
      setSlot((prev) => ({ ...prev, error: errMsg }));
      showAlert(errMsg, 'error', 'Ảnh quá dung lượng 15MB');
      return;
    }

    // 3. Hiển thị ảnh preview ngay lập tức
    const localPreviewUrl = URL.createObjectURL(file);
    setSlot({
      file,
      previewUrl: localPreviewUrl,
      serverUrl: null,
      fileName: file.name,
      fileSize: file.size,
      isUploading: true,
      error: null,
    });

    // 4. Tiến hành tải ảnh lên máy chủ qua /api/upload
    try {
      const data = new FormData();
      data.append('file', file);
      const response = await fetch(apiUrl('/api/upload'), {
        method: 'POST',
        body: data,
      });
      const result = await response.json().catch(() => null);

      if (!response.ok || !result?.url) {
        const errMsg = result?.error || result?.message || 'Không thể tải ảnh lên máy chủ.';
        setSlot((prev) => ({
          ...prev,
          isUploading: false,
          error: errMsg,
        }));
        showAlert(`Tải ${slotLabel} không thành công: ${errMsg}`, 'error', 'Lỗi tải ảnh');
        return;
      }

      // Tải lên thành công
      setSlot((prev) => ({
        ...prev,
        serverUrl: result.url,
        previewUrl: result.url,
        isUploading: false,
        error: null,
      }));
      showAlert(`Đã tải lên ${slotLabel} thành công!`, 'success', 'Tải ảnh thành công');
    } catch (err: any) {
      const errMsg = err?.message || 'Lỗi kết nối máy chủ khi gửi ảnh.';
      setSlot((prev) => ({
        ...prev,
        isUploading: false,
        error: errMsg,
      }));
      showAlert(`Tải ${slotLabel} thất bại: ${errMsg}`, 'error', 'Lỗi kết nối mạng');
    }
  };

  const removePhoto = (slotKey: 'portrait' | 'fullBody') => {
    const setSlot = slotKey === 'portrait' ? setPortrait : setFullBody;
    setSlot(initialPhotoSlot);
  };

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (portrait.isUploading || fullBody.isUploading) {
      showAlert('Ảnh hồ sơ đang trong quá trình tải lên. Vui lòng đợi trong giây lát.', 'info', 'Đang tải ảnh');
      return;
    }

    if (!portrait.serverUrl && !fullBody.serverUrl) {
      showAlert('Vui lòng tải lên cả ảnh chân dung và ảnh toàn thân nghệ thuật.', 'warning', 'Thiếu ảnh hồ sơ');
      return;
    }
    if (!portrait.serverUrl) {
      showAlert('Vui lòng tải lên ảnh chân dung hợp lệ.', 'warning', 'Thiếu ảnh chân dung');
      return;
    }
    if (!fullBody.serverUrl) {
      showAlert('Vui lòng tải lên ảnh toàn thân nghệ thuật hợp lệ.', 'warning', 'Thiếu ảnh toàn thân');
      return;
    }

    setLoading(true);
    try {
      const response = await fetch(apiUrl('/api/registrations'), {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...form,
          portraitImageUrl: portrait.serverUrl,
          fullBodyImageUrl: fullBody.serverUrl,
        }),
      });
      const result = await response.json().catch(() => null);
      if (!response.ok) throw new Error(result?.message || 'Không thể gửi hồ sơ.');
      setSubmitted(true);
      window.scrollTo({ top: 0, behavior: 'smooth' });
      showAlert(result.message || 'Đã tiếp nhận hồ sơ đăng ký thành công!', 'success', 'Gửi hồ sơ thành công');
    } catch (error: any) {
      showAlert(error.message || 'Không thể gửi hồ sơ lúc này.', 'error', 'Lỗi đăng ký');
    } finally {
      setLoading(false);
    }
  }

  const renderPhotoSlot = (
    slotKey: 'portrait' | 'fullBody',
    label: string,
    subtitle: string
  ) => {
    const slot = slotKey === 'portrait' ? portrait : fullBody;

    return (
      <div className="flex flex-col">
        <div className="mb-2 flex items-center justify-between">
          <Label required>{label}</Label>
          <span className="text-[11px] font-semibold text-slate-400">JPG, PNG, WEBP &le; 15MB</span>
        </div>

        {slot.previewUrl ? (
          <div className="rounded-2xl border border-slate-200 bg-white p-3.5 shadow-sm transition hover:shadow-md">
            {/* Khung ảnh preview */}
            <div
              className="group relative flex h-64 sm:h-72 w-full items-center justify-center overflow-hidden rounded-xl bg-slate-950 cursor-pointer"
              onClick={() => setLightbox({ url: slot.previewUrl!, title: label, fileName: slot.fileName })}
            >
              <img
                src={slot.previewUrl}
                alt={label}
                className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
              />

              {/* Huy hiệu trạng thái góc trên bên trái */}
              <div className="absolute top-2.5 left-2.5 z-10">
                {slot.isUploading ? (
                  <span className="flex items-center gap-1.5 rounded-full bg-blue-600/95 px-3 py-1 text-xs font-bold text-white shadow backdrop-blur-sm animate-pulse">
                    <svg className="h-3.5 w-3.5 animate-spin text-white" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                    </svg>
                    Đang tải lên...
                  </span>
                ) : slot.serverUrl ? (
                  <span className="flex items-center gap-1 rounded-full bg-emerald-600/95 px-3 py-1 text-xs font-bold text-white shadow backdrop-blur-sm">
                    <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" fill="none" stroke="currentColor" strokeWidth="3" viewBox="0 0 24 24">
                      <polyline points="20 6 9 17 4 12" />
                    </svg>
                    Đã tải lên
                  </span>
                ) : slot.error ? (
                  <span className="flex items-center gap-1 rounded-full bg-red-600/95 px-3 py-1 text-xs font-bold text-white shadow backdrop-blur-sm">
                    ✕ Tải thất bại
                  </span>
                ) : null}
              </div>

              {/* Nút hành động nhanh góc trên bên phải */}
              <div className="absolute top-2.5 right-2.5 z-10 flex items-center gap-1.5">
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    setLightbox({ url: slot.previewUrl!, title: label, fileName: slot.fileName });
                  }}
                  className="grid h-8 w-8 place-items-center rounded-lg bg-black/60 text-white backdrop-blur-sm hover:bg-black/85 transition shadow"
                  title="Bấm để xem to ảnh"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" width="15" height="15" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24">
                    <circle cx="11" cy="11" r="8" />
                    <line x1="21" y1="21" x2="16.65" y2="16.65" />
                    <line x1="11" y1="8" x2="11" y2="14" />
                    <line x1="8" y1="11" x2="14" y2="11" />
                  </svg>
                </button>
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    removePhoto(slotKey);
                  }}
                  className="grid h-8 w-8 place-items-center rounded-lg bg-red-600/80 text-white backdrop-blur-sm hover:bg-red-600 transition shadow"
                  title="Xóa ảnh"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" width="15" height="15" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24">
                    <polyline points="3 6 5 6 21 6" />
                    <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
                  </svg>
                </button>
              </div>

              {/* Lớp phủ khi rê chuột */}
              <div className="absolute inset-0 flex flex-col items-center justify-center gap-1.5 bg-black/40 opacity-0 transition-opacity duration-200 group-hover:opacity-100 text-white">
                <div className="grid h-10 w-10 place-items-center rounded-full bg-white/20 backdrop-blur-sm">
                  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24">
                    <circle cx="11" cy="11" r="8" />
                    <line x1="21" y1="21" x2="16.65" y2="16.65" />
                    <line x1="11" y1="8" x2="11" y2="14" />
                    <line x1="8" y1="11" x2="14" y2="11" />
                  </svg>
                </div>
                <span className="text-xs font-bold tracking-wide">Bấm vào ảnh để xem to</span>
              </div>
            </div>

            {/* Thông tin tên file và nút đổi ảnh */}
            <div className="mt-3 flex items-center justify-between gap-2">
              <div className="min-w-0 flex-1">
                <p className="truncate text-xs font-semibold text-slate-700" title={slot.fileName}>
                  {slot.fileName}
                </p>
                <p className="text-[11px] text-slate-400">
                  Dung lượng: {formatFileSize(slot.fileSize)}
                </p>
              </div>
              <label className="cursor-pointer shrink-0 rounded-lg bg-blue-50 px-3 py-1.5 text-xs font-bold text-[#0A2FFF] transition hover:bg-blue-100">
                Đổi ảnh khác
                <input
                  type="file"
                  accept="image/jpeg,image/png,image/webp"
                  className="hidden"
                  onChange={(e) => {
                    const f = e.target.files?.[0] || null;
                    if (f) handlePhotoSelect(f, slotKey, label);
                    e.target.value = '';
                  }}
                />
              </label>
            </div>

            {/* Khung báo lỗi nếu có */}
            {slot.error && (
              <div className="mt-2.5 flex items-start gap-2 rounded-xl border border-red-200 bg-red-50 p-2.5 text-xs text-red-600">
                <svg className="mt-0.5 h-4 w-4 shrink-0 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <circle cx="12" cy="12" r="10" />
                  <line x1="12" y1="8" x2="12" y2="12" />
                  <line x1="12" y1="16" x2="12.01" y2="16" />
                </svg>
                <div>
                  <p className="font-bold">Lỗi tải ảnh lên:</p>
                  <p className="mt-0.5">{slot.error}</p>
                </div>
              </div>
            )}
          </div>
        ) : (
          <label
            onDragOver={(e) => {
              e.preventDefault();
              e.stopPropagation();
            }}
            onDrop={(e) => {
              e.preventDefault();
              e.stopPropagation();
              const f = e.dataTransfer.files?.[0] || null;
              if (f) handlePhotoSelect(f, slotKey, label);
            }}
            className="group relative flex min-h-[240px] flex-col items-center justify-center rounded-2xl border-2 border-dashed border-slate-300 bg-slate-50/70 p-6 text-center cursor-pointer transition hover:border-[#0A2FFF] hover:bg-blue-50/30"
          >
            <input
              type="file"
              accept="image/jpeg,image/png,image/webp"
              className="hidden"
              onChange={(e) => {
                const f = e.target.files?.[0] || null;
                if (f) handlePhotoSelect(f, slotKey, label);
                e.target.value = '';
              }}
            />
            <div className="grid h-14 w-14 place-items-center rounded-2xl bg-blue-100/70 text-[#0A2FFF] transition duration-200 group-hover:scale-110 group-hover:bg-[#0A2FFF] group-hover:text-white">
              <svg xmlns="http://www.w3.org/2000/svg" width="28" height="28" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24">
                <rect x="3" y="3" width="18" height="18" rx="2" ry="2" />
                <circle cx="8.5" cy="8.5" r="1.5" />
                <polyline points="21 15 16 10 5 21" />
              </svg>
            </div>
            <p className="mt-3 text-sm font-bold text-slate-800 transition group-hover:text-[#0A2FFF]">
              Kéo thả ảnh hoặc <span className="underline">bấm để chọn tệp</span>
            </p>
            <p className="mt-1 text-xs text-slate-500">
              {subtitle}
            </p>
            <div className="mt-3 inline-flex items-center gap-1.5 rounded-full bg-slate-200/70 px-3 py-1 text-[11px] font-semibold text-slate-600">
              <span>JPG, PNG, WEBP</span>
              <span>•</span>
              <span>Tối đa 15MB</span>
            </div>

            {slot.error && (
              <div className="mt-3 w-full rounded-xl border border-red-200 bg-red-50 p-2.5 text-left text-xs text-red-600">
                <p className="font-bold">Lỗi: {slot.error}</p>
              </div>
            )}
          </label>
        )}
      </div>
    );
  };

  if (submitted) {
    return (
      <main className="min-h-[75vh] bg-slate-50 px-4 py-16 sm:px-6 flex items-center justify-center">
        <div className="mx-auto max-w-2xl w-full rounded-3xl border border-emerald-200 bg-white p-8 text-center shadow-lg sm:p-12">
          <div className="mx-auto grid h-16 w-16 place-items-center rounded-full bg-emerald-100 text-3xl text-emerald-600">
            ✓
          </div>
          <h1 className="mt-6 text-3xl font-black text-slate-950">Đã tiếp nhận hồ sơ thành công!</h1>
          <p className="mx-auto mt-4 max-w-lg leading-7 text-slate-600">
            Cảm ơn bạn đã đăng ký dự thi <b>HUIT&apos;s ICONIC 2026</b>. Ban Tổ Chức đã gửi email xác nhận đến hòm thư của bạn và sẽ liên hệ sớm nhất.
          </p>

          {/* Khung Zalo hỗ trợ */}
          <div className="mt-6 rounded-2xl border border-cyan-200 bg-gradient-to-r from-blue-50 to-cyan-50 p-5 text-center">
            <p className="text-sm font-bold text-cyan-950">
              💬 Nhóm Zalo Hướng dẫn &amp; Hỗ trợ Thí sinh
            </p>
            <p className="mt-1 text-xs text-slate-600">
              Vui lòng tham gia nhóm Zalo để nhận thông báo lịch thi và các hỗ trợ trực tiếp từ Ban Tổ Chức:
            </p>
            <a
              href="https://zalo.me/g/myzijputivfgc1toua9z"
              target="_blank"
              rel="noreferrer"
              className="mt-3 inline-flex items-center justify-center gap-2 rounded-xl bg-[#0068FF] px-6 py-2.5 text-sm font-black text-white shadow-md hover:bg-[#0052cc] transition"
            >
              <span>Tham gia nhóm Zalo thí sinh</span>
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24"><path d="M5 12h14"/><path d="m12 5 7 7-7 7"/></svg>
            </a>
          </div>

          <div className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-3">
            <a
              className="inline-flex h-12 w-full sm:w-auto items-center justify-center rounded-xl bg-[#0A2FFF] px-8 font-bold text-white transition hover:bg-blue-700"
              href="/"
            >
              Về trang chủ
            </a>
          </div>
        </div>
      </main>
    );
  }

  return <main className="min-h-screen bg-slate-50 px-4 py-10 sm:px-6 sm:py-16">
    <div className="mx-auto max-w-5xl">
      <header className="mb-10 max-w-3xl">
        <p className="text-xs font-black uppercase tracking-[.18em] text-[#0A2FFF]">HUIT&apos;s ICONIC 2026</p>
        <h1 className="mt-3 text-3xl font-black tracking-tight text-slate-950 sm:text-5xl">Đăng ký dự thi</h1>
        <p className="mt-4 text-base leading-7 text-slate-600">Hãy hoàn thành hồ sơ để Ban tổ chức tìm hiểu câu chuyện, cá tính và thế mạnh của bạn.</p>
        <div className="mt-4 rounded-2xl border border-blue-200 bg-blue-50/70 p-4 text-xs sm:text-sm text-blue-900 leading-relaxed">
          <p className="font-bold flex items-center gap-1.5 text-blue-950">
            <span>📌</span> Tiêu chuẩn thí sinh tham gia HUIT&apos;s ICONIC 2026 (Mục 04 Đề án):
          </p>
          <ul className="mt-1.5 list-disc list-inside space-y-1 text-blue-800">
            <li>Là sinh viên đang theo học hệ chính quy tại Trường Đại học Công Thương TP.HCM (HUIT).</li>
            <li>Tiêu chuẩn chiều cao chính thức: <b>Nữ từ 1m60 trở lên</b>, <b>Nam từ 1m70 trở lên</b>.</li>
            <li>Ngoại hình cân đối, gương mặt khả ái, có phẩm chất đạo đức tốt và lối sống lành mạnh.</li>
          </ul>
        </div>
        <p className="mt-3 text-sm text-slate-500"><b className="text-red-500">*</b> Trường bắt buộc. Hồ sơ được tiếp nhận để kiểm tra trước khi công bố chính thức.</p>
      </header>
      <form onSubmit={submit} className="space-y-6">
        <Section number="01" title="Thông tin cá nhân" description="Thông tin dùng để xác minh tư cách tham gia cuộc thi.">
          <div className="grid gap-5 sm:grid-cols-2">
            <label className="sm:col-span-2"><Label required>Họ và tên thí sinh</Label><input required className={inputClass} value={form.fullName} onChange={(e) => update('fullName', e.target.value)} /></label>
            <label><Label required>Giới tính</Label><select required className={inputClass} value={form.gender} onChange={(e) => update('gender', e.target.value)}><option value="">Chọn giới tính</option><option value="FEMALE">Nữ</option><option value="MALE">Nam</option></select></label>
            <label><Label required>Ngày sinh</Label><input required type="date" className={inputClass} value={form.dateOfBirth} onChange={(e) => update('dateOfBirth', e.target.value)} /></label>
            <label><Label required>Khoa/ Viện/ Phòng quản lý sinh viên:</Label><input required type="text" placeholder="Nhập Khoa, Viện hoặc Phòng quản lý sinh viên..." className={inputClass} value={form.faculty} onChange={(e) => update('faculty', e.target.value)} /></label>
            <label><Label required>Ngành học</Label><input required placeholder="Ví dụ: Công nghệ thông tin" className={inputClass} value={form.major} onChange={(e) => update('major', e.target.value)} /></label>
            <label><Label required>Lớp</Label><input required placeholder="Ví dụ: 12DHTH01" className={inputClass} value={form.className} onChange={(e) => update('className', e.target.value)} /></label>
            <label><Label required>MSSV</Label><input required placeholder="Ví dụ: 200120xxxx" className={inputClass} value={form.studentId} onChange={(e) => update('studentId', e.target.value)} /></label>
            <label><Label required>Nơi sinh</Label><input required className={inputClass} value={form.placeOfBirth} onChange={(e) => update('placeOfBirth', e.target.value)} /></label>
            <label><Label required>Số CMND/CCCD</Label><input required inputMode="numeric" className={inputClass} value={form.identityNumber} onChange={(e) => update('identityNumber', e.target.value)} /></label>
            <label><Label required>Ngày cấp</Label><input required type="date" className={inputClass} value={form.identityIssuedDate} onChange={(e) => update('identityIssuedDate', e.target.value)} /></label>
            <label><Label required>Nơi cấp</Label><input required className={inputClass} value={form.identityIssuedPlace} onChange={(e) => update('identityIssuedPlace', e.target.value)} /></label>
            <label className="sm:col-span-2"><Label required>Địa chỉ liên lạc</Label><input required className={inputClass} value={form.address} onChange={(e) => update('address', e.target.value)} /></label>
            <label><Label required>Điện thoại di động</Label><input required type="tel" inputMode="tel" placeholder="09xxxxxxxx" className={inputClass} value={form.phone} onChange={(e) => update('phone', e.target.value)} /></label>
            <label><Label required>Địa chỉ email</Label><input required type="email" placeholder="example@gmail.com" className={inputClass} value={form.email} onChange={(e) => update('email', e.target.value)} /></label>
            <label className="sm:col-span-2"><Label required>Link Facebook cá nhân</Label><input required type="url" placeholder="https://facebook.com/..." className={inputClass} value={form.facebookUrl} onChange={(e) => update('facebookUrl', e.target.value)} /></label>
            <label className="sm:col-span-2"><Label>Năng khiếu nổi bật</Label><textarea className={textareaClass} placeholder="Ví dụ: ca hát, nhảy, MC, nhiếp ảnh..." value={form.talent} onChange={(e) => update('talent', e.target.value)} /></label>
          </div>
        </Section>

        <Section number="02" title="Mong muốn/ câu chuyện của bạn khi đến với cuộc thi" description="Hãy chia sẻ ngắn gọn, chân thật về mong muốn hoặc câu chuyện của bạn khi đến với HUIT's ICONIC 2026.">
          <div className="space-y-5">
            <label>
              <Label required>Mong muốn/ câu chuyện của bạn khi đến với cuộc thi</Label>
              <textarea
                required
                rows={5}
                placeholder="Chia sẻ lý do, mong muốn hoặc câu chuyện truyền cảm hứng của bạn khi tham gia cuộc thi..."
                className={textareaClass}
                value={form.selfIntroduction}
                onChange={(e) => update('selfIntroduction', e.target.value)}
              />
            </label>
          </div>
        </Section>

        <Section number="03" title="Ảnh hồ sơ" description="Ảnh chính diện, rõ mặt, trang phục lịch sự. Mỗi ảnh tối đa 15MB, định dạng JPG, PNG hoặc WEBP.">
          <div className="grid gap-6 sm:grid-cols-2">
            {renderPhotoSlot('portrait', 'Ảnh chân dung', 'Ảnh chính diện, rõ mặt, trang phục lịch sự')}
            {renderPhotoSlot('fullBody', 'Ảnh toàn thân nghệ thuật', 'Ảnh toàn thân dáng đứng hoặc phong cách nghệ thuật')}
          </div>
        </Section>

        <Section number="04" title="Chỉ số hình thể" description="Nhập theo đơn vị centimet và kilogram.">
          <div className="grid gap-5 sm:grid-cols-2">
            <label>
              <div className="flex items-center justify-between">
                <Label required>Chiều cao (cm)</Label>
                <span className="text-[11px] font-semibold text-blue-600">Nữ &ge; 160, Nam &ge; 170</span>
              </div>
              <input required type="number" min="100" max="250" step="0.1" placeholder="Ví dụ: 168" className={inputClass} value={form.heightCm} onChange={(e) => update('heightCm', e.target.value)} />
            </label>
            <label><Label required>Cân nặng (kg)</Label><input required type="number" min="20" max="200" step="0.1" placeholder="Ví dụ: 52" className={inputClass} value={form.weightKg} onChange={(e) => update('weightKg', e.target.value)} /></label>
          </div>
        </Section>

        <section className="rounded-3xl border border-amber-200 bg-amber-50 p-5 sm:p-8"><h2 className="text-xl font-black text-slate-950">05. Cam kết của thí sinh</h2><ul className="mt-5 list-disc space-y-3 pl-5 text-sm leading-6 text-slate-700"><li>Chịu trách nhiệm về tính chính xác và trung thực của nội dung đăng ký.</li><li>Thực hiện đúng quy định pháp luật Việt Nam và quy định của Ban tổ chức.</li><li>Hiểu rằng lịch thi là dự kiến và quyết định của Ban tổ chức là quyết định cuối cùng.</li><li>Đồng ý để Ban tổ chức sử dụng hình ảnh phục vụ truyền thông trong và ngoài cuộc thi.</li></ul><label className="mt-6 flex items-start gap-3 text-sm font-bold text-slate-800"><input required type="checkbox" className="mt-1 h-5 w-5 accent-[#0A2FFF]" checked={form.consentAccepted} onChange={(e) => update('consentAccepted', e.target.checked)} />Tôi đã đọc, hiểu và đồng ý với các cam kết trên cũng như thể lệ cuộc thi.</label></section>

        <div className="flex flex-col items-start justify-between gap-5 rounded-3xl bg-slate-950 p-5 text-white sm:flex-row sm:items-center sm:p-7"><div><p className="font-black">Sau khi gửi hồ sơ</p><p className="mt-1 text-sm leading-6 text-slate-300">Tham gia nhóm Zalo hướng dẫn: <a className="font-bold text-cyan-300 underline" href="https://zalo.me/g/myzijputivfgc1toua9z" target="_blank" rel="noreferrer">zalo.me/g/myzijputivfgc1toua9z</a></p></div><button disabled={loading} className="h-12 w-full rounded-xl bg-[#79BCC2] px-7 font-black text-slate-950 transition hover:bg-white disabled:cursor-wait disabled:opacity-60 sm:w-auto">{loading ? 'Đang gửi hồ sơ...' : 'Gửi hồ sơ đăng ký'}</button></div>
      </form>
    </div>

    {/* Lightbox xem ảnh to */}
    {lightbox && (
      <div
        className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/85 backdrop-blur-md p-4 animate-in fade-in duration-200"
        onClick={() => setLightbox(null)}
        role="dialog"
        aria-modal="true"
      >
        <div
          className="relative flex flex-col max-h-[92vh] max-w-4xl w-full rounded-2xl bg-slate-900 border border-white/10 shadow-2xl overflow-hidden"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Lightbox Header */}
          <div className="flex items-center justify-between border-b border-white/10 bg-slate-950/80 px-5 py-3.5">
            <div className="min-w-0 pr-4">
              <h3 className="text-sm sm:text-base font-black text-white flex items-center gap-2 truncate">
                <span className="text-cyan-400">🖼️</span>
                <span>{lightbox.title}</span>
              </h3>
              {lightbox.fileName && (
                <p className="text-[11px] text-slate-400 truncate max-w-xs sm:max-w-md font-mono mt-0.5">
                  Tệp: {lightbox.fileName}
                </p>
              )}
            </div>
            <button
              type="button"
              onClick={() => setLightbox(null)}
              className="grid h-8 w-8 shrink-0 place-items-center rounded-lg bg-white/10 text-slate-300 hover:bg-white/20 hover:text-white transition"
              aria-label="Đóng xem ảnh"
              title="Đóng (Esc)"
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24">
                <line x1="18" y1="6" x2="6" y2="18" />
                <line x1="6" y1="6" x2="18" y2="18" />
              </svg>
            </button>
          </div>

          {/* Lightbox Image Preview Body */}
          <div className="relative flex-1 flex items-center justify-center p-4 bg-black/50 overflow-auto min-h-[320px] max-h-[76vh]">
            <img
              src={lightbox.url}
              alt={lightbox.title}
              className="max-h-[72vh] max-w-full object-contain rounded-xl shadow-2xl"
            />
          </div>

          {/* Lightbox Footer */}
          <div className="flex items-center justify-between border-t border-white/10 bg-slate-950/80 px-5 py-2.5 text-xs text-slate-400">
            <span>Bấm phím Esc hoặc bấm ra ngoài để đóng</span>
            <button
              type="button"
              onClick={() => setLightbox(null)}
              className="rounded-lg bg-white/15 hover:bg-white/25 px-4 py-1.5 text-xs font-bold text-white transition"
            >
              Đóng
            </button>
          </div>
        </div>
      </div>
    )}
  </main>;
}
