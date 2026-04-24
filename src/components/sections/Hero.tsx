import { motion, useReducedMotion } from 'framer-motion'
import { Sparkles } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import { AnimatedGridBackground } from '@/components/common/AnimatedGridBackground'
import { GlowEffect } from '@/components/common/GlowEffect'
import { NotifyMeForm } from '@/components/common/NotifyMeForm'

export function Hero() {
  const { t } = useTranslation()
  const reduce = useReducedMotion()

  return (
    <section className="relative flex min-h-[calc(100dvh-4rem)] items-center overflow-hidden py-16 sm:py-20">
      <AnimatedGridBackground />
      <GlowEffect color="mixed" />

      <div className="container relative mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-4xl text-center">
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
            className="mt-6 text-balance text-4xl font-extrabold tracking-tight sm:text-5xl lg:text-6xl xl:text-7xl"
          >
            {t('hero.title')}
          </motion.h1>

          <motion.p
            initial={reduce ? false : { opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.55, delay: 0.16 }}
            className="mx-auto mt-6 max-w-2xl text-balance text-lg text-muted-foreground sm:text-xl"
          >
            {t('hero.subtitle')}
          </motion.p>

          <motion.div
            initial={reduce ? false : { opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.55, delay: 0.24 }}
            className="mt-10 flex justify-center"
          >
            <NotifyMeForm size="lg" />
          </motion.div>

          <motion.p
            initial={reduce ? false : { opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5, delay: 0.4 }}
            className="mt-4 text-xs text-muted-foreground"
          >
            {t('hero.comingSoon')}
          </motion.p>
        </div>
      </div>
    </section>
  )
}
