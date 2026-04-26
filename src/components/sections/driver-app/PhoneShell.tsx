import { AnimatePresence, motion } from 'framer-motion'
import { I18nextProvider } from 'react-i18next'
import { cn } from '@/lib/utils'
import { BottomNav } from './BottomNav'
import { StatusBar } from './StatusBar'
import { DemoStartScreen } from './screens/DemoStartScreen'
import { HomeScreen } from './screens/HomeScreen'
import { PlanningScreen } from './screens/PlanningScreen'
import { HistoryScreen } from './screens/HistoryScreen'
import { ProfileScreen } from './screens/ProfileScreen'
import { ShiftActiveScreen } from './screens/ShiftActiveScreen'
import { ShiftCaptureScreen } from './screens/ShiftCaptureScreen'
import { RideActiveScreen } from './screens/RideActiveScreen'
import { RideEndPickerScreen } from './screens/RideEndPickerScreen'
import { RideSummaryScreen } from './screens/RideSummaryScreen'
import { ShiftSummaryScreen } from './screens/ShiftSummaryScreen'
import { LocationBlockedScreen } from './LocationBlockedScreen'
import { LocationPermissionPrompt } from './LocationPermissionPrompt'
import { SplashScreen } from './SplashScreen'
import { phoneI18n } from './phoneI18n'
import { usePhoneSim } from './usePhoneSim'
import type { Screen } from './types'

const SCREENS_WITH_NAV: ReadonlySet<Screen> = new Set([
  'home',
  'planning',
  'history',
  'profile',
  'shift-active',
  'shift-summary',
])

function renderScreen(screen: Screen) {
  switch (screen) {
    case 'demo-start':
      return <DemoStartScreen />
    case 'home':
      return <HomeScreen />
    case 'planning':
      return <PlanningScreen />
    case 'history':
      return <HistoryScreen />
    case 'profile':
      return <ProfileScreen />
    case 'shift-start-capture':
      return <ShiftCaptureScreen mode="start" />
    case 'shift-active':
      return <ShiftActiveScreen />
    case 'ride-active':
      return <RideActiveScreen />
    case 'ride-end-picker':
      return <RideEndPickerScreen />
    case 'ride-summary':
      return <RideSummaryScreen />
    case 'shift-end-capture':
      return <ShiftCaptureScreen mode="end" />
    case 'shift-summary':
      return <ShiftSummaryScreen />
  }
}

/**
 * The phone's inner content — status bar, current screen, bottom nav and
 * the three iOS-style overlays. Shared between the embedded shell (with
 * device bezel) and the fullscreen mobile experience (no bezel, fills the
 * viewport). Pass `rounded={false}` for fullscreen so it doesn't render
 * with phone-shaped corners.
 */
export function PhoneScreen({
  reduce,
  rounded = true,
}: {
  reduce: boolean
  rounded?: boolean
}) {
  const { state, phoneTheme } = usePhoneSim()
  const showNav = SCREENS_WITH_NAV.has(state.screen)
  const isLight = phoneTheme === 'light'

  return (
    <div
      className={cn(
        'relative flex h-full w-full flex-col overflow-hidden text-white',
        rounded && 'rounded-[2.25rem]',
        isLight
          ? 'phone-light bg-gradient-to-br from-white via-zinc-50 to-zinc-100'
          : 'phone-dark bg-gradient-to-br from-zinc-950 via-[#0a1226] to-[#070a1f]',
      )}
    >
      <StatusBar />
      <div className="relative flex-1 overflow-hidden">
        <ScreenContainer screen={state.screen} reduce={reduce} />
      </div>
      {showNav && <BottomNav />}
      <AnimatePresence>
        <LocationBlockedScreen key="location-blocked" />
      </AnimatePresence>
      <AnimatePresence>
        <LocationPermissionPrompt key="location-prompt" />
      </AnimatePresence>
      <AnimatePresence>
        <SplashScreen key="splash" />
      </AnimatePresence>
    </div>
  )
}

export function PhoneShell({ reduce }: { reduce: boolean }) {
  return (
    <I18nextProvider i18n={phoneI18n}>
      <motion.div
        initial={reduce ? { opacity: 0 } : { opacity: 0, y: 20, scale: 0.95 }}
        whileInView={{ opacity: 1, y: 0, scale: 1 }}
        viewport={{ once: true, margin: '-15%' }}
        transition={{ duration: reduce ? 0.01 : 0.7, ease: [0.22, 1, 0.36, 1] }}
        className="relative mx-auto"
      >
        <div
          aria-hidden
          className="absolute -inset-6 -z-10 rounded-[3rem] bg-gradient-brand opacity-25 blur-3xl"
        />
        <div className="relative h-[600px] w-[290px] rounded-[2.75rem] border border-border/60 bg-zinc-950 p-2 shadow-glow-lg">
          <div className="absolute left-1/2 top-2 z-20 h-6 w-28 -translate-x-1/2 rounded-b-2xl bg-zinc-950" />
          <PhoneScreen reduce={reduce} />
        </div>
      </motion.div>
    </I18nextProvider>
  )
}

function ScreenContainer({ screen, reduce }: { screen: Screen; reduce: boolean }) {
  return (
    <AnimatePresence mode="wait" initial={false}>
      <motion.div
        key={screen}
        initial={reduce ? false : { opacity: 0, y: 6 }}
        animate={{ opacity: 1, y: 0 }}
        exit={reduce ? undefined : { opacity: 0, y: -6 }}
        transition={{ duration: 0.22, ease: [0.22, 1, 0.36, 1] }}
        className="absolute inset-0"
      >
        {renderScreen(screen)}
      </motion.div>
    </AnimatePresence>
  )
}
