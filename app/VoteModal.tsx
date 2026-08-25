'use client';

import React, { useEffect, useRef, useState } from 'react';
import { Candidate, WebUser } from '@/lib/types';
import { apiUrl } from './api';
import { fireConfetti } from '@/lib/confetti';

interface VoteModalProps {
  candidate: Candidate;
  onClose: () => void;
  onSuccess?: (updatedCandidate: Candidate, points: number) => void;
  initialPackageId?: string;
}

function getStoredUser(): WebUser | null {
  const rawUser = localStorage.getItem('huit_web_user');
  if (!rawUser) return null;
  try {
    return JSON.parse(rawUser);
  } catch {
    return null;
  }
}

function getContestTableLabel(candidate: Candidate) {
  const label = candidate.contestTableLabel || '';
  if (label) {
    return label.startsWith('Bảng ') ? label : `Bảng ${label}`;
  }
  switch (candidate.contestTable) {
    case 'MALE':
      return 'Bảng Nam (King)';
    case 'FEMALE':
      return 'Bảng Nữ (Queen)';
    case 'HIGH_SCHOOL':
      return 'Bảng học sinh';
    default:
      return 'Bảng sinh viên';
  }
}

export default function VoteModal({ candidate, onClose, onSuccess }: VoteModalProps) {
  const [currentUser, setCurrentUser] = useState<WebUser | null>(null);
  const [freeQuota, setFreeQuota] = useState<{ remaining: number; limit: number }>({ remaining: 0, limit: 2 });
  const [settings, setSettings] = useState<any>(null);
  const [step, setStep] = useState<'confirm' | 'success'>('confirm');
  const [isVoting, setIsVoting] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [turnstileToken, setTurnstileToken] = useState('');
  const turnstileRef = useRef<HTMLDivElement>(null);
  const turnstileSiteKey = process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY || '';

  useEffect(() => {
    const user = getStoredUser();
    setCurrentUser(user);

    async function loadData() {
      try {
        const settingsRes = await fetch(apiUrl('/api/settings'));
        if (settingsRes.ok) {
          setSettings(await settingsRes.json());
        }

        if (user?.id) {
          const quotaRes = await fetch(apiUrl(`/api/voting/free-quota/${user.id}`));
          if (quotaRes.ok) {
            setFreeQuota(await quotaRes.json());
          }
        }
      } catch (err) {
        console.error('Failed to load data for VoteModal', err);
      }
    }

    loadData();
  }, []);

  useEffect(() => {
    if (!turnstileSiteKey || !turnstileRef.current) return;
    const renderWidget = () => {
      if (!(window as any).turnstile || !turnstileRef.current) return;
      (window as any).turnstile.render(turnstileRef.current, {
        sitekey: turnstileSiteKey,
        theme: 'light',
        callback: (token: string) => {
          setTurnstileToken(token);
          (window as any).__iconicTurnstileToken = token;
        },
        'expired-callback': () => {
          setTurnstileToken('');
          delete (window as any).__iconicTurnstileToken;
        },
      });
    };
    if ((window as any).turnstile) renderWidget();
    else {
      const script = document.createElement('script');
      script.src = 'https://challenges.cloudflare.com/turnstile/v0/api.js?render=explicit';
      script.async = true;
      script.onload = renderWidget;
      document.head.appendChild(script);
    }
  }, [turnstileSiteKey]);

  const handleLoginRedirect = () => {
    window.location.href = `/dang-nhap?redirect=${encodeURIComponent(window.location.pathname)}`;
  };

  const handleVoteSubmit = async () => {
    if (!currentUser?.id) {
      setErrorMessage('Bạn cần đăng nhập để bình chọn.');
      return;
    }

    if (freeQuota.remaining <= 0) {
      setErrorMessage('Bạn đã dùng hết 2 lượt bình chọn trong hôm nay.');
      return;
    }

    setIsVoting(true);
    setErrorMessage('');

    try {
      const token = localStorage.getItem('huit_web_token');
      let deviceId = localStorage.getItem('iconic_device_id');
      if (!deviceId) {
        deviceId = crypto.randomUUID();
        localStorage.setItem('iconic_device_id', deviceId);
      }
      const headers: Record<string, string> = { 'Content-Type': 'application/json' };
      if (token) {
        headers.Authorization = `Bearer ${token}`;
      }

      const res = await fetch(apiUrl(`/api/voting/candidates/${candidate.sbd}`), {
        method: 'POST',
        headers,
        body: JSON.stringify({
          userId: currentUser.id,
          eventId: 'thi-sinh-duoc-yeu-thich-nhat',
          deviceId,
          turnstileToken: turnstileToken || undefined,
        }),
      });

      const data = await res.json().catch(() => null);
      if (!res.ok) throw new Error(data?.message || 'Không thể thực hiện bình chọn.');

      const quotaRes = await fetch(apiUrl(`/api/voting/free-quota/${currentUser.id}`));
      if (quotaRes.ok) {
        setFreeQuota(await quotaRes.json());
      }

      onSuccess?.(data.candidate, 1);

      if (typeof window !== 'undefined' && (window as any).gtag) {
        (window as any).gtag('event', 'vote_cast', {
          event_category: 'engagement',
          event_label: candidate.name,
          project_sbd: candidate.sbd,
          value: 1,
        });
      }

      setStep('success');
      fireConfetti(3500);
    } catch (err: any) {
      setErrorMessage(err.message || 'Có lỗi xảy ra khi gửi bình chọn.');
    } finally {
      setIsVoting(false);
    }
  };

  const contestTableLabel = getContestTableLabel(candidate);
  const activePromotion = settings?.activeVotingPromotion;
  const quotaLimit = Math.max(freeQuota.limit || 2, 1);
  const quotaRemaining = Math.max(0, Math.min(freeQuota.remaining || 0, quotaLimit));
  const quotaProgress = Math.max(0, Math.min(100, (quotaRemaining / quotaLimit) * 100));

  return (
    <div className="fixed inset-0 z-[1105] flex items-center justify-center overflow-y-auto bg-[rgba(7,16,31,0.52)] p-3 backdrop-blur-md sm:p-5">
      <div
        className="my-auto w-full max-w-[840px] overflow-hidden rounded-[22px] border border-slate-200/70 bg-white text-slate-950 shadow-[0_28px_78px_rgba(15,23,42,0.24)]"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="relative flex h-[72px] items-center justify-center border-b border-slate-200/80 px-5 sm:px-7">
          <button
            onClick={onClose}
            aria-label="Quay lại"
            className="absolute left-5 top-1/2 inline-flex h-11 w-11 -translate-y-1/2 items-center justify-center rounded-full border border-slate-200 bg-white text-slate-700 shadow-[0_8px_22px_rgba(15,23,42,0.1)] transition hover:border-slate-300 hover:text-slate-950 sm:left-7"
          >
            <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="15 18 9 12 15 6" />
            </svg>
          </button>

          <h2 className="text-center text-[24px] font-bold leading-none tracking-normal text-slate-950 sm:text-[28px]">
            Bình chọn miễn phí
          </h2>

          <button
            onClick={onClose}
            aria-label="Đóng"
            className="absolute right-5 top-1/2 inline-flex h-11 w-11 -translate-y-1/2 items-center justify-center rounded-full border border-slate-200 bg-slate-50 text-slate-700 shadow-[0_8px_22px_rgba(15,23,42,0.1)] transition hover:border-slate-300 hover:bg-white hover:text-slate-950 sm:right-7"
          >
            <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <line x1="18" y1="6" x2="6" y2="18" />
              <line x1="6" y1="6" x2="18" y2="18" />
            </svg>
          </button>
        </div>

        <div className="p-5 sm:p-6">
          {step === 'confirm' ? (
            <div className="space-y-2">
              {activePromotion && (
                <div className="relative overflow-hidden flex items-center justify-between gap-3 rounded-lg bg-orange-600 py-1.5 px-3 text-white shadow-sm transition-all duration-300 hover:shadow-md hover:scale-[1.01] hover:bg-orange-700">
                  <style dangerouslySetInnerHTML={{__html: `
                    @keyframes customSweep {
                      0% { transform: translateX(-150%) skewX(-15deg); }
                      35% { transform: translateX(250%) skewX(-15deg); }
                      100% { transform: translateX(250%) skewX(-15deg); }
                    }
                  `}} />
                  <div 
                    className="absolute inset-0 w-1/2 h-full bg-gradient-to-r from-transparent via-white/20 to-transparent pointer-events-none" 
                    style={{ animation: 'customSweep 4s ease-in-out infinite' }}
                  />
                  
                  <div className="flex items-center gap-2 overflow-hidden truncate z-10">
                    <span className="text-sm shrink-0">🔥</span>
                    <span className="text-[11px] font-semibold text-orange-100 shrink-0">Giờ vàng:</span>
                    <span className="text-xs font-bold text-white truncate">{activePromotion.name}</span>
                  </div>
                  
                  <div className="rounded bg-white/20 border border-white/25 px-2 py-0.5 text-xs font-extrabold text-white shrink-0 z-10 flex items-center gap-1 shadow-sm">
                    <span className="text-[9px] font-medium text-orange-100/95 uppercase tracking-wider">Nhân</span>
                    <span className="font-black text-white">x{activePromotion.multiplier}</span>
                  </div>
                </div>
              )}

              <section className="space-y-2">
                <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:gap-5">
                  {/* Left: Image */}
                  <div className="h-[130px] w-[130px] sm:h-[140px] sm:w-[140px] shrink-0 overflow-hidden rounded-[16px] border border-slate-200/80 bg-slate-50 shadow-sm mx-auto sm:mx-0">
                    <img
                      src={candidate.imageUrl || '/duan/anhmauduan.png'}
                      alt={candidate.name}
                      className="h-full w-full object-cover"
                    />
                  </div>

                  {/* Right: Candidate Name, Badges & Detailed Info */}
                  <div className="min-w-0 flex-1 text-center sm:text-left pt-0.5">
                    <h3 className="text-[20px] sm:text-[22px] font-extrabold leading-tight text-slate-900">
                      {candidate.name}
                    </h3>

                    {/* Quick badges */}
                    <div className="mt-2 flex flex-wrap gap-1.5 justify-start text-[11px] sm:text-xs">
                      <span className="inline-flex items-center rounded bg-slate-100 px-2 py-0.5 font-semibold text-slate-600">
                        Mã số: {candidate.sbd}
                      </span>
                      <span className="inline-flex items-center rounded bg-blue-50 px-2 py-0.5 font-semibold text-blue-700">
                        {contestTableLabel}
                      </span>
                      {candidate.sector && (
                        <span className="inline-flex items-center rounded bg-emerald-50 px-2 py-0.5 font-semibold text-emerald-700">
                          Lĩnh vực: {candidate.sector}
                        </span>
                      )}
                    </div>

                    {/* Compact metadata info beside image */}
                    <div className="mt-1.5 space-y-1 border-t border-slate-100/70 pt-1.5 text-[13px] sm:text-[14px]">
                      {candidate.representativeSchool && (
                        <div className="flex items-start gap-1.5 text-left">
                          <span className="font-bold text-slate-500 shrink-0 w-[80px]">Đơn vị:</span>
                          <span className="text-slate-800 font-medium leading-tight">{candidate.representativeSchool}</span>
                        </div>
                      )}

                      {(candidate.teamName || candidate.leaderName) && (
                        <div className="flex items-start gap-1.5 text-left">
                          <span className="font-bold text-slate-500 shrink-0 w-[80px]">Thực hiện:</span>
                          <span className="text-slate-800 font-medium leading-tight">
                            {candidate.teamName && <span className="font-semibold text-slate-900">{candidate.teamName}</span>}
                            {candidate.leaderName && ` (Trưởng nhóm: ${candidate.leaderName})`}
                          </span>
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                {/* Description spans full width below */}
                {candidate.description && (
                  <p className="text-[13px] leading-relaxed text-slate-500 text-justify">
                    <span className="font-bold text-slate-700">Mô tả thí sinh: </span>
                    <span>{candidate.description}</span>
                  </p>
                )}
              </section>

              <section className="rounded-[18px] border border-[#c7d8ff] bg-[linear-gradient(180deg,#fbfdff_0%,#f7faff_100%)] p-4 shadow-[0_14px_32px_rgba(37,99,235,0.08)]">
                <div className="grid gap-4 sm:grid-cols-[188px_minmax(0,1fr)] sm:items-center sm:gap-5">
                  <div className="flex justify-center sm:justify-start">
                    <div
                      className="relative flex h-[138px] w-[138px] items-center justify-center rounded-full"
                      style={{
                        background: `conic-gradient(#2563eb ${quotaProgress}%, #d8e3f8 ${quotaProgress}% 100%)`,
                      }}
                    >
                      <div className="flex h-[112px] w-[112px] flex-col items-center justify-center rounded-full bg-white shadow-[inset_0_0_0_1px_rgba(148,163,184,0.14)]">
                        <span className="text-[44px] font-bold leading-none tracking-normal text-[#2563eb]">
                          {quotaRemaining}
                        </span>
                        <span className="mt-1.5 text-[14px] font-medium text-slate-600">/ {quotaLimit} lượt</span>
                      </div>
                    </div>
                  </div>

                  <div className="min-w-0">
                    <h4 className="text-center text-[20px] font-bold tracking-normal text-slate-950 sm:text-left">
                      Lượt còn lại hôm nay
                    </h4>

                    <p className="mt-1.5 text-center text-[14px] leading-6 text-slate-600 sm:text-left">
                      Mỗi tài khoản được tặng 2 lượt bình chọn miễn phí mỗi ngày.
                    </p>

                    {turnstileSiteKey && currentUser ? (
                      <div className="mt-3 flex justify-center" ref={turnstileRef} aria-label="Xác minh bảo mật" />
                    ) : null}

                    {errorMessage ? (
                      <div className="mt-2.5 rounded-2xl border border-rose-200 bg-rose-50 px-4 py-2.5 text-[13px] leading-5 text-rose-700">
                        {errorMessage}
                      </div>
                    ) : null}

                    <div className="mt-4">
                      {!currentUser ? (
                        <button
                          onClick={handleLoginRedirect}
                          className="flex h-[50px] w-full items-center justify-center rounded-[14px] bg-[linear-gradient(90deg,#1167f5_0%,#8a3ffc_100%)] px-6 text-[15px] font-bold uppercase tracking-[0.05em] text-white shadow-[0_16px_30px_rgba(67,56,202,0.28)] transition hover:-translate-y-0.5 hover:shadow-[0_18px_34px_rgba(67,56,202,0.32)] active:translate-y-0"
                        >
                          Đăng nhập để bình chọn
                        </button>
                      ) : (
                        <button
                          onClick={handleVoteSubmit}
                          disabled={isVoting || quotaRemaining <= 0 || (!!turnstileSiteKey && !turnstileToken)}
                          className="flex h-[50px] w-full items-center justify-center gap-3 rounded-[14px] bg-[linear-gradient(90deg,#1167f5_0%,#8a3ffc_100%)] px-6 text-[15px] font-bold uppercase tracking-[0.05em] text-white shadow-[0_16px_30px_rgba(67,56,202,0.28)] transition hover:-translate-y-0.5 hover:shadow-[0_18px_34px_rgba(67,56,202,0.32)] active:translate-y-0 disabled:cursor-not-allowed disabled:opacity-50 disabled:hover:translate-y-0"
                        >
                          <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                            <path d="M12 21s-6.7-4.35-9.33-8.06A5.52 5.52 0 0 1 7.14 4c1.82 0 3.32.88 4.36 2.23A5.5 5.5 0 0 1 15.86 4a5.52 5.52 0 0 1 4.47 8.94C18.7 16.65 12 21 12 21z" />
                          </svg>
                          {isVoting ? 'Đang xử lý...' : 'Xác nhận bình chọn'}
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              </section>

              <section className="rounded-[18px] border border-slate-200/80 bg-white p-4 shadow-[0_12px_28px_rgba(15,23,42,0.06)]">
                <p className="mb-3 text-[16px] font-bold uppercase tracking-normal text-[#2563eb]">Quy định</p>
                <div className="grid gap-3 sm:grid-cols-3 sm:gap-0">
                  <div className="flex items-center gap-3 sm:px-2">
                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-[#eff4ff] text-[#2563eb] shadow-[inset_0_0_0_1px_rgba(37,99,235,0.08)]">
                      <svg viewBox="0 0 24 24" className="h-4.5 w-4.5" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                        <circle cx="12" cy="12" r="9" />
                        <path d="M8 12l2.5 2.5L16 9" />
                      </svg>
                    </div>
                    <p className="text-[15px] leading-6 text-slate-800">2 lượt miễn phí mỗi ngày</p>
                  </div>

                  <div className="flex items-center gap-3 sm:border-l sm:border-slate-200 sm:px-6">
                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-[#eff4ff] text-[#2563eb] shadow-[inset_0_0_0_1px_rgba(37,99,235,0.08)]">
                      <svg viewBox="0 0 24 24" className="h-4.5 w-4.5" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                        <circle cx="12" cy="12" r="9" />
                        <path d="M12 7v5l3 2" />
                      </svg>
                    </div>
                    <p className="text-[15px] leading-6 text-slate-800">Làm mới lúc 00:00 hằng ngày</p>
                  </div>

                  <div className="flex items-center gap-3 sm:border-l sm:border-slate-200 sm:px-6">
                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-[#eff4ff] text-[#2563eb] shadow-[inset_0_0_0_1px_rgba(37,99,235,0.08)]">
                      <svg viewBox="0 0 24 24" className="h-4.5 w-4.5" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                        <circle cx="12" cy="12" r="9" />
                        <path d="M8 12h8" />
                      </svg>
                    </div>
                    <p className="text-[15px] leading-6 text-slate-800">Mỗi lần xác nhận sẽ trừ 1 lượt</p>
                  </div>
                </div>
              </section>
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center py-4 text-center sm:py-8">
              <div className="flex h-20 w-20 items-center justify-center rounded-full bg-emerald-50 text-emerald-500 shadow-[inset_0_0_0_1px_rgba(16,185,129,0.12)]">
                <svg xmlns="http://www.w3.org/2000/svg" width="34" height="34" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                  <polyline points="20 6 9 17 4 12" />
                </svg>
              </div>

              <div className="mt-6">
                <h3 className="text-[42px] font-bold tracking-normal text-[#f59e0b]">
                  +{activePromotion ? activePromotion.multiplier : 1} lượt
                </h3>
                <p className="mt-2 text-[18px] font-semibold text-slate-950">Bình chọn thành công</p>
              </div>

              <div className="mt-6 w-full max-w-[560px] rounded-[20px] border border-slate-200/80 bg-slate-50 p-5 text-left shadow-[0_16px_40px_rgba(15,23,42,0.08)]">
                <div className="flex items-center gap-4">
                  <div className="h-16 w-16 shrink-0 overflow-hidden rounded-[18px] border border-slate-200 bg-white">
                    <img src={candidate.imageUrl || '/duan/anhmauduan.png'} alt={candidate.name} className="h-full w-full object-cover" />
                  </div>
                  <div className="min-w-0">
                    <h4 className="truncate text-[20px] font-semibold tracking-normal text-slate-950">{candidate.name}</h4>
                    <p className="mt-1 text-[13px] font-medium text-slate-500">Mã thí sinh: {candidate.sbd}</p>
                    <p className="mt-2 text-[14px] text-slate-600">
                      Bạn còn <span className="font-semibold text-[#2563eb]">{freeQuota.remaining}</span> / {freeQuota.limit} lượt hôm nay.
                    </p>
                  </div>
                </div>
              </div>

              <button
                onClick={onClose}
                className="mt-6 h-12 rounded-[14px] border border-slate-200 bg-white px-8 text-[15px] font-semibold text-slate-900 shadow-[0_10px_24px_rgba(15,23,42,0.08)] transition hover:bg-slate-50"
              >
                Đóng
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
