import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useTranslation } from 'react-i18next'
import { LayoutDashboard, CarFront, Users } from 'lucide-react'
import { SectionHeading } from '@/components/common/SectionHeading'
import { cn } from '@/lib/utils'

type ShotId = 'dashboard' | 'vehicles' | 'drivers'

interface Shot {
  id: ShotId
  src: string
  Icon: typeof LayoutDashboard
}

const SHOTS: Shot[] = [
  { id: 'dashboard', src: '/screenshot-dashboard.png', Icon: LayoutDashboard },
  { id: 'vehicles', src: '/screenshot-vehicles.png', Icon: CarFront },
  { id: 'drivers', src: '/screenshot-drivers.png', Icon: Users },
]

export function ProductShowcase() {
  const { t } = useTranslation()
  const [active, setActive] = useState<ShotId>('dashboard')
  const current = SHOTS.find((s) => s.id === active) ?? SHOTS[0]

  return (
    <section className="relative py-24 sm:py-32">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <SectionHeading
          title={t('showcase.title')}
          subtitle={t('showcase.subtitle')}
        />

        <div className="mt-10 flex flex-wrap justify-center gap-2">
          {SHOTS.map(({ id, Icon }) => {
            const isActive = id === active
            return (
              <button
                key={id}
                type="button"
                onClick={() => setActive(id)}
                aria-pressed={isActive}
                className={cn(
                  'group relative inline-flex items-center gap-2 rounded-full border px-4 py-2 text-sm font-medium transition-all',
                  isActive
                    ? 'border-primary/50 bg-primary/10 text-foreground shadow-glow'
                    : 'border-border/60 bg-card/40 text-muted-foreground hover:border-primary/30 hover:text-foreground',
                )}
              >
                <Icon className="h-4 w-4" />
                {t(`showcase.tabs.${id}.label`)}
              </button>
            )
          })}
        </div>

        <motion.div
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-15%' }}
          transition={{ duration: 0.6 }}
          className="relative mx-auto mt-10 max-w-6xl"
        >
          <div
            aria-hidden
            className="absolute -inset-6 -z-10 rounded-[2rem] bg-gradient-brand opacity-20 blur-3xl"
          />

          <div className="relative overflow-hidden rounded-2xl border border-border/60 bg-card/80 shadow-glow-lg backdrop-blur">
            <BrowserChrome />

            <div className="relative aspect-[16/10] w-full bg-background/60">
              <AnimatePresence mode="wait">
                <motion.img
                  key={current.id}
                  src={current.src}
                  alt={t(`showcase.tabs.${current.id}.alt`)}
                  loading="lazy"
                  decoding="async"
                  initial={{ opacity: 0, scale: 1.02 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.98 }}
                  transition={{ duration: 0.35 }}
                  className="absolute inset-0 h-full w-full object-cover object-top"
                />
              </AnimatePresence>
            </div>
          </div>

          <AnimatePresence mode="wait">
            <motion.p
              key={current.id}
              initial={{ opacity: 0, y: 4 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.25 }}
              className="mx-auto mt-6 max-w-2xl text-center text-sm text-muted-foreground"
            >
              {t(`showcase.tabs.${current.id}.caption`)}
            </motion.p>
          </AnimatePresence>
        </motion.div>
      </div>
    </section>
  )
}

function BrowserChrome() {
  return (
    <div
      aria-hidden
      className="flex items-center gap-2 border-b border-border/60 bg-muted/40 px-4 py-2.5"
    >
      <div className="flex gap-1.5">
        <span className="h-2.5 w-2.5 rounded-full bg-red-500/70" />
        <span className="h-2.5 w-2.5 rounded-full bg-yellow-500/70" />
        <span className="h-2.5 w-2.5 rounded-full bg-green-500/70" />
      </div>
      <div className="mx-auto flex items-center gap-2 rounded-md border border-border/60 bg-background/60 px-3 py-1 text-xs text-muted-foreground">
        <span className="h-1.5 w-1.5 rounded-full bg-primary" />
        app.cabs.brussels
      </div>
      <div className="w-[46px]" />
    </div>
  )
}
