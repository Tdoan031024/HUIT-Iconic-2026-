'use client';

import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';

type AlertType = 'success' | 'error' | 'info' | 'warning';

interface Toast {
  id: string;
  message: string;
  type: AlertType;
  title: string;
}

interface ConfirmConfig {
  message: string;
  title: string;
  type: AlertType;
  confirmText?: string;
  cancelText?: string;
  resolve: (val: boolean) => void;
}

interface PromptConfig {
  message: string;
  title: string;
  defaultValue?: string;
  placeholder?: string;
  resolve: (val: string | null) => void;
}

interface AlertContextType {
  showAlert: (message: string, type?: AlertType, title?: string) => Promise<boolean>;
  showConfirm: (message: string, title?: string, type?: AlertType, confirmText?: string, cancelText?: string) => Promise<boolean>;
  showPrompt: (message: string, defaultValue?: string, title?: string, placeholder?: string) => Promise<string | null>;
}

const AlertContext = createContext<AlertContextType | undefined>(undefined);

export function AlertProvider({ children }: { children: React.ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([]);
  const [confirmConfig, setConfirmConfig] = useState<ConfirmConfig | null>(null);
  const [promptConfig, setPromptConfig] = useState<PromptConfig | null>(null);
  const [promptInput, setPromptInput] = useState('');

  const showConfirm = useCallback((
    message: string,
    title = 'Xác nhận thao tác',
    type: AlertType = 'warning',
    confirmText = 'Xác nhận',
    cancelText = 'Hủy bỏ'
  ): Promise<boolean> => {
    return new Promise<boolean>((resolve) => {
      setConfirmConfig({ message, title, type, confirmText, cancelText, resolve });
    });
  }, []);

  const showPrompt = useCallback((
    message: string,
    defaultValue = '',
    title = 'Nhập thông tin',
    placeholder = 'Nhập nội dung tại đây...'
  ): Promise<string | null> => {
    setPromptInput(defaultValue);
    return new Promise<string | null>((resolve) => {
      setPromptConfig({ message, title, defaultValue, placeholder, resolve });
    });
  }, []);

  const showAlert = useCallback((message: string, type: AlertType = 'info', title?: string): Promise<boolean> => {
    const id = Date.now().toString() + Math.random().toString(36).substring(2, 9);
    const defaultTitle = type === 'success' ? 'Thành công' :
                         type === 'error' ? 'Có lỗi xảy ra' :
                         type === 'warning' ? 'Cảnh báo' : 'Thông báo';
    
    setToasts((prev) => [...prev, { id, message, type, title: title || defaultTitle }]);
    
    // Auto remove after 4.5 seconds
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 4500);
    
    return new Promise<boolean>((resolve) => {
      setTimeout(() => resolve(true), 1200);
    });
  }, []);

  const removeToast = (id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  };

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const originalAlert = window.alert;

      window.alert = (message: any) => {
        let type: AlertType = 'info';
        let title = 'Thông báo';
        const msgStr = String(message).toLowerCase();

        if (msgStr.includes('thành công') || msgStr.includes('success')) {
          type = 'success';
          title = 'Thành công';
        } else if (msgStr.includes('thất bại') || msgStr.includes('lỗi') || msgStr.includes('failed') || msgStr.includes('error')) {
          type = 'error';
          title = 'Có lỗi xảy ra';
        } else if (msgStr.includes('cảnh báo') || msgStr.includes('warning') || msgStr.includes('chú ý') || msgStr.includes('nguy hiểm')) {
          type = 'warning';
          title = 'Cảnh báo';
        }

        showAlert(String(message), type, title);
      };

      return () => {
        window.alert = originalAlert;
      };
    }
  }, [showAlert]);

  return (
    <AlertContext.Provider value={{ showAlert, showConfirm, showPrompt }}>
      {children}
      
      {/* Toast List Container */}
      <div className="fixed left-4 right-4 top-[calc(16px+env(safe-area-inset-top))] z-[9999] ml-auto flex w-auto max-w-[400px] flex-col gap-3 pointer-events-none sm:left-auto sm:right-6 sm:top-6 sm:w-full" aria-live="polite" aria-relevant="additions">
        <style dangerouslySetInnerHTML={{ __html: `
          @keyframes shrinkWidth {
            from { width: 100%; }
            to { width: 0%; }
          }
          @keyframes toastSlideIn {
            from { transform: translateX(120%); opacity: 0; }
            to { transform: translateX(0); opacity: 1; }
          }
          .toast-item {
            animation: toastSlideIn 0.35s cubic-bezier(0.16, 1, 0.3, 1) forwards;
          }
        `}} />
        
        {toasts.map((toast) => (
          <div 
            key={toast.id}
            role={toast.type === 'error' || toast.type === 'warning' ? 'alert' : 'status'}
            className="toast-item pointer-events-auto relative overflow-hidden flex items-start gap-3.5 rounded-2xl border border-slate-700/60 bg-[#0c101d]/95 backdrop-blur-xl p-4 shadow-[0_12px_40px_rgba(0,0,0,0.45)] transition-all duration-300 w-full"
          >
            {/* Ambient glow */}
            <div className="absolute inset-0 rounded-2xl bg-gradient-to-br from-[#0A2FFF]/10 to-[#79BCC2]/10 opacity-40 pointer-events-none" />
            
            {/* Icon */}
            <div className="flex-shrink-0 flex h-10 w-10 items-center justify-center rounded-xl border border-white/10 bg-white/[0.04]">
              {toast.type === 'success' && (
                <svg className="h-5 w-5 text-emerald-400" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="m4.5 12.75 6 6 9-13.5" />
                </svg>
              )}
              {toast.type === 'error' && (
                <svg className="h-5 w-5 text-rose-500" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m9-.75a9 9 0 1 1-18 0 9 9 0 0 1 18 0Zm-9 3.75h.008v.008H12v-.008Z" />
                </svg>
              )}
              {toast.type === 'warning' && (
                <svg className="h-5 w-5 text-amber-400" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126ZM12 15.75h.008v.008H12v-.008Z" />
                </svg>
              )}
              {toast.type === 'info' && (
                <svg className="h-5 w-5 text-cyan-400" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="m11.25 11.25.041-.02a.75.75 0 1 1 1.083.985l-.5 1.5a.75.75 0 0 0 .902.952l.05-.01a.75.75 0 1 0-.215-1.482l.092-.276a1.5 1.5 0 0 0-2.183-1.78l-.04.02a.75.75 0 1 0 .74 1.307Z" />
                  <circle cx="12" cy="7.5" r="1.5" fill="currentColor" />
                </svg>
              )}
            </div>

            {/* Text details */}
            <div className="flex-1 min-w-0 pr-2">
              <h4 className="text-[14px] font-bold text-white tracking-wide">{toast.title}</h4>
              <p className="text-[13px] text-slate-300 mt-1 leading-relaxed font-medium whitespace-pre-line">{toast.message}</p>
            </div>

            {/* Close button */}
            <button
              onClick={() => removeToast(toast.id)}
              className="-mr-1.5 -mt-1.5 grid h-9 w-9 flex-shrink-0 place-items-center rounded-lg text-slate-400 hover:bg-white/10 hover:text-white transition-colors"
              aria-label={`Đóng thông báo: ${toast.title}`}
            >
              <svg className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>

            {/* Animated Bottom Timer Bar */}
            <div 
              className="absolute bottom-0 left-0 h-[2.5px] bg-gradient-to-r from-[#0A2FFF] via-[#38bdf8] to-[#79BCC2]" 
              style={{ animation: 'shrinkWidth 4.5s linear forwards' }} 
            />
          </div>
        ))}
      </div>

      {/* Modern Confirm Modal */}
      {confirmConfig && (
        <div className="fixed inset-0 z-[10000] flex items-center justify-center bg-slate-950/75 p-4 backdrop-blur-md transition-all duration-300">
          <style dangerouslySetInnerHTML={{ __html: `
            @keyframes scaleUpConfirmWeb {
              from { transform: scale(0.93) translateY(8px); opacity: 0; }
              to { transform: scale(1) translateY(0); opacity: 1; }
            }
            .confirm-modal-web {
              animation: scaleUpConfirmWeb 0.22s cubic-bezier(0.16, 1, 0.3, 1) forwards;
            }
          `}} />
          <div className="confirm-modal-web w-full max-w-md rounded-3xl border border-white/15 bg-[#0f172a]/95 backdrop-blur-2xl p-6 shadow-[0_25px_60px_-15px_rgba(0,0,0,0.7)] relative overflow-hidden text-white">
            <div className="absolute inset-0 bg-gradient-to-br from-[#0A2FFF]/10 to-[#79BCC2]/10 opacity-30 pointer-events-none" />
            <div className="flex items-start gap-4 relative z-10">
              <div className={`flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-2xl border ${
                confirmConfig.type === 'error' ? 'border-rose-500/30 bg-rose-500/15 text-rose-400' :
                confirmConfig.type === 'success' ? 'border-emerald-500/30 bg-emerald-500/15 text-emerald-400' :
                confirmConfig.type === 'warning' ? 'border-amber-500/30 bg-amber-500/15 text-amber-400' :
                'border-cyan-500/30 bg-cyan-500/15 text-cyan-400'
              }`}>
                {confirmConfig.type === 'success' && (
                  <svg className="h-6 w-6" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" d="m4.5 12.75 6 6 9-13.5" />
                  </svg>
                )}
                {confirmConfig.type === 'error' && (
                  <svg className="h-6 w-6" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m9-.75a9 9 0 1 1-18 0 9 9 0 0 1 18 0Zm-9 3.75h.008v.008H12v-.008Z" />
                  </svg>
                )}
                {(confirmConfig.type === 'warning' || confirmConfig.type === 'info') && (
                  <svg className="h-6 w-6" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126ZM12 15.75h.008v.008H12v-.008Z" />
                  </svg>
                )}
              </div>
              <div className="flex-1">
                <h3 className="text-lg font-black text-white tracking-tight">{confirmConfig.title}</h3>
                <p className="mt-2 text-sm leading-relaxed text-slate-300 font-medium whitespace-pre-line">{confirmConfig.message}</p>
              </div>
            </div>
            <div className="mt-6 flex justify-end gap-3 relative z-10">
              <button
                type="button"
                onClick={() => {
                  confirmConfig.resolve(false);
                  setConfirmConfig(null);
                }}
                className="rounded-xl border border-slate-700 bg-slate-800/80 hover:bg-slate-700 px-5 py-2.5 text-xs font-bold text-slate-300 transition active:scale-[0.98]"
              >
                {confirmConfig.cancelText || 'Hủy bỏ'}
              </button>
              <button
                type="button"
                onClick={() => {
                  confirmConfig.resolve(true);
                  setConfirmConfig(null);
                }}
                className={`rounded-xl px-5 py-2.5 text-xs font-bold text-white shadow-lg transition active:scale-[0.98] ${
                  confirmConfig.type === 'error' ? 'bg-rose-600 hover:bg-rose-500 shadow-rose-600/30' :
                  confirmConfig.type === 'success' ? 'bg-emerald-600 hover:bg-emerald-500 shadow-emerald-600/30' :
                  confirmConfig.type === 'warning' ? 'bg-gradient-to-r from-amber-600 to-orange-600 hover:brightness-110 shadow-orange-600/30' :
                  'bg-gradient-to-r from-blue-600 to-indigo-600 hover:brightness-110 shadow-blue-600/30'
                }`}
              >
                {confirmConfig.confirmText || 'Xác nhận'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modern Prompt Modal */}
      {promptConfig && (
        <div className="fixed inset-0 z-[10000] flex items-center justify-center bg-slate-950/75 p-4 backdrop-blur-md transition-all duration-300">
          <div className="confirm-modal-web w-full max-w-md rounded-3xl border border-white/15 bg-[#0f172a]/95 backdrop-blur-2xl p-6 shadow-[0_25px_60px_-15px_rgba(0,0,0,0.7)] relative overflow-hidden text-white">
            <div className="flex items-start gap-4 relative z-10">
              <div className="flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-2xl border border-blue-500/30 bg-blue-500/15 text-blue-400">
                <svg className="h-6 w-6" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="m16.862 4.487 1.687-1.688a1.875 1.875 0 1 1 2.652 2.652L10.582 16.07a4.5 4.5 0 0 1-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 0 1 1.13-1.897l8.932-8.931Zm0 0L19.5 7.125M18 14v4.75A2.25 2.25 0 0 1 15.75 21H5.25A2.25 2.25 0 0 1 3 18.75V8.25A2.25 2.25 0 0 1 5.25 6H10" />
                </svg>
              </div>
              <div className="flex-1">
                <h3 className="text-lg font-black text-white tracking-tight">{promptConfig.title}</h3>
                <p className="mt-1 text-sm text-slate-300 font-medium">{promptConfig.message}</p>
              </div>
            </div>

            <form
              onSubmit={(e) => {
                e.preventDefault();
                promptConfig.resolve(promptInput);
                setPromptConfig(null);
              }}
              className="mt-4 relative z-10"
            >
              <input
                type="text"
                autoFocus
                value={promptInput}
                onChange={(e) => setPromptInput(e.target.value)}
                placeholder={promptConfig.placeholder}
                className="w-full px-4 py-3 rounded-xl border border-slate-700 bg-slate-900/90 text-sm font-semibold text-white placeholder-slate-500 focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20"
              />

              <div className="mt-5 flex justify-end gap-3">
                <button
                  type="button"
                  onClick={() => {
                    promptConfig.resolve(null);
                    setPromptConfig(null);
                  }}
                  className="rounded-xl border border-slate-700 bg-slate-800/80 hover:bg-slate-700 px-5 py-2.5 text-xs font-bold text-slate-300 transition active:scale-[0.98]"
                >
                  Hủy bỏ
                </button>
                <button
                  type="submit"
                  className="rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:brightness-110 px-5 py-2.5 text-xs font-bold text-white shadow-lg shadow-blue-600/30 transition active:scale-[0.98]"
                >
                  Xác nhận
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </AlertContext.Provider>
  );
}

export function useAlert() {
  const context = useContext(AlertContext);
  if (!context) {
    throw new Error('useAlert must be used within an AlertProvider');
  }
  return context;
}

export default AlertProvider;
