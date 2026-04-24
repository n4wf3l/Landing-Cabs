import { motion } from 'framer-motion'
import { useTranslation } from 'react-i18next'
import { SectionHeading } from '@/components/common/SectionHeading'
import { InstagramIcon, LinkedinIcon } from '@/components/common/SocialIcons'
import { staggerContainer, staggerItem } from '@/components/common/ScrollReveal'
import { FOUNDERS } from '@/lib/constants'
import { cn } from '@/lib/utils'

export function Team() {
  const { t } = useTranslation()
  return (
    <section id="team" className="py-24 sm:py-32">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <SectionHeading
          eyebrow={t('team.eyebrow')}
          title={t('team.title')}
          subtitle={t('team.subtitle')}
        />

        <motion.ul
          initial="hidden"
          whileInView="show"
          viewport={{ once: true, margin: '-15%' }}
          variants={staggerContainer}
          className="mx-auto mt-14 grid max-w-5xl grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3"
        >
          {FOUNDERS.map((founder) => {
            const name = t(`team.members.${founder.key}.name`)
            const role = t(`team.members.${founder.key}.role`)
            return (
              <motion.li
                key={founder.key}
                variants={staggerItem}
                whileHover={{ y: -4 }}
                transition={{ type: 'spring', stiffness: 260, damping: 24 }}
                className={cn(
                  'group relative flex flex-col items-center overflow-hidden rounded-2xl border border-border/60 bg-card/60 p-8 text-center backdrop-blur transition-all',
                  'hover:border-primary/40 hover:shadow-glow',
                )}
              >
                <div
                  aria-hidden
                  className="flex h-20 w-20 items-center justify-center rounded-full bg-gradient-brand text-2xl font-bold text-primary-foreground shadow-glow"
                >
                  {founder.initials}
                </div>
                <h3 className="mt-5 text-lg font-semibold">{name}</h3>
                <p className="mt-1 text-sm text-muted-foreground">{role}</p>
                <div className="mt-5 flex items-center gap-2">
                  <a
                    href={founder.instagram}
                    target="_blank"
                    rel="noreferrer"
                    aria-label={`${name} ${t('team.socials.instagram')}`}
                    className="inline-flex h-9 w-9 items-center justify-center rounded-full border border-border/60 bg-background/40 text-muted-foreground transition-colors hover:border-primary/40 hover:text-primary"
                  >
                    <InstagramIcon className="h-4 w-4" />
                  </a>
                  <a
                    href={founder.linkedin}
                    target="_blank"
                    rel="noreferrer"
                    aria-label={`${name} ${t('team.socials.linkedin')}`}
                    className="inline-flex h-9 w-9 items-center justify-center rounded-full border border-border/60 bg-background/40 text-muted-foreground transition-colors hover:border-primary/40 hover:text-primary"
                  >
                    <LinkedinIcon className="h-4 w-4" />
                  </a>
                </div>
              </motion.li>
            )
          })}
        </motion.ul>
      </div>
    </section>
  )
}
