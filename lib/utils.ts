import localeCode from 'locale-code';
import osLocale from 'os-locale';

export const testString = (() => {
  const regExpCache: Map<string, RegExp> = new Map();

  return (str: string, pattern: string): boolean => {
    const cache = regExpCache.get(pattern);
    if (cache !== undefined) return cache.test(str);

    const newRegExp = new RegExp(pattern);
    regExpCache.set(pattern, newRegExp);
    return newRegExp.test(str);
  };
})();

export type LocaleObject<T> = { en: T; [key: string]: T };
export const localize = <T>(obj: LocaleObject<T>): T => {
  const lang_code = localeCode.getLanguageCode(osLocale.sync());

  if (obj.hasOwnProperty(lang_code)) return obj[lang_code];
  return obj.en;
};
