import { cn } from '@/lib/utils'

interface AnimatedGridBackgroundProps {
  className?: string
}

export function AnimatedGridBackground({ className }: AnimatedGridBackgroundProps) {
  return (
    <div
      aria-hidden
      className={cn(
        // Hidden on mobile: the radial mask-image is extremely expensive
        // on iOS Safari and contributes to the long delay before the
        // page paints content below the carousel on real devices.
        'pointer-events-none absolute inset-0 hidden overflow-hidden lg:block',
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
