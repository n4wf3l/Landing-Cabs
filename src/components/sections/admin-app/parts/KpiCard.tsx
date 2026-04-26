import type { LucideIcon } from 'lucide-react'
import { cn } from '@/lib/utils'

interface KpiCardProps {
  label: string
  value: string | number
  trend?: string
  Icon?: LucideIcon
  accent?: 'primary' | 'emerald' | 'amber' | 'rose'
}

const ACCENTS = {
  primary: 'text-primary bg-primary/10 ring-primary/20',
  emerald: 'text-emerald-400 bg-emerald-500/10 ring-emerald-500/20',
  amber: 'text-amber-400 bg-amber-500/10 ring-amber-500/20',
  rose: 'text-rose-400 bg-rose-500/10 ring-rose-500/20',
}

export function KpiCard({ label, value, trend, Icon, accent = 'primary' }: KpiCardProps) {
  return (
    <div className="rounded-lg border border-border/60 bg-card/60 p-3 backdrop-blur">
      <div className="flex items-center justify-between gap-2">
        <span className="text-[10px] font-medium uppercase tracking-wider text-muted-foreground">
          {label}
        </span>
        {Icon && (
          <span
            className={cn(
              'flex h-6 w-6 items-center justify-center rounded-md ring-1',
              ACCENTS[accent],
            )}
          >
            <Icon className="h-3 w-3" />
          </span>
        )}
      </div>
      <p className="mt-1.5 text-xl font-bold tabular-nums tracking-tight">
        {value}
      </p>
      {trend && (
        <p className="mt-0.5 text-[10px] text-emerald-400">{trend}</p>
      )}
    </div>
  )
}
