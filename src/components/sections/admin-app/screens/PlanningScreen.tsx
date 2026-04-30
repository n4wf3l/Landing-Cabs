import { useMemo, useState } from 'react'
import {
  CalendarDays,
  ChevronLeft,
  ChevronRight,
  History,
  Lock,
  Moon,
  Plus,
  Sparkles,
  Sun,
  X,
} from 'lucide-react'
import { useTranslation } from 'react-i18next'
import { cn } from '@/lib/utils'
import { VEHICLES } from '../mockData'
import { useAdminApp } from '../useAdminApp'

type DayKey = 'mon' | 'tue' | 'wed' | 'thu' | 'fri' | 'sat' | 'sun'
const DAY_KEYS: DayKey[] = ['mon', 'tue', 'wed', 'thu', 'fri', 'sat', 'sun']

type ShiftKind = 'day' | 'night'

type AssignmentMap = Record<string, string | null>
// Per-week-offset map of slot key → driver (or null = explicit clearing)
type AllAssignments = Record<string, AssignmentMap>

interface SlotCell {
  driver: string | null
}
interface VehicleWeek {
  plate: string
  model: string
  day: SlotCell[]
  night: SlotCell[]
}

const VEHICLE_COUNT = 5

function firstName(full: string | null): string | null {
  if (!full) return null
  return full.split(' ')[0]
}

function slotKey(plate: string, dayIdx: number, kind: ShiftKind): string {
  return `${plate}#${dayIdx}#${kind}`
}

/** Monday of the week containing today, in local time, time set to 00:00. */
function getMonday(offset: number): Date {
  const today = new Date()
  const day = today.getDay() // 0=Sun, 1=Mon
  const mondayDelta = day === 0 ? -6 : 1 - day
  const monday = new Date(today)
  monday.setDate(today.getDate() + mondayDelta + offset * 7)
  monday.setHours(0, 0, 0, 0)
  return monday
}

function buildWeek(
  offset: number,
  overrides: AssignmentMap | undefined,
): VehicleWeek[] {
  return VEHICLES.slice(0, VEHICLE_COUNT).map((v, i) => {
    const dayHole = (i * 2) % 7
    const nightHole = (i * 3 + 4) % 7
    const cellFor = (d: number, kind: ShiftKind): string | null => {
      const k = slotKey(v.plate, d, kind)
      if (overrides && k in overrides) return overrides[k]
      // Future weeks start empty by default; past + current keep the seeded grid.
      if (offset > 0) return null
      const baseHole = kind === 'day' ? dayHole : nightHole
      if (d === baseHole) return null
      return kind === 'day' ? v.driverDay : v.driverNight
    }
    return {
      plate: v.plate,
      model: v.model,
      day: DAY_KEYS.map((_, d) => ({ driver: cellFor(d, 'day') })),
      night: DAY_KEYS.map((_, d) => ({ driver: cellFor(d, 'night') })),
    }
  })
}

const DRIVER_POOL = Array.from(
  new Set(
    VEHICLES.flatMap((v) => [v.driverDay, v.driverNight]).filter(
      (d): d is string => Boolean(d),
    ),
  ),
)

interface PickerTarget {
  plate: string
  dayIdx: number
  kind: ShiftKind
}

export function PlanningScreen() {
  const { t, i18n } = useTranslation()
  const { showDemoToast } = useAdminApp()
  const [weekOffset, setWeekOffset] = useState(0)
  const [allAssignments, setAllAssignments] = useState<AllAssignments>({})
  const [picker, setPicker] = useState<PickerTarget | null>(null)

  const offsetKey = String(weekOffset)
  const overrides = allAssignments[offsetKey]

  const week = useMemo(
    () => buildWeek(weekOffset, overrides),
    [weekOffset, overrides],
  )

  const isFuture = weekOffset > 0
  const editable = isFuture

  const assignedSlots = week.reduce(
    (acc, v) =>
      acc +
      v.day.filter((s) => s.driver).length +
      v.night.filter((s) => s.driver).length,
    0,
  )
  const totalSlots = week.length * 14
  const holes = totalSlots - assignedSlots

  function setSlot(target: PickerTarget, driver: string | null) {
    const previous = week
      .find((v) => v.plate === target.plate)
      ?.[target.kind][target.dayIdx]?.driver ?? null
    if (previous === driver) return
    setAllAssignments((prev) => {
      const current = prev[offsetKey] ?? {}
      return {
        ...prev,
        [offsetKey]: {
          ...current,
          [slotKey(target.plate, target.dayIdx, target.kind)]: driver,
        },
      }
    })
    const dayLabel = t(`admin.planning.days.${DAY_KEYS[target.dayIdx]}`)
    const shiftLabel = t(`admin.planning.shift.${target.kind}`)
    if (driver) {
      showDemoToast(
        t('admin.planning.toast.assigned', {
          driver: firstName(driver),
          plate: target.plate,
          day: dayLabel,
          shift: shiftLabel,
        }),
      )
    } else {
      showDemoToast(
        t('admin.planning.toast.cleared', {
          plate: target.plate,
          day: dayLabel,
          shift: shiftLabel,
        }),
      )
    }
  }

  function autoPlan() {
    let filled = 0
    setAllAssignments((prev) => {
      const current = prev[offsetKey] ?? {}
      const next: AssignmentMap = { ...current }
      VEHICLES.slice(0, VEHICLE_COUNT).forEach((v) => {
        for (let d = 0; d < 7; d++) {
          const kDay = slotKey(v.plate, d, 'day')
          const kNight = slotKey(v.plate, d, 'night')
          if (next[kDay] == null && v.driverDay) {
            next[kDay] = v.driverDay
            filled += 1
          }
          if (next[kNight] == null && v.driverNight) {
            next[kNight] = v.driverNight
            filled += 1
          }
        }
      })
      return { ...prev, [offsetKey]: next }
    })
    showDemoToast(
      filled > 0
        ? t('admin.planning.toast.autoPlanned', { n: filled })
        : t('admin.planning.toast.alreadyFull'),
    )
  }

  const monday = getMonday(weekOffset)
  const sunday = new Date(monday)
  sunday.setDate(monday.getDate() + 6)

  const lang = i18n.language || 'fr'
  const fmt = new Intl.DateTimeFormat(lang, { day: '2-digit', month: 'short' })
  const range = `${fmt.format(monday)} → ${fmt.format(sunday)}`

  const relativeKey =
    weekOffset === 0
      ? 'thisWeek'
      : weekOffset === -1
        ? 'lastWeek'
        : weekOffset === 1
          ? 'nextWeek'
          : null

  return (
    <div className="flex h-full flex-col gap-3 p-4">
      <header className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h2 className="flex items-center gap-2 text-sm font-bold tracking-tight">
            <CalendarDays className="h-4 w-4 text-primary" />
            {t('admin.planning.title')}
          </h2>
          <p className="mt-0.5 text-[11px] text-muted-foreground">
            {t('admin.planning.subtitle')}
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <ShiftLegend />
          <Pill
            tone="emerald"
            label={t('admin.planning.assigned', {
              n: assignedSlots,
              total: totalSlots,
            })}
          />
          <Pill
            tone="amber"
            label={t('admin.planning.holes', { n: holes })}
          />
        </div>
      </header>

      <div className="flex flex-wrap items-center gap-2 rounded-md border border-border/40 bg-background/40 p-2">
        <button
          type="button"
          onClick={() => {
            setPicker(null)
            setWeekOffset((o) => o - 1)
          }}
          aria-label={t('admin.planning.prev')}
          className="inline-flex h-7 w-7 items-center justify-center rounded-md text-muted-foreground transition-colors hover:bg-accent/40 hover:text-foreground"
        >
          <ChevronLeft className="h-4 w-4" />
        </button>
        <button
          type="button"
          onClick={() => {
            setPicker(null)
            setWeekOffset((o) => o + 1)
          }}
          aria-label={t('admin.planning.next')}
          className="inline-flex h-7 w-7 items-center justify-center rounded-md text-muted-foreground transition-colors hover:bg-accent/40 hover:text-foreground"
        >
          <ChevronRight className="h-4 w-4" />
        </button>
        <div className="flex min-w-0 flex-1 items-center gap-2">
          <span className="text-xs font-bold tabular-nums">{range}</span>
          {relativeKey && (
            <span className="text-[10px] font-medium uppercase tracking-wider text-muted-foreground">
              · {t(`admin.planning.${relativeKey}`)}
            </span>
          )}
          {weekOffset < 0 && (
            <span className="inline-flex items-center gap-1 rounded-full border border-zinc-500/30 bg-zinc-500/10 px-2 py-0.5 text-[9px] font-semibold uppercase tracking-wider text-muted-foreground">
              <History className="h-3 w-3" />
              {t('admin.planning.readonly')}
            </span>
          )}
          {weekOffset === 0 && (
            <span className="inline-flex items-center gap-1 rounded-full border border-emerald-500/30 bg-emerald-500/10 px-2 py-0.5 text-[9px] font-semibold uppercase tracking-wider text-emerald-300">
              <Lock className="h-3 w-3" />
              {t('admin.planning.locked')}
            </span>
          )}
        </div>
        {weekOffset !== 0 && (
          <button
            type="button"
            onClick={() => {
              setPicker(null)
              setWeekOffset(0)
            }}
            className="rounded-md border border-border/40 px-2 py-1 text-[10px] font-semibold uppercase tracking-wider text-muted-foreground transition-colors hover:bg-accent/40 hover:text-foreground"
          >
            {t('admin.planning.todayCta')}
          </button>
        )}
        {editable && (
          <button
            type="button"
            onClick={autoPlan}
            className="inline-flex items-center gap-1 rounded-md bg-primary px-2.5 py-1 text-[10px] font-semibold uppercase tracking-wider text-primary-foreground shadow-glow transition-transform hover:-translate-y-0.5 active:scale-[0.98]"
          >
            <Sparkles className="h-3 w-3" />
            {t('admin.planning.autoPlan')}
          </button>
        )}
      </div>

      {picker && editable && (
        <PickerBar
          target={picker}
          onPick={(driver) => {
            if (picker) setSlot(picker, driver)
            setPicker(null)
          }}
          onClear={() => {
            if (picker) setSlot(picker, null)
            setPicker(null)
          }}
          onCancel={() => setPicker(null)}
        />
      )}

      <div className="min-h-0 flex-1 overflow-auto rounded-md border border-border/40 bg-background/40">
        <table className="w-full border-separate border-spacing-0 text-[11px]">
          <thead className="sticky top-0 z-10 bg-background/95 backdrop-blur">
            <tr>
              <th
                scope="col"
                className="sticky left-0 z-20 border-b border-r border-border/40 bg-background/95 px-3 py-2 text-left text-[10px] font-semibold uppercase tracking-wider text-muted-foreground"
              >
                {t('admin.planning.vehicle')}
              </th>
              {DAY_KEYS.map((d) => (
                <th
                  key={d}
                  scope="col"
                  className="border-b border-border/40 px-2 py-2 text-center text-[10px] font-semibold uppercase tracking-wider text-muted-foreground"
                >
                  {t(`admin.planning.days.${d}`)}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {week.map((v) => (
              <VehicleRow
                key={v.plate}
                vehicle={v}
                editable={editable}
                pickerKey={
                  picker && picker.plate === v.plate
                    ? `${picker.dayIdx}#${picker.kind}`
                    : null
                }
                onPick={(dayIdx, kind) =>
                  setPicker({ plate: v.plate, dayIdx, kind })
                }
                onClear={(dayIdx, kind) =>
                  setSlot({ plate: v.plate, dayIdx, kind }, null)
                }
              />
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}

function VehicleRow({
  vehicle,
  editable,
  pickerKey,
  onPick,
  onClear,
}: {
  vehicle: VehicleWeek
  editable: boolean
  pickerKey: string | null
  onPick: (dayIdx: number, kind: ShiftKind) => void
  onClear: (dayIdx: number, kind: ShiftKind) => void
}) {
  return (
    <>
      <tr>
        <th
          rowSpan={2}
          scope="row"
          className="sticky left-0 z-10 border-b border-r border-border/40 bg-background/95 px-3 py-1.5 text-left align-middle"
        >
          <p className="text-[11px] font-bold tracking-tight">{vehicle.plate}</p>
          <p className="mt-0.5 truncate text-[9px] text-muted-foreground">
            {vehicle.model}
          </p>
        </th>
        {vehicle.day.map((s, i) => (
          <Cell
            key={`d${i}`}
            kind="day"
            driver={s.driver}
            editable={editable}
            isPicker={pickerKey === `${i}#day`}
            onPick={() => onPick(i, 'day')}
            onClear={() => onClear(i, 'day')}
          />
        ))}
      </tr>
      <tr>
        {vehicle.night.map((s, i) => (
          <Cell
            key={`n${i}`}
            kind="night"
            driver={s.driver}
            editable={editable}
            isPicker={pickerKey === `${i}#night`}
            onPick={() => onPick(i, 'night')}
            onClear={() => onClear(i, 'night')}
          />
        ))}
      </tr>
    </>
  )
}

function Cell({
  driver,
  kind,
  editable,
  isPicker,
  onPick,
  onClear,
}: {
  driver: string | null
  kind: ShiftKind
  editable: boolean
  isPicker: boolean
  onPick: () => void
  onClear: () => void
}) {
  const Icon = kind === 'day' ? Sun : Moon
  const isDay = kind === 'day'
  const isOpen = driver === null
  const first = firstName(driver)

  const tdClass = cn(
    'border-b border-l border-border/40 px-2 py-1.5 align-middle',
    isOpen && !editable && 'bg-amber-500/[0.04]',
    isOpen && editable && 'bg-primary/[0.04]',
    isPicker && 'ring-1 ring-inset ring-primary',
  )

  if (!editable) {
    return (
      <td title={driver ?? undefined} className={tdClass}>
        <div className="flex items-center gap-1">
          <Icon
            className={cn(
              'h-2.5 w-2.5 shrink-0',
              isDay ? 'text-amber-400/80' : 'text-indigo-400/80',
            )}
          />
          {isOpen ? (
            <span className="text-[10px] italic text-amber-400/80">—</span>
          ) : (
            <span className="truncate text-[10px] font-medium">{first}</span>
          )}
        </div>
      </td>
    )
  }

  // Editable (future week)
  if (isOpen) {
    return (
      <td className={tdClass}>
        <button
          type="button"
          onClick={onPick}
          className={cn(
            'flex w-full items-center justify-center gap-1 rounded-md border border-dashed border-primary/40 py-0.5 text-[10px] font-medium text-primary/80 transition-colors hover:border-primary hover:bg-primary/10 hover:text-primary',
            isPicker && 'border-primary bg-primary/10 text-primary',
          )}
          title={isDay ? 'Day shift' : 'Night shift'}
        >
          <Icon className="h-2.5 w-2.5" />
          <Plus className="h-2.5 w-2.5" />
        </button>
      </td>
    )
  }
  return (
    <td title={driver ?? undefined} className={tdClass}>
      <div className="flex items-center gap-1">
        <Icon
          className={cn(
            'h-2.5 w-2.5 shrink-0',
            isDay ? 'text-amber-400/80' : 'text-indigo-400/80',
          )}
        />
        <span className="truncate text-[10px] font-medium">{first}</span>
        <button
          type="button"
          onClick={onClear}
          aria-label="Clear"
          className="ml-auto inline-flex h-3 w-3 shrink-0 items-center justify-center rounded-full text-muted-foreground/60 transition-colors hover:bg-rose-500/20 hover:text-rose-300"
        >
          <X className="h-2 w-2" />
        </button>
      </div>
    </td>
  )
}

function PickerBar({
  target,
  onPick,
  onClear,
  onCancel,
}: {
  target: PickerTarget
  onPick: (driver: string) => void
  onClear: () => void
  onCancel: () => void
}) {
  const { t } = useTranslation()
  const Icon = target.kind === 'day' ? Sun : Moon

  return (
    <div className="flex items-center gap-2 rounded-md border border-primary/40 bg-primary/5 p-2">
      <span className="inline-flex items-center gap-1 rounded-md bg-primary/15 px-2 py-1 text-[10px] font-semibold uppercase tracking-wider text-primary">
        <Icon className="h-3 w-3" />
        {target.plate} · {t(`admin.planning.days.${DAY_KEYS[target.dayIdx]}`)}{' '}
        · {t(`admin.planning.shift.${target.kind}`)}
      </span>
      <span className="hidden text-[10px] uppercase tracking-wider text-muted-foreground sm:inline">
        {t('admin.planning.assigning')}
      </span>
      <div className="flex min-w-0 flex-1 flex-wrap gap-1">
        {DRIVER_POOL.map((d) => (
          <button
            key={d}
            type="button"
            onClick={() => onPick(d)}
            className="inline-flex items-center rounded-md border border-border/40 bg-background/60 px-2 py-1 text-[10px] font-medium transition-colors hover:border-primary/50 hover:bg-primary/10 hover:text-primary"
          >
            {firstName(d)}
          </button>
        ))}
      </div>
      <button
        type="button"
        onClick={onClear}
        className="rounded-md border border-rose-500/30 bg-rose-500/10 px-2 py-1 text-[10px] font-semibold uppercase tracking-wider text-rose-300 transition-colors hover:bg-rose-500/15"
      >
        {t('admin.planning.clear')}
      </button>
      <button
        type="button"
        onClick={onCancel}
        aria-label={t('admin.planning.cancel')}
        className="inline-flex h-6 w-6 items-center justify-center rounded-md text-muted-foreground transition-colors hover:bg-accent/40 hover:text-foreground"
      >
        <X className="h-3.5 w-3.5" />
      </button>
    </div>
  )
}

function Pill({
  tone,
  label,
}: {
  tone: 'emerald' | 'amber'
  label: string
}) {
  const cls =
    tone === 'emerald'
      ? 'border-emerald-500/30 bg-emerald-500/10 text-emerald-300'
      : 'border-amber-400/30 bg-amber-400/10 text-amber-300'
  return (
    <span
      className={cn(
        'inline-flex items-center rounded-full border px-2 py-0.5 text-[9px] font-semibold uppercase tracking-wider',
        cls,
      )}
    >
      {label}
    </span>
  )
}

const SHIFT_TONE_PILL: Record<
  'amber' | 'indigo' | 'emerald' | 'rose',
  string
> = {
  amber:
    'border-amber-400/30 bg-amber-400/10 text-amber-300',
  indigo:
    'border-indigo-400/30 bg-indigo-400/10 text-indigo-300',
  emerald:
    'border-emerald-400/30 bg-emerald-400/10 text-emerald-300',
  rose: 'border-rose-400/30 bg-rose-400/10 text-rose-300',
}

/**
 * Reads the configured shift slots from context and renders a small
 * legend pill per slot — so the operator immediately sees what "Day"
 * and "Night" actually mean in their current setup, plus any custom
 * extra slots they've added.
 */
function ShiftLegend() {
  const { t } = useTranslation()
  const { shiftSlots } = useAdminApp()
  return (
    <div className="flex flex-wrap items-center gap-1">
      {shiftSlots.map((slot) => (
        <span
          key={slot.id}
          className={cn(
            'inline-flex items-center gap-1 rounded-full border px-2 py-0.5 text-[9px] font-semibold tabular-nums',
            SHIFT_TONE_PILL[slot.tone],
          )}
          title={t(`admin.settings.defaults.shiftLabels.${slot.id}`)}
        >
          <span className="uppercase tracking-wider">
            {slot.label ??
              t(`admin.settings.defaults.shiftLabels.${slot.id}`)}
          </span>
          <span className="opacity-80">
            {slot.start} → {slot.end}
          </span>
        </span>
      ))}
    </div>
  )
}
