import { useCallback, useEffect, useState } from 'react'
import {
  AnimatePresence,
  motion,
  useMotionTemplate,
  useMotionValue,
  useReducedMotion,
  useSpring,
  useTransform,
} from 'framer-motion'
import { useTranslation } from 'react-i18next'
import { ArrowRight, Moon, Sun, X } from 'lucide-react'
import { LOCALES, type LocaleCode } from '@/lib/constants'
import { useFirstVisit } from '@/hooks/useFirstVisit'
import { useTheme } from '@/hooks/useTheme'
import { cn } from '@/lib/utils'

const EASE_APPLE = [0.22, 1, 0.36, 1] as const
const EASE_VERCEL = [0.16, 1, 0.3, 1] as const

const TAGLINES: Record<LocaleCode, string> = {
  fr: 'Gestion de flotte simplifiée',
  en: 'Fleet management, simplified',
  nl: 'Vlootbeheer, vereenvoudigd',
  de: 'Flottenverwaltung, vereinfacht',
}

const CYCLE_ORDER: LocaleCode[] = ['fr', 'en', 'nl', 'de']

export function SplashScreen() {
  const [isFirst, markSeen] = useFirstVisit()
  const [visible, setVisible] = useState<boolean>(isFirst)
  const { i18n } = useTranslation()
  const reduce = useReducedMotion()
  const { theme, setTheme } = useTheme()
  const [taglineIdx, setTaglineIdx] = useState(0)

  const mouseX = useMotionValue(-1000)
  const mouseY = useMotionValue(-1000)
  const spotX = useSpring(mouseX, { stiffness: 90, damping: 22, mass: 0.4 })
  const spotY = useSpring(mouseY, { stiffness: 90, damping: 22, mass: 0.4 })
  const spotlight = useMotionTemplate`radial-gradient(520px circle at ${spotX}px ${spotY}px, hsl(var(--primary) / 0.14), transparent 65%)`

  const isDark = theme === 'dark'

  useEffect(() => {
    if (!visible || reduce) return
    const handler = (e: MouseEvent) => {
      mouseX.set(e.clientX)
      mouseY.set(e.clientY)
    }
    window.addEventListener('pointermove', handler)
    return () => window.removeEventListener('pointermove', handler)
  }, [visible, reduce, mouseX, mouseY])

  useEffect(() => {
    if (!visible) return
    const prev = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    return () => {
      document.body.style.overflow = prev
    }
  }, [visible])

  useEffect(() => {
    if (!visible || reduce) return
    const id = window.setInterval(() => {
      setTaglineIdx((i) => (i + 1) % CYCLE_ORDER.length)
    }, 1800)
    return () => window.clearInterval(id)
  }, [visible, reduce])

  const dismiss = useCallback(() => {
    setVisible(false)
    window.setTimeout(markSeen, 600)
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

  const currentTagline = TAGLINES[CYCLE_ORDER[taglineIdx] ?? 'fr']

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
            transition: { duration: reduce ? 0 : 0.55, ease: EASE_APPLE },
          }}
          className={cn(
            'fixed inset-0 z-[200] flex flex-col items-center justify-center overflow-hidden px-6 py-10',
            isDark
              ? 'bg-gradient-to-br from-zinc-950 via-[#0d1526] to-[#0a1028]'
              : 'bg-gradient-to-br from-slate-50 via-white to-blue-50/70',
          )}
        >
          <MeshGradient reduce={!!reduce} isDark={isDark} />

          {!reduce && (
            <motion.div
              aria-hidden
              className="pointer-events-none absolute inset-0"
              style={{ background: spotlight }}
            />
          )}

          <GridOverlay isDark={isDark} />

          <div className="relative z-10 flex w-full max-w-5xl flex-col items-center">
            <motion.img
              layoutId="brand-logo"
              src={isDark ? '/tlogo_white.png' : '/tlogo_black.png'}
              alt=""
              width={80}
              height={80}
              initial={reduce ? { opacity: 0 } : { scale: 0.4, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={
                reduce
                  ? { duration: 0.01 }
                  : {
                      type: 'spring',
                      stiffness: 260,
                      damping: 20,
                      delay: 0,
                    }
              }
              className="relative h-20 w-auto drop-shadow-[0_0_30px_rgba(59,130,246,0.35)]"
            />

            <h1
              aria-label="CABS"
              className="mt-6 flex select-none items-baseline leading-[0.85] tracking-[-0.055em] text-primary"
              style={{ perspective: 1200 }}
            >
              {'CABS'.split('').map((letter, i) => (
                <motion.span
                  key={`${letter}-${i}`}
                  initial={
                    reduce
                      ? { opacity: 0 }
                      : { opacity: 0, y: 80, rotateX: -95 }
                  }
                  animate={{ opacity: 1, y: 0, rotateX: 0 }}
                  transition={
                    reduce
                      ? { duration: 0.01 }
                      : {
                          delay: 0.15 + i * 0.06,
                          type: 'spring',
                          stiffness: 220,
                          damping: 16,
                        }
                  }
                  style={{
                    display: 'inline-block',
                    transformOrigin: '50% 100%',
                    transformStyle: 'preserve-3d',
                    fontSize: 'clamp(5rem, 14vw, 10rem)',
                    fontWeight: 800,
                  }}
                >
                  {letter}
                </motion.span>
              ))}
            </h1>

            <div className="relative mt-8 h-10 w-full max-w-[640px] overflow-hidden">
              <AnimatePresence mode="wait">
                <motion.p
                  key={taglineIdx}
                  initial={
                    reduce
                      ? { opacity: 0 }
                      : { opacity: 0, y: 20, filter: 'blur(10px)' }
                  }
                  animate={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
                  exit={
                    reduce
                      ? { opacity: 0 }
                      : { opacity: 0, y: -20, filter: 'blur(10px)' }
                  }
                  transition={{
                    duration: reduce ? 0.01 : 0.55,
                    ease: EASE_VERCEL,
                  }}
                  className={cn(
                    'absolute inset-0 text-center text-xl font-medium tracking-tight sm:text-2xl',
                    isDark ? 'text-zinc-300' : 'text-zinc-700',
                  )}
                >
                  {currentTagline}
                </motion.p>
              </AnimatePresence>
            </div>

            <motion.span
              aria-hidden
              initial={{ scaleX: 0, opacity: 0 }}
              animate={{ scaleX: 1, opacity: 1 }}
              transition={{
                delay: reduce ? 0 : 0.7,
                duration: reduce ? 0.01 : 0.5,
                ease: EASE_APPLE,
              }}
              className="mt-10 block h-px w-24 origin-center bg-gradient-to-r from-transparent via-primary/60 to-transparent"
            />

            <motion.div
              initial={reduce ? { opacity: 0 } : { opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{
                delay: reduce ? 0 : 0.85,
                duration: reduce ? 0.01 : 0.4,
                ease: EASE_VERCEL,
              }}
              className="mt-6 flex flex-col items-center gap-3"
            >
              <p
                className={cn(
                  'text-[10px] font-semibold uppercase tracking-[0.28em]',
                  isDark ? 'text-zinc-500' : 'text-zinc-500',
                )}
              >
                Thème · Theme · Thema
              </p>
              <div
                role="group"
                aria-label="Theme"
                className={cn(
                  'inline-flex rounded-full border p-1 shadow-sm backdrop-blur-xl',
                  isDark
                    ? 'border-white/10 bg-white/[0.04]'
                    : 'border-black/[0.06] bg-white/70',
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
                          className="absolute inset-0 rounded-full bg-primary shadow-glow"
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
              initial={reduce ? { opacity: 0 } : { opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{
                delay: reduce ? 0 : 1.05,
                duration: reduce ? 0.01 : 0.4,
                ease: EASE_VERCEL,
              }}
              className="mt-8 flex w-full flex-col items-center"
            >
              <p
                className={cn(
                  'mb-5 text-[10px] font-semibold uppercase tracking-[0.28em]',
                  isDark ? 'text-zinc-500' : 'text-zinc-500',
                )}
              >
                Langue · Language · Taal · Sprache
              </p>
              <div
                className="grid w-full max-w-[620px] grid-cols-2 gap-3 sm:grid-cols-4"
                style={{ perspective: 900 }}
              >
                {LOCALES.map((locale, i) => (
                  <LanguageCard
                    key={locale.code}
                    locale={locale}
                    delay={reduce ? 0 : 1.2 + i * 0.05}
                    onSelect={() => pickLanguage(locale.code)}
                    reduce={!!reduce}
                    isDark={isDark}
                  />
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
            transition={{ delay: reduce ? 0 : 1.5, duration: 0.3 }}
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

          <RoutePath reduce={!!reduce} />
        </motion.div>
      )}
    </AnimatePresence>
  )
}

function MeshGradient({ reduce, isDark }: { reduce: boolean; isDark: boolean }) {
  if (reduce) {
    return (
      <div
        aria-hidden
        className={cn(
          'pointer-events-none absolute inset-0',
          isDark ? 'bg-primary/[0.07]' : 'bg-primary/[0.04]',
        )}
      />
    )
  }
  return (
    <>
      <motion.div
        aria-hidden
        animate={{ x: [0, 120, -60, 0], y: [0, -90, 70, 0] }}
        transition={{ duration: 19, repeat: Infinity, ease: 'linear' }}
        className={cn(
          'pointer-events-none absolute left-[20%] top-[18%] h-[620px] w-[620px] rounded-full blur-[130px]',
          isDark ? 'bg-blue-500/25' : 'bg-blue-400/35',
        )}
      />
      <motion.div
        aria-hidden
        animate={{ x: [0, -130, 70, 0], y: [0, 90, -70, 0] }}
        transition={{ duration: 23, repeat: Infinity, ease: 'linear' }}
        className={cn(
          'pointer-events-none absolute bottom-[10%] right-[14%] h-[520px] w-[520px] rounded-full blur-[130px]',
          isDark ? 'bg-indigo-500/20' : 'bg-indigo-300/40',
        )}
      />
      <motion.div
        aria-hidden
        animate={{ x: [0, 70, -150, 0], y: [0, -50, 110, 0] }}
        transition={{ duration: 27, repeat: Infinity, ease: 'linear' }}
        className={cn(
          'pointer-events-none absolute right-[28%] top-[52%] h-[420px] w-[420px] rounded-full blur-[120px]',
          isDark ? 'bg-sky-400/10' : 'bg-sky-300/25',
        )}
      />
    </>
  )
}

function GridOverlay({ isDark }: { isDark: boolean }) {
  const color = isDark ? 'rgba(148,163,184,0.06)' : 'rgba(15,23,42,0.04)'
  return (
    <div
      aria-hidden
      className="pointer-events-none absolute inset-0"
      style={{
        maskImage:
          'radial-gradient(ellipse 80% 55% at 50% 45%, black 35%, transparent 80%)',
        WebkitMaskImage:
          'radial-gradient(ellipse 80% 55% at 50% 45%, black 35%, transparent 80%)',
        backgroundImage: `linear-gradient(to right, ${color} 1px, transparent 1px), linear-gradient(to bottom, ${color} 1px, transparent 1px)`,
        backgroundSize: '60px 60px',
      }}
    />
  )
}

function RoutePath({ reduce }: { reduce: boolean }) {
  if (reduce) return null
  return (
    <svg
      aria-hidden
      viewBox="0 0 1200 120"
      preserveAspectRatio="none"
      className="pointer-events-none absolute bottom-6 left-0 right-0 mx-auto h-16 w-full max-w-5xl opacity-70"
    >
      <defs>
        <linearGradient id="route-grad" x1="0%" y1="0%" x2="100%" y2="0%">
          <stop offset="0%" stopColor="rgba(59,130,246,0)" />
          <stop offset="25%" stopColor="rgba(59,130,246,0.7)" />
          <stop offset="75%" stopColor="rgba(99,102,241,0.7)" />
          <stop offset="100%" stopColor="rgba(99,102,241,0)" />
        </linearGradient>
      </defs>
      <motion.path
        d="M 0 90 Q 200 20 400 70 T 800 60 T 1200 40"
        stroke="url(#route-grad)"
        strokeWidth={1.5}
        strokeLinecap="round"
        strokeDasharray="3 10"
        fill="none"
        initial={{ pathLength: 0 }}
        animate={{ pathLength: 1 }}
        transition={{ delay: 0.5, duration: 1.4, ease: EASE_APPLE }}
      />
    </svg>
  )
}

interface LanguageCardProps {
  locale: (typeof LOCALES)[number]
  delay: number
  onSelect: () => void
  reduce: boolean
  isDark: boolean
}

function LanguageCard({
  locale,
  delay,
  onSelect,
  reduce,
  isDark,
}: LanguageCardProps) {
  const x = useMotionValue(0.5)
  const y = useMotionValue(0.5)
  const rotateY = useTransform(x, [0, 1], [-10, 10])
  const rotateX = useTransform(y, [0, 1], [8, -8])
  const shineX = useTransform(x, [0, 1], ['-40%', '140%'])
  const shine = useMotionTemplate`linear-gradient(115deg, transparent 40%, hsl(var(--primary) / 0.18) 50%, transparent 60%) ${shineX} 50% / 100% 100% no-repeat`

  const handleMove = (e: React.PointerEvent<HTMLButtonElement>) => {
    const rect = e.currentTarget.getBoundingClientRect()
    x.set((e.clientX - rect.left) / rect.width)
    y.set((e.clientY - rect.top) / rect.height)
  }

  const handleLeave = () => {
    x.set(0.5)
    y.set(0.5)
  }

  return (
    <motion.button
      type="button"
      onClick={onSelect}
      aria-label={locale.label}
      onPointerMove={reduce ? undefined : handleMove}
      onPointerLeave={reduce ? undefined : handleLeave}
      initial={reduce ? { opacity: 0 } : { opacity: 0, y: 16, scale: 0.94 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={
        reduce
          ? { duration: 0.01 }
          : { delay, type: 'spring', stiffness: 240, damping: 22 }
      }
      whileTap={reduce ? undefined : { scale: 0.96 }}
      style={
        reduce
          ? undefined
          : { rotateX, rotateY, transformStyle: 'preserve-3d' }
      }
      className={cn(
        'group relative flex flex-col items-center gap-1.5 overflow-hidden rounded-xl border px-5 py-5 transition-[border-color,box-shadow,background-color] duration-300',
        isDark
          ? 'border-white/10 bg-white/[0.035] hover:border-primary/50 hover:bg-white/[0.06]'
          : 'border-black/[0.07] bg-white/80 hover:border-primary/50 hover:bg-white',
        'hover:shadow-glow focus-visible:border-primary/60 focus-visible:shadow-glow',
      )}
    >
      {!reduce && (
        <motion.span
          aria-hidden
          style={{ background: shine }}
          className="pointer-events-none absolute inset-0 opacity-0 transition-opacity duration-300 group-hover:opacity-100"
        />
      )}
      <span className="relative text-[17px] font-semibold leading-none tracking-tight">
        {locale.label}
      </span>
      <span
        className={cn(
          'relative mt-1 text-[10px] font-medium uppercase tracking-[0.3em] transition-colors group-hover:text-primary',
          isDark ? 'text-zinc-500' : 'text-zinc-500',
        )}
      >
        {locale.code}
      </span>
      <ArrowRight
        aria-hidden
        className="pointer-events-none absolute right-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 translate-x-3 text-primary opacity-0 transition-all duration-300 group-hover:translate-x-0 group-hover:opacity-100"
      />
    </motion.button>
  )
}
