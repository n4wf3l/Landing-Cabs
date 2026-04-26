import { useTranslation } from 'react-i18next'
import { SEO } from '@/components/common/SEO'
import { BRAND } from '@/lib/constants'
import { breadcrumbJsonLd } from '@/lib/seo'

const SECTIONS = ['scope', 'waitlist', 'contact', 'liability', 'law'] as const

export default function LegalTerms() {
  const { t } = useTranslation()
  return (
    <>
      <SEO
        path="/legal/terms"
        title={t('legal.terms.title')}
        jsonLd={breadcrumbJsonLd([
          { name: BRAND.name, path: '/' },
          { name: t('legal.terms.title'), path: '/legal/terms' },
        ])}
      />
      <article className="mx-auto max-w-3xl px-4 py-20 sm:px-6 lg:px-8">
        <h1 className="text-3xl font-bold tracking-tight sm:text-4xl">
          {t('legal.terms.title')}
        </h1>
        <p className="mt-2 text-sm text-muted-foreground">
          {t('legal.terms.lastUpdate')}
        </p>
        <div className="mt-10 space-y-8 text-muted-foreground">
          <p className="text-base leading-relaxed">{t('legal.terms.intro')}</p>
          {SECTIONS.map((key) => (
            <section key={key} className="space-y-2">
              <h2 className="text-xl font-semibold text-foreground">
                {t(`legal.terms.sections.${key}.title`)}
              </h2>
              <p className="leading-relaxed">
                {t(`legal.terms.sections.${key}.body`)}
              </p>
            </section>
          ))}
        </div>
      </article>
    </>
  )
}
