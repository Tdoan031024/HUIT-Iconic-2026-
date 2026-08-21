'use client';

/**
 * AI Assistant / Chatbot Component — Public layout widget.
 * Features a floating button, suggestions chips, typing indicators,
 * and smart localized answers based on contest regulations, FAQs, and contact info.
 */

import React, { useState, useEffect, useRef } from 'react';
import Link from 'next/link';

interface Message {
  id: string;
  sender: 'ai' | 'user';
  text: string;
  timestamp: Date;
  links?: Array<{ label: string; url: string }>;
}

const FAQ_DATABASE = [
  {
    keywords: ['khoi nghiep', 'huit startup', 'la gi', 'gioi thieu', 'cuoc thi'],
    answer: 'HUIT Startup 2026 là cuộc thi Khởi nghiệp Sáng tạo lần thứ VII do Trường Đại học Công Thương TP.HCM (HUIT) tổ chức. Chủ đề năm nay là "Đổi mới sáng tạo hướng tới mục tiêu phát triển bền vững" nhằm tìm kiếm, ươm tạo các ý tưởng khởi nghiệp sáng tạo giải quyết vấn đề thực tế.',
    links: [{ label: 'Xem chi tiết giới thiệu', url: '/gioi-thieu' }]
  },
  {
    keywords: ['binh chon', 'vote', 'diem', 'luot vote', 'cach vote', 'mien phi'],
    answer: 'Mỗi tài khoản đăng nhập được cấp 2 lượt bình chọn MIỄN PHÍ mỗi ngày. Để thực hiện bình chọn, bạn cần: 1. Đăng nhập tài khoản. 2. Truy cập trang chi tiết dự án từ Bảng xếp hạng. 3. Nhấn "Bình chọn miễn phí".',
    links: [
      { label: 'Bảng xếp hạng dự án', url: '/bang-xep-hang' },
      { label: 'Đăng nhập ngay', url: '/dang-nhap' }
    ]
  },
  {
    keywords: ['lich trinh', 'thoi gian', 'han chot', 'cac vong', 'khi nao'],
    answer: 'Lịch trình cuộc thi gồm các mốc chính: \n- Nhận hồ sơ: 15/05 - 15/06/2026.\n- Định hướng & Tập huấn: 17/06/2026.\n- Vòng loại & Bình chọn: tháng 07/2026.\n- Chung kết & Trao giải: tháng 08/2026.',
    links: [{ label: 'Xem lịch trình chi tiết', url: '/thoi-gian' }]
  },
  {
    keywords: ['dang ky', 'tham gia', 'doi tuong', 'ai duoc tham gia'],
    answer: 'Đối tượng dự thi gồm: Bảng A (Học sinh THPT, GDTX); Bảng B (Sinh viên, học viên Đại học/Cao đẳng); Bảng C (Doanh nghiệp, HTX, hộ kinh doanh vừa và nhỏ). Bạn đăng ký tham gia trực tuyến qua link đăng ký chính thức của Ban tổ chức.',
    links: [{ label: 'Đọc thể lệ chi tiết', url: '/the-le' }]
  },
  {
    keywords: ['lien he', 'ban to chuc', 'ho tro', 'hotline', 'email', 'zalo'],
    answer: 'Bạn có thể liên hệ Ban Tổ chức qua:\n- TT Đổi mới sáng tạo và Khởi nghiệp HUIT.\n- Địa chỉ: 140 Lê Trọng Tấn, P. Tây Thạnh, Q. Tân Phú, TP.HCM.\n- Email: startup@huit.edu.vn\n- Zalo Hỗ trợ kỹ thuật.',
    links: [
      { label: 'Zalo Hỗ trợ', url: 'https://zalo.me/4418938306145458374' },
      { label: 'Gửi Email', url: 'mailto:startup@huit.edu.vn' }
    ]
  },
  {
    keywords: ['giai thuong', 'co cau giai', 'bao nhieu tien'],
    answer: 'Tổng giá trị giải thưởng cuộc thi HUIT Startup 2026 lên đến 05 TỶ ĐỒNG, bao gồm tiền mặt, các gói mentor/cố vấn chuyên sâu, gói hỗ trợ sở hữu trí tuệ, nền tảng ERP Platform và cơ hội ươm tạo kết nối đầu tư thực tế.',
    links: [{ label: 'Xem cơ cấu giải thưởng', url: '/gioi-thieu#giai-thuong' }]
  }
];

const SUGGESTIONS = [
  'HUIT Startup 2026 là gì?',
  'Cách bình chọn miễn phí?',
  'Lịch trình cuộc thi?',
  'Liên hệ Ban Tổ chức?'
];

export function AIChatbot() {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputValue, setInputValue] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Initialize with a welcome message
  useEffect(() => {
    if (messages.length === 0) {
      setMessages([
        {
          id: 'welcome',
          sender: 'ai',
          text: 'Xin chào! Tôi là Trợ lý AI của HUIT Startup 2026. Tôi có thể giúp bạn giải đáp các thông tin về thể lệ cuộc thi, lịch trình, cách thức bình chọn dự án hoặc thông tin liên hệ. Hãy hỏi tôi bất cứ điều gì nhé! 👇',
          timestamp: new Date()
        }
      ]);
    }
  }, [messages.length]);

  useEffect(() => {
    if (isOpen) {
      scrollToBottom();
    }
  }, [isOpen, messages, isTyping]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const normalizeText = (text: string) => {
    return text
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .replace(/[đĐ]/g, 'd');
  };

  const handleSendMessage = async (text: string) => {
    if (!text.trim()) return;

    // 1. Add user message
    const userMsg: Message = {
      id: `user-${Date.now()}`,
      sender: 'user',
      text,
      timestamp: new Date()
    };
    setMessages((prev) => [...prev, userMsg]);
    setInputValue('');
    setIsTyping(true);

    // Track analytics event if GA is active
    if (typeof window !== 'undefined' && (window as any).gtag) {
      (window as any).gtag('event', 'ai_chat_query', { query: text });
    }

    // 2. Simulate AI response delay
    await new Promise((resolve) => setTimeout(resolve, 800));

    // 3. Find matching response
    const queryNorm = normalizeText(text);
    let matchedAnswer = null;

    for (const item of FAQ_DATABASE) {
      const matchScore = item.keywords.filter((kw) => queryNorm.includes(kw)).length;
      if (matchScore > 0) {
        matchedAnswer = item;
        break;
      }
    }

    let replyText = '';
    let replyLinks: Message['links'] = undefined;

    if (matchedAnswer) {
      replyText = matchedAnswer.answer;
      replyLinks = matchedAnswer.links;
    } else {
      replyText = 'Tôi xin lỗi, câu hỏi này nằm ngoài phạm vi hiểu biết hiện tại của tôi về cuộc thi. Bạn có thể xem thêm ở phần Thể lệ & Hướng dẫn hoặc liên hệ trực tiếp đội ngũ Ban Tổ chức qua Zalo/Email để được hỗ trợ trực tiếp nhé!';
      replyLinks = [
        { label: 'Xem Thể lệ', url: '/the-le' },
        { label: 'Hỗ trợ Zalo', url: 'https://zalo.me/4418938306145458374' }
      ];
    }

    const aiMsg: Message = {
      id: `ai-${Date.now()}`,
      sender: 'ai',
      text: replyText,
      timestamp: new Date(),
      links: replyLinks
    };

    setMessages((prev) => [...prev, aiMsg]);
    setIsTyping(false);
  };

  return (
    <div className="fixed bottom-6 right-6 z-[1002] font-sans">
      {/* Floating button */}
      {!isOpen && (
        <button
          onClick={() => setIsOpen(true)}
          className="flex h-14 w-14 items-center justify-center rounded-full bg-gradient-to-r from-[#0f766e] to-[#0ea5e9] text-white shadow-[0_4px_20px_rgba(15,118,110,0.4)] transition hover:scale-105 active:scale-95 duration-200 animate-pulse cursor-pointer"
          title="Trợ lý AI"
          aria-label="Mở Trợ lý AI"
        >
          <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.2">
            <path strokeLinecap="round" strokeLinejoin="round" d="M9.813 15.904L9 21l8.982-5.03c1.503-1.32 2.518-3.23 2.518-5.385C20.5 6.228 16.228 2 11 2S1.5 6.228 1.5 11.414c0 2.247.915 4.29 2.392 5.753L4 21l.813-5.096A10.45 10.45 0 0011 17c.507 0 1.01-.038 1.504-.112" />
          </svg>
          <span className="absolute -top-1 -right-1 flex h-4.5 w-4.5 items-center justify-center rounded-full bg-red-500 text-[9px] font-black text-white">1</span>
        </button>
      )}

      {/* Chat Window */}
      {isOpen && (
        <div className="flex h-[520px] w-[360px] flex-col rounded-2xl border border-[var(--site-line)] bg-[var(--site-card)] text-[var(--site-text)] shadow-[0_12px_40px_rgba(0,0,0,0.25)] animate-in fade-in slide-in-from-bottom-5 duration-200">
          {/* Chat Header */}
          <div className="flex items-center justify-between rounded-t-2xl bg-gradient-to-r from-[#0f766e] to-[#0ea5e9] p-4 text-white">
            <div className="flex items-center gap-2.5">
              <div className="flex h-9 w-9 items-center justify-center rounded-full bg-white/10">
                <svg className="h-5 w-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
              </div>
              <div>
                <h3 className="text-sm font-bold leading-tight">Trợ lý AI HUIT</h3>
                <span className="text-[10px] text-white/70 font-semibold flex items-center gap-1">
                  <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 inline-block animate-ping" />
                  Sẵn sàng phản hồi
                </span>
              </div>
            </div>
            <button
              onClick={() => setIsOpen(false)}
              className="rounded-full p-1 text-white/80 hover:bg-white/10 hover:text-white transition"
              aria-label="Đóng chat"
            >
              <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5">
                <line x1="18" y1="6" x2="6" y2="18" />
                <line x1="6" y1="6" x2="18" y2="18" />
              </svg>
            </button>
          </div>

          {/* Messages Body */}
          <div className="flex-1 overflow-y-auto p-4 space-y-3.5 bg-slate-50/50">
            {messages.map((msg) => (
              <div
                key={msg.id}
                className={`flex flex-col max-w-[85%] ${
                  msg.sender === 'user' ? 'ml-auto items-end' : 'mr-auto items-start'
                }`}
              >
                <div
                  className={`rounded-2xl px-3.5 py-2.5 text-xs leading-relaxed whitespace-pre-line ${
                    msg.sender === 'user'
                      ? 'bg-gradient-to-br from-[#0f766e] to-[#115e59] text-white rounded-tr-none'
                      : 'bg-white border border-[var(--site-line)] text-[var(--site-text)] rounded-tl-none shadow-sm'
                  }`}
                >
                  {msg.text}
                </div>
                {msg.links && (
                  <div className="mt-1.5 flex flex-wrap gap-1.5">
                    {msg.links.map((link, idx) => (
                      <Link
                        key={idx}
                        href={link.url}
                        className="rounded-full bg-[#0f766e]/10 border border-[#0f766e]/20 px-3 py-1 text-[10px] font-bold text-[#0f766e] hover:bg-[#0f766e]/20 transition"
                      >
                        {link.label}
                      </Link>
                    ))}
                  </div>
                )}
                <span className="mt-1 text-[9px] text-[var(--site-muted)] font-mono">
                  {msg.timestamp.toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' })}
                </span>
              </div>
            ))}

            {isTyping && (
              <div className="flex items-center gap-1.5 mr-auto max-w-[85%] rounded-2xl bg-white border border-[var(--site-line)] px-3.5 py-3 shadow-sm">
                <span className="h-1.5 w-1.5 rounded-full bg-slate-400 animate-bounce" style={{ animationDelay: '0ms' }} />
                <span className="h-1.5 w-1.5 rounded-full bg-slate-400 animate-bounce" style={{ animationDelay: '150ms' }} />
                <span className="h-1.5 w-1.5 rounded-full bg-slate-400 animate-bounce" style={{ animationDelay: '300ms' }} />
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Quick Suggestions */}
          {messages.length < 3 && (
            <div className="px-4 py-2 border-t border-[var(--site-line)] bg-slate-50/20">
              <p className="text-[9px] font-bold text-[var(--site-muted)] uppercase tracking-wider mb-1.5">Gợi ý câu hỏi:</p>
              <div className="flex flex-wrap gap-1.5">
                {SUGGESTIONS.map((sug, idx) => (
                  <button
                    key={idx}
                    onClick={() => handleSendMessage(sug)}
                    className="rounded-lg bg-white border border-slate-200 px-2.5 py-1 text-[10px] text-slate-600 hover:border-[#0f766e] hover:text-[#0f766e] transition font-semibold text-left"
                  >
                    {sug}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Input Box */}
          <div className="border-t border-[var(--site-line)] p-3 bg-white rounded-b-2xl">
            <form
              onSubmit={(e) => {
                e.preventDefault();
                handleSendMessage(inputValue);
              }}
              className="flex items-center gap-2 rounded-xl border border-[var(--site-line)] bg-[var(--site-soft)] px-3 py-2 focus-within:border-[var(--site-primary)] transition"
            >
              <input
                type="text"
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                placeholder="Hỏi trợ lý AI về cuộc thi..."
                className="min-w-0 flex-1 bg-transparent text-xs text-[var(--site-text)] placeholder-[var(--site-muted)] outline-none"
                aria-label="Nội dung câu hỏi"
              />
              <button
                type="submit"
                disabled={!inputValue.trim() || isTyping}
                className="shrink-0 rounded-lg p-1.5 bg-[#0f766e] text-white hover:bg-[#115e59] transition disabled:opacity-30 disabled:hover:bg-[#0f766e]"
                aria-label="Gửi câu hỏi"
              >
                <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5">
                  <line x1="22" y1="2" x2="11" y2="13" />
                  <polygon points="22 2 15 22 11 13 2 9 22 2" />
                </svg>
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
