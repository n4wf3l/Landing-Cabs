import { ArrowUpRight, CalendarClock, Play } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import { DRIVER, HISTORY } from '../mockData'
import { usePhoneSim } from '../usePhoneSim'
import { Money, ScreenScroll } from '../ui'

export function HomeScreen() {
  const { t } = useTranslation()
  const { dispatch } = usePhoneSim()
  const yesterday = HISTORY[HISTORY.length - 1]

  return (
    <ScreenScroll>
      <header className="flex items-center justify-between pt-1">
        <div>
          <p className="text-[11px] text-zinc-400 phone-light:text-zinc-600">
            {t('driverApp.sim.home.greeting', { name: 'Ahmed' })}
          </p>
          <p className="mt-0.5 text-xs text-zinc-500">
            {t('driverApp.sim.home.statusOff')}
          </p>
        </div>
        <button
          type="button"
          onClick={() => dispatch({ type: 'NAV', screen: 'profile' })}
          aria-label={t('driverApp.sim.profile.title')}
          className="flex h-9 w-9 items-center justify-center rounded-full bg-white/[0.06] text-xs font-semibold text-zinc-200 transition-all hover:bg-primary/20 hover:text-primary hover:ring-2 hover:ring-primary/40 active:scale-95 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary phone-light:bg-zinc-900/[0.06] phone-light:text-zinc-800 phone-light:hover:bg-primary/15 phone-light:hover:text-primary"
        >
          {DRIVER.initials}
        </button>
      </header>

      <div className="rounded-2xl bg-gradient-to-br from-primary/20 via-primary/10 to-transparent p-4 ring-1 ring-primary/20">
        <p className="text-[11px] font-medium uppercase tracking-wider text-primary/90">
          {t('driverApp.sim.home.startCardTitle')}
        </p>
        <p className="mt-1 text-[13px] leading-snug text-zinc-200 phone-light:text-zinc-800">
          {t('driverApp.sim.home.startCardSubtitle', {
            vehicle: DRIVER.vehicle,
          })}
        </p>
        <button
          type="button"
          onClick={() =>
            dispatch({ type: 'NAV', screen: 'shift-start-capture' })
          }
          className="mt-4 flex w-full items-center justify-center gap-2 rounded-xl bg-primary py-3 text-sm font-semibold text-primary-foreground shadow-glow transition-transform hover:-translate-y-0.5 active:scale-[0.98]"
        >
          <Play className="h-4 w-4 fill-current" />
          {t('driverApp.sim.home.startCta')}
        </button>
      </div>

      <div className="rounded-xl bg-white/[0.04] p-3 phone-light:bg-zinc-900/[0.04]">
        <div className="flex items-center justify-between">
          <span className="text-[11px] uppercase tracking-wider text-zinc-500">
            {t('driverApp.sim.home.lastShift')}
          </span>
          <span className="flex items-center gap-1 text-[10px] font-medium text-emerald-400 phone-light:text-emerald-700">
            <ArrowUpRight className="h-3 w-3" />
            +6%
          </span>
        </div>
        <p className="mt-1.5 text-2xl font-extrabold tracking-tight phone-light:text-zinc-900">
          <Money value={yesterday.net} />
        </p>
        <p className="mt-1 text-[11px] text-zinc-500">
          {t('driverApp.sim.home.lastShiftMeta', {
            date: yesterday.dateLabel,
            rides: yesterday.rides,
          })}
        </p>
      </div>

      <div className="rounded-xl border border-white/[0.06] bg-white/[0.02] p-3 phone-light:border-zinc-900/[0.08] phone-light:bg-zinc-900/[0.03]">
        <div className="flex items-center gap-2">
          <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-primary/15 text-primary">
            <CalendarClock className="h-3.5 w-3.5" />
          </span>
          <div className="flex-1">
            <p className="text-[11px] uppercase tracking-wider text-zinc-500">
              {t('driverApp.sim.home.nextShift')}
            </p>
            <p className="text-sm font-semibold tabular-nums phone-light:text-zinc-900">
              {t('driverApp.sim.home.nextShiftValue')}
            </p>
          </div>
        </div>
      </div>
    </ScreenScroll>
  )
}
