'use client';

import React, { useEffect, useState } from 'react';
import { TimelineEvent } from '@/lib/types';
import { apiUrl } from '../../api';
import { useAlert } from '../../AlertProvider';

function emptyForm() {
  return {
    date: '',
    title: '',
    titleEn: '',
    description: '',
    descriptionEn: '',
    isActive: false,
    round: 'Vòng loại',
    isImportant: false,
  };
}

export default function TimelineAdminPage() {
  const { showAlert, showConfirm } = useAlert();
  const [events, setEvents] = useState<TimelineEvent[]>([]);
  const [search, setSearch] = useState('');
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [selectedEvent, setSelectedEvent] = useState<TimelineEvent | null>(null);
  const [form, setForm] = useState(emptyForm());

  async function loadTimeline() {
    try {
      const res = await fetch(apiUrl('/api/timeline'));
      if (res.ok) {
        setEvents(await res.json());
      }
    } catch (err) {
      console.error('Failed to load timeline from backend API.', err);
    }
  }

  useEffect(() => {
    loadTimeline();
  }, []);

  const openAddModal = () => {
    setForm(emptyForm());
    setIsAddModalOpen(true);
  };

  const openEditModal = (event: TimelineEvent) => {
    setSelectedEvent(event);
    setForm({
      date: event.date,
      title: event.title,
      titleEn: event.titleEn || '',
      description: event.description,
      descriptionEn: event.descriptionEn || '',
      isActive: event.isActive,
      round: event.round || 'Vòng loại',
      isImportant: event.isImportant || false,
    });
    setIsEditModalOpen(true);
  };

  async function submitEvent(method: 'POST' | 'PUT') {
    const url = method === 'POST'
      ? apiUrl('/api/admin/timeline')
      : apiUrl(`/api/admin/timeline/${selectedEvent?.id}`);

    const res = await fetch(url, {
      method,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(form),
    });

    if (!res.ok) {
      throw new Error('Request failed');
    }
  }

  const handleAddSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await submitEvent('POST');
      showAlert('Thêm mốc thời gian thành công!', 'success');
      setIsAddModalOpen(false);
      loadTimeline();
    } catch (err) {
      console.error(err);
      showAlert('Thao tác thất bại, kiểm tra kết nối API.', 'error');
    }
  };

  const handleEditSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await submitEvent('PUT');
      showAlert('Cập nhật mốc thời gian thành công!', 'success');
      setIsEditModalOpen(false);
      loadTimeline();
    } catch (err) {
      console.error(err);
      showAlert('Thao tác thất bại, kiểm tra kết nối API.', 'error');
    }
  };

  const handleDelete = async (id: string) => {
    const ok = await showConfirm('Bạn có chắc chắn muốn xóa mốc thời gian này không?', 'Xác nhận xóa mốc thời gian', 'error', 'Xóa ngay');
    if (!ok) return;
    try {
      const res = await fetch(apiUrl(`/api/admin/timeline/${id}`), { method: 'DELETE' });
      if (!res.ok) throw new Error('Delete failed');
      showAlert('Xóa mốc thời gian thành công!', 'success');
      loadTimeline();
    } catch (err) {
      console.error(err);
      showAlert('Thao tác thất bại, kiểm tra kết nối API.', 'error');
    }
  };

  const filteredEvents = events.filter((event) =>
    `${event.title} ${event.description} ${event.date} ${event.round || ''}`.toLowerCase().includes(search.toLowerCase())
  );

  const activeCount = filteredEvents.filter((event) => event.isActive).length;
  const importantCount = filteredEvents.filter((event) => event.isImportant).length;

  const Modal = ({
    isOpen,
    title,
    onClose,
    onSubmit,
  }: {
    isOpen: boolean;
    title: string;
    onClose: () => void;
    onSubmit: (e: React.FormEvent) => void;
  }) => {
    if (!isOpen) return null;

    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/45 p-4 backdrop-blur-sm" onMouseDown={(event) => event.target === event.currentTarget && onClose()}>
        <form onSubmit={onSubmit} onMouseDown={(event) => event.stopPropagation()} className="w-full max-w-[560px] rounded-[24px] border border-[rgba(0,106,209,0.14)] bg-white p-6 shadow-[0_30px_80px_rgba(15,23,42,0.18)]">
          <div className="mb-5 flex items-center justify-between border-b border-slate-100 pb-4">
            <h3 className="text-lg font-black text-slate-900">{title}</h3>
            <button type="button" onClick={onClose} className="admin-btn admin-btn-secondary !h-10 !px-4">Đóng</button>
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            <div className="md:col-span-2">
              <label className="mb-1.5 block text-[11px] font-bold uppercase tracking-[0.16em] text-slate-500">Tên mốc thời gian (Tiếng Việt) <span className="text-red-500 font-bold">*</span></label>
              <input className="admin-input w-full" value={form.title} onChange={(e) => setForm((prev) => ({ ...prev, title: e.target.value }))} required />
            </div>
            <div className="md:col-span-2">
              <label className="mb-1.5 block text-[11px] font-bold uppercase tracking-[0.16em] text-slate-500">Tên mốc thời gian tiếng Anh (English Title)</label>
              <input className="admin-input w-full" value={form.titleEn} onChange={(e) => setForm((prev) => ({ ...prev, titleEn: e.target.value }))} placeholder="e.g. Preliminary Round Submission..." />
            </div>
            <div>
              <label className="mb-1.5 block text-[11px] font-bold uppercase tracking-[0.16em] text-slate-500">Phân loại vòng thi</label>
              <select className="admin-input w-full" value={form.round} onChange={(e) => setForm((prev) => ({ ...prev, round: e.target.value }))}>
                <option value="Vòng loại">Vòng loại</option>
                <option value="Vòng bán kết">Vòng bán kết</option>
                <option value="Vòng chung kết">Vòng chung kết</option>
              </select>
            </div>
            <div>
              <label className="mb-1.5 block text-[11px] font-bold uppercase tracking-[0.16em] text-slate-500">Thời gian diễn ra</label>
              <input className="admin-input w-full" value={form.date} onChange={(e) => setForm((prev) => ({ ...prev, date: e.target.value }))} required />
            </div>
            <div className="md:col-span-2">
              <label className="mb-1.5 block text-[11px] font-bold uppercase tracking-[0.16em] text-slate-500">Mô tả chi tiết (Tiếng Việt) <span className="text-red-500 font-bold">*</span></label>
              <textarea className="admin-textarea h-24 w-full resize-none" value={form.description} onChange={(e) => setForm((prev) => ({ ...prev, description: e.target.value }))} required />
            </div>
            <div className="md:col-span-2">
              <label className="mb-1.5 block text-[11px] font-bold uppercase tracking-[0.16em] text-slate-500">Mô tả chi tiết tiếng Anh (English Description)</label>
              <textarea className="admin-textarea h-24 w-full resize-none" value={form.descriptionEn} onChange={(e) => setForm((prev) => ({ ...prev, descriptionEn: e.target.value }))} placeholder="English details about this event..." />
            </div>
          </div>

          <div className="mt-5 grid gap-3 md:grid-cols-2">
            <label className="flex items-center justify-between rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3">
              <div>
                <p className="text-sm font-bold text-slate-900">Đang hoạt động</p>
                <p className="text-xs text-slate-500">Hiển thị nổi bật trên giao diện người dùng.</p>
              </div>
              <input type="checkbox" className="h-5 w-5 accent-[#006AD1]" checked={form.isActive} onChange={(e) => setForm((prev) => ({ ...prev, isActive: e.target.checked }))} />
            </label>
            <label className="flex items-center justify-between rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3">
              <div>
                <p className="text-sm font-bold text-slate-900">Mốc quan trọng</p>
                <p className="text-xs text-slate-500">Ưu tiên hiển thị trong phần tổng hợp lộ trình.</p>
              </div>
              <input type="checkbox" className="h-5 w-5 accent-[#006AD1]" checked={form.isImportant} onChange={(e) => setForm((prev) => ({ ...prev, isImportant: e.target.checked }))} />
            </label>
          </div>

          <div className="mt-6 flex justify-end gap-3 border-t border-slate-100 pt-4">
            <button type="button" onClick={onClose} className="admin-btn admin-btn-secondary">Hủy</button>
            <button type="submit" className="admin-btn admin-btn-primary">Lưu thay đổi</button>
          </div>
        </form>
      </div>
    );
  };

  return (
    <div className="mx-auto flex w-full max-w-6xl flex-col gap-5">
      <section className="overflow-hidden rounded-[28px] border border-[rgba(0,106,209,0.14)] bg-[linear-gradient(135deg,#f8fbff_0%,#eef6ff_55%,#ffffff_100%)] p-6 shadow-[0_20px_60px_rgba(16,42,67,0.08)]">
        <div className="flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
          <div className="max-w-2xl">
            <p className="text-[11px] font-bold uppercase tracking-[0.24em] text-[#006AD1]">Quản lý lộ trình</p>
            <h1 className="mt-2 text-3xl font-black tracking-tight text-slate-950">Thời gian & Lộ trình cuộc thi</h1>
            <p className="mt-3 text-sm leading-7 text-slate-600">
              Toàn bộ mốc thời gian được gom vào một màn hình gọn, dễ thao tác trên laptop mà không cần kéo ngang.
            </p>
          </div>
          <div className="flex flex-wrap gap-3">
            <div className="rounded-2xl border border-white/70 bg-white/75 px-4 py-3 shadow-sm">
              <p className="text-[11px] font-bold uppercase tracking-[0.18em] text-slate-400">Tổng mốc</p>
              <p className="mt-1 text-2xl font-black text-slate-950">{events.length}</p>
            </div>
            <div className="rounded-2xl border border-white/70 bg-white/75 px-4 py-3 shadow-sm">
              <p className="text-[11px] font-bold uppercase tracking-[0.18em] text-slate-400">Đang hoạt động</p>
              <p className="mt-1 text-2xl font-black text-emerald-600">{activeCount}</p>
            </div>
            <div className="rounded-2xl border border-white/70 bg-white/75 px-4 py-3 shadow-sm">
              <p className="text-[11px] font-bold uppercase tracking-[0.18em] text-slate-400">Mốc quan trọng</p>
              <p className="mt-1 text-2xl font-black text-amber-600">{importantCount}</p>
            </div>
            <button onClick={openAddModal} className="admin-btn admin-btn-primary !h-12 !rounded-2xl !px-5">+ Thêm mốc mới</button>
          </div>
        </div>
      </section>

      <section className="grid gap-4 md:grid-cols-[minmax(0,1fr)_220px]">
        <div className="admin-card !rounded-[24px] p-5">
          <label className="mb-2 block text-[11px] font-bold uppercase tracking-[0.16em] text-slate-500">Tìm kiếm mốc thời gian</label>
          <input
            type="text"
            className="admin-input w-full"
            placeholder="Tìm theo tiêu đề, mô tả, thời gian..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        <div className="admin-card !rounded-[24px] p-5">
          <p className="text-[11px] font-bold uppercase tracking-[0.16em] text-slate-500">Kết quả hiển thị</p>
          <p className="mt-2 text-3xl font-black text-slate-950">{filteredEvents.length}</p>
          <p className="mt-2 text-xs text-slate-500">Mỗi mốc hiển thị dưới dạng thẻ, không cần bảng kéo ngang.</p>
        </div>
      </section>

      <section className="grid gap-4">
        {filteredEvents.map((event) => (
          <article key={event.id} className="admin-card !rounded-[24px] !p-5">
            <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
              <div className="min-w-0 flex-1">
                <div className="flex flex-wrap items-center gap-2">
                  <span className="rounded-full bg-slate-100 px-3 py-1 text-[11px] font-bold uppercase tracking-[0.16em] text-slate-600">
                    {event.round || 'Vòng loại'}
                  </span>
                  {event.isImportant && (
                    <span className="rounded-full bg-amber-50 px-3 py-1 text-[11px] font-bold uppercase tracking-[0.16em] text-amber-700">
                      Mốc quan trọng
                    </span>
                  )}
                  <span className={`rounded-full px-3 py-1 text-[11px] font-bold uppercase tracking-[0.16em] ${event.isActive ? 'bg-emerald-50 text-emerald-700' : 'bg-slate-100 text-slate-500'}`}>
                    {event.isActive ? 'Đang hoạt động' : 'Chưa kích hoạt'}
                  </span>
                </div>
                <h2 className="mt-3 text-xl font-black tracking-tight text-slate-950">{event.title}</h2>
                <p className="mt-2 inline-flex rounded-2xl bg-[#F0F7FF] px-4 py-2 text-sm font-bold text-[#006AD1]">
                  {event.date}
                </p>
                <p className="mt-4 text-sm leading-7 text-slate-600">{event.description}</p>
              </div>
              <div className="flex gap-3 lg:flex-col">
                <button onClick={() => openEditModal(event)} className="admin-btn admin-btn-secondary">Sửa</button>
                <button onClick={() => handleDelete(event.id)} className="admin-btn admin-btn-danger">Xóa</button>
              </div>
            </div>
          </article>
        ))}
      </section>

      <Modal isOpen={isAddModalOpen} title="Thêm mốc thời gian mới" onClose={() => setIsAddModalOpen(false)} onSubmit={handleAddSubmit} />
      <Modal isOpen={isEditModalOpen} title="Chỉnh sửa mốc thời gian" onClose={() => setIsEditModalOpen(false)} onSubmit={handleEditSubmit} />
    </div>
  );
}
