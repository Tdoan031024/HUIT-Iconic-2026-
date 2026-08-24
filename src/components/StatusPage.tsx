'use client';

import Link from 'next/link';
import { useMemo } from 'react';

type Action = {
  label: string;
  href?: string;
  onClick?: () => void;
  variant?: 'primary' | 'secondary' | 'ghost';
};

export type StatusPageProps = {
  code: 401 | 403 | 404 | 429 | 500 | 503;
  title: string;
  description: string;
  hint?: string;
  actions: Action[];
};

function StatusIcon({ code }: { code: StatusPageProps['code'] }) {
  const common = {
    fill: 'none',
    stroke: 'currentColor',
    strokeWidth: 2.1,
    strokeLinecap: 'round' as const,
    strokeLinejoin: 'round' as const,
  };

  switch (code) {
    case 401:
      return (
        <svg viewBox="0 0 24 24" aria-hidden="true" className="h-8 w-8" {...common}>
          <path d="M12 2 4 5v6c0 5 3.4 9.4 8 10 4.6-.6 8-5 8-10V5l-8-3Z" />
          <path d="M9 12h6" />
          <path d="M12 9v6" />
        </svg>
      );
    case 403:
      return (
        <svg viewBox="0 0 24 24" aria-hidden="true" className="h-8 w-8" {...common}>
          <circle cx="12" cy="12" r="9" />
          <path d="M8 8l8 8" />
          <path d="M16 8l-8 8" />
        </svg>
      );
    case 404:
      return (
        <svg viewBox="0 0 24 24" aria-hidden="true" className="h-8 w-8" {...common}>
          <path d="M3 10.5 12 3l9 7.5" />
          <path d="M5 9.5V20h14V9.5" />
          <path d="M9 20v-5h6v5" />
        </svg>
      );
    case 429:
      return (
        <svg viewBox="0 0 24 24" aria-hidden="true" className="h-8 w-8" {...common}>
          <circle cx="12" cy="12" r="9" />
          <path d="M12 7v5l3 2" />
        </svg>
      );
    case 503:
      return (
        <svg viewBox="0 0 24 24" aria-hidden="true" className="h-8 w-8" {...common}>
          <path d="M6 19h12" />
          <path d="M7 16V8a5 5 0 0 1 10 0v8" />
          <path d="M10 11h4" />
        </svg>
      );
    default:
      return (
        <svg viewBox="0 0 24 24" aria-hidden="true" className="h-8 w-8" {...common}>
          <path d="M12 9v4" />
          <path d="M12 17h.01" />
          <path d="M10.3 3.9 1.8 18a2 2 0 0 0 1.7 3h17a2 2 0 0 0 1.7-3L13.7 3.9a2 2 0 0 0-3.4 0Z" />
        </svg>
      );
  }
}

export default function StatusPage({ code, title, description, hint, actions }: StatusPageProps) {
  const badgeTone = useMemo(() => {
    if (code === 401 || code === 403) return 'text-amber-600 bg-amber-500/10 border-amber-500/20';
    if (code === 429) return 'text-orange-600 bg-orange-500/10 border-orange-500/20';
    if (code === 503) return 'text-cyan-700 bg-cyan-500/10 border-cyan-500/20';
    if (code === 500) return 'text-rose-600 bg-rose-500/10 border-rose-500/20';
    return 'text-blue-600 bg-blue-500/10 border-blue-500/20';
  }, [code]);

  return (
    <div className="status-shell min-h-screen overflow-hidden bg-[var(--site-bg)] text-[var(--site-text)]">
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <div className="absolute -left-24 top-[-6%] h-[360px] w-[360px] rounded-full bg-[radial-gradient(circle,_rgba(37,99,235,0.18),_transparent_68%)] blur-[36px]" />
        <div className="absolute right-[-8%] top-[20%] h-[420px] w-[420px] rounded-full bg-[radial-gradient(circle,_rgba(54,212,198,0.16),_transparent_70%)] blur-[42px]" />
        <div className="absolute bottom-[-10%] left-[18%] h-[320px] w-[320px] rounded-full bg-[radial-gradient(circle,_rgba(245,158,11,0.10),_transparent_68%)] blur-[34px]" />
      </div>

      <main className="relative mx-auto flex min-h-screen w-full max-w-[1180px] items-center px-5 py-10 sm:px-8">
        <section className="grid w-full gap-8 lg:grid-cols-[1.05fr_0.95fr] lg:items-center">
          <div className="order-2 lg:order-1">
            <div className={`inline-flex items-center gap-2 rounded-full border px-4 py-2 text-[12px] font-black uppercase tracking-[0.22em] ${badgeTone}`}>
              <span>Mã lỗi</span>
              <span>{code}</span>
            </div>
            <h1 className="mt-5 max-w-[720px] text-[40px] font-black leading-[0.96] tracking-[-0.04em] sm:text-[58px]">
              {title}
            </h1>
            <p className="mt-5 max-w-[680px] text-[15px] leading-7 text-[var(--site-muted)] sm:text-[17px]">
              {description}
            </p>
            {hint ? (
              <p className="mt-4 max-w-[620px] rounded-2xl border border-[var(--site-line)] bg-[color:color-mix(in_srgb,var(--site-card)_84%,transparent)] px-4 py-3 text-[13px] leading-6 text-[var(--site-muted)] sm:text-[14px]">
                {hint}
              </p>
            ) : null}

            <div className="mt-7 flex flex-wrap gap-3">
              {actions.map((action) => {
                const className =
                  action.variant === 'secondary'
                    ? 'border border-[var(--site-line)] bg-[var(--site-card)] text-[var(--site-text)] hover:border-[var(--site-primary)] hover:text-[var(--site-primary)]'
                    : action.variant === 'ghost'
                      ? 'border border-transparent bg-transparent text-[var(--site-muted)] hover:text-[var(--site-text)]'
                      : 'border border-[var(--site-primary)] bg-[linear-gradient(135deg,var(--site-primary),var(--site-accent))] text-white shadow-[0_16px_30px_rgba(37,99,235,0.25)] hover:translate-y-[-1px]';

                if (action.href) {
                  return (
                    <Link
                      key={`${code}-${action.label}`}
                      href={action.href}
                      className={`inline-flex min-h-[48px] items-center justify-center rounded-[16px] px-5 text-[14px] font-extrabold transition-all duration-200 ${className}`}
                    >
                      {action.label}
                    </Link>
                  );
                }

                return (
                  <button
                    key={`${code}-${action.label}`}
                    type="button"
                    onClick={action.onClick}
                    className={`inline-flex min-h-[48px] items-center justify-center rounded-[16px] px-5 text-[14px] font-extrabold transition-all duration-200 ${className}`}
                  >
                    {action.label}
                  </button>
                );
              })}
            </div>
          </div>

          <div className="order-1 lg:order-2">
            <div className="relative mx-auto flex aspect-[1/1] w-full max-w-[420px] items-center justify-center rounded-[34px] border border-[var(--site-line)] bg-[color:color-mix(in_srgb,var(--site-card)_88%,transparent)] p-8 shadow-[0_22px_80px_rgba(15,23,42,0.10)] backdrop-blur-xl">
              <div className="absolute inset-4 rounded-[26px] border border-white/50 opacity-60 dark:border-white/10" />
              <div className="absolute inset-0 rounded-[34px] bg-[radial-gradient(circle_at_top,_rgba(255,255,255,0.7),_transparent_48%)] dark:bg-[radial-gradient(circle_at_top,_rgba(255,255,255,0.08),_transparent_40%)]" />
              <div className="relative flex w-full flex-col items-center text-center">
                <div className="grid h-20 w-20 place-items-center rounded-[22px] border border-[var(--site-line)] bg-[var(--site-card)] text-[var(--site-primary)] shadow-[0_12px_28px_rgba(37,99,235,0.12)]">
                  <StatusIcon code={code} />
                </div>
                <div className="mt-6 bg-[linear-gradient(135deg,var(--site-primary),var(--site-accent))] bg-clip-text text-[92px] font-black leading-none tracking-[-0.08em] text-transparent sm:text-[118px]">
                  {code}
                </div>
                <div className="mt-3 max-w-[260px] text-[13px] font-bold uppercase tracking-[0.18em] text-[var(--site-muted)]">
                  Hệ thống đang trả về trạng thái này cho yêu cầu hiện tại
                </div>
              </div>
            </div>
          </div>
        </section>
      </main>
    </div>
  );
}
