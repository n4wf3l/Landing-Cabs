export type Platform = 'uber' | 'bolt' | 'heetch' | 'cash'

export type CancelReason = 'no-show' | 'customer-cancelled' | 'other'

export type LeaveType = 'leave' | 'sick'

export interface LeaveRequest {
  id: string
  type: LeaveType
  // ISO YYYY-MM-DD strings; sick = single day, leave can hold multiple.
  dates: string[]
  note?: string
  createdAt: number
}

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
  // What the driver actually receives — already net of platform commission
  // and booking fees. Cabs only stores this number; commission breakdown is
  // a platform-side concern reconciled later via weekly payout exports.
  net: number
  durationSec: number
  completedAt: number
  // When true, the ride was aborted before pickup. `platform` carries a
  // placeholder that callers should ignore; UI branches on `cancelled`.
  cancelled?: boolean
  cancelReason?: CancelReason
}

export interface HistoryDay {
  dayKey: 'mon' | 'tue' | 'wed' | 'thu' | 'fri' | 'sat' | 'sun'
  dateLabel: string
  rides: number
  net: number
  byPlatform: Record<Platform, { net: number; rides: number }>
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
  leaveRequests: LeaveRequest[]
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
  | { type: 'COMPLETE_RIDE'; platform: Platform; netEntered: number }
  | { type: 'CANCEL_RIDE'; reason: CancelReason; durationSec: number }
  | {
      type: 'SUBMIT_LEAVE_REQUEST'
      request: Omit<LeaveRequest, 'id' | 'createdAt'>
    }
  | { type: 'CONTINUE_AFTER_RIDE' }
  | { type: 'GRANT_LOCATION' }
  | { type: 'DENY_LOCATION' }
  | { type: 'RETRY_LOCATION' }
  | { type: 'DISMISS_SPLASH' }
  | { type: 'RESET' }

