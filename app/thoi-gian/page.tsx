'use client';

import React, { useState, useEffect, useMemo } from 'react';
import Link from 'next/link';
import { apiUrl } from '../api';

function CountdownTimer({ targetDate }: { targetDate: string }) {
  const [timeLeft, setTimeLeft] = useState({ days: 0, hours: 0, minutes: 0, seconds: 0 });
  useEffect(() => {
    const update = () => {
      const diff = new Date(targetDate).getTime() - Date.now();
      if (diff <= 0) { setTimeLeft({ days: 0, hours: 0, minutes: 0, seconds: 0 }); return; }
      setTimeLeft({
        days: Math.floor(diff / 86400000),
        hours: Math.floor((diff % 86400000) / 3600000),
        minutes: Math.floor((diff % 3600000) / 60000),
        seconds: Math.floor((diff % 60000) / 1000),
      });
    };
    update();
    const timer = setInterval(update, 1000);
    return () => clearInterval(timer);
  }, [targetDate]);

  const pad = (n: number) => String(n).padStart(2, '0');
  const units = [
    { value: timeLeft.days, label: 'Ngày' },
    { value: timeLeft.hours, label: 'Giờ' },
    { value: timeLeft.minutes, label: 'Phút' },
    { value: timeLeft.seconds, label: 'Giây' },
  ];

  return (
    <div className="countdown-timer-wrap">
      {units.map((u, i) => (
        <React.Fragment key={u.label}>
          <div className="countdown-digit-box">
            <div className="countdown-digit-val">
              {pad(u.value)}
            </div>
            <div className="countdown-digit-label">
              {u.label}
            </div>
          </div>
          {i < units.length - 1 && (
            <div className="countdown-digit-separator">
              :
            </div>
          )}
        </React.Fragment>
      ))}
    </div>
  );
}

function milestoneDate(dateText: string) {
  const values = dateText.match(/\d{1,2}\/\d{1,2}(?:\/\d{4})?/g) || [];
  const last = values[values.length - 1]?.match(/(\d{1,2})\/(\d{1,2})(?:\/(\d{4}))?/);
  if (!last) return null;
  return new Date(Number(last[3] || 2026), Number(last[2]) - 1, Number(last[1]), 23, 59, 59);
}

function parseVN(dStr: string | undefined | null) {
  if (!dStr) return new Date();
  let val = dStr.trim();
  if (!val.includes('Z') && !/\+\d{2}:?\d{2}$/.test(val) && !/-\d{2}:?\d{2}$/.test(val)) {
    val = `${val}+07:00`;
  }
  return new Date(val);
}

export default function TimelinePage() {
  const registerUrl =
    'https://docs.google.com/forms/d/e/1FAIpQLSdlRmaBRgPAl_rbLjDOY__ROcyZsCOnoxec2izDhRVJTcHBfA/viewform';

  const [settings, setSettings] = useState<any>(null);
  const [events, setEvents] = useState<any[]>([]);
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
        if (settingsRes.ok) { const d = await settingsRes.json(); setSettings(d); }
        if (timelineRes.ok) { const d = await timelineRes.json(); setEvents(d); }
      } catch (err) {
        console.error('Failed to load timeline data', err);
      }
    }
    loadData();
  }, []);

  const roundsList = [
    {
      title: 'Vòng loại', eyebrow: 'Giai đoạn 01',
      summary: 'Hoàn tất hồ sơ đăng ký, tập huấn định hướng và công bố kết quả vòng loại.',
      color: '#FDE047', bg: 'from-[#FDE047]/14 to-[#0A2FFF]/8', steps: [] as any[]
    },
    {
      title: 'Vòng bán kết', eyebrow: 'Giai đoạn 02',
      summary: 'Đào tạo chuyên sâu, hoàn thiện thuyết minh và thi bán kết tại HUIT Startup Open Day.',
      color: '#79BCC2', bg: 'from-[#79BCC2]/16 to-[#0A2FFF]/8', steps: [] as any[]
    },
    {
      title: 'Vòng chung kết', eyebrow: 'Giai đoạn 03',
      summary: 'Kiểm chứng thị trường, kết nối nguồn lực, bình chọn online và thuyết trình chung kết.',
      color: '#F97316', bg: 'from-[#F97316]/14 to-[#79BCC2]/8', steps: [] as any[]
    }
  ];

  if (events && events.length > 0) {
    events.filter((e: any) => e.isActive).forEach((e: any) => {
      const r = roundsList.find(r => r.title === e.round);
      if (r) r.steps.push(e);
    });
  }

  const staticRounds = [
    {
      title: 'Vòng loại', eyebrow: 'Giai đoạn 01',
      summary: 'Hoàn tất hồ sơ đăng ký, tập huấn định hướng và công bố kết quả vòng loại.',
      color: '#FDE047', bg: 'from-[#FDE047]/14 to-[#0A2FFF]/8',
      steps: [
        { date: '15/5 - 15/6/2026', title: 'Nhận hồ sơ đăng ký dự thi', isImportant: true },
        { date: '17/06/2026', title: 'Tập huấn định hướng', isImportant: false },
        { date: '20/6/2026', title: 'Hạn chót nộp hồ sơ vòng loại', isImportant: true },
        { date: '27/6 - 28/6/2026', title: 'Chấm hồ sơ vòng loại', isImportant: false },
        { date: '30/6/2026', title: 'Công bố kết quả vòng loại', isImportant: true },
      ],
    },
    {
      title: 'Vòng bán kết', eyebrow: 'Giai đoạn 02',
      summary: 'Đào tạo chuyên sâu, hoàn thiện thuyết minh và thi bán kết tại HUIT Startup Open Day.',
      color: '#79BCC2', bg: 'from-[#79BCC2]/16 to-[#0A2FFF]/8',
      steps: [
        { date: '04/7 - 05/7/2026', title: 'Đào tạo, huấn luyện kỹ năng khởi nghiệp đổi mới sáng tạo', isImportant: false },
        { date: '19/7/2026', title: 'Hạn chót nộp bản thuyết minh dự án hoàn chỉnh', isImportant: true },
        { date: '25/7/2026', title: 'Thi bán kết, trưng bày sản phẩm hoặc dịch vụ', isImportant: true },
        { date: '25/7/2026', title: 'Chọn Top 10 đội mỗi bảng vào vòng chung kết', isImportant: true },
      ],
    },
    {
      title: 'Vòng chung kết', eyebrow: 'Giai đoạn 03',
      summary: 'Kiểm chứng thị trường, kết nối nguồn lực, bình chọn online và thuyết trình chung kết.',
      color: '#F97316', bg: 'from-[#F97316]/14 to-[#79BCC2]/8',
      steps: [
        { date: '01/8 - 16/8/2026', title: 'HUIT Startup Tour và kiểm chứng thực tế dự án', isImportant: false },
        { date: '17/8 - 17/9/2026', title: 'Kết nối nhà đầu tư, cố vấn và hoàn thiện định hướng phát triển', isImportant: false },
        { date: '20/9/2026', title: 'Hỗ trợ hoàn thiện thuyết minh dự án và kế hoạch kinh doanh', isImportant: false },
        { date: '21/9 - 28/9/2026', title: 'Vòng chung kết online', isImportant: true },
        { date: '03/10/2026', title: 'Trưng bày sản phẩm, dịch vụ và thuyết trình chung kết', isImportant: true },
      ],
    },
  ];

  const displayRounds = events && events.length > 0 ? roundsList : staticRounds;

  const keyMilestones = events && events.length > 0
    ? events
      .filter((e: any) => e.isActive && e.isImportant)
      .map((e: any) => {
        let displayDate = e.date;
        if (displayDate.includes('/2026')) displayDate = displayDate.replace('/2026', '');
        let displayTitle = e.title;
        if (displayTitle.toLowerCase().includes('nhận hồ sơ')) displayTitle = 'Nhận hồ sơ đăng ký dự thi';
        else if (displayTitle.toLowerCase().includes('hạn chót nộp') || displayTitle.toLowerCase().includes('hạn nộp')) displayTitle = 'Hạn chót nộp hồ sơ';
        else if (displayTitle.toLowerCase().includes('bán kết')) displayTitle = 'Vòng Bán kết';
        else if (displayTitle.toLowerCase().includes('chung kết')) displayTitle = 'Vòng Chung kết';

        if (displayTitle.length > 45) {
          displayTitle = displayTitle.substring(0, 42) + '...';
        }
        return [displayDate, displayTitle];
      })
    : [
      ['15/5', 'Mở nhận hồ sơ'],
      ['20/6', 'Hạn nộp vòng loại'],
      ['25/7', 'Vòng Bán kết'],
      ['03/10', 'Vòng Chung kết'],
    ];
  const currentMilestoneIndex = useMemo(() => {
    if (!isMounted) return 0;
    const today = new Date();
    const lastPassedIndex = [...keyMilestones].reverse().findIndex(([date]) => {
      const parsed = milestoneDate(date);
      return parsed ? parsed <= today : false;
    });
    return lastPassedIndex >= 0
      ? (keyMilestones.length - 1 - lastPassedIndex)
      : 0;
  }, [keyMilestones, isMounted]);

  const isRegistrationOpen = !isMounted || (settings
    ? settings.isRegistrationOpen !== false &&
      (!settings.registrationDeadline || parseVN(settings.registrationDeadline).getTime() >= Date.now())
    : true);

  if (!isMounted) return null;

  return (
    <>
      <style>{`
        .iUzfqH { background: transparent; background-position: center; }
        @keyframes fadeUpTimeline { from{opacity:0;transform:translateY(26px)} to{opacity:1;transform:translateY(0)} }
        .timeline-enter { animation: fadeUpTimeline 0.85s cubic-bezier(0.16,1,0.3,1) both; }
        @keyframes pulseNode {
          0%,100%{box-shadow:0 0 0 6px rgba(10, 47, 255, 0.15), 0 10px 24px -4px rgba(10, 47, 255, 0.45)}
          50%{box-shadow:0 0 0 12px rgba(10, 47, 255, 0.25), 0 10px 30px -3px rgba(10, 47, 255, 0.55)}
        }
        .timeline-node-anim { animation: pulseNode 3s ease-in-out infinite; }

        .timeline-tracker {
          display: flex !important;
          flex-wrap: nowrap !important;
          justify-content: space-between !important;
          align-items: flex-start !important;
          gap: 10px !important;
          overflow-x: auto !important;
          scrollbar-width: none !important;
          -webkit-overflow-scrolling: touch !important;
          width: 100% !important;
          position: relative !important;
          padding: 58px 44px 34px !important;
          background:
            radial-gradient(circle at 18% 0%, rgba(121, 188, 194, 0.16), transparent 34%),
            radial-gradient(circle at 82% 12%, rgba(10, 47, 255, 0.08), transparent 30%),
            rgba(255, 255, 255, 0.74) !important;
          border: 1px solid rgba(255, 255, 255, 0.86) !important;
          border-radius: 34px !important;
          box-shadow:
            0 28px 80px -36px rgba(15, 23, 42, 0.35),
            0 14px 32px -28px rgba(10, 47, 255, 0.45),
            inset 0 1px 0 rgba(255, 255, 255, 0.95) !important;
          backdrop-filter: blur(22px) saturate(140%) !important;
          transition: border-color 0.3s ease, box-shadow 0.3s ease;
        }
        :root[data-theme='dark'] .timeline-tracker {
          background:
            radial-gradient(circle at 18% 0%, rgba(121, 188, 194, 0.14), transparent 34%),
            radial-gradient(circle at 82% 12%, rgba(10, 47, 255, 0.18), transparent 32%),
            rgba(15, 23, 42, 0.58) !important;
          border: 1px solid rgba(255, 255, 255, 0.1) !important;
          box-shadow:
            0 32px 90px -30px rgba(0, 0, 0, 0.55),
            inset 0 1px 0 rgba(255, 255, 255, 0.06) !important;
        }
        .timeline-tracker::-webkit-scrollbar { display: none !important; }

        /* Seamless progress bar background */
        .timeline-progress-bar {
          position: absolute !important;
          top: 92px !important;
          left: 116px !important;
          right: 88px !important;
          height: 4px !important;
          background: linear-gradient(90deg, #dbe5ef, #eef2f7) !important;
          border-radius: 999px !important;
          z-index: 1 !important;
          transform: translateY(-50%) !important;
          box-shadow: inset 0 1px 2px rgba(15, 23, 42, 0.08) !important;
        }
        :root[data-theme='dark'] .timeline-progress-bar {
          background: rgba(148, 163, 184, 0.22) !important;
        }
        .timeline-progress-bar-active {
          position: absolute !important;
          top: 0 !important;
          left: 0 !important;
          height: 100% !important;
          background: linear-gradient(90deg, #10B981 0%, #14B8A6 48%, #0A2FFF 100%) !important;
          border-radius: 999px !important;
          z-index: 1 !important;
          transition: width 0.5s cubic-bezier(0.16, 1, 0.3, 1) !important;
          box-shadow: 0 0 18px rgba(10, 47, 255, 0.24) !important;
        }

        .timeline-node-wrap {
          flex-shrink: 0 !important;
          width: 144px !important;
          align-self: flex-start !important;
          transition: transform 0.3s cubic-bezier(0.16, 1, 0.3, 1) !important;
          display: flex !important;
          flex-direction: column !important;
          align-items: center !important;
          position: relative !important;
          z-index: 2 !important;
        }
        .timeline-node-wrap:hover {
          transform: translateY(-5px);
        }

        .timeline-circle-container {
          position: relative !important;
          height: 68px !important;
          display: flex !important;
          align-items: center !important;
          justify-content: center !important;
          width: 100% !important;
        }

        /* Premium node styles */
        .timeline-node {
          width: 54px !important;
          height: 54px !important;
          border-radius: 50% !important;
          border: 4px solid rgba(255, 255, 255, 0.92) !important;
          display: flex !important;
          align-items: center !important;
          justify-content: center !important;
          transition: all 0.3s ease !important;
          box-shadow: 0 10px 24px -14px rgba(15, 23, 42, 0.45) !important;
          position: relative !important;
        }
        .timeline-node.done {
          background: linear-gradient(135deg, #10B981, #059669) !important;
          color: #fff !important;
          box-shadow:
            0 12px 24px -10px rgba(16, 185, 129, 0.65),
            0 0 0 6px rgba(16, 185, 129, 0.13) !important;
        }
        .timeline-node.current {
          width: 66px !important;
          height: 66px !important;
          background: linear-gradient(135deg, #0A2FFF 0%, #4f46e5 58%, #79BCC2 100%) !important;
          color: #fff !important;
          box-shadow:
            0 0 0 6px rgba(10, 47, 255, 0.15),
            0 18px 34px -12px rgba(10, 47, 255, 0.62) !important;
        }
        .timeline-node.upcoming {
          background: rgba(248, 250, 252, 0.9) !important;
          border: 3px solid #9fb0c4 !important;
          color: #475569 !important;
        }
        :root[data-theme='dark'] .timeline-node.upcoming {
          background: rgba(255, 255, 255, 0.06) !important;
          border: 3px solid rgba(203, 213, 225, 0.42) !important;
          color: #cbd5e1 !important;
        }

        /* Floating indicator badge */
        .you-are-here {
          position: absolute !important;
          top: -42px !important;
          left: 50% !important;
          transform: translateX(-50%) !important;
          background: linear-gradient(135deg, #0A2FFF, #1d4ed8) !important;
          color: #fff !important;
          font-size: 9px !important;
          font-weight: 900 !important;
          text-transform: uppercase !important;
          letter-spacing: 0.1em !important;
          padding: 5px 12px !important;
          border-radius: 20px !important;
          white-space: nowrap !important;
          box-shadow:
            0 10px 22px -8px rgba(10, 47, 255, 0.55),
            0 0 0 1px rgba(255, 255, 255, 0.15) !important;
          display: inline-flex !important;
          align-items: center !important;
          gap: 4px !important;
          z-index: 10 !important;
        }
        .you-are-here::before {
          content: '';
          display: inline-block;
          width: 4px;
          height: 4px;
          border-radius: 50%;
          background: #fff;
          box-shadow: 0 0 3px #fff;
          animation: dotPulse 1.5s ease-in-out infinite;
        }
        @keyframes dotPulse {
          0%, 100% { opacity: 0.3; }
          50% { opacity: 1; }
        }
        .you-are-here::after {
          content: '';
          position: absolute !important;
          bottom: -4px !important;
          left: 50% !important;
          transform: translateX(-50%) rotate(45deg) !important;
          width: 8px !important;
          height: 8px !important;
          background: #1237f4 !important;
        }

        /* Node label texts styling */
        .timeline-node-label {
          display: flex !important;
          flex-direction: column !important;
          align-items: center !important;
          gap: 7px !important;
          margin-top: 10px !important;
          width: 100% !important;
          padding: 0 4px !important;
        }
        .timeline-node-date {
          font-size: 15.5px !important;
          font-weight: 900 !important;
          background: linear-gradient(135deg, #ea580c, #f97316) !important;
          -webkit-background-clip: text !important;
          background-clip: text !important;
          -webkit-text-fill-color: transparent !important;
          color: transparent !important;
          min-height: 22px !important;
          display: flex !important;
          align-items: center !important;
          justify-content: center !important;
        }
        :root[data-theme='dark'] .timeline-node-date {
          background: linear-gradient(135deg, #fb923c, #fdba74) !important;
          -webkit-background-clip: text !important;
          background-clip: text !important;
        }
        .timeline-node-name {
          font-size: 11.5px !important;
          font-weight: 800 !important;
          color: #475569 !important;
          min-height: 50px !important;
          display: flex !important;
          align-items: flex-start !important;
          justify-content: center !important;
          overflow: visible !important;
          text-overflow: unset !important;
          white-space: normal !important;
          line-height: 1.28 !important;
          text-align: center !important;
          margin-top: 2px !important;
          text-wrap: balance !important;
        }
        :root[data-theme='dark'] .timeline-node-name {
          color: #cbd5e1 !important;
        }
        @media (max-width: 1024px) {
          .timeline-tracker {
            justify-content: flex-start !important;
            padding-inline: 26px !important;
          }
          .timeline-progress-bar {
            left: 98px !important;
            right: 70px !important;
          }
        }
        @media (max-width: 640px) {
          .timeline-tracker {
            padding: 54px 20px 28px !important;
            border-radius: 26px !important;
          }
          .timeline-node-wrap {
            width: 126px !important;
          }
          .timeline-progress-bar {
            top: 88px !important;
            left: 83px !important;
            right: 58px !important;
          }
          .timeline-node {
            width: 50px !important;
            height: 50px !important;
          }
          .timeline-node.current {
            width: 60px !important;
            height: 60px !important;
          }
          .timeline-node-name {
            font-size: 10.5px !important;
          }
        }
      `}</style>

      <main className="sc-908a50-0 iUzfqH theme-page timeline-theme-page flex-1 min-h-screen mt-[-72px] pt-[120px] sm:pt-[150px] pb-16 sm:pb-24 relative overflow-hidden">
        <div className="absolute top-[8%] left-[-16%] h-[520px] w-[520px] rounded-full bg-[#0A2FFF]/10 blur-[130px] pointer-events-none" />
        <div className="absolute top-[42%] right-[-14%] h-[620px] w-[620px] rounded-full bg-[#79BCC2]/10 blur-[150px] pointer-events-none" />
        <div className="absolute bottom-[4%] left-[15%] h-[360px] w-[360px] rounded-full bg-[#F97316]/8 blur-[120px] pointer-events-none" />

        <div className="relative z-10 mx-auto w-full max-w-[1320px] px-4 sm:px-6">
          {/* Hero Section */}
          <section className="timeline-enter text-center">
            {/* Breadcrumb */}
            <div style={{ display:'flex', alignItems:'center', justifyContent:'center', gap:6, marginBottom:18, fontSize:12, color:'var(--site-muted)' }}>
              <Link href="/" style={{ color:'var(--site-primary)', textDecoration:'none' }}>Trang chủ</Link>
              <span>›</span>
              <span>Thời gian</span>
            </div>
            <span className="inline-flex rounded-full border border-blue-500/25 bg-blue-500/10 px-4 py-2 text-[11px] font-extrabold uppercase tracking-[0.28em] text-blue-600 dark:text-blue-400">
              {isMounted && settings?.aboutTitle ? settings.aboutTitle : "HUIT STARTUP LẦN THỨ VII 2026"}
            </span>
            <h1 className="mx-auto mt-5 max-w-[900px] text-[32px] sm:text-[54px] font-black uppercase leading-[1.05] text-neutral-900 dark:text-white">
              Thời gian các vòng thi
            </h1>
            <p className="mx-auto mt-5 max-w-[780px] text-[15px] sm:text-[17px] leading-relaxed text-neutral-700 dark:text-white/72 font-light">
              Theo dõi toàn bộ lộ trình từ vòng loại, bán kết đến chung kết để chuẩn bị hồ sơ, hoàn thiện dự án và tham gia đúng hạn.
            </p>
            <div className="mx-auto mt-6 h-[3.5px] w-[82px] rounded-full bg-gradient-to-r from-[#0A2FFF] to-[#79BCC2]" />

            <div className="mt-8 flex flex-wrap justify-center gap-3">
              {!isMounted ? (
                <a
                  href={registerUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="rounded-full bg-gradient-to-r from-[#0A2FFF] to-[#79BCC2] px-8 py-3.5 text-[14px] font-extrabold uppercase tracking-wider text-white shadow-[0_10px_30px_rgba(10,47,255,0.35)] transition hover:scale-[1.03]"
                >
                  Đăng ký ngay
                </a>
              ) : isRegistrationOpen ? (
                <a
                  href={settings?.registrationUrl || registerUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="rounded-full bg-gradient-to-r from-[#0A2FFF] to-[#79BCC2] px-8 py-3.5 text-[14px] font-extrabold uppercase tracking-wider text-white shadow-[0_10px_30px_rgba(10,47,255,0.35)] transition hover:scale-[1.03]"
                >
                  Đăng ký ngay
                </a>
              ) : (
                <button
                  disabled
                  className="rounded-full bg-neutral-300 dark:bg-white/10 px-8 py-3.5 text-[14px] font-extrabold uppercase tracking-wider text-neutral-500 dark:text-white/40 cursor-not-allowed"
                >
                  Đã đóng đăng ký
                </button>
              )}
              <Link
                href="/gioi-thieu"
                className="rounded-full border border-neutral-300 dark:border-white/20 bg-neutral-100 dark:bg-white/8 px-8 py-3.5 text-[14px] font-bold uppercase tracking-wider text-neutral-800 dark:text-white transition hover:border-[#79BCC2]/60 hover:bg-neutral-200 dark:hover:bg-white/12"
              >
                Thông tin cuộc thi
              </Link>
            </div>
          </section>

          {/* === TIMELINE TRACKER === */}
          <section className="timeline-enter mt-5" style={{ animationDelay: '120ms' }}>
            <div style={{ textAlign:'center', marginBottom:12 }}>
              <p style={{ fontSize:11, fontWeight:800, textTransform:'uppercase', letterSpacing:'0.2em', color:'var(--site-muted)', marginBottom:4 }}>Lịch trình tổng quan</p>
              <h3 style={{ fontSize:'clamp(16px,2vw,22px)', fontWeight:900, color:'var(--site-text)', margin:0 }}>Mốc quan trọng</h3>
              <p className="mt-1 text-[13px] text-[var(--site-muted)] sm:hidden">Vuốt ngang để xem toàn bộ lộ trình</p>
            </div>
            <div className="timeline-tracker">
              {/* Seamless progress bar background */}
              <div className="timeline-progress-bar">
                <div
                  className="timeline-progress-bar-active"
                  style={{ width: `${(currentMilestoneIndex / (keyMilestones.length - 1)) * 100}%` }}
                />
              </div>
              {keyMilestones.map(([date, label], i) => {
                const isDone = i < currentMilestoneIndex;
                const isCurrent = i === currentMilestoneIndex;
                return (
                  <div key={`milestone-${i}`} className="timeline-node-wrap">
                    <div className="timeline-circle-container">
                      <div aria-current={isCurrent ? 'step' : undefined} className={`timeline-node ${isDone ? 'done' : isCurrent ? 'current' : 'upcoming'} ${isCurrent ? 'timeline-node-anim' : ''}`}>
                        {isDone ? (
                          <svg width="18" height="18" fill="none" stroke="currentColor" strokeWidth="3" viewBox="0 0 24 24">
                            <polyline points="20 6 9 17 4 12" />
                          </svg>
                        ) : (
                          <span style={{ fontSize:13, fontWeight:900 }}>{i+1}</span>
                        )}
                        {isCurrent && <div className="you-are-here">Bạn đang ở đây</div>}
                      </div>
                    </div>
                    <div className="timeline-node-label">
                      <div className="timeline-node-date">{date}</div>
                      <div className="timeline-node-name">{label}</div>
                    </div>
                  </div>
                );
              })}
            </div>
          </section>

          {/* Round Cards */}
          <section className="mt-14 space-y-14">
            {displayRounds.map((round, roundIndex) => (
              <div key={round.title} className="timeline-enter" style={{ animationDelay: `${roundIndex * 130 + 220}ms` }}>
                <div className={`relative overflow-hidden rounded-[30px] border border-neutral-200 dark:border-white/10 bg-white/70 dark:bg-gradient-to-br ${round.bg} p-5 sm:p-7 shadow-[0_26px_90px_rgba(0,0,0,0.1)] dark:shadow-[0_26px_90px_rgba(0,0,0,0.26)] backdrop-blur-[12px]`}>
                  <div className="absolute inset-x-0 top-0 h-[4px]" style={{ backgroundColor: round.color }} />

                  <div className="flex flex-col items-center gap-3 border-b border-neutral-200 dark:border-white/10 pb-6 text-center">
                    <div>
                      <p className="text-[12px] font-black uppercase tracking-[0.28em]" style={{ color: round.color }}>
                        {round.eyebrow}
                      </p>
                      <h2 className="mt-2 text-[28px] sm:text-[40px] font-black uppercase text-neutral-900 dark:text-white">{round.title}</h2>
                    </div>
                    <p className="max-w-[640px] text-[14px] sm:text-[15px] leading-relaxed text-neutral-600 dark:text-white/70">
                      {round.summary}
                    </p>
                  </div>

                  <div className="mt-8 grid grid-cols-1 gap-5 md:grid-cols-2 xl:grid-cols-3">
                    {round.steps.map((stepObj: any, index: number) => {
                      const stepNum = String(index + 1).padStart(2, '0');
                      return (
                        <article
                          key={`${round.title}-${stepNum}`}
                          className="group relative min-h-[190px] overflow-hidden rounded-[24px] border border-neutral-200/60 dark:border-white/12 bg-white/60 dark:bg-white/[0.08] shadow-[0_18px_48px_rgba(0,0,0,0.05)] dark:shadow-[0_18px_48px_rgba(0,0,0,0.2)] backdrop-blur-md transition duration-300 hover:-translate-y-1.5 hover:border-neutral-300 dark:hover:border-white/24 hover:bg-white/80 dark:hover:bg-white/[0.12]"
                        >
                          <div className="absolute inset-y-0 left-0 w-1.5" style={{ backgroundColor: round.color }} />
                          <div className="absolute right-[-42px] top-[-44px] h-[132px] w-[132px] rounded-full opacity-15 transition group-hover:scale-110 group-hover:opacity-25" style={{ backgroundColor: round.color }} />
                          <div className="relative flex h-full flex-col p-5">
                            <div className="flex items-start justify-between gap-4">
                              <div>
                                <p className="text-[11px] font-black uppercase tracking-[0.22em] text-neutral-500 dark:text-white/48">Step {stepNum}</p>
                                <p className="mt-2 text-[22px] font-black leading-tight text-neutral-900 dark:text-white">{stepObj.date}</p>
                              </div>
                              <div
                                className="timeline-node-anim flex h-12 w-12 shrink-0 items-center justify-center rounded-full text-[18px] font-black text-[#071034] shadow-[0_10px_24px_rgba(0,0,0,0.25)]"
                                style={{ backgroundColor: round.color, animationDelay: `${index * 160}ms` }}
                              >
                                {stepNum}
                              </div>
                            </div>
                            <div className="mt-6 flex flex-1 flex-col justify-between">
                              <h3 className="text-[17px] font-extrabold leading-snug text-neutral-900 dark:text-white">{stepObj.title}</h3>
                              <div className="mt-5 flex items-center justify-between gap-3 border-t border-neutral-200 dark:border-white/10 pt-4">
                                {stepObj.isImportant ? (
                                  <span className="inline-flex rounded-full border border-amber-500/35 bg-amber-500/10 dark:border-[#FDE047]/35 dark:bg-[#FDE047]/12 px-3 py-1 text-[10px] font-black uppercase tracking-wider text-amber-600 dark:text-[#FDE047]">
                                    ⚡ Mốc quan trọng
                                  </span>
                                ) : (
                                  <span className="text-[10px] font-bold uppercase tracking-wider text-neutral-500 dark:text-white/38">Theo lộ trình</span>
                                )}
                                <span className="h-2 w-2 rounded-full" style={{ backgroundColor: round.color }} />
                              </div>
                            </div>
                          </div>
                        </article>
                      );
                    })}
                  </div>
                </div>
              </div>
            ))}
          </section>

          {/* CTA Section with Countdown */}
          <section className="timeline-enter countdown-container" style={{ animationDelay: '520ms' }}>
            <p className="countdown-eyebrow">
              Còn bao lâu nữa?
            </p>
            <h2 className="countdown-title">
              Đừng bỏ lỡ mốc đăng ký!
            </h2>

            <CountdownTimer targetDate={isMounted && settings?.registrationDeadline ? settings.registrationDeadline : "2026-06-20T23:59:59"} />

            <p className="countdown-desc">
              Hãy chuẩn bị hồ sơ sớm để đội thi có đủ thời gian hoàn thiện ý tưởng, sản phẩm và kế hoạch triển khai.
            </p>

            {!isMounted ? (
              <a
                href={registerUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="mt-8 inline-flex items-center justify-center rounded-full px-10 py-4 text-[14px] font-extrabold uppercase tracking-wider transition-all duration-300 countdown-cta-btn"
              >
                Đăng ký ngay →
              </a>
            ) : isRegistrationOpen ? (
              <a
                href={settings?.registrationUrl || registerUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="mt-8 inline-flex items-center justify-center rounded-full px-10 py-4 text-[14px] font-extrabold uppercase tracking-wider transition-all duration-300 countdown-cta-btn"
              >
                Đăng ký ngay →
              </a>
            ) : (
              <button
                disabled
                className="mt-8 inline-flex items-center justify-center rounded-full bg-neutral-300 dark:bg-white/10 px-10 py-4 text-[14px] font-extrabold uppercase tracking-wider text-neutral-500 dark:text-white/40 cursor-not-allowed"
              >
                Đã đóng đăng ký
              </button>
            )}
          </section>
        </div>
      </main>
    </>
  );
}
