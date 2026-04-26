import { cn } from '@/lib/utils'

type Tone =
  | 'emerald'
  | 'amber'
  | 'rose'
  | 'sky'
  | 'zinc'
  | 'primary'

interface StatusBadgeProps {
  tone: Tone
  label: string
  size?: 'xs' | 'sm'
}

const TONES: Record<Tone, string> = {
  emerald: 'bg-emerald-500/15 text-emerald-300 ring-emerald-500/30',
  amber: 'bg-amber-500/15 text-amber-300 ring-amber-500/30',
  rose: 'bg-rose-500/15 text-rose-300 ring-rose-500/30',
  sky: 'bg-sky-500/15 text-sky-300 ring-sky-500/30',
  zinc: 'bg-zinc-500/15 text-zinc-300 ring-zinc-500/30',
  primary: 'bg-primary/15 text-primary ring-primary/30',
}

export function StatusBadge({ tone, label, size = 'xs' }: StatusBadgeProps) {
  return (
    <span
      className={cn(
        'inline-flex items-center rounded-full font-medium ring-1 ring-inset',
        size === 'xs' ? 'px-2 py-0.5 text-[10px]' : 'px-2.5 py-1 text-xs',
        TONES[tone],
      )}
    >
      {label}
    </span>
  )
}
