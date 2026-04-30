import { AnimatePresence, motion, useReducedMotion } from 'framer-motion'
import { useTranslation } from 'react-i18next'
import { useAdminApp } from './useAdminApp'
import { AdminSidebar } from './AdminSidebar'
import { AdminTopBar } from './AdminTopBar'
import { DashboardScreen } from './screens/DashboardScreen'
import { VehiclesScreen } from './screens/VehiclesScreen'
import { DriversScreen } from './screens/DriversScreen'
import { MapScreen } from './screens/MapScreen'
import { PlanningScreen } from './screens/PlanningScreen'
import { RevenueScreen } from './screens/RevenueScreen'
import { SettingsScreen } from './screens/SettingsScreen'
import { ShiftsScreen } from './screens/ShiftsScreen'
import { PlaceholderScreen } from './screens/PlaceholderScreen'
import { DemoStartScreen } from './screens/DemoStartScreen'
import { AddDriverPanel } from './screens/AddDriverPanel'
import { DriverConditionsPanel } from './screens/DriverConditionsPanel'
import { AddVehiclePanel } from './screens/AddVehiclePanel'
import { DemoToast } from './parts/DemoToast'
import type { AdminScreen } from './types'

function ShellInner() {
  const { t } = useTranslation()
  const {
    started,
    screen,
    modal,
    openModal,
    conditionsDriver,
    closeConditions,
  } = useAdminApp()
  const reduce = useReducedMotion()

  const renderScreen = (s: AdminScreen) => {
    switch (s) {
      case 'dashboard':
        return <DashboardScreen />
      case 'vehicles':
        return <VehiclesScreen />
      case 'drivers':
        return <DriversScreen />
      case 'map':
        return <MapScreen />
      case 'planning':
        return <PlanningScreen />
      case 'revenue':
        return <RevenueScreen />
      case 'settings':
        return <SettingsScreen />
      case 'shifts':
        return <ShiftsScreen />
      default: {
        const fallbackKey: string = `admin.titles.${s as string}`
        return <PlaceholderScreen title={t(fallbackKey)} />
      }
    }
  }

  return (
    <div className="relative h-full overflow-hidden bg-card/40">
      <AnimatePresence mode="wait" initial={false}>
        {!started ? (
          <motion.div
            key="start"
            initial={reduce ? false : { opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={reduce ? undefined : { opacity: 0 }}
            transition={{ duration: 0.3 }}
            className="absolute inset-0"
          >
            <DemoStartScreen />
          </motion.div>
        ) : (
          <motion.div
            key="shell"
            initial={reduce ? false : { opacity: 0, scale: 0.98 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
            className="absolute inset-0 flex"
          >
            <AdminSidebar />
            <div className="flex min-w-0 flex-1 flex-col">
              <AdminTopBar />
              <div className="relative flex-1 overflow-hidden">
                <AnimatePresence mode="wait" initial={false}>
                  <motion.div
                    key={screen}
                    initial={reduce ? false : { opacity: 0, y: 6 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={reduce ? undefined : { opacity: 0, y: -6 }}
                    transition={{ duration: 0.22, ease: [0.22, 1, 0.36, 1] }}
                    className="absolute inset-0 overflow-auto"
                  >
                    {renderScreen(screen)}
                  </motion.div>
                </AnimatePresence>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <AddDriverPanel
        open={modal === 'addDriver'}
        onClose={() => openModal(null)}
      />
      <AddVehiclePanel
        open={modal === 'addVehicle'}
        onClose={() => openModal(null)}
      />
      <DriverConditionsPanel
        driver={conditionsDriver}
        onClose={closeConditions}
      />
      <DemoToast />
    </div>
  )
}

// AdminShell is the framed dashboard content. The AdminAppProvider must be
// rendered by the parent (e.g. ProductShowcase) so that sibling components like
// AdminResetButton can read/reset the same state.
export function AdminShell() {
  return <ShellInner />
}
