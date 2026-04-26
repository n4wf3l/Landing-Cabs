import { useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import {
  ArrowLeft,
  Banknote,
  Check,
  CheckCircle2,
  Flag,
  MapPin,
} from 'lucide-react'
import { useTranslation } from 'react-i18next'
import { cn } from '@/lib/utils'
import type { Platform } from '../types'
import { usePhoneSim } from '../usePhoneSim'

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

  const [selected, setSelected] = useState<Platform | null>(null)
  const [net, setNet] = useState<string>('')

  if (!ride) return null

  const netAmount = Number(net.replace(',', '.'))
  const netValid = Number.isFinite(netAmount) && netAmount > 0
  const canConfirm = selected !== null && netValid

  const handleConfirm = () => {
    if (!canConfirm || !selected) return
    dispatch({
      type: 'COMPLETE_RIDE',
      platform: selected,
      netEntered: Number(netAmount.toFixed(2)),
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

      {/*
        At this moment Cabs has just fired a GPS read to capture the
        destination — it was unknown until now. The "détecté GPS" pill
        on the destination row makes that explicit.
      */}
      <div className="mt-3 rounded-xl border border-white/[0.06] bg-white/[0.02] p-2.5 phone-light:border-zinc-900/[0.08] phone-light:bg-zinc-900/[0.03]">
        <div className="flex items-center gap-2 text-[11px]">
          <MapPin className="h-3 w-3 text-primary" />
          <span className="truncate text-zinc-200 phone-light:text-zinc-800">
            {ride.template.pickup}
          </span>
        </div>
        <div className="ml-1.5 my-1 h-2 w-px bg-white/10 phone-light:bg-zinc-900/[0.12]" />
        <div className="flex items-center justify-between gap-2 text-[11px]">
          <span className="flex min-w-0 items-center gap-2">
            <Flag className="h-3 w-3 shrink-0 text-fuchsia-300 phone-light:text-fuchsia-700" />
            <span className="truncate text-zinc-200 phone-light:text-zinc-800">
              {ride.template.destination}
            </span>
          </span>
          <span className="inline-flex shrink-0 items-center gap-1 rounded-full bg-emerald-500/15 px-1.5 py-0.5 text-[8px] font-semibold uppercase tracking-wider text-emerald-300 ring-1 ring-emerald-500/30 phone-light:text-emerald-700">
            <span className="relative flex h-1 w-1">
              <span className="absolute inset-0 animate-ping rounded-full bg-emerald-500/70" />
              <span className="relative h-1 w-1 rounded-full bg-emerald-500" />
            </span>
            {t('driverApp.sim.ridePicker.gpsDetected')}
          </span>
        </div>
        <div className="mt-2 flex items-center justify-between border-t border-white/[0.06] pt-2 text-[10px] text-zinc-500 phone-light:border-zinc-900/[0.06]">
          <span>{t('driverApp.sim.ride.duration')}</span>
          <span className="font-semibold text-zinc-300 tabular-nums phone-light:text-zinc-700">
            {min.toString().padStart(2, '0')}:{sec.toString().padStart(2, '0')}
          </span>
        </div>
      </div>

      <p className="mt-3 text-[11px] text-zinc-500">
        {selected === null
          ? t('driverApp.sim.ridePicker.subtitle')
          : t('driverApp.sim.ridePicker.subtitleSelected')}
      </p>

      {/*
        Once a platform is picked we collapse the 2×2 grid down to two
        cards: a "Retour" affordance + the chosen platform (kept active).
        Frees vertical room for the fare input below on a 290 px shell.
      */}
      <div className="mt-2 grid grid-cols-2 gap-2">
        {selected === null ? (
          PLATFORMS.map((p) => (
            <PlatformCard
              key={p}
              platform={p}
              active={false}
              onClick={() => setSelected(p)}
            />
          ))
        ) : (
          <>
            <button
              type="button"
              onClick={() => {
                setSelected(null)
                setNet('')
              }}
              className="group flex flex-col items-start gap-1 rounded-xl border border-white/[0.06] bg-white/[0.02] p-2.5 text-left transition-all hover:border-white/[0.12] hover:bg-white/[0.04] phone-light:border-zinc-900/[0.08] phone-light:bg-zinc-900/[0.02] phone-light:hover:border-zinc-900/[0.15]"
            >
              <ArrowLeft className="h-4 w-4 text-zinc-400 transition-transform group-hover:-translate-x-0.5 phone-light:text-zinc-600" />
              <span className="text-sm font-bold tracking-tight text-white phone-light:text-zinc-900">
                {t('common.back')}
              </span>
              <span className="text-[10px] text-zinc-500">
                {t('driverApp.sim.ridePicker.changePlatform')}
              </span>
            </button>
            <PlatformCard platform={selected} active onClick={() => {}} />
          </>
        )}
      </div>

      {/*
        Manual NET entry — required for every platform. Cabs has no API
        connection to Uber/Bolt/Heetch, and we don't pretend to compute
        commission. The driver enters what they actually receive, read
        from the platform's "your earnings" line at end of ride. Cash =
        the bill the customer paid.
      */}
      <AnimatePresence initial={false}>
        {selected !== null && (
          <motion.div
            key="net-input"
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.25 }}
            className="overflow-hidden"
          >
            <div className="mt-3 rounded-xl border border-amber-400/25 bg-amber-400/[0.05] p-3 phone-light:border-amber-500/35 phone-light:bg-amber-400/[0.1]">
              <p className="inline-flex items-center gap-1.5 text-[10px] font-semibold uppercase tracking-wider text-amber-300 phone-light:text-amber-700">
                <Banknote className="h-3 w-3" />
                {t(`driverApp.sim.ridePicker.netLabel.${selected}`)}
              </p>
              <div className="relative mt-2">
                <input
                  type="text"
                  inputMode="decimal"
                  autoFocus
                  value={net}
                  size={6}
                  onChange={(e) =>
                    setNet(e.target.value.replace(/[^\d.,]/g, ''))
                  }
                  placeholder="0,00"
                  className="w-full rounded-lg border border-white/[0.1] bg-zinc-950/40 py-2 pl-3 pr-7 text-lg font-bold tabular-nums text-white outline-none ring-amber-400/40 transition-shadow focus:ring-2 phone-light:border-zinc-900/[0.12] phone-light:bg-white phone-light:text-zinc-900"
                  aria-label={t(`driverApp.sim.ridePicker.netLabel.${selected}`)}
                />
                <span
                  aria-hidden
                  className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-sm font-semibold text-zinc-500 phone-light:text-zinc-500"
                >
                  €
                </span>
              </div>
              <p className="mt-1.5 text-[10px] leading-snug text-zinc-500">
                {t(`driverApp.sim.ridePicker.netHint.${selected}`)}
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

interface PlatformCardProps {
  platform: Platform
  active: boolean
  onClick: () => void
}

function PlatformCard({ platform, active, onClick }: PlatformCardProps) {
  const { t } = useTranslation()
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={active}
      className={cn(
        'group relative flex flex-col items-start gap-1 overflow-hidden rounded-xl border bg-gradient-to-br p-2.5 text-left transition-all',
        PLATFORM_TONE[platform],
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
        {t(`driverApp.sim.platforms.${platform}`)}
      </span>
      <span className="text-[10px] text-zinc-500">
        {t(`driverApp.sim.ridePicker.platformHint.${platform}`)}
      </span>
    </button>
  )
}
