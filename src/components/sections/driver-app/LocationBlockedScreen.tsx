import { motion, useReducedMotion } from 'framer-motion'
import { MapPinOff, RotateCcw, ShieldAlert, ShieldCheck } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import { usePhoneSim } from './usePhoneSim'

/**
 * Hard-block overlay shown when the driver tapped "Don't Allow" on the
 * iOS-style location prompt. The taxi app cannot operate without GPS, so
 * we mirror the real Uber/Bolt behaviour: the screen is unusable until
 * the driver retries.
 */
export function LocationBlockedScreen() {
  const { t } = useTranslation()
  const { state, dispatch } = usePhoneSim()
  const reduce = useReducedMotion()

  if (!state.locationDenied) return null

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: reduce ? 0.01 : 0.25 }}
      className="absolute inset-0 z-40 flex flex-col items-center justify-center px-6 text-center"
    >
      {/* Frosted dark backdrop, scoped to the phone screen */}
      <div className="absolute inset-0 -z-10 bg-zinc-950/95 backdrop-blur-xl phone-light:bg-white/95" />
      <div
        aria-hidden
        className="absolute inset-0 -z-10 opacity-60"
        style={{
          background:
            'radial-gradient(circle at 50% 35%, rgba(244,63,94,0.22), transparent 60%)',
        }}
      />

      <motion.div
        initial={reduce ? { opacity: 0 } : { scale: 0.6, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={
          reduce ? { duration: 0.01 } : { type: 'spring', stiffness: 280, damping: 22 }
        }
        className="relative mb-5 flex h-16 w-16 items-center justify-center rounded-2xl bg-rose-500/15 text-rose-400 ring-1 ring-rose-500/30 phone-light:bg-rose-500/15 phone-light:text-rose-700"
      >
        <MapPinOff className="h-8 w-8" />
        {!reduce && (
          <motion.span
            aria-hidden
            className="absolute inset-0 rounded-2xl bg-rose-500/30"
            animate={{ scale: [1, 1.4], opacity: [0.4, 0] }}
            transition={{
              duration: 1.6,
              repeat: Infinity,
              ease: 'easeOut',
            }}
          />
        )}
      </motion.div>

      <h2 className="text-[18px] font-extrabold tracking-tight text-white phone-light:text-zinc-900">
        {t('driverApp.sim.locationBlocked.title')}
      </h2>
      <p className="mx-auto mt-2 max-w-[230px] text-[12px] leading-relaxed text-zinc-300 phone-light:text-zinc-700">
        {t('driverApp.sim.locationBlocked.body')}
      </p>

      <ul className="mx-auto mt-4 max-w-[230px] space-y-2 text-left text-[11px] text-zinc-400 phone-light:text-zinc-600">
        <ReasonRow text={t('driverApp.sim.locationBlocked.reasonRides')} />
        <ReasonRow text={t('driverApp.sim.locationBlocked.reasonShift')} />
        <ReasonRow text={t('driverApp.sim.locationBlocked.reasonAtas')} />
      </ul>

      <div className="mx-auto mt-5 flex max-w-[260px] items-start gap-2 rounded-lg border border-amber-400/30 bg-amber-400/[0.08] px-3 py-2 text-left phone-light:border-amber-500/40 phone-light:bg-amber-400/[0.15]">
        <ShieldCheck className="mt-0.5 h-3.5 w-3.5 shrink-0 text-amber-300 phone-light:text-amber-700" />
        <div className="min-w-0 flex-1">
          <p className="text-[10px] font-bold uppercase tracking-wider text-amber-300 phone-light:text-amber-700">
            {t('driverApp.sim.locationBlocked.antiSpoofTitle')}
          </p>
          <p className="mt-0.5 text-[10px] leading-snug text-amber-200/90 phone-light:text-amber-800">
            {t('driverApp.sim.locationBlocked.antiSpoofBody')}
          </p>
        </div>
      </div>

      <button
        type="button"
        onClick={() => dispatch({ type: 'RETRY_LOCATION' })}
        className="mt-5 inline-flex items-center gap-2 rounded-xl bg-primary px-5 py-3 text-sm font-semibold text-primary-foreground shadow-glow transition-transform hover:-translate-y-0.5 active:scale-[0.98]"
      >
        <RotateCcw className="h-4 w-4" />
        {t('driverApp.sim.locationBlocked.retry')}
      </button>

      <p className="mt-3 text-[10px] text-zinc-500">
        {t('driverApp.sim.locationBlocked.note')}
      </p>
    </motion.div>
  )
}

function ReasonRow({ text }: { text: string }) {
  return (
    <li className="flex items-start gap-2">
      <ShieldAlert className="mt-0.5 h-3 w-3 shrink-0 text-rose-400 phone-light:text-rose-700" />
      <span>{text}</span>
    </li>
  )
}
