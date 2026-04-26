import type {
  HistoryDay,
  PlanningDay,
  PlanningPerson,
  RideTemplate,
} from './types'

export const DRIVER = {
  name: 'Ahmed H.',
  fullName: 'Ahmed Haddad',
  initials: 'AH',
  vehicle: 'Ford Puma · TJJ-888',
  vehicleModel: 'Ford Puma',
  vehiclePlate: 'TJJ-888',
  phone: '+32 498 12 34 56',
  email: 'ahmed.h@cabs.brussels',
}

export const RIDE_POOL: RideTemplate[] = [
  {
    id: 'r1',
    pickup: 'Place Flagey',
    destination: 'Gare du Midi',
    platform: 'uber',
    brut: 14.2,
    durationSec: 6,
  },
  {
    id: 'r2',
    pickup: 'Châtelain',
    destination: 'Schuman',
    platform: 'bolt',
    brut: 9.8,
    durationSec: 5,
  },
  {
    id: 'r3',
    pickup: 'Avenue Louise',
    destination: 'Brussels Airport',
    platform: 'uber',
    brut: 42.5,
    durationSec: 8,
  },
  {
    id: 'r4',
    pickup: 'Sablon',
    destination: 'Atomium',
    platform: 'heetch',
    brut: 16.4,
    durationSec: 6,
  },
  {
    id: 'r5',
    pickup: 'Gare Centrale',
    destination: 'Uccle',
    platform: 'cash',
    brut: 22.0,
    durationSec: 7,
  },
  {
    id: 'r6',
    pickup: 'Saint-Gilles',
    destination: 'Woluwe-Saint-Pierre',
    platform: 'bolt',
    brut: 18.6,
    durationSec: 7,
  },
  {
    id: 'r7',
    pickup: 'Ixelles',
    destination: 'Etterbeek',
    platform: 'uber',
    brut: 8.4,
    durationSec: 5,
  },
  {
    id: 'r8',
    pickup: 'Anderlecht',
    destination: 'Grand-Place',
    platform: 'heetch',
    brut: 13.2,
    durationSec: 6,
  },
]

// Drivers and plates aligned with the admin simulator's fleet (mockData.ts in
// admin-app). Ahmed is "you" — top driver in the admin's revenue screens,
// runs TJJ-888 Ford Puma, regular night relay is Layla Vermeulen.
const AHMED: PlanningPerson = {
  name: DRIVER.fullName,
  initials: DRIVER.initials,
  isYou: true,
}
const LAYLA: PlanningPerson = { name: 'Layla Vermeulen', initials: 'LV' }
const MOHAMED: PlanningPerson = { name: 'Mohamed Benali', initials: 'MB' }
const HASSAN: PlanningPerson = { name: 'Hassan Marrakchi', initials: 'HM' }
const OMAR: PlanningPerson = { name: 'Omar Mouss', initials: 'OM' }

const PLATE_PUMA = DRIVER.vehiclePlate // TJJ-888, Ahmed's vehicle (Ford Puma)
const PLATE_SKODA = 'AC-7714' // Khadija's vehicle in the admin sim
const PLATE_BMW = '8EJ-999' // Youssef's vehicle in the admin sim

export const PLANNING: PlanningDay[] = [
  {
    dayKey: 'mon',
    day: { driver: AHMED, plate: PLATE_PUMA },
    night: { driver: LAYLA, plate: PLATE_PUMA },
  },
  {
    dayKey: 'tue',
    day: { driver: AHMED, plate: PLATE_PUMA },
    night: { driver: LAYLA, plate: PLATE_PUMA },
  },
  {
    dayKey: 'wed',
    day: { driver: MOHAMED, plate: PLATE_PUMA },
    night: { driver: LAYLA, plate: PLATE_PUMA },
  },
  {
    dayKey: 'thu',
    day: { driver: AHMED, plate: PLATE_PUMA },
    night: { driver: LAYLA, plate: PLATE_PUMA },
  },
  {
    dayKey: 'fri',
    day: { driver: MOHAMED, plate: PLATE_PUMA },
    night: { driver: AHMED, plate: PLATE_PUMA },
  },
  {
    dayKey: 'sat',
    day: { driver: null, plate: PLATE_SKODA },
    night: { driver: AHMED, plate: PLATE_PUMA },
  },
  {
    dayKey: 'sun',
    day: { driver: HASSAN, plate: PLATE_SKODA },
    night: { driver: OMAR, plate: PLATE_BMW },
  },
]

// Last 7 days, ending yesterday (Sat 25/04). Today = Sun 26/04 in 2026 calendar.
// dayKey ↔ dateLabel mappings match April 2026 (Mon=20, Sun=26).
// Sun + Wed are off days, mirroring the planning above.
export const HISTORY: HistoryDay[] = [
  {
    dayKey: 'sun',
    dateLabel: '19/04',
    rides: 0,
    brut: 0,
    commission: 0,
    net: 0,
    byPlatform: {
      uber: { brut: 0, net: 0, rides: 0 },
      bolt: { brut: 0, net: 0, rides: 0 },
      heetch: { brut: 0, net: 0, rides: 0 },
      cash: { brut: 0, net: 0, rides: 0 },
    },
  },
  {
    dayKey: 'mon',
    dateLabel: '20/04',
    rides: 23,
    brut: 412,
    commission: 92,
    net: 320,
    byPlatform: {
      uber: { brut: 198, net: 149, rides: 11 },
      bolt: { brut: 110, net: 90, rides: 6 },
      heetch: { brut: 64, net: 50, rides: 4 },
      cash: { brut: 40, net: 40, rides: 2 },
    },
  },
  {
    dayKey: 'tue',
    dateLabel: '21/04',
    rides: 21,
    brut: 386,
    commission: 84,
    net: 302,
    byPlatform: {
      uber: { brut: 174, net: 131, rides: 10 },
      bolt: { brut: 102, net: 84, rides: 5 },
      heetch: { brut: 60, net: 47, rides: 4 },
      cash: { brut: 50, net: 50, rides: 2 },
    },
  },
  {
    dayKey: 'wed',
    dateLabel: '22/04',
    rides: 0,
    brut: 0,
    commission: 0,
    net: 0,
    byPlatform: {
      uber: { brut: 0, net: 0, rides: 0 },
      bolt: { brut: 0, net: 0, rides: 0 },
      heetch: { brut: 0, net: 0, rides: 0 },
      cash: { brut: 0, net: 0, rides: 0 },
    },
  },
  {
    dayKey: 'thu',
    dateLabel: '23/04',
    rides: 24,
    brut: 426,
    commission: 96,
    net: 330,
    byPlatform: {
      uber: { brut: 210, net: 158, rides: 12 },
      bolt: { brut: 108, net: 89, rides: 6 },
      heetch: { brut: 58, net: 45, rides: 3 },
      cash: { brut: 50, net: 50, rides: 3 },
    },
  },
  {
    dayKey: 'fri',
    dateLabel: '24/04',
    rides: 28,
    brut: 498,
    commission: 112,
    net: 386,
    byPlatform: {
      uber: { brut: 226, net: 170, rides: 13 },
      bolt: { brut: 138, net: 113, rides: 7 },
      heetch: { brut: 74, net: 58, rides: 5 },
      cash: { brut: 60, net: 60, rides: 3 },
    },
  },
  {
    dayKey: 'sat',
    dateLabel: '25/04',
    rides: 26,
    brut: 462,
    commission: 104,
    net: 358,
    byPlatform: {
      uber: { brut: 198, net: 149, rides: 11 },
      bolt: { brut: 124, net: 102, rides: 7 },
      heetch: { brut: 80, net: 62, rides: 5 },
      cash: { brut: 60, net: 60, rides: 3 },
    },
  },
]

export const HISTORY_TOTALS = HISTORY.reduce(
  (acc, day) => ({
    rides: acc.rides + day.rides,
    brut: acc.brut + day.brut,
    commission: acc.commission + day.commission,
    net: acc.net + day.net,
  }),
  { rides: 0, brut: 0, commission: 0, net: 0 },
)
