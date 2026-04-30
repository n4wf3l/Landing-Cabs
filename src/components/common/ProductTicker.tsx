import { useCallback, useEffect, useState } from 'react'
import { AnimatePresence, motion, useReducedMotion } from 'framer-motion'
import { useTranslation } from 'react-i18next'
import {
  ArrowUpRight,
  CalendarDays,
  CarFront,
  Check,
  MapPin,
  Smartphone,
  Users,
  Wallet,
  type LucideIcon,
} from 'lucide-react'
import { cn } from '@/lib/utils'

type SnapshotKind =
  | 'revenue'
  | 'planning'
  | 'fleet'
  | 'tracking'
  | 'drivers'
  | 'driverApp'
const ORDER: SnapshotKind[] = [
  'revenue',
  'planning',
  'fleet',
  'tracking',
  'drivers',
  'driverApp',
]
const ICONS: Record<SnapshotKind, LucideIcon> = {
  revenue: Wallet,
  planning: CalendarDays,
  fleet: CarFront,
  tracking: MapPin,
  drivers: Users,
  driverApp: Smartphone,
}

const DURATION_MS = 5500
const EASE = [0.22, 1, 0.36, 1] as const

function formatEur(value: number): string {
  return new Intl.NumberFormat('fr-BE', {
    style: 'currency',
    currency: 'EUR',
    maximumFractionDigits: 0,
  }).format(value)
}

interface Props {
  className?: string
}

export function ProductTicker({ className }: Props) {
  const { t } = useTranslation()
  const reduce = useReducedMotion()
  const [idx, setIdx] = useState(0)

  const next = useCallback(
    () => setIdx((i) => (i + 1) % ORDER.length),
    [],
  )
  const prev = useCallback(
    () => setIdx((i) => (i - 1 + ORDER.length) % ORDER.length),
    [],
  )

  // Auto-cycle. Uses setTimeout so any change to idx (manual or auto)
  // resets the timer, giving the chosen snapshot its full duration.
  useEffect(() => {
    if (reduce) return
    const id = window.setTimeout(next, DURATION_MS)
    return () => window.clearTimeout(id)
  }, [idx, next, reduce])

  // Keyboard navigation. Skips when focus is on an editable element
  // so it doesn't conflict with form fields.
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key !== 'ArrowLeft' && e.key !== 'ArrowRight') return
      const active = document.activeElement
      if (
        active instanceof HTMLInputElement ||
        active instanceof HTMLTextAreaElement ||
        (active as HTMLElement | null)?.isContentEditable
      ) {
        return
      }
      e.preventDefault()
      if (e.key === 'ArrowLeft') prev()
      else next()
    }
    window.addEventListener('keydown', handler)
    return () => window.removeEventListener('keydown', handler)
  }, [next, prev])

  const current = ORDER[idx] ?? 'revenue'

  return (
    <div className={cn('w-full max-w-md', className)}>
      <p
        className="mb-3 hidden items-center justify-center gap-2 text-[11px] font-medium text-muted-foreground md:flex lg:justify-end"
        aria-hidden
      >
        <KbdKey>←</KbdKey>
        <KbdKey>→</KbdKey>
        <span>{t('ticker.keyboardHint')}</span>
      </p>

      {/*
        Logo + card share a single silhouette so the brand glow envelops both
        as one shape. `filter: drop-shadow()` follows the rendered alpha (not
        the bounding box), and `-mb-1` makes the bottom of the logo overlap
        the rounded top of the card so the silhouette stays continuous.

        The wrapper is also the swipe surface on touch screens — drag-x with
        elastic bounce-back, and a release threshold (offset OR velocity)
        triggers prev/next. Vertical scrolling still propagates via
        `touch-pan-y`. Disabled when prefers-reduced-motion is on.
      */}
      <motion.div
        drag={reduce ? false : 'x'}
        dragConstraints={{ left: 0, right: 0 }}
        dragElastic={0.2}
        dragMomentum={false}
        onDragEnd={(_, info) => {
          const OFFSET = 50
          const VELOCITY = 300
          if (info.offset.x < -OFFSET || info.velocity.x < -VELOCITY) next()
          else if (info.offset.x > OFFSET || info.velocity.x > VELOCITY) prev()
        }}
        className="touch-pan-y [filter:drop-shadow(0_10px_28px_rgba(59,130,246,0.35))_drop-shadow(0_0_18px_rgba(250,204,21,0.18))]"
      >
        <img
          src={`${import.meta.env.BASE_URL}taxi-logo.png`}
          alt=""
          aria-hidden
          decoding="async"
          loading="eager"
          className="pointer-events-none relative -mb-1 ml-4 block h-9 w-auto select-none md:h-12"
        />
        <div className="relative overflow-hidden rounded-2xl border border-border/60 bg-card/70 p-5 backdrop-blur-xl">
          <div
            aria-hidden
            className="absolute -inset-[1px] -z-10 rounded-2xl bg-gradient-brand opacity-[0.12] blur-md"
          />

          <Header current={current} idx={idx} />

          {/* `initial={false}` on AnimatePresence skips the entrance
              animation on the FIRST snapshot. Without this, the body
              starts at opacity:0 and only animates to 1 once the framer
              animation loop runs — which can be delayed by 5-10 s on a
              slow mobile parsing the JS bundle, leaving the carousel
              body looking 'empty/black'. Subsequent snapshot changes
              still animate as before. */}
          <AnimatePresence mode="wait" initial={false}>
            <motion.div
              key={current}
              initial={reduce ? { opacity: 0 } : { opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={reduce ? { opacity: 0 } : { opacity: 0, y: -8 }}
              transition={{ duration: reduce ? 0.01 : 0.35, ease: EASE }}
              className="min-h-[170px]"
            >
              {current === 'revenue' && <RevenueBody reduce={!!reduce} />}
              {current === 'planning' && <PlanningBody reduce={!!reduce} />}
              {current === 'fleet' && <FleetBody reduce={!!reduce} />}
              {current === 'tracking' && <TrackingBody reduce={!!reduce} />}
              {current === 'drivers' && <DriversBody reduce={!!reduce} />}
              {current === 'driverApp' && <DriverAppBody reduce={!!reduce} />}
            </motion.div>
          </AnimatePresence>
        </div>
      </motion.div>
    </div>
  )
}

function KbdKey({ children }: { children: React.ReactNode }) {
  return (
    <kbd className="inline-flex h-5 min-w-[20px] items-center justify-center rounded border border-border/80 bg-card px-1 font-sans text-[11px] font-semibold text-foreground/80 shadow-[inset_0_-1px_0_rgba(0,0,0,0.06)]">
      {children}
    </kbd>
  )
}

function Header({ current, idx }: { current: SnapshotKind; idx: number }) {
  const { t } = useTranslation()
  const reduce = useReducedMotion()
  const Icon = ICONS[current]
  return (
    <header className="mb-4 flex items-center justify-between">
      <AnimatePresence mode="wait" initial={false}>
        <motion.div
          key={current}
          initial={reduce ? { opacity: 0 } : { opacity: 0, x: -6 }}
          animate={{ opacity: 1, x: 0 }}
          exit={reduce ? { opacity: 0 } : { opacity: 0, x: 6 }}
          transition={{ duration: reduce ? 0.01 : 0.25 }}
          className="flex items-center gap-2"
        >
          <span className="flex h-7 w-7 items-center justify-center rounded-md bg-primary/10 text-primary ring-1 ring-primary/20">
            <Icon className="h-3.5 w-3.5" />
          </span>
          <span className="text-sm font-semibold tracking-tight">
            {t(`ticker.tabs.${current}`)}
          </span>
        </motion.div>
      </AnimatePresence>
      <div className="flex items-center gap-1">
        {ORDER.map((_, i) => (
          <span
            key={i}
            aria-hidden
            className={cn(
              'h-1 rounded-full transition-all duration-500',
              i === idx ? 'w-6 bg-primary' : 'w-1.5 bg-muted-foreground/30',
            )}
          />
        ))}
      </div>
    </header>
  )
}

// Plain wrapper. The previous version was a motion.div with stagger
// variants and child motion.div items (rowVariants). Each snapshot
// body queued ~4-7 framer-motion animations on mount, which on real
// mobile took 6-7 s of main-thread time and held up every section
// below from rendering. Now: plain <div>, content visible instantly,
// snapshot cross-fade still handled by the outer AnimatePresence in
// ProductTicker.
function Stagger({ children }: { children: React.ReactNode }) {
  return <div className="space-y-3">{children}</div>
}

// Sample net revenue per platform — already deducted of platform fees.
// The ticker pitches Cabs's actual job: consolidating multi-platform
// nets in one view, not recomputing commissions client-side.
const REVENUE_PLATFORMS = [
  { name: 'Uber', net: 430, dotClass: 'bg-zinc-300 phone-light:bg-zinc-700' },
  { name: 'Bolt', net: 280, dotClass: 'bg-emerald-400' },
  { name: 'Heetch', net: 250, dotClass: 'bg-fuchsia-400' },
] as const

function RevenueBody({ reduce: _ }: { reduce: boolean }) {
  const { t } = useTranslation()
  const total = REVENUE_PLATFORMS.reduce((a, p) => a + p.net, 0)


  return (
    <Stagger>
      {REVENUE_PLATFORMS.map((p) => (
        <div key={p.name}
          className="flex items-baseline justify-between"
        >
          <span className="flex items-center gap-2 text-sm text-muted-foreground">
            <span aria-hidden className={cn('h-2 w-2 rounded-full', p.dotClass)} />
            {p.name}
          </span>
          <span className="text-base font-medium tabular-nums">
            {formatEur(p.net)}
          </span>
        </div>
      ))}
      <div
        aria-hidden
        className="my-1 h-px w-full bg-gradient-to-r from-transparent via-border to-transparent"
      />
      <div className="flex items-baseline justify-between">
        <span className="flex items-center gap-1.5 text-sm font-semibold text-foreground">
          <Check className="h-3.5 w-3.5 text-primary" />
          {t('ticker.revenue.net')}
        </span>
        <span className="text-2xl font-bold tabular-nums text-primary">
          {formatEur(total)}
        </span>
      </div>
    </Stagger>
  )
}

function PlanningBody({ reduce }: { reduce: boolean }) {
  const { t } = useTranslation()
  const dayPattern = [1, 1, 0, 1, 1, 1, 0]
  const nightPattern = [1, 0, 1, 1, 0, 1, 1]
  const days = t('ticker.planning.weekDays').split(',')
  const totalAssigned = [...dayPattern, ...nightPattern].filter(Boolean).length

  return (
    <div className="space-y-3">
      <div className="grid grid-cols-7 gap-1.5 text-center text-[10px] font-medium uppercase tracking-widest text-muted-foreground">
        {days.map((d, i) => (
          <span key={i}>{d}</span>
        ))}
      </div>
      <PlanningRow
        cells={dayPattern}
        label={t('ticker.planning.day')}
        baseDelay={0}
        reduce={reduce}
        tone="primary"
      />
      <PlanningRow
        cells={nightPattern}
        label={t('ticker.planning.night')}
        baseDelay={0.45}
        reduce={reduce}
        tone="muted"
      />
      <p className="flex items-center gap-1.5 pt-1 text-xs text-muted-foreground">
        <Check className="h-3 w-3 text-primary" />
        {t('ticker.planning.summary', {
          assigned: totalAssigned,
          conflicts: 0,
        })}
      </p>
    </div>
  )
}

function PlanningRow({
  cells,
  label,
  baseDelay,
  reduce,
  tone,
}: {
  cells: number[]
  label: string
  baseDelay: number
  reduce: boolean
  tone: 'primary' | 'muted'
}) {
  return (
    <div className="flex items-center gap-3">
      <span className="w-10 shrink-0 text-[10px] font-semibold uppercase tracking-widest text-muted-foreground">
        {label}
      </span>
      <div className="grid flex-1 grid-cols-7 gap-1.5">
        {cells.map((c, i) => (
          <motion.span
            key={i}
            initial={reduce ? { opacity: 0 } : { opacity: 0, scale: 0.6 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{
              delay: reduce ? 0 : baseDelay + i * 0.04,
              duration: reduce ? 0.01 : 0.25,
              ease: EASE,
            }}
            className={cn(
              'h-5 rounded-md',
              c
                ? tone === 'primary'
                  ? 'bg-primary/80 shadow-[0_0_10px_rgba(59,130,246,0.4)]'
                  : 'bg-primary/40'
                : 'bg-muted-foreground/15',
            )}
          />
        ))}
      </div>
    </div>
  )
}

function FleetBody({ reduce: _ }: { reduce: boolean }) {
  const { t } = useTranslation()

  const items = [
    { key: 'inService', count: 8, color: 'bg-emerald-500' },
    { key: 'maintenance', count: 2, color: 'bg-amber-500' },
    { key: 'repair', count: 1, color: 'bg-rose-500' },
    { key: 'archived', count: 1, color: 'bg-zinc-500' },
  ] as const

  return (
    <Stagger>
      <p className="text-sm font-semibold tracking-tight">
        {t('ticker.fleet.title', { count: 12 })}
      </p>
      {items.map((item) => (
        <div
          className="flex items-baseline justify-between"
        >
          <span className="flex items-center gap-2 text-sm text-muted-foreground">
            <span
              aria-hidden
              className={cn('h-2 w-2 rounded-full', item.color)}
            />
            {t(`ticker.fleet.${item.key}`)}
          </span>
          <span className="text-base font-semibold tabular-nums">
            {item.count}
          </span>
        </div>
      ))}
    </Stagger>
  )
}

function DriversBody({ reduce: _ }: { reduce: boolean }) {
  const { t } = useTranslation()

  const items = [
    { key: 'active', count: 19, color: 'bg-emerald-500' },
    { key: 'leave', count: 3, color: 'bg-sky-500' },
    { key: 'sick', count: 1, color: 'bg-amber-500' },
    { key: 'suspended', count: 1, color: 'bg-rose-500' },
  ] as const

  return (
    <Stagger>
      <p className="text-sm font-semibold tracking-tight">
        {t('ticker.drivers.title', { count: 24 })}
      </p>
      {items.map((item) => (
        <div
          className="flex items-baseline justify-between"
        >
          <span className="flex items-center gap-2 text-sm text-muted-foreground">
            <span
              aria-hidden
              className={cn('h-2 w-2 rounded-full', item.color)}
            />
            {t(`ticker.drivers.${item.key}`)}
          </span>
          <span className="text-base font-semibold tabular-nums">
            {item.count}
          </span>
        </div>
      ))}
    </Stagger>
  )
}

interface MapDot {
  x: number
  y: number
  status: 'available' | 'inRide'
  driftX: number
  driftY: number
}

const MAP_DOTS: MapDot[] = [
  { x: 18, y: 28, status: 'available', driftX: 4, driftY: -3 },
  { x: 35, y: 62, status: 'inRide', driftX: -3, driftY: 4 },
  { x: 52, y: 32, status: 'available', driftX: 5, driftY: 2 },
  { x: 70, y: 50, status: 'inRide', driftX: -4, driftY: -3 },
  { x: 25, y: 78, status: 'available', driftX: 3, driftY: -4 },
  { x: 60, y: 16, status: 'inRide', driftX: 4, driftY: 3 },
  { x: 82, y: 76, status: 'available', driftX: -5, driftY: -2 },
  { x: 45, y: 88, status: 'inRide', driftX: 3, driftY: -3 },
  { x: 14, y: 52, status: 'available', driftX: 2, driftY: 4 },
]

function TrackingBody({ reduce }: { reduce: boolean }) {
  const { t } = useTranslation()
  const available = MAP_DOTS.filter((d) => d.status === 'available').length
  const inRide = MAP_DOTS.filter((d) => d.status === 'inRide').length

  return (
    <div className="space-y-3">
      <p className="text-sm font-semibold tracking-tight">
        {t('ticker.tracking.title')}
      </p>
      <div className="relative h-[110px] w-full overflow-hidden rounded-lg border border-border/50 bg-gradient-to-br from-background/40 via-primary/5 to-background/40">
        <div
          aria-hidden
          className="absolute inset-0 opacity-50"
          style={{
            backgroundImage:
              'linear-gradient(to right, hsl(var(--primary) / 0.12) 1px, transparent 1px), linear-gradient(to bottom, hsl(var(--primary) / 0.12) 1px, transparent 1px)',
            backgroundSize: '22px 22px',
          }}
        />
        <div
          aria-hidden
          className="absolute inset-x-0 top-1/3 h-px bg-gradient-to-r from-transparent via-primary/30 to-transparent"
        />
        <div
          aria-hidden
          className="absolute inset-y-0 left-[38%] w-px bg-gradient-to-b from-transparent via-primary/25 to-transparent"
        />
        {MAP_DOTS.map((dot, i) => (
          <TrackingDot key={i} dot={dot} index={i} reduce={reduce} />
        ))}
      </div>
      <div className="flex items-center justify-between text-xs">
        <span className="flex items-center gap-1.5">
          <span
            aria-hidden
            className="inline-block h-2 w-2 rounded-full bg-emerald-500"
          />
          <span className="text-muted-foreground">
            {t('ticker.tracking.available')}
          </span>
          <span className="font-semibold tabular-nums">{available}</span>
        </span>
        <span className="flex items-center gap-1.5">
          <span
            aria-hidden
            className="inline-block h-2 w-2 rounded-full bg-primary"
          />
          <span className="text-muted-foreground">
            {t('ticker.tracking.inRide')}
          </span>
          <span className="font-semibold tabular-nums">{inRide}</span>
        </span>
        <span className="text-muted-foreground">
          {t('ticker.tracking.live')}
        </span>
      </div>
    </div>
  )
}

function TrackingDot({
  dot,
  index,
  reduce,
}: {
  dot: MapDot
  index: number
  reduce: boolean
}) {
  const color = dot.status === 'available' ? 'bg-emerald-500' : 'bg-primary'
  const ringColor =
    dot.status === 'available' ? 'bg-emerald-500/60' : 'bg-primary/60'
  const delay = (index * 0.18) % 2
  return (
    <motion.span
      style={{ left: `${dot.x}%`, top: `${dot.y}%` }}
      animate={
        reduce
          ? undefined
          : {
              x: [0, dot.driftX, -dot.driftX * 0.6, 0],
              y: [0, dot.driftY, -dot.driftY * 0.6, 0],
            }
      }
      transition={
        reduce
          ? undefined
          : {
              duration: 9 + (index % 3),
              repeat: Infinity,
              ease: 'easeInOut',
              delay: delay * 0.5,
            }
      }
      className="absolute -translate-x-1/2 -translate-y-1/2"
    >
      {!reduce && (
        <motion.span
          animate={{ scale: [1, 2.4, 1], opacity: [0.55, 0, 0.55] }}
          transition={{
            duration: 2.4,
            repeat: Infinity,
            ease: 'easeOut',
            delay,
          }}
          className={cn('absolute inset-0 rounded-full', ringColor)}
        />
      )}
      <span
        className={cn(
          'relative inline-block h-2 w-2 rounded-full shadow-[0_0_6px_currentColor]',
          color,
        )}
      />
    </motion.span>
  )
}

function DriverAppBody({ reduce }: { reduce: boolean }) {
  const { t } = useTranslation()


  return (
    <Stagger>
      <div
        className="flex items-center justify-between"
      >
        <span className="flex items-center gap-2 text-sm">
          <span className="relative inline-flex h-2.5 w-2.5">
            {!reduce && (
              <span className="absolute inset-0 animate-ping rounded-full bg-emerald-500/70" />
            )}
            <span className="relative inline-block h-2.5 w-2.5 rounded-full bg-emerald-500" />
          </span>
          <span className="font-semibold tracking-tight">Lucas M.</span>
        </span>
        <span className="text-[11px] font-medium uppercase tracking-widest text-muted-foreground">
          {t('ticker.driverApp.dayShift')}
        </span>
      </div>
      <div
        className="flex items-baseline justify-between"
      >
        <span className="text-sm text-muted-foreground">
          {t('ticker.driverApp.rides')}
        </span>
        <span className="text-base font-semibold tabular-nums">23</span>
      </div>
      <div
        className="flex items-baseline justify-between"
      >
        <span className="text-sm text-muted-foreground">
          {t('ticker.driverApp.netToday')}
        </span>
        <span className="text-base font-semibold tabular-nums">312 €</span>
      </div>
      <div
        className="flex items-baseline justify-between"
      >
        <span className="flex items-center gap-1.5 text-sm text-muted-foreground">
          <ArrowUpRight className="h-3.5 w-3.5 text-emerald-500" />
          {t('ticker.driverApp.vsYesterday')}
        </span>
        <span className="text-base font-semibold tabular-nums text-emerald-500">
          +18%
        </span>
      </div>
    </Stagger>
  )
}
