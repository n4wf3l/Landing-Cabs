import type {
  HistoryDay,
  PlanningDay,
  PlanningPerson,
  RideTemplate,
} from './types'

export const DRIVER = {
  name: 'Lucas M.',
  fullName: 'Lucas Maes',
  initials: 'LM',
  vehicle: 'Ford Puma · T-XJJ-888',
  vehicleModel: 'Ford Puma',
  vehiclePlate: 'T-XJJ-888',
  phone: '+32 498 12 34 56',
  email: 'lucas.m@cabs.brussels',
}

export const RIDE_POOL: RideTemplate[] = [
  { id: 'r1', pickup: 'Place Flagey', destination: 'Gare du Midi', platform: 'uber', durationSec: 6 },
  { id: 'r2', pickup: 'Châtelain', destination: 'Schuman', platform: 'bolt', durationSec: 5 },
  { id: 'r3', pickup: 'Avenue Louise', destination: 'Brussels Airport', platform: 'uber', durationSec: 8 },
  { id: 'r4', pickup: 'Sablon', destination: 'Atomium', platform: 'heetch', durationSec: 6 },
  { id: 'r5', pickup: 'Gare Centrale', destination: 'Uccle', platform: 'cash', durationSec: 7 },
  { id: 'r6', pickup: 'Saint-Gilles', destination: 'Woluwe-Saint-Pierre', platform: 'bolt', durationSec: 7 },
  { id: 'r7', pickup: 'Ixelles', destination: 'Etterbeek', platform: 'uber', durationSec: 5 },
  { id: 'r8', pickup: 'Anderlecht', destination: 'Grand-Place', platform: 'heetch', durationSec: 6 },
]

// Drivers and plates aligned with the admin simulator's fleet (mockData.ts in
// admin-app). Lucas is "you" — top driver in the admin's revenue screens,
// runs T-XJJ-888 Ford Puma, regular night relay is Marco Russo.
const LUCAS: PlanningPerson = {
  name: DRIVER.fullName,
  initials: DRIVER.initials,
  isYou: true,
}
const MARCO: PlanningPerson = { name: 'Marco Russo', initials: 'MR' }
const MOHAMED: PlanningPerson = { name: 'Mohamed Benali', initials: 'MB' }
const HASSAN: PlanningPerson = { name: 'Hassan Marrakchi', initials: 'HM' }
const OMAR: PlanningPerson = { name: 'Omar Mouss', initials: 'OM' }

const PLATE_PUMA = DRIVER.vehiclePlate // T-XJJ-888, Lucas's vehicle (Ford Puma)
const PLATE_SKODA = 'T-XAC-714' // Bram's vehicle in the admin sim
const PLATE_BMW = 'T-XEJ-999' // Youssef's vehicle in the admin sim

export const PLANNING: PlanningDay[] = [
  {
    dayKey: 'mon',
    day: { driver: LUCAS, plate: PLATE_PUMA },
    night: { driver: MARCO, plate: PLATE_PUMA },
  },
  {
    dayKey: 'tue',
    day: { driver: LUCAS, plate: PLATE_PUMA },
    night: { driver: MARCO, plate: PLATE_PUMA },
  },
  {
    dayKey: 'wed',
    day: { driver: MOHAMED, plate: PLATE_PUMA },
    night: { driver: MARCO, plate: PLATE_PUMA },
  },
  {
    dayKey: 'thu',
    day: { driver: LUCAS, plate: PLATE_PUMA },
    night: { driver: MARCO, plate: PLATE_PUMA },
  },
  {
    dayKey: 'fri',
    day: { driver: MOHAMED, plate: PLATE_PUMA },
    night: { driver: LUCAS, plate: PLATE_PUMA },
  },
  {
    dayKey: 'sat',
    day: { driver: null, plate: PLATE_SKODA },
    night: { driver: LUCAS, plate: PLATE_PUMA },
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
    net: 0,
    byPlatform: {
      uber: { net: 0, rides: 0 },
      bolt: { net: 0, rides: 0 },
      heetch: { net: 0, rides: 0 },
      taxivert: { net: 0, rides: 0 },
      cash: { net: 0, rides: 0 },
    },
  },
  {
    dayKey: 'mon',
    dateLabel: '20/04',
    rides: 23,
    net: 320,
    byPlatform: {
      uber: { net: 149, rides: 11 },
      bolt: { net: 90, rides: 6 },
      heetch: { net: 50, rides: 4 },
      taxivert: { net: 0, rides: 0 },
      cash: { net: 40, rides: 2 },
    },
  },
  {
    dayKey: 'tue',
    dateLabel: '21/04',
    rides: 21,
    net: 302,
    byPlatform: {
      uber: { net: 131, rides: 10 },
      bolt: { net: 84, rides: 5 },
      heetch: { net: 47, rides: 4 },
      taxivert: { net: 0, rides: 0 },
      cash: { net: 50, rides: 2 },
    },
  },
  {
    dayKey: 'wed',
    dateLabel: '22/04',
    rides: 0,
    net: 0,
    byPlatform: {
      uber: { net: 0, rides: 0 },
      bolt: { net: 0, rides: 0 },
      heetch: { net: 0, rides: 0 },
      taxivert: { net: 0, rides: 0 },
      cash: { net: 0, rides: 0 },
    },
  },
  {
    dayKey: 'thu',
    dateLabel: '23/04',
    rides: 24,
    net: 330,
    byPlatform: {
      uber: { net: 158, rides: 12 },
      bolt: { net: 89, rides: 6 },
      heetch: { net: 45, rides: 3 },
      taxivert: { net: 0, rides: 0 },
      cash: { net: 50, rides: 3 },
    },
  },
  {
    dayKey: 'fri',
    dateLabel: '24/04',
    rides: 28,
    net: 386,
    byPlatform: {
      uber: { net: 170, rides: 13 },
      bolt: { net: 113, rides: 7 },
      heetch: { net: 58, rides: 5 },
      taxivert: { net: 0, rides: 0 },
      cash: { net: 60, rides: 3 },
    },
  },
  {
    dayKey: 'sat',
    dateLabel: '25/04',
    rides: 26,
    net: 358,
    byPlatform: {
      uber: { net: 149, rides: 11 },
      bolt: { net: 102, rides: 7 },
      heetch: { net: 62, rides: 5 },
      taxivert: { net: 0, rides: 0 },
      cash: { net: 60, rides: 3 },
    },
  },
]

export const HISTORY_TOTALS = HISTORY.reduce(
  (acc, day) => ({
    rides: acc.rides + day.rides,
    net: acc.net + day.net,
  }),
  { rides: 0, net: 0 },
)
