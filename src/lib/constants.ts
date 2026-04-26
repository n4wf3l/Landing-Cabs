export const BRAND = {
  name: 'Cabs',
  tagline: 'La plateforme que les opérateurs de taxi méritent.',
  email: import.meta.env.VITE_PUBLIC_EMAIL || 'contact@joincabs.com',
  city: 'Antwerp',
  url: import.meta.env.VITE_SITE_URL || 'https://www.joincabs.com',
  // Social handles are reserved but the accounts go live a few weeks before
  // the September 2026 public launch. UI copy treats them as "à venir".
  instagram: 'https://instagram.com/joincabs',
  linkedin: 'https://linkedin.com/company/joincabs',
  socialsLive: false,
  launchDate: 'Septembre 2026',
} as const

export const NAV_ANCHORS = [
  { href: '#admin', key: 'nav.admin' },
  { href: '#app', key: 'nav.app' },
  { href: '#team', key: 'nav.team' },
] as const

export const LOCALES = [
  { code: 'fr', label: 'Français' },
  { code: 'en', label: 'English' },
  { code: 'nl', label: 'Nederlands' },
  { code: 'de', label: 'Deutsch' },
] as const

export type LocaleCode = (typeof LOCALES)[number]['code']

export interface Founder {
  key: 'kristian' | 'ismael' | 'nawfel'
  fullName: string
  jobTitle: string
  initials: string
  linkedin: string
  instagram?: string
  photo?: string
}

export const FOUNDERS: readonly Founder[] = [
  {
    key: 'kristian',
    fullName: 'Kristian Vasiaj',
    jobTitle: 'Co-fondateur · Backend',
    initials: 'KV',
    linkedin: 'https://www.linkedin.com/in/kristian-vasiaj-705b46223/',
  },
  {
    key: 'ismael',
    fullName: 'Ismael Bouzrouti',
    jobTitle: 'Co-fondateur · Opérations',
    initials: 'IB',
    linkedin: 'https://www.linkedin.com/in/ismaelbouzrouti/',
  },
  {
    key: 'nawfel',
    fullName: 'Nawfel Ajari',
    jobTitle: 'Co-fondateur · Frontend',
    initials: 'NA',
    linkedin: 'https://www.linkedin.com/in/nawfel-ajari/',
    instagram: 'https://www.instagram.com/na.innovations/',
    photo: `${import.meta.env.BASE_URL}nawfel.jpg`,
  },
] as const
