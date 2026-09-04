'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { apiUrl } from '../../api';
import { useAlert } from '../../AlertProvider';

interface TrashItem {
  id: string;
  type: 'CANDIDATE' | 'SPONSOR' | 'BANNER' | 'TIMELINE' | 'POST' | 'USER';
  typeName: string;
  title: string;
  subtitle?: string;
  imageUrl?: string;
  deletedAt: string;
  daysRemaining: number;
}

export default function AdminTrashPage() {
  const { showAlert, showConfirm } = useAlert();
  const [items, setItems] = useState<TrashItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedType, setSelectedType] = useState('ALL');
  const [search, setSearch] = useState('');
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [processing, setProcessing] = useState(false);

  const loadTrash = async () => {
    try {
      setLoading(true);
      const res = await fetch(apiUrl('/api/admin/trash'));
      if (res.ok) {
        const data = await res.json();
        setItems(Array.isArray(data) ? data : []);
        setSelectedIds(new Set());
      } else {
        showAlert('Không thể nạp dữ liệu thùng rác.', 'error');
      }
    } catch (err) {
      console.error(err);
      showAlert('Lỗi kết nối máy chủ.', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadTrash();
  }, []);

  const typeCounts = useMemo(() => {
    const counts: Record<string, number> = { ALL: items.length };
    for (const item of items) {
      counts[item.type] = (counts[item.type] || 0) + 1;
    }
    return counts;
  }, [items]);

  const filteredItems = useMemo(() => {
    return items.filter((item) => {
      const matchType = selectedType === 'ALL' || item.type === selectedType;
      const matchSearch =
        !search ||
        item.title.toLowerCase().includes(search.toLowerCase()) ||
        (item.subtitle && item.subtitle.toLowerCase().includes(search.toLowerCase())) ||
        item.typeName.toLowerCase().includes(search.toLowerCase());
      return matchType && matchSearch;
    });
  }, [items, selectedType, search]);

  const toggleSelectAll = () => {
    if (selectedIds.size === filteredItems.length && filteredItems.length > 0) {
      setSelectedIds(new Set());
    } else {
      setSelectedIds(new Set(filteredItems.map((i) => `${i.type}___${i.id}`)));
    }
  };

  const toggleSelectOne = (key: string) => {
    const next = new Set(selectedIds);
    if (next.has(key)) next.delete(key);
    else next.add(key);
    setSelectedIds(next);
  };

  const handleRestoreSingle = async (item: TrashItem) => {
    const ok = await showConfirm(
      `Bạn có chắc chắn muốn khôi phục "${item.title}" trở lại hệ thống không?`,
      'Khôi phục dữ liệu',
      'info',
      'Khôi phục ngay'
    );
    if (!ok) return;

    try {
      setProcessing(true);
      const res = await fetch(apiUrl('/api/admin/trash/restore'), {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ type: item.type, id: item.id }),
      });
      if (res.ok) {
        showAlert(`Đã khôi phục thành công "${item.title}"!`, 'success');
        loadTrash();
      } else {
        const d = await res.json().catch(() => null);
        showAlert(d?.error || 'Khôi phục thất bại.', 'error');
      }
    } catch {
      showAlert('Lỗi kết nối máy chủ.', 'error');
    } finally {
      setProcessing(false);
    }
  };

  const handlePermanentDeleteSingle = async (item: TrashItem) => {
    const ok = await showConfirm(
      `CẢNH BÁO NGUY HIỂM: Hành động này sẽ XÓA VĨNH VIỄN "${item.title}" khỏi cơ sở dữ liệu và KHÔNG THỂ KHÔI PHỤC LẠI. Bạn có chắc chắn muốn xóa không?`,
      'Xác nhận xóa vĩnh viễn',
      'warning',
      'Xóa vĩnh viễn'
    );
    if (!ok) return;

    try {
      setProcessing(true);
      const res = await fetch(apiUrl('/api/admin/trash/permanent'), {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ type: item.type, id: item.id }),
      });
      if (res.ok) {
        showAlert(`Đã xóa vĩnh viễn "${item.title}".`, 'success');
        loadTrash();
      } else {
        const d = await res.json().catch(() => null);
        showAlert(d?.error || 'Xóa vĩnh viễn thất bại.', 'error');
      }
    } catch {
      showAlert('Lỗi kết nối máy chủ.', 'error');
    } finally {
      setProcessing(false);
    }
  };

  const handleBatchRestore = async () => {
    if (selectedIds.size === 0) return;
    const ok = await showConfirm(
      `Bạn có chắc chắn muốn khôi phục ${selectedIds.size} mục đã chọn không?`,
      'Khôi phục hàng loạt',
      'info',
      'Khôi phục'
    );
    if (!ok) return;

    const payload = Array.from(selectedIds).map((key) => {
      const [type, id] = key.split('___');
      return { type, id };
    });

    try {
      setProcessing(true);
      const res = await fetch(apiUrl('/api/admin/trash/restore'), {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ items: payload }),
      });
      if (res.ok) {
        showAlert(`Đã khôi phục thành công ${selectedIds.size} mục!`, 'success');
        loadTrash();
      } else {
        showAlert('Khôi phục hàng loạt thất bại.', 'error');
      }
    } catch {
      showAlert('Lỗi kết nối máy chủ.', 'error');
    } finally {
      setProcessing(false);
    }
  };

  const handleBatchPermanentDelete = async () => {
    if (selectedIds.size === 0) return;
    const ok = await showConfirm(
      `CẢNH BÁO NGUY HIỂM: Bạn có chắc chắn muốn XÓA VĨNH VIỄN ${selectedIds.size} mục đã chọn? Dữ liệu sẽ mất hoàn toàn không thể lấy lại!`,
      'Xóa vĩnh viễn hàng loạt',
      'warning',
      'Xóa vĩnh viễn'
    );
    if (!ok) return;

    const payload = Array.from(selectedIds).map((key) => {
      const [type, id] = key.split('___');
      return { type, id };
    });

    try {
      setProcessing(true);
      const res = await fetch(apiUrl('/api/admin/trash/permanent'), {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ items: payload }),
      });
      if (res.ok) {
        showAlert(`Đã xóa vĩnh viễn ${selectedIds.size} mục.`, 'success');
        loadTrash();
      } else {
        showAlert('Xóa vĩnh viễn thất bại.', 'error');
      }
    } catch {
      showAlert('Lỗi kết nối máy chủ.', 'error');
    } finally {
      setProcessing(false);
    }
  };

  const handleEmptyTrash = async () => {
    if (items.length === 0) return;
    const ok = await showConfirm(
      `CẢNH BÁO ĐẶC BIỆT: Bạn có chắc chắn muốn DỌN SẠCH TOÀN BỘ ${items.length} mục trong Thùng rác không? Toàn bộ các bản ghi này sẽ bị xóa vĩnh viễn khỏi Database!`,
      'Dọn sạch Thùng rác',
      'warning',
      'Dọn sạch ngay'
    );
    if (!ok) return;

    try {
      setProcessing(true);
      const res = await fetch(apiUrl('/api/admin/trash'), {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ type: selectedType === 'ALL' ? undefined : selectedType }),
      });
      if (res.ok) {
        showAlert('Đã dọn sạch thùng rác thành công!', 'success');
        loadTrash();
      } else {
        showAlert('Dọn sạch thùng rác thất bại.', 'error');
      }
    } catch {
      showAlert('Lỗi kết nối máy chủ.', 'error');
    } finally {
      setProcessing(false);
    }
  };

  const formatDate = (iso: string) => {
    try {
      const d = new Date(iso);
      return `${d.toLocaleDateString('vi-VN')} lúc ${d.toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' })}`;
    } catch {
      return iso;
    }
  };

  const getTypeBadge = (type: string) => {
    switch (type) {
      case 'CANDIDATE':
        return 'bg-blue-50 text-blue-700 border-blue-200';
      case 'SPONSOR':
        return 'bg-purple-50 text-purple-700 border-purple-200';
      case 'BANNER':
        return 'bg-amber-50 text-amber-700 border-amber-200';
      case 'TIMELINE':
        return 'bg-emerald-50 text-emerald-700 border-emerald-200';
      case 'POST':
        return 'bg-rose-50 text-rose-700 border-rose-200';
      case 'USER':
        return 'bg-slate-50 text-slate-700 border-slate-200';
      default:
        return 'bg-gray-50 text-gray-700 border-gray-200';
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-xl bg-red-50 border border-red-200 flex items-center justify-center text-red-600 shadow-sm">
              <svg viewBox="0 0 24 24" className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M3 6h18" />
                <path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6" />
                <path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2" />
                <line x1="10" y1="11" x2="10" y2="17" />
                <line x1="14" y1="11" x2="14" y2="17" />
              </svg>
            </div>
            <div>
              <h1 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">Thùng rác Quản trị</h1>
              <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
                Các mục đã xóa sẽ được lưu giữ tại đây và tự động xóa vĩnh viễn sau 30 ngày.
              </p>
            </div>
          </div>
        </div>

        {items.length > 0 && (
          <button
            onClick={handleEmptyTrash}
            disabled={processing}
            className="inline-flex items-center justify-center gap-2 rounded-xl bg-red-600 px-4 py-2.5 text-xs sm:text-sm font-bold text-white shadow-sm hover:bg-red-700 focus:outline-none transition-all disabled:opacity-50"
          >
            <svg viewBox="0 0 24 24" className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M3 6h18" />
              <path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6" />
            </svg>
            Dọn sạch thùng rác
          </button>
        )}
      </div>

      {/* Auto-Purge Notice */}
      <div className="rounded-2xl border border-amber-200 bg-amber-50/70 p-4 flex items-start gap-3 text-xs text-amber-900">
        <svg viewBox="0 0 24 24" className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" strokeWidth="2">
          <circle cx="12" cy="12" r="10" />
          <line x1="12" y1="8" x2="12" y2="12" />
          <line x1="12" y1="16" x2="12.01" y2="16" />
        </svg>
        <div className="leading-relaxed">
          <span className="font-bold">Cơ chế tự động dọn dẹp (Auto-Purge):</span> Dữ liệu được đưa vào Thùng rác khi bạn bấm "Xóa" ở bất kỳ trang quản lý nào. Bạn có thể khôi phục lại bất kỳ lúc nào. Sau <strong>30 ngày</strong> kể từ khi xóa, hệ thống sẽ tự động dọn dẹp vĩnh viễn để tối ưu bộ nhớ.
        </div>
      </div>

      {/* Filter Tabs & Search */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
        {/* Category Tabs */}
        <div className="flex flex-wrap items-center gap-1.5 p-1 rounded-xl bg-slate-100/80 border border-slate-200/80">
          {[
            { key: 'ALL', label: 'Tất cả' },
            { key: 'CANDIDATE', label: 'Thí sinh' },
            { key: 'SPONSOR', label: 'Nhà tài trợ' },
            { key: 'BANNER', label: 'Banner' },
            { key: 'TIMELINE', label: 'Lịch trình' },
            { key: 'POST', label: 'Tin tức' },
            { key: 'USER', label: 'Tài khoản' },
          ].map((tab) => {
            const count = typeCounts[tab.key] || 0;
            const isActive = selectedType === tab.key;
            return (
              <button
                key={tab.key}
                onClick={() => setSelectedType(tab.key)}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                  isActive
                    ? 'bg-white text-slate-900 shadow-sm'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-white/50'
                }`}
              >
                <span>{tab.label}</span>
                <span
                  className={`px-1.5 py-0.2 rounded-full text-[10px] font-black ${
                    isActive ? 'bg-slate-900 text-white' : 'bg-slate-200 text-slate-600'
                  }`}
                >
                  {count}
                </span>
              </button>
            );
          })}
        </div>

        {/* Search */}
        <div className="relative min-w-[240px]">
          <input
            type="text"
            placeholder="Tìm kiếm mục đã xóa..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-3 py-2 rounded-xl border border-slate-200 bg-white text-xs text-slate-800 placeholder-slate-400 focus:border-teal-500 focus:ring-1 focus:ring-teal-500 outline-none"
          />
          <svg viewBox="0 0 24 24" className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" fill="none" stroke="currentColor" strokeWidth="2">
            <circle cx="11" cy="11" r="8" />
            <line x1="21" y1="21" x2="16.65" y2="16.65" />
          </svg>
        </div>
      </div>

      {/* Batch Action Toolbar */}
      {selectedIds.size > 0 && (
        <div className="flex items-center justify-between p-3.5 rounded-xl bg-teal-50 border border-teal-200 text-xs font-bold text-teal-900 animate-fade-in">
          <div className="flex items-center gap-2">
            <span className="h-2 w-2 rounded-full bg-teal-500" />
            Đã chọn {selectedIds.size} mục
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={handleBatchRestore}
              disabled={processing}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-teal-600 text-white font-bold hover:bg-teal-700 transition-all shadow-sm"
            >
              <svg viewBox="0 0 24 24" className="w-3.5 h-3.5" fill="none" stroke="currentColor" strokeWidth="2.5">
                <polyline points="1 4 1 10 7 10" />
                <path d="M3.51 15a9 9 0 1 0 2.13-9.36L1 10" />
              </svg>
              Khôi phục {selectedIds.size} mục
            </button>
            <button
              onClick={handleBatchPermanentDelete}
              disabled={processing}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-red-600 text-white font-bold hover:bg-red-700 transition-all shadow-sm"
            >
              <svg viewBox="0 0 24 24" className="w-3.5 h-3.5" fill="none" stroke="currentColor" strokeWidth="2.5">
                <path d="M3 6h18" />
                <path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6" />
              </svg>
              Xóa vĩnh viễn
            </button>
          </div>
        </div>
      )}

      {/* Main Table */}
      <div className="rounded-2xl border border-slate-200 bg-white overflow-hidden shadow-sm">
        {loading ? (
          <div className="py-20 text-center text-slate-400 text-sm font-medium">
            Đang tải dữ liệu thùng rác...
          </div>
        ) : filteredItems.length === 0 ? (
          <div className="py-20 text-center flex flex-col items-center justify-center">
            <div className="h-16 w-16 rounded-full bg-slate-100 flex items-center justify-center text-slate-400 mb-3">
              <svg viewBox="0 0 24 24" className="w-8 h-8" fill="none" stroke="currentColor" strokeWidth="1.5">
                <path d="M3 6h18" />
                <path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6" />
                <path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2" />
              </svg>
            </div>
            <h3 className="text-base font-bold text-slate-800">Thùng rác trống</h3>
            <p className="text-xs text-slate-400 mt-1 max-w-sm">
              Không có dữ liệu nào trong thùng rác {selectedType !== 'ALL' ? `thuộc phân loại "${selectedType}"` : ''}.
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[800px] border-collapse text-left text-xs">
              <thead>
                <tr className="border-b border-slate-100 bg-slate-50/75 text-[10px] font-black uppercase tracking-wider text-slate-500">
                  <th className="px-4 py-3.5 w-12 text-center">
                    <input
                      type="checkbox"
                      checked={filteredItems.length > 0 && selectedIds.size === filteredItems.length}
                      onChange={toggleSelectAll}
                      className="h-4 w-4 rounded border-slate-300 text-teal-600 focus:ring-teal-500 cursor-pointer"
                    />
                  </th>
                  <th className="px-4 py-3.5 w-28">Phân loại</th>
                  <th className="px-4 py-3.5">Tên mục đã xóa</th>
                  <th className="px-4 py-3.5">Thời điểm xóa</th>
                  <th className="px-4 py-3.5">Tự động dọn dẹp sau</th>
                  <th className="px-4 py-3.5 text-right w-44">Thao tác</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredItems.map((item) => {
                  const key = `${item.type}___${item.id}`;
                  const isSelected = selectedIds.has(key);
                  return (
                    <tr
                      key={key}
                      className={`hover:bg-slate-50/80 transition-colors ${
                        isSelected ? 'bg-teal-50/40' : ''
                      }`}
                    >
                      <td className="px-4 py-3.5 text-center w-12">
                        <input
                          type="checkbox"
                          checked={isSelected}
                          onChange={() => toggleSelectOne(key)}
                          className="h-4 w-4 rounded border-slate-300 text-teal-600 focus:ring-teal-500 cursor-pointer"
                        />
                      </td>

                      {/* Loại */}
                      <td className="px-4 py-3.5">
                        <span
                          className={`inline-flex items-center px-2.5 py-1 rounded-lg border text-[11px] font-bold ${getTypeBadge(
                            item.type
                          )}`}
                        >
                          {item.typeName}
                        </span>
                      </td>

                      {/* Thông tin */}
                      <td className="px-4 py-3.5">
                        <div className="flex items-center gap-3">
                          {item.imageUrl ? (
                            <img
                              src={item.imageUrl}
                              alt={item.title}
                              className="h-10 w-10 rounded-lg object-cover border border-slate-200 flex-shrink-0 bg-slate-100"
                              onError={(e) => {
                                (e.currentTarget as HTMLImageElement).src = '/images/site-logo.png';
                              }}
                            />
                          ) : (
                            <div className="h-10 w-10 rounded-lg bg-slate-100 border border-slate-200 flex items-center justify-center text-slate-400 font-bold flex-shrink-0">
                              {item.typeName.slice(0, 1)}
                            </div>
                          )}
                          <div className="min-w-0 max-w-md">
                            <div className="font-bold text-slate-900 truncate text-sm">
                              {item.title}
                            </div>
                            {item.subtitle && (
                              <div className="text-[11px] text-slate-500 truncate mt-0.5">
                                {item.subtitle}
                              </div>
                            )}
                          </div>
                        </div>
                      </td>

                      {/* Thời gian xóa */}
                      <td className="px-4 py-3.5 text-slate-600 whitespace-nowrap">
                        {formatDate(item.deletedAt)}
                      </td>

                      {/* Số ngày còn lại */}
                      <td className="px-4 py-3.5 whitespace-nowrap">
                        <span
                          className={`inline-flex items-center gap-1 font-bold text-xs ${
                            item.daysRemaining <= 5
                              ? 'text-red-600 bg-red-50 px-2 py-0.5 rounded-md border border-red-200'
                              : item.daysRemaining <= 15
                              ? 'text-amber-600 bg-amber-50 px-2 py-0.5 rounded-md border border-amber-200'
                              : 'text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-md border border-emerald-200'
                          }`}
                        >
                          <svg viewBox="0 0 24 24" className="w-3.5 h-3.5" fill="none" stroke="currentColor" strokeWidth="2">
                            <circle cx="12" cy="12" r="10" />
                            <polyline points="12 6 12 12 16 14" />
                          </svg>
                          Còn {item.daysRemaining} ngày
                        </span>
                      </td>

                      {/* Thao tác */}
                      <td className="px-4 py-3.5 text-right whitespace-nowrap">
                        <div className="flex items-center justify-end gap-1.5">
                          <button
                            onClick={() => handleRestoreSingle(item)}
                            disabled={processing}
                            className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg border border-teal-200 bg-teal-50 text-teal-700 hover:bg-teal-100 font-bold text-[11px] transition-all"
                            title="Khôi phục lại"
                          >
                            <svg viewBox="0 0 24 24" className="w-3.5 h-3.5" fill="none" stroke="currentColor" strokeWidth="2.5">
                              <polyline points="1 4 1 10 7 10" />
                              <path d="M3.51 15a9 9 0 1 0 2.13-9.36L1 10" />
                            </svg>
                            Khôi phục
                          </button>

                          <button
                            onClick={() => handlePermanentDeleteSingle(item)}
                            disabled={processing}
                            className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg border border-red-200 bg-red-50 text-red-700 hover:bg-red-100 font-bold text-[11px] transition-all"
                            title="Xóa vĩnh viễn khỏi Database"
                          >
                            <svg viewBox="0 0 24 24" className="w-3.5 h-3.5" fill="none" stroke="currentColor" strokeWidth="2.5">
                              <path d="M3 6h18" />
                              <path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6" />
                            </svg>
                            Xóa vĩnh viễn
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
