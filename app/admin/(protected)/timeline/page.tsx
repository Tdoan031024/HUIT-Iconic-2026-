'use client';

import React, { useEffect, useState } from 'react';
import { TimelineEvent } from '@/lib/types';
import { apiUrl } from '../../api';
import { useAlert } from '../../AlertProvider';

type TimelineFormState = {
  date: string;
  title: string;
  titleEn: string;
  description: string;
  descriptionEn: string;
  isActive: boolean;
  round: string;
  isImportant: boolean;
};

function emptyForm(): TimelineFormState {
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

interface TimelineModalProps {
  isOpen: boolean;
  title: string;
  form: TimelineFormState;
  setForm: React.Dispatch<React.SetStateAction<TimelineFormState>>;
  isSubmitting: boolean;
  onClose: () => void;
  onSubmit: (e: React.FormEvent) => void;
}

function TimelineModal({
  isOpen,
  title,
  form,
  setForm,
  isSubmitting,
  onClose,
  onSubmit,
}: TimelineModalProps) {
  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center overflow-y-auto bg-slate-950/60 p-3 sm:p-5 backdrop-blur-sm transition-all duration-200"
      onMouseDown={(event) => event.target === event.currentTarget && onClose()}
    >
      <form
        onSubmit={onSubmit}
        onMouseDown={(event) => event.stopPropagation()}
        className="relative my-auto flex max-h-[calc(100vh-2rem)] w-full max-w-[620px] flex-col overflow-hidden rounded-[24px] border border-slate-200/80 bg-white shadow-2xl transition-all duration-200 sm:max-h-[calc(100vh-3rem)]"
      >
        {/* Modal Header */}
        <div className="flex shrink-0 items-center justify-between border-b border-slate-100 bg-white px-6 py-4">
          <div>
            <p className="text-[10px] font-bold uppercase tracking-[0.16em] text-[#006AD1]">Quản lý lộ trình</p>
            <h3 className="text-lg font-black text-slate-900">{title}</h3>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="inline-flex h-9 w-9 items-center justify-center rounded-xl border border-slate-200 text-slate-500 transition hover:bg-slate-100 hover:text-slate-900"
            aria-label="Đóng"
          >
            ✕
          </button>
        </div>

        {/* Modal Body - Scrollable */}
        <div className="min-h-0 flex-1 overflow-y-auto p-6 space-y-4">
          <div className="space-y-1.5">
            <label className="block text-[11px] font-bold uppercase tracking-[0.14em] text-slate-600">
              Tên mốc thời gian (Tiếng Việt) <span className="text-red-500 font-bold">*</span>
            </label>
            <input
              className="admin-input w-full"
              value={form.title}
              onChange={(e) => setForm((prev) => ({ ...prev, title: e.target.value }))}
              placeholder="Ví dụ: VÒNG SƠ KHẢO"
              required
            />
          </div>

          <div className="space-y-1.5">
            <label className="block text-[11px] font-bold uppercase tracking-[0.14em] text-slate-600">
              Tên mốc thời gian tiếng Anh (English Title)
            </label>
            <input
              className="admin-input w-full"
              value={form.titleEn}
              onChange={(e) => setForm((prev) => ({ ...prev, titleEn: e.target.value }))}
              placeholder="e.g. Preliminary Round Submission..."
            />
          </div>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div className="space-y-1.5">
              <label className="block text-[11px] font-bold uppercase tracking-[0.14em] text-slate-600">
                Phân loại vòng thi
              </label>
              <select
                className="admin-input w-full"
                value={form.round}
                onChange={(e) => setForm((prev) => ({ ...prev, round: e.target.value }))}
              >
                <option value="Vòng loại">Vòng loại</option>
                <option value="Vòng bán kết">Vòng bán kết</option>
                <option value="Vòng chung kết">Vòng chung kết</option>
              </select>
            </div>

            <div className="space-y-1.5">
              <label className="block text-[11px] font-bold uppercase tracking-[0.14em] text-slate-600">
                Thời gian diễn ra <span className="text-red-500 font-bold">*</span>
              </label>
              <input
                className="admin-input w-full"
                value={form.date}
                onChange={(e) => setForm((prev) => ({ ...prev, date: e.target.value }))}
                placeholder="Ví dụ: 15/09/2026 - 15/10/2026"
                required
              />
            </div>
          </div>

          <div className="space-y-1.5">
            <label className="block text-[11px] font-bold uppercase tracking-[0.14em] text-slate-600">
              Mô tả chi tiết (Tiếng Việt) <span className="text-red-500 font-bold">*</span>
            </label>
            <textarea
              className="admin-textarea h-24 w-full resize-none"
              value={form.description}
              onChange={(e) => setForm((prev) => ({ ...prev, description: e.target.value }))}
              placeholder="Nhập mô tả chi tiết nội dung sự kiện, địa điểm và hướng dẫn..."
              required
            />
          </div>

          <div className="space-y-1.5">
            <label className="block text-[11px] font-bold uppercase tracking-[0.14em] text-slate-600">
              Mô tả chi tiết tiếng Anh (English Description)
            </label>
            <textarea
              className="admin-textarea h-24 w-full resize-none"
              value={form.descriptionEn}
              onChange={(e) => setForm((prev) => ({ ...prev, descriptionEn: e.target.value }))}
              placeholder="English details about this event..."
            />
          </div>

          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 pt-1">
            <label className="flex items-center justify-between rounded-2xl border border-slate-200 bg-slate-50/80 p-3.5 cursor-pointer hover:border-slate-300 transition">
              <div>
                <p className="text-sm font-bold text-slate-900">Đang hoạt động</p>
                <p className="text-xs text-slate-500">Hiển thị nổi bật trên giao diện</p>
              </div>
              <input
                type="checkbox"
                className="h-5 w-5 rounded accent-[#006AD1] cursor-pointer"
                checked={form.isActive}
                onChange={(e) => setForm((prev) => ({ ...prev, isActive: e.target.checked }))}
              />
            </label>

            <label className="flex items-center justify-between rounded-2xl border border-slate-200 bg-slate-50/80 p-3.5 cursor-pointer hover:border-slate-300 transition">
              <div>
                <p className="text-sm font-bold text-slate-900">Mốc quan trọng</p>
                <p className="text-xs text-slate-500">Ưu tiên hiển thị trong lộ trình</p>
              </div>
              <input
                type="checkbox"
                className="h-5 w-5 rounded accent-[#006AD1] cursor-pointer"
                checked={form.isImportant}
                onChange={(e) => setForm((prev) => ({ ...prev, isImportant: e.target.checked }))}
              />
            </label>
          </div>
        </div>

        {/* Modal Footer - Fixed at bottom */}
        <div className="flex shrink-0 items-center justify-end gap-3 border-t border-slate-100 bg-slate-50/90 px-6 py-4">
          <button
            type="button"
            onClick={onClose}
            disabled={isSubmitting}
            className="admin-btn admin-btn-secondary !h-11 !px-5"
          >
            Hủy
          </button>
          <button
            type="submit"
            disabled={isSubmitting}
            className="admin-btn admin-btn-primary !h-11 !px-6 inline-flex items-center gap-2"
          >
            {isSubmitting ? (
              <>
                <svg className="h-4 w-4 animate-spin text-white" viewBox="0 0 24 24" fill="none">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
                </svg>
                <span>Đang lưu...</span>
              </>
            ) : (
              'Lưu thay đổi'
            )}
          </button>
        </div>
      </form>
    </div>
  );
}

export default function TimelineAdminPage() {
  const { showAlert, showConfirm } = useAlert();
  const [events, setEvents] = useState<TimelineEvent[]>([]);
  const [search, setSearch] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [selectedEvent, setSelectedEvent] = useState<TimelineEvent | null>(null);
  const [form, setForm] = useState(emptyForm());

  async function loadTimeline() {
    setIsLoading(true);
    try {
      const res = await fetch(apiUrl('/api/timeline'));
      if (res.ok) {
        const data = await res.json();
        setEvents(Array.isArray(data) ? data : []);
      }
    } catch (err) {
      console.error('Failed to load timeline from backend API.', err);
    } finally {
      setIsLoading(false);
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
      date: event.date || '',
      title: event.title || '',
      titleEn: event.titleEn || '',
      description: event.description || '',
      descriptionEn: event.descriptionEn || '',
      isActive: !!event.isActive,
      round: event.round || 'Vòng loại',
      isImportant: !!event.isImportant,
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
      const data = await res.json().catch(() => null);
      throw new Error(data?.error || data?.message || 'Yêu cầu không thành công');
    }
  }

  const handleAddSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      await submitEvent('POST');
      showAlert('Thêm mốc thời gian thành công!', 'success');
      setIsAddModalOpen(false);
      loadTimeline();
    } catch (err: any) {
      console.error(err);
      showAlert(err.message || 'Thao tác thất bại, kiểm tra kết nối API.', 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleEditSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      await submitEvent('PUT');
      showAlert('Cập nhật mốc thời gian thành công!', 'success');
      setIsEditModalOpen(false);
      loadTimeline();
    } catch (err: any) {
      console.error(err);
      showAlert(err.message || 'Thao tác thất bại, kiểm tra kết nối API.', 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (id: string) => {
    const ok = await showConfirm(
      'Bạn có chắc chắn muốn xóa mốc thời gian này không?',
      'Xác nhận xóa mốc thời gian',
      'error',
      'Xóa ngay'
    );
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

  const handleToggleActive = async (event: TimelineEvent) => {
    try {
      const res = await fetch(apiUrl(`/api/admin/timeline/${event.id}`), {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...event, isActive: !event.isActive }),
      });
      if (!res.ok) throw new Error('Cập nhật thất bại');
      showAlert(`Đã ${!event.isActive ? 'kích hoạt' : 'tắt'} mốc thời gian!`, 'success');
      loadTimeline();
    } catch (err: any) {
      showAlert(err.message || 'Thao tác thất bại', 'error');
    }
  };

  const handleToggleImportant = async (event: TimelineEvent) => {
    try {
      const res = await fetch(apiUrl(`/api/admin/timeline/${event.id}`), {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...event, isImportant: !event.isImportant }),
      });
      if (!res.ok) throw new Error('Cập nhật thất bại');
      showAlert(`Đã ${!event.isImportant ? 'đặt làm mốc quan trọng' : 'bỏ mốc quan trọng'}!`, 'success');
      loadTimeline();
    } catch (err: any) {
      showAlert(err.message || 'Thao tác thất bại', 'error');
    }
  };

  const filteredEvents = events.filter((event) =>
    `${event.title} ${event.description} ${event.date} ${event.round || ''}`.toLowerCase().includes(search.toLowerCase())
  );

  const activeCount = filteredEvents.filter((event) => event.isActive).length;
  const importantCount = filteredEvents.filter((event) => event.isImportant).length;

  return (
    <div className="mx-auto flex w-full max-w-6xl flex-col gap-5">
      {/* Header card */}
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
            <button
              onClick={openAddModal}
              className="admin-btn admin-btn-primary !h-12 !rounded-2xl !px-5 inline-flex items-center gap-2 shadow-md hover:shadow-lg transition"
            >
              <span className="text-lg leading-none">+</span>
              <span>Thêm mốc mới</span>
            </button>
          </div>
        </div>
      </section>

      {/* Search & Stats Section */}
      <section className="grid gap-4 md:grid-cols-[minmax(0,1fr)_220px]">
        <div className="admin-card !rounded-[24px] p-5">
          <label className="mb-2 block text-[11px] font-bold uppercase tracking-[0.16em] text-slate-500">
            Tìm kiếm mốc thời gian
          </label>
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

      {/* Timeline Events List */}
      <section className="grid gap-4">
        {isLoading ? (
          <div className="admin-card !rounded-[24px] p-12 text-center">
            <div className="mx-auto h-8 w-8 animate-spin rounded-full border-4 border-slate-200 border-t-[#006AD1]" />
            <p className="mt-4 text-sm font-semibold text-slate-600">Đang tải danh sách mốc thời gian...</p>
          </div>
        ) : filteredEvents.length === 0 ? (
          <div className="admin-card !rounded-[24px] p-12 text-center">
            <p className="text-base font-bold text-slate-700">Không tìm thấy mốc thời gian nào</p>
            <p className="mt-1 text-sm text-slate-500">
              {search ? 'Thử tìm kiếm với từ khóa khác hoặc xóa bộ lọc.' : 'Bấm vào nút "Thêm mốc mới" để tạo sự kiện đầu tiên.'}
            </p>
          </div>
        ) : (
          filteredEvents.map((event) => (
            <article
              key={event.id}
              className={`admin-card !rounded-[24px] !p-5 transition-all duration-200 hover:shadow-md ${
                event.isActive ? 'border-l-4 border-l-[#006AD1]' : 'opacity-80'
              }`}
            >
              <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="rounded-full bg-slate-100 px-3 py-1 text-[11px] font-bold uppercase tracking-[0.16em] text-slate-600">
                      {event.round || 'Vòng loại'}
                    </span>
                    <button
                      type="button"
                      onClick={() => handleToggleImportant(event)}
                      title="Bấm để đổi trạng thái mốc quan trọng"
                      className={`rounded-full px-3 py-1 text-[11px] font-bold uppercase tracking-[0.16em] transition cursor-pointer ${
                        event.isImportant
                          ? 'bg-amber-100 text-amber-800 hover:bg-amber-200'
                          : 'bg-slate-100 text-slate-400 hover:bg-slate-200'
                      }`}
                    >
                      {event.isImportant ? '★ Mốc quan trọng' : '☆ Đặt quan trọng'}
                    </button>
                    <button
                      type="button"
                      onClick={() => handleToggleActive(event)}
                      title="Bấm để bật/tắt kích hoạt"
                      className={`rounded-full px-3 py-1 text-[11px] font-bold uppercase tracking-[0.16em] transition cursor-pointer ${
                        event.isActive
                          ? 'bg-emerald-100 text-emerald-800 hover:bg-emerald-200'
                          : 'bg-slate-100 text-slate-500 hover:bg-slate-200'
                      }`}
                    >
                      {event.isActive ? '● Đang hoạt động' : '○ Chưa kích hoạt'}
                    </button>
                  </div>

                  <h2 className="mt-3 text-xl font-black tracking-tight text-slate-950">{event.title}</h2>
                  {event.titleEn && (
                    <p className="mt-0.5 text-xs font-semibold text-slate-400 italic">{event.titleEn}</p>
                  )}

                  <p className="mt-2 inline-flex items-center gap-2 rounded-2xl bg-[#F0F7FF] px-4 py-2 text-sm font-bold text-[#006AD1]">
                    <svg className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                      <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
                      <line x1="16" y1="2" x2="16" y2="6" />
                      <line x1="8" y1="2" x2="8" y2="6" />
                      <line x1="3" y1="10" x2="21" y2="10" />
                    </svg>
                    <span>{event.date}</span>
                  </p>

                  <p className="mt-4 text-sm leading-7 text-slate-600 whitespace-pre-line">{event.description}</p>
                  {event.descriptionEn && (
                    <p className="mt-2 text-xs leading-6 text-slate-400 italic whitespace-pre-line border-t border-slate-100 pt-2">
                      {event.descriptionEn}
                    </p>
                  )}
                </div>

                <div className="flex gap-2.5 shrink-0 lg:flex-col">
                  <button
                    onClick={() => openEditModal(event)}
                    className="admin-btn admin-btn-secondary !h-10 !px-4 inline-flex items-center gap-1.5"
                  >
                    <svg className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                      <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
                      <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
                    </svg>
                    <span>Sửa</span>
                  </button>
                  <button
                    onClick={() => handleDelete(event.id)}
                    className="admin-btn admin-btn-danger !h-10 !px-4 inline-flex items-center gap-1.5"
                  >
                    <svg className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                      <polyline points="3 6 5 6 21 6" />
                      <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
                    </svg>
                    <span>Xóa</span>
                  </button>
                </div>
              </div>
            </article>
          ))
        )}
      </section>

      {/* Modals */}
      <TimelineModal
        isOpen={isAddModalOpen}
        title="Thêm mốc thời gian mới"
        form={form}
        setForm={setForm}
        isSubmitting={isSubmitting}
        onClose={() => !isSubmitting && setIsAddModalOpen(false)}
        onSubmit={handleAddSubmit}
      />
      <TimelineModal
        isOpen={isEditModalOpen}
        title="Chỉnh sửa mốc thời gian"
        form={form}
        setForm={setForm}
        isSubmitting={isSubmitting}
        onClose={() => !isSubmitting && setIsEditModalOpen(false)}
        onSubmit={handleEditSubmit}
      />
    </div>
  );
}
