import 'server-only';
import { DEFAULT_LOCALE, type LocaleCode } from './locales';

export const LOCALE_COOKIE = 'lang';

// System dashboard is English-only — no locale toggle. Always resolve to en
// regardless of any stale `lang` cookie.
export async function getLocale(): Promise<LocaleCode> {
  return DEFAULT_LOCALE;
}
