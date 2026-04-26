import { useMemo, useState } from 'react'
import { motion } from 'framer-motion'
import {
  ArrowDownRight,
  ArrowUpRight,
  CarFront,
  Coins,
  FileSpreadsheet,
  FileText,
  TrendingUp,
  Wallet,
} from 'lucide-react'
import { useTranslation } from 'react-i18next'
import { cn } from '@/lib/utils'
import { useAdminApp } from '../useAdminApp'

type Period = 'day' | 'week' | 'month' | 'year'

interface PeriodData {
  labels: string[]
  current: number[]
  previous: number[]
  totalNet: number
  totalPrev: number
}

interface PlatformShare {
  key: 'uber' | 'bolt' | 'heetch' | 'cash'
  label: string
  amount: number
  color: string
}

interface PayoutEntry {
  platform: 'uber' | 'bolt' | 'heetch' | 'taxivert'
  label: string
  dateKey: string // ex "Jeudi 28/04"
  amount: number
  color: string
}

interface NameAmount {
  initials: string
  name: string
  net: number
}

const PALETTE = {
  uber: '#e5e7eb',
  bolt: '#34d399',
  heetch: '#f0abfc',
  taxivert: '#60a5fa',
  cash: '#fbbf24',
}

// ─────────────────────────────────────────────────────────
// Period datasets — totals scaled for a ~5-vehicle Brussels fleet.
// Day: 24 hourly buckets · Week: 7 days · Month: 30 days · Year: 12 months
// ─────────────────────────────────────────────────────────

const DAY_LABELS = Array.from({ length: 24 }, (_, h) =>
  h.toString().padStart(2, '0') + 'h',
)
const DAY_CURRENT = [
  90, 60, 40, 25, 20, 30, 110, 190, 140, 70, 50, 80, 110, 90, 80, 100, 140, 210,
  280, 340, 410, 460, 390, 190,
]
const DAY_PREVIOUS = DAY_CURRENT.map((v) => Math.round(v * 0.93))

const WEEK_LABELS = ['Lun', 'Mar', 'Mer', 'Jeu', 'Ven', 'Sam', 'Dim']
const WEEK_CURRENT = [2_180, 2_460, 2_010, 2_840, 4_120, 5_240, 3_410]
const WEEK_PREVIOUS = [1_980, 2_280, 1_910, 2_710, 3_840, 4_870, 3_180]

const MONTH_LABELS = Array.from({ length: 30 }, (_, d) => `${d + 1}`)
const MONTH_CURRENT = [
  2_180, 2_460, 2_010, 2_840, 4_120, 5_240, 3_410, 2_310, 2_540, 2_180, 2_910,
  4_080, 5_310, 3_290, 2_440, 2_690, 2_220, 3_010, 4_260, 5_490, 3_480, 2_420,
  2_710, 2_280, 2_960, 4_180, 5_420, 3_450, 2_610, 2_740,
]
const MONTH_PREVIOUS = MONTH_CURRENT.map((v) => Math.round(v * 0.91))

const MONTH_SHORT_LABELS = [
  'Jan',
  'Fév',
  'Mar',
  'Avr',
  'Mai',
  'Jui',
  'Jul',
  'Aoû',
  'Sep',
  'Oct',
  'Nov',
  'Déc',
]
const YEAR_CURRENT = [
  78_000, 72_500, 81_000, 88_000, 92_000, 96_500, 105_000, 102_000, 94_000,
  87_000, 90_000, 110_000,
]
const YEAR_PREVIOUS = YEAR_CURRENT.map((v) => Math.round(v * 0.88))

function sum(arr: number[]) {
  return arr.reduce((a, b) => a + b, 0)
}

function getPeriodData(period: Period): PeriodData {
  switch (period) {
    case 'day':
      return {
        labels: DAY_LABELS,
        current: DAY_CURRENT,
        previous: DAY_PREVIOUS,
        totalNet: sum(DAY_CURRENT),
        totalPrev: sum(DAY_PREVIOUS),
      }
    case 'week':
      return {
        labels: WEEK_LABELS,
        current: WEEK_CURRENT,
        previous: WEEK_PREVIOUS,
        totalNet: sum(WEEK_CURRENT),
        totalPrev: sum(WEEK_PREVIOUS),
      }
    case 'month':
      return {
        labels: MONTH_LABELS,
        current: MONTH_CURRENT,
        previous: MONTH_PREVIOUS,
        totalNet: sum(MONTH_CURRENT),
        totalPrev: sum(MONTH_PREVIOUS),
      }
    case 'year':
      return {
        labels: MONTH_SHORT_LABELS,
        current: YEAR_CURRENT,
        previous: YEAR_PREVIOUS,
        totalNet: sum(YEAR_CURRENT),
        totalPrev: sum(YEAR_PREVIOUS),
      }
  }
}

function platformShares(totalNet: number): PlatformShare[] {
  // Approximate net distribution typical for a Brussels mixed-fleet:
  // Uber 45%, Bolt 25%, Heetch 18%, Cash 12% (already net of platform fees).
  return [
    { key: 'uber', label: 'Uber', amount: totalNet * 0.45, color: PALETTE.uber },
    { key: 'bolt', label: 'Bolt', amount: totalNet * 0.25, color: PALETTE.bolt },
    { key: 'heetch', label: 'Heetch', amount: totalNet * 0.18, color: PALETTE.heetch },
    { key: 'cash', label: 'Cash', amount: totalNet * 0.12, color: PALETTE.cash },
  ]
}

const TOP_DRIVERS_BY_PERIOD: Record<Period, NameAmount[]> = {
  day: [
    { initials: 'AH', name: 'Ahmed Haddad', net: 412 },
    { initials: 'YS', name: 'Youssef Sbai', net: 388 },
    { initials: 'FT', name: 'Fatima Talbi', net: 354 },
  ],
  week: [
    { initials: 'AH', name: 'Ahmed Haddad', net: 2_780 },
    { initials: 'FT', name: 'Fatima Talbi', net: 2_540 },
    { initials: 'YS', name: 'Youssef Sbai', net: 2_310 },
  ],
  month: [
    { initials: 'AH', name: 'Ahmed Haddad', net: 11_840 },
    { initials: 'FT', name: 'Fatima Talbi', net: 10_620 },
    { initials: 'KH', name: 'Khadija Halimi', net: 9_780 },
  ],
  year: [
    { initials: 'AH', name: 'Ahmed Haddad', net: 138_400 },
    { initials: 'FT', name: 'Fatima Talbi', net: 124_900 },
    { initials: 'YS', name: 'Youssef Sbai', net: 117_300 },
  ],
}

const TOP_VEHICLES_BY_PERIOD: Record<Period, NameAmount[]> = {
  day: [
    { initials: 'XJJ', name: 'T-XJJ-888 · Ford Puma', net: 480 },
    { initials: 'XGK', name: 'T-XGK-939 · Toyota Prius', net: 410 },
    { initials: 'XEJ', name: 'T-XEJ-999 · BMW Série 3', net: 372 },
  ],
  week: [
    { initials: 'XJJ', name: 'T-XJJ-888 · Ford Puma', net: 3_280 },
    { initials: 'XGK', name: 'T-XGK-939 · Toyota Prius', net: 2_920 },
    { initials: 'XEJ', name: 'T-XEJ-999 · BMW Série 3', net: 2_610 },
  ],
  month: [
    { initials: 'XJJ', name: 'T-XJJ-888 · Ford Puma', net: 13_950 },
    { initials: 'XGK', name: 'T-XGK-939 · Toyota Prius', net: 12_410 },
    { initials: 'XEJ', name: 'T-XEJ-999 · BMW Série 3', net: 11_080 },
  ],
  year: [
    { initials: 'XJJ', name: 'T-XJJ-888 · Ford Puma', net: 162_500 },
    { initials: 'XGK', name: 'T-XGK-939 · Toyota Prius', net: 144_800 },
    { initials: 'XEJ', name: 'T-XEJ-999 · BMW Série 3', net: 129_400 },
  ],
}

const PAYOUTS: PayoutEntry[] = [
  {
    platform: 'bolt',
    label: 'Bolt',
    dateKey: 'Lundi 28/04',
    amount: 1_840,
    color: PALETTE.bolt,
  },
  {
    platform: 'uber',
    label: 'Uber',
    dateKey: 'Jeudi 01/05',
    amount: 4_220,
    color: PALETTE.uber,
  },
  {
    platform: 'heetch',
    label: 'Heetch',
    dateKey: 'Vendredi 02/05',
    amount: 980,
    color: PALETTE.heetch,
  },
  {
    platform: 'taxivert',
    label: 'TaxiVert',
    dateKey: 'Lundi 05/05',
    amount: 1_360,
    color: PALETTE.taxivert,
  },
]

function fmtEUR(n: number): string {
  return `€${Math.round(n).toLocaleString('fr-BE')}`
}

export function RevenueScreen() {
  const { t } = useTranslation()
  const { showDemoToast } = useAdminApp()
  const [period, setPeriod] = useState<Period>('week')
  const data = useMemo(() => getPeriodData(period), [period])
  const platforms = useMemo(
    () => platformShares(data.totalNet),
    [data.totalNet],
  )
  const deltaPct = data.totalPrev
    ? Math.round(((data.totalNet - data.totalPrev) / data.totalPrev) * 100)
    : 0
  const deltaUp = deltaPct >= 0

  const bestIdx =
    data.current.indexOf(Math.max(...data.current)) >= 0
      ? data.current.indexOf(Math.max(...data.current))
      : 0
  const bestLabel = data.labels[bestIdx]
  const bestValue = data.current[bestIdx]

  return (
    <div className="flex h-full flex-col gap-3 p-4">
      <header className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h2 className="flex items-center gap-2 text-sm font-bold tracking-tight">
            <Coins className="h-4 w-4 text-primary" />
            {t('admin.revenue.title')}
          </h2>
          <p className="mt-0.5 text-[11px] text-muted-foreground">
            {t('admin.revenue.subtitle')}
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <PeriodSwitcher value={period} onChange={setPeriod} />
          <ExportButtons
            onExport={(fmt) =>
              showDemoToast(
                t('admin.revenue.export.toast', {
                  format: fmt,
                  period: t(`admin.revenue.periods.${period}`),
                }),
              )
            }
          />
        </div>
      </header>

      <section className="grid grid-cols-1 gap-2 sm:grid-cols-[1fr_auto]">
        <div className="rounded-md border border-border/40 bg-background/40 p-3">
          <div className="flex flex-wrap items-baseline justify-between gap-2">
            <div>
              <p className="text-[10px] font-medium uppercase tracking-wider text-muted-foreground">
                {t('admin.revenue.netReal', { period: t(`admin.revenue.periods.${period}`) })}
              </p>
              <p className="mt-0.5 text-2xl font-extrabold tabular-nums">
                {fmtEUR(data.totalNet)}
              </p>
            </div>
            <div
              className={cn(
                'inline-flex items-center gap-1 rounded-full px-2 py-1 text-[10px] font-bold',
                deltaUp
                  ? 'bg-emerald-500/15 text-emerald-300 ring-1 ring-emerald-500/30'
                  : 'bg-rose-500/15 text-rose-300 ring-1 ring-rose-500/30',
              )}
            >
              {deltaUp ? (
                <ArrowUpRight className="h-3 w-3" />
              ) : (
                <ArrowDownRight className="h-3 w-3" />
              )}
              {deltaUp ? '+' : ''}
              {deltaPct}% {t('admin.revenue.vsPrev')}
            </div>
          </div>
          <div className="mt-3">
            <RevenueLineChart
              labels={data.labels}
              current={data.current}
              previous={data.previous}
              bestIndex={bestIdx}
            />
          </div>
        </div>

        <div className="grid grid-cols-2 gap-2 sm:w-[180px] sm:grid-cols-1">
          <PeakCard
            label={t('admin.revenue.peakLabel')}
            value={bestLabel}
            sub={fmtEUR(bestValue)}
            tone="primary"
          />
          <PeakCard
            label={t('admin.revenue.bestPlatformLabel')}
            value={'Uber'}
            sub={t('admin.revenue.platformShare', { percent: 45 })}
            tone="zinc"
          />
        </div>
      </section>

      <section>
        <div className="rounded-md border border-border/40 bg-background/40 p-3">
          <h3 className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
            {t('admin.revenue.platformMix')}
          </h3>
          <div className="mt-2 flex items-center gap-4">
            <Donut
              segments={platforms.map((p) => ({
                value: p.amount,
                color: p.color,
              }))}
              size={88}
            />
            <ul className="min-w-0 flex-1 space-y-1 text-[11px]">
              {platforms.map((p) => {
                const pct = Math.round((p.amount / data.totalNet) * 100)
                return (
                  <li key={p.key} className="flex items-center gap-2">
                    <span
                      className="h-2 w-2 rounded-full"
                      style={{ background: p.color }}
                    />
                    <span className="font-medium">{p.label}</span>
                    <span className="font-mono tabular-nums text-muted-foreground">
                      {fmtEUR(p.amount)}
                    </span>
                    <span className="ml-auto font-mono tabular-nums text-muted-foreground">
                      {pct}%
                    </span>
                  </li>
                )
              })}
            </ul>
          </div>
        </div>
      </section>

      <section className="grid grid-cols-1 gap-2 lg:grid-cols-3">
        <TopList
          title={t('admin.revenue.topDrivers')}
          Icon={TrendingUp}
          items={TOP_DRIVERS_BY_PERIOD[period]}
        />
        <TopList
          title={t('admin.revenue.topVehicles')}
          Icon={CarFront}
          items={TOP_VEHICLES_BY_PERIOD[period]}
        />
        <div className="rounded-md border border-border/40 bg-background/40 p-3">
          <h3 className="flex items-center gap-1.5 text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
            <Wallet className="h-3 w-3 text-primary" />
            {t('admin.revenue.cashflow')}
          </h3>
          <ul className="mt-2 space-y-1.5">
            {PAYOUTS.map((p) => (
              <li
                key={p.platform}
                className="flex items-center gap-2 rounded-md border border-border/30 bg-card/40 px-2 py-1.5"
              >
                <span
                  className="h-2 w-2 shrink-0 rounded-full"
                  style={{ background: p.color }}
                />
                <div className="min-w-0 flex-1">
                  <p className="text-[11px] font-semibold leading-tight">
                    {p.label}
                  </p>
                  <p className="text-[9px] tabular-nums text-muted-foreground">
                    {p.dateKey}
                  </p>
                </div>
                <span className="text-[11px] font-bold tabular-nums text-emerald-300">
                  +{fmtEUR(p.amount)}
                </span>
              </li>
            ))}
          </ul>
          <p className="mt-2 text-right text-[10px] font-bold tabular-nums">
            {t('admin.revenue.cashflowTotal')}{' '}
            <span className="text-emerald-300">
              +{fmtEUR(PAYOUTS.reduce((a, p) => a + p.amount, 0))}
            </span>
          </p>
        </div>
      </section>

      <section className="grid grid-cols-1 gap-2 sm:grid-cols-2">
        <BestDayBars />
        <BestHourBars current={DAY_CURRENT} />
      </section>
    </div>
  )
}

// ─────────────────────────────────────────────────────────
// Export buttons (PDF / CSV)
// ─────────────────────────────────────────────────────────
function ExportButtons({
  onExport,
}: {
  onExport: (format: 'PDF' | 'CSV') => void
}) {
  const { t } = useTranslation()
  return (
    <div className="inline-flex items-center gap-1 rounded-md border border-border/40 bg-background/40 p-0.5">
      <span className="hidden px-1.5 text-[9px] font-semibold uppercase tracking-wider text-muted-foreground sm:inline">
        {t('admin.revenue.export.label')}
      </span>
      <button
        type="button"
        onClick={() => onExport('PDF')}
        className="inline-flex items-center gap-1 rounded-[5px] px-2 py-1 text-[10px] font-semibold uppercase tracking-wider text-muted-foreground transition-colors hover:bg-rose-500/15 hover:text-rose-300"
      >
        <FileText className="h-3 w-3" />
        PDF
      </button>
      <button
        type="button"
        onClick={() => onExport('CSV')}
        className="inline-flex items-center gap-1 rounded-[5px] px-2 py-1 text-[10px] font-semibold uppercase tracking-wider text-muted-foreground transition-colors hover:bg-emerald-500/15 hover:text-emerald-300"
      >
        <FileSpreadsheet className="h-3 w-3" />
        CSV
      </button>
    </div>
  )
}

// ─────────────────────────────────────────────────────────
// Period switcher
// ─────────────────────────────────────────────────────────
function PeriodSwitcher({
  value,
  onChange,
}: {
  value: Period
  onChange: (p: Period) => void
}) {
  const { t } = useTranslation()
  const items: Period[] = ['day', 'week', 'month', 'year']
  return (
    <div className="inline-flex rounded-md border border-border/40 bg-background/40 p-0.5">
      {items.map((p) => (
        <button
          key={p}
          type="button"
          onClick={() => onChange(p)}
          className={cn(
            'rounded-[5px] px-2.5 py-1 text-[10px] font-semibold uppercase tracking-wider transition-colors',
            value === p
              ? 'bg-primary text-primary-foreground shadow-glow'
              : 'text-muted-foreground hover:text-foreground',
          )}
        >
          {t(`admin.revenue.periods.${p}`)}
        </button>
      ))}
    </div>
  )
}

// ─────────────────────────────────────────────────────────
// Main line chart (SVG)
// ─────────────────────────────────────────────────────────
function RevenueLineChart({
  labels,
  current,
  previous,
  bestIndex,
}: {
  labels: string[]
  current: number[]
  previous: number[]
  bestIndex: number
}) {
  const W = 600
  const H = 140
  const PAD_X = 24
  const PAD_Y = 16
  const innerW = W - PAD_X * 2
  const innerH = H - PAD_Y * 2

  const max = Math.max(...current, ...previous) * 1.05
  const stepX = current.length > 1 ? innerW / (current.length - 1) : 0
  const xAt = (i: number) => PAD_X + i * stepX
  const yAt = (v: number) => PAD_Y + innerH - (v / max) * innerH

  const buildPath = (values: number[]) =>
    values
      .map((v, i) => `${i === 0 ? 'M' : 'L'}${xAt(i).toFixed(1)} ${yAt(v).toFixed(1)}`)
      .join(' ')
  const buildArea = (values: number[]) =>
    `${buildPath(values)} L ${xAt(values.length - 1).toFixed(1)} ${(PAD_Y + innerH).toFixed(1)} L ${PAD_X} ${(PAD_Y + innerH).toFixed(1)} Z`

  const tickIndices = (() => {
    if (labels.length <= 7) return labels.map((_, i) => i)
    if (labels.length <= 12) return labels.map((_, i) => i)
    if (labels.length <= 24) return [0, 4, 8, 12, 16, 20, 23]
    if (labels.length <= 30) return [0, 4, 9, 14, 19, 24, 29]
    return labels.map((_, i) => i)
  })()

  const peakX = xAt(bestIndex)
  const peakY = yAt(current[bestIndex])

  return (
    <div className="relative w-full">
      <svg viewBox={`0 0 ${W} ${H}`} className="h-[140px] w-full">
        <defs>
          <linearGradient id="rev-area" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="hsl(217 91% 60%)" stopOpacity="0.4" />
            <stop offset="100%" stopColor="hsl(217 91% 60%)" stopOpacity="0" />
          </linearGradient>
        </defs>

        {/* horizontal grid lines */}
        {[0.25, 0.5, 0.75].map((g) => (
          <line
            key={g}
            x1={PAD_X}
            y1={PAD_Y + innerH * g}
            x2={W - PAD_X}
            y2={PAD_Y + innerH * g}
            stroke="hsl(var(--border) / 0.4)"
            strokeDasharray="2 4"
            strokeWidth={0.5}
          />
        ))}

        {/* previous period line */}
        <motion.path
          d={buildPath(previous)}
          fill="none"
          stroke="hsl(var(--muted-foreground))"
          strokeOpacity={0.4}
          strokeWidth={1.2}
          strokeDasharray="3 3"
          initial={{ pathLength: 0 }}
          animate={{ pathLength: 1 }}
          transition={{ duration: 0.7, ease: 'easeOut' }}
        />

        {/* area */}
        <motion.path
          d={buildArea(current)}
          fill="url(#rev-area)"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.6, delay: 0.2 }}
        />
        {/* current line */}
        <motion.path
          d={buildPath(current)}
          fill="none"
          stroke="hsl(217 91% 60%)"
          strokeWidth={2}
          strokeLinecap="round"
          strokeLinejoin="round"
          initial={{ pathLength: 0 }}
          animate={{ pathLength: 1 }}
          transition={{ duration: 0.9, ease: 'easeOut' }}
        />

        {/* peak dot */}
        <circle
          cx={peakX}
          cy={peakY}
          r={4}
          fill="hsl(217 91% 60%)"
          stroke="hsl(0 0% 0% / 0.6)"
          strokeWidth={2}
        />

        {/* x-axis labels */}
        {tickIndices.map((i) => (
          <text
            key={i}
            x={xAt(i)}
            y={H - 2}
            textAnchor="middle"
            fontSize="9"
            fill="hsl(var(--muted-foreground))"
          >
            {labels[i]}
          </text>
        ))}
      </svg>
    </div>
  )
}

// ─────────────────────────────────────────────────────────
// Donut chart (platform mix)
// ─────────────────────────────────────────────────────────
function Donut({
  segments,
  size = 80,
}: {
  segments: { value: number; color: string }[]
  size?: number
}) {
  const total = segments.reduce((a, s) => a + s.value, 0) || 1
  const r = size / 2 - 6
  const circumference = 2 * Math.PI * r
  let offset = 0
  return (
    <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
      <circle
        cx={size / 2}
        cy={size / 2}
        r={r}
        fill="none"
        stroke="hsl(var(--border) / 0.4)"
        strokeWidth={6}
      />
      {segments.map((s, i) => {
        const len = (s.value / total) * circumference
        const dasharray = `${len} ${circumference - len}`
        const segOffset = offset
        offset += len
        return (
          <motion.circle
            key={i}
            cx={size / 2}
            cy={size / 2}
            r={r}
            fill="none"
            stroke={s.color}
            strokeWidth={6}
            strokeDasharray={dasharray}
            strokeDashoffset={-segOffset}
            transform={`rotate(-90 ${size / 2} ${size / 2})`}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5, delay: 0.05 * i }}
            strokeLinecap="butt"
          />
        )
      })}
    </svg>
  )
}

// ─────────────────────────────────────────────────────────
// Top list (drivers / vehicles)
// ─────────────────────────────────────────────────────────
function TopList({
  title,
  Icon,
  items,
}: {
  title: string
  Icon: typeof TrendingUp
  items: NameAmount[]
}) {
  return (
    <div className="rounded-md border border-border/40 bg-background/40 p-3">
      <h3 className="flex items-center gap-1.5 text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
        <Icon className="h-3 w-3 text-primary" />
        {title}
      </h3>
      <ol className="mt-2 space-y-1.5">
        {items.map((it, idx) => (
          <li
            key={it.initials}
            className="flex items-center gap-2 rounded-md border border-border/30 bg-card/40 px-2 py-1.5"
          >
            <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-primary/15 text-[9px] font-bold text-primary">
              {idx + 1}
            </span>
            <span className="min-w-0 flex-1 truncate text-[11px] font-semibold">
              {it.name}
            </span>
            <span className="text-[11px] font-bold tabular-nums text-emerald-300">
              {fmtEUR(it.net)}
            </span>
          </li>
        ))}
      </ol>
    </div>
  )
}

// ─────────────────────────────────────────────────────────
// Best day bars + Best hour bars
// ─────────────────────────────────────────────────────────
function BestDayBars() {
  const { t } = useTranslation()
  const labels = WEEK_LABELS
  const values = WEEK_CURRENT
  const max = Math.max(...values)
  const peak = values.indexOf(max)
  return (
    <div className="rounded-md border border-border/40 bg-background/40 p-3">
      <h3 className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
        {t('admin.revenue.bestDay')}
      </h3>
      <div className="mt-2 flex items-end gap-1.5">
        {labels.map((l, i) => {
          const h = (values[i] / max) * 56
          const isPeak = i === peak
          return (
            <div
              key={i}
              className="flex flex-1 flex-col items-center gap-1"
              title={fmtEUR(values[i])}
            >
              <motion.div
                className={cn(
                  'w-full rounded-sm',
                  isPeak ? 'bg-primary' : 'bg-zinc-700/70',
                )}
                style={{ height: 0 }}
                animate={{ height: h }}
                transition={{ duration: 0.5, delay: i * 0.04 }}
              />
              <span
                className={cn(
                  'text-[9px]',
                  isPeak ? 'font-bold text-primary' : 'text-muted-foreground',
                )}
              >
                {l}
              </span>
            </div>
          )
        })}
      </div>
      <p className="mt-2 text-[10px] text-muted-foreground">
        {t('admin.revenue.bestDayHint', { day: labels[peak] })}
      </p>
    </div>
  )
}

function BestHourBars({ current }: { current: number[] }) {
  const { t } = useTranslation()
  const max = Math.max(...current)
  const peak = current.indexOf(max)
  return (
    <div className="rounded-md border border-border/40 bg-background/40 p-3">
      <h3 className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
        {t('admin.revenue.bestHour')}
      </h3>
      <div className="mt-2 flex items-end gap-[2px]">
        {current.map((v, i) => {
          const h = (v / max) * 48
          const isPeak = i === peak
          return (
            <div
              key={i}
              className={cn(
                'flex-1 rounded-[1px]',
                isPeak ? 'bg-primary' : 'bg-zinc-700/70',
              )}
              style={{ height: h }}
              title={`${i.toString().padStart(2, '0')}h · ${fmtEUR(v)}`}
            />
          )
        })}
      </div>
      <div className="mt-1 flex justify-between text-[9px] text-muted-foreground">
        <span>00h</span>
        <span>06h</span>
        <span>12h</span>
        <span>18h</span>
        <span>23h</span>
      </div>
      <p className="mt-1 text-[10px] text-muted-foreground">
        {t('admin.revenue.bestHourHint', {
          hour: peak.toString().padStart(2, '0'),
        })}
      </p>
    </div>
  )
}

// ─────────────────────────────────────────────────────────
// Peak summary card
// ─────────────────────────────────────────────────────────
function PeakCard({
  label,
  value,
  sub,
  tone,
}: {
  label: string
  value: string
  sub: string
  tone: 'primary' | 'zinc'
}) {
  return (
    <div
      className={cn(
        'rounded-md border bg-background/40 p-3',
        tone === 'primary' ? 'border-primary/30' : 'border-border/40',
      )}
    >
      <p className="text-[10px] font-medium uppercase tracking-wider text-muted-foreground">
        {label}
      </p>
      <p
        className={cn(
          'mt-0.5 text-base font-extrabold tracking-tight',
          tone === 'primary' && 'text-primary',
        )}
      >
        {value}
      </p>
      <p className="text-[10px] tabular-nums text-muted-foreground">{sub}</p>
    </div>
  )
}
