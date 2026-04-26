import { useState } from 'react'
import { motion, useReducedMotion } from 'framer-motion'
import {
  BellRing,
  CalendarClock,
  Check,
  Maximize2,
  Play,
  Wallet,
  type LucideIcon,
} from 'lucide-react'
import { useTranslation } from 'react-i18next'
import { SectionHeading } from '@/components/common/SectionHeading'
import { staggerContainer, staggerItem } from '@/components/common/ScrollReveal'
import { FullscreenSimulator } from './driver-app/FullscreenSimulator'
import { PhoneResetButton } from './driver-app/PhoneResetButton'
import { PhoneShell } from './driver-app/PhoneShell'
import { PhoneSimProvider } from './driver-app/usePhoneSim'

interface BulletDef {
  key: string
  Icon: LucideIcon
}

const BULLETS: BulletDef[] = [
  { key: 'startShift', Icon: Play },
  { key: 'planning', Icon: CalendarClock },
  { key: 'revenue', Icon: Wallet },
  { key: 'alerts', Icon: BellRing },
]

export function DriverApp() {
  const { t } = useTranslation()
  const reduce = useReducedMotion()
  const [fullscreen, setFullscreen] = useState(false)

  return (
    <section
      id="app"
      className="relative scroll-mt-20 overflow-hidden py-24 sm:py-32"
    >
      <div className="container relative mx-auto px-4 sm:px-6 lg:px-8">
        <SectionHeading
          eyebrow={t('driverApp.eyebrow')}
          title={t('driverApp.title')}
          subtitle={t('driverApp.subtitle')}
        />

        <div className="mx-auto mt-16 grid max-w-6xl items-center gap-12 lg:grid-cols-[1fr_auto] lg:gap-20">
          <motion.ul
            initial="hidden"
            whileInView="show"
            viewport={{ once: true, margin: '-15%' }}
            variants={staggerContainer}
            className="space-y-5"
          >
            {BULLETS.map(({ key, Icon }) => (
              <motion.li
                key={key}
                variants={staggerItem}
                className="flex items-start gap-4"
              >
                <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary ring-1 ring-primary/20">
                  <Icon className="h-4 w-4" />
                </span>
                <div className="flex-1">
                  <h3 className="text-base font-semibold tracking-tight">
                    {t(`driverApp.bullets.${key}.title`)}
                  </h3>
                  <p className="mt-1 text-sm leading-relaxed text-muted-foreground">
                    {t(`driverApp.bullets.${key}.description`)}
                  </p>
                </div>
              </motion.li>
            ))}

            <motion.div
              variants={staggerItem}
              className="flex flex-wrap gap-2 pt-2"
            >
              <span className="inline-flex items-center gap-1.5 rounded-full border border-border/60 bg-card/60 px-3 py-1 text-xs font-medium backdrop-blur">
                <Check className="h-3 w-3 text-primary" />
                {t('driverApp.platforms.ios')}
              </span>
              <span className="inline-flex items-center gap-1.5 rounded-full border border-border/60 bg-card/60 px-3 py-1 text-xs font-medium backdrop-blur">
                <Check className="h-3 w-3 text-primary" />
                {t('driverApp.platforms.android')}
              </span>
              <span className="inline-flex items-center gap-1.5 rounded-full border border-border/60 bg-card/60 px-3 py-1 text-xs font-medium backdrop-blur">
                <Check className="h-3 w-3 text-primary" />
                {t('driverApp.platforms.offline')}
              </span>
            </motion.div>
          </motion.ul>

          <PhoneSimProvider>
            <div className="flex flex-col items-center">
              <PhoneShell reduce={!!reduce} />

              {/*
                Mobile only: a clear "experience this as a real app" CTA
                that opens the simulator at viewport size. Hidden on lg+
                where the embedded shell is already big enough alongside
                the bullet list.
              */}
              <button
                type="button"
                onClick={() => setFullscreen(true)}
                className="mt-4 inline-flex items-center gap-2 rounded-full border border-primary/30 bg-primary/10 px-4 py-2 text-sm font-semibold text-primary shadow-glow transition-all hover:-translate-y-0.5 hover:bg-primary/15 active:scale-[0.98] lg:hidden"
              >
                <Maximize2 className="h-4 w-4" />
                {t('driverApp.fullscreen.openCta')}
              </button>

              <PhoneResetButton />

              <FullscreenSimulator
                open={fullscreen}
                onClose={() => setFullscreen(false)}
                reduce={!!reduce}
              />
            </div>
          </PhoneSimProvider>
        </div>
      </div>
    </section>
  )
}
