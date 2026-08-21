'use client';

import React, { useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import { apiUrl, formatAssetUrl } from '../../api';

function escapeHtml(value: string) {
  return value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}

function valueToEditorHtml(value: string) {
  if (/<[a-z][\s\S]*>/i.test(value)) return value;
  const lines = value.split(/\r?\n/);
  if (lines.length === 1) return escapeHtml(value);
  return lines.map((line) => `<p>${line.trim() ? escapeHtml(line) : '<br>'}</p>`).join('');
}

function RichTextModal({
  field,
  onClose,
  onApply,
}: {
  field: { id: string; title: string; value: string };
  onClose: () => void;
  onApply: (value: string) => void;
}) {
  const editorRef = useRef<HTMLDivElement>(null);

  const focusEditor = () => {
    editorRef.current?.focus();
  };

  const runCommand = (command: string, value?: string) => {
    focusEditor();
    document.execCommand(command, false, value);
  };

  const createLink = () => {
    const url = window.prompt('Nhập đường dẫn liên kết');
    if (!url) return;
    runCommand('createLink', url);
  };

  const applyContent = () => {
    onApply(editorRef.current?.innerHTML || '');
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
      <div className="w-full max-w-6xl rounded-2xl border border-slate-200 bg-white p-6 shadow-2xl space-y-4">
        <div className="flex items-center justify-between border-b pb-3 border-slate-100">
          <div className="flex items-center gap-2">
            <span className="p-1.5 bg-[#123c34]/10 text-[#123c34] rounded-md">
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/>
                <path d="M18.5 2.5a2.121 2.121 0 1 1 3 3L12 15l-4 1 1-4z"/>
              </svg>
            </span>
            <h3 className="text-sm font-bold text-[#123c34] font-heading">
              Soạn thảo mở rộng: {field.title}
            </h3>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="text-slate-400 hover:text-slate-600 transition p-1 hover:bg-slate-100 rounded-lg"
            title="Đóng"
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <line x1="18" y1="6" x2="6" y2="18"></line>
              <line x1="6" y1="6" x2="18" y2="18"></line>
            </svg>
          </button>
        </div>

        <div className="rounded-xl border border-slate-200 bg-slate-50 p-2">
          <div className="flex flex-wrap items-center gap-1.5">
            <select
              onChange={(e) => runCommand('formatBlock', e.target.value)}
              defaultValue="P"
              className="h-8 rounded-md border border-slate-200 bg-white px-2 text-[11px] font-bold text-slate-700 outline-none"
              title="Kiểu đoạn"
            >
              <option value="P">Đoạn văn</option>
              <option value="H1">Tiêu đề 1</option>
              <option value="H2">Tiêu đề 2</option>
              <option value="H3">Tiêu đề 3</option>
            </select>
            <select
              onChange={(e) => runCommand('fontSize', e.target.value)}
              defaultValue="3"
              className="h-8 rounded-md border border-slate-200 bg-white px-2 text-[11px] font-bold text-slate-700 outline-none"
              title="Cỡ chữ"
            >
              <option value="2">Nhỏ</option>
              <option value="3">Thường</option>
              <option value="4">Lớn</option>
              <option value="5">Rất lớn</option>
            </select>
            <span className="mx-1 h-6 w-px bg-slate-200" />
            {[
              ['bold', 'B', 'In đậm'],
              ['italic', 'I', 'In nghiêng'],
              ['underline', 'U', 'Gạch chân'],
              ['strikeThrough', 'S', 'Gạch ngang'],
            ].map(([command, label, title]) => (
              <button
                key={command}
                type="button"
                onClick={() => runCommand(command)}
                className="h-8 min-w-8 rounded-md border border-slate-200 bg-white px-2 text-[12px] font-black text-slate-700 transition hover:bg-slate-100"
                title={title}
              >
                {label}
              </button>
            ))}
            <label className="flex h-8 items-center gap-1 rounded-md border border-slate-200 bg-white px-2 text-[11px] font-bold text-slate-600" title="Màu chữ">
              Màu
              <input type="color" onChange={(e) => runCommand('foreColor', e.target.value)} className="h-5 w-6 cursor-pointer border-0 bg-transparent p-0" />
            </label>
            <span className="mx-1 h-6 w-px bg-slate-200" />
            {[
              ['justifyLeft', 'Trái', 'Căn trái'],
              ['justifyCenter', 'Giữa', 'Căn giữa'],
              ['justifyRight', 'Phải', 'Căn phải'],
              ['justifyFull', 'Đều', 'Căn đều'],
            ].map(([command, label, title]) => (
              <button
                key={command}
                type="button"
                onClick={() => runCommand(command)}
                className="h-8 rounded-md border border-slate-200 bg-white px-2 text-[11px] font-bold text-slate-700 transition hover:bg-slate-100"
                title={title}
              >
                {label}
              </button>
            ))}
            <span className="mx-1 h-6 w-px bg-slate-200" />
            <button type="button" onClick={() => runCommand('insertUnorderedList')} className="h-8 rounded-md border border-slate-200 bg-white px-2 text-[11px] font-bold text-slate-700 transition hover:bg-slate-100" title="Danh sách chấm">• List</button>
            <button type="button" onClick={() => runCommand('insertOrderedList')} className="h-8 rounded-md border border-slate-200 bg-white px-2 text-[11px] font-bold text-slate-700 transition hover:bg-slate-100" title="Danh sách số">1. List</button>
            <button type="button" onClick={() => runCommand('outdent')} className="h-8 rounded-md border border-slate-200 bg-white px-2 text-[11px] font-bold text-slate-700 transition hover:bg-slate-100" title="Giảm thụt dòng">Giảm lề</button>
            <button type="button" onClick={() => runCommand('indent')} className="h-8 rounded-md border border-slate-200 bg-white px-2 text-[11px] font-bold text-slate-700 transition hover:bg-slate-100" title="Tăng thụt dòng">Tăng lề</button>
            <span className="mx-1 h-6 w-px bg-slate-200" />
            <button type="button" onClick={createLink} className="h-8 rounded-md border border-slate-200 bg-white px-2 text-[11px] font-bold text-slate-700 transition hover:bg-slate-100" title="Chèn liên kết">Link</button>
            <button type="button" onClick={() => runCommand('unlink')} className="h-8 rounded-md border border-slate-200 bg-white px-2 text-[11px] font-bold text-slate-700 transition hover:bg-slate-100" title="Xóa liên kết">Bỏ link</button>
            <button type="button" onClick={() => runCommand('removeFormat')} className="h-8 rounded-md border border-slate-200 bg-white px-2 text-[11px] font-bold text-slate-700 transition hover:bg-slate-100" title="Xóa định dạng">Xóa format</button>
            <button type="button" onClick={() => runCommand('undo')} className="h-8 rounded-md border border-slate-200 bg-white px-2 text-[11px] font-bold text-slate-700 transition hover:bg-slate-100" title="Hoàn tác">Undo</button>
            <button type="button" onClick={() => runCommand('redo')} className="h-8 rounded-md border border-slate-200 bg-white px-2 text-[11px] font-bold text-slate-700 transition hover:bg-slate-100" title="Làm lại">Redo</button>
          </div>
        </div>

        <div
          ref={editorRef}
          contentEditable
          suppressContentEditableWarning
          className="rich-editor-content h-[460px] w-full overflow-y-auto rounded-xl border border-[#dce5e1] bg-[#fbfdfc] p-5 text-sm text-[#18211f] leading-relaxed outline-none focus:border-[#0f766e] focus:ring-1 focus:ring-[#0f766e]"
          dangerouslySetInnerHTML={{ __html: valueToEditorHtml(field.value) }}
        />

        <div className="flex justify-end gap-3 pt-2">
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg border border-slate-200 bg-white px-5 py-2.5 text-xs font-bold text-slate-600 transition hover:bg-slate-50"
          >
            Hủy bỏ
          </button>
          <button
            type="button"
            onClick={applyContent}
            className="rounded-lg bg-[#123c34] px-6 py-2.5 text-xs font-bold text-white shadow transition hover:bg-[#0f766e]"
          >
            Áp dụng thay đổi
          </button>
        </div>
      </div>
    </div>
  );
}

export default function IntroductionAdminPage() {
  const [aboutTitle, setAboutTitle] = useState('HUIT STARTUP LẦN THỨ VII 2026');
  const [aboutSubtitle, setAboutSubtitle] = useState('Cuộc thi HUIT Startup lần VII - Cấp Thành phố năm 2026');
  const [aboutDescription, setAboutDescription] = useState('');
  const [statsCandidates, setStatsCandidates] = useState('20+');
  const [statsVotes, setStatsVotes] = useState('100K+');
  const [statsViews, setStatsViews] = useState('30M+');
  const [statsYear, setStatsYear] = useState('2025');
  const [statsParticipants, setStatsParticipants] = useState('650');
  const [statsMedia, setStatsMedia] = useState('20+');
  const [statsSchools, setStatsSchools] = useState('45+');
  const [aboutImageUrl, setAboutImageUrl] = useState('/uploads/poster-khoi-nghiep.jpg');
  
  // New fields
  const [aboutTheme, setAboutTheme] = useState('Đổi mới sáng tạo hướng tới mục tiêu phát triển bền vững');
  const [aboutOrganizerDetail, setAboutOrganizerDetail] = useState('');
  const [aboutSectors, setAboutSectors] = useState('');
  const [aboutBenefits, setAboutBenefits] = useState('');
  const [aboutParticipants, setAboutParticipants] = useState('');
  const [aboutPrize, setAboutPrize] = useState('');
  const [aboutContactName, setAboutContactName] = useState('');
  const [aboutContactRole, setAboutContactRole] = useState('');
  const [aboutContactPhone, setAboutContactPhone] = useState('');
  const [aboutContactEmail, setAboutContactEmail] = useState('');
  const [aboutContactWebsite, setAboutContactWebsite] = useState('');
  const [aboutContactQrUrl, setAboutContactQrUrl] = useState('/images/qrdangky.png');

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [modalField, setModalField] = useState<{ id: string; title: string; value: string } | null>(null);

  useEffect(() => {
    async function loadSettings() {
      try {
        const res = await fetch(apiUrl('/api/admin/settings'));
        if (res.ok) {
          const data = await res.json();
          if (data.aboutTitle) setAboutTitle(data.aboutTitle);
          if (data.aboutSubtitle) setAboutSubtitle(data.aboutSubtitle);
          if (data.aboutTheme) setAboutTheme(data.aboutTheme);
          if (data.aboutDescription) setAboutDescription(data.aboutDescription);
          if (data.statsCandidates) setStatsCandidates(data.statsCandidates);
          if (data.statsVotes) setStatsVotes(data.statsVotes);
          if (data.statsViews) setStatsViews(data.statsViews);
          if (data.statsYear) setStatsYear(data.statsYear);
          if (data.statsParticipants) setStatsParticipants(data.statsParticipants);
          if (data.statsMedia) setStatsMedia(data.statsMedia);
          if (data.statsSchools) setStatsSchools(data.statsSchools);
          if (data.aboutImageUrl) setAboutImageUrl(data.aboutImageUrl);
          
          if (data.aboutOrganizerDetail) setAboutOrganizerDetail(data.aboutOrganizerDetail);
          if (data.aboutSectors) setAboutSectors(data.aboutSectors);
          if (data.aboutBenefits) setAboutBenefits(data.aboutBenefits);
          if (data.aboutParticipants) setAboutParticipants(data.aboutParticipants);
          if (data.aboutPrize) setAboutPrize(data.aboutPrize);
          if (data.aboutContactName) setAboutContactName(data.aboutContactName);
          if (data.aboutContactRole) setAboutContactRole(data.aboutContactRole);
          if (data.aboutContactPhone) setAboutContactPhone(data.aboutContactPhone);
          if (data.aboutContactEmail) setAboutContactEmail(data.aboutContactEmail);
          if (data.aboutContactWebsite) setAboutContactWebsite(data.aboutContactWebsite);
          if (data.aboutContactQrUrl) setAboutContactQrUrl(data.aboutContactQrUrl);
        }
      } catch (err) {
        console.error('Failed to load settings', err);
      }
    }
    loadSettings();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      const res = await fetch(apiUrl('/api/admin/settings'), {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          aboutTitle,
          aboutSubtitle,
          aboutTheme,
          aboutDescription,
          statsCandidates,
          statsVotes,
          statsViews,
          statsYear,
          statsParticipants,
          statsMedia,
          statsSchools,
          aboutImageUrl,
          aboutOrganizerDetail,
          aboutSectors,
          aboutBenefits,
          aboutParticipants,
          aboutPrize,
          aboutContactName,
          aboutContactRole,
          aboutContactPhone,
          aboutContactEmail,
          aboutContactWebsite,
          aboutContactQrUrl,
        }),
      });
      if (res.ok) {
        alert('Cập nhật thông tin cuộc thi thành công!');
      } else {
        alert('Cập nhật thất bại.');
      }
    } catch (err) {
      console.error(err);
      alert('Lỗi kết nối máy chủ.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const formData = new FormData();
    formData.append('file', file);

    try {
      const res = await fetch(apiUrl('/api/admin/upload'), {
        method: 'POST',
        body: formData,
      });
      if (res.ok) {
        const data = await res.json();
        setAboutImageUrl(data.url);
        alert('Tải ảnh giới thiệu lên thành công!');
      } else {
        alert('Tải ảnh thất bại.');
      }
    } catch (err) {
      console.error(err);
      alert('Có lỗi xảy ra khi kết nối server tải ảnh.');
    }
  };

  const handleQrUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const formData = new FormData();
    formData.append('file', file);

    try {
      const res = await fetch(apiUrl('/api/admin/upload'), {
        method: 'POST',
        body: formData,
      });
      if (res.ok) {
        const data = await res.json();
        setAboutContactQrUrl(data.url);
        alert('Tải ảnh QR Code lên thành công!');
      } else {
        alert('Tải ảnh thất bại.');
      }
    } catch (err) {
      console.error(err);
      alert('Có lỗi xảy ra khi kết nối server tải ảnh.');
    }
  };

  return (
    <div className="space-y-5">
      {/* Page Header */}
      <section className="flex flex-col gap-3 rounded-xl border border-[#dce5e1] bg-white p-4 shadow-sm md:flex-row md:items-center md:justify-between">
        <div>
          <p className="text-xs font-bold text-[#0f766e] font-heading">Quản lý giao diện</p>
          <h2 className="mt-0.5 text-lg font-bold text-[#123c34] font-heading">Cấu hình thông tin cuộc thi</h2>
          <p className="text-xs text-[#6b7773] mt-0.5">Chỉnh sửa chi tiết nội dung trang Giới thiệu hiển thị trên trang chủ của website bình chọn.</p>
        </div>
      </section>

      {/* Main Form */}
      <form onSubmit={handleSubmit} className="space-y-6">
        
        {/* KHỐI 1: TIÊU ĐỀ & GIỚI THIỆU CHUNG */}
        <div className="rounded-xl border border-[#dce5e1] bg-white p-5 shadow-sm space-y-4">
          <div className="flex items-center gap-2 pb-2 border-b border-[#edf2f0]">
            <span className="flex h-5 w-5 items-center justify-center rounded-full bg-[#123c34] text-[10px] font-bold text-white">1</span>
            <h3 className="text-sm font-bold text-[#123c34] font-heading">Tiêu đề &amp; Giới thiệu chung</h3>
          </div>
          
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Cột trái: Poster & Tải ảnh */}
            <div className="lg:col-span-1 space-y-4">
              <div className="overflow-hidden rounded-lg border border-[#dce5e1] bg-[#f4f7f6] aspect-[4/3] flex items-center justify-center relative group">
                <img 
                  src={formatAssetUrl(aboutImageUrl || '/uploads/poster-khoi-nghiep.jpg')} 
                  alt="About Poster Preview" 
                  className="w-full h-full object-cover" 
                />
              </div>

              <div className="space-y-2">
                <label className="block">
                  <span className="text-[10px] font-bold text-[#52605b] uppercase tracking-wider block mb-1">Đường dẫn hình ảnh</span>
                  <input 
                    type="text" 
                    value={aboutImageUrl} 
                    onChange={(e) => setAboutImageUrl(e.target.value)} 
                    className="h-9 w-full rounded-lg border border-[#dce5e1] bg-[#fbfdfc] px-3 text-xs font-semibold text-[#18211f] outline-none transition focus:border-[#0f766e] focus:bg-white" 
                    required 
                  />
                </label>
                
                <div className="space-y-1">
                  <span className="text-[10px] font-bold text-[#52605b] uppercase tracking-wider block">Tải ảnh mới lên</span>
                  <input 
                    type="file" 
                    accept="image/*" 
                    onChange={handleFileUpload} 
                    className="w-full text-xs text-[#52605b] file:mr-3 file:py-1.5 file:px-3 file:rounded-md file:border-0 file:text-[10px] file:font-bold file:bg-[#123c34] file:text-white hover:file:bg-[#0f766e] cursor-pointer" 
                  />
                </div>
              </div>
            </div>

            {/* Cột phải: Tiêu đề & Mô tả */}
            <div className="lg:col-span-2 space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <label className="block space-y-1.5 md:col-span-2">
                  <span className="text-[10px] font-bold text-[#52605b] uppercase tracking-wider">Tiêu đề chính cuộc thi</span>
                  <input 
                    type="text" 
                    value={aboutTitle} 
                    onChange={(e) => setAboutTitle(e.target.value)} 
                    className="h-9 w-full rounded-lg border border-[#dce5e1] bg-[#fbfdfc] px-3 text-xs font-bold text-[#123c34] outline-none transition focus:border-[#0f766e] focus:bg-white" 
                    required 
                  />
                </label>

                <label className="block space-y-1.5">
                  <span className="text-[10px] font-bold text-[#52605b] uppercase tracking-wider">Tiêu đề phụ cuộc thi</span>
                  <input 
                    type="text" 
                    value={aboutSubtitle} 
                    onChange={(e) => setAboutSubtitle(e.target.value)} 
                    className="h-9 w-full rounded-lg border border-[#dce5e1] bg-[#fbfdfc] px-3 text-xs font-semibold text-[#18211f] outline-none transition focus:border-[#0f766e] focus:bg-white" 
                    required 
                  />
                </label>

                <label className="block space-y-1.5">
                  <span className="text-[10px] font-bold text-[#52605b] uppercase tracking-wider">Chủ đề cuộc thi</span>
                  <input 
                    type="text" 
                    value={aboutTheme} 
                    onChange={(e) => setAboutTheme(e.target.value)} 
                    className="h-9 w-full rounded-lg border border-[#dce5e1] bg-[#fbfdfc] px-3 text-xs font-semibold text-[#18211f] outline-none transition focus:border-[#0f766e] focus:bg-white" 
                    required 
                  />
                </label>
              </div>

              <div className="block space-y-1.5">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-bold text-[#52605b] uppercase tracking-wider">Mô tả tổng quan / Thể lệ sơ lược</span>
                  <button
                    type="button"
                    onClick={() => setModalField({ id: 'aboutDescription', title: 'Mô tả tổng quan / Thể lệ sơ lược', value: aboutDescription })}
                    className="text-[#0f766e] hover:text-[#0d5c56] text-[10px] font-bold flex items-center gap-1 transition"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M15 3h6v6M9 21H3v-6M21 3l-7 7M3 21l7-7"/>
                    </svg>
                    Mở rộng
                  </button>
                </div>
                <textarea 
                  value={aboutDescription} 
                  onChange={(e) => setAboutDescription(e.target.value)} 
                  className="h-32 w-full resize-y rounded-lg border border-[#dce5e1] bg-[#fbfdfc] p-3 text-xs font-semibold text-[#18211f] leading-relaxed outline-none transition focus:border-[#0f766e] focus:bg-white" 
                  required 
                />
              </div>
            </div>
          </div>
        </div>

        {/* KHỐI 2: ĐƠN VỊ TỔ CHỨC & ĐỒNG HÀNH */}
        <div className="rounded-xl border border-[#dce5e1] bg-white p-5 shadow-sm space-y-4">
          <div className="flex items-center gap-2 pb-2 border-b border-[#edf2f0]">
            <span className="flex h-5 w-5 items-center justify-center rounded-full bg-[#123c34] text-[10px] font-bold text-white">2</span>
            <h3 className="text-sm font-bold text-[#123c34] font-heading">Đơn vị tổ chức &amp; đồng hành</h3>
          </div>
          <div className="block space-y-1.5">
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-bold text-[#52605b] uppercase tracking-wider">Nội dung chi tiết đối tác (Nhập cách dòng)</span>
              <button
                type="button"
                onClick={() => setModalField({ id: 'aboutOrganizerDetail', title: 'Đơn vị tổ chức & đồng hành', value: aboutOrganizerDetail })}
                className="text-[#0f766e] hover:text-[#0d5c56] text-[10px] font-bold flex items-center gap-1 transition"
              >
                <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M15 3h6v6M9 21H3v-6M21 3l-7 7M3 21l7-7"/>
                </svg>
                Mở rộng
              </button>
            </div>
            <textarea 
              value={aboutOrganizerDetail} 
              onChange={(e) => setAboutOrganizerDetail(e.target.value)} 
              className="h-36 w-full resize-y rounded-lg border border-[#dce5e1] bg-[#fbfdfc] p-3 text-xs font-semibold text-[#18211f] leading-relaxed outline-none transition focus:border-[#0f766e] focus:bg-white" 
              placeholder="Đơn vị tổ chức: ...&#10;Tài trợ kim cương: ...&#10;Đơn vị phối hợp: ..."
              required 
            />
          </div>
        </div>

        {/* KHỐI 3: LĨNH VỰC, QUYỀN LỢI & GIẢI THƯỞNG */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="rounded-xl border border-[#dce5e1] bg-white p-5 shadow-sm space-y-4">
            <div className="flex items-center gap-2 pb-2 border-b border-[#edf2f0]">
              <span className="flex h-5 min-w-[20px] px-1 items-center justify-center rounded-full bg-[#123c34] text-[10px] font-bold text-white">3A</span>
              <h3 className="text-sm font-bold text-[#123c34] font-heading">Lĩnh vực dự thi</h3>
            </div>
            <div className="block space-y-1.5">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-bold text-[#52605b] uppercase tracking-wider">Mỗi lĩnh vực ghi trên 1 dòng riêng biệt</span>
                <button
                  type="button"
                  onClick={() => setModalField({ id: 'aboutSectors', title: 'Lĩnh vực dự thi', value: aboutSectors })}
                  className="text-[#0f766e] hover:text-[#0d5c56] text-[10px] font-bold flex items-center gap-1 transition"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M15 3h6v6M9 21H3v-6M21 3l-7 7M3 21l7-7"/>
                  </svg>
                  Mở rộng
                </button>
              </div>
              <textarea 
                value={aboutSectors} 
                onChange={(e) => setAboutSectors(e.target.value)} 
                className="h-44 w-full resize-y rounded-lg border border-[#dce5e1] bg-[#fbfdfc] p-3 text-xs font-semibold text-[#18211f] leading-relaxed outline-none transition focus:border-[#0f766e] focus:bg-white" 
                placeholder="Công nghiệp, AI, chuyển đổi số...&#10;Công nghệ thực phẩm, nông nghiệp..."
                required 
              />
            </div>
          </div>

          <div className="rounded-xl border border-[#dce5e1] bg-white p-5 shadow-sm space-y-4">
            <div className="flex items-center gap-2 pb-2 border-b border-[#edf2f0]">
              <span className="flex h-5 min-w-[20px] px-1 items-center justify-center rounded-full bg-[#123c34] text-[10px] font-bold text-white">3B</span>
              <h3 className="text-sm font-bold text-[#123c34] font-heading">Quyền lợi khi tham gia</h3>
            </div>
            <div className="block space-y-1.5">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-bold text-[#52605b] uppercase tracking-wider">Mỗi quyền lợi ghi trên 1 dòng riêng biệt</span>
                <button
                  type="button"
                  onClick={() => setModalField({ id: 'aboutBenefits', title: 'Quyền lợi khi tham gia', value: aboutBenefits })}
                  className="text-[#0f766e] hover:text-[#0d5c56] text-[10px] font-bold flex items-center gap-1 transition"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M15 3h6v6M9 21H3v-6M21 3l-7 7M3 21l7-7"/>
                  </svg>
                  Mở rộng
                </button>
              </div>
              <textarea 
                value={aboutBenefits} 
                onChange={(e) => setAboutBenefits(e.target.value)} 
                className="h-44 w-full resize-y rounded-lg border border-[#dce5e1] bg-[#fbfdfc] p-3 text-xs font-semibold text-[#18211f] leading-relaxed outline-none transition focus:border-[#0f766e] focus:bg-white" 
                placeholder="Đào tạo kỹ năng khởi nghiệp&#10;Mentor/cố vấn chuyên sâu..."
                required 
              />
            </div>
          </div>

          <div className="rounded-xl border border-[#dce5e1] bg-white p-5 shadow-sm space-y-4">
            <div className="flex items-center gap-2 pb-2 border-b border-[#edf2f0]">
              <span className="flex h-5 min-w-[20px] px-1 items-center justify-center rounded-full bg-[#123c34] text-[10px] font-bold text-white">3C</span>
              <h3 className="text-sm font-bold text-[#123c34] font-heading">Giải thưởng cuộc thi</h3>
            </div>
            <div className="block space-y-1.5">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-bold text-[#52605b] uppercase tracking-wider">Thông tin giải thưởng</span>
                <button
                  type="button"
                  onClick={() => setModalField({ id: 'aboutPrize', title: 'Giải thưởng cuộc thi', value: aboutPrize })}
                  className="text-[#0f766e] hover:text-[#0d5c56] text-[10px] font-bold flex items-center gap-1 transition"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M15 3h6v6M9 21H3v-6M21 3l-7 7M3 21l7-7"/>
                  </svg>
                  Mở rộng
                </button>
              </div>
              <textarea 
                value={aboutPrize} 
                onChange={(e) => setAboutPrize(e.target.value)} 
                className="h-44 w-full resize-y rounded-lg border border-[#dce5e1] bg-[#fbfdfc] p-3 text-xs font-semibold text-[#18211f] leading-relaxed outline-none transition focus:border-[#0f766e] focus:bg-white" 
                placeholder="Tổng giá trị giải thưởng 05 Tỷ đồng gồm..."
                required 
              />
            </div>
          </div>
        </div>

        {/* KHỐI 4: LỘ TRÌNH THỜI GIAN THỰC HIỆN */}
        <div className="rounded-xl border border-[#bee3f8] bg-[#ebf8ff] p-5 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-start gap-3">
            <div className="p-2 bg-[#bee3f8] text-[#2b6cb0] rounded-lg shrink-0">
              <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect>
                <line x1="16" y1="2" x2="16" y2="6"></line>
                <line x1="8" y1="2" x2="8" y2="6"></line>
                <line x1="3" y1="10" x2="21" y2="10"></line>
              </svg>
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="flex h-5 w-5 items-center justify-center rounded-full bg-[#2b6cb0] text-[10px] font-bold text-white">4</span>
                <h3 className="text-sm font-bold text-[#2b6cb0] font-heading">Thời gian &amp; Lộ trình thực hiện</h3>
              </div>
              <p className="text-xs text-[#2d3748] mt-1.5">
                Các mốc lộ trình thời gian được đồng bộ tự động từ cơ sở dữ liệu. Để thay đổi hoặc thêm bớt các sự kiện lộ trình hiển thị trên website, vui lòng nhấn nút truy cập trang cấu hình Lộ trình bên cạnh.
              </p>
            </div>
          </div>
          <Link
            href="/timeline"
            className="inline-flex items-center justify-center rounded-lg bg-[#2b6cb0] hover:bg-[#2c5282] px-5 py-2.5 text-xs font-bold text-white shadow transition shrink-0"
          >
            Cấu hình Lộ trình &rarr;
          </Link>
        </div>

        {/* KHỐI 5: QUY MÔ, ĐỐI TƯỢNG & LIÊN HỆ */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Cột 1: Quy mô */}
          <div className="rounded-xl border border-[#dce5e1] bg-white p-5 shadow-sm space-y-4">
            <div className="flex items-center gap-2 pb-2 border-b border-[#edf2f0]">
              <span className="flex h-5 min-w-[20px] px-1 items-center justify-center rounded-full bg-[#123c34] text-[10px] font-bold text-white">5A</span>
              <h3 className="text-sm font-bold text-[#123c34] font-heading">Số liệu thống kê (Quy mô)</h3>
            </div>
            <div className="space-y-3">
              <label className="block space-y-1.5">
                <span className="text-[10px] font-bold text-[#52605b] uppercase tracking-wider">Số lượng thí sinh</span>
                <input 
                  type="text" 
                  value={statsCandidates} 
                  onChange={(e) => setStatsCandidates(e.target.value)} 
                  className="h-9 w-full rounded-lg border border-[#dce5e1] bg-[#fbfdfc] px-3 text-xs font-bold text-[#0f766e] outline-none transition focus:border-[#0f766e] focus:bg-white" 
                  required 
                />
              </label>

              <label className="block space-y-1.5">
                <span className="text-[10px] font-bold text-[#52605b] uppercase tracking-wider">Tổng lượt bình chọn</span>
                <input 
                  type="text" 
                  value={statsVotes} 
                  onChange={(e) => setStatsVotes(e.target.value)} 
                  className="h-9 w-full rounded-lg border border-[#dce5e1] bg-[#fbfdfc] px-3 text-xs font-bold text-[#0f766e] outline-none transition focus:border-[#0f766e] focus:bg-white" 
                  required 
                />
              </label>

              <label className="block space-y-1.5">
                <span className="text-[10px] font-bold text-[#52605b] uppercase tracking-wider">Tổng số lượt xem</span>
                <input 
                  type="text" 
                  value={statsViews} 
                  onChange={(e) => setStatsViews(e.target.value)} 
                  className="h-9 w-full rounded-lg border border-[#dce5e1] bg-[#fbfdfc] px-3 text-xs font-bold text-[#0f766e] outline-none transition focus:border-[#0f766e] focus:bg-white" 
                  required 
                />
              </label>

              <label className="block space-y-1.5">
                <span className="text-[10px] font-bold text-[#52605b] uppercase tracking-wider">Năm thống kê (ví dụ: 2025)</span>
                <input 
                  type="text" 
                  value={statsYear} 
                  onChange={(e) => setStatsYear(e.target.value)} 
                  className="h-9 w-full rounded-lg border border-[#dce5e1] bg-[#fbfdfc] px-3 text-xs font-bold text-[#0f766e] outline-none transition focus:border-[#0f766e] focus:bg-white" 
                  required 
                />
              </label>

              <label className="block space-y-1.5">
                <span className="text-[10px] font-bold text-[#52605b] uppercase tracking-wider">Số lượng sinh viên tham gia</span>
                <input 
                  type="text" 
                  value={statsParticipants} 
                  onChange={(e) => setStatsParticipants(e.target.value)} 
                  className="h-9 w-full rounded-lg border border-[#dce5e1] bg-[#fbfdfc] px-3 text-xs font-bold text-[#0f766e] outline-none transition focus:border-[#0f766e] focus:bg-white" 
                  required 
                />
              </label>

              <label className="block space-y-1.5">
                <span className="text-[10px] font-bold text-[#52605b] uppercase tracking-wider">Đơn vị truyền thông đưa tin</span>
                <input 
                  type="text" 
                  value={statsMedia} 
                  onChange={(e) => setStatsMedia(e.target.value)} 
                  className="h-9 w-full rounded-lg border border-[#dce5e1] bg-[#fbfdfc] px-3 text-xs font-bold text-[#0f766e] outline-none transition focus:border-[#0f766e] focus:bg-white" 
                  required 
                />
              </label>

              <label className="block space-y-1.5">
                <span className="text-[10px] font-bold text-[#52605b] uppercase tracking-wider">Trường tham gia (ĐH/CĐ/THPT...)</span>
                <input 
                  type="text" 
                  value={statsSchools} 
                  onChange={(e) => setStatsSchools(e.target.value)} 
                  className="h-9 w-full rounded-lg border border-[#dce5e1] bg-[#fbfdfc] px-3 text-xs font-bold text-[#0f766e] outline-none transition focus:border-[#0f766e] focus:bg-white" 
                  required 
                />
              </label>
            </div>
          </div>

          {/* Cột 2: Đối tượng tham gia */}
          <div className="rounded-xl border border-[#dce5e1] bg-white p-5 shadow-sm space-y-4">
            <div className="flex items-center gap-2 pb-2 border-b border-[#edf2f0]">
              <span className="flex h-5 min-w-[20px] px-1 items-center justify-center rounded-full bg-[#123c34] text-[10px] font-bold text-white">5B</span>
              <h3 className="text-sm font-bold text-[#123c34] font-heading">Đối tượng tham gia</h3>
            </div>
            <div className="block space-y-1.5">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-bold text-[#52605b] uppercase tracking-wider">Mỗi đối tượng ghi trên 1 dòng dạng (Tên đối tượng: Mô tả)</span>
                <button
                  type="button"
                  onClick={() => setModalField({ id: 'aboutParticipants', title: 'Đối tượng tham gia', value: aboutParticipants })}
                  className="text-[#0f766e] hover:text-[#0d5c56] text-[10px] font-bold flex items-center gap-1 transition"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M15 3h6v6M9 21H3v-6M21 3l-7 7M3 21l7-7"/>
                  </svg>
                  Mở rộng
                </button>
              </div>
              <textarea 
                value={aboutParticipants} 
                onChange={(e) => setAboutParticipants(e.target.value)} 
                className="h-[218px] w-full resize-y rounded-lg border border-[#dce5e1] bg-[#fbfdfc] p-3 text-xs font-semibold text-[#18211f] leading-relaxed outline-none transition focus:border-[#0f766e] focus:bg-white" 
                placeholder="Học sinh: THPT, GDTX, trung cấp có ý tưởng...&#10;Sinh viên, học viên: Đang học tại các trường..."
                required 
              />
            </div>
          </div>

          {/* Cột 3: Liên hệ & Đăng ký */}
          <div className="rounded-xl border border-[#dce5e1] bg-white p-5 shadow-sm space-y-4">
            <div className="flex items-center gap-2 pb-2 border-b border-[#edf2f0]">
              <span className="flex h-5 min-w-[20px] px-1 items-center justify-center rounded-full bg-[#123c34] text-[10px] font-bold text-white">5C</span>
              <h3 className="text-sm font-bold text-[#123c34] font-heading">Thông tin liên hệ &amp; Đăng ký</h3>
            </div>
            <div className="space-y-3">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <label className="block space-y-1">
                  <span className="text-[9px] font-bold text-[#52605b] uppercase tracking-wider block">Người liên hệ</span>
                  <input type="text" className="h-8 w-full rounded-md border border-[#dce5e1] bg-[#fbfdfc] px-2.5 text-xs font-semibold text-[#18211f] outline-none focus:border-[#0f766e]" value={aboutContactName} onChange={e => setAboutContactName(e.target.value)} required />
                </label>

                <label className="block space-y-1">
                  <span className="text-[9px] font-bold text-[#52605b] uppercase tracking-wider block">Chức vụ</span>
                  <input type="text" className="h-8 w-full rounded-md border border-[#dce5e1] bg-[#fbfdfc] px-2.5 text-xs font-semibold text-[#18211f] outline-none focus:border-[#0f766e]" value={aboutContactRole} onChange={e => setAboutContactRole(e.target.value)} required />
                </label>

                <label className="block space-y-1">
                  <span className="text-[9px] font-bold text-[#52605b] uppercase tracking-wider block">Điện thoại</span>
                  <input type="text" className="h-8 w-full rounded-md border border-[#dce5e1] bg-[#fbfdfc] px-2.5 text-xs font-semibold text-[#18211f] outline-none focus:border-[#0f766e]" value={aboutContactPhone} onChange={e => setAboutContactPhone(e.target.value)} required />
                </label>

                <label className="block space-y-1">
                  <span className="text-[9px] font-bold text-[#52605b] uppercase tracking-wider block">Địa chỉ Email</span>
                  <input type="email" className="h-8 w-full rounded-md border border-[#dce5e1] bg-[#fbfdfc] px-2.5 text-xs font-semibold text-[#18211f] outline-none focus:border-[#0f766e]" value={aboutContactEmail} onChange={e => setAboutContactEmail(e.target.value)} required />
                </label>
              </div>

              <label className="block space-y-1">
                <span className="text-[9px] font-bold text-[#52605b] uppercase tracking-wider block">Website</span>
                <input type="text" className="h-8 w-full rounded-md border border-[#dce5e1] bg-[#fbfdfc] px-2.5 text-xs font-semibold text-[#18211f] outline-none focus:border-[#0f766e]" value={aboutContactWebsite} onChange={e => setAboutContactWebsite(e.target.value)} required />
              </label>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 items-center rounded-lg border border-slate-100 bg-[#fbfdfc] p-2.5">
                <div className="flex flex-col space-y-1">
                  <span className="text-[9px] font-bold text-[#52605b] uppercase tracking-wider block">Mã QR Đăng ký</span>
                  <input type="text" className="h-7 w-full rounded border border-slate-200 bg-white px-2 text-[10.5px] font-semibold outline-none" value={aboutContactQrUrl} onChange={e => setAboutContactQrUrl(e.target.value)} required />
                  <input type="file" accept="image/*" onChange={handleQrUpload} className="w-full text-[10px] text-[#52605b] file:mr-1.5 file:py-0.5 file:px-2 file:rounded file:border-0 file:text-[9px] file:font-bold file:bg-[#123c34] file:text-white hover:file:bg-[#0f766e] cursor-pointer" />
                </div>
                <div className="flex justify-center">
                  <img src={formatAssetUrl(aboutContactQrUrl)} className="h-20 w-20 object-contain rounded border bg-white p-1 shadow-sm" alt="QR Code Preview" />
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Form Action Submit */}
        <div className="rounded-xl border border-[#dce5e1] bg-white p-4 shadow-sm flex justify-end">
          <button 
            type="submit" 
            disabled={isSubmitting}
            className="rounded-lg bg-[#123c34] px-8 py-3 text-xs font-bold text-white shadow-md transition hover:bg-[#0f766e] disabled:opacity-50 font-heading"
          >
            {isSubmitting ? 'Đang lưu cấu hình...' : 'Lưu tất cả thay đổi'}
          </button>
        </div>

      </form>

      {/* Modal soạn thảo rộng rãi */}
      {modalField && (
        <RichTextModal
          field={modalField}
          onClose={() => setModalField(null)}
          onApply={(value) => {
            if (modalField.id === 'aboutDescription') setAboutDescription(value);
            else if (modalField.id === 'aboutOrganizerDetail') setAboutOrganizerDetail(value);
            else if (modalField.id === 'aboutSectors') setAboutSectors(value);
            else if (modalField.id === 'aboutBenefits') setAboutBenefits(value);
            else if (modalField.id === 'aboutPrize') setAboutPrize(value);
            else if (modalField.id === 'aboutParticipants') setAboutParticipants(value);
            setModalField(null);
          }}
        />
      )}
    </div>
  );
}
