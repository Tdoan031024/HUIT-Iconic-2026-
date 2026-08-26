export type Language = 'vi' | 'en';

export const languageLabels: Record<Language, string> = {
  vi: 'Tiếng Việt',
  en: 'English',
};

const translations = {
  vi: {
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
  },
  en: {
    home: 'Home',
    about: 'About',
    schedule: 'Schedule',
    ranking: 'Ranking',
    guide: 'Guide',
    news: 'News',
    login: 'Sign in',
    logout: 'Sign out',
    greeting: 'Hello',
    openMenu: 'Open menu',
    closeMenu: 'Close menu',
    lightTheme: 'Switch to light mode',
    darkTheme: 'Switch to dark mode',
    changeTheme: 'Change theme',
    search: 'Search',
    aboutCompetition: 'About the competition',
    criteria: 'Criteria & rules',
    eventSchedule: 'Event schedule',
    votingGuide: 'Voting guide',
    faq: 'Frequently asked questions',
    contactOrganizers: 'Contact organizers',
    huitPortal: 'HUIT information portal',
    aboutUs: 'About us',
    support: 'Support',
    supportCenter: 'Support center',
    contactInfo: 'Contact information',
    backHome: 'Back to home',
    language: 'Language',
  },
} as const;

export type TranslationKey = keyof typeof translations.vi;

export function translate(language: Language, key: TranslationKey): string {
  return translations[language][key] || translations.vi[key];
}
