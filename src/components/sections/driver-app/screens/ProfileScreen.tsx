import {
  Car,
  Droplets,
  FileCheck,
  Fuel,
  Globe,
  Mail,
  Moon,
  Percent,
  Phone,
  Shield,
  Star,
  Sun,
  Wrench,
} from 'lucide-react'
import type { LucideIcon } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import { LOCALES, type LocaleCode } from '@/lib/constants'
import { cn } from '@/lib/utils'
import { DRIVER } from '../mockData'
import { setPhoneLang } from '../phoneI18n'
import { ScreenScroll, ScreenTitle } from '../ui'
import { usePhoneSim } from '../usePhoneSim'

export function ProfileScreen() {
  const { t } = useTranslation()

  return (
    <ScreenScroll>
      <ScreenTitle
        eyebrow={t('driverApp.sim.profile.eyebrow')}
        title={t('driverApp.sim.profile.title')}
      />

      <div className="flex items-center gap-3 rounded-2xl bg-white/[0.04] p-3 phone-light:bg-zinc-900/[0.04]">
        <span className="flex h-12 w-12 items-center justify-center rounded-full bg-primary/15 text-base font-bold text-primary">
          {DRIVER.initials}
        </span>
        <div className="min-w-0 flex-1">
          <p className="truncate text-sm font-semibold text-white phone-light:text-zinc-900">
            {DRIVER.fullName}
          </p>
          <p className="text-[11px] text-zinc-500">Brussels</p>
        </div>
        <span className="inline-flex items-center gap-1 rounded-full bg-amber-400/10 px-2 py-0.5 text-[10px] font-semibold text-amber-300 ring-1 ring-amber-400/20 phone-light:bg-amber-500/15 phone-light:text-amber-700 phone-light:ring-amber-500/30">
          <Star className="h-3 w-3 fill-current" />
          4.92
        </span>
      </div>

      <div className="space-y-2">
        <Row
          Icon={Car}
          labelKey="driverApp.sim.profile.vehicle"
          value={DRIVER.vehicle}
        />
        <Row
          Icon={Phone}
          labelKey="driverApp.sim.profile.phone"
          value={DRIVER.phone}
        />
        <Row
          Icon={Mail}
          labelKey="driverApp.sim.profile.email"
          value={DRIVER.email}
        />
        <Row
          Icon={FileCheck}
          labelKey="driverApp.sim.profile.documents"
          value={t('driverApp.sim.profile.documentsValue')}
          tone="success"
        />
      </div>

      {/*
        Financial conditions of the contract — fuel split, carwash,
        maintenance, insurance. Real Belgian taxi pain point: drivers
        forget mid-week if it's 50/50 or forfait, advance €80 in fuel
        and call the operator to ask. Having this one tap away inside
        their own app eliminates the back-and-forth.
      */}
      <TermsSection />

      <div className="pt-1">
        <p className="mb-1.5 text-[10px] font-semibold uppercase tracking-wider text-zinc-500">
          {t('driverApp.sim.profile.preferences')}
        </p>

        <LanguageRow />
        <ThemeRow />
      </div>
    </ScreenScroll>
  )
}

type TermTone = 'primary' | 'sky' | 'emerald' | 'rose'

const TERMS: ReadonlyArray<{
  Icon: LucideIcon
  key: 'formula' | 'fuel' | 'carwash' | 'maintenance' | 'insurance'
  tone: TermTone
}> = [
  { Icon: Percent, key: 'formula', tone: 'primary' },
  { Icon: Fuel, key: 'fuel', tone: 'sky' },
  { Icon: Droplets, key: 'carwash', tone: 'emerald' },
  { Icon: Wrench, key: 'maintenance', tone: 'emerald' },
  { Icon: Shield, key: 'insurance', tone: 'emerald' },
] as const

function TermsSection() {
  const { t } = useTranslation()
  return (
    <div className="pt-1">
      <p className="mb-1.5 text-[10px] font-semibold uppercase tracking-wider text-zinc-500">
        {t('driverApp.sim.profile.terms.title')}
      </p>
      <div className="space-y-2">
        {TERMS.map(({ Icon, key, tone }) => (
          <TermRow
            key={key}
            Icon={Icon}
            label={t(`driverApp.sim.profile.terms.${key}.label`)}
            value={t(`driverApp.sim.profile.terms.${key}.value`)}
            tone={tone}
          />
        ))}
      </div>
      <p className="mt-2 px-1 text-[10px] leading-snug text-zinc-500">
        {t('driverApp.sim.profile.terms.footnote')}
      </p>
    </div>
  )
}

function TermRow({
  Icon,
  label,
  value,
  tone,
}: {
  Icon: LucideIcon
  label: string
  value: string
  tone: TermTone
}) {
  const iconClass = {
    primary: 'bg-primary/15 text-primary ring-primary/30',
    sky: 'bg-sky-400/15 text-sky-300 ring-sky-400/30 phone-light:text-sky-700 phone-light:ring-sky-500/40',
    emerald:
      'bg-emerald-400/15 text-emerald-300 ring-emerald-400/30 phone-light:text-emerald-700 phone-light:ring-emerald-500/40',
    rose: 'bg-rose-400/15 text-rose-300 ring-rose-400/30 phone-light:text-rose-700 phone-light:ring-rose-500/40',
  }[tone]
  const valueClass = {
    primary: 'text-primary',
    sky: 'text-sky-300 phone-light:text-sky-700',
    emerald: 'text-emerald-300 phone-light:text-emerald-700',
    rose: 'text-rose-300 phone-light:text-rose-700',
  }[tone]

  return (
    <div className="flex items-center gap-3 rounded-xl border border-white/[0.06] bg-white/[0.02] px-3 py-2.5 phone-light:border-zinc-900/[0.08] phone-light:bg-zinc-900/[0.03]">
      <span
        className={cn(
          'flex h-8 w-8 shrink-0 items-center justify-center rounded-lg ring-1',
          iconClass,
        )}
      >
        <Icon className="h-4 w-4" />
      </span>
      <div className="min-w-0 flex-1">
        <p className="text-[10px] uppercase tracking-wider text-zinc-500">
          {label}
        </p>
        <p
          className={cn(
            'mt-0.5 truncate text-xs font-semibold',
            valueClass,
          )}
        >
          {value}
        </p>
      </div>
    </div>
  )
}

function Row({
  Icon,
  labelKey,
  value,
  tone,
}: {
  Icon: LucideIcon
  labelKey: string
  value: string
  tone?: 'success'
}) {
  const { t } = useTranslation()
  return (
    <div className="flex items-center gap-3 rounded-xl border border-white/[0.06] bg-white/[0.02] px-3 py-2.5 phone-light:border-zinc-900/[0.08] phone-light:bg-zinc-900/[0.03]">
      <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-white/[0.04] text-zinc-300 phone-light:bg-zinc-900/[0.05] phone-light:text-zinc-700">
        <Icon className="h-4 w-4" />
      </span>
      <div className="min-w-0 flex-1">
        <p className="text-[10px] uppercase tracking-wider text-zinc-500">
          {t(labelKey)}
        </p>
        <p className="truncate text-xs font-medium text-zinc-100 phone-light:text-zinc-900">
          {value}
        </p>
      </div>
      {tone === 'success' && (
        <span className="h-1.5 w-1.5 rounded-full bg-emerald-400" />
      )}
    </div>
  )
}

function LanguageRow() {
  const { i18n, t } = useTranslation()
  const current = (LOCALES.find((l) => l.code === i18n.language)?.code ??
    'fr') as LocaleCode

  return (
    <div className="mb-2 rounded-xl border border-white/[0.06] bg-white/[0.02] px-3 py-2.5 phone-light:border-zinc-900/[0.08] phone-light:bg-zinc-900/[0.03]">
      <div className="mb-2 flex items-center gap-3">
        <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-white/[0.04] text-zinc-300 phone-light:bg-zinc-900/[0.05] phone-light:text-zinc-700">
          <Globe className="h-4 w-4" />
        </span>
        <p className="text-[10px] uppercase tracking-wider text-zinc-500">
          {t('driverApp.sim.profile.language')}
        </p>
      </div>
      <div className="grid grid-cols-4 gap-1.5">
        {LOCALES.map((l) => {
          const active = l.code === current
          return (
            <button
              key={l.code}
              type="button"
              onClick={() => {
                if (l.code !== current) setPhoneLang(l.code)
              }}
              aria-pressed={active}
              className={cn(
                'rounded-lg px-2 py-1.5 text-[10px] font-bold uppercase tracking-wider transition-colors',
                active
                  ? 'bg-primary text-primary-foreground shadow-glow'
                  : 'bg-white/[0.04] text-zinc-400 hover:bg-white/[0.08] hover:text-zinc-100 phone-light:bg-zinc-900/[0.05] phone-light:text-zinc-600 phone-light:hover:bg-zinc-900/[0.08] phone-light:hover:text-zinc-900',
              )}
            >
              {l.code}
            </button>
          )
        })}
      </div>
    </div>
  )
}

function ThemeRow() {
  const { phoneTheme, setPhoneTheme } = usePhoneSim()
  const { t } = useTranslation()

  return (
    <div className="rounded-xl border border-white/[0.06] bg-white/[0.02] px-3 py-2.5 phone-light:border-zinc-900/[0.08] phone-light:bg-zinc-900/[0.03]">
      <div className="mb-2 flex items-center gap-3">
        <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-white/[0.04] text-zinc-300 phone-light:bg-zinc-900/[0.05] phone-light:text-zinc-700">
          {phoneTheme === 'dark' ? (
            <Moon className="h-4 w-4" />
          ) : (
            <Sun className="h-4 w-4" />
          )}
        </span>
        <p className="text-[10px] uppercase tracking-wider text-zinc-500">
          {t('driverApp.sim.profile.theme')}
        </p>
      </div>
      <div className="grid grid-cols-2 gap-1.5">
        <ThemeButton
          active={phoneTheme === 'light'}
          onClick={() => setPhoneTheme('light')}
          Icon={Sun}
          label={t('driverApp.sim.profile.light')}
        />
        <ThemeButton
          active={phoneTheme === 'dark'}
          onClick={() => setPhoneTheme('dark')}
          Icon={Moon}
          label={t('driverApp.sim.profile.dark')}
        />
      </div>
    </div>
  )
}

function ThemeButton({
  active,
  onClick,
  Icon,
  label,
}: {
  active: boolean
  onClick: () => void
  Icon: LucideIcon
  label: string
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={active}
      className={cn(
        'inline-flex items-center justify-center gap-1.5 rounded-lg px-2 py-1.5 text-[11px] font-semibold transition-colors',
        active
          ? 'bg-primary text-primary-foreground shadow-glow'
          : 'bg-white/[0.04] text-zinc-400 hover:bg-white/[0.08] hover:text-zinc-100 phone-light:bg-zinc-900/[0.05] phone-light:text-zinc-600 phone-light:hover:bg-zinc-900/[0.08] phone-light:hover:text-zinc-900',
      )}
    >
      <Icon className="h-3.5 w-3.5" />
      {label}
    </button>
  )
}
