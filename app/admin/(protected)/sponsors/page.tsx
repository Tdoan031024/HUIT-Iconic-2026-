'use client';

import React, { useState, useEffect, useRef } from 'react';
import { Sponsor } from '@/lib/types';
import { apiUrl, formatAssetUrl } from '../../api';
import { useAlert } from '../../AlertProvider';
import ImageDropzone from '../../components/ImageDropzone';

const TIER_COLORS = {
  PLATINUM: 'bg-indigo-50 text-indigo-700 border-indigo-200',
  GOLD: 'bg-amber-50 text-amber-700 border-amber-200',
  SILVER: 'bg-slate-50 text-slate-700 border-slate-200',
  PARTNER: 'bg-teal-50 text-teal-700 border-teal-200',
};

function DetailModal({
  sponsor,
  onClose,
}: {
  sponsor: Sponsor;
  onClose: () => void;
}) {
  const labelText = 'text-[9px] font-black uppercase tracking-[0.14em] text-slate-400';
  const valText = 'text-xs font-bold text-slate-800 mt-1';
  const TIER_LABELS: Record<string, string> = {
    PLATINUM: 'PLATINUM (Bạch Kim)',
    GOLD: 'GOLD (Vàng)',
    SILVER: 'SILVER (Bạc)',
    PARTNER: 'PARTNER (Đối tác)',
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-950/55 p-4 backdrop-blur-sm" onMouseDown={(event) => event.target === event.currentTarget && onClose()}>
      <div onMouseDown={(event) => event.stopPropagation()} className="mx-auto my-12 w-full max-w-xl rounded-2xl border border-slate-200 bg-white p-6 shadow-2xl animate-in fade-in zoom-in duration-200">
        <div className="flex items-start justify-between gap-4 border-b border-slate-100 pb-4">
          <div className="flex items-center gap-3">
            <div className="bg-white p-1.5 rounded-lg border border-slate-200 flex items-center justify-center w-20 h-12 overflow-hidden shadow">
              <img src={formatAssetUrl(sponsor.logoUrl)} className="max-w-full max-h-full object-contain" alt={sponsor.name} />
            </div>
            <div>
              <p className="text-[10px] font-black uppercase tracking-[0.18em] text-emerald-700">Chi tiết đối tác</p>
              <h3 className="text-base font-black text-slate-900">{sponsor.name}</h3>
            </div>
          </div>
          <button type="button" onClick={onClose} className="rounded-lg border border-slate-200 px-3 py-1.5 text-xs font-bold text-slate-600 hover:border-emerald-600 hover:text-emerald-700">
            Đóng
          </button>
        </div>

        <div className="mt-5 grid grid-cols-2 gap-4">
          <div className="rounded-xl border border-slate-100 bg-slate-50/50 p-3 col-span-2">
            <p className={labelText}>ID Đối tác / Nhà tài trợ</p>
            <p className="text-[11px] font-mono font-bold text-slate-700 mt-1">{sponsor.id}</p>
          </div>

          <div className="rounded-xl border border-slate-100 bg-slate-50/50 p-3 col-span-2 sm:col-span-1">
            <p className={labelText}>Tên đối tác / Nhà tài trợ</p>
            <p className={valText}>{sponsor.name}</p>
          </div>

          <div className="rounded-xl border border-slate-100 bg-slate-50/50 p-3 col-span-2 sm:col-span-1">
            <p className={labelText}>Phân hạng (Tier)</p>
            <span className={`inline-block mt-2 rounded-full border px-2.5 py-0.5 text-[10px] font-bold ${sponsor.tier === 'PLATINUM' ? 'border-indigo-200 bg-indigo-50 text-indigo-700' :
              sponsor.tier === 'GOLD' ? 'border-amber-200 bg-amber-50 text-amber-700' :
                sponsor.tier === 'SILVER' ? 'border-slate-200 bg-slate-50 text-slate-700' :
                  'border-teal-200 bg-teal-50 text-teal-700'
              }`}>
              {TIER_LABELS[sponsor.tier] || sponsor.tier}
            </span>
          </div>

          <div className="rounded-xl border border-slate-100 bg-slate-50/50 p-3 col-span-2 sm:col-span-1">
            <p className={labelText}>Người liên hệ đại diện</p>
            <p className={valText}>{sponsor.contactPerson || 'Chưa cập nhật'}</p>
          </div>

          <div className="rounded-xl border border-slate-100 bg-slate-50/50 p-3 col-span-2 sm:col-span-1">
            <p className={labelText}>Số điện thoại</p>
            <p className={valText}>{sponsor.phone || 'Chưa cập nhật'}</p>
          </div>

          <div className="rounded-xl border border-slate-100 bg-slate-50/50 p-3 col-span-2 sm:col-span-1">
            <p className={labelText}>Email liên hệ</p>
            <p className={valText}>{sponsor.email || 'Chưa cập nhật'}</p>
          </div>

          <div className="rounded-xl border border-slate-100 bg-slate-50/50 p-3 col-span-2 sm:col-span-1">
            <p className={labelText}>Website liên kết</p>
            <p className="text-xs font-bold text-slate-800 mt-1">
              {sponsor.websiteUrl ? (
                <a href={sponsor.websiteUrl} target="_blank" rel="noopener noreferrer" className="text-emerald-700 hover:underline inline-flex items-center gap-1">
                  {sponsor.websiteUrl}
                  <svg viewBox="0 0 24 24" className="h-3 w-3" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6" />
                    <polyline points="15 3 21 3 21 9" />
                    <line x1="10" y1="14" x2="21" y2="3" />
                  </svg>
                </a>
              ) : 'Chưa cập nhật'}
            </p>
          </div>

          <div className="rounded-xl border border-slate-100 bg-slate-50/50 p-3 col-span-2">
            <p className={labelText}>Giới thiệu / Mô tả đối tác (Tiếng Việt)</p>
            <p className="text-xs font-semibold text-slate-600 mt-1 whitespace-pre-wrap leading-relaxed">
              {sponsor.description || 'Chưa có thông tin giới thiệu chi tiết.'}
            </p>
          </div>

          {sponsor.descriptionEn && (
            <div className="rounded-xl border border-slate-100 bg-slate-50/50 p-3 col-span-2">
              <p className={labelText}>Giới thiệu / Mô tả đối tác tiếng Anh (English Description)</p>
              <p className="text-xs font-semibold text-slate-600 mt-1 whitespace-pre-wrap leading-relaxed">
                {sponsor.descriptionEn}
              </p>
            </div>
          )}
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

export default function SponsorsAdminPage() {
  const { showAlert, showConfirm } = useAlert();
  const [sponsors, setSponsors] = useState<Sponsor[]>([]);
  const [search, setSearch] = useState('');
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [hideSponsorBanner, setHideSponsorBanner] = useState<boolean>(false);
  const [savingToggle, setSavingToggle] = useState<boolean>(false);

  // View Mode & Column Controls
  const [viewMode, setViewMode] = useState<'table' | 'grid'>('table');
  const [gridCols, setGridCols] = useState<number>(4);
  const [isViewConfigOpen, setIsViewConfigOpen] = useState(false);
  const viewConfigRef = useRef<HTMLDivElement>(null);
  const [visibleColumns, setVisibleColumns] = useState({
    select: true,
    logo: true,
    name: true,
    tier: true,
    actions: true,
  });
  const [sortBy, setSortBy] = useState<'name' | 'tier'>('name');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc');

  useEffect(() => {
    setSelectedIds([]);
  }, [search]);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (viewConfigRef.current && !viewConfigRef.current.contains(event.target as Node)) {
        setIsViewConfigOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Modals state
  const [modalMode, setModalMode] = useState<'add' | 'edit' | 'detail' | null>(null);
  const [selectedSponsor, setSelectedSponsor] = useState<Sponsor | null>(null);

  // Form fields state
  const [formName, setFormName] = useState('');
  const [formTier, setFormTier] = useState<Sponsor['tier']>('PLATINUM');
  const [formLogoUrl, setFormLogoUrl] = useState('');
  const [formDescription, setFormDescription] = useState('');
  const [formDescriptionEn, setFormDescriptionEn] = useState('');
  const [formWebsiteUrl, setFormWebsiteUrl] = useState('');
  const [formEmail, setFormEmail] = useState('');
  const [formPhone, setFormPhone] = useState('');
  const [formContactPerson, setFormContactPerson] = useState('');

  const loadFromApi = async () => {
    try {
      const [spRes, setRes] = await Promise.all([
        fetch(apiUrl('/api/sponsors')),
        fetch(apiUrl('/api/public-settings')),
      ]);
      if (spRes.ok) {
        const data = await spRes.json();
        setSponsors(data);
      }
      if (setRes.ok) {
        const setData = await setRes.json();
        setHideSponsorBanner(!!setData.hideSponsorBanner);
      }
    } catch (e) {
      console.log('Lỗi tải danh sách nhà tài trợ:', e);
      setSponsors([]);
    }
  };

  const handleToggleHideSponsorBanner = async () => {
    const nextVal = !hideSponsorBanner;
    setSavingToggle(true);
    try {
      const res = await fetch(apiUrl('/api/admin/settings'), {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ hideSponsorBanner: nextVal }),
      });
      if (res.ok) {
        setHideSponsorBanner(nextVal);
      } else {
        alert('Cập nhật trạng thái ẩn banner thất bại.');
      }
    } catch (err) {
      console.error(err);
      alert('Không thể kết nối đến máy chủ.');
    } finally {
      setSavingToggle(false);
    }
  };

  useEffect(() => {
    loadFromApi();
  }, []);

  const openAddModal = () => {
    setFormName('');
    setFormTier('PLATINUM');
    setFormLogoUrl('');
    setFormDescription('');
    setFormDescriptionEn('');
    setFormWebsiteUrl('');
    setFormEmail('');
    setFormPhone('');
    setFormContactPerson('');
    setModalMode('add');
  };

  const openEditModal = (s: Sponsor) => {
    setSelectedSponsor(s);
    setFormName(s.name);
    setFormTier(s.tier);
    setFormLogoUrl(s.logoUrl);
    setFormDescription(s.description || '');
    setFormDescriptionEn(s.descriptionEn || '');
    setFormWebsiteUrl(s.websiteUrl || '');
    setFormEmail(s.email || '');
    setFormPhone(s.phone || '');
    setFormContactPerson(s.contactPerson || '');
    setModalMode('edit');
  };

  const openDetailModal = (s: Sponsor) => {
    setSelectedSponsor(s);
    setModalMode('detail');
  };

  const handleAddSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const newSponsor: Partial<Sponsor> = {
      name: formName,
      tier: formTier,
      logoUrl: formLogoUrl,
      description: formDescription || undefined,
      descriptionEn: formDescriptionEn || undefined,
      websiteUrl: formWebsiteUrl || undefined,
      email: formEmail || undefined,
      phone: formPhone || undefined,
      contactPerson: formContactPerson || undefined,
    };

    try {
      const res = await fetch(apiUrl('/api/admin/sponsors'), {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newSponsor),
      });
      if (res.ok) {
        setModalMode(null);
        showAlert('Thêm nhà tài trợ thành công!', 'success');
        loadFromApi();
        return;
      } else {
        const data = await res.json().catch(() => ({}));
        showAlert(data.error || 'Thêm nhà tài trợ thất bại.', 'error');
        return;
      }
    } catch (err: any) {
      console.error(err);
      showAlert(err?.message || 'Không thể kết nối đến server để thêm nhà tài trợ.', 'error');
      return;
    }
  };

  const handleEditSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedSponsor) return;

    const fieldsToUpdate: Partial<Sponsor> = {
      name: formName,
      tier: formTier,
      logoUrl: formLogoUrl,
      description: formDescription || '',
      descriptionEn: formDescriptionEn || '',
      websiteUrl: formWebsiteUrl || '',
      email: formEmail || '',
      phone: formPhone || '',
      contactPerson: formContactPerson || '',
    };

    try {
      let res = await fetch(apiUrl(`/api/admin/sponsors/${selectedSponsor.id}`), {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(fieldsToUpdate),
      });
      // Fallback to POST if server/cPanel proxy rejects PUT
      if (!res.ok && (res.status === 405 || res.status === 403)) {
        res = await fetch(apiUrl(`/api/admin/sponsors/${selectedSponsor.id}`), {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(fieldsToUpdate),
        });
      }
      if (res.ok) {
        setModalMode(null);
        showAlert('Cập nhật nhà tài trợ thành công!', 'success');
        loadFromApi();
        return;
      } else {
        const data = await res.json().catch(() => ({}));
        showAlert(data.error || 'Cập nhật nhà tài trợ thất bại.', 'error');
        return;
      }
    } catch (err: any) {
      console.error(err);
      showAlert(err?.message || 'Không thể kết nối đến server để cập nhật nhà tài trợ.', 'error');
      return;
    }
  };

  const handleDelete = async (id: string) => {
    const ok = await showConfirm('Bạn có chắc chắn muốn xóa nhà tài trợ này không? Hành động này không thể hoàn tác.', 'Xác nhận xóa nhà tài trợ', 'error', 'Xóa ngay');
    if (!ok) return;

    try {
      let res = await fetch(apiUrl(`/api/admin/sponsors/${id}`), {
        method: 'DELETE',
      });
      // Fallback to POST if server blocks DELETE
      if (!res.ok && (res.status === 405 || res.status === 403)) {
        res = await fetch(apiUrl(`/api/admin/sponsors/${id}?_method=DELETE`), {
          method: 'POST',
        });
      }
      if (res.ok) {
        showAlert('Xóa nhà tài trợ thành công!', 'success');
        loadFromApi();
        return;
      } else {
        const data = await res.json().catch(() => ({}));
        showAlert(data.error || 'Xóa nhà tài trợ thất bại.', 'error');
        return;
      }
    } catch (err: any) {
      console.error(err);
      showAlert(err?.message || 'Không thể kết nối đến server để xóa nhà tài trợ.', 'error');
      return;
    }
  };

  const handleBulkDelete = async () => {
    if (selectedIds.length === 0) return;
    const ok = await showConfirm(`Bạn có chắc chắn muốn xóa ${selectedIds.length} nhà tài trợ đã chọn? Hành động này không thể hoàn tác.`, 'Xác nhận xóa hàng loạt', 'error', `Xóa ${selectedIds.length} nhà tài trợ`);
    if (!ok) return;

    let successCount = 0;
    let failCount = 0;

    await Promise.all(
      selectedIds.map(async (id) => {
        try {
          const res = await fetch(apiUrl(`/api/admin/sponsors/${id}`), { method: 'DELETE' });
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

    showAlert(`Đã xóa thành công ${successCount} nhà tài trợ.${failCount > 0 ? ` Thất bại ${failCount} nhà tài trợ.` : ''}`, failCount === 0 ? 'success' : 'warning');
    if (successCount > 0) {
      loadFromApi();
    }
    setSelectedIds([]);
  };

  const filteredSponsors = sponsors.filter(s =>
    s.name.toLowerCase().includes(search.toLowerCase()) || s.tier.toLowerCase().includes(search.toLowerCase())
  );

  const sortedSponsors = [...filteredSponsors].sort((a, b) => {
    let valA = a[sortBy] || '';
    let valB = b[sortBy] || '';
    if (sortOrder === 'asc') return valA.localeCompare(valB);
    return valB.localeCompare(valA);
  });

  return (
    <div className="flex flex-col space-y-4">

      {/* Title Header & Banner Toggle Combined on One Row */}
      <div className="flex flex-col xl:flex-row xl:items-center xl:justify-between gap-3.5 rounded-xl border border-[#dce5e1] bg-white p-3.5 sm:p-4 shadow-sm">
        {/* Left: Title & Subtitle */}
        <div className="shrink-0">
          <p className="text-[10px] font-bold uppercase tracking-[0.16em] text-[#0f766e]">Quản lý đối tác</p>
          <h1 className="text-lg font-black text-[#123c34]">Nhà tài trợ & Đối tác</h1>
          <p className="text-xs text-[#6b7773] mt-0.5">Danh sách nhà tài trợ và đối tác đồng hành cùng HUIT&apos;s ICONIC 2026.</p>
        </div>

        {/* Right: Controls (Toggle Banner & Add Button) on one row */}
        <div className="flex flex-wrap items-center gap-3">
          {/* Banner Toggle Pill */}
          <div
            className="flex items-center gap-2.5 px-3 py-2 rounded-xl border border-slate-200 bg-slate-50/80 hover:bg-slate-50 transition"
            title="Kích hoạt nút này để Bật hoặc Ẩn toàn bộ phần banner và logo chạy ngang nhà tài trợ ngoài trang chủ công khai."
          >
            <span className="text-base shrink-0">{hideSponsorBanner ? '🙈' : '👁️'}</span>
            <div className="flex items-center gap-1.5 text-xs">
              <span className="font-extrabold text-slate-800 whitespace-nowrap">
                Banner & Logo Trang chủ:
              </span>
              <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold whitespace-nowrap ${
                hideSponsorBanner
                  ? 'bg-rose-50 text-rose-600 border border-rose-200'
                  : 'bg-emerald-50 text-emerald-700 border border-emerald-200'
              }`}>
                {hideSponsorBanner ? 'ĐANG ẨN' : 'ĐANG HIỂN THỊ'}
              </span>
            </div>
            <button
              type="button"
              disabled={savingToggle}
              onClick={handleToggleHideSponsorBanner}
              className={`relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none disabled:opacity-50 ${
                !hideSponsorBanner ? 'bg-emerald-600' : 'bg-slate-300'
              }`}
              title={hideSponsorBanner ? 'Hiện banner nhà tài trợ' : 'Ẩn banner nhà tài trợ'}
            >
              <span
                className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${
                  !hideSponsorBanner ? 'translate-x-5' : 'translate-x-0'
                }`}
              />
            </button>
          </div>

          {/* Add Sponsor Button */}
          <button
            onClick={openAddModal}
            className="px-4 py-2.5 bg-emerald-700 hover:bg-emerald-800 rounded-xl text-white font-extrabold text-xs shadow transition active:scale-[0.98] whitespace-nowrap shrink-0 flex items-center gap-1.5"
          >
            <span>+</span> Thêm nhà tài trợ mới
          </button>
        </div>
      </div>

      {/* Controls Bar: Search + Popover View Config Button */}
      <div className="flex flex-wrap items-center justify-between gap-3 bg-white p-3.5 rounded-xl border border-slate-200 shadow-sm">
        {/* Search Input (Short & Compact) */}
        <div className="w-full sm:w-[280px] relative shrink-0">
          <input
            type="text"
            placeholder="Tìm kiếm nhà tài trợ..."
            className="w-full h-9 pl-9 pr-3 rounded-xl bg-slate-50 border border-slate-200 text-xs font-semibold text-slate-800 focus:outline-none focus:border-emerald-600 focus:bg-white transition"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
          <span className="absolute left-3 top-2.5 text-slate-400 text-xs">🔍</span>
        </div>

        {/* Right: Single View Config Popover Button & Modal Dropdown */}
        <div className="relative shrink-0" ref={viewConfigRef}>
          <button
            type="button"
            onClick={() => setIsViewConfigOpen(!isViewConfigOpen)}
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
              {viewMode === 'table' ? '📋 Bảng' : `🔲 Thẻ (${gridCols})`}
            </span>
            <svg viewBox="0 0 24 24" className={`h-3.5 w-3.5 text-slate-400 transition-transform duration-200 ${isViewConfigOpen ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" strokeWidth="2.5"><polyline points="6 9 12 15 18 9" /></svg>
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
                    className={`flex items-center justify-center gap-1.5 p-2 rounded-xl text-xs font-bold border transition ${viewMode === 'table' ? 'bg-blue-50 border-blue-300 text-blue-700 font-extrabold shadow-sm' : 'bg-slate-50 border-slate-200 text-slate-600 hover:bg-slate-100'
                      }`}
                  >
                    📋 Bảng
                  </button>
                  <button
                    type="button"
                    onClick={() => setViewMode('grid')}
                    className={`flex items-center justify-center gap-1.5 p-2 rounded-xl text-xs font-bold border transition ${viewMode === 'grid' ? 'bg-blue-50 border-blue-300 text-blue-700 font-extrabold shadow-sm' : 'bg-slate-50 border-slate-200 text-slate-600 hover:bg-slate-100'
                      }`}
                  >
                    🔲 Thẻ
                  </button>
                </div>
              </div>

              {/* 2. Cấu hình số ô vuông nếu dạng Thẻ */}
              {viewMode === 'grid' && (
                <div>
                  <p className="text-[11px] font-black uppercase tracking-wider text-slate-400 mb-2">Số ô vuông 1 hàng</p>
                  <div className="grid grid-cols-4 gap-1.5">
                    {[2, 3, 4, 6].map((num) => (
                      <button
                        key={num}
                        type="button"
                        onClick={() => setGridCols(num)}
                        className={`py-1.5 rounded-lg text-xs font-bold border text-center transition ${gridCols === num ? 'bg-blue-600 text-white border-blue-600 shadow-sm' : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
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
                      <input type="checkbox" checked={visibleColumns.logo} onChange={(e) => setVisibleColumns({ ...visibleColumns, logo: e.target.checked })} className="rounded text-blue-600" />
                      Cột Logo nhà tài trợ
                    </label>
                    <label className="flex items-center gap-2 text-xs font-semibold text-slate-700 cursor-pointer">
                      <input type="checkbox" checked={visibleColumns.name} onChange={(e) => setVisibleColumns({ ...visibleColumns, name: e.target.checked })} className="rounded text-blue-600" />
                      Cột Tên nhà tài trợ
                    </label>
                    <label className="flex items-center gap-2 text-xs font-semibold text-slate-700 cursor-pointer">
                      <input type="checkbox" checked={visibleColumns.tier} onChange={(e) => setVisibleColumns({ ...visibleColumns, tier: e.target.checked })} className="rounded text-blue-600" />
                      Cột Phân hạng đối tác
                    </label>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* TABLE VIEW */}
      {viewMode === 'table' && (
        <div className="w-full bg-white border border-[#dce5e1] rounded-xl overflow-hidden shadow-sm">
          {selectedIds.length > 0 && (
            <div className="flex items-center justify-between border-b border-rose-100 bg-rose-50/60 px-5 py-3 backdrop-blur-sm transition-all duration-300">
              <span className="text-xs font-bold text-rose-700">
                Đã chọn <b className="text-[14px]">{selectedIds.length}</b> nhà tài trợ
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
          <table className="w-full border-collapse text-left text-[#18211f]">
            <thead className="bg-[#fbfdfc] text-[12px] font-bold text-slate-700 border-b border-[#edf2f0]">
              <tr>
                <th className="px-5 py-3 w-10">
                  <input
                    type="checkbox"
                    checked={sortedSponsors.length > 0 && selectedIds.length === sortedSponsors.length}
                    onChange={(e) => {
                      if (e.target.checked) {
                        setSelectedIds(sortedSponsors.map((s) => s.id));
                      } else {
                        setSelectedIds([]);
                      }
                    }}
                    className="rounded border-slate-300 text-teal-600 focus:ring-teal-500 cursor-pointer"
                  />
                </th>
                {visibleColumns.logo && <th className="px-5 py-3">Logo</th>}
                {visibleColumns.name && (
                  <th
                    className="px-5 py-3 min-w-[220px] cursor-pointer hover:text-slate-900 transition select-none"
                    onClick={() => {
                      setSortBy('name');
                      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
                    }}
                  >
                    Tên nhà tài trợ {sortBy === 'name' ? (sortOrder === 'asc' ? '↑' : '↓') : ''}
                  </th>
                )}
                {visibleColumns.tier && (
                  <th
                    className="px-5 py-3 cursor-pointer hover:text-slate-900 transition select-none"
                    onClick={() => {
                      setSortBy('tier');
                      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
                    }}
                  >
                    Hạng tài trợ {sortBy === 'tier' ? (sortOrder === 'asc' ? '↑' : '↓') : ''}
                  </th>
                )}
                {visibleColumns.actions && <th className="px-5 py-3 text-center">Thao tác</th>}
              </tr>
            </thead>
            <tbody className="divide-y divide-[#edf2f0] text-xs">
              {sortedSponsors.map((s) => (
                <tr key={s.id} className="hover:bg-[#edf4f1]/20 transition-colors">
                  <td className="px-5 py-2.5 w-10">
                    <input
                      type="checkbox"
                      checked={selectedIds.includes(s.id)}
                      onChange={(e) => {
                        if (e.target.checked) {
                          setSelectedIds([...selectedIds, s.id]);
                        } else {
                          setSelectedIds(selectedIds.filter((id) => id !== s.id));
                        }
                      }}
                      className="rounded border-slate-300 text-teal-600 focus:ring-teal-500 cursor-pointer"
                    />
                  </td>
                  {visibleColumns.logo && (
                    <td className="px-5 py-2.5">
                      <div className="bg-white p-1 rounded-lg border border-[#dce5e1] flex items-center justify-center w-16 h-9 overflow-hidden shadow-sm">
                        <img src={formatAssetUrl(s.logoUrl)} className="max-w-full max-h-full object-contain cursor-pointer" alt={s.name} />
                      </div>
                    </td>
                  )}
                  {visibleColumns.name && (
                    <td className="px-5 py-2.5 font-bold text-[#123c34] whitespace-nowrap">{s.name}</td>
                  )}
                  {visibleColumns.tier && (
                    <td className="px-5 py-2.5">
                      <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold border ${TIER_COLORS[s.tier] || TIER_COLORS.PARTNER}`}>
                        {s.tier}
                      </span>
                    </td>
                  )}
                  {visibleColumns.actions && (
                    <td className="px-5 py-2.5">
                      <div className="flex items-center justify-center gap-1.5">
                        <button
                          type="button"
                          onClick={() => openDetailModal(s)}
                          className="grid h-7 w-7 place-items-center rounded-md border border-slate-200 bg-white text-slate-500 hover:border-sky-300 hover:bg-sky-50 hover:text-sky-700 transition"
                          title="Xem chi tiết"
                        >
                          👁️
                        </button>
                        <button
                          type="button"
                          onClick={() => openEditModal(s)}
                          className="grid h-7 w-7 place-items-center rounded-md border border-emerald-200 bg-emerald-50 text-emerald-700 hover:border-emerald-400 hover:bg-emerald-100 transition"
                          title="Chỉnh sửa"
                        >
                          ✏️
                        </button>
                        <button
                          type="button"
                          onClick={() => handleDelete(s.id)}
                          className="grid h-7 w-7 place-items-center rounded-md border border-red-200 bg-red-50 text-red-600 hover:border-red-400 hover:bg-red-100 transition"
                          title="Xóa đối tác"
                        >
                          🗑️
                        </button>
                      </div>
                    </td>
                  )}
                </tr>
              ))}
              {sortedSponsors.length === 0 && (
                <tr>
                  <td colSpan={5} className="px-5 py-10 text-center text-sm font-semibold text-[#7a8b85]">
                    Chưa có nhà tài trợ nào phù hợp bộ lọc.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      )}

      {/* GRID CARD VIEW */}
      {viewMode === 'grid' && (
        <div className={`grid gap-4 ${gridCols === 2 ? 'grid-cols-1 sm:grid-cols-2' :
          gridCols === 3 ? 'grid-cols-1 sm:grid-cols-2 md:grid-cols-3' :
            gridCols === 6 ? 'grid-cols-2 sm:grid-cols-3 md:grid-cols-6' :
              'grid-cols-1 sm:grid-cols-2 md:grid-cols-4'
          }`}>
          {sortedSponsors.map((s) => (
            <div key={s.id} className="bg-white border border-slate-200 rounded-2xl p-4 shadow-sm hover:shadow-md transition flex flex-col justify-between space-y-3 group">
              <div className="flex items-center justify-between">
                <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold border ${TIER_COLORS[s.tier] || TIER_COLORS.PARTNER}`}>
                  {s.tier}
                </span>
                <div className="flex items-center gap-1">
                  <button onClick={() => openEditModal(s)} className="p-1 rounded-md text-emerald-700 hover:bg-emerald-50 text-xs">✏️</button>
                  <button onClick={() => handleDelete(s.id)} className="p-1 rounded-md text-rose-600 hover:bg-rose-50 text-xs">🗑️</button>
                </div>
              </div>
              <div className="flex flex-col items-center text-center space-y-2 py-2">
                <div className="w-28 h-16 rounded-xl border border-slate-200 bg-slate-50 p-2 flex items-center justify-center overflow-hidden">
                  <img src={formatAssetUrl(s.logoUrl)} className="max-h-full max-w-full object-contain cursor-pointer" alt={s.name} />
                </div>
                <h3 className="font-extrabold text-slate-900 text-xs leading-snug">{s.name}</h3>
              </div>
              <div className="pt-2 border-t border-slate-100 flex justify-end">
                <button
                  type="button"
                  onClick={() => openDetailModal(s)}
                  className="text-[11px] font-bold text-sky-700 hover:underline"
                >
                  Xem chi tiết →
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* ADD SPONSOR MODAL */}
      {modalMode === 'add' && (
        <div className="fixed inset-0 bg-slate-950/60 flex items-center justify-center p-2 sm:p-4 z-50 backdrop-blur-sm overflow-hidden" onMouseDown={(event) => event.target === event.currentTarget && setModalMode(null)}>
          <form onSubmit={handleAddSubmit} onMouseDown={(event) => event.stopPropagation()} className="bg-white border border-slate-200 rounded-2xl w-full max-w-xl max-h-[92vh] flex flex-col shadow-2xl animate-in fade-in zoom-in duration-200 overflow-hidden">
            {/* Modal Header */}
            <div className="flex items-center justify-between border-b border-slate-100 px-6 py-3.5 shrink-0 bg-white">
              <div>
                <span className="px-2.5 py-0.5 rounded-full bg-emerald-50 text-emerald-700 text-[10px] font-black uppercase tracking-wider border border-emerald-200">
                  THÊM MỚI ĐỐI TÁC
                </span>
                <h3 className="text-base font-black text-slate-900 mt-0.5">Thêm nhà tài trợ mới</h3>
              </div>
              <button
                type="button"
                onClick={() => setModalMode(null)}
                className="grid h-8 w-8 place-items-center rounded-lg border border-slate-200 text-slate-400 hover:border-rose-300 hover:bg-rose-50 hover:text-rose-600 transition"
              >
                ✕
              </button>
            </div>

            {/* Modal Body (Scrollable) */}
            <div className="flex-1 overflow-y-auto px-6 py-4 space-y-3.5 text-xs">
              {/* Image Dropzone Component */}
              <ImageDropzone
                label="Logo nhà tài trợ / Đối tác"
                subLabel="Kéo & thả logo trực tiếp từ máy tính hoặc click để chọn"
                aspectRatioHint="Khuyên dùng: Ảnh PNG nền trong suốt, SVG hoặc JPG sắc nét"
                value={formLogoUrl}
                onChange={setFormLogoUrl}
                compact
                required
              />

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
                <div className="flex flex-col space-y-1">
                  <label className="text-[10px] font-bold text-slate-600 uppercase tracking-wider">Tên nhà tài trợ *</label>
                  <input type="text" className="h-9 px-3 rounded-lg bg-slate-50 border border-slate-200 text-slate-800 focus:outline-none focus:border-emerald-600 focus:bg-white text-xs font-semibold transition" value={formName} onChange={e => setFormName(e.target.value)} placeholder="Nhập tên nhà tài trợ / thương hiệu" required />
                </div>

                <div className="flex flex-col space-y-1">
                  <label className="text-[10px] font-bold text-slate-600 uppercase tracking-wider">Phân hạng (Tier) *</label>
                  <select
                    className="h-9 px-3 rounded-lg bg-slate-50 border border-slate-200 text-slate-800 focus:outline-none focus:border-emerald-600 focus:bg-white text-xs font-semibold cursor-pointer transition"
                    value={formTier}
                    onChange={e => setFormTier(e.target.value as Sponsor['tier'])}
                  >
                    <option value="PLATINUM">PLATINUM (Bạch Kim)</option>
                    <option value="GOLD">GOLD (Vàng)</option>
                    <option value="SILVER">SILVER (Bạc)</option>
                    <option value="PARTNER">PARTNER (Đối tác)</option>
                  </select>
                </div>

                <div className="flex flex-col space-y-1">
                  <label className="text-[10px] font-bold text-slate-600 uppercase tracking-wider">Người liên hệ đại diện</label>
                  <input type="text" className="h-9 px-3 rounded-lg bg-slate-50 border border-slate-200 text-slate-800 focus:outline-none focus:border-emerald-600 focus:bg-white text-xs font-semibold transition" value={formContactPerson} onChange={e => setFormContactPerson(e.target.value)} placeholder="Họ và tên người đại diện" />
                </div>

                <div className="flex flex-col space-y-1">
                  <label className="text-[10px] font-bold text-slate-600 uppercase tracking-wider">Số điện thoại liên hệ</label>
                  <input type="tel" className="h-9 px-3 rounded-lg bg-slate-50 border border-slate-200 text-slate-800 focus:outline-none focus:border-emerald-600 focus:bg-white text-xs font-semibold transition" value={formPhone} onChange={e => setFormPhone(e.target.value)} placeholder="VD: 0912345678" />
                </div>

                <div className="flex flex-col space-y-1">
                  <label className="text-[10px] font-bold text-slate-600 uppercase tracking-wider">Email liên hệ</label>
                  <input type="email" className="h-9 px-3 rounded-lg bg-slate-50 border border-slate-200 text-slate-800 focus:outline-none focus:border-emerald-600 focus:bg-white text-xs font-semibold transition" value={formEmail} onChange={e => setFormEmail(e.target.value)} placeholder="email@domain.com" />
                </div>

                <div className="flex flex-col space-y-1">
                  <label className="text-[10px] font-bold text-slate-600 uppercase tracking-wider">Website liên kết (URL)</label>
                  <input type="url" className="h-9 px-3 rounded-lg bg-slate-50 border border-slate-200 text-slate-800 focus:outline-none focus:border-emerald-600 focus:bg-white text-xs font-semibold transition" value={formWebsiteUrl} onChange={e => setFormWebsiteUrl(e.target.value)} placeholder="https://example.com" />
                </div>

                <div className="flex flex-col space-y-1 sm:col-span-2">
                  <label className="text-[10px] font-bold text-slate-600 uppercase tracking-wider">Mô tả / Giới thiệu đối tác (Tiếng Việt)</label>
                  <textarea rows={2} className="px-3 py-2 rounded-lg bg-slate-50 border border-slate-200 text-slate-800 focus:outline-none focus:border-emerald-600 focus:bg-white text-xs font-semibold resize-none transition" value={formDescription} onChange={e => setFormDescription(e.target.value)} placeholder="Nhập thông tin giới thiệu ngắn về nhà tài trợ..." />
                </div>

                <div className="flex flex-col space-y-1 sm:col-span-2">
                  <label className="text-[10px] font-bold text-slate-600 uppercase tracking-wider">Mô tả / Giới thiệu đối tác tiếng Anh (English Description)</label>
                  <textarea rows={2} className="px-3 py-2 rounded-lg bg-slate-50 border border-slate-200 text-slate-800 focus:outline-none focus:border-emerald-600 focus:bg-white text-xs font-semibold resize-none transition" value={formDescriptionEn} onChange={e => setFormDescriptionEn(e.target.value)} placeholder="English introduction about the sponsor..." />
                </div>
              </div>
            </div>

            {/* Modal Footer */}
            <div className="flex items-center justify-end gap-2.5 px-6 py-3 border-t border-slate-100 bg-slate-50/80 shrink-0">
              <button type="button" onClick={() => setModalMode(null)} className="px-4 py-2 border border-slate-200 hover:bg-slate-100 rounded-xl text-slate-600 text-xs font-bold transition">Hủy bỏ</button>
              <button type="submit" className="px-5 py-2 bg-emerald-700 hover:bg-emerald-800 rounded-xl text-white text-xs font-extrabold shadow transition">Thêm đối tác</button>
            </div>
          </form>
        </div>
      )}

      {/* EDIT SPONSOR MODAL */}
      {modalMode === 'edit' && (
        <div className="fixed inset-0 bg-slate-950/60 flex items-center justify-center p-2 sm:p-4 z-50 backdrop-blur-sm overflow-hidden" onMouseDown={(event) => event.target === event.currentTarget && setModalMode(null)}>
          <form onSubmit={handleEditSubmit} onMouseDown={(event) => event.stopPropagation()} className="bg-white border border-slate-200 rounded-2xl w-full max-w-xl max-h-[92vh] flex flex-col shadow-2xl animate-in fade-in zoom-in duration-200 overflow-hidden">
            {/* Modal Header */}
            <div className="flex items-center justify-between border-b border-slate-100 px-6 py-3.5 shrink-0 bg-white">
              <div>
                <span className="px-2.5 py-0.5 rounded-full bg-sky-50 text-sky-700 text-[10px] font-black uppercase tracking-wider border border-sky-200">
                  CẬP NHẬT ĐỐI TÁC
                </span>
                <h3 className="text-base font-black text-slate-900 mt-0.5">Chỉnh sửa nhà tài trợ</h3>
              </div>
              <button
                type="button"
                onClick={() => setModalMode(null)}
                className="grid h-8 w-8 place-items-center rounded-lg border border-slate-200 text-slate-400 hover:border-rose-300 hover:bg-rose-50 hover:text-rose-600 transition"
              >
                ✕
              </button>
            </div>

            {/* Modal Body (Scrollable) */}
            <div className="flex-1 overflow-y-auto px-6 py-4 space-y-3.5 text-xs">
              {/* Image Dropzone Component */}
              <ImageDropzone
                label="Logo nhà tài trợ / Đối tác"
                subLabel="Kéo & thả logo trực tiếp từ máy tính hoặc click để chọn"
                aspectRatioHint="Khuyên dùng: Ảnh PNG nền trong suốt, SVG hoặc JPG sắc nét"
                value={formLogoUrl}
                onChange={setFormLogoUrl}
                compact
                required
              />

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
                <div className="flex flex-col space-y-1">
                  <label className="text-[10px] font-bold text-slate-600 uppercase tracking-wider">Tên nhà tài trợ *</label>
                  <input type="text" className="h-9 px-3 rounded-lg bg-slate-50 border border-slate-200 text-slate-800 focus:outline-none focus:border-emerald-600 focus:bg-white text-xs font-semibold transition" value={formName} onChange={e => setFormName(e.target.value)} required />
                </div>

                <div className="flex flex-col space-y-1">
                  <label className="text-[10px] font-bold text-slate-600 uppercase tracking-wider">Phân hạng (Tier) *</label>
                  <select
                    className="h-9 px-3 rounded-lg bg-slate-50 border border-slate-200 text-slate-800 focus:outline-none focus:border-emerald-600 focus:bg-white text-xs font-semibold cursor-pointer transition"
                    value={formTier}
                    onChange={e => setFormTier(e.target.value as Sponsor['tier'])}
                  >
                    <option value="PLATINUM">PLATINUM (Bạch Kim)</option>
                    <option value="GOLD">GOLD (Vàng)</option>
                    <option value="SILVER">SILVER (Bạc)</option>
                    <option value="PARTNER">PARTNER (Đối tác)</option>
                  </select>
                </div>

                <div className="flex flex-col space-y-1">
                  <label className="text-[10px] font-bold text-slate-600 uppercase tracking-wider">Người liên hệ đại diện</label>
                  <input type="text" className="h-9 px-3 rounded-lg bg-slate-50 border border-slate-200 text-slate-800 focus:outline-none focus:border-emerald-600 focus:bg-white text-xs font-semibold transition" value={formContactPerson} onChange={e => setFormContactPerson(e.target.value)} placeholder="Họ và tên người đại diện" />
                </div>

                <div className="flex flex-col space-y-1">
                  <label className="text-[10px] font-bold text-slate-600 uppercase tracking-wider">Số điện thoại liên hệ</label>
                  <input type="tel" className="h-9 px-3 rounded-lg bg-slate-50 border border-slate-200 text-slate-800 focus:outline-none focus:border-emerald-600 focus:bg-white text-xs font-semibold transition" value={formPhone} onChange={e => setFormPhone(e.target.value)} placeholder="VD: 0912345678" />
                </div>

                <div className="flex flex-col space-y-1">
                  <label className="text-[10px] font-bold text-slate-600 uppercase tracking-wider">Email liên hệ</label>
                  <input type="email" className="h-9 px-3 rounded-lg bg-slate-50 border border-slate-200 text-slate-800 focus:outline-none focus:border-emerald-600 focus:bg-white text-xs font-semibold transition" value={formEmail} onChange={e => setFormEmail(e.target.value)} placeholder="email@domain.com" />
                </div>

                <div className="flex flex-col space-y-1">
                  <label className="text-[10px] font-bold text-slate-600 uppercase tracking-wider">Website liên kết (URL)</label>
                  <input type="url" className="h-9 px-3 rounded-lg bg-slate-50 border border-slate-200 text-slate-800 focus:outline-none focus:border-emerald-600 focus:bg-white text-xs font-semibold transition" value={formWebsiteUrl} onChange={e => setFormWebsiteUrl(e.target.value)} placeholder="https://example.com" />
                </div>

                <div className="flex flex-col space-y-1 sm:col-span-2">
                  <label className="text-[10px] font-bold text-slate-600 uppercase tracking-wider">Mô tả / Giới thiệu đối tác (Tiếng Việt)</label>
                  <textarea rows={2} className="px-3 py-2 rounded-lg bg-slate-50 border border-slate-200 text-slate-800 focus:outline-none focus:border-emerald-600 focus:bg-white text-xs font-semibold resize-none transition" value={formDescription} onChange={e => setFormDescription(e.target.value)} placeholder="Nhập thông tin giới thiệu ngắn về nhà tài trợ..." />
                </div>

                <div className="flex flex-col space-y-1 sm:col-span-2">
                  <label className="text-[10px] font-bold text-slate-600 uppercase tracking-wider">Mô tả / Giới thiệu đối tác tiếng Anh (English Description)</label>
                  <textarea rows={2} className="px-3 py-2 rounded-lg bg-slate-50 border border-slate-200 text-slate-800 focus:outline-none focus:border-emerald-600 focus:bg-white text-xs font-semibold resize-none transition" value={formDescriptionEn} onChange={e => setFormDescriptionEn(e.target.value)} placeholder="English introduction about the sponsor..." />
                </div>
              </div>
            </div>

            {/* Modal Footer */}
            <div className="flex items-center justify-end gap-2.5 px-6 py-3 border-t border-slate-100 bg-slate-50/80 shrink-0">
              <button type="button" onClick={() => setModalMode(null)} className="px-4 py-2 border border-slate-200 hover:bg-slate-100 rounded-xl text-slate-600 text-xs font-bold transition">Hủy bỏ</button>
              <button type="submit" className="px-5 py-2 bg-slate-900 hover:bg-emerald-700 rounded-xl text-white text-xs font-extrabold shadow transition">Lưu thay đổi</button>
            </div>
          </form>
        </div>
      )}

      {/* DETAIL MODAL */}
      {modalMode === 'detail' && selectedSponsor && (
        <DetailModal
          sponsor={selectedSponsor}
          onClose={() => setModalMode(null)}
        />
      )}

    </div>
  );
}
