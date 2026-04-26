import { useEffect, useState } from 'react'
import { createPortal } from 'react-dom'
import { AnimatePresence, motion, useReducedMotion } from 'framer-motion'
import { Check, Globe, X } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import { LOCALES, type LocaleCode } from '@/lib/constants'
import { AnimatedGridBackground } from '@/components/common/AnimatedGridBackground'
import { GlowEffect } from '@/components/common/GlowEffect'
import { cn } from '@/lib/utils'

export function LanguageSwitcher() {
  const { i18n, t } = useTranslation()
  const [open, setOpen] = useState(false)
  const current = (LOCALES.find((l) => l.code === i18n.language)?.code ??
    'fr') as LocaleCode
  const currentMeta = LOCALES.find((l) => l.code === current) ?? LOCALES[0]

  return (
    <>
      <Button
        variant="ghost"
        size="sm"
        aria-label={t('nav.changeLanguage')}
        aria-haspopup="dialog"
        aria-expanded={open}
        onClick={() => setOpen(true)}
        className="gap-1.5"
      >
        <Globe className="h-4 w-4" />
        <span className="text-xs font-semibold uppercase">{currentMeta.code}</span>
      </Button>

      <LanguageModal
        open={open}
        current={current}
        onClose={() => setOpen(false)}
        onSelect={(code) => {
          const targetT = i18n.getFixedT(code)
          void i18n.changeLanguage(code)
          setOpen(false)
          if (code !== current) {
            toast.success(targetT('language.changedToast'), {
              position: 'bottom-right',
              duration: 3000,
            })
          }
        }}
      />
    </>
  )
}

interface LanguageModalProps {
  open: boolean
  current: LocaleCode
  onClose: () => void
  onSelect: (code: LocaleCode) => void
}

function LanguageModal({ open, current, onClose, onSelect }: LanguageModalProps) {
  const { t } = useTranslation()
  const reduce = useReducedMotion()

  useEffect(() => {
    if (!open) return
    const originalOverflow = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose()
    }
    window.addEventListener('keydown', onKey)
    return () => {
      document.body.style.overflow = originalOverflow
      window.removeEventListener('keydown', onKey)
    }
  }, [open, onClose])

  if (typeof document === 'undefined') return null

  return createPortal(
    <AnimatePresence>
      {open && (
        <motion.div
          key="language-modal"
          role="dialog"
          aria-modal="true"
          aria-label={t('nav.changeLanguage')}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: reduce ? 0.01 : 0.3 }}
          onClick={onClose}
          className="fixed inset-0 z-[150] flex items-center justify-center overflow-hidden bg-background/95 px-6 py-10 backdrop-blur-xl"
        >
          <AnimatedGridBackground />
          <GlowEffect color="mixed" />

          <motion.button
            type="button"
            onClick={onClose}
            aria-label={t('common.close', 'Fermer')}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ delay: reduce ? 0 : 0.2 }}
            className="absolute right-4 top-4 inline-flex h-10 w-10 items-center justify-center rounded-full border border-border/60 bg-card/60 text-muted-foreground backdrop-blur transition-colors hover:border-primary/40 hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring sm:right-6 sm:top-6"
          >
            <X className="h-5 w-5" />
          </motion.button>

          <motion.div
            initial={reduce ? { opacity: 0 } : { opacity: 0, scale: 0.96, y: 12 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={reduce ? { opacity: 0 } : { opacity: 0, scale: 0.96, y: 12 }}
            transition={
              reduce
                ? { duration: 0.01 }
                : { type: 'spring', stiffness: 220, damping: 26 }
            }
            onClick={(e) => e.stopPropagation()}
            className="relative z-10 flex w-full max-w-4xl flex-col items-center"
          >
            <motion.div
              initial={reduce ? { opacity: 0 } : { opacity: 0, y: -8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: reduce ? 0 : 0.1, duration: 0.4 }}
              className="inline-flex items-center gap-2 rounded-full border border-primary/30 bg-primary/10 px-3 py-1 text-xs font-medium text-primary"
            >
              <Globe className="h-3 w-3" />
              {t('language.eyebrow')}
            </motion.div>

            <motion.h2
              initial={reduce ? { opacity: 0 } : { opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: reduce ? 0 : 0.15, duration: 0.45 }}
              className="mt-5 text-center text-3xl font-extrabold tracking-tight sm:text-4xl lg:text-5xl"
            >
              {t('language.title')}
            </motion.h2>

            <motion.p
              initial={reduce ? { opacity: 0 } : { opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: reduce ? 0 : 0.22, duration: 0.45 }}
              className="mt-3 max-w-xl text-center text-sm text-muted-foreground sm:text-base"
            >
              {t('language.subtitle')}
            </motion.p>

            <motion.ul
              initial="hidden"
              animate="show"
              variants={{
                hidden: {},
                show: {
                  transition: {
                    staggerChildren: reduce ? 0 : 0.07,
                    delayChildren: reduce ? 0 : 0.3,
                  },
                },
              }}
              className="mt-10 grid w-full max-w-3xl grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4"
            >
              {LOCALES.map((l) => {
                const isActive = l.code === current
                return (
                  <motion.li
                    key={l.code}
                    variants={{
                      hidden: reduce
                        ? { opacity: 0 }
                        : { opacity: 0, y: 12, scale: 0.95 },
                      show: {
                        opacity: 1,
                        y: 0,
                        scale: 1,
                        transition: reduce
                          ? { duration: 0.01 }
                          : { type: 'spring', stiffness: 260, damping: 22 },
                      },
                    }}
                  >
                    <button
                      type="button"
                      onClick={() => onSelect(l.code)}
                      aria-pressed={isActive}
                      aria-label={l.label}
                      className={cn(
                        'group relative flex h-full w-full flex-col items-center gap-2 overflow-hidden rounded-2xl border p-6 text-center backdrop-blur transition-all',
                        'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring',
                        isActive
                          ? 'border-primary/60 bg-primary/10 shadow-glow'
                          : 'border-border/60 bg-card/60 hover:-translate-y-1 hover:border-primary/50 hover:bg-card hover:shadow-glow',
                      )}
                    >
                      {isActive && (
                        <span
                          aria-hidden
                          className="absolute right-3 top-3 inline-flex h-6 w-6 items-center justify-center rounded-full bg-primary text-primary-foreground"
                        >
                          <Check className="h-3.5 w-3.5" />
                        </span>
                      )}
                      <span className="text-xl font-semibold leading-none tracking-tight transition-transform group-hover:-translate-y-0.5">
                        {l.label}
                      </span>
                      <span
                        className={cn(
                          'text-[10px] font-semibold uppercase tracking-[0.3em] transition-colors',
                          isActive
                            ? 'text-primary'
                            : 'text-muted-foreground group-hover:text-primary',
                        )}
                      >
                        {l.code}
                      </span>
                    </button>
                  </motion.li>
                )
              })}
            </motion.ul>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>,
    document.body,
  )
}
