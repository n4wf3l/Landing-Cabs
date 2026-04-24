import { BRAND } from './constants'

export function organizationJsonLd() {
  return {
    '@context': 'https://schema.org',
    '@type': 'Organization',
    name: BRAND.name,
    url: BRAND.url,
    logo: `${BRAND.url}/tlogo_white.png`,
    email: BRAND.email,
    address: {
      '@type': 'PostalAddress',
      addressLocality: BRAND.city,
      addressCountry: 'BE',
    },
  }
}

export function softwareApplicationJsonLd() {
  return {
    '@context': 'https://schema.org',
    '@type': 'SoftwareApplication',
    name: BRAND.name,
    applicationCategory: 'BusinessApplication',
    operatingSystem: 'Web',
    description: BRAND.tagline,
    offers: [
      {
        '@type': 'Offer',
        price: '49',
        priceCurrency: 'EUR',
        name: 'Starter',
      },
      {
        '@type': 'Offer',
        price: '149',
        priceCurrency: 'EUR',
        name: 'Business',
      },
    ],
  }
}
