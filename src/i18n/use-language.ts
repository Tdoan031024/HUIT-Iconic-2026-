'use client';

import { useEffect, useState } from 'react';
import type { Language } from './index';

export function useLanguage(): Language {
  const [language, setLanguage] = useState<Language>('vi');

  useEffect(() => {
    const readLanguage = () => {
      const value = localStorage.getItem('iconic_language');
      if (value === 'vi' || value === 'en') setLanguage(value);
    };
    readLanguage();
    window.addEventListener('storage', readLanguage);
    window.addEventListener('iconic-language-change', readLanguage);
    return () => {
      window.removeEventListener('storage', readLanguage);
      window.removeEventListener('iconic-language-change', readLanguage);
    };
  }, []);

  return language;
}
