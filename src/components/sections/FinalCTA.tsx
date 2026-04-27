import { useTranslation } from 'react-i18next'
import { GlowEffect } from '@/components/common/GlowEffect'
import { NotifyMeForm } from '@/components/common/NotifyMeForm'

export function FinalCTA() {
  const { t } = useTranslation()
  return (
    <section id="notify" className="relative scroll-mt-20 overflow-hidden py-24 sm:py-32">
      <GlowEffect color="primary" className="opacity-70" />
      <div className="container relative mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-3xl rounded-2xl border border-primary/30 bg-card/60 p-10 text-center shadow-glow backdrop-blur-xl sm:p-14">
          <h2 className="text-balance text-3xl font-bold tracking-tight sm:text-4xl">
            {t('finalCta.title')}
          </h2>
          <p className="mt-4 text-balance text-muted-foreground sm:text-lg">
            {t('finalCta.subtitle')}
          </p>
          <div className="mt-8 flex justify-center">
            <NotifyMeForm size="lg" />
          </div>
        </div>
      </div>
    </section>
  )
}
