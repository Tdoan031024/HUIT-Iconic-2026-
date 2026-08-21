'use client';

import React, { useState, useEffect, useRef } from 'react';
import { useAlert } from '../AlertProvider';
import { apiUrl } from '../api';

declare global {
  interface Window {
    google?: any;
  }
}
const GOOGLE_CLIENT_ID = process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID || '';

const defaultRegisterForm = {
  fullName: '',
  email: '',
  phone: '',
  password: '',
  schoolOrCompany: '',
  contestTable: 'Bảng sinh viên, học viên',
};

function saveSession(payload: any) {
  localStorage.setItem('huit_web_user', JSON.stringify(payload.user));
  localStorage.setItem('huit_web_token', payload.token);
  window.dispatchEvent(new Event('huit-auth-changed'));
}

function redirectAfterAuth() {
  const params = new URLSearchParams(window.location.search);
  window.location.href = params.get('redirect') || '/';
}

function loadGoogleIdentityScript(): Promise<void> {
  return new Promise((resolve, reject) => {
    if (window.google?.accounts?.oauth2) {
      resolve();
      return;
    }

    const existingScript = document.querySelector<HTMLScriptElement>('script[src="https://accounts.google.com/gsi/client"]');
    if (existingScript) {
      if (window.google?.accounts?.oauth2) {
        resolve();
      } else {
        existingScript.addEventListener('load', () => {
          if (window.google?.accounts?.oauth2) {
            resolve();
          } else {
            const interval = setInterval(() => {
              if (window.google?.accounts?.oauth2) {
                clearInterval(interval);
                resolve();
              }
            }, 50);
            setTimeout(() => {
              clearInterval(interval);
              reject(new Error('Không thể khởi tạo Google Identity Services.'));
            }, 5000);
          }
        }, { once: true });
        existingScript.addEventListener('error', () => reject(new Error('Không thể tải Google Identity Services.')), { once: true });
      }
      return;
    }

    const script = document.createElement('script');
    script.src = 'https://accounts.google.com/gsi/client';
    script.async = true;
    script.defer = true;
    script.onload = () => {
      if (window.google?.accounts?.oauth2) {
        resolve();
      } else {
        const interval = setInterval(() => {
          if (window.google?.accounts?.oauth2) {
            clearInterval(interval);
            resolve();
          }
        }, 50);
        setTimeout(() => {
          clearInterval(interval);
          reject(new Error('Không thể khởi tạo Google Identity Services.'));
        }, 5000);
      }
    };
    script.onerror = () => reject(new Error('Không thể tải Google Identity Services.'));
    document.head.appendChild(script);
  });
}

export default function LoginPage() {
  const { showAlert } = useAlert();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showRegPassword, setShowRegPassword] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);
  const [loading, setLoading] = useState(false);
  const [registerOpen, setRegisterOpen] = useState(false);
  const [registerForm, setRegisterForm] = useState(defaultRegisterForm);
  const registerDialogRef = useRef<HTMLFormElement>(null);
  const registerCloseRef = useRef<HTMLButtonElement>(null);
  const registerTriggerRef = useRef<HTMLButtonElement>(null);

  // Field validation states
  const [loginErrors, setLoginErrors] = useState<{ email?: string; password?: string }>({});
  const [regErrors, setRegErrors] = useState<{ fullName?: string; phone?: string; email?: string; password?: string }>({});

  // Forgot password modal state
  const [forgotOpen, setForgotOpen] = useState(false);
  const [forgotEmail, setForgotEmail] = useState('');
  const [forgotSubmitted, setForgotSubmitted] = useState(false);

  useEffect(() => {
    if (!registerOpen) return;
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    registerCloseRef.current?.focus();

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        event.preventDefault();
        setRegisterOpen(false);
        return;
      }
      if (event.key !== 'Tab' || !registerDialogRef.current) return;
      const controls = Array.from(registerDialogRef.current.querySelectorAll<HTMLElement>(
        'a[href], button:not([disabled]), input:not([disabled]), select:not([disabled]), [tabindex]:not([tabindex="-1"])'
      ));
      const first = controls[0];
      const last = controls[controls.length - 1];
      if (!first || !last) return;
      if (event.shiftKey && document.activeElement === first) {
        event.preventDefault();
        last.focus();
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault();
        first.focus();
      }
    };
    document.addEventListener('keydown', handleKeyDown);
    return () => {
      document.removeEventListener('keydown', handleKeyDown);
      document.body.style.overflow = previousOverflow;
      registerTriggerRef.current?.focus();
    };
  }, [registerOpen]);

  const validateEmail = (val: string) => {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(val.trim());
  };

  const validatePhone = (val: string) => {
    return /^0\d{9,10}$/.test(val.trim());
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const errors: { email?: string; password?: string } = {};
    if (!email.trim()) {
      errors.email = 'Vui lòng nhập địa chỉ email.';
    } else if (!validateEmail(email)) {
      errors.email = 'Địa chỉ email không đúng định dạng.';
    }
    if (!password) {
      errors.password = 'Vui lòng nhập mật khẩu.';
    }

    if (Object.keys(errors).length > 0) {
      setLoginErrors(errors);
      return;
    }
    setLoginErrors({});

    setLoading(true);
    try {
      const res = await fetch(apiUrl('/api/web/auth/login'), {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });
      const data = await res.json().catch(() => null);
      if (!res.ok) {
        setLoginErrors({ email: data?.message || 'Email hoặc mật khẩu không chính xác.' });
        throw new Error(data?.message || 'Không thể đăng nhập.');
      }
      saveSession(data);
      await showAlert('Đăng nhập thành công. Chuyển hướng về trang chủ.', 'success', 'Đăng nhập thành công');
      redirectAfterAuth();
    } catch (error: any) {
      showAlert(error.message || 'Không thể đăng nhập.', 'error', 'Lỗi đăng nhập');
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleLogin = async () => {
    setLoading(true);
    try {
      if (!GOOGLE_CLIENT_ID) {
        throw new Error('Chưa cấu hình NEXT_PUBLIC_GOOGLE_CLIENT_ID cho đăng nhập Google.');
      }

      await loadGoogleIdentityScript();

      const accessToken = await new Promise<string>((resolve, reject) => {
        const tokenClient = window.google.accounts.oauth2.initTokenClient({
          client_id: GOOGLE_CLIENT_ID,
          scope: 'openid email profile',
          prompt: 'select_account',
          callback: (response: any) => {
            if (response?.access_token) {
              resolve(response.access_token);
              return;
            }
            reject(new Error(response?.error_description || response?.error || 'Không nhận được token Google.'));
          },
        });
        tokenClient.requestAccessToken();
      });

      const res = await fetch(apiUrl('/api/web/auth/google'), {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          accessToken,
          phone: registerForm.phone,
          schoolOrCompany: registerForm.schoolOrCompany,
          contestTable: registerForm.contestTable,
        }),
      });
      const data = await res.json().catch(() => null);
      if (!res.ok) throw new Error(data?.message || 'Không thể đăng nhập Google.');
      saveSession(data);
      await showAlert('Đăng nhập Google thành công. Chuyển hướng về trang chủ.', 'success', 'Đăng nhập thành công');
      redirectAfterAuth();
    } catch (error: any) {
      showAlert(error.message || 'Không thể đăng nhập Google.', 'error', 'Lỗi Google');
    } finally {
      setLoading(false);
    }
  };

  const updateRegisterForm = (key: keyof typeof defaultRegisterForm, value: string) => {
    setRegisterForm((prev) => ({ ...prev, [key]: value }));
    setRegErrors((prev) => ({ ...prev, [key]: undefined }));
  };

  const handleRegisterSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const errors: typeof regErrors = {};
    if (!registerForm.fullName.trim()) {
      errors.fullName = 'Vui lòng nhập họ và tên.';
    }
    if (!registerForm.phone.trim()) {
      errors.phone = 'Vui lòng nhập số điện thoại.';
    } else if (!validatePhone(registerForm.phone)) {
      errors.phone = 'Số điện thoại gồm 10 chữ số bắt đầu bằng số 0.';
    }
    if (!registerForm.email.trim()) {
      errors.email = 'Vui lòng nhập địa chỉ email.';
    } else if (!validateEmail(registerForm.email)) {
      errors.email = 'Email không hợp lệ.';
    }
    if (!registerForm.password || registerForm.password.length < 6) {
      errors.password = 'Mật khẩu phải từ 6 ký tự trở lên.';
    }

    if (Object.keys(errors).length > 0) {
      setRegErrors(errors);
      return;
    }
    setRegErrors({});

    setLoading(true);
    try {
      const res = await fetch(apiUrl('/api/web/auth/register'), {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(registerForm),
      });
      const data = await res.json().catch(() => null);
      if (!res.ok) throw new Error(data?.message || 'Không thể đăng ký tài khoản.');
      saveSession(data);
      await showAlert('Đăng ký tài khoản thành công. Chuyển hướng về trang chủ.', 'success', 'Đăng ký thành công');
      redirectAfterAuth();
    } catch (error: any) {
      showAlert(error.message || 'Không thể đăng ký tài khoản.', 'error', 'Lỗi đăng ký');
    } finally {
      setLoading(false);
    }
  };

  const handleForgotSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateEmail(forgotEmail)) {
      showAlert('Vui lòng nhập đúng địa chỉ email đã đăng ký.', 'warning', 'Email không hợp lệ');
      return;
    }
    setForgotSubmitted(true);
  };

  return (
    <>
      <style>{`
        @media (min-width: 812px) {
          .iUzfqH {
            background: transparent;
          }
        }
        @keyframes fadeSlideUp {
          from { opacity: 0; transform: translateY(36px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        @keyframes fadeSlideLeft {
          from { opacity: 0; transform: translateX(-36px); }
          to   { opacity: 1; transform: translateX(0); }
        }
        @keyframes fadeSlideRight {
          from { opacity: 0; transform: translateX(36px); }
          to   { opacity: 1; transform: translateX(0); }
        }
        @keyframes glowPulse {
          0%, 100% { opacity: 0.18; transform: scale(1); }
          50%       { opacity: 0.28; transform: scale(1.06); }
        }
        @keyframes float {
          0%, 100% { transform: translateY(0px) rotate(0deg); }
          50%       { transform: translateY(-12px) rotate(3deg); }
        }
        @keyframes orbFloat {
          0%, 100% { transform: translate(0,0); }
          33%       { transform: translate(20px,-15px); }
          66%       { transform: translate(-10px, 10px); }
        }
        @keyframes shimmer {
          0%   { background-position: -200% 0; }
          100% { background-position: 200% 0; }
        }
        .anim-up    { animation: fadeSlideUp    0.9s cubic-bezier(0.16,1,0.3,1) both; }
        .anim-left  { animation: fadeSlideLeft  0.9s cubic-bezier(0.16,1,0.3,1) both; }
        .anim-right { animation: fadeSlideRight 0.9s cubic-bezier(0.16,1,0.3,1) both; }
        .anim-d100  { animation-delay: 100ms; }
        .anim-d200  { animation-delay: 200ms; }
        .anim-d300  { animation-delay: 300ms; }
        .anim-d400  { animation-delay: 400ms; }
        .anim-d500  { animation-delay: 500ms; }
        .anim-d600  { animation-delay: 600ms; }
        .anim-d700  { animation-delay: 700ms; }
        .orb1 { animation: orbFloat 10s ease-in-out infinite; }
        .orb2 { animation: orbFloat 14s ease-in-out infinite reverse; }
        .orb3 { animation: glowPulse 7s ease-in-out infinite; }

        /* Input styling with theme support */
        .login-input {
          background-color: var(--site-card-soft, #f8fafc) !important;
          color: var(--site-text, #0f172a) !important;
          border: 1.5px solid var(--site-line, #cbd5e1) !important;
          transition: all 0.25s ease !important;
        }
        .login-input::placeholder {
          color: var(--site-muted, #64748b) !important;
          opacity: 0.8;
        }
        .login-input:focus {
          border-color: #0284c7 !important;
          background-color: #ffffff !important;
          box-shadow: 0 0 0 4px rgba(2, 132, 199, 0.15) !important;
          outline: none !important;
        }
        .login-input.has-error {
          border-color: #ef4444 !important;
          background-color: #fef2f2 !important;
        }

        :root[data-theme='dark'] .login-input {
          background-color: rgba(255, 255, 255, 0.08) !important;
          color: #ffffff !important;
          border-color: rgba(255, 255, 255, 0.15) !important;
        }
        :root[data-theme='dark'] .login-input::placeholder {
          color: rgba(255, 255, 255, 0.45) !important;
        }
        :root[data-theme='dark'] .login-input:focus {
          background-color: rgba(255, 255, 255, 0.14) !important;
          border-color: #79BCC2 !important;
          box-shadow: 0 0 0 4px rgba(121, 188, 194, 0.2) !important;
        }
        :root[data-theme='dark'] .login-input.has-error {
          border-color: #f87171 !important;
          background-color: rgba(153, 27, 27, 0.25) !important;
        }

        /* Select box popup styling */
        select.login-input option {
          background-color: #ffffff !important;
          color: #0f172a !important;
        }
        :root[data-theme='dark'] select.login-input option {
          background-color: #0f172a !important;
          color: #ffffff !important;
        }

        /* Login button */
        .btn-login {
          color: #ffffff !important;
          transition: transform 0.3s cubic-bezier(0.34,1.56,0.64,1),
                      box-shadow 0.3s ease,
                      background-color 0.3s ease;
        }
        .btn-login:hover {
          transform: translateY(-2px) scale(1.02);
          box-shadow: 0 10px 30px rgba(0, 150, 199, 0.45), 0 0 20px rgba(121, 188, 194, 0.25);
        }
        .btn-login:active { transform: translateY(0) scale(0.99); }

        /* Google button theme styling */
        .btn-google {
          background-color: #ffffff !important;
          color: #0f172a !important;
          border: 1.5px solid #e2e8f0 !important;
          box-shadow: 0 4px 18px rgba(0, 0, 0, 0.06) !important;
          transition: all 0.25s ease !important;
        }
        .btn-google:hover {
          transform: translateY(-2px);
          background-color: #f8fafc !important;
          border-color: #cbd5e1 !important;
          box-shadow: 0 8px 24px rgba(0, 0, 0, 0.1) !important;
        }
        :root[data-theme='dark'] .btn-google {
          background-color: rgba(255, 255, 255, 0.08) !important;
          color: #ffffff !important;
          border-color: rgba(255, 255, 255, 0.15) !important;
        }
        :root[data-theme='dark'] .btn-google:hover {
          background-color: rgba(255, 255, 255, 0.14) !important;
          border-color: rgba(121, 188, 194, 0.4) !important;
        }

        /* Divider separator */
        .separator-line {
          height: 1px;
          background: linear-gradient(90deg, transparent, rgba(148,163,184,0.3), transparent);
        }

        /* Card wrapper */
        .login-card {
          backdrop-filter: blur(20px);
          background: #ffffff;
          border: 1px solid #e2e8f0;
          box-shadow: 0 20px 50px rgba(15, 23, 42, 0.08);
          transition: box-shadow 0.4s ease, border-color 0.4s ease;
        }
        :root[data-theme='dark'] .login-card {
          background: linear-gradient(135deg, rgba(255,255,255,0.04) 0%, rgba(255,255,255,0.02) 100%);
          border-color: rgba(255,255,255,0.08);
          box-shadow: 0 24px 64px rgba(0,0,0,0.5), inset 0 1px 0 rgba(255,255,255,0.06);
        }
        .login-card:hover {
          box-shadow: 0 28px 70px rgba(15, 23, 42, 0.12);
        }
        :root[data-theme='dark'] .login-card:hover {
          box-shadow: 0 32px 80px rgba(0,0,0,0.55), 0 0 40px rgba(121,188,194,0.06);
          border-color: rgba(121,188,194,0.12);
        }
        .link-hover {
          transition: color 0.2s ease, letter-spacing 0.2s ease;
        }
        .link-hover:hover {
          color: #0284c7;
          letter-spacing: 0.03em;
        }
        .floating-icon {
          animation: float 6s ease-in-out infinite;
        }
      `}</style>

      <main suppressHydrationWarning className="sc-908a50-0 iUzfqH theme-page auth-theme-page flex-1 w-full min-h-[calc(100vh-80px-200px)] flex flex-col justify-center items-center py-16 sm:py-24 px-6 overflow-hidden relative">

        {/* Multi-layer ambient glows */}
        <div className="orb1 absolute -top-20 -left-20 w-[450px] h-[450px] rounded-full bg-gradient-to-br from-[#0A2FFF]/12 to-transparent blur-[120px] pointer-events-none" />
        <div className="orb2 absolute -bottom-20 -right-20 w-[500px] h-[500px] rounded-full bg-gradient-to-tl from-[#79BCC2]/10 to-transparent blur-[130px] pointer-events-none" />
        <div className="orb3 absolute top-1/3 left-1/2 -translate-x-1/2 w-[600px] h-[300px] rounded-full bg-gradient-to-r from-[#0A2FFF]/6 via-[#79BCC2]/6 to-[#0A2FFF]/6 blur-[80px] pointer-events-none" />

        {/* Decorative bottom glow */}
        <div className="absolute left-0 right-0 bottom-0 w-full h-[240px] opacity-20 pointer-events-none z-0" style={{
          backgroundImage: 'radial-gradient(ellipse at bottom, #79BCC2 0%, transparent 70%)'
        }}></div>

        {/* Floating decorative icon */}
        <div className={`floating-icon absolute top-16 right-12 opacity-10 hidden lg:block ${mounted ? 'anim-right anim-d600' : 'opacity-0'}`}>
          <svg xmlns="http://www.w3.org/2000/svg" width="80" height="80" fill="none" stroke="#79BCC2" strokeWidth="1" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="40" cy="28" r="14"></circle>
            <path d="M12 72v-4a20 20 0 0 1 20-20h16a20 20 0 0 1 20 20v4"></path>
          </svg>
        </div>
        <div className={`floating-icon absolute bottom-24 left-12 opacity-10 hidden lg:block ${mounted ? 'anim-left anim-d700' : 'opacity-0'}`} style={{ animationDelay: '3s' }}>
          <svg xmlns="http://www.w3.org/2000/svg" width="60" height="60" fill="none" stroke="#0A2FFF" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
            <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"></path>
          </svg>
        </div>

        {/* Main content card */}
        <div className={`login-card w-full max-w-[920px] rounded-[32px] p-8 sm:p-12 z-10 ${mounted ? 'anim-up' : 'opacity-0'}`}>

          {/* Header */}
          <div className={`text-center mb-10 ${mounted ? 'anim-up anim-d100' : 'opacity-0'}`}>
            <h1 className="text-[28px] sm:text-[36px] font-extrabold text-white uppercase tracking-[0.06em] mb-1">
              Đăng nhập
            </h1>
            <p className="text-[13px] text-white/40 tracking-wider">HUIT STARTUP 2026 — Cổng bình chọn chính thức</p>
            <div className="h-[2.5px] w-[50px] bg-gradient-to-r from-[#0A2FFF] to-[#79BCC2] mx-auto rounded-full mt-4 transition-all duration-[1000ms]" style={{ width: mounted ? '50px' : '0px' }} />
          </div>

          <div className="flex flex-col md:flex-row items-start justify-between gap-10 md:gap-16">

            {/* Left Column: Email/Password Form */}
            <form onSubmit={handleSubmit} className={`w-full max-w-[360px] flex flex-col space-y-5 ${mounted ? 'anim-left anim-d200' : 'opacity-0'}`}>

              {/* Email input */}
              <div className="flex flex-col space-y-1.5 w-full">
                <label htmlFor="login-email" className="text-white/80 text-[14px] font-semibold tracking-wide flex items-center gap-2">
                  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#79BCC2" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" className="drop-shadow-[0_0_8px_rgba(121,188,194,0.4)]">
                    <circle cx="12" cy="12" r="4"></circle>
                    <path d="M16 12v1.5a2.5 2.5 0 0 0 5 0V12a9 9 0 1 0-5.5 8.28"></path>
                  </svg>
                  Địa chỉ email
                </label>
                <input
                  id="login-email"
                  name="email"
                  type="email"
                  autoComplete="email"
                  inputMode="email"
                  className={`login-input w-full h-[48px] px-4 rounded-[14px] text-[15px] ${
                    loginErrors.email ? 'has-error' : ''
                  }`}
                  value={email}
                  onChange={e => {
                    setEmail(e.target.value);
                    if (loginErrors.email) setLoginErrors(prev => ({ ...prev, email: undefined }));
                  }}
                  placeholder="Nhập địa chỉ email"
                />
                {loginErrors.email && (
                  <p className="text-[12.5px] font-semibold text-rose-600 dark:text-rose-400 flex items-center gap-1.5 mt-1">
                    <svg className="w-3.5 h-3.5 flex-shrink-0 text-rose-500" fill="none" viewBox="0 0 24 24" stroke="currentColor"><circle cx="12" cy="12" r="10" strokeWidth="2"/><line x1="12" y1="8" x2="12" y2="12" strokeWidth="2"/><line x1="12" y1="16" x2="12.01" y2="16" strokeWidth="2"/></svg>
                    {loginErrors.email}
                  </p>
                )}
              </div>

              {/* Password input */}
              <div className="flex flex-col space-y-1.5 w-full relative">
                <label htmlFor="login-password" className="text-white/80 text-[14px] font-semibold tracking-wide flex items-center gap-2">
                  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#79BCC2" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" className="drop-shadow-[0_0_8px_rgba(121,188,194,0.4)]">
                    <rect x="3" y="11" width="18" height="11" rx="3" ry="3"></rect>
                    <path d="M7 11V7a5 5 0 0 1 10 0v4"></path>
                    <circle cx="12" cy="16" r="1.5" fill="#79BCC2"></circle>
                  </svg>
                  Mật khẩu
                </label>
                <div className="relative w-full h-[48px]">
                  <input
                    id="login-password"
                    name="password"
                    type={showPassword ? 'text' : 'password'}
                    autoComplete="current-password"
                    className={`login-input w-full h-full pl-4 pr-12 rounded-[14px] text-[15px] ${
                      loginErrors.password ? 'has-error' : ''
                    }`}
                    value={password}
                    onChange={e => {
                      setPassword(e.target.value);
                      if (loginErrors.password) setLoginErrors(prev => ({ ...prev, password: undefined }));
                    }}
                    placeholder="Nhập mật khẩu"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-1 top-1/2 grid h-11 w-11 -translate-y-1/2 place-items-center rounded-lg text-slate-400 hover:text-slate-700 dark:text-white/60 dark:hover:text-white transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500"
                    aria-label={showPassword ? 'Ẩn mật khẩu' : 'Hiện mật khẩu'}
                    aria-pressed={showPassword}
                  >
                    {showPassword ? (
                      <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path><circle cx="12" cy="12" r="3"></circle></svg>
                    ) : (
                      <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"></path><line x1="1" y1="1" x2="23" y2="23"></line></svg>
                    )}
                  </button>
                </div>
                {loginErrors.password && (
                  <p className="text-[12.5px] font-semibold text-rose-600 dark:text-rose-400 flex items-center gap-1.5 mt-1">
                    <svg className="w-3.5 h-3.5 flex-shrink-0 text-rose-500" fill="none" viewBox="0 0 24 24" stroke="currentColor"><circle cx="12" cy="12" r="10" strokeWidth="2"/><line x1="12" y1="8" x2="12" y2="12" strokeWidth="2"/><line x1="12" y1="16" x2="12.01" y2="16" strokeWidth="2"/></svg>
                    {loginErrors.password}
                  </p>
                )}
              </div>

              {/* Forgot Password link */}
              <div className="text-right -mt-1">
                <button
                  type="button"
                  onClick={() => {
                    setForgotEmail(email);
                    setForgotSubmitted(false);
                    setForgotOpen(true);
                  }}
                  className="link-hover text-[#79BCC2] text-[13px] font-semibold underline-offset-4 hover:underline"
                >
                  Quên mật khẩu?
                </button>
              </div>

              {/* Submit button */}
              <button
                type="submit"
                disabled={loading}
                className="btn-login text-white-force w-full h-[50px] bg-gradient-to-r from-[#0077b6] via-[#0096c7] to-[#0284c7] hover:from-[#0284c7] hover:to-[#0369a1] border border-cyan-300/30 rounded-[14px] font-extrabold flex items-center justify-center text-[15px] tracking-widest uppercase shadow-lg shadow-sky-600/30 disabled:opacity-60"
              >
                {loading ? 'Đang đăng nhập…' : 'Đăng nhập'}
              </button>
            </form>

            {/* Separator */}
            <div className={`flex flex-row md:flex-col items-center justify-center gap-4 ${mounted ? 'anim-up anim-d300' : 'opacity-0'}`}>
              <div className="separator-line w-16 md:w-px md:h-16" />
              <span className="text-white/30 text-[11px] font-bold tracking-[0.2em] uppercase">Hoặc</span>
              <div className="separator-line w-16 md:w-px md:h-16" />
            </div>

            {/* Right Column: Google Login & Signup */}
            <div className={`w-full max-w-[360px] flex flex-col items-center justify-center space-y-6 ${mounted ? 'anim-right anim-d400' : 'opacity-0'}`}>

              {/* Social label */}
              <p className="text-white/40 text-[12px] font-semibold tracking-widest uppercase text-center">
                Đăng nhập nhanh
              </p>

              {/* Google Sign-in Button */}
              <button
                type="button"
                onClick={handleGoogleLogin}
                className="btn-google w-full max-w-[320px] flex items-center justify-center gap-3.5 p-3.5 rounded-[16px] bg-white text-neutral-800 border border-slate-200/80 shadow-[0_12px_30px_rgba(0,0,0,0.12)] hover:bg-slate-50 hover:border-slate-300 transition-all duration-300"
              >
                <div className="w-9 h-9 flex items-center justify-center rounded-[10px] flex-shrink-0 bg-white">
                  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24">
                    <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                    <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                    <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z" />
                    <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
                  </svg>
                </div>
                <span className="text-[14px] font-extrabold tracking-wide text-neutral-800">Đăng nhập với Google</span>
              </button>

              {/* Register link */}
              <div className="flex flex-col items-center gap-2 pt-2">
                <p className="text-white/30 text-[12px]">Chưa có tài khoản?</p>
                <button
                  ref={registerTriggerRef}
                  type="button"
                  onClick={() => setRegisterOpen(true)}
                  className="link-hover text-[#79BCC2] text-[14px] font-semibold underline-offset-4 hover:underline"
                >
                  Đăng ký ngay →
                </button>
              </div>

            </div>
          </div>
        </div>

        {registerOpen && (
          <div
            className="fixed inset-0 z-[1100] flex items-start justify-center overflow-y-auto bg-black/65 px-4 pb-[calc(24px+env(safe-area-inset-bottom))] pt-[48px] sm:px-8 sm:pb-8 sm:pt-[72px] backdrop-blur-md"
            onMouseDown={(event) => {
              if (event.target === event.currentTarget) setRegisterOpen(false);
            }}
          >
            <form
              ref={registerDialogRef}
              role="dialog"
              aria-modal="true"
              aria-labelledby="register-dialog-title"
              onSubmit={handleRegisterSubmit}
              className="login-card official-register-modal w-full max-w-[720px] rounded-[28px] p-6 sm:p-8 relative flex flex-col max-h-[85vh] overflow-hidden shadow-2xl"
            >
              {/* Header */}
              <div className="flex items-start justify-between gap-4 border-b border-slate-200/80 dark:border-white/10 pb-4 flex-shrink-0">
                <div>
                  <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#0077b6]/10 text-[#0077b6] dark:text-[#79BCC2] dark:bg-[#79BCC2]/15 text-[11px] font-extrabold uppercase tracking-widest border border-[#0077b6]/20 dark:border-[#79BCC2]/20">
                    TẠO TÀI KHOẢN KHÁN GIẢ
                  </span>
                  <h2 id="register-dialog-title" className="mt-2 text-[22px] sm:text-[25px] font-extrabold tracking-wide text-slate-900 dark:text-white">
                    Đăng ký bình chọn khán giả
                  </h2>
                  <p className="mt-1 text-[13px] sm:text-[14px] leading-relaxed text-slate-500 dark:text-white/65">
                    Tài khoản khán giả dùng để nhận lượt miễn phí hằng ngày và lưu lịch sử bình chọn.
                  </p>
                </div>
                <button
                  ref={registerCloseRef}
                  type="button"
                  onClick={() => setRegisterOpen(false)}
                  className="grid h-10 w-10 flex-shrink-0 place-items-center rounded-xl border border-slate-200 dark:border-white/10 bg-slate-100 dark:bg-white/5 text-slate-500 dark:text-white/60 transition hover:bg-rose-500/10 hover:border-rose-500/30 hover:text-rose-600 dark:hover:text-rose-400"
                  aria-label="Đóng"
                >
                  <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M18 6 6 18" />
                    <path d="m6 6 12 12" />
                  </svg>
                </button>
              </div>

              {/* Scrollable Form Body */}
              <div className="overflow-y-auto py-5 pr-1 space-y-5 flex-1 custom-scrollbar">
                <div className="grid gap-5 sm:grid-cols-2">

                  {/* Full Name */}
                  <label className="space-y-1.5 sm:col-span-2">
                    <span className="text-[13px] font-semibold text-slate-700 dark:text-white/80 flex items-center gap-1.5">
                      <svg xmlns="http://www.w3.org/2000/svg" width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="#0284c7" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2"></path>
                        <circle cx="12" cy="7" r="4"></circle>
                      </svg>
                      Họ và tên <span className="text-red-500 font-bold">*</span>
                    </span>
                    <input
                      name="fullName"
                      autoComplete="name"
                      className={`login-input h-[48px] w-full rounded-[14px] px-4 text-[14px] ${
                        regErrors.fullName ? 'has-error' : ''
                      }`}
                      value={registerForm.fullName}
                      onChange={(event) => {
                        updateRegisterForm('fullName', event.target.value);
                        if (regErrors.fullName) setRegErrors(prev => ({ ...prev, fullName: undefined }));
                      }}
                      placeholder="Nhập họ và tên đầy đủ"
                    />
                    {regErrors.fullName && (
                      <p className="text-[12.5px] font-semibold text-rose-600 dark:text-rose-400 flex items-center gap-1.5 mt-1">
                        <svg className="w-3.5 h-3.5 flex-shrink-0 text-rose-500" fill="none" viewBox="0 0 24 24" stroke="currentColor"><circle cx="12" cy="12" r="10" strokeWidth="2"/><line x1="12" y1="8" x2="12" y2="12" strokeWidth="2"/><line x1="12" y1="16" x2="12.01" y2="16" strokeWidth="2"/></svg>
                        {regErrors.fullName}
                      </p>
                    )}
                  </label>

                  {/* Phone */}
                  <label className="space-y-1.5">
                    <span className="text-[13px] font-semibold text-slate-700 dark:text-white/80 flex items-center gap-1.5">
                      <svg xmlns="http://www.w3.org/2000/svg" width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="#0284c7" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"></path>
                      </svg>
                      Số điện thoại <span className="text-red-500 font-bold">*</span>
                    </span>
                    <input
                      name="phone"
                      type="tel"
                      inputMode="tel"
                      autoComplete="tel"
                      className={`login-input h-[48px] w-full rounded-[14px] px-4 text-[14px] ${
                        regErrors.phone ? 'has-error' : ''
                      }`}
                      value={registerForm.phone}
                      onChange={(event) => {
                        updateRegisterForm('phone', event.target.value);
                        if (regErrors.phone) setRegErrors(prev => ({ ...prev, phone: undefined }));
                      }}
                      placeholder="VD: 0912345678"
                    />
                    {regErrors.phone && (
                      <p className="text-[12.5px] font-semibold text-rose-600 dark:text-rose-400 flex items-center gap-1.5 mt-1">
                        <svg className="w-3.5 h-3.5 flex-shrink-0 text-rose-500" fill="none" viewBox="0 0 24 24" stroke="currentColor"><circle cx="12" cy="12" r="10" strokeWidth="2"/><line x1="12" y1="8" x2="12" y2="12" strokeWidth="2"/><line x1="12" y1="16" x2="12.01" y2="16" strokeWidth="2"/></svg>
                        {regErrors.phone}
                      </p>
                    )}
                  </label>

                  {/* Email */}
                  <label className="space-y-1.5">
                    <span className="text-[13px] font-semibold text-slate-700 dark:text-white/80 flex items-center gap-1.5">
                      <svg xmlns="http://www.w3.org/2000/svg" width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="#0284c7" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                        <circle cx="12" cy="12" r="4"></circle>
                        <path d="M16 12v1.5a2.5 2.5 0 0 0 5 0V12a9 9 0 1 0-5.5 8.28"></path>
                      </svg>
                      Email <span className="text-red-500 font-bold">*</span>
                    </span>
                    <input
                      name="email"
                      type="email"
                      inputMode="email"
                      autoComplete="email"
                      className={`login-input h-[48px] w-full rounded-[14px] px-4 text-[14px] ${
                        regErrors.email ? 'has-error' : ''
                      }`}
                      value={registerForm.email}
                      onChange={(event) => {
                        updateRegisterForm('email', event.target.value);
                        if (regErrors.email) setRegErrors(prev => ({ ...prev, email: undefined }));
                      }}
                      placeholder="Nhập địa chỉ email"
                    />
                    {regErrors.email && (
                      <p className="text-[12.5px] font-semibold text-rose-600 dark:text-rose-400 flex items-center gap-1.5 mt-1">
                        <svg className="w-3.5 h-3.5 flex-shrink-0 text-rose-500" fill="none" viewBox="0 0 24 24" stroke="currentColor"><circle cx="12" cy="12" r="10" strokeWidth="2"/><line x1="12" y1="8" x2="12" y2="12" strokeWidth="2"/><line x1="12" y1="16" x2="12.01" y2="16" strokeWidth="2"/></svg>
                        {regErrors.email}
                      </p>
                    )}
                  </label>

                  {/* Password */}
                  <label className="space-y-1.5 sm:col-span-2 relative">
                    <span className="text-[13px] font-semibold text-slate-700 dark:text-white/80 flex items-center gap-1.5">
                      <svg xmlns="http://www.w3.org/2000/svg" width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="#0284c7" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                        <rect x="3" y="11" width="18" height="11" rx="3" ry="3"></rect>
                        <path d="M7 11V7a5 5 0 0 1 10 0v4"></path>
                      </svg>
                      Mật khẩu <span className="text-red-500 font-bold">*</span>
                    </span>
                    <div className="relative w-full h-[48px]">
                      <input
                        name="password"
                        type={showRegPassword ? 'text' : 'password'}
                        autoComplete="new-password"
                        minLength={6}
                        className={`login-input h-full w-full rounded-[14px] pl-4 pr-12 text-[14px] ${
                          regErrors.password ? 'has-error' : ''
                        }`}
                        value={registerForm.password}
                        onChange={(event) => {
                          updateRegisterForm('password', event.target.value);
                          if (regErrors.password) setRegErrors(prev => ({ ...prev, password: undefined }));
                        }}
                        placeholder="Tạo mật khẩu (tối thiểu 6 ký tự)"
                      />
                      <button
                        type="button"
                        onClick={() => setShowRegPassword(!showRegPassword)}
                        className="absolute right-1 top-1/2 grid h-11 w-11 -translate-y-1/2 place-items-center rounded-lg text-slate-400 hover:text-slate-700 dark:text-white/60 dark:hover:text-white transition-colors focus-visible:outline-none"
                        aria-label={showRegPassword ? 'Ẩn mật khẩu' : 'Hiện mật khẩu'}
                      >
                        {showRegPassword ? (
                          <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path><circle cx="12" cy="12" r="3"></circle></svg>
                        ) : (
                          <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"></path><line x1="1" y1="1" x2="23" y2="23"></line></svg>
                        )}
                      </button>
                    </div>
                    {regErrors.password && (
                      <p className="text-[12.5px] font-semibold text-rose-600 dark:text-rose-400 flex items-center gap-1.5 mt-1">
                        <svg className="w-3.5 h-3.5 flex-shrink-0 text-rose-500" fill="none" viewBox="0 0 24 24" stroke="currentColor"><circle cx="12" cy="12" r="10" strokeWidth="2"/><line x1="12" y1="8" x2="12" y2="12" strokeWidth="2"/><line x1="12" y1="16" x2="12.01" y2="16" strokeWidth="2"/></svg>
                        {regErrors.password}
                      </p>
                    )}
                  </label>

                  {/* School/Company */}
                  <label className="space-y-1.5">
                    <span className="text-[13px] font-semibold text-slate-700 dark:text-white/80 flex items-center gap-1.5">
                      <svg xmlns="http://www.w3.org/2000/svg" width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="#0284c7" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M22 10v6M2 10l10-5 10 5-10 5z"></path>
                        <path d="M6 12v5c3 3 9 3 12 0v-5"></path>
                      </svg>
                      Trường học / Đơn vị
                    </span>
                    <input
                      name="organization"
                      autoComplete="organization"
                      className="login-input h-[48px] w-full rounded-[14px] px-4 text-[14px]"
                      value={registerForm.schoolOrCompany}
                      onChange={(event) => updateRegisterForm('schoolOrCompany', event.target.value)}
                      placeholder="Nhập tên trường/đơn vị"
                    />
                  </label>

                  {/* Contest Table */}
                  <label className="space-y-1.5">
                    <span className="text-[13px] font-semibold text-slate-700 dark:text-white/80 flex items-center gap-1.5">
                      <svg xmlns="http://www.w3.org/2000/svg" width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="#0284c7" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                        <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"></polygon>
                      </svg>
                      Bảng dự án quan tâm
                    </span>
                    <select
                      name="contestTable"
                      className="login-input h-[48px] w-full rounded-[14px] px-4 text-[14px] font-semibold cursor-pointer"
                      value={registerForm.contestTable}
                      onChange={(event) => updateRegisterForm('contestTable', event.target.value)}
                    >
                      <option value="Bảng học sinh">Bảng học sinh</option>
                      <option value="Bảng sinh viên">Bảng sinh viên</option>
                      <option value="Bảng doanh nghiệp">Bảng doanh nghiệp</option>
                    </select>
                  </label>
                </div>
              </div>

              {/* Sticky Action Footer */}
              <div className="sticky bottom-0 bg-slate-50/95 dark:bg-[#0c1427]/95 backdrop-blur-md pt-3.5 pb-2 -mx-6 px-6 sm:-mx-8 sm:px-8 border-t border-slate-200/80 dark:border-white/10 z-20 flex flex-col-reverse gap-3 sm:flex-row sm:justify-end flex-shrink-0">
                <button
                  type="button"
                  onClick={() => setRegisterOpen(false)}
                  className="h-[46px] rounded-[14px] border border-slate-300 dark:border-white/15 px-6 text-[13.5px] font-bold text-slate-600 dark:text-white/70 hover:bg-slate-200/60 dark:hover:bg-white/10 hover:text-slate-900 dark:hover:text-white transition-all"
                >
                  Hủy
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="btn-login text-white-force h-[46px] rounded-[14px] bg-gradient-to-r from-[#0077b6] via-[#0096c7] to-[#0284c7] hover:from-[#0284c7] hover:to-[#0369a1] px-7 text-[13.5px] font-extrabold uppercase tracking-wider text-white disabled:cursor-not-allowed disabled:opacity-60 shadow-lg shadow-sky-600/30 flex items-center justify-center gap-2"
                >
                  <span className="text-white-force text-white font-extrabold" style={{ color: '#ffffff !important' }}>
                    {loading ? 'Đang xử lý...' : 'Tạo tài khoản'}
                  </span>
                </button>
              </div>
            </form>
          </div>
        )}

        {/* Forgot Password Modal */}
        {forgotOpen && (
          <div
            className="fixed inset-0 z-[1150] flex items-center justify-center bg-black/70 px-4 backdrop-blur-md"
            onMouseDown={(event) => {
              if (event.target === event.currentTarget) setForgotOpen(false);
            }}
          >
            <div className="login-card w-full max-w-[480px] rounded-[28px] p-6 sm:p-8 relative">
              <div className="flex items-start justify-between border-b border-white/10 pb-4 mb-5">
                <div>
                  <p className="text-[12px] font-bold uppercase tracking-[0.18em] text-[#79BCC2]">Khôi phục mật khẩu</p>
                  <h3 className="text-[20px] font-extrabold text-white mt-1">Yêu cầu hỗ trợ tài khoản</h3>
                </div>
                <button
                  type="button"
                  onClick={() => setForgotOpen(false)}
                  className="grid h-9 w-9 place-items-center rounded-xl border border-white/10 bg-white/5 text-white/60 transition hover:text-white"
                >
                  ✕
                </button>
              </div>

              {!forgotSubmitted ? (
                <form onSubmit={handleForgotSubmit} className="space-y-4">
                  <p className="text-[13.5px] leading-relaxed text-white/70">
                    Nhập địa chỉ email bạn đã sử dụng để đăng ký. Ban tổ chức sẽ gửi hướng dẫn khôi phục lại mật khẩu cho bạn.
                  </p>
                  <div className="space-y-1.5">
                    <label className="text-[12px] font-semibold text-white/80">Địa chỉ email</label>
                    <input
                      type="email"
                      required
                      value={forgotEmail}
                      onChange={(e) => setForgotEmail(e.target.value)}
                      placeholder="Nhập địa chỉ email của bạn"
                      className="login-input h-[46px] w-full rounded-[14px] border-2 border-transparent bg-white/90 px-4 text-[14px] text-neutral-800"
                    />
                  </div>
                  <div className="pt-2 flex gap-3 justify-end">
                    <button
                      type="button"
                      onClick={() => setForgotOpen(false)}
                      className="h-[44px] rounded-[12px] border border-white/15 px-4 text-[13px] font-bold text-white/65 hover:text-white"
                    >
                      Hủy
                    </button>
                    <button
                      type="submit"
                      className="btn-login h-[44px] rounded-[12px] bg-gradient-to-r from-[#0A2FFF] to-[#1a5aff] px-5 text-[13px] font-bold text-white uppercase tracking-wider"
                    >
                      Gửi yêu cầu
                    </button>
                  </div>
                </form>
              ) : (
                <div className="space-y-4 text-center py-2">
                  <div className="w-12 h-12 rounded-full bg-emerald-500/20 border border-emerald-500/40 text-emerald-400 grid place-items-center mx-auto text-xl font-bold">
                    ✓
                  </div>
                  <h4 className="text-[17px] font-bold text-white">Yêu cầu đã được ghi nhận</h4>
                  <p className="text-[13.5px] text-white/70 leading-relaxed">
                    Vui lòng liên hệ với Ban tổ chức qua email <strong className="text-[#79BCC2]">iec@huit.edu.vn</strong> kèm email <strong className="text-white">{forgotEmail}</strong> để được cấp lại mật khẩu ngay lập tức.
                  </p>
                  <div className="pt-3 flex flex-col gap-2">
                    <a
                      href={`mailto:iec@huit.edu.vn?subject=Khôi phục mật khẩu tài khoản ${forgotEmail}&body=Kính gửi BTC, tôi cần khôi phục mật khẩu cho tài khoản email: ${forgotEmail}`}
                      className="btn-login h-[44px] rounded-[12px] bg-gradient-to-r from-[#0A2FFF] to-[#1a5aff] px-5 text-[13px] font-bold text-white flex items-center justify-center gap-2"
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2"><rect x="2" y="4" width="20" height="16" rx="2"/><path d="m22 7-10 7L2 7"/></svg>
                      Gửi email trực tiếp cho BTC
                    </a>
                    <button
                      type="button"
                      onClick={() => setForgotOpen(false)}
                      className="h-[40px] text-[13px] text-white/50 hover:text-white underline"
                    >
                      Quay lại đăng nhập
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}
      </main>
    </>
  );
}

