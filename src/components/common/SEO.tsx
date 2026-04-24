import { Helmet } from 'react-helmet-async'
import { BRAND } from '@/lib/constants'

interface SEOProps {
  title?: string
  description?: string
  path?: string
  jsonLd?: Record<string, unknown> | Record<string, unknown>[]
  image?: string
}

export function SEO({ title, description, path = '', jsonLd, image }: SEOProps) {
  const fullTitle = title ? `${title} · ${BRAND.name}` : `${BRAND.name} · ${BRAND.tagline}`
  const desc = description ?? BRAND.tagline
  const url = `${BRAND.url}${path}`
  const ogImage = image ?? `${BRAND.url}/tlogo_white.png`

  const ldArray = Array.isArray(jsonLd) ? jsonLd : jsonLd ? [jsonLd] : []

  return (
    <Helmet>
      <title>{fullTitle}</title>
      <meta name="description" content={desc} />
      <link rel="canonical" href={url} />
      <meta property="og:title" content={fullTitle} />
      <meta property="og:description" content={desc} />
      <meta property="og:type" content="website" />
      <meta property="og:url" content={url} />
      <meta property="og:image" content={ogImage} />
      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:title" content={fullTitle} />
      <meta name="twitter:description" content={desc} />
      <meta name="twitter:image" content={ogImage} />
      <link rel="alternate" hrefLang="fr" href={`${BRAND.url}${path}`} />
      <link rel="alternate" hrefLang="en" href={`${BRAND.url}${path}?lang=en`} />
      <link rel="alternate" hrefLang="nl" href={`${BRAND.url}${path}?lang=nl`} />
      <link rel="alternate" hrefLang="de" href={`${BRAND.url}${path}?lang=de`} />
      <link rel="alternate" hrefLang="x-default" href={`${BRAND.url}${path}`} />
      {ldArray.map((ld, i) => (
        <script key={i} type="application/ld+json">
          {JSON.stringify(ld)}
        </script>
      ))}
    </Helmet>
  )
}
