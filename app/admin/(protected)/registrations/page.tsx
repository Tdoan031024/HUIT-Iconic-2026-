'use client';

import { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { apiUrl, formatAssetUrl } from '../../api';

type Registration = {
  id: string; fullName: string; gender: string; dateOfBirth?: string; faculty?: string; major: string; className: string; studentId: string;
  placeOfBirth: string; identityNumber: string; identityIssuedDate?: string; identityIssuedPlace: string; address: string;
  phone: string; email: string; facebookUrl?: string; videoUrl?: string; talent?: string; achievements?: string; selfIntroduction?: string;
  inspirationalMessage?: string; facultyIntroduction?: string; ambassadorPlan?: string; portraitImageUrl: string; fullBodyImageUrl: string;
  heightCm?: number; weightKg?: number; measurementBust?: number; measurementWaist?: number; measurementHip?: number; status: string;
  adminNote?: string; assignedSbd?: string; candidateId?: string; createdAt: string;
};

const statusLabels: Record<string, string> = { PENDING: 'Chờ xem xét', REVIEWING: 'Đang xem xét', APPROVED: 'Đã duyệt', REJECTED: 'Từ chối' };
const statusStyles: Record<string, string> = { PENDING: 'border-amber-200 bg-amber-50 text-amber-700', REVIEWING: 'border-blue-200 bg-blue-50 text-blue-700', APPROVED: 'border-emerald-200 bg-emerald-50 text-emerald-700', REJECTED: 'border-rose-200 bg-rose-50 text-rose-700' };

function date(value?: string) { return value ? new Date(value).toLocaleDateString('vi-VN') : 'Chưa cập nhật'; }
function Info({ label, value, isLink = false }: { label: string; value?: string | number | null; isLink?: boolean }) {
  return <div>
    <dt className="text-[11px] font-bold uppercase tracking-wide text-slate-400">{label}</dt>
    <dd className="mt-1 whitespace-pre-wrap text-sm font-semibold leading-6 text-slate-800">
      {value ? (
        isLink ? (
          <a href={String(value)} target="_blank" rel="noreferrer" className="inline-flex items-center gap-1.5 text-blue-600 underline hover:text-blue-800">
            {String(value)}
            <svg viewBox="0 0 24 24" className="h-3.5 w-3.5" fill="none" stroke="currentColor" strokeWidth="2"><path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6" /><polyline points="15 3 21 3 21 9" /><line x1="10" y1="14" x2="21" y2="3" /></svg>
          </a>
        ) : String(value)
      ) : 'Chưa cập nhật'}
    </dd>
  </div>;
}

export default function RegistrationsPage() {
  const [items, setItems] = useState<Registration[]>([]);
  const [filter, setFilter] = useState('ALL');
  const [search, setSearch] = useState('');
  const [selected, setSelected] = useState<Registration | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  // SBD creation modal state
  const [sbdModalOpen, setSbdModalOpen] = useState(false);
  const [inputSbd, setInputSbd] = useState('');
  const [contestTable, setContestTable] = useState('FEMALE');
  const [converting, setConverting] = useState(false);

  async function load() {
    setLoading(true);
    try {
      const response = await fetch(apiUrl('/api/admin/registrations'));
      if (!response.ok) throw new Error('Không thể tải hồ sơ đăng ký.');
      setItems(await response.json());
    } catch (error: any) {
      alert(error.message);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => { load(); }, []);

  const filtered = useMemo(() => items.filter((item) => (filter === 'ALL' || item.status === filter) && `${item.fullName} ${item.email} ${item.studentId} ${item.phone} ${item.faculty || ''} ${item.assignedSbd || ''}`.toLowerCase().includes(search.toLowerCase())), [items, filter, search]);

  async function updateStatus(status: string) {
    if (!selected) return;
    setSaving(true);
    try {
      const response = await fetch(apiUrl('/api/admin/registrations'), {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: selected.id, status, adminNote: selected.adminNote }),
      });
      if (!response.ok) throw new Error('Không thể cập nhật trạng thái.');
      setItems((prev) => prev.map((item) => item.id === selected.id ? { ...item, status } : item));
      setSelected({ ...selected, status });
    } catch (error: any) {
      alert(error.message);
    } finally {
      setSaving(false);
    }
  }

  function openApproveModal(reg: Registration) {
    // Generate suggested SBD
    const prefix = reg.gender === 'MALE' ? 'IC-M' : 'IC-F';
    const randomNum = Math.floor(100 + Math.random() * 900);
    setInputSbd(`${prefix}${randomNum}`);
    setContestTable(reg.gender === 'MALE' ? 'MALE' : 'FEMALE');
    setSbdModalOpen(true);
  }

  async function confirmApproveAndConvert() {
    if (!selected) return;
    if (!inputSbd.trim()) {
      alert('Vui lòng nhập Số Báo Danh (SBD).');
      return;
    }
    setConverting(true);
    try {
      const response = await fetch(apiUrl('/api/admin/registrations'), {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'APPROVE_AND_CONVERT',
          registrationId: selected.id,
          sbd: inputSbd.trim().toUpperCase(),
          contestTable,
        }),
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.message || 'Không thể duyệt hồ sơ.');
      alert(data.message || 'Duyệt hồ sơ và tạo thí sinh thành công!');
      const updatedSbd = inputSbd.trim().toUpperCase();
      const candidateId = data.candidate?.id;
      setItems((prev) => prev.map((item) => item.id === selected.id ? { ...item, status: 'APPROVED', assignedSbd: updatedSbd, candidateId } : item));
      setSelected((prev) => prev ? { ...prev, status: 'APPROVED', assignedSbd: updatedSbd, candidateId } : null);
      setSbdModalOpen(false);
    } catch (error: any) {
      alert(error.message || 'Lỗi xử lý duyệt hồ sơ.');
    } finally {
      setConverting(false);
    }
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-col justify-between gap-3 sm:flex-row sm:items-center">
        <div>
          <p className="text-[11px] font-black uppercase tracking-[.16em] text-blue-600">Tuyển chọn HUIT&apos;s ICONIC 2026</p>
          <h1 className="mt-1 text-xl sm:text-2xl font-black tracking-tight text-slate-950">Thí sinh đăng ký qua Website</h1>
          <p className="mt-0.5 text-xs text-slate-500">Danh sách thí sinh đăng ký dự thi trực tuyến qua website. Kiểm tra thông tin, duyệt hồ sơ và cấp SBD vào danh sách chính thức.</p>
        </div>
        <div className="flex flex-wrap gap-2 shrink-0">
          <div className="rounded-xl border border-blue-100 bg-blue-50 px-3 py-1.5 text-xs font-bold text-blue-700">{items.filter((item) => item.status === 'PENDING').length} hồ sơ chờ xem xét</div>
          <div className="rounded-xl border border-emerald-100 bg-emerald-50 px-3 py-1.5 text-xs font-bold text-emerald-700">{items.filter((item) => Boolean(item.assignedSbd)).length} đã cấp SBD</div>
        </div>
      </div>

      <div className="flex flex-col gap-2.5 rounded-2xl border border-slate-200 bg-white p-3 shadow-sm sm:flex-row">
        <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Tìm theo họ tên, SBD, MSSV, khoa, email, điện thoại..." className="h-9 min-w-0 flex-1 rounded-xl border border-slate-200 px-3.5 text-xs outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100" />
        <select value={filter} onChange={(e) => setFilter(e.target.value)} className="h-9 rounded-xl border border-slate-200 px-3 text-xs font-bold text-slate-700 outline-none">
          <option value="ALL">Tất cả trạng thái</option>
          <option value="PENDING">Chờ xem xét</option>
          <option value="REVIEWING">Đang xem xét</option>
          <option value="APPROVED">Đã duyệt</option>
          <option value="REJECTED">Từ chối</option>
        </select>
      </div>

      <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
        <div className="overflow-x-auto">
          <table className="min-w-[960px] w-full text-left">
            <thead className="bg-slate-50 text-[10.5px] font-black uppercase tracking-wide text-slate-500">
              <tr>
                <th className="px-3.5 py-3">Ứng viên</th>
                <th className="px-3.5 py-3">Khoa & Lớp</th>
                <th className="px-3.5 py-3">Liên hệ</th>
                <th className="px-3.5 py-3">Hình thể</th>
                <th className="px-3.5 py-3">Video sơ loại</th>
                <th className="px-3.5 py-3">Trạng thái / SBD</th>
                <th className="px-3.5 py-3">Ngày gửi</th>
                <th className="px-3.5 py-3 text-right">Thao tác</th>
              </tr>
            </thead>
          <tbody className="divide-y divide-slate-100">
            {loading ? (
              <tr><td colSpan={8} className="px-5 py-16 text-center text-sm font-semibold text-slate-500">Đang tải hồ sơ...</td></tr>
            ) : filtered.length === 0 ? (
              <tr><td colSpan={8} className="px-5 py-16 text-center text-sm font-semibold text-slate-500">Chưa có hồ sơ phù hợp.</td></tr>
            ) : filtered.map((item) => (
              <tr key={item.id} className="align-middle hover:bg-slate-50">
                <td className="px-5 py-4">
                  <div className="flex min-w-[240px] items-center gap-3">
                    <img src={formatAssetUrl(item.portraitImageUrl)} alt="" className="h-12 w-12 rounded-xl border border-slate-200 object-cover" />
                    <div>
                      <p className="font-black text-slate-900">{item.fullName}</p>
                      <p className="mt-0.5 text-xs font-bold text-slate-500">MSSV: {item.studentId} · {item.gender === 'FEMALE' ? 'Nữ' : item.gender === 'MALE' ? 'Nam' : item.gender}</p>
                    </div>
                  </div>
                </td>
                <td className="px-5 py-4">
                  <p className="font-bold text-slate-900">{item.faculty || item.major}</p>
                  <p className="mt-0.5 text-xs text-slate-500">{item.major} · Lớp {item.className}</p>
                </td>
                <td className="px-5 py-4">
                  <p className="text-sm font-semibold text-slate-800">{item.phone}</p>
                  <p className="mt-0.5 text-xs text-slate-500">{item.email}</p>
                </td>
                <td className="px-5 py-4 text-sm font-semibold text-slate-700">
                  {item.heightCm || '-'} cm · {item.weightKg || '-'} kg
                </td>
                <td className="px-5 py-4">
                  {item.videoUrl ? (
                    <a href={item.videoUrl} target="_blank" rel="noreferrer" className="inline-flex items-center gap-1 rounded-lg bg-blue-50 px-2.5 py-1 text-xs font-bold text-blue-700 hover:bg-blue-100">
                      <svg viewBox="0 0 24 24" className="h-3.5 w-3.5" fill="none" stroke="currentColor" strokeWidth="2"><polygon points="5 3 19 12 5 21 5 3" /></svg>
                      Xem clip
                    </a>
                  ) : (
                    <span className="text-xs text-slate-400">Không có</span>
                  )}
                </td>
                <td className="px-5 py-4">
                  <div className="flex flex-col gap-1">
                    <span className={`inline-flex w-fit rounded-lg border px-2.5 py-0.5 text-xs font-bold ${statusStyles[item.status] || statusStyles.PENDING}`}>
                      {statusLabels[item.status] || item.status}
                    </span>
                    {item.assignedSbd && (
                      <span className="inline-flex w-fit rounded-lg bg-emerald-600 px-2 py-0.5 text-[11px] font-black text-white">
                        SBD: {item.assignedSbd}
                      </span>
                    )}
                  </div>
                </td>
                <td className="px-5 py-4 text-xs font-semibold text-slate-500">{date(item.createdAt)}</td>
                <td className="px-5 py-4 text-right">
                  <button onClick={() => setSelected(item)} className="rounded-xl border border-slate-200 px-3 py-2 text-xs font-black text-blue-700 hover:border-blue-300 hover:bg-blue-50">
                    Xem hồ sơ
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>

  {/* Modal chi tiết hồ sơ */}
  {selected && (
    <div className="fixed inset-0 z-[1200] flex items-start justify-center overflow-y-auto bg-slate-950/60 p-4 backdrop-blur-sm" onMouseDown={(e) => e.target === e.currentTarget && setSelected(null)}>
      <div className="my-5 w-full max-w-5xl rounded-3xl bg-white shadow-2xl">
        <div className="flex items-start justify-between gap-4 border-b border-slate-100 p-6 sm:p-8">
          <div>
            <p className="text-xs font-black uppercase tracking-[.16em] text-blue-600">Chi tiết hồ sơ tuyển sinh HUIT&apos;s ICONIC</p>
            <div className="mt-2 flex flex-wrap items-center gap-3">
              <h2 className="text-2xl font-black text-slate-950">{selected.fullName}</h2>
              {selected.assignedSbd && (
                <span className="rounded-xl bg-emerald-600 px-3 py-1 text-xs font-black text-white">
                  Đã cấp SBD: {selected.assignedSbd}
                </span>
              )}
            </div>
            <p className="mt-1 text-sm text-slate-500">Nộp hồ sơ ngày {date(selected.createdAt)}</p>
          </div>
          <button onClick={() => setSelected(null)} className="grid h-10 w-10 place-items-center rounded-xl border border-slate-200 text-xl text-slate-500 hover:bg-slate-50" aria-label="Đóng">×</button>
        </div>

        <div className="space-y-7 p-6 sm:p-8">
          {/* Ảnh chân dung & Toàn thân */}
          <div className="grid gap-6 sm:grid-cols-2">
            <div>
              <p className="mb-2 text-xs font-black uppercase tracking-wider text-slate-500">Ảnh chân dung chính diện</p>
              <img src={formatAssetUrl(selected.portraitImageUrl)} alt="Ảnh chân dung" className="h-80 w-full rounded-2xl object-cover border border-slate-200" />
            </div>
            <div>
              <p className="mb-2 text-xs font-black uppercase tracking-wider text-slate-500">Ảnh toàn thân nghệ thuật</p>
              <img src={formatAssetUrl(selected.fullBodyImageUrl)} alt="Ảnh toàn thân" className="h-80 w-full rounded-2xl object-cover border border-slate-200" />
            </div>
          </div>

          <section>
            <h3 className="mb-4 text-lg font-black text-slate-950">Thông tin cá nhân & Học tập</h3>
            <dl className="grid gap-5 sm:grid-cols-3">
              <Info label="Họ và tên" value={selected.fullName} />
              <Info label="Giới tính" value={selected.gender === 'FEMALE' ? 'Nữ' : selected.gender === 'MALE' ? 'Nam' : selected.gender} />
              <Info label="Ngày sinh" value={date(selected.dateOfBirth)} />
              <Info label="Khoa đào tạo" value={selected.faculty || 'Chưa cập nhật'} />
              <Info label="Ngành học" value={selected.major} />
              <Info label="Lớp" value={selected.className} />
              <Info label="MSSV" value={selected.studentId} />
              <Info label="Nơi sinh" value={selected.placeOfBirth} />
              <Info label="CMND/CCCD" value={selected.identityNumber} />
              <Info label="Ngày cấp" value={date(selected.identityIssuedDate)} />
              <Info label="Nơi cấp" value={selected.identityIssuedPlace} />
              <Info label="Điện thoại" value={selected.phone} />
              <Info label="Email" value={selected.email} />
              <Info label="Địa chỉ" value={selected.address} />
              <Info label="Facebook cá nhân" value={selected.facebookUrl} isLink />
              <Info label="Video sơ loại / giới thiệu" value={selected.videoUrl} isLink />
              <Info label="Năng khiếu nổi bật" value={selected.talent} />
              <Info label="Thành tích / Minh chứng" value={selected.achievements} />
            </dl>
          </section>

          <section>
            <h3 className="mb-4 text-lg font-black text-slate-950">Chỉ số hình thể</h3>
            <dl className="grid gap-5 sm:grid-cols-5">
              <Info label="Chiều cao" value={selected.heightCm ? `${selected.heightCm} cm` : null} />
              <Info label="Cân nặng" value={selected.weightKg ? `${selected.weightKg} kg` : null} />
              <Info label="Vòng 1 (Ngực)" value={selected.measurementBust ? `${selected.measurementBust} cm` : null} />
              <Info label="Vòng 2 (Eo)" value={selected.measurementWaist ? `${selected.measurementWaist} cm` : null} />
              <Info label="Vòng 3 (Mông)" value={selected.measurementHip ? `${selected.measurementHip} cm` : null} />
            </dl>
          </section>

          <section>
            <h3 className="mb-4 text-lg font-black text-slate-950">Nội dung tự bạch & Tầm nhìn</h3>
            <dl className="grid gap-5">
              <Info label="Giới thiệu bản thân" value={selected.selfIntroduction} />
              <Info label="Câu nói truyền cảm hứng & Diễn giải" value={selected.inspirationalMessage} />
              <Info label="Giới thiệu về ngành và khoa đang học tại HUIT" value={selected.facultyIntroduction} />
              <Info label="Việc đầu tiên làm nếu trở thành Đại sứ truyền thông" value={selected.ambassadorPlan} />
            </dl>
          </section>

          {/* Thanh hành động */}
          <div className="flex flex-col gap-4 border-t border-slate-100 pt-6 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-center gap-3">
              <span className={`inline-flex rounded-lg border px-3 py-1.5 text-sm font-black ${statusStyles[selected.status] || statusStyles.PENDING}`}>
                {statusLabels[selected.status] || selected.status}
              </span>
              {selected.assignedSbd && (
                <span className="text-xs font-bold text-emerald-700">
                  ✓ Đã là Thí sinh chính thức (SBD: {selected.assignedSbd})
                </span>
              )}
            </div>

            <div className="flex flex-wrap items-center gap-2">
              <button disabled={saving} onClick={() => updateStatus('REVIEWING')} className="rounded-xl border border-blue-200 px-4 py-2.5 text-xs font-black text-blue-700 hover:bg-blue-50 disabled:opacity-50">
                Đang xem xét
              </button>
              <button disabled={saving} onClick={() => updateStatus('REJECTED')} className="rounded-xl border border-rose-200 px-4 py-2.5 text-xs font-black text-rose-700 hover:bg-rose-50 disabled:opacity-50">
                Từ chối
              </button>

              {selected.assignedSbd ? (
                <div className="flex gap-2">
                  <Link href={`/thi-sinh/${selected.assignedSbd}`} target="_blank" className="inline-flex items-center gap-1.5 rounded-xl bg-blue-600 px-4 py-2.5 text-xs font-black text-white hover:bg-blue-700">
                    Xem trên website
                    <svg viewBox="0 0 24 24" className="h-3.5 w-3.5" fill="none" stroke="currentColor" strokeWidth="2"><path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6" /><polyline points="15 3 21 3 21 9" /><line x1="10" y1="14" x2="21" y2="3" /></svg>
                  </Link>
                  <Link href="/admin/candidates" target="_blank" className="rounded-xl border border-slate-200 px-4 py-2.5 text-xs font-black text-slate-700 hover:bg-slate-50">
                    Quản lý thí sinh
                  </Link>
                </div>
              ) : (
                <button onClick={() => openApproveModal(selected)} className="inline-flex items-center gap-2 rounded-xl bg-emerald-600 px-5 py-2.5 text-xs font-black text-white hover:bg-emerald-700 shadow-md shadow-emerald-600/20">
                  <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="2.5"><polyline points="20 6 9 17 4 12" /></svg>
                  Duyệt & Cấp SBD tạo Thí sinh
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  )}

  {/* Modal cấp SBD */}
  {sbdModalOpen && selected && (
    <div className="fixed inset-0 z-[1300] flex items-center justify-center overflow-y-auto bg-slate-950/70 p-4 backdrop-blur-sm">
      <div className="w-full max-w-md rounded-3xl bg-white p-6 shadow-2xl sm:p-8">
        <div className="flex items-center justify-between border-b border-slate-100 pb-4">
          <h3 className="text-xl font-black text-slate-950">Duyệt & Cấp Số Báo Danh</h3>
          <button onClick={() => setSbdModalOpen(false)} className="text-slate-400 hover:text-slate-600 text-2xl font-bold">×</button>
        </div>

        <div className="mt-5 space-y-4">
          <div className="rounded-2xl border border-blue-100 bg-blue-50 p-4">
            <p className="text-xs font-bold text-blue-900">Thí sinh: <span className="font-black text-base text-blue-950">{selected.fullName}</span></p>
            <p className="mt-1 text-xs text-blue-700">{selected.faculty || selected.major} · {selected.gender === 'FEMALE' ? 'Nữ' : 'Nam'}</p>
          </div>

          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-600">Số Báo Danh (SBD) <span className="text-red-500">*</span></label>
            <input
              type="text"
              required
              value={inputSbd}
              onChange={(e) => setInputSbd(e.target.value.toUpperCase())}
              placeholder="Ví dụ: IC-001 hoặc 012"
              className="mt-2 h-12 w-full rounded-xl border border-slate-200 px-4 font-mono text-base font-black tracking-wider text-slate-900 outline-none focus:border-emerald-500 focus:ring-4 focus:ring-emerald-100"
            />
            <p className="mt-1.5 text-[11px] text-slate-500">Số báo danh sẽ hiển thị trên trang chủ, bảng xếp hạng và dùng để bình chọn.</p>
          </div>

          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-600">Bảng dự thi</label>
            <select
              value={contestTable}
              onChange={(e) => setContestTable(e.target.value)}
              className="mt-2 h-12 w-full rounded-xl border border-slate-200 px-4 text-sm font-bold text-slate-800 outline-none focus:border-emerald-500 focus:ring-4 focus:ring-emerald-100"
            >
              <option value="FEMALE">Bảng Nữ</option>
              <option value="MALE">Bảng Nam</option>
              <option value="STUDENT">Bảng Sinh viên</option>
            </select>
          </div>
        </div>

        <div className="mt-7 flex items-center justify-end gap-3">
          <button
            type="button"
            onClick={() => setSbdModalOpen(false)}
            disabled={converting}
            className="h-11 rounded-xl border border-slate-200 px-5 text-xs font-bold text-slate-600 hover:bg-slate-50"
          >
            Hủy
          </button>
          <button
            type="button"
            onClick={confirmApproveAndConvert}
            disabled={converting}
            className="h-11 rounded-xl bg-emerald-600 px-6 text-xs font-black text-white hover:bg-emerald-700 shadow-md shadow-emerald-600/20 disabled:opacity-50"
          >
            {converting ? 'Đang tạo thí sinh...' : 'Xác nhận & Đưa lên Web'}
          </button>
        </div>
      </div>
    </div>
  )}
</div>
);
}
