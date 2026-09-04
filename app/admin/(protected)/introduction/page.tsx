'use client';

import React, { useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import { apiUrl, formatAssetUrl } from '../../api';
import { useAlert } from '../../AlertProvider';
import ImageDropzone from '../../components/ImageDropzone';

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
  const { showPrompt } = useAlert();
  const editorRef = useRef<HTMLDivElement>(null);

  const focusEditor = () => {
    editorRef.current?.focus();
  };

  const runCommand = (command: string, value?: string) => {
    focusEditor();
    document.execCommand(command, false, value);
  };

  const createLink = async () => {
    const url = await showPrompt('Nhập đường dẫn liên kết (URL):', 'https://', 'Chèn liên kết');
    if (!url) return;
    runCommand('createLink', url);
  };

  const applyContent = () => {
    onApply(editorRef.current?.innerHTML || '');
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4" onMouseDown={(event) => event.target === event.currentTarget && onClose()}>
      <div onMouseDown={(event) => event.stopPropagation()} className="w-full max-w-6xl rounded-2xl border border-slate-200 bg-white p-6 shadow-2xl space-y-4">
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
  const { showAlert } = useAlert();
  const [aboutTitle, setAboutTitle] = useState("HUIT'S ICONIC 2026 - ĐẠI SỨ TRUYỀN THÔNG HUIT");
  const [aboutTitleEn, setAboutTitleEn] = useState("HUIT'S ICONIC 2026 - HUIT MEDIA AMBASSADOR");
  const [aboutSubtitle, setAboutSubtitle] = useState('Cuộc thi Tìm kiếm Đại sứ Truyền thông Trường Đại học Công Thương TP.HCM');
  const [aboutSubtitleEn, setAboutSubtitleEn] = useState('Ho Chi Minh City University of Industry and Trade Media Ambassador Search Contest');
  const [aboutDescription, setAboutDescription] = useState('');
  const [aboutDescriptionEn, setAboutDescriptionEn] = useState('');
  const [statsCandidates, setStatsCandidates] = useState('40.000+');
  const [statsVotes, setStatsVotes] = useState('1.000.000+');
  const [statsViews, setStatsViews] = useState('10 triệu+');
  const [statsYear, setStatsYear] = useState('2026');
  const [statsParticipants, setStatsParticipants] = useState('50 Top');
  const [statsMedia, setStatsMedia] = useState('30+');
  const [statsSchools, setStatsSchools] = useState('16+ Khoa');
  const [aboutImageUrl, setAboutImageUrl] = useState('/uploads/poster-khoi-nghiep.jpg');
  
  // New fields
  const [aboutTheme, setAboutTheme] = useState('Vẻ đẹp - Trí tuệ - Tài năng - Bản lĩnh - Truyền cảm hứng');
  const [aboutThemeEn, setAboutThemeEn] = useState('Beauty - Intellect - Talent - Confidence - Inspiration');
  const [aboutOrganizerDetail, setAboutOrganizerDetail] = useState('');
  const [aboutOrganizerDetailEn, setAboutOrganizerDetailEn] = useState('');
  const [aboutSectors, setAboutSectors] = useState('');
  const [aboutSectorsEn, setAboutSectorsEn] = useState('');
  const [aboutBenefits, setAboutBenefits] = useState('');
  const [aboutBenefitsEn, setAboutBenefitsEn] = useState('');
  const [aboutParticipants, setAboutParticipants] = useState('');
  const [aboutParticipantsEn, setAboutParticipantsEn] = useState('');
  const [aboutPrize, setAboutPrize] = useState('');
  const [aboutPrizeEn, setAboutPrizeEn] = useState('');
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
          if (data.aboutTitleEn) setAboutTitleEn(data.aboutTitleEn);
          if (data.aboutSubtitle) setAboutSubtitle(data.aboutSubtitle);
          if (data.aboutSubtitleEn) setAboutSubtitleEn(data.aboutSubtitleEn);
          if (data.aboutTheme) setAboutTheme(data.aboutTheme);
          if (data.aboutThemeEn) setAboutThemeEn(data.aboutThemeEn);
          if (data.aboutDescription) setAboutDescription(data.aboutDescription);
          if (data.aboutDescriptionEn) setAboutDescriptionEn(data.aboutDescriptionEn);
          if (data.statsCandidates) setStatsCandidates(data.statsCandidates);
          if (data.statsVotes) setStatsVotes(data.statsVotes);
          if (data.statsViews) setStatsViews(data.statsViews);
          if (data.statsYear) setStatsYear(data.statsYear);
          if (data.statsParticipants) setStatsParticipants(data.statsParticipants);
          if (data.statsMedia) setStatsMedia(data.statsMedia);
          if (data.statsSchools) setStatsSchools(data.statsSchools);
          if (data.aboutImageUrl) setAboutImageUrl(data.aboutImageUrl);
          
          if (data.aboutOrganizerDetail) setAboutOrganizerDetail(data.aboutOrganizerDetail);
          if (data.aboutOrganizerDetailEn) setAboutOrganizerDetailEn(data.aboutOrganizerDetailEn);
          if (data.aboutSectors) setAboutSectors(data.aboutSectors);
          if (data.aboutSectorsEn) setAboutSectorsEn(data.aboutSectorsEn);
          if (data.aboutBenefits) setAboutBenefits(data.aboutBenefits);
          if (data.aboutBenefitsEn) setAboutBenefitsEn(data.aboutBenefitsEn);
          if (data.aboutParticipants) setAboutParticipants(data.aboutParticipants);
          if (data.aboutParticipantsEn) setAboutParticipantsEn(data.aboutParticipantsEn);
          if (data.aboutPrize) setAboutPrize(data.aboutPrize);
          if (data.aboutPrizeEn) setAboutPrizeEn(data.aboutPrizeEn);
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
          aboutTitleEn,
          aboutSubtitle,
          aboutSubtitleEn,
          aboutTheme,
          aboutThemeEn,
          aboutDescription,
          aboutDescriptionEn,
          statsCandidates,
          statsVotes,
          statsViews,
          statsYear,
          statsParticipants,
          statsMedia,
          statsSchools,
          aboutImageUrl,
          aboutOrganizerDetail,
          aboutOrganizerDetailEn,
          aboutSectors,
          aboutSectorsEn,
          aboutBenefits,
          aboutBenefitsEn,
          aboutParticipants,
          aboutParticipantsEn,
          aboutPrize,
          aboutPrizeEn,
          aboutContactName,
          aboutContactRole,
          aboutContactPhone,
          aboutContactEmail,
          aboutContactWebsite,
          aboutContactQrUrl,
        }),
      });
      if (res.ok) {
        showAlert('Cập nhật thông tin cuộc thi thành công!', 'success');
      } else {
        showAlert('Cập nhật thất bại.', 'error');
      }
    } catch (err) {
      console.error(err);
      showAlert('Lỗi kết nối máy chủ.', 'error');
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
      <section className="flex flex-col gap-4 rounded-xl border border-[#dce5e1] bg-white p-4 shadow-sm md:flex-row md:items-center md:justify-between">
        <div>
          <p className="text-xs font-bold text-[#0f766e] font-heading">Quản lý giao diện</p>
          <h2 className="mt-0.5 text-lg font-bold text-[#123c34] font-heading">Cấu hình thông tin cuộc thi</h2>
          <p className="text-xs text-[#6b7773] mt-0.5">Chỉnh sửa chi tiết nội dung trang Giới thiệu hiển thị trên trang chủ của website bình chọn.</p>
        </div>
        <div className="flex shrink-0 flex-wrap gap-2 text-[10px] font-bold text-[#52605b]">
          <a href="#section-overview" className="rounded-full border border-[#dce5e1] bg-[#fbfdfc] px-3 py-1.5 transition hover:border-[#0f766e] hover:text-[#0f766e]">1. Tổng quan</a>
          <a href="#section-organizer" className="rounded-full border border-[#dce5e1] bg-[#fbfdfc] px-3 py-1.5 transition hover:border-[#0f766e] hover:text-[#0f766e]">2. Đơn vị</a>
          <a href="#section-content" className="rounded-full border border-[#dce5e1] bg-[#fbfdfc] px-3 py-1.5 transition hover:border-[#0f766e] hover:text-[#0f766e]">3. Nội dung</a>
          <a href="#section-timeline" className="rounded-full border border-[#dce5e1] bg-[#fbfdfc] px-3 py-1.5 transition hover:border-[#2b6cb0] hover:text-[#2b6cb0]">4. Lộ trình</a>
          <a href="#section-contact" className="rounded-full border border-[#dce5e1] bg-[#fbfdfc] px-3 py-1.5 transition hover:border-[#0f766e] hover:text-[#0f766e]">5. Liên hệ</a>
        </div>
      </section>

      {/* Main Form */}
      <form onSubmit={handleSubmit} className="space-y-4">
        
        {/* KHỐI 1: TIÊU ĐỀ & GIỚI THIỆU CHUNG */}
        <div id="section-overview" className="scroll-mt-24 rounded-xl border border-[#dce5e1] bg-white p-4 shadow-sm space-y-4 sm:p-5">
          <div className="flex items-center gap-2 pb-2 border-b border-[#edf2f0]">
            <span className="flex h-5 w-5 items-center justify-center rounded-full bg-[#123c34] text-[10px] font-bold text-white">1</span>
            <h3 className="text-sm font-bold text-[#123c34] font-heading">Tiêu đề & Giới thiệu chung</h3>
          </div>
          
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Cột trái: Poster kéo thả */}
            <div className="lg:col-span-1 space-y-4">
              <ImageDropzone
                label="Poster hình ảnh cuộc thi"
                value={aboutImageUrl}
                onChange={setAboutImageUrl}
                aspectRatioHint="Khuyên dùng 4:3 hoặc 16:9"
              />
            </div>

            {/* Cột phải: Tiêu đề & Mô tả */}
            <div className="lg:col-span-2 space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <label className="block space-y-1.5">
                  <span className="text-[10px] font-bold text-[#52605b] uppercase tracking-wider">Tiêu đề chính (Tiếng Việt) <span className="text-red-500 font-bold">*</span></span>
                  <input 
                    type="text" 
                    value={aboutTitle} 
                    onChange={(e) => setAboutTitle(e.target.value)} 
                    className="h-9 w-full rounded-lg border border-[#dce5e1] bg-[#fbfdfc] px-3 text-xs font-bold text-[#123c34] outline-none transition focus:border-[#0f766e] focus:bg-white" 
                    required 
                  />
                </label>

                <label className="block space-y-1.5">
                  <span className="text-[10px] font-bold text-[#52605b] uppercase tracking-wider">Tiêu đề chính tiếng Anh (English Main Title)</span>
                  <input 
                    type="text" 
                    value={aboutTitleEn} 
                    onChange={(e) => setAboutTitleEn(e.target.value)} 
                    placeholder="e.g. HUIT ICONIC SEASON VII 2026"
                    className="h-9 w-full rounded-lg border border-[#dce5e1] bg-[#fbfdfc] px-3 text-xs font-semibold text-[#18211f] outline-none transition focus:border-[#0f766e] focus:bg-white" 
                  />
                </label>

                <label className="block space-y-1.5">
                  <span className="text-[10px] font-bold text-[#52605b] uppercase tracking-wider">Tiêu đề phụ (Tiếng Việt) <span className="text-red-500 font-bold">*</span></span>
                  <input 
                    type="text" 
                    value={aboutSubtitle} 
                    onChange={(e) => setAboutSubtitle(e.target.value)} 
                    className="h-9 w-full rounded-lg border border-[#dce5e1] bg-[#fbfdfc] px-3 text-xs font-semibold text-[#18211f] outline-none transition focus:border-[#0f766e] focus:bg-white" 
                    required 
                  />
                </label>

                <label className="block space-y-1.5">
                  <span className="text-[10px] font-bold text-[#52605b] uppercase tracking-wider">Tiêu đề phụ tiếng Anh (English Subtitle)</span>
                  <input 
                    type="text" 
                    value={aboutSubtitleEn} 
                    onChange={(e) => setAboutSubtitleEn(e.target.value)} 
                    placeholder="e.g. The 7th HUIT ICONIC Competition..."
                    className="h-9 w-full rounded-lg border border-[#dce5e1] bg-[#fbfdfc] px-3 text-xs font-semibold text-[#18211f] outline-none transition focus:border-[#0f766e] focus:bg-white" 
                  />
                </label>

                <label className="block space-y-1.5">
                  <span className="text-[10px] font-bold text-[#52605b] uppercase tracking-wider">Chủ đề cuộc thi (Tiếng Việt) <span className="text-red-500 font-bold">*</span></span>
                  <input 
                    type="text" 
                    value={aboutTheme} 
                    onChange={(e) => setAboutTheme(e.target.value)} 
                    className="h-9 w-full rounded-lg border border-[#dce5e1] bg-[#fbfdfc] px-3 text-xs font-semibold text-[#18211f] outline-none transition focus:border-[#0f766e] focus:bg-white" 
                    required 
                  />
                </label>

                <label className="block space-y-1.5">
                  <span className="text-[10px] font-bold text-[#52605b] uppercase tracking-wider">Chủ đề tiếng Anh (English Theme)</span>
                  <input 
                    type="text" 
                    value={aboutThemeEn} 
                    onChange={(e) => setAboutThemeEn(e.target.value)} 
                    placeholder="e.g. Innovation Towards Sustainable Development Goals"
                    className="h-9 w-full rounded-lg border border-[#dce5e1] bg-[#fbfdfc] px-3 text-xs font-semibold text-[#18211f] outline-none transition focus:border-[#0f766e] focus:bg-white" 
                  />
                </label>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="block space-y-1.5">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-bold text-[#52605b] uppercase tracking-wider">Mô tả tổng quan (Tiếng Việt) <span className="text-red-500 font-bold">*</span></span>
                    <button
                      type="button"
                      onClick={() => setModalField({ id: 'aboutDescription', title: 'Mô tả tổng quan (Tiếng Việt)', value: aboutDescription })}
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
                    className="h-28 w-full resize-y rounded-lg border border-[#dce5e1] bg-[#fbfdfc] p-3 text-xs font-semibold text-[#18211f] leading-relaxed outline-none transition focus:border-[#0f766e] focus:bg-white" 
                    required 
                  />
                </div>

                <div className="block space-y-1.5">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-bold text-[#52605b] uppercase tracking-wider">Mô tả tổng quan tiếng Anh (English Description)</span>
                    <button
                      type="button"
                      onClick={() => setModalField({ id: 'aboutDescriptionEn', title: 'Mô tả tổng quan tiếng Anh', value: aboutDescriptionEn })}
                      className="text-[#0f766e] hover:text-[#0d5c56] text-[10px] font-bold flex items-center gap-1 transition"
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M15 3h6v6M9 21H3v-6M21 3l-7 7M3 21l7-7"/>
                      </svg>
                      Mở rộng
                    </button>
                  </div>
                  <textarea 
                    value={aboutDescriptionEn} 
                    onChange={(e) => setAboutDescriptionEn(e.target.value)} 
                    placeholder="English description and overview..."
                    className="h-28 w-full resize-y rounded-lg border border-[#dce5e1] bg-[#fbfdfc] p-3 text-xs font-semibold text-[#18211f] leading-relaxed outline-none transition focus:border-[#0f766e] focus:bg-white" 
                  />
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* KHỐI 2: ĐƠN VỊ TỔ CHỨC & ĐỒNG HÀNH */}
        <div id="section-organizer" className="scroll-mt-24 rounded-xl border border-[#dce5e1] bg-white p-4 shadow-sm space-y-4 sm:p-5">
          <div className="flex items-center gap-2 pb-2 border-b border-[#edf2f0]">
            <span className="flex h-5 w-5 items-center justify-center rounded-full bg-[#123c34] text-[10px] font-bold text-white">2</span>
            <h3 className="text-sm font-bold text-[#123c34] font-heading">Đơn vị tổ chức & đồng hành</h3>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="block space-y-1.5">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-bold text-[#52605b] uppercase tracking-wider">Nội dung đối tác (Tiếng Việt) <span className="text-red-500 font-bold">*</span></span>
                <button
                  type="button"
                  onClick={() => setModalField({ id: 'aboutOrganizerDetail', title: 'Đơn vị tổ chức & đồng hành (Tiếng Việt)', value: aboutOrganizerDetail })}
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
                className="h-32 w-full resize-y rounded-lg border border-[#dce5e1] bg-[#fbfdfc] p-3 text-xs font-semibold text-[#18211f] leading-relaxed outline-none transition focus:border-[#0f766e] focus:bg-white" 
                placeholder="Đơn vị tổ chức: ...&#10;Tài trợ kim cương: ...&#10;Đơn vị phối hợp: ..."
                required 
              />
            </div>

            <div className="block space-y-1.5">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-bold text-[#52605b] uppercase tracking-wider">Nội dung đối tác tiếng Anh (English Partners Detail)</span>
                <button
                  type="button"
                  onClick={() => setModalField({ id: 'aboutOrganizerDetailEn', title: 'Đơn vị tổ chức & đồng hành tiếng Anh', value: aboutOrganizerDetailEn })}
                  className="text-[#0f766e] hover:text-[#0d5c56] text-[10px] font-bold flex items-center gap-1 transition"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M15 3h6v6M9 21H3v-6M21 3l-7 7M3 21l7-7"/>
                  </svg>
                  Mở rộng
                </button>
              </div>
              <textarea 
                value={aboutOrganizerDetailEn} 
                onChange={(e) => setAboutOrganizerDetailEn(e.target.value)} 
                className="h-32 w-full resize-y rounded-lg border border-[#dce5e1] bg-[#fbfdfc] p-3 text-xs font-semibold text-[#18211f] leading-relaxed outline-none transition focus:border-[#0f766e] focus:bg-white" 
                placeholder="Organizers: ...&#10;Diamond Sponsor: ...&#10;Partners: ..."
              />
            </div>
          </div>
        </div>

        {/* KHỐI 3: LĨNH VỰC, QUYỀN LỢI & GIẢI THƯỞNG */}
        <div id="section-content" className="scroll-mt-24 grid grid-cols-1 gap-4 lg:grid-cols-3">
          <div className="rounded-xl border border-[#dce5e1] bg-white p-4 shadow-sm space-y-4 sm:p-5">
            <div className="flex items-center gap-2 pb-2 border-b border-[#edf2f0]">
              <span className="flex h-5 min-w-[20px] px-1 items-center justify-center rounded-full bg-[#123c34] text-[10px] font-bold text-white">3A</span>
              <h3 className="text-sm font-bold text-[#123c34] font-heading">Lĩnh vực dự thi</h3>
            </div>
            <div className="space-y-3">
              <div className="block space-y-1.5">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-bold text-[#52605b] uppercase tracking-wider">Tiếng Việt <span className="text-red-500 font-bold">*</span></span>
                  <button
                    type="button"
                    onClick={() => setModalField({ id: 'aboutSectors', title: 'Lĩnh vực dự thi (Tiếng Việt)', value: aboutSectors })}
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
                  className="h-28 w-full resize-y rounded-lg border border-[#dce5e1] bg-[#fbfdfc] p-3 text-xs font-semibold text-[#18211f] leading-relaxed outline-none transition focus:border-[#0f766e] focus:bg-white" 
                  placeholder="Đo chỉ số hình thể & Trình diễn Catwalk&#10;Thử thách Photoshoot & Xây dựng hình ảnh&#10;Phần thi Tài năng & Sân khấu hóa nghệ thuật..."
                  required 
                />
              </div>

              <div className="block space-y-1.5">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-bold text-[#52605b] uppercase tracking-wider">Tiếng Anh (English Sectors)</span>
                  <button
                    type="button"
                    onClick={() => setModalField({ id: 'aboutSectorsEn', title: 'Lĩnh vực dự thi (Tiếng Anh)', value: aboutSectorsEn })}
                    className="text-[#0f766e] hover:text-[#0d5c56] text-[10px] font-bold flex items-center gap-1 transition"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M15 3h6v6M9 21H3v-6M21 3l-7 7M3 21l7-7"/>
                    </svg>
                    Mở rộng
                  </button>
                </div>
                <textarea 
                  value={aboutSectorsEn} 
                  onChange={(e) => setAboutSectorsEn(e.target.value)} 
                  className="h-28 w-full resize-y rounded-lg border border-[#dce5e1] bg-[#fbfdfc] p-3 text-xs font-semibold text-[#18211f] leading-relaxed outline-none transition focus:border-[#0f766e] focus:bg-white" 
                  placeholder="Industry, AI, Digital Transformation...&#10;Food Tech, Agriculture..."
                />
              </div>
            </div>
          </div>

          <div className="rounded-xl border border-[#dce5e1] bg-white p-4 shadow-sm space-y-4 sm:p-5">
            <div className="flex items-center gap-2 pb-2 border-b border-[#edf2f0]">
              <span className="flex h-5 min-w-[20px] px-1 items-center justify-center rounded-full bg-[#123c34] text-[10px] font-bold text-white">3B</span>
              <h3 className="text-sm font-bold text-[#123c34] font-heading">Quyền lợi khi tham gia</h3>
            </div>
            <div className="space-y-3">
              <div className="block space-y-1.5">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-bold text-[#52605b] uppercase tracking-wider">Tiếng Việt <span className="text-red-500 font-bold">*</span></span>
                  <button
                    type="button"
                    onClick={() => setModalField({ id: 'aboutBenefits', title: 'Quyền lợi khi tham gia (Tiếng Việt)', value: aboutBenefits })}
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
                  className="h-28 w-full resize-y rounded-lg border border-[#dce5e1] bg-[#fbfdfc] p-3 text-xs font-semibold text-[#18211f] leading-relaxed outline-none transition focus:border-[#0f766e] focus:bg-white" 
                  placeholder="Đào tạo kỹ năng catwalk, phong thái sân khấu&#10;Kỹ năng giao tiếp và xây dựng thương hiệu cá nhân..."
                  required 
                />
              </div>

              <div className="block space-y-1.5">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-bold text-[#52605b] uppercase tracking-wider">Tiếng Anh (English Benefits)</span>
                  <button
                    type="button"
                    onClick={() => setModalField({ id: 'aboutBenefitsEn', title: 'Quyền lợi khi tham gia (Tiếng Anh)', value: aboutBenefitsEn })}
                    className="text-[#0f766e] hover:text-[#0d5c56] text-[10px] font-bold flex items-center gap-1 transition"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M15 3h6v6M9 21H3v-6M21 3l-7 7M3 21l7-7"/>
                    </svg>
                    Mở rộng
                  </button>
                </div>
                <textarea 
                  value={aboutBenefitsEn} 
                  onChange={(e) => setAboutBenefitsEn(e.target.value)} 
                  className="h-28 w-full resize-y rounded-lg border border-[#dce5e1] bg-[#fbfdfc] p-3 text-xs font-semibold text-[#18211f] leading-relaxed outline-none transition focus:border-[#0f766e] focus:bg-white" 
                  placeholder="Catwalk & stage presence coaching&#10;Communication & public speaking skills..."
                />
              </div>
            </div>
          </div>

          <div className="rounded-xl border border-[#dce5e1] bg-white p-4 shadow-sm space-y-4 sm:p-5">
            <div className="flex items-center gap-2 pb-2 border-b border-[#edf2f0]">
              <span className="flex h-5 min-w-[20px] px-1 items-center justify-center rounded-full bg-[#123c34] text-[10px] font-bold text-white">3C</span>
              <h3 className="text-sm font-bold text-[#123c34] font-heading">Giải thưởng cuộc thi</h3>
            </div>
            <div className="space-y-3">
              <div className="block space-y-1.5">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-bold text-[#52605b] uppercase tracking-wider">Tiếng Việt <span className="text-red-500 font-bold">*</span></span>
                  <button
                    type="button"
                    onClick={() => setModalField({ id: 'aboutPrize', title: 'Giải thưởng cuộc thi (Tiếng Việt)', value: aboutPrize })}
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
                  className="h-28 w-full resize-y rounded-lg border border-[#dce5e1] bg-[#fbfdfc] p-3 text-xs font-semibold text-[#18211f] leading-relaxed outline-none transition focus:border-[#0f766e] focus:bg-white" 
                  placeholder="Tổng giá trị giải thưởng 05 Tỷ đồng gồm..."
                  required 
                />
              </div>

              <div className="block space-y-1.5">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-bold text-[#52605b] uppercase tracking-wider">Tiếng Anh (English Prize)</span>
                  <button
                    type="button"
                    onClick={() => setModalField({ id: 'aboutPrizeEn', title: 'Giải thưởng cuộc thi (Tiếng Anh)', value: aboutPrizeEn })}
                    className="text-[#0f766e] hover:text-[#0d5c56] text-[10px] font-bold flex items-center gap-1 transition"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M15 3h6v6M9 21H3v-6M21 3l-7 7M3 21l7-7"/>
                    </svg>
                    Mở rộng
                  </button>
                </div>
                <textarea 
                  value={aboutPrizeEn} 
                  onChange={(e) => setAboutPrizeEn(e.target.value)} 
                  className="h-28 w-full resize-y rounded-lg border border-[#dce5e1] bg-[#fbfdfc] p-3 text-xs font-semibold text-[#18211f] leading-relaxed outline-none transition focus:border-[#0f766e] focus:bg-white" 
                  placeholder="Total prize value of 5 Billion VND including..."
                />
              </div>
            </div>
          </div>
        </div>

        {/* KHỐI 4: LỘ TRÌNH THỜI GIAN THỰC HIỆN */}
        <div id="section-timeline" className="scroll-mt-24 rounded-xl border border-[#bee3f8] bg-[#ebf8ff] p-4 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4 sm:p-5">
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
                <h3 className="text-sm font-bold text-[#2b6cb0] font-heading">Thời gian & Lộ trình thực hiện</h3>
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
        <div id="section-contact" className="scroll-mt-24 grid grid-cols-1 gap-4 lg:grid-cols-3">
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
            <div className="space-y-3">
              <div className="block space-y-1.5">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-bold text-[#52605b] uppercase tracking-wider">Tiếng Việt <span className="text-red-500 font-bold">*</span></span>
                  <button
                    type="button"
                    onClick={() => setModalField({ id: 'aboutParticipants', title: 'Đối tượng tham gia (Tiếng Việt)', value: aboutParticipants })}
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
                  className="h-28 w-full resize-y rounded-lg border border-[#dce5e1] bg-[#fbfdfc] p-3 text-xs font-semibold text-[#18211f] leading-relaxed outline-none transition focus:border-[#0f766e] focus:bg-white" 
                  placeholder="Học sinh: THPT, GDTX, trung cấp có ý tưởng...&#10;Sinh viên, học viên: Đang học tại các trường..."
                  required 
                />
              </div>

              <div className="block space-y-1.5">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-bold text-[#52605b] uppercase tracking-wider">Tiếng Anh (English Participants)</span>
                  <button
                    type="button"
                    onClick={() => setModalField({ id: 'aboutParticipantsEn', title: 'Đối tượng tham gia (Tiếng Anh)', value: aboutParticipantsEn })}
                    className="text-[#0f766e] hover:text-[#0d5c56] text-[10px] font-bold flex items-center gap-1 transition"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M15 3h6v6M9 21H3v-6M21 3l-7 7M3 21l7-7"/>
                    </svg>
                    Mở rộng
                  </button>
                </div>
                <textarea 
                  value={aboutParticipantsEn} 
                  onChange={(e) => setAboutParticipantsEn(e.target.value)} 
                  className="h-28 w-full resize-y rounded-lg border border-[#dce5e1] bg-[#fbfdfc] p-3 text-xs font-semibold text-[#18211f] leading-relaxed outline-none transition focus:border-[#0f766e] focus:bg-white" 
                  placeholder="High school students with ideas...&#10;College and university students..."
                />
              </div>
            </div>
          </div>

          {/* Cột 3: Liên hệ & Đăng ký */}
          <div className="rounded-xl border border-[#dce5e1] bg-white p-5 shadow-sm space-y-4">
            <div className="flex items-center gap-2 pb-2 border-b border-[#edf2f0]">
              <span className="flex h-5 min-w-[20px] px-1 items-center justify-center rounded-full bg-[#123c34] text-[10px] font-bold text-white">5C</span>
              <h3 className="text-sm font-bold text-[#123c34] font-heading">Thông tin liên hệ & Đăng ký</h3>
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

              <ImageDropzone
                label="Mã QR Đăng ký / Liên hệ"
                value={aboutContactQrUrl}
                onChange={setAboutContactQrUrl}
                aspectRatioHint="Hình vuông 1:1"
              />
            </div>
          </div>
        </div>

        {/* Form Action Submit */}
        <div className="sticky bottom-0 z-20 rounded-xl border border-[#dce5e1] bg-white/95 p-3 shadow-lg backdrop-blur-sm flex justify-end sm:p-4">
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
            else if (modalField.id === 'aboutDescriptionEn') setAboutDescriptionEn(value);
            else if (modalField.id === 'aboutOrganizerDetail') setAboutOrganizerDetail(value);
            else if (modalField.id === 'aboutOrganizerDetailEn') setAboutOrganizerDetailEn(value);
            else if (modalField.id === 'aboutSectors') setAboutSectors(value);
            else if (modalField.id === 'aboutSectorsEn') setAboutSectorsEn(value);
            else if (modalField.id === 'aboutBenefits') setAboutBenefits(value);
            else if (modalField.id === 'aboutBenefitsEn') setAboutBenefitsEn(value);
            else if (modalField.id === 'aboutPrize') setAboutPrize(value);
            else if (modalField.id === 'aboutPrizeEn') setAboutPrizeEn(value);
            else if (modalField.id === 'aboutParticipants') setAboutParticipants(value);
            else if (modalField.id === 'aboutParticipantsEn') setAboutParticipantsEn(value);
            setModalField(null);
          }}
        />
      )}
    </div>
  );
}
