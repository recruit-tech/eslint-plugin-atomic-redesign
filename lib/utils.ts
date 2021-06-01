import localeCode from 'locale-code';
import osLocale from 'os-locale';

export const testString = (str: string, pattern: string): boolean =>
  new RegExp(pattern).test(str);

export type LocaleObject<T> = { en: T; [key: string]: T };
export const localize = <T>(obj: LocaleObject<T>): T => {
  const lang_code = localeCode.getLanguageCode(osLocale.sync());

  if (obj.hasOwnProperty(lang_code)) return obj[lang_code];
  return obj.en;
};
