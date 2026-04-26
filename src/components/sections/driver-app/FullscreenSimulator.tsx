import { useEffect } from 'react'
import { createPortal } from 'react-dom'
import { AnimatePresence, motion } from 'framer-motion'
import { I18nextProvider, useTranslation } from 'react-i18next'
import { ArrowLeft } from 'lucide-react'
import { phoneI18n } from './phoneI18n'
import { PhoneScreen } from './PhoneShell'

/**
 * Mobile-only takeover that runs the driver-app simulator at viewport
 * size, like a real native app. Rendered in a portal so it escapes any
 * transform / containing-block constraints from the page above. Slides
 * up from the bottom; a sticky top bar exposes a "Retour au site"
 * button + brand title so users always know how to bail back to the
 * marketing page.
 */
export function FullscreenSimulator({
  open,
  onClose,
  reduce,
}: {
  open: boolean
  onClose: () => void
  reduce: boolean
}) {
  const { t } = useTranslation()

  // Lock body scroll while the takeover is up + Esc closes it.
  useEffect(() => {
    if (!open) return
    const previousOverflow = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose()
    }
    window.addEventListener('keydown', onKey)
    return () => {
      document.body.style.overflow = previousOverflow
      window.removeEventListener('keydown', onKey)
    }
  }, [open, onClose])

  if (typeof document === 'undefined') return null

  return createPortal(
    <AnimatePresence>
      {open && (
        <motion.div
          key="driver-fullscreen"
          role="dialog"
          aria-modal="true"
          aria-label={t('driverApp.fullscreen.title')}
          initial={reduce ? { opacity: 0 } : { y: '100%', opacity: 0 }}
          animate={reduce ? { opacity: 1 } : { y: 0, opacity: 1 }}
          exit={reduce ? { opacity: 0 } : { y: '100%', opacity: 0 }}
          transition={
            reduce
              ? { duration: 0.01 }
              : { type: 'spring', stiffness: 240, damping: 28 }
          }
          className="fixed inset-0 z-[60] flex flex-col bg-zinc-950"
        >
          <I18nextProvider i18n={phoneI18n}>
            <FullscreenContent onClose={onClose} reduce={reduce} />
          </I18nextProvider>
        </motion.div>
      )}
    </AnimatePresence>,
    document.body,
  )
}

function FullscreenContent({
  onClose,
  reduce,
}: {
  onClose: () => void
  reduce: boolean
}) {
  // The phone i18n namespace is now active here, so the labels in the
  // header actually come from a separate translation tree — pull the
  // wrapper-level copy from the parent landing translations via a sibling
  // hook. The provider stack works because PhoneScreen and its children
  // already expect the phone i18n.
  return (
    <>
      <FullscreenHeader onClose={onClose} />
      <div className="flex-1 overflow-hidden">
        <PhoneScreen reduce={reduce} rounded={false} />
      </div>
    </>
  )
}

/**
 * The header sits above the simulator. Uses the page-level i18n through
 * a portal hack: the parent component wraps in `phoneI18n`, but for the
 * back-button we want page strings ("Retour au site"). Easiest: keep the
 * key in the phone i18n namespace too, since both bundles ship the same
 * tree. We added `driverApp.fullscreen.*` keys to all locales.
 */
function FullscreenHeader({ onClose }: { onClose: () => void }) {
  const { t } = useTranslation()
  return (
    <header className="flex shrink-0 items-center justify-between border-b border-zinc-800/80 bg-zinc-950/95 px-3 py-2 backdrop-blur supports-[padding:env(safe-area-inset-top)]:pt-[max(0.5rem,env(safe-area-inset-top))]">
      <button
        type="button"
        onClick={onClose}
        className="inline-flex items-center gap-1.5 rounded-full border border-zinc-800 bg-zinc-900/60 px-3 py-1.5 text-xs font-semibold text-zinc-200 transition-colors hover:border-primary/40 hover:text-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
        aria-label={t('driverApp.fullscreen.exit')}
      >
        <ArrowLeft className="h-3.5 w-3.5" />
        {t('driverApp.fullscreen.exit')}
      </button>
      <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-zinc-400">
        {t('driverApp.fullscreen.title')}
      </p>
      <span className="w-[88px]" aria-hidden />
    </header>
  )
}
