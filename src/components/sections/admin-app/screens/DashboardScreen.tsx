import { CarFront, TrendingUp, Users } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import { KpiCard } from '../parts/KpiCard'
import { Sparkline } from '../parts/Sparkline'
import { DRIVERS, KPI, SHIFT_HOURS } from '../mockData'
import { useTicker } from '../useTicker'

function formatDuration(totalSeconds: number) {
  const h = Math.floor(totalSeconds / 3600)
  const m = Math.floor((totalSeconds % 3600) / 60)
  const s = totalSeconds % 60
  return `${h.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`
}

export function DashboardScreen() {
  const { t } = useTranslation()
  const tick = useTicker(1000)
  const activeDrivers = DRIVERS.filter((d) => d.status === 'active').slice(0, 9)

  return (
    <div className="grid h-full grid-rows-[auto_1fr] gap-3 p-4">
      <div className="grid grid-cols-3 gap-2">
        <KpiCard
          label={t('admin.kpi.activeDrivers')}
          value={KPI.driversActive}
          trend={t('admin.trends.thisWeek')}
          Icon={Users}
          accent="primary"
        />
        <KpiCard
          label={t('admin.kpi.vehiclesOnRoad')}
          value={KPI.vehiclesOnRoad}
          trend={t('admin.trends.fleetShare', { percent: KPI.vehiclesPercent })}
          Icon={CarFront}
          accent="emerald"
        />
        <KpiCard
          label={t('admin.kpi.revenue')}
          value={`€${KPI.revenueToday.toLocaleString('fr-BE')}`}
          trend={t('admin.trends.monthGain')}
          Icon={TrendingUp}
          accent="amber"
        />
      </div>

      <div className="grid min-h-0 grid-cols-3 gap-2">
        <div className="col-span-2 grid grid-cols-3 gap-1.5 overflow-hidden">
          {activeDrivers.map((d) => {
            const seconds = d.shiftDurationMinutes * 60 + tick
            return (
              <div
                key={d.id}
                className="flex flex-col rounded-md border border-border/40 bg-background/40 p-2"
              >
                <div className="flex items-center justify-between gap-2">
                  <p className="truncate text-[11px] font-semibold">
                    {d.firstName}
                  </p>
                  <span className="text-[11px] font-bold tabular-nums text-amber-400">
                    {formatDuration(seconds)}
                  </span>
                </div>
                <p className="mt-0.5 text-[9px] text-muted-foreground">
                  {t('admin.dashboard.shiftStart', { time: d.shiftStartedAt })}
                </p>
              </div>
            )
          })}
        </div>

        <div className="flex flex-col rounded-md border border-border/40 bg-background/40 p-3">
          <p className="text-[10px] font-medium uppercase tracking-wider text-muted-foreground">
            {t('admin.dashboard.shiftsToday')}
          </p>
          <p className="mt-1 text-lg font-bold tabular-nums">
            {t('admin.dashboard.hoursTotal', {
              count: SHIFT_HOURS.reduce((a, b) => a + b, 0),
            })}
          </p>
          <div className="mt-2 flex-1 overflow-hidden">
            <Sparkline
              values={SHIFT_HOURS}
              stroke="hsl(45 95% 60%)"
              fill="hsl(45 95% 60% / 0.15)"
            />
          </div>
          <div className="mt-1 flex justify-between text-[9px] text-muted-foreground">
            <span>00h</span>
            <span>12h</span>
            <span>23h</span>
          </div>
        </div>
      </div>
    </div>
  )
}
