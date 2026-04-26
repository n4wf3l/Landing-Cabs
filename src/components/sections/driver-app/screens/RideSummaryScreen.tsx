import { motion, useReducedMotion } from 'framer-motion'
import { ArrowRight, CheckCircle2 } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import { usePhoneSim } from '../usePhoneSim'
import { Money, PlatformBadge } from '../ui'

export function RideSummaryScreen() {
  const { t } = useTranslation()
  const { state, dispatch } = usePhoneSim()
  const ride = state.lastCompletedRide
  const reduce = useReducedMotion()

  if (!ride) return null

  return (
    <div className="flex h-full flex-col px-5 pt-4 pb-4">
      <motion.div
        initial={reduce ? { opacity: 0 } : { scale: 0.6, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ type: 'spring', stiffness: 360, damping: 22 }}
        className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-emerald-500/15 text-emerald-400 ring-1 ring-emerald-500/40"
      >
        <CheckCircle2 className="h-8 w-8" />
      </motion.div>

      <div className="mt-3 text-center">
        <h2 className="text-lg font-bold tracking-tight phone-light:text-zinc-900">
          {t('driverApp.sim.rideSummary.title')}
        </h2>
        <p className="mt-1 text-[11px] text-zinc-500">
          {ride.pickup} → {ride.destination}
        </p>
      </div>

      <div className="mt-5 flex flex-col items-center gap-2 rounded-2xl bg-white/[0.04] px-4 py-5 text-center phone-light:bg-zinc-900/[0.04]">
        <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-zinc-500">
          {t('driverApp.sim.rideSummary.net')}
        </p>
        <p className="text-3xl font-extrabold tabular-nums text-primary">
          <Money value={ride.net} />
        </p>
        <div className="mt-1 flex items-center gap-2">
          <PlatformBadge
            platform={ride.platform}
            label={t(`driverApp.sim.platforms.${ride.platform}`)}
          />
          <span className="text-[10px] text-zinc-500 tabular-nums">
            {ride.durationSec}s
          </span>
        </div>
      </div>

      <button
        type="button"
        onClick={() => dispatch({ type: 'CONTINUE_AFTER_RIDE' })}
        className="mt-auto flex w-full items-center justify-center gap-2 rounded-xl bg-primary py-3 text-sm font-semibold text-primary-foreground shadow-glow transition-transform hover:-translate-y-0.5 active:scale-[0.98]"
      >
        {t('driverApp.sim.rideSummary.continue')}
        <ArrowRight className="h-4 w-4" />
      </button>
    </div>
  )
}

