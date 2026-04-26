import { useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { ChevronDown } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import { cn } from '@/lib/utils'
import { HISTORY, HISTORY_TOTALS } from '../mockData'
import { Money, PlatformBadge, ScreenScroll, ScreenTitle } from '../ui'
import type { Platform } from '../types'

const PLATFORMS: Platform[] = ['uber', 'bolt', 'heetch', 'cash']

export function HistoryScreen() {
  const { t } = useTranslation()
  const [expandedKey, setExpandedKey] = useState<string | null>(null)

  return (
    <ScreenScroll>
      <ScreenTitle
        eyebrow={t('driverApp.sim.history.eyebrow')}
        title={t('driverApp.sim.history.title')}
      />

      <div className="grid grid-cols-3 gap-2 rounded-xl bg-white/[0.04] p-3 phone-light:bg-zinc-900/[0.04]">
        <Stat
          label={t('driverApp.sim.history.brut')}
          value={HISTORY_TOTALS.brut}
          subdued
        />
        <Stat
          label={t('driverApp.sim.history.commission')}
          value={HISTORY_TOTALS.commission}
          tone="negative"
        />
        <Stat label={t('driverApp.sim.history.net')} value={HISTORY_TOTALS.net} />
      </div>

      <ul className="space-y-2">
        {[...HISTORY].reverse().map((day) => {
          const isOpen = expandedKey === day.dayKey
          const isOff = day.rides === 0
          return (
            <li
              key={day.dayKey}
              className={cn(
                'overflow-hidden rounded-xl border bg-white/[0.02] phone-light:bg-zinc-900/[0.03]',
                isOpen
                  ? 'border-primary/30'
                  : 'border-white/[0.06] phone-light:border-zinc-900/[0.08]',
              )}
            >
              <button
                type="button"
                disabled={isOff}
                onClick={() =>
                  setExpandedKey(isOpen ? null : day.dayKey)
                }
                className={cn(
                  'flex w-full items-center justify-between gap-2 px-3 py-2.5 text-left transition-colors',
                  !isOff && 'hover:bg-white/[0.03] phone-light:hover:bg-zinc-900/[0.04]',
                )}
                aria-expanded={isOpen}
              >
                <div className="flex items-center gap-3">
                  <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-white/[0.04] text-[10px] font-bold uppercase tracking-wider text-zinc-300 phone-light:bg-zinc-900/[0.05] phone-light:text-zinc-700">
                    {t(`driverApp.sim.planning.days.${day.dayKey}`)}
                  </span>
                  <div>
                    <p className="text-sm font-semibold tabular-nums text-zinc-100 phone-light:text-zinc-900">
                      {day.dateLabel}
                    </p>
                    <p className="text-[10px] text-zinc-500">
                      {isOff
                        ? t('driverApp.sim.planning.off')
                        : t('driverApp.sim.history.ridesCount', {
                            count: day.rides,
                          })}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <div className="text-right">
                    <p className="text-sm font-semibold tabular-nums text-zinc-100 phone-light:text-zinc-900">
                      <Money value={day.net} />
                    </p>
                    {!isOff && (
                      <p className="text-[10px] text-zinc-500 tabular-nums">
                        <Money value={day.brut} />{' '}
                        {t('driverApp.sim.history.brutShort')}
                      </p>
                    )}
                  </div>
                  {!isOff && (
                    <ChevronDown
                      className={cn(
                        'h-4 w-4 text-zinc-500 transition-transform',
                        isOpen && 'rotate-180',
                      )}
                    />
                  )}
                </div>
              </button>

              <AnimatePresence initial={false}>
                {isOpen && !isOff && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: 'auto', opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.22, ease: [0.22, 1, 0.36, 1] }}
                    className="overflow-hidden"
                  >
                    <div className="space-y-1.5 border-t border-white/[0.06] px-3 py-3 phone-light:border-zinc-900/[0.08]">
                      {PLATFORMS.map((p) => {
                        const row = day.byPlatform[p]
                        if (row.rides === 0) return null
                        return (
                          <div
                            key={p}
                            className="flex items-center justify-between gap-2 text-[11px]"
                          >
                            <PlatformBadge
                              platform={p}
                              label={t(`driverApp.sim.platforms.${p}`)}
                            />
                            <span className="text-zinc-500 tabular-nums">
                              {row.rides}{' '}
                              {t('driverApp.sim.history.ridesShort')}
                            </span>
                            <span className="ml-auto font-semibold text-zinc-100 tabular-nums phone-light:text-zinc-900">
                              <Money value={row.net} />
                            </span>
                          </div>
                        )
                      })}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </li>
          )
        })}
      </ul>
    </ScreenScroll>
  )
}

function Stat({
  label,
  value,
  tone,
  subdued,
}: {
  label: string
  value: number
  tone?: 'negative'
  subdued?: boolean
}) {
  return (
    <div>
      <p className="text-[10px] uppercase tracking-wider text-zinc-500">
        {label}
      </p>
      <p
        className={cn(
          'mt-0.5 text-sm font-bold tabular-nums',
          tone === 'negative' && 'text-rose-300 phone-light:text-rose-700',
          subdued && 'text-zinc-300 phone-light:text-zinc-800',
          !tone && !subdued && 'text-emerald-300 phone-light:text-emerald-700',
        )}
      >
        <Money value={value} />
      </p>
    </div>
  )
}
