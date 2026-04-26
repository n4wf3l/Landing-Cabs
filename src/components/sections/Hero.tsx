import { motion, useReducedMotion } from 'framer-motion'
import { ChevronDown, Sparkles } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import { AnimatedGridBackground } from '@/components/common/AnimatedGridBackground'
import { GlowEffect } from '@/components/common/GlowEffect'
import { NotifyMeForm } from '@/components/common/NotifyMeForm'
import { ProductTicker } from '@/components/common/ProductTicker'

function scrollToAdmin() {
  const el = document.getElementById('admin')
  if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' })
}

export function Hero() {
  const { t } = useTranslation()
  const reduce = useReducedMotion()

  return (
    <section className="relative flex min-h-[calc(100dvh-4rem)] items-center overflow-hidden py-12 sm:py-16">
      <AnimatedGridBackground />
      <GlowEffect color="mixed" />

      <div className="container relative mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mx-auto grid max-w-6xl items-center gap-10 lg:grid-cols-[1.2fr_1fr] lg:gap-16">
          <div className="flex flex-col items-center text-center lg:items-start lg:text-left">
            <motion.span
              initial={reduce ? false : { opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4 }}
              className="inline-flex items-center gap-2 rounded-full border border-primary/30 bg-primary/10 px-3 py-1 text-xs font-medium text-primary"
            >
              <Sparkles className="h-3 w-3" />
              {t('hero.eyebrow')}
            </motion.span>

            <motion.h1
              initial={reduce ? false : { opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.55, delay: 0.08 }}
              className="mt-5 text-balance text-4xl font-extrabold leading-[1.05] tracking-[-0.02em] sm:text-5xl lg:text-[3.75rem] xl:text-6xl"
            >
              {t('hero.title')}
            </motion.h1>

            <motion.p
              initial={reduce ? false : { opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.55, delay: 0.16 }}
              className="mt-5 max-w-md text-balance text-base text-muted-foreground sm:text-lg"
            >
              {t('hero.subtitle')}
            </motion.p>

            <motion.div
              initial={reduce ? false : { opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.55, delay: 0.24 }}
              className="mt-8 w-full"
            >
              <NotifyMeForm size="lg" align="start" className="lg:mx-0" />
            </motion.div>
          </div>

          <motion.div
            initial={reduce ? false : { opacity: 0, y: 16, scale: 0.96 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            transition={{ duration: 0.6, delay: 0.3, ease: [0.22, 1, 0.36, 1] }}
            className="flex justify-center lg:justify-end"
          >
            <ProductTicker />
          </motion.div>
        </div>

        <motion.button
          type="button"
          onClick={scrollToAdmin}
          aria-label={t('hero.scrollHint')}
          initial={reduce ? false : { opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5, delay: 0.6 }}
          className="absolute bottom-6 left-1/2 hidden -translate-x-1/2 items-center gap-1.5 rounded-full px-3 py-2 text-xs text-muted-foreground transition-colors hover:text-foreground sm:inline-flex"
        >
          <span>{t('hero.scrollHint')}</span>
          <motion.span
            animate={reduce ? undefined : { y: [0, 4, 0] }}
            transition={
              reduce
                ? undefined
                : { duration: 1.6, repeat: Infinity, ease: 'easeInOut' }
            }
            className="inline-flex"
            aria-hidden
          >
            <ChevronDown className="h-3.5 w-3.5" />
          </motion.span>
        </motion.button>
      </div>
    </section>
  )
}
