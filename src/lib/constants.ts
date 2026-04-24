export const BRAND = {
  name: 'Cabs',
  tagline: 'La plateforme que les opérateurs de taxi méritent.',
  email: 'hello@cabs.brussels',
  city: 'Brussels',
  url: 'https://cabs.brussels',
  instagram: 'https://instagram.com/cabs.brussels',
  linkedin: 'https://linkedin.com/company/cabs-brussels',
  launchDate: 'Septembre 2026',
} as const

export const NAV_ANCHORS = [
  { href: '#product', key: 'nav.product' },
  { href: '#team', key: 'nav.team' },
] as const

export const LOCALES = [
  { code: 'fr', label: 'Français' },
  { code: 'en', label: 'English' },
  { code: 'nl', label: 'Nederlands' },
  { code: 'de', label: 'Deutsch' },
] as const

export type LocaleCode = (typeof LOCALES)[number]['code']

export const FOUNDERS = [
  {
    key: 'kristian',
    initials: 'KV',
    instagram: 'https://instagram.com/kristian.vasiaj',
    linkedin: 'https://linkedin.com/in/kristian-vasiaj',
  },
  {
    key: 'ismael',
    initials: 'IB',
    instagram: 'https://instagram.com/ismael.bouzrouti',
    linkedin: 'https://linkedin.com/in/ismael-bouzrouti',
  },
  {
    key: 'nawfel',
    initials: 'NA',
    instagram: 'https://instagram.com/nawfel.ajari',
    linkedin: 'https://linkedin.com/in/nawfel-ajari',
  },
] as const
