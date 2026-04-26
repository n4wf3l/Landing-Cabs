import { motion, useReducedMotion } from 'framer-motion'
import { CarFront, Coins, MapPin, Play, Users } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import { useAdminApp } from '../useAdminApp'

const HIGHLIGHTS = [
  { Icon: CarFront, key: 'fleet' },
  { Icon: Users, key: 'drivers' },
  { Icon: MapPin, key: 'map' },
  { Icon: Coins, key: 'revenue' },
] as const

export function DemoStartScreen() {
  const { t } = useTranslation()
  const { startDemo } = useAdminApp()
  const reduce = useReducedMotion()

  return (
    <div className="relative flex h-full flex-col items-center justify-center overflow-hidden p-6 text-center">
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 -z-10"
        style={{
          background:
            'radial-gradient(70% 60% at 50% 35%, hsl(var(--primary) / 0.20), transparent 75%)',
        }}
      />

      <motion.div
        initial={reduce ? { opacity: 0 } : { opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="space-y-2"
      >
        <p className="text-[10px] font-semibold uppercase tracking-[0.28em] text-primary/80">
          {t('admin.demoStart.eyebrow')}
        </p>
        <h2 className="text-balance text-2xl font-bold leading-tight tracking-tight sm:text-3xl">
          {t('admin.demoStart.title')}
        </h2>
        <p className="mx-auto max-w-md text-balance text-xs text-muted-foreground sm:text-sm">
          {t('admin.demoStart.subtitle')}
        </p>
      </motion.div>

      <div className="relative my-8">
        {!reduce && (
          <>
            <motion.span
              aria-hidden
              className="absolute inset-0 rounded-full bg-primary/40"
              animate={{ scale: [1, 1.7], opacity: [0.55, 0] }}
              transition={{ duration: 1.8, repeat: Infinity, ease: 'easeOut' }}
            />
            <motion.span
              aria-hidden
              className="absolute inset-0 rounded-full bg-primary/30"
              animate={{ scale: [1, 2], opacity: [0.45, 0] }}
              transition={{
                duration: 1.8,
                repeat: Infinity,
                ease: 'easeOut',
                delay: 0.6,
              }}
            />
          </>
        )}
        <motion.button
          type="button"
          onClick={startDemo}
          whileTap={{ scale: 0.94 }}
          whileHover={reduce ? undefined : { scale: 1.04 }}
          className="relative flex h-20 w-20 items-center justify-center rounded-full bg-primary text-primary-foreground shadow-[0_0_60px_-10px_hsl(var(--primary)/0.8)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 focus-visible:ring-offset-background"
          aria-label={t('admin.demoStart.cta')}
        >
          <Play className="h-7 w-7 fill-current" />
        </motion.button>
      </div>

      <motion.div
        initial={reduce ? { opacity: 0 } : { opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.15 }}
        className="space-y-3"
      >
        <p className="text-sm font-semibold tracking-tight">
          {t('admin.demoStart.cta')}
        </p>
        <p className="mx-auto max-w-sm text-[11px] leading-relaxed text-muted-foreground">
          {t('admin.demoStart.note')}
        </p>

        <ul className="mt-4 flex flex-wrap items-center justify-center gap-1.5">
          {HIGHLIGHTS.map(({ Icon, key }, i) => (
            <motion.li
              key={key}
              initial={reduce ? { opacity: 0 } : { opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: 0.3 + i * 0.05 }}
              className="inline-flex items-center gap-1.5 rounded-full border border-border/60 bg-card/40 px-2.5 py-1 text-[10px] font-medium text-muted-foreground backdrop-blur"
            >
              <Icon className="h-3 w-3 text-primary" />
              {t(`admin.demoStart.highlights.${key}`)}
            </motion.li>
          ))}
        </ul>
      </motion.div>
    </div>
  )
}
