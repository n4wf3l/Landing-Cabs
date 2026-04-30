import { useState, type FormEvent } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { ModalShell } from '../parts/ModalShell'
import {
  Banknote,
  Briefcase,
  CheckCircle2,
  CreditCard,
  IdCard,
  Mail,
  MapPin,
  Sliders,
  User,
  X,
} from 'lucide-react'
import { useTranslation } from 'react-i18next'
import { useAdminApp } from '../useAdminApp'
import type {
  DriverFormPayload,
  DriverRow,
  PaymentMethod,
  PreferredShift,
  Weekday,
  WorkFormula,
} from '../types'
import { cn } from '@/lib/utils'

const WORKDAYS: Weekday[] = [
  'MONDAY',
  'TUESDAY',
  'WEDNESDAY',
  'THURSDAY',
  'FRIDAY',
  'SATURDAY',
  'SUNDAY',
]

const PAYMENTS: PaymentMethod[] = [
  'CASH',
  'CARD',
  'UBER_APP',
  'BOLT_CARD',
  'HEETCH_APP',
  'TAXIVERT',
]

const WORK_FORMULAS: WorkFormula[] = ['FIFTY_FIFTY', 'FLAT_RATE', 'RENTAL']
const SHIFTS: PreferredShift[] = ['DAY', 'NIGHT', 'FLEXIBLE']

const INITIAL_PAYLOAD: DriverFormPayload = {
  user: {
    firstName: '',
    lastName: '',
    email: '',
    phoneNumber: '',
    street: '',
    postalCode: '',
    city: 'Brussels',
    addressNumber: '',
    box: '',
    dateOfBirth: '',
    password: '',
  },
  startDate: new Date().toISOString().slice(0, 10),
  nationality: 'BE',
  issuingCountry: 'BE',
  nationalId: '',
  bankAccountNumber: '',
  extraInfo: '',
  workFormula: 'FIFTY_FIFTY',
  preferredShift: 'DAY',
  workdays: ['MONDAY', 'TUESDAY', 'WEDNESDAY', 'THURSDAY', 'FRIDAY'],
  flexWorker: false,
  acceptedPayments: ['CASH', 'CARD', 'UBER_APP', 'BOLT_CARD'],
}

/**
 * Converts the in-progress add-driver payload into a DriverRow shape so
 * we can hand it to the conditions panel right after the operator hits
 * "Save + advanced". Mirrors the equivalent helper in DriversScreen but
 * uses a `pending_` prefix to signal this is a fresh driver that hasn't
 * been re-keyed against the persisted addedDrivers index yet.
 */
function payloadToDriverRow(p: DriverFormPayload): DriverRow {
  const initials =
    `${p.user.firstName.charAt(0)}${p.user.lastName.charAt(0)}`.toUpperCase() ||
    '??'
  return {
    id: `pending_${Date.now()}`,
    initials,
    firstName: p.user.firstName || '—',
    lastName: p.user.lastName || '',
    email: p.user.email || '—',
    phone: p.user.phoneNumber || '—',
    city: p.user.city || '—',
    postcode: p.user.postalCode || '—',
    status: 'active',
    shiftStartedAt: '—',
    shiftDurationMinutes: 0,
    paymentEnabled: p.acceptedPayments.length > 0,
    avatarHue: ((p.user.firstName.charCodeAt(0) || 0) * 7) % 360,
  }
}

interface AddDriverPanelProps {
  open: boolean
  onClose: () => void
}

export function AddDriverPanel({ open, onClose }: AddDriverPanelProps) {
  const { t } = useTranslation()
  const { addDriver, openConditionsFor } = useAdminApp()
  const [payload, setPayload] = useState<DriverFormPayload>(INITIAL_PAYLOAD)
  const [showJson, setShowJson] = useState(false)
  const [submitted, setSubmitted] = useState(false)

  const updateUser = <K extends keyof DriverFormPayload['user']>(
    key: K,
    value: DriverFormPayload['user'][K],
  ) => setPayload((p) => ({ ...p, user: { ...p.user, [key]: value } }))

  const update = <K extends keyof DriverFormPayload>(
    key: K,
    value: DriverFormPayload[K],
  ) => setPayload((p) => ({ ...p, [key]: value }))

  const toggleWorkday = (d: Weekday) => {
    setPayload((p) => ({
      ...p,
      workdays: p.workdays.includes(d)
        ? p.workdays.filter((x) => x !== d)
        : [...p.workdays, d],
    }))
  }

  const togglePayment = (m: PaymentMethod) => {
    setPayload((p) => ({
      ...p,
      acceptedPayments: p.acceptedPayments.includes(m)
        ? p.acceptedPayments.filter((x) => x !== m)
        : [...p.acceptedPayments, m],
    }))
  }

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault()
    addDriver(payload)
    setSubmitted(true)
    window.setTimeout(() => {
      setSubmitted(false)
      setPayload(INITIAL_PAYLOAD)
      onClose()
    }, 1400)
  }

  // Save + open the per-platform conditions panel for the just-created
  // driver, so the operator can configure 40/60 Uber, forfait Bolt, etc.
  // without first having to find them in the drivers list.
  const handleSubmitAdvanced = () => {
    if (!payload.user.firstName.trim() || !payload.user.lastName.trim()) {
      // The HTML form's `required` will fire on the regular Save path;
      // for this secondary route we need a manual minimal guard so the
      // conditions panel doesn't open with an empty driver name.
      return
    }
    addDriver(payload)
    const newRow = payloadToDriverRow(payload)
    setPayload(INITIAL_PAYLOAD)
    onClose()
    // Open the conditions panel on the next tick so the close animation
    // of the form modal has a frame to start before the next one stacks.
    window.setTimeout(() => openConditionsFor(newRow), 80)
  }

  return (
    <AnimatePresence>
      {open && (
        <ModalShell ariaLabel={t('admin.addDriver.title')} onClose={onClose}>
          <>
            <header className="flex items-center justify-between border-b border-border/40 px-4 py-2.5">
              <div>
                <p className="text-xs font-semibold tracking-tight">
                  {t('admin.addDriver.title')}
                </p>
                <p className="text-[10px] text-muted-foreground">
                  {t('admin.addDriver.subtitle')}
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
              <SuccessOverlay name={`${payload.user.firstName} ${payload.user.lastName}`} />
            ) : showJson ? (
              <JsonPreview payload={payload} />
            ) : (
              <form onSubmit={handleSubmit} className="flex flex-1 flex-col overflow-hidden">
                <div className="flex-1 space-y-4 overflow-y-auto p-4">
                  <Section
                    Icon={User}
                    title={t('admin.addDriver.sections.identity')}
                  >
                    <div className="grid grid-cols-2 gap-2">
                      <Field label={t('admin.addDriver.fields.firstName')}>
                        <Input
                          value={payload.user.firstName}
                          onChange={(v) => updateUser('firstName', v)}
                          placeholder="Nawfel"
                          required
                        />
                      </Field>
                      <Field label={t('admin.addDriver.fields.lastName')}>
                        <Input
                          value={payload.user.lastName}
                          onChange={(v) => updateUser('lastName', v)}
                          placeholder="Ajari"
                          required
                        />
                      </Field>
                      <Field label={t('admin.addDriver.fields.dateOfBirth')}>
                        <Input
                          type="date"
                          value={payload.user.dateOfBirth}
                          onChange={(v) => updateUser('dateOfBirth', v)}
                          required
                        />
                      </Field>
                      <Field label={t('admin.addDriver.fields.phone')}>
                        <Input
                          type="tel"
                          value={payload.user.phoneNumber}
                          onChange={(v) => updateUser('phoneNumber', v)}
                          placeholder="+32 490 22 19 12"
                          required
                        />
                      </Field>
                    </div>
                    <Field label={t('admin.addDriver.fields.email')}>
                      <Input
                        type="email"
                        value={payload.user.email}
                        onChange={(v) => updateUser('email', v)}
                        placeholder="nawfel.ajr@example.com"
                        Icon={Mail}
                        required
                      />
                    </Field>
                  </Section>

                  <Section
                    Icon={MapPin}
                    title={t('admin.addDriver.sections.address')}
                  >
                    <Field label={t('admin.addDriver.fields.street')}>
                      <Input
                        value={payload.user.street}
                        onChange={(v) => updateUser('street', v)}
                        placeholder="Rue Gaucheret"
                      />
                    </Field>
                    <div className="grid grid-cols-3 gap-2">
                      <Field label={t('admin.addDriver.fields.addressNumber')}>
                        <Input
                          value={payload.user.addressNumber}
                          onChange={(v) => updateUser('addressNumber', v)}
                          placeholder="2"
                        />
                      </Field>
                      <Field label={t('admin.addDriver.fields.box')}>
                        <Input
                          value={payload.user.box}
                          onChange={(v) => updateUser('box', v)}
                          placeholder="4B"
                        />
                      </Field>
                      <Field label={t('admin.addDriver.fields.postalCode')}>
                        <Input
                          value={payload.user.postalCode}
                          onChange={(v) => updateUser('postalCode', v)}
                          placeholder="1000"
                        />
                      </Field>
                    </div>
                    <Field label={t('admin.addDriver.fields.city')}>
                      <Input
                        value={payload.user.city}
                        onChange={(v) => updateUser('city', v)}
                        placeholder="Brussels"
                      />
                    </Field>
                  </Section>

                  <Section
                    Icon={IdCard}
                    title={t('admin.addDriver.sections.legal')}
                  >
                    <div className="grid grid-cols-2 gap-2">
                      <Field label={t('admin.addDriver.fields.nationality')}>
                        <Input
                          value={payload.nationality}
                          onChange={(v) => update('nationality', v)}
                          placeholder="BE"
                          maxLength={3}
                        />
                      </Field>
                      <Field label={t('admin.addDriver.fields.issuingCountry')}>
                        <Input
                          value={payload.issuingCountry}
                          onChange={(v) => update('issuingCountry', v)}
                          placeholder="BE"
                          maxLength={3}
                        />
                      </Field>
                    </div>
                    <Field label={t('admin.addDriver.fields.nationalId')}>
                      <Input
                        value={payload.nationalId}
                        onChange={(v) => update('nationalId', v)}
                        placeholder="90051512391"
                        mono
                      />
                    </Field>
                    <Field label={t('admin.addDriver.fields.startDate')}>
                      <Input
                        type="date"
                        value={payload.startDate}
                        onChange={(v) => update('startDate', v)}
                      />
                    </Field>
                  </Section>

                  <Section
                    Icon={Banknote}
                    title={t('admin.addDriver.sections.bank')}
                  >
                    <Field label={t('admin.addDriver.fields.iban')}>
                      <Input
                        value={payload.bankAccountNumber}
                        onChange={(v) => update('bankAccountNumber', v)}
                        placeholder="BE68 5390 0754 7034"
                        mono
                      />
                    </Field>
                  </Section>

                  <Section
                    Icon={Briefcase}
                    title={t('admin.addDriver.sections.work')}
                  >
                    <Field label={t('admin.addDriver.fields.workFormula')}>
                      <ChipGroup
                        value={payload.workFormula}
                        options={WORK_FORMULAS}
                        onChange={(v) => update('workFormula', v as WorkFormula)}
                        labelKey="admin.addDriver.workFormula"
                      />
                    </Field>
                    <Field label={t('admin.addDriver.fields.preferredShift')}>
                      <ChipGroup
                        value={payload.preferredShift}
                        options={SHIFTS}
                        onChange={(v) => update('preferredShift', v as PreferredShift)}
                        labelKey="admin.addDriver.shift"
                      />
                    </Field>
                    <Field label={t('admin.addDriver.fields.workdays')}>
                      <div className="flex flex-wrap gap-1">
                        {WORKDAYS.map((d) => {
                          const active = payload.workdays.includes(d)
                          return (
                            <button
                              key={d}
                              type="button"
                              onClick={() => toggleWorkday(d)}
                              aria-pressed={active}
                              className={cn(
                                'inline-flex h-7 w-9 items-center justify-center rounded-md text-[10px] font-semibold transition-colors',
                                active
                                  ? 'bg-primary/20 text-primary ring-1 ring-primary/40'
                                  : 'bg-background/40 text-muted-foreground ring-1 ring-border/60 hover:text-foreground',
                              )}
                            >
                              {t(`admin.addDriver.weekday.${d}`)}
                            </button>
                          )
                        })}
                      </div>
                    </Field>
                    <label className="flex items-center gap-2 rounded-md border border-border/40 bg-background/40 px-2.5 py-1.5">
                      <input
                        type="checkbox"
                        checked={payload.flexWorker}
                        onChange={(e) => update('flexWorker', e.target.checked)}
                        className="h-3.5 w-3.5 rounded border-border/60 text-primary focus:ring-primary/40"
                      />
                      <span className="text-[11px] font-medium">
                        {t('admin.addDriver.fields.flexWorker')}
                      </span>
                    </label>
                  </Section>

                  <Section
                    Icon={CreditCard}
                    title={t('admin.addDriver.sections.payments')}
                  >
                    <div className="flex flex-wrap gap-1">
                      {PAYMENTS.map((m) => {
                        const active = payload.acceptedPayments.includes(m)
                        return (
                          <button
                            key={m}
                            type="button"
                            onClick={() => togglePayment(m)}
                            aria-pressed={active}
                            className={cn(
                              'inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[10px] font-medium transition-colors',
                              active
                                ? 'bg-primary/15 text-primary ring-1 ring-primary/40'
                                : 'bg-background/40 text-muted-foreground ring-1 ring-border/60 hover:text-foreground',
                            )}
                          >
                            {active && <CheckCircle2 className="h-2.5 w-2.5" />}
                            {t(`admin.addDriver.payment.${m}`)}
                          </button>
                        )
                      })}
                    </div>
                    <Field label={t('admin.addDriver.fields.extraInfo')}>
                      <textarea
                        value={payload.extraInfo}
                        onChange={(e) => update('extraInfo', e.target.value)}
                        rows={2}
                        placeholder={t('admin.addDriver.fields.extraInfoPlaceholder')}
                        className="w-full rounded-md border border-border/60 bg-background/40 px-2 py-1.5 text-[11px] placeholder:text-muted-foreground/50 focus:border-primary/60 focus:outline-none focus:ring-1 focus:ring-primary/40"
                      />
                    </Field>
                  </Section>
                </div>

                <footer className="border-t border-border/40 bg-card/80 px-4 py-2.5 backdrop-blur">
                  <p className="text-[10px] text-muted-foreground">
                    {t('admin.addDriver.footerHint')}
                  </p>
                  <div className="mt-2 flex flex-wrap items-center justify-end gap-1.5">
                    <button
                      type="button"
                      onClick={onClose}
                      className="inline-flex h-7 items-center rounded-md border border-border/60 bg-background/40 px-3 text-[10px] font-medium text-muted-foreground hover:text-foreground"
                    >
                      {t('admin.addDriver.cancel')}
                    </button>
                    <button
                      type="button"
                      onClick={handleSubmitAdvanced}
                      className="inline-flex h-7 items-center gap-1.5 rounded-md border border-primary/40 bg-primary/10 px-3 text-[10px] font-semibold text-primary transition-colors hover:bg-primary/15"
                    >
                      <Sliders className="h-3 w-3" />
                      {t('admin.addDriver.saveAdvanced')}
                    </button>
                    <button
                      type="submit"
                      className="inline-flex h-7 items-center gap-1.5 rounded-md bg-primary px-3 text-[10px] font-semibold text-primary-foreground hover:opacity-95"
                    >
                      <CheckCircle2 className="h-3 w-3" />
                      {t('admin.addDriver.save')}
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
  Icon: typeof User
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
  type?: string
  required?: boolean
  maxLength?: number
  Icon?: typeof Mail
  mono?: boolean
}

function Input({
  value,
  onChange,
  placeholder,
  type = 'text',
  required,
  maxLength,
  Icon,
  mono,
}: InputProps) {
  return (
    <div className="relative">
      {Icon && (
        <Icon
          aria-hidden
          className="pointer-events-none absolute left-2 top-1/2 h-3 w-3 -translate-y-1/2 text-muted-foreground"
        />
      )}
      <input
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        required={required}
        maxLength={maxLength}
        className={cn(
          'w-full rounded-md border border-border/60 bg-background/40 px-2 py-1.5 text-[11px] placeholder:text-muted-foreground/50 focus:border-primary/60 focus:outline-none focus:ring-1 focus:ring-primary/40',
          Icon && 'pl-7',
          mono && 'font-mono',
        )}
      />
    </div>
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

function JsonPreview({ payload }: { payload: DriverFormPayload }) {
  return (
    <div className="flex-1 overflow-auto bg-zinc-950 p-3 font-mono text-[10px] leading-relaxed text-zinc-200">
      <pre>{JSON.stringify(payload, null, 2)}</pre>
    </div>
  )
}

function SuccessOverlay({ name }: { name: string }) {
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
          {t('admin.addDriver.success.title')}
        </p>
        <p className="mt-1 text-[11px] text-muted-foreground">
          {t('admin.addDriver.success.subtitle', { name: name.trim() || '—' })}
        </p>
      </div>
    </motion.div>
  )
}
