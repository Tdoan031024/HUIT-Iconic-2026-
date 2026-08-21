'use client';

import React, { useEffect, useState, useRef } from 'react';
import Link from 'next/link';
import { apiUrl } from '../api';
import { SAMPLE_NEWS_POSTS } from './samplePosts';

interface Post {
  id: string;
  title: string;
  slug: string;
  summary: string | null;
  thumbnailUrl: string | null;
  category: string;
  views: number;
  createdAt: string;
}

function useInView(threshold = 0.15) {
  const ref = useRef<HTMLDivElement>(null);
  const [visible, setVisible] = useState(false);
  useEffect(() => {
    if (typeof window === 'undefined') return;
    const obs = new IntersectionObserver(
      ([e]) => {
        if (e.isIntersecting) {
          setVisible(true);
          obs.disconnect();
        }
      },
      { threshold }
    );
    if (ref.current) obs.observe(ref.current);
    return () => obs.disconnect();
  }, [threshold]);
  return { ref, visible };
}

export default function TinTucPage() {
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('Tất cả');
  const [searchQuery, setSearchQuery] = useState('');
  
  const heroSection = useInView(0.2);
  const contentSection = useInView(0.1);

  const categories = ['Tất cả', 'Tin tức', 'Thông báo'];

  useEffect(() => {
    async function fetchPosts() {
      try {
        setLoading(true);
        const res = await fetch(apiUrl('/api/posts'));
        if (res.ok) {
          const data = await res.json();
          setPosts(Array.isArray(data) && data.length > 0 ? data : SAMPLE_NEWS_POSTS);
        } else {
          setPosts(SAMPLE_NEWS_POSTS);
        }
      } catch (err) {
        console.error('Failed to fetch posts:', err);
        setPosts(SAMPLE_NEWS_POSTS);
      } finally {
        setLoading(false);
      }
    }
    fetchPosts();
  }, []);

  const filteredPosts = posts.filter((post) => {
    const matchesCategory = activeTab === 'Tất cả' || post.category === activeTab;
    const matchesSearch =
      searchQuery === '' ||
      post.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (post.summary && post.summary.toLowerCase().includes(searchQuery.toLowerCase()));
    return matchesCategory && matchesSearch;
  });

  const featuredPost = filteredPosts[0];
  const listPosts = filteredPosts.slice(1);

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
        .tin-tuc-page { background: var(--site-bg); }
        @keyframes fadeUp { from{opacity:0;transform:translateY(24px)}to{opacity:1;transform:translateY(0)} }
        .fade-up { animation: fadeUp 0.7s cubic-bezier(0.16,1,0.3,1) both; }
        .fade-up-d1 { animation-delay: 100ms; }
        .fade-up-d2 { animation-delay: 200ms; }
        .fade-up-d3 { animation-delay: 300ms; }
        .category-tab-btn { transition: all 0.25s ease; }
        
        .news-grid-custom {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(320px, 1fr));
          gap: 24px;
        }
        
        .featured-card-wrap {
          display: grid;
          grid-template-columns: 1.5fr 1fr;
          gap: 24px;
          background: var(--site-card);
          border: 1px solid var(--site-line);
          border-radius: 24px;
          overflow: hidden;
          box-shadow: 0 10px 30px rgba(20,52,90,0.04);
          transition: all 0.3s ease;
        }
        .featured-card-wrap:hover {
          transform: translateY(-4px);
          box-shadow: var(--site-shadow);
        }
        .featured-img-box {
          height: 100%;
          min-height: 320px;
          position: relative;
          overflow: hidden;
        }
        .featured-img-box img {
          width: 100%;
          height: 100%;
          object-fit: cover;
          transition: transform 0.6s ease;
        }
        .featured-card-wrap:hover .featured-img-box img {
          transform: scale(1.03);
        }
        .featured-body {
          padding: 32px;
          display: flex;
          flex-direction: column;
          justify-content: center;
        }
        
        @media (max-width: 768px) {
          .featured-card-wrap {
            grid-template-columns: 1fr;
          }
          .featured-img-box {
            height: 220px;
            min-height: auto;
          }
          .featured-body {
            padding: 20px;
          }
        }
      `}</style>

      <main className="tin-tuc-page flex-1 min-h-screen pb-20" style={{ background: 'var(--site-bg)' }}>
        
        {/* === HERO SECTION === */}
        <section ref={heroSection.ref} className="subpage-hero">
          <div className="subpage-hero-bg" />
          <div className="subpage-hero-content">
            <div className="subpage-breadcrumb">
              <Link href="/">Trang chủ</Link>
              <svg width="12" height="12" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                <polyline points="9 18 15 12 9 6" />
              </svg>
              <span>Tin tức &amp; Thông báo</span>
            </div>

            <div className={`inline-flex items-center gap-2 px-4 py-2 rounded-full text-xs font-bold uppercase tracking-widest mb-4 ${heroSection.visible ? 'fade-up' : 'opacity-0'}`}
              style={{ background: 'color-mix(in srgb, var(--site-primary) 12%, var(--site-card))', color: 'var(--site-primary)', border: '1px solid color-mix(in srgb, var(--site-primary) 25%, transparent)' }}>
              📢 tin tức sự kiện
            </div>

            <h1 className={heroSection.visible ? 'fade-up fade-up-d1' : 'opacity-0'}>
              Tin tức &amp; Thông báo
            </h1>
            <p className={heroSection.visible ? 'fade-up fade-up-d2' : 'opacity-0'}>
              Cập nhật thông tin nhanh nhất, chính xác nhất về tiến trình cuộc thi, các sự kiện đồng hành và thông báo từ ban tổ chức.
            </p>

            <div className="subpage-divider" />
          </div>
        </section>

        <div className="max-w-[1140px] mx-auto px-4 sm:px-6 py-8" ref={contentSection.ref}>
          
          {/* === FILTER TOOLBAR === */}
          <div className={`flex flex-col md:flex-row md:items-center justify-between gap-4 mb-10 ${contentSection.visible ? 'fade-up' : 'opacity-0'}`}>
            {/* Tabs */}
            <div className="flex flex-wrap gap-2" role="tablist" aria-label="Danh mục tin tức">
              {categories.map((cat) => (
                <button
                  key={cat}
                  role="tab"
                  aria-selected={activeTab === cat}
                  onClick={() => setActiveTab(cat)}
                  className="category-tab-btn px-5 py-2.5 rounded-full text-xs font-bold transition-all"
                  style={activeTab === cat ? {
                    background: 'linear-gradient(135deg, var(--site-primary) 0%, #79BCC2 100%)',
                    color: '#fff',
                    boxShadow: '0 4px 15px rgba(10,47,255,0.15)',
                  } : {
                    background: 'var(--site-card)',
                    color: 'var(--site-text)',
                    border: '1px solid var(--site-line)',
                  }}
                >
                  {cat}
                </button>
              ))}
            </div>

            {/* Search */}
            <div className="relative max-w-sm w-full">
              <input
                type="text"
                placeholder="Tìm kiếm bài viết..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full h-10 pl-10 pr-4 rounded-full text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-[var(--site-primary)] transition"
                style={{
                  background: 'var(--site-card)',
                  border: '1px solid var(--site-line)',
                  color: 'var(--site-text)',
                }}
              />
              <svg className="absolute left-3.5 top-3 text-slate-400" width="18" height="18" style={{ width: '18px', height: '18px' }} fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                <circle cx="11" cy="11" r="8" /><line x1="21" y1="21" x2="16.65" y2="16.65" />
              </svg>
            </div>
          </div>

          {/* === CONTENT LISTING === */}
          {loading ? (
            <div className="flex flex-col items-center justify-center py-20 text-slate-400">
              <div className="animate-spin rounded-full h-10 w-10 border-4 border-[var(--site-primary)] border-t-transparent mb-4" />
              <p className="text-xs font-bold uppercase tracking-wider">Đang tải bài viết...</p>
            </div>
          ) : filteredPosts.length === 0 ? (
            <div className="text-center py-20 bg-white/[0.02] border border-white/5 rounded-3xl p-8" style={{ background: 'var(--site-card)', borderColor: 'var(--site-line)' }}>
              <div className="text-4xl mb-3">📭</div>
              <h3 className="text-base font-bold text-[var(--site-text)]">Chưa có bài viết nào</h3>
              <p className="text-xs text-[var(--site-muted)] mt-1">Không tìm thấy tin tức hay thông báo nào phù hợp với bộ lọc hiện tại.</p>
            </div>
          ) : (
            <div className="space-y-12">
              {/* Featured Post Card */}
              {featuredPost && activeTab === 'Tất cả' && searchQuery === '' && (
                <div className={`featured-card-wrap ${contentSection.visible ? 'fade-up fade-up-d1' : 'opacity-0'}`}>
                  <div className="featured-img-box">
                    <img
                      src={featuredPost.thumbnailUrl || '/uploads/baner.jpg'}
                      alt={featuredPost.title}
                      loading="lazy"
                    />
                  </div>
                  <div className="featured-body">
                    <div className="news-meta">
                      <strong>{featuredPost.category}</strong>
                      <span>•</span>
                      <time>{formatDate(featuredPost.createdAt)}</time>
                      <span>•</span>
                      <span>👁️ {featuredPost.views.toLocaleString()} lượt xem</span>
                    </div>
                    <h3 className="text-xl sm:text-2xl font-black text-[var(--site-text)] mt-3 mb-2 leading-snug">
                      <Link href={`/tin-tuc/${featuredPost.slug}`} className="hover:text-[var(--site-primary)] transition">
                        {featuredPost.title}
                      </Link>
                    </h3>
                    <p className="text-xs sm:text-sm text-[var(--site-muted)] leading-relaxed line-clamp-3">
                      {featuredPost.summary || 'Không có mô tả tóm tắt.'}
                    </p>
                    <Link href={`/tin-tuc/${featuredPost.slug}`} className="news-link items-center mt-4">
                      Đọc chi tiết bài viết →
                    </Link>
                  </div>
                </div>
              )}

              {/* Standard List Grid */}
              <div className={`news-grid-custom ${contentSection.visible ? 'fade-up fade-up-d2' : 'opacity-0'}`}>
                {/* If tab is active or search is applied, we list everything in the grid */}
                {(activeTab !== 'Tất cả' || searchQuery !== '' ? filteredPosts : listPosts).map((post, idx) => (
                  <article key={post.id} className="news-card-modern flex flex-col h-full" style={{ animationDelay: `${idx * 80}ms` }}>
                    <div className="relative overflow-hidden aspect-video">
                      <img
                        src={post.thumbnailUrl || '/uploads/baner.jpg'}
                        alt={post.title}
                        loading="lazy"
                        className="w-full h-full object-cover transition duration-500 hover:scale-105"
                      />
                    </div>
                    <div className="news-card-body flex-1 flex flex-col justify-between">
                      <div>
                        <div className="news-meta">
                          <strong>{post.category}</strong>
                          <span>•</span>
                          <time>{formatDate(post.createdAt)}</time>
                        </div>
                        <h3 className="text-[15px] sm:text-[17px] font-bold text-[var(--site-text)] leading-snug line-clamp-2 mt-2">
                          <Link href={`/tin-tuc/${post.slug}`} className="hover:text-[var(--site-primary)] transition">
                            {post.title}
                          </Link>
                        </h3>
                        <p className="text-[12px] text-[var(--site-muted)] leading-relaxed line-clamp-2 mt-2">
                          {post.summary || 'Không có mô tả tóm tắt.'}
                        </p>
                      </div>
                      <div className="flex items-center justify-between border-t border-[var(--site-line)] mt-4 pt-3">
                        <span className="text-[10px] text-[var(--site-muted)]">👁️ {post.views.toLocaleString()} lượt xem</span>
                        <Link href={`/tin-tuc/${post.slug}`} className="text-[11px] font-extrabold text-[var(--site-primary)] hover:underline">
                          Đọc tiếp →
                        </Link>
                      </div>
                    </div>
                  </article>
                ))}
              </div>

              <div className={`flex justify-center ${contentSection.visible ? 'fade-up fade-up-d3' : 'opacity-0'}`}>
                <Link
                  href="/tin-tuc"
                  className="inline-flex items-center justify-center rounded-full px-6 py-3 text-xs font-black uppercase tracking-[0.18em] text-white transition hover:-translate-y-0.5"
                  style={{ background: 'linear-gradient(135deg, var(--site-primary) 0%, #79BCC2 100%)', boxShadow: '0 10px 28px rgba(10,47,255,0.18)' }}
                >
                  Xem thêm tin tức
                </Link>
              </div>
            </div>
          )}
        </div>
      </main>
    </>
  );
}
