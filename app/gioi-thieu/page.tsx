'use client';

import React, { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { apiUrl } from '../api';
import { useLanguage } from '../../src/i18n/use-language';
import { translate } from '../../src/i18n';
import { localizedText } from '../../src/i18n/content';

function useInView(threshold = 0.05) {
  const ref = useRef<HTMLDivElement>(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    if (typeof window === 'undefined' || !window.IntersectionObserver) {
      setVisible(true);
      return;
    }

    const observer = new IntersectionObserver(([entry]) => {
      if (entry.isIntersecting) {
        setVisible(true);
        observer.disconnect();
      }
    }, { threshold });

    const currentRef = ref.current;
    if (currentRef) {
      observer.observe(currentRef);
    }

    return () => {
      observer.disconnect();
    };
  }, [threshold]);

  return { ref, visible };
}

// Check if string contains HTML tags
function hasHtml(value?: string | null) {
  return !!value && /<[a-z][\s\S]*>/i.test(value);
}

// Clean HTML content for security
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

// Extract content lines for rendering
function extractTextLines(value?: string | null) {
  if (!value) return [];
  if (!hasHtml(value)) return value.split('\n').map((line) => line.trim()).filter(Boolean);

  if (typeof window === 'undefined') {
    return value
      .replace(/<\/(p|div|li|h[1-6])>/gi, '\n')
      .replace(/<br\s*\/?>/gi, '\n')
      .replace(/<[^>]+>/g, '')
      .split('\n')
      .map((line) => line.trim())
      .filter(Boolean);
  }

  const wrapper = document.createElement('div');
  wrapper.innerHTML = sanitizeRichHtml(value);
  const blocks = Array.from(wrapper.querySelectorAll('li, p, div, h1, h2, h3, h4, h5, h6'))
    .map((node) => node.textContent?.trim() || '')
    .filter(Boolean);
  return blocks.length ? blocks : [wrapper.textContent?.trim() || ''].filter(Boolean);
}

function RichContent({ value, fallback = '', className }: { value?: string | null; fallback?: string; className: string }) {
  const content = value || fallback;
  if (!content) return null;
  if (hasHtml(content)) {
    return <div className={className} dangerouslySetInnerHTML={{ __html: sanitizeRichHtml(content) }} />;
  }
  return <div className={`${className} whitespace-pre-line`}>{content}</div>;
}

function PrizeStructureDisplay({ prizeText, language }: { prizeText?: string | null; language: string }) {
  if (!prizeText) return null;

  if (hasHtml(prizeText)) {
    return (
      <RichContent
        value={prizeText}
        fallback=""
        className="about-prize-copy rich-content text-[14px] sm:text-[15px] text-[color:var(--about-text-secondary)] leading-[1.7] font-normal text-left"
      />
    );
  }

  const lines = prizeText.split('\n').map(l => l.trim()).filter(Boolean);
  if (lines.length === 0) return null;

  return (
    <div className="space-y-3 flex-1 flex flex-col justify-start">
      {lines.map((line, idx) => {
        const colonIdx = line.indexOf(':');
        let title = colonIdx !== -1 ? line.slice(0, colonIdx).trim() : '';
        let rest = colonIdx !== -1 ? line.slice(colonIdx + 1).trim() : line;

        let categories: string[] = [];
        const parenMatch = title.match(/\((.*?)\)/);
        if (parenMatch && parenMatch[1].includes(',')) {
          categories = parenMatch[1].split(',').map(c => c.trim()).filter(Boolean);
          title = title.replace(/\(.*?\)/, '').trim();
        }

        let value = '';
        let perks = rest;
        const plusIdx = rest.indexOf('+');
        if (plusIdx !== -1) {
          value = rest.slice(0, plusIdx).trim();
          perks = rest.slice(plusIdx + 1).trim();
        }

        const isChampion = /quán quân|champion/i.test(title);
        const isRunnerUp = /á quân|runner/i.test(title);

        let icon = '🏆';
        let badgeStyle = 'bg-rose-500/10 text-rose-600 dark:text-rose-400 border-rose-500/25';
        let borderHover = 'hover:border-rose-500/40';

        if (isChampion) {
          icon = '👑';
          badgeStyle = 'bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/30';
          borderHover = 'hover:border-amber-500/40';
        } else if (isRunnerUp) {
          icon = '🥈';
          badgeStyle = 'bg-sky-500/10 text-sky-600 dark:text-sky-400 border-sky-500/30';
          borderHover = 'hover:border-sky-500/40';
        }

        return (
          <div
            key={idx}
            className={`flex flex-col gap-2 bg-[color:var(--about-surface-sec)]/30 hover:bg-[color:var(--about-surface-sec)]/75 border border-[color:var(--about-border)] ${borderHover} rounded-xl p-3.5 transition-all duration-300 shadow-sm`}
          >
            <div className="flex flex-wrap items-center justify-between gap-2">
              <div className="flex items-center gap-2">
                <span className="text-base shrink-0">{icon}</span>
                <h5 className="text-[14px] sm:text-[15px] font-bold text-[color:var(--about-text-primary)]">
                  {title || line}
                </h5>
              </div>
              {value && (
                <span className={`text-[12px] sm:text-[13px] font-black px-2.5 py-0.5 rounded-md border ${badgeStyle} whitespace-nowrap`}>
                  {value}
                </span>
              )}
            </div>

            {categories.length > 0 && (
              <div className="flex flex-wrap gap-1.5 pt-0.5">
                {categories.map((cat, cIdx) => (
                  <span
                    key={cIdx}
                    className="text-[10.5px] font-semibold px-2 py-0.5 rounded-md bg-[color:var(--about-surface)] border border-[color:var(--about-border)] text-[color:var(--about-text-secondary)]"
                  >
                    {cat}
                  </span>
                ))}
              </div>
            )}

            {perks && (
              <p className="text-[12.5px] sm:text-[13px] leading-relaxed text-[color:var(--about-text-secondary)] font-normal pt-1.5 border-t border-[color:var(--about-border)]/50">
                <span className="font-semibold text-[color:var(--about-text-primary)]">
                  {language === 'en' ? 'Includes:' : 'Bao gồm:'}{' '}
                </span>
                {perks}
              </p>
            )}
          </div>
        );
      })}
    </div>
  );
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

export default function GioiThieuPage() {
  const language = useLanguage();
  const t = (key: Parameters<typeof translate>[1]) => translate(language, key);
  const registerUrl = 'https://zalo.me/g/myzijputivfgc1toua9z';

  const [settings, setSettings] = useState<any>(null);
  const [timelineEvents, setTimelineEvents] = useState<any[]>([]);
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  useEffect(() => {
    async function loadData() {
      try {
        const [settingsRes, timelineRes] = await Promise.all([
          fetch(apiUrl('/api/settings')),
          fetch(apiUrl('/api/timeline'))
        ]);
        if (settingsRes.ok) {
          const settingsData = await settingsRes.json();
          setSettings(settingsData);
        }
        if (timelineRes.ok) {
          const timelineData = await timelineRes.json();
          setTimelineEvents(timelineData);
        }
      } catch (err) {
        console.error('Failed to load data for Giới thiệu page', err);
      }
    }
    loadData();
  }, []);

  // Intersection observer triggers for smooth animations
  const titleSection = useInView(0.05);
  const gridSection = useInView(0.05);
  const theLeSection = useInView(0.05);
  const timelineSection = useInView(0.05);

  const getTimelineIcon = (index: number) => {
    if (index === 0) {
      return (
        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="text-[#79BCC2]">
          <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path>
          <polyline points="14 2 14 8 20 8"></polyline>
          <line x1="16" y1="13" x2="8" y2="13"></line>
          <line x1="16" y1="17" x2="8" y2="17"></line>
          <polyline points="10 9 9 9 8 9"></polyline>
        </svg>
      );
    }
    if (index === 1) {
      return (
        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="text-[#79BCC2]">
          <circle cx="12" cy="12" r="10"></circle>
          <polyline points="12 6 12 12 16 14"></polyline>
        </svg>
      );
    }
    return (
      <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="text-[#79BCC2]">
        <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"></path>
      </svg>
    );
  };

  const displayTimeline = timelineEvents && timelineEvents.length > 0
    ? timelineEvents.filter((e: any) => e.isActive).map((event: any, idx: number) => ({
        phase: localizedText(language, event.title, event.titleEn),
        date: event.date,
        desc: localizedText(language, event.description, event.descriptionEn),
        icon: getTimelineIcon(idx % 3)
      }))
    : [];

  const rawSectors = localizedText(language, settings?.aboutSectors, settings?.aboutSectorsEn);
  const sectors = rawSectors ? extractTextLines(rawSectors) : [];

  const rawBenefits = localizedText(language, settings?.aboutBenefits, settings?.aboutBenefitsEn);
  const benefits = rawBenefits ? extractTextLines(rawBenefits) : [];

  const prize = localizedText(language, settings?.aboutPrize, settings?.aboutPrizeEn) || "";

  const rawParticipants = localizedText(language, settings?.aboutParticipants, settings?.aboutParticipantsEn);
  const parsedParticipants = rawParticipants
    ? extractTextLines(rawParticipants).map((line: string) => {
        const colonIndex = line.indexOf(':');
        if (colonIndex !== -1) {
          return [line.substring(0, colonIndex).trim(), line.substring(colonIndex + 1).trim()];
        }
        return [language === 'en' ? 'Target Group' : 'Đối tượng', line.trim()];
      })
    : [];

  const statsYear = settings?.statsYear || '2026';
  const stats = [
    [settings?.statsCandidates || '40.000+', language === 'en' ? 'Enrolled Students' : 'Quy mô sinh viên HUIT'],
    [settings?.statsVotes || '1.000.000+', language === 'en' ? 'Online Public Votes' : 'Lượt bình chọn trực tuyến'],
    [settings?.statsParticipants || '50 Top', language === 'en' ? 'Top Finalists' : 'Thí sinh Top xuất sắc'],
    [settings?.statsViews || '10 triệu+', language === 'en' ? 'Social Media Reach' : 'Lượt tiếp cận truyền thông'],
    [settings?.statsMedia || '30+', language === 'en' ? 'Media Partners' : 'Đơn vị báo chí, truyền thông'],
    [settings?.statsSchools || '16+ Khoa', language === 'en' ? 'HUIT Academic Faculties' : 'Khoa / Viện đào tạo HUIT'],
  ].filter(([number]) => !!number);

  const registrationDeadline = settings?.registrationDeadline
    ? parseVN(settings.registrationDeadline)
    : null;
  const isDeadlinePassed = registrationDeadline
    ? registrationDeadline.getTime() < Date.now()
    : false;
  const isManuallyClosed = settings?.isRegistrationOpen === false;
  const registrationOpen: boolean | null = settings
    ? (!isManuallyClosed && !isDeadlinePassed)
    : null;
  const registrationHref = '/dang-ky';

  const quickLinks = [
    { href: '#tong-quan', label: language === 'en' ? 'Overview' : 'Tổng quan & Thư ngỏ', icon: '01' },
    { href: '#tieu-chuan', label: language === 'en' ? 'Eligibility' : 'Tiêu chuẩn dự thi', icon: '02' },
    { href: '#quyen-loi', label: language === 'en' ? 'Tracks & Prizes' : 'Vòng thi & Giải thưởng', icon: '03' },
    { href: '#timeline-section', label: language === 'en' ? 'Timeline' : 'Lộ trình', icon: '04' },
    { href: '#tai-tro', label: language === 'en' ? 'Sponsors' : 'Gói tài trợ', icon: '05' },
    { href: '#quy-mo', label: language === 'en' ? 'Scale' : 'Quy mô', icon: '06' },
    { href: '#lien-he', label: language === 'en' ? 'Contact' : 'Liên hệ', icon: '07' },
  ];

  return (
    <>
      {/* FAQ JSON-LD Schema for AEO (Answer Engine Optimization) */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify({
          '@context': 'https://schema.org',
          '@type': 'FAQPage',
          mainEntity: [
            {
              '@type': 'Question',
              name: "HUIT's ICONIC 2026 là gì?",
              acceptedAnswer: {
                '@type': 'Answer',
                text: "HUIT's ICONIC 2026 là cuộc thi tìm kiếm Đại sứ Truyền thông HUIT, nơi tôn vinh vẻ đẹp, trí tuệ, sự thanh lịch và bản lĩnh của sinh viên.",
              },
            },
            {
              '@type': 'Question',
              name: "Ai có thể tham gia cuộc thi HUIT's ICONIC 2026?",
              acceptedAnswer: {
                '@type': 'Answer',
                text: 'Cuộc thi mở cho tất cả sinh viên đang theo học tại Trường Đại học Công Thương TP.HCM (HUIT), có chiều cao Nữ từ 1m60 và Nam từ 1m70 trở lên.',
              },
            },
            {
              '@type': 'Question',
              name: "Làm thế nào để bình chọn cho thí sinh tại HUIT's ICONIC 2026?",
              acceptedAnswer: {
                '@type': 'Answer',
                text: "Truy cập website HUIT's ICONIC 2026, tìm thí sinh yêu thích tại Bảng xếp hạng hoặc Trang chủ, đăng nhập và nhấn Bình chọn. Mỗi tài khoản có 2 lượt bình chọn miễn phí mỗi ngày.",
              },
            },
            {
              '@type': 'Question',
              name: "Giải thưởng của cuộc thi HUIT's ICONIC 2026 là gì?",
              acceptedAnswer: {
                '@type': 'Answer',
                text: '02 Quán quân 10.000.000 VNĐ/giải, 02 Á quân 5.000.000 VNĐ/giải cùng 07 giải phụ xuất sắc, cúp, sash, vương miện và quà tặng từ các Nhà tài trợ đồng hành.',
              },
            },
            {
              '@type': 'Question',
              name: "Cuộc thi HUIT's ICONIC 2026 diễn ra khi nào?",
              acceptedAnswer: {
                '@type': 'Answer',
                text: "Cuộc thi HUIT's ICONIC 2026 diễn ra từ tháng 09/2026 đến đêm Gala Chung kết ngày 26/12/2026.",
              },
            },
          ],
        })}}
      />
      <style suppressHydrationWarning>{`
        :root {
          --about-primary: #0A2FFF;
          --about-primary-hover: #0826CC;
          --about-accent: #377F89;
          --about-bg: #F6F8FC;
          --about-surface: rgba(255, 255, 255, 0.8);
          --about-surface-sec: #EEF3FA;
          --about-text-primary: #111827;
          --about-text-secondary: #4B5563;
          --about-border: rgba(220, 227, 237, 0.8);
          --about-warning: #B7791F;
          --about-prize: #C0265E;
          --about-shadow: 0 10px 30px rgba(10, 47, 255, 0.04);
        }
        :root[data-theme='dark'] {
          --about-primary: #5B7CFF;
          --about-primary-hover: #7892FF;
          --about-accent: #79BCC2;
          --about-bg: #070B16;
          --about-surface: rgba(17, 24, 39, 0.7);
          --about-surface-sec: #182235;
          --about-text-primary: #F8FAFC;
          --about-text-secondary: #B8C2D1;
          --about-border: rgba(42, 58, 82, 0.7);
          --about-warning: #F6C453;
          --about-prize: #FB7185;
          --about-shadow: 0 10px 40px rgba(0, 0, 0, 0.3);
        }

        .iUzfqH {
          background-image: url(/background/background2.png);
          background-color: var(--about-bg);
          background-attachment: fixed;
          background-size: cover;
          background-repeat: no-repeat;
          background-position: center;
        }
        :root[data-theme='light'] .iUzfqH {
          background-image: none;
          background-color: var(--about-bg);
        }
        .hfAPBN {
          width: 100%;
          max-width: 1240px;
          margin-left: auto;
          margin-right: auto;
          padding-left: 24px;
          padding-right: 24px;
        }
        @media (max-width: 640px) {
          .hfAPBN {
            padding-left: 16px;
            padding-right: 16px;
          }
        }

        .about-page-premium {
          position: relative;
          overflow: clip;
          background:
            radial-gradient(circle at 8% 8%, rgba(10,47,255,.09), transparent 26%),
            radial-gradient(circle at 92% 30%, rgba(55,127,137,.09), transparent 24%),
            var(--about-bg) !important;
          color: var(--about-text-primary);
        }
        :root[data-theme='dark'] .about-page-premium {
          background:
            linear-gradient(rgba(7,11,22,.88), rgba(7,11,22,.94)),
            radial-gradient(circle at 12% 12%, rgba(91,124,255,.19), transparent 30%),
            url(/background/background2.png) center / cover fixed !important;
        }
        .about-ambient {
          position: absolute;
          width: 420px;
          height: 420px;
          border-radius: 999px;
          filter: blur(90px);
          opacity: .18;
          pointer-events: none;
        }
        .about-ambient-one { top: 120px; left: -240px; background: var(--about-primary); }
        .about-ambient-two { top: 720px; right: -260px; background: var(--about-accent); }

        .about-eyebrow {
          display: inline-flex;
          align-items: center;
          gap: 9px;
          padding: 0 !important;
          border: none !important;
          background: transparent !important;
          color: var(--about-primary);
          font-size: 13px !important;
          font-weight: 800;
          letter-spacing: .12em;
          text-transform: uppercase;
        }
        @media (min-width: 640px) {
          .about-eyebrow {
            font-size: 15px !important;
          }
        }
        .about-hero-facts {
          display: flex;
          justify-content: center;
          flex-wrap: wrap;
          gap: 10px;
          margin-top: 10px !important;
        }
        .about-hero-facts span {
          padding: 7px 12px;
          border-radius: 10px;
          color: var(--about-text-secondary);
          font-size: 12px;
          background: color-mix(in srgb, var(--about-surface) 84%, transparent);
          border: 1px solid var(--about-border);
        }
        .about-hero-facts b { color: var(--about-text-primary); font-size: 14px; }

        .about-registration-card {
          border: 1px solid transparent;
          background:
            linear-gradient(var(--about-surface), var(--about-surface)) padding-box,
            linear-gradient(120deg, color-mix(in srgb, var(--about-primary) 55%, transparent), color-mix(in srgb, var(--about-accent) 35%, transparent)) border-box;
          box-shadow: 0 18px 50px rgba(10,47,255,.09);
          backdrop-filter: blur(16px);
        }
        .about-registration-card p { font-size: 15px; line-height: 1.65; }
        .about-status-pill {
          display: inline-flex;
          align-items: center;
          gap: 9px;
          padding: 7px 12px;
          border-radius: 999px;
          font-size: 12px;
          font-weight: 800;
        }
        .about-status-pill > span {
          width: 7px;
          height: 7px;
          border-radius: 999px;
          background: currentColor;
          box-shadow: 0 0 0 5px color-mix(in srgb, currentColor 12%, transparent);
        }
        .about-status-pill.open { color: #047857; background: rgba(16,185,129,.10); border: 1px solid rgba(16,185,129,.24); }
        .about-status-pill.closed { color: #dc2626; background: rgba(239,68,68,.10); border: 1px solid rgba(239,68,68,.24); }
        .about-status-pill.paused { color: #d97706; background: rgba(245,158,11,.10); border: 1px solid rgba(245,158,11,.24); }
        .about-status-pill.pending { color: var(--about-primary); background: color-mix(in srgb, var(--about-primary) 9%, transparent); border: 1px solid color-mix(in srgb, var(--about-primary) 22%, transparent); }

        .about-primary-action {
          min-height: 52px;
          display: inline-flex;
          align-items: center;
          justify-content: center;
          gap: 10px;
          padding: 0 30px;
          border-radius: 999px;
          background: linear-gradient(135deg, var(--about-primary), var(--about-accent));
          color: #fff !important;
          font-size: 14px;
          font-weight: 800;
          letter-spacing: .06em;
          text-transform: uppercase;
          box-shadow: 0 12px 28px color-mix(in srgb, var(--about-primary) 28%, transparent);
          transition: transform .25s ease, box-shadow .25s ease, filter .25s ease;
        }
        .about-primary-action:hover { transform: translateY(-3px); filter: saturate(1.08); box-shadow: 0 16px 36px color-mix(in srgb, var(--about-primary) 36%, transparent); }
        .about-primary-action:focus-visible { outline: 3px solid color-mix(in srgb, var(--about-primary) 28%, transparent); outline-offset: 4px; }

        .about-quick-nav {
          position: sticky;
          top: 84px;
          z-index: 30;
          display: flex;
          align-items: center;
          gap: 6px;
          width: 100%;
          max-width: 1060px;
          padding: 6px 10px;
          margin-left: auto;
          margin-right: auto;
          border: 1px solid var(--about-border);
          border-radius: 999px;
          background: color-mix(in srgb, var(--about-surface) 92%, transparent);
          box-shadow: 0 10px 30px rgba(15,23,42,.08);
          backdrop-filter: blur(20px);
          overflow-x: auto;
          scrollbar-width: none;
          -ms-overflow-style: none;
          -webkit-overflow-scrolling: touch;
        }
        .about-quick-nav::-webkit-scrollbar {
          display: none;
        }
        .about-quick-nav a {
          position: relative;
          min-height: 38px;
          display: inline-flex;
          align-items: center;
          gap: 8px;
          padding: 0 14px;
          border-radius: 999px;
          color: var(--about-text-secondary);
          font-size: 12px;
          font-weight: 700;
          white-space: nowrap;
          flex-shrink: 0;
          transition: all 0.2s ease;
        }
        .about-quick-nav a:hover {
          background: color-mix(in srgb, var(--about-primary) 10%, var(--about-surface));
          color: var(--about-primary);
          transform: translateY(-1px);
        }
        .about-nav-num {
          display: inline-flex;
          align-items: center;
          justify-content: center;
          width: 22px;
          height: 22px;
          border-radius: 999px;
          background: color-mix(in srgb, var(--about-primary) 14%, transparent);
          color: var(--about-primary);
          font-size: 10px;
          font-weight: 900;
          flex-shrink: 0;
        }
        .about-nav-label {
          font-size: 12px;
          font-weight: 700;
          white-space: nowrap;
        }

        .about-section-anchor { scroll-margin-top: 132px; }
        .about-section-title { letter-spacing: -.025em; }
        .about-section-title::after {
          content: '';
          display: block;
          width: 48px;
          height: 3px;
          margin: 13px auto 0;
          border-radius: 999px;
          background: linear-gradient(90deg, var(--about-primary), var(--about-accent));
        }

        .about-card,
        .about-timeline-shell {
          border: 1px solid var(--about-border);
          border-radius: 24px;
          background: var(--about-surface);
          box-shadow: var(--about-shadow);
          backdrop-filter: blur(12px);
          transition: transform .3s cubic-bezier(.16,1,.3,1), border-color .3s ease, box-shadow .3s ease;
        }
        .about-card:hover { transform: translateY(-4px); border-color: color-mix(in srgb, var(--about-accent) 34%, var(--about-border)); box-shadow: 0 18px 46px rgba(10,47,255,.09); }
        .about-card-feature { background: linear-gradient(145deg, color-mix(in srgb, var(--about-surface) 95%, transparent), color-mix(in srgb, var(--about-primary) 4%, var(--about-surface))); }
        .about-card-warning { border-top: 3px solid var(--about-warning); }
        .about-card-accent { border-top: 3px solid var(--about-accent); }
        .about-card-prize { border-top: 3px solid var(--about-prize); }
        .about-prize-summary { min-height: 92px; display: flex; flex-direction: column; justify-content: center; }
        .about-prize-copy { flex: 1; padding: 16px 18px; border: 1px solid var(--about-border); border-radius: 16px; background: color-mix(in srgb, var(--about-surface-sec) 30%, transparent); }
        .about-prize-copy p { margin: 0 0 10px; }
        .about-prize-copy p:last-child { margin-bottom: 0; }
        .about-prize-value {
          background: linear-gradient(100deg, #be123c, #db2777, #0e7490);
          -webkit-background-clip: text;
          background-clip: text;
          color: transparent;
        }
        :root[data-theme='dark'] .about-prize-value { background-image: linear-gradient(100deg, #fda4af, #f9a8d4, #67e8f9); }

        .about-stat-card .space-y-3 {
          display: grid;
          grid-template-columns: repeat(3, minmax(0, 1fr));
          gap: 12px;
        }
        .about-stat-card .space-y-3 > * { margin-top: 0 !important; }
        .about-stat-item {
          min-height: 112px;
          display: flex;
          flex-direction: column;
          justify-content: center;
          gap: 8px;
          padding: 16px;
          border: 1px solid var(--about-border);
          border-radius: 16px;
          background: linear-gradient(145deg, color-mix(in srgb, var(--about-surface-sec) 64%, transparent), color-mix(in srgb, var(--about-primary) 3%, transparent));
          transition: transform .25s ease, border-color .25s ease, box-shadow .25s ease;
        }
        .about-stat-item:hover { transform: translateY(-3px); border-color: color-mix(in srgb, var(--about-primary) 28%, var(--about-border)); box-shadow: 0 12px 26px rgba(10,47,255,.08); }
        .about-stat-item > span:first-child { color: var(--about-primary); font-size: 28px; line-height: 1.15; font-weight: 900; letter-spacing: -.02em; }
        .about-stat-item > span:last-child { font-size: 13px; line-height: 1.45; }

        .about-timeline-item { padding: 12px 16px 14px; border-radius: 16px; transition: background .25s ease, transform .25s ease; }
        .about-timeline-item:hover { background: color-mix(in srgb, var(--about-primary) 4%, transparent); transform: translateX(3px); }
        .about-timeline-heading { display: flex; align-items: center; flex-wrap: wrap; gap: 8px 12px; margin-bottom: 6px; }
        .about-timeline-date { font-size: 13px; line-height: 1.35; font-weight: 800; color: var(--about-primary); background: color-mix(in srgb, var(--about-primary) 10%, transparent); border: 1px solid color-mix(in srgb, var(--about-primary) 20%, transparent); padding: 5px 9px; border-radius: 8px; }
        .about-timeline-phase { font-size: 19px; line-height: 1.35; font-weight: 800; color: var(--about-text-primary); }
        .about-timeline-description { max-width: 920px; color: var(--about-text-secondary); font-size: 16px; line-height: 1.7; }
        @media (max-width: 900px) { .about-stat-card .space-y-3 { grid-template-columns: repeat(2, minmax(0, 1fr)); } .about-timeline-phase { font-size: 18px; } }
        @media (max-width: 640px) {
          .about-primary-action { min-height: 50px; padding: 0 24px; }
          .about-quick-nav { position: static; width: 100%; overflow-x: auto; justify-content: flex-start; border-radius: 16px; }
          .about-quick-nav a { flex: 0 0 auto; padding: 0 11px; }
          .about-stat-card .space-y-3 { gap: 8px; }
          .about-stat-item { min-height: 96px; padding: 13px; }
          .about-stat-item > span:first-child { font-size: 24px; }
          .about-stat-item > span:last-child { font-size: 12px; }
          .about-timeline-item { padding: 10px 10px 12px; }
          .about-timeline-phase { font-size: 17px; }
          .about-timeline-description { font-size: 15px; line-height: 1.65; }
        }

        .animate-on-scroll {
          opacity: 0;
          transform: translateY(20px);
          transition: opacity 0.4s cubic-bezier(0.16, 1, 0.3, 1), transform 0.4s cubic-bezier(0.16, 1, 0.3, 1);
        }
        .animate-on-scroll.visible {
          opacity: 1;
          transform: translateY(0);
        }
        
        .about-focusable:focus-visible {
          outline: 2px solid var(--about-primary) !important;
          outline-offset: 3px !important;
        }
      `}</style>

      <main className="iUzfqH about-page-premium flex-1 pb-16 mt-[-80px] pt-[80px]">
        <div className="about-ambient about-ambient-one" aria-hidden="true" />
        <div className="about-ambient about-ambient-two" aria-hidden="true" />
        <div className="hfAPBN relative z-[1]">
          <div className="mt-4 sm:mt-8 flex flex-col items-center">
            
            {/* Title Block */}
            <div
              ref={titleSection.ref} 
              className={`about-hero flex flex-col items-center text-center mb-5 sm:mb-7 ${isMounted ? 'animate-on-scroll' : ''} ${isMounted && titleSection.visible ? 'visible' : ''}`}
            >
              <div className="about-eyebrow mb-3">
                {localizedText(language, settings?.aboutTitle || "HUIT'S ICONIC 2026 - ĐẠI SỨ TRUYỀN THÔNG HUIT", settings?.aboutTitleEn)}
              </div>
              <h1 
                className="relative font-black tracking-[-0.03em]"
                style={{
                  fontSize: 'clamp(24px, 3.5vw, 36px)',
                  lineHeight: '1.2',
                  marginTop: '12px',
                  marginBottom: '12px',
                  maxWidth: '960px',
                  fontWeight: 900,
                  color: 'var(--about-text-primary)'
                }}
              >
                {localizedText(language, settings?.aboutSubtitle || "Cuộc thi Tìm kiếm Đại sứ Truyền thông Trường Đại học Công Thương TP.HCM", settings?.aboutSubtitleEn)}
              </h1>
              <div className="about-hero-facts mt-3" aria-label="Thông tin nổi bật">
                <span><b>40.000+</b> {language === 'en' ? 'HUIT Students' : 'Sinh viên HUIT'}</span>
                <span><b>Top 50</b> {language === 'en' ? 'Excellent Finalists' : 'Thí sinh xuất sắc'}</span>
                <span><b>2026</b> {language === 'en' ? 'New Season' : 'Mùa giải mới'}</span>
              </div>
            </div>

            {/* CTA đăng ký đầu trang */}
            <div
              className={`about-registration-card w-full max-w-[920px] mb-4 p-5 sm:p-6 rounded-[24px] flex flex-col sm:flex-row items-center justify-between gap-5 ${isMounted ? 'animate-on-scroll' : ''} ${isMounted && titleSection.visible ? 'visible' : ''}`}
              suppressHydrationWarning
            >
              <div className="text-center sm:text-left">
                <span className={`about-status-pill ${!isMounted || registrationOpen === null ? 'pending' : registrationOpen ? 'open' : isDeadlinePassed ? 'closed' : 'paused'}`}>
                  <span aria-hidden="true" />
                  {!isMounted || registrationOpen === null
                    ? 'Đang đồng bộ trạng thái'
                    : registrationOpen
                    ? 'Đang nhận hồ sơ đăng ký'
                    : isDeadlinePassed
                    ? 'Đã kết thúc nhận hồ sơ'
                    : 'Tạm đóng nhận hồ sơ'}
                </span>
                <p className="mt-3 text-[14px] sm:text-[15px] text-[color:var(--about-text-secondary)]">
                  {!isMounted || registrationOpen === null ? (
                    'Thông tin thời hạn đang được cập nhật từ hệ thống.'
                  ) : registrationDeadline ? (
                    <>
                      {registrationOpen
                        ? 'Hạn chót nhận hồ sơ'
                        : isDeadlinePassed
                        ? 'Thời hạn nhận hồ sơ đã kết thúc lúc'
                        : 'Cổng đăng ký tạm đóng (Hạn nộp dự kiến)'}
                      : <b className="text-[color:var(--about-text-primary)]">{formatDateTime(settings.registrationDeadline)}</b>
                    </>
                  ) : (
                    "Vui lòng theo dõi lịch trình chi tiết của các vòng thi bên dưới."
                  )}
                </p>
              </div>
              <div className="flex gap-3 w-full sm:w-auto shrink-0">
                <Link
                  href="/dang-ky"
                  className="about-primary-action w-full sm:w-auto about-focusable"
                >
                  {language === 'en' ? 'Register now' : 'Đăng ký dự thi ngay'} <span aria-hidden="true">→</span>
                </Link>
              </div>
            </div>

            <nav className="about-quick-nav mb-10" aria-label="Điều hướng nhanh trang giới thiệu">
              {quickLinks.map((item) => (
                <a key={item.href} href={item.href} className="about-focusable">
                  <span className="about-nav-num">{item.icon}</span>
                  <span className="about-nav-label">{item.label}</span>
                </a>
              ))}
            </nav>

            {/* Section 1: Tổng quan & Ban tổ chức */}
            <section id="tong-quan" ref={gridSection.ref} className="about-section-anchor w-full max-w-[1200px] flex flex-col gap-8 mb-14 sm:mb-16">
              {/* Card Tổng quan */}
              <div>
                <h2 className="about-section-title text-[24px] sm:text-[32px] font-bold text-center text-[color:var(--about-text-primary)] mb-7">
                  {language === 'en' ? 'Competition Overview' : 'Tổng quan cuộc thi'}
                </h2>
                <div className={`about-card about-card-feature w-full p-6 sm:p-9 relative overflow-hidden group ${isMounted ? 'animate-on-scroll' : ''} ${isMounted && gridSection.visible ? 'visible' : ''}`}>
                  <div className="absolute -top-8 -right-8 w-24 h-24 bg-[color:var(--about-accent)]/10 rounded-full blur-xl group-hover:bg-[color:var(--about-accent)]/20 transition-all duration-500 pointer-events-none" />

                  <div className="w-full">
                    <RichContent
                      value={localizedText(language, settings?.aboutDescription, settings?.aboutDescriptionEn)}
                      className="rich-content text-[17px] sm:text-[19px] text-[color:var(--about-text-primary)] leading-[1.9] font-normal text-justify"
                    />
                  </div>
                </div>

                {/* Thư ngỏ từ Đơn vị chỉ đạo & Nhà trường */}
                <div className="mt-7 about-card p-6 sm:p-8 bg-gradient-to-br from-[#0A2FFF]/5 via-[color:var(--about-surface)] to-[#79BCC2]/5 border-l-4 border-l-[#0A2FFF]">
                  <div className="flex items-center gap-3 mb-4">
                    <span className="text-2xl">📜</span>
                    <div>
                      <span className="text-xs font-black uppercase tracking-widest text-[#0A2FFF]">Đơn vị chỉ đạo & sản xuất</span>
                      <h3 className="text-lg sm:text-xl font-black text-[color:var(--about-text-primary)]">
                        {language === 'en' ? 'Letter from University Leadership & Organizing Board' : 'Thư ngỏ từ Trường Đại học Công Thương TP.HCM (HUIT)'}
                      </h3>
                    </div>
                  </div>
                  <div className="space-y-3.5 text-sm sm:text-base text-[color:var(--about-text-secondary)] leading-relaxed text-justify">
                    <p>
                      Trường Đại học Công Thương TP. Hồ Chí Minh (HUIT) là cơ sở giáo dục đại học công lập trực thuộc Bộ Công Thương, với bề dày hơn 40 năm xây dựng và phát triển. Nhà trường kiên định triết lý giáo dục: <b className="text-[color:var(--about-text-primary)]">“Học tập chủ động, làm việc sáng tạo, sống có trách nhiệm”</b>, quy mô đào tạo trên 40.000 sinh viên tại các bậc đại học và sau đại học.
                    </p>
                    <p>
                      Cuộc thi <b className="text-[color:var(--about-text-primary)]">HUIT’S ICONIC 2026</b> được tổ chức nhằm tôn vinh nét đẹp trí tuệ, tài năng, bản lĩnh và phong cách của sinh viên HUIT; tìm kiếm gương mặt Đại sứ Truyền thông đại diện cho hình ảnh thanh niên năng động, sáng tạo và sẵn sàng hội nhập. Đồng thời, đây là cầu nối hợp tác chiến lược giữa Nhà trường, sinh viên và Quý Doanh nghiệp, mang hình ảnh thương hiệu đồng hành tiếp cận sâu rộng đến thế hệ trẻ.
                    </p>
                  </div>
                </div>
              </div>
            </section>

            {/* Section: Tiêu chuẩn dự thi */}
            <section id="tieu-chuan" className="about-section-anchor w-full max-w-[1200px] mb-14 sm:mb-16">
              <h2 className="about-section-title text-[24px] sm:text-[32px] font-bold text-center text-[color:var(--about-text-primary)] mb-9">
                {language === 'en' ? 'Candidate Eligibility Criteria' : 'Tiêu chuẩn & Điều kiện dự thi'}
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {[
                  {
                    icon: '🎓',
                    title: language === 'en' ? 'Enrolled HUIT Students' : 'Đối tượng dự thi',
                    desc: language === 'en'
                      ? 'Currently enrolled full-time students at Ho Chi Minh City University of Industry and Trade (HUIT).'
                      : 'Toàn thể sinh viên hệ chính quy đang theo học tại Trường Đại học Công Thương TP.HCM (HUIT) tại thời điểm đăng ký dự thi.'
                  },
                  {
                    icon: '📏',
                    title: language === 'en' ? 'Official Height Standard' : 'Tiêu chuẩn chiều cao 2026',
                    desc: language === 'en'
                      ? 'Female: From 1m60 and above. Male: From 1m70 and above. Balanced physique.'
                      : 'Nữ: Chiều cao từ 1m60 trở lên.\nNam: Chiều cao từ 1m70 trở lên.\nChỉ số hình thể cân đối và phong thái tự tin.'
                  },
                  {
                    icon: '✨',
                    title: language === 'en' ? 'Poise & Confidence' : 'Ngoại hình & Thần thái',
                    desc: language === 'en'
                      ? 'Pleasant facial features, radiant smile, good posture, and confident camera presence.'
                      : 'Gương mặt khả ái/sáng sân khấu, nụ cười rạng rỡ, thần thái tự tin trước ống kính và có khả năng thu hút công chúng.'
                  },
                  {
                    icon: '🩺',
                    title: language === 'en' ? 'Health & Stamina' : 'Sức khỏe & Thể lực',
                    desc: language === 'en'
                      ? 'Good physical and mental stamina to participate actively throughout all training camps and stages.'
                      : 'Có sức khỏe thể chất và tinh thần tốt, bền bỉ để tham gia xuyên suốt các vòng thi, chuỗi workshop đào tạo và hoạt động thực tế.'
                  },
                  {
                    icon: '🛡️',
                    title: language === 'en' ? 'Ethics & Responsibility' : 'Phẩm chất đạo đức',
                    desc: language === 'en'
                      ? 'Exemplary personal conduct, healthy lifestyle, no criminal records or disciplinary measures.'
                      : 'Có đạo đức tốt, lối sống văn minh lành mạnh, không vi phạm pháp luật và không chịu bất kỳ hình thức kỷ luật nào.'
                  },
                  {
                    icon: '🌟',
                    title: language === 'en' ? 'Talent & Privileges' : 'Kỹ năng & Đặc quyền đào tạo',
                    desc: language === 'en'
                      ? 'Exclusive training in runway catwalk, public speaking, interview mastery, and brand ambassador presence.'
                      : 'Được huấn luyện chuyên sâu catwalk, phong thái sân khấu, kỹ năng ứng xử truyền thông và cơ hội trở thành gương mặt đại diện HUIT.'
                  },
                ].map((item, idx) => (
                  <div key={idx} className="about-card p-6 flex flex-col justify-between">
                    <div>
                      <div className="text-3xl mb-3">{item.icon}</div>
                      <h3 className="text-lg font-black text-[color:var(--about-text-primary)] mb-2">{item.title}</h3>
                      <p className="text-sm text-[color:var(--about-text-secondary)] leading-relaxed whitespace-pre-line">{item.desc}</p>
                    </div>
                  </div>
                ))}
              </div>
            </section>

            {/* Section 2: Lĩnh vực, Quyền lợi, Giải thưởng */}
            <section
              id="quyen-loi"
              ref={theLeSection.ref}
              className="about-section-anchor w-full max-w-[1200px] mb-14 sm:mb-16"
            >
              <h2 className="about-section-title text-[24px] sm:text-[32px] font-bold text-center text-[color:var(--about-text-primary)] mb-9">
                {language === 'en' ? 'Tracks & Privileges' : 'Nội dung thi & Quyền lợi thí sinh'}
              </h2>
              <div className={`grid grid-cols-1 lg:grid-cols-3 gap-8 ${isMounted ? 'animate-on-scroll' : ''} ${isMounted && theLeSection.visible ? 'visible' : ''}`}>
                
                {/* Lĩnh vực dự thi */}
                <div className="about-card about-card-warning p-6 sm:p-8 flex flex-col space-y-6 relative overflow-hidden group">
                  <div className="flex items-center space-x-3 pb-4 border-b border-[color:var(--about-border)]">
                    <div className="p-2.5 bg-amber-500/10 rounded-xl text-[color:var(--about-warning)] border border-amber-500/20">
                      <svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                        <polygon points="12 2 2 7 12 12 22 7 12 2"></polygon>
                        <polyline points="2 17 12 22 22 17"></polyline>
                        <polyline points="2 12 12 17 22 12"></polyline>
                      </svg>
                    </div>
                    <h3 className="text-[20px] sm:text-[22px] font-bold text-[color:var(--about-text-primary)] uppercase tracking-wide">
                      {language === 'en' ? 'Competition Tracks' : 'Thử thách các vòng'}
                    </h3>
                  </div>
                  
                  <div className="space-y-3 flex-1 flex flex-col justify-start">
                    {sectors.map((sector: string, idx: number) => {
                      const numberLabel = String(idx + 1).padStart(2, '0');
                      return (
                        <div 
                          key={idx} 
                          className="flex items-center gap-3 bg-[color:var(--about-surface-sec)]/30 hover:bg-[color:var(--about-surface-sec)]/75 border border-[color:var(--about-border)] rounded-xl p-3.5 transition-all duration-300"
                        >
                          <span className="text-[12px] font-bold text-[color:var(--about-warning)] bg-amber-500/10 border border-amber-500/20 px-2 py-0.5 rounded-md shrink-0">
                            {numberLabel}
                          </span>
                          <p className="text-[15px] sm:text-[16px] text-[color:var(--about-text-primary)] leading-[1.7] font-normal text-left">
                            {sector}
                          </p>
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* Quyền lợi khi tham gia */}
                <div className="about-card about-card-accent p-6 sm:p-8 flex flex-col space-y-6 relative overflow-hidden group">
                  <div className="flex items-center space-x-3 pb-4 border-b border-[color:var(--about-border)]">
                    <div className="p-2.5 bg-[color:color-mix(in_srgb,_var(--about-accent)_10%,_transparent)] rounded-xl text-[color:var(--about-accent)] border border-[color:color-mix(in_srgb,_var(--about-accent)_20%,_transparent)]">
                      <svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                        <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"></polygon>
                      </svg>
                    </div>
                    <h3 className="text-[20px] sm:text-[22px] font-bold text-[color:var(--about-text-primary)] uppercase tracking-wide">
                      {language === 'en' ? 'Candidate Benefits' : 'Quyền lợi thí sinh'}
                    </h3>
                  </div>
                  
                  <div className="space-y-3 flex-1 flex flex-col justify-start">
                    {benefits.map((benefit: string, idx: number) => (
                      <div 
                        key={idx} 
                        className="flex items-center gap-3 bg-[color:var(--about-surface-sec)]/30 hover:bg-[color:var(--about-surface-sec)]/75 border border-[color:var(--about-border)] rounded-xl p-3.5 transition-all duration-300"
                      >
                        <div className="p-1 bg-[color:color-mix(in_srgb,_var(--about-accent)_10%,_transparent)] rounded-full border border-[color:color-mix(in_srgb,_var(--about-accent)_20%,_transparent)] text-[color:var(--about-accent)] shrink-0">
                          <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                            <polyline points="20 6 9 17 4 12"></polyline>
                          </svg>
                        </div>
                        <p className="text-[15px] sm:text-[16px] leading-[1.65] text-[color:var(--about-text-primary)] font-medium text-left">
                          {benefit}
                        </p>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Giải thưởng */}
                <div className="about-card about-card-prize p-6 sm:p-8 flex flex-col space-y-6 relative overflow-hidden group">
                  <div className="flex items-center space-x-3 pb-4 border-b border-[color:var(--about-border)]">
                    <div className="p-2.5 bg-rose-500/10 rounded-xl text-[color:var(--about-prize)] border border-rose-500/20">
                      <svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M6 9H4.5a2.5 2.5 0 0 1 0-5H6"></path>
                        <path d="M18 9h1.5a2.5 2.5 0 0 0 0-5H18"></path>
                        <path d="M4 22h16"></path>
                        <path d="M10 14.66V17c0 .55-.45 1-1 1H4v2h16v-2h-5c-.55 0-1-.45-1-1v-2.34"></path>
                        <path d="M12 2a6 6 0 0 1 6 6v5a6 6 0 0 1-6 6 6 6 0 0 1-6-6V8a6 6 0 0 1 6-6z"></path>
                      </svg>
                    </div>
                    <h3 className="text-[20px] sm:text-[22px] font-bold text-[color:var(--about-text-primary)] uppercase tracking-wide">
                      {language === 'en' ? 'Prizes & Awards' : 'Cơ cấu giải thưởng'}
                    </h3>
                  </div>
                  
                  <div className="flex-1 flex flex-col justify-start space-y-4">
                    <div className="about-prize-summary bg-gradient-to-br from-rose-500/15 via-[#79BCC2]/5 to-transparent border border-rose-500/20 rounded-2xl p-4 text-center shadow-lg relative overflow-hidden">
                      <p className="text-[12px] sm:text-[13px] font-black uppercase tracking-[0.2em] text-[color:var(--about-prize)]">
                        {language === 'en' ? 'Prize Structure' : 'Giải thưởng chính thức'}
                      </p>
                      <h4 className="about-prize-value text-[24px] sm:text-[28px] font-black mt-1.5 leading-normal py-1.5">
                        {language === 'en' ? '02 Champions + 02 Runners-up' : '02 Quán quân & 02 Á quân'}
                      </h4>
                    </div>

                    <PrizeStructureDisplay prizeText={prize} language={language} />
                  </div>
                </div>

              </div>
            </section>

            {/* Section 3: Timeline Section */}
            <section
              id="timeline-section"
              ref={timelineSection.ref}
              className={`about-section-anchor about-timeline-shell w-full max-w-[1200px] mb-14 sm:mb-16 p-5 sm:p-8 flex flex-col space-y-6 ${isMounted ? 'animate-on-scroll' : ''} ${isMounted && timelineSection.visible ? 'visible' : ''}`}
            >
              <h2 className="about-section-title text-[24px] sm:text-[32px] font-bold text-center text-[color:var(--about-text-primary)]">
                {language === 'en' ? 'Official Timeline & Roadmap' : 'Lộ trình thực hiện'}
              </h2>

              <div className="relative border-l border-[color:var(--about-border)] ml-4 sm:ml-8 pl-4 sm:pl-8 space-y-4 sm:space-y-5">
                {displayTimeline.map((event: any, idx: number) => (
                  <div 
                    key={idx} 
                    className="about-timeline-item relative group transition-all duration-300"
                  >
                    <div className="absolute -left-[35px] sm:-left-[51px] top-1 w-6 h-6 rounded-full bg-[color:var(--about-surface)] border-2 border-[color:var(--about-primary)] flex items-center justify-center shadow-md group-hover:scale-125 transition-transform duration-300">
                      <div className="w-2 h-2 rounded-full bg-[color:var(--about-primary)]" />
                    </div>
                    
                    <div className="about-timeline-heading">
                      <span className="about-timeline-date">
                        {event.date}
                      </span>
                      <h4 className="about-timeline-phase">
                        {event.phase}
                      </h4>
                    </div>
                    
                    <p className="about-timeline-description text-left">
                      {event.desc}
                    </p>
                  </div>
                ))}
              </div>
            </section>

            {/* Section: Gói tài trợ & Quyền lợi Doanh nghiệp */}
            <section id="tai-tro" className="about-section-anchor w-full max-w-[1200px] mb-14 sm:mb-16">
              <h2 className="about-section-title text-[24px] sm:text-[32px] font-bold text-center text-[color:var(--about-text-primary)] mb-3">
                {language === 'en' ? 'Sponsorship Opportunities' : 'Cơ hội Đồng hành & Gói tài trợ Doanh nghiệp'}
              </h2>
              <p className="text-center text-sm sm:text-base text-[color:var(--about-text-secondary)] max-w-2xl mx-auto mb-9">
                {language === 'en'
                  ? 'Partner with HUIT’s ICONIC 2026 to connect directly with 40,000+ dynamic students and elevate your brand presence across multimedia channels.'
                  : 'Đồng hành cùng HUIT’s ICONIC 2026 để lan tỏa thương hiệu trực tiếp tới hơn 40.000 sinh viên năng động và khẳng định uy tín doanh nghiệp.'}
              </p>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {[
                  {
                    tier: 'KIM CƯƠNG',
                    border: 'border-cyan-400/60',
                    badge: 'bg-cyan-500/10 text-cyan-600 dark:text-cyan-400 border-cyan-400/30',
                    amount: '50.000.000 VNĐ',
                    highlight: 'Đồng hành vị trí danh dự cao nhất',
                    benefits: [
                      'Logo vị trí Kim Cương trên toàn bộ backdrop, photobooth, banner sân khấu',
                      'Đại diện tham gia Ban giám khảo hoặc trao giải Gala Chung kết',
                      '04 bài PR chuyên sâu trên Fanpage & Website cuộc thi',
                      'Gian hàng trưng bày & giới thiệu sản phẩm tại ngày hội lớn HUIT',
                      'Phát video TVC doanh nghiệp trong đêm Gala Chung kết',
                      'Nhận hoa, kỷ niệm chương tri ân từ Ban Giám hiệu HUIT'
                    ]
                  },
                  {
                    tier: 'VÀNG',
                    border: 'border-amber-400/60',
                    badge: 'bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-400/30',
                    amount: '30.000.000 VNĐ',
                    highlight: 'Quyền lợi truyền thông đa kênh',
                    benefits: [
                      'Logo vị trí Vàng trên backdrop, banner và ấn phẩm truyền thông',
                      'Đại diện trao giải thưởng phụ tại Gala Chung kết',
                      '02 bài PR giới thiệu sản phẩm/dịch vụ trên Fanpage cuộc thi',
                      'Đặt bàn tư vấn / giới thiệu sản phẩm tại sảnh Gala',
                      'Nhận hoa và kỷ niệm chương tri ân Nhà tài trợ Vàng'
                    ]
                  },
                  {
                    tier: 'BẠC',
                    border: 'border-slate-300 dark:border-slate-700',
                    badge: 'bg-slate-500/10 text-slate-600 dark:text-slate-300 border-slate-400/30',
                    amount: '10.000.000 VNĐ',
                    highlight: 'Đồng hành nhận diện thương hiệu',
                    benefits: [
                      'Logo vị trí Bạc trên toàn bộ ấn phẩm online & offline',
                      '01 bài PR cảm ơn Nhà tài trợ Bạc trên các kênh truyền thông',
                      'Thư cảm ơn và kỷ niệm chương từ Ban Tổ chức cuộc thi',
                      'Vé mời danh dự tham dự Đêm Gala Chung kết 26/12/2026'
                    ]
                  },
                  {
                    tier: 'ĐỒNG',
                    border: 'border-orange-400/50',
                    badge: 'bg-orange-500/10 text-orange-600 dark:text-orange-400 border-orange-400/30',
                    amount: '5.000.000 VNĐ',
                    highlight: 'Hỗ trợ sinh viên & gắn kết cộng đồng',
                    benefits: [
                      'Logo vị trí Đồng trên backdrop và các ấn phẩm truyền thông',
                      'Lời cảm ơn trân trọng trên các kênh truyền thông chính thức',
                      'Giấy chứng nhận tri ân Đơn vị đồng hành từ Ban Tổ chức',
                      'Vé mời danh dự tham dự Đêm Gala Chung kết'
                    ]
                  }
                ].map((item, idx) => (
                  <div key={idx} className={`about-card p-6 flex flex-col justify-between border-2 ${item.border} relative overflow-hidden`}>
                    <div>
                      <div className="flex items-center justify-between gap-2 mb-3">
                        <span className={`px-2.5 py-1 rounded-md text-xs font-black uppercase tracking-wider border ${item.badge}`}>
                          Gói {item.tier}
                        </span>
                      </div>
                      <div className="text-xl sm:text-2xl font-black text-[color:var(--about-text-primary)] mb-1">
                        {item.amount}
                      </div>
                      <p className="text-xs font-semibold text-[color:var(--about-primary)] mb-4">{item.highlight}</p>
                      <ul className="space-y-2 text-xs text-[color:var(--about-text-secondary)]">
                        {item.benefits.map((b, bIdx) => (
                          <li key={bIdx} className="flex items-start gap-2">
                            <span className="text-[color:var(--about-primary)] shrink-0 mt-0.5">✓</span>
                            <span>{b}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>
                ))}
              </div>

              <div className="mt-8 p-5 sm:p-6 rounded-2xl bg-[color:var(--about-surface-sec)]/50 border border-[color:var(--about-border)] flex flex-col sm:flex-row items-center justify-between gap-4">
                <div className="text-xs sm:text-sm text-[color:var(--about-text-secondary)]">
                  <p className="font-bold text-[color:var(--about-text-primary)]">Lưu ý về hình thức tài trợ (Mục 09 Đề án):</p>
                  <p className="mt-1">Quyền lợi tài trợ tính theo mức tài trợ tối thiểu 60% hiện kim. Doanh nghiệp có thể tài trợ hiện vật/dịch vụ tương đương phù hợp nhu cầu của cuộc thi.</p>
                </div>
                <Link
                  href="/the-le#tai-tro"
                  className="shrink-0 px-5 py-2.5 rounded-xl bg-[color:var(--about-primary)] text-white text-xs font-bold hover:opacity-90 transition shadow-sm"
                >
                  Xem chi tiết quyền lợi →
                </Link>
              </div>
            </section>

            {/* Section: Quy mô & Thống kê */}
            <section id="quy-mo" className="about-section-anchor w-full max-w-[1200px] mb-14 sm:mb-16">
              <h2 className="about-section-title text-[24px] sm:text-[32px] font-bold text-center text-[color:var(--about-text-primary)] mb-9">
                {language === 'en' ? 'Scale & Community' : 'Quy mô & Số liệu nổi bật'}
              </h2>
              
              <div className="about-card about-stat-card p-6 sm:p-8">
                <div className="space-y-3">
                  {stats.map(([num, label]: any, idx: number) => (
                    <div key={idx} className="about-stat-item">
                      <span>{num}</span>
                      <span className="text-xs sm:text-sm font-bold text-[color:var(--about-text-secondary)]">{label}</span>
                    </div>
                  ))}
                </div>
              </div>
            </section>

            {/* Section 5: Liên hệ */}
            <section id="lien-he" className="about-section-anchor w-full max-w-[1200px] mb-12">
              <div className="about-card p-6 sm:p-9 bg-gradient-to-br from-[#0A2FFF]/5 to-transparent flex flex-col sm:flex-row items-center justify-between gap-6">
                <div className="space-y-2 text-center sm:text-left">
                  <h3 className="text-xl font-black text-[color:var(--about-text-primary)]">
                    {language === 'en' ? 'HUIT’s ICONIC 2026 Organizing Committee' : 'Ban Tổ Chức HUIT’s ICONIC 2026'}
                  </h3>
                  <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-sm text-[color:var(--about-text-secondary)] justify-center sm:justify-start">
                    <span className="whitespace-nowrap"><b>{language === 'en' ? 'Head of OC:' : 'Trưởng Ban Tổ chức:'}</b> Thầy Đặng Xuân Dương</span>
                    <span className="hidden sm:inline opacity-40">&bull;</span>
                    <span className="whitespace-nowrap"><b>{language === 'en' ? 'Phone / Zalo:' : 'SĐT / Zalo:'}</b> <a href="tel:0974331499" className="hover:text-[var(--site-primary)] transition">0974 331 499</a></span>
                    <span className="hidden sm:inline opacity-40">&bull;</span>
                    <span className="whitespace-nowrap"><b>Email:</b> <a href="mailto:duongdx@huit.edu.vn" className="hover:text-[var(--site-primary)] transition">duongdx@huit.edu.vn</a></span>
                  </div>
                  <p className="text-sm text-[color:var(--about-text-secondary)]">
                    <b>Đơn vị chỉ đạo & sản xuất:</b> Trường Đại học Công Thương TP. Hồ Chí Minh (HUIT)
                  </p>
                </div>

                <div className="shrink-0 flex gap-3">
                  <a
                    href="https://zalo.me/g/myzijputivfgc1toua9z"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="about-primary-action"
                  >
                    Tham gia nhóm Zalo thí sinh →
                  </a>
                </div>
              </div>
            </section>

          </div>
        </div>
      </main>
    </>
  );
}
