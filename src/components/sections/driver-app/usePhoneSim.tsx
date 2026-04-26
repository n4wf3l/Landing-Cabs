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
import { COMMISSION_RATES } from './types'
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
  currentRide: null,
  todayRides: [],
  lastCompletedRide: null,
  ridePoolIndex: 0,
  locationGranted: false,
  locationDenied: false,
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
        todayRides: [],
        lastCompletedRide: null,
      }
    case 'END_SHIFT':
      return {
        ...state,
        screen: 'shift-summary',
        shiftActive: false,
        shiftEndedAt: Date.now(),
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
          arrivedFare: null,
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
          arrivedFare: action.arrivedFare,
          arrivedDurationSec: action.arrivedDurationSec,
        },
      }
    }
    case 'COMPLETE_RIDE': {
      const ride = state.currentRide
      if (!ride) return state
      const meterFare = ride.arrivedFare ?? ride.template.brut
      const brut =
        action.platform === 'cash' && action.cashAmount != null
          ? action.cashAmount
          : meterFare
      const rate = COMMISSION_RATES[action.platform]
      const commission = Number((brut * rate).toFixed(2))
      const net = Number((brut - commission).toFixed(2))
      const completed: CompletedRide = {
        id: ride.id,
        pickup: ride.template.pickup,
        destination: ride.template.destination,
        platform: action.platform,
        brut: Number(brut.toFixed(2)),
        commission,
        net,
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
