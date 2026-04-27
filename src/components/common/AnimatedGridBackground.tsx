import { cn } from '@/lib/utils'

interface AnimatedGridBackgroundProps {
  className?: string
}

export function AnimatedGridBackground({ className }: AnimatedGridBackgroundProps) {
  return (
    <div
      aria-hidden
      className={cn(
        'pointer-events-none absolute inset-0 overflow-hidden',
        className,
      )}
    >
      <div
        className="absolute inset-0 bg-grid-pattern opacity-70"
        style={{
          maskImage:
            'radial-gradient(ellipse 80% 60% at 50% 30%, black 30%, transparent 70%)',
          WebkitMaskImage:
            'radial-gradient(ellipse 80% 60% at 50% 30%, black 30%, transparent 70%)',
        }}
      />
    </div>
  )
}
