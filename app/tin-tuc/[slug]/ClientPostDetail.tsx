'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useLanguage } from '../../../src/i18n/use-language';
import { localizedText } from '../../../src/i18n/content';

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
  createdAt: string;
}

interface ClientPostDetailProps {
  post: Post | null;
  relatedPosts: Post[];
}

function parseMarkdownToHtml(raw?: string | null): string {
  if (!raw) return '';
  const trimmed = raw.trim();

  // If already standard rich HTML from WYSIWYG
  if (/^<(p|div|article|h[1-6]|section|table|ul|ol)/i.test(trimmed)) {
    return trimmed;
  }

  let text = trimmed.replace(/\r\n/g, '\n').replace(/\r/g, '\n');

  // Headings
  text = text.replace(/^#### (.*$)/gim, '<h4 class="post-h4">$1</h4>');
  text = text.replace(/^### (.*$)/gim, '<h3 class="post-h3"><span class="post-h3-bullet">✦</span><span>$1</span></h3>');
  text = text.replace(/^## (.*$)/gim, '<h2 class="post-h2"><span class="post-h2-icon">📌</span><span>$1</span></h2>');
  text = text.replace(/^# (.*$)/gim, '<h1 class="post-h1">$1</h1>');

  // Bold & Italic
  text = text.replace(/\*\*(.*?)\*\*/g, '<strong class="post-strong">$1</strong>');
  text = text.replace(/__(.*?)__/g, '<strong class="post-strong">$1</strong>');
  text = text.replace(/\*(.*?)\*/g, '<em class="post-em">$1</em>');

  // Links
  text = text.replace(/\[([^\]]+)\]\(([^)]+)\)/g, '<a href="$2" target="_blank" rel="noopener noreferrer" class="post-link">$1 ↗</a>');

  // Images
  text = text.replace(/!\[([^\]]*)\]\(([^)]+)\)/g, '<figure class="post-figure"><img src="$2" alt="$1" class="post-img" /><figcaption>$1</figcaption></figure>');

  // Horizontal rules
  text = text.replace(/^(?:---|\*\*\*|___)\s*$/gm, '<hr class="post-hr" />');

  // Blockquotes
  text = text.replace(/^> (.*$)/gim, '<blockquote class="post-blockquote">$1</blockquote>');

  // Process lists and paragraphs
  const lines = text.split('\n');
  const result: string[] = [];
  let inUl = false;
  let inOl = false;

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i].trim();
    const ulMatch = line.match(/^[-+*•]\s+(.*)$/);
    const olMatch = line.match(/^(\d+)\.\s+(.*)$/);

    if (ulMatch) {
      if (!inUl) {
        if (inOl) { result.push('</ol>'); inOl = false; }
        result.push('<ul class="post-ul">');
        inUl = true;
      }
      result.push(`<li><span class="post-bullet">✓</span><div class="post-li-body">${ulMatch[1]}</div></li>`);
    } else if (olMatch) {
      if (!inOl) {
        if (inUl) { result.push('</ul>'); inUl = false; }
        result.push('<ol class="post-ol">');
        inOl = true;
      }
      result.push(`<li><span class="post-ol-num">${olMatch[1]}</span><div class="post-li-body">${olMatch[2]}</div></li>`);
    } else {
      if (inUl) { result.push('</ul>'); inUl = false; }
      if (inOl) { result.push('</ol>'); inOl = false; }

      if (!line) continue;

      if (/^<(h[1-6]|div|p|blockquote|figure|table|hr|ul|ol)/i.test(line)) {
        result.push(line);
      } else {
        result.push(`<p class="post-p">${line}</p>`);
      }
    }
  }

  if (inUl) result.push('</ul>');
  if (inOl) result.push('</ol>');

  return result.join('\n');
}

export default function ClientPostDetail({ post, relatedPosts }: ClientPostDetailProps) {
  const language = useLanguage();
  const [copied, setCopied] = useState(false);
  const text = (vi?: string | null, en?: string | null) => localizedText(language, vi, en);

  if (!post) {
    return (
      <main className="flex-1 min-h-screen py-24 flex flex-col items-center justify-center text-center px-4" style={{ background: 'var(--site-bg)' }}>
        <div className="w-16 h-16 rounded-2xl bg-amber-500/10 text-amber-500 flex items-center justify-center text-3xl mb-4 shadow-sm">
          ⚠️
        </div>
        <h1 className="text-2xl font-black text-[var(--site-text)] mb-2">
          {language === 'en' ? 'Post not found' : 'Không tìm thấy bài viết'}
        </h1>
        <p className="text-sm text-[var(--site-muted)] max-w-sm mb-6 leading-relaxed">
          Bài viết này không tồn tại hoặc đã bị ẩn bởi ban quản trị cuộc thi.
        </p>
        <Link
          href="/tin-tuc"
          className="inline-flex items-center gap-2 px-6 py-3 rounded-full bg-[var(--site-primary)] text-white text-xs font-black uppercase tracking-wider shadow-lg hover:opacity-90 transition"
        >
          ← Quay lại danh sách tin tức
        </Link>
      </main>
    );
  }

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

  const readingTime = Math.max(1, Math.ceil((post.content?.split(/\s+/).length || 0) / 200));

  const handleCopyLink = () => {
    if (typeof window !== 'undefined') {
      navigator.clipboard.writeText(window.location.href);
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    }
  };

  const handleShareFacebook = () => {
    if (typeof window !== 'undefined') {
      const url = encodeURIComponent(window.location.href);
      window.open(`https://www.facebook.com/sharer/sharer.php?u=${url}`, '_blank', 'noopener,noreferrer');
    }
  };

  const renderedContent = parseMarkdownToHtml(text(post.content, post.contentEn));

  return (
    <>
      <style>{`
        .post-detail-page { background: var(--site-bg); }

        .post-body-content {
          color: var(--site-text);
          font-size: 16px;
          line-height: 1.85;
        }

        .post-body-content .post-h2 {
          font-size: 1.75rem;
          font-weight: 900;
          margin-top: 2.75rem;
          margin-bottom: 1.25rem;
          color: var(--site-text);
          display: flex;
          align-items: center;
          gap: 0.65rem;
          padding-bottom: 0.75rem;
          border-bottom: 2px solid var(--site-line);
          line-height: 1.4;
        }

        .post-body-content .post-h3 {
          font-size: 1.35rem;
          font-weight: 800;
          margin-top: 2.25rem;
          margin-bottom: 1rem;
          color: var(--site-primary);
          display: flex;
          align-items: center;
          gap: 0.55rem;
          line-height: 1.4;
        }

        .post-body-content .post-h4 {
          font-size: 1.15rem;
          font-weight: 700;
          margin-top: 1.75rem;
          margin-bottom: 0.75rem;
          color: var(--site-text);
        }

        .post-body-content .post-h2-icon {
          font-size: 1.45rem;
          flex-shrink: 0;
        }

        .post-body-content .post-h3-bullet {
          color: var(--site-primary);
          font-size: 1.1rem;
          flex-shrink: 0;
        }

        .post-body-content .post-p {
          margin-bottom: 1.35rem;
          text-align: justify;
          color: var(--site-text);
          opacity: 0.95;
          line-height: 1.85;
        }

        .post-body-content .post-ul,
        .post-body-content .post-ol {
          list-style: none;
          padding-left: 0;
          margin-top: 0.75rem;
          margin-bottom: 1.75rem;
          display: flex;
          flex-direction: column;
          gap: 0.65rem;
        }

        .post-body-content .post-ul li,
        .post-body-content .post-ol li {
          display: flex;
          align-items: flex-start;
          gap: 0.85rem;
          background: color-mix(in srgb, var(--site-card) 92%, transparent);
          padding: 1rem 1.35rem;
          border-radius: 1rem;
          border: 1px solid var(--site-line);
          transition: all 0.25s ease;
          box-shadow: 0 2px 8px rgba(0,0,0,0.02);
        }

        .post-body-content .post-ul li:hover,
        .post-body-content .post-ol li:hover {
          border-color: color-mix(in srgb, var(--site-primary) 40%, transparent);
          transform: translateX(4px);
        }

        .post-body-content .post-bullet {
          display: grid;
          place-items: center;
          width: 1.5rem;
          height: 1.5rem;
          border-radius: 0.5rem;
          background: color-mix(in srgb, var(--site-primary) 12%, transparent);
          color: var(--site-primary);
          font-size: 0.85rem;
          font-weight: 900;
          flex-shrink: 0;
          margin-top: 0.15rem;
        }

        .post-body-content .post-ol-num {
          display: grid;
          place-items: center;
          width: 1.5rem;
          height: 1.5rem;
          border-radius: 0.5rem;
          background: color-mix(in srgb, var(--site-primary) 15%, transparent);
          color: var(--site-primary);
          font-size: 0.8rem;
          font-weight: 900;
          flex-shrink: 0;
          margin-top: 0.15rem;
        }

        .post-body-content .post-li-body {
          flex: 1;
          font-size: 1.02rem;
          line-height: 1.75;
          color: var(--site-text);
        }

        .post-body-content strong,
        .post-body-content .post-strong {
          color: var(--site-text);
          font-weight: 800;
        }

        .post-body-content a.post-link {
          color: var(--site-primary);
          font-weight: 700;
          text-decoration: underline;
          text-underline-offset: 3px;
          transition: opacity 0.2s;
        }

        .post-body-content a.post-link:hover {
          opacity: 0.8;
        }

        .post-body-content .post-blockquote {
          border-left: 4px solid var(--site-primary);
          background: color-mix(in srgb, var(--site-primary) 5%, var(--site-card));
          padding: 1.25rem 1.5rem;
          border-radius: 0 1rem 1rem 0;
          font-style: italic;
          margin: 1.75rem 0;
          color: var(--site-text);
          line-height: 1.8;
        }

        .post-body-content .post-hr {
          border: none;
          height: 1px;
          background: var(--site-line);
          margin: 2.5rem 0;
        }

        .post-body-content img {
          max-width: 100%;
          height: auto;
          border-radius: 1.25rem;
          margin: 2rem auto;
          display: block;
          box-shadow: 0 10px 30px rgba(0,0,0,0.08);
          border: 1px solid var(--site-line);
        }

        .related-news-grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
          gap: 24px;
        }
      `}</style>

      <main className="post-detail-page flex-1 min-h-screen pb-24" style={{ background: 'var(--site-bg)' }}>
        
        {/* === HERO & BREADCRUMB === */}
        <section className="relative overflow-hidden pt-8 pb-12 border-b border-[var(--site-line)]">
          <div className="absolute inset-0 bg-gradient-to-b from-[var(--site-primary)]/5 via-transparent to-transparent pointer-events-none" />
          
          <div className="max-w-[1040px] mx-auto px-4 sm:px-6 relative z-10">
            {/* Breadcrumbs */}
            <nav className="flex items-center gap-2 text-xs font-semibold text-[var(--site-muted)] mb-6 flex-wrap" aria-label="Breadcrumb">
              <Link href="/" className="hover:text-[var(--site-primary)] transition flex items-center gap-1">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="m3 9 9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/>
                  <polyline points="9 22 9 12 15 12 15 22"/>
                </svg>
                Trang chủ
              </Link>
              <span>/</span>
              <Link href="/tin-tuc" className="hover:text-[var(--site-primary)] transition">
                Tin tức & Thông báo
              </Link>
              <span>/</span>
              <span className="text-[var(--site-text)] font-bold truncate max-w-[280px] sm:max-w-md">
                {text(post.title, post.titleEn)}
              </span>
            </nav>

            {/* Category Badge & Actions */}
            <div className="flex flex-wrap items-center justify-between gap-4 mb-5">
              <span className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-xs font-black uppercase tracking-wider bg-gradient-to-r from-[var(--site-primary)]/15 via-[#79BCC2]/15 to-transparent text-[var(--site-primary)] border border-[var(--site-primary)]/20 shadow-xs">
                📢 {post.category}
              </span>

              <Link
                href="/tin-tuc"
                className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-xs font-bold text-[var(--site-text)] border border-[var(--site-line)] bg-[var(--site-card)] hover:border-[var(--site-primary)] hover:text-[var(--site-primary)] transition shadow-xs"
              >
                ← Quay lại danh sách tin tức
              </Link>
            </div>

            {/* Article Headline */}
            <h1 className="text-2xl sm:text-3xl md:text-4xl lg:text-[40px] font-black leading-[1.4] sm:leading-[1.45] text-[var(--site-text)] tracking-tight mb-6">
              {text(post.title, post.titleEn)}
            </h1>

            {/* Meta bar: Date, Views, Reading time, Organizer */}
            <div className="flex flex-wrap items-center gap-y-2 gap-x-4 text-xs font-medium text-[var(--site-muted)] pt-2 border-t border-[var(--site-line)]/60">
              <span className="flex items-center gap-1.5">
                📅 {formatDate(post.createdAt)}
              </span>
              <span>•</span>
              <span className="flex items-center gap-1.5">
                👁️ {post.views.toLocaleString()} lượt xem
              </span>
              <span>•</span>
              <span className="flex items-center gap-1.5">
                ⏱️ {readingTime} phút đọc
              </span>
              <span className="hidden sm:inline">•</span>
              <span className="text-[var(--site-text)] font-semibold">
                Ban Tổ chức HUIT's ICONIC 2026
              </span>
            </div>
          </div>
        </section>

        {/* === MAIN CONTENT CONTAINER === */}
        <div className="max-w-[1040px] mx-auto px-4 sm:px-6 py-10">
          
          {/* Featured Infographic / Banner Image (Snug fit to portrait poster) */}
          {post.thumbnailUrl && (
            <div className="w-full max-w-[660px] mx-auto rounded-3xl overflow-hidden mb-12 border border-[var(--site-line)] shadow-xl bg-gradient-to-b from-slate-900/5 to-slate-900/15 p-2 sm:p-2.5">
              <img
                src={post.thumbnailUrl}
                alt={text(post.title, post.titleEn)}
                className="w-full h-auto max-h-[720px] object-contain rounded-2xl mx-auto block shadow-sm"
              />
            </div>
          )}

          {/* Reading Column */}
          <div className="max-w-[840px] mx-auto">
            
            {/* Post Summary Callout */}
            {text(post.summary, post.summaryEn) && (
              <div className="mb-10 p-6 sm:p-7 rounded-2xl border border-[var(--site-line)] bg-gradient-to-br from-blue-500/8 via-cyan-500/5 to-transparent relative overflow-hidden shadow-xs">
                <div className="flex items-center gap-2 mb-2.5">
                  <span className="text-base">💡</span>
                  <span className="text-xs font-black uppercase tracking-wider text-[var(--site-primary)]">
                    {language === 'en' ? 'Article Summary' : 'Tóm tắt nội dung'}
                  </span>
                </div>
                <p className="text-[15px] sm:text-[16px] font-semibold text-[var(--site-text)] leading-relaxed italic m-0 opacity-95">
                  "{text(post.summary, post.summaryEn)}"
                </p>
              </div>
            )}

            {/* Rich Content Body */}
            <article
              className="post-body-content"
              dangerouslySetInnerHTML={{ __html: renderedContent }}
            />

            {/* Social Share & Bottom Action Bar */}
            <div className="mt-12 pt-6 border-t border-[var(--site-line)] flex flex-wrap items-center justify-between gap-4">
              <div className="flex flex-wrap items-center gap-2 text-xs font-bold text-[var(--site-muted)]">
                <span>Chia sẻ bài viết:</span>
                <button
                  onClick={handleShareFacebook}
                  className="px-3 py-1.5 rounded-xl bg-blue-600/10 text-blue-600 hover:bg-blue-600/20 transition flex items-center gap-1.5 text-xs font-bold"
                  title="Chia sẻ lên Facebook"
                >
                  <svg className="w-3.5 h-3.5 fill-current" viewBox="0 0 24 24">
                    <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
                  </svg>
                  <span>Facebook</span>
                </button>
                <button
                  onClick={handleCopyLink}
                  className="px-3 py-1.5 rounded-xl bg-[var(--site-primary)]/10 text-[var(--site-primary)] hover:bg-[var(--site-primary)]/20 transition flex items-center gap-1.5 text-xs font-bold"
                  title="Sao chép đường dẫn bài viết"
                >
                  <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" strokeWidth="2.2" viewBox="0 0 24 24">
                    <rect width="14" height="14" x="8" y="8" rx="2" ry="2"/>
                    <path d="M4 16c-1.1 0-2-.9-2-2V4c0-1.1.9-2 2-2h10c1.1 0 2 .9 2 2"/>
                  </svg>
                  <span>{copied ? 'Đã sao chép! ✓' : 'Sao chép link'}</span>
                </button>
              </div>

              <Link
                href="/tin-tuc"
                className="text-xs font-extrabold text-[var(--site-primary)] hover:underline flex items-center gap-1"
              >
                ← Quay lại danh sách tin tức
              </Link>
            </div>

            {/* Official OC Signature Card */}
            <div className="mt-8 p-6 sm:p-7 rounded-2xl border border-[var(--site-line)] bg-gradient-to-br from-blue-500/5 via-[var(--site-card)] to-transparent flex flex-col sm:flex-row items-center justify-between gap-6 shadow-sm">
              <div className="flex items-center gap-4 text-left">
                <div className="w-14 h-14 rounded-2xl bg-[var(--site-primary)]/10 border border-[var(--site-primary)]/20 flex items-center justify-center shrink-0">
                  <span className="text-2xl">👑</span>
                </div>
                <div>
                  <h4 className="font-extrabold text-[var(--site-text)] text-base">
                    Ban Tổ Chức HUIT’s ICONIC 2026
                  </h4>
                  <p className="text-xs text-[var(--site-muted)] mt-0.5">
                    Trường Đại học Công Thương TP. Hồ Chí Minh (HUIT)
                  </p>
                  <p className="text-xs text-[var(--site-muted)] mt-0.5">
                    Hotline / Zalo: <b>0974 331 499</b> • Email: <b>duongdx@huit.edu.vn</b>
                  </p>
                </div>
              </div>
              <div className="shrink-0 flex gap-2.5">
                <Link
                  href="/dang-ky"
                  className="px-5 py-2.5 rounded-full text-xs font-black uppercase tracking-wider bg-gradient-to-r from-[var(--site-primary)] to-[#79BCC2] text-white shadow-md hover:opacity-90 transition active:scale-95"
                >
                  Đăng ký dự thi ngay →
                </Link>
              </div>
            </div>

          </div>

          {/* === RELATED NEWS SECTION === */}
          {relatedPosts.length > 0 && (
            <div className="mt-16 pt-12 border-t border-[var(--site-line)]">
              <div className="flex items-center justify-between gap-4 mb-8">
                <h3 className="text-xl sm:text-2xl font-black text-[var(--site-text)] flex items-center gap-2.5">
                  <span>📰</span> Tin tức liên quan khác
                </h3>
                <Link href="/tin-tuc" className="text-xs font-extrabold text-[var(--site-primary)] hover:underline">
                  Xem tất cả tin tức →
                </Link>
              </div>

              <div className="related-news-grid">
                {relatedPosts.map((rp) => {
                  const rpUrl = `/tin-tuc/${rp.slug || rp.id}`;
                  return (
                    <Link
                      key={rp.id}
                      href={rpUrl}
                      className="news-card-modern flex flex-col h-full group cursor-pointer block no-underline text-inherit transition-all duration-300 hover:-translate-y-1 hover:shadow-lg"
                    >
                      <div className="relative overflow-hidden aspect-video">
                        <img
                          src={rp.thumbnailUrl || '/uploads/baner.jpg'}
                          alt={rp.title}
                          loading="lazy"
                          className="w-full h-full object-cover transition duration-500 group-hover:scale-105"
                        />
                      </div>
                      <div className="news-card-body flex-1 flex flex-col justify-between p-5">
                        <div>
                          <div className="news-meta mb-2">
                            <strong>{rp.category}</strong>
                            <span>•</span>
                            <time>{formatDate(rp.createdAt)}</time>
                          </div>
                          <h4 className="text-sm font-bold text-[var(--site-text)] leading-snug line-clamp-2 group-hover:text-[var(--site-primary)] transition-colors">
                            {text(rp.title, rp.titleEn)}
                          </h4>
                          {rp.summary && (
                            <p className="text-xs text-[var(--site-muted)] line-clamp-2 mt-2 leading-relaxed">
                              {text(rp.summary, rp.summaryEn)}
                            </p>
                          )}
                        </div>
                        <div className="flex items-center justify-between border-t border-[var(--site-line)] mt-4 pt-3">
                          <span className="text-[10px] text-[var(--site-muted)]">👁️ {rp.views.toLocaleString()} xem</span>
                          <span className="text-[11px] font-extrabold text-[var(--site-primary)] group-hover:underline">
                            Xem chi tiết →
                          </span>
                        </div>
                      </div>
                    </Link>
                  );
                })}
              </div>
            </div>
          )}

        </div>
      </main>
    </>
  );
}
