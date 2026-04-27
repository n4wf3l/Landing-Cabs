import type { ReactNode } from 'react'
import { cn } from '@/lib/utils'
import type { Platform } from './types'

export function ScreenScroll({
  children,
  className,
}: {
  children: ReactNode
  className?: string
}) {
  return (
    <div
      className={cn(
        'phone-scroll flex h-full flex-col gap-4 overflow-y-auto px-5 pb-4 pt-3',
        className,
      )}
    >
      {children}
    </div>
  )
}

export function ScreenTitle({
  eyebrow,
  title,
  className,
}: {
  eyebrow?: string
  title: string
  className?: string
}) {
  return (
    <div className={cn('space-y-0.5', className)}>
      {eyebrow && (
        <p className="text-[10px] font-semibold uppercase tracking-widest text-zinc-500">
          {eyebrow}
        </p>
      )}
      <h2 className="text-[20px] font-bold tracking-tight text-white phone-light:text-zinc-900">{title}</h2>
    </div>
  )
}

export function PlatformBadge({
  platform,
  label,
}: {
  platform: Platform
  label: string
}) {
  const tone: Record<Platform, string> = {
    uber: 'bg-zinc-200/10 text-zinc-100 ring-zinc-200/20 phone-light:bg-zinc-900/[0.08] phone-light:text-zinc-800 phone-light:ring-zinc-900/[0.12]',
    bolt: 'bg-emerald-400/10 text-emerald-300 ring-emerald-400/20 phone-light:bg-emerald-500/15 phone-light:text-emerald-800 phone-light:ring-emerald-500/30',
    heetch: 'bg-fuchsia-400/10 text-fuchsia-300 ring-fuchsia-400/20 phone-light:bg-fuchsia-500/15 phone-light:text-fuchsia-800 phone-light:ring-fuchsia-500/30',
    taxivert: 'bg-sky-400/10 text-sky-300 ring-sky-400/20 phone-light:bg-sky-500/15 phone-light:text-sky-800 phone-light:ring-sky-500/30',
    cash: 'bg-amber-400/10 text-amber-300 ring-amber-400/20 phone-light:bg-amber-500/20 phone-light:text-amber-800 phone-light:ring-amber-500/40',
  }
  return (
    <span
      className={cn(
        'inline-flex items-center rounded-full px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider ring-1',
        tone[platform],
      )}
    >
      {label}
    </span>
  )
}

export function Money({
  value,
  className,
}: {
  value: number
  className?: string
}) {
  return (
    <span className={cn('tabular-nums', className)}>
      {value.toLocaleString('fr-BE', {
        minimumFractionDigits: value % 1 === 0 ? 0 : 2,
        maximumFractionDigits: 2,
      })}{' '}
      €
    </span>
  )
}
