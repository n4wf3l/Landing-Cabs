import {
  FileSpreadsheet,
  Layers,
  Scale,
  Sliders,
  UserCog,
  Wallet,
  type LucideIcon,
} from 'lucide-react'
import { useTranslation } from 'react-i18next'
import { SectionHeading } from '@/components/common/SectionHeading'
import { cn } from '@/lib/utils'

interface FeatureDef {
  key: string
  Icon: LucideIcon
}

const FEATURES: FeatureDef[] = [
  { key: 'aggregation', Icon: Layers },
  { key: 'reconciliation', Icon: Scale },
  { key: 'time', Icon: Wallet },
  { key: 'structure', Icon: Sliders },
  { key: 'drivers', Icon: UserCog },
  { key: 'exports', Icon: FileSpreadsheet },
]

export function Features() {
  const { t } = useTranslation()
  return (
    <section id="features" className="scroll-mt-20 py-24 sm:py-32">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <SectionHeading
          title={t('features.title')}
          subtitle={t('features.subtitle')}
        />
        {/* Plain <ul> + <li>. The previous motion.ul + staggerContainer
            + 6 motion.li with whileHover queued an animation chain that
            stalled the main thread on real mobile and held up every
            section below from rendering. CSS hover:translate keeps the
            lift-on-hover effect on desktop without any framer cost. */}
        <ul className="mx-auto mt-16 grid max-w-6xl grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
          {FEATURES.map(({ key, Icon }) => (
            <li
              key={key}
              className={cn(
                'group relative overflow-hidden rounded-xl border border-border/60 bg-card/60 p-6 backdrop-blur transition-all duration-300',
                'hover:-translate-y-1 hover:border-primary/40 hover:shadow-glow',
              )}
            >
              <div
                aria-hidden
                className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-primary/40 to-transparent opacity-0 transition-opacity group-hover:opacity-100"
              />
              <div className="flex h-11 w-11 items-center justify-center rounded-lg bg-primary/10 text-primary ring-1 ring-primary/20">
                <Icon className="h-5 w-5" />
              </div>
              <h3 className="mt-5 text-lg font-semibold">
                {t(`features.items.${key}.title`)}
              </h3>
              <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
                {t(`features.items.${key}.description`)}
              </p>
            </li>
          ))}
        </ul>
      </div>
    </section>
  )
}
