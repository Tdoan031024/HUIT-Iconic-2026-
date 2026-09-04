'use client';

import React, { useState, useEffect, useRef } from 'react';
import { apiUrl, formatAssetUrl } from '../../api';
import { useAlert } from '../../AlertProvider';
import ImageDropzone from '../../components/ImageDropzone';

function parseMarkdownToHtml(markdown: string): string {
  if (!markdown) return '';
  
  // If it's already full of HTML block tags, return as is
  const trimmed = markdown.trim();
  if (trimmed.startsWith('<p>') || trimmed.startsWith('<h3>') || trimmed.startsWith('<div>') || trimmed.startsWith('<h1') || trimmed.startsWith('<h2')) {
    return markdown;
  }

  let html = markdown
    // Checkbox lists (must come before standard bullet lists)
    .replace(/^\s*-\s+\[x\]\s+(.*$)/gim, '<li class="list-none flex items-center gap-1.5"><input type="checkbox" checked disabled class="accent-[#0f766e] h-3.5 w-3.5" /> <span>$1</span></li>')
    .replace(/^\s*-\s+\[\s*\]\s+(.*$)/gim, '<li class="list-none flex items-center gap-1.5"><input type="checkbox" disabled class="h-3.5 w-3.5" /> <span>$1</span></li>')
    // Bullet list items:
    .replace(/^\s*-\s+(.*$)/gim, '<li class="list-disc ml-5">$1</li>')
    .replace(/^\s*\*\s+(.*$)/gim, '<li class="list-disc ml-5">$1</li>')
    // Number list items:
    .replace(/^\s*\d+\.\s+(.*$)/gim, '<li class="list-decimal ml-5">$1</li>')
    // Blockquotes:
    .replace(/^\>\s+(.*$)/gim, '<blockquote class="border-l-4 border-slate-300 pl-3.5 py-0.5 my-2.5 text-slate-500 italic">$1</blockquote>')
    // Headers:
    .replace(/^### (.*$)/gim, '<h3 class="text-sm font-bold mt-4 mb-2 text-[#123c34]">$1</h3>')
    .replace(/^## (.*$)/gim, '<h2 class="text-base font-extrabold mt-5 mb-2.5 text-[#123c34]">$1</h2>')
    .replace(/^# (.*$)/gim, '<h1 class="text-lg font-black mt-6 mb-3 text-[#123c34]">$1</h1>')
    // Bold:
    .replace(/\*\*(.*?)\*\*/gim, '<strong>$1</strong>')
    // Italic:
    .replace(/\*(.*?)\*/gim, '<em>$1</em>')
    // Strikethrough:
    .replace(/~~(.*?)~~/gim, '<del>$1</del>')
    // Images:
    .replace(/\!\[(.*?)\]\((.*?)\)/gim, '<img src="$2" alt="$1" class="max-w-full rounded-xl my-4 mx-auto block shadow-md" />')
    // Links:
    .replace(/\[(.*?)\]\((.*?)\)/gim, '<a href="$2" class="text-[#0f766e] hover:underline" target="_blank">$1</a>')
    // Code blocks:
    .replace(/```([\s\S]*?)```/gm, '<pre class="bg-slate-100 p-3 rounded-lg border border-slate-200 font-mono text-[11px] my-3 overflow-x-auto select-text">$1</pre>')
    // Inline code:
    .replace(/`(.*?)`/g, '<code class="bg-slate-100 text-red-600 px-1 rounded font-mono select-text">$1</code>')
    // Horizontal rule:
    .replace(/^---$/gim, '<hr class="my-4 border-slate-200" />')
    // Simple table parser
    .replace(/\|(.+?)\|/g, (match, p1) => {
      const cells = p1.split('|').map((c: string) => c.trim());
      // Skip alignment lines like |---|---|
      if (cells.every((c: string) => /^-+$/.test(c))) return '';
      const tdType = match.includes('Header') || cells.every((c: string) => c.toUpperCase() === c) ? 'th' : 'td';
      return `<tr class="border-b border-slate-200">${cells.map((c: string) => `<${tdType} class="px-3 py-1.5 border border-slate-200">${c}</${tdType}>`).join('')}</tr>`;
    });

  // Paragraphs:
  html = html
    .split('\n\n')
    .map(para => {
      const pTrim = para.trim();
      if (!pTrim) return '';
      if (pTrim.startsWith('<h') || pTrim.startsWith('<ul') || pTrim.startsWith('<ol') || pTrim.startsWith('<li') || pTrim.startsWith('<tr') || pTrim.startsWith('<img') || pTrim.startsWith('<div') || pTrim.startsWith('<p>') || pTrim.startsWith('<blockquote') || pTrim.startsWith('<pre') || pTrim.startsWith('<hr')) {
        return pTrim;
      }
      return `<p>${pTrim.replace(/\n/g, '<br />')}</p>`;
    })
    .join('\n');

  // Wrap rows in table
  if (html.includes('<tr')) {
    html = html.replace(/(<tr[\s\S]*?<\/tr>)/g, '<table class="w-full border-collapse border border-slate-200 my-3 text-xs">$1</table>');
  }

  return html;
}

interface Post {
  id: string;
  title: string;
  titleEn?: string | null;
  slug: string;
  summary: string | null;
  summaryEn?: string | null;
  content: string;
  contentEn?: string | null;
  thumbnailUrl: string | null;
  category: string;
  views: number;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

function slugify(text: string): string {
  let str = text.toLowerCase();
  str = str.replace(/á|à|ả|ã|ạ|ă|ắ|ằ|ẳ|ẵ|ặ|â|ấ|ầ|ẩ|ẫ|ậ/g, 'a');
  str = str.replace(/é|è|ẻ|ẽ|ẹ|ê|ế|ề|ể|ễ|ệ/g, 'e');
  str = str.replace(/i|í|ì|ỉ|ĩ|ị/g, 'i');
  str = str.replace(/ó|ò|ỏ|õ|ọ|ô|ố|ồ|ổ|ỗ|ộ|ơ|ớ|ờ|ở|ỡ|ợ/g, 'o');
  str = str.replace(/ú|ù|ủ|ũ|ụ|ư|ứ|ừ|ử|ữ|ự/g, 'u');
  str = str.replace(/ý|ỳ|ỷ|ỹ|ỵ/g, 'y');
  str = str.replace(/đ/g, 'd');
  str = str.replace(/[^a-z0-9\s-]/g, '');
  str = str.replace(/\s+/g, '-');
  str = str.replace(/-+/g, '-');
  str = str.trim().replace(/^-+|-+$/g, '');
  return str;
}

export default function NewsAdminPage() {
  const { showAlert, showConfirm, showPrompt } = useAlert();
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  
  // Modal states
  const [modalMode, setModalMode] = useState<'add' | 'edit' | null>(null);
  const [selectedPost, setSelectedPost] = useState<Post | null>(null);
  
  // Form fields
  const [formTitle, setFormTitle] = useState('');
  const [formTitleEn, setFormTitleEn] = useState('');
  const [formSlug, setFormSlug] = useState('');
  const [formCategory, setFormCategory] = useState('Tin tức');
  const [formThumbnailUrl, setFormThumbnailUrl] = useState('');
  const [formSummary, setFormSummary] = useState('');
  const [formSummaryEn, setFormSummaryEn] = useState('');
  const [formContent, setFormContent] = useState('');
  const [formContentEn, setFormContentEn] = useState('');
  const [formIsActive, setFormIsActive] = useState(true);
  const [activeEditorTab, setActiveEditorTab] = useState<'edit' | 'preview' | 'seo'>('edit');
  const [isSlugCustomized, setIsSlugCustomized] = useState(false);
  const [isMaximized, setIsMaximized] = useState(false);
  const [customPrompt, setCustomPrompt] = useState<{
    isOpen: boolean;
    type: 'link' | 'image';
    title: string;
    label1: string;
    label2: string;
    val1: string;
    val2: string;
  }>({
    isOpen: false,
    type: 'link',
    title: '',
    label1: '',
    label2: '',
    val1: '',
    val2: ''
  });
  const [showPreviewPane, setShowPreviewPane] = useState(false);
  const [editorMode, setEditorMode] = useState<'wysiwyg' | 'raw'>('wysiwyg');
  const editorRef = useRef<HTMLDivElement>(null);

  // Sync content state to editable div when mounting/switching
  useEffect(() => {
    if (editorMode === 'wysiwyg' && editorRef.current) {
      if (editorRef.current.innerHTML !== formContent) {
        editorRef.current.innerHTML = formContent;
      }
    }
  }, [editorMode, modalMode, formContent]);

  const loadPosts = async () => {
    try {
      setLoading(true);
      const res = await fetch(apiUrl('/api/admin/posts'));
      if (res.ok) {
        const data = await res.json();
        setPosts(data);
      }
    } catch (e) {
      console.error('Lỗi tải danh sách bài viết:', e);
      setPosts([]);
    } finally {
      setLoading(false);
    }
  };

  const handleWysiwygInput = () => {
    if (editorRef.current) {
      setFormContent(editorRef.current.innerHTML);
    }
  };

  useEffect(() => {
    loadPosts();
  }, []);

  const openAddModal = () => {
    setFormTitle('');
    setFormTitleEn('');
    setFormSlug('');
    setFormCategory('Tin tức');
    setFormThumbnailUrl('');
    setFormSummary('');
    setFormSummaryEn('');
    setFormContent('');
    setFormContentEn('');
    setFormIsActive(true);
    setActiveEditorTab('edit');
    setIsSlugCustomized(false);
    setIsMaximized(false);
    setShowPreviewPane(false);
    setModalMode('add');
  };

  const openEditModal = (p: Post) => {
    setSelectedPost(p);
    setFormTitle(p.title);
    setFormTitleEn(p.titleEn || '');
    setFormSlug(p.slug);
    setFormCategory(p.category);
    setFormThumbnailUrl(p.thumbnailUrl || '');
    setFormSummary(p.summary || '');
    setFormSummaryEn(p.summaryEn || '');
    setFormContent(p.content);
    setFormContentEn(p.contentEn || '');
    setFormIsActive(p.isActive);
    setActiveEditorTab('edit');
    setIsSlugCustomized(true);
    setIsMaximized(false);
    setShowPreviewPane(false);
    setModalMode('edit');
  };

  const handleAddSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const newPost = {
      title: formTitle,
      titleEn: formTitleEn || undefined,
      slug: formSlug || undefined,
      category: formCategory,
      thumbnailUrl: formThumbnailUrl || undefined,
      summary: formSummary || undefined,
      summaryEn: formSummaryEn || undefined,
      content: editorMode === 'wysiwyg' ? formContent : parseMarkdownToHtml(formContent),
      contentEn: formContentEn || undefined,
      isActive: formIsActive,
    };

    try {
      const res = await fetch(apiUrl('/api/admin/posts'), {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newPost),
      });
      if (res.ok) {
        setModalMode(null);
        alert('Tạo bài viết mới thành công!');
        loadPosts();
        return;
      }
    } catch (err) {
      console.error(err);
    }
    alert('Không thể kết nối đến server để tạo bài viết.');
  };

  const handleEditSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedPost) return;

    const fieldsToUpdate = {
      title: formTitle,
      titleEn: formTitleEn || undefined,
      slug: formSlug || undefined,
      category: formCategory,
      thumbnailUrl: formThumbnailUrl,
      summary: formSummary,
      summaryEn: formSummaryEn,
      content: editorMode === 'wysiwyg' ? formContent : parseMarkdownToHtml(formContent),
      contentEn: formContentEn,
      isActive: formIsActive,
    };

    try {
      const res = await fetch(apiUrl(`/api/admin/posts/${selectedPost.id}`), {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(fieldsToUpdate),
      });
      if (res.ok) {
        setModalMode(null);
        showAlert('Cập nhật bài viết thành công!', 'success');
        loadPosts();
        return;
      }
    } catch (err) {
      console.error(err);
    }
    showAlert('Không thể kết nối đến server để cập nhật bài viết.', 'error');
  };

  const handleDelete = async (id: string) => {
    const ok = await showConfirm('Bạn có chắc chắn muốn xóa bài viết này không? Thao tác này không thể khôi phục.', 'Xác nhận xóa bài viết', 'error', 'Xóa ngay');
    if (!ok) return;

    try {
      const res = await fetch(apiUrl(`/api/admin/posts/${id}`), {
        method: 'DELETE',
      });
      if (res.ok) {
        showAlert('Xóa bài viết thành công!', 'success');
        loadPosts();
        return;
      }
    } catch (err) {
      console.error(err);
    }
    showAlert('Không thể kết nối đến server để xóa bài viết.', 'error');
  };

  const insertTag = (startTag: string, endTag: string) => {
    const textarea = document.getElementById('post-content-textarea') as HTMLTextAreaElement;
    if (!textarea) return;
    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const text = textarea.value;
    const selected = text.substring(start, end);
    const replacement = startTag + selected + endTag;
    const newValue = text.substring(0, start) + replacement + text.substring(end);
    setFormContent(newValue);
    
    setTimeout(() => {
      textarea.focus();
      textarea.setSelectionRange(start + startTag.length, start + startTag.length + selected.length);
    }, 0);
  };

  const openCustomPrompt = (type: 'link' | 'image') => {
    const textarea = document.getElementById('post-content-textarea') as HTMLTextAreaElement;
    let selectedText = '';
    if (textarea) {
      const start = textarea.selectionStart;
      const end = textarea.selectionEnd;
      selectedText = textarea.value.substring(start, end);
    }
    
    setCustomPrompt({
      isOpen: true,
      type,
      title: type === 'link' ? 'Chèn liên kết URL' : 'Chèn hình ảnh từ URL',
      label1: type === 'link' ? 'Văn bản hiển thị' : 'Mô tả ảnh (Alt-text)',
      label2: type === 'link' ? 'Địa chỉ liên kết (URL)' : 'Đường dẫn hình ảnh (URL)',
      val1: selectedText || (type === 'link' ? 'Xem liên kết' : 'Mô tả hình ảnh'),
      val2: type === 'link' ? 'https://' : 'https://'
    });
  };

  const handleCustomPromptSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const textarea = document.getElementById('post-content-textarea') as HTMLTextAreaElement;
    if (!textarea) {
      setCustomPrompt(prev => ({ ...prev, isOpen: false }));
      return;
    }
    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const text = textarea.value;
    const { type, val1, val2 } = customPrompt;
    
    let replacement = '';
    if (type === 'link') {
      replacement = `[${val1 || 'Liên kết'}](${val2 || 'https://'})`;
    } else {
      replacement = `![${val1 || 'Mô tả ảnh'}](${val2 || 'https://'})`;
    }
    
    const newValue = text.substring(0, start) + replacement + text.substring(end);
    setFormContent(newValue);
    setCustomPrompt(prev => ({ ...prev, isOpen: false }));
    
    setTimeout(() => {
      textarea.focus();
      const newCursorPos = start + replacement.length;
      textarea.setSelectionRange(newCursorPos, newCursorPos);
    }, 0);
  };

  const filteredPosts = posts.filter(p =>
    p.title.toLowerCase().includes(search.toLowerCase()) || p.category.toLowerCase().includes(search.toLowerCase())
  );

  const formatDate = (dateStr: string) => {
    try {
      let val = dateStr.trim();
      if (!val.includes('Z') && !/\+\d{2}:?\d{2}$/.test(val) && !/-\d{2}:?\d{2}$/.test(val)) val = `${val}+07:00`;
      const d = new Date(val);
      const pad = (n: number) => String(n).padStart(2, '0');
      const utc7 = new Date(d.getTime() + 7 * 60 * 60 * 1000);
      return `${pad(utc7.getUTCHours())}:${pad(utc7.getUTCMinutes())} ngày ${pad(utc7.getUTCDate())}/${pad(utc7.getUTCMonth() + 1)}/${utc7.getUTCFullYear()}`;
    } catch {
      return dateStr;
    }
  };

  return (
    <div className="flex flex-col space-y-4">
      {/* Header section */}
      <div className="flex flex-col gap-3 rounded-xl border border-[#dce5e1] bg-white p-4 shadow-sm md:flex-row md:items-center md:justify-between">
        <div>
          <p className="text-[10px] font-bold uppercase tracking-[0.16em] text-[#0f766e]">Cổng thông tin</p>
          <h1 className="text-lg font-black text-[#123c34]">Tin tức & Thông báo</h1>
          <p className="text-xs text-[#6b7773] mt-0.5">Quản lý và soạn thảo tin tức, hoạt động, thông báo đăng tải lên website chính.</p>
        </div>
        <button 
          onClick={openAddModal}
          className="px-3.5 py-2 bg-[#e45136] hover:bg-[#c83f28] rounded-lg text-white font-bold text-[11px] shadow transition active:scale-[0.98]"
        >
          + Viết bài mới
        </button>
      </div>

      {/* Filter / Search bar */}
      <div className="w-full max-w-md">
        <input 
          type="text" 
          placeholder="Tìm kiếm bài viết theo tiêu đề hoặc danh mục..." 
          className="w-full h-9 px-4 rounded-lg bg-white border border-[#dce5e1] text-[#18211f] placeholder-[#9aa9a4] text-xs focus:outline-none focus:border-[#0f766e] transition-colors shadow-sm"
          value={search}
          onChange={e => setSearch(e.target.value)}
        />
      </div>

      {/* Posts Table */}
      <div className="w-full bg-white border border-[#dce5e1] rounded-xl overflow-hidden shadow-sm">
        <table className="w-full border-collapse text-left text-[#18211f]">
          <thead className="bg-[#fbfdfc] text-[10px] font-black uppercase tracking-wider text-[#7a8b85] border-b border-[#edf2f0]">
            <tr>
              <th className="px-5 py-3 w-20">Ảnh bìa</th>
              <th className="px-5 py-3">Tiêu đề bài viết</th>
              <th className="px-5 py-3 w-32">Danh mục</th>
              <th className="px-5 py-3 w-24">Lượt xem</th>
              <th className="px-5 py-3 w-28">Trạng thái</th>
              <th className="px-5 py-3 w-28">Ngày viết</th>
              <th className="px-5 py-3 text-center w-24">Hành động</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[#edf2f0] text-xs">
            {loading ? (
              <tr>
                <td colSpan={7} className="px-5 py-10 text-center text-sm font-semibold text-[#7a8b85]">
                  Đang tải danh sách bài viết...
                </td>
              </tr>
            ) : filteredPosts.length === 0 ? (
              <tr>
                <td colSpan={7} className="px-5 py-10 text-center text-sm font-semibold text-[#7a8b85]">
                  Chưa có bài viết nào được tạo hoặc phù hợp bộ lọc.
                </td>
              </tr>
            ) : (
              filteredPosts.map(p => (
                <tr key={p.id} className="hover:bg-[#edf4f1]/20 transition-colors">
                  <td className="px-5 py-2.5">
                    <div className="bg-slate-100 rounded border border-[#dce5e1] w-14 h-9 overflow-hidden flex items-center justify-center shadow-sm">
                      <img src={formatAssetUrl(p.thumbnailUrl || undefined) || '/uploads/baner.jpg'} className="w-full h-full object-cover" alt="Thumb" />
                    </div>
                  </td>
                  <td className="px-5 py-2.5 font-bold text-[#123c34] max-w-sm truncate" title={p.title}>{p.title}</td>
                  <td className="px-5 py-2.5">
                    <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold border ${
                      p.category === 'Thông báo' 
                        ? 'border-indigo-200 bg-indigo-50 text-indigo-700' 
                        : 'border-teal-200 bg-teal-50 text-teal-700'
                    }`}>
                      {p.category}
                    </span>
                  </td>
                  <td className="px-5 py-2.5 font-semibold text-slate-500">👁️ {p.views.toLocaleString()}</td>
                  <td className="px-5 py-2.5">
                    <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold ${
                      p.isActive 
                        ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' 
                        : 'bg-red-50 text-red-700 border border-red-200'
                    }`}>
                      <span className={`h-1.5 w-1.5 rounded-full ${p.isActive ? 'bg-emerald-500' : 'bg-red-500'}`} />
                      {p.isActive ? 'Hiển thị' : 'Đang ẩn'}
                    </span>
                  </td>
                  <td className="px-5 py-2.5 text-slate-500 font-semibold">{formatDate(p.createdAt)}</td>
                  <td className="px-5 py-2.5">
                    <div className="flex items-center justify-center gap-1.5">
                      <button
                        type="button"
                        onClick={() => openEditModal(p)}
                        className="grid h-7 w-7 place-items-center rounded-md border border-emerald-200 bg-emerald-50 text-emerald-700 hover:border-emerald-400 hover:bg-emerald-100 transition"
                        title="Chỉnh sửa bài viết"
                      >
                        <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                          <path d="M12 20h9" />
                          <path d="M16.5 3.5a2.12 2.12 0 0 1 3 3L7 19l-4 1 1-4Z" />
                        </svg>
                      </button>
                      <button
                        type="button"
                        onClick={() => handleDelete(p.id)}
                        className="grid h-7 w-7 place-items-center rounded-md border border-red-200 bg-red-50 text-red-600 hover:border-red-400 hover:bg-red-100 transition"
                        title="Xóa bài viết"
                      >
                        <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                          <path d="M3 6h18" />
                          <path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6" />
                          <path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2" />
                        </svg>
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* ADD/EDIT MODAL - REDESIGNED PREMIUM UI */}
      {modalMode && (
        <div 
          className="fixed inset-0 bg-slate-950/65 flex items-center justify-center p-2 sm:p-4 md:p-6 z-50 backdrop-blur-md overflow-y-auto animate-in fade-in duration-200" 
          onMouseDown={(event) => event.target === event.currentTarget && setModalMode(null)}
        >
          <form 
            onSubmit={modalMode === 'add' ? handleAddSubmit : handleEditSubmit} 
            onMouseDown={(event) => event.stopPropagation()}
            className={`bg-white border border-slate-200/90 flex flex-col transition-all duration-300 shadow-2xl ${
              isMaximized 
                ? 'fixed inset-0 z-50 rounded-none w-screen h-screen overflow-y-auto my-0 p-0 shadow-none' 
                : 'rounded-2xl w-full max-w-6xl my-4 max-h-[92vh] overflow-hidden'
            }`}
          >
            {/* Modal Header */}
            <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 bg-gradient-to-r from-slate-50/90 via-white to-slate-50/50">
              <div className="flex items-center gap-3">
                <div className="grid h-10 w-10 place-items-center rounded-xl bg-gradient-to-tr from-emerald-600 to-teal-500 text-white shadow-md shadow-emerald-500/20">
                  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.2">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                  </svg>
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="text-base font-black text-slate-900 tracking-tight">
                      {modalMode === 'add' ? 'Viết bài viết mới' : 'Chỉnh sửa bài viết'}
                    </h3>
                    <span className="rounded-md bg-emerald-50 border border-emerald-200/80 px-2 py-0.5 text-[10px] font-black text-emerald-700 uppercase tracking-wider">
                      {modalMode === 'add' ? 'Bản mới' : `#${selectedPost?.id.slice(-6)}`}
                    </span>
                  </div>
                  <p className="text-xs text-slate-500 font-medium">
                    {modalMode === 'add' ? 'Tạo nội dung bài viết, tin tức hoặc thông báo xuất bản lên hệ thống' : `Đang chỉnh sửa bài viết: ${formTitle || 'Chưa đặt tiêu đề'}`}
                  </p>
                </div>
              </div>

              {/* Header Right Actions */}
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setIsMaximized(!isMaximized)}
                  className="flex items-center gap-1.5 px-3 py-1.5 border border-slate-200 hover:border-slate-300 hover:bg-slate-100 rounded-xl text-slate-600 text-xs font-bold transition-all shadow-sm"
                  title={isMaximized ? "Thu nhỏ lại" : "Phóng to toàn màn hình"}
                >
                  {isMaximized ? (
                    <>
                      <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M4 14h6v6m0-6l-6 6M20 10h-6V4m0 6l6-6"/>
                      </svg>
                      <span>Thu nhỏ</span>
                    </>
                  ) : (
                    <>
                      <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M8 3H5a2 2 0 0 0-2 2v3m18 0V5a2 2 0 0 0-2-2h-3m0 18h3a2 2 0 0 0 2-2v-3M3 16v3a2 2 0 0 0 2 2h3"/>
                      </svg>
                      <span>Phóng to</span>
                    </>
                  )}
                </button>
                <button
                  type="button"
                  onClick={() => setModalMode(null)}
                  className="grid h-8 w-8 place-items-center rounded-xl text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition"
                  aria-label="Đóng modal"
                >
                  ✕
                </button>
              </div>
            </div>

            {/* Navigation Tabs Bar */}
            <div className="px-6 border-b border-slate-200/80 bg-slate-50/50 flex items-center justify-between gap-4 overflow-x-auto [scrollbar-width:none]">
              <div className="flex gap-1 py-2">
                <button
                  type="button"
                  onClick={() => setActiveEditorTab('edit')}
                  className={`flex items-center gap-2 px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all duration-150 ${
                    activeEditorTab === 'edit'
                      ? 'bg-white text-emerald-700 border border-slate-200/90 shadow-sm'
                      : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100/70 border border-transparent'
                  }`}
                >
                  <span className="text-sm">🇻🇳</span>
                  <span>Nội dung Tiếng Việt</span>
                  <span className="h-2 w-2 rounded-full bg-emerald-500" />
                </button>

                <button
                  type="button"
                  onClick={() => setActiveEditorTab('preview')}
                  className={`flex items-center gap-2 px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all duration-150 ${
                    activeEditorTab === 'preview'
                      ? 'bg-white text-blue-700 border border-slate-200/90 shadow-sm'
                      : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100/70 border border-transparent'
                  }`}
                >
                  <span className="text-sm">🇬🇧</span>
                  <span>Bản dịch Tiếng Anh</span>
                  {formTitleEn || formContentEn ? (
                    <span className="rounded-full bg-blue-100 px-1.5 py-0.2 text-[9px] font-extrabold text-blue-700">Đã điền</span>
                  ) : (
                    <span className="h-1.5 w-1.5 rounded-full bg-slate-300" />
                  )}
                </button>

                <button
                  type="button"
                  onClick={() => setActiveEditorTab('seo')}
                  className={`flex items-center gap-2 px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all duration-150 ${
                    activeEditorTab === 'seo'
                      ? 'bg-white text-teal-700 border border-slate-200/90 shadow-sm'
                      : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100/70 border border-transparent'
                  }`}
                >
                  <span className="text-sm">🔍</span>
                  <span>SEO & Xem trước chia sẻ</span>
                </button>
              </div>

              {/* Quick Word Counter */}
              <div className="hidden sm:flex items-center gap-3 text-[11px] font-semibold text-slate-500 shrink-0">
                <span className="inline-flex items-center gap-1">
                  <span className="h-1.5 w-1.5 rounded-full bg-slate-400" />
                  {formContent.replace(/<[^>]*>/g, ' ').trim().split(/\s+/).filter(Boolean).length} từ (VI)
                </span>
                <span className="inline-flex items-center gap-1">
                  <span className="h-1.5 w-1.5 rounded-full bg-slate-400" />
                  ~{Math.max(1, Math.ceil(formContent.replace(/<[^>]*>/g, ' ').trim().split(/\s+/).filter(Boolean).length / 200))} phút đọc
                </span>
              </div>
            </div>
            
            {/* Modal Body: 2-Column Responsive Grid */}
            <div className={`p-5 overflow-y-auto flex-1 ${isMaximized ? 'h-[calc(100vh-140px)]' : 'max-h-[calc(92vh-145px)]'}`}>
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
                
                {/* ─── LEFT COLUMN: Main Content Area (8 Cols) ─── */}
                <div className="lg:col-span-8 space-y-4">
                  {activeEditorTab === 'edit' ? (
                    <>
                      {/* Tiêu đề tiếng Việt */}
                      <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm space-y-2">
                        <div className="flex items-center justify-between">
                          <label className="text-[11px] font-black uppercase tracking-wider text-slate-700 flex items-center gap-1.5">
                            <span className="text-emerald-600 font-bold">1.</span> Tiêu đề bài viết <span className="text-red-500">*</span>
                          </label>
                          <span className={`text-[10px] font-mono font-bold px-2 py-0.5 rounded-full ${
                            formTitle.length >= 40 && formTitle.length <= 70 
                              ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' 
                              : 'bg-slate-100 text-slate-500'
                          }`}>
                            {formTitle.length}/70 ký tự
                          </span>
                        </div>
                        <input 
                          type="text" 
                          className="h-11 w-full px-3.5 rounded-xl bg-slate-50/70 border border-slate-200 text-slate-900 placeholder:text-slate-400 text-sm font-bold focus:bg-white focus:outline-none focus:border-emerald-600 focus:ring-2 focus:ring-emerald-500/20 transition-all" 
                          value={formTitle} 
                          onChange={e => { 
                            setFormTitle(e.target.value); 
                            if (!isSlugCustomized) { 
                              setFormSlug(slugify(e.target.value)); 
                            } 
                          }} 
                          required 
                          placeholder="Ví dụ: Lễ Phát Động Cuộc Thi HUIT's ICONIC 2026..." 
                        />
                      </div>

                      {/* Tóm tắt tiếng Việt */}
                      <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm space-y-2">
                        <div className="flex items-center justify-between">
                          <label className="text-[11px] font-black uppercase tracking-wider text-slate-700 flex items-center gap-1.5">
                            <span className="text-emerald-600 font-bold">2.</span> Tóm tắt ngắn (Lead / Summary) <span className="text-red-500">*</span>
                          </label>
                          <span className={`text-[10px] font-mono font-bold px-2 py-0.5 rounded-full ${
                            formSummary.length >= 120 && formSummary.length <= 160 
                              ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' 
                              : 'bg-slate-100 text-slate-500'
                          }`}>
                            {formSummary.length}/160 ký tự
                          </span>
                        </div>
                        <textarea 
                          rows={3} 
                          className="w-full p-3 rounded-xl bg-slate-50/70 border border-slate-200 text-slate-900 placeholder:text-slate-400 text-xs font-semibold focus:bg-white focus:outline-none focus:border-emerald-600 focus:ring-2 focus:ring-emerald-500/20 transition-all resize-none leading-relaxed" 
                          value={formSummary} 
                          onChange={e => setFormSummary(e.target.value)} 
                          required 
                          placeholder="Mô tả tóm tắt nội dung chính trong 2-3 câu ngắn gọn để làm phần mở đầu và hiển thị trong danh sách tin..." 
                        />
                      </div>

                      {/* Nội dung bài viết tiếng Việt */}
                      <div className="rounded-2xl border border-slate-200 bg-white shadow-sm overflow-hidden flex flex-col">
                        {/* Editor Header & Toolbar */}
                        <div className="p-3.5 border-b border-slate-200 bg-slate-50/80 flex flex-wrap items-center justify-between gap-2.5">
                          <div className="flex items-center gap-2">
                            <span className="text-[11px] font-black uppercase tracking-wider text-slate-700 flex items-center gap-1.5">
                              <span className="text-emerald-600 font-bold">3.</span> Nội dung chi tiết <span className="text-red-500">*</span>
                            </span>
                          </div>

                          {/* Editor Mode Selector */}
                          <div className="flex items-center gap-1 bg-white p-1 rounded-xl border border-slate-200 shadow-sm text-xs font-bold">
                            <button
                              type="button"
                              onClick={() => setEditorMode('wysiwyg')}
                              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg transition-all ${
                                editorMode === 'wysiwyg'
                                  ? 'bg-emerald-600 text-white shadow-sm'
                                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
                              }`}
                            >
                              <span>🎨</span>
                              <span>Trực quan (WYSIWYG)</span>
                            </button>
                            <button
                              type="button"
                              onClick={() => setEditorMode('raw')}
                              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg transition-all ${
                                editorMode === 'raw'
                                  ? 'bg-emerald-600 text-white shadow-sm'
                                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
                              }`}
                            >
                              <span>💻</span>
                              <span>Markdown / HTML</span>
                            </button>
                          </div>
                        </div>

                        {/* Editor Controls Bar */}
                        {editorMode === 'wysiwyg' ? (
                          <div className="px-3.5 py-2 border-b border-slate-200 bg-slate-50/40 flex flex-wrap items-center gap-1.5 text-slate-600">
                            {/* Headings */}
                            <select
                              onChange={(e) => {
                                if (e.target.value) {
                                  document.execCommand('formatBlock', false, e.target.value);
                                  e.target.value = '';
                                }
                              }}
                              className="h-8 px-2.5 rounded-lg border border-slate-200 bg-white text-xs font-bold text-slate-700 outline-none hover:border-slate-300 focus:border-emerald-600 transition shadow-sm"
                            >
                              <option value="">Định dạng chữ...</option>
                              <option value="p">Đoạn văn (Paragraph)</option>
                              <option value="h1">Tiêu đề lớn (H1)</option>
                              <option value="h2">Tiêu đề vừa (H2)</option>
                              <option value="h3">Tiêu đề nhỏ (H3)</option>
                              <option value="blockquote">Trích dẫn (Quote)</option>
                            </select>

                            <span className="w-px h-5 bg-slate-200 mx-1" />

                            {/* Basic Styling */}
                            <div className="flex items-center gap-1 bg-white p-0.5 rounded-lg border border-slate-200 shadow-sm">
                              <button
                                type="button"
                                onClick={() => document.execCommand('bold', false)}
                                className="h-7 w-7 grid place-items-center rounded-md hover:bg-slate-100 font-black text-xs text-slate-800"
                                title="In đậm (Ctrl+B)"
                              >
                                B
                              </button>
                              <button
                                type="button"
                                onClick={() => document.execCommand('italic', false)}
                                className="h-7 w-7 grid place-items-center rounded-md hover:bg-slate-100 italic text-xs text-slate-800 font-serif"
                                title="In nghiêng (Ctrl+I)"
                              >
                                I
                              </button>
                              <button
                                type="button"
                                onClick={() => document.execCommand('underline', false)}
                                className="h-7 w-7 grid place-items-center rounded-md hover:bg-slate-100 underline text-xs text-slate-800 font-bold"
                                title="Gạch chân (Ctrl+U)"
                              >
                                U
                              </button>
                              <button
                                type="button"
                                onClick={() => document.execCommand('strikeThrough', false)}
                                className="h-7 w-7 grid place-items-center rounded-md hover:bg-slate-100 line-through text-xs text-slate-800 font-bold"
                                title="Gạch ngang chữ"
                              >
                                S
                              </button>
                            </div>

                            <span className="w-px h-5 bg-slate-200 mx-1" />

                            {/* Alignment */}
                            <div className="flex items-center gap-1 bg-white p-0.5 rounded-lg border border-slate-200 shadow-sm">
                              <button type="button" onClick={() => document.execCommand('justifyLeft', false)} className="h-7 w-7 grid place-items-center rounded-md hover:bg-slate-100 text-slate-700" title="Canh trái">
                                <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5"><line x1="17" y1="10" x2="3" y2="10"/><line x1="21" y1="6" x2="3" y2="6"/><line x1="21" y1="14" x2="3" y2="14"/><line x1="15" y1="18" x2="3" y2="18"/></svg>
                              </button>
                              <button type="button" onClick={() => document.execCommand('justifyCenter', false)} className="h-7 w-7 grid place-items-center rounded-md hover:bg-slate-100 text-slate-700" title="Canh giữa">
                                <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5"><line x1="18" y1="10" x2="6" y2="10"/><line x1="21" y1="6" x2="3" y2="6"/><line x1="21" y1="14" x2="3" y2="14"/><line x1="16" y1="18" x2="8" y2="18"/></svg>
                              </button>
                              <button type="button" onClick={() => document.execCommand('justifyRight', false)} className="h-7 w-7 grid place-items-center rounded-md hover:bg-slate-100 text-slate-700" title="Canh phải">
                                <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5"><line x1="21" y1="10" x2="7" y2="10"/><line x1="21" y1="6" x2="3" y2="6"/><line x1="21" y1="14" x2="3" y2="14"/><line x1="21" y1="18" x2="9" y2="18"/></svg>
                              </button>
                            </div>

                            <span className="w-px h-5 bg-slate-200 mx-1" />

                            {/* Lists & Blocks */}
                            <div className="flex items-center gap-1 bg-white p-0.5 rounded-lg border border-slate-200 shadow-sm">
                              <button type="button" onClick={() => document.execCommand('insertUnorderedList', false)} className="h-7 w-7 grid place-items-center rounded-md hover:bg-slate-100 text-slate-700" title="Danh sách gạch đầu dòng">
                                <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5"><line x1="8" y1="6" x2="21" y2="6"/><line x1="8" y1="12" x2="21" y2="12"/><line x1="8" y1="18" x2="21" y2="18"/><circle cx="4" cy="6" r="1" fill="currentColor"/><circle cx="4" cy="12" r="1" fill="currentColor"/><circle cx="4" cy="18" r="1" fill="currentColor"/></svg>
                              </button>
                              <button type="button" onClick={() => document.execCommand('insertOrderedList', false)} className="h-7 w-7 grid place-items-center rounded-md hover:bg-slate-100 text-slate-700" title="Danh sách số 1, 2, 3">
                                <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5"><line x1="10" y1="6" x2="21" y2="6"/><line x1="10" y1="12" x2="21" y2="12"/><line x1="10" y1="18" x2="21" y2="18"/><path d="M4 6h1v4"/><path d="M4 10h2"/><path d="M6 18H4c0-1 2-2 2-3s-1-1.5-2-1"/></svg>
                              </button>
                            </div>

                            <span className="w-px h-5 bg-slate-200 mx-1" />

                            {/* Insert Features */}
                            <div className="flex items-center gap-1 bg-white p-0.5 rounded-lg border border-slate-200 shadow-sm">
                              <button
                                type="button"
                                onClick={async () => {
                                  const url = await showPrompt('Nhập địa chỉ liên kết (URL):', 'https://', 'Chèn liên kết');
                                  if (url) document.execCommand('createLink', false, url);
                                }}
                                className="h-7 px-2 flex items-center gap-1 rounded-md hover:bg-blue-50 text-blue-600 text-xs font-bold"
                                title="Chèn liên kết"
                              >
                                <span>🔗</span> <span className="hidden sm:inline">Link</span>
                              </button>
                              <button
                                type="button"
                                onClick={async () => {
                                  const url = await showPrompt('Nhập URL hình ảnh:', '', 'Chèn hình ảnh', 'https://... hoặc /uploads/...');
                                  if (url) document.execCommand('insertImage', false, url);
                                }}
                                className="h-7 px-2 flex items-center gap-1 rounded-md hover:bg-emerald-50 text-emerald-600 text-xs font-bold"
                                title="Chèn hình ảnh"
                              >
                                <span>🖼️</span> <span className="hidden sm:inline">Ảnh</span>
                              </button>
                              <button
                                type="button"
                                onClick={() => {
                                  const tableHtml = `
                                    <table class="w-full border-collapse border border-slate-300 my-4 text-xs">
                                      <thead>
                                        <tr class="bg-slate-100 border-b border-slate-300">
                                          <th class="border border-slate-300 px-3 py-2 font-bold text-slate-800">Tiêu đề cột 1</th>
                                          <th class="border border-slate-300 px-3 py-2 font-bold text-slate-800">Tiêu đề cột 2</th>
                                        </tr>
                                      </thead>
                                      <tbody>
                                        <tr class="border-b border-slate-200">
                                          <td class="border border-slate-300 px-3 py-2">Nội dung 1</td>
                                          <td class="border border-slate-300 px-3 py-2">Nội dung 2</td>
                                        </tr>
                                      </tbody>
                                    </table>
                                  `;
                                  document.execCommand('insertHTML', false, tableHtml);
                                }}
                                className="h-7 px-2 flex items-center gap-1 rounded-md hover:bg-purple-50 text-purple-600 text-xs font-bold"
                                title="Chèn bảng"
                              >
                                <span>📊</span> <span className="hidden sm:inline">Bảng</span>
                              </button>
                            </div>

                            <button
                              type="button"
                              onClick={() => document.execCommand('removeFormat', false)}
                              className="h-8 px-2.5 rounded-lg border border-slate-200 bg-white hover:bg-rose-50 text-rose-600 text-xs font-bold transition shadow-sm ml-auto"
                              title="Xóa tất cả định dạng của vùng chọn"
                            >
                              🧹 Xóa định dạng
                            </button>
                          </div>
                        ) : (
                          <div className="px-3.5 py-2 border-b border-slate-200 bg-slate-50/40 flex flex-wrap items-center justify-between gap-2">
                            <div className="flex items-center gap-1 flex-wrap text-slate-600 text-xs font-bold">
                              <button type="button" onClick={() => insertTag('# ', '')} className="h-7 px-2 rounded-md bg-white border border-slate-200 hover:bg-slate-100 text-slate-800">H1</button>
                              <button type="button" onClick={() => insertTag('## ', '')} className="h-7 px-2 rounded-md bg-white border border-slate-200 hover:bg-slate-100 text-slate-800">H2</button>
                              <button type="button" onClick={() => insertTag('### ', '')} className="h-7 px-2 rounded-md bg-white border border-slate-200 hover:bg-slate-100 text-slate-800">H3</button>
                              <button type="button" onClick={() => insertTag('**', '**')} className="h-7 w-7 grid place-items-center rounded-md bg-white border border-slate-200 hover:bg-slate-100 text-slate-800 font-bold">B</button>
                              <button type="button" onClick={() => insertTag('*', '*')} className="h-7 w-7 grid place-items-center rounded-md bg-white border border-slate-200 hover:bg-slate-100 text-slate-800 italic">I</button>
                              <button type="button" onClick={() => insertTag('- ', '')} className="h-7 px-2 rounded-md bg-white border border-slate-200 hover:bg-slate-100 text-slate-800">• List</button>
                              <button type="button" onClick={() => insertTag('> ', '')} className="h-7 px-2 rounded-md bg-white border border-slate-200 hover:bg-slate-100 text-slate-800">&ldquo; Quote</button>
                              <button type="button" onClick={() => openCustomPrompt('link')} className="h-7 px-2 rounded-md bg-white border border-slate-200 hover:bg-blue-50 text-blue-600">🔗 Link</button>
                              <button type="button" onClick={() => openCustomPrompt('image')} className="h-7 px-2 rounded-md bg-white border border-slate-200 hover:bg-emerald-50 text-emerald-600">🖼️ Ảnh</button>
                            </div>

                            <button
                              type="button"
                              onClick={() => setShowPreviewPane(!showPreviewPane)}
                              className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold rounded-xl border transition-all ${
                                showPreviewPane 
                                  ? 'bg-emerald-600 border-emerald-600 text-white shadow-sm' 
                                  : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-50'
                              }`}
                            >
                              <span>👁️</span>
                              <span>{showPreviewPane ? 'Đang chia đôi Xem trước' : 'Xem trước Markdown'}</span>
                            </button>
                          </div>
                        )}

                        {/* Editor Editable Area */}
                        <div className={`flex-1 bg-white min-h-[360px] ${isMaximized ? 'min-h-[550px]' : ''}`}>
                          {editorMode === 'wysiwyg' ? (
                            <div
                              ref={editorRef}
                              contentEditable
                              onInput={handleWysiwygInput}
                              className="w-full h-full p-5 text-[14px] leading-relaxed text-slate-900 outline-none overflow-y-auto select-text prose max-w-none min-h-[360px]"
                              style={{ minHeight: isMaximized ? '550px' : '360px' }}
                            />
                          ) : (
                            <div className={`grid grid-cols-1 ${showPreviewPane ? 'lg:grid-cols-2 divide-y lg:divide-y-0 lg:divide-x divide-slate-200' : ''} h-full`}>
                              <textarea
                                id="post-content-textarea"
                                className="w-full p-4 text-xs font-mono text-slate-900 focus:outline-none resize-none leading-relaxed bg-white min-h-[360px]"
                                value={formContent}
                                onChange={e => setFormContent(e.target.value)}
                                placeholder="Nhập mã nguồn HTML hoặc cú pháp Markdown chi tiết..."
                                required
                              />
                              {showPreviewPane && (
                                <div className="p-4 overflow-y-auto bg-slate-50/50 text-slate-900 text-xs leading-relaxed prose max-w-none min-h-[360px]">
                                  <p className="text-[10px] font-black uppercase tracking-wider text-slate-400 mb-2 border-b border-slate-200 pb-1">Xem trước nội dung:</p>
                                  {formContent ? (
                                    <div dangerouslySetInnerHTML={{ __html: parseMarkdownToHtml(formContent) }} className="space-y-2 select-text" />
                                  ) : (
                                    <p className="text-slate-400 italic text-xs">Nội dung xem trước sẽ hiển thị ở đây...</p>
                                  )}
                                </div>
                              )}
                            </div>
                          )}
                        </div>
                      </div>
                    </>
                  ) : activeEditorTab === 'preview' ? (
                    /* ─── TAB: ENGLISH TRANSLATION ─── */
                    <div className="space-y-4">
                      {/* Tiêu đề tiếng Anh */}
                      <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm space-y-2">
                        <div className="flex items-center justify-between">
                          <label className="text-[11px] font-black uppercase tracking-wider text-slate-700 flex items-center gap-1.5">
                            <span className="text-blue-600 font-bold">EN 1.</span> Tiêu đề tiếng Anh (English Title)
                          </label>
                          <span className="text-[10px] font-bold text-slate-400">Tùy chọn (Optional)</span>
                        </div>
                        <input 
                          type="text" 
                          className="h-11 w-full px-3.5 rounded-xl bg-slate-50/70 border border-slate-200 text-slate-900 placeholder:text-slate-400 text-sm font-bold focus:bg-white focus:outline-none focus:border-blue-600 focus:ring-2 focus:ring-blue-500/20 transition-all" 
                          value={formTitleEn} 
                          onChange={e => setFormTitleEn(e.target.value)} 
                          placeholder="Example: Opening Ceremony of HUIT's ICONIC 2026 Contest..." 
                        />
                      </div>

                      {/* Tóm tắt tiếng Anh */}
                      <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm space-y-2">
                        <div className="flex items-center justify-between">
                          <label className="text-[11px] font-black uppercase tracking-wider text-slate-700 flex items-center gap-1.5">
                            <span className="text-blue-600 font-bold">EN 2.</span> Tóm tắt tiếng Anh (English Summary)
                          </label>
                          <span className="text-[10px] font-bold text-slate-400">Tùy chọn (Optional)</span>
                        </div>
                        <textarea 
                          rows={3} 
                          className="w-full p-3 rounded-xl bg-slate-50/70 border border-slate-200 text-slate-900 placeholder:text-slate-400 text-xs font-semibold focus:bg-white focus:outline-none focus:border-blue-600 focus:ring-2 focus:ring-blue-500/20 transition-all resize-none leading-relaxed" 
                          value={formSummaryEn} 
                          onChange={e => setFormSummaryEn(e.target.value)} 
                          placeholder="Brief 2-3 sentences summary in English for international visitors..." 
                        />
                      </div>

                      {/* Nội dung tiếng Anh */}
                      <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm space-y-2">
                        <div className="flex items-center justify-between">
                          <label className="text-[11px] font-black uppercase tracking-wider text-slate-700 flex items-center gap-1.5">
                            <span className="text-blue-600 font-bold">EN 3.</span> Nội dung tiếng Anh (English Content)
                          </label>
                          <span className="text-[10px] font-bold text-slate-400">Nếu bỏ trống, hệ thống sẽ sử dụng nội dung Tiếng Việt</span>
                        </div>
                        <textarea 
                          rows={14} 
                          className="w-full p-4 rounded-xl bg-slate-50/70 border border-slate-200 text-slate-900 placeholder:text-slate-400 text-xs font-mono focus:bg-white focus:outline-none focus:border-blue-600 focus:ring-2 focus:ring-blue-500/20 transition-all leading-relaxed" 
                          value={formContentEn} 
                          onChange={e => setFormContentEn(e.target.value)} 
                          placeholder="Nhập nội dung bài viết bằng tiếng Anh (hỗ trợ HTML hoặc cú pháp Markdown)..." 
                        />
                      </div>
                    </div>
                  ) : (
                    /* ─── TAB: SEO & SOCIAL PREVIEW ─── */
                    <div className="space-y-4">
                      {/* SEO Score Card */}
                      <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm space-y-4">
                        <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                          <div className="flex items-center gap-2">
                            <span className="text-lg">📊</span>
                            <div>
                              <h4 className="text-sm font-black text-slate-900">Đánh giá chuẩn SEO On-page</h4>
                              <p className="text-xs text-slate-500 font-medium">Tối ưu thẻ tìm kiếm và khả năng hiển thị trên Google</p>
                            </div>
                          </div>
                          <span className={`px-3 py-1 rounded-full text-xs font-black border ${
                            formTitle.length >= 40 && formSummary.length >= 100 
                              ? 'bg-emerald-50 text-emerald-700 border-emerald-200' 
                              : 'bg-amber-50 text-amber-700 border-amber-200'
                          }`}>
                            {formTitle.length >= 40 && formSummary.length >= 100 ? '⭐ Tốt (95/100)' : '⚠️ Cần bổ sung thêm'}
                          </span>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                          <div className="rounded-xl border border-slate-100 bg-slate-50/70 p-3.5 space-y-1.5">
                            <div className="flex justify-between items-center text-xs font-bold">
                              <span className="text-slate-700">Độ dài tiêu đề SEO</span>
                              <span className={formTitle.length >= 45 && formTitle.length <= 70 ? 'text-emerald-600 font-black' : 'text-amber-600'}>
                                {formTitle.length} / 70 ký tự
                              </span>
                            </div>
                            <div className="w-full bg-slate-200 h-2 rounded-full overflow-hidden">
                              <div 
                                className={`h-full rounded-full transition-all duration-300 ${
                                  formTitle.length >= 45 && formTitle.length <= 70 ? 'bg-emerald-500' : 'bg-amber-400'
                                }`}
                                style={{ width: `${Math.min((formTitle.length / 70) * 100, 100)}%` }}
                              />
                            </div>
                            <p className="text-[10px] text-slate-400 font-medium">Khuyên dùng từ 45 - 70 ký tự.</p>
                          </div>

                          <div className="rounded-xl border border-slate-100 bg-slate-50/70 p-3.5 space-y-1.5">
                            <div className="flex justify-between items-center text-xs font-bold">
                              <span className="text-slate-700">Độ dài mô tả ngắn (Meta Description)</span>
                              <span className={formSummary.length >= 120 && formSummary.length <= 160 ? 'text-emerald-600 font-black' : 'text-amber-600'}>
                                {formSummary.length} / 160 ký tự
                              </span>
                            </div>
                            <div className="w-full bg-slate-200 h-2 rounded-full overflow-hidden">
                              <div 
                                className={`h-full rounded-full transition-all duration-300 ${
                                  formSummary.length >= 120 && formSummary.length <= 160 ? 'bg-emerald-500' : 'bg-amber-400'
                                }`}
                                style={{ width: `${Math.min((formSummary.length / 160) * 100, 100)}%` }}
                              />
                            </div>
                            <p className="text-[10px] text-slate-400 font-medium">Khuyên dùng từ 120 - 160 ký tự.</p>
                          </div>
                        </div>
                      </div>

                      {/* Google Simulator Card */}
                      <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm space-y-3">
                        <h4 className="text-xs font-black text-slate-800 uppercase tracking-wider flex items-center gap-1.5">
                          <span>🔍</span> Mô phỏng kết quả tìm kiếm Google Search
                        </h4>
                        <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm space-y-1 select-text">
                          <div className="flex items-center gap-2 text-xs text-slate-500">
                            <span className="grid h-5 w-5 place-items-center rounded-full bg-slate-100 text-[10px]">🌐</span>
                            <span className="text-slate-700 font-medium">https://iconic2026.huitmedia.edu.vn</span>
                            <span>›</span>
                            <span>tin-tuc</span>
                            <span>›</span>
                            <span className="text-emerald-700 font-semibold">{formSlug || 'duong-dan-bai-viet'}</span>
                          </div>
                          <h3 className="text-base text-blue-700 hover:underline font-bold cursor-pointer pt-0.5 leading-snug">
                            {formTitle ? `${formTitle} - HUIT's ICONIC 2026` : 'Tiêu đề bài viết sẽ hiển thị tại đây...'}
                          </h3>
                          <p className="text-xs text-slate-600 leading-relaxed max-w-2xl line-clamp-2">
                            {formSummary || 'Nhập đoạn tóm tắt bài viết để hiển thị phần trích dẫn nội dung trên kết quả tìm kiếm Google...'}
                          </p>
                        </div>
                      </div>

                      {/* Social Share Simulator */}
                      <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm space-y-3">
                        <h4 className="text-xs font-black text-slate-800 uppercase tracking-wider flex items-center gap-1.5">
                          <span>👥</span> Mô phỏng chia sẻ mạng xã hội (Facebook, Zalo, LinkedIn)
                        </h4>
                        <div className="rounded-2xl border border-slate-200 overflow-hidden shadow-sm max-w-lg bg-white select-text">
                          <div className="w-full aspect-[1200/630] bg-slate-100 relative overflow-hidden flex items-center justify-center border-b border-slate-100">
                            {formThumbnailUrl ? (
                              <img 
                                src={formatAssetUrl(formThumbnailUrl)} 
                                alt="Thumbnail" 
                                className="w-full h-full object-cover" 
                              />
                            ) : (
                              <div className="flex flex-col items-center gap-1 text-slate-400 text-xs">
                                <span>🖼️</span>
                                <span>Chưa có ảnh đại diện bài viết</span>
                              </div>
                            )}
                          </div>
                          <div className="p-3.5 bg-slate-50/80 space-y-1">
                            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">ICONIC2026.HUITMEDIA.EDU.VN</span>
                            <h4 className="text-sm font-extrabold text-slate-900 line-clamp-1 leading-snug">
                              {formTitle || 'Chưa nhập tiêu đề bài viết...'}
                            </h4>
                            <p className="text-xs text-slate-500 line-clamp-2 leading-relaxed">
                              {formSummary || 'Nhập tóm tắt bài viết để hiển thị bản mô tả chia sẻ bắt mắt trên mạng xã hội...'}
                            </p>
                          </div>
                        </div>
                      </div>
                    </div>
                  )}
                </div>

                {/* ─── RIGHT COLUMN: Meta / Settings Sidebar (4 Cols) ─── */}
                <div className="lg:col-span-4 space-y-4">
                  
                  {/* Card 1: Cài đặt xuất bản */}
                  <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm space-y-4">
                    <h4 className="text-xs font-black text-slate-900 uppercase tracking-wider border-b border-slate-100 pb-2.5 flex items-center gap-2">
                      <span>⚙️</span> Thiết lập xuất bản
                    </h4>

                    {/* Trạng thái hiển thị */}
                    <div className="flex items-center justify-between p-3 rounded-xl border border-slate-200/80 bg-slate-50/70">
                      <div>
                        <p className="text-xs font-black text-slate-900">Trạng thái hiển thị</p>
                        <p className="text-[10px] font-medium text-slate-500">
                          {formIsActive ? 'Đang bật hiển thị công khai' : 'Tạm ẩn (Lưu bản nháp)'}
                        </p>
                      </div>
                      <button
                        type="button"
                        onClick={() => setFormIsActive(!formIsActive)}
                        className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
                          formIsActive ? 'bg-emerald-600' : 'bg-slate-300'
                        }`}
                      >
                        <span className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow-md transition duration-200 ease-in-out ${
                          formIsActive ? 'translate-x-5' : 'translate-x-0'
                        }`} />
                      </button>
                    </div>

                    {/* Danh mục bài viết */}
                    <div className="space-y-1.5">
                      <label className="text-[11px] font-bold text-slate-700 uppercase tracking-wider">
                        Danh mục bài viết <span className="text-red-500">*</span>
                      </label>
                      <select 
                        className="h-10 w-full px-3 rounded-xl bg-slate-50/70 border border-slate-200 text-slate-900 text-xs font-bold focus:bg-white focus:outline-none focus:border-emerald-600 transition"
                        value={formCategory}
                        onChange={e => setFormCategory(e.target.value)}
                      >
                        <option value="Tin tức">Tin tức (Mặc định)</option>
                        <option value="Thông báo">Thông báo</option>
                        <option value="Sự kiện">Sự kiện & Hoạt động</option>
                        <option value="Hướng dẫn">Hướng dẫn & Thể lệ</option>
                      </select>
                    </div>

                    {/* Slug URL */}
                    <div className="space-y-1.5">
                      <div className="flex items-center justify-between">
                        <label className="text-[11px] font-bold text-slate-700 uppercase tracking-wider">
                          Đường dẫn tĩnh (Slug)
                        </label>
                        <button
                          type="button"
                          onClick={() => {
                            setFormSlug(slugify(formTitle));
                            setIsSlugCustomized(false);
                          }}
                          className="text-[10px] font-bold text-emerald-700 hover:underline"
                          title="Tạo lại slug tự động từ tiêu đề bài viết"
                        >
                          Tạo lại từ tiêu đề
                        </button>
                      </div>
                      <input 
                        type="text" 
                        className="h-10 w-full px-3 rounded-xl bg-slate-50/70 border border-slate-200 text-slate-900 placeholder:text-slate-400 text-xs font-mono font-semibold focus:bg-white focus:outline-none focus:border-emerald-600 transition" 
                        value={formSlug} 
                        onChange={e => { 
                          setFormSlug(slugify(e.target.value)); 
                          setIsSlugCustomized(true); 
                        }} 
                        placeholder="tu-dong-tao-slug..." 
                      />
                    </div>
                  </div>

                  {/* Card 2: Ảnh đại diện Thumbnail */}
                  <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm space-y-3">
                    <h4 className="text-xs font-black text-slate-900 uppercase tracking-wider border-b border-slate-100 pb-2.5 flex items-center gap-2">
                      <span>🖼️</span> Ảnh đại diện bài viết
                    </h4>
                    
                    <ImageDropzone
                      label="Kéo thả hoặc tải ảnh lên"
                      value={formThumbnailUrl}
                      onChange={setFormThumbnailUrl}
                      aspectRatioHint="Chuẩn 16:9 hoặc 4:3 (Tối đa 10MB)"
                    />

                    <div className="space-y-1 pt-1">
                      <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Hoặc nhập link URL ảnh:</span>
                      <input
                        type="text"
                        className="h-9 w-full px-3 rounded-lg bg-slate-50 border border-slate-200 text-xs font-mono text-slate-800 placeholder:text-slate-400 focus:bg-white focus:outline-none focus:border-emerald-600 transition"
                        value={formThumbnailUrl}
                        onChange={e => setFormThumbnailUrl(e.target.value)}
                        placeholder="https://... hoặc /uploads/..."
                      />
                    </div>
                  </div>

                  {/* Card 3: Thống kê nhanh */}
                  <div className="rounded-2xl border border-slate-200/90 bg-gradient-to-br from-slate-50 to-white p-4 shadow-sm space-y-2.5 text-xs">
                    <h4 className="text-[11px] font-black text-slate-700 uppercase tracking-wider">
                      📌 Thông tin bài viết
                    </h4>
                    <div className="space-y-1.5 text-slate-600">
                      <div className="flex justify-between py-1 border-b border-slate-100">
                        <span className="text-slate-500">Chế độ:</span>
                        <span className="font-bold text-slate-800">{modalMode === 'add' ? 'Thêm mới' : 'Chỉnh sửa'}</span>
                      </div>
                      <div className="flex justify-between py-1 border-b border-slate-100">
                        <span className="text-slate-500">Bản tiếng Việt:</span>
                        <span className="font-bold text-emerald-600">{formTitle && formContent ? '✓ Hoàn tất' : 'Đang soạn...'}</span>
                      </div>
                      <div className="flex justify-between py-1">
                        <span className="text-slate-500">Bản tiếng Anh:</span>
                        <span className={`font-bold ${formTitleEn || formContentEn ? 'text-blue-600' : 'text-slate-400'}`}>
                          {formTitleEn || formContentEn ? '✓ Đã có' : 'Chưa có (Tuỳ chọn)'}
                        </span>
                      </div>
                    </div>
                  </div>

                </div>
              </div>
            </div>

            {/* Modal Footer Bar */}
            <div className="flex items-center justify-between px-6 py-3.5 border-t border-slate-200/80 bg-slate-50/90 backdrop-blur-md">
              <div className="text-xs text-slate-500 font-medium">
                {modalMode === 'add' ? 'Bài viết sẽ được đăng tải ngay sau khi lưu.' : 'Các thay đổi sẽ được cập nhật trực tiếp.'}
              </div>

              <div className="flex items-center gap-3">
                <button 
                  type="button" 
                  onClick={() => setModalMode(null)} 
                  className="px-4 py-2 border border-slate-200 bg-white hover:bg-slate-100 rounded-xl text-slate-700 text-xs font-bold transition shadow-sm active:scale-[0.98]"
                >
                  Hủy bỏ
                </button>
                <button 
                  type="submit" 
                  className="flex items-center gap-1.5 px-5 py-2 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 rounded-xl text-white text-xs font-black shadow-md shadow-emerald-600/20 transition active:scale-[0.98]"
                >
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                  </svg>
                  <span>{modalMode === 'add' ? 'Xuất bản bài viết' : 'Lưu thay đổi'}</span>
                </button>
              </div>
            </div>
          </form>
        </div>
      )}

      {/* CUSTOM PROMPT MODAL (Link / Image) */}
      {customPrompt.isOpen && (
        <div className="fixed inset-0 bg-slate-950/70 flex items-center justify-center p-4 z-[100] backdrop-blur-sm animate-in fade-in duration-200">
          <form 
            onSubmit={handleCustomPromptSubmit}
            className="bg-white border border-slate-200 p-6 rounded-2xl w-full max-w-md flex flex-col space-y-4 shadow-2xl animate-in zoom-in duration-200"
          >
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h4 className="text-sm font-black text-slate-900 flex items-center gap-2">
                {customPrompt.type === 'link' ? (
                  <span className="grid h-7 w-7 place-items-center rounded-lg bg-blue-50 text-blue-600 font-bold">🔗</span>
                ) : (
                  <span className="grid h-7 w-7 place-items-center rounded-lg bg-emerald-50 text-emerald-600 font-bold">🖼️</span>
                )}
                {customPrompt.title}
              </h4>
              <button 
                type="button" 
                onClick={() => setCustomPrompt(prev => ({ ...prev, isOpen: false }))}
                className="text-slate-400 hover:text-slate-600 text-sm font-bold p-1 cursor-pointer"
              >
                ✕
              </button>
            </div>

            <div className="flex flex-col space-y-3.5">
              <div className="flex flex-col space-y-1.5">
                <label className="text-[10px] font-black text-slate-600 uppercase tracking-wider">{customPrompt.label1}</label>
                <input 
                  type="text" 
                  className="h-10 px-3.5 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 focus:bg-white focus:outline-none focus:border-emerald-600 text-xs font-semibold"
                  value={customPrompt.val1}
                  onChange={e => setCustomPrompt(prev => ({ ...prev, val1: e.target.value }))}
                  required
                  placeholder={customPrompt.type === 'link' ? "Ví dụ: Xem thêm tại đây..." : "Ví dụ: Ảnh lễ khai mạc cuộc thi..."}
                />
              </div>

              <div className="flex flex-col space-y-1.5">
                <label className="text-[10px] font-black text-slate-600 uppercase tracking-wider">{customPrompt.label2}</label>
                <input 
                  type="text" 
                  className="h-10 px-3.5 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 focus:bg-white focus:outline-none focus:border-emerald-600 text-xs font-mono font-semibold"
                  value={customPrompt.val2}
                  onChange={e => setCustomPrompt(prev => ({ ...prev, val2: e.target.value }))}
                  required
                  placeholder="https://..."
                />
              </div>
            </div>

            <div className="flex justify-end gap-2.5 pt-3 border-t border-slate-100">
              <button 
                type="button" 
                onClick={() => setCustomPrompt(prev => ({ ...prev, isOpen: false }))}
                className="px-4 py-2 border border-slate-200 bg-white hover:bg-slate-100 rounded-xl text-slate-700 text-xs font-bold transition shadow-sm cursor-pointer"
              >
                Hủy bỏ
              </button>
              <button 
                type="submit" 
                className="px-5 py-2 bg-emerald-600 hover:bg-emerald-700 rounded-xl text-white text-xs font-black shadow-md transition cursor-pointer"
              >
                Chèn vào bài viết
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}
