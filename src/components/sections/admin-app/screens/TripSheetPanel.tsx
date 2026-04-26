import { AnimatePresence } from 'framer-motion'
import {
  Camera,
  FileSpreadsheet,
  FileText,
  Gauge,
  Moon,
  Printer,
  Sun,
  X,
} from 'lucide-react'
import { useTranslation } from 'react-i18next'
import { ModalShell } from '../parts/ModalShell'
import { Avatar } from '../parts/Avatar'
import { useAdminApp } from '../useAdminApp'
import type { CompletedShift } from '../types'
import { cn } from '@/lib/utils'

type Platform = 'uber' | 'bolt' | 'heetch' | 'cash'

interface TripSheetRide {
  id: string
  pickup: string
  destination: string
  platform: Platform
  brut: number
  commission: number
  net: number
}

const COMMISSION_RATES: Record<Platform, number> = {
  uber: 0.25,
  bolt: 0.18,
  heetch: 0.22,
  cash: 0,
}

const PLATFORM_LABELS: Record<Platform, string> = {
  uber: 'Uber',
  bolt: 'Bolt',
  heetch: 'Heetch',
  cash: 'Cash',
}

const PLATFORM_TONE: Record<Platform, string> = {
  uber: 'bg-zinc-200/10 text-zinc-100 ring-zinc-200/20',
  bolt: 'bg-emerald-400/10 text-emerald-300 ring-emerald-400/20',
  heetch: 'bg-fuchsia-400/10 text-fuchsia-300 ring-fuchsia-400/20',
  cash: 'bg-amber-400/10 text-amber-300 ring-amber-400/20',
}

// A small ride pool to seed each shift with realistic Brussels routes.
const RIDE_POOL: Omit<TripSheetRide, 'id' | 'commission' | 'net'>[] = [
  { pickup: 'Place Flagey', destination: 'Gare du Midi', platform: 'uber', brut: 14.2 },
  { pickup: 'Châtelain', destination: 'Schuman', platform: 'bolt', brut: 9.8 },
  { pickup: 'Avenue Louise', destination: 'Brussels Airport', platform: 'uber', brut: 42.5 },
  { pickup: 'Sablon', destination: 'Atomium', platform: 'heetch', brut: 16.4 },
  { pickup: 'Gare Centrale', destination: 'Uccle', platform: 'cash', brut: 22.0 },
  { pickup: 'Saint-Gilles', destination: 'Woluwe', platform: 'bolt', brut: 18.6 },
  { pickup: 'Ixelles', destination: 'Etterbeek', platform: 'uber', brut: 8.4 },
  { pickup: 'Anderlecht', destination: 'Grand-Place', platform: 'heetch', brut: 13.2 },
  { pickup: 'Schuman', destination: 'Avenue Louise', platform: 'cash', brut: 11.5 },
  { pickup: 'Gare du Nord', destination: 'Forest', platform: 'uber', brut: 19.8 },
  { pickup: 'Place Sainte-Catherine', destination: 'Auderghem', platform: 'bolt', brut: 21.4 },
  { pickup: 'Ixelles', destination: 'Watermael', platform: 'heetch', brut: 12.6 },
]

function rideFromTemplate(
  shiftId: string,
  templateIdx: number,
  template: (typeof RIDE_POOL)[number],
): TripSheetRide {
  const commission = Number((template.brut * COMMISSION_RATES[template.platform]).toFixed(2))
  const net = Number((template.brut - commission).toFixed(2))
  return {
    id: `${shiftId}-${templateIdx}`,
    pickup: template.pickup,
    destination: template.destination,
    platform: template.platform,
    brut: template.brut,
    commission,
    net,
  }
}

function buildRides(shift: CompletedShift): TripSheetRide[] {
  // Deterministic per shift so the same trip sheet renders the same rides
  const shiftSeed = shift.id.charCodeAt(shift.id.length - 1)
  const count = Math.min(8, Math.max(3, shift.rides))
  return Array.from({ length: count }, (_, i) => {
    const idx = (shiftSeed * 7 + i * 13) % RIDE_POOL.length
    return rideFromTemplate(shift.id, i, RIDE_POOL[idx])
  })
}

function buildKm(shift: CompletedShift): { startKm: number; endKm: number } {
  const seed = shift.id.charCodeAt(shift.id.length - 1)
  const startKm = 184_000 + (seed * 137) % 4_000
  // ~ 1 km per minute on average
  const distance = Math.round(shift.durationMinutes * 0.7) + (seed % 30)
  return { startKm, endKm: startKm + distance }
}

const SIDES: { key: 'front' | 'back' | 'left' | 'right'; labelKey: string }[] = [
  { key: 'front', labelKey: 'admin.tripsheet.sides.front' },
  { key: 'back', labelKey: 'admin.tripsheet.sides.back' },
  { key: 'left', labelKey: 'admin.tripsheet.sides.left' },
  { key: 'right', labelKey: 'admin.tripsheet.sides.right' },
]

interface TripSheetPanelProps {
  shift: CompletedShift | null
  onClose: () => void
}

export function TripSheetPanel({ shift, onClose }: TripSheetPanelProps) {
  return (
    <AnimatePresence>
      {shift && <TripSheetContent shift={shift} onClose={onClose} />}
    </AnimatePresence>
  )
}

function TripSheetContent({
  shift,
  onClose,
}: {
  shift: CompletedShift
  onClose: () => void
}) {
  const { t } = useTranslation()
  const { showDemoToast } = useAdminApp()
  const rides = buildRides(shift)
  const { startKm, endKm } = buildKm(shift)
  const distance = endKm - startKm
  const totals = rides.reduce(
    (acc, r) => ({
      brut: acc.brut + r.brut,
      commission: acc.commission + r.commission,
      net: acc.net + r.net,
    }),
    { brut: 0, commission: 0, net: 0 },
  )
  const isNightShift = shift.startedAt >= '18:00' || shift.endedAt <= '06:00'
  const ShiftIcon = isNightShift ? Moon : Sun

  const handleExport = (fmt: 'PDF' | 'CSV' | 'Print') => {
    showDemoToast(
      t('admin.tripsheet.exportToast', {
        format: fmt,
        plate: shift.vehiclePlate,
      }),
    )
  }

  return (
    <ModalShell ariaLabel={t('admin.tripsheet.title')} onClose={onClose}>
      <header className="flex items-center justify-between gap-3 border-b border-border/40 px-4 py-3">
        <div className="flex items-center gap-2">
          <FileText className="h-4 w-4 text-primary" />
          <div>
            <h2 className="text-sm font-bold tracking-tight">
              {t('admin.tripsheet.title')}
            </h2>
            <p className="text-[10px] text-muted-foreground">
              {t('admin.tripsheet.subtitle')}
            </p>
          </div>
        </div>
        <button
          type="button"
          onClick={onClose}
          aria-label={t('common.close')}
          className="inline-flex h-7 w-7 items-center justify-center rounded-md text-muted-foreground transition-colors hover:bg-accent/40 hover:text-foreground"
        >
          <X className="h-4 w-4" />
        </button>
      </header>

      <div className="flex-1 overflow-y-auto">
        <div className="space-y-3 p-4">
          {/* Identity row */}
          <section className="rounded-md border border-border/40 bg-background/40 p-3">
            <div className="flex items-center gap-3">
              <Avatar
                initials={shift.driverInitials}
                hue={shift.driverHue}
                size="lg"
              />
              <div className="min-w-0 flex-1">
                <p className="text-sm font-bold tracking-tight">
                  {shift.driverName}
                </p>
                <p className="text-[11px] text-muted-foreground">
                  <span className="font-mono">{shift.vehiclePlate}</span> ·{' '}
                  {shift.vehicleModel}
                </p>
              </div>
              <div className="text-right">
                <p className="inline-flex items-center gap-1 text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
                  <ShiftIcon className="h-3 w-3" />
                  {isNightShift
                    ? t('admin.tripsheet.nightShift')
                    : t('admin.tripsheet.dayShift')}
                </p>
                <p className="mt-0.5 font-mono text-xs font-bold tabular-nums">
                  {shift.startedAt} → {shift.endedAt}
                </p>
              </div>
            </div>

            <div className="mt-3 grid grid-cols-3 gap-2">
              <KmCell
                label={t('admin.tripsheet.km.start')}
                value={startKm}
                badge={t('admin.tripsheet.km.ocr')}
              />
              <KmCell
                label={t('admin.tripsheet.km.end')}
                value={endKm}
                badge={t('admin.tripsheet.km.ocr')}
              />
              <KmCell
                label={t('admin.tripsheet.km.distance')}
                value={distance}
                tone="primary"
              />
            </div>
          </section>

          {/* Photos */}
          <section className="rounded-md border border-border/40 bg-background/40 p-3">
            <div className="flex items-center justify-between">
              <h3 className="flex items-center gap-1.5 text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
                <Camera className="h-3 w-3 text-primary" />
                {t('admin.tripsheet.photos.title')}
              </h3>
              <span className="rounded-full bg-emerald-500/15 px-1.5 py-0.5 text-[9px] font-bold tabular-nums text-emerald-300 ring-1 ring-emerald-500/30">
                8/8
              </span>
            </div>

            <div className="mt-2 grid grid-cols-4 gap-1.5">
              {SIDES.map((s) => (
                <PhotoTile
                  key={`start-${s.key}`}
                  label={t(s.labelKey)}
                  phase="start"
                />
              ))}
            </div>
            <p className="mt-1.5 text-[9px] uppercase tracking-wider text-muted-foreground">
              {t('admin.tripsheet.photos.start')}
            </p>

            <div className="mt-2 grid grid-cols-4 gap-1.5">
              {SIDES.map((s) => (
                <PhotoTile
                  key={`end-${s.key}`}
                  label={t(s.labelKey)}
                  phase="end"
                />
              ))}
            </div>
            <p className="mt-1.5 text-[9px] uppercase tracking-wider text-muted-foreground">
              {t('admin.tripsheet.photos.end')}
            </p>
          </section>

          {/* Rides table */}
          <section className="overflow-hidden rounded-md border border-border/40 bg-background/40">
            <header className="flex items-center justify-between gap-2 border-b border-border/40 px-3 py-2">
              <h3 className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
                {t('admin.tripsheet.rides.title')}
              </h3>
              <span className="rounded-full bg-zinc-500/15 px-1.5 py-0.5 text-[9px] font-bold tabular-nums text-zinc-300 ring-1 ring-zinc-500/30">
                {rides.length}
              </span>
            </header>
            <div className="max-h-[200px] overflow-y-auto">
              <table className="w-full border-separate border-spacing-0 text-[10px]">
                <thead className="sticky top-0 bg-background/95 backdrop-blur">
                  <tr>
                    <th className="border-b border-border/40 px-3 py-1.5 text-left text-[9px] font-semibold uppercase tracking-wider text-muted-foreground">
                      {t('admin.tripsheet.rides.platform')}
                    </th>
                    <th className="border-b border-border/40 px-3 py-1.5 text-left text-[9px] font-semibold uppercase tracking-wider text-muted-foreground">
                      {t('admin.tripsheet.rides.route')}
                    </th>
                    <th className="border-b border-border/40 px-2 py-1.5 text-right text-[9px] font-semibold uppercase tracking-wider text-muted-foreground">
                      {t('admin.tripsheet.rides.brut')}
                    </th>
                    <th className="border-b border-border/40 px-2 py-1.5 text-right text-[9px] font-semibold uppercase tracking-wider text-muted-foreground">
                      −%
                    </th>
                    <th className="border-b border-border/40 px-3 py-1.5 text-right text-[9px] font-semibold uppercase tracking-wider text-muted-foreground">
                      {t('admin.tripsheet.rides.net')}
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {rides.map((r) => (
                    <tr key={r.id} className="hover:bg-accent/20">
                      <td className="border-b border-border/30 px-3 py-1.5">
                        <span
                          className={cn(
                            'inline-flex items-center rounded-full px-1.5 py-0.5 text-[9px] font-semibold uppercase tracking-wider ring-1',
                            PLATFORM_TONE[r.platform],
                          )}
                        >
                          {PLATFORM_LABELS[r.platform]}
                        </span>
                      </td>
                      <td className="border-b border-border/30 px-3 py-1.5">
                        <p className="truncate text-[10px] font-medium">
                          {r.pickup} → {r.destination}
                        </p>
                      </td>
                      <td className="border-b border-border/30 px-2 py-1.5 text-right font-mono tabular-nums">
                        €{r.brut.toFixed(2)}
                      </td>
                      <td className="border-b border-border/30 px-2 py-1.5 text-right font-mono tabular-nums text-rose-400">
                        −€{r.commission.toFixed(2)}
                      </td>
                      <td className="border-b border-border/30 px-3 py-1.5 text-right font-mono font-bold tabular-nums text-emerald-300">
                        €{r.net.toFixed(2)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <footer className="grid grid-cols-3 gap-2 border-t border-border/40 bg-background/60 px-3 py-2">
              <Total label={t('admin.tripsheet.totals.brut')} value={totals.brut} />
              <Total
                label={t('admin.tripsheet.totals.commission')}
                value={totals.commission}
                tone="negative"
              />
              <Total
                label={t('admin.tripsheet.totals.net')}
                value={totals.net}
                tone="primary"
              />
            </footer>
          </section>
        </div>
      </div>

      <footer className="flex items-center justify-between gap-2 border-t border-border/40 bg-background/40 px-4 py-2.5">
        <p className="flex items-center gap-1 text-[10px] text-muted-foreground">
          <Gauge className="h-3 w-3" />
          {t('admin.tripsheet.legalNote')}
        </p>
        <div className="flex items-center gap-1">
          <button
            type="button"
            onClick={() => handleExport('PDF')}
            className="inline-flex items-center gap-1 rounded-md border border-border/40 bg-background/40 px-2 py-1 text-[10px] font-semibold uppercase tracking-wider text-muted-foreground transition-colors hover:border-rose-500/40 hover:bg-rose-500/15 hover:text-rose-300"
          >
            <FileText className="h-3 w-3" />
            PDF
          </button>
          <button
            type="button"
            onClick={() => handleExport('CSV')}
            className="inline-flex items-center gap-1 rounded-md border border-border/40 bg-background/40 px-2 py-1 text-[10px] font-semibold uppercase tracking-wider text-muted-foreground transition-colors hover:border-emerald-500/40 hover:bg-emerald-500/15 hover:text-emerald-300"
          >
            <FileSpreadsheet className="h-3 w-3" />
            CSV
          </button>
          <button
            type="button"
            onClick={() => handleExport('Print')}
            className="inline-flex items-center gap-1 rounded-md bg-primary px-2 py-1 text-[10px] font-semibold uppercase tracking-wider text-primary-foreground shadow-glow transition-transform hover:-translate-y-0.5 active:scale-[0.98]"
          >
            <Printer className="h-3 w-3" />
            {t('admin.tripsheet.print')}
          </button>
        </div>
      </footer>
    </ModalShell>
  )
}

function KmCell({
  label,
  value,
  badge,
  tone,
}: {
  label: string
  value: number
  badge?: string
  tone?: 'primary'
}) {
  return (
    <div className="rounded-md border border-border/30 bg-card/40 p-2">
      <div className="flex items-center justify-between">
        <p className="text-[9px] font-semibold uppercase tracking-wider text-muted-foreground">
          {label}
        </p>
        {badge && (
          <span className="rounded-full bg-emerald-500/15 px-1 py-px text-[8px] font-bold uppercase tracking-wider text-emerald-300">
            {badge}
          </span>
        )}
      </div>
      <p
        className={cn(
          'mt-0.5 font-mono text-sm font-bold tabular-nums',
          tone === 'primary' && 'text-primary',
        )}
      >
        {value.toLocaleString('fr-BE')}{' '}
        <span className="text-[10px] font-medium text-muted-foreground">km</span>
      </p>
    </div>
  )
}

function PhotoTile({
  label,
  phase,
}: {
  label: string
  phase: 'start' | 'end'
}) {
  return (
    <div
      className={cn(
        'relative aspect-[4/3] overflow-hidden rounded-md border bg-zinc-900/60',
        phase === 'start' ? 'border-emerald-500/30' : 'border-rose-500/30',
      )}
      title={label}
    >
      <span className="absolute left-1 top-1 h-2 w-2 rounded-tl border-l border-t border-primary/60" />
      <span className="absolute right-1 top-1 h-2 w-2 rounded-tr border-r border-t border-primary/60" />
      <span className="absolute bottom-1 left-1 h-2 w-2 rounded-bl border-b border-l border-primary/60" />
      <span className="absolute bottom-1 right-1 h-2 w-2 rounded-br border-b border-r border-primary/60" />
      <div className="absolute inset-0 flex items-center justify-center">
        <Camera className="h-3 w-3 text-muted-foreground/40" />
      </div>
      <span className="absolute bottom-0 left-0 right-0 truncate bg-zinc-950/70 px-1 py-px text-center text-[8px] font-semibold uppercase tracking-wider">
        {label}
      </span>
    </div>
  )
}

function Total({
  label,
  value,
  tone,
}: {
  label: string
  value: number
  tone?: 'primary' | 'negative'
}) {
  return (
    <div>
      <p className="text-[9px] uppercase tracking-wider text-muted-foreground">
        {label}
      </p>
      <p
        className={cn(
          'font-mono text-xs font-bold tabular-nums',
          tone === 'primary' && 'text-emerald-300',
          tone === 'negative' && 'text-rose-400',
        )}
      >
        {tone === 'negative' ? '−' : ''}€{value.toFixed(2)}
      </p>
    </div>
  )
}
