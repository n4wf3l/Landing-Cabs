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
  DriverRow,
  ShiftSlot,
  ShiftTone,
  VehicleFormPayload,
} from './types'
import { DEFAULT_SHIFT_SLOTS, MAX_SHIFT_SLOTS } from './types'

/**
 * Adds N hours to a "HH:MM" string, wrapping around midnight. Used when
 * stacking new shift slots — adding a 4-hour window after the last one's
 * end keeps the timeline visually consecutive without forcing the
 * operator to re-type every field.
 */
function bumpHours(time: string, hours: number): string {
  const [h, m] = time.split(':').map(Number)
  if (Number.isNaN(h) || Number.isNaN(m)) return '08:00'
  const total = (h * 60 + m + hours * 60 + 24 * 60) % (24 * 60)
  const nh = Math.floor(total / 60)
  const nm = total % 60
  return `${String(nh).padStart(2, '0')}:${String(nm).padStart(2, '0')}`
}

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
  // Per-driver compensation panel. Single instance lifted here so the
  // AddDriverPanel can chain into it on "save + advanced", and the
  // DriversScreen Eye icon can open it the regular way.
  conditionsDriver: DriverRow | null
  openConditionsFor: (driver: DriverRow) => void
  closeConditions: () => void
  // Platform-wide shift templates. Operators can run anywhere from 1 to 4
  // simultaneous shifts (typical: 2-shift day/night, or 3-shift 24 h
  // coverage). Stored separately from driver conditions because changing
  // the templates affects the whole fleet's planning at once.
  shiftSlots: ShiftSlot[]
  updateShiftSlot: (id: ShiftSlot['id'], patch: Partial<ShiftSlot>) => void
  addShiftSlot: () => void
  removeShiftSlot: (id: ShiftSlot['id']) => void
}

const AdminAppContext = createContext<AdminAppContextValue | null>(null)

const STORAGE_KEY = 'cabs-admin-sim-v1'

interface PersistedState {
  started: boolean
  screen: AdminScreen
  addedDrivers: DriverFormPayload[]
  addedVehicles: VehicleFormPayload[]
  shiftSlots: ShiftSlot[]
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
    shiftSlots: DEFAULT_SHIFT_SLOTS,
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
      shiftSlots:
        Array.isArray(parsed.shiftSlots) && parsed.shiftSlots.length > 0
          ? (parsed.shiftSlots as ShiftSlot[])
          : DEFAULT_SHIFT_SLOTS,
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
  const [conditionsDriver, setConditionsDriver] = useState<DriverRow | null>(null)
  const [shiftSlots, setShiftSlots] = useState<ShiftSlot[]>(persisted.shiftSlots)
  // Sidebar starts collapsed below `lg` (≤1024 px): on a phone or narrow
  // tablet the dashboard already fights for horizontal room, so the rail
  // ships as the icon-only `w-12` strip. On desktop we ship it expanded
  // because the page is wide enough that hiding the labels just hurts
  // navigation discoverability for no gain.
  const [sidebarCollapsed, setSidebarCollapsed] = useState(() => {
    if (typeof window === 'undefined') return false
    return !window.matchMedia('(min-width: 1024px)').matches
  })
  const toastTimerRef = useRef<number | null>(null)
  const toastIdRef = useRef(0)

  // Persist user-facing state on every change. Modal + toast are transient.
  useEffect(() => {
    if (typeof window === 'undefined') return
    try {
      const payload: PersistedState = {
        started,
        screen,
        addedDrivers,
        addedVehicles,
        shiftSlots,
      }
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(payload))
    } catch {
      /* ignore quota / privacy-mode */
    }
  }, [started, screen, addedDrivers, addedVehicles, shiftSlots])

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

  const openConditionsFor = useCallback((driver: DriverRow) => {
    setConditionsDriver(driver)
  }, [])

  const closeConditions = useCallback(() => {
    setConditionsDriver(null)
  }, [])

  const updateShiftSlot = useCallback(
    (id: ShiftSlot['id'], patch: Partial<ShiftSlot>) => {
      setShiftSlots((cur) =>
        cur.map((s) => (s.id === id ? { ...s, ...patch } : s)),
      )
    },
    [],
  )

  const addShiftSlot = useCallback(() => {
    setShiftSlots((cur) => {
      if (cur.length >= MAX_SHIFT_SLOTS) return cur
      // Pick the first id not already used.
      const used = new Set(cur.map((s) => s.id))
      const candidates: ShiftSlot['id'][] = ['morning', 'afternoon', 'day', 'night']
      const id = candidates.find((c) => !used.has(c)) ?? 'afternoon'
      // Default the new slot's hours to a 4-hour window starting at the
      // last existing slot's end time, so consecutive adds stack visually.
      const last = cur[cur.length - 1]
      const start = last?.end ?? '08:00'
      const end = bumpHours(start, 4)
      const tonePool: ShiftTone[] = ['amber', 'indigo', 'emerald', 'rose']
      const usedTones = new Set(cur.map((s) => s.tone))
      const tone =
        tonePool.find((t) => !usedTones.has(t)) ?? tonePool[cur.length % 4]
      return [...cur, { id, start, end, tone }]
    })
  }, [])

  const removeShiftSlot = useCallback((id: ShiftSlot['id']) => {
    setShiftSlots((cur) => (cur.length <= 1 ? cur : cur.filter((s) => s.id !== id)))
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
    setConditionsDriver(null)
    setShiftSlots(DEFAULT_SHIFT_SLOTS)
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
        conditionsDriver,
        openConditionsFor,
        closeConditions,
        shiftSlots,
        updateShiftSlot,
        addShiftSlot,
        removeShiftSlot,
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
