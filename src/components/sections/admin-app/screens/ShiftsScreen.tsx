import { useState } from 'react'
import {
  ArrowDownRight,
  ArrowUpRight,
  Activity,
  Clock,
  FileText,
  Timer,
} from 'lucide-react'
import { useTranslation } from 'react-i18next'
import { Avatar } from '../parts/Avatar'
import { KpiCard } from '../parts/KpiCard'
import {
  COMPLETED_SHIFTS_TODAY,
  DRIVERS,
  SHIFT_HEATMAP,
} from '../mockData'
import type { CompletedShift } from '../types'
import { useTicker } from '../useTicker'
import { cn } from '@/lib/utils'
import { TripSheetPanel } from './TripSheetPanel'

function formatDuration(totalSeconds: number) {
  const h = Math.floor(totalSeconds / 3600)
  const m = Math.floor((totalSeconds % 3600) / 60)
  const s = totalSeconds % 60
  return `${h.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`
}

function formatDurationShort(minutes: number) {
  const h = Math.floor(minutes / 60)
  const m = minutes % 60
  return `${h}h${m.toString().padStart(2, '0')}`
}

export function ShiftsScreen() {
  const { t } = useTranslation()
  const tick = useTicker(1000)
  const [tripSheetShift, setTripSheetShift] = useState<CompletedShift | null>(
    null,
  )

  const activeShifts = DRIVERS.filter((d) => d.status === 'active').slice(0, 6)
  const totalActive = activeShifts.length
  const completed = COMPLETED_SHIFTS_TODAY

  const totalMinutesToday =
    activeShifts.reduce((acc, d) => acc + d.shiftDurationMinutes, 0) +
    completed.reduce((acc, s) => acc + s.durationMinutes, 0)
  const avgDuration = Math.round(
    completed.reduce((acc, s) => acc + s.durationMinutes, 0) / completed.length,
  )

  const heatmapMax = Math.max(...SHIFT_HEATMAP)

  return (
    <div className="grid h-full grid-rows-[auto_auto_1fr] gap-3 p-4">
      <div className="grid grid-cols-3 gap-2">
        <KpiCard
          label={t('admin.shifts.kpi.activeNow')}
          value={totalActive}
          trend={t('admin.shifts.kpi.liveTrend')}
          Icon={Activity}
          accent="emerald"
        />
        <KpiCard
          label={t('admin.shifts.kpi.hoursToday')}
          value={`${Math.round(totalMinutesToday / 60)} h`}
          trend={t('admin.shifts.kpi.hoursTrend', { count: completed.length })}
          Icon={Clock}
          accent="primary"
        />
        <KpiCard
          label={t('admin.shifts.kpi.avgDuration')}
          value={formatDurationShort(avgDuration)}
          trend={t('admin.shifts.kpi.avgTrend')}
          Icon={Timer}
          accent="amber"
        />
      </div>

      {/* Heatmap by hour */}
      <div className="rounded-md border border-border/40 bg-background/40 p-3">
        <div className="flex items-baseline justify-between">
          <p className="text-[10px] font-medium uppercase tracking-wider text-muted-foreground">
            {t('admin.shifts.heatmap.title')}
          </p>
          <p className="text-[9px] text-muted-foreground/70">
            {t('admin.shifts.heatmap.legend')}
          </p>
        </div>
        <div className="mt-2 flex items-end gap-[3px]">
          {SHIFT_HEATMAP.map((v, i) => {
            const intensity = v / heatmapMax
            return (
              <div key={i} className="flex flex-1 flex-col items-center gap-1">
                <div
                  className="w-full rounded-sm bg-primary"
                  style={{
                    height: `${4 + intensity * 28}px`,
                    opacity: 0.25 + intensity * 0.75,
                  }}
                  title={`${i.toString().padStart(2, '0')}h · ${v} shifts`}
                />
                {(i % 4 === 0 || i === 23) && (
                  <span className="text-[8px] text-muted-foreground/60">
                    {i.toString().padStart(2, '0')}h
                  </span>
                )}
              </div>
            )
          })}
        </div>
      </div>

      <div className="grid min-h-0 grid-cols-1 gap-3 lg:grid-cols-[1.1fr_1fr]">
        {/* Active shifts */}
        <section className="flex min-h-0 flex-col overflow-hidden rounded-md border border-border/40 bg-background/40">
          <header className="flex items-center justify-between gap-2 border-b border-border/40 px-3 py-2">
            <div className="flex items-center gap-1.5">
              <span className="relative flex h-2 w-2">
                <span className="absolute inset-0 animate-ping rounded-full bg-emerald-500/60" />
                <span className="relative h-2 w-2 rounded-full bg-emerald-500" />
              </span>
              <h3 className="text-[11px] font-semibold tracking-tight">
                {t('admin.shifts.active.title')}
              </h3>
            </div>
            <span className="rounded-full bg-emerald-500/15 px-1.5 py-0.5 text-[9px] font-bold tabular-nums text-emerald-300 ring-1 ring-emerald-500/30">
              {totalActive}
            </span>
          </header>

          <ul className="flex-1 divide-y divide-border/30 overflow-y-auto">
            {activeShifts.map((d) => {
              const seconds = d.shiftDurationMinutes * 60 + tick
              return (
                <li key={d.id} className="flex items-center gap-2.5 px-3 py-2">
                  <Avatar initials={d.initials} hue={d.avatarHue} size="md" />
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-[11px] font-semibold leading-tight">
                      {d.firstName} {d.lastName}
                    </p>
                    <p className="text-[9px] text-muted-foreground">
                      {t('admin.shifts.active.startedAt', { time: d.shiftStartedAt })}
                    </p>
                  </div>
                  <span className="font-mono text-[11px] font-bold tabular-nums text-amber-400">
                    {formatDuration(seconds)}
                  </span>
                </li>
              )
            })}
          </ul>
        </section>

        {/* Completed shifts today */}
        <section className="flex min-h-0 flex-col overflow-hidden rounded-md border border-border/40 bg-background/40">
          <header className="flex items-center justify-between gap-2 border-b border-border/40 px-3 py-2">
            <h3 className="text-[11px] font-semibold tracking-tight">
              {t('admin.shifts.completed.title')}
            </h3>
            <span className="rounded-full bg-zinc-500/15 px-1.5 py-0.5 text-[9px] font-bold tabular-nums text-zinc-300 ring-1 ring-zinc-500/30">
              {completed.length}
            </span>
          </header>

          <ul className="flex-1 divide-y divide-border/30 overflow-y-auto">
            {completed.map((s) => {
              const positive = s.vsAvgPercent >= 0
              return (
                <li key={s.id}>
                  <button
                    type="button"
                    onClick={() => setTripSheetShift(s)}
                    className="group w-full px-3 py-2 text-left transition-colors hover:bg-accent/30 focus-visible:bg-accent/30 focus-visible:outline-none"
                    aria-label={t('admin.shifts.completed.openTripSheet', {
                      driver: s.driverName,
                    })}
                  >
                    <div className="flex items-center gap-2.5">
                      <Avatar initials={s.driverInitials} hue={s.driverHue} size="md" />
                      <div className="min-w-0 flex-1">
                        <p className="truncate text-[11px] font-semibold leading-tight">
                          {s.driverName}
                        </p>
                        <p className="truncate text-[9px] text-muted-foreground">
                          <span className="font-mono">{s.vehiclePlate}</span> ·{' '}
                          {s.vehicleModel}
                        </p>
                      </div>
                      <span className="text-right font-mono text-[11px] font-bold tabular-nums text-emerald-300">
                        €{s.net}
                      </span>
                      <FileText
                        className="h-3 w-3 shrink-0 text-muted-foreground/40 transition-colors group-hover:text-primary"
                        aria-hidden
                      />
                    </div>

                    <div className="mt-1.5 flex items-center justify-between gap-2 text-[9px] text-muted-foreground">
                      <span className="font-mono">
                        {s.startedAt} → {s.endedAt}
                      </span>
                      <span className="font-mono">
                        {formatDurationShort(s.durationMinutes)}
                      </span>
                      <span className="font-mono">
                        {t('admin.shifts.completed.rides', { count: s.rides })}
                      </span>
                      <span
                        className={cn(
                          'inline-flex items-center gap-0.5 rounded-full px-1.5 py-0.5 font-mono font-semibold',
                          positive
                            ? 'bg-emerald-500/15 text-emerald-300'
                            : 'bg-rose-500/15 text-rose-300',
                        )}
                      >
                        {positive ? (
                          <ArrowUpRight className="h-2.5 w-2.5" />
                        ) : (
                          <ArrowDownRight className="h-2.5 w-2.5" />
                        )}
                        {positive ? '+' : ''}
                        {s.vsAvgPercent}%
                      </span>
                    </div>
                  </button>
                </li>
              )
            })}
          </ul>
        </section>
      </div>

      <TripSheetPanel
        shift={tripSheetShift}
        onClose={() => setTripSheetShift(null)}
      />
    </div>
  )
}
