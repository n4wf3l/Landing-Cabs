import { motion } from 'framer-motion'
import {
  Home,
  CalendarDays,
  History as HistoryIcon,
  User,
  type LucideIcon,
} from 'lucide-react'
import { useTranslation } from 'react-i18next'
import { cn } from '@/lib/utils'
import { usePhoneSim } from './usePhoneSim'
import type { PhoneSimAction } from './types'

type NavScreen = Extract<
  PhoneSimAction,
  { type: 'NAV' }
>['screen']

interface NavItem {
  screen: NavScreen
  labelKey: string
  Icon: LucideIcon
}

const ITEMS: NavItem[] = [
  { screen: 'home', labelKey: 'driverApp.sim.nav.home', Icon: Home },
  {
    screen: 'planning',
    labelKey: 'driverApp.sim.nav.planning',
    Icon: CalendarDays,
  },
  {
    screen: 'history',
    labelKey: 'driverApp.sim.nav.history',
    Icon: HistoryIcon,
  },
  { screen: 'profile', labelKey: 'driverApp.sim.nav.profile', Icon: User },
]

export function BottomNav() {
  const { t } = useTranslation()
  const { state, dispatch } = usePhoneSim()

  const activeScreen: NavScreen =
    state.screen === 'shift-active' ? 'home' : (state.screen as NavScreen)

  return (
    <nav
      aria-label="Driver app"
      className="border-t border-white/[0.06] bg-zinc-950/80 px-2 pb-2 pt-1.5 backdrop-blur phone-light:border-zinc-900/[0.08] phone-light:bg-white/80"
    >
      <ul className="flex items-stretch justify-around">
        {ITEMS.map(({ screen, labelKey, Icon }) => {
          const active = activeScreen === screen
          return (
            <li key={screen} className="flex-1">
              <button
                type="button"
                onClick={() => {
                  if (screen === 'home' && state.shiftActive) {
                    dispatch({ type: 'NAV', screen: 'shift-active' })
                  } else {
                    dispatch({ type: 'NAV', screen })
                  }
                }}
                className={cn(
                  'group relative flex w-full flex-col items-center gap-0.5 rounded-lg px-1 py-1.5 text-[10px] font-medium transition-colors',
                  active
                    ? 'text-primary'
                    : 'text-zinc-500 hover:text-zinc-200 phone-light:text-zinc-500 phone-light:hover:text-zinc-900',
                )}
                aria-current={active ? 'page' : undefined}
              >
                {active && (
                  <motion.span
                    layoutId="phonenav-active"
                    aria-hidden
                    className="absolute inset-0 rounded-lg bg-primary/10"
                    transition={{ type: 'spring', stiffness: 380, damping: 32 }}
                  />
                )}
                <Icon className="relative h-4 w-4" />
                <span className="relative">{t(labelKey)}</span>
              </button>
            </li>
          )
        })}
      </ul>
    </nav>
  )
}
