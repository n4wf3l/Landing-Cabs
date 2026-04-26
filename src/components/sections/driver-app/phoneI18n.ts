import globalI18n from '@/i18n'
import type { LocaleCode } from '@/lib/constants'

const PHONE_LANG_KEY = 'cabs-phone-sim-lang-v1'
const SUPPORTED: ReadonlyArray<LocaleCode> = ['fr', 'en', 'nl', 'de'] as const

function isSupported(lng: unknown): lng is LocaleCode {
  return typeof lng === 'string' && SUPPORTED.includes(lng as LocaleCode)
}

function readStoredLang(): LocaleCode | null {
  if (typeof window === 'undefined') return null
  try {
    const v = window.localStorage.getItem(PHONE_LANG_KEY)
    return isSupported(v) ? v : null
  } catch {
    return null
  }
}

export const phoneI18n = globalI18n.cloneInstance()

const initialLang = readStoredLang() ?? (isSupported(globalI18n.language) ? globalI18n.language : 'fr')
void phoneI18n.changeLanguage(initialLang)

export function setPhoneLang(lng: LocaleCode) {
  void phoneI18n.changeLanguage(lng)
  if (typeof window !== 'undefined') {
    try {
      window.localStorage.setItem(PHONE_LANG_KEY, lng)
    } catch {
      /* noop */
    }
  }
}
