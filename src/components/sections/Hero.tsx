import { ChevronDown, ChevronLeft, ChevronRight, Sparkles } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import { AnimatedGridBackground } from '@/components/common/AnimatedGridBackground'
import { GlowEffect } from '@/components/common/GlowEffect'
import { NotifyMeForm } from '@/components/common/NotifyMeForm'
import { ProductTicker } from '@/components/common/ProductTicker'

function scrollToAdmin() {
  const el = document.getElementById('admin')
  if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' })
}

// Hero is fully static / framer-motion-free. Earlier versions gated the
// eyebrow / title / subtitle / form on `introReady = !isFirstVisit`, with
// motion components doing the entrance animation. On slow mobiles where
// the JS bundle parse delays framer-motion's animation loop, those gated
// elements stayed at opacity:0 for several seconds — the page looked
// like 'still loading' even after the bundle was ready. Now the content
// is rendered at full opacity from frame 0; the ProductTicker handles
// its own carousel internals.
export function Hero() {
  const { t } = useTranslation()

  return (
    <section className="relative flex min-h-[calc(100dvh-4rem)] items-center overflow-hidden py-12 sm:py-16">
      <AnimatedGridBackground />
      <GlowEffect color="mixed" />

      <div className="container relative mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mx-auto grid max-w-6xl items-center gap-10 lg:grid-cols-[1.2fr_1fr] lg:gap-16">
          <div className="flex flex-col items-center text-center lg:items-start lg:text-left">
            <span className="inline-flex items-center gap-2 rounded-full border border-primary/30 bg-primary/10 px-3 py-1 text-xs font-medium text-primary">
              <Sparkles className="h-3 w-3" />
              {t('hero.eyebrow')}
            </span>

            <h1 className="mt-5 text-balance text-4xl font-extrabold leading-[1.05] tracking-[-0.02em] sm:text-5xl lg:text-[3.75rem] xl:text-6xl">
              {t('hero.title')}
            </h1>

            <p className="mt-5 max-w-md text-balance text-base text-muted-foreground sm:text-lg">
              {t('hero.subtitle')}
            </p>

            <div className="mt-8 w-full">
              <NotifyMeForm size="lg" align="start" className="lg:mx-0" />
            </div>
          </div>

          {/* Mobile-only swipe hint above the ticker. The chevron
              icons still ping-pong via framer (decorative, non-blocking). */}
          <p className="mt-20 flex items-center justify-center gap-2 text-[11px] font-semibold uppercase tracking-[0.18em] text-muted-foreground lg:mt-0 lg:hidden">
            <ChevronLeft className="h-3 w-3 animate-pulse text-primary/70" />
            {t('hero.swipeHint')}
            <ChevronRight className="h-3 w-3 animate-pulse text-primary/70" />
          </p>

          <div className="flex justify-center lg:justify-end">
            <ProductTicker />
          </div>
        </div>

        <button
          type="button"
          onClick={scrollToAdmin}
          aria-label={t('hero.scrollHint')}
          className="absolute bottom-6 left-1/2 hidden -translate-x-1/2 items-center gap-1.5 rounded-full px-3 py-2 text-xs text-muted-foreground transition-colors hover:text-foreground sm:inline-flex"
        >
          <span>{t('hero.scrollHint')}</span>
          <ChevronDown className="h-3.5 w-3.5 animate-bounce" />
        </button>
      </div>
    </section>
  )
}
