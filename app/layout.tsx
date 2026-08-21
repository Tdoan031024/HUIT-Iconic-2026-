'use client';

import React, { useState, useEffect } from 'react';
import { Be_Vietnam_Pro } from 'next/font/google';
import './globals.css';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { AlertProvider } from './AlertProvider';
import { apiUrl } from './api';
import { initDevToolsProtection } from '../src/utils/devtoolsProtection';
import { AISearch } from '../src/components/AISearch';
import { usePageViewTracker } from '../src/hooks/usePageViewTracker';
import { AIChatbot } from '../src/components/AIChatbot';

const beVietnamPro = Be_Vietnam_Pro({
  subsets: ['vietnamese'],
  weight: ['400', '500', '600', '700', '800', '900'],
  display: 'swap',
  variable: '--font-sans',
});

export interface SystemSettings {
  isGateOpen: boolean;
  startDate: string;
  endDate: string;
  maxVotesPerPhone: number;
  eventTitle: string;
  organizer: string;
  contactEmail: string;
  isMaintenanceMode: boolean;
  hidePublicVoteHistory?: boolean;
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  const fullSiteTitle = "HUIT's ICONIC 2026 - Cuộc thi Tìm kiếm Đại sứ Truyền thông HUIT";
  const pathname = usePathname();
  const isAdminRoute = pathname?.startsWith('/admin');

  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [lastScrollY, setLastScrollY] = useState(0);
  const [currentHash, setCurrentHash] = useState('');
  const [settings, setSettings] = useState<SystemSettings | null>(null);
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [theme, setTheme] = useState<'light' | 'dark'>('light');
  const [showScrollTop, setShowScrollTop] = useState(false);

  usePageViewTracker();

  useEffect(() => {
    const savedTheme = localStorage.getItem('huit_theme_v2') as 'light' | 'dark' | null;
    const initialTheme = savedTheme || 'light';
    setTheme(initialTheme);
    document.documentElement.dataset.theme = initialTheme;
    const onScroll = () => setShowScrollTop(window.scrollY > 520);
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  const toggleTheme = () => {
    const nextTheme = theme === 'dark' ? 'light' : 'dark';
    setTheme(nextTheme);
    document.documentElement.dataset.theme = nextTheme;
    localStorage.setItem('huit_theme_v2', nextTheme);
  };

  useEffect(() => {
    const cleanup = initDevToolsProtection();
    return cleanup;
  }, []);

  useEffect(() => {
    const readUser = () => {
      if (typeof window !== 'undefined') {
        const rawUser = localStorage.getItem('huit_web_user');
        if (rawUser) {
          try { setCurrentUser(JSON.parse(rawUser)); }
          catch { setCurrentUser(null); }
        } else {
          setCurrentUser(null);
        }
      }
    };
    readUser();
    const interval = setInterval(readUser, 2000);
    return () => clearInterval(interval);
  }, []);

  const handleLogout = () => {
    if (typeof window !== 'undefined') {
      localStorage.removeItem('huit_web_user');
      localStorage.removeItem('huit_web_token');
      setCurrentUser(null);
      window.location.reload();
    }
  };

  useEffect(() => {
    async function fetchSettings() {
      try {
        const res = await fetch(apiUrl('/settings'));
        if (res.ok) {
          const data = await res.json();
          setSettings(data);
          if (typeof document !== 'undefined' && !isAdminRoute) document.title = fullSiteTitle;
        }
      } catch (err) {
        console.error('Failed to fetch system settings', err);
      }
    }
    fetchSettings();
  }, [isAdminRoute]);

  if (isAdminRoute) {
    return (
      <html lang="vi" className={beVietnamPro.variable}>
        <head>
          <meta charSet="utf-8" />
          <meta name="viewport" content="width=device-width, initial-scale=1" />
          <title>Quản trị HUIT STARTUP 2026</title>
          <link rel="icon" href="/favicon.png" type="image/png" />
        </head>
        <body className={`${beVietnamPro.className} antialiased font-sans`}>
          <AlertProvider>{children}</AlertProvider>
        </body>
      </html>
    );
  }

  // ─── Maintenance Mode ─────────────────────────────────
  if (settings?.isMaintenanceMode) {
    return (
      <html lang="vi" className={beVietnamPro.variable}>
        <head>
          <meta charSet="utf-8" />
          <meta name="viewport" content="width=device-width, initial-scale=1" />
          <title>{fullSiteTitle} - Bảo trì hệ thống</title>
          <style>{`body { background-color: #030612 !important; color: #ffffff; font-family: var(--font-sans), sans-serif; margin: 0; }`}</style>
        </head>
        <body className={`${beVietnamPro.className} dark bg-[#030612] flex items-center justify-center min-h-screen p-4 overflow-hidden relative`}>
          <div className="max-w-md w-full text-center z-10 bg-white/[0.02] backdrop-blur-xl border border-white/5 p-8 rounded-3xl shadow-[0_0_50px_rgba(0,0,0,0.8)] flex flex-col items-center">
            <h1 className="text-xl font-bold text-white tracking-wide uppercase">{settings.eventTitle}</h1>
            <p className="text-[12px] text-cyan-400/80 font-medium mt-1 uppercase tracking-wider">{settings.organizer}</p>
            <div className="h-[1px] w-full bg-white/10 my-6" />
            <h2 className="text-lg font-semibold text-slate-100">Hệ thống đang bảo trì</h2>
            <p className="text-[14px] text-slate-400 mt-2 leading-relaxed">
              Chúng tôi đang tiến hành nâng cấp định kỳ để cải thiện trải nghiệm bình chọn của bạn.
            </p>
          </div>
        </body>
      </html>
    );
  }

  const navLinks = [
    { href: '/', label: 'Trang chủ' },
    { href: '/gioi-thieu', label: 'Giới thiệu' },
    { href: '/thoi-gian', label: 'Thời gian' },
    { href: '/bang-xep-hang', label: 'Bảng xếp hạng' },
    { href: '/the-le', label: 'Hướng dẫn' },
    { href: '/tin-tuc', label: 'Tin tức' },
  ];

  return (
    <html lang="vi" suppressHydrationWarning className={beVietnamPro.variable}>
      <head>
        <script dangerouslySetInnerHTML={{ __html: `(function(){try{var t=localStorage.getItem('huit_theme_v2');document.documentElement.dataset.theme=t||'light'}catch(e){document.documentElement.dataset.theme='light'}})()` }} />
        <meta charSet="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <title>{fullSiteTitle}</title>
        <link rel="icon" href="/favicon.png" type="image/png" />
      </head>

      <body className={beVietnamPro.className}>
        <AlertProvider>
          <main suppressHydrationWarning>
            {/* Header */}
            <div className="sticky-outer-wrapper" style={{ height: '80px' }}>
              <div className="sticky-inner-wrapper" style={{ position: 'fixed', top: 0, left: 0, right: 0, zIndex: 1001, height: '80px' }}>
                <div className="absolute h-[80px] top-0 left-0 right-0 w-full flex justify-center header-glass">
                  <div className="sc-1a037b37-0 RKByV relative flex w-full items-center h-full px-4 sm:px-0">
                    <div className="flex shrink-0 items-center h-full">
                      <Link className="focus:outline-none flex items-center gap-2" href="/">
                        <img alt="IEC" width="120" height="26" className="header-logo object-contain" src="/images/ieclogo.png" />
                        <img alt="HUIT STARTUP" width="140" height="44" className="header-logo object-contain" src="/images/startuplogo.png" />
                      </Link>
                    </div>

                    <nav className="ml-auto hidden sm-desktop:flex items-center h-full gap-1">
                      {navLinks.map(({ href, label }) => (
                        <Link
                          key={href}
                          href={href}
                          className={`nav-link-modern ${pathname === href ? 'active' : ''}`}
                        >
                          {label}
                        </Link>
                      ))}
                    </nav>

                    <div className="ml-4 flex items-center gap-2">
                      {currentUser ? (
                        <div className="flex items-center gap-2">
                          <span className="text-[13px] font-bold" style={{ color: 'var(--site-text)' }}>
                            {currentUser.fullName}
                          </span>
                          <button onClick={handleLogout} className="text-red-500 text-xs font-bold border border-red-200 px-2 py-1 rounded">
                            Đăng xuất
                          </button>
                        </div>
                      ) : (
                        <Link href="/dang-nhap" className="px-3 py-2 rounded-xl text-[13px] font-semibold" style={{ color: 'var(--site-text)' }}>
                          Đăng nhập
                        </Link>
                      )}
                      <button onClick={toggleTheme} className="site-theme-toggle p-2">
                        {theme === 'dark' ? '☀️' : '🌙'}
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Page content */}
            {children}

            {/* Footer */}
            <footer className="site-footer-modern py-8 px-4 text-center border-t border-slate-200 dark:border-slate-800 mt-12">
              <p className="text-xs text-slate-500">© 2026 HUIT's ICONIC - Cuộc thi Tìm kiếm Đại sứ Truyền thông Trường Đại học Công Thương TP.HCM (HUIT)</p>
            </footer>

            <AIChatbot />
          </main>
        </AlertProvider>
      </body>
    </html>
  );
}
