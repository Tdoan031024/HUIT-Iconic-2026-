'use client';

import React, { useEffect, useMemo, useState } from 'react';
import { Candidate } from '@/lib/types';
import { apiUrl, formatAssetUrl } from '../api';

function cn(...parts: Array<string | false | null | undefined>) {
  return parts.filter(Boolean).join(' ');
}

function Skeleton({ className }: { className: string }) {
  return <div className={cn('animate-pulse rounded-[14px] bg-slate-200/80', className)} />;
}

function useAnimatedNumber(value: number, duration = 900) {
  const [displayValue, setDisplayValue] = useState(value);

  useEffect(() => {
    let frame = 0;
    const start = displayValue;
    const diff = value - start;
    const startedAt = performance.now();

    const tick = (now: number) => {
      const progress = Math.min((now - startedAt) / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      setDisplayValue(Math.round(start + diff * eased));
      if (progress < 1) frame = requestAnimationFrame(tick);
    };

    frame = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(frame);
  }, [value]);

  return displayValue;
}

function AnimatedMetric({ value }: { value: number }) {
  const animated = useAnimatedNumber(value || 0);
  return <>{(animated || 0).toLocaleString()}</>;
}

function FolderIcon() {
  return (
    <svg viewBox="0 0 24 24" className="h-[18px] w-[18px]" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M3 7a2 2 0 0 1 2-2h4l2 2h8a2 2 0 0 1 2 2v8a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V7Z" />
    </svg>
  );
}

function VoteIcon() {
  return (
    <svg viewBox="0 0 24 24" className="h-[18px] w-[18px]" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M12 3v18" />
      <path d="M7 7h7a3 3 0 0 0 0-6" />
      <path d="M17 17h-7a3 3 0 0 0 0 6" />
    </svg>
  );
}

function TrophyIcon() {
  return (
    <svg viewBox="0 0 24 24" className="h-[18px] w-[18px]" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M8 21h8" />
      <path d="M12 17v4" />
      <path d="M7 4h10v5a5 5 0 0 1-10 0V4Z" />
      <path d="M17 5h3v2a4 4 0 0 1-4 4h-1" />
      <path d="M7 5H4v2a4 4 0 0 0 4 4h1" />
    </svg>
  );
}

function CalendarIcon() {
  return (
    <svg viewBox="0 0 24 24" className="h-[18px] w-[18px]" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <rect x="3" y="5" width="18" height="16" rx="2" />
      <path d="M16 3v4" />
      <path d="M8 3v4" />
      <path d="M3 11h18" />
    </svg>
  );
}

function ActivityCreateIcon() {
  return (
    <svg viewBox="0 0 24 24" className="h-[16px] w-[16px]" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <rect x="4" y="4" width="16" height="16" rx="3" />
      <path d="M12 8v8" />
      <path d="M8 12h8" />
    </svg>
  );
}

function ActivityEditIcon() {
  return (
    <svg viewBox="0 0 24 24" className="h-[16px] w-[16px]" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M12 20h9" />
      <path d="M16.5 3.5a2.1 2.1 0 0 1 3 3L7 19l-4 1 1-4Z" />
    </svg>
  );
}

function ActivityStackIcon() {
  return (
    <svg viewBox="0 0 24 24" className="h-[16px] w-[16px]" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M12 3 3 8l9 5 9-5-9-5Z" />
      <path d="m3 14 9 5 9-5" />
      <path d="m3 11 9 5 9-5" />
    </svg>
  );
}

function formatRemaining(endDate?: string | null) {
  if (!endDate) return '--';
  const end = new Date(endDate).getTime();
  if (!Number.isFinite(end)) return '--';
  const diff = Math.max(end - Date.now(), 0);
  const days = Math.floor(diff / (1000 * 60 * 60 * 24));
  const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
  return `${days}\u00A0ngày`;
}

function KPIBlock({
  label,
  value,
  icon,
  tone,
  loading,
}: {
  label: string;
  value: React.ReactNode;
  icon: React.ReactNode;
  tone: 'blue' | 'violet' | 'amber' | 'emerald';
  loading?: boolean;
}) {
  const toneClass = {
    blue: 'border-blue-200 bg-blue-50 text-blue-700',
    violet: 'border-violet-200 bg-violet-50 text-violet-700',
    amber: 'border-amber-200 bg-amber-50 text-amber-700',
    emerald: 'border-emerald-200 bg-emerald-50 text-emerald-700',
  };

  return (
    <div className="admin-card min-h-[100px] px-3.5 py-3">
      <div className="flex items-start justify-between gap-2.5">
        <div className="min-w-0">
          <p className="min-h-[24px] text-[12px] font-semibold leading-4 text-slate-500 truncate" title={label}>{label}</p>
          {loading ? <Skeleton className="mt-2 h-7 w-20" /> : <p className="mt-2 whitespace-nowrap text-[22px] font-bold leading-none tracking-normal text-slate-950 2xl:text-[26px]">{value}</p>}
        </div>
        <div className={cn('flex h-8.5 w-8.5 shrink-0 items-center justify-center rounded-lg border', toneClass[tone])}>{icon}</div>
      </div>
    </div>
  );
}

type VotePoint = {
  label: string;
  value: number;
};

function OverviewVoteChart({
  data,
  totalVotes,
  loading,
}: {
  data: VotePoint[];
  totalVotes: number;
  loading: boolean;
}) {
  const width = 760;
  const height = 250;
  const paddingX = 34;
  const paddingTop = 24;
  const paddingBottom = 36;
  const chartHeight = height - paddingTop - paddingBottom;
  const chartWidth = width - paddingX * 2;
  const maxValue = Math.max(...data.map((item) => item.value), 1);
  const points = data.map((item, index) => {
    const x = paddingX + (chartWidth / Math.max(data.length - 1, 1)) * index;
    const y = paddingTop + chartHeight - (item.value / maxValue) * chartHeight;
    return { ...item, x, y };
  });
  const linePath = points.map((point, index) => `${index === 0 ? 'M' : 'L'} ${point.x} ${point.y}`).join(' ');
  const areaPath = `${linePath} L ${points[points.length - 1]?.x ?? paddingX} ${height - paddingBottom} L ${points[0]?.x ?? paddingX} ${height - paddingBottom} Z`;
  const latest = points[points.length - 1];

  return (
    <article className="admin-card !p-0">
      <div className="flex items-center justify-between gap-3 border-b border-slate-200/80 px-4 py-3.5">
        <div>
          <h2 className="text-[20px] font-bold tracking-[-0.03em] text-slate-950">Tổng quan bình chọn</h2>
        </div>
        <button type="button" className="admin-btn admin-btn-secondary !h-9 !min-h-0 px-3">
          7 ngày qua
          <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <polyline points="6 9 12 15 18 9" />
          </svg>
        </button>
      </div>

      <div className="px-4 py-4">
        {loading ? (
          <Skeleton className="h-[286px] w-full" />
        ) : (
          <>
            <div className="mb-3 flex flex-col gap-1.5">
              <p className="text-[13px] font-medium text-slate-500">Lượt bình chọn theo ngày</p>
              <p className="text-[32px] font-bold leading-none tracking-[-0.05em] text-slate-950">{totalVotes.toLocaleString()}</p>
            </div>

            <div className="overflow-hidden rounded-[14px] bg-[linear-gradient(180deg,#ffffff_0%,#f8fbff_100%)]">
              <svg viewBox={`0 0 ${width} ${height}`} className="h-[250px] w-full">
                {[0, 1, 2, 3, 4].map((step) => {
                  const y = paddingTop + (chartHeight / 4) * step;
                  const value = Math.round(maxValue - (maxValue / 4) * step);
                  return (
                    <g key={step}>
                      <line x1={paddingX} y1={y} x2={width - paddingX} y2={y} stroke="rgba(148,163,184,0.18)" strokeDasharray="4 8" />
                      <text x={12} y={y + 4} className="fill-slate-400 text-[12px] font-medium">
                        {value}
                      </text>
                    </g>
                  );
                })}

                <path d={areaPath} fill="url(#overviewArea)" />
                <path d={linePath} fill="none" stroke="#1f78f0" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />

                {points.map((point) => (
                  <g key={point.label}>
                    <circle cx={point.x} cy={point.y} r="3.5" fill="#1f78f0" />
                    <text x={point.x} y={height - 8} textAnchor="middle" className="fill-slate-500 text-[12px] font-medium">
                      {point.label}
                    </text>
                  </g>
                ))}

                {latest ? (
                  <g>
                    <rect x={latest.x - 52} y={latest.y - 48} rx="12" ry="12" width="74" height="46" fill="#ffffff" stroke="rgba(148,163,184,0.25)" />
                    <text x={latest.x - 40} y={latest.y - 28} className="fill-slate-500 text-[12px] font-medium">
                      {latest.label}
                    </text>
                    <text x={latest.x - 40} y={latest.y - 10} className="fill-slate-950 text-[14px] font-semibold">
                      {latest.value} lượt
                    </text>
                  </g>
                ) : null}

                <defs>
                  <linearGradient id="overviewArea" x1="0" x2="0" y1="0" y2="1">
                    <stop offset="0%" stopColor="rgba(31,120,240,0.18)" />
                    <stop offset="100%" stopColor="rgba(31,120,240,0.03)" />
                  </linearGradient>
                </defs>
              </svg>
            </div>
          </>
        )}
      </div>
    </article>
  );
}

function TopCandidatesCard({
  loading,
  candidates,
}: {
  loading: boolean;
  candidates: Candidate[];
}) {
  return (
    <article className="admin-card !p-0">
      <div className="flex items-center justify-between gap-3 border-b border-slate-200/80 px-4 py-3.5">
        <h2 className="text-[20px] font-bold tracking-[-0.03em] text-slate-950">Top thí sinh nổi bật</h2>
        <button type="button" className="text-[14px] font-semibold text-blue-600 transition hover:text-blue-700">
          Xem tất cả
        </button>
      </div>

      <div className="px-4 py-3">
        <div className="grid grid-cols-[28px_minmax(0,1.65fr)_90px_86px_108px] items-center gap-3 px-2 py-2 text-[12px] font-semibold uppercase tracking-[0.08em] text-slate-400">
          <div>#</div>
          <div>Thí sinh</div>
          <div>Mã dự thi</div>
          <div>Lượt bình chọn</div>
          <div>Trạng thái</div>
        </div>

        <div className="space-y-1">
          {loading
            ? Array.from({ length: 5 }).map((_, index) => <Skeleton key={index} className="h-[62px] w-full" />)
            : candidates.slice(0, 5).map((candidate, index) => {
                const isActive = candidate.votes > 0;
                return (
                  <div key={candidate.id} className="grid grid-cols-[28px_minmax(0,1.65fr)_90px_86px_108px] items-center gap-3 rounded-[14px] px-2 py-2.5 transition hover:bg-slate-50/80">
                    <div className="text-[14px] font-bold text-slate-700">{index + 1}</div>
                    <div className="flex min-w-0 items-center gap-3">
                      <img src={formatAssetUrl(candidate.imageUrl)} alt={candidate.name} className="h-10 w-10 rounded-[12px] border border-slate-200 object-cover" />
                      <div className="min-w-0">
                        <p className="line-clamp-2 text-[14px] font-semibold leading-5 text-slate-950" title={candidate.name}>{candidate.name}</p>
                        {index === 0 ? <span className="mt-1 inline-flex rounded-full bg-emerald-50 px-2 py-0.5 text-[11px] font-semibold text-emerald-700">Dẫn đầu</span> : null}
                      </div>
                    </div>
                    <div className="text-[14px] font-semibold text-slate-900">{candidate.sbd}</div>
                    <div className="text-[14px] font-bold text-slate-950">{candidate.votes}</div>
                    <div className="flex items-center gap-2 text-[12px] font-semibold text-slate-600">
                      <span className={cn('h-2.5 w-2.5 rounded-full', isActive ? 'bg-emerald-500' : 'bg-slate-400')} />
                      <span>{isActive ? 'Hoạt động' : 'Chưa có bình chọn'}</span>
                    </div>
                  </div>
                );
              })}
        </div>
      </div>
    </article>
  );
}

function QuickStatsCard({
  loading,
  stats,
}: {
  loading: boolean;
  stats: Array<{ label: string; value: string; growth: string }>;
}) {
  return (
    <article className="admin-card !p-0">
      <div className="border-b border-slate-200/80 px-4 py-3.5">
        <h2 className="text-[20px] font-bold tracking-[-0.03em] text-slate-950">Thống kê nhanh</h2>
      </div>
      <div className="grid gap-0 px-4 py-3 md:grid-cols-2 xl:grid-cols-4 md:divide-x md:divide-slate-200/80">
        {loading
          ? Array.from({ length: 4 }).map((_, index) => <Skeleton key={index} className="m-2 h-[140px] w-auto" />)
          : stats.map((stat) => (
              <div key={stat.label} className="px-3 py-2">
                <p className="text-[14px] font-medium text-slate-500">{stat.label}</p>
                <p className="mt-4 text-[32px] font-bold leading-none tracking-[-0.04em] text-slate-950">{stat.value}</p>
                <div className="mt-6 h-10">
                  <svg viewBox="0 0 120 36" className="h-10 w-full">
                    <path d="M2 30C12 30 14 16 24 16C34 16 36 30 46 30C56 30 58 10 68 10C78 10 80 24 90 24C100 24 104 10 118 10" fill="none" stroke="#6aa5ff" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                </div>
              </div>
            ))}
      </div>
    </article>
  );
}

function VoteHistoryCard({
  loading,
  votes,
}: {
  loading: boolean;
  votes: Array<any>;
}) {
  function timeAgo(dateStr?: string | Date) {
    if (!dateStr) return 'Vừa xong';
    const time = new Date(dateStr).getTime();
    if (isNaN(time)) return 'Vừa xong';
    const diff = Math.max(Date.now() - time, 0);
    const minutes = Math.floor(diff / 60000);
    if (minutes < 1) return 'Vừa xong';
    if (minutes < 60) return `${minutes} phút trước`;
    const hours = Math.floor(minutes / 60);
    if (hours < 24) return `${hours} giờ trước`;
    const days = Math.floor(hours / 24);
    return `${days} ngày trước`;
  }

  return (
    <article className="admin-card !p-0">
      <div className="flex items-center justify-between gap-3 border-b border-slate-200/80 px-4 py-2.5">
        <h2 className="flex items-center gap-2 text-[17px] font-bold tracking-[-0.02em] text-slate-950">
          <span className="inline-flex h-5 w-5 items-center justify-center rounded-md bg-blue-50 text-blue-600">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="h-3.5 w-3.5">
              <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </span>
          Lịch sử bình chọn
        </h2>
          <span className="inline-flex items-center rounded-full bg-blue-50 px-2 py-0.5 text-[10px] font-semibold text-blue-600">
          Real-time
        </span>
      </div>
      <div className="space-y-0 px-3 py-2">
        {loading
          ? Array.from({ length: 6 }).map((_, index) => <Skeleton key={index} className="h-[46px] w-full" />)
          : votes.length === 0 ? (
            <p className="py-6 text-center text-[13px] text-slate-400">Chưa có lượt bình chọn nào</p>
          ) : votes.map((vote) => {
            const userName = vote.userName || vote.voterPhone || 'Người dùng';
            const candidateName = vote.candidateName || vote.candidateSbd || vote.candidateId || 'Thí sinh';
            const score = vote.score || vote.points || 1;
            const dateVal = vote.createdAt || vote.voteTime;
            return (
              <div key={vote.id} className="flex gap-2.5 rounded-[10px] px-2 py-1.5 transition hover:bg-slate-50/80">
                {/* Avatar */}
                <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-blue-500 to-[#79BCC2] text-white text-[12px] font-bold shadow-sm">
                  {userName.charAt(0).toUpperCase()}
                </div>
                <div className="min-w-0 flex-1">
                  <p className="truncate text-[12.5px] font-semibold leading-[1.35] text-slate-900">
                    <span className="text-blue-600">{userName}</span>{' '}
                    bình chọn cho{' '}
                    <span className="font-bold text-slate-800">{candidateName}</span>
                  </p>
                  <div className="mt-0.5 flex items-center gap-1.5">
                    <span className="text-[10px] text-slate-400">{timeAgo(dateVal)}</span>
                    <span className="h-1 w-1 rounded-full bg-slate-300" />
                    <span className="inline-flex items-center rounded-full bg-blue-50 px-1.5 py-0.5 text-[9px] font-bold text-blue-700">
                      +{score} điểm
                    </span>
                  </div>
                </div>
              </div>
            );
          })}
      </div>
    </article>
  );
}

export default function OverviewPage() {
  const [candidates, setCandidates] = useState<Candidate[]>([]);
  const [isGateOpen, setIsGateOpen] = useState(true);
  const [endDate, setEndDate] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [recentVotes, setRecentVotes] = useState<any[]>([]);
  const [isVotesLoading, setIsVotesLoading] = useState(true);
  const [statsData, setStatsData] = useState<any>(null);
  const [analyticsData, setAnalyticsData] = useState<any>(null);

  useEffect(() => {
    async function loadStats() {
      try {
        const [candRes, dashboardRes, analyticsRes] = await Promise.all([
          fetch(apiUrl('/api/candidates')),
          fetch(apiUrl('/api/admin/stats/dashboard')),
          fetch(apiUrl('/api/admin/analytics/summary'))
        ]);

        if (candRes.ok) setCandidates(await candRes.json());
        if (analyticsRes.ok) setAnalyticsData(await analyticsRes.json());
        if (dashboardRes.ok) {
          const data = await dashboardRes.json();
          setStatsData(data);
          setIsGateOpen(data.settings?.isGateOpen ?? true);
          setEndDate(data.settings?.endDate || null);
        }
      } catch (error) {
        console.error('Failed to load admin overview data.', error);
      } finally {
        setIsLoading(false);
      }
    }

    loadStats();

    // Fetch recent votes (vote history)
    async function loadVotes() {
      try {
        const res = await fetch(apiUrl('/api/admin/votes?limit=8'));
        if (res.ok) {
          const data = await res.json();
          setRecentVotes(Array.isArray(data) ? data.slice(0, 8) : []);
        }
      } catch (err) {
        console.error('Failed to load recent votes.', err);
      } finally {
        setIsVotesLoading(false);
      }
    }
    loadVotes();

    const votesInterval = setInterval(loadVotes, 15000);
    const analyticsInterval = setInterval(async () => {
      try {
        const response = await fetch(apiUrl('/api/admin/analytics/summary'), { cache: 'no-store' });
        if (response.ok) setAnalyticsData(await response.json());
      } catch (error) {
        console.error('Failed to refresh analytics.', error);
      }
    }, 10000);
    return () => {
      clearInterval(votesInterval);
      clearInterval(analyticsInterval);
    };
  }, []);

  const totalVotes = useMemo(() => candidates.reduce((sum, item) => sum + item.votes, 0), [candidates]);
  const rankedCandidates = useMemo(() => [...candidates].sort((a, b) => b.votes - a.votes), [candidates]);
  const leadingCandidate = rankedCandidates[0] || null;

  const chartData = useMemo<VotePoint[]>(() => {
    if (statsData?.chartData && Array.isArray(statsData.chartData)) {
      return statsData.chartData;
    }

    return [
      { label: '12/06', value: 0 },
      { label: '13/06', value: 0 },
      { label: '14/06', value: 0 },
      { label: '15/06', value: 0 },
      { label: '16/06', value: 0 },
      { label: '17/06', value: 0 },
      { label: '18/06', value: 0 },
    ];
  }, [statsData]);

  const quickStats = useMemo(
    () => [
      { label: 'Bài viết tin tức', value: (statsData?.totalPosts || 0).toLocaleString(), growth: '' },
      { label: 'Lượt bình chọn', value: (totalVotes || 0).toLocaleString(), growth: '' },
      { label: 'Người dùng', value: (statsData?.totalUsers || statsData?.totalWebUsers || 0).toLocaleString(), growth: '' },
      { label: 'Nhà tài trợ', value: (statsData?.totalSponsors || 0).toLocaleString(), growth: '' },
    ],
    [statsData, totalVotes],
  );

  const recentActivities: any[] = [];

  return (
    <div className="space-y-3.5">
      <section className="grid gap-2.5 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-6">
        <KPIBlock label="Thí sinh" value={isLoading ? '--' : <AnimatedMetric value={candidates.length} />} icon={<FolderIcon />} tone="blue" loading={isLoading} />
        <KPIBlock label="Tổng lượt bình chọn" value={isLoading ? '--' : <AnimatedMetric value={totalVotes} />} icon={<VoteIcon />} tone="violet" loading={isLoading} />
        <KPIBlock label="SBD dẫn đầu" value={leadingCandidate?.sbd || '001'} icon={<TrophyIcon />} tone="amber" loading={isLoading} />
        <KPIBlock label="Thời gian còn lại" value={formatRemaining(endDate)} icon={<CalendarIcon />} tone="emerald" loading={isLoading} />
        <KPIBlock label="Lượt truy cập" value={isLoading ? '--' : <AnimatedMetric value={analyticsData?.totalViews || 0} />} icon={<ActivityStackIcon />} tone="blue" loading={isLoading} />
        <KPIBlock label="Người đang xem" value={isLoading ? '--' : <AnimatedMetric value={analyticsData?.activeVisitors || 0} />} icon={<ActivityCreateIcon />} tone="violet" loading={isLoading} />
      </section>

      <section className="grid gap-3.5 lg:grid-cols-2 xl:grid-cols-[1.08fr_0.92fr]">
        <OverviewVoteChart data={chartData} totalVotes={totalVotes} loading={isLoading} />
        <TopCandidatesCard loading={isLoading} candidates={rankedCandidates} />
      </section>

      <section className="grid gap-3.5 lg:grid-cols-2 xl:grid-cols-[1.08fr_0.92fr]">
        <QuickStatsCard loading={isLoading} stats={quickStats} />
        <VoteHistoryCard loading={isVotesLoading} votes={recentVotes} />
      </section>
    </div>
  );
}
