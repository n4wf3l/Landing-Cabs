import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from 'react'
import type {
  AdminScreen,
  DriverFormPayload,
  VehicleFormPayload,
} from './types'

export type ModalKind = 'addDriver' | 'addVehicle' | null

interface DemoToast {
  id: number
  message: string
}

interface AdminAppContextValue {
  started: boolean
  startDemo: () => void
  screen: AdminScreen
  setScreen: (s: AdminScreen) => void
  addedDrivers: DriverFormPayload[]
  addDriver: (payload: DriverFormPayload) => void
  addedVehicles: VehicleFormPayload[]
  addVehicle: (payload: VehicleFormPayload) => void
  modal: ModalKind
  openModal: (m: ModalKind) => void
  demoToast: DemoToast | null
  showDemoToast: (message: string) => void
  dismissDemoToast: () => void
  hasProgress: boolean
  resetSim: () => void
  sidebarCollapsed: boolean
  toggleSidebar: () => void
}

const AdminAppContext = createContext<AdminAppContextValue | null>(null)

const STORAGE_KEY = 'cabs-admin-sim-v1'

interface PersistedState {
  started: boolean
  screen: AdminScreen
  addedDrivers: DriverFormPayload[]
  addedVehicles: VehicleFormPayload[]
}

const VALID_SCREENS: ReadonlySet<AdminScreen> = new Set([
  'dashboard',
  'vehicles',
  'drivers',
  'map',
  'revenue',
  'shifts',
  'planning',
  'settings',
])

function readPersisted(initialScreen: AdminScreen): PersistedState {
  const fallback: PersistedState = {
    started: false,
    screen: initialScreen,
    addedDrivers: [],
    addedVehicles: [],
  }
  if (typeof window === 'undefined') return fallback
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY)
    if (!raw) return fallback
    const parsed = JSON.parse(raw) as Partial<PersistedState>
    return {
      started: typeof parsed.started === 'boolean' ? parsed.started : false,
      screen:
        typeof parsed.screen === 'string' && VALID_SCREENS.has(parsed.screen as AdminScreen)
          ? (parsed.screen as AdminScreen)
          : initialScreen,
      addedDrivers: Array.isArray(parsed.addedDrivers) ? parsed.addedDrivers : [],
      addedVehicles: Array.isArray(parsed.addedVehicles) ? parsed.addedVehicles : [],
    }
  } catch {
    return fallback
  }
}

export function AdminAppProvider({
  initial = 'dashboard',
  children,
}: {
  initial?: AdminScreen
  children: ReactNode
}) {
  const persisted = useMemo(() => readPersisted(initial), [initial])

  const [started, setStarted] = useState(persisted.started)
  const [screen, setScreen] = useState<AdminScreen>(persisted.screen)
  const [addedDrivers, setAddedDrivers] = useState<DriverFormPayload[]>(
    persisted.addedDrivers,
  )
  const [addedVehicles, setAddedVehicles] = useState<VehicleFormPayload[]>(
    persisted.addedVehicles,
  )
  const [modal, setModal] = useState<ModalKind>(null)
  const [demoToast, setDemoToast] = useState<DemoToast | null>(null)
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false)
  const toastTimerRef = useRef<number | null>(null)
  const toastIdRef = useRef(0)

  // Persist user-facing state on every change. Modal + toast are transient.
  useEffect(() => {
    if (typeof window === 'undefined') return
    try {
      const payload: PersistedState = { started, screen, addedDrivers, addedVehicles }
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(payload))
    } catch {
      /* ignore quota / privacy-mode */
    }
  }, [started, screen, addedDrivers, addedVehicles])

  const startDemo = useCallback(() => {
    setStarted(true)
  }, [])

  const addDriver = useCallback((payload: DriverFormPayload) => {
    setAddedDrivers((prev) => [payload, ...prev])
  }, [])

  const addVehicle = useCallback((payload: VehicleFormPayload) => {
    setAddedVehicles((prev) => [payload, ...prev])
  }, [])

  const openModal = useCallback((m: ModalKind) => {
    setModal(m)
  }, [])

  const toggleSidebar = useCallback(() => {
    setSidebarCollapsed((c) => !c)
  }, [])

  const dismissDemoToast = useCallback(() => {
    if (toastTimerRef.current !== null) {
      window.clearTimeout(toastTimerRef.current)
      toastTimerRef.current = null
    }
    setDemoToast(null)
  }, [])

  const showDemoToast = useCallback((message: string) => {
    if (toastTimerRef.current !== null) {
      window.clearTimeout(toastTimerRef.current)
    }
    toastIdRef.current += 1
    setDemoToast({ id: toastIdRef.current, message })
    toastTimerRef.current = window.setTimeout(() => {
      setDemoToast(null)
      toastTimerRef.current = null
    }, 2600)
  }, [])

  const resetSim = useCallback(() => {
    if (typeof window !== 'undefined') {
      try {
        window.localStorage.removeItem(STORAGE_KEY)
      } catch {
        /* noop */
      }
    }
    setStarted(false)
    setScreen(initial)
    setAddedDrivers([])
    setAddedVehicles([])
    setModal(null)
    if (toastTimerRef.current !== null) {
      window.clearTimeout(toastTimerRef.current)
      toastTimerRef.current = null
    }
    setDemoToast(null)
  }, [initial])

  useEffect(() => {
    return () => {
      if (toastTimerRef.current !== null) {
        window.clearTimeout(toastTimerRef.current)
      }
    }
  }, [])

  const hasProgress =
    started ||
    screen !== initial ||
    addedDrivers.length > 0 ||
    addedVehicles.length > 0

  return (
    <AdminAppContext.Provider
      value={{
        started,
        startDemo,
        screen,
        setScreen,
        addedDrivers,
        addDriver,
        addedVehicles,
        addVehicle,
        modal,
        openModal,
        demoToast,
        showDemoToast,
        dismissDemoToast,
        hasProgress,
        resetSim,
        sidebarCollapsed,
        toggleSidebar,
      }}
    >
      {children}
    </AdminAppContext.Provider>
  )
}

export function useAdminApp(): AdminAppContextValue {
  const ctx = useContext(AdminAppContext)
  if (!ctx) throw new Error('useAdminApp must be used inside AdminAppProvider')
  return ctx
}
