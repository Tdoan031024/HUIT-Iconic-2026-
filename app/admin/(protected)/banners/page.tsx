'use client';

import React, { useEffect, useState } from 'react';
import { Banner } from '@/lib/types';
import { apiUrl, formatAssetUrl } from '../../api';
import { useAlert } from '../../AlertProvider';
import ImageDropzone from '../../components/ImageDropzone';

type AdminBanner = Banner & {
  isActive?: boolean;
};

type BannerFormProps = {
  title: string;
  formTitle: string;
  formImageUrl: string;
  formLink: string;
  formActive: boolean;
  setFormTitle: (value: string) => void;
  setFormImageUrl: (value: string) => void;
  setFormLink: (value: string) => void;
  setFormActive: (value: boolean) => void;
  onClose: () => void;
  onSubmit: (event: React.FormEvent) => void;
};

function BannerModal({
  title,
  formTitle,
  formImageUrl,
  formLink,
  formActive,
  setFormTitle,
  setFormImageUrl,
  setFormLink,
  setFormActive,
  onClose,
  onSubmit,
}: BannerFormProps) {
  return (
    <div className="fixed inset-0 z-50 grid place-items-center bg-[#10211d]/60 p-4 backdrop-blur-sm transition-all duration-300">
      <form onSubmit={onSubmit} className="w-full max-w-[850px] rounded-xl border border-[#dce5e1] bg-white p-5 shadow-2xl animate-in fade-in zoom-in duration-200">
        <div className="flex items-start justify-between gap-3 border-b border-[#edf2f0] pb-3">
          <div>
            <p className="text-[10px] font-bold uppercase tracking-[0.16em] text-[#0f766e]">Quản lý giao diện</p>
            <h3 className="mt-0.5 text-base font-black text-[#123c34]">{title}</h3>
          </div>
          <button type="button" onClick={onClose} className="rounded border border-[#dce5e1] px-2.5 py-1 text-[10px] font-bold text-[#52605b] hover:border-[#0f766e] hover:text-[#0f766e] transition-colors">
            Đóng
          </button>
        </div>

        <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Left Column: Preview Area */}
          <div className="flex flex-col space-y-2">
            <span className="text-[10px] font-bold text-[#52605b] uppercase tracking-wider block">Xem trước hiển thị</span>
            <div className="overflow-hidden rounded-lg border border-[#dce5e1] bg-[#f4f7f6] flex-1 flex items-center justify-center min-h-[220px] md:min-h-[280px] p-4 text-center">
              {formImageUrl ? (
                formImageUrl.toLowerCase().endsWith('.mp4') ? (
                  <video src={formatAssetUrl(formImageUrl)} controls className="max-h-[280px] w-full object-contain rounded-md shadow-sm" />
                ) : (
                  <img src={formatAssetUrl(formImageUrl)} alt="Xem trước" className="max-h-[280px] w-full object-contain rounded-md shadow-sm" />
                )
              ) : (
                <div className="space-y-2">
                  <svg viewBox="0 0 24 24" className="h-10 w-10 text-[#8aa098] mx-auto" fill="none" stroke="currentColor" strokeWidth="1.5">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 15.75l5.159-5.159a2.25 2.25 0 013.182 0l5.159 5.159m-1.5-1.5l1.409-1.409a2.25 2.25 0 013.182 0l2.909 2.909m-18 3.75h16.5a1.5 1.5 0 001.5-1.5V6a1.5 1.5 0 00-1.5-1.5H3.75A1.5 1.5 0 002.25 6v12a1.5 1.5 0 001.5 1.5zm10.5-11.25h.008v.008h-.008V8.25zm.375 0a.375.375 0 11-.75 0 .375.375 0 01.75 0z" />
                  </svg>
                  <p className="text-xs font-bold text-slate-500">Chưa chọn hình ảnh/video banner</p>
                  <p className="text-[10px] text-slate-400 font-semibold max-w-[200px] mx-auto">Vui lòng nhập đường dẫn hoặc tải lên tệp tin từ máy tính để hiển thị xem trước.</p>
                </div>
              )}
            </div>
          </div>

          {/* Right Column: Fields */}
          <div className="space-y-3.5">
            <label className="block space-y-1.5">
              <span className="text-[10px] font-bold text-[#52605b] uppercase tracking-wider">Tiêu đề banner</span>
              <input className="h-9 w-full rounded-lg border border-[#dce5e1] bg-[#fbfdfc] px-3 text-xs font-semibold text-[#18211f] outline-none transition focus:border-[#0f766e] focus:bg-white" value={formTitle} onChange={(event) => setFormTitle(event.target.value)} required />
            </label>

            <ImageDropzone
              label="Hình ảnh / Video banner *"
              subLabel="Kéo &amp; thả hình ảnh banner từ thư mục máy tính vào đây hoặc click để chọn"
              aspectRatioHint="Khuyên dùng: Tỷ lệ 16:9 hoặc 21:9 ngang chuẩn Hero"
              value={formImageUrl}
              onChange={setFormImageUrl}
              required
            />

            <label className="block space-y-1.5">
              <span className="text-[10px] font-bold text-[#52605b] uppercase tracking-wider">Liên kết điều hướng khi bấm</span>
              <input className="h-9 w-full rounded-lg border border-[#dce5e1] bg-[#fbfdfc] px-3 text-xs font-semibold text-[#18211f] outline-none transition focus:border-[#0f766e] focus:bg-white" value={formLink} onChange={(event) => setFormLink(event.target.value)} />
            </label>
   
            <div className="flex items-center justify-between rounded-lg border border-[#dce5e1] bg-[#fbfdfc] p-3 shadow-sm">
              <div>
                <p className="text-xs font-bold text-[#123c34]">Trạng thái hiển thị banner</p>
                <p className="mt-0.5 text-[9px] font-semibold text-[#6b7773]">Tắt để ẩn khỏi trang chủ nhưng vẫn lưu trong admin.</p>
              </div>
              <button
                type="button"
                onClick={() => setFormActive(!formActive)}
                className={`relative h-6 w-12 rounded-full transition-colors duration-200 ${formActive ? 'bg-[#0f766e]' : 'bg-[#c9d6d1]'}`}
                aria-pressed={formActive}
              >
                <span className={`absolute top-1 h-4 w-4 rounded-full bg-white shadow-sm transition-all duration-200 ${formActive ? 'left-7' : 'left-1'}`} />
              </button>
            </div>
          </div>
        </div>

        <div className="mt-5 flex justify-end gap-2.5 border-t border-[#edf2f0] pt-3.5">
          <button type="button" onClick={onClose} className="rounded-lg border border-[#dce5e1] bg-white px-3.5 py-2 text-[10px] font-bold text-[#52605b] hover:border-[#0f766e] hover:text-[#0f766e] transition-colors">
            Hủy bỏ
          </button>
          <button type="submit" className="rounded-lg bg-[#123c34] px-3.5 py-2 text-[10px] font-bold text-white shadow transition hover:bg-[#0f766e]">
            Lưu banner
          </button>
        </div>
      </form>
    </div>
  );
}
const csvHeadersMap: Record<string, string> = {
  'ID': 'id',
  'Tiêu đề banner': 'title',
  'Đường dẫn hình ảnh hoặc video': 'imageUrl',
  'Liên kết điều hướng': 'link',
  'Hiển thị': 'isActive',
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

        const bannerItems = parsedRows.map((row) => {
          const item: any = {};
          for (const [colName, fieldKey] of Object.entries(csvHeadersMap)) {
            const val = row[colName] || '';
            if (fieldKey === 'isActive') {
              item[fieldKey] = val.toLowerCase() === 'có' || val.toLowerCase() === 'true' || val === '1' || val === '';
            } else {
              item[fieldKey] = val;
            }
          }
          return item;
        }).filter(item => item.title && item.imageUrl);

        setFileData(bannerItems);
      } catch (err: any) {
        alert('Lỗi đọc file: ' + err.message);
      }
    };
    reader.readAsText(file, 'UTF-8');
  };

  const handleDownloadTemplate = () => {
    const headers = [
      'ID',
      'Tiêu đề banner',
      'Đường dẫn hình ảnh hoặc video',
      'Liên kết điều hướng',
      'Hiển thị'
    ];

    const sampleRow = [
      '',
      'Banner HUIT ICONIC 2026',
      '/uploads/baner.jpg',
      '#about-section',
      'Có'
    ];

    const csvContent = '\uFEFF' + [headers.join(','), sampleRow.map(escapeCSVValue).join(',')].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', 'banners_import_template.csv');
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
      const res = await fetch(apiUrl('/api/admin/banners/bulk'), {
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
      setSuccessMsg(`Đã nhập thành công ${result.successCount}/${fileData.length} banner!`);
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
            <p className="text-[10px] font-black uppercase tracking-[0.18em] text-emerald-700">Nhập dữ liệu banner</p>
            <h3 className="mt-1 text-xl font-black text-slate-900">Nhập danh sách banner từ CSV</h3>
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

export default function BannersAdminPage() {
  const { showAlert, showConfirm } = useAlert();
  const [banners, setBanners] = useState<AdminBanner[]>([]);
  const [search, setSearch] = useState('');
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [selectedBanner, setSelectedBanner] = useState<AdminBanner | null>(null);
  const [formTitle, setFormTitle] = useState('');
  const [formImageUrl, setFormImageUrl] = useState('');
  const [formLink, setFormLink] = useState('');
  const [formActive, setFormActive] = useState(true);
  const [isImportModalOpen, setIsImportModalOpen] = useState(false);


  async function loadBanners() {
    try {
      const res = await fetch(apiUrl('/api/banners'));
      if (res.ok) setBanners(await res.json());
    } catch (err) {
      console.error('Failed to load banners from backend API.', err);
    }
  }

  useEffect(() => {
    loadBanners();
  }, []);

  const openAddModal = () => {
    setFormTitle('');
    setFormImageUrl('');
    setFormLink('#');
    setFormActive(true);
    setIsAddModalOpen(true);
  };

  const openEditModal = (banner: AdminBanner) => {
    setSelectedBanner(banner);
    setFormTitle(banner.title);
    setFormImageUrl(banner.imageUrl);
    setFormLink(banner.link || '');
    setFormActive(banner.isActive ?? true);
    setIsEditModalOpen(true);
  };

  const handleAddSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    try {
      const res = await fetch(apiUrl('/api/admin/banners'), {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ title: formTitle, imageUrl: formImageUrl, link: formLink, isActive: formActive }),
      });
      if (res.ok) {
        setIsAddModalOpen(false);
        alert('Thêm banner thành công!');
        loadBanners();
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleEditSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!selectedBanner) return;
    try {
      const res = await fetch(apiUrl(`/api/admin/banners/${selectedBanner.id}`), {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ title: formTitle, imageUrl: formImageUrl, link: formLink, isActive: formActive }),
      });
      if (res.ok) {
        setIsEditModalOpen(false);
        alert('Cập nhật banner thành công!');
        loadBanners();
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleDelete = async (id: string) => {
    const ok = await showConfirm('Bạn có chắc chắn muốn xóa banner này không?', 'Xác nhận xóa banner', 'error', 'Xóa ngay');
    if (!ok) return;
    try {
      const res = await fetch(apiUrl(`/api/admin/banners/${id}`), { method: 'DELETE' });
      if (res.ok) {
        showAlert('Xóa banner thành công!', 'success');
        loadBanners();
      }
    } catch (err) {
      console.error(err);
      showAlert('Đã xảy ra lỗi khi xóa banner.', 'error');
    }
  };

  const handleToggleActive = async (banner: AdminBanner) => {
    const nextActive = !(banner.isActive ?? true);
    setBanners((prev) =>
      prev.map((item) => item.id === banner.id ? { ...item, isActive: nextActive } : item)
    );

    try {
      const res = await fetch(apiUrl(`/api/admin/banners/${banner.id}`), {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ isActive: nextActive }),
      });
      if (res.ok) {
        alert(nextActive ? 'Hiển thị banner thành công!' : 'Ẩn banner thành công!');
      } else {
        alert('Thay đổi trạng thái banner thất bại!');
        loadBanners();
      }
    } catch (err) {
      console.error(err);
      alert('Thay đổi trạng thái banner thất bại!');
      loadBanners();
    }
  };

  const handleExportBanners = () => {
    const headers = [
      'ID',
      'Tiêu đề banner',
      'Đường dẫn hình ảnh hoặc video',
      'Liên kết điều hướng',
      'Hiển thị'
    ];

    const csvRows = [headers.join(',')];

    for (const b of banners) {
      const row = [
        escapeCSVValue(b.id),
        escapeCSVValue(b.title),
        escapeCSVValue(b.imageUrl),
        escapeCSVValue(b.link),
        b.isActive !== false ? 'Có' : 'Không'
      ];
      csvRows.push(row.join(','));
    }

    const csvContent = '\uFEFF' + csvRows.join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', `banners_export_${new Date().toISOString().slice(0, 10)}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const filteredBanners = banners.filter((banner) =>
    banner.title.toLowerCase().includes(search.toLowerCase())
  );
  const activeCount = banners.filter((banner) => banner.isActive !== false).length;

  return (
    <div className="space-y-4">
      <section className="flex flex-col gap-3 rounded-xl border border-[#dce5e1] bg-white p-4 shadow-sm md:flex-row md:items-center md:justify-between">
        <div>
          <p className="text-[10px] font-bold uppercase tracking-[0.16em] text-[#0f766e]">Quản lý giao diện</p>
          <h2 className="mt-0.5 text-lg font-black text-[#123c34]">Banner trang chủ</h2>
          <p className="text-xs text-[#6b7773] mt-0.5">Quản lý banner đầu trang công khai và ẩn hiện nhanh.</p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={handleExportBanners}
            className="inline-flex items-center justify-center gap-1.5 rounded-lg border border-slate-200 bg-white px-3.5 py-2 text-xs font-bold text-slate-700 shadow transition hover:border-[#0f766e] hover:text-[#0f766e] active:scale-[0.98]"
          >
            <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="2.5">
              <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
              <polyline points="17 8 12 3 7 8" />
              <line x1="12" y1="3" x2="12" y2="15" />
            </svg>
            Xuất CSV
          </button>
          <button
            onClick={() => setIsImportModalOpen(true)}
            className="inline-flex items-center justify-center gap-1.5 rounded-lg border border-slate-200 bg-white px-3.5 py-2 text-xs font-bold text-slate-700 shadow transition hover:border-[#0f766e] hover:text-[#0f766e] active:scale-[0.98]"
          >
            <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="2.5">
              <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
              <polyline points="7 10 12 15 17 10" />
              <line x1="12" y1="15" x2="12" y2="3" />
            </svg>
            Nhập CSV
          </button>
          <button onClick={openAddModal} className="inline-flex items-center justify-center gap-1.5 rounded-lg bg-[#e45136] px-3.5 py-2 text-xs font-bold text-white shadow transition hover:bg-[#c83f28] active:scale-[0.98]">
            <span className="text-lg leading-none">+</span>
            Thêm banner mới
          </button>
        </div>
      </section>

      <section className="grid grid-cols-1 gap-3.5 md:grid-cols-3">
        <div className="rounded-xl border border-[#dce5e1] bg-white p-4 shadow-sm">
          <p className="text-[10px] font-bold uppercase tracking-[0.14em] text-[#7a8b85]">Tổng số banner</p>
          <p className="mt-1 text-2xl font-black text-[#123c34]">{banners.length}</p>
        </div>
        <div className="rounded-xl border border-[#dce5e1] bg-white p-4 shadow-sm">
          <p className="text-[10px] font-bold uppercase tracking-[0.14em] text-[#7a8b85]">Đang hiển thị</p>
          <p className="mt-1 text-2xl font-black text-[#0f766e]">{activeCount}</p>
        </div>
        <div className="rounded-xl border border-[#dce5e1] bg-white p-4 shadow-sm">
          <p className="text-[10px] font-bold uppercase tracking-[0.14em] text-[#7a8b85]">Khuyên dùng</p>
          <p className="mt-1 text-sm font-black text-[#123c34]">Tỷ lệ 16:9 / 1440x768</p>
          <p className="mt-0.5 text-[10px] text-[#6b7773]">Nên dùng ảnh sắc nét để có giao diện trang chủ tốt nhất.</p>
        </div>
      </section>

      <section className="rounded-xl border border-[#dce5e1] bg-white shadow-sm overflow-hidden">
        <div className="flex flex-col gap-3 border-b border-[#edf2f0] p-3.5 md:flex-row md:items-center md:justify-between">
          <div className="relative w-full md:max-w-md">
            <svg viewBox="0 0 24 24" className="absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-[#8aa098]" fill="none" stroke="currentColor" strokeWidth="2">
              <circle cx="11" cy="11" r="7" />
              <path d="m20 20-3-3" />
            </svg>
            <input
              type="text"
              placeholder="Tìm kiếm tiêu đề banner..."
              className="h-9 w-full rounded-lg border border-[#dce5e1] bg-[#fbfdfc] pl-9 pr-3 text-xs font-semibold text-[#18211f] outline-none transition placeholder:text-[#9aa9a4] focus:border-[#0f766e] focus:bg-white"
              value={search}
              onChange={(event) => setSearch(event.target.value)}
            />
          </div>
          <p className="text-[10px] font-bold text-[#6b7773] uppercase tracking-wider">{filteredBanners.length} banner tìm thấy</p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5 p-5 bg-[#fbfdfc]">
          {filteredBanners.map((banner) => (
            <div key={banner.id} className="group relative rounded-xl border border-[#dce5e1] bg-white overflow-hidden shadow-sm hover:shadow-md transition-all duration-300 flex flex-col justify-between">
              
              {/* Image Preview Block */}
              <div className="relative aspect-[16/9] w-full bg-[#f4f7f6] border-b border-[#edf2f0] overflow-hidden flex items-center justify-center">
                {banner.imageUrl && banner.imageUrl.toLowerCase().endsWith('.mp4') ? (
                  <video src={formatAssetUrl(banner.imageUrl)} className="w-full h-full object-cover group-hover:scale-102 transition-transform duration-500" muted loop playsInline autoPlay />
                ) : (
                  <img src={formatAssetUrl(banner.imageUrl)} className="w-full h-full object-cover group-hover:scale-102 transition-transform duration-500" alt={banner.title} />
                )}
              </div>

              {/* Banner Details */}
              <div className="p-4 flex-grow flex flex-col justify-between space-y-3">
                <div className="space-y-1">
                  <h4 className="text-xs font-black text-[#123c34] line-clamp-1 group-hover:text-[#0f766e] transition-colors">{banner.title}</h4>
                  <p className="text-[10px] text-[#7a8b85] font-semibold truncate" title={banner.imageUrl}>Tệp: {banner.imageUrl}</p>
                  <p className="text-[10px] text-[#0f766e] font-bold truncate">Liên kết: {banner.link || '#'}</p>
                </div>

                {/* Actions */}
                <div className="flex gap-1.5 pt-3 border-t border-[#edf2f0]">
                  <button
                    type="button"
                    onClick={() => handleToggleActive(banner)}
                    title={banner.isActive !== false ? 'Bấm để ẩn banner khỏi trang chủ' : 'Bấm để hiển thị banner lên trang chủ'}
                    className={`rounded-lg px-2 py-1.5 text-[10px] font-bold transition flex-1 flex items-center justify-center gap-1.5 shadow-sm hover:shadow-md active:scale-[0.97] text-white ${
                      banner.isActive !== false
                        ? 'bg-emerald-600 hover:bg-emerald-700'
                        : 'bg-slate-400 hover:bg-slate-500'
                    }`}
                  >
                    <span className={`h-1.5 w-1.5 rounded-full ${banner.isActive !== false ? 'bg-emerald-200 animate-pulse' : 'bg-slate-200'}`} />
                    {banner.isActive !== false ? 'Hiện' : 'Ẩn'}
                  </button>
                  <button
                    onClick={() => openEditModal(banner)}
                    className="rounded-lg bg-blue-600 hover:bg-blue-700 px-2 py-1.5 text-[10px] font-bold text-white transition shadow-sm hover:shadow-md active:scale-[0.97] flex-1 flex items-center justify-center gap-1"
                  >
                    <svg className="w-3 h-3" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" d="m16.862 4.487 1.687-1.688a1.875 1.875 0 1 1 2.652 2.652L10.582 16.07a4.5 4.5 0 0 1-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 0 1 1.13-1.897l8.932-8.931Zm0 0L19.5 7.125M18 14v4.75A2.25 2.25 0 0 1 15.75 21H5.25A2.25 2.25 0 0 1 3 18.75V8.25A2.25 2.25 0 0 1 5.25 6H10" />
                    </svg>
                    Sửa
                  </button>
                  <button
                    onClick={() => handleDelete(banner.id)}
                    className="rounded-lg bg-rose-500 hover:bg-rose-600 px-2.5 py-1.5 text-[10px] font-bold text-white transition shadow-sm hover:shadow-md active:scale-[0.97] flex-1 flex items-center justify-center gap-1"
                  >
                    <svg className="w-3 h-3" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" d="m14.74 9-.346 9m-4.788 0L9 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 0 1-2.244 2.077H8.084a2.25 2.25 0 0 1-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 0 0-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 0 1 3.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 0 0-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 0 0-7.5 0" />
                    </svg>
                    Xóa
                  </button>
                </div>
              </div>

            </div>
          ))}
        </div>
      </section>

      {isAddModalOpen && (
        <BannerModal
          title="Thêm banner mới"
          formTitle={formTitle}
          formImageUrl={formImageUrl}
          formLink={formLink}
          formActive={formActive}
          setFormTitle={setFormTitle}
          setFormImageUrl={setFormImageUrl}
          setFormLink={setFormLink}
          setFormActive={setFormActive}
          onClose={() => setIsAddModalOpen(false)}
          onSubmit={handleAddSubmit}
        />
      )}

      {isEditModalOpen && (
        <BannerModal
          title="Chỉnh sửa banner"
          formTitle={formTitle}
          formImageUrl={formImageUrl}
          formLink={formLink}
          formActive={formActive}
          setFormTitle={setFormTitle}
          setFormImageUrl={setFormImageUrl}
          setFormLink={setFormLink}
          setFormActive={setFormActive}
          onClose={() => setIsEditModalOpen(false)}
          onSubmit={handleEditSubmit}
        />
      )}

      {isImportModalOpen && (
        <ImportModal
          onClose={() => setIsImportModalOpen(false)}
          onSuccess={() => {
            loadBanners();
          }}
        />
      )}
    </div>
  );
}