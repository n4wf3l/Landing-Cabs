import { AnimatePresence, motion } from 'framer-motion'
import { ArrowUp } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import { useScrollPosition } from '@/hooks/useScrollPosition'
import { usePrefersReducedMotion } from '@/hooks/usePrefersReducedMotion'
import { cn } from '@/lib/utils'

const THRESHOLD = 320

export function ScrollToTopButton() {
  const y = useScrollPosition()
  const reduce = usePrefersReducedMotion()
  const { t } = useTranslation()
  const visible = y > THRESHOLD

  const handleClick = () => {
    window.scrollTo({ top: 0, behavior: reduce ? 'auto' : 'smooth' })
  }

  return (
    <AnimatePresence>
      {visible && (
        <motion.button
          type="button"
          onClick={handleClick}
          aria-label={t('common.backToTop', 'Retour en haut')}
          initial={reduce ? { opacity: 0 } : { opacity: 0, y: 16, scale: 0.9 }}
          animate={reduce ? { opacity: 1 } : { opacity: 1, y: 0, scale: 1 }}
          exit={reduce ? { opacity: 0 } : { opacity: 0, y: 16, scale: 0.9 }}
          transition={{ duration: 0.2, ease: 'easeOut' }}
          className={cn(
            'fixed bottom-6 right-6 z-50 inline-flex h-11 w-11 items-center justify-center rounded-full',
            'bg-primary text-primary-foreground shadow-lg shadow-primary/20',
            'hover:shadow-glow hover:-translate-y-0.5 transition-all',
            'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2',
            'md:bottom-8 md:right-8',
          )}
        >
          <ArrowUp className="h-5 w-5" aria-hidden />
        </motion.button>
      )}
    </AnimatePresence>
  )
}
