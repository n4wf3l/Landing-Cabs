import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useReducer,
  useState,
  type Dispatch,
  type ReactNode,
} from 'react'
import { RIDE_POOL } from './mockData'
import type { CompletedRide, PhoneSimAction, PhoneSimState } from './types'

const STORAGE_KEY = 'cabs-phone-sim-v1'
const THEME_KEY = 'cabs-phone-sim-theme-v1'

export type PhoneTheme = 'dark' | 'light'

function readStoredTheme(): PhoneTheme {
  if (typeof window === 'undefined') return 'dark'
  try {
    const v = window.localStorage.getItem(THEME_KEY)
    if (v === 'dark' || v === 'light') return v
  } catch {
    /* noop */
  }
  return 'dark'
}

const INITIAL_STATE: PhoneSimState = {
  screen: 'demo-start',
  shiftActive: false,
  shiftStartedAt: null,
  shiftEndedAt: null,
  startKm: null,
  endKm: null,
  currentRide: null,
  todayRides: [],
  lastCompletedRide: null,
  ridePoolIndex: 0,
  locationGranted: false,
  locationDenied: false,
  splashShown: false,
  leaveRequests: [],
}

function loadInitial(): PhoneSimState {
  if (typeof window === 'undefined') return INITIAL_STATE
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY)
    if (!raw) return INITIAL_STATE
    const parsed = JSON.parse(raw) as Partial<PhoneSimState>
    const hydrated: PhoneSimState = { ...INITIAL_STATE, ...parsed }
    // The ride-active screen carries a live timer that breaks across reloads.
    if (hydrated.screen === 'ride-active') {
      hydrated.screen = 'shift-active'
      hydrated.currentRide = null
    }
    // In-flow capture/picker screens reset to a stable home base on reload.
    if (hydrated.screen === 'shift-start-capture') {
      hydrated.screen = 'home'
    }
    if (
      hydrated.screen === 'ride-end-picker' ||
      hydrated.screen === 'shift-end-capture'
    ) {
      hydrated.screen = hydrated.shiftActive ? 'shift-active' : 'home'
      hydrated.currentRide = null
    }
    return hydrated
  } catch {
    return INITIAL_STATE
  }
}

function reducer(state: PhoneSimState, action: PhoneSimAction): PhoneSimState {
  switch (action.type) {
    case 'START_DEMO':
      return { ...INITIAL_STATE, screen: 'home' }
    case 'NAV':
      return { ...state, screen: action.screen }
    case 'START_SHIFT':
      return {
        ...state,
        screen: 'shift-active',
        shiftActive: true,
        shiftStartedAt: Date.now(),
        shiftEndedAt: null,
        startKm: action.startKm,
        endKm: null,
        todayRides: [],
        lastCompletedRide: null,
      }
    case 'END_SHIFT':
      return {
        ...state,
        screen: 'shift-summary',
        shiftActive: false,
        shiftEndedAt: Date.now(),
        endKm: action.endKm,
      }
    case 'START_RIDE': {
      const template = RIDE_POOL[state.ridePoolIndex % RIDE_POOL.length]
      return {
        ...state,
        screen: 'ride-active',
        currentRide: {
          id: `ride_${state.ridePoolIndex}_${Date.now()}`,
          template,
          startedAt: Date.now(),
          arrivedAt: null,
          arrivedDurationSec: null,
        },
        ridePoolIndex: state.ridePoolIndex + 1,
      }
    }
    case 'ARRIVE_AT_DESTINATION': {
      if (!state.currentRide) return state
      return {
        ...state,
        screen: 'ride-end-picker',
        currentRide: {
          ...state.currentRide,
          arrivedAt: Date.now(),
          arrivedDurationSec: action.arrivedDurationSec,
        },
      }
    }
    case 'COMPLETE_RIDE': {
      const ride = state.currentRide
      if (!ride) return state
      // The driver enters the net they actually receive (already deducted
      // by the platform). Cabs has no Uber/Bolt/Heetch API to derive a
      // gross/commission breakdown course-by-course, and that breakdown
      // is reconciled operator-side against the weekly platform exports
      // anyway — not relevant to the driver's flow.
      const completed: CompletedRide = {
        id: ride.id,
        pickup: ride.template.pickup,
        destination: ride.template.destination,
        platform: action.platform,
        net: Number(action.netEntered.toFixed(2)),
        durationSec: ride.arrivedDurationSec ?? 1,
        completedAt: Date.now(),
      }
      return {
        ...state,
        screen: 'ride-summary',
        currentRide: null,
        todayRides: [completed, ...state.todayRides],
        lastCompletedRide: completed,
      }
    }
    case 'GRANT_LOCATION':
      return { ...state, locationGranted: true, locationDenied: false }
    case 'DENY_LOCATION':
      return { ...state, locationGranted: false, locationDenied: true }
    case 'RETRY_LOCATION':
      return { ...state, locationGranted: false, locationDenied: false }
    case 'DISMISS_SPLASH':
      return { ...state, splashShown: true }
    case 'CANCEL_RIDE': {
      const ride = state.currentRide
      if (!ride) return state
      // Cancelled rides are tracked in todayRides for operator
      // accountability (high cancel rate = problem driver). Net is 0 —
      // any cancellation fee paid by the platform shows up in the weekly
      // export, not here. Platform defaults to 'cash' as a placeholder
      // that the UI ignores when `cancelled` is true.
      const cancelled: CompletedRide = {
        id: ride.id,
        pickup: ride.template.pickup,
        destination: ride.template.destination,
        platform: 'cash',
        net: 0,
        durationSec: Math.max(1, action.durationSec),
        completedAt: Date.now(),
        cancelled: true,
        cancelReason: action.reason,
      }
      return {
        ...state,
        screen: 'shift-active',
        currentRide: null,
        todayRides: [cancelled, ...state.todayRides],
      }
    }
    case 'SUBMIT_LEAVE_REQUEST': {
      const r = action.request
      // Generated entry. The simulator never actually approves these —
      // they hang as "En attente patron" forever, which is exactly what
      // the demo wants to communicate (operator-side decision pending).
      return {
        ...state,
        leaveRequests: [
          {
            id: `lr_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`,
            type: r.type,
            dates: r.dates,
            note: r.note,
            createdAt: Date.now(),
          },
          ...state.leaveRequests,
        ],
      }
    }
    case 'CONTINUE_AFTER_RIDE':
      return { ...state, screen: 'shift-active' }
    case 'RESET':
      return INITIAL_STATE
    default:
      return state
  }
}

interface PhoneSimContextValue {
  state: PhoneSimState
  dispatch: Dispatch<PhoneSimAction>
  hasProgress: boolean
  resetSim: () => void
  phoneTheme: PhoneTheme
  setPhoneTheme: (t: PhoneTheme) => void
}

const PhoneSimContext = createContext<PhoneSimContextValue | null>(null)

function computeHasProgress(state: PhoneSimState): boolean {
  return (
    state.screen !== 'demo-start' ||
    state.todayRides.length > 0 ||
    state.ridePoolIndex > 0 ||
    state.shiftActive ||
    state.shiftStartedAt !== null
  )
}

export function PhoneSimProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(reducer, undefined, loadInitial)
  const [phoneTheme, setPhoneThemeState] = useState<PhoneTheme>(readStoredTheme)

  useEffect(() => {
    if (typeof window === 'undefined') return
    try {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(state))
    } catch {
      // Ignore quota / privacy-mode errors — the demo still works in memory.
    }
  }, [state])

  const setPhoneTheme = useCallback((next: PhoneTheme) => {
    setPhoneThemeState(next)
    if (typeof window !== 'undefined') {
      try {
        window.localStorage.setItem(THEME_KEY, next)
      } catch {
        /* noop */
      }
    }
  }, [])

  const resetSim = useCallback(() => {
    if (typeof window !== 'undefined') {
      try {
        window.localStorage.removeItem(STORAGE_KEY)
        window.localStorage.removeItem(THEME_KEY)
      } catch {
        /* noop */
      }
    }
    dispatch({ type: 'RESET' })
    setPhoneThemeState('dark')
  }, [])

  return (
    <PhoneSimContext.Provider
      value={{
        state,
        dispatch,
        hasProgress: computeHasProgress(state),
        resetSim,
        phoneTheme,
        setPhoneTheme,
      }}
    >
      {children}
    </PhoneSimContext.Provider>
  )
}

export function usePhoneSim(): PhoneSimContextValue {
  const ctx = useContext(PhoneSimContext)
  if (!ctx) throw new Error('usePhoneSim must be used inside PhoneSimProvider')
  return ctx
}
