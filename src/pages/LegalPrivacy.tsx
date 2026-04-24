import { useTranslation } from 'react-i18next'
import { SEO } from '@/components/common/SEO'

const SECTIONS = [
  'controller',
  'data',
  'purpose',
  'basis',
  'retention',
  'rights',
  'hosting',
  'cookies',
] as const

export default function LegalPrivacy() {
  const { t } = useTranslation()
  return (
    <>
      <SEO path="/legal/privacy" title={t('legal.privacy.title')} />
      <article className="mx-auto max-w-3xl px-4 py-20 sm:px-6 lg:px-8">
        <h1 className="text-3xl font-bold tracking-tight sm:text-4xl">
          {t('legal.privacy.title')}
        </h1>
        <p className="mt-2 text-sm text-muted-foreground">
          {t('legal.privacy.lastUpdate')}
        </p>
        <div className="mt-10 space-y-8 text-muted-foreground">
          <p className="text-base leading-relaxed">
            {t('legal.privacy.intro')}
          </p>
          {SECTIONS.map((key) => (
            <section key={key} className="space-y-2">
              <h2 className="text-xl font-semibold text-foreground">
                {t(`legal.privacy.sections.${key}.title`)}
              </h2>
              <p className="leading-relaxed">
                {t(`legal.privacy.sections.${key}.body`)}
              </p>
            </section>
          ))}
        </div>
      </article>
    </>
  )
}
