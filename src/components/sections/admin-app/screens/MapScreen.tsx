import { useEffect, useMemo, useRef, useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import {
  Info,
  Car,
  Clock,
  Phone,
  MapPin,
  Plus,
  Minus,
  Search,
  Euro,
  Radio,
  X,
} from 'lucide-react'
import { useTranslation } from 'react-i18next'
import L from 'leaflet'
import 'leaflet/dist/leaflet.css'
import { useAdminApp } from '../useAdminApp'
import type { PlatformKey } from '../types'

// Display name + brand-tinted classes for each ride-hailing platform.
// Used as a small pill in the driver detail panel to reinforce the
// "Cabs aggregates every platform" message.
const PLATFORM_LABEL: Record<PlatformKey, string> = {
  uber: 'Uber',
  bolt: 'Bolt',
  heetch: 'Heetch',
  taxivert: 'TaxiVert',
  cash: 'Cash',
}

const PLATFORM_CLASS: Record<PlatformKey, string> = {
  uber: 'bg-zinc-900 text-zinc-100 ring-zinc-500/40',
  bolt: 'bg-emerald-500/15 text-emerald-300 ring-emerald-400/40',
  heetch: 'bg-pink-500/15 text-pink-300 ring-pink-400/40',
  taxivert: 'bg-sky-500/15 text-sky-300 ring-sky-400/40',
  cash: 'bg-amber-500/15 text-amber-300 ring-amber-400/40',
}

// Real Brussels driver positions for the live map. Lat/lng around the
// city center + a few neighborhoods (Schaerbeek, Anderlecht, Ixelles,
// Etterbeek, Forest, Saint-Gilles, Auderghem). Status decides marker
// color + a "ping" pulse for on-ride drivers. The positions get a tiny
// jitter every 3 s to simulate live movement on roads — not real GPS,
// just enough to make the map feel alive in the demo.
interface DriverPin {
  id: string
  initials: string
  name: string
  status: 'available' | 'on_ride'
  lat: number
  lng: number
  vehicle: string
  plate: string
  shiftHours: number
  netToday: number
  ridesToday: number
  activePlatform: PlatformKey
  // When true the pin's GPS timestamp is frozen — used to demo a driver
  // whose phone has lost connectivity (the panel shows a stale "MAJ il
  // y a 1m 23s" that keeps growing).
  staleGps?: boolean
  // Last GPS fix timestamp, set at mount and refreshed on every jitter
  // (except for staleGps pins). Optional in the static mock; populated
  // by the useState lazy initializer.
  lastGpsFix?: number
  passenger?: string
  destination?: string
  fareEstimate?: number
  etaMin?: number
}

const DRIVER_PINS: DriverPin[] = [
  {
    id: 'p1',
    initials: 'AH',
    name: 'Adil Hamdi',
    status: 'on_ride',
    lat: 50.8503,
    lng: 4.3517,
    vehicle: 'Mercedes E-Class',
    plate: '1-ABC-123',
    shiftHours: 6.2,
    netToday: 185,
    ridesToday: 12,
    activePlatform: 'uber',
    passenger: 'Sarah V.',
    destination: 'Brussels Airport',
    fareEstimate: 45,
    etaMin: 18,
  },
  {
    id: 'p2',
    initials: 'YS',
    name: 'Youssef Saidi',
    status: 'available',
    lat: 50.8676,
    lng: 4.3737,
    vehicle: 'Tesla Model 3',
    plate: '1-BFK-840',
    shiftHours: 3.1,
    netToday: 78,
    ridesToday: 5,
    activePlatform: 'bolt',
  },
  {
    id: 'p3',
    initials: 'FT',
    name: 'François Thiry',
    status: 'on_ride',
    lat: 50.8389,
    lng: 4.3289,
    vehicle: 'Audi A6',
    plate: '1-DPN-552',
    shiftHours: 7.8,
    netToday: 142,
    ridesToday: 9,
    activePlatform: 'heetch',
    passenger: 'M. Dubois',
    destination: 'Gare du Midi',
    fareEstimate: 12,
    etaMin: 7,
  },
  {
    id: 'p4',
    initials: 'KH',
    name: 'Karim Haddad',
    status: 'on_ride',
    lat: 50.8337,
    lng: 4.3717,
    vehicle: 'BMW 5 Series',
    plate: '1-GLM-201',
    shiftHours: 5.5,
    netToday: 123,
    ridesToday: 8,
    activePlatform: 'uber',
    passenger: 'L. Janssens',
    destination: 'Place Flagey',
    fareEstimate: 18,
    etaMin: 11,
  },
  {
    id: 'p5',
    initials: 'MB',
    name: 'Mehdi Bouchard',
    status: 'available',
    lat: 50.8282,
    lng: 4.3502,
    vehicle: 'Volvo S90',
    plate: '1-HRT-099',
    shiftHours: 1.4,
    netToday: 34,
    ridesToday: 2,
    activePlatform: 'bolt',
  },
  {
    id: 'p6',
    initials: 'OM',
    name: 'Omar Mansouri',
    status: 'on_ride',
    lat: 50.8559,
    lng: 4.3428,
    vehicle: 'Mercedes V-Class',
    plate: '1-KBV-318',
    shiftHours: 4.7,
    netToday: 245,
    ridesToday: 7,
    activePlatform: 'taxivert',
    passenger: 'Group · 4 pax',
    destination: 'Charleroi Airport',
    fareEstimate: 95,
    etaMin: 52,
  },
  {
    id: 'p7',
    initials: 'SR',
    name: 'Sami Rezk',
    status: 'available',
    lat: 50.8266,
    lng: 4.3697,
    vehicle: 'Toyota Prius',
    plate: '1-LXP-704',
    shiftHours: 2.9,
    netToday: 56,
    ridesToday: 4,
    activePlatform: 'heetch',
    // Demo: this driver's phone has lost the data signal — his GPS
    // timestamp keeps growing, surfacing the "où sont mes chauffeurs
    // déconnectés?" pain point in the panel.
    staleGps: true,
  },
  {
    id: 'p8',
    initials: 'IB',
    name: 'Idriss Belhaj',
    status: 'on_ride',
    lat: 50.8617,
    lng: 4.3309,
    vehicle: 'Skoda Superb',
    plate: '1-NMA-465',
    shiftHours: 8.1,
    netToday: 167,
    ridesToday: 11,
    activePlatform: 'cash',
    passenger: 'C. Peeters',
    destination: 'Avenue Louise',
    fareEstimate: 14,
    etaMin: 9,
  },
]

const BRUSSELS_CENTER: L.LatLngTuple = [50.8466, 4.3528]

// Initial idle minutes for the available drivers when the demo first
// mounts. Tuned so the patron sees a mix: one short-idle (no flag), one
// medium-idle (in the filter, no badge yet), one long-idle (filter +
// badge on the pin).
const INITIAL_IDLE_MIN: Record<string, number> = {
  p2: 7,
  p5: 22,
  p7: 28,
}

const IDLE_FILTER_THRESHOLD = 15
const IDLE_BADGE_THRESHOLD = 20

type FilterKey = 'all' | 'available' | 'on_ride' | 'idle'

function idleMinutesFor(
  pin: DriverPin,
  since: Map<string, number>,
  now: number,
): number {
  if (pin.status !== 'available') return 0
  const ts = since.get(pin.id)
  if (!ts) return 0
  return Math.max(0, Math.floor((now - ts) / 60000))
}

function gpsAgeSecondsFor(pin: DriverPin, now: number): number {
  return Math.max(0, Math.floor((now - (pin.lastGpsFix ?? now)) / 1000))
}

function formatGpsAge(seconds: number): string {
  if (seconds < 60) return `${seconds}s`
  const m = Math.floor(seconds / 60)
  const s = seconds % 60
  return s === 0 ? `${m}m` : `${m}m ${s}s`
}

function makeMarkerIcon(
  initials: string,
  status: DriverPin['status'],
  isSelected: boolean,
  idleMin: number,
): L.DivIcon {
  const ringColor = status === 'available' ? '#10b981' : '#f59e0b'
  const bgColor = status === 'available' ? '#0d9668' : '#d97706'
  const ping =
    status === 'on_ride'
      ? `<span style="position:absolute;inset:-6px;border-radius:9999px;background:${ringColor}40;animation:cabs-pin-ping 1.4s cubic-bezier(0,0,.2,1) infinite"></span>`
      : ''
  const selectedRing = isSelected
    ? `box-shadow:0 0 0 2px ${ringColor},0 0 0 4px #fff,0 4px 14px rgba(0,0,0,.6)`
    : `box-shadow:0 0 0 2px ${ringColor},0 4px 12px rgba(0,0,0,.45)`
  // Long-idle warning: orange chip with the minute count anchored to the
  // top-right of the avatar. Only available drivers can be flagged idle.
  const idleBadge =
    idleMin >= IDLE_BADGE_THRESHOLD
      ? `<div style="position:absolute;top:-6px;right:-10px;display:flex;align-items:center;justify-content:center;min-width:18px;height:14px;padding:0 3px;border-radius:9999px;background:#f97316;color:#fff;font-size:8px;font-weight:700;border:1.5px solid #0a0a0a;box-shadow:0 2px 4px rgba(0,0,0,.4);white-space:nowrap">${idleMin}m</div>`
      : ''
  return L.divIcon({
    className: 'cabs-driver-pin',
    html: `
      <div style="position:relative;width:32px;height:32px;cursor:pointer">
        ${ping}
        <div style="position:relative;display:flex;align-items:center;justify-content:center;width:32px;height:32px;border-radius:9999px;background:${bgColor};color:#fff;font-size:11px;font-weight:700;${selectedRing}">
          ${initials}
        </div>
        ${idleBadge}
      </div>
    `,
    iconSize: [32, 32],
    iconAnchor: [16, 16],
  })
}

export function MapScreen() {
  const { t } = useTranslation()
  const containerRef = useRef<HTMLDivElement>(null)
  const mapRef = useRef<L.Map | null>(null)
  const markersRef = useRef<Map<string, L.Marker>>(new Map())
  const [pins, setPins] = useState<DriverPin[]>(() => {
    const now = Date.now()
    // Stale-GPS pins start with a 60 s-old fix so the panel shows a
    // meaningful "MAJ il y a 1m 03s" right away. Live pins get the
    // current timestamp; the jitter interval keeps them fresh.
    return DRIVER_PINS.map((p) => ({
      ...p,
      lastGpsFix: p.staleGps ? now - 60_000 : now,
    }))
  })
  const [selectedId, setSelectedId] = useState<string | null>(null)
  const [filter, setFilter] = useState<FilterKey>('all')
  const [search, setSearch] = useState('')

  // Frozen "since" timestamp per available driver. Built once at mount
  // from the INITIAL_IDLE_MIN offsets so the demo starts with a useful
  // mix of idle states. Wall-clock keeps ticking from there.
  const [availableSinceMap] = useState<Map<string, number>>(() => {
    const m = new Map<string, number>()
    const now = Date.now()
    for (const pin of DRIVER_PINS) {
      if (pin.status === 'available') {
        const offset = INITIAL_IDLE_MIN[pin.id] ?? 5
        m.set(pin.id, now - offset * 60000)
      }
    }
    return m
  })

  // The pins state already re-renders every 3 s thanks to the jitter
  // interval, which keeps idle minutes (computed from Date.now()) fresh
  // enough for the demo. No separate ticker needed.
  const now = Date.now()

  const counts = useMemo(() => {
    let available = 0
    let onRide = 0
    let idle = 0
    for (const p of pins) {
      if (p.status === 'available') {
        available++
        if (idleMinutesFor(p, availableSinceMap, now) >= IDLE_FILTER_THRESHOLD)
          idle++
      } else {
        onRide++
      }
    }
    return { all: pins.length, available, on_ride: onRide, idle }
  }, [pins, availableSinceMap, now])

  const displayedPins = useMemo(() => {
    const q = search.trim().toLowerCase()
    return pins.filter((p) => {
      if (filter === 'available' && p.status !== 'available') return false
      if (filter === 'on_ride' && p.status !== 'on_ride') return false
      if (filter === 'idle') {
        if (p.status !== 'available') return false
        if (idleMinutesFor(p, availableSinceMap, now) < IDLE_FILTER_THRESHOLD)
          return false
      }
      if (q && !p.name.toLowerCase().includes(q)) return false
      return true
    })
  }, [pins, filter, search, availableSinceMap, now])

  const selected = pins.find((p) => p.id === selectedId) ?? null

  // If the active filter or search hides the currently selected pin,
  // close the panel — leaving it open while its marker is gone is
  // disorienting.
  useEffect(() => {
    if (selectedId && !displayedPins.some((p) => p.id === selectedId)) {
      setSelectedId(null)
    }
  }, [displayedPins, selectedId])

  // When search narrows to exactly one driver, fly the map to them and
  // pop their detail panel. We key off the matched id (not the pin
  // object) so the 3-second jitter doesn't re-trigger a flyTo on every
  // re-render.
  const flyToId =
    search.trim() && displayedPins.length === 1 ? displayedPins[0].id : null
  useEffect(() => {
    if (!flyToId) return
    const target = pins.find((p) => p.id === flyToId)
    if (!target) return
    mapRef.current?.flyTo([target.lat, target.lng], 15, { duration: 0.6 })
    setSelectedId(flyToId)
    // Intentionally only react to flyToId — not the moving target lat/lng.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [flyToId])

  // Reframe the map whenever the filter changes so every matching pin
  // fits in view. We skip the very first run (initial mount) so the
  // default Brussels framing isn't fought, and depend only on `filter`
  // — re-fitting on every 3-s pin jitter would be jittery.
  const initialFitRef = useRef(true)
  useEffect(() => {
    if (initialFitRef.current) {
      initialFitRef.current = false
      return
    }
    const map = mapRef.current
    if (!map) return

    // Recompute the visible subset locally instead of subscribing to
    // displayedPins, so this effect ONLY fires on filter change (not on
    // each pin jitter or search keystroke).
    const q = search.trim().toLowerCase()
    const visible = pins.filter((p) => {
      if (filter === 'available' && p.status !== 'available') return false
      if (filter === 'on_ride' && p.status !== 'on_ride') return false
      if (filter === 'idle') {
        if (p.status !== 'available') return false
        if (
          idleMinutesFor(p, availableSinceMap, Date.now()) <
          IDLE_FILTER_THRESHOLD
        )
          return false
      }
      if (q && !p.name.toLowerCase().includes(q)) return false
      return true
    })

    if (visible.length === 0) return
    if (visible.length === 1) {
      map.flyTo([visible[0].lat, visible[0].lng], 14, { duration: 0.5 })
      return
    }
    const bounds = L.latLngBounds(
      visible.map((p) => [p.lat, p.lng] as [number, number]),
    )
    map.flyToBounds(bounds, {
      padding: [40, 40],
      maxZoom: 15,
      duration: 0.5,
    })
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filter])

  // Mount the Leaflet map once. Cleanup removes the map instance so
  // re-mounts (e.g. when the admin shell tab switches back) don't
  // double-init.
  useEffect(() => {
    if (!containerRef.current || mapRef.current) return

    const map = L.map(containerRef.current, {
      center: BRUSSELS_CENTER,
      zoom: 13,
      zoomControl: false,
      attributionControl: false,
      scrollWheelZoom: false,
      doubleClickZoom: false,
      boxZoom: false,
      keyboard: false,
      dragging: true,
      touchZoom: true,
    })

    // OSM raster tiles. Free, no auth, fair-use limit ~6 req/s/IP. Plenty
    // for a single demo running in one tab. The dark CartoCDN style would
    // match the app's theme better but requires opt-in via their TOS.
    L.tileLayer(
      'https://tile.openstreetmap.org/{z}/{x}/{y}.png',
      {
        maxZoom: 19,
        attribution: '© OpenStreetMap',
      },
    ).addTo(map)

    // Add an attribution control in a discreet corner — required by OSM TOS.
    L.control.attribution({ position: 'bottomright', prefix: false }).addTo(map)

    mapRef.current = map

    return () => {
      map.remove()
      mapRef.current = null
      markersRef.current.clear()
    }
  }, [])

  // Sync markers with the *displayed* pin set (filter + search applied).
  // Markers for pins that are now hidden get removed and re-added when
  // they come back; this keeps the visual count consistent with the
  // chip the user picked.
  useEffect(() => {
    const map = mapRef.current
    if (!map) return

    const live = markersRef.current
    const seen = new Set<string>()

    for (const pin of displayedPins) {
      seen.add(pin.id)
      const isSelected = pin.id === selectedId
      const idleMin = idleMinutesFor(pin, availableSinceMap, now)
      const existing = live.get(pin.id)
      if (existing) {
        existing.setLatLng([pin.lat, pin.lng])
        existing.setIcon(
          makeMarkerIcon(pin.initials, pin.status, isSelected, idleMin),
        )
      } else {
        const marker = L.marker([pin.lat, pin.lng], {
          icon: makeMarkerIcon(pin.initials, pin.status, isSelected, idleMin),
        }).addTo(map)
        marker.on('click', () => setSelectedId(pin.id))
        live.set(pin.id, marker)
      }
    }

    // Drop markers whose pin is no longer in the displayed set.
    for (const [id, marker] of live) {
      if (!seen.has(id)) {
        marker.remove()
        live.delete(id)
      }
    }
  }, [displayedPins, selectedId, availableSinceMap, now])

  // Simulate live driving: every 3 s, jitter each pin by ~80 m. The
  // movement looks plausible without ever leaving the city center, and
  // the resulting re-render keeps the idle-minute counter ticking too.
  useEffect(() => {
    const id = window.setInterval(() => {
      setPins((prev) =>
        prev.map((p) => ({
          ...p,
          lat: p.lat + (Math.random() - 0.5) * 0.0014,
          lng: p.lng + (Math.random() - 0.5) * 0.0022,
          // Refresh the GPS timestamp on every jitter so the panel
          // shows a fresh "MAJ il y a 1-3s" — except for staleGps
          // pins, whose age keeps growing to demo a lost connection.
          lastGpsFix: p.staleGps ? p.lastGpsFix : Date.now(),
        })),
      )
    }, 3000)
    return () => window.clearInterval(id)
  }, [])

  return (
    <div className="grid h-full grid-rows-[auto_1fr_auto] gap-2 p-3">
      <div className="space-y-1.5">
        <div className="flex items-center justify-between gap-2">
          <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-500/10 px-2.5 py-1 text-[10px] font-medium text-emerald-300 ring-1 ring-emerald-500/20">
            <span className="relative flex h-2 w-2">
              <span className="absolute inset-0 animate-ping rounded-full bg-emerald-500/60" />
              <span className="relative h-2 w-2 rounded-full bg-emerald-500" />
            </span>
            {t('admin.map.live')}
          </span>
          <span className="inline-flex items-center gap-1 rounded-full border border-amber-500/30 bg-amber-500/10 px-2 py-0.5 text-[9px] font-semibold uppercase tracking-wider text-amber-300">
            <Info className="h-2.5 w-2.5" />
            {t('admin.map.preview')}
          </span>
        </div>

        <div className="-mx-1 flex gap-1.5 overflow-x-auto px-1 pb-0.5">
          <FilterChip
            active={filter === 'all'}
            onClick={() => setFilter('all')}
            label={t('admin.map.filter.all')}
            count={counts.all}
          />
          <FilterChip
            active={filter === 'available'}
            onClick={() => setFilter('available')}
            label={t('admin.map.filter.available')}
            count={counts.available}
            dotClass="bg-emerald-500"
          />
          <FilterChip
            active={filter === 'on_ride'}
            onClick={() => setFilter('on_ride')}
            label={t('admin.map.filter.onRide')}
            count={counts.on_ride}
            dotClass="bg-amber-500"
          />
          <FilterChip
            active={filter === 'idle'}
            onClick={() => setFilter('idle')}
            label={t('admin.map.filter.idle')}
            count={counts.idle}
            dotClass="bg-orange-500"
          />
        </div>

        <div className="relative">
          <Search className="pointer-events-none absolute left-2 top-1/2 h-3 w-3 -translate-y-1/2 text-zinc-500" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder={t('admin.map.search.placeholder')}
            className="w-full rounded-md border border-white/10 bg-white/5 py-1.5 pl-7 pr-7 text-[10px] text-zinc-100 placeholder:text-zinc-500 focus:border-primary/40 focus:outline-none focus:ring-1 focus:ring-primary/30"
          />
          {search ? (
            <button
              type="button"
              onClick={() => setSearch('')}
              aria-label={t('admin.map.close')}
              className="absolute right-1.5 top-1/2 inline-flex h-4 w-4 -translate-y-1/2 items-center justify-center rounded text-zinc-500 transition hover:bg-white/10 hover:text-zinc-200"
            >
              <X className="h-2.5 w-2.5" />
            </button>
          ) : null}
        </div>
      </div>

      <div className="relative overflow-hidden rounded-md border border-border/40">
        <div ref={containerRef} className="h-full w-full" aria-label="Live map" />

        <div className="absolute left-2 top-2 z-[400] flex flex-col overflow-hidden rounded-md border border-white/10 bg-black/55 backdrop-blur-sm">
          <button
            type="button"
            onClick={() => mapRef.current?.zoomIn()}
            aria-label={t('admin.map.zoomIn')}
            className="flex h-7 w-7 items-center justify-center text-zinc-100 transition hover:bg-white/10"
          >
            <Plus className="h-3.5 w-3.5" />
          </button>
          <div className="h-px w-full bg-white/10" />
          <button
            type="button"
            onClick={() => mapRef.current?.zoomOut()}
            aria-label={t('admin.map.zoomOut')}
            className="flex h-7 w-7 items-center justify-center text-zinc-100 transition hover:bg-white/10"
          >
            <Minus className="h-3.5 w-3.5" />
          </button>
        </div>

        <div className="pointer-events-none absolute bottom-2 left-2 z-[400] flex flex-col gap-1 rounded-md border border-white/10 bg-black/55 px-2 py-1.5">
          <Legend swatch="bg-emerald-500" label={t('admin.map.available')} />
          <Legend swatch="bg-amber-500" label={t('admin.map.onRide')} />
        </div>

        {search.trim() && displayedPins.length === 0 ? (
          <div className="pointer-events-none absolute inset-x-2 top-2 z-[420] rounded-md border border-white/10 bg-zinc-950/85 px-2.5 py-2 text-center text-[10px] text-zinc-300 backdrop-blur-sm">
            {t('admin.map.search.noResults')}
          </div>
        ) : null}

        <AnimatePresence>
          {selected ? (
            <DriverDetailPanel
              key={selected.id}
              driver={selected}
              idleMin={idleMinutesFor(selected, availableSinceMap, now)}
              gpsAgeSec={gpsAgeSecondsFor(selected, now)}
              onClose={() => setSelectedId(null)}
            />
          ) : null}
        </AnimatePresence>
      </div>

      <p className="rounded-md border border-amber-500/20 bg-amber-500/5 px-3 py-2 text-[10px] leading-relaxed text-amber-200/80">
        <Info className="mr-1.5 inline h-3 w-3 align-text-top" aria-hidden />
        {t('admin.map.previewNotice')}
      </p>
    </div>
  )
}

function FilterChip({
  active,
  onClick,
  label,
  count,
  dotClass,
}: {
  active: boolean
  onClick: () => void
  label: string
  count: number
  dotClass?: string
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={active}
      className={`inline-flex shrink-0 items-center gap-1 rounded-full px-2.5 py-1 text-[10px] font-medium transition ${
        active
          ? 'bg-primary text-primary-foreground shadow-sm'
          : 'bg-white/5 text-zinc-300 ring-1 ring-white/10 hover:bg-white/10'
      }`}
    >
      {dotClass ? (
        <span className={`h-1.5 w-1.5 rounded-full ${dotClass}`} />
      ) : null}
      {label}
      <span
        className={`rounded-full px-1.5 py-0.5 text-[9px] font-semibold leading-none ${
          active ? 'bg-white/20' : 'bg-white/10 text-zinc-300'
        }`}
      >
        {count}
      </span>
    </button>
  )
}

function Legend({ swatch, label }: { swatch: string; label: string }) {
  return (
    <div className="flex items-center gap-1.5 text-[9px] text-zinc-300">
      <span className={`h-1.5 w-1.5 rounded-full ${swatch}`} />
      {label}
    </div>
  )
}

function DriverDetailPanel({
  driver,
  idleMin,
  gpsAgeSec,
  onClose,
}: {
  driver: DriverPin
  idleMin: number
  gpsAgeSec: number
  onClose: () => void
}) {
  const { t } = useTranslation()
  const { showDemoToast } = useAdminApp()
  const onRide = driver.status === 'on_ride'
  const ringColor = onRide ? 'bg-amber-500' : 'bg-emerald-500'
  const statusLabel = onRide ? t('admin.map.onRide') : t('admin.map.available')
  const idleWarn = idleMin >= IDLE_FILTER_THRESHOLD
  const gpsStale = gpsAgeSec >= 30
  const platformLabel = PLATFORM_LABEL[driver.activePlatform]
  const platformClass = PLATFORM_CLASS[driver.activePlatform]

  return (
    <motion.div
      initial={{ opacity: 0, x: 12, scale: 0.97 }}
      animate={{ opacity: 1, x: 0, scale: 1 }}
      exit={{ opacity: 0, x: 12, scale: 0.97 }}
      transition={{ duration: 0.28, ease: [0.22, 1, 0.36, 1] }}
      className="absolute right-2 top-2 bottom-2 z-[450] flex w-[178px] flex-col overflow-hidden rounded-md border border-white/10 bg-zinc-950/95 text-zinc-100 shadow-2xl">
      <div className="flex items-start justify-between gap-2 border-b border-white/10 bg-white/5 px-2.5 py-2">
        <div className="flex min-w-0 items-center gap-2">
          <div
            className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-[10px] font-bold text-white ${
              onRide ? 'bg-amber-600' : 'bg-emerald-600'
            }`}
          >
            {driver.initials}
          </div>
          <div className="min-w-0">
            <div className="truncate text-[11px] font-semibold leading-tight">
              {driver.name}
            </div>
            <div className="mt-0.5 flex flex-wrap items-center gap-1">
              <span className="inline-flex items-center gap-1 text-[9px] text-zinc-400">
                <span className={`h-1.5 w-1.5 rounded-full ${ringColor}`} />
                {statusLabel}
              </span>
              <span
                className={`inline-flex items-center rounded-full px-1.5 py-0.5 text-[8px] font-bold uppercase tracking-wider ring-1 ${platformClass}`}
                title={t('admin.map.detail.platform')}
              >
                {platformLabel}
              </span>
            </div>
            <div
              className={`mt-0.5 inline-flex items-center gap-1 text-[8px] ${
                gpsStale ? 'text-orange-400' : 'text-zinc-500'
              }`}
            >
              <Radio className="h-2 w-2" />
              {t('admin.map.detail.gpsFix', { age: formatGpsAge(gpsAgeSec) })}
            </div>
          </div>
        </div>
        <button
          type="button"
          onClick={onClose}
          aria-label={t('admin.map.close')}
          className="-mr-1 -mt-1 rounded-md p-1 text-zinc-400 transition hover:bg-white/10 hover:text-zinc-100"
        >
          <X className="h-3 w-3" />
        </button>
      </div>

      <div className="phone-scroll flex-1 space-y-2.5 overflow-y-auto px-2.5 py-2.5">
        {!onRide ? (
          <div
            className={`rounded-md border px-2 py-1.5 ${
              idleWarn
                ? 'border-orange-500/40 bg-orange-500/10 text-orange-300'
                : 'border-white/10 bg-white/5 text-zinc-300'
            }`}
          >
            <div className="text-[8px] font-semibold uppercase tracking-wider opacity-70">
              {t('admin.map.idle.label')}
            </div>
            <div className="text-[11px] font-semibold">
              {t('admin.map.idle.since', { minutes: idleMin })}
            </div>
          </div>
        ) : null}

        <Field
          icon={<Euro className="h-3 w-3" />}
          label={t('admin.map.detail.netToday')}
        >
          <div className="flex items-baseline gap-1">
            <span className="text-[12px] font-bold text-emerald-300">
              €{driver.netToday}
            </span>
            <span className="text-[9px] text-zinc-400">
              · {t('admin.map.detail.ridesCount', { count: driver.ridesToday })}
            </span>
          </div>
        </Field>

        <Field
          icon={<Car className="h-3 w-3" />}
          label={t('admin.map.detail.vehicle')}
        >
          <div className="text-[10px] font-medium text-zinc-100">
            {driver.vehicle}
          </div>
          <div className="text-[9px] text-zinc-400">{driver.plate}</div>
        </Field>

        <Field
          icon={<Clock className="h-3 w-3" />}
          label={t('admin.map.detail.shift')}
        >
          <div className="text-[10px] font-medium text-zinc-100">
            {t('admin.map.detail.shiftHours', { hours: driver.shiftHours.toFixed(1) })}
          </div>
        </Field>

        {onRide && driver.passenger ? (
          <Field
            icon={<MapPin className="h-3 w-3" />}
            label={t('admin.map.detail.currentTrip')}
          >
            <div className="text-[10px] font-medium text-zinc-100">
              {driver.passenger}
            </div>
            <div className="truncate text-[9px] text-zinc-400">
              → {driver.destination}
            </div>
            <div className="mt-1 flex items-center justify-between rounded border border-white/10 bg-white/5 px-1.5 py-1">
              <div>
                <div className="text-[8px] uppercase tracking-wider text-zinc-500">
                  {t('admin.map.detail.fare')}
                </div>
                <div className="text-[10px] font-semibold text-emerald-300">
                  €{driver.fareEstimate}
                </div>
              </div>
              <div className="text-right">
                <div className="text-[8px] uppercase tracking-wider text-zinc-500">
                  {t('admin.map.detail.eta')}
                </div>
                <div className="text-[10px] font-semibold text-zinc-100">
                  {driver.etaMin} min
                </div>
              </div>
            </div>
          </Field>
        ) : null}

        <button
          type="button"
          onClick={() =>
            showDemoToast(
              t('admin.demoToast.actionLocked', {
                action: t('admin.map.detail.contact'),
              }),
            )
          }
          className="flex w-full items-center justify-center gap-1.5 rounded-md border border-white/10 bg-white/5 px-2 py-1.5 text-[10px] font-medium text-zinc-100 transition hover:bg-white/10"
        >
          <Phone className="h-3 w-3" />
          {t('admin.map.detail.contact')}
        </button>
      </div>
    </motion.div>
  )
}

function Field({
  icon,
  label,
  children,
}: {
  icon: React.ReactNode
  label: string
  children: React.ReactNode
}) {
  return (
    <div>
      <div className="mb-1 flex items-center gap-1 text-[8px] font-semibold uppercase tracking-wider text-zinc-500">
        {icon}
        {label}
      </div>
      <div className="space-y-0.5">{children}</div>
    </div>
  )
}
