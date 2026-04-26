import { useEffect, useRef, useState } from 'react'
import { motion, useReducedMotion } from 'framer-motion'
import { Flag, MapPin, Navigation, Satellite } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import { usePhoneSim } from '../usePhoneSim'

const TICK_MS = 250
const TARGET_DURATION_MS = 6_500

export function RideActiveScreen() {
  const { t } = useTranslation()
  const { state, dispatch } = usePhoneSim()
  const ride = state.currentRide
  const reduce = useReducedMotion()

  // Cabs only knows time + GPS during the ride — no fare API into Uber/
  // Bolt/Heetch. We track elapsed seconds and a synthetic GPS-fix
  // counter for ambient feel; the actual fare is typed manually at end.
  const [elapsed, setElapsed] = useState(0)
  const [gpsFixes, setGpsFixes] = useState(0)
  const startedAt = useRef<number>(Date.now())

  useEffect(() => {
    if (!ride) return
    startedAt.current = Date.now()
    const id = window.setInterval(() => {
      const dt = Date.now() - startedAt.current
      setElapsed(Math.floor(dt / 1000))
      // 1 GPS fix per second is what most driver apps log.
      setGpsFixes(Math.floor(dt / 1000))
    }, TICK_MS)
    return () => window.clearInterval(id)
  }, [ride])

  if (!ride) return null

  const handleEnd = () => {
    dispatch({
      type: 'ARRIVE_AT_DESTINATION',
      arrivedDurationSec: Math.max(1, elapsed),
    })
  }

  const min = Math.floor(elapsed / 60)
  const sec = elapsed % 60

  return (
    <div className="relative flex h-full flex-col">
      <div
        aria-hidden
        className="relative h-44 w-full overflow-hidden border-b border-white/[0.06] bg-zinc-900"
        style={{
          backgroundImage:
            'radial-gradient(circle at 30% 40%, rgba(59,130,246,0.2), transparent 60%), radial-gradient(circle at 70% 70%, rgba(99,102,241,0.18), transparent 55%)',
        }}
      >
        <svg
          className="absolute inset-0 h-full w-full"
          viewBox="0 0 280 180"
          fill="none"
          aria-hidden
        >
          <defs>
            <linearGradient id="route" x1="0" y1="0" x2="1" y2="1">
              <stop offset="0%" stopColor="#3b82f6" />
              <stop offset="100%" stopColor="#a855f7" />
            </linearGradient>
          </defs>
          <path
            d="M30 150 C 80 130, 100 60, 160 60 S 240 70, 250 30"
            stroke="url(#route)"
            strokeWidth="3"
            strokeLinecap="round"
            fill="none"
          />
          {Array.from({ length: 12 }).map((_, i) => (
            <line
              key={i}
              x1={20 + i * 22}
              y1={170}
              x2={26 + i * 22}
              y2={170}
              stroke="rgba(255,255,255,0.06)"
              strokeWidth="1"
            />
          ))}
        </svg>
        {!reduce && (
          <motion.span
            aria-hidden
            className="absolute h-3 w-3 rounded-full bg-primary shadow-[0_0_24px_rgba(59,130,246,0.9)]"
            style={{ top: 145, left: 24 }}
            animate={{
              top: [145, 60, 30],
              left: [24, 160, 250],
            }}
            transition={{
              duration: TARGET_DURATION_MS / 1000,
              ease: 'easeInOut',
            }}
          />
        )}
        <div className="absolute left-3 top-3 inline-flex items-center gap-1.5 rounded-full bg-zinc-950/70 px-2 py-1 text-[10px] font-semibold text-emerald-300 ring-1 ring-emerald-500/30 backdrop-blur">
          <span className="relative flex h-1.5 w-1.5">
            <span className="absolute inset-0 animate-ping rounded-full bg-emerald-500/70" />
            <span className="relative h-1.5 w-1.5 rounded-full bg-emerald-500" />
          </span>
          {t('driverApp.sim.ride.inProgress')}
        </div>
      </div>

      <div className="flex flex-1 flex-col gap-3 px-5 py-4">
        {/*
          Cabs only knows the driver's current GPS position — not where the
          customer is going. So at ride start we capture the pickup point,
          and the destination stays "to be detected" until the driver
          ends the course (which fires another GPS read).
        */}
        <div className="rounded-2xl bg-white/[0.04] p-3 phone-light:bg-zinc-900/[0.04]">
          <div className="flex items-center justify-between gap-2">
            <span className="inline-flex items-center gap-1.5 text-[9px] font-semibold uppercase tracking-[0.18em] text-emerald-300 phone-light:text-emerald-700">
              <span className="relative flex h-1.5 w-1.5">
                <span className="absolute inset-0 animate-ping rounded-full bg-emerald-500/70" />
                <span className="relative h-1.5 w-1.5 rounded-full bg-emerald-500" />
              </span>
              {t('driverApp.sim.ride.gpsActive')}
            </span>
            <span className="text-[9px] uppercase tracking-wider text-zinc-500">
              {t('driverApp.sim.ride.gpsAccuracy')}
            </span>
          </div>

          <div className="mt-2 flex items-start gap-3">
            <span className="mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-primary/15 text-primary">
              <MapPin className="h-3 w-3" />
            </span>
            <div className="min-w-0 flex-1">
              <p className="text-[10px] uppercase tracking-wider text-emerald-400 phone-light:text-emerald-700">
                {t('driverApp.sim.ride.pickupCaptured')}
              </p>
              <p className="truncate text-sm font-semibold text-zinc-100 phone-light:text-zinc-900">
                {ride.template.pickup}
              </p>
            </div>
          </div>

          <div className="ml-3 my-1 h-3 w-px bg-white/[0.12] phone-light:bg-zinc-900/[0.15]" />

          <div className="flex items-start gap-3">
            <span className="mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-zinc-700/30 text-zinc-500 phone-light:bg-zinc-900/[0.06] phone-light:text-zinc-500">
              <Flag className="h-3 w-3" />
            </span>
            <div className="min-w-0 flex-1">
              <p className="text-[10px] uppercase tracking-wider text-zinc-500">
                {t('driverApp.sim.ride.destinationPending')}
              </p>
              <p className="truncate text-xs italic text-zinc-500">
                {t('driverApp.sim.ride.destinationDetectedAtEnd')}
              </p>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-2">
          <div className="rounded-xl bg-white/[0.04] p-3 phone-light:bg-zinc-900/[0.04]">
            <p className="text-[10px] uppercase tracking-wider text-zinc-500">
              {t('driverApp.sim.ride.duration')}
            </p>
            <p className="mt-0.5 text-xl font-extrabold text-zinc-100 tabular-nums phone-light:text-zinc-900">
              {min.toString().padStart(2, '0')}:
              {sec.toString().padStart(2, '0')}
            </p>
          </div>
          <div className="rounded-xl bg-white/[0.04] p-3 phone-light:bg-zinc-900/[0.04]">
            <p className="flex items-center gap-1 text-[10px] uppercase tracking-wider text-zinc-500">
              <Satellite className="h-3 w-3 text-emerald-400" />
              {t('driverApp.sim.ride.gpsFixesLabel')}
            </p>
            <p className="mt-0.5 text-xl font-extrabold text-emerald-400 tabular-nums phone-light:text-emerald-700">
              {gpsFixes}
            </p>
          </div>
        </div>

        <p className="rounded-xl border border-amber-400/20 bg-amber-400/[0.05] px-3 py-2 text-[10px] leading-snug text-amber-200 phone-light:border-amber-500/30 phone-light:bg-amber-400/[0.1] phone-light:text-amber-700">
          {t('driverApp.sim.ride.fareAtEndNote')}
        </p>

        <button
          type="button"
          onClick={handleEnd}
          className="mt-auto flex w-full items-center justify-center gap-2 rounded-xl bg-rose-500/90 py-3 text-sm font-semibold text-white shadow-[0_0_30px_-10px_rgba(244,63,94,0.7)] transition-transform hover:-translate-y-0.5 active:scale-[0.98]"
        >
          <Navigation className="h-4 w-4" />
          {t('driverApp.sim.ride.endRide')}
        </button>
      </div>
    </div>
  )
}
