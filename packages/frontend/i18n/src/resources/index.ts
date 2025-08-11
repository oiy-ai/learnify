import en from './en.json' assert { type: 'json' };

export type Language = 'en' | 'zh-Hans' | 'zh-Hant';

export type LanguageResource = typeof en;
export const SUPPORTED_LANGUAGES: Record<
  Language,
  {
    name: string;
    originalName: string;
    flagEmoji: string;
    resource:
      | LanguageResource
      | (() => Promise<{ default: Partial<LanguageResource> }>);
  }
> = {
  en: {
    name: 'English',
    originalName: 'English',
    flagEmoji: '🇬🇧',
    resource: en,
  },
  'zh-Hans': {
    name: 'Simplified Chinese',
    originalName: '简体中文',
    flagEmoji: '🇨🇳',
    resource: () => import('./zh-Hans.json'),
  },
  'zh-Hant': {
    name: 'Traditional Chinese',
    originalName: '繁體中文',
    flagEmoji: '🇭🇰',
    resource: () => import('./zh-Hant.json'),
  },
};
