import { cn } from '@/lib/utils'

interface GlowEffectProps {
  className?: string
  color?: 'primary' | 'mixed'
}

export function GlowEffect({ className, color = 'primary' }: GlowEffectProps) {
  return (
    <div
      aria-hidden
      className={cn('pointer-events-none absolute inset-0 overflow-hidden', className)}
    >
      {color === 'primary' ? (
        <div className="absolute left-1/2 top-1/3 h-[520px] w-[520px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-primary/20 blur-[120px] animate-glow-pulse" />
      ) : (
        <>
          <div className="absolute left-1/3 top-1/4 h-[420px] w-[420px] rounded-full bg-primary/25 blur-[120px] animate-glow-pulse" />
          <div className="absolute right-1/4 top-1/2 h-[360px] w-[360px] rounded-full bg-primary/15 blur-[120px] animate-glow-pulse" />
        </>
      )}
    </div>
  )
}
