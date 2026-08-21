'use client';

import React, { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { apiUrl } from '../api';

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

function RichContent({ value, fallback, className }: { value?: string | null; fallback: string; className: string }) {
  const content = value || fallback;
  if (hasHtml(content)) {
    return <div className={className} dangerouslySetInnerHTML={{ __html: sanitizeRichHtml(content) }} />;
  }
  return <div className={`${className} whitespace-pre-line`}>{content}</div>;
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
  const registerUrl = 'https://docs.google.com/forms/d/e/1FAIpQLSdlRmaBRgPAl_rbLjDOY__ROcyZsCOnoxec2izDhRVJTcHBfA/viewform';

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

    const interval = setInterval(async () => {
      try {
        const res = await fetch(apiUrl('/api/settings'));
        if (res.ok) setSettings(await res.json());
      } catch {}
    }, 5000);

    return () => clearInterval(interval);
  }, []);

  function formatImgUrl(url: string | undefined | null): string {
    if (!url) return '';
    if (url.startsWith('http://') || url.startsWith('https://') || url.startsWith('data:')) {
      return url;
    }
    const cleanPath = url.startsWith('/') ? url : `/${url}`;
    return cleanPath;
  }

  // Intersection observer triggers for smooth animations
  const titleSection = useInView(0.05);
  const gridSection = useInView(0.05);
  const theLeSection = useInView(0.05);
  const timelineSection = useInView(0.05);
  const backBtnSection = useInView(0.05);

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

  const defaultTimelineEvents = [
    {
      phase: "Nhận hồ sơ đăng ký",
      date: "15/5 - 15/6/2026",
      desc: "Các đội thi hoàn thiện hồ sơ, thông tin ý tưởng hoặc dự án khởi nghiệp sáng tạo để đăng ký tham gia cuộc thi.",
      icon: getTimelineIcon(0)
    },
    {
      phase: "Định hướng & tập huấn",
      date: "17/6/2026",
      desc: "Các đội thi được định hướng, tập huấn kỹ năng khởi nghiệp và chuẩn bị cho quá trình phát triển dự án.",
      icon: getTimelineIcon(1)
    },
    {
      phase: "Vòng loại",
      date: "27-28/6/2026",
      desc: "Hội đồng chuyên môn đánh giá, chọn lọc các ý tưởng và dự án phù hợp để tiếp tục bước vào vòng tiếp theo.",
      icon: getTimelineIcon(2)
    },
    {
      phase: "Vòng bán kết",
      date: "25/7/2026",
      desc: "Các đội thi trình bày, phản biện và hoàn thiện mô hình dự án dưới sự đánh giá của hội đồng chuyên môn.",
      icon: getTimelineIcon(1)
    },
    {
      phase: "Vòng chung kết",
      date: "03/10/2026",
      desc: "Các dự án xuất sắc nhất tranh tài, kết nối chuyên gia, nhà đầu tư và cơ hội ươm tạo sau cuộc thi.",
      icon: getTimelineIcon(2)
    }
  ];

  const displayTimeline = timelineEvents && timelineEvents.length > 0
    ? timelineEvents.filter((e: any) => e.isActive && e.isImportant).map((event: any, idx: number) => ({
        phase: event.title,
        date: event.date,
        desc: event.description,
        icon: getTimelineIcon(idx % 3)
      }))
    : defaultTimelineEvents;

  const organizers = settings?.aboutOrganizerDetail
    ? extractTextLines(settings.aboutOrganizerDetail)
    : [
        'Đơn vị tổ chức: Trường Đại học Công Thương TP. HCM (HUIT) và IEC.',
        'Tài trợ kim cương: Sài Gòn Thăng Long; Quỹ đầu tư VinaTech.',
        'Đơn vị phối hợp: Diễn đàn Doanh nghiệp; Khởi nghiệp Quốc gia phía Nam; VNEI.',
        'Đơn vị bảo trợ: Các đơn vị/biểu trưng bảo trợ theo poster cuộc thi.'
      ];

  const sectors = settings?.aboutSectors
    ? extractTextLines(settings.aboutSectors)
    : [
        'Công nghiệp, AI, chuyển đổi số và an ninh mạng',
        'Công nghệ thực phẩm, nông nghiệp, môi trường và năng lượng',
        'Giáo dục, văn hóa, du lịch, logistics, tài chính, thương mại điện tử và luật',
        'Y tế, sức khỏe và đời sống',
        'Phát triển bền vững và kinh doanh tạo tác động xã hội'
      ];

  const benefits = settings?.aboutBenefits
    ? extractTextLines(settings.aboutBenefits)
    : [
        'Đào tạo kỹ năng khởi nghiệp',
        'Mentor/cố vấn chuyên sâu',
        'Startup Tour & kiểm chứng thị trường',
        'Kết nối quỹ đầu tư, nhà đầu tư và cơ hội ươm tạo'
      ];

  const prize = settings?.aboutPrize || "Tổng giá trị giải thưởng 05 TỶ ĐỒNG và các gói hỗ trợ hấp dẫn, gồm tiền mặt, gói mentor/cố vấn chuyên sâu, gói sở hữu trí tuệ, nền tảng ERP Platform và nhiều cơ hội nhận các gói ươm tạo, kết nối đầu tư, phát triển dự án sau cuộc thi.";

  const parsedParticipants = settings?.aboutParticipants
    ? extractTextLines(settings.aboutParticipants).map((line: string) => {
        const colonIndex = line.indexOf(':');
        if (colonIndex !== -1) {
          return [line.substring(0, colonIndex).trim(), line.substring(colonIndex + 1).trim()];
        }
        return ['Đối tượng', line.trim()];
      })
    : [
        ['Học sinh', 'THPT, GDTX, trung cấp có ý tưởng khởi nghiệp sáng tạo.'],
        ['Sinh viên, học viên', 'Đang học tại các trường đại học, cao đẳng và cơ sở giáo dục.'],
        ['Cá nhân, tổ chức', 'Yêu thích hoạt động khởi nghiệp, có ý tưởng hoặc dự án sáng tạo.'],
        ['Doanh nghiệp', 'HTX, hộ kinh doanh, doanh nghiệp vừa và nhỏ tại TP. Hồ Chí Minh và các tỉnh lân cận.']
      ];

  const statsYear = settings?.statsYear || '2025';
  const stats = [
    [settings?.statsCandidates || 'Đang cập nhật', 'Dự án đăng ký'],
    [settings?.statsVotes || 'Đang cập nhật', 'Lượt bình chọn'],
    [settings?.statsParticipants || 'Đang cập nhật', 'Sinh viên tham gia'],
    [settings?.statsViews || 'Đang cập nhật', 'Lượt tiếp cận trên mạng xã hội'],
    [settings?.statsMedia || 'Đang cập nhật', 'Đơn vị truyền thông, đưa tin'],
    [settings?.statsSchools || 'Đang cập nhật', 'Trường đại học, cao đẳng, THPT, TT GDTX tham gia'],
  ];

  const registrationDeadline = settings?.registrationDeadline
    ? parseVN(settings.registrationDeadline)
    : null;
  const registrationOpen: boolean | null = settings
    ? settings.isRegistrationOpen !== false
      && (!registrationDeadline || registrationDeadline.getTime() >= Date.now())
    : null;
  const registrationHref = registrationOpen === true
    ? (settings?.registrationUrl || registerUrl)
    : '#timeline-section';
  const quickLinks = [
    { href: '#tong-quan', label: 'Tổng quan', icon: '01' },
    { href: '#quyen-loi', label: 'Quyền lợi', icon: '02' },
    { href: '#timeline-section', label: 'Lộ trình', icon: '03' },
    { href: '#quy-mo', label: 'Quy mô', icon: '04' },
    { href: '#lien-he', label: 'Liên hệ', icon: '05' },
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
              name: 'HUIT Startup 2026 là gì?',
              acceptedAnswer: {
                '@type': 'Answer',
                text: 'HUIT Startup 2026 là cuộc thi khởi nghiệp sáng tạo lớn nhất tại Trường Đại học Công nghiệp TP.HCM (HUIT), nơi các sinh viên, học sinh và cá nhân trình bày ý tưởng và dự án khởi nghiệp để được bình chọn và kết nối với nhà đầu tư.',
              },
            },
            {
              '@type': 'Question',
              name: 'Ai có thể tham gia cuộc thi HUIT Startup 2026?',
              acceptedAnswer: {
                '@type': 'Answer',
                text: 'Cuộc thi mở cho học sinh THPT, sinh viên đại học/cao đẳng, cá nhân và tổ chức yêu thích khởi nghiệp, cũng như doanh nghiệp vừa và nhỏ tại TP.HCM và các tỉnh lân cận.',
              },
            },
            {
              '@type': 'Question',
              name: 'Làm thế nào để bình chọn cho dự án tại HUIT Startup 2026?',
              acceptedAnswer: {
                '@type': 'Answer',
                text: 'Truy cập trang web HUIT Startup 2026, tìm dự án yêu thích tại mục Bảng xếp hạng hoặc Trang chủ, đăng nhập tài khoản và nhấn Bình chọn. Mỗi tài khoản có 2 lượt bình chọn miễn phí mỗi ngày.',
              },
            },
            {
              '@type': 'Question',
              name: 'Giải thưởng của cuộc thi HUIT Startup 2026 là gì?',
              acceptedAnswer: {
                '@type': 'Answer',
                text: 'Các dự án xuất sắc sẽ nhận được giải thưởng tiền mặt, kết nối với nhà đầu tư, cơ hội ươm tạo khởi nghiệp và được hỗ trợ phát triển sản phẩm từ HUIT và các đối tác đồng hành.',
              },
            },
            {
              '@type': 'Question',
              name: 'Cuộc thi HUIT Startup 2026 diễn ra khi nào?',
              acceptedAnswer: {
                '@type': 'Answer',
                text: 'Cuộc thi HUIT Startup 2026 diễn ra trong năm 2026, bao gồm các giai đoạn: nhận hồ sơ, vòng loại, vòng bán kết và vòng chung kết. Chi tiết lịch trình xem tại mục Thời gian trên website.',
              },
            },
          ],
        })}}
      />
      <style>{`
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
        .about-status-pill > span {
          width: 7px;
          height: 7px;
          border-radius: 999px;
          background: currentColor;
          box-shadow: 0 0 0 5px color-mix(in srgb, currentColor 12%, transparent);
        }
        .about-theme-pill {
          max-width: 820px;
          padding: 10px 18px;
          border-radius: 999px;
          background: var(--about-surface);
          border: 1px solid var(--about-border);
          box-shadow: var(--about-shadow);
          color: var(--about-text-secondary);
          font-size: 14px;
          line-height: 1.5;
        }
        .about-theme-pill::before { content: 'Chủ đề · '; color: var(--about-primary); font-weight: 800; }
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
        .about-status-pill {
          display: inline-flex;
          align-items: center;
          gap: 9px;
          padding: 7px 12px;
          border-radius: 999px;
          font-size: 12px;
          font-weight: 800;
        }
        .about-status-pill.open { color: #047857; background: rgba(16,185,129,.10); border: 1px solid rgba(16,185,129,.24); }
        .about-status-pill.closed { color: #b45309; background: rgba(245,158,11,.10); border: 1px solid rgba(245,158,11,.24); }
        .about-status-pill.pending { color: var(--about-primary); background: color-mix(in srgb, var(--about-primary) 9%, transparent); border: 1px solid color-mix(in srgb, var(--about-primary) 22%, transparent); }
        :root[data-theme='dark'] .about-status-pill.open { color: #6ee7b7; }
        :root[data-theme='dark'] .about-status-pill.closed { color: #fcd34d; }
        .about-primary-action {
          min-height: 48px;
          display: inline-flex;
          align-items: center;
          justify-content: center;
          gap: 10px;
          padding: 0 26px;
          border-radius: 999px;
          background: linear-gradient(135deg, var(--about-primary), var(--about-accent));
          color: #fff !important;
          font-size: 13px;
          font-weight: 800;
          letter-spacing: .06em;
          text-transform: uppercase;
          box-shadow: 0 12px 28px color-mix(in srgb, var(--about-primary) 28%, transparent);
          transition: transform .25s ease, box-shadow .25s ease;
        }
        .about-primary-action:hover { transform: translateY(-2px); box-shadow: 0 16px 36px color-mix(in srgb, var(--about-primary) 36%, transparent); }

        .about-quick-nav {
          position: sticky;
          top: 92px;
          z-index: 30;
          display: flex;
          align-items: center;
          gap: 4px;
          max-width: 780px;
          padding: 5px;
          border: 1px solid var(--about-border);
          border-radius: 999px;
          background: color-mix(in srgb, var(--about-surface) 90%, transparent);
          box-shadow: 0 12px 36px rgba(15,23,42,.10), 0 0 0 1px rgba(255,255,255,0.03);
          backdrop-filter: blur(18px);
        }
        .about-quick-nav a {
          position: relative;
          min-height: 38px;
          display: flex;
          align-items: center;
          gap: 7px;
          padding: 0 14px;
          border-radius: 999px;
          color: var(--about-text-secondary);
          font-size: 12px;
          font-weight: 700;
          transition: background 0.25s ease, color 0.25s ease, transform 0.2s ease, box-shadow 0.25s ease;
        }
        .about-quick-nav a:hover {
          background: color-mix(in srgb, var(--about-primary) 10%, var(--about-surface));
          color: var(--about-primary);
          transform: translateY(-1px);
          box-shadow: 0 4px 14px color-mix(in srgb, var(--about-primary) 18%, transparent);
        }
        .about-quick-nav a:hover .about-nav-num { background: var(--about-primary); color: #fff; }
        .about-nav-num {
          display: inline-flex;
          align-items: center;
          justify-content: center;
          width: 20px;
          height: 20px;
          border-radius: 6px;
          background: color-mix(in srgb, var(--about-primary) 12%, transparent);
          color: var(--about-primary);
          font-size: 9px;
          font-weight: 900;
          letter-spacing: 0;
          transition: background 0.25s ease, color 0.25s ease;
        }
        .about-nav-label { font-size: 11px; font-weight: 700; }
          box-shadow: 0 12px 36px rgba(15,23,42,.10);
          backdrop-filter: blur(18px);
        }
        .about-quick-nav a {
          min-height: 40px;
          display: flex;
          align-items: center;
          gap: 8px;
          padding: 0 15px;
          border-radius: 999px;
          color: var(--about-text-secondary);
          font-size: 12px;
          font-weight: 700;
          transition: background .2s ease, color .2s ease;
        }
        .about-quick-nav a:hover { background: var(--about-surface-sec); color: var(--about-primary); }
        .about-section-anchor { scroll-margin-top: 150px; }
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
        .about-prize-value {
          background: linear-gradient(100deg, #be123c, #db2777, #0e7490);
          -webkit-background-clip: text;
          background-clip: text;
          color: transparent;
        }
        :root[data-theme='dark'] .about-prize-value { background-image: linear-gradient(100deg, #fda4af, #f9a8d4, #67e8f9); }

        .about-timeline-shell { background: linear-gradient(145deg, var(--about-surface), color-mix(in srgb, var(--about-primary) 3%, var(--about-surface))); }
        .about-timeline-event {
          padding: 0 0 20px 4px;
          border-bottom: 1px dashed var(--about-border);
        }
        .about-timeline-event:last-child { padding-bottom: 0; border-bottom: 0; }
        .about-stat-card .space-y-3 {
          display: grid;
          grid-template-columns: repeat(2, minmax(0, 1fr));
          gap: 10px;
        }
        .about-stat-card .space-y-3 > * { margin-top: 0 !important; }
        .about-stat-item {
          min-height: 92px;
          display: flex;
          flex-direction: column;
          justify-content: center;
          gap: 6px;
          padding: 13px;
          border: 1px solid var(--about-border);
          border-radius: 14px;
          background: color-mix(in srgb, var(--about-surface-sec) 58%, transparent);
        }
        .about-stat-item > span:first-child { color: var(--about-primary); font-size: 22px; font-weight: 900; letter-spacing: -.02em; }

        /* Viewport entry transition classes */
        .animate-on-scroll {
          opacity: 0;
          transform: translateY(20px);
          transition: opacity 0.4s cubic-bezier(0.16, 1, 0.3, 1), transform 0.4s cubic-bezier(0.16, 1, 0.3, 1);
        }
        .animate-on-scroll.visible {
          opacity: 1;
          transform: translateY(0);
        }
        
        .animate-slide-left {
          opacity: 0;
          transform: translateX(-30px);
          transition: opacity 0.4s cubic-bezier(0.16, 1, 0.3, 1), transform 0.4s cubic-bezier(0.16, 1, 0.3, 1);
        }
        .animate-slide-left.visible {
          opacity: 1;
          transform: translateX(0);
        }

        .animate-slide-right {
          opacity: 0;
          transform: translateX(30px);
          transition: opacity 0.4s cubic-bezier(0.16, 1, 0.3, 1), transform 0.4s cubic-bezier(0.16, 1, 0.3, 1);
        }
        .animate-slide-right.visible {
          opacity: 1;
          transform: translateX(0);
        }

        /* Focus rings */
        .about-focusable:focus-visible {
          outline: 2px solid var(--about-primary) !important;
          outline-offset: 3px !important;
        }

        /* Hero title animated gradient */
        @keyframes titleGradientShift {
          0%, 100% { background-position: 0% 50%; }
          50% { background-position: 100% 50%; }
        }
        .about-hero-title-gradient {
          background-size: 200% 200%;
        }
        .about-hero h1 {
          font-size: 42px !important;
          font-weight: 900 !important;
          line-height: 1.12 !important;
          margin-top: 12px !important;
          margin-bottom: 12px !important;
          max-width: 960px !important;
        }
        @media (min-width: 640px) {
          .about-hero h1 {
            font-size: 64px !important;
          }
        }
        @media (min-width: 768px) {
          .about-hero h1 {
            font-size: 80px !important;
          }
        }

        @media (max-width: 700px) {
          :root[data-theme='dark'] .about-page-premium { background-attachment: scroll !important; }
          .about-ambient { display: none; }
          .about-hero h1 { max-width: 560px; }
          .about-theme-pill { border-radius: 16px; }
          .about-hero-facts { display: grid; grid-template-columns: 1fr; width: 100%; max-width: 330px; }
          .about-registration-card { border-radius: 20px; }
          .about-quick-nav {
            top: 88px;
            width: calc(100vw - 24px);
            overflow-x: auto;
            justify-content: flex-start;
            border-radius: 16px;
            scrollbar-width: none;
          }
          .about-quick-nav::-webkit-scrollbar { display: none; }
          .about-quick-nav a { flex: 0 0 auto; }
          .about-card, .about-timeline-shell { border-radius: 20px; backdrop-filter: blur(7px); }
          .about-card:hover { transform: none; }
          .about-stat-card .space-y-3 { grid-template-columns: 1fr 1fr; }
        }
      `}</style>

      <main className="iUzfqH about-page-premium flex-1 pb-16 mt-[-80px] pt-[80px]">
        <div className="about-ambient about-ambient-one" aria-hidden="true" />
        <div className="about-ambient about-ambient-two" aria-hidden="true" />
        <div className="hfAPBN relative z-[1]">
          <div className="mt-8 sm:mt-[56px] flex flex-col items-center">
            
            {/* Title Block */}
            <div
              ref={titleSection.ref} 
              className={`about-hero flex flex-col items-center text-center mb-8 sm:mb-10 ${isMounted ? 'animate-on-scroll' : ''} ${isMounted && titleSection.visible ? 'visible' : ''}`}
            >
              <div className="about-eyebrow mb-3">
                Cuộc thi HUIT Startup lần thứ VII năm 2026 cấp Thành phố
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
                Đổi mới sáng tạo hướng tới mục tiêu phát triển bền vững
              </h1>
              <div className="about-hero-facts mt-3" aria-label="Thông tin nổi bật">
                <span><b>03</b> bảng thi</span>
                <span><b>05 tỷ</b> tổng giải thưởng</span>
                <span><b>2026</b> cấp Thành phố</span>
              </div>
            </div>

            {/* CTA đăng ký đầu trang */}
            <div
              className={`about-registration-card w-full max-w-[920px] mb-6 p-5 sm:p-6 rounded-[24px] flex flex-col sm:flex-row items-center justify-between gap-6 ${isMounted ? 'animate-on-scroll' : ''} ${isMounted && titleSection.visible ? 'visible' : ''}`}
              suppressHydrationWarning
            >
              <div className="text-center sm:text-left">
                <span className={`about-status-pill ${!isMounted || registrationOpen === null ? 'pending' : registrationOpen ? 'open' : 'closed'}`}>
                  <span aria-hidden="true" />
                  {!isMounted || registrationOpen === null ? 'Đang đồng bộ trạng thái' : registrationOpen ? "Đang nhận hồ sơ đăng ký" : "Đã kết thúc nhận hồ sơ"}
                </span>
                <p className="mt-3 text-[14px] sm:text-[15px] text-[color:var(--about-text-secondary)]">
                  {!isMounted || registrationOpen === null ? (
                    'Thông tin thời hạn đang được cập nhật từ hệ thống.'
                  ) : registrationDeadline ? (
                    <>{registrationOpen ? 'Hạn chót nhận hồ sơ' : 'Thời hạn nhận hồ sơ đã kết thúc'}: <b className="text-[color:var(--about-text-primary)]">{formatDateTime(settings.registrationDeadline)}</b></>
                  ) : (
                    "Vui lòng theo dõi lịch trình chi tiết của các vòng thi bên dưới."
                  )}
                </p>
              </div>
              <div className="flex gap-3 w-full sm:w-auto shrink-0">
                <a
                  href={isMounted ? registrationHref : '#timeline-section'}
                  target={isMounted && registrationOpen ? '_blank' : undefined}
                  rel={isMounted && registrationOpen ? 'noopener noreferrer' : undefined}
                  className="about-primary-action w-full sm:w-auto about-focusable"
                >
                  {!isMounted ? 'Đang cập nhật' : registrationOpen === true ? 'Đăng ký ngay' : registrationOpen === false ? 'Xem lộ trình' : 'Đang cập nhật'} <span aria-hidden="true">→</span>
                </a>
              </div>
            </div>

            <nav className="about-quick-nav mb-16" aria-label="Điều hướng nhanh trang giới thiệu">
              {quickLinks.map((item) => (
                <a key={item.href} href={item.href} className="about-focusable">
                  <span className="about-nav-num">{item.icon}</span>
                  <span className="about-nav-label">{item.label}</span>
                </a>
              ))}
            </nav>

            {/* Section 1: Tổng quan & Ban tổ chức */}
            <section id="tong-quan" ref={gridSection.ref} className="about-section-anchor w-full max-w-[1200px] flex flex-col gap-8 mb-20">
              
              {/* Card Tổng quan */}
              <div>
                <h2 className="about-section-title text-[24px] sm:text-[32px] font-bold text-center text-[color:var(--about-text-primary)] mb-7">
                  Tổng quan cuộc thi
                </h2>
                <div className={`about-card about-card-feature w-full p-6 sm:p-9 relative overflow-hidden group ${isMounted ? 'animate-on-scroll' : ''} ${isMounted && gridSection.visible ? 'visible' : ''}`}>
                  <div className="absolute -top-8 -right-8 w-24 h-24 bg-[color:var(--about-accent)]/10 rounded-full blur-xl group-hover:bg-[color:var(--about-accent)]/20 transition-all duration-500 pointer-events-none" />

                  <div className="w-full">
                    <RichContent
                      value={settings?.aboutDescription}
                      fallback={`Cuộc thi HUIT Startup lần thứ VII năm 2026 cấp Thành phố với chủ đề “Đổi mới sáng tạo hướng tới mục tiêu phát triển bền vững” là hoạt động thường niên do Trường Đại học Công Thương TP. Hồ Chí Minh tổ chức. Sân chơi là bệ phóng giúp ươm mầm, kết nối nguồn lực và hiện thực hóa các dự án khởi nghiệp tiềm năng.\n\nNăm nay, cuộc thi mở rộng quy mô chào đón 3 bảng thi dành cho Học sinh, Sinh viên và Doanh nghiệp trên địa bàn TP.HCM và các tỉnh lân cận. Mục tiêu hướng tới việc tạo tác động xã hội tích cực, phát triển kinh tế bền vững và nâng cao năng lực thích ứng của nguồn nhân lực trẻ.`}
                      className="rich-content text-[16px] sm:text-[18px] text-[color:var(--about-text-primary)] leading-[1.8] font-normal text-justify"
                    />
                  </div>
                </div>
              </div>
            </section>

            {/* Section 2: Lĩnh vực, Quyền lợi, Giải thưởng */}
            <section
              id="quyen-loi"
              ref={theLeSection.ref}
              className="about-section-anchor w-full max-w-[1200px] mb-20"
            >
              <h2 className="about-section-title text-[24px] sm:text-[32px] font-bold text-center text-[color:var(--about-text-primary)] mb-9">
                Lĩnh vực &amp; Quyền lợi
              </h2>
              <div className={`grid grid-cols-1 lg:grid-cols-3 gap-8 ${isMounted ? 'animate-on-scroll' : ''} ${isMounted && theLeSection.visible ? 'visible' : ''}`}>
                
                {/* Lĩnh vực dự thi */}
                <div className="about-card about-card-warning p-6 sm:p-8 flex flex-col space-y-6 relative overflow-hidden group">
                  <div className="absolute -top-8 -right-8 w-24 h-24 bg-yellow-500/5 rounded-full blur-xl group-hover:bg-yellow-500/10 transition-all duration-500 pointer-events-none" />
                  
                  <div className="flex items-center space-x-3 pb-4 border-b border-[color:var(--about-border)]">
                    <div className="p-2.5 bg-amber-500/10 rounded-xl text-[color:var(--about-warning)] border border-amber-500/20">
                      <svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                        <polygon points="12 2 2 7 12 12 22 7 12 2"></polygon>
                        <polyline points="2 17 12 22 22 17"></polyline>
                        <polyline points="2 12 12 17 22 12"></polyline>
                      </svg>
                    </div>
                    <h3 className="text-[20px] sm:text-[22px] font-bold text-[color:var(--about-text-primary)] uppercase tracking-wide">
                      Lĩnh vực dự thi
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
                          <p className="text-[15px] sm:text-[16px] text-[color:var(--about-text-primary)] leading-[1.7] font-normal text-left sm:text-justify">
                            {sector}
                          </p>
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* Quyền lợi khi tham gia */}
                <div className="about-card about-card-accent p-6 sm:p-8 flex flex-col space-y-6 relative overflow-hidden group">
                  <div className="absolute -top-8 -right-8 w-24 h-24 bg-[color:var(--about-accent)]/5 rounded-full blur-xl group-hover:bg-[color:var(--about-accent)]/10 transition-all duration-500 pointer-events-none" />
                  
                  <div className="flex items-center space-x-3 pb-4 border-b border-[color:var(--about-border)]">
                    <div className="p-2.5 bg-[color:color-mix(in_srgb,_var(--about-accent)_10%,_transparent)] rounded-xl text-[color:var(--about-accent)] border border-[color:color-mix(in_srgb,_var(--about-accent)_20%,_transparent)]">
                      <svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                        <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"></polygon>
                      </svg>
                    </div>
                    <h3 className="text-[20px] sm:text-[22px] font-bold text-[color:var(--about-text-primary)] uppercase tracking-wide">
                      Quyền lợi tham gia
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
                  <div className="absolute -top-8 -right-8 w-24 h-24 bg-rose-500/5 rounded-full blur-xl group-hover:bg-rose-500/10 transition-all duration-500 pointer-events-none" />
                  
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
                      Cơ cấu giải thưởng
                    </h3>
                  </div>
                  
                  <div className="flex-1 flex flex-col justify-start space-y-4">
                    <div className="bg-gradient-to-br from-rose-500/15 via-[#79BCC2]/5 to-transparent border border-rose-500/20 rounded-2xl p-4 text-center shadow-lg relative overflow-hidden">
                      <div className="absolute inset-0 bg-white/[0.01] pointer-events-none" />
                      <p className="text-[12px] sm:text-[13px] font-black uppercase tracking-[0.2em] text-[color:var(--about-prize)]">Tổng giải thưởng lên tới</p>
                      <h4 className="about-prize-value text-[30px] sm:text-[36px] font-black mt-1.5 leading-normal py-1.5">
                        {(() => {
                          const match = prize.match(/\d+\s*[T|t]ỷ\s*[Đ|đ]ồng/i);
                          return match ? match[0].toUpperCase() : "05 TỶ ĐỒNG";
                        })()}
                      </h4>
                    </div>

                    <RichContent
                      value={prize}
                      fallback=""
                      className="rich-content text-[15px] sm:text-[16px] text-[color:var(--about-text-secondary)] leading-[1.7] font-normal text-left sm:text-justify bg-[color:var(--about-surface-sec)]/30 border border-[color:var(--about-border)] rounded-xl p-4 shadow-inner"
                    />
                  </div>
                </div>

              </div>
            </section>

            {/* Section 3: Timeline Section */}
            <section
              id="timeline-section"
              ref={timelineSection.ref}
              className={`about-section-anchor about-timeline-shell w-full max-w-[1200px] mb-20 p-6 sm:p-9 flex flex-col space-y-8 ${isMounted ? 'animate-on-scroll' : ''} ${isMounted && timelineSection.visible ? 'visible' : ''}`}
            >
              <h2 className="about-section-title text-[24px] sm:text-[32px] font-bold text-center text-[color:var(--about-text-primary)]">
                Lộ trình thực hiện
              </h2>

              <div className="flex items-center space-x-3 pb-3 border-b border-[color:var(--about-border)]">
                <div className="p-2.5 bg-[color:color-mix(in_srgb,_var(--about-primary)_10%,_transparent)] rounded-lg text-[color:var(--about-primary)]">
                  <svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                    <rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect>
                    <line x1="16" y1="2" x2="16" y2="6"></line>
                    <line x1="8" y1="2" x2="8" y2="6"></line>
                    <line x1="3" y1="10" x2="21" y2="10"></line>
                  </svg>
                </div>
                <h3 className="text-[20px] sm:text-[22px] font-bold text-[color:var(--about-text-primary)] uppercase">
                  Các mốc quan trọng
                </h3>
              </div>

              {/* Timeline Layout */}
              <div className="relative border-l border-[color:var(--about-border)] ml-4 sm:ml-8 pl-6 sm:pl-10 space-y-8">
                {displayTimeline.map((event: any, idx: number) => (
                  <div 
                    key={idx} 
                    className={`about-timeline-event relative flex flex-col space-y-2 ${isMounted ? 'animate-on-scroll' : ''} ${isMounted && timelineSection.visible ? 'visible' : ''}`}
                    style={{ transitionDelay: isMounted ? `${idx * 100}ms` : '0ms' }}
                  >
                    
                    {/* Circle Node */}
                    <div className="absolute -left-[41px] sm:-left-[57px] top-0 w-[32px] h-[32px] rounded-full border-2 border-[color:var(--about-primary)] bg-[color:var(--about-surface-sec)] flex items-center justify-center shadow-lg text-[color:var(--about-primary)] [&>svg]:w-[17px] [&>svg]:h-[17px]">
                      {event.icon}
                    </div>

                    <span className="text-[13px] sm:text-[14px] font-bold text-[color:var(--about-accent)] tracking-wider uppercase">
                      {event.date}
                    </span>
                    <h4 className="text-[18px] sm:text-[20px] font-bold text-[color:var(--about-text-primary)]">
                      {event.phase}
                    </h4>
                    <p className="text-[15px] sm:text-[16px] text-[color:var(--about-text-secondary)] leading-[1.7] max-w-[900px] text-left sm:text-justify">
                      {event.desc}
                    </p>
                  </div>
                ))}
              </div>
            </section>

            {/* Section 4: Scale, participants and contact */}
            <section id="quy-mo" className="about-section-anchor w-full max-w-[1200px] mb-16">
              <h2 className="about-section-title text-[24px] sm:text-[32px] font-bold text-center text-[color:var(--about-text-primary)] mb-9">
                Quy mô &amp; Đối tượng
              </h2>
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

                {/* Quy mô thống kê */}
                <div className="about-card about-stat-card p-6 flex flex-col">
                  <h3 className="text-[20px] font-bold text-[color:var(--about-text-primary)] uppercase mb-5 pb-3 border-b border-[color:var(--about-border)] text-center">
                    Quy mô thống kê {statsYear}
                  </h3>
                  <div className="space-y-3 flex-1 flex flex-col justify-start">
                    {stats.map(([number, label]) => (
                      <div key={label} className="about-stat-item">
                        <span>{number}</span>
                        <span className="text-[15px] sm:text-[16px] leading-[1.55] text-[color:var(--about-text-secondary)] font-medium">{label}</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Đối tượng tham gia */}
                <div className="about-card p-6 flex flex-col">
                  <h3 className="text-[20px] font-bold text-[color:var(--about-text-primary)] uppercase mb-5 pb-3 border-b border-[color:var(--about-border)] text-center">
                    Đối tượng tham gia
                  </h3>
                  <div className="space-y-3 flex-1 flex flex-col justify-start">
                    {parsedParticipants.map(([title, desc]: string[]) => (
                      <div key={title} className="rounded-xl border border-[color:var(--about-border)] bg-[color:var(--about-surface-sec)]/30 p-3.5 transition hover:border-[color:var(--about-accent)]/40 hover:bg-[color:var(--about-surface-sec)]/60">
                        <div className="flex items-start gap-3">
                          <span className="mt-1.5 h-2 w-2 shrink-0 rounded-full bg-[color:var(--about-accent)] shadow-[0_0_8px_rgba(121,188,194,0.65)]"></span>
                          <div>
                            <p className="font-bold text-[16px] text-[color:var(--about-text-primary)]">{title}</p>
                            <p className="mt-1 text-[15px] leading-[1.65] text-[color:var(--about-text-secondary)] text-left">{desc}</p>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Thông tin liên hệ */}
                <div id="lien-he" className="about-card about-section-anchor p-6 flex flex-col justify-between">
                  <div>
                    <h3 className="text-[20px] font-bold text-[color:var(--about-text-primary)] uppercase mb-5 pb-3 border-b border-[color:var(--about-border)] text-center">
                      Thông tin liên hệ
                    </h3>
                    <div className="space-y-3.5 text-[15px] sm:text-[16px] leading-[1.6] text-[color:var(--about-text-secondary)] font-normal text-left pl-2 sm:pl-4">
                      <p><b>Người liên hệ:</b> <span className="text-[color:var(--about-text-primary)]">{settings?.aboutContactName || 'Nguyễn Thị Bích Nguyên'}</span></p>
                      <p><b>Chức vụ:</b> {settings?.aboutContactRole || 'Chuyên viên - TT Đổi mới sáng tạo và Khởi nghiệp'}</p>
                      <p><b>Đơn vị:</b> Trường Đại học Công Thương TP. HCM</p>
                      <p><b>Điện thoại:</b> <a href={`tel:${settings?.aboutContactPhone || '0975702463'}`} className="text-[color:var(--about-primary)] hover:underline font-semibold about-focusable">{settings?.aboutContactPhone || '0975702463'}</a></p>
                      <p><b>Email:</b> <a href={`mailto:${settings?.aboutContactEmail || 'nguyenntb@huit.edu.vn'}`} className="text-[color:var(--about-primary)] hover:underline font-semibold about-focusable">{settings?.aboutContactEmail || 'nguyenntb@huit.edu.vn'}</a></p>
                      <p><b>Website:</b> <a href={settings?.aboutContactWebsite || "https://khoinghiep.huit.edu.vn"} target="_blank" rel="noopener noreferrer" className="text-[color:var(--about-primary)] hover:underline font-semibold about-focusable">{settings?.aboutContactWebsite || 'https://khoinghiep.huit.edu.vn'}</a></p>
                    </div>
                  </div>

                  <div className="mt-6 rounded-xl border border-[color:var(--about-border)] bg-[color:var(--about-surface-sec)]/50 p-4 text-center">
                    {!isMounted || registrationOpen === null ? (
                      <div className="py-8" aria-live="polite">
                        <div className="mx-auto h-10 w-10 rounded-full border-2 border-[color:var(--about-border)] border-t-[color:var(--about-primary)] animate-spin" />
                        <p className="mt-3 text-[13px] text-[color:var(--about-text-secondary)]">Đang cập nhật thông tin đăng ký...</p>
                      </div>
                    ) : registrationOpen === true ? (
                      <>
                        <p className="mb-3 text-[12px] font-bold uppercase tracking-wider text-[color:var(--about-accent)]">Quét mã để đăng ký nhanh</p>
                        <img
                          alt="QR đăng ký HUIT Startup 2026"
                          src={formatImgUrl(settings?.aboutContactQrUrl || '/images/qrdangky.png')}
                          className="mx-auto h-auto w-full max-w-[150px] rounded-lg bg-white p-2 shadow-md object-contain"
                        />
                      </>
                    ) : (
                      <div className="py-3">
                        <span className="text-[28px]" aria-hidden="true">📅</span>
                        <p className="mt-2 text-[14px] font-semibold text-[color:var(--about-text-primary)]">Đợt nhận hồ sơ đã kết thúc</p>
                        <p className="mt-1 text-[13px] text-[color:var(--about-text-secondary)]">Theo dõi lộ trình để cập nhật các vòng thi tiếp theo.</p>
                      </div>
                    )}
                    <a
                      href={isMounted ? registrationHref : '#timeline-section'}
                      target={isMounted && registrationOpen ? '_blank' : undefined}
                      rel={isMounted && registrationOpen ? 'noopener noreferrer' : undefined}
                      className="mt-4 about-primary-action w-full about-focusable"
                    >
                      {!isMounted ? 'Đang cập nhật' : registrationOpen === true ? 'Đăng ký ngay' : registrationOpen === false ? 'Xem lộ trình' : 'Đang cập nhật'} <span aria-hidden="true">→</span>
                    </a>
                  </div>
                </div>

              </div>
            </section>

            {/* Back Button */}
            <div 
              ref={backBtnSection.ref}
              className={`mt-6 flex justify-center ${isMounted ? 'animate-on-scroll' : ''} ${isMounted && backBtnSection.visible ? 'visible' : ''}`}
            >
              <Link 
                href="/" 
                className="flex items-center justify-center gap-2 border border-[color:var(--about-border)] bg-[color:var(--about-surface)] hover:bg-[color:var(--about-surface-sec)] text-[color:var(--about-text-primary)] font-bold rounded-full px-8 py-3.5 shadow-sm hover:scale-[1.02] active:scale-[0.98] transition-all duration-300 text-[14px] uppercase tracking-wider about-focusable"
              >
                <span>Quay lại Trang chủ</span>
              </Link>
            </div>

          </div>
        </div>
      </main>
    </>
  );
}
