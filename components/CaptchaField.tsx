'use client';

import React, { useState, useEffect, useCallback, useImperativeHandle, forwardRef, useRef } from 'react';

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

  // Sử dụng ref để giữ callback mới nhất mà không làm thay đổi hàm fetchCaptcha
  const onChangeRef = useRef(onChange);
  onChangeRef.current = onChange;
  const onTokenChangeRef = useRef(onTokenChange);
  onTokenChangeRef.current = onTokenChange;

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
          onTokenChangeRef.current(data.captchaToken);
          setSvgContent(data.svg);
          onChangeRef.current(''); // Reset ô nhập khi đổi mã
        }
      }
    } catch (err) {
      console.error('Không thể tải mã CAPTCHA:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  useImperativeHandle(ref, () => ({
    refresh: fetchCaptcha,
  }));

  useEffect(() => {
    fetchCaptcha();
  }, [fetchCaptcha]);

  const isDark = variant === 'dark';

  return (
    <div className="flex flex-col space-y-1.5 w-full">
      {/* Header: Label + Nút đổi mã */}
      <div className="flex items-center justify-between">
        {isDark ? (
          <label htmlFor="captcha-code-input" className="text-slate-800 dark:text-white/80 text-[14px] font-semibold tracking-wide flex items-center gap-2">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="16"
              height="16"
              viewBox="0 0 24 24"
              fill="none"
              stroke="#0077b6"
              strokeWidth="2.2"
              strokeLinecap="round"
              strokeLinejoin="round"
              className="drop-shadow-[0_0_8px_rgba(0,119,182,0.4)]"
            >
              <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
            </svg>
            Mã xác thực bảo mật
          </label>
        ) : (
          <label htmlFor="captcha-code-input" className="text-[11px] font-bold uppercase tracking-[0.2em] text-slate-400 ml-1 flex items-center gap-1.5">
            <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
            </svg>
            Mã xác thực (CAPTCHA)
          </label>
        )}

        {/* Nút đổi mã khác */}
        <button
          type="button"
          onClick={fetchCaptcha}
          disabled={loading || disabled}
          className={
            isDark
              ? 'text-[12px] font-medium text-[#0077b6] dark:text-[#79BCC2] hover:underline flex items-center gap-1 transition-opacity disabled:opacity-50'
              : 'text-[11px] font-bold text-blue-600 hover:underline flex items-center gap-1 transition-opacity disabled:opacity-50'
          }
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="13"
            height="13"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2.5"
            strokeLinecap="round"
            strokeLinejoin="round"
            className={loading ? 'animate-spin' : ''}
          >
            <path d="M21.5 2v6h-6M21.34 15.57a10 10 0 1 1-.57-8.38l5.67-5.67" />
          </svg>
          Đổi mã
        </button>
      </div>

      {/* Row: Hình CAPTCHA bên trái + Ô nhập bên phải */}
      <div className="flex items-center gap-2.5 w-full">
        {/* Khung hiển thị ảnh CAPTCHA */}
        <div
          onClick={() => !loading && fetchCaptcha()}
          title="Bấm vào để đổi mã xác thực khác"
          className={
            isDark
              ? 'relative shrink-0 w-[125px] h-[48px] rounded-[14px] overflow-hidden cursor-pointer border border-slate-300 dark:border-white/20 bg-slate-950 flex items-center justify-center select-none shadow-sm hover:border-cyan-500 transition-colors'
              : 'relative shrink-0 w-[125px] h-[54px] rounded-[18px] overflow-hidden cursor-pointer border border-slate-200 bg-slate-950 flex items-center justify-center select-none shadow-sm hover:border-blue-500 transition-colors'
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

        {/* Ô nhập mã xác thực */}
        <div className="relative flex-1 min-w-0">
          <input
            id="captcha-code-input"
            type="text"
            required
            disabled={disabled}
            maxLength={5}
            value={value}
            onChange={(e) => onChange(e.target.value.toUpperCase().replace(/[^A-Z0-9]/g, ''))}
            placeholder="Nhập 5 ký tự"
            autoComplete="off"
            spellCheck={false}
            className={
              isDark
                ? `login-input w-full h-[48px] px-3.5 rounded-[14px] text-[15px] font-mono font-bold tracking-widest uppercase text-slate-900 dark:text-white placeholder:font-sans placeholder:tracking-normal placeholder:font-normal placeholder:text-[13px] ${
                    error ? 'has-error' : ''
                  }`
                : `w-full h-[54px] px-4 rounded-[18px] border border-slate-200 bg-slate-50/50 text-sm font-mono font-bold uppercase tracking-widest text-slate-900 outline-none transition-all duration-300 focus:bg-white focus:border-blue-600 focus:ring-[6px] focus:ring-blue-600/5 placeholder:font-sans placeholder:tracking-normal placeholder:font-medium placeholder:text-slate-400 ${
                    error ? 'border-rose-400 focus:border-rose-500 focus:ring-rose-500/10' : ''
                  }`
            }
          />
        </div>
      </div>

      {/* Thông báo lỗi nếu có */}
      {error && (
        <p className="text-[12px] font-semibold text-rose-600 dark:text-rose-400 flex items-center gap-1.5 mt-1">
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
