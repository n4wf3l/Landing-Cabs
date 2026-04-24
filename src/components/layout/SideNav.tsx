import { BellRing } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import { AnimatePresence, motion } from 'framer-motion'
import { Button } from '@/components/ui/button'
import { NAV_ANCHORS } from '@/lib/constants'
import { useNearBottom } from '@/hooks/useNearBottom'
import { usePrefersReducedMotion } from '@/hooks/usePrefersReducedMotion'
import { cn } from '@/lib/utils'
import { LanguageSwitcher } from './LanguageSwitcher'
import { ThemeToggle } from './ThemeToggle'

function scrollToAnchor(href: string) {
  const id = href.replace('#', '')
  const el = document.getElementById(id)
  if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' })
}

export function SideNav() {
  const { t } = useTranslation()
  const visible = useNearBottom(100)
  const reduce = usePrefersReducedMotion()

  return (
    <AnimatePresence>
      {visible && (
        <motion.aside
          aria-label="Secondary"
          initial={reduce ? { opacity: 0 } : { opacity: 0, x: 24 }}
          animate={reduce ? { opacity: 1 } : { opacity: 1, x: 0 }}
          exit={reduce ? { opacity: 0 } : { opacity: 0, x: 24 }}
          transition={{ duration: 0.3, ease: 'easeOut' }}
          className={cn(
            'fixed right-4 top-1/2 z-40 hidden -translate-y-1/2 md:block',
            'rounded-2xl border border-border/60 bg-background/80 p-3 shadow-lg backdrop-blur-xl',
          )}
        >
          <nav
            className="flex flex-col gap-1"
            aria-label="Floating primary"
          >
            {NAV_ANCHORS.map((link) => (
              <button
                key={link.href}
                type="button"
                onClick={() => scrollToAnchor(link.href)}
                className="rounded-md px-3 py-2 text-left text-sm font-medium text-muted-foreground transition-colors hover:bg-accent hover:text-foreground"
              >
                {t(link.key)}
              </button>
            ))}
          </nav>

          <div className="my-3 h-px bg-border/60" />

          <div className="flex items-center justify-between gap-2 px-1">
            <LanguageSwitcher />
            <ThemeToggle />
          </div>

          <Button
            size="sm"
            className="mt-3 w-full gap-1.5"
            onClick={() => scrollToAnchor('#notify')}
          >
            <BellRing className="h-3.5 w-3.5" />
            {t('nav.notifyCta')}
          </Button>
        </motion.aside>
      )}
    </AnimatePresence>
  )
}
