import { ui, defaultLang, showDefaultLang, type SupportedLanguage } from './ui';

export function getLangFromUrl(url: URL): SupportedLanguage {
  const [, lang] = url.pathname.split('/');
  if (lang in ui) return lang as SupportedLanguage;
  return defaultLang;
}

export function useTranslations(lang: SupportedLanguage) {
  const localizedUI = ui[lang];
  return function t(key: keyof (typeof ui)[typeof defaultLang]): string {
    return (localizedUI as Record<string, string>)[key] || ui[defaultLang][key] || key;
  };
}

export function useTranslatedPath(lang: SupportedLanguage) {
  return function translatePath(path: string, l: SupportedLanguage = lang): string {
    const cleanPath = path.startsWith('/') ? path : `/${path}`;
    return !showDefaultLang && l === defaultLang ? cleanPath : `/${l}${cleanPath === '/' ? '' : cleanPath}`;
  };
}
