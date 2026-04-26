import { motion, useReducedMotion } from 'framer-motion'
import { Play } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import { usePhoneSim } from '../usePhoneSim'

export function DemoStartScreen() {
  const { t } = useTranslation()
  const { dispatch } = usePhoneSim()
  const reduce = useReducedMotion()

  return (
    <div className="relative flex h-full flex-col items-center justify-between px-6 pb-8 pt-10 text-center">
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 -z-10"
        style={{
          background:
            'radial-gradient(60% 50% at 50% 30%, rgba(59,130,246,0.25), transparent 70%)',
        }}
      />

      <div className="space-y-2">
        <p className="text-[10px] font-semibold uppercase tracking-[0.25em] text-primary/80">
          Cabs · Driver
        </p>
        <h1 className="text-[22px] font-bold leading-tight tracking-tight phone-light:text-zinc-900">
          {t('driverApp.sim.demoStart.title')}
        </h1>
        <p className="text-xs leading-relaxed text-zinc-400 phone-light:text-zinc-600">
          {t('driverApp.sim.demoStart.subtitle')}
        </p>
      </div>

      <div className="relative">
        {!reduce && (
          <>
            <motion.span
              aria-hidden
              className="absolute inset-0 rounded-full bg-primary/40"
              animate={{ scale: [1, 1.6], opacity: [0.6, 0] }}
              transition={{ duration: 1.8, repeat: Infinity, ease: 'easeOut' }}
            />
            <motion.span
              aria-hidden
              className="absolute inset-0 rounded-full bg-primary/30"
              animate={{ scale: [1, 1.9], opacity: [0.5, 0] }}
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
          onClick={() => dispatch({ type: 'START_DEMO' })}
          whileTap={{ scale: 0.94 }}
          className="relative flex h-24 w-24 items-center justify-center rounded-full bg-primary text-primary-foreground shadow-[0_0_60px_-10px_rgba(59,130,246,0.8)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 focus-visible:ring-offset-zinc-950"
          aria-label={t('driverApp.sim.demoStart.cta')}
        >
          <Play className="h-9 w-9 fill-current" />
        </motion.button>
      </div>

      <div className="space-y-2">
        <p className="text-sm font-semibold text-white phone-light:text-zinc-900">
          {t('driverApp.sim.demoStart.cta')}
        </p>
        <p className="mx-auto max-w-[220px] text-[11px] leading-relaxed text-zinc-500 phone-light:text-zinc-600">
          {t('driverApp.sim.demoStart.note')}
        </p>
      </div>
    </div>
  )
}
