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

  // Every block now renders fully visible / interactive from frame zero.
  // The previous cascading delays (0.1s → 0.93s) made the language buttons
  // invisible for ~1.3s on mount, which felt like "unclickable" on slow
  // mobiles where JS parsing already eats 1-2s. The single splash-level
  // fade-in is enough polish.
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const fadeUp = (_delay: number) => ({
    initial: false as const,
    animate: { opacity: 1, y: 0 },
    transition: { duration: 0 },
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
              <span
                className={cn(
                  'text-3xl font-bold tracking-tight',
                  isDark ? 'text-white' : 'text-zinc-900',
                )}
              >
                Cabs
              </span>
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

            <span
              aria-hidden
              className="mt-8 block h-px w-16 bg-gradient-to-r from-transparent via-primary/60 to-transparent"
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
                {LOCALES.map((locale) => (
                  // Plain native <button> on the critical interaction. The
                  // previous motion.button + whileTap/whileHover added a
                  // small but real attach delay on first paint that made
                  // taps miss on slow mobiles before the splash felt
                  // 'alive'. CSS active:scale-[0.97] gives the press
                  // feedback without any JS in the click path.
                  <button
                    key={locale.code}
                    type="button"
                    onClick={() => pickLanguage(locale.code)}
                    aria-label={locale.label}
                    className={cn(
                      'group flex min-h-[64px] cursor-pointer flex-col items-center justify-center gap-1 rounded-lg border-2 px-3 py-3 shadow-md transition-[background-color,border-color,box-shadow,transform] duration-150 focus-visible:border-primary focus-visible:outline-none active:scale-[0.97] active:border-primary',
                      isDark
                        ? 'border-white/20 bg-white/[0.07] shadow-primary/15 hover:border-primary/60 hover:bg-white/[0.12] hover:shadow-lg hover:shadow-primary/30 active:bg-white/[0.15]'
                        : 'border-zinc-300 bg-white shadow-primary/15 hover:border-primary/60 hover:bg-slate-50 hover:shadow-lg hover:shadow-primary/30 active:bg-slate-100',
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
                  </button>
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
