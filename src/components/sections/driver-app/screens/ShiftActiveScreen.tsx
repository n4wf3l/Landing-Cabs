import { Play, PowerOff } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import { usePhoneSim } from '../usePhoneSim'
import { useShiftClock } from '../useShiftClock'
import { Money, PlatformBadge, ScreenScroll } from '../ui'

export function ShiftActiveScreen() {
  const { t } = useTranslation()
  const { state, dispatch } = usePhoneSim()
  const elapsed = useShiftClock(state.shiftStartedAt)

  const totals = state.todayRides.reduce(
    (acc, r) => ({
      brut: acc.brut + r.brut,
      net: acc.net + r.net,
    }),
    { brut: 0, net: 0 },
  )

  return (
    <ScreenScroll>
      <header className="flex items-center justify-between pt-1">
        <div className="flex items-center gap-2">
          <span className="relative flex h-2.5 w-2.5">
            <span className="absolute inset-0 animate-ping rounded-full bg-emerald-500/70" />
            <span className="relative h-2.5 w-2.5 rounded-full bg-emerald-500" />
          </span>
          <div>
            <p className="text-xs font-semibold phone-light:text-zinc-900">
              {t('driverApp.sim.shift.title')}
            </p>
            <p className="text-[10px] text-zinc-500 tabular-nums">
              {t('driverApp.sim.shift.runningFor', { time: elapsed })}
            </p>
          </div>
        </div>
        <button
          type="button"
          onClick={() =>
            dispatch({ type: 'NAV', screen: 'shift-end-capture' })
          }
          className="inline-flex items-center gap-1 rounded-full border border-rose-500/30 bg-rose-500/10 px-2.5 py-1 text-[10px] font-semibold text-rose-300 transition-colors hover:bg-rose-500/15 phone-light:border-rose-500/40 phone-light:bg-rose-500/15 phone-light:text-rose-700"
        >
          <PowerOff className="h-3 w-3" />
          {t('driverApp.sim.shift.endShift')}
        </button>
      </header>

      <div className="grid grid-cols-3 gap-2 rounded-2xl bg-white/[0.04] p-3 phone-light:bg-zinc-900/[0.04]">
        <Stat
          label={t('driverApp.sim.shift.ridesToday')}
          value={state.todayRides.length.toString()}
        />
        <Stat
          label={t('driverApp.sim.shift.brutToday')}
          money={totals.brut}
          tone="muted"
        />
        <Stat
          label={t('driverApp.sim.shift.netToday')}
          money={totals.net}
          tone="primary"
        />
      </div>

      <button
        type="button"
        onClick={() => dispatch({ type: 'START_RIDE' })}
        className="flex w-full items-center justify-center gap-2 rounded-xl bg-primary py-3 text-sm font-semibold text-primary-foreground shadow-glow transition-transform hover:-translate-y-0.5 active:scale-[0.98]"
      >
        <Play className="h-4 w-4 fill-current" />
        {t('driverApp.sim.shift.startRide')}
      </button>

      <section className="space-y-2">
        <p className="text-[11px] font-semibold uppercase tracking-wider text-zinc-500">
          {t('driverApp.sim.shift.ridesTitle')}
        </p>
        {state.todayRides.length === 0 ? (
          <p className="rounded-xl border border-dashed border-white/[0.08] bg-white/[0.02] px-3 py-4 text-center text-[11px] text-zinc-500 phone-light:border-zinc-900/[0.1] phone-light:bg-zinc-900/[0.03]">
            {t('driverApp.sim.shift.noRidesYet')}
          </p>
        ) : (
          <ul className="space-y-1.5">
            {state.todayRides.map((ride) => (
              <li
                key={ride.id}
                className="rounded-xl border border-white/[0.06] bg-white/[0.02] px-3 py-2 phone-light:border-zinc-900/[0.08] phone-light:bg-zinc-900/[0.03]"
              >
                <div className="flex items-center justify-between gap-2">
                  <PlatformBadge
                    platform={ride.platform}
                    label={t(`driverApp.sim.platforms.${ride.platform}`)}
                  />
                  <span className="text-sm font-bold text-emerald-300 tabular-nums phone-light:text-emerald-700">
                    +<Money value={ride.net} />
                  </span>
                </div>
                <p className="mt-1 truncate text-[11px] text-zinc-400 phone-light:text-zinc-600">
                  {ride.pickup} → {ride.destination}
                </p>
              </li>
            ))}
          </ul>
        )}
      </section>
    </ScreenScroll>
  )
}

function Stat({
  label,
  value,
  money,
  tone,
}: {
  label: string
  value?: string
  money?: number
  tone?: 'primary' | 'muted'
}) {
  return (
    <div>
      <p className="text-[10px] uppercase tracking-wider text-zinc-500">
        {label}
      </p>
      <p
        className={
          'mt-0.5 text-sm font-bold tabular-nums ' +
          (tone === 'primary'
            ? 'text-primary'
            : tone === 'muted'
              ? 'text-zinc-300 phone-light:text-zinc-700'
              : 'text-white phone-light:text-zinc-900')
        }
      >
        {value ?? <Money value={money ?? 0} />}
      </p>
    </div>
  )
}
