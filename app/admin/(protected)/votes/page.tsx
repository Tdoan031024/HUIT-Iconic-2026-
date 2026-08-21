'use client';

import { useEffect, useMemo, useState } from 'react';
import { apiUrl } from '../../api';
import { useAlert } from '../../AlertProvider';

interface VoteLog {
  id: string;
  voterPhone: string;
  voterName: string;
  voterEmail: string;
  candidateSbd: string;
  candidateName: string;
  voteTime: string;
}

function formatDate(value?: string) {
  if (!value) return 'Chưa rõ';
  try {
    const d = new Date(value);
    const pad = (n: number) => String(n).padStart(2, '0');
    const utc7 = new Date(d.getTime() + 7 * 60 * 60 * 1000);
    return `${pad(utc7.getUTCHours())}:${pad(utc7.getUTCMinutes())}:${pad(utc7.getUTCSeconds())} ngày ${pad(utc7.getUTCDate())}/${pad(utc7.getUTCMonth() + 1)}/${utc7.getUTCFullYear()}`;
  } catch {
    return value;
  }
}

function escapeCSVValue(val: any): string {
  if (val === null || val === undefined) return '';
  let str = String(val);
  if (str.includes(',') || str.includes('"') || str.includes('\n') || str.includes('\r')) {
    str = str.replace(/"/g, '""');
    return `"${str}"`;
  }
  return str;
}

export default function VoteLogsAdminPage() {
  const [logs, setLogs] = useState<VoteLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [candidateFilter, setCandidateFilter] = useState('ALL');
  const [projectSearch, setProjectSearch] = useState('');
  const [appliedProjectSearch, setAppliedProjectSearch] = useState('');
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [hidePublicVoteHistory, setHidePublicVoteHistory] = useState(false);
  const [settingsSaving, setSettingsSaving] = useState(false);
  const { showConfirm } = useAlert();

  const loadLogs = async () => {
    try {
      setLoading(true);
      const res = await fetch(apiUrl('/api/admin/votes'));
      if (res.ok) {
        setLogs(await res.json());
        setSelectedIds(new Set());
      }
    } catch (err) {
      console.error('Lỗi tải danh sách bình chọn:', err);
      setLogs([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadLogs();
  }, []);

  useEffect(() => {
    const loadSettings = async () => {
      try {
        const res = await fetch(apiUrl('/api/admin/settings'));
        if (res.ok) {
          const data = await res.json();
          setHidePublicVoteHistory(Boolean(data.hidePublicVoteHistory));
        }
      } catch (err) {
        console.error('Lỗi tải cấu hình lịch sử bình chọn:', err);
      }
    };
    loadSettings();
  }, []);

  const togglePublicVoteHistory = async () => {
    const next = !hidePublicVoteHistory;
    try {
      setSettingsSaving(true);
      const res = await fetch(apiUrl('/api/admin/settings'), {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ hidePublicVoteHistory: next }),
      });
      if (!res.ok) {
        const data = await res.json().catch(() => null);
        throw new Error(data?.message || 'Không thể lưu cấu hình hiển thị lịch sử bình chọn.');
      }
      setHidePublicVoteHistory(next);
    } catch (err: any) {
      console.error('Lỗi lưu cấu hình lịch sử bình chọn:', err);
      alert(err?.message || 'Không thể lưu cấu hình lịch sử bình chọn.');
    } finally {
      setSettingsSaving(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!await showConfirm('CẢNH BÁO: Xóa bản ghi bình chọn này sẽ tự động giảm trừ 1 điểm của ứng viên tương ứng. Bạn có chắc chắn muốn xóa không?')) {
      return;
    }
    try {
      const res = await fetch(apiUrl(`/api/admin/votes/${id}`), {
        method: 'DELETE',
      });
      if (res.ok) {
        alert('Xóa lượt bình chọn thành công và đã hoàn lại điểm ứng viên!');
        loadLogs();
      } else {
        const errorData = await res.json();
        alert(errorData.message || 'Xóa lượt bình chọn thất bại.');
      }
    } catch (err) {
      console.error(err);
      alert('Đã xảy ra lỗi kết nối đến server.');
    }
  };

  const handleExportCSV = () => {
    const headers = [
      'ID Lượt Vote',
      'Số ĐT/ID Người vote',
      'Tên cử tri',
      'Email cử tri',
      'SBD ứng viên',
      'Tên ứng viên được vote',
      'Thời gian bình chọn'
    ];

    const csvRows = [headers.join(',')];

    for (const log of filteredLogs) {
      const row = [
        escapeCSVValue(log.id),
        escapeCSVValue(log.voterPhone),
        escapeCSVValue(log.voterName),
        escapeCSVValue(log.voterEmail),
        escapeCSVValue(log.candidateSbd),
        escapeCSVValue(log.candidateName),
        escapeCSVValue(formatDate(log.voteTime))
      ];
      csvRows.push(row.join(','));
    }

    const csvContent = '\uFEFF' + csvRows.join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', `vote_logs_export_${new Date().toISOString().slice(0, 10)}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const filteredLogs = useMemo(() => {
    const keyword = search.trim().toLowerCase();
    const projectKeyword = appliedProjectSearch.trim().toLowerCase();
    return logs
      .filter((log) => candidateFilter === 'ALL' || log.candidateSbd === candidateFilter)
      .filter((log) => {
        if (!projectKeyword) return true;
        const projectLabel = `${log.candidateSbd} - ${log.candidateName}`.toLowerCase();
        return (
          projectLabel.includes(projectKeyword) ||
          log.candidateName.toLowerCase().includes(projectKeyword) ||
          log.candidateSbd.toLowerCase().includes(projectKeyword)
        );
      })
      .filter((log) =>
        !keyword ||
        log.voterPhone.toLowerCase().includes(keyword) ||
        log.voterName.toLowerCase().includes(keyword) ||
        log.voterEmail.toLowerCase().includes(keyword) ||
        log.candidateName.toLowerCase().includes(keyword) ||
        log.candidateSbd.toLowerCase().includes(keyword)
      );
  }, [appliedProjectSearch, candidateFilter, search, logs]);

  const uniqueCandidates = useMemo(() => {
    const seen = new Set<string>();
    const list: { sbd: string; name: string }[] = [];
    for (const log of logs) {
      if (log.candidateSbd && !seen.has(log.candidateSbd)) {
        seen.add(log.candidateSbd);
        list.push({ sbd: log.candidateSbd, name: log.candidateName });
      }
    }
    return list.sort((a, b) => a.sbd.localeCompare(b.sbd));
  }, [logs]);

  const applyProjectSearch = () => {
    setAppliedProjectSearch(projectSearch.trim());
    setCandidateFilter('ALL');
    setSelectedIds(new Set());
  };

  const clearProjectSearch = () => {
    setProjectSearch('');
    setAppliedProjectSearch('');
    setCandidateFilter('ALL');
    setSelectedIds(new Set());
  };

  const toggleSelectAll = () => {
    if (selectedIds.size === filteredLogs.length) {
      setSelectedIds(new Set());
    } else {
      setSelectedIds(new Set(filteredLogs.map((log) => log.id)));
    }
  };

  const toggleSelectOne = (id: string) => {
    const next = new Set(selectedIds);
    if (next.has(id)) {
      next.delete(id);
    } else {
      next.add(id);
    }
    setSelectedIds(next);
  };

  const handleDeleteBulk = async () => {
    if (selectedIds.size === 0) return;
    if (
      !await showConfirm(
        `CẢNH BÁO: Bạn có chắc chắn muốn xóa ${selectedIds.size} lượt bình chọn đã chọn? Điểm của các ứng viên tương ứng sẽ tự động giảm trừ tương ứng. Hành động này không thể hoàn tác!`
      )
    ) {
      return;
    }
    try {
      setLoading(true);
      const res = await fetch(apiUrl('/api/admin/votes/delete-bulk'), {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ids: Array.from(selectedIds) }),
      });
      if (res.ok) {
        alert(`Đã xóa thành công ${selectedIds.size} lượt bình chọn và hoàn lại điểm cho ứng viên!`);
        setSelectedIds(new Set());
        loadLogs();
      } else {
        const errorData = await res.json();
        alert(errorData.message || 'Xóa hàng loạt thất bại.');
        setLoading(false);
      }
    } catch (err) {
      console.error(err);
      alert('Đã xảy ra lỗi kết nối đến server.');
      setLoading(false);
    }
  };

  return (
    <div className="space-y-4">
      {/* Header section */}
      <section className="flex flex-col gap-3 rounded-xl border border-[#dce5e1] bg-white p-4 shadow-sm md:flex-row md:items-center md:justify-between">
        <div>
          <p className="text-[10px] font-bold uppercase tracking-[0.16em] text-[#0f766e]">Nhật ký cử tri</p>
          <h2 className="mt-0.5 text-lg font-black text-[#123c34]">Lịch sử bình chọn chi tiết</h2>
          <p className="text-xs text-[#6b7773] mt-0.5">Theo dõi thời gian, thông tin cử tri và mã dự án nhận bình chọn. Dữ liệu thời gian thực từ cơ sở dữ liệu.</p>
        </div>
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={togglePublicVoteHistory}
            disabled={settingsSaving}
            className="inline-flex items-center justify-center gap-1.5 rounded-lg border border-slate-200 bg-white px-3.5 py-2 text-xs font-bold text-slate-700 shadow transition hover:border-[#0f766e] hover:text-[#0f766e] active:scale-[0.98] disabled:opacity-60 shrink-0"
          >
            {settingsSaving
              ? 'Đang lưu...'
              : hidePublicVoteHistory
                ? 'Hiện trên web chính'
                : 'Ẩn trên web chính'}
          </button>
          <button
            onClick={handleExportCSV}
            disabled={filteredLogs.length === 0}
            className="inline-flex items-center justify-center gap-1.5 rounded-lg border border-slate-200 bg-white px-3.5 py-2 text-xs font-bold text-slate-700 shadow transition hover:border-[#0f766e] hover:text-[#0f766e] active:scale-[0.98] disabled:opacity-50 shrink-0"
          >
            <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="2.5">
              <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
              <polyline points="17 8 12 3 7 8" />
              <line x1="12" y1="3" x2="12" y2="15" />
            </svg>
            Xuất file CSV
          </button>
        </div>
      </section>

      {/* KPI block */}
      <section className="grid grid-cols-1 gap-3 md:grid-cols-3">
        {[
          ['Tổng số phiếu bầu', logs.length.toLocaleString()],
          ['Kết quả bộ lọc', filteredLogs.length.toLocaleString()],
          ['Số dự án nhận vote', uniqueCandidates.length.toLocaleString()],
        ].map(([label, value]) => (
          <div key={label} className="rounded-xl border border-[#dce5e1] bg-white p-4 shadow-sm">
            <p className="text-[10px] font-bold uppercase tracking-[0.14em] text-[#7a8b85]">{label}</p>
            <p className="mt-1 text-2xl font-black text-[#123c34]">{value}</p>
          </div>
        ))}
      </section>

      {/* Filter card */}
      <section className="rounded-xl border border-[#dce5e1] bg-white shadow-sm">
        <div className="grid gap-3 border-b border-[#edf2f0] p-4 xl:grid-cols-[minmax(0,1fr)_minmax(260px,360px)_260px]">
          <input
            value={search}
            onChange={(event) => {
              setSearch(event.target.value);
              setSelectedIds(new Set());
            }}
            placeholder="Tìm theo số điện thoại, tên, email cử tri hoặc tên dự án..."
            className="h-10 rounded-lg border border-[#dce5e1] bg-[#fbfdfc] px-3 text-xs font-semibold text-[#18211f] outline-none focus:border-[#0f766e] focus:bg-white"
          />
          <div className="flex min-w-0 gap-2">
            <input
              value={projectSearch}
              onChange={(event) => setProjectSearch(event.target.value)}
              onKeyDown={(event) => {
                if (event.key === 'Enter') {
                  event.preventDefault();
                  applyProjectSearch();
                }
              }}
              list="vote-project-filter-options"
              placeholder="Tìm dự án theo tên hoặc SBD..."
              className="h-10 min-w-0 flex-1 rounded-lg border border-[#dce5e1] bg-[#fbfdfc] px-3 text-xs font-semibold text-[#18211f] outline-none focus:border-[#0f766e] focus:bg-white"
            />
            <datalist id="vote-project-filter-options">
              {uniqueCandidates.map((c) => (
                <option key={c.sbd} value={`${c.sbd} - ${c.name}`} />
              ))}
            </datalist>
            <button
              type="button"
              onClick={applyProjectSearch}
              className="h-10 shrink-0 rounded-lg bg-[#0f766e] px-3.5 text-xs font-bold text-white shadow transition hover:bg-[#0b5f59] active:scale-[0.98]"
            >
              Tìm dự án
            </button>
          </div>
          <select
            value={candidateFilter}
            onChange={(event) => {
              setCandidateFilter(event.target.value);
              setProjectSearch('');
              setAppliedProjectSearch('');
              setSelectedIds(new Set());
            }}
            className="h-10 rounded-lg border border-[#dce5e1] bg-[#fbfdfc] px-3 text-xs font-bold text-[#52605b] outline-none focus:border-[#0f766e]"
          >
            <option value="ALL">Tất cả dự án</option>
            {uniqueCandidates.map((c) => (
              <option key={c.sbd} value={c.sbd}>
                SBD {c.sbd} - {c.name.slice(0, 24)}...
              </option>
            ))}
          </select>
          {(appliedProjectSearch || candidateFilter !== 'ALL') && (
            <div className="flex flex-wrap items-center gap-2 xl:col-span-3">
              <span className="rounded-full border border-emerald-200 bg-emerald-50 px-3 py-1 text-[11px] font-bold text-emerald-700">
                Đang lọc dự án: {candidateFilter !== 'ALL' ? `SBD ${candidateFilter}` : appliedProjectSearch}
              </span>
              <button
                type="button"
                onClick={clearProjectSearch}
                className="rounded-full border border-slate-200 px-3 py-1 text-[11px] font-bold text-slate-500 transition hover:border-rose-200 hover:bg-rose-50 hover:text-rose-600"
              >
                Xóa lọc dự án
              </button>
            </div>
          )}
        </div>

        {selectedIds.size > 0 && (
          <div className="flex items-center justify-between border-b border-rose-100 bg-rose-50/60 px-5 py-3 backdrop-blur-sm transition-all duration-300">
            <span className="text-xs font-bold text-rose-700">
              Đã chọn <b className="text-[14px]">{selectedIds.size}</b> lượt bình chọn
            </span>
            <button
              type="button"
              onClick={handleDeleteBulk}
              className="flex items-center gap-1.5 rounded-lg bg-rose-600 hover:bg-rose-700 px-3.5 py-1.5 text-xs font-bold text-white shadow-sm transition"
            >
              <svg viewBox="0 0 24 24" className="h-3.5 w-3.5" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="M3 6h18" />
                <path d="M8 6V4h8v2" />
                <path d="M19 6l-1 14H6L5 6" />
              </svg>
              Xóa các lượt đã chọn
            </button>
          </div>
        )}

        {hidePublicVoteHistory && (
          <div className="border-b border-amber-100 bg-amber-50/80 px-5 py-3 text-xs font-semibold text-amber-800">
            Lịch sử bình chọn đang được ẩn trên web chính. Admin vẫn xem và xuất dữ liệu tại đây.
          </div>
        )}

        {/* Bảng dữ liệu admin luôn hiển thị để quản trị và đối soát */}
        <div className="overflow-x-auto">
          <table className="w-full min-w-[950px] border-collapse text-left">
            <thead>
              <tr className="border-b border-[#edf2f0] bg-[#fbfdfc] text-[10px] font-black uppercase tracking-[0.12em] text-[#7a8b85]">
                <th className="px-5 py-3 w-12 text-center">
                  <input
                    type="checkbox"
                    checked={filteredLogs.length > 0 && selectedIds.size === filteredLogs.length}
                    onChange={toggleSelectAll}
                    className="h-4 w-4 rounded border-[#dce5e1] text-[#0f766e] focus:ring-[#0f766e] cursor-pointer"
                  />
                </th>
                <th className="px-5 py-3 w-1/3">Cử tri (Người bình chọn)</th>
                <th className="px-5 py-3">Dự án được bình chọn</th>
                <th className="px-5 py-3">Thời gian</th>
                <th className="px-5 py-3 text-center w-32 whitespace-nowrap">Hành động</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#edf2f0] text-xs">
              {filteredLogs.map((log) => (
                <tr key={log.id} className={`hover:bg-[#edf4f1]/25 transition-colors ${selectedIds.has(log.id) ? 'bg-[#edf4f1]/40' : ''}`}>
                  <td className="px-5 py-3 text-center w-12">
                    <input
                      type="checkbox"
                      checked={selectedIds.has(log.id)}
                      onChange={() => toggleSelectOne(log.id)}
                      className="h-4 w-4 rounded border-[#dce5e1] text-[#0f766e] focus:ring-[#0f766e] cursor-pointer"
                    />
                  </td>
                  <td className="px-5 py-3">
                    <div>
                      <p className="font-black text-[#123c34]">{log.voterName}</p>
                      <p className="mt-0.5 text-[11px] text-[#6b7773]">
                        SĐT/ID: <span className="font-mono font-bold text-slate-700">{log.voterPhone}</span>
                        {log.voterEmail && <span className="ml-2 font-semibold">| Email: {log.voterEmail}</span>}
                      </p>
                    </div>
                  </td>
                  <td className="px-5 py-3">
                    <div>
                      <p className="font-black text-[#123c34]">
                        <span className="mr-1.5 inline-block rounded bg-[#edf8f4] px-1.5 py-0.5 text-[10px] font-bold text-[#0f766e] border border-[#b9d8cf]">
                          SBD {log.candidateSbd}
                        </span>
                        {log.candidateName}
                      </p>
                    </div>
                  </td>
                  <td className="px-5 py-3 font-semibold text-[#52605b]">
                    {formatDate(log.voteTime)}
                  </td>
                  <td className="px-5 py-3 text-center">
                    <div className="flex justify-center">
                      <button
                        type="button"
                        onClick={() => handleDelete(log.id)}
                        className="grid h-7 w-7 place-items-center rounded-md border border-red-200 bg-red-50 text-red-600 hover:border-red-400 hover:bg-red-100 transition"
                        title="Hủy lượt bình chọn này"
                      >
                        <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                          <path d="M3 6h18" />
                          <path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6" />
                          <path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2" />
                        </svg>
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
              {filteredLogs.length === 0 && (
                <tr>
                  <td colSpan={5} className="px-5 py-10 text-center text-sm font-semibold text-[#7a8b85]">
                    {loading ? 'Đang tải lịch sử bình chọn...' : 'Chưa có lượt bình chọn nào phù hợp.'}
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
}
