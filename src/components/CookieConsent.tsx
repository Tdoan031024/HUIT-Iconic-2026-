'use client';

import { useEffect, useState } from 'react';

const CONSENT_KEY = 'iconic_cookie_consent';

export function CookieConsent() {
  const [visible, setVisible] = useState(false);
  const [language, setLanguage] = useState<'vi' | 'en'>('vi');

  useEffect(() => {
    setVisible(!localStorage.getItem(CONSENT_KEY));
    const syncLanguage = () => {
      const next = localStorage.getItem('iconic_language');
      if (next === 'vi' || next === 'en') setLanguage(next);
    };
    syncLanguage();
    window.addEventListener('iconic-language-change', syncLanguage);
    return () => window.removeEventListener('iconic-language-change', syncLanguage);
  }, []);

  const choose = (value: 'accepted' | 'declined') => {
    localStorage.setItem(CONSENT_KEY, value);
    document.cookie = `iconic_cookie_consent=${value}; Max-Age=31536000; Path=/; SameSite=Lax`;
    setVisible(false);
  };

  if (!visible) return null;

  const isEnglish = language === 'en';
  return (
    <aside className="cookie-consent" role="dialog" aria-label={isEnglish ? 'Cookie settings' : 'Cài đặt cookie'}>
      <div className="cookie-consent-icon" aria-hidden="true">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
          <path d="M20.5 13.5A8.5 8.5 0 1 1 10.5 3.2a5.8 5.8 0 0 0 10 10.3Z" />
          <circle cx="8.2" cy="11" r=".8" fill="currentColor" />
          <circle cx="12" cy="16" r=".8" fill="currentColor" />
          <circle cx="14" cy="8" r=".8" fill="currentColor" />
        </svg>
      </div>
      <div className="cookie-consent-copy">
        <strong>{isEnglish ? 'Your privacy matters' : 'Quyền riêng tư của bạn'}</strong>
        <p>{isEnglish ? 'We use essential cookies to keep ICONIC running smoothly.' : 'Chúng tôi dùng cookie cần thiết để website ICONIC hoạt động ổn định.'}</p>
      </div>
      <div className="cookie-consent-actions">
        <button type="button" className="cookie-consent-decline" onClick={() => choose('declined')}>
          {isEnglish ? 'Decline' : 'Từ chối'}
        </button>
        <button type="button" className="cookie-consent-accept" onClick={() => choose('accepted')}>
          {isEnglish ? 'Accept' : 'Đồng ý'}
        </button>
      </div>
    </aside>
  );
}
