import { useEffect, useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { Banknote, Check, CheckCircle2, Flag, MapPin } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import { cn } from '@/lib/utils'
import type { Platform } from '../types'
import { usePhoneSim } from '../usePhoneSim'
import { Money } from '../ui'

const PLATFORMS: Platform[] = ['uber', 'bolt', 'heetch', 'cash']

const PLATFORM_TONE: Record<Platform, string> = {
  uber: 'from-zinc-200/20 via-zinc-300/10 to-transparent',
  bolt: 'from-emerald-400/25 via-emerald-500/10 to-transparent',
  heetch: 'from-fuchsia-400/25 via-fuchsia-500/10 to-transparent',
  cash: 'from-amber-400/25 via-amber-500/10 to-transparent',
}

export function RideEndPickerScreen() {
  const { t } = useTranslation()
  const { state, dispatch } = usePhoneSim()
  const ride = state.currentRide
  const meterFare = ride?.arrivedFare ?? ride?.template.brut ?? 0

  const [selected, setSelected] = useState<Platform | null>(null)
  const [cash, setCash] = useState<string>(meterFare.toFixed(2).replace('.', ','))

  useEffect(() => {
    if (selected === 'cash' && !cash) {
      setCash(meterFare.toFixed(2).replace('.', ','))
    }
  }, [selected, cash, meterFare])

  if (!ride) return null

  const cashAmount = Number(cash.replace(',', '.'))
  const cashValid = selected === 'cash' && cashAmount > 0
  const canConfirm = selected !== null && (selected !== 'cash' || cashValid)

  const handleConfirm = () => {
    if (!canConfirm || !selected) return
    dispatch({
      type: 'COMPLETE_RIDE',
      platform: selected,
      cashAmount:
        selected === 'cash' ? Number(cashAmount.toFixed(2)) : undefined,
    })
  }

  const min = Math.floor((ride.arrivedDurationSec ?? 0) / 60)
  const sec = (ride.arrivedDurationSec ?? 0) % 60

  return (
    <div className="flex h-full flex-col px-5 pb-4 pt-3">
      <div className="flex items-center gap-2">
        <span className="flex h-8 w-8 items-center justify-center rounded-full bg-emerald-500/15 text-emerald-400 ring-1 ring-emerald-500/30 phone-light:text-emerald-700">
          <CheckCircle2 className="h-4 w-4" />
        </span>
        <div>
          <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-zinc-500">
            {t('driverApp.sim.ridePicker.eyebrow')}
          </p>
          <h2 className="text-base font-bold tracking-tight phone-light:text-zinc-900">
            {t('driverApp.sim.ridePicker.title')}
          </h2>
        </div>
      </div>

      <div className="mt-3 rounded-xl border border-white/[0.06] bg-white/[0.02] p-2.5 phone-light:border-zinc-900/[0.08] phone-light:bg-zinc-900/[0.03]">
        <div className="flex items-center gap-2 text-[11px]">
          <MapPin className="h-3 w-3 text-primary" />
          <span className="truncate text-zinc-200 phone-light:text-zinc-800">
            {ride.template.pickup}
          </span>
        </div>
        <div className="ml-1.5 my-1 h-2 w-px bg-white/10 phone-light:bg-zinc-900/[0.12]" />
        <div className="flex items-center gap-2 text-[11px]">
          <Flag className="h-3 w-3 text-fuchsia-300 phone-light:text-fuchsia-700" />
          <span className="truncate text-zinc-200 phone-light:text-zinc-800">
            {ride.template.destination}
          </span>
        </div>
        <div className="mt-2 flex items-center justify-between border-t border-white/[0.06] pt-2 text-[10px] text-zinc-500 phone-light:border-zinc-900/[0.06]">
          <span>
            {min.toString().padStart(2, '0')}:{sec.toString().padStart(2, '0')}
          </span>
          <span className="font-semibold text-primary tabular-nums">
            <Money value={meterFare} />
          </span>
        </div>
      </div>

      <p className="mt-3 text-[11px] text-zinc-500">
        {t('driverApp.sim.ridePicker.subtitle')}
      </p>

      <div className="mt-2 grid grid-cols-2 gap-2">
        {PLATFORMS.map((p) => {
          const active = selected === p
          return (
            <button
              key={p}
              type="button"
              onClick={() => setSelected(p)}
              aria-pressed={active}
              className={cn(
                'group relative flex flex-col items-start gap-1 overflow-hidden rounded-xl border bg-gradient-to-br p-2.5 text-left transition-all',
                PLATFORM_TONE[p],
                active
                  ? 'border-primary/60 shadow-glow ring-2 ring-primary/40'
                  : 'border-white/[0.06] hover:border-white/[0.12] phone-light:border-zinc-900/[0.08] phone-light:hover:border-zinc-900/[0.15]',
              )}
            >
              {active && (
                <span className="absolute right-2 top-2 inline-flex h-4 w-4 items-center justify-center rounded-full bg-primary text-primary-foreground">
                  <Check className="h-2.5 w-2.5" />
                </span>
              )}
              <span className="text-sm font-bold tracking-tight text-white phone-light:text-zinc-900">
                {t(`driverApp.sim.platforms.${p}`)}
              </span>
              <span className="text-[10px] text-zinc-500">
                {t(`driverApp.sim.ridePicker.platformHint.${p}`)}
              </span>
            </button>
          )
        })}
      </div>

      <AnimatePresence initial={false}>
        {selected === 'cash' && (
          <motion.div
            key="cash-input"
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.25 }}
            className="overflow-hidden"
          >
            <div className="mt-3 rounded-xl border border-amber-400/30 bg-amber-400/[0.06] p-3 phone-light:border-amber-500/40 phone-light:bg-amber-400/[0.12]">
              <div className="flex items-center gap-2">
                <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-amber-400/20 text-amber-300 phone-light:text-amber-700">
                  <Banknote className="h-4 w-4" />
                </span>
                <p className="text-[10px] font-semibold uppercase tracking-wider text-amber-300 phone-light:text-amber-700">
                  {t('driverApp.sim.ridePicker.cashLabel')}
                </p>
              </div>
              <div className="mt-2 flex items-baseline gap-1.5">
                <input
                  type="text"
                  inputMode="decimal"
                  autoFocus
                  value={cash}
                  onChange={(e) =>
                    setCash(e.target.value.replace(/[^\d.,]/g, ''))
                  }
                  placeholder="0,00"
                  className="flex-1 rounded-lg border border-white/[0.1] bg-zinc-950/40 px-2.5 py-2 text-2xl font-extrabold tabular-nums text-white outline-none ring-amber-400/40 transition-shadow focus:ring-2 phone-light:border-zinc-900/[0.12] phone-light:bg-white phone-light:text-zinc-900"
                  aria-label={t('driverApp.sim.ridePicker.cashLabel')}
                />
                <span className="text-base font-bold text-zinc-300 phone-light:text-zinc-700">
                  €
                </span>
              </div>
              <p className="mt-2 text-[10px] text-zinc-500">
                {t('driverApp.sim.ridePicker.cashHint')}
              </p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <button
        type="button"
        onClick={handleConfirm}
        disabled={!canConfirm}
        className={cn(
          'mt-auto flex w-full items-center justify-center gap-2 rounded-xl py-3 text-sm font-semibold transition-all',
          canConfirm
            ? 'bg-primary text-primary-foreground shadow-glow hover:-translate-y-0.5 active:scale-[0.98]'
            : 'cursor-not-allowed bg-white/[0.04] text-zinc-600 phone-light:bg-zinc-900/[0.05] phone-light:text-zinc-500',
        )}
      >
        {t('driverApp.sim.ridePicker.confirm')}
      </button>
    </div>
  )
}
