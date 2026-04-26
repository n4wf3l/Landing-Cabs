import { useEffect, useMemo, useState } from 'react'
import { AnimatePresence, motion, useReducedMotion } from 'framer-motion'
import { useTranslation } from 'react-i18next'
import { CalendarPlus, Check, Stethoscope } from 'lucide-react'
import { cn } from '@/lib/utils'
import type { LeaveType } from './types'

interface Props {
  open: boolean
  type: LeaveType
  onClose: () => void
  onSubmit: (request: { dates: string[]; note?: string }) => void
}

/**
 * Bottom-sheet to file a leave / sick-day request from the planning
 * screen. Sick mode is single-day (today / tomorrow only — operators
 * accept that 90% of sick reports happen the morning of). Leave mode
 * lets the driver multi-pick from the next 14 days.
 *
 * Communicates the operator-side accountability message in the
 * subtitle: the demand goes straight to the patron, no SMS lost in
 * WhatsApp threads.
 */
export function LeaveRequestSheet({ open, type, onClose, onSubmit }: Props) {
  const { t, i18n } = useTranslation()
  const reduce = useReducedMotion()
  const [dates, setDates] = useState<string[]>([])
  const [note, setNote] = useState('')

  // Reset on open so a fresh sheet always starts empty.
  useEffect(() => {
    if (open) {
      setDates([])
      setNote('')
    }
  }, [open, type])

  const dayOptions = useMemo(() => buildDayOptions(type, i18n.language), [
    type,
    i18n.language,
  ])

  const isoToday = dayOptions[0]?.iso ?? ''

  const toggleDate = (iso: string) => {
    setDates((curr) =>
      curr.includes(iso) ? curr.filter((d) => d !== iso) : [...curr, iso],
    )
  }

  const canSubmit = dates.length > 0
  const handleSubmit = () => {
    if (!canSubmit) return
    onSubmit({
      dates: [...dates].sort(),
      note: note.trim() || undefined,
    })
    onClose()
  }

  const Icon = type === 'sick' ? Stethoscope : CalendarPlus
  const tone = type === 'sick' ? 'rose' : 'sky'

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          key="leave-sheet"
          role="dialog"
          aria-modal="true"
          aria-label={t(`driverApp.sim.leave.${type}.title`)}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: reduce ? 0.01 : 0.2 }}
          className="absolute inset-0 z-30 flex items-end justify-center bg-black/50 backdrop-blur-[2px]"
          onClick={onClose}
        >
          <motion.div
            initial={reduce ? { opacity: 0 } : { y: '100%' }}
            animate={reduce ? { opacity: 1 } : { y: 0 }}
            exit={reduce ? { opacity: 0 } : { y: '100%' }}
            transition={
              reduce
                ? { duration: 0.01 }
                : { type: 'spring', stiffness: 280, damping: 28 }
            }
            onClick={(e) => e.stopPropagation()}
            className="phone-scroll relative max-h-[88%] w-full overflow-y-auto rounded-t-3xl border-t border-white/10 bg-zinc-900/95 px-4 pb-5 pt-2 backdrop-blur-xl phone-light:border-zinc-900/[0.08] phone-light:bg-white/95"
          >
            <span
              aria-hidden
              className="mx-auto mb-3 block h-1 w-10 rounded-full bg-white/20 phone-light:bg-zinc-900/[0.15]"
            />

            <div className="mb-3 flex items-center gap-2.5">
              <span
                className={cn(
                  'flex h-9 w-9 shrink-0 items-center justify-center rounded-xl ring-1',
                  tone === 'rose'
                    ? 'bg-rose-400/15 text-rose-300 ring-rose-400/30 phone-light:text-rose-700 phone-light:ring-rose-500/40'
                    : 'bg-sky-400/15 text-sky-300 ring-sky-400/30 phone-light:text-sky-700 phone-light:ring-sky-500/40',
                )}
              >
                <Icon className="h-4 w-4" />
              </span>
              <div className="min-w-0 flex-1">
                <h3 className="text-base font-bold tracking-tight text-white phone-light:text-zinc-900">
                  {t(`driverApp.sim.leave.${type}.title`)}
                </h3>
                <p className="text-[11px] leading-snug text-zinc-400 phone-light:text-zinc-600">
                  {t('driverApp.sim.leave.subtitle')}
                </p>
              </div>
            </div>

            <p className="mb-1.5 text-[10px] font-semibold uppercase tracking-wider text-zinc-500">
              {t(`driverApp.sim.leave.${type}.datesLabel`)}
            </p>
            <div className="grid grid-cols-3 gap-1.5">
              {dayOptions.map((opt) => {
                const active = dates.includes(opt.iso)
                return (
                  <button
                    key={opt.iso}
                    type="button"
                    onClick={() => toggleDate(opt.iso)}
                    aria-pressed={active}
                    className={cn(
                      'relative flex flex-col items-center justify-center rounded-xl border px-2 py-2 text-center transition-colors',
                      active
                        ? tone === 'rose'
                          ? 'border-rose-400/50 bg-rose-400/10 phone-light:border-rose-500/50 phone-light:bg-rose-500/10'
                          : 'border-sky-400/50 bg-sky-400/10 phone-light:border-sky-500/50 phone-light:bg-sky-500/10'
                        : 'border-white/[0.08] bg-white/[0.03] hover:border-white/[0.15] phone-light:border-zinc-900/[0.08] phone-light:bg-zinc-900/[0.02] phone-light:hover:border-zinc-900/[0.15]',
                    )}
                  >
                    <span
                      className={cn(
                        'text-[9px] font-semibold uppercase tracking-wider',
                        active
                          ? tone === 'rose'
                            ? 'text-rose-300 phone-light:text-rose-700'
                            : 'text-sky-300 phone-light:text-sky-700'
                          : 'text-zinc-500',
                      )}
                    >
                      {opt.weekday}
                    </span>
                    <span
                      className={cn(
                        'text-sm font-bold tabular-nums',
                        active
                          ? 'text-white phone-light:text-zinc-900'
                          : 'text-zinc-300 phone-light:text-zinc-700',
                      )}
                    >
                      {opt.day}
                    </span>
                    <span className="text-[9px] tabular-nums text-zinc-500">
                      {opt.month}
                    </span>
                    {opt.iso === isoToday && (
                      <span className="mt-0.5 inline-flex items-center gap-0.5 text-[8px] font-semibold uppercase tracking-wider text-primary">
                        {t('driverApp.sim.leave.today')}
                      </span>
                    )}
                    {active && (
                      <span
                        className={cn(
                          'absolute -right-1 -top-1 inline-flex h-4 w-4 items-center justify-center rounded-full text-zinc-950',
                          tone === 'rose' ? 'bg-rose-400' : 'bg-sky-400',
                        )}
                      >
                        <Check className="h-2.5 w-2.5" />
                      </span>
                    )}
                  </button>
                )
              })}
            </div>

            <p className="mt-4 mb-1.5 text-[10px] font-semibold uppercase tracking-wider text-zinc-500">
              {t('driverApp.sim.leave.noteLabel')}
            </p>
            <textarea
              value={note}
              onChange={(e) => setNote(e.target.value)}
              placeholder={t(`driverApp.sim.leave.${type}.notePlaceholder`)}
              rows={2}
              maxLength={140}
              className="w-full rounded-xl border border-white/[0.1] bg-zinc-950/40 px-3 py-2 text-[12px] text-white outline-none ring-primary/40 transition-shadow placeholder:text-zinc-600 focus:ring-2 phone-light:border-zinc-900/[0.12] phone-light:bg-white phone-light:text-zinc-900"
            />

            <button
              type="button"
              onClick={handleSubmit}
              disabled={!canSubmit}
              className={cn(
                'mt-4 flex w-full items-center justify-center gap-2 rounded-xl py-2.5 text-sm font-semibold transition-all',
                canSubmit
                  ? tone === 'rose'
                    ? 'bg-rose-500 text-white shadow-[0_0_30px_-10px_rgba(244,63,94,0.7)] hover:-translate-y-0.5 active:scale-[0.98]'
                    : 'bg-sky-500 text-white shadow-[0_0_30px_-10px_rgba(56,189,248,0.7)] hover:-translate-y-0.5 active:scale-[0.98]'
                  : 'cursor-not-allowed bg-white/[0.04] text-zinc-600 phone-light:bg-zinc-900/[0.05] phone-light:text-zinc-500',
              )}
            >
              {t('driverApp.sim.leave.submit')}
            </button>

            <button
              type="button"
              onClick={onClose}
              className="mt-2 inline-flex w-full items-center justify-center rounded-xl py-2 text-[12px] font-medium text-zinc-400 transition-colors hover:text-zinc-200 phone-light:text-zinc-600 phone-light:hover:text-zinc-900"
            >
              {t('driverApp.sim.leave.dismiss')}
            </button>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}

interface DayOption {
  iso: string
  weekday: string
  day: string
  month: string
}

function buildDayOptions(type: LeaveType, lang: string): DayOption[] {
  const now = new Date()
  // Sick covers a week (typical flu / cold / doctor's note window).
  // Leave shows the next 14 days so the driver can plan ahead. Both
  // modes are multi-select — the driver picks every day they need.
  const span = type === 'sick' ? 7 : 14
  const out: DayOption[] = []
  const weekdayFmt = new Intl.DateTimeFormat(lang, { weekday: 'short' })
  const monthFmt = new Intl.DateTimeFormat(lang, { month: 'short' })
  for (let i = 0; i < span; i += 1) {
    const d = new Date(now)
    d.setDate(now.getDate() + i)
    out.push({
      iso: toIsoDate(d),
      weekday: weekdayFmt.format(d).replace('.', ''),
      day: String(d.getDate()).padStart(2, '0'),
      month: monthFmt.format(d).replace('.', ''),
    })
  }
  return out
}

function toIsoDate(d: Date): string {
  const y = d.getFullYear()
  const m = String(d.getMonth() + 1).padStart(2, '0')
  const day = String(d.getDate()).padStart(2, '0')
  return `${y}-${m}-${day}`
}
