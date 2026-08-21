'use client';

import React, { useEffect, useState } from 'react';

export function resolveAdminAssetUrl(src?: string) {
  if (!src) return src;
  if (/^https?:\/\//i.test(src)) return src;
  if (src.startsWith('/uploads/')) return `/admin${src}`;
  return src;
}

// AdminCard component
export function AdminCard({ children, className = '', ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div className={`admin-card ${className}`} {...props}>
      {children}
    </div>
  );
}

// AdminButton component
interface AdminButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'danger' | 'outline';
  icon?: React.ReactNode;
}

export function AdminButton({ children, variant = 'primary', icon, className = '', ...props }: AdminButtonProps) {
  const variantClass = {
    primary: 'admin-btn-primary',
    secondary: 'admin-btn-secondary',
    danger: 'admin-btn-danger',
    outline: 'admin-btn-outline',
  }[variant];

  return (
    <button className={`admin-btn ${variantClass} ${className}`} {...props}>
      {icon && <span className="flex-shrink-0">{icon}</span>}
      {children}
    </button>
  );
}

// AdminInput component
export function AdminInput({ className = '', ...props }: React.InputHTMLAttributes<HTMLInputElement>) {
  return <input className={`admin-input ${className}`} {...props} />;
}

// AdminTextarea component
export function AdminTextarea({ className = '', ...props }: React.TextareaHTMLAttributes<HTMLTextAreaElement>) {
  return <textarea className={`admin-textarea ${className}`} {...props} />;
}

// AdminBadge component
interface AdminBadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
  status: 'online' | 'offline' | 'success' | 'warning' | 'error' | 'default';
  hasDot?: boolean;
}

export function AdminBadge({ children, status, hasDot = true, className = '', ...props }: AdminBadgeProps) {
  const statusStyles = {
    online: 'admin-badge-online',
    offline: 'admin-badge-offline',
    success: 'bg-emerald-50 text-emerald-700 border-emerald-200/60',
    warning: 'bg-amber-50 text-amber-700 border-amber-200/60',
    error: 'bg-rose-50 text-rose-700 border-rose-200/60',
    default: 'bg-slate-50 text-slate-600 border-slate-200/60',
  }[status];

  const dotColors = {
    online: 'bg-emerald-500 animate-pulse',
    offline: 'bg-slate-400',
    success: 'bg-emerald-500',
    warning: 'bg-amber-500',
    error: 'bg-rose-500',
    default: 'bg-slate-400',
  }[status];

  return (
    <span className={`admin-badge border ${statusStyles} ${className}`} {...props}>
      {hasDot && <span className={`admin-badge-dot ${dotColors}`} />}
      {children}
    </span>
  );
}

// ImageFallback component
interface ImageFallbackProps extends React.ImgHTMLAttributes<HTMLImageElement> {
  fallbackText?: string;
  containerClassName?: string;
}

export function ImageFallback({ src, alt, fallbackText = 'Không tìm thấy ảnh', containerClassName = '', className = '', ...props }: ImageFallbackProps) {
  const [error, setError] = useState(!src);
  const resolvedSrc = resolveAdminAssetUrl(src);

  useEffect(() => {
    setError(!resolvedSrc);
  }, [resolvedSrc]);

  if (error) {
    return (
      <div className={`flex flex-col items-center justify-center bg-slate-100 text-slate-400 border border-dashed border-slate-200 p-4 text-center select-none rounded-xl ${containerClassName}`}>
        <svg className="w-8 h-8 opacity-60 mb-2" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" d="m2.25 15.75 5.159-5.159a6.002 6.002 0 0 1 8.482 0l4.304 4.304m-9.621-9.093-2.32 2.32m0 0L8.25 10.5m-2.25-.562 1.332-.892a.75.75 0 0 1 1.01.176l3.076 3.692m.991-2.185 3.5-3.5m0 0 3-3m-3 3 3.5 3.5M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z" />
        </svg>
        <span className="text-[10px] font-bold uppercase tracking-wider">{fallbackText}</span>
      </div>
    );
  }

  return (
    <img
      src={resolvedSrc}
      alt={alt}
      className={className}
      onError={() => setError(true)}
      {...props}
    />
  );
}

// PageHeader component
interface PageHeaderProps {
  category: string;
  title: string;
  description: string;
  action?: React.ReactNode;
}

export function PageHeader({ category, title, description, action }: PageHeaderProps) {
  return (
    <div className="admin-card flex flex-col gap-3 px-5 py-4 md:flex-row md:items-end md:justify-between select-none">
      <div>
        <p className="text-[10px] font-black uppercase tracking-[0.22em] text-[var(--primary-strong)]">{category}</p>
        <h2 className="mt-1.5 text-[24px] font-extrabold tracking-[-0.03em] text-slate-950">{title}</h2>
        <p className="mt-1.5 max-w-2xl text-[13px] font-medium leading-5 text-slate-500">{description}</p>
      </div>
      {action && <div className="flex-shrink-0">{action}</div>}
    </div>
  );
}

// SectionHeader component
export function SectionHeader({ title, subtitle, action }: { title: string; subtitle?: string; action?: React.ReactNode }) {
  return (
    <div className="mb-4 flex items-end justify-between border-b border-slate-100 pb-3 select-none">
      <div>
        <h3 className="text-[14px] font-extrabold tracking-[-0.02em] text-slate-900">{title}</h3>
        {subtitle && <p className="mt-1 text-[12px] font-medium text-slate-500">{subtitle}</p>}
      </div>
      {action && <div>{action}</div>}
    </div>
  );
}
