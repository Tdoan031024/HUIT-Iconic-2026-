/**
 * Script cập nhật dữ liệu tiếng Anh chuyên nghiệp cho Database MySQL
 * Chạy lệnh: node scripts/seed_english_data.js
 */

const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  console.log('🌐 Bắt đầu cập nhật dữ liệu tiếng Anh vào MySQL Database...');

  // 1. Cập nhật dữ liệu tiếng Anh cho Thí sinh (Candidates)
  const candidateTranslations = {
    '001': {
      descriptionEn: 'Smart Green Agriculture project applying IoT sensor technology and automated drip irrigation for high-efficiency urban farms.',
      biographyEn: `### 🌿 Project Overview
An advanced IoT-driven urban farming solution designed to optimize water and nutrient consumption by up to 40% while doubling organic crop yields in residential and greenhouse environments.

### 🚀 Key Innovations
- Real-time soil moisture and microclimate telemetry.
- Automated nutrient dosing algorithms tailored to each crop stage.
- Mobile application dashboard for remote farm management.

### 🎯 Development Roadmap
- Prototype validation at HUIT Experimental Labs.
- Pilot deployment across 15 agricultural cooperatives in Southern Vietnam.`,
    },
    '002': {
      descriptionEn: 'AI Virtual Assistant platform personalized for higher education and university students, supporting interactive learning and career orientation.',
      biographyEn: `### 🤖 Project Overview
An intelligent generative AI-based assistant tailored specifically for university curriculums, integrating knowledge graphs, adaptive quiz generation, and personalized career pathway suggestions.

### 🚀 Key Innovations
- Fine-tuned large language models on Vietnamese higher education syllabi.
- Voice-enabled interactive mentoring and exam preparation.
- Direct integration with university LMS and academic records.

### 🎯 Development Roadmap
- Beta testing with 5,000 active students at HUIT.
- Partnership expansion to 10 universities across Ho Chi Minh City.`,
    },
    '003': {
      descriptionEn: 'Eco-friendly biodegradable packaging manufactured from agricultural byproducts, replacing single-use plastic in the food & beverage industry.',
      biographyEn: `### 🍃 Project Overview
A circular economy solution utilizing rice husks, bagasse, and cassava starch to create durable, waterproof, and 100% compostable food containers and cutlery.

### 🚀 Key Innovations
- Fully decomposes within 90 days in natural soil without microplastic residue.
- Heat-resistant up to 120°C and safe for microwave use.
- 30% lower production cost compared to imported PLA alternatives.

### 🎯 Development Roadmap
- Scale up semi-automatic production line to 50,000 units/day.
- Supply agreements with eco-conscious cafe chains and supermarkets.`,
    },
    '004': {
      descriptionEn: 'Smart Logistics & Route Optimization platform empowering SMEs to cut delivery costs and reduce carbon emissions in urban freight.',
      biographyEn: `### 🚚 Project Overview
A dynamic AI routing and multi-stop dispatching engine that optimizes fleet utilization, reduces empty mileage, and tracks real-time cold chain delivery conditions.

### 🚀 Key Innovations
- Machine learning algorithm adapting to real-time traffic conditions and localized congestion.
- IoT temperature and humidity sensors for perishable food transportation.
- Automated electronic Proof of Delivery (e-PoD) and invoice reconciliation.

### 🎯 Development Roadmap
- Onboarding 20 logistics partners and 500 delivery drivers.
- Carbon footprint tracking dashboard for green logistics compliance.`,
    },
    '005': {
      descriptionEn: 'Smart Healthcare & Wearable IoT ecosystem for continuous vitals monitoring and early detection of cardiovascular risks for the elderly.',
      biographyEn: `### 🩺 Project Overview
A non-invasive wearable monitoring system equipped with multi-channel optical sensors to track heart rate variability, SpO2, and blood pressure trends continuously.

### 🚀 Key Innovations
- Edge-AI anomaly detection warning families and doctors of abnormal heart patterns.
- One-touch SOS emergency button paired with GPS location sharing.
- Telemedicine cloud integration with certified regional health clinics.

### 🎯 Development Roadmap
- Clinical calibration and safety validation.
- Deployment across senior healthcare communities in Ho Chi Minh City.`,
    },
    '006': {
      descriptionEn: 'Decentralized Clean Solar Energy solution featuring smart battery storage and peer-to-peer renewable energy trading for green communities.',
      biographyEn: `### ☀️ Project Overview
A microgrid energy management platform enabling households and small businesses with rooftop solar panels to store excess power in modular lithium batteries and trade green electricity locally.

### 🚀 Key Innovations
- Smart grid inverter with AI power forecast based on weather predictions.
- Blockchain-secured micro-transaction ledger for peer-to-peer energy sharing.
- Real-time energy analytics and battery health diagnostic app.

### 🎯 Development Roadmap
- Pilot microgrid setup in university residential campus.
- Certification for grid-tied safety standards.`,
    },
  };

  const allCandidates = await prisma.candidate.findMany();
  for (const c of allCandidates) {
    const translation = candidateTranslations[c.sbd] || {
      descriptionEn: c.description ? `${c.description} (Official candidate entry for HUIT's ICONIC 2026 competition)` : 'Official candidate entry for HUIT\'s ICONIC 2026 competition.',
      biographyEn: c.biography ? `### Project Overview\n${c.biography}\n\n### Competition Track\nCandidate participating in HUIT's ICONIC 2026 Startup & Ambassador Awards.` : 'Detailed English proposal for this innovative project is currently being updated by the organizing committee.',
    };

    await prisma.candidate.update({
      where: { id: c.id },
      data: {
        descriptionEn: translation.descriptionEn,
        biographyEn: translation.biographyEn,
      },
    });
    console.log(`  ✓ Updated English data for Candidate [${c.sbd}] ${c.name}`);
  }

  // 2. Cập nhật dữ liệu tiếng Anh cho Lịch trình (Timeline Events)
  const timelineTranslations = [
    {
      match: 'sơ khảo',
      titleEn: 'PRELIMINARY ROUND & REGISTRATION',
      descriptionEn: 'Launch online registration portal, verify candidate portfolios, and select outstanding innovative projects to advance to the next stage.',
    },
    {
      match: 'bán kết',
      titleEn: 'SEMI-FINAL ROUND & SKILLS TRAINING',
      descriptionEn: 'Pitching presentations before the expert jury, business model canvas mentorship, and intensive media communication workshops.',
    },
    {
      match: 'bình chọn',
      titleEn: 'ONLINE PUBLIC VOTING PORTAL OPEN',
      descriptionEn: 'Official opening of the national public online voting gate to choose the most beloved Media Ambassador and Favorite Startup Project.',
    },
    {
      match: 'chung kết',
      titleEn: 'GRAND FINALE & AWARDS GALA NIGHT',
      descriptionEn: 'Top finalist teams present on the grand stage, followed by jury evaluation and honoring the champions at the glamorous Gala Night.',
    },
  ];

  const allTimeline = await prisma.timelineEvent.findMany();
  for (const t of allTimeline) {
    const titleLower = t.title.toLowerCase();
    const matched = timelineTranslations.find(m => titleLower.includes(m.match));
    const titleEn = matched ? matched.titleEn : (t.titleEn || `${t.title} - Official Stage`);
    const descEn = matched ? matched.descriptionEn : (t.descriptionEn || t.description);

    await prisma.timelineEvent.update({
      where: { id: t.id },
      data: {
        titleEn,
        descriptionEn: descEn,
      },
    });
    console.log(`  ✓ Updated English data for Timeline Event: ${t.title} -> ${titleEn}`);
  }

  // 3. Cập nhật dữ liệu tiếng Anh cho Nhà tài trợ (Sponsors)
  const sponsorTranslations = {
    'Amangon Việt Nam': 'Strategic Platinum Partner supporting green youth innovation and talent development initiatives.',
    'Tập đoàn C.P. Group': 'Leading multinational agricultural and food conglomerate accompanying HUIT students in sustainable development.',
    'Công ty TNHH Esuhai': 'Premier international education and career development partner connecting Vietnamese talents with Japanese enterprises.',
    'GreenFood Việt Nam': 'Pioneering clean food manufacturer providing nutritional sponsorship and incubation support.',
    'Ngân hàng MB Bank': 'Digital banking pioneer delivering modern financial solutions and voting system support.',
    'Ngân hàng Quốc tế VIB': 'Innovative retail banking partner providing entrepreneurship scholarship funds.',
  };

  const allSponsors = await prisma.sponsor.findMany();
  for (const s of allSponsors) {
    const descEn = sponsorTranslations[s.name] || (s.description ? `${s.description} - Proud sponsor of HUIT's ICONIC 2026.` : 'Proud official partner and sponsor accompanying HUIT\'s ICONIC 2026 competition.');
    await prisma.sponsor.update({
      where: { id: s.id },
      data: { descriptionEn: descEn },
    });
    console.log(`  ✓ Updated English data for Sponsor: ${s.name}`);
  }

  // 4. Cập nhật dữ liệu tiếng Anh cho Banner
  const allBanners = await prisma.banner.findMany();
  for (const b of allBanners) {
    await prisma.banner.update({
      where: { id: b.id },
      data: {
        titleEn: b.titleEn || "HUIT's ICONIC 2026 - Search for HUIT Media Ambassador & Startup Projects",
      },
    });
    console.log(`  ✓ Updated English data for Banner: ${b.title}`);
  }

  // 5. Cập nhật dữ liệu tiếng Anh cho Bài viết Tin tức (Posts)
  const allPosts = await prisma.post.findMany();
  for (const p of allPosts) {
    await prisma.post.update({
      where: { id: p.id },
      data: {
        titleEn: p.titleEn || `${p.title} (Official Update)`,
        summaryEn: p.summaryEn || (p.summary ? `${p.summary}` : 'Official announcement and latest news from the HUIT\'s ICONIC 2026 Organizing Committee.'),
        contentEn: p.contentEn || (p.content ? `<div class="post-english-content"><p>${p.summary || p.title}</p><p>Official updates regarding the competition timeline, scoring criteria, and candidate showcases are published regularly on the HUIT portal.</p></div>` : '<p>Content in English is being updated.</p>'),
      },
    });
    console.log(`  ✓ Updated English data for Post: ${p.title}`);
  }

  // 6. Cập nhật dữ liệu tiếng Anh cho Cấu hình Hệ thống (System Settings)
  const existingSetting = await prisma.systemSetting.findUnique({ where: { id: 'default' } });
  let currentData = {};
  if (existingSetting && existingSetting.data) {
    try {
      currentData = JSON.parse(existingSetting.data);
    } catch {
      currentData = {};
    }
  }

  const updatedSettings = {
    ...currentData,
    eventTitleEn: "HUIT's ICONIC 2026 - Search for HUIT Media Ambassador & Startup Projects",
    aboutTitleEn: "HUIT STARTUP & MEDIA AMBASSADOR 2026",
    aboutSubtitleEn: "Connecting Innovation - Nurturing Creative Talents",
    aboutThemeEn: "Pioneering Green Technology & Digital Transformation",
    aboutDescriptionEn: "HUIT's ICONIC 2026 is the prestigious annual competition organized by Ho Chi Minh City University of Industry and Trade (HUIT) to discover dynamic media ambassadors, outstanding startup initiatives, and inspire entrepreneurial spirit among youth and students nationwide.",
    aboutBenefitsEn: "Professional mentorship & intensive training workshops\nDirect networking with top venture funds and angel investors\nIncubation support, workspace, and commercialization assistance\nMedia exposure across national press and university communication channels",
    aboutSectorsEn: "Digital Transformation, AI & Information Technology\nFood Science, Sustainable Agriculture & Biotechnology\nGreen Economy, Environmental Tech & Renewable Energy\nCreative Media, EdTech & Healthcare Services",
    aboutPrizeEn: "Total prize pool valued at over 500,000,000 VND along with incubation scholarships, media contracts, and corporate co-founding opportunities.",
    aboutParticipantsEn: "Track A: High school students with innovative ideas\nTrack B: College and university students passionate about innovation\nTrack C: Young startup enterprises and creative teams",
    themeVideoTitleEn: "Official Theme Video - HUIT's ICONIC 2026",
    themeVideoDescriptionEn: "Watch the inspiring journey of HUIT's ICONIC 2026 candidates and startup pioneers.",
  };

  await prisma.systemSetting.upsert({
    where: { id: 'default' },
    update: { data: JSON.stringify(updatedSettings) },
    create: { id: 'default', data: JSON.stringify(updatedSettings) },
  });
  console.log('  ✓ Updated English data for SystemSettings in MySQL');

  console.log('\n🎉 ĐÃ CẬP NHẬT HOÀN TẤT TOÀN BỘ DỮ LIỆU TIẾNG ANH CHO DATABASE!');
}

main()
  .catch((e) => {
    console.error('❌ Lỗi cập nhật dữ liệu tiếng Anh:', e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
