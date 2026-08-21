'use client';

import React from 'react';
import Link from 'next/link';

interface Post {
  id: string;
  title: string;
  slug: string;
  summary: string | null;
  content: string;
  thumbnailUrl: string | null;
  category: string;
  views: number;
  createdAt: string;
}

interface ClientPostDetailProps {
  post: Post | null;
  relatedPosts: Post[];
}

export default function ClientPostDetail({ post, relatedPosts }: ClientPostDetailProps) {
  if (!post) {
    return (
      <main className="flex-1 min-h-screen py-20 flex flex-col items-center justify-center text-center px-4" style={{ background: 'var(--site-bg)' }}>
        <div className="text-5xl mb-4">⚠️</div>
        <h1 className="text-xl font-bold text-[var(--site-text)]">Không tìm thấy bài viết</h1>
        <p className="text-xs text-[var(--site-muted)] mt-1 max-w-sm">
          Bài viết này không tồn tại hoặc đã bị ẩn bởi quản trị viên.
        </p>
        <Link href="/tin-tuc" className="mt-6 px-5 py-2.5 bg-primary rounded-full text-white text-xs font-bold uppercase tracking-wider hover:opacity-90 transition">
          Quay lại danh sách tin tức
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

  return (
    <>
      <style>{`
        .post-detail-page { background: var(--site-bg); }
        .post-body-content {
          color: var(--site-text);
          font-size: 15px;
          line-height: 1.8;
        }
        .post-body-content p {
          margin-bottom: 20px;
          text-align: justify;
          text-justify: inter-word;
        }
        .post-body-content strong {
          color: var(--site-text);
          font-weight: 700;
        }
        .post-body-content h3 {
          font-size: 20px;
          font-weight: 800;
          margin-top: 32px;
          margin-bottom: 12px;
          color: var(--site-text);
          border-left: 4px solid var(--site-primary);
          padding-left: 12px;
        }
        .post-body-content ul {
          list-style-type: disc;
          padding-left: 20px;
          margin-bottom: 20px;
        }
        .post-body-content li {
          margin-bottom: 8px;
        }
        .post-body-content img {
          max-width: 100%;
          height: auto;
          border-radius: 16px;
          margin: 24px auto;
          display: block;
          box-shadow: 0 8px 24px rgba(0,0,0,0.1);
        }
        .post-body-content a {
          color: var(--site-primary);
          text-decoration: underline;
          font-weight: 600;
        }
        .post-body-content a:hover {
          opacity: 0.8;
        }
        
        .related-news-grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
          gap: 20px;
        }
      `}</style>

      <main className="post-detail-page flex-1 min-h-screen pb-20" style={{ background: 'var(--site-bg)' }}>
        
        {/* === HEADER & BREADCRUMBS === */}
        <section className="subpage-hero" style={{ paddingBottom: 40 }}>
          <div className="subpage-hero-bg" />
          <div className="subpage-hero-content">
            <div className="subpage-breadcrumb">
              <Link href="/">Trang chủ</Link>
              <svg width="12" height="12" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                <polyline points="9 18 15 12 9 6" />
              </svg>
              <Link href="/tin-tuc">Tin tức &amp; Thông báo</Link>
              <svg width="12" height="12" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                <polyline points="9 18 15 12 9 6" />
              </svg>
              <span className="line-clamp-1 max-w-[240px]">{post.title}</span>
            </div>

            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-[10px] font-black uppercase tracking-wider mb-4"
              style={{ background: 'color-mix(in srgb, var(--site-primary) 12%, var(--site-card))', color: 'var(--site-primary)' }}>
              📢 {post.category}
            </div>

            <h1 className="text-2xl sm:text-4xl font-extrabold text-center sm:text-justify max-w-[1100px] leading-tight mx-auto" style={{ color: 'var(--site-text)', textJustify: 'inter-word' }}>
              {post.title}
            </h1>
            
            <div className="flex flex-wrap items-center justify-center gap-4 text-xs mt-4" style={{ color: 'var(--site-muted)' }}>
              <span className="flex items-center gap-1">📅 {formatDate(post.createdAt)}</span>
              <span>•</span>
              <span>👁️ {post.views.toLocaleString()} lượt xem</span>
            </div>
            
            <div className="subpage-divider" style={{ marginTop: 24 }} />
          </div>
        </section>

        {/* === MAIN CONTENT BODY === */}
        <div className="max-w-[1100px] mx-auto px-4 sm:px-6 py-6">
          <div className="flex flex-col">
            {/* Action buttons (Back) */}
            <div className="mb-8">
              <Link href="/tin-tuc" className="inline-flex items-center gap-2 text-xs font-bold text-[var(--site-primary)] hover:opacity-85">
                <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                  <line x1="19" y1="12" x2="5" y2="12" /><polyline points="12 19 5 12 12 5" />
                </svg>
                Quay lại danh sách tin tức
              </Link>
            </div>

            {/* Thumbnail */}
            {post.thumbnailUrl && (
              <div className="w-full rounded-3xl overflow-hidden mb-8 border border-[var(--site-line)] shadow-lg aspect-video max-h-[420px]">
                <img
                  src={post.thumbnailUrl}
                  alt={post.title}
                  className="w-full h-full object-cover"
                />
              </div>
            )}

            {/* Post Summary */}
            {post.summary && (
              <div className="p-5 rounded-2xl border border-[var(--site-line)] bg-white/[0.02] mb-8"
                style={{ background: 'color-mix(in srgb, var(--site-primary) 3%, var(--site-card))', borderLeft: '4px solid var(--site-primary)' }}>
                <p className="text-xs font-black uppercase text-[var(--site-primary)] mb-1.5 tracking-wider">Tóm tắt bài viết</p>
                <p className="text-sm font-semibold text-[var(--site-text)] leading-relaxed italic m-0">
                  {post.summary}
                </p>
              </div>
            )}

            {/* Rich Content Body */}
            <article className="post-body-content" dangerouslySetInnerHTML={{ __html: post.content }} />

            <div className="h-[1px] w-full bg-[var(--site-line)] my-12" />

            {/* === RELATED NEWS === */}
            {relatedPosts.length > 0 && (
              <div>
                <h3 className="text-lg font-black text-[var(--site-text)] mb-6 flex items-center gap-2">
                  <span>📰</span> Tin tức liên quan khác
                </h3>
                <div className="related-news-grid">
                  {relatedPosts.map((rp) => (
                    <article key={rp.id} className="news-card-modern flex flex-col h-full">
                      <div className="relative overflow-hidden aspect-video">
                        <img
                          src={rp.thumbnailUrl || '/uploads/baner.jpg'}
                          alt={rp.title}
                          loading="lazy"
                          className="w-full h-full object-cover"
                        />
                      </div>
                      <div className="news-card-body flex-1 flex flex-col justify-between">
                        <div>
                          <div className="news-meta">
                            <strong>{rp.category}</strong>
                            <span>•</span>
                            <time>{formatDate(rp.createdAt)}</time>
                          </div>
                          <h4 className="text-sm font-bold text-[var(--site-text)] leading-snug line-clamp-2 mt-2">
                            <Link href={`/tin-tuc/${rp.slug}`} className="hover:text-[var(--site-primary)] transition">
                              {rp.title}
                            </Link>
                          </h4>
                        </div>
                        <Link href={`/tin-tuc/${rp.slug}`} className="text-[11px] font-extrabold text-[var(--site-primary)] hover:underline mt-4">
                          Xem chi tiết →
                        </Link>
                      </div>
                    </article>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </main>
    </>
  );
}
