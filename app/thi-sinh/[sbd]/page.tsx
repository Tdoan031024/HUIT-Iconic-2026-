'use client';

import React, { useEffect, useMemo, useState, useRef } from 'react';
import { Candidate, WebUser } from '@/lib/types';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import { useAlert } from '../../AlertProvider';
import { apiUrl } from '../../api';
import VoteModal from '../../VoteModal';
import { generateCandidatePoster, downloadDataUrl } from '@/lib/posterGenerator';
import { useLanguage } from '../../../src/i18n/use-language';
import { translate, localizeTable, localizeRound } from '../../../src/i18n';
import { localizedText } from '../../../src/i18n/content';

function getCandidateImageUrl(url?: string | null) {
  if (!url) return '/duan/anhmauduan.png';
  if (url.startsWith('http://') || url.startsWith('https://') || url.startsWith('data:')) return url;
  if (url.startsWith('/uploads/')) return apiUrl(url);
  return url;
}

function getStoredUser(): WebUser | null {
  if (typeof window === 'undefined') return null;
  const raw = localStorage.getItem('huit_web_user');
  if (!raw) return null;
  try { return JSON.parse(raw); } catch { return null; }
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
  const pad = (n: number) => String(n).padStart(2, '0');
  const utc7 = new Date(date.getTime() + 7 * 60 * 60 * 1000);
  return `${pad(utc7.getUTCHours())}:${pad(utc7.getUTCMinutes())} ngày ${pad(utc7.getUTCDate())}/${pad(utc7.getUTCMonth() + 1)}/${utc7.getUTCFullYear()}`;
}

function getReadableBiography(value: string | undefined | null, language: string) {
  if (!value) return '';
  const text = String(value).trim();
  if (!text.startsWith('{') && !text.startsWith('[')) return text;

  try {
    const parsed = JSON.parse(text);
    if (!parsed || typeof parsed !== 'object') return text;
    const labels: Record<string, string> = language === 'en' ? {
      teamName: 'Project / Team', representativeSchool: 'School / Unit', leaderName: 'Representative',
      advisorName: 'Advisor', implementationLocation: 'Implementation location', supportNeeds: 'Support needs',
      expectations: 'Expectations', talent: 'Field / focus', sector: 'Field / focus', motto: 'Motto',
      achievements: 'Achievements', hobbies: 'Interests', longDescription: 'Project introduction'
    } : {
      teamName: 'Tên dự án / nhóm', representativeSchool: 'Trường / đơn vị', leaderName: 'Đại diện',
      advisorName: 'Cố vấn', implementationLocation: 'Địa điểm triển khai', supportNeeds: 'Nhu cầu hỗ trợ',
      expectations: 'Kỳ vọng', talent: 'Lĩnh vực / định hướng', sector: 'Lĩnh vực / định hướng', motto: 'Thông điệp',
      achievements: 'Thành tích', hobbies: 'Sở thích', longDescription: 'Giới thiệu dự án'
    };
    const allowedKeys = Object.keys(labels);
    return Object.entries(parsed)
      .filter(([key, item]) => allowedKeys.includes(key) && item !== null && item !== undefined && item !== '')
      .map(([key, item]) => `${labels[key]}: ${typeof item === 'boolean' ? (item ? (language === 'en' ? 'Yes' : 'Có') : (language === 'en' ? 'No' : 'Không')) : String(item)}`)
      .join('\n');
  } catch {
    return text;
  }
}

export default function CandidateDetailPage() {
  const language = useLanguage();
  const t = (key: Parameters<typeof translate>[1]) => translate(language, key);
  const { showAlert } = useAlert();
  const params = useParams();
  const sbd = (params?.sbd as string) || '';

  const [candidate, setCandidate] = useState<Candidate | null>(null);
  const [allCandidates, setAllCandidates] = useState<Candidate[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isVoteModalOpen, setIsVoteModalOpen] = useState(false);
  const [isGeneratingPoster, setIsGeneratingPoster] = useState(false);
  const [settings, setSettings] = useState<any>(null);
  const [currentUser, setCurrentUser] = useState<WebUser | null>(null);
  const [activeImage, setActiveImage] = useState<string>('');
  const [isLightboxOpen, setIsLightboxOpen] = useState(false);
  const [lightboxIndex, setLightboxIndex] = useState(0);
  const [recentVotes, setRecentVotes] = useState<any[]>([]);
  const lightboxRef = useRef<HTMLDivElement>(null);
  const lightboxCloseRef = useRef<HTMLButtonElement>(null);
  const lightboxTriggerRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    setCurrentUser(getStoredUser());

    async function loadData() {
      setIsLoading(true);
      const [candidateRes, allRes, settingsRes, votesRes] = await Promise.all([
        fetch(apiUrl('/api/candidates/' + sbd)),
        fetch(apiUrl('/api/candidates')),
        fetch(apiUrl('/api/settings')),
        fetch(apiUrl('/api/candidates/' + sbd + '/votes')),
      ]);

      if (candidateRes.ok) {
        const data = await candidateRes.json();
        setCandidate(data);
        if (data) {
          setActiveImage(getCandidateImageUrl(data.imageUrl));
        }
      }

      if (allRes.ok) {
        setAllCandidates(await allRes.json());
      }

      if (settingsRes.ok) {
        setSettings(await settingsRes.json());
      }

      if (votesRes.ok) {
        setRecentVotes(await votesRes.json());
      }
      setIsLoading(false);
    }

    loadData().catch(() => setIsLoading(false));

    const interval = setInterval(async () => {
      if (typeof document !== 'undefined' && document.hidden) return;
      try {
        const [candidateRes, votesRes] = await Promise.all([
          fetch(apiUrl('/api/candidates/' + sbd)),
          fetch(apiUrl('/api/candidates/' + sbd + '/votes')),
        ]);
        if (candidateRes.ok) {
          const data = await candidateRes.json();
          setCandidate(data);
        }
        if (votesRes.ok) {
          setRecentVotes(await votesRes.json());
        }
      } catch (err) {
        // Silently handle
      }
    }, 20000);

    return () => clearInterval(interval);
  }, [sbd]);

  const showcaseUrls = useMemo(() => {
    if (!candidate || !candidate.showcaseImages) return [];
    return candidate.showcaseImages.split(',').map(url => url.trim()).filter(Boolean);
  }, [candidate?.showcaseImages]);

  const allImages = useMemo(() => {
    if (!candidate) return [];
    const list: string[] = [];
    if (candidate.imageUrl) list.push(getCandidateImageUrl(candidate.imageUrl));
    showcaseUrls.forEach(url => {
      const normalizedUrl = getCandidateImageUrl(url);
      if (normalizedUrl && !list.includes(normalizedUrl)) {
        list.push(normalizedUrl);
      }
    });
    return list;
  }, [candidate?.imageUrl, showcaseUrls]);

  const isGateOpen = useMemo(() => {
    if (!settings) return true;
    if (!settings.isGateOpen) return false;
    const now = new Date();
    const start = new Date(settings.startDate);
    const end = new Date(settings.endDate);
    return now >= start && now <= end;
  }, [settings]);

  const remainingDays = useMemo(() => {
    if (!settings || !settings.endDate) return '0 ngày';
    const now = new Date();
    const end = new Date(settings.endDate);
    const diffTime = end.getTime() - now.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays > 0 ? `${diffDays} ngày` : 'Kết thúc';
  }, [settings?.endDate]);

  const readableBiography = useMemo(
    () => getReadableBiography(candidate?.biography || candidate?.description, language),
    [candidate?.biography, candidate?.description, language]
  );

  const currentRank = useMemo(() => {
    if (!candidate || allCandidates.length === 0) return 'Top --';
    const sorted = [...allCandidates].sort((a, b) => b.votes - a.votes);
    const idx = sorted.findIndex(x => x.sbd === candidate.sbd);
    return idx >= 0 ? `Top ${idx + 1}` : 'Top --';
  }, [candidate, allCandidates]);

  const prevAndNext = useMemo(() => {
    if (allCandidates.length === 0 || !candidate) return { prev: null, next: null };
    const sorted = [...allCandidates].sort((a, b) => b.votes - a.votes);
    const idx = sorted.findIndex(x => x.sbd === candidate.sbd);
    if (idx === -1) return { prev: null, next: null };
    const prev = idx > 0 ? sorted[idx - 1] : sorted[sorted.length - 1];
    const next = idx < sorted.length - 1 ? sorted[idx + 1] : sorted[0];
    return { prev, next };
  }, [candidate, allCandidates]);

  const highlights = useMemo(() => {
    if (candidate?.sbd === '001') {
      return [
        { title: 'Tận dụng phụ phẩm', desc: 'Giảm thiểu rác thải nông nghiệp', color: 'bg-emerald-50 text-emerald-800 border border-emerald-300/80 dark:bg-emerald-950/30 dark:text-emerald-400' },
        { title: 'Lên men tự nhiên', desc: 'Giàu probiotics tốt cho sức khỏe', color: 'bg-blue-50 text-blue-800 border border-blue-300/80 dark:bg-blue-950/30 dark:text-blue-400' },
        { title: 'Giàu chất chống oxy hóa', desc: 'Hỗ trợ tăng cường sức đề kháng', color: 'bg-amber-50 text-amber-800 border border-amber-300/80 dark:bg-amber-950/30 dark:text-amber-400' },
        { title: 'An toàn & bền vững', desc: 'Đạt tiêu chuẩn vệ sinh an toàn thực phẩm', color: 'bg-teal-50 text-teal-800 border border-teal-300/80 dark:bg-teal-950/30 dark:text-teal-400' }
      ];
    }
    return [
      { title: 'Đột phá & Sáng tạo', desc: 'Ý tưởng độc đáo, giải pháp công nghệ mới', color: 'bg-blue-50 text-blue-800 border border-blue-300/80 dark:bg-blue-950/30 dark:text-blue-400' },
      { title: 'Tính khả thi cao', desc: 'Mô hình kinh doanh rõ ràng, thực tiễn', color: 'bg-teal-50 text-teal-800 border border-teal-300/80 dark:bg-teal-950/30 dark:text-teal-400' },
      { title: 'Tác động cộng đồng', desc: 'Giải quyết các vấn đề xã hội cấp thiết', color: 'bg-emerald-50 text-emerald-800 border border-emerald-300/80 dark:bg-emerald-950/30 dark:text-emerald-400' },
      { title: 'Phát triển bền vững', desc: 'Thân thiện môi trường, tiết kiệm tài nguyên', color: 'bg-amber-50 text-amber-800 border border-amber-300/80 dark:bg-amber-950/30 dark:text-amber-400' }
    ];
  }, [candidate?.sbd]);

  const handleOpenLightbox = (imgUrl: string) => {
    const idx = allImages.indexOf(imgUrl);
    setLightboxIndex(idx >= 0 ? idx : 0);
    setIsLightboxOpen(true);
  };

  const handlePrevImage = () => {
    setLightboxIndex((prev) => (prev === 0 ? allImages.length - 1 : prev - 1));
  };

  const handleNextImage = () => {
    setLightboxIndex((prev) => (prev === allImages.length - 1 ? 0 : prev + 1));
  };

  useEffect(() => {
    if (!isLightboxOpen) return;
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    lightboxCloseRef.current?.focus();

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setIsLightboxOpen(false);
      } else if (e.key === 'ArrowLeft') {
        handlePrevImage();
      } else if (e.key === 'ArrowRight') {
        handleNextImage();
      } else if (e.key === 'Tab' && lightboxRef.current) {
        const controls = Array.from(lightboxRef.current.querySelectorAll<HTMLElement>('button:not([disabled]), [tabindex]:not([tabindex="-1"])'));
        const first = controls[0];
        const last = controls[controls.length - 1];
        if (first && last && e.shiftKey && document.activeElement === first) {
          e.preventDefault();
          last.focus();
        } else if (first && last && !e.shiftKey && document.activeElement === last) {
          e.preventDefault();
          first.focus();
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      document.body.style.overflow = previousOverflow;
      lightboxTriggerRef.current?.focus();
    };
  }, [isLightboxOpen, allImages]);

  const handleVote = () => {
    if (!candidate) return;
    if (!isGateOpen) {
      showAlert('Cổng bình chọn hiện đang đóng hoặc chưa đến thời gian mở cổng.', 'warning', 'Cổng bình chọn');
      return;
    }
    setIsVoteModalOpen(true);
  };

  const handleDownloadPoster = async () => {
    if (!candidate) return;
    setIsGeneratingPoster(true);
    try {
      const siteUrl = typeof window !== 'undefined' ? window.location.origin : 'https://iconic2026.huitmedia.edu.vn';
      const posterDataUrl = await generateCandidatePoster(candidate, siteUrl);
      downloadDataUrl(posterDataUrl, `poster-iconic-2026-${candidate.sbd}-${candidate.name.toLowerCase().replace(/\s+/g, '-')}.png`);
      showAlert('Đã tạo và tải về Poster bình chọn thành công!', 'success', 'Tải poster');
    } catch (err: any) {
      showAlert('Không thể tạo poster: ' + (err.message || 'Lỗi xử lý hình ảnh'), 'error', 'Lỗi');
    } finally {
      setIsGeneratingPoster(false);
    }
  };

  const copyLink = async () => {
    try {
      await navigator.clipboard.writeText(window.location.href);
      showAlert('Đã sao chép đường dẫn bình chọn.', 'success', 'Chia sẻ');
    } catch {
      showAlert('Không thể sao chép tự động. Hãy sao chép đường dẫn trên thanh địa chỉ.', 'warning', 'Chia sẻ');
    }
  };

  if (isLoading) {
    return <main className="min-h-[60vh] bg-[#F8FAFC] px-4 py-24 text-center text-base font-bold text-slate-600">Đang tải hồ sơ thí sinh...</main>;
  }

  if (!candidate) {
    return (
      <main className="min-h-[60vh] bg-[#F8FAFC] px-4 py-24 text-center">
        <h1 className="text-2xl font-bold text-slate-950">Không tìm thấy thí sinh</h1>
        <Link href="/" className="mt-4 inline-block text-sm font-bold text-[#2563EB] hover:underline">Quay lại trang chủ</Link>
      </main>
    );
  }

  const qrCodeUrl = `https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=${encodeURIComponent(typeof window !== 'undefined' ? window.location.href : '')}`;

  return (
    <main className="min-h-screen bg-[#F8FAFC] pb-24 text-slate-800 font-sans antialiased">
      
      {/* ─── BREADCRUMB ─── */}
      <div className="max-w-[1300px] mx-auto px-4 pt-3">
        <nav className="text-sm text-slate-500 flex items-center gap-2" aria-label="Breadcrumb">
          <Link href="/" className="hover:text-slate-900 transition-colors font-medium">Thí sinh</Link>
          <span className="text-slate-300" aria-hidden="true">/</span>
          <span aria-current="page" className="text-slate-800 font-bold truncate">{candidate.name}</span>
        </nav>
      </div>

      {/* ─── HERO SECTION (Title & Description Full Width) ─── */}
      <section className="max-w-[1180px] mx-auto px-4 pt-6 pb-3">
        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-gradient-to-r from-[#0A2FFF]/10 to-[#79BCC2]/10 border border-[#0A2FFF]/25 text-[#0A2FFF] dark:text-[#79BCC2] text-[10px] font-bold rounded-full w-max tracking-wide uppercase">
          <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 24 24"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-1 14H9V8h2v8zm4 0h-2V8h2v8z"/></svg>
          Mã thí sinh · {candidate.sbd}
        </span>
        <h1 className="mt-2 text-2xl md:text-[32px] font-black text-slate-900 tracking-tight leading-snug">
          {candidate.name}
        </h1>
        <p className="mt-2 text-sm sm:text-[15px] leading-relaxed text-slate-600 font-medium line-clamp-2 sm:line-clamp-none">
          {candidate.description}
        </p>
      </section>

      {/* ─── IMAGE & STATS SECTION (2 Columns - Stretched Height) ─── */}
      <section className="max-w-[1180px] mx-auto px-4 py-3">
        <div className="grid gap-5 lg:grid-cols-[minmax(300px,390px)_1fr] items-stretch">
          
          {/* Left Column: Image & Thumbnails (Matched Height) */}
          <div className="flex flex-col gap-3 h-full justify-between">
            <button
              ref={lightboxTriggerRef}
              type="button"
              onClick={() => handleOpenLightbox(activeImage || getCandidateImageUrl(candidate.imageUrl))}
              className="overflow-hidden rounded-2xl cursor-zoom-in relative group text-left transition-all duration-300 active:scale-[0.99] w-full aspect-[3/4] bg-slate-100 border border-slate-200"
              aria-label={`Phóng to ảnh thí sinh ${candidate.name}`}
            >
              <img 
                src={activeImage || getCandidateImageUrl(candidate.imageUrl)}
                alt={candidate.name} 
                className="absolute inset-0 w-full h-full object-contain rounded-2xl transition-transform duration-500 group-hover:scale-[1.02]"
              />
              <div className="absolute inset-0 rounded-2xl bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center">
                <svg viewBox="0 0 24 24" className="h-8 w-8 text-white drop-shadow" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <circle cx="11" cy="11" r="8" />
                  <line x1="21" y1="21" x2="16.65" y2="16.65" />
                  <line x1="11" y1="8" x2="11" y2="14" />
                  <line x1="8" y1="11" x2="14" y2="11" />
                </svg>
              </div>
            </button>
            
            {allImages.length > 1 && (
              <div className="flex flex-wrap gap-1.5 justify-start shrink-0">
                {allImages.map((imgUrl, index) => {
                  const isActive = (activeImage || getCandidateImageUrl(candidate.imageUrl)) === imgUrl;
                  return (
                    <button
                      key={index}
                      onClick={() => setActiveImage(imgUrl)}
                      className={`h-10 w-14 rounded-xl overflow-hidden border-2 bg-white transition-all duration-200 active:scale-95 shrink-0 ${
                        isActive ? 'border-[#2563EB] scale-105 shadow-sm' : 'border-slate-300 opacity-70 hover:opacity-100 hover:border-slate-400'
                      }`}
                    >
                      <img src={imgUrl} alt={`${candidate.name} image ${index + 1}`} className="h-full w-full object-cover" />
                    </button>
                  );
                })}
              </div>
            )}
          </div>

          {/* Right Column: 4 Stats Cards & Metadata Bar */}
          <div className="flex flex-col justify-between h-full gap-3">
            {/* Horizontal Icon Cards Statistics */}
            <div className="grid grid-cols-2 gap-3 flex-1">
              {[
                {
                  label: t('votes'),
                  value: candidate.votes.toLocaleString(),
                  bgIcon: 'bg-blue-50 dark:bg-blue-950/40 text-blue-600 dark:text-blue-400',
                  icon: (
                    <svg className="w-5 h-5 fill-current" viewBox="0 0 24 24">
                      <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"/>
                    </svg>
                  )
                },
                {
                  label: t('ranking'),
                  value: currentRank,
                  bgIcon: 'bg-amber-50 dark:bg-amber-950/40 text-amber-600 dark:text-amber-400',
                  icon: (
                    <svg className="w-5 h-5 stroke-current fill-none" strokeWidth="2.2" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M16.5 18.75h-9m9 0a3 3 0 013 3h-15a3 3 0 013-3m9 0v-3.375c0-.621-.504-1.125-1.125-1.125h-.871M7.5 18.75v-3.375c0-.621.504-1.125 1.125-1.125h.872m5.007 0H9.497m5.007 0a7.454 7.454 0 01-.982-3.172M9.497 14a7.454 7.454 0 00.981 3.172m0 0a8.25 8.25 0 001.38 2.226m0 0a8.25 8.25 0 01-1.38-2.226" />
                    </svg>
                  )
                },
                {
                  label: language === 'en' ? 'Current round' : 'Vòng thi hiện tại',
                  value: localizeRound(candidate.currentRound, language) || (language === 'en' ? 'Preliminary' : 'Vòng loại'),
                  bgIcon: 'bg-blue-50 dark:bg-blue-950/40 text-blue-600 dark:text-blue-400',
                  icon: (
                    <svg className="w-5 h-5 stroke-current fill-none" strokeWidth="2.2" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M4 5h16M4 12h16M4 19h16" />
                    </svg>
                  )
                },
                {
                  label: language === 'en' ? 'Voting status' : 'Trạng thái bình chọn',
                  value: isGateOpen ? (language === 'en' ? 'Open' : 'Đang mở') : (language === 'en' ? 'Closed' : 'Đã đóng'),
                  bgIcon: 'bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400',
                  icon: <span className="h-3 w-3 rounded-full bg-current" />
                }
              ].map((stat, i) => (
                <div key={i} className="bg-white dark:bg-slate-900 px-5 py-4 rounded-2xl border border-slate-200 dark:border-slate-800 hover:border-blue-500/30 hover:shadow-md transition-all duration-300 flex items-center justify-between gap-4">
                  <div className="space-y-1.5 text-left">
                    <span className="text-[12px] font-bold text-slate-500 dark:text-slate-400 tracking-wide">{stat.label}</span>
                    <p className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white tracking-tight">{stat.value}</p>
                  </div>
                  <div className={`h-11 w-11 shrink-0 rounded-xl flex items-center justify-center shadow-sm ${stat.bgIcon}`}>
                    {stat.icon}
                  </div>
                </div>
              ))}
            </div>
 
            {/* Compact project metadata details */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 bg-gradient-to-r from-[#0A2FFF]/[0.03] to-[#79BCC2]/[0.03] border border-[#0A2FFF]/15 p-2.5 rounded-xl shrink-0">
              {[
                [language === 'en' ? 'Category' : 'Hạng mục', localizeTable(candidate.contestTable, language) || (language === 'en' ? 'General category' : 'Chưa phân hạng mục')],
                [language === 'en' ? 'Round' : 'Vòng thi', localizeRound(candidate.currentRound, language) || (language === 'en' ? 'Preliminary' : 'Vòng loại')],
                [t('votes'), `${candidate.votes.toLocaleString()} ${language === 'en' ? 'votes' : 'lượt'}`],
              ].map(([lbl, val]) => (
                <div key={lbl} className="flex justify-between sm:flex-col sm:justify-start gap-0.5 px-2 py-1 sm:border-r last:border-r-0 border-[#0A2FFF]/15">
                  <span className="text-[10px] font-bold text-[#0A2FFF]/70 dark:text-[#79BCC2]/70 uppercase tracking-wide">{lbl}</span>
                  <div className="flex items-center gap-1.5">
                    <span className="text-sm font-bold text-slate-800 dark:text-white">{val}</span>
                    {lbl === (t('votes')) && settings?.activeVotingPromotion && (
                      <span className="inline-flex items-center rounded-full bg-amber-50 px-1.5 py-0.5 text-[9px] font-black text-amber-700 border border-amber-200/60 animate-pulse">
                        x{settings.activeVotingPromotion.multiplier}
                      </span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
 
        </div>
      </section>

      {/* ─── MAIN BODY SECTION ─── */}
      <section className="max-w-[1180px] mx-auto px-4 py-5 grid gap-6 lg:grid-cols-[minmax(0,1fr)_340px]">
        
        {/* Left Column - Details */}
        <div className="space-y-8">
          
          {/* 1. Hồ sơ Thí sinh */}
          <div className="bg-white rounded-[16px] border border-slate-300 p-5 sm:p-6 shadow-sm transition-all duration-300 hover:shadow-[0_10px_30px_rgba(0,0,0,0.04)] hover:border-slate-400/80">
            <h2 className="text-2xl font-bold text-slate-900 dark:text-white flex items-center gap-2 border-b border-slate-200 dark:border-slate-700 pb-3">
              <span className="flex items-center justify-center w-8 h-8 rounded-xl bg-gradient-to-br from-[#0A2FFF]/10 to-[#79BCC2]/10 border border-[#0A2FFF]/20 text-[#0A2FFF] dark:text-[#79BCC2]">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2.2" viewBox="0 0 24 24">
                  <path d="M15.75 6a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0zM4.501 20.118a7.5 7.5 0 0114.998 0A17.933 17.933 0 0112 21.75c-2.676 0-5.216-.584-7.499-1.632z" />
                </svg>
              </span>
              {language === 'en' ? 'Candidate profile' : 'Thông tin thí sinh'}
            </h2>
            
            <div className="mt-4 grid gap-x-6 gap-y-3 sm:grid-cols-2 text-base">
              {[
                { label: language === 'en' ? 'Full Name' : 'Họ và tên', value: candidate.name, icon: <svg className="w-4 h-4 stroke-slate-500 fill-none mt-0.5" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg> },
                { label: t('sbd'), value: `${candidate.sbd}`, icon: <svg className="w-4 h-4 stroke-slate-500 fill-none mt-0.5" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24"><rect x="3" y="3" width="18" height="18" rx="2" ry="2"/><line x1="3" y1="9" x2="21" y2="9"/><line x1="9" y1="21" x2="9" y2="9"/></svg> },
                { label: language === 'en' ? 'Faculty & Class' : 'Khoa / Lớp', value: candidate.faculty ? `${candidate.faculty}${candidate.className ? ` (Lớp ${candidate.className})` : ''}` : (candidate.representativeSchool || undefined), icon: <svg className="w-4 h-4 stroke-slate-500 fill-none mt-0.5" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24"><path d="m3 9 9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/></svg>, fullWidth: true },
                { label: language === 'en' ? 'Category' : 'Hạng mục dự thi', value: localizeTable(candidate.contestTable, language) || candidate.contestTableLabel, icon: <svg className="w-4 h-4 stroke-slate-500 fill-none mt-0.5" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24"><path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/></svg> },
                { label: language === 'en' ? 'Current Round' : 'Vòng thi hiện tại', value: localizeRound(candidate.currentRound, language), icon: <svg className="w-4 h-4 stroke-slate-500 fill-none mt-0.5" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 14 14"/></svg> },
                { label: language === 'en' ? 'Height & Weight' : 'Chiều cao & Cân nặng', value: (candidate.heightCm || candidate.weightKg) ? `${candidate.heightCm || '-'} cm · ${candidate.weightKg || '-'} kg` : (candidate.height ? `${candidate.height} cm` : undefined), icon: <svg className="w-4 h-4 stroke-slate-500 fill-none mt-0.5" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24"><path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"/></svg> },
                { label: language === 'en' ? '3-Size Measurements' : 'Số đo 3 vòng', value: (candidate.measurementBust && candidate.measurementWaist && candidate.measurementHip) ? `${candidate.measurementBust} - ${candidate.measurementWaist} - ${candidate.measurementHip} cm` : (candidate.measurements || undefined), icon: <svg className="w-4 h-4 stroke-slate-500 fill-none mt-0.5" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24"><circle cx="12" cy="12" r="10"/></svg> },
                { label: language === 'en' ? 'Talent / Focus' : 'Năng khiếu / Định hướng', value: candidate.talent || candidate.sector, icon: <svg className="w-4 h-4 stroke-slate-500 fill-none mt-0.5" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24"><path d="M9 18V5l12-2v13"/><circle cx="6" cy="18" r="3"/><circle cx="18" cy="16" r="3"/></svg>, fullWidth: true },
                { label: language === 'en' ? 'Audition Video' : 'Video Clip sơ khảo', value: candidate.videoUrl, isLink: true, icon: <svg className="w-4 h-4 stroke-slate-500 fill-none mt-0.5" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24"><polygon points="5 3 19 12 5 21 5 3"/></svg>, fullWidth: true },
              ].map((item: any, idx) => {
                if (!item.value) return null;
                return (
                  <div key={idx} className={`flex items-center gap-2.5 p-1 rounded-lg hover:bg-slate-50 transition-colors ${item.fullWidth ? 'sm:col-span-2' : 'sm:col-span-1'}`}>
                    <span className="shrink-0 text-slate-500">{item.icon}</span>
                    <div className="flex flex-wrap items-baseline gap-x-1.5">
                      <span className="text-[15px] font-bold text-slate-500">{item.label}:</span>
                      {item.isLink ? (
                        <a href={String(item.value)} target="_blank" rel="noreferrer" className="text-[15px] font-bold text-blue-600 underline hover:text-blue-800 break-all">
                          {String(item.value)}
                        </a>
                      ) : (
                        <span className="text-[15px] font-bold text-slate-800 leading-tight">{item.value}</span>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* 2. Thuyết minh thí sinh */}
          <div className="bg-white rounded-[16px] border border-slate-300 p-6 sm:p-8 shadow-sm transition-all duration-300 hover:shadow-[0_10px_30px_rgba(0,0,0,0.04)] hover:border-slate-400/80">
            <h2 className="text-2xl font-bold text-slate-900 flex items-center gap-2 border-b border-slate-300 pb-4">
              <span className="flex items-center justify-center w-9 h-9 rounded-xl bg-slate-50 border border-slate-300 text-slate-700">
                <svg className="w-5 h-5 stroke-slate-700 fill-none" strokeWidth="2.2" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m0 12.75h7.5m-7.5 3H12M10.5 2.25H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z" />
                </svg>
              </span>
              {language === 'en' ? 'Project Proposal & Showcase' : 'Thuyết minh dự án & Thí sinh'}
            </h2>

            {/* Stylized Candidate Executive Summary Quote Box */}
            <div className="mt-6 p-5 rounded-2xl bg-slate-50 border-l-4 border-[#2563EB] text-slate-700 text-[16px] leading-relaxed italic font-medium">
              <span className="font-extrabold not-italic text-slate-800 uppercase text-xs tracking-wider block mb-1.5">
                {language === 'en' ? 'Executive Summary:' : 'Tóm tắt cốt lõi thí sinh:'}
              </span>
              "{localizedText(language, candidate.description, (candidate as any).descriptionEn)}"
            </div>

            <div className="mt-6 text-lg leading-relaxed text-slate-600 whitespace-pre-line font-medium">
              {readableBiography}
            </div>

            {/* Custom Startup Feature Cards */}
            <div className="mt-8 grid gap-4 sm:grid-cols-2">
              {highlights.map((h, index) => (
                <div key={index} className={`p-4 rounded-xl flex flex-col gap-1 transition-all duration-200 hover:-translate-y-0.5 ${h.color}`}>
                  <p className="text-base font-black tracking-tight">{h.title}</p>
                  <p className="text-[14px] opacity-90 leading-normal font-medium">{h.desc}</p>
                </div>
              ))}
            </div>
          </div>

          {/* 3. Hỗ trợ & Kỳ vọng */}
          <div className="grid gap-6 md:grid-cols-2">
            <div className="bg-white rounded-[16px] border border-slate-300 p-6 sm:p-8 shadow-sm transition-all duration-300 hover:shadow-[0_10px_30px_rgba(0,0,0,0.04)] hover:border-slate-400/80">
              <h3 className="text-lg font-bold text-slate-900 flex items-center gap-2 border-b border-slate-300 pb-3">
                <span className="flex items-center justify-center w-8 h-8 rounded-lg bg-slate-50 border border-slate-300 text-slate-700">
                  <svg className="w-4 h-4 stroke-slate-700 fill-none" strokeWidth="2.2" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M18 18.72a9.094 9.094 0 003.741-.479 3 3 0 00-4.682-2.72m.94 3.198l.001.031c0 .225-.012.447-.037.666A11.944 11.944 0 0112 21c-2.17 0-4.207-.576-5.963-1.584A6.062 6.062 0 016 18.719m12 0a5.971 5.971 0 00-.941-3.197m0 0A5.995 5.995 0 0012 12.75a5.995 5.995 0 00-5.058 2.772m0 0a3 3 0 00-4.681 2.72 8.986 8.986 0 003.74.477m.94-3.197a5.971 5.971 0 00-.94 3.197M15 6.75a3 3 0 11-6 0 3 3 0 016 0zm6 3a2.25 2.25 0 11-4.5 0 2.25 2.25 0 014.5 0zm-13.5 0a2.25 2.25 0 11-4.5 0 2.25 2.25 0 014.5 0z" />
                  </svg>
                </span>
                {t('supportNeeds')}
              </h3>
              <p className="mt-3 text-base leading-relaxed text-slate-600 whitespace-pre-line font-medium">
                {candidate.supportNeeds || (language === 'en' ? 'Mentorship, seed capital, and commercial partnership connections.' : 'Chưa cập nhật nhu cầu hỗ trợ.')}
              </p>
            </div>
            
            <div className="bg-white rounded-[16px] border border-slate-300 p-6 sm:p-8 shadow-sm transition-all duration-300 hover:shadow-[0_10px_30px_rgba(0,0,0,0.04)] hover:border-slate-400/80">
              <h3 className="text-lg font-bold text-slate-900 flex items-center gap-2 border-b border-slate-300 pb-3">
                <span className="flex items-center justify-center w-8 h-8 rounded-lg bg-slate-50 border border-slate-300 text-slate-700">
                  <svg className="w-4 h-4 stroke-slate-700 fill-none" strokeWidth="2.2" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M11.48 3.499c-.107-.218-.284-.41-.504-.51a1.2 1.2 0 00-1.393.267l-6 6a1.2 1.2 0 00-.267 1.393c.101.22.293.397.512.505l6 3a1.2 1.2 0 001.392-.267l6-6a1.2 1.2 0 00.267-1.393l-6-3zM21.75 6.75v10.5a2.25 2.25 0 01-2.25 2.25h-15a2.25 2.25 0 01-2.25-2.25V6.75m19.5 0A2.25 2.25 0 0019.5 4.5h-15a2.25 2.25 0 00-2.25 2.25" />
                  </svg>
                </span>
                {t('expectations')}
              </h3>
              <p className="mt-3 text-base leading-relaxed text-slate-600 whitespace-pre-line font-medium">
                {candidate.expectations || (language === 'en' ? 'Bring positive impact to the community and inspire youth entrepreneurship.' : 'Chưa cập nhật kỳ vọng.')}
              </p>
            </div>
          </div>
        </div>

        {/* Right Column - Sticky Sidebar */}
        <aside className="space-y-6 lg:sticky lg:top-20 lg:self-start">
          
          {/* Voting Card */}
          <div className="bg-white rounded-[16px] border border-slate-300 p-6 shadow-sm flex flex-col transition-all duration-300 hover:shadow-[0_10px_30px_rgba(0,0,0,0.04)] hover:border-slate-400/80">
            <span className="text-xs font-black uppercase tracking-wider text-slate-400">
              {language === 'en' ? 'HUIT ICONIC VOTING GATE' : 'Cổng bình chọn HUIT ICONIC'}
            </span>
            <h2 className="mt-1 text-xl font-extrabold text-slate-900 tracking-tight">
              {language === 'en' ? 'Vote For Candidate' : 'Bình chọn cho thí sinh'}
            </h2>
            
            <div className="mt-4 rounded-xl bg-slate-50 p-4 border border-slate-300 text-left">
              <p className="text-[15px] font-extrabold text-slate-800">
                {language === 'en' ? 'Each vote adds 1 score to the candidate.' : 'Mỗi lần bình chọn cộng 1 lượt cho thí sinh.'}
              </p>
              <p className="mt-2 text-[14px] leading-relaxed text-slate-500 font-medium">
                {language === 'en'
                  ? 'Each account receives 2 free votes per day across all candidates. Daily votes reset every midnight.'
                  : 'Mỗi tài khoản có 2 lượt miễn phí mỗi ngày cho toàn bộ thí sinh. Dùng hết 2 lượt thì không thể vote cho thí sinh khác cho đến ngày hôm sau.'}
              </p>
            </div>
            
            <button
              onClick={handleVote}
              disabled={!isGateOpen}
              className={`mt-4 w-full h-11 rounded-xl text-base font-extrabold transition-all duration-300 flex items-center justify-center gap-2 group relative overflow-hidden ${
                isGateOpen
                  ? 'bg-[#2563EB] hover:bg-[#1D4ED8] text-white shadow-sm hover:scale-[1.02] active:scale-95 hover:shadow-[0_4px_12px_rgba(37,99,235,0.25)]'
                  : 'bg-slate-200 text-slate-500 cursor-not-allowed'
              }`}
            >
              {isGateOpen ? (
                <>
                  <svg className="w-4 h-4 fill-white transition-transform duration-300 group-hover:scale-125 group-hover:animate-pulse" viewBox="0 0 24 24">
                    <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"/>
                  </svg>
                  {t('voteNow')}
                </>
              ) : t('votingGateClosed')}
            </button>

            {/* Poster download & share buttons */}
            <div className="mt-3 flex flex-col gap-2">
              <button 
                type="button"
                disabled={isGeneratingPoster}
                onClick={handleDownloadPoster} 
                className="w-full h-11 rounded-xl bg-gradient-to-r from-[#0A2FFF] to-[#79BCC2] text-sm font-extrabold text-white shadow-md hover:brightness-110 active:scale-95 transition-all duration-200 flex items-center justify-center gap-2 disabled:opacity-50"
              >
                {isGeneratingPoster ? (
                  <>
                    <svg className="animate-spin h-4 w-4 text-white" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                    </svg>
                    {language === 'en' ? 'Generating HD Poster...' : 'Đang tạo Poster HD...'}
                  </>
                ) : (
                  <>
                    <svg className="w-4 h-4 fill-none stroke-current" strokeWidth="2.2" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5M16.5 12L12 16.5m0 0L7.5 12m4.5 4.5V3" />
                    </svg>
                    {language === 'en' ? 'Download Voting Poster (QR)' : 'Tải Poster Kêu Gọi Vote (QR)'}
                  </>
                )}
              </button>

              <button 
                type="button"
                onClick={copyLink} 
                className="w-full h-10 rounded-xl border border-slate-300 bg-white text-xs font-extrabold text-slate-700 hover:bg-slate-50 active:scale-95 transition-all duration-200 flex items-center justify-center gap-1.5"
              >
                <svg className="w-3.5 h-3.5 fill-none stroke-current" strokeWidth="2" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M13.19 8.688a4.5 4.5 0 011.242 7.244l-4.5 4.5a4.5 4.5 0 01-6.364-6.364l1.757-1.757m13.35-.622l1.757-1.757a4.5 4.5 0 00-6.364-6.364l-4.5 4.5a4.5 4.5 0 001.242 7.244" />
                </svg>
                {t('copyLink')}
              </button>
            </div>
            
            {!currentUser && (
              <Link 
                href={`/dang-nhap?redirect=/thi-sinh/${candidate.sbd}`} 
                className="mt-4 text-center text-xs font-extrabold text-[#0A2FFF] hover:underline block"
              >
                {language === 'en' ? 'Sign in now to get 2 free daily votes' : 'Đăng nhập ngay để nhận lượt bình chọn miễn phí'}
              </Link>
            )}
          </div>

          {settings && !settings.hidePublicVoteHistory && (
            <div className="bg-white rounded-[16px] border border-slate-300 p-6 shadow-sm transition-all duration-300 hover:shadow-[0_10px_30px_rgba(0,0,0,0.04)] hover:border-slate-400/80">
              <h3 className="text-sm font-black uppercase tracking-wider text-slate-400 flex items-center justify-between">
                <span>Lịch sử bình chọn</span>
                <span className="animate-pulse flex h-2 w-2 rounded-full bg-emerald-500" />
              </h3>

              <div className="mt-4 divide-y divide-slate-100 max-h-[300px] overflow-y-auto pr-1">
                {recentVotes.length === 0 ? (
                  <p className="text-xs text-slate-400 text-center py-8 font-semibold">Chưa có lượt bình chọn nào.</p>
                ) : (
                  recentVotes.slice(0, 5).map((v, idx) => (
                    <div key={v.id || idx} className="flex items-center justify-between py-2.5 first:pt-0 last:pb-0">
                      <div className="flex flex-col gap-0.5">
                        <span className="text-[13px] font-extrabold text-slate-800 truncate max-w-[170px]">{v.voterName}</span>
                      </div>
                      <div className="text-right flex flex-col items-end gap-0.5 shrink-0">
                        <span className="text-[11px] text-slate-500 font-medium">
                          {(() => {
                            const d = new Date(v.voteTime);
                            const pad = (n: number) => String(n).padStart(2, '0');
                            const utc7 = new Date(d.getTime() + 7 * 60 * 60 * 1000);
                            return `${pad(utc7.getUTCHours())}:${pad(utc7.getUTCMinutes())} - ${pad(utc7.getUTCDate())}/${pad(utc7.getUTCMonth() + 1)}`;
                          })()}
                        </span>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          )}

          {/* Social share widget */}
          <div className="bg-white rounded-[16px] border border-slate-300 p-6 shadow-sm transition-all duration-300 hover:shadow-[0_10px_30px_rgba(0,0,0,0.04)] hover:border-slate-400/80">
            <h3 className="text-sm font-black uppercase tracking-wider text-slate-400">Chia sẻ thí sinh</h3>
            
            <div className="mt-4 flex items-center justify-start gap-4">
              <a 
                href={`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(typeof window !== 'undefined' ? window.location.href : '')}`}
                target="_blank" 
                rel="noopener noreferrer" 
                className="flex flex-col items-center gap-1 group"
              >
                <div className="w-10 h-10 rounded-full bg-slate-100 flex items-center justify-center transition-all duration-200 group-hover:scale-105 group-hover:bg-blue-50">
                  <img src="/images/facebook.png" alt="Facebook" className="w-5 h-5 object-contain" />
                </div>
                <span className="text-[11px] font-bold text-slate-500">Facebook</span>
              </a>
              
              <a 
                href={`https://zalo.me/4418938306145458374`}
                target="_blank" 
                rel="noopener noreferrer"
                className="flex flex-col items-center gap-1 group"
              >
                <div className="w-10 h-10 rounded-full bg-slate-100 flex items-center justify-center transition-all duration-200 group-hover:scale-105 group-hover:bg-blue-50">
                  <img src="/images/zalo.png" alt="Zalo" className="w-5 h-5 object-contain" />
                </div>
                <span className="text-[11px] font-bold text-slate-500">Zalo</span>
              </a>

              <button 
                onClick={copyLink}
                className="flex flex-col items-center gap-1 group"
              >
                <div className="w-10 h-10 rounded-full bg-slate-100 flex items-center justify-center transition-all duration-200 group-hover:scale-105 group-hover:bg-blue-50">
                  <svg className="w-4 h-4 text-slate-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M13.19 8.688a4.5 4.5 0 011.242 7.244l-4.5 4.5a4.5 4.5 0 01-6.364-6.364l1.757-1.757m13.35-.622l1.757-1.757a4.5 4.5 0 00-6.364-6.364l-4.5 4.5a4.5 4.5 0 001.242 7.244" />
                  </svg>
                </div>
                <span className="text-[11px] font-bold text-slate-500">Copy link</span>
              </button>
            </div>

            {/* Dynamic Local QR Code generator with decorative scanner bounds focus frame */}
            <div className="mt-6 pt-5 border-t border-slate-100 flex items-center gap-4">
              <div className="border-2 border-dashed border-slate-300 rounded-2xl p-2 bg-white shrink-0 relative group shadow-sm">
                <div className="absolute top-1 left-1 w-2.5 h-2.5 border-t-2 border-l-2 border-slate-400 rounded-tl"></div>
                <div className="absolute top-1 right-1 w-2.5 h-2.5 border-t-2 border-r-2 border-slate-400 rounded-tr"></div>
                <div className="absolute bottom-1 left-1 w-2.5 h-2.5 border-b-2 border-l-2 border-slate-400 rounded-bl"></div>
                <div className="absolute bottom-1 right-1 w-2.5 h-2.5 border-b-2 border-r-2 border-slate-400 rounded-br"></div>
                <img src={qrCodeUrl} alt="QR Code Link to Candidate" className="w-[84px] h-[84px] rounded-lg" />
              </div>
              <div>
                <p className="text-[14px] font-extrabold text-slate-800">Quét QR để bình chọn</p>
                <p className="mt-1 text-xs leading-relaxed text-slate-500 font-medium">Mở camera trên điện thoại, quét mã QR để bình chọn nhanh trên thiết bị di động.</p>
              </div>
            </div>

          </div>

        </aside>
      </section>

      {/* ─── FULL-WIDTH GALLERY SECTION ─── */}
      {allImages.length > 0 && (
        <section className="max-w-[1300px] mx-auto px-4 py-6">
          <div className="bg-white rounded-[16px] border border-slate-300 p-6 sm:p-8 shadow-sm transition-all duration-300 hover:shadow-[0_10px_30px_rgba(0,0,0,0.04)] hover:border-slate-400/80">
            <h2 className="text-2xl font-bold text-slate-900 flex items-center gap-2 border-b border-slate-300 pb-4">
              <span className="flex items-center justify-center w-9 h-9 rounded-xl bg-slate-50 border border-slate-300 text-slate-700">
                <svg className="w-5 h-5 stroke-slate-700 fill-none" strokeWidth="2.2" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 15.75l5.159-5.159a2.25 2.25 0 013.182 0l5.159 5.159m-1.5-1.5l1.409-1.409a2.25 2.25 0 013.182 0l2.909 2.909m-18 3.75h16.5a1.5 1.5 0 001.5-1.5V6a1.5 1.5 0 00-1.5-1.5H3.75A1.5 1.5 0 002.25 6v12a1.5 1.5 0 001.5 1.5zm10.5-11.25h.008v.008h-.008V8.25zm.375 0a.375 3.375 0 11-.75 0 .375 3.375 0 01.75 0z" />
                </svg>
              </span>
              Hình ảnh thí sinh
            </h2>
            
            <div className="mt-6 grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
              {allImages.map((imgUrl, idx) => (
                <button
                  key={idx}
                  type="button"
                  onClick={() => handleOpenLightbox(imgUrl)}
                  className="overflow-hidden rounded-2xl cursor-zoom-in relative group transition-all duration-300 active:scale-[0.98] aspect-square"
                >
                  <img 
                    src={imgUrl} 
                    alt={`${candidate.name} gallery image ${idx + 1}`} 
                    className="h-full w-full object-cover rounded-2xl transition-transform duration-500 group-hover:scale-105" 
                  />
                  <div className="absolute inset-0 rounded-2xl bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center">
                    <svg viewBox="0 0 24 24" className="h-6 w-6 text-white drop-shadow" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                      <circle cx="11" cy="11" r="8" />
                      <line x1="21" y1="21" x2="16.65" y2="16.65" />
                      <line x1="11" y1="8" x2="11" y2="14" />
                      <line x1="8" y1="11" x2="14" y2="11" />
                    </svg>
                  </div>
                </button>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* ─── CANDIDATE DYNAMIC NAVIGATION BAR ─── */}
      {prevAndNext.prev && prevAndNext.next && (
        <section className="max-w-[1300px] mx-auto px-4 py-4 mb-12">
          <div className="bg-white rounded-[16px] border border-slate-300 p-4 sm:p-5 shadow-sm transition-all duration-300 hover:shadow-[0_10px_30px_rgba(0,0,0,0.04)] hover:border-slate-400/80 flex items-center justify-between gap-4">
            
            {/* Prev Candidate Link */}
            <Link 
              href={`/thi-sinh/${prevAndNext.prev.sbd}`}
              className="flex items-center gap-3 text-left group max-w-[45%]"
            >
              <span className="flex items-center justify-center w-9 h-9 rounded-xl border border-slate-300 bg-slate-50 text-slate-700 transition-colors group-hover:bg-[#2563EB] group-hover:border-[#2563EB] group-hover:text-white shrink-0">
                <svg viewBox="0 0 24 24" className="h-4.5 w-4.5" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <polyline points="15 18 9 12 15 6" />
                </svg>
              </span>
              <div className="hidden sm:block">
                <p className="text-xs font-bold text-slate-400 uppercase tracking-wide">Thí sinh trước</p>
                <p className="text-[14px] font-bold text-slate-800 group-hover:text-[#2563EB] transition-colors truncate max-w-[180px] md:max-w-[280px]">
                  {prevAndNext.prev.name}
                </p>
              </div>
            </Link>

            {/* Middle return button */}
            <Link 
              href="/"
              className="text-xs font-black uppercase tracking-wider text-slate-500 hover:text-[#2563EB] transition-colors border border-slate-300 rounded-xl px-4 py-2.5 bg-slate-50 hover:bg-white active:scale-95 shadow-sm"
            >
              Tất cả thí sinh
            </Link>

            {/* Next Candidate Link */}
            <Link 
              href={`/thi-sinh/${prevAndNext.next.sbd}`}
              className="flex items-center gap-3 text-right group max-w-[45%] flex-row-reverse"
            >
              <span className="flex items-center justify-center w-9 h-9 rounded-xl border border-slate-300 bg-slate-50 text-slate-700 transition-colors group-hover:bg-[#2563EB] group-hover:border-[#2563EB] group-hover:text-white shrink-0">
                <svg viewBox="0 0 24 24" className="h-4.5 w-4.5" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <polyline points="9 18 15 12 9 6" />
                </svg>
              </span>
              <div className="hidden sm:block">
                <p className="text-xs font-bold text-slate-400 uppercase tracking-wide">Thí sinh tiếp theo</p>
                <p className="text-[14px] font-bold text-slate-800 group-hover:text-[#2563EB] transition-colors truncate max-w-[180px] md:max-w-[280px]">
                  {prevAndNext.next.name}
                </p>
              </div>
            </Link>

          </div>
        </section>
      )}

      {/* ─── LIGHTBOX PORTAL VIEW ─── */}
      {isLightboxOpen && (
        <div 
          ref={lightboxRef}
          role="dialog"
          aria-modal="true"
          aria-label={`Bộ sưu tập ảnh thí sinh ${candidate.name}`}
          className="fixed inset-0 z-[1200] flex flex-col items-center justify-center bg-black/90 transition-opacity duration-300 animate-in fade-in"
          onClick={() => setIsLightboxOpen(false)}
        >
          {/* Close button */}
          <button 
            ref={lightboxCloseRef}
            type="button"
            onClick={() => setIsLightboxOpen(false)}
            className="absolute top-4 right-4 z-50 grid h-10 w-10 place-items-center rounded-full bg-white/10 hover:bg-white/20 text-white transition duration-200 focus:outline-none focus:ring-2 focus:ring-white active:scale-95"
            title="Đóng (ESC)"
            aria-label="Đóng bộ sưu tập ảnh"
          >
            <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <line x1="18" y1="6" x2="6" y2="18" />
              <line x1="6" y1="6" x2="18" y2="18" />
            </svg>
          </button>

          {/* Left Arrow */}
          {allImages.length > 1 && (
            <button 
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                handlePrevImage();
              }}
              className="absolute left-4 z-50 grid h-10 w-10 place-items-center rounded-full bg-white/10 hover:bg-white/20 text-white transition duration-200 focus:outline-none focus:ring-2 focus:ring-white active:scale-95"
              title="Ảnh trước (Mũi tên trái)"
              aria-label="Xem ảnh trước"
            >
              <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                <polyline points="15 18 9 12 15 6" />
              </svg>
            </button>
          )}

          {/* Large Image */}
          <div 
            className="relative flex items-center justify-center max-w-[90vw] max-h-[80vh] p-2"
            onClick={(e) => e.stopPropagation()}
          >
            <img 
              src={allImages[lightboxIndex]} 
              alt={`${candidate.name} - Ảnh ${lightboxIndex + 1}`} 
              className="max-w-full max-h-[80vh] object-contain rounded-lg shadow-2xl select-none animate-in zoom-in-95 duration-200" 
            />
          </div>

          {/* Right Arrow */}
          {allImages.length > 1 && (
            <button 
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                handleNextImage();
              }}
              className="absolute right-4 z-50 grid h-10 w-10 place-items-center rounded-full bg-white/10 hover:bg-white/20 text-white transition duration-200 focus:outline-none focus:ring-2 focus:ring-white active:scale-95"
              title="Ảnh tiếp theo (Mũi tên phải)"
              aria-label="Xem ảnh tiếp theo"
            >
              <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                <polyline points="9 18 15 12 9 6" />
              </svg>
            </button>
          )}

          {/* Caption index */}
          <div className="absolute bottom-6 left-1/2 -translate-x-1/2 px-4 py-2 bg-black/60 backdrop-blur-sm rounded-full text-center border border-white/10">
            <p className="text-xs font-bold text-white/90">
              Hình ảnh {lightboxIndex + 1} / {allImages.length}
            </p>
          </div>
        </div>
      )}

      {/* ─── VOTE SUBMIT MODAL ─── */}
      {isVoteModalOpen && (
        <VoteModal
          candidate={candidate}
          onClose={() => setIsVoteModalOpen(false)}
          onSuccess={(updatedCandidate) => {
            setCandidate(updatedCandidate);
          }}
        />
      )}
    </main>
  );
}
