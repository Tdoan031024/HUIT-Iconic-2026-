'use client';

import React, { useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import { apiUrl } from '../api';

interface Step {
  number: string;
  description: string;
  image: string;
}

interface SectionConfig {
  title: string;
  steps: Step[];
}

interface ExchangeRate {
  points: string;
  price: string;
}

const defaultSections: SectionConfig[] = [
  {
    title: 'Bình chọn miễn phí mỗi ngày',
    steps: [
      {
        number: '01',
        description: 'Tạo tài khoản mới hoặc đăng nhập để bắt đầu bình chọn.',
        image: '/original_assets/imagefca6.png',
      },
      {
        number: '02',
        description: 'Mỗi tài khoản có 2 lượt bình chọn miễn phí mỗi ngày cho toàn bộ hệ thống.',
        image: '/original_assets/imagef1be.png',
      },
      {
        number: '03',
        description: 'Chọn dự án bạn muốn ủng hộ từ trang chủ, bảng xếp hạng hoặc trang chi tiết dự án.',
        image: '/original_assets/image81d3.png',
      },
      {
        number: '04',
        description: 'Mỗi lần xác nhận sẽ cộng 1 lượt bình chọn cho dự án. Khi dùng hết 2 lượt, bạn cần chờ đến ngày hôm sau.',
        image: '/original_assets/image20da.png',
      },
    ],
  },
];

const defaultExchangeRates: ExchangeRate[] = [
  { points: '1 lượt', price: 'Miễn phí (2 lượt / ngày)' },
];

const faqItems = [
  {
    question: 'Bình chọn miễn phí có giới hạn không?',
    answer: 'Có. Mỗi tài khoản được 2 lượt bình chọn miễn phí mỗi ngày cho toàn bộ dự án trong hệ thống. Dùng hết 2 lượt thì cần chờ sang ngày hôm sau.',
  },
  {
    question: 'Tôi có thể bình chọn cho nhiều dự án không?',
    answer: 'Có, nhưng tổng số lượt miễn phí mỗi ngày vẫn chỉ là 2. Bạn có thể dùng cả 2 lượt cho một dự án hoặc chia ra cho các dự án khác nhau.',
  },
  {
    question: 'Tôi quên mật khẩu thì phải làm gì?',
    answer: 'Bạn có thể đăng nhập bằng Google hoặc liên hệ ban tổ chức qua email iec@huit.edu.vn để được hỗ trợ khôi phục tài khoản.',
  },
];

function hasEncodingArtifacts(value: any): boolean {
  if (typeof value !== 'string') return false;
  return /Ã|Â|Ä|Å|Æ|â|ð|�/.test(value);
}

function normalizeSections(rawSections: any[]): SectionConfig[] {
  const stepSections = rawSections.filter((section) => Array.isArray(section.steps) && section.steps.length > 0);
  const filtered = stepSections.filter((section: any) => {
    const title = String(section.title || '').toLowerCase();
    return !title.includes('thanh toán') && !title.includes('sepay');
  });

  if (filtered.length === 0) return defaultSections;
  if (
    filtered.some((section: any) =>
      hasEncodingArtifacts(section.title) ||
      section.steps.some((step: any) => hasEncodingArtifacts(step.description)),
    )
  ) {
    return defaultSections;
  }

  return filtered.map((section, index) => ({
    title: section.title || `Mục ${index + 1}`,
    steps: section.steps.map((step: any, stepIndex: number) => ({
      ...step,
      image: step.image || defaultSections[index]?.steps?.[stepIndex]?.image || defaultSections[0]?.steps?.[stepIndex]?.image || '',
    })),
  }));
}

function extractDigits(value: any): string {
  if (value === undefined || value === null) return '';
  const raw = String(value).trim();
  const match = raw.match(/\d+/g);
  if (!match) {
    return raw.toLowerCase().includes('miễn phí') ? '0' : '';
  }
  return match.join('');
}

function normalizeRates(rawRates: any[]): ExchangeRate[] {
  if (
    rawRates.some((rate) =>
      hasEncodingArtifacts(rate.label) ||
      hasEncodingArtifacts(rate.points) ||
      hasEncodingArtifacts(rate.price) ||
      hasEncodingArtifacts(rate.priceLabel),
    )
  ) {
    return defaultExchangeRates;
  }

  const rates = rawRates
    .map((rate) => {
      const pointsNumber = extractDigits(rate.points || rate.label);
      const priceNumber = extractDigits(rate.price || rate.priceLabel);
      const points = pointsNumber !== '' ? `${Number(pointsNumber).toLocaleString('vi-VN')} điểm` : '';
      const price =
        priceNumber !== ''
          ? Number(priceNumber) > 0
            ? `${Number(priceNumber).toLocaleString('vi-VN')} VND`
            : 'Miễn phí (2 lượt / ngày)'
          : '';

      return { points, price };
    })
    .filter((rate) => rate.points && rate.price);

  const freeRates = rates.filter((rate) => rate.price.toLowerCase().includes('miễn phí') || rate.price === '0 VND');
  return freeRates.length > 0 ? freeRates : defaultExchangeRates;
}

function useInView(threshold = 0.15) {
  const ref = useRef<HTMLDivElement>(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setVisible(true);
          observer.disconnect();
        }
      },
      { threshold },
    );

    if (ref.current) observer.observe(ref.current);
    return () => observer.disconnect();
  }, [threshold]);

  return { ref, visible };
}

const sectionColors = [
  { gradient: 'linear-gradient(135deg, #0A2FFF, #79BCC2)', icon: '❤️', tag: 'Miễn phí' },
];

export default function TheLePage() {
  const [sections, setSections] = useState<SectionConfig[]>(defaultSections);
  const [exchangeRates, setExchangeRates] = useState<ExchangeRate[]>(defaultExchangeRates);
  const [faqList, setFaqList] = useState<any[]>(faqItems);
  const [activeTab, setActiveTab] = useState(0);
  const [openFaq, setOpenFaq] = useState<number | null>(null);
  const heroSection = useInView(0.2);
  const stepsSection = useInView(0.1);
  const notesSection = useInView(0.1);
  const faqSection = useInView(0.1);

  useEffect(() => {
    async function loadSettings() {
      try {
        const response = await fetch(apiUrl('/api/settings'));
        if (!response.ok) return;

        const data = await response.json();
        if (Array.isArray(data.guideSections) && data.guideSections.length > 0) {
          setSections(normalizeSections(data.guideSections));
        }
        if (Array.isArray(data.exchangeRates) && data.exchangeRates.length > 0) {
          setExchangeRates(normalizeRates(data.exchangeRates));
        }
        if (Array.isArray(data.faq) && data.faq.length > 0) {
          setFaqList(data.faq);
        }
      } catch {}
    }

    loadSettings();
  }, []);

  return (
    <>
      <style>{`
        .the-le-page { background: var(--site-bg); }
        @keyframes fadeUp { from{opacity:0;transform:translateY(24px)}to{opacity:1;transform:translateY(0)} }
        .fade-up { animation: fadeUp 0.7s cubic-bezier(0.16,1,0.3,1) both; }
        .fade-up-d1 { animation-delay: 100ms; }
        .fade-up-d2 { animation-delay: 200ms; }
        .fade-up-d3 { animation-delay: 300ms; }
        .tab-btn { transition: all 0.25s ease; }
      `}</style>

      <main className="the-le-page flex-1 min-h-screen pb-20" style={{ background: 'var(--site-bg)' }}>
        <section ref={heroSection.ref} className="subpage-hero">
          <div className="subpage-hero-bg" />
          <div className="subpage-hero-content">
            <div className="subpage-breadcrumb">
              <Link href="/">Trang chủ</Link>
              <svg width="12" height="12" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                <polyline points="9 18 15 12 9 6" />
              </svg>
              <span>Hướng dẫn & Thể lệ</span>
            </div>

            <div
              className={`inline-flex items-center gap-2 px-4 py-2 rounded-full text-xs font-bold uppercase tracking-widest mb-4 ${heroSection.visible ? 'fade-up' : 'opacity-0'}`}
              style={{
                background: 'color-mix(in srgb, var(--site-primary) 12%, var(--site-card))',
                color: 'var(--site-primary)',
                border: '1px solid color-mix(in srgb, var(--site-primary) 25%, transparent)',
              }}
            >
              📖 Cẩm nang bình chọn
            </div>

            <h1 className={heroSection.visible ? 'fade-up fade-up-d1' : 'opacity-0'}>Hướng dẫn & Thể lệ</h1>
            <p className={heroSection.visible ? 'fade-up fade-up-d2' : 'opacity-0'}>
              Tất cả thông tin về cách bình chọn miễn phí, quy định sử dụng lượt vote và các câu hỏi thường gặp đều được tổng hợp tại đây.
            </p>

            <div className={`flex flex-wrap gap-3 justify-center mt-6 ${heroSection.visible ? 'fade-up fade-up-d3' : 'opacity-0'}`}>
              {['Bình chọn miễn phí ↓', 'Bảng điểm ↓', 'FAQ ↓'].map((label, index) => (
                <a
                  key={index}
                  href={['#free-vote', '#bang-diem', '#faq'][index]}
                  className="px-4 py-2 rounded-full text-sm font-semibold transition hover:opacity-80"
                  style={{ border: '1px solid var(--site-line)', background: 'var(--site-card)', color: 'var(--site-text)' }}
                >
                  {label}
                </a>
              ))}
            </div>

            <div className="subpage-divider" />
          </div>
        </section>

        <div className="max-w-[1140px] mx-auto px-4 sm:px-6 py-12">
          {sections.length > 1 && (
            <div className="flex flex-wrap gap-3 justify-center mb-10" ref={stepsSection.ref} role="tablist" aria-label="Hình thức bình chọn">
              {sections.map((section, index) => (
                <button
                  key={index}
                  onClick={() => setActiveTab(index)}
                  onKeyDown={(event) => {
                    if (!['ArrowLeft', 'ArrowRight', 'Home', 'End'].includes(event.key)) return;
                    event.preventDefault();
                    const tabs = Array.from(event.currentTarget.parentElement?.querySelectorAll<HTMLButtonElement>('[role="tab"]') || []);
                    const nextIndex =
                      event.key === 'Home'
                        ? 0
                        : event.key === 'End'
                          ? tabs.length - 1
                          : event.key === 'ArrowRight'
                            ? (index + 1) % tabs.length
                            : (index - 1 + tabs.length) % tabs.length;
                    setActiveTab(nextIndex);
                    tabs[nextIndex]?.focus();
                  }}
                  id={`vote-guide-tab-${index}`}
                  role="tab"
                  aria-selected={activeTab === index}
                  aria-controls={index === 0 ? 'free-vote' : 'sepay-vote'}
                  tabIndex={activeTab === index ? 0 : -1}
                  className="tab-btn flex items-center gap-2 px-6 py-3 rounded-2xl text-sm font-bold"
                  style={
                    activeTab === index
                      ? {
                          background: sectionColors[index % sectionColors.length].gradient,
                          color: '#fff',
                          boxShadow: '0 8px 24px rgba(10,47,255,0.25)',
                        }
                      : {
                          background: 'var(--site-card)',
                          color: 'var(--site-text)',
                          border: '1px solid var(--site-line)',
                        }
                  }
                >
                  <span>{sectionColors[index % sectionColors.length].icon}</span>
                  {section.title}
                </button>
              ))}
            </div>
          )}

          {sections.map((section, sectionIndex) => (
            <div
              key={`sec-${sectionIndex}`}
              id={sectionIndex === 0 ? 'free-vote' : 'sepay-vote'}
              role="tabpanel"
              aria-labelledby={`vote-guide-tab-${sectionIndex}`}
              hidden={sections.length > 1 && activeTab !== sectionIndex}
            >
              <div className="mb-8 flex items-center gap-3">
                <div className="step-num-circle" suppressHydrationWarning style={{ background: sectionColors[sectionIndex % sectionColors.length].gradient, width: 48, height: 48, fontSize: 20 }}>
                  {sectionColors[sectionIndex % sectionColors.length].icon}
                </div>
                <div>
                  <div
                    style={{
                      fontSize: 11,
                      fontWeight: 700,
                      textTransform: 'uppercase',
                      letterSpacing: '0.12em',
                      color: 'var(--site-primary)',
                    }}
                  >
                    {sectionColors[sectionIndex % sectionColors.length].tag}
                  </div>
                  <h2 style={{ fontSize: 'clamp(18px, 2.5vw, 26px)', fontWeight: 900, color: 'var(--site-text)', margin: 0 }}>
                    {section.title}
                  </h2>
                </div>
              </div>

              <div className="step-flow">
                {section.steps.map((step, index) => (
                  <div key={`step-${index}`} className="step-card-h" style={{ animationDelay: `${index * 80}ms` }}>
                    <div className="step-num-circle" style={{ background: sectionColors[sectionIndex % sectionColors.length].gradient }}>
                      {parseInt(step.number, 10)}
                    </div>
                    <div className={`step-card-info ${!step.image ? 'md:col-span-2' : ''}`}>
                      <h4 style={{ fontSize: 'clamp(20px, 2.2vw, 25px)', fontWeight: 900, marginBottom: 6 }}>Bước {step.number}</h4>
                      <p style={{ fontSize: 'clamp(15px, 1.5vw, 18px)', lineHeight: 1.7, fontWeight: 500 }}>{step.description}</p>
                    </div>
                    {step.image && (
                      <div className="step-screenshot">
                        <img src={step.image} alt={`Bước ${step.number}`} loading="lazy" />
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          ))}


          <div id="faq" ref={faqSection.ref} className="mt-20">
            <div className="flex items-center gap-3 mb-8">
              <div className="step-num-circle" suppressHydrationWarning style={{ background: 'linear-gradient(135deg, #8b5cf6, #c084fc)', fontSize: 20 }}>❓</div>
              <div>
                <div
                  style={{
                    fontSize: 11,
                    fontWeight: 700,
                    textTransform: 'uppercase',
                    letterSpacing: '0.12em',
                    color: 'var(--site-primary)',
                  }}
                >
                  Câu hỏi thường gặp
                </div>
                <h2 style={{ fontSize: 'clamp(18px, 2.5vw, 26px)', fontWeight: 900, color: 'var(--site-text)', margin: 0 }}>
                  Giải đáp thắc mắc
                </h2>
              </div>
            </div>

            <div className={`flex flex-col gap-3 ${faqSection.visible ? 'fade-up' : 'opacity-0'}`}>
              {faqList.map((item, index) => (
                <div key={index} className={`faq-item ${openFaq === index ? 'open' : ''}`}>
                  <button
                    className="faq-question"
                    onClick={() => setOpenFaq(openFaq === index ? null : index)}
                    aria-expanded={openFaq === index}
                    aria-controls={`faq-answer-${index}`}
                  >
                    <span>{item.question}</span>
                    <span className="faq-icon" aria-hidden="true">
                      <svg width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                        <line x1="12" y1="5" x2="12" y2="19" />
                        <line x1="5" y1="12" x2="19" y2="12" />
                      </svg>
                    </span>
                  </button>
                  <div id={`faq-answer-${index}`} className="faq-answer" aria-hidden={openFaq !== index}>
                    {item.answer}
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div
            className="mt-20 rounded-2xl overflow-hidden"
            style={{ background: 'linear-gradient(135deg, #0A2FFF 0%, #79BCC2 100%)', padding: '48px 32px', textAlign: 'center' }}
          >
            <div style={{ fontSize: 40, marginBottom: 12 }}>🚀</div>
            <h3 style={{ fontSize: 'clamp(22px, 3vw, 32px)', fontWeight: 900, color: '#fff', margin: '0 0 8px' }}>
              Sẵn sàng bình chọn?
            </h3>
            <p style={{ color: 'rgba(255,255,255,0.8)', fontSize: 15, maxWidth: 480, margin: '0 auto 24px' }}>
              Đăng nhập để sử dụng 2 lượt bình chọn miễn phí mỗi ngày và ủng hộ dự án bạn yêu thích.
            </p>
            <div style={{ display: 'flex', gap: 12, justifyContent: 'center', flexWrap: 'wrap' }}>
              <Link href="/bang-xep-hang" className="hero-btn-primary">
                🏆 Xem Bảng Xếp Hạng
              </Link>
              <Link href="/dang-nhap" className="rules-login-cta">
                Đăng nhập bình chọn →
              </Link>
            </div>
          </div>
        </div>
      </main>
    </>
  );
}
