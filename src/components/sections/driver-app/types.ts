export type Platform = 'uber' | 'bolt' | 'heetch' | 'cash'

export type Screen =
  | 'demo-start'
  | 'home'
  | 'planning'
  | 'history'
  | 'profile'
  | 'shift-start-capture'
  | 'shift-active'
  | 'ride-active'
  | 'ride-end-picker'
  | 'ride-summary'
  | 'shift-end-capture'
  | 'shift-summary'

export interface RideTemplate {
  id: string
  pickup: string
  destination: string
  platform: Platform
  brut: number
  durationSec: number
}

export interface ActiveRide {
  id: string
  template: RideTemplate
  startedAt: number
  arrivedAt: number | null
  arrivedDurationSec: number | null
}

export interface CompletedRide {
  id: string
  pickup: string
  destination: string
  platform: Platform
  brut: number
  commission: number
  net: number
  durationSec: number
  completedAt: number
}

export interface HistoryDay {
  dayKey: 'mon' | 'tue' | 'wed' | 'thu' | 'fri' | 'sat' | 'sun'
  dateLabel: string
  rides: number
  brut: number
  commission: number
  net: number
  byPlatform: Record<Platform, { brut: number; net: number; rides: number }>
}

export interface PlanningPerson {
  name: string
  initials: string
  isYou?: boolean
}

export interface PlanningSlot {
  driver: PlanningPerson | null
  plate: string | null
}

export interface PlanningDay {
  dayKey: 'mon' | 'tue' | 'wed' | 'thu' | 'fri' | 'sat' | 'sun'
  day: PlanningSlot
  night: PlanningSlot
}

export interface PhoneSimState {
  screen: Screen
  shiftActive: boolean
  shiftStartedAt: number | null
  shiftEndedAt: number | null
  startKm: number | null
  endKm: number | null
  currentRide: ActiveRide | null
  todayRides: CompletedRide[]
  lastCompletedRide: CompletedRide | null
  ridePoolIndex: number
  locationGranted: boolean
  locationDenied: boolean
  splashShown: boolean
}

export type NavScreen = Extract<
  Screen,
  | 'home'
  | 'planning'
  | 'history'
  | 'profile'
  | 'shift-active'
  | 'shift-summary'
  | 'shift-start-capture'
  | 'shift-end-capture'
>

export type PhoneSimAction =
  | { type: 'START_DEMO' }
  | { type: 'NAV'; screen: NavScreen }
  | { type: 'START_SHIFT'; startKm: number }
  | { type: 'END_SHIFT'; endKm: number }
  | { type: 'START_RIDE' }
  | {
      type: 'ARRIVE_AT_DESTINATION'
      arrivedDurationSec: number
    }
  | { type: 'COMPLETE_RIDE'; platform: Platform; fareEntered: number }
  | { type: 'CONTINUE_AFTER_RIDE' }
  | { type: 'GRANT_LOCATION' }
  | { type: 'DENY_LOCATION' }
  | { type: 'RETRY_LOCATION' }
  | { type: 'DISMISS_SPLASH' }
  | { type: 'RESET' }

export const COMMISSION_RATES: Record<Platform, number> = {
  uber: 0.25,
  bolt: 0.18,
  heetch: 0.22,
  cash: 0,
}
