import { Moon, Sun } from 'lucide-react'
import type { LucideIcon } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import { cn } from '@/lib/utils'
import { PLANNING } from '../mockData'
import type { PlanningDay, PlanningSlot } from '../types'
import { ScreenScroll, ScreenTitle } from '../ui'

const SHIFT_RANGES = {
  day: '06:00 → 18:00',
  night: '18:00 → 06:00',
} as const

export function PlanningScreen() {
  const { t } = useTranslation()
  const yourSlots = PLANNING.reduce((acc, d) => {
    return acc + (d.day.driver?.isYou ? 1 : 0) + (d.night.driver?.isYou ? 1 : 0)
  }, 0)

  return (
    <ScreenScroll>
      <ScreenTitle
        eyebrow={t('driverApp.sim.planning.eyebrow')}
        title={t('driverApp.sim.planning.title')}
      />
      <p className="-mt-2 text-[11px] text-zinc-500">
        {t('driverApp.sim.planning.summary', { count: yourSlots })}
      </p>

      <ul className="space-y-2">
        {PLANNING.map((day) => (
          <PlanningRow key={day.dayKey} day={day} />
        ))}
      </ul>
    </ScreenScroll>
  )
}

function PlanningRow({ day }: { day: PlanningDay }) {
  const { t } = useTranslation()
  return (
    <li className="overflow-hidden rounded-xl border border-white/[0.06] bg-white/[0.02] phone-light:border-zinc-900/[0.08] phone-light:bg-zinc-900/[0.03]">
      <div className="flex items-stretch">
        <div className="flex w-12 shrink-0 flex-col items-center justify-center border-r border-white/[0.06] bg-white/[0.02] py-2 phone-light:border-zinc-900/[0.06] phone-light:bg-zinc-900/[0.04]">
          <span className="text-[10px] font-bold uppercase tracking-wider text-zinc-300 phone-light:text-zinc-700">
            {t(`driverApp.sim.planning.days.${day.dayKey}`)}
          </span>
        </div>

        <div className="flex flex-1 flex-col">
          <SlotRow slot={day.day} kind="day" />
          <div className="h-px bg-white/[0.04] phone-light:bg-zinc-900/[0.05]" />
          <SlotRow slot={day.night} kind="night" />
        </div>
      </div>
    </li>
  )
}

function SlotRow({
  slot,
  kind,
}: {
  slot: PlanningSlot
  kind: 'day' | 'night'
}) {
  const { t } = useTranslation()
  const Icon: LucideIcon = kind === 'day' ? Sun : Moon
  const isYou = slot.driver?.isYou

  return (
    <div className="flex items-center gap-2 px-2.5 py-2">
      <span
        className={cn(
          'flex h-6 w-6 shrink-0 items-center justify-center rounded-md ring-1',
          kind === 'day'
            ? 'bg-amber-400/10 text-amber-300 ring-amber-400/20 phone-light:bg-amber-500/15 phone-light:text-amber-700 phone-light:ring-amber-500/30'
            : 'bg-indigo-400/10 text-indigo-300 ring-indigo-400/20 phone-light:bg-indigo-500/15 phone-light:text-indigo-700 phone-light:ring-indigo-500/30',
        )}
      >
        <Icon className="h-3 w-3" />
      </span>

      <div className="min-w-0 flex-1">
        {slot.driver ? (
          <div className="flex items-center gap-1.5">
            <span
              className={cn(
                'flex h-5 w-5 shrink-0 items-center justify-center rounded-full text-[9px] font-bold',
                isYou
                  ? 'bg-primary text-primary-foreground'
                  : 'bg-white/[0.06] text-zinc-300 phone-light:bg-zinc-900/[0.08] phone-light:text-zinc-700',
              )}
            >
              {slot.driver.initials}
            </span>
            <span
              className={cn(
                'truncate text-[12px] font-semibold',
                isYou
                  ? 'text-primary'
                  : 'text-zinc-100 phone-light:text-zinc-900',
              )}
            >
              {slot.driver.name}
            </span>
            {isYou && (
              <span className="rounded-full bg-primary/15 px-1.5 py-0.5 text-[8px] font-bold uppercase tracking-wider text-primary">
                {t('driverApp.sim.planning.you')}
              </span>
            )}
          </div>
        ) : (
          <span className="text-[11px] italic text-zinc-500">
            {t('driverApp.sim.planning.unassigned')}
          </span>
        )}
        <p className="mt-0.5 flex items-center gap-1 text-[10px] text-zinc-500 tabular-nums">
          {slot.plate ? (
            <span className="font-mono">{slot.plate}</span>
          ) : (
            <span className="italic">—</span>
          )}
          <span aria-hidden>·</span>
          <span>{SHIFT_RANGES[kind]}</span>
        </p>
      </div>
    </div>
  )
}
