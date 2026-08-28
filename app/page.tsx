'use client';

import React, { useState, useEffect, useRef, useMemo } from 'react';
import { Candidate } from '@/lib/types';
import Link from 'next/link';
import { useAlert } from './AlertProvider';
import { apiUrl } from './api';
import VoteModal from './VoteModal';
import { useLanguage } from '../src/i18n/use-language';
import { localizedText } from '../src/i18n/content';

interface Sponsor {
  id: string;
  name: string;
  logoUrl: string;
  tier: string;
}

interface Banner {
  id: string;
  title: string;
  titleEn?: string;
  imageUrl: string;
  link: string;
  isActive?: boolean;
}

function hasHtml(value?: string | null) {
  return !!value && /<[a-z][\s\S]*>/i.test(value);
}

function sanitizeRichHtml(value: string) {
  if (typeof window === 'undefined') {
    return value.replace(/<script[\s\S]*?>[\s\S]*?<\/script>/gi, '').replace(/<style[\s\S]*?>[\s\S]*?<\/style>/gi, '');
  }

  const wrapper = document.createElement('div');
  wrapper.innerHTML = value;
  wrapper.querySelectorAll('script, style, iframe, object, embed').forEach((node) => node.remove());
  wrapper.querySelectorAll('*').forEach((node) => {
    Array.from(node.attributes).forEach((attribute) => {
      const name = attribute.name.toLowerCase();
      const attrValue = attribute.value.trim().toLowerCase();
      if (name.startsWith('on') || attrValue.startsWith('javascript:')) {
        node.removeAttribute(attribute.name);
      }
    });
  });
  return wrapper.innerHTML;
}

function RichContent({ value, fallback = '', className }: { value?: string | null; fallback?: string; className: string }) {
  const content = value || fallback;
  if (!content) return null;
  if (hasHtml(content)) {
    return <div className={className} dangerouslySetInnerHTML={{ __html: sanitizeRichHtml(content) }} />;
  }
  return <div className={`${className} whitespace-pre-line`}>{content}</div>;
}

function formatSponsorBannerUrl(url: string | undefined | null, currentTheme?: 'light' | 'dark'): string {
  if (!url) return '';
  
  let resolvedUrl = url;
  if (currentTheme === 'light') {
    if (resolvedUrl.includes('nhataitro.png')) {
      resolvedUrl = resolvedUrl.replace('nhataitro.png', 'nhataitro1.png');
    }
  } else {
    if (resolvedUrl.includes('nhataitro1.png')) {
      resolvedUrl = resolvedUrl.replace('nhataitro1.png', 'nhataitro.png');
    }
  }

  if (resolvedUrl.startsWith('http://') || resolvedUrl.startsWith('https://') || resolvedUrl.startsWith('data:')) {
    return resolvedUrl;
  }
  const cleanPath = resolvedUrl.startsWith('/') ? resolvedUrl : `/${resolvedUrl}`;
  return cleanPath;
}

function getStoredUser() {
  if (typeof window === 'undefined') return null;
  const raw = localStorage.getItem('huit_web_user');
  if (!raw) return null;
  try {
    return JSON.parse(raw);
  } catch {
    return null;
  }
}

const PROJECT_FALLBACK_IMAGE = '/duan/anhmauduan.png';

// ── Vote Toast Notification ──────────────────────────────────────────────────
interface VoteToastItem {
  id: string;
  userName: string;
  candidateName: string;
  score: number;
  createdAt: string;
}

function VoteToastNotification({ toast, onClose }: { toast: VoteToastItem; onClose: () => void }) {
  useEffect(() => {
    const timer = setTimeout(onClose, 5500);
    return () => clearTimeout(timer);
  }, [onClose]);

  return (
    <div className="vote-toast-item">
      <div className="vote-toast-avatar">
        {toast.userName ? toast.userName.charAt(0).toUpperCase() : '?'}
      </div>
      <div className="vote-toast-body">
        <p className="vote-toast-text">
          <strong>{toast.userName || 'Ai đó'}</strong> vừa bình chọn cho{' '}
          <strong>{toast.candidateName}</strong>
        </p>
        <span className="vote-toast-badge">+{toast.score} lượt bình chọn</span>
      </div>
      <button onClick={onClose} className="vote-toast-close" aria-label="Đóng">×</button>
    </div>
  );
}

function VoteToastContainer() {
  const [toasts, setToasts] = useState<VoteToastItem[]>([]);
  const lastVoteIdRef = useRef<string | null>(null);
  const isFirstPoll = useRef(true);

  useEffect(() => {
    let isMounted = true;

    async function pollLatestVote() {
      try {
        const res = await fetch(apiUrl('/api/admin/votes?limit=1'));
        if (!res.ok) return;
        const data = await res.json();
        const latestVote = Array.isArray(data) && data.length > 0 ? data[0] : null;

        if (!latestVote) return;

        // Skip on first poll to avoid showing old votes on page load
        if (isFirstPoll.current) {
          lastVoteIdRef.current = latestVote.id;
          isFirstPoll.current = false;
          return;
        }

        if (latestVote.id !== lastVoteIdRef.current) {
          lastVoteIdRef.current = latestVote.id;
          if (isMounted) {
            const newToast: VoteToastItem = {
              id: `${latestVote.id}-${Date.now()}`,
              userName: latestVote.userName || 'Người dùng',
              candidateName: latestVote.candidateName || 'Thí sinh',
              score: latestVote.score || 1,
              createdAt: latestVote.createdAt,
            };
            setToasts((prev) => [...prev.slice(-2), newToast]);
          }
        }
      } catch {
        // Silently fail
      }
    }

    const interval = setInterval(pollLatestVote, 8000);
    pollLatestVote(); // Run immediately
    return () => {
      isMounted = false;
      clearInterval(interval);
    };
  }, []);

  const removeToast = (id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  };

  if (toasts.length === 0) return null;

  return (
    <div className="vote-toast-container">
      {toasts.map((toast) => (
        <VoteToastNotification
          key={toast.id}
          toast={toast}
          onClose={() => removeToast(toast.id)}
        />
      ))}
    </div>
  );
}

function getSponsorLogoUrl(url?: string | null) {
  if (!url) return '/images/logo_iconic.png';
  if (url.startsWith('http://') || url.startsWith('https://') || url.startsWith('data:')) return url;
  if (url.startsWith('/uploads/') || url.startsWith('/original_assets/')) return apiUrl(url);
  return url;
}

function getCandidateImageUrl(url?: string | null) {
  if (!url) return PROJECT_FALLBACK_IMAGE;
  if (url.startsWith('http://') || url.startsWith('https://') || url.startsWith('data:')) return url;
  if (url.startsWith('/uploads/')) return apiUrl(url);
  return url;
}

function getCandidateRankTone(rank: number) {
  if (rank === 1) return 'gold';
  if (rank === 2) return 'silver';
  if (rank === 3) return 'bronze';
  return 'standard';
}

function parseVN(dStr: string | undefined | null) {
  if (!dStr) return new Date();
  let val = dStr.trim();
  if (!val.includes('Z') && !/\+\d{2}:?\d{2}$/.test(val) && !/-\d{2}:?\d{2}$/.test(val)) {
    val = `${val}+07:00`;
  }
  return new Date(val);
}

function formatDateTime(dStr: string | undefined | null) {
  if (!dStr) return '';
  const date = parseVN(dStr);
  // Manually apply UTC+7 offset — avoids dependency on server locale/ICU data
  const pad = (n: number) => String(n).padStart(2, '0');
  const utc7 = new Date(date.getTime() + 7 * 60 * 60 * 1000);
  const hh = pad(utc7.getUTCHours());
  const mm = pad(utc7.getUTCMinutes());
  const dd = pad(utc7.getUTCDate());
  const mo = pad(utc7.getUTCMonth() + 1);
  const yyyy = utc7.getUTCFullYear();
  return `${hh}:${mm} ngày ${dd}/${mo}/${yyyy}`;
}

export default function HomePage() {
  const language = useLanguage();
  const text = (vi?: string | null, en?: string | null) => localizedText(language, vi, en);
  const { showAlert } = useAlert();
  
  const [theme, setTheme] = useState<'light' | 'dark'>('light');
  const [tableFilter, setTableFilter] = useState<'ALL' | 'MALE' | 'FEMALE'>('ALL');
  const [gateCountdown, setGateCountdown] = useState<{ days: number; hours: number; mins: number; secs: number; isEnded: boolean } | null>(null);

  useEffect(() => {
    if (typeof window === 'undefined') return;

    // Set initial theme
    const initialTheme = (document.documentElement.dataset.theme as 'light' | 'dark') || 'light';
    setTheme(initialTheme);

    // Watch for attribute changes on documentElement
    const observer = new MutationObserver((mutations) => {
      mutations.forEach((mutation) => {
        if (mutation.attributeName === 'data-theme') {
          const newTheme = document.documentElement.dataset.theme as 'light' | 'dark';
          setTheme(newTheme || 'light');
        }
      });
    });

    observer.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ['data-theme'],
    });

    return () => {
      observer.disconnect();
    };
  }, []);
  const ABOUT_REGISTER_URL = '/dang-ky';

  const [candidates, setCandidates] = useState<Candidate[]>([]);
  const [activeVoteCandidate, setActiveVoteCandidate] = useState<Candidate | null>(null);
  const [search, setSearch] = useState('');
  const [showAllCandidates, setShowAllCandidates] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [banners, setBanners] = useState<Banner[]>([]);
  const [hasLoadedBanners, setHasLoadedBanners] = useState(false);
  const [currentBannerIndex, setCurrentBannerIndex] = useState(0);
  const [sponsors, setSponsors] = useState<Sponsor[]>([]);
  const [settings, setSettings] = useState<any>(null);
  const [homepageNewsPosts, setHomepageNewsPosts] = useState<any[]>([]);
  const totalVotes = useMemo(() => candidates.reduce((sum, c) => sum + c.votes, 0), [candidates]);
  const totalTracks = useMemo(() => new Set(candidates.map((candidate) => candidate.contestTable).filter(Boolean)).size, [candidates]);
  const totalSchools = useMemo(() => new Set(candidates.map((candidate) => candidate.representativeSchool).filter(Boolean)).size, [candidates]);
  const aboutTitleText = text(settings?.aboutTitle, settings?.aboutTitleEn).replace(/\s+(NĂM|YEAR)\s+/i, ' ');
  const hasAboutContent = !!(settings?.aboutTitle || settings?.aboutDescription || settings?.aboutImageUrl);

  const [promoTimeLeft, setPromoTimeLeft] = useState<string>('');

  useEffect(() => {
    if (!settings?.registrationDeadline) return;

    const updateGateTimer = () => {
      const end = new Date(settings.registrationDeadline).getTime();
      const now = new Date().getTime();
      const diff = end - now;

      if (diff <= 0) {
        setGateCountdown({ days: 0, hours: 0, mins: 0, secs: 0, isEnded: true });
        return;
      }

      const days = Math.floor(diff / (1000 * 60 * 60 * 24));
      const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
      const mins = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
      const secs = Math.floor((diff % (1000 * 60)) / 1000);
      setGateCountdown({ days, hours, mins, secs, isEnded: false });
    };

    updateGateTimer();
    const interval = setInterval(updateGateTimer, 1000);
    return () => clearInterval(interval);
  }, [settings?.registrationDeadline]);

  const [isMounted, setIsMounted] = useState(false);
  useEffect(() => {
    setIsMounted(true);
  }, []);

  const isRegistrationOpen = useMemo(() => {
    if (!settings) return true;
    if (settings.isRegistrationOpen === false) return false;
    if (settings.registrationDeadline) {
      const deadline = new Date(settings.registrationDeadline);
      return deadline.getTime() >= Date.now();
    }
    return true;
  }, [settings]);

  const [slides, setSlides] = useState<any[]>([]);

  useEffect(() => {
    async function loadData() {
      setIsLoading(true);
      try {
        const [candRes, banRes, sponRes, postRes] = await Promise.all([
          fetch(apiUrl('/api/candidates')),
          fetch(apiUrl('/api/banners')),
          fetch(apiUrl('/api/sponsors')),
          fetch(apiUrl('/api/posts'))
        ]);

        if (candRes.ok) {
          const candData = await candRes.json();
          setCandidates(Array.isArray(candData) ? candData : []);
        } else {
          setCandidates([]);
        }

        if (banRes.ok) {
          const banData = await banRes.json();
          const activeBanners = Array.isArray(banData) ? banData.filter((banner: Banner) => banner.isActive !== false) : [];
          if (activeBanners.length > 0) {
            const apiSlides = activeBanners.map((b: Banner) => {
              const isVideo = b.imageUrl.toLowerCase().endsWith('.mp4');
              return {
                type: isVideo ? 'video' : 'image',
                url: b.imageUrl,
                title: b.title,
                titleEn: b.titleEn,
                link: b.link || '#'
              };
            });
            setSlides(apiSlides);
          } else {
            setSlides([]);
          }
          setBanners(activeBanners);
          setHasLoadedBanners(true);
          setCurrentBannerIndex(0);
        } else {
          setSlides([]);
          setBanners([]);
          setHasLoadedBanners(true);
        }

        if (sponRes.ok) {
          const sponData = await sponRes.json();
          setSponsors(Array.isArray(sponData) ? sponData : []);
        } else {
          setSponsors([]);
        }

        if (postRes.ok) {
          const postData = await postRes.json();
          const activePosts = Array.isArray(postData) 
            ? postData.filter((p: any) => p.isActive !== false) 
            : [];
          setHomepageNewsPosts(activePosts.slice(0, 3));
        } else {
          setHomepageNewsPosts([]);
        }
      } catch (err) {
        console.error('Lỗi nạp dữ liệu từ MySQL Database:', err);
        setCandidates([]);
        setSlides([]);
        setBanners([]);
        setSponsors([]);
        setHomepageNewsPosts([]);
        setHasLoadedBanners(true);
      } finally {
        setIsLoading(false);
      }
    }
    loadData();

    // Polling realtime từ DB mỗi 3s
    const interval = setInterval(async () => {
      try {
        const res = await fetch(apiUrl('/api/candidates'));
        if (res.ok) {
          const candData = await res.json();
          if (Array.isArray(candData)) {
            setCandidates(candData);
          }
        }
      } catch {
        // DB offline
      }
    }, 3000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    async function loadSettings() {
      try {
        const res = await fetch(apiUrl('/api/settings'));
        if (res.ok) {
          const data = await res.json();
          setSettings(data);
        }
      } catch (err) {
        console.log('Load settings failed');
      }
    }
    loadSettings();
    const interval = setInterval(loadSettings, 5000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    if (slides.length > 1) {
      const interval = setInterval(() => {
        setCurrentBannerIndex(prev => (prev + 1) % slides.length);
      }, 12000);
      return () => clearInterval(interval);
    }
  }, [slides]);

  const nextSlide = () => {
    setCurrentBannerIndex(prev => (prev + 1) % slides.length);
  };

  const prevSlide = () => {
    setCurrentBannerIndex(prev => (prev - 1 + slides.length) % slides.length);
  };

  // Scroll animation states and refs
  const aboutRef = useRef<HTMLDivElement>(null);
  // Keep the above-the-fold introduction visible as settings hydrate to avoid a late content jump.
  const [aboutVisible, setAboutVisible] = useState(true);

  const candidatesRef = useRef<HTMLDivElement>(null);
  const [candidatesVisible, setCandidatesVisible] = useState(false);

  const sponsorsRef = useRef<HTMLDivElement>(null);
  const [sponsorsVisible, setSponsorsVisible] = useState(false);

  useEffect(() => {
    const aboutObserver = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) setAboutVisible(true);
        });
      },
      { threshold: 0.15 }
    );

    const candidatesObserver = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          setCandidatesVisible(entry.isIntersecting);
        });
      },
      { threshold: 0.15 }
    );

    const sponsorsObserver = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          setSponsorsVisible(entry.isIntersecting);
        });
      },
      { threshold: 0 }
    );

    if (aboutRef.current) {
      aboutObserver.observe(aboutRef.current);
    }
    if (candidatesRef.current) {
      candidatesObserver.observe(candidatesRef.current);
    }
    if (sponsorsRef.current) {
      sponsorsObserver.observe(sponsorsRef.current);
    }

    return () => {
      if (aboutRef.current) {
        aboutObserver.disconnect();
      }
      if (candidatesRef.current) {
        candidatesObserver.disconnect();
      }
      if (sponsorsRef.current) {
        sponsorsObserver.disconnect();
      }
    };
  }, [hasAboutContent]);

  // Drag-to-slide states and handlers
  const [dragOffset, setDragOffset] = useState(0);
  const [isDragging, setIsDragging] = useState(false);
  const [startX, setStartX] = useState(0);
  const [hasMoved, setHasMoved] = useState(false);

  const handleDragStart = (e: React.MouseEvent | React.TouchEvent) => {
    if ('button' in e && e.button !== 0) return; // Drag only on left click
    setIsDragging(true);
    setHasMoved(false);
    const clientX = 'touches' in e ? e.touches[0].clientX : e.clientX;
    setStartX(clientX);
    setDragOffset(0);
  };

  const handleDragMove = (e: React.MouseEvent | React.TouchEvent) => {
    if (!isDragging) return;
    const clientX = 'touches' in e ? e.touches[0].clientX : e.clientX;
    const diffX = clientX - startX;

    if (Math.abs(diffX) > 6) {
      setHasMoved(true);
    }

    // Elastic effect resistance at start and end
    const isAtStart = currentBannerIndex === 0 && diffX > 0;
    const isAtEnd = currentBannerIndex === slides.length - 1 && diffX < 0;
    if (isAtStart || isAtEnd) {
      setDragOffset(diffX * 0.35);
    } else {
      setDragOffset(diffX);
    }
  };

  const handleDragEnd = () => {
    if (!isDragging) return;
    setIsDragging(false);

    const threshold = 75; // drag threshold in pixels
    if (dragOffset < -threshold && currentBannerIndex < slides.length - 1) {
      nextSlide();
    } else if (dragOffset > threshold && currentBannerIndex > 0) {
      prevSlide();
    }

    // Delayed reset so onClick handler can check hasMoved
    setTimeout(() => {
      setDragOffset(0);
      setHasMoved(false);
    }, 50);
  };

  const handleLinkClick = (e: React.MouseEvent) => {
    if (hasMoved) {
      e.preventDefault();
      e.stopPropagation();
    }
  };

  const isGateCurrentlyOpen = () => {
    if (!settings) return true;
    if (!settings.isGateOpen) return false;

    const now = new Date();
    const start = new Date(settings.startDate);
    const end = new Date(settings.endDate);
    return now >= start && now <= end;
  };

  const handleVote = (sbd: string, name: string) => {
    if (!isGateCurrentlyOpen()) {
      showAlert("Cổng bình chọn hiện đang đóng hoặc chưa đến thời gian mở cổng. Vui lòng quay lại sau!", "warning", "Cổng bình chọn");
      return;
    }

    const cand = candidates.find(c => c.sbd === sbd);
    if (cand) {
      setActiveVoteCandidate(cand);
    }
  };

  // Sort candidates by votes descending
  const sortedCandidates = [...candidates].sort((a, b) => b.votes - a.votes);

  const filteredCandidates = sortedCandidates.filter(c => {
    const matchesSearch = !search || 
      c.name.toLowerCase().includes(search.toLowerCase()) || 
      c.sbd.toLowerCase().includes(search.toLowerCase()) ||
      (c.faculty && c.faculty.toLowerCase().includes(search.toLowerCase()));

    if (!matchesSearch) return false;
    if (tableFilter === 'ALL') return true;
    if (tableFilter === 'MALE') return c.contestTable === 'MALE';
    if (tableFilter === 'FEMALE') return c.contestTable === 'FEMALE';
    return true;
  });

  const visibleCandidates = showAllCandidates
    ? filteredCandidates
    : filteredCandidates.slice(0, 6);

  // Keep the first server/client render identical before browser-only data hydrates.
  if (!isMounted) {
    return (
      <>
        <main className="min-h-screen bg-slate-50" aria-label="Đang tải trang chủ">
        <div className="relative w-full aspect-[3241/1294] animate-pulse bg-[#07134d]" />
        <div className="mx-auto max-w-6xl px-4 py-10 sm:px-6 sm:py-14">
          <div className="mx-auto max-w-3xl text-center">
            <div className="mx-auto h-8 w-56 animate-pulse rounded-xl bg-slate-200" />
            <div className="mx-auto mt-4 h-5 w-full max-w-xl animate-pulse rounded-lg bg-slate-200" />
          </div>
          <div className="mt-10 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {[1, 2, 3, 4, 5, 6].map((item) => (
              <div key={item} className="overflow-hidden rounded-2xl border border-slate-200 bg-white">
                <div className="aspect-[16/9] animate-pulse bg-slate-200" />
                <div className="space-y-3 p-4"><div className="h-5 w-3/4 animate-pulse rounded-lg bg-slate-200" /><div className="h-4 w-1/2 animate-pulse rounded-lg bg-slate-200" /><div className="h-10 w-full animate-pulse rounded-xl bg-slate-200" /></div>
              </div>
            ))}
          </div>
        </div>
        </main>
      </>
    );
  }

  return (
    <>
      <main className="sc-908a50-0 iUzfqH theme-page home-theme-page flex-1 min-[812px]:bg-transparent">


        {/* Banner Section with Slider & Video support. Keep its aspect ratio while data loads. */}
        {!hasLoadedBanners ? (
          <div className="relative w-full aspect-[3241/1294] overflow-hidden bg-[#07134d] animate-pulse" aria-label="Đang tải banner" />
        ) : slides.length > 0 ? (
          <div className="sc-1a037b37-0 fgDcug relative flex flex-col group select-none">
            <div
              className="relative w-full h-auto aspect-[3241/1294] overflow-hidden bg-[#07134d] cursor-grab active:cursor-grabbing"
              onMouseDown={handleDragStart}
              onMouseMove={handleDragMove}
              onMouseUp={handleDragEnd}
              onMouseLeave={handleDragEnd}
              onTouchStart={handleDragStart}
              onTouchMove={handleDragMove}
              onTouchEnd={handleDragEnd}
            >
              <h1 className="text-transparent absolute -z-[1] text-transparent-transparent">
                {slides[currentBannerIndex]?.title || ''}
              </h1>

              {/* Slider track */}
              <div
                className="flex h-full w-full"
                style={{
                  transform: `translateX(calc(-${currentBannerIndex * 100}% + ${dragOffset}px))`,
                  transition: isDragging ? 'none' : 'transform 700ms cubic-bezier(0.16, 1, 0.3, 1)'
                }}
              >
                {slides.map((slide, idx) => (
                  <div key={idx} className="w-full h-full shrink-0 relative pointer-events-none">
                    {slide.link ? (
                      <a href={slide.link} className="w-full h-full block cursor-pointer pointer-events-auto" onDragStart={e => e.preventDefault()} onClick={handleLinkClick}>
                        {slide.type === 'video' ? (
                          <video
                            src={slide.url}
                            className="w-full h-full object-cover object-center pointer-events-none"
                            autoPlay
                            muted
                            loop
                            playsInline
                            poster="/original_assets/image5999.jpg"
                          />
                        ) : (
                          <img
                            alt={slide.title}
                            className="w-full h-full object-cover object-center pointer-events-none"
                            src={slide.url}
                            onDragStart={e => e.preventDefault()}
                          />
                        )}
                      </a>
                    ) : (
                      slide.type === 'video' ? (
                        <video
                          src={slide.url}
                          className="w-full h-full object-cover object-center pointer-events-none"
                          autoPlay
                          muted
                          loop
                          playsInline
                          poster="/original_assets/image5999.jpg"
                        />
                      ) : (
                        <img
                          alt={slide.title}
                          className="w-full h-full object-cover object-center"
                          src={slide.url}
                          onDragStart={e => e.preventDefault()}
                        />
                      )
                    )}
                  </div>
                ))}
              </div>

              {slides[currentBannerIndex]?.title && (
                <div className="border-b border-slate-200/80 bg-white px-4 py-3 text-center shadow-sm sm:px-6 sm:py-4">
                  <p className="mx-auto max-w-4xl text-sm font-bold leading-relaxed text-slate-800 sm:text-base">
                    {localizedText(language, slides[currentBannerIndex].title, slides[currentBannerIndex].titleEn)}
                  </p>
                </div>
              )}

            </div>
          </div>
        ) : null}

        {/* About Section */}
        {hasAboutContent && (
        <div id="about-section" ref={aboutRef} className="sc-1a037b37-0 ekqPrV relative mt-6 sm:mt-12 overflow-hidden">
          {/* Ambient Glowing Orbs */}
          <div className={`absolute top-1/2 left-1/4 -translate-y-1/2 -translate-x-1/2 w-[350px] h-[350px] rounded-full bg-gradient-to-tr from-[#0A2FFF]/10 to-[#79BCC2]/10 blur-[90px] pointer-events-none transition-opacity duration-[2800ms] ${aboutVisible ? 'opacity-100' : 'opacity-0'}`} />
          <div className={`absolute bottom-10 right-10 w-[250px] h-[250px] rounded-full bg-gradient-to-br from-[#79BCC2]/5 to-[#0A2FFF]/5 blur-[80px] pointer-events-none transition-opacity duration-[2800ms] ${aboutVisible ? 'opacity-100' : 'opacity-0'}`} />

          <div className="pt-6 sm:pt-8 flex flex-col items-center relative z-10">

            {/* Section Main Header Căn Giữa */}
            <div className={`flex flex-col space-y-2 text-center mb-6 sm:mb-10 transform transition-all duration-700 ease-out ${aboutVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-5'}`}>
              <h2 className="text-[26px] sm:text-[42px] tracking-[-0.7px] leading-[32px] sm:leading-[50px] font-extrabold uppercase bg-clip-text text-transparent bg-gradient-to-r from-black to-black/70 dark:from-white dark:to-white/70">
                  {language === 'en' ? 'About the competition' : 'Giới thiệu cuộc thi'}
              </h2>
              <div
                className="h-[3.5px] bg-gradient-to-r from-[#0A2FFF] to-[#79BCC2] mx-auto rounded-full mt-2 transition-all duration-[3200ms] ease-out"
                style={{ width: aboutVisible ? '64px' : '0px' }}
              />
            </div>

            {/* 2 Columns Content */}
            <div className="flex flex-col items-start gap-7 md:gap-10 w-full max-w-[1080px] px-4 sm:px-0 mx-auto">

              {/* Left Column: Information */}
              <div
                style={{
                  transitionTimingFunction: 'cubic-bezier(0.16, 1, 0.3, 1)',
                  transitionDelay: '400ms'
                }}
                className={`w-full flex flex-col space-y-4 sm:space-y-5 text-left transform transition-all duration-700 ${aboutVisible ? 'opacity-100 translate-x-0' : 'opacity-0 -translate-x-6'}`}
              >
                <h3
                  suppressHydrationWarning
                  className="w-full text-center uppercase leading-tight"
                  style={{
                    fontSize: 'clamp(18px, 2.2vw, 24px)',
                    fontWeight: 800,
                    color: 'var(--site-primary)',
                    textShadow: '0 1px 10px rgba(121,188,194,0.18)',
                    display: 'inline-block',
                    textTransform: 'none'
                  }}
                >
                  {aboutTitleText}
                </h3>

                <RichContent
                  value={text(settings?.aboutDescription, settings?.aboutDescriptionEn)}
                  className="rich-content about-description-copy text-[15px] sm:text-[18px] text-black dark:text-white leading-[1.95] font-normal text-justify"
                />

                {/* Staggered Stats Counters */}
                <div className="hidden grid-cols-4 gap-2 sm:gap-3 pt-1">
                  <div
                    style={{
                      transitionTimingFunction: 'cubic-bezier(0.34, 1.56, 0.64, 1)',
                      transitionDelay: '800ms'
                    }}
                    className={`bg-white/[0.04] dark:bg-white/[0.02] border border-black/5 dark:border-white/10 rounded-xl p-2.5 sm:p-3 text-center transform transition-all duration-700 shadow-sm hover:border-[#79BCC2]/30 hover:bg-white/[0.08] dark:hover:bg-white/[0.04] transition-colors duration-300 ${aboutVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'
                      }`}
                  >
                    <p className="text-[17px] sm:text-[22px] font-extrabold bg-clip-text text-transparent bg-gradient-to-r from-[#0A2FFF] to-[#79BCC2]">{candidates.length || '—'}</p>
                    <p className="text-[10px] sm:text-[12px] text-neutral-neutral1/60 dark:text-neutral-white/60 font-bold uppercase tracking-wider">Thí sinh</p>
                  </div>

                  <div
                    style={{
                      transitionTimingFunction: 'cubic-bezier(0.34, 1.56, 0.64, 1)',
                      transitionDelay: '1100ms'
                    }}
                    className={`bg-white/[0.04] dark:bg-white/[0.02] border border-black/5 dark:border-white/10 rounded-xl p-2.5 sm:p-3 text-center transform transition-all duration-700 shadow-sm hover:border-[#79BCC2]/30 hover:bg-white/[0.08] dark:hover:bg-white/[0.04] transition-colors duration-300 ${aboutVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'
                      }`}
                  >
                    <p className="text-[17px] sm:text-[22px] font-extrabold bg-clip-text text-transparent bg-gradient-to-r from-[#0A2FFF] to-[#79BCC2]">{totalTracks || '—'}</p>
                    <p className="text-[10px] sm:text-[12px] text-neutral-neutral1/60 dark:text-neutral-white/60 font-bold uppercase tracking-wider">Hạng mục</p>
                  </div>

                  <div
                    style={{
                      transitionTimingFunction: 'cubic-bezier(0.34, 1.56, 0.64, 1)',
                      transitionDelay: '1400ms'
                    }}
                    className={`bg-white/[0.04] dark:bg-white/[0.02] border border-black/5 dark:border-white/10 rounded-xl p-2.5 sm:p-3 text-center transform transition-all duration-700 shadow-sm hover:border-[#79BCC2]/30 hover:bg-white/[0.08] dark:hover:bg-white/[0.04] transition-colors duration-300 ${aboutVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'
                      }`}
                  >
                    <p className="text-[17px] sm:text-[22px] font-extrabold bg-clip-text text-transparent bg-gradient-to-r from-[#0A2FFF] to-[#79BCC2]">{totalSchools || '—'}</p>
                    <p className="text-[10px] sm:text-[12px] text-neutral-neutral1/60 dark:text-neutral-white/60 font-bold uppercase tracking-wider">Trường</p>
                  </div>

                  <div
                    style={{
                      transitionTimingFunction: 'cubic-bezier(0.34, 1.56, 0.64, 1)',
                      transitionDelay: '1700ms'
                    }}
                    className={`bg-white/[0.04] dark:bg-white/[0.02] border border-black/5 dark:border-white/10 rounded-xl p-2.5 sm:p-3 text-center transform transition-all duration-700 shadow-sm hover:border-[#79BCC2]/30 hover:bg-white/[0.08] dark:hover:bg-white/[0.04] transition-colors duration-300 ${aboutVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'
                      }`}
                  >
                    <p className="text-[17px] sm:text-[22px] font-extrabold bg-clip-text text-transparent bg-gradient-to-r from-[#0A2FFF] to-[#79BCC2]">{sponsors.length || '—'}</p>
                    <p className="text-[10px] sm:text-[12px] text-neutral-neutral1/60 dark:text-neutral-white/60 font-bold uppercase tracking-wider">Nhà tài trợ</p>
                  </div>
                </div>

                {/* About Action Buttons */}
                <div
                  style={{
                    transitionTimingFunction: 'cubic-bezier(0.16, 1, 0.3, 1)',
                    transitionDelay: '2200ms'
                  }}
                  className={`about-actions flex w-full flex-wrap items-center justify-center gap-3 transform transition-all duration-[2800ms] ${aboutVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-6'}`}
                >
                  {gateCountdown && !gateCountdown.isEnded && (
                    <div className="order-first flex w-full flex-col items-center gap-1.5">
                      <span className="text-[12px] font-extrabold uppercase tracking-[0.14em] text-slate-500 dark:text-slate-400 sm:text-[13px]">
                        ⏳ Thời gian đăng ký còn lại
                      </span>
                      <div className="flex items-center gap-2 sm:gap-3">
                        {[
                          { val: gateCountdown.days, label: language === 'en' ? 'Days' : 'Ngày' },
                          { val: gateCountdown.hours, label: language === 'en' ? 'Hours' : 'Giờ' },
                          { val: gateCountdown.mins, label: language === 'en' ? 'Mins' : 'Phút' },
                          { val: gateCountdown.secs, label: language === 'en' ? 'Secs' : 'Giây' }
                        ].map((item, i) => (
                          <div key={i} className="flex min-w-[58px] flex-col items-center justify-center rounded-xl border border-slate-200 bg-white px-2.5 py-2 shadow-sm dark:border-slate-800 dark:bg-slate-900 sm:min-w-[70px] sm:px-3">
                            <span className="font-mono text-xl font-black leading-none text-[#0A2FFF] dark:text-[#79BCC2] sm:text-2xl">
                              {String(item.val).padStart(2, '0')}
                            </span>
                            <span className="mt-1 text-[9px] font-bold uppercase text-slate-400 sm:text-[10px]">{item.label}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                  <Link
                    href="/the-le"
                    className="hidden about-action about-action-secondary"
                  >
                    <span>Xem thêm</span>
                  </Link>
                  {(!isMounted || isRegistrationOpen) && (
                    <Link
                      href={ABOUT_REGISTER_URL}
                      className="about-action about-action-primary"
                    >
                      <span>Đăng ký</span>
                    </Link>
                  )}
                </div>
              </div>

              {/* Right Column: Image with Glowing Floating Background & Shine Effect */}
              <div
                style={{
                  transitionTimingFunction: 'cubic-bezier(0.16, 1, 0.3, 1)',
                  transitionDelay: '600ms'
                }}
                className="hidden"
              >
                <div className="relative aspect-[4/5] w-full max-w-[460px] mx-auto overflow-hidden rounded-[18px] group hover-shine-effect bg-transparent">
                  <img
                    alt="Poster HUIT ICONIC"
                    className="w-full h-full object-contain object-center p-1 group-hover:scale-[1.02] transition-transform duration-700 ease-out"
                    src={settings.aboutImageUrl}
                  />
                </div>
              </div>

            </div>
          </div>
        </div>
        )}

        {/* Voting & Candidates Container */}
        <div className="relative" id="candidates-section" ref={candidatesRef}>
          {/* Ambient Glowing Orbs for Candidates Section */}
          <div className={`absolute top-1/3 right-1/4 w-[300px] h-[300px] rounded-full bg-gradient-to-br from-[#79BCC2]/10 to-[#0A2FFF]/5 blur-[90px] pointer-events-none transition-opacity duration-[2800ms] ${candidatesVisible ? 'opacity-100' : 'opacity-0'}`} />
          <div className={`absolute bottom-1/4 left-1/4 w-[280px] h-[280px] rounded-full bg-gradient-to-tr from-[#0A2FFF]/5 to-[#79BCC2]/5 blur-[80px] pointer-events-none transition-opacity duration-[2800ms] ${candidatesVisible ? 'opacity-100' : 'opacity-0'}`} />

          {/* ── Sponsor Marquee Banner with Title ── */}
          {(() => {
            const displaySponsors = sponsors && sponsors.length > 0 ? sponsors : [];
            if (settings?.hideSponsorBanner || displaySponsors.length === 0) return null;

            let halfList = displaySponsors;
            while (halfList.length < 15) {
              halfList = [...halfList, ...displaySponsors];
            }
            const marqueeItems = [...halfList, ...halfList];

            return (
              <div className="w-full my-10 sm:my-14 flex flex-col items-center justify-center overflow-x-hidden" suppressHydrationWarning>
                {/* Header Title & Pill Badge (Perfect Centered) */}
                <div className="w-full max-w-[1280px] mx-auto px-4 flex flex-col items-center justify-center text-center space-y-3 sm:space-y-4 mb-6 sm:mb-8">
                  <span className="inline-flex items-center gap-2 text-[11px] sm:text-[13px] font-black uppercase tracking-wider text-blue-600 dark:text-blue-400 bg-blue-50/90 dark:bg-blue-950/70 px-4 py-1.5 rounded-full border border-blue-200/80 dark:border-blue-800/80 shadow-sm">
                    <span className="h-2 w-2 rounded-full bg-blue-600 dark:bg-blue-400 animate-pulse" />
                    ĐỒNG HÀNH CÙNG HUIT'S ICONIC 2026
                  </span>
                  <h2 className="text-[22px] sm:text-[34px] font-black uppercase tracking-tight text-slate-900 dark:text-white leading-tight">
                    Nhà tài trợ &amp; Đối tác
                  </h2>
                  <div className="h-1 w-16 bg-gradient-to-r from-blue-600 to-teal-400 rounded-full mt-1" />
                </div>

                {/* Marquee Banner - Spans full screen width & uses website background */}
                <div className="sponsor-marquee-container w-full overflow-hidden py-3 sm:py-5 bg-transparent">
                  <div className="sponsor-marquee-track">
                    {marqueeItems.map((sp, idx) => {
                      const initialSrc = getSponsorLogoUrl(sp.logoUrl);
                      return (
                        <div key={`sp-marquee-${idx}`} className="sponsor-marquee-item mx-3">
                          <img
                            src={initialSrc}
                            alt={sp.name}
                            className="sponsor-marquee-logo animate-fade-in cursor-pointer"
                            onError={(e) => {
                              (e.currentTarget as HTMLImageElement).src = '/images/logo_iconic.png';
                            }}
                          />
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>
            );
          })()}


          <div className="sc-1a037b37-0 ekqPrV relative z-10">
            <div className="pt-3 sm:pt-2 flex flex-col items-center">

              {/* Leaderboard title */}
              <div className="flex flex-col space-y-4 text-center opacity-100 translate-y-0">
                <div className="flex flex-col space-y-1.5">
                  <h2 className="text-[22px] sm:text-[42px] tracking-[-1px] leading-[27px] sm:leading-[52px] font-extrabold uppercase bg-clip-text text-transparent bg-gradient-to-r from-black to-black/70 dark:from-white dark:to-white/70">
                    Danh sách Thí sinh
                  </h2>
                  <h3 className="candidate-section-subtitle text-[14px] sm:text-[20px] py-1 leading-[24px] uppercase font-bold text-blue-600 dark:text-[#79BCC2]">
                    HUIT'S ICONIC 2026
                  </h3>
                </div>
                <div
                  className="h-[3.5px] bg-gradient-to-r from-[#0A2FFF] to-[#79BCC2] mx-auto rounded-full mt-1.5 transition-all duration-[3200ms] ease-out"
                  style={{ width: candidatesVisible ? '80px' : '0px' }}
                />
                <p className="mx-auto max-w-[760px] text-[14px] sm:text-[16px] leading-relaxed text-neutral-600 dark:text-white/68">
                  Khám phá các gương mặt tài năng &amp; nét đẹp sinh viên HUIT, theo dõi bảng xếp hạng và bình chọn cho thí sinh bạn yêu thích.
                </p>
              </div>

              {/* Table Filter Tabs */}
              <div className="flex items-center gap-2 mt-5">
                {[
                  { key: 'ALL', label: language === 'en' ? '🌟 All Candidates' : '🌟 Tất cả thí sinh' },
                  { key: 'FEMALE', label: language === 'en' ? '👑 Female Track (Queen)' : '👑 Bảng Nữ (Queen)' },
                  { key: 'MALE', label: language === 'en' ? '🤴 Male Track (King)' : '🤴 Bảng Nam (King)' },
                ].map((tab) => (
                  <button
                    key={tab.key}
                    type="button"
                    onClick={() => setTableFilter(tab.key as any)}
                    className={`px-4 py-2 rounded-full text-xs font-black transition-all duration-200 ${
                      tableFilter === tab.key
                        ? 'bg-gradient-to-r from-[#0A2FFF] to-[#79BCC2] text-white shadow-md scale-105'
                        : 'bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-400 border border-slate-200 dark:border-slate-800 hover:border-blue-400'
                    }`}
                  >
                    {tab.label}
                  </button>
                ))}
              </div>

              {/* Search Bar matching sample web */}
              <div
                style={{
                  transitionTimingFunction: 'cubic-bezier(0.16, 1, 0.3, 1)',
                  transitionDelay: '400ms'
                }}
                className="max-w-[615px] w-full mt-4 sm:mt-6 opacity-100 translate-y-0"
              >
                <div className="flex items-center space-x-[8px] rounded-[20px] px-[8px] py-[7px] border border-grey-lightGrey1 dark:border-grey-darkGrey bg-grey-lightGrey2 dark:bg-grey-dimGrey h-[36px] sm:h-[60px] !px-2 rounded-[40px] w-full shadow-lg focus-within:border-[#79BCC2]/50 transition-all duration-300">
                  <div className="fill-neutral-neutral1 dark:fill-neutral-white pl-2">
                    <svg xmlns="http://www.w3.org/2000/svg" width="17" height="18" viewBox="0 0 17 18">
                      <path d="M0 7.4353C0 6.52222 0.171549 5.66724 0.514648 4.87036C0.857747 4.06795 1.33366 3.36239 1.94238 2.75366C2.55111 2.14494 3.25391 1.66903 4.05078 1.32593C4.85319 0.982829 5.71094 0.811279 6.62402 0.811279C7.53711 0.811279 8.39209 0.982829 9.18896 1.32593C9.99137 1.66903 10.6969 2.14494 11.3057 2.75366C11.9144 3.36239 12.3903 4.06795 12.7334 4.87036C13.0765 5.66724 13.248 6.52222 13.248 7.4353C13.248 8.19344 13.1263 8.91284 12.8828 9.59351C12.6449 10.2742 12.3128 10.8912 11.8867 11.4446L15.9458 15.5286C16.0343 15.6171 16.1007 15.7195 16.145 15.8357C16.1948 15.9519 16.2197 16.0764 16.2197 16.2092C16.2197 16.3918 16.1782 16.5579 16.0952 16.7073C16.0177 16.8567 15.9071 16.9729 15.7632 17.0559C15.6193 17.1444 15.4533 17.1887 15.2651 17.1887C15.1323 17.1887 15.005 17.1638 14.8833 17.114C14.7671 17.0697 14.6592 17.0006 14.5596 16.9065L10.4756 12.8142C9.93327 13.2016 9.33561 13.5059 8.68262 13.7273C8.02962 13.9486 7.34342 14.0593 6.62402 14.0593C5.71094 14.0593 4.85319 13.8878 4.05078 13.5447C3.25391 13.2016 2.55111 12.7257 1.94238 12.1169C1.33366 11.5082 0.857747 10.8054 0.514648 10.0085C0.171549 9.20614 0 8.34839 0 7.4353ZM1.41943 7.4353C1.41943 8.1547 1.55225 8.82983 1.81787 9.46069C2.08903 10.086 2.46257 10.6366 2.93848 11.1125C3.41992 11.5885 3.97331 11.962 4.59863 12.2332C5.22949 12.5043 5.90462 12.6399 6.62402 12.6399C7.34342 12.6399 8.01579 12.5043 8.64111 12.2332C9.27197 11.962 9.82536 11.5885 10.3013 11.1125C10.7772 10.6366 11.1507 10.086 11.4219 9.46069C11.693 8.82983 11.8286 8.1547 11.8286 7.4353C11.8286 6.7159 11.693 6.04354 11.4219 5.41821C11.1507 4.78735 10.7772 4.23397 10.3013 3.75806C9.82536 3.27661 9.27197 2.90308 8.64111 2.63745C8.01579 2.36629 7.34342 2.23071 6.62402 2.23071C5.90462 2.23071 5.22949 2.36629 4.59863 2.63745C3.97331 2.90308 3.41992 3.27661 2.93848 3.75806C2.46257 4.23397 2.08903 4.78735 1.81787 5.41821C1.55225 6.04354 1.41943 6.7159 1.41943 7.4353Z" fill="currentColor"></path>
                    </svg>
                  </div>
                  <input
                    className="w-full bg-transparent focus:outline-none text-neutral-neutral1 dark:text-neutral-white placeholder:text-neutral-neutral1 dark:placeholder:text-neutral-white pl-2 text-[14px]"
                    placeholder={language === 'en' ? 'Search candidate by Name, SBD, Track...' : 'Tìm kiếm thí sinh theo Tên, SBD, Khoa...'}
                    type="text"
                    value={search}
                    onChange={e => setSearch(e.target.value)}
                  />
                </div>
              </div>

            </div>
          </div>

          {/* ── Golden Hour Banner (Full Web Width, naturally aligned between containers) ── */}
          {settings?.activeVotingPromotion && (
            <div className="w-full mt-3 mb-0">
              <div className="promotion-ribbon-banner relative flex items-center justify-center gap-2 sm:gap-3 px-4 sm:px-6 py-2.5 rounded-none overflow-hidden">
                {/* Animated shimmer overlay */}
                <div className="promotion-ribbon-shimmer" />
                {/* Badge */}
                <span className="flex-shrink-0 inline-flex items-center gap-1.5 rounded-full bg-gradient-to-r from-amber-500 to-orange-500 border border-amber-400/30 px-3 py-1 text-[10px] sm:text-[11px] font-black uppercase tracking-[0.12em] text-white shadow-[0_2px_8px_rgba(245,158,11,0.3)] animate-pulse">
                  <span className="animate-pulse">⚡</span> Thời gian vàng <span>🔥</span>
                </span>
                {/* Multiplier info */}
                <span className="flex-shrink-0 text-slate-800 dark:text-white text-[12px] sm:text-[13px] font-extrabold">
                  Đang nhân
                </span>
                <span className="flex-shrink-0 text-[20px] sm:text-[24px] font-black text-blue-700 dark:text-[#79BCC2] leading-none transition-transform duration-300 scale-105">
                  ×{settings.activeVotingPromotion.multiplier}
                </span>
                <span className="flex-shrink-0 text-slate-800 dark:text-white text-[12px] sm:text-[13px] font-extrabold">lượt</span>
                
                {/* Real-time Countdown Timer */}
                {promoTimeLeft && (
                  <span className="flex-shrink-0 inline-flex items-center gap-1.5 rounded-lg bg-red-500/10 dark:bg-red-500/20 border border-red-500/30 dark:border-red-500/40 px-3 py-0.5 text-[11px] sm:text-[12px] font-black text-red-600 dark:text-red-400 font-mono shadow-sm ml-2 animate-pulse">
                    <svg className="w-3.5 h-3.5 stroke-current fill-none" style={{ animation: 'spin 8s linear infinite' }} strokeWidth="2.2" viewBox="0 0 24 24">
                      <circle cx="12" cy="12" r="9" />
                      <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6h3" />
                    </svg>
                    Kết thúc sau: {promoTimeLeft}
                  </span>
                )}
              </div>
            </div>
          )}

          <div className="sc-1a037b37-0 ekqPrV relative z-10">
            <div className="pt-0 flex flex-col items-center w-full">

              {/* Grid of Candidates - mirroring 1vote structure */}
              <div className="w-full mt-2 sm:mt-3"></div>

              {isLoading ? (
                <div className="flex justify-center items-center py-20 text-neutral-600 dark:text-white">
                  Đang tải danh sách thí sinh...
                </div>
              ) : filteredCandidates.length === 0 ? (
                <div className="text-center py-20 text-neutral-500 dark:text-white/50">
                  Không tìm thấy thí sinh phù hợp
                </div>
              ) : (
                <div className="project-cards-grid w-full mx-auto">
                  {visibleCandidates.map((c, idx) => {
                    // Find actual rank based on overall sorted position
                    const rank = sortedCandidates.findIndex(x => x.sbd === c.sbd) + 1;
                    const rankTone = getCandidateRankTone(rank);
                    const candidateImage = getCandidateImageUrl(c.imageUrl);

                    return (
                      <div
                        key={c.id}
                        style={{
                          transitionDelay: `${Math.min(idx * 250, 1500)}ms`,
                          transitionTimingFunction: 'cubic-bezier(0.34, 1.56, 0.64, 1)'
                        }}
                        className="project-card-item h-full group w-full opacity-100 translate-y-0 scale-100 transition-all duration-300"
                      >
                        <div className="project-card-clear project-showcase-card relative h-full rounded-[20px] border transition-all duration-300 overflow-hidden">

                          {/* Candidate banner image */}
                          <div className="project-card-media project-showcase-media relative block w-full aspect-[16/8.6]">
                            <div className="project-media-shell m-2 mb-0 relative h-[calc(100%-8px)] overflow-hidden rounded-[13px] bg-black/15 border border-white/10">
                              <img
                                alt={c.name}
                                className="project-media-image object-contain object-center w-full h-full"
                                src={candidateImage}
                                loading="lazy"
                                onError={(event) => {
                                  const target = event.currentTarget;
                                  if (!target.dataset.fallbackApplied) {
                                    target.dataset.fallbackApplied = 'true';
                                    target.src = PROJECT_FALLBACK_IMAGE;
                                  }
                                }}
                              />
                            </div>
                          </div>

                          {/* Candidate details */}
                          <div className="project-card-body project-showcase-body flex flex-1 flex-col px-3 pt-3 pb-3">
                            <div className="project-card-meta">
                              <span className="project-card-code-badge">SBD: {c.sbd}</span>
                              <span className={`project-rank-badge ${rankTone}`}>Top {rank}</span>
                            </div>

                            <div className="project-title-group">
                              <h4 className="project-card-title">
                                <Link href={`/thi-sinh/${c.sbd}`} className="focus:outline-none">
                                  {c.name}
                                </Link>
                              </h4>
                              {c.faculty && (
                                <p className="text-[11px] font-bold text-[#79BCC2] mt-0.5 truncate">
                                  {c.faculty}
                                </p>
                              )}
                            </div>

                            <div className="project-vote-stat flex items-center justify-between">
                              <div>
                                <p className="project-vote-stat-label">{language === 'en' ? 'Votes' : 'Lượt bình chọn'}</p>
                                <p className="project-vote-stat-value">{c.votes.toLocaleString()}</p>
                              </div>
                              {settings?.activeVotingPromotion && (
                                <span className="inline-flex items-center rounded-lg bg-amber-500/10 border border-amber-500/25 px-2 py-1 text-xs font-black text-amber-600 dark:text-amber-400 animate-pulse">
                                  x{settings.activeVotingPromotion.multiplier} {language === 'en' ? 'votes' : 'lượt'}
                                </span>
                              )}
                            </div>

                            <p className="project-card-description mt-2 line-clamp-2 min-h-[34px] text-[11px] leading-relaxed text-neutral-600 dark:text-white/68 text-left">
                              {localizedText(language, c.description, (c as any).descriptionEn) || (language === 'en' ? 'Startup project profile is being updated.' : 'Ý tưởng khởi nghiệp đang được cập nhật thông tin giới thiệu.')}
                            </p>

                            <div className="project-card-actions flex items-center gap-2">
                              <button
                                onClick={() => handleVote(c.sbd, c.name)}
                                className={`project-vote-button sc-7f525aa4-0 eyRkL flex items-center justify-center gap-2 rounded-xl py-2.5 w-full border-0 cursor-pointer transition-all hover-shine-effect ${isGateCurrentlyOpen()
                                    ? 'active bg-gradient-to-r from-primary to-secondary dark:bg-neutral-white dark:from-transparent dark:to-transparent hover:opacity-90 active:scale-[0.98]'
                                    : 'disabled bg-slate-200 dark:bg-slate-800/50 cursor-not-allowed'
                                  }`}
                              >
                                <span className="project-vote-button-glow" aria-hidden="true" />
                                <p className={`project-vote-button-label text-[11px] leading-[16px] font-bold uppercase tracking-wider ${isGateCurrentlyOpen()
                                    ? 'text-neutral-white dark:text-primary'
                                    : 'text-slate-500 dark:text-slate-400'
                                  }`}>
                                  {isGateCurrentlyOpen() ? (language === 'en' ? 'Vote Now' : 'Bình chọn') : (language === 'en' ? 'Closed' : 'Đã đóng')}
                                </p>
                              </button>

                            </div>

                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}

              {/* Expand projects, then continue to the complete project list */}
              <div
                style={{
                  transitionTimingFunction: 'cubic-bezier(0.16, 1, 0.3, 1)',
                  transitionDelay: '800ms'
                }}
                className="project-section-toolbar flex flex-row justify-center items-center gap-2.5 mt-6 sm:mt-8 mb-4 w-auto opacity-100"
              >
                {!showAllCandidates && filteredCandidates.length > 3 ? (
                  <button
                    type="button"
                    aria-expanded="false"
                    onClick={() => setShowAllCandidates(true)}
                    className="project-list-action active flex items-center justify-center rounded-full px-5 py-2.5 sm:px-6 sm:py-3 transition-all duration-200 text-[11px] sm:text-[13px] uppercase tracking-wider hover:-translate-y-0.5 active:scale-95"
                  >
                    {language === 'en' ? 'Show more' : 'Xem thêm'}
                  </button>
                ) : (
                  <Link
                    href="/bang-xep-hang#danh-sach-du-an"
                    className="project-list-action active flex items-center justify-center rounded-full px-5 py-2.5 sm:px-6 sm:py-3 transition-all duration-200 text-[11px] sm:text-[13px] uppercase tracking-wider hover:-translate-y-0.5 active:scale-95"
                  >
                    {language === 'en' ? 'View all candidates' : 'Xem danh sách thí sinh'}
                  </Link>
                )}
              </div>

            </div>
          </div>
        </div>


        {settings?.themeVideoEmbedUrl && (
        <section className="modern-section alt" aria-labelledby="video-title">
          <div className="modern-container video-feature">
            <div className="modern-section-head">
              <span className="modern-kicker">{language === 'en' ? 'Theme video' : 'Video chủ đề'}</span>
              {text(settings?.themeVideoTitle, settings?.themeVideoTitleEn) && <h2 id="video-title">{text(settings?.themeVideoTitle, settings?.themeVideoTitleEn)}</h2>}
              {text(settings?.themeVideoDescription, settings?.themeVideoDescriptionEn) && <p>{text(settings?.themeVideoDescription, settings?.themeVideoDescriptionEn)}</p>}
              <Link href="/gioi-thieu" className="news-link">{language === 'en' ? 'Discover the ICONIC story →' : "Khám phá câu chuyện HUIT's ICONIC →"}</Link>
            </div>
            <div className="video-shell" style={{ aspectRatio: '267/476', maxWidth: '340px', margin: '0 auto' }}>
              <iframe 
                src={settings.themeVideoEmbedUrl} 
                width="267" 
                height="476" 
                style={{ border: 'none', overflow: 'hidden', width: '100%', height: '100%' }} 
                scrolling="no" 
                frameBorder="0" 
                allowFullScreen={true} 
                allow="autoplay; clipboard-write; encrypted-media; picture-in-picture; web-share"
              ></iframe>
            </div>
          </div>
        </section>
        )}

        <section className="modern-section news-section-compact" aria-labelledby="news-title">
          <div className="modern-container">
            <div className="modern-section-head">
              <span className="modern-kicker">{language === 'en' ? 'News & announcements' : 'Tin tức & Thông báo'}</span>
              <h2 id="news-title">{language === 'en' ? 'Latest ICONIC updates' : "Cập nhật mới nhất từ HUIT's ICONIC"}</h2>
              <p>{language === 'en' ? 'Follow milestones, activities and important announcements throughout the competition.' : 'Theo dõi các cột mốc, hoạt động huấn luyện và thông báo quan trọng trong suốt hành trình cuộc thi.'}</p>
            </div>
            <div className="news-grid-modern">
              {homepageNewsPosts.map((post, index) => (
                <article key={post.id} className={`news-card-modern ${index === 0 ? 'featured' : ''}`}>
                  <img src={post.thumbnailUrl || '/uploads/baner.jpg'} loading="lazy" alt={text(post.title, post.titleEn)} />
                  <div className="news-card-body">
                    <div className="news-meta">
                      <strong>{post.category}</strong>
                      <time>{formatDateTime(post.createdAt)}</time>
                    </div>
                    <h3>{text(post.title, post.titleEn)}</h3>
                    <p>{text(post.summary, post.summaryEn)}</p>
                    <Link className="news-link" href={`/tin-tuc/${post.slug}`}>{language === 'en' ? 'Read more →' : 'Xem chi tiết →'}</Link>
                  </div>
                </article>
              ))}
            </div>
            <div className="mt-8 flex justify-center">
              <Link href="/tin-tuc" className="project-list-action active inline-flex items-center justify-center rounded-full px-6 py-3 text-[11px] sm:text-[13px] font-extrabold uppercase tracking-wider transition-all duration-200 hover:-translate-y-0.5 active:scale-95">
                {language === 'en' ? 'View more news' : 'Xem thêm tin tức'}
              </Link>
            </div>
          </div>
        </section>

        {/* Sponsor Section matching sample web */}
        {settings?.sponsorBannerUrl && !settings?.hideSponsorBanner && (
          <div className="relative w-full max-w-[1180px] mx-auto pb-8 sm:pb-12" id="sponsor-section" ref={sponsorsRef}>

            <div className="pt-8 sm:pt-12 flex flex-col space-y-5 items-center relative z-10">
              <div className={`flex flex-col space-y-1.5 text-center transform transition-all duration-700 ease-out ${sponsorsVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`}>
                <div className="flex flex-col space-y-1.5">
                  <h2 className="text-[19px] sm:text-[31px] tracking-[-0.5px] leading-[25px] sm:leading-[38px] font-extrabold uppercase bg-clip-text text-transparent bg-gradient-to-r from-black to-black/70 dark:from-white dark:to-white/70">
                    {language === 'en' ? 'SPONSORS & PARTNERS' : 'NHÀ TÀI TRỢ & ĐỐI TÁC'}
                  </h2>
                  <h3 className="text-[13px] sm:text-[18px] py-0.5 leading-[22px] uppercase font-bold text-blue-600 dark:text-blue-400">
                    {settings?.eventTitle || ''}
                  </h3>
                </div>
                <div
                  className="h-[3.5px] bg-gradient-to-r from-[#0A2FFF] to-[#79BCC2] mx-auto rounded-full mt-2 transition-all duration-[3200ms] ease-out"
                  style={{ width: sponsorsVisible ? '52px' : '0px' }}
                />
              </div>

              <div
                style={{
                  transitionTimingFunction: 'cubic-bezier(0.16, 1, 0.3, 1)',
                  transitionDelay: '600ms'
                }}
                className={`w-full max-w-[1080px] px-4 transform transition-all duration-700 ${sponsorsVisible ? 'opacity-100 scale-100 translate-y-0' : 'opacity-0 scale-95 translate-y-4'
                  }`}
              >
                <div className="relative group hover-shine-effect rounded-2xl overflow-hidden">
                  <img alt="Sponsors Logo" className="w-full h-auto object-contain rounded-xl relative z-10 transition-transform duration-700 ease-out group-hover:scale-[1.01]" src={formatSponsorBannerUrl(settings.sponsorBannerUrl, theme)} />
                </div>
              </div>
            </div>
          </div>
        )}

      </main>

      {activeVoteCandidate && (
        <VoteModal
          candidate={activeVoteCandidate}
          onClose={() => setActiveVoteCandidate(null)}
          onSuccess={(updatedCandidate) => {
            setCandidates((prev) =>
              prev.map((c) => (c.sbd === updatedCandidate.sbd ? updatedCandidate : c))
            );
          }}
        />
      )}

      {/* Vote Toast Notifications */}
      <VoteToastContainer />
    </>
  );
}
