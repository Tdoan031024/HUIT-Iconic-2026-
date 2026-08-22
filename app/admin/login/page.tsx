'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { useAlert } from '../AlertProvider';

export default function AdminLoginPage() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const { showAlert } = useAlert();
  const router = useRouter();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    // Xác thực tài khoản admin mặc định
    try {
      const response = await fetch('/api/admin/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify({ username, password, rememberMe }),
      });

      const data = await response.json().catch(() => null);

      if (response.ok && data?.ok) {
        showAlert('Đăng nhập thành công!', 'success');

        // Cookie phiên được set bởi API (httpOnly). Chuyển về dashboard ngay.
        window.location.href = '/admin';
      } else {
        const message = data?.message || 'Tên đăng nhập hoặc mật khẩu không chính xác.';
        showAlert(message, 'error');
        setIsLoading(false);
      }
    } catch (error) {
      console.error('Login error:', error);
      showAlert('Không thể kết nối máy chủ xác thực.', 'error');
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen w-full bg-[#f0f4f8] text-[#0f172a] selection:bg-blue-100 selection:text-blue-700 font-sans">
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -left-[10%] -top-[10%] h-[60%] w-[60%] rounded-full bg-gradient-to-br from-blue-200/40 to-transparent blur-[140px]" />
        <div className="absolute -right-[10%] -bottom-[10%] h-[60%] w-[60%] rounded-full bg-gradient-to-tr from-indigo-200/40 to-transparent blur-[140px]" />
        <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')] opacity-[0.02] mix-blend-overlay" />
      </div>

      <div className="relative z-10 flex min-h-screen items-center justify-center p-4 sm:p-8">
        <main className="w-full max-w-[1060px] lg:min-h-[600px] xl:min-h-[700px] lg:h-auto overflow-hidden rounded-[40px] bg-white/80 backdrop-blur-2xl shadow-[0_40px_100px_-20px_rgba(0,0,0,0.12)] flex flex-col lg:flex-row border border-white/50">
          
          <section className="relative hidden w-full lg:flex lg:w-[46%] flex-col overflow-hidden px-8 py-10 xl:p-12 text-white">
            <div className="absolute inset-0 bg-[#0062CC]" />
            <div className="absolute inset-0 bg-gradient-to-br from-blue-600 via-blue-700 to-indigo-900 opacity-90" />
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_30%,_rgba(255,255,255,0.15)_0%,_transparent_50%)]" />
            <div className="absolute -right-16 -top-16 h-80 w-80 rounded-full bg-blue-400/20 blur-[80px] animate-pulse" />

            <div className="relative z-10 flex h-full flex-col">
              <div className="inline-flex items-center gap-3.5 rounded-2xl bg-white/10 p-2.5 backdrop-blur-xl border border-white/15 shadow-xl max-w-fit">
                <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-xl bg-white p-1 shadow-lg">
                  <img src="/images/logo_iconic.png" alt="HUIT's ICONIC Logo" className="h-full w-full object-contain" />
                </div>
                <div className="flex flex-col pr-2">
                  <h3 className="text-sm font-black tracking-tight text-white uppercase leading-tight">HUIT's ICONIC 2026</h3>
                  <span className="text-[11px] font-bold text-blue-200 uppercase tracking-wider mt-0.5">Cổng Quản Trị Hệ Thống</span>
                </div>
              </div>

              <div className="mt-8 xl:mt-14">
                <h1 className="text-3xl font-black leading-tight tracking-tight mb-6">
                  Quản trị <br />
                  <span className="text-blue-200">bình chọn chuyên nghiệp</span>
                </h1>
                <p className="text-[15px] font-medium leading-relaxed text-blue-50/70 max-w-[320px]">
                  Giải pháp quản lý và theo dõi kết quả bình chọn theo thời gian thực với độ chính xác tuyệt đối.
                </p>
              </div>

              <div className="mt-8 xl:mt-12 grid grid-cols-2 gap-3">
                {[
                  { icon: <CandidateIcon />, label: 'Quản lý thí sinh' },
                  { icon: <VoteIcon />, label: 'Bình chọn realtime' },
                  { icon: <DataIcon />, label: 'Kiểm soát dữ liệu' },
                  { icon: <ReportIcon />, label: 'Báo cáo thống kê' },
                ].map((item, i) => (
                  <div key={i} className="flex items-center gap-3 rounded-[18px] bg-white/5 p-3.5 backdrop-blur-xl border border-white/10 transition-all animate-float">
                    <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-blue-500/20 text-blue-100">{item.icon}</div>
                    <span className="text-[11px] font-bold tracking-wide">{item.label}</span>
                  </div>
                ))}
              </div>

              <div className="mt-auto pt-6 xl:pt-12">
                <div className="inline-flex items-center gap-3 rounded-2xl bg-black/10 px-5 py-3 text-[11px] font-bold backdrop-blur-md border border-white/5">
                  <span className="relative flex h-2.5 w-2.5">
                    <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-75"></span>
                    <span className="relative inline-flex h-2.5 w-2.5 rounded-full bg-emerald-500 shadow-[0_0_10px_rgba(16,185,129,0.5)]"></span>
                  </span>
                  Trạng thái: Máy chủ đang hoạt động
                </div>
              </div>
            </div>
          </section>

          <section className="flex w-full flex-col px-8 py-8 sm:px-14 sm:py-10 xl:py-14 lg:w-[52%] bg-white">
            <div className="flex items-start justify-between mb-8 xl:mb-12">
              <div>
                <h2 className="text-3xl font-black tracking-tighter text-slate-900">Đăng nhập</h2>
                <p className="mt-2 text-base font-medium text-slate-500">Truy cập vào hệ thống quản trị của bạn.</p>
              </div>
              <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-blue-50 text-blue-600 border border-blue-100">
                <ShieldIcon />
              </div>
            </div>

            <form className="space-y-5 xl:space-y-6" onSubmit={handleLogin}>
              <div className="space-y-2.5">
                <label className="text-[11px] font-bold uppercase tracking-[0.2em] text-slate-400 ml-1">Tài khoản quản trị</label>
                <div className="relative group">
                  <div className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-blue-600 transition-colors duration-300">
                    <UserIcon />
                  </div>
                  <input
                    type="text"
                    required
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    placeholder="Tên đăng nhập"
                    className="w-full h-[54px] pl-12 pr-4 rounded-[18px] border border-slate-200 bg-slate-50/50 text-sm font-semibold text-slate-900 outline-none transition-all duration-300 focus:bg-white focus:border-blue-600 focus:ring-[6px] focus:ring-blue-600/5 placeholder:text-slate-400"
                  />
                </div>
              </div>

              <div className="space-y-2.5">
                <label className="text-[11px] font-bold uppercase tracking-[0.2em] text-slate-400 ml-1">Mật khẩu bảo mật</label>
                <div className="relative group">
                  <div className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-blue-600 transition-colors duration-300">
                    <LockIcon />
                  </div>
                  <input
                    type={showPassword ? 'text' : 'password'}
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    className="w-full h-[54px] pl-12 pr-12 rounded-[18px] border border-slate-200 bg-slate-50/50 text-sm font-semibold text-slate-900 outline-none transition-all duration-300 focus:bg-white focus:border-blue-600 focus:ring-[6px] focus:ring-blue-600/5 placeholder:text-slate-400"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition-colors focus:outline-none"
                  >
                    {showPassword ? (
                      <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path><circle cx="12" cy="12" r="3"></circle></svg>
                    ) : (
                      <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"></path><line x1="1" y1="1" x2="23" y2="23"></line></svg>
                    )}
                  </button>
                </div>
              </div>

              <div className="flex items-center justify-between py-1">
                <label className="flex items-center gap-3 cursor-pointer group">
                  <div className="relative flex items-center justify-center">
                    <input 
                      type="checkbox" 
                      checked={rememberMe}
                      onChange={(e) => setRememberMe(e.target.checked)}
                      className="peer h-5 w-5 appearance-none rounded-lg border-2 border-slate-200 bg-white transition-all duration-300 checked:border-blue-600 checked:bg-blue-600 hover:border-blue-300" 
                    />
                    <CheckIcon className="absolute h-3 w-3 text-white opacity-0 transition-opacity duration-300 peer-checked:opacity-100" />
                  </div>
                  <span className="text-[13px] font-semibold text-slate-600 group-hover:text-slate-900 transition-colors">Duy trì đăng nhập</span>
                </label>
                <Link href="#" className="text-[13px] font-bold text-blue-600 hover:text-blue-700 hover:underline decoration-2 underline-offset-4 transition-all">
                  Quên mật khẩu?
                </Link>
              </div>

              <button
                type="submit"
                disabled={isLoading}
                className={`relative group w-full h-[54px] overflow-hidden rounded-[18px] bg-[#0062CC] font-bold text-white shadow-[0_20px_40px_-10px_rgba(0,98,204,0.3)] transition-all duration-300 hover:scale-[1.01] hover:bg-[#0051A8] active:scale-[0.98] ${isLoading ? 'opacity-70 cursor-not-allowed' : ''}`}
              >
                <span className="relative z-10 flex items-center justify-center gap-3">
                  {isLoading ? 'Đang xác thực...' : 'Truy cập Dashboard'}
                  {!isLoading && <ArrowRightIcon className="transition-transform duration-300 group-hover:translate-x-1" />}
                </span>
                <div className="absolute inset-0 bg-gradient-to-r from-white/0 via-white/20 to-white/0 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-1000" />
              </button>
            </form>

            <div className="mt-auto pt-6 xl:pt-10 flex flex-col gap-5">
              <div className="h-px w-full bg-slate-100" />
              <div className="flex flex-col items-center sm:items-start gap-2.5">
                <p className="text-[11px] font-bold text-slate-600">Nếu gặp sự cố đăng nhập, vui lòng liên hệ bộ phận kỹ thuật</p>
                <p className="text-[9px] font-extrabold text-slate-400 uppercase tracking-[0.2em]">© 2026 POWERED BY HUIT MEDIA</p>
              </div>
            </div>
          </section>
        </main>
      </div>
    </div>
  );
}

// Inline SVG Icons
function CandidateIcon() { return <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M22 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>; }
function VoteIcon() { return <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="m9 12 2 2 4-4"/><rect width="18" height="18" x="3" y="4" rx="2"/><path d="M3 10h18"/></svg>; }
function DataIcon() { return <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><ellipse cx="12" cy="5" rx="9" ry="3"/><path d="M3 5V19A9 3 0 0 0 21 19V5"/><path d="M3 12A9 3 0 0 0 21 12"/></svg>; }
function ReportIcon() { return <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M14.5 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7.5L14.5 2z"/><polyline points="14 2 14 8 20 8"/><line x1="16" x2="8" y1="13" y2="13"/><line x1="16" x2="8" y1="17" y2="17"/><line x1="10" x2="8" y1="9" y2="9"/></svg>; }
function ShieldIcon() { return <svg xmlns="http://www.w3.org/2000/svg" width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>; }
function UserIcon() { return <svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>; }
function LockIcon() { return <svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect width="18" height="11" x="3" y="11" rx="2" ry="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></svg>; }
function ArrowRightIcon({ className }: { className?: string }) { return <svg className={className} xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M5 12h14"/><path d="m12 5 7 7-7 7"/></svg>; }
function CheckIcon({ className }: { className?: string }) { return <svg className={className} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"/></svg>; }
