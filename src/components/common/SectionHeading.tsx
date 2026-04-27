import { cn } from '@/lib/utils'

interface SectionHeadingProps {
  eyebrow?: string
  title: string
  subtitle?: string
  center?: boolean
  className?: string
}

// Plain HTML heading. The previous version was a motion.div with
// whileInView fade-in. Rendered ~6 times across the landing (one per
// section), it added 6 framer-motion mount-time costs + 6 IntersectionObserver
// callbacks on a real mobile already saturated by the page's commit
// phase. Static HTML renders the moment the parent section commits.
export function SectionHeading({
  eyebrow,
  title,
  subtitle,
  center = true,
  className,
}: SectionHeadingProps) {
  return (
    <div
      className={cn(
        'mx-auto max-w-3xl space-y-4',
        center && 'text-center',
        className,
      )}
    >
      {eyebrow && (
        <span className="inline-block rounded-full border border-primary/30 bg-primary/10 px-3 py-1 text-xs font-medium text-primary">
          {eyebrow}
        </span>
      )}
      <h2 className="text-balance text-3xl font-bold tracking-tight sm:text-4xl lg:text-5xl">
        {title}
      </h2>
      {subtitle && (
        <p className="text-balance text-base text-muted-foreground sm:text-lg">
          {subtitle}
        </p>
      )}
    </div>
  )
}
