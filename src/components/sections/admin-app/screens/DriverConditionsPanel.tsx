import { useEffect, useMemo, useState } from 'react'
import { AnimatePresence } from 'framer-motion'
import {
  Banknote,
  Bell,
  BellOff,
  CheckCircle2,
  Clock,
  Save,
  X,
} from 'lucide-react'
import { useTranslation } from 'react-i18next'
import { cn } from '@/lib/utils'
import { ModalShell } from '../parts/ModalShell'
import { Avatar } from '../parts/Avatar'
import { useAdminApp } from '../useAdminApp'
import type {
  CompensationMode,
  DriverConditions,
  DriverRow,
  FlatPeriod,
  OvertimePolicy,
  PlatformComp,
  PlatformKey,
} from '../types'

const PLATFORMS: PlatformKey[] = ['uber', 'bolt', 'heetch', 'taxivert', 'cash']

const PLATFORM_LABEL: Record<PlatformKey, string> = {
  uber: 'Uber',
  bolt: 'Bolt',
  heetch: 'Heetch',
  taxivert: 'TaxiVert',
  cash: 'Cash',
}

function defaultPlatform(p: PlatformKey): PlatformComp {
  return {
    platform: p,
    // Cash is hidden from the formula list (always 100% to driver, no platform fee).
    // Default the rest enabled so a fresh driver inherits the typical setup.
    enabled: p !== 'taxivert',
    mode: 'percentage',
    driverShare: 50,
    flatAmount: 350,
    flatPeriod: 'week',
  }
}

function defaultConditions(driverId: string): DriverConditions {
  return {
    driverId,
    platforms: PLATFORMS.map(defaultPlatform),
    contractedHoursPerWeek: 38,
    overtimePolicy: 'declared',
  }
}

interface Props {
  driver: DriverRow | null
  onClose: () => void
}

/**
 * Per-driver compensation panel. Operator picks which platforms the driver
 * works on, sets a percentage split (50/50, 60/40, …) or a flat forfait per
 * day/week/month, declares a contractual hour ceiling, and chooses how
 * Cabs notifies the driver about overtime (push to their app vs. silent /
 * dashboard-only).
 */
export function DriverConditionsPanel({ driver, onClose }: Props) {
  return (
    <AnimatePresence>
      {driver && <DriverConditionsContent driver={driver} onClose={onClose} />}
    </AnimatePresence>
  )
}

function DriverConditionsContent({
  driver,
  onClose,
}: {
  driver: DriverRow
  onClose: () => void
}) {
  const { t } = useTranslation()
  const { showDemoToast } = useAdminApp()
  const [state, setState] = useState<DriverConditions>(() =>
    defaultConditions(driver.id),
  )

  // Reset whenever the panel opens for a different driver. Keeps the form
  // local to the modal — no global persistence needed for the demo.
  useEffect(() => {
    setState(defaultConditions(driver.id))
  }, [driver.id])

  const updatePlatform = (
    p: PlatformKey,
    patch: Partial<Omit<PlatformComp, 'platform'>>,
  ) => {
    setState((cur) => ({
      ...cur,
      platforms: cur.platforms.map((pl) =>
        pl.platform === p ? { ...pl, ...patch } : pl,
      ),
    }))
  }

  const handleSave = () => {
    showDemoToast(
      t('admin.driverConditions.saveToast', {
        name: `${driver.firstName} ${driver.lastName}`.trim(),
      }),
    )
    onClose()
  }

  const enabledPlatforms = useMemo(
    () => state.platforms.filter((p) => p.enabled),
    [state.platforms],
  )

  return (
    <ModalShell
      ariaLabel={t('admin.driverConditions.title')}
      onClose={onClose}
    >
      <header className="flex items-center justify-between gap-3 border-b border-border/40 px-4 py-3">
        <div className="flex min-w-0 items-center gap-2.5">
          <Avatar
            initials={driver.initials}
            hue={driver.avatarHue}
            size="md"
          />
          <div className="min-w-0">
            <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-muted-foreground">
              {t('admin.driverConditions.eyebrow')}
            </p>
            <h2 className="truncate text-sm font-bold tracking-tight">
              {driver.firstName} {driver.lastName}
            </h2>
          </div>
        </div>
        <button
          type="button"
          onClick={onClose}
          aria-label={t('common.close')}
          className="inline-flex h-7 w-7 shrink-0 items-center justify-center rounded-md text-muted-foreground transition-colors hover:bg-accent/40 hover:text-foreground"
        >
          <X className="h-4 w-4" />
        </button>
      </header>

      <div className="flex-1 overflow-y-auto">
        <div className="space-y-4 p-4">
          {/* Section 1 — assigned platforms */}
          <Section
            title={t('admin.driverConditions.platforms.title')}
            description={t('admin.driverConditions.platforms.description')}
          >
            <div className="grid grid-cols-2 gap-1.5 sm:grid-cols-3">
              {state.platforms.map((p) => (
                <PlatformToggle
                  key={p.platform}
                  platform={p}
                  onToggle={() =>
                    updatePlatform(p.platform, { enabled: !p.enabled })
                  }
                />
              ))}
            </div>
          </Section>

          {/* Section 2 — per-platform compensation */}
          <Section
            title={t('admin.driverConditions.formula.title')}
            description={t('admin.driverConditions.formula.description')}
          >
            {enabledPlatforms.length === 0 ? (
              <p className="rounded-md border border-dashed border-border/60 bg-background/40 px-3 py-4 text-center text-[11px] text-muted-foreground">
                {t('admin.driverConditions.formula.empty')}
              </p>
            ) : (
              <div className="space-y-2">
                {enabledPlatforms.map((p) => (
                  <PlatformFormula
                    key={p.platform}
                    platform={p}
                    onChange={(patch) => updatePlatform(p.platform, patch)}
                  />
                ))}
              </div>
            )}
          </Section>

          {/* Section 3 — contracted hours */}
          <Section
            title={t('admin.driverConditions.contract.title')}
            description={t('admin.driverConditions.contract.description')}
          >
            <div className="flex items-center gap-2 rounded-md border border-border/40 bg-background/40 px-3 py-2">
              <Clock className="h-4 w-4 shrink-0 text-primary" />
              <input
                type="number"
                min={1}
                max={60}
                step={1}
                value={state.contractedHoursPerWeek}
                onChange={(e) =>
                  setState((cur) => ({
                    ...cur,
                    contractedHoursPerWeek: Math.max(
                      1,
                      Math.min(60, Number(e.target.value) || 0),
                    ),
                  }))
                }
                className="w-16 rounded-md border border-border/40 bg-background/60 px-2 py-1 text-right text-sm font-semibold tabular-nums outline-none focus:border-primary/60"
              />
              <span className="text-[11px] text-muted-foreground">
                {t('admin.driverConditions.contract.unit')}
              </span>
            </div>
          </Section>

          {/* Section 4 — overtime alerts */}
          <Section
            title={t('admin.driverConditions.overtime.title')}
            description={t('admin.driverConditions.overtime.description')}
          >
            <div className="space-y-1.5">
              <OvertimeOption
                value="declared"
                active={state.overtimePolicy === 'declared'}
                Icon={Bell}
                tone="emerald"
                title={t('admin.driverConditions.overtime.declared.title')}
                hint={t('admin.driverConditions.overtime.declared.hint')}
                onSelect={() =>
                  setState((cur) => ({ ...cur, overtimePolicy: 'declared' }))
                }
              />
              <OvertimeOption
                value="silent"
                active={state.overtimePolicy === 'silent'}
                Icon={BellOff}
                tone="zinc"
                title={t('admin.driverConditions.overtime.silent.title')}
                hint={t('admin.driverConditions.overtime.silent.hint')}
                onSelect={() =>
                  setState((cur) => ({ ...cur, overtimePolicy: 'silent' }))
                }
              />
            </div>
          </Section>
        </div>
      </div>

      <footer className="flex items-center justify-end gap-2 border-t border-border/40 bg-background/40 px-4 py-2.5">
        <button
          type="button"
          onClick={onClose}
          className="rounded-md px-3 py-1.5 text-[11px] font-semibold text-muted-foreground transition-colors hover:bg-accent/40 hover:text-foreground"
        >
          {t('admin.driverConditions.cancel')}
        </button>
        <button
          type="button"
          onClick={handleSave}
          className="inline-flex items-center gap-1.5 rounded-md bg-primary px-3 py-1.5 text-[11px] font-semibold uppercase tracking-wider text-primary-foreground shadow-glow transition-transform hover:-translate-y-0.5 active:scale-[0.98]"
        >
          <Save className="h-3 w-3" />
          {t('admin.driverConditions.save')}
        </button>
      </footer>
    </ModalShell>
  )
}

// ── Section wrapper ───────────────────────────────────────────────────

function Section({
  title,
  description,
  children,
}: {
  title: string
  description?: string
  children: React.ReactNode
}) {
  return (
    <section className="space-y-2">
      <div>
        <h3 className="text-xs font-bold tracking-tight">{title}</h3>
        {description && (
          <p className="mt-0.5 text-[10px] leading-snug text-muted-foreground">
            {description}
          </p>
        )}
      </div>
      {children}
    </section>
  )
}

// ── Section 1 — toggle ────────────────────────────────────────────────

function PlatformToggle({
  platform,
  onToggle,
}: {
  platform: PlatformComp
  onToggle: () => void
}) {
  return (
    <button
      type="button"
      onClick={onToggle}
      role="switch"
      aria-checked={platform.enabled}
      className={cn(
        'flex items-center justify-between gap-2 rounded-md border px-2.5 py-1.5 text-left transition-all',
        platform.enabled
          ? 'border-emerald-500/40 bg-emerald-500/[0.06] text-emerald-200'
          : 'border-border/40 bg-background/40 text-muted-foreground hover:border-border/60',
      )}
    >
      <span className="text-[11px] font-semibold tracking-tight">
        {PLATFORM_LABEL[platform.platform]}
      </span>
      <span
        className={cn(
          'inline-flex h-3.5 w-6 shrink-0 items-center rounded-full p-0.5 transition-colors',
          platform.enabled ? 'bg-emerald-500' : 'bg-zinc-700',
        )}
      >
        <span
          aria-hidden
          className={cn(
            'h-2.5 w-2.5 rounded-full bg-white shadow-sm transition-transform',
            platform.enabled ? 'translate-x-2.5' : 'translate-x-0',
          )}
        />
      </span>
    </button>
  )
}

// ── Section 2 — per-platform formula ──────────────────────────────────

const FLAT_PERIODS: FlatPeriod[] = ['day', 'week', 'month']

function PlatformFormula({
  platform,
  onChange,
}: {
  platform: PlatformComp
  onChange: (patch: Partial<Omit<PlatformComp, 'platform'>>) => void
}) {
  const { t } = useTranslation()
  return (
    <div className="rounded-md border border-border/40 bg-background/40 p-3">
      <div className="flex items-center justify-between gap-2">
        <span className="inline-flex items-center gap-1.5 text-[11px] font-bold tracking-tight">
          {PLATFORM_LABEL[platform.platform]}
        </span>
        <div className="inline-flex rounded-md bg-background/60 p-0.5 ring-1 ring-border/40">
          <ModeButton
            active={platform.mode === 'percentage'}
            onClick={() => onChange({ mode: 'percentage' })}
          >
            {t('admin.driverConditions.formula.modes.percentage')}
          </ModeButton>
          <ModeButton
            active={platform.mode === 'flat'}
            onClick={() => onChange({ mode: 'flat' })}
          >
            {t('admin.driverConditions.formula.modes.flat')}
          </ModeButton>
        </div>
      </div>

      {platform.mode === 'percentage' ? (
        <PercentageBody
          driverShare={platform.driverShare}
          onChange={(v) => onChange({ driverShare: v })}
        />
      ) : (
        <FlatBody
          amount={platform.flatAmount}
          period={platform.flatPeriod}
          onAmount={(v) => onChange({ flatAmount: v })}
          onPeriod={(v) => onChange({ flatPeriod: v })}
        />
      )}
    </div>
  )
}

function ModeButton({
  active,
  onClick,
  children,
}: {
  active: boolean
  onClick: () => void
  children: React.ReactNode
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={active}
      className={cn(
        'rounded-[5px] px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider transition-colors',
        active
          ? 'bg-primary text-primary-foreground shadow-sm'
          : 'text-muted-foreground hover:text-foreground',
      )}
    >
      {children}
    </button>
  )
}

function PercentageBody({
  driverShare,
  onChange,
}: {
  driverShare: number
  onChange: (v: number) => void
}) {
  const { t } = useTranslation()
  return (
    <div className="mt-2.5 space-y-2">
      <div className="grid grid-cols-2 gap-2">
        <SharePill
          label={t('admin.driverConditions.formula.driverShare')}
          value={driverShare}
          tone="primary"
        />
        <SharePill
          label={t('admin.driverConditions.formula.operatorShare')}
          value={100 - driverShare}
          tone="zinc"
        />
      </div>
      <input
        type="range"
        min={0}
        max={100}
        step={5}
        value={driverShare}
        onChange={(e) => onChange(Number(e.target.value))}
        aria-label={t('admin.driverConditions.formula.driverShare')}
        className="h-1.5 w-full cursor-pointer appearance-none rounded-full bg-muted accent-primary"
      />
      <div className="flex flex-wrap gap-1">
        {[40, 50, 55, 60, 70].map((p) => (
          <button
            key={p}
            type="button"
            onClick={() => onChange(p)}
            className={cn(
              'rounded-md px-1.5 py-0.5 text-[10px] font-semibold transition-colors',
              driverShare === p
                ? 'bg-primary/15 text-primary ring-1 ring-primary/30'
                : 'text-muted-foreground hover:bg-accent/40 hover:text-foreground',
            )}
          >
            {p}/{100 - p}
          </button>
        ))}
      </div>
    </div>
  )
}

function SharePill({
  label,
  value,
  tone,
}: {
  label: string
  value: number
  tone: 'primary' | 'zinc'
}) {
  return (
    <div
      className={cn(
        'rounded-md border bg-background/40 px-2.5 py-1.5',
        tone === 'primary'
          ? 'border-primary/30'
          : 'border-border/40',
      )}
    >
      <p className="text-[9px] font-semibold uppercase tracking-wider text-muted-foreground">
        {label}
      </p>
      <p
        className={cn(
          'mt-0.5 text-base font-extrabold tabular-nums',
          tone === 'primary' ? 'text-primary' : 'text-foreground',
        )}
      >
        {value}%
      </p>
    </div>
  )
}

function FlatBody({
  amount,
  period,
  onAmount,
  onPeriod,
}: {
  amount: number
  period: FlatPeriod
  onAmount: (v: number) => void
  onPeriod: (v: FlatPeriod) => void
}) {
  const { t } = useTranslation()
  return (
    <div className="mt-2.5 grid grid-cols-[1fr_auto] gap-2">
      <div className="flex items-center gap-1.5 rounded-md border border-border/40 bg-background/60 px-2.5 py-1.5">
        <Banknote className="h-3.5 w-3.5 shrink-0 text-amber-300" />
        <input
          type="number"
          min={0}
          step={10}
          value={amount}
          onChange={(e) => onAmount(Math.max(0, Number(e.target.value) || 0))}
          aria-label={t('admin.driverConditions.formula.flatAmount')}
          className="w-full bg-transparent text-sm font-bold tabular-nums outline-none"
        />
        <span className="text-xs font-semibold text-muted-foreground">€</span>
      </div>
      <div className="inline-flex rounded-md bg-background/60 p-0.5 ring-1 ring-border/40">
        {FLAT_PERIODS.map((p) => (
          <button
            key={p}
            type="button"
            onClick={() => onPeriod(p)}
            aria-pressed={period === p}
            className={cn(
              'rounded-[5px] px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider transition-colors',
              period === p
                ? 'bg-primary text-primary-foreground shadow-sm'
                : 'text-muted-foreground hover:text-foreground',
            )}
          >
            {t(`admin.driverConditions.formula.periods.${p}`)}
          </button>
        ))}
      </div>
    </div>
  )
}

// ── Section 4 — overtime policy ───────────────────────────────────────

function OvertimeOption({
  active,
  Icon,
  tone,
  title,
  hint,
  onSelect,
}: {
  value: OvertimePolicy
  active: boolean
  Icon: typeof Bell
  tone: 'emerald' | 'zinc'
  title: string
  hint: string
  onSelect: () => void
}) {
  const activeBorder =
    tone === 'emerald'
      ? 'border-emerald-500/40 bg-emerald-500/[0.06]'
      : 'border-zinc-500/40 bg-zinc-500/[0.06]'
  const iconClass =
    tone === 'emerald'
      ? 'bg-emerald-500/15 text-emerald-300 ring-emerald-500/30'
      : 'bg-zinc-500/15 text-zinc-400 ring-zinc-500/30'
  const checkColor =
    tone === 'emerald' ? 'text-emerald-400' : 'text-zinc-400'
  return (
    <button
      type="button"
      onClick={onSelect}
      aria-pressed={active}
      className={cn(
        'flex w-full items-start gap-3 rounded-md border bg-background/40 px-3 py-2 text-left transition-all',
        active ? activeBorder : 'border-border/40 hover:border-border/60',
      )}
    >
      <span
        className={cn(
          'flex h-7 w-7 shrink-0 items-center justify-center rounded-md ring-1',
          iconClass,
        )}
      >
        <Icon className="h-3.5 w-3.5" />
      </span>
      <div className="min-w-0 flex-1">
        <p className="text-[11px] font-semibold tracking-tight">{title}</p>
        <p className="mt-0.5 text-[10px] leading-snug text-muted-foreground">
          {hint}
        </p>
      </div>
      {active && (
        <CheckCircle2
          className={cn('h-4 w-4 shrink-0', checkColor)}
        />
      )}
    </button>
  )
}

const _typeAssertion: CompensationMode = 'percentage'
void _typeAssertion
