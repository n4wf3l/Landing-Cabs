import type {
  HistoryDay,
  PlanningDay,
  PlanningPerson,
  RideTemplate,
} from './types'

export const DRIVER = {
  name: 'Sofia R.',
  fullName: 'Sofia Rossi',
  initials: 'SR',
  vehicle: 'Clio · FB-123-CD',
  vehicleModel: 'Renault Clio',
  vehiclePlate: 'FB-123-CD',
  phone: '+32 4XX XX XX XX',
  email: 'sofia.r@cabs.brussels',
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

const SOFIA: PlanningPerson = {
  name: DRIVER.fullName,
  initials: DRIVER.initials,
  isYou: true,
}
const MARC: PlanningPerson = { name: 'Marc D.', initials: 'MD' }
const LINA: PlanningPerson = { name: 'Lina S.', initials: 'LS' }
const TARIK: PlanningPerson = { name: 'Tarik B.', initials: 'TB' }
const YOUNES: PlanningPerson = { name: 'Younes K.', initials: 'YK' }
const KARIM: PlanningPerson = { name: 'Karim H.', initials: 'KH' }

const PLATE_CLIO = DRIVER.vehiclePlate // FB-123-CD
const PLATE_POLO = 'FB-789-EF'
const PLATE_OCTAVIA = 'BM-456-XY'

export const PLANNING: PlanningDay[] = [
  {
    dayKey: 'mon',
    day: { driver: SOFIA, plate: PLATE_CLIO },
    night: { driver: MARC, plate: PLATE_CLIO },
  },
  {
    dayKey: 'tue',
    day: { driver: SOFIA, plate: PLATE_CLIO },
    night: { driver: MARC, plate: PLATE_CLIO },
  },
  {
    dayKey: 'wed',
    day: { driver: LINA, plate: PLATE_POLO },
    night: { driver: MARC, plate: PLATE_CLIO },
  },
  {
    dayKey: 'thu',
    day: { driver: SOFIA, plate: PLATE_CLIO },
    night: { driver: TARIK, plate: PLATE_CLIO },
  },
  {
    dayKey: 'fri',
    day: { driver: LINA, plate: PLATE_POLO },
    night: { driver: SOFIA, plate: PLATE_CLIO },
  },
  {
    dayKey: 'sat',
    day: { driver: null, plate: PLATE_OCTAVIA },
    night: { driver: SOFIA, plate: PLATE_CLIO },
  },
  {
    dayKey: 'sun',
    day: { driver: YOUNES, plate: PLATE_OCTAVIA },
    night: { driver: KARIM, plate: PLATE_POLO },
  },
]

export const HISTORY: HistoryDay[] = [
  {
    dayKey: 'sun',
    dateLabel: '20/04',
    rides: 19,
    brut: 348,
    commission: 76,
    net: 272,
    byPlatform: {
      uber: { brut: 162, net: 122, rides: 9 },
      bolt: { brut: 96, net: 79, rides: 5 },
      heetch: { brut: 50, net: 39, rides: 3 },
      cash: { brut: 40, net: 40, rides: 2 },
    },
  },
  {
    dayKey: 'mon',
    dateLabel: '21/04',
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
    dateLabel: '22/04',
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
    dateLabel: '23/04',
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
    dateLabel: '24/04',
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
    dateLabel: '25/04',
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
    dateLabel: '26/04',
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
