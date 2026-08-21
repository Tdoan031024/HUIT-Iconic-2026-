'use client';

import React, { useEffect, useState } from 'react';
import { apiUrl, formatAssetUrl } from '../../api';

type Step = {
  number: string;
  description: string;
  image: string;
};

type GuideSection = {
  title: string;
  steps: Step[];
};

type ExchangeRate = {
  points: string;
  price: string;
};

type FaqItem = {
  question: string;
  answer: string;
};

const defaultSections: GuideSection[] = [
  {
    title: 'Hướng dẫn bình chọn miễn phí',
    steps: [
      { number: '01', description: 'Tạo tài khoản mới hoặc đăng nhập nhanh bằng tài khoản Google.', image: '/original_assets/imagefca6.png' },
      { number: '02', description: 'Đăng nhập tài khoản để nhận lượt bình chọn miễn phí hằng ngày.', image: '/original_assets/imagef1be.png' },
      { number: '03', description: 'Tìm kiếm và lựa chọn dự án bạn muốn bình chọn.', image: '/original_assets/image81d3.png' },
      { number: '04', description: 'Chọn gói 5 điểm miễn phí, hệ thống ghi nhận điểm sau khi xác nhận thành công.', image: '/original_assets/image20da.png' },
    ],
  },
  {
    title: 'Thanh toán chuyển khoản tự động qua Sepay',
    steps: [
      { number: '01', description: 'Truy cập danh sách dự án, chọn dự án bạn muốn ủng hộ.', image: '/original_assets/image17ae.png' },
      { number: '02', description: 'Lựa chọn gói điểm mong muốn và bấm thanh toán.', image: '/original_assets/imageefc9.png' },
      { number: '03', description: 'Quét mã QR thanh toán hiển thị trên màn hình hoặc chuyển khoản đúng cú pháp, số tiền qua cổng Sepay.', image: '/original_assets/image837f.png' },
      { number: '04', description: 'Giao dịch hoàn tất, hệ thống Sepay tự động xác nhận và cộng điểm bình chọn sau vài giây.', image: '/original_assets/image20da.png' },
    ],
  },
];

function extractDigits(str: any): string {
  if (str === undefined || str === null) return '';
  const s = String(str).trim();
  const match = s.match(/\d+/g);
  if (!match) {
    if (s.toLowerCase().includes('miễn phí')) return '0';
    return '';
  }
  return match.join('');
}

const defaultExchangeRates: ExchangeRate[] = [
  { points: '5', price: '0' },
  { points: '10', price: '10000' },
  { points: '20', price: '20000' },
  { points: '50', price: '50000' },
  { points: '220', price: '100000' },
  { points: '1050', price: '500000' },
  { points: '2300', price: '1000000' },
  { points: '7000', price: '3000000' },
];

function normalizeRates(rawRates: any[]): ExchangeRate[] {
  const rates = rawRates
    .map((rate) => {
      let points = extractDigits(rate.points);
      if (!points && rate.label) {
        points = extractDigits(rate.label);
      }
      
      let price = extractDigits(rate.price);
      if (!price && rate.priceLabel) {
        price = extractDigits(rate.priceLabel);
      }
      
      return { points, price };
    })
    .filter((rate) => rate.points !== '' && rate.price !== '');
  return rates.length > 0 ? rates : defaultExchangeRates;
}

export default function GuidesAdminPage() {
  const [activeTab, setActiveTab] = useState(0);
  const [sections, setSections] = useState<GuideSection[]>(defaultSections);
  const [exchangeRates, setExchangeRates] = useState<ExchangeRate[]>(defaultExchangeRates);
  const [faqItems, setFaqItems] = useState<FaqItem[]>([]);
  const [faqOpenIdx, setFaqOpenIdx] = useState<number | null>(null);
  const [isSavingFaq, setIsSavingFaq] = useState(false);

  useEffect(() => {
    async function loadSettings() {
      try {
        const res = await fetch(apiUrl('/api/admin/settings'));
        if (!res.ok) return;
        const data = await res.json();

        const validGuideSections = Array.isArray(data.guideSections)
          ? data.guideSections.filter((section: any) => Array.isArray(section.steps) && section.steps.length > 0)
          : [];

        if (validGuideSections.length > 0) {
          setSections(validGuideSections.map((section: any, index: number) => ({
            title: section.title || `Mục ${index + 1}`,
            steps: section.steps,
          })));
        }

        if (Array.isArray(data.exchangeRates) && data.exchangeRates.length > 0) {
          setExchangeRates(normalizeRates(data.exchangeRates));
        }

        if (Array.isArray(data.faq)) {
          setFaqItems(data.faq);
        }
      } catch (err) {
        console.error('Failed to load guide settings', err);
      }
    }
    loadSettings();
  }, []);

  const handleSectionTitleChange = (sectionIndex: number, value: string) => {
    setSections((prev) => prev.map((section, index) => index === sectionIndex ? { ...section, title: value } : section));
  };

  const handleStepChange = (sectionIndex: number, stepIndex: number, value: string) => {
    setSections((prev) => prev.map((section, index) => {
      if (index !== sectionIndex) return section;
      return {
        ...section,
        steps: section.steps.map((step, idx) => idx === stepIndex ? { ...step, description: value } : step),
      };
    }));
  };

  const handleStepImageChange = (sectionIndex: number, stepIndex: number, value: string) => {
    setSections((prev) => prev.map((section, index) => {
      if (index !== sectionIndex) return section;
      return {
        ...section,
        steps: section.steps.map((step, idx) => idx === stepIndex ? { ...step, image: value } : step),
      };
    }));
  };

  const handleStepFileUpload = async (sectionIndex: number, stepIndex: number, event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const formData = new FormData();
    formData.append('file', file);

    try {
      const res = await fetch(apiUrl('/api/admin/upload'), {
        method: 'POST',
        body: formData,
      });
      if (!res.ok) {
        alert('Tải ảnh thất bại.');
        return;
      }

      const data = await res.json();
      const updatedUrl = data.url;

      setSections((prev) => {
        const nextSections = prev.map((section, index) => {
          if (index !== sectionIndex) return section;
          return {
            ...section,
            steps: section.steps.map((step, idx) => idx === stepIndex ? { ...step, image: updatedUrl } : step),
          };
        });

        fetch(apiUrl('/api/admin/settings'), {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ guideSections: nextSections, exchangeRates }),
        }).catch((err) => console.error('Failed to auto-save guide settings:', err));

        return nextSections;
      });

      alert('Tải ảnh minh họa thành công và đã lưu tự động.');
    } catch (err) {
      console.error(err);
      alert('Không thể kết nối server tải ảnh.');
    }
  };

  const handleRateChange = (index: number, field: 'points' | 'price', value: string) => {
    setExchangeRates((prev) => prev.map((rate, idx) => idx === index ? { ...rate, [field]: value } : rate));
  };

  const handleResetDefaults = () => {
    if (!confirm('Khôi phục nội dung hướng dẫn mặc định?')) return;
    setSections(defaultSections);
    setExchangeRates(defaultExchangeRates);
    setActiveTab(0);
  };

  const handleSave = async () => {
    try {
      const res = await fetch(apiUrl('/api/admin/settings'), {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ guideSections: sections, exchangeRates }),
      });
      if (res.ok) {
        alert('Đã lưu cấu hình Hướng dẫn & Thể lệ thành công.');
        return;
      }
    } catch (err) {
      console.error('Failed to save guide settings', err);
    }
    alert('Không thể lưu cấu hình Hướng dẫn & Thể lệ.');
  };

  const handleFaqChange = (index: number, field: 'question' | 'answer', value: string) => {
    setFaqItems((prev) => prev.map((item, idx) => idx === index ? { ...item, [field]: value } : item));
  };

  const handleAddFaq = () => {
    setFaqItems((prev) => [...prev, { question: '', answer: '' }]);
    setFaqOpenIdx(faqItems.length);
  };

  const handleDeleteFaq = (index: number) => {
    setFaqItems((prev) => prev.filter((_, idx) => idx !== index));
    setFaqOpenIdx(null);
  };

  const handleSaveFaq = async () => {
    setIsSavingFaq(true);
    try {
      const res = await fetch(apiUrl('/api/admin/settings'), {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ faq: faqItems }),
      });
      if (res.ok) {
        alert('Lưu FAQ thành công!');
        return;
      }
    } catch (err) {
      console.error('Failed to save FAQ', err);
    } finally {
      setIsSavingFaq(false);
    }
    alert('Không thể lưu FAQ.');
  };

  const isRateTab = activeTab === sections.length;
  const activeSection = sections[activeTab];

  return (
    <div className="space-y-5">
      <section className="flex flex-col gap-3 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm md:flex-row md:items-center md:justify-between">
        <div>
          <p className="text-[10px] font-black uppercase tracking-[0.16em] text-emerald-700">Quản lý giao diện</p>
          <h2 className="mt-1 text-xl font-black text-slate-900">Cấu hình Hướng dẫn & Thể lệ</h2>
          <p className="mt-1 max-w-3xl text-xs leading-5 text-slate-500">
            Chỉnh sửa các nhóm hướng dẫn bình chọn và bảng quy đổi điểm hiển thị ở trang Hướng dẫn & Thể lệ của website chính.
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <button
            onClick={handleResetDefaults}
            className="rounded-xl border border-slate-200 bg-white px-4 py-2 text-xs font-black text-slate-600 transition hover:border-emerald-600 hover:text-emerald-700"
          >
            Khôi phục mặc định
          </button>
          <button
            onClick={handleSave}
            className="rounded-xl bg-slate-900 px-4 py-2 text-xs font-black text-white shadow transition hover:bg-emerald-700"
          >
            Lưu toàn bộ
          </button>
        </div>
      </section>

      <section className="rounded-2xl border border-slate-200 bg-white shadow-sm">
        <div className="flex gap-1 overflow-x-auto border-b border-slate-100 px-3 pt-3">
          {sections.map((section, index) => (
            <button
              key={`${section.title}-${index}`}
              onClick={() => setActiveTab(index)}
              className={`whitespace-nowrap rounded-t-xl border-b-2 px-4 py-3 text-xs font-black transition ${
                activeTab === index
                  ? 'border-emerald-600 bg-emerald-50 text-emerald-700'
                  : 'border-transparent text-slate-500 hover:bg-slate-50 hover:text-emerald-700'
              }`}
            >
              {section.title}
            </button>
          ))}
          <button
            onClick={() => setActiveTab(sections.length)}
            className={`whitespace-nowrap rounded-t-xl border-b-2 px-4 py-3 text-xs font-black transition ${
              isRateTab
                ? 'border-emerald-600 bg-emerald-50 text-emerald-700'
                : 'border-transparent text-slate-500 hover:bg-slate-50 hover:text-emerald-700'
            }`}
          >
            Bảng quy đổi điểm
          </button>
        </div>

        <div className="p-5">
          {!isRateTab && activeSection ? (
            <div className="space-y-5">
              <label className="block space-y-1.5">
                <span className="text-[10px] font-black uppercase tracking-[0.14em] text-slate-500">Tiêu đề nhóm hướng dẫn</span>
                <input
                  value={activeSection.title}
                  onChange={(event) => handleSectionTitleChange(activeTab, event.target.value)}
                  className="h-10 w-full rounded-xl border border-slate-200 bg-slate-50 px-3 text-sm font-bold text-slate-900 outline-none focus:border-emerald-600 focus:bg-white"
                />
              </label>

              <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
                {activeSection.steps.map((step, stepIndex) => (
                  <div key={`${step.number}-${stepIndex}`} className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
                    <div className="mb-3 flex items-center justify-between">
                      <span className="rounded-full border border-emerald-200 bg-emerald-50 px-3 py-1 text-[11px] font-black uppercase tracking-[0.14em] text-emerald-700">
                        Bước {step.number}
                      </span>
                    </div>

                    <label className="block space-y-1.5">
                      <span className="text-[10px] font-black uppercase tracking-[0.14em] text-slate-500">Nội dung bước</span>
                      <textarea
                        value={step.description}
                        onChange={(event) => handleStepChange(activeTab, stepIndex, event.target.value)}
                        className="h-24 w-full resize-none rounded-xl border border-slate-200 bg-white p-3 text-xs font-semibold leading-5 text-slate-800 outline-none focus:border-emerald-600"
                      />
                    </label>

                    <div className="mt-4 space-y-2">
                      <span className="block text-[10px] font-black uppercase tracking-[0.14em] text-slate-500">Ảnh minh họa</span>
                      <div className="aspect-[431/244] overflow-hidden rounded-xl border border-slate-200 bg-white">
                        {step.image ? (
                          <img src={formatAssetUrl(step.image)} alt={`Bước ${step.number}`} className="h-full w-full object-cover" />
                        ) : (
                          <div className="grid h-full place-items-center text-xs font-semibold text-slate-400">Chưa có ảnh</div>
                        )}
                      </div>
                      <input
                        value={step.image}
                        onChange={(event) => handleStepImageChange(activeTab, stepIndex, event.target.value)}
                        className="h-9 w-full rounded-xl border border-slate-200 bg-white px-3 text-xs font-semibold text-slate-800 outline-none focus:border-emerald-600"
                        placeholder="Đường dẫn ảnh"
                      />
                      <input
                        type="file"
                        accept="image/*"
                        onChange={(event) => handleStepFileUpload(activeTab, stepIndex, event)}
                        className="w-full text-xs text-slate-500 file:mr-3 file:rounded-lg file:border-0 file:bg-slate-900 file:px-3 file:py-2 file:text-xs file:font-black file:text-white hover:file:bg-emerald-700"
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <div className="space-y-5">
              <div>
                <h3 className="text-base font-black text-slate-900">Bảng quy đổi điểm</h3>
                <p className="mt-1 text-xs text-slate-500">Các giá trị này hiển thị ở trang Hướng dẫn & Thể lệ công khai.</p>
              </div>

              <div className="overflow-hidden rounded-2xl border border-slate-200">
                <table className="w-full border-collapse text-left">
                  <thead>
                    <tr className="border-b border-slate-200 bg-slate-50 text-[10px] font-black uppercase tracking-[0.14em] text-slate-500">
                      <th className="px-5 py-3">Gói bình chọn (Điểm)</th>
                      <th className="px-5 py-3">Giá trị quy đổi (VND - Nhập 0 nếu Miễn phí)</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 text-xs">
                    {exchangeRates.map((rate, index) => (
                      <tr key={index} className="hover:bg-emerald-50/40">
                        <td className="px-5 py-3">
                          <div className="flex items-center gap-2 max-w-[220px]">
                            <input
                              type="number"
                              value={rate.points}
                              onChange={(event) => handleRateChange(index, 'points', event.target.value)}
                              className="h-9 w-full rounded-xl border border-slate-200 bg-white px-3 font-bold text-slate-900 outline-none focus:border-emerald-600"
                            />
                            <span className="text-xs font-bold text-slate-500 shrink-0">Điểm</span>
                          </div>
                        </td>
                        <td className="px-5 py-3">
                          <div className="flex items-center gap-2 max-w-[320px]">
                            <input
                              type="number"
                              value={rate.price}
                              onChange={(event) => handleRateChange(index, 'price', event.target.value)}
                              className="h-9 w-full rounded-xl border border-slate-200 bg-white px-3 font-semibold text-slate-800 outline-none focus:border-emerald-600"
                              placeholder="Nhập 0 nếu Miễn phí"
                            />
                            <span className="text-xs font-bold text-slate-500 shrink-0">VND</span>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      </section>

      {/* ─── FAQ Section ─── */}
      <section className="admin-card p-6 space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-[18px] font-bold text-slate-900 flex items-center gap-2">
              <span className="inline-flex h-7 w-7 items-center justify-center rounded-lg bg-blue-50 text-blue-600">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="h-4 w-4">
                  <circle cx="12" cy="12" r="10"/><path d="M9.09 9a3 3 0 015.83 1c0 2-3 3-3 3"/><line x1="12" y1="17" x2="12.01" y2="17"/>
                </svg>
              </span>
              Câu hỏi thường gặp (FAQ)
            </h2>
            <p className="mt-1 text-xs text-slate-500">Hiển thị trên trang Hướng dẫn công khai của website.</p>
          </div>
          <div className="flex gap-2">
            <button
              type="button"
              onClick={handleAddFaq}
              className="flex items-center gap-1.5 rounded-xl bg-emerald-600 px-3 py-2 text-xs font-bold text-white transition hover:bg-emerald-700"
            >
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" className="h-3.5 w-3.5">
                <line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/>
              </svg>
              Thêm câu hỏi
            </button>
            <button
              type="button"
              onClick={handleSaveFaq}
              disabled={isSavingFaq}
              className="flex items-center gap-1.5 rounded-xl bg-blue-600 px-3 py-2 text-xs font-bold text-white transition hover:bg-blue-700 disabled:opacity-60"
            >
              {isSavingFaq ? 'Đang lưu...' : 'Lưu FAQ'}
            </button>
          </div>
        </div>

        {faqItems.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-slate-300 py-10 text-center">
            <p className="text-sm text-slate-400">Chưa có câu hỏi nào. Nhấn "Thêm câu hỏi" để bắt đầu.</p>
          </div>
        ) : (
          <div className="space-y-2">
            {faqItems.map((item, index) => (
              <div key={index} className="overflow-hidden rounded-2xl border border-slate-200">
                {/* Accordion header */}
                <button
                  type="button"
                  onClick={() => setFaqOpenIdx(faqOpenIdx === index ? null : index)}
                  className="flex w-full items-center justify-between gap-3 bg-slate-50 px-4 py-3 text-left transition hover:bg-slate-100"
                >
                  <span className="flex-1 text-[13px] font-semibold text-slate-800 truncate">
                    {item.question || `Câu hỏi #${index + 1}`}
                  </span>
                  <div className="flex items-center gap-2 shrink-0">
                    <button
                      type="button"
                      onClick={(e) => { e.stopPropagation(); handleDeleteFaq(index); }}
                      className="rounded-lg p-1 text-red-400 transition hover:bg-red-50 hover:text-red-600"
                      title="Xóa câu hỏi"
                    >
                      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="h-4 w-4">
                        <polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14H6L5 6"/><path d="M10 11v6M14 11v6"/><path d="M9 6V4h6v2"/>
                      </svg>
                    </button>
                    <svg
                      viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"
                      className={`h-4 w-4 text-slate-500 transition-transform duration-200 ${faqOpenIdx === index ? 'rotate-180' : ''}`}
                    >
                      <polyline points="6 9 12 15 18 9"/>
                    </svg>
                  </div>
                </button>
                {/* Accordion body */}
                {faqOpenIdx === index && (
                  <div className="space-y-3 border-t border-slate-200 bg-white px-4 py-4">
                    <div>
                      <label className="text-[11px] font-bold uppercase tracking-wider text-slate-500">Câu hỏi</label>
                      <input
                        value={item.question}
                        onChange={(e) => handleFaqChange(index, 'question', e.target.value)}
                        className="mt-1.5 h-9 w-full rounded-xl border border-slate-200 bg-white px-3 text-sm font-medium text-slate-800 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                        placeholder="Nhập nội dung câu hỏi..."
                      />
                    </div>
                    <div>
                      <label className="text-[11px] font-bold uppercase tracking-wider text-slate-500">Câu trả lời</label>
                      <textarea
                        value={item.answer}
                        onChange={(e) => handleFaqChange(index, 'answer', e.target.value)}
                        rows={3}
                        className="mt-1.5 w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm font-medium text-slate-800 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100 resize-none"
                        placeholder="Nhập câu trả lời..."
                      />
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
