import { motion, useReducedMotion } from 'framer-motion'
import { ArrowRight, Sparkles, RotateCcw } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import { usePhoneSim } from '../usePhoneSim'
import { Money, PlatformBadge, ScreenScroll } from '../ui'
import type { Platform } from '../types'

export function ShiftSummaryScreen() {
  const { t } = useTranslation()
  const { state, dispatch } = usePhoneSim()
  const reduce = useReducedMotion()

  const totals = state.todayRides.reduce(
    (acc, r) => ({
      brut: acc.brut + r.brut,
      commission: acc.commission + r.commission,
      net: acc.net + r.net,
    }),
    { brut: 0, commission: 0, net: 0 },
  )

  const byPlatform = state.todayRides.reduce<
    Record<Platform, { rides: number; net: number }>
  >(
    (acc, r) => {
      acc[r.platform].rides += 1
      acc[r.platform].net += r.net
      return acc
    },
    {
      uber: { rides: 0, net: 0 },
      bolt: { rides: 0, net: 0 },
      heetch: { rides: 0, net: 0 },
      cash: { rides: 0, net: 0 },
    },
  )

  const durationMs =
    state.shiftEndedAt && state.shiftStartedAt
      ? state.shiftEndedAt - state.shiftStartedAt
      : 0
  const min = Math.max(1, Math.floor(durationMs / 60_000))

  const distanceKm =
    state.startKm != null && state.endKm != null && state.endKm > state.startKm
      ? state.endKm - state.startKm
      : null

  return (
    <ScreenScroll>
      <motion.div
        initial={reduce ? { opacity: 0 } : { scale: 0.7, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ type: 'spring', stiffness: 320, damping: 22 }}
        className="mx-auto mt-2 flex h-12 w-12 items-center justify-center rounded-full bg-primary/15 text-primary ring-1 ring-primary/30"
      >
        <Sparkles className="h-6 w-6" />
      </motion.div>

      <div className="text-center">
        <h2 className="text-lg font-bold tracking-tight phone-light:text-zinc-900">
          {t('driverApp.sim.shiftSummary.title')}
        </h2>
        <p className="mt-1 text-[11px] text-zinc-500 tabular-nums">
          {t('driverApp.sim.shiftSummary.duration', { min })} ·{' '}
          {t('driverApp.sim.shiftSummary.rides', {
            count: state.todayRides.length,
          })}
        </p>
      </div>

      <div className="grid grid-cols-3 gap-2 rounded-2xl bg-white/[0.04] p-3 phone-light:bg-zinc-900/[0.04]">
        <Stat
          label={t('driverApp.sim.shiftSummary.brut')}
          value={totals.brut}
        />
        <Stat
          label={t('driverApp.sim.shiftSummary.commission')}
          value={totals.commission}
          tone="negative"
        />
        <Stat
          label={t('driverApp.sim.shiftSummary.net')}
          value={totals.net}
          tone="primary"
        />
      </div>

      {distanceKm !== null && (
        <div className="rounded-xl border border-white/[0.06] bg-white/[0.02] px-3 py-2 phone-light:border-zinc-900/[0.08] phone-light:bg-zinc-900/[0.03]">
          <div className="flex items-center justify-between gap-2">
            <p className="text-[10px] font-semibold uppercase tracking-wider text-zinc-500">
              {t('driverApp.sim.shiftSummary.distance')}
            </p>
            <p className="text-sm font-bold tabular-nums text-zinc-100 phone-light:text-zinc-900">
              {distanceKm} {t('driverApp.sim.shiftCapture.ocr.unit')}
            </p>
          </div>
          <p className="mt-0.5 text-[10px] tabular-nums text-zinc-500">
            {state.startKm}{' '}
            {t('driverApp.sim.shiftCapture.ocr.unit')} → {state.endKm}{' '}
            {t('driverApp.sim.shiftCapture.ocr.unit')}
          </p>
        </div>
      )}

      {state.todayRides.length > 0 && (
        <section>
          <p className="mb-1.5 text-[10px] font-semibold uppercase tracking-wider text-zinc-500">
            {t('driverApp.sim.shiftSummary.byPlatform')}
          </p>
          <ul className="space-y-1.5">
            {(Object.keys(byPlatform) as Platform[])
              .filter((p) => byPlatform[p].rides > 0)
              .map((p) => (
                <li
                  key={p}
                  className="flex items-center justify-between rounded-xl border border-white/[0.06] bg-white/[0.02] px-3 py-2 phone-light:border-zinc-900/[0.08] phone-light:bg-zinc-900/[0.03]"
                >
                  <PlatformBadge
                    platform={p}
                    label={t(`driverApp.sim.platforms.${p}`)}
                  />
                  <span className="text-[10px] text-zinc-500 tabular-nums">
                    {byPlatform[p].rides}
                  </span>
                  <span className="ml-auto text-sm font-bold text-zinc-100 tabular-nums phone-light:text-zinc-900">
                    <Money value={byPlatform[p].net} />
                  </span>
                </li>
              ))}
          </ul>
        </section>
      )}

      <div className="mt-auto space-y-2">
        <button
          type="button"
          onClick={() => dispatch({ type: 'NAV', screen: 'home' })}
          className="flex w-full items-center justify-center gap-2 rounded-xl bg-primary py-3 text-sm font-semibold text-primary-foreground shadow-glow transition-transform hover:-translate-y-0.5 active:scale-[0.98]"
        >
          {t('driverApp.sim.shiftSummary.backHome')}
          <ArrowRight className="h-4 w-4" />
        </button>
        <button
          type="button"
          onClick={() => dispatch({ type: 'RESET' })}
          className="inline-flex w-full items-center justify-center gap-1.5 rounded-lg py-1.5 text-[11px] font-medium text-zinc-500 transition-colors hover:text-zinc-200 phone-light:hover:text-zinc-900"
        >
          <RotateCcw className="h-3 w-3" />
          {t('driverApp.sim.shiftSummary.restart')}
        </button>
      </div>
    </ScreenScroll>
  )
}

function Stat({
  label,
  value,
  tone,
}: {
  label: string
  value: number
  tone?: 'primary' | 'negative'
}) {
  return (
    <div>
      <p className="text-[10px] uppercase tracking-wider text-zinc-500">
        {label}
      </p>
      <p
        className={
          'mt-0.5 text-sm font-bold tabular-nums ' +
          (tone === 'primary'
            ? 'text-primary'
            : tone === 'negative'
              ? 'text-rose-300 phone-light:text-rose-700'
              : 'text-zinc-100 phone-light:text-zinc-900')
        }
      >
        <Money value={value} />
      </p>
    </div>
  )
}
