import { motion } from 'framer-motion'
import {
  ClipboardList,
  FileSpreadsheet,
  MapPinOff,
  MessageCircleWarning,
  PhoneCall,
  ReceiptText,
  type LucideIcon,
} from 'lucide-react'
import { useTranslation } from 'react-i18next'
import { SectionHeading } from '@/components/common/SectionHeading'
import { staggerContainer, staggerItem } from '@/components/common/ScrollReveal'

interface Pain {
  key: string
  Icon: LucideIcon
}

const PAINS: Pain[] = [
  { key: 'excel', Icon: FileSpreadsheet },
  { key: 'paper', Icon: ClipboardList },
  { key: 'whatsapp', Icon: MessageCircleWarning },
  { key: 'clockin', Icon: PhoneCall },
  { key: 'location', Icon: MapPinOff },
  { key: 'reconciliation', Icon: ReceiptText },
]

export function PainPoints() {
  const { t } = useTranslation()

  return (
    <section
      id="pains"
      className="relative snap-start scroll-mt-20 overflow-hidden bg-card/30 py-24 sm:py-32 lg:snap-align-none"
    >
      <div
        aria-hidden
        className="pointer-events-none absolute inset-x-0 top-0 h-32 bg-gradient-to-b from-background to-transparent"
      />

      <div className="container relative mx-auto px-4 sm:px-6 lg:px-8">
        <SectionHeading
          eyebrow={t('pains.eyebrow')}
          title={t('pains.title')}
          subtitle={t('pains.subtitle')}
        />

        <motion.ul
          initial="hidden"
          whileInView="show"
          viewport={{ once: true, margin: '-15%' }}
          variants={staggerContainer}
          className="mx-auto mt-14 grid max-w-6xl grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3"
        >
          {PAINS.map(({ key, Icon }) => (
            <motion.li
              key={key}
              variants={staggerItem}
              className="group relative overflow-hidden rounded-xl border border-border/60 bg-background/50 p-5 transition-colors hover:border-rose-500/30"
            >
              <div
                aria-hidden
                className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-rose-500/40 to-transparent opacity-0 transition-opacity group-hover:opacity-100"
              />
              <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-rose-500/10 text-rose-400 ring-1 ring-rose-500/20">
                <Icon className="h-4 w-4" />
              </div>
              <h3 className="mt-4 text-sm font-semibold leading-snug">
                {t(`pains.items.${key}.title`)}
              </h3>
              <p className="mt-1.5 text-xs leading-relaxed text-muted-foreground">
                {t(`pains.items.${key}.description`)}
              </p>
            </motion.li>
          ))}
        </motion.ul>

        <motion.p
          initial={{ opacity: 0, y: 8 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.4, delay: 0.3 }}
          className="mx-auto mt-10 max-w-xl text-center text-sm text-muted-foreground"
        >
          {t('pains.bridge')}{' '}
          <a
            href="#admin"
            className="font-semibold text-primary underline-offset-4 hover:underline"
          >
            {t('pains.bridgeCta')}
          </a>
        </motion.p>
      </div>
    </section>
  )
}
