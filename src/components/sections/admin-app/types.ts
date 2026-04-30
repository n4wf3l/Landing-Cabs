export type AdminScreen =
  | 'dashboard'
  | 'vehicles'
  | 'drivers'
  | 'map'
  | 'revenue'
  | 'shifts'
  | 'planning'
  | 'settings'

export const IMPLEMENTED_SCREENS: ReadonlySet<AdminScreen> = new Set([
  'dashboard',
  'vehicles',
  'drivers',
  'planning',
  'map',
  'revenue',
  'settings',
  'shifts',
])

export interface CompletedShift {
  id: string
  driverInitials: string
  driverName: string
  driverHue: number
  vehiclePlate: string
  vehicleModel: string
  startedAt: string
  endedAt: string
  durationMinutes: number
  rides: number
  net: number
  vsAvgPercent: number
}

export type DriverStatus = 'active' | 'leave' | 'sick' | 'inactive'
export type VehicleStatus = 'in_service' | 'maintenance' | 'repair' | 'good' | 'off'
export type Transmission = 'auto' | 'manual'

export interface DriverRow {
  id: string
  initials: string
  firstName: string
  lastName: string
  email: string
  phone: string
  city: string
  postcode: string
  status: DriverStatus
  shiftStartedAt: string
  shiftDurationMinutes: number
  paymentEnabled: boolean
  avatarHue: number
}

export interface VehicleRow {
  id: string
  plate: string
  model: string
  driverDay: string | null
  driverNight: string | null
  status: VehicleStatus
  transmission: Transmission
}

export interface RevenueDay {
  label: string
  uber: number
  bolt: number
  heetch: number
  cash: number
}

export interface MapPin {
  id: string
  initials: string
  lat: number
  lng: number
  status: 'available' | 'on_ride'
  driver: string
}

export type WorkFormula = 'FIFTY_FIFTY' | 'FLAT_RATE' | 'RENTAL'
export type PreferredShift = 'DAY' | 'NIGHT' | 'FLEXIBLE'
export type Weekday =
  | 'MONDAY'
  | 'TUESDAY'
  | 'WEDNESDAY'
  | 'THURSDAY'
  | 'FRIDAY'
  | 'SATURDAY'
  | 'SUNDAY'
export type PaymentMethod =
  | 'CASH'
  | 'CARD'
  | 'UBER_APP'
  | 'BOLT_CARD'
  | 'HEETCH_APP'
  | 'TAXIVERT'

export type VehicleStateApi =
  | 'IN_SERVICE'
  | 'MAINTENANCE'
  | 'REPAIR'
  | 'GOOD_CONDITION'
  | 'OUT_OF_SERVICE'

export type TransmissionApi = 'MANUAL' | 'AUTOMATIC'

export interface VehicleFormPayload {
  licensePlate: string
  brand: string
  model: string
  transmission: TransmissionApi
  odometerKm: number
  available: boolean
  activeInShift: boolean
  state: VehicleStateApi
  condition: string
}

// ── Platform-wide shift templates ─────────────────────────────────────
// The operator defines N shift slots (1 to 4) at the platform level —
// classic 2-slot day/night, or 3 drivers × 24 h (6-14, 14-22, 22-6), or
// any other layout. Each slot has start/end times and a tone color used
// in the planning grid. Per-day overrides are out of scope here; this
// covers the platform-default layer.

export type ShiftSlotKey = 'day' | 'night' | 'afternoon' | 'morning'

export type ShiftTone = 'amber' | 'indigo' | 'emerald' | 'rose'

export interface ShiftSlot {
  id: ShiftSlotKey
  /** Free-form label override; falls back to the i18n key for the id. */
  label?: string
  /** "HH:MM" 24 h format. */
  start: string
  end: string
  tone: ShiftTone
}

export const DEFAULT_SHIFT_SLOTS: ShiftSlot[] = [
  { id: 'day', start: '06:00', end: '18:00', tone: 'amber' },
  { id: 'night', start: '18:00', end: '06:00', tone: 'indigo' },
]

export const MAX_SHIFT_SLOTS = 4

// ── Per-driver compensation conditions ─────────────────────────────────
// Per-driver overrides for the SettingsScreen platform list. The operator
// configures, for each enabled platform, either a percentage split (e.g.
// 50/50, 60/40) or a flat-rate (forfait) with a period. Plus a contracted
// hours/week ceiling and a notification preference for overtime alerts
// (push to driver vs. silent / dashboard-only).

export type PlatformKey = 'uber' | 'bolt' | 'heetch' | 'taxivert' | 'cash'
export type CompensationMode = 'percentage' | 'flat'
export type FlatPeriod = 'day' | 'week' | 'month'
export type OvertimePolicy = 'declared' | 'silent'

export interface PlatformComp {
  platform: PlatformKey
  enabled: boolean
  mode: CompensationMode
  /** When mode = 'percentage'. 0–100 = the driver's share (operator gets 100 − value). */
  driverShare: number
  /** When mode = 'flat'. */
  flatAmount: number
  flatPeriod: FlatPeriod
}

export interface DriverConditions {
  driverId: string
  platforms: PlatformComp[]
  contractedHoursPerWeek: number
  overtimePolicy: OvertimePolicy
}

export interface DriverFormPayload {
  user: {
    firstName: string
    lastName: string
    email: string
    phoneNumber: string
    street: string
    postalCode: string
    city: string
    addressNumber: string
    box: string
    dateOfBirth: string
    password: string
  }
  startDate: string
  nationality: string
  issuingCountry: string
  nationalId: string
  bankAccountNumber: string
  extraInfo: string
  workFormula: WorkFormula
  preferredShift: PreferredShift
  workdays: Weekday[]
  flexWorker: boolean
  acceptedPayments: PaymentMethod[]
}
