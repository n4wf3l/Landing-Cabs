import { AnimatePresence, motion } from 'framer-motion'
import { Info, X } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import { useAdminApp } from '../useAdminApp'

export function DemoToast() {
  const { t } = useTranslation()
  const { demoToast, dismissDemoToast } = useAdminApp()

  return (
    <div className="pointer-events-none absolute inset-x-0 bottom-4 z-40 flex justify-center px-4">
      <AnimatePresence>
        {demoToast && (
          <motion.div
            key={demoToast.id}
            role="status"
            aria-live="polite"
            initial={{ opacity: 0, y: 16, scale: 0.96 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 8, scale: 0.96 }}
            transition={{ duration: 0.25, ease: [0.22, 1, 0.36, 1] }}
            className="pointer-events-auto flex max-w-sm items-start gap-2.5 rounded-lg border border-amber-500/30 bg-zinc-900/95 px-3 py-2 shadow-xl backdrop-blur"
          >
            <span
              aria-hidden
              className="mt-0.5 inline-flex h-5 w-5 shrink-0 items-center justify-center rounded-md bg-amber-500/15 text-amber-300"
            >
              <Info className="h-3 w-3" />
            </span>
            <div className="min-w-0 flex-1">
              <p className="text-[11px] font-semibold leading-tight text-zinc-100">
                {demoToast.message}
              </p>
              <p className="mt-0.5 text-[10px] leading-tight text-zinc-400">
                {t('admin.demoToast.subtitle')}
              </p>
            </div>
            <button
              type="button"
              onClick={dismissDemoToast}
              aria-label={t('common.close')}
              className="ml-1 inline-flex h-5 w-5 shrink-0 items-center justify-center rounded text-zinc-500 transition-colors hover:bg-white/[0.08] hover:text-zinc-200"
            >
              <X className="h-3 w-3" />
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
