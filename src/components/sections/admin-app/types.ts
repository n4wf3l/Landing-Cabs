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
