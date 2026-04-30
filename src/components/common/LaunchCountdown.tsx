import { useEffect, useState } from 'react'
import { motion, useReducedMotion } from 'framer-motion'
import { useTranslation } from 'react-i18next'
import { cn } from '@/lib/utils'

// Public launch — Monday September 1st, 2026, 09:00 Brussels time.
// Encoded in UTC to stay timezone-stable. Keep in sync with the
// `BRAND.launchDate` string in `src/lib/constants.ts` if it changes.
const LAUNCH_TARGET_MS = Date.UTC(2026, 8, 1, 7, 0, 0) // 9 AM CEST = 7 AM UTC

interface RemainingTime {
  days: number
  hours: number
  minutes: number
  seconds: number
  reached: boolean
}

function computeRemaining(now: number): RemainingTime {
  const diff = LAUNCH_TARGET_MS - now
  if (diff <= 0) {
    return { days: 0, hours: 0, minutes: 0, seconds: 0, reached: true }
  }
  const days = Math.floor(diff / 86_400_000)
  const hours = Math.floor((diff % 86_400_000) / 3_600_000)
  const minutes = Math.floor((diff % 3_600_000) / 60_000)
  const seconds = Math.floor((diff % 60_000) / 1_000)
  return { days, hours, minutes, seconds, reached: false }
}

interface Props {
  className?: string
  /** When true, the entrance animation runs alongside the rest of the
   *  Hero (delayed via `transition.delay`). Otherwise it stays at its
   *  initial hidden state. */
  introReady?: boolean
}

/**
 * Countdown to the public launch. Displayed in the Hero below the
 * subtitle. Updates once per second; pauses ticking when the tab is
 * hidden (saves battery on mobile) and resumes on visibilitychange.
 *
 * Design rationale (UI/UX Pro Max — Waitlist/Coming Soon pattern):
 * the recommended structure for pre-launch landings is
 * "hero with countdown + email capture + scarcity signals". We had
 * everything except the live ticker. Subtle styling — zinc tiles,
 * amber numerals, no over-the-top neon glow — keeps it credible vs
 * cheap launch-page templates.
 */
export function LaunchCountdown({ className, introReady = true }: Props) {
  const { t } = useTranslation()
  const reduce = useReducedMotion()
  const [now, setNow] = useState(() => Date.now())

  useEffect(() => {
    let id: number | null = null

    const tick = () => setNow(Date.now())
    const start = () => {
      if (id != null) return
      id = window.setInterval(tick, 1000)
    }
    const stop = () => {
      if (id == null) return
      window.clearInterval(id)
      id = null
    }

    const onVisibilityChange = () => {
      if (document.hidden) stop()
      else {
        tick() // refresh immediately on resume so the user sees correct values
        start()
      }
    }

    start()
    document.addEventListener('visibilitychange', onVisibilityChange)
    return () => {
      stop()
      document.removeEventListener('visibilitychange', onVisibilityChange)
    }
  }, [])

  const remaining = computeRemaining(now)

  // After launch we hide the countdown rather than show 00:00:00:00.
  if (remaining.reached) return null

  const cells: { value: number; key: 'days' | 'hours' | 'minutes' | 'seconds' }[] = [
    { value: remaining.days, key: 'days' },
    { value: remaining.hours, key: 'hours' },
    { value: remaining.minutes, key: 'minutes' },
    { value: remaining.seconds, key: 'seconds' },
  ]

  return (
    <motion.div
      initial={reduce ? false : { opacity: 0, y: 12 }}
      animate={introReady ? { opacity: 1, y: 0 } : { opacity: 0, y: 12 }}
      transition={{ duration: 0.55, delay: 0.2 }}
      className={cn('flex flex-col items-center lg:items-start', className)}
      aria-live="off"
      aria-label={t('hero.countdown.aria', {
        days: remaining.days,
        hours: remaining.hours,
        minutes: remaining.minutes,
      })}
    >
      <p className="mb-2 inline-flex items-center gap-1.5 text-[10px] font-semibold uppercase tracking-[0.18em] text-primary/80">
        <span
          aria-hidden
          className="relative inline-block h-1.5 w-1.5 rounded-full bg-primary"
        >
          {!reduce && (
            <span className="absolute inset-0 animate-ping rounded-full bg-primary/70" />
          )}
        </span>
        {t('hero.countdown.eyebrow')}
      </p>
      <div className="flex items-stretch gap-1.5 sm:gap-2">
        {cells.map(({ value, key }, i) => (
          <div key={key} className="flex items-center gap-1.5 sm:gap-2">
            <div
              className="flex min-w-[3.25rem] flex-col items-center rounded-lg border border-border/60 bg-card/60 px-2 py-1.5 backdrop-blur sm:min-w-[3.75rem] sm:px-3 sm:py-2"
              role="timer"
            >
              <span className="text-xl font-extrabold tabular-nums leading-none tracking-tight text-foreground sm:text-2xl">
                {value.toString().padStart(2, '0')}
              </span>
              <span className="mt-1 text-[9px] font-medium uppercase tracking-wider text-muted-foreground sm:text-[10px]">
                {t(`hero.countdown.${key}`)}
              </span>
            </div>
            {i < cells.length - 1 && (
              <span
                aria-hidden
                className="text-base font-bold text-muted-foreground/40 sm:text-lg"
              >
                :
              </span>
            )}
          </div>
        ))}
      </div>
    </motion.div>
  )
}
