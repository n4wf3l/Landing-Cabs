import { Helmet } from 'react-helmet-async'
import { useTranslation } from 'react-i18next'
import { BRAND, LOCALES } from '@/lib/constants'

interface SEOProps {
  title?: string
  description?: string
  path?: string
  jsonLd?: Record<string, unknown> | Record<string, unknown>[]
  image?: string
  noIndex?: boolean
}

const OG_LOCALE_MAP: Record<string, string> = {
  fr: 'fr_BE',
  en: 'en_US',
  nl: 'nl_BE',
  de: 'de_DE',
}

export function SEO({
  title,
  description,
  path = '',
  jsonLd,
  image,
  noIndex,
}: SEOProps) {
  const { i18n } = useTranslation()
  const lang = i18n.language?.split('-')[0] ?? 'fr'

  const fullTitle = title ? `${title} · ${BRAND.name}` : `${BRAND.name} · ${BRAND.tagline}`
  const desc = description ?? BRAND.tagline
  const url = `${BRAND.url}${path}`
  const ogImage = image ?? `${BRAND.url}/tlogo_white.png`
  const ogLocale = OG_LOCALE_MAP[lang] ?? 'fr_BE'

  const ldArray = Array.isArray(jsonLd) ? jsonLd : jsonLd ? [jsonLd] : []

  return (
    <Helmet>
      <html lang={lang} />
      <title>{fullTitle}</title>
      <meta name="description" content={desc} />
      {noIndex ? (
        <meta name="robots" content="noindex, nofollow" />
      ) : (
        <meta
          name="robots"
          content="index, follow, max-image-preview:large, max-snippet:-1, max-video-preview:-1"
        />
      )}

      <link rel="canonical" href={url} />

      {LOCALES.map((l) => (
        <link
          key={l.code}
          rel="alternate"
          hrefLang={l.code}
          href={`${BRAND.url}${path}${l.code === 'fr' ? '' : `?lang=${l.code}`}`}
        />
      ))}
      <link rel="alternate" hrefLang="x-default" href={`${BRAND.url}${path}`} />

      <meta property="og:site_name" content={BRAND.name} />
      <meta property="og:title" content={fullTitle} />
      <meta property="og:description" content={desc} />
      <meta property="og:type" content="website" />
      <meta property="og:url" content={url} />
      <meta property="og:image" content={ogImage} />
      <meta property="og:image:alt" content={BRAND.name} />
      <meta property="og:locale" content={ogLocale} />
      {Object.entries(OG_LOCALE_MAP)
        .filter(([code]) => code !== lang)
        .map(([, alt]) => (
          <meta key={alt} property="og:locale:alternate" content={alt} />
        ))}

      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:title" content={fullTitle} />
      <meta name="twitter:description" content={desc} />
      <meta name="twitter:image" content={ogImage} />
      <meta name="twitter:image:alt" content={BRAND.name} />

      {ldArray.map((ld, i) => (
        <script key={i} type="application/ld+json">
          {JSON.stringify(ld)}
        </script>
      ))}
    </Helmet>
  )
}
