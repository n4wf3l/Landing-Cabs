import { useState } from 'react'
import {
  CalendarPlus,
  Clock3,
  Moon,
  Stethoscope,
  Sun,
} from 'lucide-react'
import type { LucideIcon } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import { cn } from '@/lib/utils'
import { LeaveRequestSheet } from '../LeaveRequestSheet'
import { PLANNING } from '../mockData'
import type { LeaveRequest, LeaveType, PlanningDay, PlanningSlot } from '../types'
import { ScreenScroll, ScreenTitle } from '../ui'
import { usePhoneSim } from '../usePhoneSim'

const SHIFT_RANGES = {
  day: '06:00 → 18:00',
  night: '18:00 → 06:00',
} as const

export function PlanningScreen() {
  const { t } = useTranslation()
  const { state, dispatch } = usePhoneSim()
  const [sheetType, setSheetType] = useState<LeaveType | null>(null)

  const yourSlots = PLANNING.reduce((acc, d) => {
    return acc + (d.day.driver?.isYou ? 1 : 0) + (d.night.driver?.isYou ? 1 : 0)
  }, 0)

  const handleSubmit = (req: { dates: string[]; note?: string }) => {
    if (!sheetType) return
    dispatch({
      type: 'SUBMIT_LEAVE_REQUEST',
      request: { type: sheetType, dates: req.dates, note: req.note },
    })
  }

  return (
    <ScreenScroll>
      <ScreenTitle
        eyebrow={t('driverApp.sim.planning.eyebrow')}
        title={t('driverApp.sim.planning.title')}
      />
      <p className="-mt-2 text-[11px] text-zinc-500">
        {t('driverApp.sim.planning.summary', { count: yourSlots })}
      </p>

      {/*
        Two action cards just under the subtitle. They go to the operator
        as actual demands — the demo never auto-approves them, which is
        the whole point: the patron decides, no SMS lost in WhatsApp.
      */}
      <div className="grid grid-cols-2 gap-2">
        <LeaveActionCard
          tone="sky"
          Icon={CalendarPlus}
          label={t('driverApp.sim.leave.leave.cta')}
          onClick={() => setSheetType('leave')}
        />
        <LeaveActionCard
          tone="rose"
          Icon={Stethoscope}
          label={t('driverApp.sim.leave.sick.cta')}
          onClick={() => setSheetType('sick')}
        />
      </div>

      {state.leaveRequests.length > 0 && (
        <PendingRequests requests={state.leaveRequests} />
      )}

      <ul className="space-y-2">
        {PLANNING.map((day) => (
          <PlanningRow key={day.dayKey} day={day} />
        ))}
      </ul>

      <LeaveRequestSheet
        open={sheetType !== null}
        type={sheetType ?? 'leave'}
        onClose={() => setSheetType(null)}
        onSubmit={handleSubmit}
      />
    </ScreenScroll>
  )
}

function LeaveActionCard({
  tone,
  Icon,
  label,
  onClick,
}: {
  tone: 'sky' | 'rose'
  Icon: LucideIcon
  label: string
  onClick: () => void
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        'flex flex-col items-center justify-center gap-1.5 rounded-xl border bg-gradient-to-br px-2 py-2.5 text-center transition-all hover:-translate-y-0.5 active:scale-[0.98]',
        tone === 'sky'
          ? 'border-sky-400/25 from-sky-400/10 to-transparent hover:border-sky-400/40 phone-light:border-sky-500/30 phone-light:hover:border-sky-500/50'
          : 'border-rose-400/25 from-rose-400/10 to-transparent hover:border-rose-400/40 phone-light:border-rose-500/30 phone-light:hover:border-rose-500/50',
      )}
    >
      <span
        className={cn(
          'flex h-8 w-8 shrink-0 items-center justify-center rounded-lg ring-1',
          tone === 'sky'
            ? 'bg-sky-400/15 text-sky-300 ring-sky-400/30 phone-light:text-sky-700 phone-light:ring-sky-500/40'
            : 'bg-rose-400/15 text-rose-300 ring-rose-400/30 phone-light:text-rose-700 phone-light:ring-rose-500/40',
        )}
      >
        <Icon className="h-4 w-4" />
      </span>
      <span className="text-balance text-[11px] font-semibold leading-tight tracking-tight text-white phone-light:text-zinc-900">
        {label}
      </span>
    </button>
  )
}

function PendingRequests({ requests }: { requests: LeaveRequest[] }) {
  const { t, i18n } = useTranslation()
  return (
    <section>
      <p className="mb-1.5 inline-flex items-center gap-1.5 text-[10px] font-semibold uppercase tracking-wider text-amber-300 phone-light:text-amber-700">
        <Clock3 className="h-3 w-3" />
        {t('driverApp.sim.leave.pendingTitle')}
      </p>
      <ul className="space-y-1.5">
        {requests.map((r) => (
          <li
            key={r.id}
            className="rounded-xl border border-amber-400/25 bg-amber-400/[0.04] px-3 py-2 phone-light:border-amber-500/35 phone-light:bg-amber-400/[0.08]"
          >
            <div className="flex items-center justify-between gap-2">
              <span
                className={cn(
                  'inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[9px] font-bold uppercase tracking-wider ring-1',
                  r.type === 'sick'
                    ? 'bg-rose-400/15 text-rose-300 ring-rose-400/30 phone-light:text-rose-700 phone-light:ring-rose-500/40'
                    : 'bg-sky-400/15 text-sky-300 ring-sky-400/30 phone-light:text-sky-700 phone-light:ring-sky-500/40',
                )}
              >
                {t(`driverApp.sim.leave.${r.type}.label`)}
              </span>
              <span className="text-[10px] font-semibold uppercase tracking-wider text-amber-300 phone-light:text-amber-700">
                {t('driverApp.sim.leave.pendingBadge')}
              </span>
            </div>
            <p className="mt-1 text-[11px] font-semibold text-zinc-100 tabular-nums phone-light:text-zinc-900">
              {formatDateList(r.dates, i18n.language)}
            </p>
            {r.note && (
              <p className="mt-0.5 line-clamp-2 text-[10px] italic text-zinc-500">
                « {r.note} »
              </p>
            )}
          </li>
        ))}
      </ul>
    </section>
  )
}

function formatDateList(dates: string[], lang: string): string {
  const fmt = new Intl.DateTimeFormat(lang, {
    weekday: 'short',
    day: '2-digit',
    month: 'short',
  })
  return dates
    .map((iso) => {
      const [y, m, d] = iso.split('-').map(Number)
      return fmt.format(new Date(y, m - 1, d)).replace('.', '')
    })
    .join(' · ')
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
