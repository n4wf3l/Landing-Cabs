// Visible loading placeholder for the heavy lazy-loaded sims
// (ProductShowcase + DriverApp). Mimics the rough layout of the real
// content so when the chunk lands the layout doesn't pop. Pure CSS
// animate-pulse, no framer-motion, so it's guaranteed to show even
// when the main thread is saturated.

import { cn } from '@/lib/utils'

interface Props {
  variant: 'admin' | 'driver'
  /** Optional eyebrow / title to give context while loading. */
  eyebrow?: string
  title?: string
  className?: string
}

export function SectionSkeleton({ variant, eyebrow, title, className }: Props) {
  return (
    <section
      aria-busy="true"
      aria-label={title || 'Loading section'}
      className={cn(
        'relative py-14 sm:py-24 lg:py-32',
        className,
      )}
    >
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-3xl text-center">
          {eyebrow && (
            <span className="inline-block rounded-full border border-primary/30 bg-primary/10 px-3 py-1 text-xs font-medium text-primary">
              {eyebrow}
            </span>
          )}
          {title && (
            <h2 className="mt-5 text-balance text-3xl font-bold tracking-tight sm:text-4xl">
              {title}
            </h2>
          )}
          <p className="mt-3 inline-flex items-center gap-2 text-xs font-medium uppercase tracking-[0.2em] text-muted-foreground">
            <span className="inline-block h-2 w-2 animate-pulse rounded-full bg-primary" />
            Chargement
          </p>
        </div>

        {variant === 'admin' ? (
          <div className="mx-auto mt-10 grid max-w-5xl gap-3 sm:mt-14">
            <div className="h-[420px] animate-pulse rounded-2xl border border-border/60 bg-card/40 sm:h-[480px]" />
            <div className="grid gap-3 sm:grid-cols-3">
              <div className="h-24 animate-pulse rounded-xl border border-border/60 bg-card/40" />
              <div className="h-24 animate-pulse rounded-xl border border-border/60 bg-card/40" />
              <div className="h-24 animate-pulse rounded-xl border border-border/60 bg-card/40" />
            </div>
          </div>
        ) : (
          <div className="mx-auto mt-10 flex max-w-5xl justify-center sm:mt-14">
            <div className="h-[560px] w-[280px] animate-pulse rounded-[2.5rem] border-4 border-border/60 bg-card/40 sm:h-[640px] sm:w-[320px]" />
          </div>
        )}
      </div>
    </section>
  )
}
