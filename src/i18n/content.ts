import type { Language } from './index';

export function localizedText(language: Language, primary?: string | null, english?: string | null): string {
  if (language === 'en' && english?.trim()) return english;
  return primary || '';
}
