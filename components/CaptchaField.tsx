'use client';

import React, { useState, useEffect, useCallback, useImperativeHandle, forwardRef } from 'react';

export interface CaptchaFieldRef {
  refresh: () => Promise<void>;
}

interface CaptchaFieldProps {
  value: string;
  onChange: (val: string) => void;
  token: string;
  onTokenChange: (token: string) => void;
  error?: string;
  variant?: 'dark' | 'light';
  disabled?: boolean;
}

export const CaptchaField = forwardRef<CaptchaFieldRef, CaptchaFieldProps>(function CaptchaField(
  { value, onChange, token, onTokenChange, error, variant = 'light', disabled = false },
  ref
) {
  const [svgContent, setSvgContent] = useState<string>('');
  const [loading, setLoading] = useState(false);

  const fetchCaptcha = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/captcha', {
        method: 'GET',
        cache: 'no-store',
      });
      if (res.ok) {
        const data = await res.json();
        if (data.captchaToken && data.svg) {
          onTokenChange(data.captchaToken);
          setSvgContent(data.svg);
          onChange(''); // Reset input khi đổi mã
        }
      }
    } catch (err) {
      console.error('Không thể tải mã CAPTCHA:', err);
    } finally {
      setLoading(false);
    }
  }, [onChange, onTokenChange]);

  useImperativeHandle(ref, () => ({
    refresh: fetchCaptcha,
  }));

  useEffect(() => {
    fetchCaptcha();
  }, [fetchCaptcha]);

  const isDark = variant === 'dark';

  return (
    <div className="space-y-2 w-full">
      {/* Label */}
      {isDark ? (
        <label htmlFor="captcha-input" className="text-white/80 text-[14px] font-semibold tracking-wide flex items-center gap-2">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="16"
            height="16"
            viewBox="0 0 24 24"
            fill="none"
            stroke="#79BCC2"
            strokeWidth="2.2"
            strokeLinecap="round"
            strokeLinejoin="round"
            className="drop-shadow-[0_0_8px_rgba(121,188,194,0.4)]"
          >
            <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
          </svg>
          Mã xác thực bảo mật
        </label>
      ) : (
        <label htmlFor="captcha-input-admin" className="text-[11px] font-bold uppercase tracking-[0.2em] text-slate-400 ml-1">
          Mã xác thực (CAPTCHA)
        </label>
      )}

      {/* Row: Input + Captcha Display + Refresh Button */}
      <div className="flex items-center gap-2.5">
        {/* Input field */}
        <div className="relative flex-1 group">
          {!isDark && (
            <div className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-blue-600 transition-colors duration-300 pointer-events-none">
              <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
                <path d="m9 12 2 2 4-4" />
              </svg>
            </div>
          )}
          <input
            id={isDark ? 'captcha-input' : 'captcha-input-admin'}
            type="text"
            required
            disabled={disabled}
            maxLength={6}
            value={value}
            onChange={(e) => onChange(e.target.value.toUpperCase().replace(/[^A-Z0-9]/g, ''))}
            placeholder="Nhập mã xác thực"
            autoComplete="off"
            spellCheck={false}
            className={
              isDark
                ? `login-input w-full h-[48px] px-4 rounded-[14px] text-[15px] font-mono uppercase tracking-widest ${
                    error ? 'has-error' : ''
                  }`
                : `w-full h-[54px] pl-12 pr-4 rounded-[18px] border border-slate-200 bg-slate-50/50 text-sm font-mono font-bold uppercase tracking-widest text-slate-900 outline-none transition-all duration-300 focus:bg-white focus:border-blue-600 focus:ring-[6px] focus:ring-blue-600/5 placeholder:font-sans placeholder:tracking-normal placeholder:font-medium placeholder:text-slate-400 ${
                    error ? 'border-rose-400 focus:border-rose-500 focus:ring-rose-500/10' : ''
                  }`
            }
          />
        </div>

        {/* Captcha Image / SVG Container */}
        <div
          onClick={() => !loading && fetchCaptcha()}
          title="Bấm để đổi mã khác"
          className={
            isDark
              ? 'relative shrink-0 h-[48px] w-[130px] rounded-[14px] overflow-hidden cursor-pointer border border-white/20 bg-slate-950 flex items-center justify-center select-none shadow-md hover:border-cyan-400/60 transition-colors'
              : 'relative shrink-0 h-[54px] w-[130px] rounded-[18px] overflow-hidden cursor-pointer border border-slate-300/80 bg-slate-950 flex items-center justify-center select-none shadow-sm hover:border-blue-500 transition-colors'
          }
        >
          {loading ? (
            <div className="flex items-center justify-center gap-1.5 text-xs text-cyan-400 font-semibold">
              <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
              </svg>
            </div>
          ) : svgContent ? (
            <div
              className="w-full h-full flex items-center justify-center pointer-events-none"
              dangerouslySetInnerHTML={{ __html: svgContent }}
            />
          ) : (
            <span className="text-[11px] text-slate-400">Tải lại mã</span>
          )}
        </div>

        {/* Reload button */}
        <button
          type="button"
          onClick={fetchCaptcha}
          disabled={loading || disabled}
          title="Đổi mã xác thực khác"
          className={
            isDark
              ? 'h-[48px] w-[48px] shrink-0 rounded-[14px] border border-white/15 bg-white/10 text-white/80 hover:text-white hover:bg-white/20 hover:border-cyan-400/40 flex items-center justify-center transition-all active:scale-95 disabled:opacity-50'
              : 'h-[54px] w-[54px] shrink-0 rounded-[18px] border border-slate-200 bg-slate-50 text-slate-600 hover:text-blue-600 hover:bg-blue-50 hover:border-blue-200 flex items-center justify-center transition-all active:scale-95 disabled:opacity-50'
          }
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="18"
            height="18"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2.5"
            strokeLinecap="round"
            strokeLinejoin="round"
            className={loading ? 'animate-spin' : 'transition-transform duration-300 hover:rotate-180'}
          >
            <path d="M21.5 2v6h-6M21.34 15.57a10 10 0 1 1-.57-8.38l5.67-5.67" />
          </svg>
        </button>
      </div>

      {/* Error message */}
      {error && (
        <p
          className={
            isDark
              ? 'text-[12.5px] font-semibold text-rose-400 flex items-center gap-1.5 mt-1'
              : 'text-[12px] font-semibold text-rose-600 flex items-center gap-1.5 mt-1'
          }
        >
          <svg className="w-3.5 h-3.5 flex-shrink-0 text-rose-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <circle cx="12" cy="12" r="10" strokeWidth="2" />
            <line x1="12" y1="8" x2="12" y2="12" strokeWidth="2" />
            <line x1="12" y1="16" x2="12.01" y2="16" strokeWidth="2" />
          </svg>
          {error}
        </p>
      )}
    </div>
  );
});
