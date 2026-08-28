'use client';

import React, { useState, useEffect } from 'react';
import { apiUrl, formatAssetUrl } from '../../api';
import DateTimeInput from '../../components/DateTimeInput';
import { useAlert } from '../../AlertProvider';

type VotingPromotion = {
  id: string;
  name: string;
  multiplier: number;
  startAt: string;
  endAt: string;
  isEnabled: boolean;
  appliesTo: 'FREE' | 'PAID' | 'ALL';
  note?: string;
};

function createPromotionDraft(): VotingPromotion {
  const now = new Date();
  const start = new Date(now.getTime() + 10 * 60 * 1000);
  const end = new Date(start.getTime() + 2 * 60 * 60 * 1000);
  const toLocalInput = (value: Date) => {
    const offset = value.getTimezoneOffset();
    const local = new Date(value.getTime() - offset * 60 * 1000);
    return local.toISOString().slice(0, 16);
  };

  return {
    id: `promo-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
    name: 'Khung giờ nhân điểm',
    multiplier: 2,
    startAt: toLocalInput(start),
    endAt: toLocalInput(end),
    isEnabled: true,
    appliesTo: 'FREE',
    note: '',
  };
}

export default function SettingsAdminPage() {
  const { showAlert, showConfirm } = useAlert();
  // Gate settings state
  const [isGateOpen, setIsGateOpen] = useState(true);
  const [startDate, setStartDate] = useState('2026-09-05T00:00');
  const [endDate, setEndDate] = useState('2026-12-31T23:59');
  const [maxVotesPerPhone, setMaxVotesPerPhone] = useState(5);

  // General settings state
  const [eventTitle, setEventTitle] = useState("HUIT's ICONIC 2026 - Cuộc thi Tìm kiếm Đại sứ Truyền thông HUIT");
  const [organizer, setOrganizer] = useState("Trường Đại học Công Thương TP. Hồ Chí Minh (HUIT)");
  const [contactEmail, setContactEmail] = useState("duongdx@huit.edu.vn");
  const [headerHuitLogoUrl, setHeaderHuitLogoUrl] = useState('/images/huit_logo.png');
  const [headerIconicLogoUrl, setHeaderIconicLogoUrl] = useState('/images/image.webp');
  const [uploadingLogo, setUploadingLogo] = useState<'huit' | 'iconic' | null>(null);
  const [isRegistrationOpen, setIsRegistrationOpen] = useState(true);
  const [registrationDeadline, setRegistrationDeadline] = useState('2026-10-01T23:59');
  const [registrationUrl, setRegistrationUrl] = useState('https://zalo.me/g/uxjmkq913');
  const [detailUrl, setDetailUrl] = useState('https://huit.edu.vn');
  const [supportZaloUrl, setSupportZaloUrl] = useState('https://zalo.me/g/uxjmkq913');
  const [freeVotesPerAccountPerDay, setFreeVotesPerAccountPerDay] = useState(2);
  const [sepayBankName, setSepayBankName] = useState('KienLongBank');
  const [sepayAccountNo, setSepayAccountNo] = useState('101499100004001667');
  const [sepayAccountName, setSepayAccountName] = useState('DANG XUAN DUONG');
  const [sepayPrefix, setSepayPrefix] = useState('MD');
  const [sepayApiKey, setSepayApiKey] = useState('1dcd4e6cd52fde1e4bf0510a9b406476322d811f3bbae785');
  const [sponsorBannerUrl, setSponsorBannerUrl] = useState('/uploads/nhataitro.png');
  const [isTestMode, setIsTestMode] = useState(true);
  const [votingPromotions, setVotingPromotions] = useState<VotingPromotion[]>([]);

  // Maintenance state
  const [isMaintenanceMode, setIsMaintenanceMode] = useState(false);

  useEffect(() => {
    async function loadSettings() {
      try {
        const res = await fetch(apiUrl('/api/admin/settings'));
        if (res.ok) {
          const data = await res.json();
          setIsGateOpen(data.isGateOpen);
          setStartDate(data.startDate);
          setEndDate(data.endDate);
          setMaxVotesPerPhone(data.maxVotesPerPhone);
          setEventTitle(data.eventTitle);
          setOrganizer(data.organizer);
          setContactEmail(data.contactEmail);
          setHeaderHuitLogoUrl(data.headerHuitLogoUrl || '/images/huit_logo.png');
          setHeaderIconicLogoUrl(data.headerIconicLogoUrl || '/images/image.webp');
          setIsMaintenanceMode(data.isMaintenanceMode);
          setIsRegistrationOpen(data.isRegistrationOpen ?? true);
          setRegistrationDeadline(data.registrationDeadline || '2026-06-20T23:59');
          setRegistrationUrl(data.registrationUrl || 'https://khoinghiep.huit.edu.vn');
          setDetailUrl(data.detailUrl || 'https://khoinghiep.huit.edu.vn');
          setSupportZaloUrl(data.supportZaloUrl || 'https://zalo.me/4418938306145458374');
          setFreeVotesPerAccountPerDay(data.freeVotesPerAccountPerDay || 2);
          setSepayBankName(data.sepayBankName || 'VietinBank');
          setSepayAccountNo(data.sepayAccountNo || '110632156888');
          setSepayAccountName(data.sepayAccountName || 'TRUONG DAI HOC CONG THUONG TP.HCM');
          setSepayPrefix(data.sepayPrefix || 'HUIT');
          setSepayApiKey(data.sepayApiKey || 'sepay_api_key_placeholder');
          setSponsorBannerUrl(data.sponsorBannerUrl || '/original_assets/image4b12.png');
          setIsTestMode(data.isTestMode !== false);
          setVotingPromotions(Array.isArray(data.votingPromotions) ? data.votingPromotions : []);
        }
      } catch (err) {
        console.error('Failed to load system settings from backend, using defaults.', err);
      }
    }
    loadSettings();
  }, []);

  const updatePromotion = (id: string, field: keyof VotingPromotion, value: string | number | boolean) => {
    setVotingPromotions((prev) => prev.map((promotion) => (
      promotion.id === id ? { ...promotion, [field]: value } : promotion
    )));
  };

  const addPromotion = () => {
    setVotingPromotions((prev) => [...prev, createPromotionDraft()]);
  };

  const removePromotion = (id: string) => {
    setVotingPromotions((prev) => prev.filter((promotion) => promotion.id !== id));
  };

  const handleSaveSettings = async (e: React.FormEvent) => {
    e.preventDefault();
    const updatedSettings = {
      isGateOpen,
      startDate,
      endDate,
      maxVotesPerPhone,
      eventTitle,
      organizer,
      contactEmail,
      headerHuitLogoUrl,
      headerIconicLogoUrl,
      isMaintenanceMode,
      isRegistrationOpen,
      registrationDeadline,
      registrationUrl,
      detailUrl,
      supportZaloUrl,
      freeVotesPerAccountPerDay,
      sepayBankName,
      sepayAccountNo,
      sepayAccountName,
      sepayPrefix,
      sepayApiKey,
      isTestMode,
      sponsorBannerUrl,
      votingPromotions,
    };

    try {
      const res = await fetch(apiUrl('/api/admin/settings'), {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updatedSettings)
      });
      if (res.ok) {
        showAlert('Đã lưu cấu hình hệ thống thành công!', 'success');
        return;
      }
    } catch (err) {
      console.error('Failed to save settings to API.', err);
    }
    showAlert('Không thể kết nối đến backend API. Lưu cấu hình thất bại!', 'error');
  };

  const handleLogoUpload = async (file: File, type: 'huit' | 'iconic') => {
    setUploadingLogo(type);
    const formData = new FormData();
    formData.append('file', file);
    try {
      const res = await fetch(apiUrl('/api/admin/upload'), { method: 'POST', body: formData });
      const data = await res.json();
      if (!res.ok || !data.url) throw new Error(data.error || 'Tải logo thất bại');
      if (type === 'huit') setHeaderHuitLogoUrl(data.url);
      else setHeaderIconicLogoUrl(data.url);
      showAlert('Đã tải logo lên. Bấm “Lưu cấu hình” để áp dụng trên header.', 'success');
    } catch (error) {
      console.error('Failed to upload header logo.', error);
      showAlert('Không thể tải logo lên. Vui lòng thử lại.', 'error');
    } finally {
      setUploadingLogo(null);
    }
  };

  const handleResetVotes = async () => {
    const confirm1 = await showConfirm(
      'CẢNH BÁO NGUY HIỂM: Bạn có chắc chắn muốn đặt lại (RESET) toàn bộ số phiếu bình chọn của tất cả các thí sinh về 0 không?',
      'Cảnh báo nguy hiểm',
      'warning',
      'Tiếp tục'
    );
    if (!confirm1) return;

    const confirm2 = await showConfirm(
      'XÁC NHẬN LẦN CUỐI: Hành động này sẽ xóa sạch số lượt vote hiện tại và không thể khôi phục lại được. Bạn có chắc chắn thực hiện?',
      'Xác nhận lần cuối',
      'error',
      'Reset ngay'
    );
    if (!confirm2) return;

    try {
      const res = await fetch(apiUrl('/api/admin/settings/reset-votes'), {
        method: 'POST'
      });
      if (res.ok) {
        showAlert('Đã thiết lập lại toàn bộ điểm bình chọn của thí sinh về 0 thành công!', 'success');
        return;
      }
    } catch (err) {
      console.error('Failed to reset votes on API.', err);
    }
    showAlert('Không thể kết nối đến backend API. Đặt lại số phiếu thất bại!', 'error');
  };

  return (
    <div className="mx-auto flex max-w-4xl flex-col space-y-4">
      
      {/* Title Header */}
      <div className="flex flex-col gap-3 rounded-xl border border-[#dce5e1] bg-white p-4 shadow-sm md:flex-row md:items-center md:justify-between">
        <div>
          <p className="text-[10px] font-bold uppercase tracking-[0.16em] text-[#0f766e]">Thiết lập hệ thống</p>
          <h1 className="text-lg font-black text-[#123c34]">Cấu hình cổng bình chọn</h1>
          <p className="text-xs text-[#6b7773] mt-0.5">Điều chỉnh thời gian mở cổng bình chọn, giới hạn lượt vote và thiết lập bảo trì.</p>
        </div>
      </div>

      <form onSubmit={handleSaveSettings} className="space-y-4">
        

        {/* General Settings Block */}
        <div className="bg-white border border-[#dce5e1] rounded-xl p-5 shadow-sm space-y-4">
          <h3 className="text-sm font-bold text-[#123c34] border-b border-[#edf2f0] pb-2 flex items-center gap-2">
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-[#0f766e]"><circle cx="12" cy="12" r="10"></circle><line x1="12" y1="16" x2="12" y2="12"></line><line x1="12" y1="8" x2="12.01" y2="8"></line></svg>
            Thông tin chương trình & Liên hệ
          </h3>

          <div className="flex flex-col space-y-1.5">
            <label className="text-[10px] font-bold text-[#52605b] uppercase tracking-wider">Tên sự kiện / Cuộc thi</label>
            <input 
              type="text" 
              className="h-9 px-3 rounded-lg bg-[#fbfdfc] border border-[#dce5e1] text-[#18211f] focus:outline-none focus:border-[#0f766e] text-xs font-semibold"
              value={eventTitle} 
              onChange={e => setEventTitle(e.target.value)} 
              required
            />
          </div>

          <div className="flex flex-col space-y-1.5">
            <label className="text-[10px] font-bold text-[#52605b] uppercase tracking-wider">Đơn vị tổ chức</label>
            <input 
              type="text" 
              className="h-9 px-3 rounded-lg bg-[#fbfdfc] border border-[#dce5e1] text-[#18211f] focus:outline-none focus:border-[#0f766e] text-xs font-semibold"
              value={organizer} 
              onChange={e => setOrganizer(e.target.value)} 
              required
            />
          </div>

          <div className="flex flex-col space-y-1.5 w-full md:w-1/2">
            <label className="text-[10px] font-bold text-[#52605b] uppercase tracking-wider">Email hỗ trợ kỹ thuật</label>
            <input 
              type="email" 
              className="h-9 px-3 rounded-lg bg-[#fbfdfc] border border-[#dce5e1] text-[#18211f] focus:outline-none focus:border-[#0f766e] text-xs font-semibold"
              value={contactEmail} 
              onChange={e => setContactEmail(e.target.value)} 
              required
            />
          </div>
        </div>

        {/* Header logos block */}
        <div className="bg-white border border-[#dce5e1] rounded-xl p-5 shadow-sm space-y-4">
          <h3 className="text-sm font-bold text-[#123c34] border-b border-[#edf2f0] pb-2 flex items-center gap-2">
            Logo trên header
          </h3>
          <p className="text-xs text-[#6b7773]">
            Thay logo HUIT hoặc logo HUIT&apos;s ICONIC trên header website. Ảnh sẽ được tối ưu và lưu trong thư mục tải lên.
          </p>
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            {([
              { type: 'huit' as const, label: 'Logo HUIT', value: headerHuitLogoUrl, setValue: setHeaderHuitLogoUrl },
              { type: 'iconic' as const, label: "Logo HUIT's ICONIC", value: headerIconicLogoUrl, setValue: setHeaderIconicLogoUrl },
            ]).map((logo) => (
              <div key={logo.type} className="rounded-xl border border-[#dce5e1] bg-[#fbfdfc] p-3 space-y-3">
                <div className="flex h-20 items-center justify-center rounded-lg border border-[#edf2f0] bg-white p-2">
                  <img src={formatAssetUrl(logo.value)} alt={logo.label} className="max-h-full max-w-full object-contain" />
                </div>
                <label className="block text-[10px] font-bold uppercase tracking-wider text-[#52605b]">{logo.label}</label>
                <input
                  type="text"
                  value={logo.value}
                  onChange={(event) => logo.setValue(event.target.value)}
                  className="h-9 w-full rounded-lg border border-[#dce5e1] bg-white px-3 text-xs font-semibold text-[#18211f] focus:border-[#0f766e] focus:outline-none"
                  placeholder="/uploads/logo.webp"
                />
                <label className="inline-flex cursor-pointer items-center rounded-md bg-[#123c34] px-3 py-2 text-[10px] font-bold text-white transition hover:bg-[#0f766e]">
                  {uploadingLogo === logo.type ? 'Đang tải...' : 'Tải logo mới'}
                  <input
                    type="file"
                    accept="image/png,image/jpeg,image/webp,image/gif"
                    className="sr-only"
                    disabled={uploadingLogo !== null}
                    onChange={(event) => {
                      const file = event.target.files?.[0];
                      if (file) void handleLogoUpload(file, logo.type);
                      event.currentTarget.value = '';
                    }}
                  />
                </label>
              </div>
            ))}
          </div>
        </div>

        {/* Sponsors Banner Settings Block */}
        <div className="bg-white border border-[#dce5e1] rounded-xl p-5 shadow-sm space-y-4">
          <h3 className="text-sm font-bold text-[#123c34] border-b border-[#edf2f0] pb-2 flex items-center gap-2">
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="text-[#0f766e]">
              <rect x="3" y="3" width="18" height="18" rx="2" ry="2" />
              <line x1="3" y1="9" x2="21" y2="9" />
              <line x1="9" y1="21" x2="9" y2="9" />
            </svg>
            Hình ảnh Banner Nhà tài trợ &amp; Đối tác
          </h3>

          <div className="flex flex-col space-y-1.5">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5 items-end">
              <div className="flex flex-col space-y-1.5">
                <label className="text-[10px] font-bold text-[#52605b] uppercase tracking-wider">Đường dẫn hình ảnh banner (URL)</label>
                <input 
                  type="text" 
                  className="h-9 px-3 rounded-lg bg-[#fbfdfc] border border-[#dce5e1] text-[#18211f] focus:outline-none focus:border-[#0f766e] text-xs font-semibold"
                  value={sponsorBannerUrl} 
                  onChange={e => setSponsorBannerUrl(e.target.value)} 
                />
              </div>
              <div className="flex flex-col space-y-1.5">
                <label className="text-[10px] font-bold text-[#52605b] uppercase tracking-wider">Hoặc tải ảnh mới từ máy tính</label>
                <input
                  type="file"
                  accept="image/*"
                  className="w-full text-xs text-[#52605b] file:mr-3 file:py-1.5 file:px-3 file:rounded-md file:border-0 file:text-[10px] file:font-bold file:bg-[#123c34] file:text-white hover:file:bg-[#0f766e] cursor-pointer"
                  onChange={async (event) => {
                    const file = event.target.files?.[0];
                    if (!file) return;
                    const formData = new FormData();
                    formData.append('file', file);
                    try {
                      const res = await fetch(apiUrl('/api/admin/upload'), {
                        method: 'POST',
                        body: formData,
                      });
                      if (res.ok) {
                        const data = await res.json();
                        setSponsorBannerUrl(data.url);
                        alert('Tải ảnh banner lên thành công!');
                      } else {
                        alert('Tải ảnh banner lên thất bại.');
                      }
                    } catch (err) {
                      console.error(err);
                      alert('Có lỗi xảy ra khi tải ảnh banner.');
                    }
                  }}
                />
              </div>
            </div>
          </div>

          <div className="mt-3 p-3 bg-slate-50 border border-slate-100 rounded-xl">
            <p className="text-[10px] font-bold text-[#52605b] uppercase tracking-wider mb-2">Xem trước Banner Nhà tài trợ:</p>
            <div className="border border-[#dce5e1] rounded-lg overflow-hidden bg-white p-2 flex items-center justify-center max-h-48">
              <img 
                src={formatAssetUrl(sponsorBannerUrl)} 
                className="max-h-44 max-w-full object-contain" 
                alt="Sponsors Banner Preview" 
              />
            </div>
          </div>
        </div>

        <div className="bg-white border border-[#dce5e1] rounded-xl p-5 shadow-sm space-y-4">
          <h3 className="text-sm font-bold text-[#123c34] border-b border-[#edf2f0] pb-2 flex items-center gap-2">
            Cấu hình đăng ký & bình chọn miễn phí
          </h3>

          <div className="flex items-center justify-between p-3 bg-[#fbfdfc] rounded-xl border border-[#dce5e1] shadow-sm">
            <div>
              <p className="font-bold text-xs text-[#123c34]">Mở đăng ký dự thi</p>
              <p className="text-[10px] text-[#6b7773]">Điều khiển trạng thái nút đăng ký trên website chính.</p>
            </div>
            <button
              type="button"
              onClick={() => setIsRegistrationOpen(!isRegistrationOpen)}
              className={`w-12 h-6 rounded-full transition-colors duration-200 relative flex items-center ${isRegistrationOpen ? 'bg-emerald-600' : 'bg-slate-200'}`}
            >
              <span className={`w-4 h-4 rounded-full bg-white shadow-sm transition-transform duration-200 absolute ${isRegistrationOpen ? 'translate-x-7' : 'translate-x-1'}`} />
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="flex flex-col space-y-1.5">
              <label className="text-[10px] font-bold text-[#52605b] uppercase tracking-wider">Hạn đăng ký hồ sơ</label>
              <DateTimeInput value={registrationDeadline} onChange={val => setRegistrationDeadline(val)} />
            </div>
            <div className="flex flex-col space-y-1.5">
              <label className="text-[10px] font-bold text-[#52605b] uppercase tracking-wider">Lượt miễn phí / tài khoản / ngày</label>
              <input type="number" min={0} className="h-9 px-3 rounded-lg bg-[#fbfdfc] border border-[#dce5e1] text-[#18211f] focus:outline-none focus:border-[#0f766e] text-xs font-semibold" value={freeVotesPerAccountPerDay} onChange={e => setFreeVotesPerAccountPerDay(Number(e.target.value))} />
            </div>
            <div className="flex flex-col space-y-1.5">
              <label className="text-[10px] font-bold text-[#52605b] uppercase tracking-wider">Link đăng ký</label>
              <input className="h-9 px-3 rounded-lg bg-[#fbfdfc] border border-[#dce5e1] text-[#18211f] focus:outline-none focus:border-[#0f766e] text-xs font-semibold" value={registrationUrl} onChange={e => setRegistrationUrl(e.target.value)} />
            </div>
            <div className="flex flex-col space-y-1.5">
              <label className="text-[10px] font-bold text-[#52605b] uppercase tracking-wider">Link chi tiết cuộc thi</label>
              <input className="h-9 px-3 rounded-lg bg-[#fbfdfc] border border-[#dce5e1] text-[#18211f] focus:outline-none focus:border-[#0f766e] text-xs font-semibold" value={detailUrl} onChange={e => setDetailUrl(e.target.value)} />
            </div>
            <div className="flex flex-col space-y-1.5 md:col-span-2">
              <label className="text-[10px] font-bold text-[#52605b] uppercase tracking-wider">Link hỗ trợ Zalo</label>
              <input className="h-9 px-3 rounded-lg bg-[#fbfdfc] border border-[#dce5e1] text-[#18211f] focus:outline-none focus:border-[#0f766e] text-xs font-semibold" value={supportZaloUrl} onChange={e => setSupportZaloUrl(e.target.value)} />
            </div>
          </div>
        </div>





        {/* System Maintenance Block */}
        <div className="bg-white border border-[#dce5e1] rounded-xl p-5 shadow-sm space-y-4">
          <h3 className="text-sm font-bold text-[#123c34] border-b border-[#edf2f0] pb-2 flex items-center gap-2">
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-[#0f766e]"><circle cx="12" cy="12" r="3"></circle><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 1 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 1 1-2.83-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 1 1 2.83-2.83l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 1 1 2.83 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z"></path></svg>
            Vận hành hệ thống & Khôi phục dữ liệu
          </h3>

          <div className="flex items-center justify-between p-3 bg-[#fbfdfc] rounded-xl border border-[#dce5e1] shadow-sm">
            <div>
              <p className="font-bold text-xs text-[#123c34]">Chế độ bảo trì (Maintenance Mode)</p>
              <p className="text-[10px] text-[#6b7773]">Tạm dừng truy cập và hiển thị trang thông báo bảo trì đối với người dùng public.</p>
            </div>
            <button
              type="button"
              onClick={() => setIsMaintenanceMode(!isMaintenanceMode)}
              className={`w-12 h-6 rounded-full transition-colors duration-200 relative flex items-center ${isMaintenanceMode ? 'bg-red-600' : 'bg-slate-200'}`}
            >
              <span className={`w-4 h-4 rounded-full bg-white shadow-sm transition-transform duration-200 absolute ${isMaintenanceMode ? 'translate-x-7' : 'translate-x-1'}`} />
            </button>
          </div>

          <div className="p-3 bg-red-50 border border-red-200 rounded-xl flex flex-col md:flex-row md:items-center md:justify-between gap-3 shadow-sm">
            <div>
              <p className="font-bold text-red-700 text-xs">Đặt lại toàn bộ số phiếu bình chọn</p>
              <p className="text-[10px] text-red-600/80 font-medium">Đặt số phiếu bình chọn của tất cả các thí sinh về 0. Hành động này không thể khôi phục!</p>
            </div>
            <button
              type="button"
              onClick={handleResetVotes}
              className="px-3 py-1.5 bg-red-600 hover:bg-red-700 rounded-lg text-white font-bold text-[10px] transition-colors shadow self-start md:self-auto active:scale-[0.98]"
            >
              Reset toàn bộ vote
            </button>
          </div>
        </div>

        {/* Action button */}
        <div className="flex justify-end gap-3 pt-2">
          <button 
            type="submit" 
            className="px-5 py-2 bg-[#123c34] hover:bg-[#0f766e] rounded-lg text-white text-[11px] font-bold transition shadow active:scale-[0.98]"
          >
            Lưu cấu hình hệ thống
          </button>
        </div>

      </form>
    </div>
  );
}
