'use client';

import React from 'react';
import { createPortal } from 'react-dom';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { apiUrl } from './api';
import { useLanguage } from '@/src/i18n/use-language';

const dashboardIcon = (
  <svg viewBox="0 0 24 24" className="h-[18px] w-[18px]" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <rect x="3" y="3" width="7" height="9" rx="1.5" />
    <rect x="14" y="3" width="7" height="5" rx="1.5" />
    <rect x="14" y="12" width="7" height="9" rx="1.5" />
    <rect x="3" y="16" width="7" height="5" rx="1.5" />
  </svg>
);

const candidatesIcon = (
  <svg viewBox="0 0 24 24" className="h-[18px] w-[18px]" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M17 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
    <circle cx="9.5" cy="7" r="4" />
    <path d="M22 21v-2a4 4 0 0 0-3-3.87" />
    <path d="M16 3.13a4 4 0 0 1 0 7.75" />
  </svg>
);

const usersIcon = (
  <svg viewBox="0 0 24 24" className="h-[18px] w-[18px]" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
    <circle cx="9" cy="7" r="4" />
    <path d="M22 11h-6" />
    <path d="M19 8v6" />
  </svg>
);

const sponsorsIcon = (
  <svg viewBox="0 0 24 24" className="h-[18px] w-[18px]" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M12 3 3 8l9 5 9-5-9-5Z" />
    <path d="m3 14 9 5 9-5" />
    <path d="m3 11 9 5 9-5" />
  </svg>
);

const newsIcon = (
  <svg viewBox="0 0 24 24" className="h-[18px] w-[18px]" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M4 19.5A2.5 2.5 0 0 0 6.5 22H20" />
    <path d="M4 4h16v13a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V4Z" />
    <path d="M8 8h8" />
    <path d="M8 12h8" />
  </svg>
);

const votesIcon = (
  <svg viewBox="0 0 24 24" className="h-[18px] w-[18px]" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M9 11l3 3L22 4" />
    <path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11" />
  </svg>
);

const bannerIcon = (
  <svg viewBox="0 0 24 24" className="h-[18px] w-[18px]" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <rect x="3" y="5" width="18" height="14" rx="2" />
    <circle cx="8" cy="10" r="1.5" />
    <path d="m21 15-5-5L5 19" />
  </svg>
);

const introIcon = (
  <svg viewBox="0 0 24 24" className="h-[18px] w-[18px]" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
    <polyline points="14 2 14 8 20 8" />
    <line x1="16" y1="13" x2="8" y2="13" />
    <line x1="16" y1="17" x2="8" y2="17" />
  </svg>
);

const timelineIcon = (
  <svg viewBox="0 0 24 24" className="h-[18px] w-[18px]" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M12 8v5l3 2" />
    <circle cx="12" cy="12" r="9" />
  </svg>
);

const settingsIcon = (
  <svg viewBox="0 0 24 24" className="h-[18px] w-[18px]" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M12 15a3 3 0 1 0 0-6 3 3 0 0 0 0 6Z" />
    <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 1 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 1 1-4 0v-.09a1.65 1.65 0 0 0-1-1.51 1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 1 1-2.83-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 1 1 0-4h.09a1.65 1.65 0 0 0 1.51-1 1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 1 1 2.83-2.83l.06.06a1.65 1.65 0 0 0 1.82.33 1.65 1.65 0 0 0 1-1.51V3a2 2 0 1 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 1 1 2.83 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 1 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1Z" />
  </svg>
);

const guidesIcon = (
  <svg viewBox="0 0 24 24" className="h-[18px] w-[18px]" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z" />
    <path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z" />
  </svg>
);

const trashIcon = (
  <svg viewBox="0 0 24 24" className="h-[18px] w-[18px]" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M3 6h18" />
    <path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6" />
    <path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2" />
    <line x1="10" y1="11" x2="10" y2="17" />
    <line x1="14" y1="11" x2="14" y2="17" />
  </svg>
);

const monitoringIcon = (
  <svg viewBox="0 0 24 24" className="h-[18px] w-[18px]" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M3 3v18h18" /><path d="m7 16 3-4 3 2 5-7" />
  </svg>
);

const navGroupsVi = [
  {
    title: 'Quản lý',
    items: [
      { href: '/admin', label: 'Tổng quan', icon: dashboardIcon },
      { href: '/admin/candidates', label: 'Thí sinh', icon: candidatesIcon },
      { href: '/admin/votes', label: 'Lịch sử bình chọn', icon: votesIcon },
      { href: '/admin/users', label: 'Người dùng', icon: usersIcon },
      { href: '/admin/sponsors', label: 'Nhà tài trợ', icon: sponsorsIcon },
      { href: '/admin/news', label: 'Tin tức', icon: newsIcon },
      { href: '/admin/trash', label: 'Thùng rác', icon: trashIcon },
      { href: '/admin/monitoring', label: 'Giám sát hệ thống', icon: monitoringIcon },
    ],
  },
  {
    title: 'Nội dung',
    items: [
      { href: '/admin/banners', label: 'Banner', icon: bannerIcon },
      { href: '/admin/introduction', label: 'Thông tin cuộc thi', icon: introIcon },
      { href: '/admin/timeline', label: 'Mốc thời gian', icon: timelineIcon },
      { href: '/admin/guides', label: 'Hướng dẫn', icon: guidesIcon },
      { href: '/admin/settings', label: 'Cài đặt', icon: settingsIcon },
    ],
  },
];

const navGroupsEn = [
  {
    title: 'Management',
    items: [
      { href: '/admin', label: 'Overview', icon: dashboardIcon },
      { href: '/admin/candidates', label: 'Candidates', icon: candidatesIcon },
      { href: '/admin/votes', label: 'Vote History', icon: votesIcon },
      { href: '/admin/users', label: 'Users', icon: usersIcon },
      { href: '/admin/sponsors', label: 'Sponsors', icon: sponsorsIcon },
      { href: '/admin/news', label: 'News', icon: newsIcon },
      { href: '/admin/trash', label: 'Trash Bin', icon: trashIcon },
      { href: '/admin/monitoring', label: 'System Logs', icon: monitoringIcon },
    ],
  },
  {
    title: 'Content',
    items: [
      { href: '/admin/banners', label: 'Banners', icon: bannerIcon },
      { href: '/admin/introduction', label: 'Introduction', icon: introIcon },
      { href: '/admin/timeline', label: 'Timeline', icon: timelineIcon },
      { href: '/admin/guides', label: 'Guidelines', icon: guidesIcon },
      { href: '/admin/settings', label: 'Settings', icon: settingsIcon },
    ],
  },
];

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000';

const pageMetaVi: Record<string, { title: string; description: string }> = {
  '/admin': { title: 'Tổng quan', description: 'Theo dõi trạng thái nền tảng và dữ liệu vận hành.' },
  '/admin/candidates': { title: 'Thí sinh', description: 'Quản lý danh sách thí sinh, điểm bình chọn và hồ sơ hiển thị.' },
  '/admin/votes': { title: 'Lịch sử bình chọn', description: 'Theo dõi nhật ký phiếu bầu chi tiết và xuất dữ liệu đối soát.' },
  '/admin/users': { title: 'Người dùng', description: 'Kiểm soát tài khoản và phân quyền truy cập hệ thống.' },
  '/admin/sponsors': { title: 'Nhà tài trợ', description: 'Cập nhật đối tác đồng hành và tài nguyên thương hiệu.' },
  '/admin/news': { title: 'Tin tức', description: 'Quản trị nội dung cập nhật và thông báo quan trọng.' },
  '/admin/trash': { title: 'Thùng rác', description: 'Xem, khôi phục hoặc xóa vĩnh viễn dữ liệu đã xóa (tự hủy sau 30 ngày).' },
  '/admin/monitoring': { title: 'Giám sát hệ thống', description: 'Theo dõi hoạt động quản trị và lỗi API gần đây.' },
  '/admin/banners': { title: 'Banner', description: 'Điều chỉnh hình ảnh chiến dịch và điểm chạm chính.' },
  '/admin/introduction': { title: 'Thông tin cuộc thi', description: 'Quản lý phần giới thiệu và nội dung landing page.' },
  '/admin/timeline': { title: 'Mốc thời gian', description: 'Cập nhật lịch trình và trạng thái các vòng thi.' },
  '/admin/guides': { title: 'Hướng dẫn', description: 'Cấu hình nội dung hướng dẫn bình chọn và bảng quy đổi điểm.' },
  '/admin/settings': { title: 'Cài đặt', description: 'Thiết lập hệ thống, promotion và trạng thái hoạt động.' },
};

const pageMetaEn: Record<string, { title: string; description: string }> = {
  '/admin': { title: 'Overview', description: 'Monitor platform status and live operational metrics.' },
  '/admin/candidates': { title: 'Candidates', description: 'Manage contestant entries, scores, and public profiles.' },
  '/admin/votes': { title: 'Vote History', description: 'Track audit trails of votes and export financial records.' },
  '/admin/users': { title: 'Users', description: 'Control administrative accounts and role permissions.' },
  '/admin/sponsors': { title: 'Sponsors', description: 'Update official partner profiles and brand assets.' },
  '/admin/news': { title: 'News & Updates', description: 'Publish articles, announcements, and press releases.' },
  '/admin/trash': { title: 'Trash Bin', description: 'View, restore or permanently remove discarded entities.' },
  '/admin/monitoring': { title: 'System Logs', description: 'Monitor system events, audit logs, and API status.' },
  '/admin/banners': { title: 'Banners', description: 'Customize hero carousel banners and call-to-actions.' },
  '/admin/introduction': { title: 'Introduction', description: 'Manage competition info, sectors, and homepage sections.' },
  '/admin/timeline': { title: 'Timeline', description: 'Configure contest stages, milestones, and active rounds.' },
  '/admin/guides': { title: 'Guidelines', description: 'Voting rules, step-by-step guides, and point calculation.' },
  '/admin/settings': { title: 'Settings', description: 'System configuration, promotion banners, and operational toggle.' },
};

function getPageMeta(pathname: string, language: 'vi' | 'en' = 'vi') {
  const metaDict = language === 'en' ? pageMetaEn : pageMetaVi;
  const matched = Object.keys(metaDict)
    .filter((key) => (key === '/' || key === '/admin' ? pathname === key : pathname.startsWith(key)))
    .sort((a, b) => b.length - a.length)[0];
  return metaDict[matched || '/admin'] || metaDict['/admin'];
}

function BellButton() {
  const [isOpen, setIsOpen] = React.useState(false);
  const [settings, setSettings] = React.useState<any>(null);
  const [votes, setVotes] = React.useState<any[]>([]);
  const [readIds, setReadIds] = React.useState<string[]>([]);
  const [readSystemIds, setReadSystemIds] = React.useState<string[]>([]);
  const [mounted, setMounted] = React.useState(false);

  React.useEffect(() => {
    setMounted(true);
  }, []);

  // Load configuration and read notification IDs
  React.useEffect(() => {
    if (typeof window !== 'undefined') {
      const stored = localStorage.getItem('admin_read_vote_ids');
      if (stored) {
        try { setReadIds(JSON.parse(stored)); } catch (e) {}
      }
      const storedSystem = localStorage.getItem('admin_read_system_alert_ids');
      if (storedSystem) {
        try { setReadSystemIds(JSON.parse(storedSystem)); } catch (e) {}
      }
    }

    async function loadSettings() {
      try {
        const res = await fetch(apiUrl('/api/admin/settings'));
        if (res.ok) {
          const data = await res.json();
          setSettings(data);
        }
      } catch (err) {
        console.error(err);
      }
    }

    async function loadRecentVotes() {
      try {
        const res = await fetch(apiUrl('/api/admin/votes?limit=15'));
        if (res.ok) {
          const data = await res.json();
          setVotes(Array.isArray(data) ? data : []);
        }
      } catch (err) {
        console.error(err);
      }
    }

    loadSettings();
    loadRecentVotes();

    const settingsInterval = setInterval(loadSettings, 30000);
    const votesInterval = setInterval(loadRecentVotes, 15000);

    return () => {
      clearInterval(settingsInterval);
      clearInterval(votesInterval);
    };
  }, []);

  // System alerts logic
  const systemAlerts = React.useMemo(() => {
    const list: Array<{ id: string; type: 'info' | 'warning' | 'success'; message: string }> = [];
    if (!settings) return list;
    const parseConfiguredTime = (value: string) => {
      if (!value) return NaN;
      let val = value.trim();
      if (!val.includes('Z') && !/\+\d{2}:?\d{2}$/.test(val) && !/-\d{2}:?\d{2}$/.test(val)) val = `${val}+07:00`;
      return new Date(val).getTime();
    };

    if (settings.isGateOpen) {
      list.push({
        id: `gate-open-${settings.isGateOpen}`,
        type: 'success',
        message: 'Cổng bình chọn đang mở và hoạt động bình thường.',
      });
    } else {
      list.push({
        id: `gate-closed-${settings.isGateOpen}`,
        type: 'warning',
        message: 'Cổng bình chọn đang đóng. Vui lòng mở cổng để người dùng vote.',
      });
    }

    if (settings.isRegistrationOpen) {
      const deadlineStr = (() => {
        if (!settings.registrationDeadline) return 'Chưa cài đặt';
        let val = settings.registrationDeadline.trim();
        if (!val.includes('Z') && !/\+\d{2}:?\d{2}$/.test(val) && !/-\d{2}:?\d{2}$/.test(val)) val = `${val}+07:00`;
        const d = new Date(val);
        try {
          const parts = Object.fromEntries(
            new Intl.DateTimeFormat('en-GB', {
              timeZone: 'Asia/Ho_Chi_Minh',
              year: 'numeric', month: '2-digit', day: '2-digit',
              hour: '2-digit', minute: '2-digit', hour12: false,
            }).formatToParts(d).map((p) => [p.type, p.value])
          );
          return `${parts.hour}:${parts.minute} ngày ${parts.day}/${parts.month}/${parts.year}`;
        } catch { return val; }
      })();
      list.push({
        id: `reg-open-${settings.registrationDeadline || 'none'}`,
        type: 'info',
        message: `Hệ thống đang nhận hồ sơ đăng ký. Hạn chót: ${deadlineStr}.`,
      });
    } else {
      list.push({
        id: `reg-closed-${settings.registrationDeadline || 'none'}`,
        type: 'warning',
        message: 'Hạn nhận hồ sơ đăng ký thí sinh đã kết thúc.',
      });
    }

    const now = Date.now();
    const activePromo = Array.isArray(settings.votingPromotions)
      ? settings.votingPromotions.find((p: any) => {
          if (!p.isEnabled) return false;
          const start = parseConfiguredTime(p.startAt);
          const end = parseConfiguredTime(p.endAt);
          return start <= now && end >= now;
        })
      : null;

    if (activePromo) {
      list.push({
        id: `promo-active-${activePromo.id || activePromo.startAt}-${activePromo.multiplier}`,
        type: 'success',
        message: `Khung giờ vàng đang mở (Điểm vote nhân ×${activePromo.multiplier}).`,
      });
    }

    return list;
  }, [settings]);

  // Calculate unread items
  const unreadVotes = React.useMemo(() => {
    return votes.filter(v => !readIds.includes(v.id));
  }, [votes, readIds]);

  const unreadSystemAlerts = React.useMemo(() => {
    return systemAlerts.filter((alert) => !readSystemIds.includes(alert.id));
  }, [systemAlerts, readSystemIds]);

  const badgeCount = React.useMemo(() => {
    return unreadVotes.length + unreadSystemAlerts.length;
  }, [unreadVotes, unreadSystemAlerts]);

  // Actions
  const handleMarkAsRead = (id: string) => {
    if (readIds.includes(id)) return;
    const updated = [...readIds, id];
    setReadIds(updated);
    localStorage.setItem('admin_read_vote_ids', JSON.stringify(updated));
  };

  const handleMarkSystemAsRead = (id: string) => {
    if (readSystemIds.includes(id)) return;
    const updated = [...readSystemIds, id];
    setReadSystemIds(updated);
    localStorage.setItem('admin_read_system_alert_ids', JSON.stringify(updated));
  };

  const handleMarkAllAsRead = () => {
    const allIds = votes.map(v => v.id);
    const updated = Array.from(new Set([...readIds, ...allIds]));
    const allSystemIds = systemAlerts.map((alert) => alert.id);
    const updatedSystem = Array.from(new Set([...readSystemIds, ...allSystemIds]));
    setReadIds(updated);
    setReadSystemIds(updatedSystem);
    localStorage.setItem('admin_read_vote_ids', JSON.stringify(updated));
    localStorage.setItem('admin_read_system_alert_ids', JSON.stringify(updatedSystem));
  };

  function timeAgo(dateStr: string) {
    const diff = Date.now() - new Date(dateStr).getTime();
    const mins = Math.floor(diff / 60000);
    if (mins < 1) return 'Vừa xong';
    if (mins < 60) return `${mins} phút trước`;
    const hrs = Math.floor(mins / 60);
    if (hrs < 24) return `${hrs} giờ trước`;
    return `${Math.floor(hrs / 24)} ngày trước`;
  }

  return (
    <>
      {/* Notification Bell Button */}
      <button
        type="button"
        onClick={() => setIsOpen(true)}
        className="relative grid h-10 w-10 place-items-center rounded-[14px] border border-slate-200 bg-white text-slate-600 shadow-sm transition hover:border-[var(--primary)] hover:text-[var(--primary-strong)]"
        aria-label="Mở bảng thông báo"
      >
        <svg viewBox="0 0 24 24" className="h-[18px] w-[18px]" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M15 17h5l-1.4-1.4A2 2 0 0 1 18 14.2V11a6 6 0 1 0-12 0v3.2a2 2 0 0 1-.6 1.4L4 17h5" />
          <path d="M10 21a2 2 0 0 0 4 0" />
        </svg>
        {badgeCount > 0 && (
          <span className="absolute right-1.5 top-1.5 flex h-[16px] min-w-[16px] items-center justify-center rounded-full bg-rose-500 px-1 text-[9px] font-bold text-white leading-none">
            {badgeCount}
          </span>
        )}
      </button>

      {/* Slide-over Notification Drawer */}
      {isOpen && mounted && createPortal(
        <div className="fixed inset-0 z-[9999] flex justify-end text-slate-700">
          {/* Backdrop */}
          <div
            className="absolute inset-0 bg-slate-900/40 backdrop-blur-[2px] transition-opacity"
            onClick={() => setIsOpen(false)}
          />

          {/* Drawer content Panel */}
          <div className="relative z-10 flex h-full w-[380px] max-w-full flex-col bg-white shadow-2xl animate-in slide-in-from-right duration-250 ease-out border-l border-slate-200">
            {/* Header */}
            <div className="flex items-center justify-between border-b border-slate-200 px-5 py-4">
              <div>
                <h3 className="text-[16px] font-black text-slate-950">Thông báo hệ thống</h3>
                <p className="mt-0.5 text-xs text-slate-500">
                  {badgeCount > 0 ? `Bạn có ${badgeCount} thông báo chưa xem` : 'Không có thông báo mới'}
                </p>
              </div>
              <button
                type="button"
                onClick={() => setIsOpen(false)}
                className="grid h-8 w-8 place-items-center rounded-lg text-slate-400 hover:bg-slate-100 hover:text-slate-700 transition"
              >
                <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="2.5">
                  <line x1="18" y1="6" x2="6" y2="18" />
                  <line x1="6" y1="6" x2="18" y2="18" />
                </svg>
              </button>
            </div>

            {/* Actions Bar */}
            {badgeCount > 0 && (
              <div className="flex items-center justify-end bg-slate-50 px-5 py-2 border-b border-slate-100">
                <button
                  type="button"
                  onClick={handleMarkAllAsRead}
                  className="text-xs font-bold text-blue-600 hover:text-blue-700 transition"
                >
                  Đánh dấu đã đọc tất cả
                </button>
              </div>
            )}

            {/* Scrollable list */}
            <div className="flex-1 overflow-y-auto px-4 py-3 space-y-4">
              
              {/* Section 1: System Alerts */}
              <div className="space-y-2">
                <h4 className="text-[11px] font-black uppercase tracking-[0.12em] text-slate-400 px-1">Cấu hình & Trạng thái</h4>
                {systemAlerts.map((alert) => {
                  const isUnreadSystem = !readSystemIds.includes(alert.id);
                  let alertBg = 'bg-blue-50 border-blue-100 text-blue-800';
                  let iconColor = 'text-blue-500';
                  let iconSvg = (
                    <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  );

                  if (alert.type === 'success') {
                    alertBg = 'bg-emerald-50 border-emerald-100 text-emerald-800';
                    iconColor = 'text-emerald-500';
                    iconSvg = (
                      <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                    );
                  } else if (alert.type === 'warning') {
                    alertBg = 'bg-amber-50 border-amber-100 text-amber-900';
                    iconColor = 'text-amber-600';
                    iconSvg = (
                      <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                      </svg>
                    );
                  }

                  return (
                    <button
                      key={alert.id}
                      type="button"
                      onClick={() => handleMarkSystemAsRead(alert.id)}
                      className={`relative flex w-full gap-3 rounded-xl border p-3 text-left transition hover:shadow-sm ${alertBg} ${isUnreadSystem ? 'ring-2 ring-blue-100' : 'opacity-70'}`}
                    >
                      {isUnreadSystem && (
                        <span className="absolute right-2 top-2 h-2 w-2 rounded-full bg-blue-600 ring-2 ring-white" />
                      )}
                      <span className={`shrink-0 ${iconColor}`}>{iconSvg}</span>
                      <p className="text-[12.5px] font-semibold leading-relaxed">{alert.message}</p>
                    </button>
                  );
                })}
              </div>

              {/* Section 2: Recent Votes Log */}
              <div className="space-y-2 pt-2">
                <h4 className="text-[11px] font-black uppercase tracking-[0.12em] text-slate-400 px-1">Lượt bình chọn mới nhận</h4>
                
                {votes.length === 0 ? (
                  <p className="py-8 text-center text-xs text-slate-400">Chưa ghi nhận hoạt động bình chọn nào.</p>
                ) : (
                  <div className="divide-y divide-slate-100">
                    {votes.map((vote) => {
                      const isUnread = !readIds.includes(vote.id);
                      return (
                        <div
                          key={vote.id}
                          onClick={() => handleMarkAsRead(vote.id)}
                          className={`flex gap-3 py-3 px-1.5 cursor-pointer rounded-xl transition ${isUnread ? 'bg-blue-50/40 font-semibold' : 'hover:bg-slate-50'}`}
                        >
                          {/* Avatar with status indicator */}
                          <div className="relative">
                            <div className="flex h-9 w-9 items-center justify-center rounded-full bg-gradient-to-br from-blue-500 to-cyan-400 text-white text-[13px] font-bold shadow-sm">
                              {vote.userName ? vote.userName.charAt(0).toUpperCase() : '?'}
                            </div>
                            {isUnread && (
                              <span className="absolute right-0 top-0 h-2.5 w-2.5 rounded-full bg-blue-600 ring-2 ring-white" />
                            )}
                          </div>

                          <div className="min-w-0 flex-1">
                            <p className="text-[12.5px] text-slate-700 leading-normal">
                              <span className="font-bold text-slate-900">{vote.userName || 'Người dùng'}</span>{' '}
                              đã bình chọn cho thí sinh{' '}
                              <span className="font-bold text-slate-800">{vote.candidateName}</span>
                            </p>
                            <div className="mt-1 flex items-center gap-2">
                              <span className="text-[10.5px] text-slate-400">{timeAgo(vote.createdAt)}</span>
                              <span className="h-1 w-1 rounded-full bg-slate-300" />
                              <span className="inline-flex items-center rounded-full bg-blue-50 px-1.5 py-0.5 text-[9.5px] font-bold text-blue-700">
                                +{vote.score} điểm
                              </span>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>

            </div>
          </div>
        </div>,
        document.body
      )}
    </>
  );
}

type AdminHistoryItem = { href: string; label: string; visitedAt: number };

function HistoryButton({ language }: { language: 'vi' | 'en' }) {
  const pathname = usePathname() || '/admin';
  const router = useRouter();
  const [isOpen, setIsOpen] = React.useState(false);
  const [history, setHistory] = React.useState<AdminHistoryItem[]>([]);
  const historyRef = React.useRef<HTMLDivElement>(null);

  React.useEffect(() => {
    try {
      const saved = JSON.parse(localStorage.getItem('admin_navigation_history') || '[]');
      if (Array.isArray(saved)) setHistory(saved.slice(0, 12));
    } catch {
      setHistory([]);
    }
  }, []);

  React.useEffect(() => {
    const meta = getPageMeta(pathname, language);
    setHistory((previous) => {
      const next = [{ href: pathname, label: meta.title, visitedAt: Date.now() }, ...previous.filter((item) => item.href !== pathname)].slice(0, 12);
      localStorage.setItem('admin_navigation_history', JSON.stringify(next));
      return next;
    });
  }, [pathname, language]);

  React.useEffect(() => {
    if (!isOpen) return;
    const handlePointerDown = (event: MouseEvent) => {
      if (!historyRef.current?.contains(event.target as Node)) setIsOpen(false);
    };
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') setIsOpen(false);
    };
    document.addEventListener('mousedown', handlePointerDown);
    document.addEventListener('keydown', handleKeyDown);
    return () => {
      document.removeEventListener('mousedown', handlePointerDown);
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen]);

  const clearHistory = () => {
    localStorage.removeItem('admin_navigation_history');
    setHistory([]);
  };

  return (
    <div ref={historyRef} className="relative">
      <button
        type="button"
        onClick={() => setIsOpen((open) => !open)}
        className="grid h-10 w-10 place-items-center rounded-[14px] border border-slate-200 bg-white text-slate-600 shadow-sm transition hover:border-[var(--primary)] hover:text-[var(--primary-strong)]"
        aria-label={language === 'en' ? 'Open navigation history' : 'Mở lịch sử truy cập'}
        aria-expanded={isOpen}
        title={language === 'en' ? 'Navigation history' : 'Lịch sử truy cập'}
      >
        <svg viewBox="0 0 24 24" className="h-[18px] w-[18px]" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M3 12a9 9 0 1 0 3-6.7" />
          <path d="M3 4v5h5" />
          <path d="M12 7v5l3 2" />
        </svg>
      </button>

      {isOpen && (
        <div className="absolute right-0 top-12 z-[100] w-[300px] rounded-2xl border border-slate-200 bg-white p-3 shadow-2xl">
          <div className="flex items-center justify-between border-b border-slate-100 pb-2">
            <h3 className="text-sm font-black text-slate-900">{language === 'en' ? 'Recent history' : 'Lịch sử truy cập'}</h3>
            <button type="button" onClick={clearHistory} className="text-[11px] font-bold text-rose-600 hover:underline">
              {language === 'en' ? 'Clear' : 'Xóa lịch sử'}
            </button>
          </div>
          <div className="mt-2 max-h-[320px] space-y-1 overflow-y-auto">
            {history.length === 0 ? (
              <p className="px-2 py-6 text-center text-xs font-semibold text-slate-400">{language === 'en' ? 'No history yet' : 'Chưa có lịch sử truy cập'}</p>
            ) : history.map((item) => (
              <button
                key={item.href}
                type="button"
                onClick={() => {
                  router.push(item.href);
                  setIsOpen(false);
                }}
                className={`flex w-full items-center gap-2 rounded-xl px-2.5 py-2 text-left transition ${item.href === pathname ? 'bg-blue-50 text-blue-800' : 'text-slate-700 hover:bg-slate-50'}`}
              >
                <span className="grid h-7 w-7 shrink-0 place-items-center rounded-lg bg-slate-100 text-slate-500">
                  <svg viewBox="0 0 24 24" className="h-3.5 w-3.5" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M4 4h16v16H4z" /><path d="M8 8h8M8 12h8M8 16h5" />
                  </svg>
                </span>
                <span className="min-w-0 flex-1 truncate text-xs font-bold">{item.label}</span>
                <span className="text-[10px] text-slate-400">{new Date(item.visitedAt).toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' })}</span>
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}


export default function ClientLayout({ children }: { children: React.ReactNode }) {
  const language = useLanguage();
  const setLang = (newLang: 'vi' | 'en') => {
    localStorage.setItem('iconic_language', newLang);
    window.dispatchEvent(new CustomEvent('iconic-language-change'));
  };

  const navGroups = language === 'en' ? navGroupsEn : navGroupsVi;
  const navItems = navGroups.flatMap((group) => group.items);

  const pathname = usePathname();
  const router = useRouter();
  const safePathname = pathname || '/';
  const currentMeta = getPageMeta(safePathname, language);
  const [sidebarWidth, setSidebarWidth] = React.useState(238);
  const [isResizing, setIsResizing] = React.useState(false);
  const [isSidebarCollapsed, setIsSidebarCollapsed] = React.useState(false);
  const [isAccountMenuOpen, setIsAccountMenuOpen] = React.useState(false);
  const [accountModal, setAccountModal] = React.useState<'profile' | 'password' | null>(null);
  const [passwordForm, setPasswordForm] = React.useState({ currentPassword: '', newPassword: '', confirmPassword: '' });
  const [passwordSaving, setPasswordSaving] = React.useState(false);
  const [passwordMessage, setPasswordMessage] = React.useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const accountMenuRef = React.useRef<HTMLDivElement>(null);

  // Global Image Lightbox state
  const [lightboxImage, setLightboxImage] = React.useState<{ url: string; title?: string } | null>(null);

  // Browser-like tab system & compact tab switcher popover
  const [isTabModalOpen, setIsTabModalOpen] = React.useState(false);
  const tabSwitcherRef = React.useRef<HTMLDivElement>(null);
  const tabButtonRef = React.useRef<HTMLButtonElement>(null);
  const [openTabs, setOpenTabs] = React.useState<Array<{ href: string; label: string; icon?: React.ReactNode }>>([
    { href: '/admin', label: language === 'en' ? 'Overview' : 'Tổng quan', icon: dashboardIcon },
  ]);

  React.useEffect(() => {
    const matched = navItems
      .filter((item) => item.href === '/' || item.href === '/admin'
        ? safePathname === item.href
        : safePathname === item.href || safePathname.startsWith(`${item.href}/`))
      .sort((a, b) => b.href.length - a.href.length)[0];
    if (matched) {
      setOpenTabs((prev) => {
        if (prev.some((tab) => tab.href === matched.href)) {
          return prev.map((t) => (t.href === matched.href ? { ...t, label: matched.label } : t));
        }
        return [...prev, { href: matched.href, label: matched.label, icon: matched.icon }];
      });
    }
  }, [safePathname, language]);

  const handleTabClick = (href: string) => {
    if (pathname !== href) {
      router.push(href);
    }
    setIsTabModalOpen(false);
  };

  const closeTab = (e: React.MouseEvent, hrefToClose: string) => {
    e.preventDefault();
    e.stopPropagation();
    if (openTabs.length <= 1) return;

    const nextTabs = openTabs.filter((t) => t.href !== hrefToClose);
    setOpenTabs(nextTabs);

    if (pathname === hrefToClose) {
      const fallbackTab = nextTabs[nextTabs.length - 1] || { href: '/admin' };
      router.push(fallbackTab.href);
    }
  };

  const closeOtherTabs = () => {
    const currentTab = openTabs.find((t) => isActive(t.href)) || { href: '/admin', label: language === 'en' ? 'Overview' : 'Tổng quan', icon: dashboardIcon };
    setOpenTabs([currentTab]);
    setIsTabModalOpen(false);
  };

  React.useEffect(() => {
    if (!isTabModalOpen) return;

    const handlePointerDown = (event: MouseEvent) => {
      const target = event.target as Node;
      if (!tabSwitcherRef.current?.contains(target) && !tabButtonRef.current?.contains(target)) {
        setIsTabModalOpen(false);
      }
    };

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') setIsTabModalOpen(false);
    };

    document.addEventListener('mousedown', handlePointerDown);
    document.addEventListener('keydown', handleKeyDown);

    return () => {
      document.removeEventListener('mousedown', handlePointerDown);
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [isTabModalOpen]);

  React.useEffect(() => {
    if (!isAccountMenuOpen) return;

    const handlePointerDown = (event: MouseEvent) => {
      const target = event.target as Node;
      if (!accountMenuRef.current?.contains(target)) {
        setIsAccountMenuOpen(false);
      }
    };

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        setIsAccountMenuOpen(false);
        setAccountModal(null);
      }
    };

    document.addEventListener('mousedown', handlePointerDown);
    document.addEventListener('keydown', handleKeyDown);

    return () => {
      document.removeEventListener('mousedown', handlePointerDown);
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [isAccountMenuOpen]);

  React.useEffect(() => {
    if (!accountModal) return;

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        setAccountModal(null);
        setPasswordMessage(null);
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [accountModal]);

  React.useEffect(() => {
    const savedWidth = localStorage.getItem('admin_sidebar_width');
    if (savedWidth) setSidebarWidth(parseInt(savedWidth, 10));
    const savedCollapsed = localStorage.getItem('admin_sidebar_collapsed');
    if (savedCollapsed) setIsSidebarCollapsed(savedCollapsed === 'true');

    // Global image click listener for Lightbox popup
    const handleGlobalImageClick = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      if (target && target.tagName === 'IMG' && (target.classList.contains('cursor-pointer') || target.closest('.lightbox-trigger'))) {
        const img = target as HTMLImageElement;
        if (img.src && !img.src.includes('data:image/svg+xml')) {
          setLightboxImage({ url: img.src, title: img.alt });
        }
      }
    };

    document.addEventListener('click', handleGlobalImageClick);
    return () => document.removeEventListener('click', handleGlobalImageClick);
  }, []);

  const toggleSidebar = () => {
    const nextState = !isSidebarCollapsed;
    setIsSidebarCollapsed(nextState);
    localStorage.setItem('admin_sidebar_collapsed', String(nextState));
  };

  const handleLogout = async () => {
    try {
      document.cookie = 'HUIT_AUTH_V1=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;';
      await fetch('/api/admin/logout', { method: 'POST' }).catch(() => null);
    } catch (error) {
      console.error(error);
    } finally {
      window.location.href = '/admin/login';
    }
  };

  const handleChangePassword = async (event: React.FormEvent) => {
    event.preventDefault();
    setPasswordMessage(null);

    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      setPasswordMessage({ type: 'error', text: 'Mật khẩu xác nhận không khớp.' });
      return;
    }
    if (passwordForm.newPassword.length < 8) {
      setPasswordMessage({ type: 'error', text: 'Mật khẩu mới phải có ít nhất 8 ký tự.' });
      return;
    }

    setPasswordSaving(true);
    try {
      const res = await fetch(apiUrl('/api/admin/account/password'), {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          currentPassword: passwordForm.currentPassword,
          newPassword: passwordForm.newPassword,
        }),
      });
      if (!res.ok) {
        const data = await res.json().catch(() => null);
        throw new Error(data?.message || 'Không thể đổi mật khẩu.');
      }
      setPasswordForm({ currentPassword: '', newPassword: '', confirmPassword: '' });
      setPasswordMessage({ type: 'success', text: 'Đổi mật khẩu thành công. Bạn có thể dùng mật khẩu mới ở lần đăng nhập tiếp theo.' });
    } catch (error: any) {
      setPasswordMessage({ type: 'error', text: error.message || 'Không thể đổi mật khẩu.' });
    } finally {
      setPasswordSaving(false);
    }
  };

  const isActive = (href: string) => {
    if (href === '/') return safePathname === '/';
    return safePathname.startsWith(href);
  };

  const startResizing = React.useCallback((event: React.MouseEvent) => {
    event.preventDefault();
    setIsResizing(true);
  }, []);

  const stopResizing = React.useCallback(() => {
    setIsResizing(false);
  }, []);

  const resize = React.useCallback(
    (event: MouseEvent) => {
      if (!isResizing) return;
      let newWidth = event.clientX;
      if (newWidth < 148) {
        newWidth = 88;
      } else {
        if (newWidth < 204) newWidth = 204;
        if (newWidth > 296) newWidth = 296;
      }
      setSidebarWidth(newWidth);
      localStorage.setItem('admin_sidebar_width', newWidth.toString());
    },
    [isResizing],
  );

  React.useEffect(() => {
    if (isResizing) {
      window.addEventListener('mousemove', resize);
      window.addEventListener('mouseup', stopResizing);
    }
    return () => {
      window.removeEventListener('mousemove', resize);
      window.removeEventListener('mouseup', stopResizing);
    };
  }, [isResizing, resize, stopResizing]);

  const isCollapsed = isSidebarCollapsed || sidebarWidth <= 120;

  return (
    <div className={`flex h-screen w-screen overflow-hidden bg-transparent ${isResizing ? 'select-none cursor-col-resize' : ''}`}>
      <aside
        style={{ width: isCollapsed ? '88px' : `${sidebarWidth}px` }}
        className={`admin-shell-surface relative hidden h-screen shrink-0 overflow-hidden border-r border-white/70 lg:flex lg:flex-col ${isResizing ? '' : 'transition-[width] duration-300 ease-out'}`}
      >
        <div className={`border-b border-slate-200/60 ${isCollapsed ? 'px-3 py-4' : 'px-4 py-4'}`}>
          <div className={`flex items-center ${isCollapsed ? 'flex-col gap-3' : 'justify-between gap-3'}`}>
            <Link href="/" className={`flex items-center ${isCollapsed ? 'justify-center' : 'gap-3'}`}>
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-[12px] border border-slate-200 bg-white shadow-sm">
                <img src="/images/site-logo.png" alt="HUIT's ICONIC" className="h-full w-full object-contain p-1.5" />
              </div>
              {!isCollapsed && (
                <div className="min-w-0">
                  <p className="truncate text-[13px] font-extrabold text-slate-900">HUIT's ICONIC</p>
                  <p className="mt-0.5 truncate text-[11px] font-medium text-slate-500">Dashboard quản trị</p>
                </div>
              )}
            </Link>

            <button
              onClick={toggleSidebar}
              className="grid h-8 w-8 shrink-0 place-items-center rounded-[10px] border border-slate-200 bg-white text-slate-500 shadow-sm transition hover:border-[var(--primary)] hover:text-[var(--primary)]"
              title={isCollapsed ? 'Mở rộng sidebar' : 'Thu gọn sidebar'}
              aria-label={isCollapsed ? 'Mở rộng sidebar' : 'Thu gọn sidebar'}
            >
              <svg viewBox="0 0 24 24" className="h-[18px] w-[18px]" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                {isCollapsed ? <polyline points="9 18 15 12 9 6" /> : <polyline points="15 18 9 12 15 6" />}
              </svg>
            </button>
          </div>
        </div>

        <nav className={`min-h-0 flex-1 space-y-4 overflow-y-auto px-2 pb-3 pt-3 ${isCollapsed ? 'px-2' : 'px-4'}`}>
          {navGroups.map((group) => (
            <section key={group.title} className="space-y-2">
              {!isCollapsed && <p className="px-3 text-[11px] font-black uppercase tracking-[0.14em] text-slate-400">{group.title}</p>}
              <div className="space-y-1">
                {group.items.map((item) => {
                  const active = isActive(item.href);
                  return (
                    <Link
                      key={item.href}
                      href={item.href}
                      title={isCollapsed ? item.label : undefined}
                      className={`group flex items-center rounded-[12px] border transition-all duration-200 ${isCollapsed ? 'justify-center px-2 py-2.5' : 'gap-3 px-3 py-2.5'} ${active
                        ? 'border-blue-100 bg-blue-50 text-[var(--primary-strong)] shadow-[0_8px_20px_rgba(21,101,216,0.08)]'
                        : 'border-transparent text-slate-700 hover:border-slate-200 hover:bg-white hover:text-slate-900'
                      }`}
                    >
                      <span className={`flex shrink-0 items-center justify-center ${active ? 'text-[var(--primary)]' : 'text-slate-400 group-hover:text-slate-700'}`}>
                        {item.icon}
                      </span>
                      {!isCollapsed && <span className="truncate text-[13px] font-semibold">{item.label}</span>}
                    </Link>
                  );
                })}
              </div>
            </section>
          ))}
        </nav>

        <div className={`${isCollapsed ? 'p-2' : 'p-4'} border-t border-slate-200/60`}>
          <div ref={accountMenuRef} className={`relative rounded-[14px] border border-slate-200 bg-white/92 shadow-sm ${isCollapsed ? 'p-2' : 'p-3'}`}>
            <div className={`flex items-center ${isCollapsed ? 'justify-center' : 'justify-between gap-3'}`}>
              <div className={`flex items-center ${isCollapsed ? 'justify-center' : 'gap-3 min-w-0'}`}>
                <div className="flex h-9 w-9 shrink-0 items-center justify-center overflow-hidden rounded-[12px] border border-slate-200 bg-slate-50">
                  <img src="/images/image.webp" alt="HUIT's ICONIC 2026" className="h-full w-full object-contain p-1" />
                </div>
                {!isCollapsed && (
                  <div className="min-w-0">
                    <p className="truncate text-[13px] font-extrabold text-slate-900">Administrator</p>
                    <p className="truncate text-[11px] font-medium text-slate-500">
                      {language === 'en' ? 'System Administrator' : 'Quản trị viên hệ thống'}
                    </p>
                  </div>
                )}
              </div>
              {!isCollapsed && (
                <button
                  type="button"
                  onClick={() => setIsAccountMenuOpen((open) => !open)}
                  className="grid h-8 w-8 place-items-center rounded-[10px] text-slate-500 transition hover:bg-slate-100"
                  aria-label="Mở menu tài khoản"
                  aria-expanded={isAccountMenuOpen}
                >
                  <svg viewBox="0 0 24 24" className={`h-4 w-4 transition ${isAccountMenuOpen ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                    <polyline points="6 9 12 15 18 9" />
                  </svg>
                </button>
              )}
            </div>
            {!isCollapsed && isAccountMenuOpen && (
              <div className="absolute bottom-[calc(100%+8px)] left-0 right-0 z-[120] rounded-2xl border border-slate-200 bg-white p-2 shadow-2xl">
                <button
                  type="button"
                  onClick={() => {
                    setAccountModal('profile');
                    setIsAccountMenuOpen(false);
                  }}
                  className="flex w-full items-center gap-2 rounded-xl px-3 py-2 text-left text-[12px] font-bold text-slate-700 transition hover:bg-blue-50 hover:text-blue-700"
                >
                  <span className="grid h-7 w-7 place-items-center rounded-lg bg-blue-50 text-blue-600">
                    <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M20 21a8 8 0 1 0-16 0" />
                      <circle cx="12" cy="7" r="4" />
                    </svg>
                  </span>
                  {language === 'en' ? 'Admin Profile' : 'Hồ sơ admin'}
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setAccountModal('password');
                    setIsAccountMenuOpen(false);
                  }}
                  className="flex w-full items-center gap-2 rounded-xl px-3 py-2 text-left text-[12px] font-bold text-slate-700 transition hover:bg-blue-50 hover:text-blue-700"
                >
                  <span className="grid h-7 w-7 place-items-center rounded-lg bg-slate-50 text-slate-500">
                    <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                      <rect x="3" y="11" width="18" height="10" rx="2" />
                      <path d="M7 11V7a5 5 0 0 1 10 0v4" />
                    </svg>
                  </span>
                  {language === 'en' ? 'Change Password' : 'Đổi mật khẩu'}
                </button>
                <Link
                  href="/settings"
                  onClick={() => setIsAccountMenuOpen(false)}
                  className="flex w-full items-center gap-2 rounded-xl px-3 py-2 text-left text-[12px] font-bold text-slate-700 transition hover:bg-blue-50 hover:text-blue-700"
                >
                  <span className="grid h-7 w-7 place-items-center rounded-lg bg-slate-50 text-slate-500">
                    <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M12 15.5A3.5 3.5 0 1 0 12 8a3.5 3.5 0 0 0 0 7.5Z" />
                      <path d="M19.4 15a1.7 1.7 0 0 0 .3 1.9l.1.1a2 2 0 1 1-2.8 2.8l-.1-.1a1.7 1.7 0 0 0-1.9-.3 1.7 1.7 0 0 0-1 1.6V21a2 2 0 1 1-4 0v-.1a1.7 1.7 0 0 0-1-1.6 1.7 1.7 0 0 0-1.9.3l-.1.1A2 2 0 1 1 4.2 17l.1-.1A1.7 1.7 0 0 0 4.6 15a1.7 1.7 0 0 0-1.6-1H3a2 2 0 1 1 0-4h.1a1.7 1.7 0 0 0 1.6-1 1.7 1.7 0 0 0-.3-1.9L4.3 7A2 2 0 1 1 7.1 4.2l.1.1A1.7 1.7 0 0 0 9 4.6a1.7 1.7 0 0 0 1-1.6V3a2 2 0 1 1 4 0v.1a1.7 1.7 0 0 0 1 1.6 1.7 1.7 0 0 0 1.9-.3l.1-.1A2 2 0 1 1 19.8 7l-.1.1a1.7 1.7 0 0 0-.3 1.9 1.7 1.7 0 0 0 1.6 1h.1a2 2 0 1 1 0 4H21a1.7 1.7 0 0 0-1.6 1Z" />
                    </svg>
                  </span>
                  {language === 'en' ? 'Account Settings' : 'Cài đặt tài khoản'}
                </Link>
                <div className="my-1 h-px bg-slate-100" />
                <button
                  type="button"
                  onClick={handleLogout}
                  className="flex w-full items-center gap-2 rounded-xl px-3 py-2 text-left text-[12px] font-bold text-rose-600 transition hover:bg-rose-50"
                >
                  <span className="grid h-7 w-7 place-items-center rounded-lg bg-rose-50 text-rose-500">
                    <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
                      <path d="M16 17l5-5-5-5" />
                      <path d="M21 12H9" />
                    </svg>
                  </span>
                  {language === 'en' ? 'Logout' : 'Đăng xuất'}
                </button>
              </div>
            )}
          </div>
        </div>

        {!isCollapsed && (
          <div
            onMouseDown={startResizing}
            className={`absolute right-0 top-0 z-30 h-full w-1 cursor-col-resize transition-colors ${isResizing ? 'bg-[var(--primary)]/50' : 'hover:bg-slate-300/70'}`}
          />
        )}
      </aside>

      <div className="flex min-w-0 flex-1 flex-col overflow-hidden">
        <header className="sticky top-0 z-20 border-b border-white/70 bg-[rgba(248,251,255,0.92)] px-5 pt-3 pb-2 backdrop-blur-xl md:px-6">
          <div className="mx-auto flex w-full max-w-[1320px] flex-col gap-2">
            <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
              <div className="min-w-0">
                <h1 className="text-[17px] font-extrabold leading-tight text-slate-950">{currentMeta.title}</h1>
                <p className="mt-0.5 text-[12px] font-medium text-slate-500">{currentMeta.description}</p>
              </div>

              <div className="flex flex-wrap items-center gap-3">
                {/* Language Switcher */}
                <div className="flex items-center rounded-xl border border-slate-200 bg-white p-0.5 shadow-sm">
                  <button
                    type="button"
                    onClick={() => setLang('vi')}
                    className={`rounded-lg px-2.5 py-1 text-xs font-bold transition ${
                      language === 'vi' ? 'bg-blue-600 text-white shadow-sm' : 'text-slate-500 hover:text-slate-800'
                    }`}
                  >
                    VI
                  </button>
                  <button
                    type="button"
                    onClick={() => setLang('en')}
                    className={`rounded-lg px-2.5 py-1 text-xs font-bold transition ${
                      language === 'en' ? 'bg-blue-600 text-white shadow-sm' : 'text-slate-500 hover:text-slate-800'
                    }`}
                  >
                    EN
                  </button>
                </div>

                <Link href={SITE_URL} target="_blank" className="admin-btn admin-btn-secondary">
                  {language === 'en' ? 'Visit Homepage' : 'Xem trang chủ'}
                  <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M7 17 17 7" />
                    <path d="M8 7h9v9" />
                  </svg>
                </Link>
                <HistoryButton language={language} />
                <BellButton />
              </div>
            </div>

            {/* Modern Browser Multi-Tab Header Bar & Quick Switcher Button */}
            <div className="relative flex flex-wrap items-center justify-between gap-2 pt-2 pb-0.5 border-t border-slate-200/60 mt-1.5">
              <div className="flex flex-wrap items-center gap-1.5 min-w-0">
                {openTabs.map((tab) => {
                  const active = isActive(tab.href);
                  return (
                    <div
                      key={tab.href}
                      onClick={() => handleTabClick(tab.href)}
                      className={`group relative flex items-center gap-2 px-3 py-1.5 rounded-xl text-xs transition-all duration-200 cursor-pointer shrink-0 select-none ${
                        active
                          ? 'bg-white text-blue-700 shadow-sm border border-slate-200/80 font-black'
                          : 'bg-slate-100/70 text-slate-600 hover:text-slate-900 hover:bg-white/90 font-bold border border-slate-200/50'
                      }`}
                    >
                      {active && (
                        <span className="absolute top-0 left-3 right-3 h-[2px] bg-gradient-to-r from-blue-600 to-indigo-600 rounded-full" />
                      )}
                      <span className={`flex h-4 w-4 items-center justify-center transition ${active ? 'text-blue-600' : 'text-slate-400 group-hover:text-slate-700'}`}>
                        {tab.icon}
                      </span>
                      <span className="truncate max-w-[130px] text-[12px]">{tab.label}</span>
                      {openTabs.length > 1 && (
                        <button
                          type="button"
                          onClick={(e) => closeTab(e, tab.href)}
                          className="grid h-4 w-4 place-items-center rounded-full text-slate-400 hover:bg-rose-100 hover:text-rose-600 transition ml-0.5 text-[10px] font-bold"
                          title={language === 'en' ? 'Close tab' : 'Đóng tab'}
                        >
                          ✕
                        </button>
                      )}
                    </div>
                  );
                })}
              </div>

              {/* Quick Tab Switcher Modal Trigger Button */}
              <button
                type="button"
                ref={tabButtonRef}
                onClick={() => setIsTabModalOpen((open) => !open)}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-slate-200/90 bg-white hover:bg-blue-50 text-[11px] font-black text-slate-700 hover:text-blue-700 shadow-sm transition shrink-0"
              >
                <svg viewBox="0 0 24 24" className="h-3.5 w-3.5 text-blue-600" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <rect x="3" y="3" width="7" height="7" rx="1.5" />
                  <rect x="14" y="3" width="7" height="7" rx="1.5" />
                  <rect x="14" y="14" width="7" height="7" rx="1.5" />
                  <rect x="3" y="14" width="7" height="7" rx="1.5" />
                </svg>
                {language === 'en' ? 'Manage Tabs' : 'Quản lý Tabs'} <span className="rounded-full bg-blue-100 px-1.5 py-0.2 text-[10px] font-black text-blue-700">{openTabs.length}</span>
              </button>
            </div>
          </div>
        </header>

        {isTabModalOpen && (
          <div ref={tabSwitcherRef} className="fixed right-6 top-[118px] z-[80] w-[340px] max-w-[calc(100vw-2rem)] rounded-2xl border border-slate-200 bg-white p-3 shadow-2xl">
            <div className="flex items-center justify-between border-b border-slate-100 pb-2">
              <div>
                <h3 className="text-xs font-extrabold text-slate-900">{language === 'en' ? 'Open Tabs' : 'Danh sách tab đang mở'}</h3>
                <p className="text-[11px] font-medium text-slate-500">{language === 'en' ? 'Switch quickly or close tabs' : 'Chuyển nhanh hoặc đóng bớt trang'}</p>
              </div>
              <button
                type="button"
                onClick={() => setIsTabModalOpen(false)}
                className="grid h-7 w-7 place-items-center rounded-lg text-slate-400 hover:bg-slate-100 hover:text-slate-700 transition"
                aria-label="Đóng"
              >
                x
              </button>
            </div>

            <div className="mt-2 max-h-[300px] overflow-y-auto space-y-1 pr-1">
              {openTabs.map((tab) => {
                const active = isActive(tab.href);
                return (
                  <div
                    key={tab.href}
                    onClick={() => handleTabClick(tab.href)}
                    className={`flex items-center justify-between gap-2 rounded-xl border p-2.5 transition cursor-pointer ${
                      active
                        ? 'bg-blue-50/80 border-blue-200 text-blue-800 font-extrabold shadow-sm'
                        : 'bg-slate-50/70 border-slate-200/60 text-slate-700 hover:bg-slate-100 hover:text-slate-900'
                    }`}
                  >
                    <div className="flex min-w-0 items-center gap-2">
                      <span className={`flex h-5 w-5 shrink-0 items-center justify-center ${active ? 'text-blue-600' : 'text-slate-400'}`}>
                        {tab.icon}
                      </span>
                      <span className="truncate text-xs font-bold">{tab.label}</span>
                      {active && (
                        <span className="rounded-md bg-blue-600 px-1.5 py-0.5 text-[9px] font-black text-white uppercase">
                          {language === 'en' ? 'Active' : 'Đang xem'}
                        </span>
                      )}
                    </div>
                    {openTabs.length > 1 && (
                      <button
                        type="button"
                        onClick={(e) => closeTab(e, tab.href)}
                        className="grid h-6 w-6 shrink-0 place-items-center rounded-lg text-slate-400 hover:bg-rose-100 hover:text-rose-600 transition"
                        title={language === 'en' ? 'Close this tab' : 'Đóng tab này'}
                      >
                        x
                      </button>
                    )}
                  </div>
                );
              })}
            </div>

            <div className="mt-3 flex items-center justify-between border-t border-slate-100 pt-2 text-xs">
              {openTabs.length > 1 ? (
                <button type="button" onClick={closeOtherTabs} className="font-bold text-rose-600 hover:underline">
                  {language === 'en' ? 'Close other tabs' : 'Đóng các tab khác'}
                </button>
              ) : (
                <span className="text-[11px] text-slate-400">{language === 'en' ? 'Only 1 tab open' : 'Đang chỉ mở 1 tab'}</span>
              )}
              <button
                type="button"
                onClick={() => setIsTabModalOpen(false)}
                className="rounded-lg bg-slate-900 px-3 py-1.5 text-xs font-bold text-white hover:bg-slate-800 transition"
              >
                {language === 'en' ? 'Close' : 'Đóng'}
              </button>
            </div>
          </div>
        )}

        <main className="min-h-0 flex-1 overflow-y-auto px-5 py-4 md:px-6 md:py-4">
          <div className="mx-auto w-full max-w-[1320px] space-y-4">
            {children}
          </div>
        </main>
      </div>

      {accountModal && (
        <div className="fixed inset-0 z-[99990] flex items-center justify-center bg-slate-950/45 p-4 backdrop-blur-sm" onMouseDown={(event) => event.target === event.currentTarget && setAccountModal(null)}>
          <div onMouseDown={(event) => event.stopPropagation()} className="w-full max-w-[420px] rounded-2xl border border-slate-200 bg-white p-5 shadow-2xl">
            <div className="flex items-start justify-between gap-4 border-b border-slate-100 pb-3">
              <div>
                <p className="text-[10px] font-black uppercase tracking-[0.16em] text-blue-600">Tài khoản quản trị</p>
                <h3 className="mt-1 text-[18px] font-black text-slate-950">
                  {accountModal === 'profile' ? 'Hồ sơ admin' : 'Đổi mật khẩu'}
                </h3>
              </div>
              <button
                type="button"
                onClick={() => {
                  setAccountModal(null);
                  setPasswordMessage(null);
                }}
                className="grid h-8 w-8 place-items-center rounded-lg text-slate-400 transition hover:bg-slate-100 hover:text-slate-700"
                aria-label="Đóng"
              >
                ✕
              </button>
            </div>

            {accountModal === 'profile' ? (
              <div className="mt-4 space-y-3">
                <div className="flex items-center gap-3 rounded-xl border border-slate-200 bg-slate-50 p-3">
                  <div className="flex h-12 w-12 shrink-0 items-center justify-center overflow-hidden rounded-[14px] border border-slate-200 bg-white">
                    <img src="/images/image.webp" alt="HUIT's ICONIC 2026" className="h-full w-full object-contain p-1.5" />
                  </div>
                  <div className="min-w-0">
                    <p className="truncate text-sm font-black text-slate-950">Administrator</p>
                    <p className="truncate text-xs font-semibold text-slate-500">Quản trị viên hệ thống</p>
                  </div>
                </div>
                <div className="grid gap-2 text-sm">
                  <div className="flex items-center justify-between rounded-xl border border-slate-100 px-3 py-2">
                    <span className="text-xs font-bold text-slate-500">Tên đăng nhập</span>
                    <span className="text-xs font-black text-slate-900">ICONIC.Huitmedia</span>
                  </div>
                  <div className="flex items-center justify-between rounded-xl border border-slate-100 px-3 py-2">
                    <span className="text-xs font-bold text-slate-500">Vai trò</span>
                    <span className="rounded-full bg-blue-50 px-2 py-1 text-[11px] font-black text-blue-700">Admin</span>
                  </div>
                </div>
              </div>
            ) : (
              <form onSubmit={handleChangePassword} className="mt-4 space-y-3">
                <label className="grid gap-1.5">
                  <span className="text-[11px] font-black uppercase tracking-[0.12em] text-slate-500">Mật khẩu hiện tại</span>
                  <input
                    type="password"
                    value={passwordForm.currentPassword}
                    onChange={(event) => setPasswordForm((prev) => ({ ...prev, currentPassword: event.target.value }))}
                    className="h-10 rounded-xl border border-slate-200 bg-slate-50 px-3 text-sm font-semibold text-slate-900 outline-none transition focus:border-blue-400 focus:bg-white focus:ring-4 focus:ring-blue-100"
                    required
                  />
                </label>
                <label className="grid gap-1.5">
                  <span className="text-[11px] font-black uppercase tracking-[0.12em] text-slate-500">Mật khẩu mới</span>
                  <input
                    type="password"
                    value={passwordForm.newPassword}
                    onChange={(event) => setPasswordForm((prev) => ({ ...prev, newPassword: event.target.value }))}
                    className="h-10 rounded-xl border border-slate-200 bg-slate-50 px-3 text-sm font-semibold text-slate-900 outline-none transition focus:border-blue-400 focus:bg-white focus:ring-4 focus:ring-blue-100"
                    minLength={8}
                    required
                  />
                </label>
                <label className="grid gap-1.5">
                  <span className="text-[11px] font-black uppercase tracking-[0.12em] text-slate-500">Xác nhận mật khẩu mới</span>
                  <input
                    type="password"
                    value={passwordForm.confirmPassword}
                    onChange={(event) => setPasswordForm((prev) => ({ ...prev, confirmPassword: event.target.value }))}
                    className="h-10 rounded-xl border border-slate-200 bg-slate-50 px-3 text-sm font-semibold text-slate-900 outline-none transition focus:border-blue-400 focus:bg-white focus:ring-4 focus:ring-blue-100"
                    minLength={8}
                    required
                  />
                </label>
                {passwordMessage && (
                  <p className={`rounded-xl px-3 py-2 text-xs font-bold ${passwordMessage.type === 'success' ? 'bg-emerald-50 text-emerald-700' : 'bg-rose-50 text-rose-700'}`}>
                    {passwordMessage.text}
                  </p>
                )}
                <button
                  type="submit"
                  disabled={passwordSaving}
                  className="admin-btn admin-btn-primary w-full disabled:opacity-60"
                >
                  {passwordSaving ? 'Đang đổi mật khẩu...' : 'Lưu mật khẩu mới'}
                </button>
              </form>
            )}
          </div>
        </div>
      )}

      {/* Global Image Lightbox Modal */}
      {lightboxImage && (
        <div
          className="fixed inset-0 z-[99999] bg-slate-950/85 backdrop-blur-md flex items-center justify-center p-4 animate-in fade-in duration-200"
          onClick={() => setLightboxImage(null)}
        >
          <div
            className="relative max-w-4xl max-h-[90vh] flex flex-col items-center justify-center"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              type="button"
              onClick={() => setLightboxImage(null)}
              className="absolute -top-12 right-0 grid h-10 w-10 place-items-center rounded-full bg-white/20 text-white hover:bg-rose-600 transition font-bold shadow-lg"
            >
              ✕
            </button>
            <img
              src={lightboxImage.url}
              alt={lightboxImage.title || 'Xem ảnh'}
              className="max-h-[82vh] max-w-full rounded-2xl object-contain shadow-2xl border border-white/20 bg-black/40"
            />
            {lightboxImage.title && (
              <p className="mt-3 text-xs font-bold text-white/90 bg-slate-900/80 px-4 py-1.5 rounded-full border border-white/10">
                {lightboxImage.title}
              </p>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
