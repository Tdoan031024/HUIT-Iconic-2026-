'use client';

import React, { useState, useEffect, useRef } from 'react';
import { apiUrl, formatAssetUrl } from '../../api';

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
  slug: string;
  summary: string | null;
  content: string;
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
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  
  // Modal states
  const [modalMode, setModalMode] = useState<'add' | 'edit' | null>(null);
  const [selectedPost, setSelectedPost] = useState<Post | null>(null);
  
  // Form fields
  const [formTitle, setFormTitle] = useState('');
  const [formSlug, setFormSlug] = useState('');
  const [formCategory, setFormCategory] = useState('Tin tức');
  const [formThumbnailUrl, setFormThumbnailUrl] = useState('');
  const [formSummary, setFormSummary] = useState('');
  const [formContent, setFormContent] = useState('');
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
    setFormSlug('');
    setFormCategory('Tin tức');
    setFormThumbnailUrl('');
    setFormSummary('');
    setFormContent('');
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
    setFormSlug(p.slug);
    setFormCategory(p.category);
    setFormThumbnailUrl(p.thumbnailUrl || '');
    setFormSummary(p.summary || '');
    setFormContent(p.content);
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
      slug: formSlug || undefined,
      category: formCategory,
      thumbnailUrl: formThumbnailUrl || undefined,
      summary: formSummary || undefined,
      content: editorMode === 'wysiwyg' ? formContent : parseMarkdownToHtml(formContent),
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
      slug: formSlug || undefined,
      category: formCategory,
      thumbnailUrl: formThumbnailUrl,
      summary: formSummary,
      content: editorMode === 'wysiwyg' ? formContent : parseMarkdownToHtml(formContent),
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
        alert('Cập nhật bài viết thành công!');
        loadPosts();
        return;
      }
    } catch (err) {
      console.error(err);
    }
    alert('Không thể kết nối đến server để cập nhật bài viết.');
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Bạn có chắc chắn muốn xóa bài viết này không? Thao tác này không thể khôi phục.')) return;

    try {
      const res = await fetch(apiUrl(`/api/admin/posts/${id}`), {
        method: 'DELETE',
      });
      if (res.ok) {
        alert('Xóa bài viết thành công!');
        loadPosts();
        return;
      }
    } catch (err) {
      console.error(err);
    }
    alert('Không thể kết nối đến server để xóa bài viết.');
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
          <h1 className="text-lg font-black text-[#123c34]">Tin tức &amp; Thông báo</h1>
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
                      <img src={formatAssetUrl(p.thumbnailUrl) || '/uploads/baner.jpg'} className="w-full h-full object-cover" alt="Thumb" />
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

      {/* ADD/EDIT MODAL */}
      {modalMode && (
        <div className="fixed inset-0 bg-[#10211d]/60 flex items-center justify-center p-4 z-50 backdrop-blur-sm overflow-y-auto">
          <form 
            onSubmit={modalMode === 'add' ? handleAddSubmit : handleEditSubmit} 
            className={`bg-white border border-[#dce5e1] p-5 flex flex-col transition-all duration-200 ${
              isMaximized 
                ? 'fixed inset-0 z-50 rounded-none w-screen h-screen space-y-4 overflow-y-auto my-0 p-6 shadow-none' 
                : 'rounded-xl w-full max-w-4xl space-y-3.5 my-8 shadow-2xl animate-in fade-in zoom-in duration-200'
            }`}
          >
            <div className="flex items-center justify-between border-b border-[#edf2f0] pb-2.5">
              <h3 className="text-base font-black text-[#123c34]">
                {modalMode === 'add' ? 'Viết bài viết mới' : 'Chỉnh sửa bài viết'}
              </h3>
              <button
                type="button"
                onClick={() => setIsMaximized(!isMaximized)}
                className="flex items-center gap-1 px-2.5 py-1.5 border border-[#dce5e1] hover:bg-[#edf4f1] rounded-lg text-[#52605b] text-[10px] font-bold transition-colors cursor-pointer"
                title={isMaximized ? "Thu nhỏ lại" : "Phóng to toàn màn hình"}
              >
                {isMaximized ? (
                  <>
                    <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M4 14h6v6m0-6l-6 6M20 10h-6V4m0 6l6-6"/>
                    </svg>
                    <span>Thu nhỏ</span>
                  </>
                ) : (
                  <>
                    <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M8 3H5a2 2 0 0 0-2 2v3m18 0V5a2 2 0 0 0-2-2h-3m0 18h3a2 2 0 0 0 2-2v-3M3 16v3a2 2 0 0 0 2 2h3"/>
                    </svg>
                    <span>Phóng to</span>
                  </>
                )}
              </button>
            </div>
            
            <div className={`grid grid-cols-1 md:grid-cols-4 gap-4 ${isMaximized ? 'flex-1' : ''}`}>
              {/* Left Column - Meta */}
              <div className={`flex flex-col space-y-3 md:col-span-1 border-r border-slate-100 pr-3.5 ${isMaximized ? 'overflow-y-auto max-h-[calc(100vh-140px)]' : ''}`}>
                <div className="flex flex-col space-y-1.5">
                  <label className="text-[10px] font-bold text-[#52605b] uppercase tracking-wider">Tiêu đề bài viết *</label>
                  <input type="text" className="h-9 px-3 rounded-lg bg-[#fbfdfc] border border-[#dce5e1] text-[#18211f] focus:outline-none focus:border-[#0f766e] text-xs font-semibold" value={formTitle} onChange={e => { setFormTitle(e.target.value); if (!isSlugCustomized) { setFormSlug(slugify(e.target.value)); } }} required placeholder="Nhập tiêu đề..." />
                </div>

                <div className="flex flex-col space-y-1.5">
                  <label className="text-[10px] font-bold text-[#52605b] uppercase tracking-wider">Slug (Đường dẫn URL)</label>
                  <input type="text" className="h-9 px-3 rounded-lg bg-[#fbfdfc] border border-[#dce5e1] text-[#18211f] focus:outline-none focus:border-[#0f766e] text-xs font-semibold" value={formSlug} onChange={e => { setFormSlug(slugify(e.target.value)); setIsSlugCustomized(true); }} placeholder="Tự sinh nếu để trống..." />
                </div>

                <div className="flex flex-col space-y-1.5">
                  <label className="text-[10px] font-bold text-[#52605b] uppercase tracking-wider">Danh mục *</label>
                  <select 
                    className="h-9 px-3 rounded-lg bg-[#fbfdfc] border border-[#dce5e1] text-[#18211f] focus:outline-none focus:border-[#0f766e] text-xs font-semibold"
                    value={formCategory}
                    onChange={e => setFormCategory(e.target.value)}
                  >
                    <option value="Tin tức">Tin tức (Mặc định)</option>
                    <option value="Thông báo">Thông báo</option>
                  </select>
                </div>

                <div className="flex flex-col space-y-1.5">
                  <label className="text-[10px] font-bold text-[#52605b] uppercase tracking-wider">Ảnh đại diện (URL)</label>
                  <input type="text" className="h-9 px-3 rounded-lg bg-[#fbfdfc] border border-[#dce5e1] text-[#18211f] focus:outline-none focus:border-[#0f766e] text-xs font-semibold" value={formThumbnailUrl} onChange={e => setFormThumbnailUrl(e.target.value)} placeholder="Nhập URL ảnh đại diện..." />
                </div>

                <div className="flex flex-col space-y-1.5">
                  <label className="text-[10px] font-bold text-[#52605b] uppercase tracking-wider">Hoặc tải ảnh từ máy tính</label>
                  <input
                    type="file"
                    accept="image/*"
                    className="w-full text-[11px] text-[#52605b] file:mr-3 file:py-1.5 file:px-2.5 file:rounded-md file:border-0 file:text-[10px] file:font-bold file:bg-[#123c34] file:text-white hover:file:bg-[#0f766e] cursor-pointer"
                    onChange={async (event) => {
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
                          setFormThumbnailUrl(data.url);
                        } else {
                          alert('Tải ảnh đại diện thất bại.');
                        }
                      } catch (err) {
                        console.error(err);
                        alert('Có lỗi xảy ra khi tải ảnh.');
                      }
                    }}
                  />
                </div>

                {formThumbnailUrl && (
                  <div className="w-full h-24 rounded-lg overflow-hidden border border-slate-200 bg-slate-50 relative mt-1 flex items-center justify-center">
                    <img src={formatAssetUrl(formThumbnailUrl)} className="max-w-full max-h-full object-contain" alt="Preview Thumbnail" />
                    <button type="button" onClick={() => setFormThumbnailUrl('')} className="absolute top-1 right-1 h-5 w-5 bg-red-500 text-white rounded-full text-[10px] flex items-center justify-center font-bold" title="Xóa ảnh">X</button>
                  </div>
                )}

                <div className="flex items-center justify-between p-2.5 bg-[#fbfdfc] rounded-xl border border-[#dce5e1] mt-2">
                  <div className="flex flex-col">
                    <span className="font-bold text-xs text-[#123c34]">Trạng thái hiển thị</span>
                    <span className="text-[9px] text-[#6b7773]">Hiển thị ngay trên website</span>
                  </div>
                  <button
                    type="button"
                    onClick={() => setFormIsActive(!formIsActive)}
                    className={`relative inline-flex h-5 w-9 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
                      formIsActive ? 'bg-[#0f766e]' : 'bg-slate-300'
                    }`}
                  >
                    <span className={`pointer-events-none inline-block h-4 w-4 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${
                      formIsActive ? 'translate-x-4' : 'translate-x-0'
                    }`} />
                  </button>
                </div>
              </div>

              {/* Right Column - Editor / Content */}
              <div className="flex flex-col space-y-3.5 md:col-span-3">
                {/* Tabs Switcher */}
                <div className="flex border-b border-[#dce5e1] gap-4 text-xs font-bold">
                  <button
                    type="button"
                    onClick={() => setActiveEditorTab('edit')}
                    className={`pb-2 border-b-2 transition-colors ${
                      activeEditorTab === 'edit'
                        ? 'border-[#0f766e] text-[#0f766e]'
                        : 'border-transparent text-[#6b7773] hover:text-[#123c34]'
                    }`}
                  >
                    📝 Soạn thảo nội dung
                  </button>
                  <button
                    type="button"
                    onClick={() => setActiveEditorTab('seo')}
                    className={`pb-2 border-b-2 transition-colors ${
                      activeEditorTab === 'seo'
                        ? 'border-[#0f766e] text-[#0f766e]'
                        : 'border-transparent text-[#6b7773] hover:text-[#123c34]'
                    }`}
                  >
                    🔍 SEO &amp; Xem trước chia sẻ
                  </button>
                </div>

                {activeEditorTab === 'edit' ? (
                  <>
                    <div className="flex flex-col space-y-1.5">
                      <div className="flex justify-between items-center">
                        <label className="text-[10px] font-bold text-[#52605b] uppercase tracking-wider">Mô tả tóm tắt ngắn *</label>
                        <div className="flex items-center gap-1.5 bg-slate-100 p-0.5 rounded-lg border border-slate-200 text-[10px] font-bold">
                          <button
                            type="button"
                            onClick={() => setEditorMode('wysiwyg')}
                            className={`px-2 py-1 rounded transition-colors ${editorMode === 'wysiwyg' ? 'bg-white text-blue-600 shadow-sm' : 'text-slate-500 hover:text-slate-900'}`}
                          >
                            🎨 Trực quan (WYSIWYG)
                          </button>
                          <button
                            type="button"
                            onClick={() => setEditorMode('raw')}
                            className={`px-2 py-1 rounded transition-colors ${editorMode === 'raw' ? 'bg-white text-blue-600 shadow-sm' : 'text-slate-500 hover:text-slate-900'}`}
                          >
                            💻 Mã nguồn / Markdown
                          </button>
                        </div>
                      </div>
                      <textarea rows={2} className="px-3 py-2 rounded-lg bg-[#fbfdfc] border border-[#dce5e1] text-[#18211f] focus:outline-none focus:border-[#0f766e] text-xs font-semibold resize-none" value={formSummary} onChange={e => setFormSummary(e.target.value)} required placeholder="Giới thiệu tóm tắt khoảng 2-3 câu..." />
                    </div>

                    <div className="flex flex-col flex-1 min-h-[350px]">
                      {editorMode === 'wysiwyg' ? (
                        /* ─── Visual WYSIWYG Editor Toolbar ─── */
                        <div className="flex justify-between items-center bg-[#f8fafc] border border-[#dce5e1] border-b-0 rounded-t-lg px-3 py-1.5 flex-wrap gap-2">
                          <div className="flex items-center gap-1.5 flex-wrap text-slate-500">
                            {/* Block Styles */}
                            <select
                              onChange={(e) => {
                                if (e.target.value) {
                                  document.execCommand('formatBlock', false, e.target.value);
                                  e.target.value = ''; // Reset select
                                }
                              }}
                              className="h-7 px-1.5 rounded border border-[#dce5e1] text-[11px] bg-white font-bold text-slate-700 outline-none"
                            >
                              <option value="">Định dạng chữ...</option>
                              <option value="p">Đoạn văn (Paragraph)</option>
                              <option value="h1">Tiêu đề lớn 1</option>
                              <option value="h2">Tiêu đề vừa 2</option>
                              <option value="h3">Tiêu đề nhỏ 3</option>
                              <option value="blockquote">Trích dẫn (Quote)</option>
                            </select>

                            <span className="w-[1px] h-4 bg-slate-200" />

                            {/* Inline Format Actions */}
                            <div className="flex items-center gap-0.5">
                              <button
                                type="button"
                                onClick={() => document.execCommand('bold', false)}
                                className="h-7 w-7 flex items-center justify-center rounded hover:bg-slate-200/80 font-bold text-xs"
                                title="In đậm (Bold)"
                              >
                                <strong>B</strong>
                              </button>
                              <button
                                type="button"
                                onClick={() => document.execCommand('italic', false)}
                                className="h-7 w-7 flex items-center justify-center rounded hover:bg-slate-200/80 italic text-xs"
                                title="In nghiêng (Italic)"
                              >
                                <em>I</em>
                              </button>
                              <button
                                type="button"
                                onClick={() => document.execCommand('underline', false)}
                                className="h-7 w-7 flex items-center justify-center rounded hover:bg-slate-200/80 underline text-xs"
                                title="Gạch chân (Underline)"
                              >
                                <u>U</u>
                              </button>
                              <button
                                type="button"
                                onClick={() => document.execCommand('strikeThrough', false)}
                                className="h-7 w-7 flex items-center justify-center rounded hover:bg-slate-200/80 line-through text-xs"
                                title="Gạch ngang (Strikethrough)"
                              >
                                S
                              </button>
                            </div>

                            <span className="w-[1px] h-4 bg-slate-200" />

                            {/* Text alignments */}
                            <div className="flex items-center gap-0.5">
                              <button type="button" onClick={() => document.execCommand('justifyLeft', false)} className="h-7 w-7 flex items-center justify-center rounded hover:bg-slate-200/80" title="Canh trái">
                                <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5"><line x1="17" y1="10" x2="3" y2="10"/><line x1="21" y1="6" x2="3" y2="6"/><line x1="21" y1="14" x2="3" y2="14"/><line x1="15" y1="18" x2="3" y2="18"/></svg>
                              </button>
                              <button type="button" onClick={() => document.execCommand('justifyCenter', false)} className="h-7 w-7 flex items-center justify-center rounded hover:bg-slate-200/80" title="Canh giữa">
                                <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5"><line x1="18" y1="10" x2="6" y2="10"/><line x1="21" y1="6" x2="3" y2="6"/><line x1="21" y1="14" x2="3" y2="14"/><line x1="16" y1="18" x2="8" y2="18"/></svg>
                              </button>
                              <button type="button" onClick={() => document.execCommand('justifyRight', false)} className="h-7 w-7 flex items-center justify-center rounded hover:bg-slate-200/80" title="Canh phải">
                                <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5"><line x1="21" y1="10" x2="7" y2="10"/><line x1="21" y1="6" x2="3" y2="6"/><line x1="21" y1="14" x2="3" y2="14"/><line x1="21" y1="18" x2="9" y2="18"/></svg>
                              </button>
                            </div>

                            <span className="w-[1px] h-4 bg-slate-200" />

                            {/* Lists */}
                            <div className="flex items-center gap-0.5">
                              <button type="button" onClick={() => document.execCommand('insertUnorderedList', false)} className="h-7 w-7 flex items-center justify-center rounded hover:bg-slate-200/80" title="Danh sách không thứ tự">
                                <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5"><line x1="8" y1="6" x2="21" y2="6"/><line x1="8" y1="12" x2="21" y2="12"/><line x1="8" y1="18" x2="21" y2="18"/><circle cx="4" cy="6" r="1" fill="currentColor"/><circle cx="4" cy="12" r="1" fill="currentColor"/><circle cx="4" cy="18" r="1" fill="currentColor"/></svg>
                              </button>
                              <button type="button" onClick={() => document.execCommand('insertOrderedList', false)} className="h-7 w-7 flex items-center justify-center rounded hover:bg-slate-200/80" title="Danh sách có thứ tự">
                                <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5"><line x1="10" y1="6" x2="21" y2="6"/><line x1="10" y1="12" x2="21" y2="12"/><line x1="10" y1="18" x2="21" y2="18"/><path d="M4 6h1v4"/><path d="M4 10h2"/><path d="M6 18H4c0-1 2-2 2-3s-1-1.5-2-1"/></svg>
                              </button>
                            </div>

                            <span className="w-[1px] h-4 bg-slate-200" />

                            {/* Insert Elements */}
                            <div className="flex items-center gap-0.5">
                              <button
                                type="button"
                                onClick={() => {
                                  const url = prompt('Nhập địa chỉ liên kết (URL):', 'https://');
                                  if (url) document.execCommand('createLink', false, url);
                                }}
                                className="h-7 w-7 flex items-center justify-center rounded hover:bg-slate-200/80 text-blue-600 font-bold"
                                title="Chèn liên kết"
                              >
                                🔗
                              </button>
                              <button
                                type="button"
                                onClick={() => {
                                  const url = prompt('Nhập URL hình ảnh:');
                                  if (url) document.execCommand('insertImage', false, url);
                                }}
                                className="h-7 w-7 flex items-center justify-center rounded hover:bg-slate-200/80 text-emerald-600 font-bold"
                                title="Chèn hình ảnh"
                              >
                                🖼️
                              </button>
                              <button
                                type="button"
                                onClick={() => {
                                  const tableHtml = `
                                    <table class="w-full border-collapse border border-slate-300 my-4 text-xs">
                                      <thead>
                                        <tr class="bg-slate-50 border-b border-slate-300">
                                          <th class="border border-slate-300 px-3 py-2 font-bold text-slate-700">Tiêu đề 1</th>
                                          <th class="border border-slate-300 px-3 py-2 font-bold text-slate-700">Tiêu đề 2</th>
                                        </tr>
                                      </thead>
                                      <tbody>
                                        <tr class="border-b border-slate-200">
                                          <td class="border border-slate-300 px-3 py-2">Nội dung ô 1</td>
                                          <td class="border border-slate-300 px-3 py-2">Nội dung ô 2</td>
                                        </tr>
                                      </tbody>
                                    </table>
                                  `;
                                  document.execCommand('insertHTML', false, tableHtml);
                                }}
                                className="h-7 w-7 flex items-center justify-center rounded hover:bg-slate-200/80 text-indigo-600 font-bold"
                                title="Chèn bảng biểu mẫu"
                              >
                                📊
                              </button>
                              <button
                                type="button"
                                onClick={() => document.execCommand('insertHorizontalRule', false)}
                                className="h-7 w-7 flex items-center justify-center rounded hover:bg-slate-200/80 text-slate-600 font-bold"
                                title="Chèn đường kẻ phân cách"
                              >
                                ➖
                              </button>
                            </div>

                            <span className="w-[1px] h-4 bg-slate-200" />

                            {/* Clear Format */}
                            <button
                              type="button"
                              onClick={() => document.execCommand('removeFormat', false)}
                              className="h-7 w-7 flex items-center justify-center rounded hover:bg-slate-200/80 text-red-500 font-semibold"
                              title="Xóa định dạng"
                            >
                              🧹
                            </button>
                          </div>
                        </div>
                      ) : (
                        /* ─── Raw Markdown/HTML Editor Toolbar ─── */
                        <div className="flex justify-between items-center bg-[#f8fafc] border border-[#dce5e1] border-b-0 rounded-t-lg px-3 py-1.5 flex-wrap gap-2">
                          <div className="flex items-center gap-1.5 flex-wrap text-slate-500">
                            <div className="flex items-center gap-1">
                              <button type="button" onClick={() => insertTag('# ', '')} className="h-7 w-7 flex items-center justify-center rounded hover:bg-slate-200/80 font-black border border-transparent text-[#123c34] text-xs transition" title="Tiêu đề H1">H1</button>
                              <button type="button" onClick={() => insertTag('## ', '')} className="h-7 w-7 flex items-center justify-center rounded hover:bg-slate-200/80 font-extrabold border border-transparent text-[#123c34] text-xs transition" title="Tiêu đề H2">H2</button>
                              <button type="button" onClick={() => insertTag('### ', '')} className="h-7 w-7 flex items-center justify-center rounded hover:bg-slate-200/80 font-bold border border-transparent text-[#123c34] text-xs transition" title="Tiêu đề H3">H3</button>
                            </div>

                            <span className="w-[1px] h-4 bg-slate-200" />

                            <div className="flex items-center gap-1">
                              <button type="button" onClick={() => insertTag('**', '**')} className="h-7 w-7 flex items-center justify-center rounded hover:bg-slate-200/80 font-bold text-xs" title="In đậm"><strong>B</strong></button>
                              <button type="button" onClick={() => insertTag('*', '*')} className="h-7 w-7 flex items-center justify-center rounded hover:bg-slate-200/80 italic text-xs" title="In nghiêng"><em>I</em></button>
                              <button type="button" onClick={() => insertTag('~~', '~~')} className="h-7 w-7 flex items-center justify-center rounded hover:bg-slate-200/80 line-through text-xs" title="Gạch ngang">S</button>
                            </div>

                            <span className="w-[1px] h-4 bg-slate-200" />

                            <div className="flex items-center gap-1">
                              <button type="button" onClick={() => insertTag('- ', '')} className="h-7 w-7 flex items-center justify-center rounded hover:bg-slate-200/80" title="Gạch đầu dòng">•</button>
                              <button type="button" onClick={() => insertTag('1. ', '')} className="h-7 w-7 flex items-center justify-center rounded hover:bg-slate-200/80" title="Danh sách số">1.</button>
                              <button type="button" onClick={() => insertTag('> ', '')} className="h-7 w-7 flex items-center justify-center rounded hover:bg-slate-200/80" title="Trích dẫn">&ldquo;</button>
                            </div>

                            <span className="w-[1px] h-4 bg-slate-200" />

                            <div className="flex items-center gap-1">
                              <button type="button" onClick={() => openCustomPrompt('link')} className="h-7 w-7 flex items-center justify-center rounded hover:bg-slate-200/80 text-blue-600" title="Chèn liên kết URL">🔗</button>
                              <button type="button" onClick={() => openCustomPrompt('image')} className="h-7 w-7 flex items-center justify-center rounded hover:bg-slate-200/80 text-emerald-600" title="Chèn hình ảnh">🖼️</button>
                              <button type="button" onClick={() => insertTag('\n| Cột 1 | Cột 2 |\n|---|---|\n| Ô 1 | Ô 2 |\n', '')} className="h-7 w-7 flex items-center justify-center rounded hover:bg-slate-200/80 text-indigo-600" title="Chèn bảng">📊</button>
                            </div>
                          </div>

                          <div className="flex items-center gap-2">
                            <button
                              type="button"
                              onClick={() => setShowPreviewPane(!showPreviewPane)}
                              className={`flex items-center gap-1 px-2.5 py-1 text-[9px] font-extrabold border rounded-lg transition-all ${
                                showPreviewPane ? 'bg-[#0f766e] border-[#0f766e] text-white shadow-sm' : 'bg-white border-[#dce5e1] text-[#52605b] hover:bg-[#edf4f1]'
                              }`}
                            >
                              👁️ <span>{showPreviewPane ? 'Đang bật Xem trước' : 'Xem trước'}</span>
                            </button>
                          </div>
                        </div>
                      )}

                      {/* ─── Editor Content Panes ─── */}
                      <div className={`flex-1 flex flex-col border border-[#dce5e1] rounded-b-lg overflow-hidden bg-white ${isMaximized ? 'min-h-[450px] md:h-[calc(100vh-280px)]' : 'min-h-[320px]'}`}>
                        {editorMode === 'wysiwyg' ? (
                          /* Visual WYSIWYG Pane */
                          <div
                            ref={editorRef}
                            contentEditable
                            onInput={handleWysiwygInput}
                            className="flex-1 w-full p-4 text-[13px] leading-relaxed text-slate-800 outline-none overflow-y-auto select-text prose max-w-none text-justify bg-white"
                            style={{ minHeight: '220px' }}
                          />
                        ) : (
                          /* Raw Source Code Pane */
                          <div className={`flex-1 grid grid-cols-1 ${showPreviewPane ? 'md:grid-cols-2 divide-y md:divide-y-0 md:divide-x divide-slate-200' : ''} overflow-hidden`}>
                            <textarea
                              id="post-content-textarea"
                              className={`w-full p-3 text-xs font-mono focus:outline-none resize-none leading-relaxed bg-white h-full ${isMaximized ? 'min-h-[400px]' : 'min-h-[220px]'}`}
                              value={formContent}
                              onChange={e => setFormContent(e.target.value)}
                              placeholder="Nhập mã nguồn HTML hoặc cú pháp Markdown chi tiết..."
                              required
                            />
                            {showPreviewPane && (
                              <div className={`p-3 overflow-y-auto bg-slate-50/50 text-slate-800 text-xs leading-relaxed prose max-w-none ${isMaximized ? 'h-[450px] md:h-[calc(100vh-280px)]' : 'max-h-[380px] min-h-[220px]'}`}>
                                <p className="text-[9px] font-bold uppercase tracking-wider text-slate-400 mb-2 border-b pb-1">Xem trước nội dung:</p>
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
                ) : (
                  <div className={`flex flex-col space-y-4 bg-slate-50/80 p-4 rounded-xl border border-slate-200 overflow-y-auto ${isMaximized ? 'h-[60vh] md:h-[calc(100vh-200px)]' : 'max-h-[500px]'}`}>
                    {/* Character Analysis */}
                    <div>
                      <h4 className="text-xs font-black text-[#123c34] uppercase tracking-wide mb-2.5">📊 Phân tích SEO On-page</h4>
                      
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        <div className="bg-white p-3 rounded-lg border border-slate-200">
                          <div className="flex justify-between items-center text-xs">
                            <span className="font-bold text-[#123c34]">Độ dài tiêu đề SEO</span>
                            <span className={`font-mono font-bold ${
                              formTitle.length >= 50 && formTitle.length <= 60 
                                ? 'text-emerald-600' 
                                : 'text-amber-500'
                            }`}>
                              {formTitle.length} ký tự
                            </span>
                          </div>
                          <div className="w-full bg-slate-100 h-1.5 rounded-full mt-1.5 overflow-hidden">
                            <div 
                              className={`h-full rounded-full transition-all ${
                                formTitle.length >= 50 && formTitle.length <= 60 ? 'bg-emerald-500' : 'bg-amber-400'
                              }`} 
                              style={{ width: `${Math.min((formTitle.length / 70) * 100, 100)}%` }} 
                            />
                          </div>
                          <p className="text-[10px] text-slate-400 mt-1">Khuyên dùng từ 50 - 60 ký tự.</p>
                        </div>

                        <div className="bg-white p-3 rounded-lg border border-slate-200">
                          <div className="flex justify-between items-center text-xs">
                            <span className="font-bold text-[#123c34]">Độ dài mô tả (Description)</span>
                            <span className={`font-mono font-bold ${
                              formSummary.length >= 140 && formSummary.length <= 160 
                                ? 'text-emerald-600' 
                                : 'text-amber-500'
                            }`}>
                              {formSummary.length} ký tự
                            </span>
                          </div>
                          <div className="w-full bg-slate-100 h-1.5 rounded-full mt-1.5 overflow-hidden">
                            <div 
                              className={`h-full rounded-full transition-all ${
                                formSummary.length >= 140 && formSummary.length <= 160 ? 'bg-emerald-500' : 'bg-amber-400'
                              }`} 
                              style={{ width: `${Math.min((formSummary.length / 175) * 100, 100)}%` }} 
                            />
                          </div>
                          <p className="text-[10px] text-slate-400 mt-1">Khuyên dùng từ 140 - 160 ký tự.</p>
                        </div>
                      </div>
                    </div>

                    {/* Google Simulator */}
                    <div>
                      <h4 className="text-xs font-black text-[#123c34] uppercase tracking-wide mb-2.5">🔍 Mô phỏng Google Search (Desktop)</h4>
                      <div className="bg-white p-4 rounded-lg border border-slate-200 shadow-sm flex flex-col font-sans select-text">
                        <div className="flex items-center gap-1.5 text-xs text-slate-500">
                          <span>🌐 https://huit.startup.edu.vn</span>
                          <span>›</span>
                          <span>tin-tuc</span>
                          <span>›</span>
                          <span className="text-[#0f766e] font-semibold">{formSlug || 'tieu-de-bai-viet'}</span>
                        </div>
                        <h3 className="text-[19px] text-[#1a0dab] font-medium hover:underline cursor-pointer mt-0.5 leading-tight truncate">
                          {formTitle ? `${formTitle} - HUIT Startup 2026` : 'Chưa nhập tiêu đề bài viết...'}
                        </h3>
                        <p className="text-xs text-slate-600 mt-1 leading-normal max-w-[600px] line-clamp-2">
                          {formSummary || 'Chưa nhập tóm tắt mô tả ngắn. Nội dung tóm tắt mô tả bài viết sẽ xuất hiện ở đây khi hiển thị kết quả tìm kiếm trên Google.'}
                        </p>
                      </div>
                    </div>

                    {/* Facebook Simulator */}
                    <div>
                      <h4 className="text-xs font-black text-[#123c34] uppercase tracking-wide mb-2.5">👥 Mô phỏng chia sẻ Facebook (Zalo, LinkedIn)</h4>
                      <div className="bg-white rounded-lg border border-slate-200 overflow-hidden shadow-sm max-w-[500px] flex flex-col font-sans select-text">
                        <div className="w-full aspect-[1200/630] bg-slate-100 flex items-center justify-center overflow-hidden border-b border-slate-100">
                          <img 
                            src={formatAssetUrl(formThumbnailUrl) || '/uploads/baner.jpg'} 
                            alt="FB share preview" 
                            className="w-full h-full object-cover" 
                          />
                        </div>
                        <div className="p-3 bg-slate-50 border-t border-slate-100 flex flex-col">
                          <span className="text-[10px] text-slate-400 uppercase tracking-wider font-semibold">huit.startup.edu.vn</span>
                          <span className="text-sm font-bold text-[#1d2129] mt-0.5 line-clamp-1">
                            {formTitle || 'Chưa nhập tiêu đề bài viết...'}
                          </span>
                          <span className="text-xs text-slate-500 mt-0.5 line-clamp-2 leading-relaxed">
                            {formSummary || 'Nhập mô tả tóm tắt ngắn để hiển thị mô tả chia sẻ trên Facebook...'}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-3 border-t border-[#edf2f0]">
              <button type="button" onClick={() => setModalMode(null)} className="px-3.5 py-1.5 border border-[#dce5e1] hover:bg-[#edf4f1] rounded-lg text-[#52605b] text-[10px] font-bold transition-colors">Hủy bỏ</button>
              <button type="submit" className="px-3.5 py-1.5 bg-[#123c34] hover:bg-[#0f766e] rounded-lg text-white text-[10px] font-bold shadow transition-colors">Lưu lại</button>
            </div>
          </form>
        </div>
      )}

      {customPrompt.isOpen && (
        <div className="fixed inset-0 bg-[#10211d]/75 flex items-center justify-center p-4 z-[100] backdrop-blur-sm animate-in fade-in duration-200">
          <form 
            onSubmit={handleCustomPromptSubmit}
            className="bg-white border border-[#dce5e1] p-5 rounded-xl w-full max-w-md flex flex-col space-y-4 shadow-2xl animate-in zoom-in duration-200"
          >
            <div className="flex items-center justify-between border-b border-[#edf2f0] pb-2.5">
              <h4 className="text-sm font-black text-[#123c34] flex items-center gap-1.5">
                {customPrompt.type === 'link' ? (
                  <svg className="w-4 h-4 text-blue-600" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71"/><path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71"/></svg>
                ) : (
                  <svg className="w-4 h-4 text-emerald-600" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="3" width="18" height="18" rx="2" ry="2"/><circle cx="8.5" cy="8.5" r="1.5"/><polyline points="21 15 16 10 5 21"/></svg>
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
              <div className="flex flex-col space-y-1">
                <label className="text-[9px] font-extrabold text-[#52605b] uppercase tracking-wider">{customPrompt.label1}</label>
                <input 
                  type="text" 
                  className="h-9 px-3 rounded-lg bg-[#fbfdfc] border border-[#dce5e1] text-[#18211f] focus:outline-none focus:border-[#0f766e] text-xs font-semibold"
                  value={customPrompt.val1}
                  onChange={e => setCustomPrompt(prev => ({ ...prev, val1: e.target.value }))}
                  required
                  placeholder={customPrompt.type === 'link' ? "Ví dụ: Xem thêm tại đây..." : "Ví dụ: Ảnh lễ khai mạc cuộc thi..."}
                />
              </div>

              <div className="flex flex-col space-y-1">
                <label className="text-[9px] font-extrabold text-[#52605b] uppercase tracking-wider">{customPrompt.label2}</label>
                <input 
                  type="text" 
                  className="h-9 px-3 rounded-lg bg-[#fbfdfc] border border-[#dce5e1] text-[#18211f] focus:outline-none focus:border-[#0f766e] text-xs font-mono font-semibold"
                  value={customPrompt.val2}
                  onChange={e => setCustomPrompt(prev => ({ ...prev, val2: e.target.value }))}
                  required
                  placeholder="https://..."
                />
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-2 border-t border-[#edf2f0]">
              <button 
                type="button" 
                onClick={() => setCustomPrompt(prev => ({ ...prev, isOpen: false }))}
                className="px-3.5 py-1.5 border border-[#dce5e1] hover:bg-[#edf4f1] rounded-lg text-[#52605b] text-[10px] font-bold transition-colors cursor-pointer"
              >
                Hủy bỏ
              </button>
              <button 
                type="submit" 
                className="px-4 py-1.5 bg-[#123c34] hover:bg-[#0f766e] rounded-lg text-white text-[10px] font-bold shadow transition-colors cursor-pointer"
              >
                Chèn vào nội dung
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}
