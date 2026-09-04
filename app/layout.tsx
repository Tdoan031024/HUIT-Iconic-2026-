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
import StatusPage from '../src/components/StatusPage';
import { getStatusPreset } from '../src/components/status-page-presets';
import { Language, translate } from '../src/i18n';
import { CookieConsent } from '../src/components/CookieConsent';
import { CurtainReveal } from '../src/components/CurtainReveal';

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
  headerHuitLogoUrl?: string;
  headerIconicLogoUrl?: string;
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
  const [language, setLanguage] = useState<Language>('vi');
  const t = (key: Parameters<typeof translate>[1]) => translate(language, key);

  // Track GA4 page views on route change
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

  useEffect(() => {
    const queryLanguage = new URLSearchParams(window.location.search).get('lang') as Language | null;
    const savedLanguage = localStorage.getItem('iconic_language') as Language | null;
    const initialLanguage = queryLanguage === 'vi' || queryLanguage === 'en' ? queryLanguage : savedLanguage;
    if (initialLanguage === 'vi' || initialLanguage === 'en') setLanguage(initialLanguage);
  }, []);

  useEffect(() => {
    document.documentElement.lang = language;
    localStorage.setItem('iconic_language', language);
    window.dispatchEvent(new CustomEvent('iconic-language-change'));
  }, [language]);

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

  // ─── Service Worker Registration (PWA) ────────────────────────────────
  useEffect(() => {
    if (typeof window !== 'undefined' && 'serviceWorker' in navigator) {
      if (process.env.NODE_ENV !== 'production') {
        navigator.serviceWorker.getRegistrations().then((registrations) => {
          registrations.forEach((registration) => registration.unregister());
        });
        return;
      }

      window.addEventListener('load', () => {
        navigator.serviceWorker.register('/sw.js').catch((err) => {
          console.error('[SW] Registration failed:', err);
        });
      });
    }
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
    window.addEventListener('storage', readUser);
    window.addEventListener('focus', readUser);
    const interval = setInterval(readUser, 10000);
    return () => {
      window.removeEventListener('storage', readUser);
      window.removeEventListener('focus', readUser);
      clearInterval(interval);
    };
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
        const res = await fetch(apiUrl('/api/settings'));
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
    const interval = setInterval(fetchSettings, 60000);
    return () => clearInterval(interval);
  }, [isAdminRoute]);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      setCurrentHash(window.location.hash);
      const handleHashChange = () => setCurrentHash(window.location.hash);
      window.addEventListener('hashchange', handleHashChange);
      window.addEventListener('popstate', handleHashChange);
      return () => {
        window.removeEventListener('hashchange', handleHashChange);
        window.removeEventListener('popstate', handleHashChange);
      };
    }
  }, []);

  useEffect(() => {
    const handleScroll = () => {
      setLastScrollY(window.scrollY);
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  if (isAdminRoute) {
    return (
      <html lang="vi" className={beVietnamPro.variable}>
        <head>
          <meta charSet="utf-8" />
          <meta name="viewport" content="width=device-width, initial-scale=1" />
          <title>Quản trị HUIT's ICONIC 2026</title>
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
    const preset = getStatusPreset(503);

    return (
      <html lang={language} className={beVietnamPro.variable}>
        <head>
          <meta charSet="utf-8" />
          <meta name="viewport" content="width=device-width, initial-scale=1" />
          <title>{fullSiteTitle} - Bảo trì hệ thống</title>
          <link rel="stylesheet" href="/css/82aef30d151230ac.css" />
          <link rel="stylesheet" href="/css/be16ba848ed13f21.css" />
          <link rel="stylesheet" href="/css/431944509084d071.css" />
          <style>{`body { background-color: #030612 !important; color: #ffffff; font-family: var(--font-sans), sans-serif; margin: 0; }`}</style>
        </head>
        <body className={beVietnamPro.className}>
          <StatusPage
            {...preset}
            description={`Website ${settings.eventTitle} đang tạm dừng để bảo trì hoặc nâng cấp dịch vụ. Vui lòng quay lại sau ít phút.`}
            hint={`Nếu cần hỗ trợ gấp, bạn có thể liên hệ ${settings.organizer} qua email ${settings.contactEmail}.`}
            actions={[
              { label: 'Thử lại', onClick: () => window.location.reload(), variant: 'primary' },
              { label: 'Về trang chủ', href: '/', variant: 'secondary' },
            ]}
          />
        </body>
      </html>
    );
  }

  // ─── Nav links ────────────────────────────────────────
  const navLinks = [
    { href: '/', label: t('home') },
    { href: '/gioi-thieu', label: t('about') },
    { href: '/thoi-gian', label: t('schedule') },
    { href: '/bang-xep-hang', label: t('ranking') },
    { href: '/the-le', label: t('guide') },
    { href: '/tin-tuc', label: t('news') },
  ];

  const drawerLinks = [
    {
      href: '/',
      label: t('home'),
      icon: <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24"><path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/></svg>,
    },
    {
      href: '/gioi-thieu',
      label: t('about'),
      icon: <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>,
    },
    {
      href: '/thoi-gian',
      label: t('schedule'),
      icon: <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>,
    },
    {
      href: '/bang-xep-hang',
      label: t('ranking'),
      icon: <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24"><polyline points="18 20 18 10"/><polyline points="12 20 12 4"/><polyline points="6 20 6 14"/></svg>,
    },
    {
      href: '/the-le',
      label: t('guide'),
      icon: <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/></svg>,
    },
    {
      href: '/tin-tuc',
      label: t('news'),
      icon: <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24"><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/><path d="M16 8h2"/><path d="M16 12h2"/><path d="M16 16h2"/><path d="M6 8h6v8H6z"/></svg>,
    },
    {
      href: '/ho-tro',
      label: t('supportCenter'),
      icon: <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24"><path d="M21 15a4 4 0 0 1-4 4H8l-5 3V7a4 4 0 0 1 4-4h10a4 4 0 0 1 4 4z"/><path d="M8 10h8M8 14h5"/></svg>,
    },
  ];

  // ─── Main Layout ─────────────────────────────────────
  return (
    <html lang={language} suppressHydrationWarning className={beVietnamPro.variable}>
      <head>
        <script dangerouslySetInnerHTML={{ __html: `(function(){try{var t=localStorage.getItem('huit_theme_v2');document.documentElement.dataset.theme=t||'light'}catch(e){document.documentElement.dataset.theme='light'}})()` }} />
        <meta charSet="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <title>{fullSiteTitle}</title>
        <meta name="description" content="Nền tảng Cuộc thi Tìm kiếm Đại sứ Truyền thông HUIT's ICONIC 2026, nơi tôn vinh nét đẹp tâm hồn, trí tuệ, thanh lịch và bản lĩnh sinh viên HUIT." />
        <meta name="keywords" content="HUIT ICONIC, Đại sứ truyền thông, HUIT, bình chọn đại sứ, cuộc thi sắc đẹp, Đại học Công Thương TP.HCM" />
        <meta name="robots" content="index, follow" />
        <meta name="author" content="Trường Đại học Công Thương TP.HCM (HUIT)" />
        <link rel="canonical" href={`${process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'}${pathname || '/'}`} />
        <link rel="alternate" hrefLang="vi" href={`${process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'}${pathname || '/'}?lang=vi`} />
        <link rel="alternate" hrefLang="en" href={`${process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'}${pathname || '/'}?lang=en`} />
        <link rel="alternate" hrefLang="x-default" href={`${process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'}${pathname || '/'}?lang=vi`} />

        {/* Open Graph */}
        <meta property="og:type" content="website" />
        <meta property="og:site_name" content="HUIT's ICONIC 2026" />
        <meta property="og:title" content={fullSiteTitle} />
        <meta property="og:description" content="Nền tảng Cuộc thi Tìm kiếm Đại sứ Truyền thông HUIT's ICONIC 2026." />
        <meta property="og:url" content={process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'} />
        <meta property="og:image" content={`${process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'}/images/og-default.png`} />
        <meta property="og:image:width" content="1200" />
        <meta property="og:image:height" content="630" />
        <meta property="og:image:alt" content="HUIT's ICONIC 2026" />
        <meta property="og:locale" content="vi_VN" />

        {/* Twitter Card */}
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content={fullSiteTitle} />
        <meta name="twitter:description" content="Nền tảng Cuộc thi Tìm kiếm Đại sứ Truyền thông HUIT's ICONIC 2026." />
        <meta name="twitter:image" content={`${process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'}/images/og-default.png`} />

        {/* PWA Manifest */}
        <link rel="manifest" href="/manifest.json" />
        <meta name="theme-color" content="#0A2FFF" />

        <link rel="icon" href="/favicon.png" type="image/png" />

        {/* Original CSS stylesheets */}
        <link rel="stylesheet" href="/css/82aef30d151230ac.css" />
        <link rel="stylesheet" href="/css/be16ba848ed13f21.css" />
        <link rel="stylesheet" href="/css/431944509084d071.css" />

        <style suppressHydrationWarning>{`
          body {
            background-color: var(--site-bg) !important;
            margin: 0;
            font-family: var(--font-sans), Inter, sans-serif;
          }
          .RKByV {
            padding: 0px 128px; padding-top: 0;
            width: calc(1311px + 128px * 2);
            margin-left: auto; margin-right: auto;
          }
          @media (max-width: 1504px) { .RKByV { width: 1312px; padding: 0; } }
          @media (max-width: 1312px) { .RKByV { width: 1110px; padding: 0; } }
          @media (max-width: 1199px) { .RKByV { width: calc(984px + 69px * 2); padding: 0; } }
          @media (max-width: 1121px) { .RKByV { width: calc(744px + 37px * 2); padding: 0 37px; } }
          @media (max-width: 812px)  { .RKByV { width: 100%; padding: 0; margin: 0; } }
        `}</style>
      </head>

      <body className={beVietnamPro.className}>
        <AlertProvider>
          <main id="main-content" suppressHydrationWarning>
            <a href="#page-content" className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-[2000] focus:rounded-lg focus:bg-white focus:px-4 focus:py-3 focus:text-sm focus:font-bold focus:text-slate-900 focus:shadow-lg">
              {language === 'en' ? 'Skip to content' : 'Bỏ qua đến nội dung chính'}
            </a>

            {/* ── STICKY HEADER (Chuẩn Web Startup) ── */}
            <div className="sticky-outer-wrapper" style={{ height: '72px' }}>
              <div
                className="sticky-inner-wrapper"
                style={{ position: 'fixed', top: 0, left: 0, right: 0, zIndex: 1001, height: '72px' }}
              >
                {/* Glass header bar */}
                <div className="absolute h-[72px] top-0 left-0 right-0 w-full flex justify-center header-glass">
                  <div className="header-accent-line" />

                  <div className="sc-1a037b37-0 RKByV header-content-shell relative flex w-full items-center h-full px-4 sm:px-0">

                    {/* Mobile Menu Action Buttons */}
                    <div className="mobile-header-actions sm-desktop:hidden flex items-center gap-1">
                      <button
                        onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                        className="site-theme-toggle mobile-header-icon"
                        style={{ color: 'var(--site-text)' }}
                        aria-label={t('openMenu')}
                      >
                        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24">
                          <line x1="3" y1="6" x2="21" y2="6"/>
                          <line x1="3" y1="12" x2="21" y2="12"/>
                          <line x1="3" y1="18" x2="21" y2="18"/>
                        </svg>
                      </button>
                    </div>

                    <div className="mobile-header-controls sm-desktop:hidden">
                      <div className="language-switcher" role="group" aria-label={t('language')}>
                        <button type="button" className={language === 'vi' ? 'active' : ''} onClick={() => setLanguage('vi')} aria-pressed={language === 'vi'}>VI</button>
                        <button type="button" className={language === 'en' ? 'active' : ''} onClick={() => setLanguage('en')} aria-pressed={language === 'en'}>EN</button>
                      </div>
                      <button
                        onClick={toggleTheme}
                        className="site-theme-toggle theme-toggle-modern mobile-header-icon"
                        aria-label={theme === 'dark' ? t('lightTheme') : t('darkTheme')}
                        aria-pressed={theme === 'dark'}
                        title={t('changeTheme')}
                      >
                        {theme === 'dark' ? (
                          <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24"><circle cx="12" cy="12" r="5"/><line x1="12" y1="1" x2="12" y2="3"/><line x1="12" y1="21" x2="12" y2="23"/><line x1="4.22" y1="4.22" x2="5.64" y2="5.64"/><line x1="18.36" y1="18.36" x2="19.78" y2="19.78"/><line x1="1" y1="12" x2="3" y2="12"/><line x1="21" y1="12" x2="23" y2="12"/></svg>
                        ) : (
                          <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24"><path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"/></svg>
                        )}
                      </button>
                    </div>

                    {/* Logo & Brand shell */}
                    <div className="flex shrink-0 items-center h-full mobile-logo-wrap">
                      <div className="h-full flex items-center gap-2 md:gap-5 mobile-logo-row header-brand-shell">
                        <Link className="focus:outline-none flex items-center" href="/">
                          <img alt="HUIT" width="120" height="32" className="header-logo header-logo-iec object-contain" src={settings?.headerHuitLogoUrl || '/images/huit_logo.png'} />
                        </Link>
                        <span className="header-logo-divider" aria-hidden="true" />
                        <Link className="focus:outline-none flex items-center" href="/">
                          <img alt="HUIT ICONIC" width="140" height="44" className="header-logo header-logo-startup object-contain" src={settings?.headerIconicLogoUrl || '/images/image.webp'} />
                        </Link>
                      </div>
                    </div>

                    {/* Desktop Navigation */}
                    <nav aria-label={language === 'en' ? 'Main navigation' : 'Điều hướng chính'} className="ml-auto hidden sm-desktop:flex items-center h-full gap-1">
                      {navLinks.map(({ href, label }) => (
                        <Link
                          key={href}
                          href={href}
                          className={`nav-link-modern ${pathname === href ? 'active' : ''}`}
                        >
                          {label}
                          <span className="nav-underline" />
                        </Link>
                      ))}
                    </nav>

                    {/* Desktop Search Bar */}
                    <div className="hidden sm-desktop:block mx-2" style={{ width: '220px' }}>
                      <AISearch />
                    </div>

                    {/* Desktop Right Side Actions */}
                    <div className="header-right-actions ml-2 flex items-center gap-2">
                      {currentUser ? (
                        <div className="hidden sm:flex items-center gap-2 ml-1">
                          <span className="text-[13px] font-bold max-w-[130px] truncate" style={{ color: 'var(--site-text)' }}>
                            {currentUser.fullName}
                          </span>
                          <button
                            onClick={handleLogout}
                            className="flex items-center justify-center w-[38px] h-[38px] border border-red-200/50 hover:border-red-500 rounded-xl text-red-500 hover:bg-red-500/10 transition cursor-pointer"
                            title={t('logout')}
                            aria-label={t('logout')}
                          >
                            <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24">
                              <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
                              <polyline points="16 17 21 12 16 7" />
                              <line x1="21" y1="12" x2="9" y2="12" />
                            </svg>
                          </button>
                        </div>
                      ) : (
                        <Link
                          id="loginHeaderBtn"
                          href="/dang-nhap"
                          className="hidden sm:flex items-center gap-1.5 px-3 py-2 rounded-xl transition-all ml-1 text-[13px] font-semibold"
                          style={{ color: 'var(--site-text)' }}
                        >
                          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24">
                            <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/>
                          </svg>
                          {t('login')}
                        </Link>
                      )}

                      <div className="language-switcher hidden md:flex" role="group" aria-label={t('language')}>
                        <button type="button" className={language === 'vi' ? 'active' : ''} onClick={() => setLanguage('vi')} aria-pressed={language === 'vi'}>VI</button>
                        <button type="button" className={language === 'en' ? 'active' : ''} onClick={() => setLanguage('en')} aria-pressed={language === 'en'}>EN</button>
                      </div>

                      {/* Theme Toggle (Desktop) */}
                      <button
                        onClick={toggleTheme}
                        className="site-theme-toggle theme-toggle-modern hidden md:grid"
                        aria-label={theme === 'dark' ? t('lightTheme') : t('darkTheme')}
                        aria-pressed={theme === 'dark'}
                        title={t('changeTheme')}
                      >
                        {theme === 'dark' ? (
                          <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24">
                            <circle cx="12" cy="12" r="5"/>
                            <line x1="12" y1="1" x2="12" y2="3"/><line x1="12" y1="21" x2="12" y2="23"/>
                            <line x1="4.22" y1="4.22" x2="5.64" y2="5.64"/><line x1="18.36" y1="18.36" x2="19.78" y2="19.78"/>
                            <line x1="1" y1="12" x2="3" y2="12"/><line x1="21" y1="12" x2="23" y2="12"/>
                            <line x1="4.22" y1="19.78" x2="5.64" y2="18.36"/><line x1="18.36" y1="5.64" x2="19.78" y2="4.22"/>
                          </svg>
                        ) : (
                          <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24">
                            <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"/>
                          </svg>
                        )}
                      </button>
                    </div>
                  </div>
                </div>

                {/* ── MOBILE DRAWER OVERLAY ── */}
                <div
                  className={`mobile-drawer-overlay sm-desktop:hidden ${mobileMenuOpen ? 'open' : ''}`}
                  onClick={() => setMobileMenuOpen(false)}
                />

                {/* ── MOBILE SLIDE-IN DRAWER ── */}
                <nav className={`mobile-drawer sm-desktop:hidden ${mobileMenuOpen ? 'open' : ''}`} aria-label="Mobile navigation">
                  <div className="mobile-drawer-header">
                    <img alt="HUIT" width="100" height="28" className="object-contain" src="/images/huit_logo.png" />
                    <button
                      className="mobile-drawer-close"
                      onClick={() => setMobileMenuOpen(false)}
                      aria-label="Đóng menu"
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24">
                        <line x1="18" y1="6" x2="6" y2="18"/>
                        <line x1="6" y1="6" x2="18" y2="18"/>
                      </svg>
                    </button>
                  </div>

                  <div className="mobile-drawer-nav">
                    {drawerLinks.map(({ href, label, icon }) => (
                      <Link
                        key={href}
                        href={href}
                        className={`mobile-drawer-link ${pathname === href ? 'active' : ''}`}
                        onClick={() => setMobileMenuOpen(false)}
                      >
                        {icon}
                        {label}
                      </Link>
                    ))}
                  </div>

                  <div className="mobile-drawer-footer">
                    <div className="mb-3 flex items-center justify-between text-sm font-semibold" style={{ color: 'var(--site-text)' }}>
                      <span>{t('language')}</span>
                      <div className="language-switcher" role="group" aria-label={t('language')}>
                        <button type="button" className={language === 'vi' ? 'active' : ''} onClick={() => setLanguage('vi')} aria-pressed={language === 'vi'}>VI</button>
                        <button type="button" className={language === 'en' ? 'active' : ''} onClick={() => setLanguage('en')} aria-pressed={language === 'en'}>EN</button>
                      </div>
                    </div>
                    {currentUser ? (
                      <div className="flex flex-col gap-2">
                        <p className="text-sm font-semibold" style={{ color: 'var(--site-text)' }}>
                          {t('greeting')}, <span style={{ color: 'var(--site-primary)' }}>{currentUser.fullName}</span>
                        </p>
                        <button
                          onClick={() => { handleLogout(); setMobileMenuOpen(false); }}
                          className="w-full py-2.5 rounded-xl text-sm font-bold text-red-600 border border-red-200 bg-red-50 hover:bg-red-100 transition"
                        >
                          {t('logout')}
                        </button>
                      </div>
                    ) : (
                      <Link
                        href="/dang-nhap"
                        onClick={() => setMobileMenuOpen(false)}
                        className="flex items-center justify-center gap-2 w-full py-3 rounded-xl text-sm font-bold text-white-force"
                        style={{ background: 'linear-gradient(135deg, #0A2FFF, #79BCC2)' }}
                      >
                        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24">
                          <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/>
                        </svg>
                        {t('login')}
                      </Link>
                    )}
                  </div>
                </nav>
              </div>
            </div>

            {/* Page Content */}
            <CurtainReveal logoSrc={settings?.headerIconicLogoUrl || '/images/image.webp'} />
            <div id="page-content">{children}</div>

            <CookieConsent />

            {/* Floating Action Buttons */}
            <aside className="site-floating-actions" aria-label="Liên hệ nhanh">
              <a href="https://zalo.me/4418938306145458374" target="_blank" rel="noopener noreferrer" className="float-action zalo" data-label="Zalo" aria-label="Liên hệ qua Zalo">
                <img src="/images/zalo.png" alt="Zalo" className="w-full h-full object-contain" />
              </a>
              <a href="tel:0974331499" className="float-action phone" data-label="Gọi điện" aria-label="Gọi điện hỗ trợ BTC">
                <img src="/images/telephone.png" alt="Điện thoại" className="w-full h-full object-contain" />
              </a>
              <a href="mailto:duongdx@huit.edu.vn" className="float-action chat" data-label="Liên hệ" aria-label="Gửi email liên hệ">
                <img src="/images/mail.png" alt="Email" className="w-full h-full object-contain" />
              </a>
              <button
                className={`float-action scroll-top ${showScrollTop ? 'visible' : ''}`}
                onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
                data-label="Lên đầu trang"
                aria-label="Cuộn lên đầu trang"
              >
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" width="20" height="20">
                  <polyline points="18 15 12 9 6 15" />
                </svg>
              </button>
            </aside>

            {/* Rich Modern Footer */}
            <footer className="site-footer-modern">
              <div className="site-footer-grid">
                <div className="footer-brand-column">
                  <div className="footer-logos">
                    <img alt="HUIT's ICONIC 2026" src={settings?.headerIconicLogoUrl || '/images/image.webp'} className="max-h-12 w-auto object-contain" />
                  </div>
                  <p className="footer-justify">
                    HUIT's ICONIC 2026 - Cuộc thi Tìm kiếm Đại sứ Truyền thông Trường Đại học Công Thương TP.HCM, nơi tôn vinh nét đẹp tâm hồn, trí tuệ, thanh lịch và bản lĩnh sinh viên HUIT.
                  </p>
                  <p style={{ fontSize: '12px', marginTop: '6px', fontStyle: 'italic', opacity: 0.7 }}>
                    Tâm hồn · Trí tuệ · Thanh lịch · Bản lĩnh
                  </p>
                </div>

                <div>
                  <h3>{t('aboutUs')}</h3>
                  <Link href="/gioi-thieu">{t('aboutCompetition')}</Link>
                  <Link href="/the-le">{t('criteria')}</Link>
                  <Link href="/thoi-gian">{t('eventSchedule')}</Link>
                  <Link href="/bang-xep-hang">{t('ranking')}</Link>
                </div>

                <div>
                  <h3>{t('support')}</h3>
                  <Link href="/the-le">{t('votingGuide')}</Link>
                  <Link href="/the-le#faq">{t('faq')}</Link>
                  <a href="mailto:duongdx@huit.edu.vn">{t('contactOrganizers')}</a>
                  <a href="https://huit.edu.vn" target="_blank" rel="noopener noreferrer">{t('huitPortal')}</a>
                </div>

                <div className="footer-contact-column">
                  <h3>{t('contactInfo')}</h3>
                  <p className="text-[12.5px] font-bold text-[var(--site-text)] opacity-95 whitespace-nowrap">
                    Trưởng BTC: Thầy Đặng Xuân Dương
                  </p>
                  <a href="tel:0974331499" className="flex items-center gap-2 text-[13px] hover:text-[var(--site-primary)] transition whitespace-nowrap">
                    <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24" className="text-[var(--site-primary)] shrink-0">
                      <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.8 19.8 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6A19.8 19.8 0 0 1 2.12 4.18 2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72c.12.9.33 1.78.62 2.63a2 2 0 0 1-.45 2.11L8 9.73a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45c.85.3 1.73.5 2.63.62A2 2 0 0 1 22 16.92Z" />
                    </svg>
                    0974 331 499 (Hotline / Zalo)
                  </a>
                  <a href="mailto:duongdx@huit.edu.vn" className="flex items-center gap-2 text-[13px] hover:text-[var(--site-primary)] transition whitespace-nowrap">
                    <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24" className="text-[var(--site-primary)] shrink-0">
                      <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" />
                      <polyline points="22,6 12,13 2,6" />
                    </svg>
                    duongdx@huit.edu.vn
                  </a>
                  <a href="mailto:media@huit.edu.vn" className="flex items-center gap-2 text-[12.5px] hover:text-[var(--site-primary)] transition opacity-80 whitespace-nowrap">
                    <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24" className="text-[var(--site-primary)] shrink-0 opacity-70">
                      <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" />
                      <polyline points="22,6 12,13 2,6" />
                    </svg>
                    media@huit.edu.vn (HUIT Media)
                  </a>
                  <p className="flex items-start gap-2 text-[12.5px] leading-relaxed text-left">
                    <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24" className="text-[var(--site-primary)] mt-0.5 shrink-0">
                      <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" />
                      <circle cx="12" cy="10" r="3" />
                    </svg>
                    <span>140 Lê Trọng Tấn, P. Tây Thạnh, Q. Tân Phú, TP.HCM</span>
                  </p>
                  <div className="footer-socials">
                    <a href="https://www.facebook.com/Daisutruyenthonghuit" target="_blank" rel="noopener noreferrer" aria-label="Facebook" title="Fanpage HUIT's ICONIC">
                      <img src="/images/facebook.png" alt="Facebook" className="w-full h-full object-contain" />
                    </a>
                    <a href="https://zalo.me/4418938306145458374" target="_blank" rel="noopener noreferrer" aria-label="Zalo" title="Zalo HUIT Media">
                      <img src="/images/zalo.png" alt="Zalo" className="w-full h-full object-contain" />
                    </a>
                    <a href="https://www.tiktok.com/@huit_media" target="_blank" rel="noopener noreferrer" aria-label="TikTok" title="TikTok HUIT Media">
                      <img src="/images/tiktok.png" alt="TikTok" className="w-full h-full object-contain" />
                    </a>
                    <a href="https://www.instagram.com/dh_congthuong/" target="_blank" rel="noopener noreferrer" aria-label="Instagram" title="Instagram Đại học Công Thương">
                      <img src="/images/instagram.png" alt="Instagram" className="w-full h-full object-contain" />
                    </a>
                    <a href="https://www.youtube.com/@DHCongthuong" target="_blank" rel="noopener noreferrer" aria-label="Youtube" title="Youtube Đại học Công Thương" className="footer-social-icon footer-social-youtube">
                      <svg viewBox="0 0 24 24" aria-hidden="true">
                        <path d="M23 12.1c0 2.1-.2 4.1-.6 6.1-.3 1.2-1.2 2.1-2.4 2.4-2 .4-4 .6-8 .6s-6-.2-8-.6a3.05 3.05 0 0 1-2.4-2.4C1.2 16.2 1 14.2 1 12.1s.2-4.1.6-6.1C1.9 4.8 2.8 3.9 4 3.6 6 3.2 8 3 12 3s6 .2 8 .6c1.2.3 2.1 1.2 2.4 2.4.4 2 .6 4 .6 6.1ZM10 8.5v7l6-3.5-6-3.5Z" fill="currentColor" />
                      </svg>
                    </a>
                  </div>
                </div>
              </div>
              <div className="site-footer-bottom">
                <span>© 2026 HUIT Media · Trường Đại học Công Thương TP.HCM</span>
                <span style={{ fontSize: '11px' }}>
                  Đại sứ Truyền thông HUIT · <a href="mailto:media@huit.edu.vn" style={{ color: 'inherit' }}>media@huit.edu.vn</a>
                </span>
              </div>
            </footer>
          </main>
        </AlertProvider>
      </body>
    </html>
  );
}
