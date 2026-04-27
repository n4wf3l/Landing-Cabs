import { lazy, Suspense, useState, type ComponentType } from 'react'
import { Play } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import { cn } from '@/lib/utils'

// Wrapper that defers loading the heavy admin / driver simulators until
// the user explicitly clicks Play. Until then the page only carries a
// small landing card with title + Play button, which costs nearly
// nothing to render. On click, the chunk is fetched (visible loading
// bar), then the real sim mounts in place.
//
// Two big wins on mobile:
// 1) The initial bundle is dramatically smaller (no admin or driver
//    sim trees in the first parse).
// 2) Users who scroll past without engaging never pay the CPU cost
//    of committing the massive sim tree.

const ProductShowcase = lazy(() =>
  import('@/components/sections/ProductShowcase').then((m) => ({
    default: m.ProductShowcase,
  })),
)
const DriverApp = lazy(() =>
  import('@/components/sections/DriverApp').then((m) => ({
    default: m.DriverApp,
  })),
)

interface LauncherProps {
  variant: 'admin' | 'driver'
}

interface SimMeta {
  Component: ComponentType
  eyebrow: string
  title: string
  subtitle: string
  cta: string
  loadingLabel: string
  sectionId?: string
}

export function SimLauncher({ variant }: LauncherProps) {
  const { t } = useTranslation()
  const [launched, setLaunched] = useState(false)

  const meta: SimMeta =
    variant === 'admin'
      ? {
          Component: ProductShowcase,
          eyebrow: t('showcase.eyebrow'),
          title: t('showcase.title'),
          subtitle: t('showcase.subtitle'),
          cta: t('launcher.adminCta'),
          loadingLabel: t('launcher.loading'),
          sectionId: undefined,
        }
      : {
          Component: DriverApp,
          eyebrow: t('driverApp.eyebrow'),
          title: t('driverApp.title'),
          subtitle: t('driverApp.subtitle'),
          cta: t('launcher.driverCta'),
          loadingLabel: t('launcher.loading'),
        }

  if (launched) {
    return (
      <Suspense fallback={<LoadingBar label={meta.loadingLabel} />}>
        <meta.Component />
      </Suspense>
    )
  }

  return (
    <section
      id={meta.sectionId}
      className="relative scroll-mt-20 py-14 sm:py-24 lg:py-32"
    >
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-3xl text-center">
          <span className="inline-block rounded-full border border-primary/30 bg-primary/10 px-3 py-1 text-xs font-medium text-primary">
            {meta.eyebrow}
          </span>
          <h2 className="mt-5 text-balance text-3xl font-bold tracking-tight sm:text-4xl">
            {meta.title}
          </h2>
          <p className="mx-auto mt-3 max-w-xl text-balance text-muted-foreground">
            {meta.subtitle}
          </p>
        </div>

        <div className="mx-auto mt-10 max-w-3xl">
          <button
            type="button"
            onClick={() => setLaunched(true)}
            className={cn(
              'group relative flex w-full flex-col items-center justify-center gap-4 overflow-hidden rounded-2xl border border-border/60 bg-card/40 px-6 py-12 text-center transition-colors',
              'hover:border-primary/40 hover:bg-card/60 focus-visible:border-primary/60 focus-visible:outline-none',
              'sm:py-20',
            )}
            aria-label={meta.cta}
          >
            <span
              aria-hidden
              className="flex h-16 w-16 items-center justify-center rounded-full bg-primary text-primary-foreground shadow-glow transition-transform group-hover:scale-110 sm:h-20 sm:w-20"
            >
              <Play className="ml-1 h-7 w-7 fill-current sm:h-8 sm:w-8" />
            </span>
            <span className="text-base font-semibold tracking-tight sm:text-lg">
              {meta.cta}
            </span>
            <span className="text-xs text-muted-foreground">
              {t('launcher.hint')}
            </span>
          </button>
        </div>
      </div>
    </section>
  )
}

function LoadingBar({ label }: { label: string }) {
  return (
    <section className="relative py-14 sm:py-24 lg:py-32">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-md text-center">
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-muted-foreground">
            {label}
          </p>
          <div
            role="progressbar"
            aria-busy="true"
            aria-label={label}
            className="relative mt-4 h-1 overflow-hidden rounded-full bg-card"
          >
            <span
              aria-hidden
              className="absolute inset-y-0 left-0 w-1/3 animate-[loadingbar_1.2s_ease-in-out_infinite] rounded-full bg-primary"
            />
          </div>
        </div>
      </div>
    </section>
  )
}
