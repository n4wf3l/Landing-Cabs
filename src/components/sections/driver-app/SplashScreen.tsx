import { useEffect } from 'react'
import { motion, useReducedMotion } from 'framer-motion'
import { useTranslation } from 'react-i18next'
import { DRIVER } from './mockData'
import { usePhoneSim } from './usePhoneSim'

const DISPLAY_MS = 2200

/**
 * Branded splash screen shown right after the driver grants location.
 * Mirrors what real driver apps (Uber/Bolt) do on warm-up: a quick
 * "Hello {name}" + their company badge while the app finishes booting.
 *
 * Auto-dismisses via DISMISS_SPLASH after DISPLAY_MS so the simulator
 * never stays stuck on it. Persists via `splashShown` so the splash
 * never re-appears once seen — e.g. on reload, or if the user revokes
 * and re-grants location.
 */
export function SplashScreen() {
  const { t } = useTranslation()
  const { state, dispatch, phoneTheme } = usePhoneSim()
  const reduce = useReducedMotion()

  const visible =
    state.locationGranted &&
    !state.splashShown &&
    state.screen !== 'demo-start'

  useEffect(() => {
    if (!visible) return
    const id = window.setTimeout(
      () => dispatch({ type: 'DISMISS_SPLASH' }),
      DISPLAY_MS,
    )
    return () => window.clearTimeout(id)
  }, [visible, dispatch])

  if (!visible) return null

  const firstName = DRIVER.fullName.split(' ')[0]
  const isLight = phoneTheme === 'light'
  const logoSrc = isLight
    ? `${import.meta.env.BASE_URL}tlogo_black.png`
    : `${import.meta.env.BASE_URL}tlogo_white.png`

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: reduce ? 0.01 : 0.32 }}
      className={
        'absolute inset-0 z-30 flex flex-col items-center justify-center overflow-hidden px-6 ' +
        (isLight
          ? 'bg-gradient-to-br from-white via-zinc-50 to-zinc-100 text-zinc-900'
          : 'bg-gradient-to-br from-zinc-950 via-[#0a1226] to-[#070a1f] text-white')
      }
      role="status"
      aria-live="polite"
    >
      {/* Brand glow */}
      <div
        aria-hidden
        className="pointer-events-none absolute -top-10 left-1/2 h-[280px] w-[280px] -translate-x-1/2 rounded-full bg-primary/20 blur-3xl"
      />

      {/* Cabs logo */}
      <motion.img
        initial={reduce ? { opacity: 0 } : { opacity: 0, y: -10, scale: 0.9 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={
          reduce
            ? { duration: 0.01 }
            : { type: 'spring', stiffness: 220, damping: 22, delay: 0.05 }
        }
        src={logoSrc}
        alt="Cabs"
        decoding="async"
        loading="eager"
        className="h-12 w-auto select-none"
      />

      {/* Welcome */}
      <motion.h2
        initial={reduce ? { opacity: 0 } : { opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: reduce ? 0.01 : 0.4, delay: reduce ? 0 : 0.18 }}
        className="mt-8 text-center text-[22px] font-bold tracking-tight"
      >
        {t('driverApp.sim.splash.welcome', { name: firstName })}
      </motion.h2>

      {/* Divider */}
      <motion.div
        aria-hidden
        initial={reduce ? { opacity: 0 } : { scaleX: 0, opacity: 0 }}
        animate={{ scaleX: 1, opacity: 1 }}
        transition={{ duration: reduce ? 0.01 : 0.45, delay: reduce ? 0 : 0.3 }}
        className={
          'mt-3 h-px w-16 origin-center ' +
          (isLight ? 'bg-zinc-300' : 'bg-white/15')
        }
      />

      {/* Company label + name */}
      <motion.p
        initial={reduce ? { opacity: 0 } : { opacity: 0, y: 6 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: reduce ? 0.01 : 0.4, delay: reduce ? 0 : 0.36 }}
        className={
          'mt-3 text-[10px] font-medium uppercase tracking-[0.18em] ' +
          (isLight ? 'text-zinc-500' : 'text-white/50')
        }
      >
        {t('driverApp.sim.splash.companyLabel')}
      </motion.p>
      <motion.p
        initial={reduce ? { opacity: 0 } : { opacity: 0, y: 6 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: reduce ? 0.01 : 0.4, delay: reduce ? 0 : 0.42 }}
        className="mt-1 text-center text-[15px] font-semibold"
      >
        {t('driverApp.sim.splash.companyName')}
      </motion.p>

      {/* Loader bar */}
      <div
        className={
          'mt-10 h-[3px] w-32 overflow-hidden rounded-full ' +
          (isLight ? 'bg-zinc-200' : 'bg-white/10')
        }
        aria-hidden
      >
        <motion.div
          initial={{ x: '-100%' }}
          animate={reduce ? { x: 0 } : { x: '100%' }}
          transition={
            reduce
              ? { duration: 0.01 }
              : { duration: DISPLAY_MS / 1000, ease: 'easeInOut' }
          }
          className="h-full w-full bg-gradient-brand"
        />
      </div>
    </motion.div>
  )
}
