import { useState, type FormEvent } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import {
  CarFront,
  CheckCircle2,
  Cog,
  FileText,
  Gauge,
  X,
} from 'lucide-react'
import { useTranslation } from 'react-i18next'
import { ModalShell } from '../parts/ModalShell'
import { useAdminApp } from '../useAdminApp'
import type {
  TransmissionApi,
  VehicleFormPayload,
  VehicleStateApi,
} from '../types'
import { cn } from '@/lib/utils'

const TRANSMISSIONS: TransmissionApi[] = ['MANUAL', 'AUTOMATIC']
const STATES: VehicleStateApi[] = [
  'IN_SERVICE',
  'GOOD_CONDITION',
  'MAINTENANCE',
  'REPAIR',
  'OUT_OF_SERVICE',
]

const INITIAL_PAYLOAD: VehicleFormPayload = {
  licensePlate: '',
  brand: '',
  model: '',
  transmission: 'MANUAL',
  odometerKm: 0,
  available: true,
  activeInShift: false,
  state: 'IN_SERVICE',
  condition: '',
}

interface AddVehiclePanelProps {
  open: boolean
  onClose: () => void
}

export function AddVehiclePanel({ open, onClose }: AddVehiclePanelProps) {
  const { t } = useTranslation()
  const { addVehicle } = useAdminApp()
  const [payload, setPayload] = useState<VehicleFormPayload>(INITIAL_PAYLOAD)
  const [showJson, setShowJson] = useState(false)
  const [submitted, setSubmitted] = useState(false)

  const update = <K extends keyof VehicleFormPayload>(
    key: K,
    value: VehicleFormPayload[K],
  ) => setPayload((p) => ({ ...p, [key]: value }))

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault()
    addVehicle(payload)
    setSubmitted(true)
    window.setTimeout(() => {
      setSubmitted(false)
      setPayload(INITIAL_PAYLOAD)
      onClose()
    }, 1400)
  }

  return (
    <AnimatePresence>
      {open && (
        <ModalShell ariaLabel={t('admin.addVehicle.title')} onClose={onClose}>
          <>
            <header className="flex items-center justify-between border-b border-border/40 px-4 py-2.5">
              <div>
                <p className="text-xs font-semibold tracking-tight">
                  {t('admin.addVehicle.title')}
                </p>
                <p className="text-[10px] text-muted-foreground">
                  {t('admin.addVehicle.subtitle')}
                </p>
              </div>
              <div className="flex items-center gap-1">
                <button
                  type="button"
                  onClick={() => setShowJson((v) => !v)}
                  className={cn(
                    'rounded px-2 py-1 text-[10px] font-medium transition-colors',
                    showJson
                      ? 'bg-primary/15 text-primary'
                      : 'text-muted-foreground hover:bg-accent/40 hover:text-foreground',
                  )}
                >
                  {t('admin.addDriver.toggleJson')}
                </button>
                <button
                  type="button"
                  onClick={onClose}
                  aria-label={t('common.close')}
                  className="inline-flex h-7 w-7 items-center justify-center rounded-md text-muted-foreground hover:bg-accent/40 hover:text-foreground"
                >
                  <X className="h-3.5 w-3.5" />
                </button>
              </div>
            </header>

            {submitted ? (
              <SuccessOverlay
                plate={payload.licensePlate || '—'}
                model={`${payload.brand} ${payload.model}`.trim() || '—'}
              />
            ) : showJson ? (
              <JsonPreview payload={payload} />
            ) : (
              <form onSubmit={handleSubmit} className="flex flex-1 flex-col overflow-hidden">
                <div className="flex-1 space-y-4 overflow-y-auto p-4">
                  <Section
                    Icon={CarFront}
                    title={t('admin.addVehicle.sections.identification')}
                  >
                    <Field label={t('admin.addVehicle.fields.licensePlate')}>
                      <Input
                        value={payload.licensePlate}
                        onChange={(v) => update('licensePlate', v.toUpperCase())}
                        placeholder="RET-471"
                        mono
                        required
                      />
                    </Field>
                    <div className="grid grid-cols-2 gap-2">
                      <Field label={t('admin.addVehicle.fields.brand')}>
                        <Input
                          value={payload.brand}
                          onChange={(v) => update('brand', v)}
                          placeholder="Citroen"
                          required
                        />
                      </Field>
                      <Field label={t('admin.addVehicle.fields.model')}>
                        <Input
                          value={payload.model}
                          onChange={(v) => update('model', v)}
                          placeholder="C2"
                          required
                        />
                      </Field>
                    </div>
                  </Section>

                  <Section
                    Icon={Cog}
                    title={t('admin.addVehicle.sections.mechanics')}
                  >
                    <Field label={t('admin.addVehicle.fields.transmission')}>
                      <ChipGroup
                        value={payload.transmission}
                        options={TRANSMISSIONS}
                        onChange={(v) => update('transmission', v as TransmissionApi)}
                        labelKey="admin.addVehicle.transmission"
                      />
                    </Field>
                    <Field label={t('admin.addVehicle.fields.odometerKm')}>
                      <div className="relative">
                        <Gauge
                          aria-hidden
                          className="pointer-events-none absolute left-2 top-1/2 h-3 w-3 -translate-y-1/2 text-muted-foreground"
                        />
                        <input
                          type="number"
                          min={0}
                          step={1}
                          value={payload.odometerKm}
                          onChange={(e) =>
                            update('odometerKm', Number(e.target.value) || 0)
                          }
                          placeholder="100"
                          required
                          className="w-full rounded-md border border-border/60 bg-background/40 py-1.5 pl-7 pr-2 text-[11px] font-mono placeholder:text-muted-foreground/50 focus:border-primary/60 focus:outline-none focus:ring-1 focus:ring-primary/40"
                        />
                        <span className="pointer-events-none absolute right-2 top-1/2 -translate-y-1/2 text-[10px] text-muted-foreground">
                          km
                        </span>
                      </div>
                    </Field>
                  </Section>

                  <Section
                    Icon={FileText}
                    title={t('admin.addVehicle.sections.state')}
                  >
                    <Field label={t('admin.addVehicle.fields.state')}>
                      <ChipGroup
                        value={payload.state}
                        options={STATES}
                        onChange={(v) => update('state', v as VehicleStateApi)}
                        labelKey="admin.addVehicle.state"
                      />
                    </Field>
                    <Field label={t('admin.addVehicle.fields.condition')}>
                      <Input
                        value={payload.condition}
                        onChange={(v) => update('condition', v)}
                        placeholder={t('admin.addVehicle.fields.conditionPlaceholder')}
                      />
                    </Field>
                    <div className="grid grid-cols-2 gap-2">
                      <Toggle
                        label={t('admin.addVehicle.fields.available')}
                        value={payload.available}
                        onChange={(v) => update('available', v)}
                      />
                      <Toggle
                        label={t('admin.addVehicle.fields.activeInShift')}
                        value={payload.activeInShift}
                        onChange={(v) => update('activeInShift', v)}
                      />
                    </div>
                  </Section>
                </div>

                <footer className="flex items-center justify-between gap-2 border-t border-border/40 bg-card/80 px-4 py-2.5 backdrop-blur">
                  <p className="text-[10px] text-muted-foreground">
                    {t('admin.addDriver.footerHint')}
                  </p>
                  <div className="flex items-center gap-1.5">
                    <button
                      type="button"
                      onClick={onClose}
                      className="inline-flex h-7 items-center rounded-md border border-border/60 bg-background/40 px-3 text-[10px] font-medium text-muted-foreground hover:text-foreground"
                    >
                      {t('admin.addDriver.cancel')}
                    </button>
                    <button
                      type="submit"
                      className="inline-flex h-7 items-center gap-1.5 rounded-md bg-primary px-3 text-[10px] font-semibold text-primary-foreground hover:opacity-95"
                    >
                      <CheckCircle2 className="h-3 w-3" />
                      {t('admin.addVehicle.save')}
                    </button>
                  </div>
                </footer>
              </form>
            )}
          </>
        </ModalShell>
      )}
    </AnimatePresence>
  )
}

interface SectionProps {
  Icon: typeof CarFront
  title: string
  children: React.ReactNode
}

function Section({ Icon, title, children }: SectionProps) {
  return (
    <section className="space-y-2">
      <div className="flex items-center gap-1.5">
        <span className="inline-flex h-5 w-5 items-center justify-center rounded-md bg-primary/10 text-primary">
          <Icon className="h-3 w-3" />
        </span>
        <h3 className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
          {title}
        </h3>
      </div>
      <div className="space-y-2">{children}</div>
    </section>
  )
}

function Field({
  label,
  children,
}: {
  label: string
  children: React.ReactNode
}) {
  return (
    <label className="block">
      <span className="mb-1 block text-[9px] font-medium uppercase tracking-wider text-muted-foreground/80">
        {label}
      </span>
      {children}
    </label>
  )
}

interface InputProps {
  value: string
  onChange: (v: string) => void
  placeholder?: string
  required?: boolean
  mono?: boolean
}

function Input({ value, onChange, placeholder, required, mono }: InputProps) {
  return (
    <input
      type="text"
      value={value}
      onChange={(e) => onChange(e.target.value)}
      placeholder={placeholder}
      required={required}
      className={cn(
        'w-full rounded-md border border-border/60 bg-background/40 px-2 py-1.5 text-[11px] placeholder:text-muted-foreground/50 focus:border-primary/60 focus:outline-none focus:ring-1 focus:ring-primary/40',
        mono && 'font-mono',
      )}
    />
  )
}

function Toggle({
  label,
  value,
  onChange,
}: {
  label: string
  value: boolean
  onChange: (v: boolean) => void
}) {
  return (
    <button
      type="button"
      onClick={() => onChange(!value)}
      aria-pressed={value}
      className={cn(
        'flex items-center justify-between gap-2 rounded-md border px-2.5 py-1.5 text-left text-[10px] font-medium transition-colors',
        value
          ? 'border-primary/40 bg-primary/10 text-foreground'
          : 'border-border/60 bg-background/40 text-muted-foreground hover:text-foreground',
      )}
    >
      <span>{label}</span>
      <span
        className={cn(
          'relative inline-flex h-3.5 w-7 shrink-0 rounded-full transition-colors',
          value ? 'bg-primary' : 'bg-zinc-600',
        )}
      >
        <span
          className={cn(
            'absolute top-0.5 h-2.5 w-2.5 rounded-full bg-white transition-all',
            value ? 'left-3.5' : 'left-0.5',
          )}
        />
      </span>
    </button>
  )
}

interface ChipGroupProps<T extends string> {
  value: T
  options: T[]
  onChange: (v: T) => void
  labelKey: string
}

function ChipGroup<T extends string>({
  value,
  options,
  onChange,
  labelKey,
}: ChipGroupProps<T>) {
  const { t } = useTranslation()
  return (
    <div className="flex flex-wrap gap-1">
      {options.map((opt) => {
        const active = opt === value
        return (
          <button
            key={opt}
            type="button"
            onClick={() => onChange(opt)}
            aria-pressed={active}
            className={cn(
              'inline-flex items-center rounded-full px-2.5 py-1 text-[10px] font-medium transition-colors',
              active
                ? 'bg-primary text-primary-foreground'
                : 'bg-background/40 text-muted-foreground ring-1 ring-border/60 hover:text-foreground',
            )}
          >
            {t(`${labelKey}.${opt}`)}
          </button>
        )
      })}
    </div>
  )
}

function JsonPreview({ payload }: { payload: VehicleFormPayload }) {
  return (
    <div className="flex-1 overflow-auto bg-zinc-950 p-3 font-mono text-[10px] leading-relaxed text-zinc-200">
      <pre>{JSON.stringify(payload, null, 2)}</pre>
    </div>
  )
}

function SuccessOverlay({ plate, model }: { plate: string; model: string }) {
  const { t } = useTranslation()
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="flex flex-1 flex-col items-center justify-center gap-3 p-8 text-center"
    >
      <span className="inline-flex h-12 w-12 items-center justify-center rounded-full bg-emerald-500/10 text-emerald-400 ring-1 ring-emerald-500/30">
        <CheckCircle2 className="h-5 w-5" />
      </span>
      <div>
        <p className="text-sm font-semibold">
          {t('admin.addVehicle.success.title')}
        </p>
        <p className="mt-1 text-[11px] text-muted-foreground">
          {t('admin.addVehicle.success.subtitle', { plate, model })}
        </p>
      </div>
    </motion.div>
  )
}
