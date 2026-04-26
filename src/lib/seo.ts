import { BRAND, FOUNDERS } from './constants'

const SUPPORTED_LOCALES = ['fr-BE', 'en', 'nl-BE', 'de'] as const

export function organizationJsonLd() {
  return {
    '@context': 'https://schema.org',
    '@type': 'Organization',
    '@id': `${BRAND.url}/#organization`,
    name: BRAND.name,
    url: BRAND.url,
    logo: {
      '@type': 'ImageObject',
      url: `${BRAND.url}/tlogo_white.png`,
      width: 512,
      height: 512,
    },
    email: BRAND.email,
    description: BRAND.tagline,
    foundingDate: '2026',
    foundingLocation: {
      '@type': 'Place',
      name: 'Brussels, Belgium',
    },
    address: {
      '@type': 'PostalAddress',
      addressLocality: BRAND.city,
      addressCountry: 'BE',
    },
    areaServed: [
      { '@type': 'Country', name: 'Belgium' },
      { '@type': 'Country', name: 'France' },
      { '@type': 'Country', name: 'Netherlands' },
      { '@type': 'Country', name: 'Germany' },
    ],
    sameAs: [BRAND.instagram, BRAND.linkedin],
    knowsAbout: [
      'Taxi fleet management',
      'Ride-hailing platform aggregation',
      'Driver compensation software',
      'Uber Bolt Heetch reconciliation',
    ],
    founder: FOUNDERS.map((f) => ({
      '@type': 'Person',
      name: f.key,
      sameAs: [f.linkedin, f.instagram].filter(Boolean),
    })),
  }
}

export function webSiteJsonLd() {
  return {
    '@context': 'https://schema.org',
    '@type': 'WebSite',
    '@id': `${BRAND.url}/#website`,
    url: BRAND.url,
    name: BRAND.name,
    description: BRAND.tagline,
    publisher: { '@id': `${BRAND.url}/#organization` },
    inLanguage: SUPPORTED_LOCALES,
  }
}

export function webApplicationJsonLd() {
  return {
    '@context': 'https://schema.org',
    '@type': 'WebApplication',
    '@id': `${BRAND.url}/#webapp`,
    name: BRAND.name,
    url: BRAND.url,
    applicationCategory: 'BusinessApplication',
    applicationSubCategory: 'Fleet Management Software',
    operatingSystem: 'Web, iOS, Android',
    browserRequirements: 'Requires JavaScript and a modern browser.',
    description:
      'Fleet management SaaS for taxi operators: ride-hailing platform aggregation (Uber, Bolt, Heetch, TaxiVert), commission calculation, driver app, scheduling and accounting exports.',
    featureList: [
      'Multi-platform revenue aggregation',
      'Commission and net revenue calculation',
      'Driver and vehicle management',
      'Weekly scheduling',
      'Real-time tracking',
      'Driver mobile app (iOS + Android)',
      'Accounting exports (PDF, Excel)',
    ],
    inLanguage: SUPPORTED_LOCALES,
    isAccessibleForFree: true,
    creator: { '@id': `${BRAND.url}/#organization` },
    publisher: { '@id': `${BRAND.url}/#organization` },
    releaseNotes: 'Public launch scheduled for September 2026.',
  }
}

interface BreadcrumbItem {
  name: string
  path: string
}

export function breadcrumbJsonLd(items: BreadcrumbItem[]) {
  return {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: items.map((item, i) => ({
      '@type': 'ListItem',
      position: i + 1,
      name: item.name,
      item: `${BRAND.url}${item.path}`,
    })),
  }
}
