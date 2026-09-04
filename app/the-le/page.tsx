'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useLanguage } from '../../src/i18n/use-language';
import { translate } from '../../src/i18n';

export default function TheLePage() {
  const language = useLanguage();
  const t = (key: Parameters<typeof translate>[1]) => translate(language, key);

  const [activeFaq, setActiveFaq] = useState<number | null>(null);

  const faqs = [
    {
      q: language === 'en' ? 'Who can participate in HUIT’s ICONIC 2026?' : 'Đối tượng nào có thể đăng ký tham gia HUIT’s ICONIC 2026?',
      a: language === 'en' 
        ? 'All currently enrolled students at Ho Chi Minh City University of Industry and Trade (HUIT) meeting the height criteria (Female >= 1m60, Male >= 1m70) and good academic/ethical standing.'
        : 'Tất cả sinh viên đang theo học tại Trường Đại học Công Thương TP.HCM (HUIT) có chiều cao Nữ từ 1m60 trở lên và Nam từ 1m70 trở lên, có phẩm chất đạo đức tốt và không bị kỷ luật.'
    },
    {
      q: language === 'en' ? 'What are the main rounds of the competition?' : 'Cuộc thi gồm có những vòng thi nào?',
      a: language === 'en'
        ? 'The journey consists of 3 major phases: Preliminary Round (Top 50 selection), Semi-final Round (Photoshoot, Talent, HUIT Bridal Fashion Show - TOP Model, Closed-door Interview & Charity Project), and the Grand Finale Awards Gala.'
        : 'Cuộc thi gồm 3 giai đoạn: Vòng Sơ khảo (chọn Top 50), Vòng Bán kết (4 chặng: Photoshoot, Tài năng, HUIT Bridal Fashion Show - TOP Model, Phỏng vấn kín & Hoạt động thiện nguyện) và Đêm Gala Chung kết xếp hạng.'
    },
    {
      q: language === 'en' ? 'How does the free online public voting work?' : 'Cơ chế bình chọn trực tuyến miễn phí hoạt động như thế nào?',
      a: language === 'en'
        ? 'Each registered account receives 2 free daily votes to support their favorite candidates. Votes reset every 24 hours at 00:00.'
        : 'Mỗi tài khoản đăng nhập trên website được cấp 2 lượt bình chọn hoàn toàn miễn phí mỗi ngày để ủng hộ thí sinh yêu thích. Lượt bình chọn được làm mới vào lúc 00:00 hàng ngày.'
    },
    {
      q: language === 'en' ? 'How can I submit my candidate application?' : 'Làm thế nào để nộp hồ sơ đăng ký dự thi?',
      a: language === 'en'
        ? 'Candidates can register directly through the official candidate Zalo group: https://zalo.me/g/myzijputivfgc1toua9z or contact the Organizing Committee.'
        : 'Thí sinh đăng ký trực tiếp và tham gia nhóm Zalo hỗ trợ của Ban Tổ chức tại địa chỉ: https://zalo.me/g/myzijputivfgc1toua9z để được hướng dẫn hoàn thiện hồ sơ dự thi.'
    }
  ];

  return (
    <>
      <style>{`
        .the-le-page { background: var(--site-bg); }
        .rule-card {
          background: var(--site-card);
          border: 1px solid var(--site-line);
          border-radius: 20px;
          transition: all 0.3s cubic-bezier(0.16, 1, 0.3, 1);
        }
        .rule-card:hover {
          transform: translateY(-3px);
          border-color: color-mix(in srgb, var(--site-primary) 40%, var(--site-line));
          box-shadow: 0 16px 36px rgba(10, 47, 255, 0.08);
        }
      `}</style>

      <main className="the-le-page flex-1 min-h-screen pb-20">
        {/* Hero Section */}
        <section className="subpage-hero">
          <div className="subpage-hero-bg" />
          <div className="subpage-hero-content">
            <div className="subpage-breadcrumb">
              <Link href="/">{t('home')}</Link>
              <svg width="12" height="12" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                <polyline points="9 18 15 12 9 6" />
              </svg>
              <span>{language === 'en' ? 'Rules & Eligibility' : 'Thể lệ & Quy chế'}</span>
            </div>

            <div
              className="inline-flex items-center gap-2 px-4 py-2 rounded-full text-xs font-bold uppercase tracking-widest mb-4"
              style={{
                background: 'color-mix(in srgb, var(--site-primary) 12%, var(--site-card))',
                color: 'var(--site-primary)',
                border: '1px solid color-mix(in srgb, var(--site-primary) 25%, transparent)',
              }}
            >
              📜 {language === 'en' ? 'Official 2026 Contest Regulation' : 'Đề án & Thể lệ chính thức 2026'}
            </div>

            <h1 style={{ lineHeight: 1.35 }}>
              {language === 'en' ? 'Rules & Guidelines HUIT’s ICONIC 2026' : 'Thể lệ & Điều kiện dự thi HUIT’s ICONIC 2026'}
            </h1>
            <p>
              {language === 'en'
                ? 'Comprehensive official guidelines covering candidate eligibility, competition rounds, award structure, sponsorship packages, and online voting regulations.'
                : 'Toàn bộ quy định chính thức về tiêu chuẩn thí sinh, lộ trình các vòng thi, cơ cấu giải thưởng 2026, quyền lợi nhà tài trợ và quy chế bình chọn trực tuyến.'}
            </p>

            <div className="flex flex-wrap gap-2.5 justify-center mt-6">
              {[
                { label: language === 'en' ? '1. Eligibility' : '1. Điều kiện dự thi', href: '#dieu-kien' },
                { label: language === 'en' ? '2. Competition Rounds' : '2. Các vòng thi', href: '#vong-thi' },
                { label: language === 'en' ? '3. Awards & Prizes' : '3. Cơ cấu giải thưởng', href: '#giai-thuong' },
                { label: language === 'en' ? '4. Sponsorship Packages' : '4. Gói tài trợ', href: '#tai-tro' },
                { label: language === 'en' ? '5. FAQ & Contact' : '5. Giải đáp & Liên hệ', href: '#faq' },
              ].map((item, idx) => (
                <a
                  key={idx}
                  href={item.href}
                  className="px-4 py-2 rounded-full text-xs sm:text-sm font-bold transition hover:scale-105"
                  style={{ border: '1px solid var(--site-line)', background: 'var(--site-card)', color: 'var(--site-text)' }}
                >
                  {item.label} ↓
                </a>
              ))}
            </div>

            <div className="subpage-divider" />
          </div>
        </section>

        <div className="max-w-[1180px] mx-auto px-4 sm:px-6 py-12 space-y-16">
          
          {/* SECTION 1: ĐIỀU KIỆN DỰ THI */}
          <section id="dieu-kien" className="scroll-mt-28 space-y-6">
            <div className="flex items-center gap-3">
              <div className="grid h-10 w-10 place-items-center rounded-xl bg-gradient-to-tr from-[#0A2FFF] to-[#79BCC2] text-white text-lg font-black shadow-md">
                01
              </div>
              <div>
                <p className="text-xs font-black uppercase tracking-widest text-[#0A2FFF]">Mục 04 Đề án 2026</p>
                <h2 className="text-2xl sm:text-3xl font-black text-[color:var(--site-text)]">
                  {language === 'en' ? 'Candidate Eligibility Criteria' : 'Điều kiện & Tiêu chuẩn dự thi'}
                </h2>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
              {[
                {
                  icon: '🎓',
                  title: language === 'en' ? 'Enrolled Students' : 'Đối tượng dự thi',
                  desc: language === 'en' ? 'Currently enrolled students at Ho Chi Minh City University of Industry and Trade (HUIT) at the time of registration.' : 'Là sinh viên đang theo học tại Trường Đại học Công Thương TP.HCM (HUIT) tại thời điểm đăng ký dự thi.'
                },
                {
                  icon: '📏',
                  title: language === 'en' ? 'Official Height Standard' : 'Tiêu chuẩn chiều cao 2026',
                  desc: language === 'en' ? 'Female: From 1m60 and above. Male: From 1m70 and above.' : 'Nữ: Chiều cao từ 1m60 trở lên.\nNam: Chiều cao từ 1m70 trở lên.'
                },
                {
                  icon: '🩺',
                  title: language === 'en' ? 'Physical & Mental Health' : 'Sức khỏe & Thể chất',
                  desc: language === 'en' ? 'Good physical and mental health, able to actively participate throughout all competition activities.' : 'Có sức khỏe thể chất và tinh thần tốt, đủ khả năng tham gia xuyên suốt các hoạt động của cuộc thi.'
                },
                {
                  icon: '🛡️',
                  title: language === 'en' ? 'Conduct & Ethics' : 'Phẩm chất đạo đức',
                  desc: language === 'en' ? 'Exemplary ethics, no criminal record or serious disciplinary actions from the University.' : 'Có phẩm chất đạo đức tốt, không có tiền án tiền sự và không chịu hình thức kỷ luật nào của Nhà trường.'
                },
                {
                  icon: '✨',
                  title: language === 'en' ? 'Skills & Inspiration' : 'Kỹ năng & Tinh thần',
                  desc: language === 'en' ? 'Confident, dynamic, creative, passionate about media communications and community activities.' : 'Có tinh thần tự tin, năng động, sáng tạo, yêu thích truyền thông và sẵn sàng tham gia các hoạt động cộng đồng.'
                },
                {
                  icon: '🎁',
                  title: language === 'en' ? 'Candidate Privileges' : 'Đặc quyền thí sinh',
                  desc: language === 'en' ? 'Exclusive training in runway catwalk, communication, public speaking, and personal brand building.' : 'Được đào tạo, huấn luyện kỹ năng catwalk, giao tiếp, ứng xử và xây dựng thương hiệu cá nhân xuyên suốt cuộc thi.'
                },
              ].map((c, i) => (
                <div key={i} className="rule-card p-6 flex flex-col justify-between">
                  <div>
                    <div className="text-3xl mb-3">{c.icon}</div>
                    <h3 className="text-lg font-black text-[color:var(--site-text)] mb-2">{c.title}</h3>
                    <p className="text-sm text-[color:var(--site-muted)] leading-relaxed whitespace-pre-line">{c.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </section>

          {/* SECTION 2: CÁC VÒNG THI */}
          <section id="vong-thi" className="scroll-mt-28 space-y-6">
            <div className="flex items-center gap-3">
              <div className="grid h-10 w-10 place-items-center rounded-xl bg-gradient-to-tr from-[#0A2FFF] to-[#79BCC2] text-white text-lg font-black shadow-md">
                02
              </div>
              <div>
                <p className="text-xs font-black uppercase tracking-widest text-[#0A2FFF]">Mục 05 & 06 Đề án 2026</p>
                <h2 className="text-2xl sm:text-3xl font-black text-[color:var(--site-text)]">
                  {language === 'en' ? 'Competition Rounds & Roadmap' : 'Hình thức & Nội dung các vòng thi'}
                </h2>
              </div>
            </div>

            <div className="space-y-5">
              {/* Vòng Sơ Khảo */}
              <div className="rule-card p-6 sm:p-8 space-y-4">
                <div className="flex flex-wrap items-center justify-between gap-3 border-b border-[color:var(--site-line)] pb-4">
                  <div className="flex items-center gap-3">
                    <span className="px-3 py-1 rounded-full bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400 text-xs font-black uppercase tracking-wider border border-emerald-200 dark:border-emerald-800">
                      Giai đoạn 01
                    </span>
                    <h3 className="text-xl font-black text-[color:var(--site-text)]">Vòng Sơ khảo (04/10/2026)</h3>
                  </div>
                  <span className="text-xs font-bold text-[#0A2FFF]">Tuyển chọn Top 50 Thí sinh</span>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm text-[color:var(--site-muted)]">
                  <div className="p-4 rounded-xl bg-[color:var(--site-bg)] border border-[color:var(--site-line)] space-y-1">
                    <b className="text-[color:var(--site-text)] block">1. Đo chỉ số nhân trắc học</b>
                    <p>Đo chiều cao, cân nặng, hình thể và tính điểm chỉ số hình thể chuẩn.</p>
                  </div>
                  <div className="p-4 rounded-xl bg-[color:var(--site-bg)] border border-[color:var(--site-line)] space-y-1">
                    <b className="text-[color:var(--site-text)] block">2. Trình diễn Catwalk</b>
                    <p>Trình diễn catwalk theo trang phục tự chọn phù hợp trên nền nhạc chương trình.</p>
                  </div>
                  <div className="p-4 rounded-xl bg-[color:var(--site-bg)] border border-[color:var(--site-line)] space-y-1">
                    <b className="text-[color:var(--site-text)] block">3. Phỏng vấn trực tiếp</b>
                    <p>Trả lời phỏng vấn trực tiếp từ Hội đồng Ban Giám Khảo để đánh giá sự tự tin và ứng xử.</p>
                  </div>
                </div>
              </div>

              {/* Vòng Bán Kết */}
              <div className="rule-card p-6 sm:p-8 space-y-4">
                <div className="flex flex-wrap items-center justify-between gap-3 border-b border-[color:var(--site-line)] pb-4">
                  <div className="flex items-center gap-3">
                    <span className="px-3 py-1 rounded-full bg-blue-50 dark:bg-blue-950/40 text-blue-600 dark:text-blue-400 text-xs font-black uppercase tracking-wider border border-blue-200 dark:border-blue-800">
                      Giai đoạn 02
                    </span>
                    <h3 className="text-xl font-black text-[color:var(--site-text)]">Vòng Bán kết (10/10/2026 - 19/12/2026)</h3>
                  </div>
                  <span className="text-xs font-bold text-[#0A2FFF]">4 Chặng thử thách chuyên sâu</span>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 text-sm text-[color:var(--site-muted)]">
                  <div className="p-4 rounded-xl bg-[color:var(--site-bg)] border border-[color:var(--site-line)] space-y-1">
                    <span className="text-xs font-bold text-blue-600 block">Bán kết 1 (10/10)</span>
                    <b className="text-[color:var(--site-text)] block">Photoshoot chủ đề</b>
                    <p>Chụp ảnh concept với trang phục, sản phẩm hoặc đạo cụ Nhà tài trợ; thể hiện thần thái trước ống kính.</p>
                  </div>
                  <div className="p-4 rounded-xl bg-[color:var(--site-bg)] border border-[color:var(--site-line)] space-y-1">
                    <span className="text-xs font-bold text-purple-600 block">Bán kết 2 (01/11)</span>
                    <b className="text-[color:var(--site-text)] block">Vòng Tài năng</b>
                    <p>Thể hiện năng khiếu nghệ thuật, tiết mục dàn dựng sân khấu hóa đặc sắc tìm kiếm giải Best Talent.</p>
                  </div>
                  <div className="p-4 rounded-xl bg-[color:var(--site-bg)] border border-[color:var(--site-line)] space-y-1">
                    <span className="text-xs font-bold text-rose-600 block">Bán kết 3 (12/12)</span>
                    <b className="text-[color:var(--site-text)] block">HUIT Bridal TOP Model</b>
                    <p>Trình diễn trang phục BTC chuẩn bị tại sàn diễn thời trang lớn HUIT Bridal Fashion Show.</p>
                  </div>
                  <div className="p-4 rounded-xl bg-[color:var(--site-bg)] border border-[color:var(--site-line)] space-y-1">
                    <span className="text-xs font-bold text-teal-600 block">Bán kết 4 (19/12)</span>
                    <b className="text-[color:var(--site-text)] block">Phỏng vấn kín & Thiện nguyện</b>
                    <p>Phỏng vấn kín với BGK đánh giá tư duy & Thực hiện dự án thiện nguyện tại Tây Ninh/Bình Phước.</p>
                  </div>
                </div>
              </div>

              {/* Vòng Chung Kết */}
              <div className="rule-card p-6 sm:p-8 space-y-4 border-2 border-[#0A2FFF]/40">
                <div className="flex flex-wrap items-center justify-between gap-3 border-b border-[color:var(--site-line)] pb-4">
                  <div className="flex items-center gap-3">
                    <span className="px-3 py-1 rounded-full bg-amber-50 dark:bg-amber-950/40 text-amber-600 dark:text-amber-400 text-xs font-black uppercase tracking-wider border border-amber-200 dark:border-amber-800">
                      Giai đoạn 03
                    </span>
                    <h3 className="text-xl font-black text-[color:var(--site-text)]">GALA CHUNG KẾT XẾP HẠNG (26/12/2026)</h3>
                  </div>
                  <span className="text-xs font-black text-amber-600">Đêm Vinh Danh & Trao Giải</span>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-[color:var(--site-muted)]">
                  <div className="p-4 rounded-xl bg-[color:var(--site-bg)] border border-[color:var(--site-line)] space-y-1">
                    <b className="text-[color:var(--site-text)] block">Phần 1: Trình diễn Catwalk sân khấu lớn</b>
                    <p>Trình diễn trang phục dạ hội và trang phục truyền thống trên sân khấu Gala quy mô hoành tráng.</p>
                  </div>
                  <div className="p-4 rounded-xl bg-[color:var(--site-bg)] border border-[color:var(--site-line)] space-y-1">
                    <b className="text-[color:var(--site-text)] block">Phần 2: Interview 60 giây ứng xử trực tiếp</b>
                    <p>Top thí sinh xuất sắc trả lời câu hỏi trực tiếp từ Hội đồng Ban Giám Khảo để chọn ra Quán quân.</p>
                  </div>
                </div>
              </div>
            </div>
          </section>

          {/* SECTION 3: CƠ CẤU GIẢI THƯỞNG */}
          <section id="giai-thuong" className="scroll-mt-28 space-y-6">
            <div className="flex items-center gap-3">
              <div className="grid h-10 w-10 place-items-center rounded-xl bg-gradient-to-tr from-[#0A2FFF] to-[#79BCC2] text-white text-lg font-black shadow-md">
                03
              </div>
              <div>
                <p className="text-xs font-black uppercase tracking-widest text-[#0A2FFF]">Mục 07 Đề án 2026</p>
                <h2 className="text-2xl sm:text-3xl font-black text-[color:var(--site-text)]">
                  {language === 'en' ? 'Official Prize & Award Structure' : 'Cơ cấu giải thưởng HUIT’s ICONIC 2026'}
                </h2>
              </div>
            </div>

            {/* Giải chính */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="rule-card p-6 sm:p-8 relative overflow-hidden border-2 border-amber-400/60 bg-gradient-to-br from-amber-500/5 via-[color:var(--site-card)] to-amber-500/10">
                <div className="text-4xl mb-2">👑</div>
                <h3 className="text-xl font-black text-[color:var(--site-text)]">02 QUÁN QUÂN ĐẠI SỨ TRUYỀN THÔNG</h3>
                <p className="text-xs font-bold text-amber-600 uppercase tracking-wider mb-4">01 Nam & 01 Nữ</p>
                <div className="text-3xl font-black text-amber-600 mb-3">10.000.000 VNĐ / giải</div>
                <ul className="text-xs text-[color:var(--site-muted)] space-y-1.5 list-disc list-inside">
                  <li>Vương miện Đại sứ truyền thông danh giá</li>
                  <li>Cúp kỷ niệm chương & Sash đeo chính thức</li>
                  <li>Giấy chứng nhận từ Trường Đại học Công Thương TP.HCM</li>
                  <li>Gói quà tặng cao cấp từ Nhà tài trợ chương trình</li>
                </ul>
              </div>

              <div className="rule-card p-6 sm:p-8 relative overflow-hidden border border-blue-400/60 bg-gradient-to-br from-blue-500/5 via-[color:var(--site-card)] to-blue-500/10">
                <div className="text-4xl mb-2">🥈</div>
                <h3 className="text-xl font-black text-[color:var(--site-text)]">02 Á QUÂN ĐẠI SỨ TRUYỀN THÔNG</h3>
                <p className="text-xs font-bold text-blue-600 uppercase tracking-wider mb-4">01 Nam & 01 Nữ</p>
                <div className="text-3xl font-black text-blue-600 mb-3">5.000.000 VNĐ / giải</div>
                <ul className="text-xs text-[color:var(--site-muted)] space-y-1.5 list-disc list-inside">
                  <li>Cúp kỷ niệm chương & Sash đeo Á quân</li>
                  <li>Giấy chứng nhận từ Trường Đại học Công Thương TP.HCM</li>
                  <li>Gói quà tặng giá trị từ Nhà tài trợ chương trình</li>
                </ul>
              </div>
            </div>

            {/* 7 Giải phụ */}
            <div className="rule-card p-6 sm:p-8 space-y-4">
              <h3 className="text-lg font-black text-[color:var(--site-text)]">07 HẠNG MỤC GIẢI PHỤ XUẤT SẮC</h3>
              <p className="text-xs text-[color:var(--site-muted)]">Ghi nhận các tài năng và thế mạnh vượt trội của các thí sinh trong suốt hành trình cuộc thi (nhận kèm Kỷ niệm chương, Sash và Quà tặng NTT):</p>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 text-xs font-bold">
                {[
                  { tag: 'Best Talent', name: 'Thí sinh tài năng nhất' },
                  { tag: 'Best Interview', name: 'Thí sinh ứng xử xuất sắc nhất' },
                  { tag: 'Best Photoshoot', name: 'Thí sinh chụp ảnh xuất sắc nhất' },
                  { tag: 'Most Popular', name: 'Thí sinh được yêu thích nhất' },
                  { tag: 'Best Face', name: 'Gương mặt ấn tượng nhất' },
                  { tag: 'Best Evening Gown', name: 'Trang phục dạ hội đẹp nhất' },
                  { tag: 'Best Veston', name: 'Trình diễn vest xuất sắc nhất' },
                ].map((g, i) => (
                  <div key={i} className="p-3.5 rounded-xl bg-[color:var(--site-bg)] border border-[color:var(--site-line)] flex flex-col justify-between">
                    <span className="text-[10px] font-mono text-[#0A2FFF] uppercase">{g.tag}</span>
                    <span className="text-[color:var(--site-text)] mt-1">{g.name}</span>
                  </div>
                ))}
              </div>
            </div>
          </section>

          {/* SECTION 4: GÓI TÀI TRỢ */}
          <section id="tai-tro" className="scroll-mt-28 space-y-6">
            <div className="flex items-center gap-3">
              <div className="grid h-10 w-10 place-items-center rounded-xl bg-gradient-to-tr from-[#0A2FFF] to-[#79BCC2] text-white text-lg font-black shadow-md">
                04
              </div>
              <div>
                <p className="text-xs font-black uppercase tracking-widest text-[#0A2FFF]">Mục 09 Đề án 2026</p>
                <h2 className="text-2xl sm:text-3xl font-black text-[color:var(--site-text)]">
                  {language === 'en' ? 'Sponsorship Packages' : 'Các gói quyền lợi Nhà tài trợ'}
                </h2>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
              {[
                { tier: 'KIM CƯƠNG', value: '50.000.000 VNĐ', color: '#0A2FFF', desc: 'Logo vị trí ưu tiên cao nhất, 03 bài truyền thông riêng, phát biểu 5 phút tại Gala Chung kết, quyền mời BGK Chung kết.' },
                { tier: 'VÀNG', value: '30.000.000 VNĐ', color: '#f59e0b', desc: 'Logo kích thước lớn, 02 bài truyền thông riêng, video review trải nghiệm sản phẩm, gian hàng activation tại Chung kết.' },
                { tier: 'BẠC', value: '10.000.000 VNĐ', color: '#64748b', desc: 'Logo xuất hiện trên toàn bộ ấn phẩm, 01 bài truyền thông riêng, trao tặng sản phẩm và voucher cho thí sinh.' },
                { tier: 'ĐỒNG', value: '5.000.000 VNĐ', color: '#b45309', desc: 'Logo trên landing page và ấn phẩm truyền thông, tri ân tại các vòng thi và đêm Gala Chung kết.' },
              ].map((pkg, i) => (
                <div key={i} className="rule-card p-6 flex flex-col justify-between space-y-3">
                  <div>
                    <span className="text-xs font-black uppercase tracking-wider" style={{ color: pkg.color }}>Gói {pkg.tier}</span>
                    <div className="text-xl font-black text-[color:var(--site-text)] mt-1">{pkg.value}</div>
                    <p className="text-xs text-[color:var(--site-muted)] leading-relaxed mt-2.5">{pkg.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </section>

          {/* SECTION 5: FAQ & LIÊN HỆ */}
          <section id="faq" className="scroll-mt-28 space-y-6">
            <div className="flex items-center gap-3">
              <div className="grid h-10 w-10 place-items-center rounded-xl bg-gradient-to-tr from-[#0A2FFF] to-[#79BCC2] text-white text-lg font-black shadow-md">
                05
              </div>
              <div>
                <p className="text-xs font-black uppercase tracking-widest text-[#0A2FFF]">Mục 10 Đề án 2026</p>
                <h2 className="text-2xl sm:text-3xl font-black text-[color:var(--site-text)]">
                  {language === 'en' ? 'Frequently Asked Questions & Contact' : 'Giải đáp thắc mắc & Thông tin Ban Tổ chức'}
                </h2>
              </div>
            </div>

            <div className="space-y-3">
              {faqs.map((faq, i) => (
                <div key={i} className="rule-card overflow-hidden">
                  <button
                    type="button"
                    onClick={() => setActiveFaq(activeFaq === i ? null : i)}
                    className="w-full p-5 text-left flex items-center justify-between gap-4 font-bold text-sm text-[color:var(--site-text)]"
                  >
                    <span>{faq.q}</span>
                    <span className="text-base text-[#0A2FFF]">{activeFaq === i ? '−' : '+'}</span>
                  </button>
                  {activeFaq === i && (
                    <div className="px-5 pb-5 text-xs sm:text-sm text-[color:var(--site-muted)] leading-relaxed border-t border-[color:var(--site-line)] pt-3">
                      {faq.a}
                    </div>
                  )}
                </div>
              ))}
            </div>

            {/* Contact Card */}
            <div className="rule-card p-6 sm:p-8 bg-gradient-to-br from-[#0A2FFF]/5 to-transparent flex flex-col sm:flex-row items-center justify-between gap-6">
              <div className="space-y-2 text-center sm:text-left">
                <h3 className="text-lg font-black text-[color:var(--site-text)]">Ban Tổ Chức HUIT’s ICONIC 2026</h3>
                <p className="text-xs text-[color:var(--site-muted)]">
                  <b>Trưởng Ban Tổ chức:</b> Thầy Đặng Xuân Dương &bull; <b>Điện thoại / Zalo:</b> 0974 331 499 &bull; <b>Email:</b> duongdx@huit.edu.vn
                </p>
                <p className="text-xs text-[color:var(--site-muted)]">
                  <b>Đơn vị chỉ đạo & sản xuất:</b> Trường Đại học Công Thương TP. Hồ Chí Minh (HUIT)
                </p>
              </div>

              <div className="flex flex-wrap gap-3">
                <Link
                  href="/dang-ky"
                  className="px-6 py-3 rounded-full bg-gradient-to-r from-[#0A2FFF] to-[#79BCC2] hover:opacity-95 text-white text-xs font-black uppercase tracking-wider shadow-md transition active:scale-95 flex items-center gap-1.5"
                >
                  Đăng ký dự thi ngay →
                </Link>
                <a
                  href="https://zalo.me/g/myzijputivfgc1toua9z"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="px-6 py-3 rounded-full bg-white/10 hover:bg-white/20 border border-slate-300 dark:border-white/20 text-[color:var(--site-text)] text-xs font-black uppercase tracking-wider shadow-sm transition active:scale-95"
                >
                  Nhóm Zalo thí sinh
                </a>
              </div>
            </div>
          </section>

        </div>
      </main>
    </>
  );
}
