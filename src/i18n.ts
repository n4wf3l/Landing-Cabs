import i18n from 'i18next'
import LanguageDetector from 'i18next-browser-languagedetector'
import { initReactI18next } from 'react-i18next'

// Async locale loading. Bundling all 4 locales eagerly inlined ~200 KB
// of JSON in the main bundle that the main thread had to parse on
// every page load. On real mobile that's a measurable hit on top of
// the React commit. Now only the detected language is fetched as its
// own chunk; the others load on demand when the user switches.

type LocaleCode = 'fr' | 'en' | 'nl' | 'de'

const SUPPORTED: LocaleCode[] = ['fr', 'en', 'nl', 'de']
const DEFAULT_LOCALE: LocaleCode = 'fr'

async function loadLocale(lng: string): Promise<unknown> {
  const code = (SUPPORTED.includes(lng as LocaleCode)
    ? lng
    : DEFAULT_LOCALE) as LocaleCode
  switch (code) {
    case 'fr':
      return (await import('./locales/fr.json')).default
    case 'en':
      return (await import('./locales/en.json')).default
    case 'nl':
      return (await import('./locales/nl.json')).default
    case 'de':
      return (await import('./locales/de.json')).default
  }
}

void i18n
  .use(LanguageDetector)
  .use(initReactI18next)
  .init({
    resources: {},
    fallbackLng: DEFAULT_LOCALE,
    supportedLngs: SUPPORTED,
    interpolation: { escapeValue: false },
    detection: {
      order: ['localStorage', 'navigator', 'htmlTag'],
      caches: ['localStorage'],
      lookupLocalStorage: 'cabs-lang',
    },
    // No suspense; we'll just hot-add the bundle once it lands.
    react: { useSuspense: false },
  })
  .then(async () => {
    const lng = (i18n.resolvedLanguage as LocaleCode) || DEFAULT_LOCALE
    const data = await loadLocale(lng)
    i18n.addResourceBundle(lng, 'translation', data, true, true)
    void i18n.changeLanguage(lng)
  })

i18n.on('languageChanged', (lng) => {
  if (typeof document !== 'undefined') {
    document.documentElement.setAttribute('lang', lng)
  }
  // Lazy-load the locale on demand if it hasn't been bundled yet.
  if (!i18n.hasResourceBundle(lng, 'translation')) {
    void loadLocale(lng).then((data) => {
      i18n.addResourceBundle(lng, 'translation', data, true, true)
    })
  }
})

export default i18n
