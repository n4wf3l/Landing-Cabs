import { useCallback, useEffect, useState } from 'react'
import { AnimatePresence, motion, useReducedMotion } from 'framer-motion'
import { useTranslation } from 'react-i18next'
import { Moon, Sun, X } from 'lucide-react'
import { LOCALES, type LocaleCode } from '@/lib/constants'
import { useFirstVisit } from '@/hooks/useFirstVisit'
import { useTheme } from '@/hooks/useTheme'
import { cn } from '@/lib/utils'

const EASE = [0.22, 1, 0.36, 1] as const

const TAGLINES: Record<LocaleCode, string[]> = {
  fr: [
    'Gestion de flotte simplifiée',
    'Uber, Bolt, Heetch dans un seul outil',
    'Brut, net, commissions automatiques',
  ],
  en: [
    'Fleet management, simplified',
    'Uber, Bolt, Heetch in one tool',
    'Gross, net, commissions automated',
  ],
  nl: [
    'Vlootbeheer, vereenvoudigd',
    'Uber, Bolt, Heetch in één tool',
    'Bruto, netto, commissies automatisch',
  ],
  de: [
    'Flottenverwaltung, vereinfacht',
    'Uber, Bolt, Heetch in einem Tool',
    'Brutto, Netto, Provisionen automatisiert',
  ],
}

const TAGLINE_INTERVAL_MS = 2800

export function SplashScreen() {
  const [isFirst, markSeen] = useFirstVisit()
  const [visible, setVisible] = useState<boolean>(isFirst)
  const { i18n } = useTranslation()
  const reduce = useReducedMotion()
  const { theme, setTheme } = useTheme()
  const isDark = theme === 'dark'
  const [taglineIdx, setTaglineIdx] = useState(0)

  useEffect(() => {
    if (!visible) return
    const prev = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    return () => {
      document.body.style.overflow = prev
    }
  }, [visible])

  const dismiss = useCallback(() => {
    // Mark seen immediately so consumers (Hero, etc.) can start their
    // entrance animations while the splash fades out, not after.
    markSeen()
    setVisible(false)
  }, [markSeen])

  useEffect(() => {
    if (!visible) return
    const handler = (e: KeyboardEvent) => {
      if (e.key === 'Escape') dismiss()
    }
    window.addEventListener('keydown', handler)
    return () => window.removeEventListener('keydown', handler)
  }, [visible, dismiss])

  const pickLanguage = useCallback(
    (lang: LocaleCode) => {
      void i18n.changeLanguage(lang)
      dismiss()
    },
    [i18n, dismiss],
  )

  const detected = (i18n.resolvedLanguage as LocaleCode) || 'fr'
  const taglines = TAGLINES[detected] ?? TAGLINES.fr
  const tagline = taglines[taglineIdx % taglines.length]

  useEffect(() => {
    if (!visible || reduce || taglines.length <= 1) return
    const id = window.setInterval(() => {
      setTaglineIdx((i) => (i + 1) % taglines.length)
    }, TAGLINE_INTERVAL_MS)
    return () => window.clearInterval(id)
  }, [visible, reduce, taglines.length])

  const fadeUp = (delay: number) => ({
    initial: reduce ? { opacity: 0 } : { opacity: 0, y: 8 },
    animate: { opacity: 1, y: 0 },
    transition: { duration: reduce ? 0.01 : 0.5, delay: reduce ? 0 : delay, ease: EASE },
  })

  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          key="splash"
          role="dialog"
          aria-modal="true"
          aria-label="Cabs"
          initial={{ opacity: 1 }}
          exit={{
            opacity: 0,
            transition: { duration: reduce ? 0 : 0.4, ease: EASE },
          }}
          className={cn(
            'fixed inset-0 z-[200] flex flex-col items-center justify-center overflow-hidden px-6 py-10',
            isDark ? 'bg-zinc-950' : 'bg-white',
          )}
        >
          <BackgroundGlow reduce={!!reduce} isDark={isDark} />

          <div className="relative z-10 flex w-full max-w-md flex-col items-center">
            {/* Logo + wordmark — logo NEVER moves */}
            <div className="flex items-center gap-3">
              <img
                src={
                  isDark
                    ? `${import.meta.env.BASE_URL}tlogo_white.png`
                    : `${import.meta.env.BASE_URL}tlogo_black.png`
                }
                alt=""
                width={48}
                height={48}
                className="h-12 w-auto"
              />
              <motion.span
                initial={reduce ? { opacity: 0 } : { opacity: 0, x: -6 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: reduce ? 0.01 : 0.55, delay: reduce ? 0 : 0.1, ease: EASE }}
                className={cn(
                  'text-3xl font-bold tracking-tight',
                  isDark ? 'text-white' : 'text-zinc-900',
                )}
              >
                Cabs
              </motion.span>
            </div>

            <motion.div
              {...fadeUp(0.2)}
              className="relative mt-5 h-7 w-full max-w-[420px] overflow-hidden"
            >
              <AnimatePresence mode="wait">
                <motion.p
                  key={tagline}
                  initial={
                    reduce
                      ? { opacity: 0 }
                      : { opacity: 0, y: 10, filter: 'blur(6px)' }
                  }
                  animate={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
                  exit={
                    reduce
                      ? { opacity: 0 }
                      : { opacity: 0, y: -10, filter: 'blur(6px)' }
                  }
                  transition={{ duration: reduce ? 0.01 : 0.5, ease: EASE }}
                  className={cn(
                    'absolute inset-0 text-center text-base font-medium',
                    isDark ? 'text-zinc-400' : 'text-zinc-600',
                  )}
                >
                  {tagline}
                </motion.p>
              </AnimatePresence>
            </motion.div>

            <motion.span
              aria-hidden
              initial={reduce ? { opacity: 0 } : { scaleX: 0, opacity: 0 }}
              animate={{ scaleX: 1, opacity: 1 }}
              transition={{ duration: reduce ? 0.01 : 0.55, delay: reduce ? 0 : 0.35, ease: EASE }}
              className="mt-8 block h-px w-16 origin-center bg-gradient-to-r from-transparent via-primary/60 to-transparent"
            />

            <motion.div
              {...fadeUp(0.45)}
              className="mt-8 flex flex-col items-center gap-2.5"
            >
              <p
                className={cn(
                  'text-[10px] font-semibold uppercase tracking-[0.28em]',
                  isDark ? 'text-zinc-500' : 'text-zinc-500',
                )}
              >
                Thème · Theme
              </p>
              <div
                role="group"
                aria-label="Theme"
                className={cn(
                  'inline-flex rounded-full border p-1',
                  isDark
                    ? 'border-white/10 bg-white/[0.04]'
                    : 'border-black/10 bg-white',
                )}
              >
                {(['light', 'dark'] as const).map((mode) => {
                  const Icon = mode === 'light' ? Sun : Moon
                  const active = theme === mode
                  return (
                    <button
                      key={mode}
                      type="button"
                      aria-label={
                        mode === 'light' ? 'Light theme' : 'Dark theme'
                      }
                      aria-pressed={active}
                      onClick={() => setTheme(mode)}
                      className={cn(
                        'relative flex h-9 w-12 items-center justify-center rounded-full transition-colors',
                        active
                          ? 'text-primary-foreground'
                          : isDark
                            ? 'text-zinc-400 hover:text-zinc-100'
                            : 'text-zinc-600 hover:text-zinc-900',
                      )}
                    >
                      {active && (
                        <motion.span
                          layoutId="splash-theme-pill"
                          aria-hidden
                          className="absolute inset-0 rounded-full bg-primary"
                          transition={
                            reduce
                              ? { duration: 0 }
                              : {
                                  type: 'spring',
                                  stiffness: 380,
                                  damping: 32,
                                }
                          }
                        />
                      )}
                      <Icon className="relative h-4 w-4" strokeWidth={2.2} />
                    </button>
                  )
                })}
              </div>
            </motion.div>

            <motion.div
              {...fadeUp(0.6)}
              className="mt-8 flex w-full flex-col items-center gap-3"
            >
              <p
                className={cn(
                  'text-[10px] font-semibold uppercase tracking-[0.28em]',
                  isDark ? 'text-zinc-500' : 'text-zinc-500',
                )}
              >
                Langue · Language · Taal · Sprache
              </p>
              <div className="grid w-full grid-cols-2 gap-2 sm:grid-cols-4">
                {LOCALES.map((locale, i) => (
                  <motion.button
                    key={locale.code}
                    type="button"
                    onClick={() => pickLanguage(locale.code)}
                    aria-label={locale.label}
                    initial={reduce ? { opacity: 0 } : { opacity: 0, y: 8, scale: 0.96 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    transition={{
                      duration: reduce ? 0.01 : 0.4,
                      delay: reduce ? 0 : 0.75 + i * 0.06,
                      ease: EASE,
                    }}
                    whileHover={reduce ? undefined : { y: -2 }}
                    whileTap={reduce ? undefined : { scale: 0.97 }}
                    className={cn(
                      'group flex flex-col items-center gap-1 rounded-lg border px-3 py-3 shadow-lg shadow-primary/10 transition-all duration-300 focus-visible:border-primary/60 focus-visible:outline-none',
                      isDark
                        ? 'border-white/15 bg-white/[0.05] hover:border-primary/50 hover:bg-white/[0.09] hover:shadow-xl hover:shadow-primary/30'
                        : 'border-black/10 bg-white hover:border-primary/50 hover:bg-slate-50 hover:shadow-xl hover:shadow-primary/25',
                    )}
                  >
                    <span className="text-sm font-semibold tracking-tight">
                      {locale.label}
                    </span>
                    <span
                      className={cn(
                        'text-[10px] font-medium uppercase tracking-[0.2em] transition-colors group-hover:text-primary',
                        isDark ? 'text-zinc-500' : 'text-zinc-500',
                      )}
                    >
                      {locale.code}
                    </span>
                  </motion.button>
                ))}
              </div>
            </motion.div>
          </div>

          <motion.button
            type="button"
            onClick={dismiss}
            aria-label="Skip"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: reduce ? 0 : 1.1, duration: 0.3 }}
            className={cn(
              'absolute right-4 top-4 inline-flex items-center gap-1.5 rounded-md px-2.5 py-1.5 text-xs transition-colors sm:right-6 sm:top-6',
              isDark
                ? 'text-zinc-500 hover:text-zinc-200'
                : 'text-zinc-500 hover:text-zinc-900',
            )}
          >
            Skip
            <X className="h-3.5 w-3.5" />
          </motion.button>
        </motion.div>
      )}
    </AnimatePresence>
  )
}

function BackgroundGlow({ reduce, isDark }: { reduce: boolean; isDark: boolean }) {
  if (reduce) {
    return (
      <div
        aria-hidden
        className={cn(
          'pointer-events-none absolute inset-0',
          isDark
            ? 'bg-[radial-gradient(ellipse_55%_40%_at_50%_30%,hsl(var(--primary)/0.08),transparent_70%)]'
            : 'bg-[radial-gradient(ellipse_55%_40%_at_50%_30%,hsl(var(--primary)/0.05),transparent_70%)]',
        )}
      />
    )
  }
  return (
    <motion.div
      aria-hidden
      animate={{
        x: [-30, 30, -30],
        y: [-20, 20, -20],
        scale: [1, 1.06, 1],
      }}
      transition={{
        duration: 22,
        repeat: Infinity,
        ease: 'easeInOut',
      }}
      className={cn(
        'pointer-events-none absolute left-1/2 top-1/3 h-[640px] w-[640px] -translate-x-1/2 -translate-y-1/2 rounded-full blur-[140px]',
        isDark ? 'bg-primary/15' : 'bg-primary/10',
      )}
    />
  )
}
