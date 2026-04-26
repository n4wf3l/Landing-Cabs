import { motion, useReducedMotion } from 'framer-motion'
import { MapPin } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import { usePhoneSim } from './usePhoneSim'

/**
 * iOS-style location permission alert that overlays the phone screen the
 * first time the user enters the demo. Persists via the simulator's
 * `locationGranted` state, so it never re-prompts after grant.
 *
 * Real driver apps (Uber/Bolt/Heetch) all show this on first launch — the
 * familiar dialog reinforces the simulator's authenticity.
 */
export function LocationPermissionPrompt() {
  const { t } = useTranslation()
  const { state, dispatch } = usePhoneSim()
  const reduce = useReducedMotion()

  // Only show once the demo has actually started — let the user enjoy the
  // demo-start screen first.
  if (state.screen === 'demo-start') return null
  if (state.locationGranted) return null
  // While the user sits on the "denied" blocking screen, the OS-style alert
  // is hidden — they have to tap "Réessayer" to bring it back.
  if (state.locationDenied) return null

  const grant = () => dispatch({ type: 'GRANT_LOCATION' })
  const deny = () => dispatch({ type: 'DENY_LOCATION' })

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: reduce ? 0.01 : 0.18 }}
      className="absolute inset-0 z-30 flex items-center justify-center bg-black/40 px-6 backdrop-blur-[2px]"
      role="alertdialog"
      aria-modal="true"
      aria-label={t('driverApp.sim.location.title')}
    >
      <motion.div
        initial={
          reduce ? { opacity: 0 } : { opacity: 0, scale: 0.92, y: 6 }
        }
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={reduce ? { opacity: 0 } : { opacity: 0, scale: 0.96 }}
        transition={
          reduce
            ? { duration: 0.01 }
            : { type: 'spring', stiffness: 320, damping: 26 }
        }
        className="w-[252px] overflow-hidden rounded-[14px] bg-[#f2f2f7] text-zinc-900 shadow-[0_30px_60px_-15px_rgba(0,0,0,0.6)]"
      >
        {/* Header */}
        <div className="px-4 pb-4 pt-5 text-center">
          <span className="mx-auto mb-3 flex h-11 w-11 items-center justify-center rounded-[12px] bg-gradient-to-br from-blue-400 to-blue-600 shadow-md">
            <MapPin className="h-5 w-5 text-white" fill="currentColor" />
          </span>
          <h3 className="text-[15px] font-bold leading-tight tracking-tight">
            {t('driverApp.sim.location.title')}
          </h3>
          <p className="mt-1.5 text-[12px] leading-snug text-zinc-700">
            {t('driverApp.sim.location.body')}
          </p>
          <p className="mt-2 text-[10px] uppercase tracking-wider text-zinc-500">
            {t('driverApp.sim.location.precise')}
          </p>
        </div>

        {/* Buttons (iOS-style stacked) */}
        <div className="border-t border-zinc-300/70">
          <button
            type="button"
            onClick={grant}
            className="block w-full py-2.5 text-center text-[15px] text-blue-600 transition-colors hover:bg-zinc-200/40 active:bg-zinc-300/40"
          >
            {t('driverApp.sim.location.allowOnce')}
          </button>
          <button
            type="button"
            onClick={grant}
            className="block w-full border-t border-zinc-300/70 py-2.5 text-center text-[15px] font-semibold text-blue-600 transition-colors hover:bg-zinc-200/40 active:bg-zinc-300/40"
          >
            {t('driverApp.sim.location.allowWhileUsing')}
          </button>
          <button
            type="button"
            onClick={deny}
            className="block w-full border-t border-zinc-300/70 py-2.5 text-center text-[15px] text-blue-600 transition-colors hover:bg-zinc-200/40 active:bg-zinc-300/40"
          >
            {t('driverApp.sim.location.deny')}
          </button>
        </div>
      </motion.div>
    </motion.div>
  )
}
