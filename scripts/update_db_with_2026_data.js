const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function updateData() {
  console.log('--- UPDATING DATABASE WITH OFFICIAL 2026 PROPOSAL & REGISTRATION DATA ---');

  // 1. Update SystemSettings
  const currentSettingsRow = await prisma.systemSetting.findUnique({ where: { id: 'default' } });
  const prevSettings = currentSettingsRow ? JSON.parse(currentSettingsRow.data) : {};

  const updatedSettings = {
    ...prevSettings,
    isGateOpen: true,
    startDate: '2026-09-05T00:00',
    endDate: '2026-12-31T23:59',
    maxVotesPerPhone: 5,
    eventTitle: "HUIT's ICONIC 2026 - Cuộc thi Tìm kiếm Đại sứ Truyền thông HUIT",
    eventTitleEn: "HUIT's ICONIC 2026 - HUIT Media Ambassador Search Contest",
    organizer: "Trường Đại học Công Thương TP. Hồ Chí Minh (HUIT)",
    organizerEn: "Ho Chi Minh City University of Industry and Trade (HUIT)",
    contactEmail: "duongdx@huit.edu.vn",
    isMaintenanceMode: false,
    aboutTitle: "HUIT'S ICONIC 2026 - ĐẠI SỨ TRUYỀN THÔNG HUIT",
    aboutTitleEn: "HUIT'S ICONIC 2026 - HUIT MEDIA AMBASSADOR",
    aboutSubtitle: "Cuộc thi Tìm kiếm Đại sứ Truyền thông Trường Đại học Công Thương TP.HCM",
    aboutSubtitleEn: "Ho Chi Minh City University of Industry and Trade Media Ambassador Search Contest",
    aboutDescription: "Cuộc thi Tìm kiếm Đại sứ Truyền thông Trường Đại học Công Thương TP.HCM – HUIT’S ICONIC 2026 chính thức trở lại với quy mô hơn 40.000 sinh viên. Với triết lý giáo dục “Học tập chủ động, làm việc sáng tạo, sống có trách nhiệm” trải qua hơn 40 năm hình thành và phát triển, cuộc thi hướng đến việc tìm kiếm những sinh viên tiêu biểu hội tụ vẻ đẹp, trí tuệ, tài năng, bản lĩnh và khả năng truyền cảm hứng từ những điều bình dị trong cuộc sống thường ngày.\n\nĐại sứ Truyền thông HUIT sẽ là những gương mặt đại diện kết nối, lan tỏa tinh thần, giá trị cốt lõi, sứ mệnh và tầm nhìn của Nhà trường đến cộng đồng sinh viên, giảng viên và xã hội; góp phần xây dựng hình ảnh một HUIT năng động, sáng tạo, nhân văn và đầy cảm hứng.",
    aboutDescriptionEn: "The Ho Chi Minh City University of Industry and Trade Media Ambassador Search Contest – HUIT’S ICONIC 2026 officially returns with a vibrant community of over 40,000 students. Guided by the educational philosophy 'Active learning, creative working, responsible living' spanning over 40 years of excellence, the competition aims to discover outstanding students who embody beauty, intellect, talent, confidence, and the power to inspire through everyday life stories.\n\nHUIT Media Ambassadors will serve as inspiring role models, connecting and amplifying the university's core values, mission, and vision to the student community, faculty, and society—shaping the image of a dynamic, creative, humanistic, and inspirational HUIT.",
    aboutTheme: "Vẻ đẹp - Trí tuệ - Tài năng - Bản lĩnh - Truyền cảm hứng",
    aboutThemeEn: "Beauty - Intellect - Talent - Confidence - Inspiration",
    aboutOrganizerDetail: "Đơn vị chỉ đạo & sản xuất: Trường Đại học Công Thương TP. Hồ Chí Minh (HUIT).\nTrưởng Ban Tổ chức: Thầy Đặng Xuân Dương (Điện thoại/Zalo: 0974 331 499 - Email: duongdx@huit.edu.vn).\nFanpage chính thức: https://www.facebook.com/Daisutruyenthonghuit\nNhóm Zalo hỗ trợ thí sinh: https://zalo.me/g/uxjmkq913",
    aboutOrganizerDetailEn: "Directing & Producing Unit: Ho Chi Minh City University of Industry and Trade (HUIT).\nHead of Organizing Committee: Mr. Dang Xuan Duong (Tel/Zalo: 0974 331 499 - Email: duongdx@huit.edu.vn).\nOfficial Fanpage: https://www.facebook.com/Daisutruyenthonghuit\nCandidate Zalo Group: https://zalo.me/g/uxjmkq913",
    aboutSectors: "Đo chỉ số hình thể & Trình diễn Catwalk\nThử thách Photoshoot & Xây dựng hình ảnh cá nhân\nPhần thi Tài năng & Sân khấu hóa nghệ thuật\nHUIT Bridal Fashion Show - Vòng TOP Model\nPhỏng vấn kín & Dự án hoạt động cộng đồng thiện nguyện\nĐêm Gala Chung kết & Phỏng vấn 60 giây ứng xử",
    aboutSectorsEn: "Anthropometric measurement & Catwalk performance\nConcept Photoshoot & Personal branding challenge\nTalent showcase & Stage artistic performance\nHUIT Bridal Fashion Show - TOP Model round\nClosed-door in-depth interview & Community volunteer project\nGrand Finale Gala & 60-second live Q&A interview",
    aboutBenefits: "Đào tạo chuyên sâu kỹ năng trình diễn, catwalk & phong thái sân khấu\nHướng dẫn giao tiếp, ứng xử, tư duy phản biện & bản lĩnh truyền thông\nThực hiện bộ ảnh Photoshoot chuyên nghiệp và xây dựng thương hiệu cá nhân\nTrình diễn tại sàn diễn thời trang lớn HUIT Bridal Fashion Show\nTham gia các hoạt động cộng đồng thiện nguyện tại Tây Ninh/Bình Phước\nCơ hội trở thành Đại sứ đại diện hình ảnh Nhà trường và các thương hiệu lớn",
    aboutBenefitsEn: "Intensive coaching in catwalk, stage presence, and poise\nMentorship in public speaking, critical thinking, and media communication\nProfessional high-fashion Photoshoot & personal brand building\nRunway showcase at the prestigious HUIT Bridal Fashion Show\nEngagement in meaningful volunteer community projects in Tay Ninh/Binh Phuoc\nExclusive opportunity to become the official Media Ambassador for HUIT and top partner brands",
    aboutPrize: "02 Quán quân (Nam/Nữ): 10.000.000 VNĐ/giải + Vương miện, Cúp, Sash, Giấy chứng nhận & Quà tặng Nhà tài trợ.\n02 Á quân (Nam/Nữ): 5.000.000 VNĐ/giải + Cúp, Sash, Giấy chứng nhận & Quà tặng Nhà tài trợ.\n07 Giải thưởng phụ xuất sắc (Best Talent, Best Interview, Best Photoshoot, Most Popular, Best Face, Best Evening Gown, Best Veston): Kỷ niệm chương, Sash, Giấy chứng nhận & Quà tặng NTT.",
    aboutPrizeEn: "02 Champions (Male/Female): 10,000,000 VND/each + Crown, Trophy, Sash, Certificate & Sponsor Gifts.\n02 Runners-up (Male/Female): 5,000,000 VND/each + Trophy, Sash, Certificate & Sponsor Gifts.\n07 Prestigious Special Awards (Best Talent, Best Interview, Best Photoshoot, Most Popular, Best Face, Best Evening Gown, Best Veston): Commemorative Trophy, Sash, Certificate & Sponsor Gifts.",
    aboutParticipants: "Đối tượng: Sinh viên đang theo học tại Trường Đại học Công Thương TP.HCM (HUIT) tại thời điểm đăng ký.\nNữ: Chiều cao từ 1m60 trở lên.\nNam: Chiều cao từ 1m70 trở lên.\nSức khỏe: Thể chất và tinh thần tốt, đủ khả năng tham gia xuyên suốt cuộc thi.\nĐạo đức: Phẩm chất tốt, không tiền án tiền sự, không chịu kỷ luật.\nKỹ năng: Tự tin, năng động, sáng tạo, yêu thích truyền thông và sẵn sàng tham gia hoạt động cộng đồng.",
    aboutParticipantsEn: "Eligibility: Currently enrolled students at Ho Chi Minh City University of Industry and Trade (HUIT).\nFemale Height: 1.60m and above.\nMale Height: 1.70m and above.\nHealth: Good physical and mental health to participate actively throughout the journey.\nEthics: Exemplary conduct, no disciplinary record or criminal background.\nSkills: Confident, dynamic, creative, passionate about media and community initiatives.",
    aboutContactName: "Thầy Đặng Xuân Dương (Trưởng BTC) / Khánh Linh (Hỗ trợ thí sinh)",
    aboutContactPhone: "0974 331 499 - 0708 765 157",
    aboutContactRole: "Ban Tổ chức HUIT's ICONIC 2026 - Trường Đại học Công Thương TP.HCM",
    aboutContactWebsite: "https://huit.edu.vn",
    aboutContactQrUrl: "/images/qrdangky.png",
    isRegistrationOpen: true,
    registrationDeadline: "2026-10-01T23:59",
    registrationUrl: "https://zalo.me/g/uxjmkq913",
    detailUrl: "https://huit.edu.vn",
    supportZaloUrl: "https://zalo.me/g/uxjmkq913",
    statsYear: "2026",
    statsCandidates: "40.000+",
    statsVotes: "1.000.000+",
    statsParticipants: "50 Top",
    statsViews: "10 triệu+",
    statsMedia: "30+",
    statsSchools: "16+ Khoa",
  };

  await prisma.systemSetting.upsert({
    where: { id: 'default' },
    update: { data: JSON.stringify(updatedSettings) },
    create: { id: 'default', data: JSON.stringify(updatedSettings) },
  });
  console.log('SystemSettings updated in MySQL.');

  // 2. Update TimelineEvents
  await prisma.timelineEvent.deleteMany({});
  console.log('Cleared old timeline events.');

  const official2026Events = [
    {
      id: 'tl-01',
      date: '05/09/2026',
      title: 'Phát động cuộc thi HUIT’s ICONIC 2026',
      titleEn: 'Official Launch of HUIT’s ICONIC 2026',
      description: 'Chính thức phát động cuộc thi Tìm kiếm Đại sứ Truyền thông HUIT 2026 và mở cổng tiếp nhận hồ sơ đăng ký dự thi trực tuyến.',
      descriptionEn: 'Official launch ceremony of HUIT’s ICONIC 2026 Media Ambassador Search and opening of online candidate registration portal.',
      round: 'Vòng loại',
      isImportant: true,
      isActive: true,
    },
    {
      id: 'tl-02',
      date: '01/10/2026',
      title: 'Buổi định hướng & Hướng dẫn thí sinh',
      titleEn: 'Orientation Day & Candidate Briefing',
      description: 'Gặp gỡ Ban Tổ chức, hướng dẫn hoàn thiện hồ sơ, thể lệ thi, quy chế và định hướng phong cách cá nhân cho các thí sinh.',
      descriptionEn: 'Meeting with the Organizing Committee, candidate guidance on rules, regulations, and personal style orientation.',
      round: 'Vòng loại',
      isImportant: false,
      isActive: true,
    },
    {
      id: 'tl-03',
      date: '04/10/2026',
      title: 'Vòng Sơ khảo & Tuyển chọn Top 50',
      titleEn: 'Preliminary Round & Top 50 Selection',
      description: 'Đo chỉ số nhân trắc học hình thể, trình diễn Catwalk tự chọn theo nhạc và phỏng vấn trực tiếp cùng Ban Giám Khảo để chọn ra Top 50 xuất sắc nhất.',
      descriptionEn: 'Anthropometric measurements, freestyle music runway walk, and direct interview with the Jury to select the Top 50 finalists.',
      round: 'Vòng loại',
      isImportant: true,
      isActive: true,
    },
    {
      id: 'tl-04',
      date: '10/10/2026',
      title: 'Bán kết 1: Thử thách Photoshoot chủ đề',
      titleEn: 'Semi-final 1: Concept Photoshoot Challenge',
      description: 'Thí sinh thực hiện chụp ảnh concept cùng trang phục, sản phẩm hoặc đạo cụ NTT; thể hiện khả năng tạo dáng và biểu cảm trước ống kính.',
      descriptionEn: 'Candidates execute concept photoshoot challenges with costumes and sponsor props, showcasing camera posing and expression skills.',
      round: 'Vòng bán kết',
      isImportant: false,
      isActive: true,
    },
    {
      id: 'tl-05',
      date: '01/11/2026',
      title: 'Bán kết 2: Vòng thi Tài năng (Best Talent)',
      titleEn: 'Semi-final 2: Talent Showcase Competition',
      description: 'Thí sinh thể hiện năng khiếu, tài năng nghệ thuật với các tiết mục dàn dựng sân khấu hóa đặc sắc nhằm tìm kiếm gương mặt Best Talent.',
      descriptionEn: 'Candidates present their artistic talents through theatrical stage performances to compete for the Best Talent award.',
      round: 'Vòng bán kết',
      isImportant: false,
      isActive: true,
    },
    {
      id: 'tl-06',
      date: '01/11/2026 - 11/12/2026',
      title: 'Training Kỹ năng & Huấn luyện Chuyên sâu',
      titleEn: 'Intensive Skills Training & Masterclasses',
      description: 'Chuỗi workshop đào tạo kỹ năng catwalk, giải phóng hình thể, phong thái sân khấu, kỹ năng giao tiếp, thuyết trình và xây dựng thương hiệu cá nhân.',
      descriptionEn: 'Series of masterclasses on runway catwalk, body poise, public speaking, communication, and personal branding.',
      round: 'Vòng bán kết',
      isImportant: false,
      isActive: true,
    },
    {
      id: 'tl-07',
      date: '12/12/2026',
      title: 'Bán kết 3: HUIT Bridal Fashion Show (TOP Model)',
      titleEn: 'Semi-final 3: HUIT Bridal Fashion Show - TOP Model',
      description: 'Thí sinh sải bước trên sàn diễn thời trang lớn HUIT Bridal Fashion Show với trang phục BTC chuẩn bị, thể hiện thần thái và kỹ năng catwalk đỉnh cao.',
      descriptionEn: 'Candidates grace the grand runway at HUIT Bridal Fashion Show, demonstrating top-tier catwalk technique and stage presence.',
      round: 'Vòng bán kết',
      isImportant: true,
      isActive: true,
    },
    {
      id: 'tl-08',
      date: '19/12/2026',
      title: 'Bán kết 4: Phỏng vấn kín & Hoạt động cộng đồng',
      titleEn: 'Semi-final 4: Closed-door Interview & Charity Project',
      description: 'Phỏng vấn trực tiếp trong không gian kín cùng Hội đồng BGK đánh giá tư duy, bản lĩnh và thực hiện dự án thiện nguyện vì cộng đồng tại Tây Ninh/Bình Phước.',
      descriptionEn: 'Direct closed-door interview with the Jury to assess leadership mindset, followed by community charity outreach in Tay Ninh/Binh Phuoc.',
      round: 'Vòng bán kết',
      isImportant: true,
      isActive: true,
    },
    {
      id: 'tl-09',
      date: '26/12/2026',
      title: 'GALA CHUNG KẾT XẾP HẠNG & TRAO GIẢI',
      titleEn: 'GRAND FINALE AWARDS GALA NIGHT',
      description: 'Đêm Gala Chung kết bùng nổ: Trình diễn Catwalk sân khấu lớn, Phần thi Phỏng vấn ứng xử 60 giây và Lễ vinh danh Quán quân Đại sứ Truyền thông HUIT 2026.',
      descriptionEn: 'Spectacular Grand Finale: Grand stage runway showcase, 60-second live Q&A interview, and crowning of HUIT’s ICONIC 2026 Champions.',
      round: 'Vòng chung kết',
      isImportant: true,
      isActive: true,
    },
    {
      id: 'tl-10',
      date: '09/01/2027',
      title: 'Hoạt động cộng đồng sau Chung kết',
      titleEn: 'Post-Finale Community & Goodwill Tour',
      description: 'Tân Quán quân, Á quân và các thí sinh tham gia chuỗi hoạt động thiện nguyện, truyền thông lan tỏa giá trị tích cực đến cộng đồng xã hội.',
      descriptionEn: 'Newly crowned Champions and finalists embark on goodwill charity tours and media campaigns spreading positive social values.',
      round: 'Vòng chung kết',
      isImportant: false,
      isActive: true,
    },
  ];

  for (const item of official2026Events) {
    await prisma.timelineEvent.create({ data: item });
  }
  console.log(`Seeded ${official2026Events.length} official 2026 timeline events.`);

  // 3. Seed Official 2026 News Posts
  const officialPosts = [
    {
      id: 'post-launch-2026',
      title: 'Chính thức phát động Cuộc thi Tìm kiếm Đại sứ Truyền thông HUIT’s ICONIC 2026',
      titleEn: 'Official Launch of HUIT’s ICONIC 2026 Media Ambassador Search Contest',
      slug: 'phat-dong-cuoc-thi-huits-iconic-2026',
      category: 'Tin tức',
      thumbnailUrl: '/uploads/baner.jpg',
      summary: 'Trường Đại học Công Thương TP. Hồ Chí Minh chính thức phát động mùa giải HUIT’s ICONIC 2026 với quy mô hơn 40.000 sinh viên cùng tổng giải thưởng hấp dẫn.',
      summaryEn: 'Ho Chi Minh City University of Industry and Trade officially launches HUIT’s ICONIC 2026 with over 40,000 students and attractive prizes.',
      content: `## HUIT’S ICONIC 2026 - Tỏa sáng vẻ đẹp, trí tuệ và bản lĩnh sinh viên HUIT

Sau dấu ấn rực rỡ của mùa đầu tiên năm 2024, **Cuộc thi Tìm kiếm Đại sứ Truyền thông HUIT – HUIT’s Iconic** chính thức trở lại vào năm 2026 với quy mô và diện mạo hoàn toàn mới.

### Mục đích & Sứ mệnh
Với triết lý giáo dục **“Học tập chủ động, làm việc sáng tạo, sống có trách nhiệm”**, trải qua hơn 40 năm hình thành và phát triển, Nhà trường luôn chú trọng xây dựng môi trường học tập năng động, sáng tạo, tạo điều kiện để sinh viên phát triển toàn diện.

Cuộc thi hướng đến tìm kiếm những sinh viên tiêu biểu hội tụ vẻ đẹp, trí tuệ, tài năng, bản lĩnh và khả năng truyền cảm hứng từ những điều bình dị trong cuộc sống thường ngày.

### Quyền lợi đặc biệt dành cho thí sinh
- Được đào tạo kỹ năng catwalk, phong thái biểu diễn và giải phóng hình thể chuyên nghiệp.
- Tham gia các workshop giao tiếp, ứng xử, tư duy phản biện và xây dựng thương hiệu cá nhân.
- Trình diễn tại sàn diễn thời trang danh giá **HUIT Bridal Fashion Show**.
- Đại diện hình ảnh Nhà trường trong các chiến dịch truyền thông lớn và sự kiện quốc tế.

Thí sinh đăng ký tham gia ngay tại website hoặc tham gia nhóm Zalo chính thức: [https://zalo.me/g/uxjmkq913](https://zalo.me/g/uxjmkq913).`,
      contentEn: `## HUIT’S ICONIC 2026 - Inspiring Beauty, Intellect, and Confidence in HUIT Students

Following the remarkable success of the inaugural season in 2024, the **HUIT Media Ambassador Search Contest – HUIT’s Iconic** officially returns in 2026 with a brand-new scale and look.

### Purpose & Mission
Guided by the educational philosophy **'Active learning, creative working, responsible living'** spanning over 40 years of development, the University continuously builds a dynamic, creative environment where students develop comprehensively.

The competition aims to discover outstanding students who embody beauty, intellect, talent, confidence, and the power to inspire through everyday life stories.

### Exclusive Candidate Privileges
- Professional training in runway catwalk, posture, and stage presence.
- Masterclasses in communication, critical thinking, and personal brand building.
- Runway appearance at the prestigious **HUIT Bridal Fashion Show**.
- Becoming the official brand ambassadors for the University in major media campaigns and international events.`,
      views: 1250,
      isActive: true,
    },
    {
      id: 'post-rules-2026',
      title: 'Công bố Thể lệ & Cơ cấu Giải thưởng Cuộc thi HUIT’s ICONIC 2026',
      titleEn: 'Official Rules, Eligibility & Award Structure for HUIT’s ICONIC 2026',
      slug: 'the-le-co-cau-giai-thuong-huits-iconic-2026',
      category: 'Thông báo',
      thumbnailUrl: '/uploads/poster-khoi-nghiep.jpg',
      summary: 'Ban Tổ chức công bố chi tiết tiêu chuẩn dự thi, quy trình 4 vòng thi và cơ cấu giải thưởng chính thức cho mùa giải 2026.',
      summaryEn: 'The Organizing Committee announces detailed candidate requirements, 4 competition rounds, and official prize structure for 2026.',
      content: `## Thông tin Thể lệ & Giải thưởng HUIT’s ICONIC 2026

### 1. Điều kiện dự thi
- **Đối tượng:** Là sinh viên đang theo học tại Trường Đại học Công Thương TP.HCM (HUIT).
- **Chiều cao:** Nữ từ 1m60 trở lên, Nam từ 1m70 trở lên.
- **Sức khỏe & Đạo đức:** Thể chất tốt, phẩm chất đạo đức tốt, không chịu kỷ luật.

### 2. Cơ cấu Giải thưởng
- **02 Quán quân Đại sứ Truyền thông (Nam/Nữ):** 10.000.000 VNĐ/giải + Vương miện, Cúp, Sash, Giấy chứng nhận & Quà tặng NTT.
- **02 Á quân Đại sứ Truyền thông (Nam/Nữ):** 5.000.000 VNĐ/giải + Cúp, Sash, Giấy chứng nhận & Quà tặng NTT.
- **07 Giải thưởng phụ:** Best Talent, Best Interview, Best Photoshoot, Most Popular, Best Face, Best Evening Gown, Best Veston.`,
      contentEn: `## Official Rules & Award Structure for HUIT’s ICONIC 2026

### 1. Eligibility Criteria
- **Target Group:** Currently enrolled students at Ho Chi Minh City University of Industry and Trade (HUIT).
- **Height Requirements:** Female from 1.60m and above; Male from 1.70m and above.
- **Health & Conduct:** Good physical health, exemplary ethics, no disciplinary record.

### 2. Award Structure
- **02 Champions (Male/Female):** 10,000,000 VND/each + Crown, Trophy, Sash, Certificate & Sponsor Gifts.
- **02 Runners-up (Male/Female):** 5,000,000 VND/each + Trophy, Sash, Certificate & Sponsor Gifts.
- **07 Special Awards:** Best Talent, Best Interview, Best Photoshoot, Most Popular, Best Face, Best Evening Gown, Best Veston.`,
      views: 980,
      isActive: true,
    },
    {
      id: 'post-fashion-show-2026',
      title: 'HUIT Bridal Fashion Show 2026: Sàn diễn thời trang bùng nổ của Top thí sinh',
      titleEn: 'HUIT Bridal Fashion Show 2026: Spectacular Runway for ICONIC Finalists',
      slug: 'huit-bridal-fashion-show-2026',
      category: 'Sự kiện',
      thumbnailUrl: '/uploads/nhataitro.png',
      summary: 'Vòng thi Bán kết 3 TOP Model sẽ diễn ra trong khuôn khổ sự kiện HUIT Bridal Fashion Show quy tụ nhiều chuyên gia thời trang hàng đầu.',
      summaryEn: 'Semi-final 3 TOP Model round will take place within HUIT Bridal Fashion Show featuring top fashion industry leaders.',
      content: `## Sàn diễn HUIT Bridal Fashion Show 2026

Sự kiện thời trang đặc biệt **HUIT Bridal Fashion Show** được tổ chức vào ngày **12/12/2026** là điểm nhấn nổi bật trong khuôn khổ Vòng Bán kết HUIT's ICONIC 2026.

Tại đây, các thí sinh sẽ được khoác lên mình những bộ trang phục dạ hội và trang phục cưới cao cấp do Ban Tổ chức chuẩn bị, thể hiện trọn vẹn kỹ năng catwalk, thần thái và bản lĩnh sân khấu trước hàng ngàn khán giả và Hội đồng Giám khảo chuyên môn.`,
      contentEn: `## HUIT Bridal Fashion Show 2026 Runway

The sensational **HUIT Bridal Fashion Show** taking place on **December 12, 2026** is the highlight of HUIT's ICONIC 2026 Semi-final Round.

Finalists will present high-fashion bridal and evening gown collections, showcasing their catwalk technique, elegance, and stage charisma before thousands of spectators and the expert Jury.`,
      views: 840,
      isActive: true,
    }
  ];

  for (const post of officialPosts) {
    await prisma.post.upsert({
      where: { slug: post.slug },
      update: post,
      create: post,
    });
  }
  console.log(`Seeded ${officialPosts.length} official news posts.`);

  await prisma.$disconnect();
  console.log('=== DATA UPDATE COMPLETED SUCCESSFULLY! ===');
}

updateData().catch(async (e) => {
  console.error(e);
  await prisma.$disconnect();
  process.exit(1);
});
