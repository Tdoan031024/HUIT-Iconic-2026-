export type Language = 'vi' | 'en';

export const languageLabels: Record<Language, string> = {
  vi: 'Tiếng Việt',
  en: 'English',
};

const translations = {
  vi: {
    // Navigation & Common
    home: 'Trang chủ',
    about: 'Giới thiệu',
    schedule: 'Thời gian',
    ranking: 'Bảng xếp hạng',
    guide: 'Hướng dẫn',
    news: 'Tin tức',
    login: 'Đăng nhập',
    logout: 'Đăng xuất',
    greeting: 'Xin chào',
    openMenu: 'Mở menu',
    closeMenu: 'Đóng menu',
    lightTheme: 'Bật giao diện sáng',
    darkTheme: 'Bật giao diện tối',
    changeTheme: 'Đổi giao diện sáng/tối',
    search: 'Tìm kiếm',
    aboutCompetition: 'Giới thiệu cuộc thi',
    criteria: 'Tiêu chí & Thể lệ',
    eventSchedule: 'Lịch trình sự kiện',
    votingGuide: 'Hướng dẫn bình chọn',
    faq: 'Câu hỏi thường gặp',
    contactOrganizers: 'Liên hệ ban tổ chức',
    huitPortal: 'Cổng thông tin HUIT',
    aboutUs: 'Về chúng tôi',
    support: 'Hỗ trợ',
    supportCenter: 'Trung tâm hỗ trợ',
    contactInfo: 'Thông tin liên hệ',
    backHome: 'Quay lại Trang chủ',
    language: 'Ngôn ngữ',

    // Contest & Tables
    allTables: 'Tất cả bảng',
    tableHighSchool: 'Bảng học sinh',
    tableStudent: 'Bảng sinh viên',
    tableEnterprise: 'Bảng doanh nghiệp',
    candidate: 'Thí sinh',
    candidates: 'Danh sách thí sinh',
    candidatesCount: 'thí sinh',
    sbd: 'SBD',
    votes: 'Điểm bình chọn',
    voteNow: 'Bình chọn ngay',
    viewDetails: 'Xem chi tiết',
    searchPlaceholder: 'Tìm kiếm theo tên thí sinh, SBD, trường...',
    filterByTable: 'Lọc theo bảng thi',
    sortByVotesDesc: 'Điểm cao nhất',
    sortByVotesAsc: 'Điểm thấp nhất',
    sortBySbdAsc: 'SBD tăng dần',
    noCandidatesFound: 'Không tìm thấy thí sinh phù hợp.',
    topRank: 'Xếp hạng',
    rank: 'Hạng',

    // Rounds & Timeline
    roundPreliminary: 'Vòng sơ khảo',
    roundSemiFinal: 'Vòng bán kết',
    roundFinal: 'Vòng chung kết',
    roundGala: 'Gala trao giải',
    currentRound: 'Vòng thi hiện tại',
    timelineSubtitle: 'Hành trình cuộc thi HUIT\'s ICONIC 2026',
    addToCalendar: 'Thêm vào lịch',
    viewSchedule: 'Xem toàn bộ lịch trình',

    // Countdown & Voting Gate
    votingGateOpen: 'Cổng bình chọn đang mở',
    votingGateClosed: 'Cổng bình chọn đã đóng',
    votingGateOpensIn: 'Cổng bình chọn sẽ mở sau',
    votingGateClosesIn: 'Thời gian còn lại của Cổng bình chọn',
    days: 'Ngày',
    hours: 'Giờ',
    minutes: 'Phút',
    seconds: 'Giây',
    points: 'điểm',
    pointUnit: 'điểm',

    // Candidate Detail
    teamName: 'Tên nhóm / Dự án',
    schoolOrUnit: 'Đơn vị / Trường',
    teamLeader: 'Trưởng nhóm',
    advisor: 'Cố vấn chuyên môn',
    membersList: 'Thành viên nhóm',
    implementationLocation: 'Địa điểm triển khai',
    sector: 'Lĩnh vực',
    intellectualProperty: 'Cam kết sở hữu trí tuệ',
    ipCommitted: 'Đã cam kết bản quyền',
    ipNotCommitted: 'Chưa cam kết',
    projectOverview: 'Mô tả tổng quan dự án',
    detailedProposal: 'Thuyết minh chi tiết',
    supportNeeds: 'Nhu cầu hỗ trợ & Gọi vốn',
    expectations: 'Kỳ vọng sau cuộc thi',
    showcaseGallery: 'Hình ảnh trưng bày dự án',
    shareProject: 'Chia sẻ dự án',
    copyLink: 'Sao chép liên kết',
    linkCopied: 'Đã sao chép liên kết!',
    downloadPoster: 'Tải poster bình chọn',
    candidateNotFound: 'Không tìm thấy thông tin thí sinh.',
    backToRanking: 'Quay lại Bảng xếp hạng',

    // Introduction & Highlights
    themeVideoTitle: 'Video chủ đề cuộc thi',
    watchVideo: 'Xem video',
    competitionHighlights: 'Điểm nổi bật của cuộc thi',
    keySectors: 'Lĩnh vực trọng tâm',
    benefitsForParticipants: 'Quyền lợi khi tham gia',
    prizeStructure: 'Cơ cấu giải thưởng',
    statsHighlight: 'Thống kê ấn tượng',
    statsCandidatesLabel: 'Dự án tham gia',
    statsVotesLabel: 'Lượt bình chọn',
    statsViewsLabel: 'Lượt tiếp cận',
    statsParticipantsLabel: 'Sinh viên tham dự',
    statsSchoolsLabel: 'Trường ĐH / THPT',
    statsMediaLabel: 'Báo chí đưa tin',
    contactAndRegister: 'Liên hệ & Đăng ký tham gia',
    registerNow: 'Đăng ký ngay',
    scanQrToRegister: 'Quét mã QR để đăng ký tham gia',
    organizerLabel: 'Đơn vị tổ chức',

    // Sponsors & Partners
    sponsorsAndPartners: 'NHÀ TÀI TRỢ & ĐỐI TÁC',
    sponsorsSubtitle: 'Đồng hành cùng sự phát triển và tỏa sáng của thế hệ trẻ HUIT',
    tierPlatinum: 'NHÀ TÀI TRỢ BẠCH KIM',
    tierGold: 'NHÀ TÀI TRỢ VÀNG',
    tierSilver: 'NHÀ TÀI TRỢ BẠC',
    tierPartner: 'ĐỐI TÁC ĐỒNG HÀNH',
    viewWebsite: 'Ghé thăm website',

    // News & Posts
    latestNews: 'TIN TỨC & SỰ KIỆN MỚI NHẤT',
    newsSubtitle: 'Cập nhật liên tục những thông tin nóng hổi nhất từ ban tổ chức',
    readMore: 'Đọc tiếp',
    viewAllNews: 'Xem tất cả tin tức',
    categoryNews: 'Tin tức',
    categoryNotice: 'Thông báo',
    viewsCount: 'lượt xem',
    publishedOn: 'Đăng ngày',
    backToNewsList: 'Quay lại danh sách tin tức',

    // Rules & Guidelines
    rulesAndGuideTitle: 'Thể lệ & Hướng dẫn tham gia',
    rulesSubtitle: 'Quy chế chính thức và hướng dẫn bình chọn chi tiết',
    rulesTabGeneral: '1. Thể lệ cuộc thi',
    rulesTabVoting: '2. Quy chế bình chọn',
    rulesTabPackages: '3. Gói bình chọn',
    rulesTabFaq: '4. Câu hỏi thường gặp',

    // Vote Modal & User
    voteForCandidate: 'Bình chọn cho thí sinh',
    loginToVote: 'Vui lòng đăng nhập để bình chọn',
    loginWithGoogle: 'Đăng nhập bằng Google',
    loginWithEmail: 'Đăng nhập bằng Email',
    freeDailyVotes: 'Lượt bình chọn miễn phí hàng ngày',
    paidVotesPackages: 'Gói điểm bình chọn tiếp sức',
    selectVoteAmount: 'Chọn số điểm muốn bình chọn',
    confirmVoteAction: 'Xác nhận bình chọn',
    votingProcessing: 'Đang xử lý bình chọn...',
    voteSuccessTitle: 'Bình chọn thành công!',
    voteSuccessMessage: 'Cảm ơn bạn đã tiếp sức cho thí sinh!',
    closeBtn: 'Đóng',
    cancelBtn: 'Hủy',

    // Footer
    footerRights: 'Bản quyền thuộc về Trường Đại học Công Thương TP.HCM (HUIT).',
    footerAddress: '140 Lê Trọng Tấn, P. Tây Thạnh, Q. Tân Phú, TP. Hồ Chí Minh',
    footerHotline: 'Hotline',
    footerEmail: 'Email',
    quickLinks: 'Liên kết nhanh',
  },

  en: {
    // Navigation & Common
    home: 'Home',
    about: 'About',
    schedule: 'Schedule',
    ranking: 'Leaderboard',
    guide: 'Guidelines',
    news: 'News',
    login: 'Sign in',
    logout: 'Sign out',
    greeting: 'Hello',
    openMenu: 'Open menu',
    closeMenu: 'Close menu',
    lightTheme: 'Switch to light mode',
    darkTheme: 'Switch to dark mode',
    changeTheme: 'Toggle theme',
    search: 'Search',
    aboutCompetition: 'About the competition',
    criteria: 'Criteria & Rules',
    eventSchedule: 'Event schedule',
    votingGuide: 'Voting guide',
    faq: 'Frequently Asked Questions',
    contactOrganizers: 'Contact organizers',
    huitPortal: 'HUIT information portal',
    aboutUs: 'About us',
    support: 'Support',
    supportCenter: 'Support center',
    contactInfo: 'Contact information',
    backHome: 'Back to Home',
    language: 'Language',

    // Contest & Tables
    allTables: 'All Tracks',
    tableHighSchool: 'High School Track',
    tableStudent: 'University Student Track',
    tableEnterprise: 'Enterprise & Startup Track',
    candidate: 'Candidate',
    candidates: 'Candidates list',
    candidatesCount: 'candidates',
    sbd: 'ID',
    votes: 'Voting Points',
    voteNow: 'Vote Now',
    viewDetails: 'View Details',
    searchPlaceholder: 'Search by candidate name, ID, institution...',
    filterByTable: 'Filter by track',
    sortByVotesDesc: 'Highest Points',
    sortByVotesAsc: 'Lowest Points',
    sortBySbdAsc: 'Candidate ID (Ascending)',
    noCandidatesFound: 'No matching candidates found.',
    topRank: 'Rank',
    rank: 'Rank',

    // Rounds & Timeline
    roundPreliminary: 'Preliminary Round',
    roundSemiFinal: 'Semi-Final Round',
    roundFinal: 'Grand Finale',
    roundGala: 'Awards Gala',
    currentRound: 'Current Round',
    timelineSubtitle: 'Official Journey of HUIT\'s ICONIC 2026',
    addToCalendar: 'Add to Calendar',
    viewSchedule: 'View Full Schedule',

    // Countdown & Voting Gate
    votingGateOpen: 'Voting Portal is OPEN',
    votingGateClosed: 'Voting Portal is CLOSED',
    votingGateOpensIn: 'Voting Portal opens in',
    votingGateClosesIn: 'Voting Portal closes in',
    days: 'Days',
    hours: 'Hours',
    minutes: 'Minutes',
    seconds: 'Seconds',
    points: 'points',
    pointUnit: 'pts',

    // Candidate Detail
    teamName: 'Team / Project Name',
    schoolOrUnit: 'Institution / School',
    teamLeader: 'Team Leader',
    advisor: 'Faculty Advisor',
    membersList: 'Team Members',
    implementationLocation: 'Target Location',
    sector: 'Industry / Sector',
    intellectualProperty: 'IP & Copyright Commitment',
    ipCommitted: 'Copyright Committed',
    ipNotCommitted: 'Pending Commitment',
    projectOverview: 'Executive Summary',
    detailedProposal: 'Detailed Proposal',
    supportNeeds: 'Incubation & Funding Needs',
    expectations: 'Post-Contest Goals',
    showcaseGallery: 'Project Gallery & Showcase',
    shareProject: 'Share Project',
    copyLink: 'Copy Link',
    linkCopied: 'Link copied to clipboard!',
    downloadPoster: 'Download Voting Poster',
    candidateNotFound: 'Candidate not found.',
    backToRanking: 'Back to Leaderboard',

    // Introduction & Highlights
    themeVideoTitle: 'Official Theme Video',
    watchVideo: 'Watch Video',
    competitionHighlights: 'Key Highlights',
    keySectors: 'Core Sectors',
    benefitsForParticipants: 'Participant Benefits',
    prizeStructure: 'Prize Structure',
    statsHighlight: 'Impressive Figures',
    statsCandidatesLabel: 'Participating Projects',
    statsVotesLabel: 'Total Votes Cast',
    statsViewsLabel: 'Public Reach',
    statsParticipantsLabel: 'Students Engaged',
    statsSchoolsLabel: 'Schools & Universities',
    statsMediaLabel: 'Media Outlets',
    contactAndRegister: 'Contact & Registration',
    registerNow: 'Register Now',
    scanQrToRegister: 'Scan QR Code to register your project',
    organizerLabel: 'Organizer',

    // Sponsors & Partners
    sponsorsAndPartners: 'SPONSORS & STRATEGIC PARTNERS',
    sponsorsSubtitle: 'Accompanying the growth and brilliance of the young generation at HUIT',
    tierPlatinum: 'PLATINUM SPONSORS',
    tierGold: 'GOLD SPONSORS',
    tierSilver: 'SILVER SPONSORS',
    tierPartner: 'STRATEGIC PARTNERS',
    viewWebsite: 'Visit Website',

    // News & Posts
    latestNews: 'LATEST NEWS & UPDATES',
    newsSubtitle: 'Stay tuned with the hottest announcements from the Organizing Committee',
    readMore: 'Read More',
    viewAllNews: 'View All News',
    categoryNews: 'News',
    categoryNotice: 'Announcement',
    viewsCount: 'views',
    publishedOn: 'Published on',
    backToNewsList: 'Back to News List',

    // Rules & Guidelines
    rulesAndGuideTitle: 'Rules & Participation Guidelines',
    rulesSubtitle: 'Official regulations and comprehensive voting guidance',
    rulesTabGeneral: '1. Competition Rules',
    rulesTabVoting: '2. Voting Regulations',
    rulesTabPackages: '3. Voting Packages',
    rulesTabFaq: '4. FAQ',

    // Vote Modal & User
    voteForCandidate: 'Vote for Candidate',
    loginToVote: 'Please sign in to vote',
    loginWithGoogle: 'Sign in with Google',
    loginWithEmail: 'Sign in with Email',
    freeDailyVotes: 'Daily Free Votes',
    paidVotesPackages: 'Booster Voting Packages',
    selectVoteAmount: 'Select points to vote',
    confirmVoteAction: 'Confirm Vote',
    votingProcessing: 'Processing your vote...',
    voteSuccessTitle: 'Vote Successful!',
    voteSuccessMessage: 'Thank you for supporting this candidate!',
    closeBtn: 'Close',
    cancelBtn: 'Cancel',

    // Footer
    footerRights: 'Copyright © Ho Chi Minh City University of Industry and Trade (HUIT). All rights reserved.',
    footerAddress: '140 Le Trong Tan Street, Tay Thanh Ward, Tan Phu District, HCMC, Vietnam',
    footerHotline: 'Hotline',
    footerEmail: 'Email',
    quickLinks: 'Quick Links',
  },
} as const;

export type TranslationKey = keyof typeof translations.vi;

export function translate(language: Language, key: TranslationKey): string {
  if (!translations[language]) return translations.vi[key] || '';
  return translations[language][key] || translations.vi[key] || '';
}

export function localizeTable(table?: string | null, language: Language = 'vi'): string {
  if (!table) return '';
  if (table === 'HIGH_SCHOOL') return language === 'en' ? 'High School Track' : 'Bảng học sinh';
  if (table === 'STUDENT') return language === 'en' ? 'University Student Track' : 'Bảng sinh viên';
  if (table === 'ENTERPRISE') return language === 'en' ? 'Enterprise & Startup Track' : 'Bảng doanh nghiệp';
  return table;
}

export function localizeRound(round?: string | null, language: Language = 'vi'): string {
  if (!round) return '';
  if (language === 'vi') return round;
  const lower = round.toLowerCase();
  if (lower.includes('loại') || lower.includes('sơ')) return 'Preliminary Round';
  if (lower.includes('bán')) return 'Semi-Final Round';
  if (lower.includes('chung')) return 'Grand Finale';
  if (lower.includes('gala')) return 'Awards Gala';
  return round;
}
