import { useState } from 'react'
import {
  Building2,
  Camera,
  Check,
  ClockAlert,
  Fuel,
  Lock,
  RotateCcw,
  Save,
  Settings as SettingsIcon,
  Sparkles,
  Sun,
  Moon,
  Sparkle,
  TriangleAlert,
} from 'lucide-react'
import type { LucideIcon } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import { cn } from '@/lib/utils'
import { useAdminApp } from '../useAdminApp'

interface PlatformSetting {
  key: string
  label: string
  enabled: boolean
  pending?: boolean
  fixed?: boolean
}

type SplitChoice = '50_50' | 'driver_100'
type WorkFormula = 'FIFTY_FIFTY' | 'FLAT_RATE' | 'RENTAL'

interface SettingsState {
  companyName: string
  vatNumber: string
  address: string
  platforms: PlatformSetting[]
  carwashSplit: SplitChoice
  fuelSplit: SplitChoice
  defaultFormula: WorkFormula
  dayStart: string
  dayEnd: string
  nightStart: string
  nightEnd: string
}

const DEFAULTS: SettingsState = {
  companyName: 'Brussels Taxi Express',
  vatNumber: 'BE 0789.123.456',
  address: 'Avenue Louise 480, 1050 Bruxelles',
  platforms: [
    { key: 'uber', label: 'Uber', enabled: true },
    { key: 'bolt', label: 'Bolt', enabled: true },
    { key: 'heetch', label: 'Heetch', enabled: true },
    { key: 'taxivert', label: 'TaxiVert', enabled: true },
    { key: 'card', label: 'Carte bancaire', enabled: true },
    { key: 'cash', label: 'Cash', enabled: true, fixed: true },
  ],
  carwashSplit: '50_50',
  fuelSplit: '50_50',
  defaultFormula: 'FIFTY_FIFTY',
  dayStart: '06:00',
  dayEnd: '18:00',
  nightStart: '18:00',
  nightEnd: '06:00',
}

export function SettingsScreen() {
  const { t } = useTranslation()
  const { showDemoToast } = useAdminApp()
  const [s, setS] = useState<SettingsState>(DEFAULTS)
  const [dirty, setDirty] = useState(false)

  const update = (patch: Partial<SettingsState>) => {
    setS((cur) => ({ ...cur, ...patch }))
    setDirty(true)
  }

  const updatePlatform = (key: string, patch: Partial<PlatformSetting>) => {
    setS((cur) => ({
      ...cur,
      platforms: cur.platforms.map((p) =>
        p.key === key ? { ...p, ...patch } : p,
      ),
    }))
    setDirty(true)
  }

  const handleSave = () => {
    setS((cur) => ({
      ...cur,
      platforms: cur.platforms.map((p) => ({ ...p, pending: false })),
    }))
    setDirty(false)
    showDemoToast(t('admin.settings.toast.saved'))
  }

  const handleReset = () => {
    setS(DEFAULTS)
    setDirty(false)
    showDemoToast(t('admin.settings.toast.reset'))
  }

  const pendingCount = s.platforms.filter((p) => p.pending).length

  return (
    <div className="flex h-full flex-col">
      <header className="flex items-end justify-between gap-3 border-b border-border/40 px-4 py-3">
        <div>
          <h2 className="flex items-center gap-2 text-sm font-bold tracking-tight">
            <SettingsIcon className="h-4 w-4 text-primary" />
            {t('admin.settings.title')}
          </h2>
          <p className="mt-0.5 text-[11px] text-muted-foreground">
            {t('admin.settings.subtitle')}
          </p>
        </div>
        <div className="flex items-center gap-2">
          {dirty && (
            <span className="inline-flex items-center gap-1 rounded-full border border-amber-400/30 bg-amber-400/10 px-2 py-0.5 text-[9px] font-semibold uppercase tracking-wider text-amber-300">
              <ClockAlert className="h-3 w-3" />
              {t('admin.settings.unsaved')}
            </span>
          )}
          {pendingCount > 0 && (
            <span className="inline-flex items-center gap-1 rounded-full border border-primary/30 bg-primary/10 px-2 py-0.5 text-[9px] font-semibold uppercase tracking-wider text-primary">
              <TriangleAlert className="h-3 w-3" />
              {t('admin.settings.pendingValidation', { n: pendingCount })}
            </span>
          )}
        </div>
      </header>

      <div className="flex-1 space-y-3 overflow-y-auto p-4">
        <CompanySection
          state={s}
          update={update}
          onLogoClick={() =>
            showDemoToast(
              t('admin.demoToast.actionLocked', {
                action: t('admin.settings.company.uploadLogo'),
              }),
            )
          }
        />

        <PlatformsSection state={s} updatePlatform={updatePlatform} />

        <CostsSection
          state={s}
          onAttempt={() =>
            showDemoToast(t('admin.settings.costs.lockedToast'))
          }
        />

        <DefaultsSection state={s} update={update} />
      </div>

      <footer className="flex items-center justify-end gap-2 border-t border-border/40 bg-background/40 px-4 py-2">
        <button
          type="button"
          onClick={handleReset}
          disabled={!dirty}
          className={cn(
            'inline-flex items-center gap-1.5 rounded-md border border-border/40 px-3 py-1.5 text-[11px] font-semibold uppercase tracking-wider transition-colors',
            dirty
              ? 'text-muted-foreground hover:bg-accent/40 hover:text-foreground'
              : 'cursor-not-allowed text-muted-foreground/40',
          )}
        >
          <RotateCcw className="h-3 w-3" />
          {t('admin.settings.actions.cancel')}
        </button>
        <button
          type="button"
          onClick={handleSave}
          disabled={!dirty}
          className={cn(
            'inline-flex items-center gap-1.5 rounded-md px-3 py-1.5 text-[11px] font-semibold uppercase tracking-wider transition-all',
            dirty
              ? 'bg-primary text-primary-foreground shadow-glow hover:-translate-y-0.5 active:scale-[0.98]'
              : 'cursor-not-allowed bg-primary/30 text-primary-foreground/60',
          )}
        >
          <Save className="h-3 w-3" />
          {t('admin.settings.actions.save')}
        </button>
      </footer>
    </div>
  )
}

function SectionCard({
  Icon,
  title,
  children,
  trailing,
}: {
  Icon: LucideIcon
  title: string
  children: React.ReactNode
  trailing?: React.ReactNode
}) {
  return (
    <section className="rounded-md border border-border/40 bg-background/40">
      <header className="flex items-center justify-between gap-2 border-b border-border/40 px-3 py-2">
        <h3 className="flex items-center gap-2 text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
          <Icon className="h-3.5 w-3.5 text-primary" />
          {title}
        </h3>
        {trailing}
      </header>
      <div className="p-3">{children}</div>
    </section>
  )
}

function FieldLabel({ children }: { children: React.ReactNode }) {
  return (
    <label className="text-[10px] font-medium uppercase tracking-wider text-muted-foreground">
      {children}
    </label>
  )
}

function CompanySection({
  state,
  update,
  onLogoClick,
}: {
  state: SettingsState
  update: (patch: Partial<SettingsState>) => void
  onLogoClick: () => void
}) {
  const { t } = useTranslation()
  return (
    <SectionCard Icon={Building2} title={t('admin.settings.company.title')}>
      <div className="grid gap-3 sm:grid-cols-[80px_1fr]">
        <button
          type="button"
          onClick={onLogoClick}
          className="group relative flex h-16 w-16 items-center justify-center rounded-md border border-dashed border-border/60 bg-background/60 text-muted-foreground transition-colors hover:border-primary/50 hover:text-primary"
        >
          <Camera className="h-5 w-5" />
          <span className="absolute inset-x-0 -bottom-5 text-center text-[9px] uppercase tracking-wider text-muted-foreground/80">
            {t('admin.settings.company.logo')}
          </span>
        </button>

        <div className="space-y-2">
          <div>
            <FieldLabel>{t('admin.settings.company.name')}</FieldLabel>
            <input
              type="text"
              value={state.companyName}
              onChange={(e) => update({ companyName: e.target.value })}
              className="mt-0.5 w-full rounded-md border border-border/40 bg-background/60 px-2 py-1.5 text-[12px] font-medium text-foreground outline-none transition-colors focus:border-primary/60 focus:bg-background"
            />
          </div>
          <div className="grid grid-cols-2 gap-2">
            <div>
              <FieldLabel>{t('admin.settings.company.vat')}</FieldLabel>
              <input
                type="text"
                value={state.vatNumber}
                onChange={(e) => update({ vatNumber: e.target.value })}
                className="mt-0.5 w-full rounded-md border border-border/40 bg-background/60 px-2 py-1.5 text-[12px] tabular-nums text-foreground outline-none transition-colors focus:border-primary/60 focus:bg-background"
              />
            </div>
            <div>
              <FieldLabel>{t('admin.settings.company.address')}</FieldLabel>
              <input
                type="text"
                value={state.address}
                onChange={(e) => update({ address: e.target.value })}
                className="mt-0.5 w-full rounded-md border border-border/40 bg-background/60 px-2 py-1.5 text-[12px] text-foreground outline-none transition-colors focus:border-primary/60 focus:bg-background"
              />
            </div>
          </div>
        </div>
      </div>
    </SectionCard>
  )
}

function PlatformsSection({
  state,
  updatePlatform,
}: {
  state: SettingsState
  updatePlatform: (key: string, patch: Partial<PlatformSetting>) => void
}) {
  const { t } = useTranslation()
  return (
    <SectionCard
      Icon={Sparkle}
      title={t('admin.settings.platforms.title')}
      trailing={
        <span className="text-[9px] uppercase tracking-wider text-muted-foreground/80">
          {t('admin.settings.platforms.helper')}
        </span>
      }
    >
      <div className="mb-3 flex items-start gap-2 rounded-md border border-amber-400/30 bg-amber-400/[0.06] p-2.5">
        <TriangleAlert className="mt-0.5 h-3.5 w-3.5 shrink-0 text-amber-300" />
        <p className="text-[10px] leading-relaxed text-amber-200/90">
          {t('admin.settings.platforms.warning')}
        </p>
      </div>

      <ul className="space-y-1.5">
        {state.platforms.map((p) => (
          <PlatformRow
            key={p.key}
            platform={p}
            onToggle={() =>
              updatePlatform(p.key, { enabled: !p.enabled, pending: !p.fixed })
            }
          />
        ))}
      </ul>
    </SectionCard>
  )
}

function PlatformRow({
  platform,
  onToggle,
}: {
  platform: PlatformSetting
  onToggle: () => void
}) {
  const { t } = useTranslation()
  const isDisabled = !platform.enabled
  return (
    <li
      className={cn(
        'flex items-center gap-2 rounded-md border border-border/40 bg-background/40 px-2.5 py-1.5 transition-opacity',
        isDisabled && 'opacity-50',
      )}
    >
      <button
        type="button"
        onClick={onToggle}
        role="switch"
        aria-checked={platform.enabled}
        className={cn(
          'inline-flex h-4 w-7 shrink-0 items-center rounded-full p-0.5 transition-colors',
          platform.enabled ? 'bg-emerald-500' : 'bg-zinc-700',
        )}
      >
        <span
          aria-hidden
          className={cn(
            'h-3 w-3 rounded-full bg-white shadow-sm transition-transform',
            platform.enabled ? 'translate-x-3' : 'translate-x-0',
          )}
        />
      </button>

      <span className="min-w-0 flex-1 text-[11px] font-semibold tracking-tight">
        {platform.label}
      </span>

      <span
        className={cn(
          'inline-flex w-[88px] shrink-0 items-center justify-center gap-1 rounded-full px-1.5 py-0.5 text-[8px] font-semibold uppercase tracking-wider',
          platform.fixed
            ? 'border border-zinc-500/30 bg-zinc-500/10 text-muted-foreground'
            : isDisabled
              ? 'border border-zinc-500/30 bg-zinc-500/10 text-muted-foreground'
              : platform.pending
                ? 'border border-amber-400/40 bg-amber-400/10 text-amber-300'
                : 'border border-emerald-500/30 bg-emerald-500/10 text-emerald-300',
        )}
      >
        {platform.fixed ? (
          <>
            <Lock className="h-2.5 w-2.5" />
            {t('admin.settings.platforms.status.fixed')}
          </>
        ) : isDisabled ? (
          t('admin.settings.platforms.status.disabled')
        ) : platform.pending ? (
          <>
            <ClockAlert className="h-2.5 w-2.5" />
            {t('admin.settings.platforms.status.pending')}
          </>
        ) : (
          <>
            <Check className="h-2.5 w-2.5" />
            {t('admin.settings.platforms.status.approved')}
          </>
        )}
      </span>
    </li>
  )
}

function CostsSection({
  state,
  onAttempt,
}: {
  state: SettingsState
  onAttempt: () => void
}) {
  const { t } = useTranslation()
  return (
    <SectionCard
      Icon={Fuel}
      title={t('admin.settings.costs.title')}
      trailing={
        <span className="inline-flex items-center gap-1 rounded-full border border-zinc-500/30 bg-zinc-500/10 px-1.5 py-0.5 text-[9px] font-semibold uppercase tracking-wider text-muted-foreground">
          <Lock className="h-2.5 w-2.5" />
          {t('admin.settings.costs.lockedBadge')}
        </span>
      }
    >
      <p className="mb-2 text-[10px] text-muted-foreground">
        {t('admin.settings.costs.description')}
      </p>

      <div className="grid gap-2 sm:grid-cols-2">
        <SplitRow
          Icon={Sparkles}
          label={t('admin.settings.costs.carwash')}
          value={state.carwashSplit}
          onAttempt={onAttempt}
        />
        <SplitRow
          Icon={Fuel}
          label={t('admin.settings.costs.fuel')}
          value={state.fuelSplit}
          onAttempt={onAttempt}
        />
      </div>
    </SectionCard>
  )
}

function SplitRow({
  Icon,
  label,
  value,
  onAttempt,
}: {
  Icon: LucideIcon
  label: string
  value: SplitChoice
  onAttempt: () => void
}) {
  const { t } = useTranslation()
  const options: { id: SplitChoice; key: string }[] = [
    { id: '50_50', key: 'split50' },
    { id: 'driver_100', key: 'driverFull' },
  ]
  return (
    <div className="rounded-md border border-border/40 bg-background/30 p-2 opacity-70">
      <p className="mb-1.5 flex items-center gap-1 text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
        <Icon className="h-3 w-3" />
        {label}
      </p>
      <div className="grid grid-cols-2 gap-1">
        {options.map((o) => {
          const active = o.id === value
          return (
            <button
              key={o.id}
              type="button"
              onClick={onAttempt}
              className={cn(
                'cursor-not-allowed rounded-md px-2 py-1 text-[10px] font-medium transition-colors',
                active
                  ? 'bg-primary/15 text-primary ring-1 ring-primary/30'
                  : 'bg-background/40 text-muted-foreground',
              )}
            >
              {t(`admin.settings.costs.${o.key}`)}
            </button>
          )
        })}
      </div>
    </div>
  )
}

function DefaultsSection({
  state,
  update,
}: {
  state: SettingsState
  update: (patch: Partial<SettingsState>) => void
}) {
  const { t } = useTranslation()
  const formulas: WorkFormula[] = ['FIFTY_FIFTY', 'FLAT_RATE', 'RENTAL']

  return (
    <SectionCard Icon={SettingsIcon} title={t('admin.settings.defaults.title')}>
      <div className="space-y-3">
        <div>
          <FieldLabel>{t('admin.settings.defaults.formula')}</FieldLabel>
          <div className="mt-1 grid grid-cols-3 gap-1">
            {formulas.map((f) => {
              const active = f === state.defaultFormula
              return (
                <button
                  key={f}
                  type="button"
                  onClick={() => update({ defaultFormula: f })}
                  className={cn(
                    'rounded-md border px-2 py-1.5 text-[10px] font-semibold uppercase tracking-wider transition-colors',
                    active
                      ? 'border-primary/40 bg-primary/15 text-primary'
                      : 'border-border/40 bg-background/40 text-muted-foreground hover:border-border/60 hover:text-foreground',
                  )}
                >
                  {t(`admin.settings.defaults.formulas.${f}`)}
                </button>
              )
            })}
          </div>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <ShiftRange
            Icon={Sun}
            label={t('admin.settings.defaults.dayShift')}
            startValue={state.dayStart}
            endValue={state.dayEnd}
            onStart={(v) => update({ dayStart: v })}
            onEnd={(v) => update({ dayEnd: v })}
          />
          <ShiftRange
            Icon={Moon}
            label={t('admin.settings.defaults.nightShift')}
            startValue={state.nightStart}
            endValue={state.nightEnd}
            onStart={(v) => update({ nightStart: v })}
            onEnd={(v) => update({ nightEnd: v })}
          />
        </div>
      </div>
    </SectionCard>
  )
}

function ShiftRange({
  Icon,
  label,
  startValue,
  endValue,
  onStart,
  onEnd,
}: {
  Icon: LucideIcon
  label: string
  startValue: string
  endValue: string
  onStart: (v: string) => void
  onEnd: (v: string) => void
}) {
  return (
    <div>
      <p className="flex items-center gap-1 text-[10px] font-medium uppercase tracking-wider text-muted-foreground">
        <Icon className="h-3 w-3" />
        {label}
      </p>
      <div className="mt-1 flex items-center gap-1">
        <input
          type="time"
          value={startValue}
          onChange={(e) => onStart(e.target.value)}
          className="flex-1 rounded-md border border-border/40 bg-background/60 px-1.5 py-1 text-[11px] tabular-nums outline-none transition-colors focus:border-primary/60 focus:bg-background"
        />
        <span className="text-muted-foreground">→</span>
        <input
          type="time"
          value={endValue}
          onChange={(e) => onEnd(e.target.value)}
          className="flex-1 rounded-md border border-border/40 bg-background/60 px-1.5 py-1 text-[11px] tabular-nums outline-none transition-colors focus:border-primary/60 focus:bg-background"
        />
      </div>
    </div>
  )
}
