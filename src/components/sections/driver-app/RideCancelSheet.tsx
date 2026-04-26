import { useState } from 'react'
import { AnimatePresence, motion, useReducedMotion } from 'framer-motion'
import { useTranslation } from 'react-i18next'
import { Check, ShieldAlert, UserX, X } from 'lucide-react'
import { cn } from '@/lib/utils'
import type { CancelReason } from './types'

interface Props {
  open: boolean
  onClose: () => void
  onConfirm: (reason: CancelReason) => void
}

const REASONS: ReadonlyArray<{ key: CancelReason; Icon: typeof UserX }> = [
  { key: 'no-show', Icon: UserX },
  { key: 'customer-cancelled', Icon: X },
  { key: 'other', Icon: ShieldAlert },
] as const

/**
 * iOS-style bottom sheet to record why a ride is being aborted before
 * arrival. The reason is stored on the cancelled ride entry so the
 * operator can see it later — this is the operator-accountability piece
 * that makes a real difference vs. drivers silently underreporting
 * no-shows.
 */
export function RideCancelSheet({ open, onClose, onConfirm }: Props) {
  const { t } = useTranslation()
  const reduce = useReducedMotion()
  const [reason, setReason] = useState<CancelReason | null>(null)

  const handleConfirm = () => {
    if (!reason) return
    onConfirm(reason)
    setReason(null)
  }

  const handleClose = () => {
    setReason(null)
    onClose()
  }

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          key="cancel-sheet"
          role="dialog"
          aria-modal="true"
          aria-label={t('driverApp.sim.cancel.title')}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: reduce ? 0.01 : 0.2 }}
          className="absolute inset-0 z-30 flex items-end justify-center bg-black/50 backdrop-blur-[2px]"
          onClick={handleClose}
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
            className="relative w-full overflow-hidden rounded-t-3xl border-t border-white/10 bg-zinc-900/95 px-4 pb-5 pt-2 backdrop-blur-xl phone-light:border-zinc-900/[0.08] phone-light:bg-white/95"
          >
            {/* Drag handle */}
            <span
              aria-hidden
              className="mx-auto mb-3 block h-1 w-10 rounded-full bg-white/20 phone-light:bg-zinc-900/[0.15]"
            />

            <h3 className="text-base font-bold tracking-tight text-white phone-light:text-zinc-900">
              {t('driverApp.sim.cancel.title')}
            </h3>
            <p className="mt-0.5 text-[11px] leading-snug text-zinc-400 phone-light:text-zinc-600">
              {t('driverApp.sim.cancel.subtitle')}
            </p>

            <div className="mt-3 space-y-1.5">
              {REASONS.map(({ key, Icon }) => {
                const active = reason === key
                return (
                  <button
                    key={key}
                    type="button"
                    onClick={() => setReason(key)}
                    aria-pressed={active}
                    className={cn(
                      'flex w-full items-center gap-3 rounded-xl border px-3 py-2.5 text-left transition-colors',
                      active
                        ? 'border-rose-400/50 bg-rose-400/10 phone-light:border-rose-500/50 phone-light:bg-rose-500/10'
                        : 'border-white/[0.08] bg-white/[0.03] hover:border-white/[0.15] phone-light:border-zinc-900/[0.08] phone-light:bg-zinc-900/[0.02] phone-light:hover:border-zinc-900/[0.15]',
                    )}
                  >
                    <span
                      className={cn(
                        'flex h-8 w-8 shrink-0 items-center justify-center rounded-lg ring-1 transition-colors',
                        active
                          ? 'bg-rose-400/20 text-rose-300 ring-rose-400/40 phone-light:text-rose-700 phone-light:ring-rose-500/40'
                          : 'bg-white/[0.04] text-zinc-400 ring-white/[0.06] phone-light:bg-zinc-900/[0.04] phone-light:text-zinc-600 phone-light:ring-zinc-900/[0.08]',
                      )}
                    >
                      <Icon className="h-4 w-4" />
                    </span>
                    <span className="flex-1 text-sm font-semibold text-white phone-light:text-zinc-900">
                      {t(`driverApp.sim.cancel.reasons.${key}`)}
                    </span>
                    {active && (
                      <span className="inline-flex h-5 w-5 items-center justify-center rounded-full bg-rose-400 text-zinc-950">
                        <Check className="h-3 w-3" />
                      </span>
                    )}
                  </button>
                )
              })}
            </div>

            <button
              type="button"
              onClick={handleConfirm}
              disabled={!reason}
              className={cn(
                'mt-4 flex w-full items-center justify-center gap-2 rounded-xl py-2.5 text-sm font-semibold transition-all',
                reason
                  ? 'bg-rose-500 text-white shadow-[0_0_30px_-10px_rgba(244,63,94,0.7)] hover:-translate-y-0.5 active:scale-[0.98]'
                  : 'cursor-not-allowed bg-white/[0.04] text-zinc-600 phone-light:bg-zinc-900/[0.05] phone-light:text-zinc-500',
              )}
            >
              {t('driverApp.sim.cancel.confirm')}
            </button>

            <button
              type="button"
              onClick={handleClose}
              className="mt-2 inline-flex w-full items-center justify-center rounded-xl py-2 text-[12px] font-medium text-zinc-400 transition-colors hover:text-zinc-200 phone-light:text-zinc-600 phone-light:hover:text-zinc-900"
            >
              {t('driverApp.sim.cancel.dismiss')}
            </button>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
