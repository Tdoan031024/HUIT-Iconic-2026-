'use client';

/**
 * AI Search Widget — searches news posts and candidates using keyword matching.
 * No external AI API required - uses internal search with smart result ranking.
 * If NEXT_PUBLIC_GA4_ID is set, it will track search events.
 */

import React, { useState, useRef, useEffect, useCallback } from 'react';
import Link from 'next/link';

const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://127.0.0.1:5000';

interface SearchResult {
  id: string;
  type: 'post' | 'candidate';
  title: string;
  description: string;
  url: string;
  imageUrl?: string;
  category?: string;
  votes?: number;
}

function trackSearch(query: string) {
  if (typeof window !== 'undefined' && (window as any).gtag) {
    (window as any).gtag('event', 'search', { search_term: query });
  }
}

async function fetchSearchResults(query: string): Promise<SearchResult[]> {
  if (!query.trim() || query.length < 2) return [];

  const q = query.toLowerCase().trim();
  const results: SearchResult[] = [];

  try {
    const [postsRes, candidatesRes] = await Promise.allSettled([
      fetch(`${API_BASE}/api/posts`),
      fetch(`${API_BASE}/api/candidates`),
    ]);

    if (postsRes.status === 'fulfilled' && postsRes.value.ok) {
      const posts: any[] = await postsRes.value.json();
      posts
        .filter(
          (p) =>
            p.isActive !== false &&
            (p.title?.toLowerCase().includes(q) ||
              p.summary?.toLowerCase().includes(q) ||
              p.category?.toLowerCase().includes(q) ||
              p.content?.toLowerCase().includes(q))
        )
        .slice(0, 4)
        .forEach((p) =>
          results.push({
            id: p.id,
            type: 'post',
            title: p.title,
            description: p.summary || '',
            url: `/tin-tuc/${p.slug}`,
            imageUrl: p.thumbnailUrl,
            category: p.category,
          })
        );
    }

    if (candidatesRes.status === 'fulfilled' && candidatesRes.value.ok) {
      const candidates: any[] = await candidatesRes.value.json();
      candidates
        .filter(
          (c) =>
            c.name?.toLowerCase().includes(q) ||
            c.description?.toLowerCase().includes(q) ||
            c.sbd?.toLowerCase().includes(q) ||
            c.sector?.toLowerCase().includes(q) ||
            c.representativeSchool?.toLowerCase().includes(q)
        )
        .slice(0, 4)
        .forEach((c) =>
          results.push({
            id: c.id,
            type: 'candidate',
            title: c.name,
            description: c.description?.slice(0, 100) || '',
            url: `/thi-sinh/${c.sbd}`,
            imageUrl: c.imageUrl,
            category: c.sector,
            votes: c.votes,
          })
        );
    }
  } catch (err) {
    console.error('Search error:', err);
  }

  return results;
}

export function AISearch({ className = '' }: { className?: string }) {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<SearchResult[]>([]);
  const [isOpen, setIsOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [hasSearched, setHasSearched] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const doSearch = useCallback(async (q: string) => {
    if (!q.trim() || q.length < 2) {
      setResults([]);
      setHasSearched(false);
      return;
    }
    setIsLoading(true);
    const res = await fetchSearchResults(q);
    setResults(res);
    setHasSearched(true);
    setIsLoading(false);
    trackSearch(q);
  }, []);

  useEffect(() => {
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => {
      doSearch(query);
    }, 350);
    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
    };
  }, [query, doSearch]);

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <div ref={containerRef} className={`relative ${className}`}>
      <div className="flex items-center gap-2 rounded-xl border border-[var(--site-line)] bg-[var(--site-card)] px-3 py-2 shadow-sm focus-within:border-[var(--site-primary)] transition-colors">
        {isLoading ? (
          <svg className="h-4 w-4 animate-spin text-[var(--site-primary)] shrink-0" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z" />
          </svg>
        ) : (
          <svg className="h-4 w-4 text-[var(--site-muted)] shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
            <circle cx="11" cy="11" r="8" />
            <line x1="21" y1="21" x2="16.65" y2="16.65" />
          </svg>
        )}
        <input
          ref={inputRef}
          type="search"
          value={query}
          onChange={(e) => {
            setQuery(e.target.value);
            setIsOpen(true);
          }}
          onFocus={() => setIsOpen(true)}
          placeholder="Tìm kiếm dự án, tin tức..."
          className="min-w-0 flex-1 bg-transparent text-sm text-[var(--site-text)] placeholder-[var(--site-muted)] outline-none"
          aria-label="Tìm kiếm"
          autoComplete="off"
        />
        {query && (
          <button
            type="button"
            onClick={() => { setQuery(''); setResults([]); setHasSearched(false); inputRef.current?.focus(); }}
            className="shrink-0 text-[var(--site-muted)] hover:text-[var(--site-text)] transition-colors"
            aria-label="Xóa tìm kiếm"
          >
            <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5">
              <line x1="18" y1="6" x2="6" y2="18" />
              <line x1="6" y1="6" x2="18" y2="18" />
            </svg>
          </button>
        )}
      </div>

      {isOpen && query.length >= 2 && (
        <div className="absolute left-0 right-0 top-full z-50 mt-1.5 rounded-xl border border-[var(--site-line)] bg-[var(--site-card)] shadow-xl max-h-[400px] overflow-y-auto">
          {isLoading && (
            <div className="px-4 py-6 text-center text-sm text-[var(--site-muted)]">
              Đang tìm kiếm...
            </div>
          )}

          {!isLoading && hasSearched && results.length === 0 && (
            <div className="px-4 py-6 text-center">
              <p className="text-sm font-semibold text-[var(--site-muted)]">Không tìm thấy kết quả nào</p>
              <p className="mt-1 text-xs text-[var(--site-muted)]">Thử tìm với từ khóa khác</p>
            </div>
          )}

          {!isLoading && results.length > 0 && (
            <div className="p-2 space-y-0.5">
              {/* Group by type */}
              {['post', 'candidate'].map((type) => {
                const group = results.filter((r) => r.type === type);
                if (!group.length) return null;
                return (
                  <div key={type}>
                    <p className="px-2 pb-1 pt-2 text-[10px] font-black uppercase tracking-wider text-[var(--site-muted)]">
                      {type === 'post' ? 'Tin tức & Bài viết' : 'Dự án'}
                    </p>
                    {group.map((result) => (
                      <Link
                        key={result.id}
                        href={result.url}
                        onClick={() => { setIsOpen(false); setQuery(''); }}
                        className="flex items-center gap-3 rounded-lg px-2 py-2.5 hover:bg-[var(--site-soft)] transition-colors"
                      >
                        {result.imageUrl ? (
                          <img
                            src={result.imageUrl.startsWith('http') ? result.imageUrl : result.imageUrl}
                            alt={result.title}
                            className="h-9 w-9 shrink-0 rounded-lg object-cover"
                          />
                        ) : (
                          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-[var(--site-soft)]">
                            {type === 'post' ? (
                              <svg className="h-4 w-4 text-[var(--site-muted)]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                                <path d="M4 4h16v13a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V4z" />
                                <line x1="8" y1="9" x2="16" y2="9" />
                                <line x1="8" y1="13" x2="14" y2="13" />
                              </svg>
                            ) : (
                              <svg className="h-4 w-4 text-[var(--site-muted)]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                                <path d="M17 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
                                <circle cx="9.5" cy="7" r="4" />
                              </svg>
                            )}
                          </div>
                        )}
                        <div className="min-w-0 flex-1">
                          <p className="truncate text-sm font-bold text-[var(--site-text)]">{result.title}</p>
                          {result.description && (
                            <p className="mt-0.5 truncate text-xs text-[var(--site-muted)]">{result.description}</p>
                          )}
                          <div className="mt-0.5 flex items-center gap-2">
                            {result.category && (
                              <span className="text-[10px] font-semibold text-[var(--site-primary)]">{result.category}</span>
                            )}
                            {result.votes !== undefined && (
                              <span className="text-[10px] text-[var(--site-muted)]">{result.votes.toLocaleString()} vote</span>
                            )}
                          </div>
                        </div>
                      </Link>
                    ))}
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
