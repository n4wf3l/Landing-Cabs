import { AnimatePresence, motion } from 'framer-motion'
import { RotateCcw } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import { usePhoneSim } from './usePhoneSim'

export function PhoneResetButton() {
  const { t } = useTranslation()
  const { hasProgress, resetSim } = usePhoneSim()

  return (
    <AnimatePresence>
      {hasProgress && (
        <motion.div
          key="phone-reset"
          initial={{ opacity: 0, y: -4 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -4 }}
          transition={{ duration: 0.25 }}
          className="mt-5 flex flex-col items-center gap-1.5 text-center"
        >
          <button
            type="button"
            onClick={resetSim}
            className="inline-flex items-center gap-1.5 rounded-full border border-border/60 bg-card/40 px-3 py-1.5 text-[11px] font-medium text-muted-foreground transition-colors hover:border-rose-500/40 hover:bg-rose-500/10 hover:text-rose-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background"
          >
            <RotateCcw className="h-3 w-3" />
            {t('driverApp.sim.reset.cta')}
          </button>
          <p className="text-[10px] text-muted-foreground/70">
            {t('driverApp.sim.reset.hint')}
          </p>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
