import { useState, type KeyboardEvent } from 'react'
import { motion } from 'framer-motion'
import { useTranslation } from 'react-i18next'
import { Languages, MapPin, Sparkles } from 'lucide-react'
import { SectionHeading } from '@/components/common/SectionHeading'
import { InstagramIcon, LinkedinIcon } from '@/components/common/SocialIcons'
import { staggerContainer, staggerItem } from '@/components/common/ScrollReveal'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { FOUNDERS } from '@/lib/constants'
import { cn } from '@/lib/utils'

type FounderKey = (typeof FOUNDERS)[number]['key']

export function Team() {
  const { t } = useTranslation()
  const [openKey, setOpenKey] = useState<FounderKey | null>(null)

  const activeFounder = FOUNDERS.find((f) => f.key === openKey) ?? null

  return (
    <section id="team" className="scroll-mt-20 py-14 sm:py-24 lg:py-32">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <SectionHeading
          eyebrow={t('team.eyebrow')}
          title={t('team.title')}
          subtitle={t('team.subtitle')}
        />

        {/*
          Mobile: horizontal row layout (avatar left, name/role right,
          socials at the far right). Drops each card from ~400 px tall to
          ~90 px and fits all three founders in roughly one screen.
          ≥sm: original vertical centered card.
        */}
        <motion.ul
          initial="hidden"
          whileInView="show"
          viewport={{ once: true, margin: '-15%' }}
          variants={staggerContainer}
          className="mx-auto mt-10 grid max-w-5xl grid-cols-1 gap-3 sm:mt-14 sm:grid-cols-2 sm:gap-5 lg:grid-cols-3"
        >
          {FOUNDERS.map((founder) => {
            const name = t(`team.members.${founder.key}.name`)
            const role = t(`team.members.${founder.key}.role`)

            const handleOpen = () => setOpenKey(founder.key)
            const handleKeyDown = (e: KeyboardEvent<HTMLDivElement>) => {
              if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault()
                handleOpen()
              }
            }
            const stopProp = (e: React.MouseEvent | React.KeyboardEvent) =>
              e.stopPropagation()

            return (
              <motion.li key={founder.key} variants={staggerItem}>
                <motion.div
                  role="button"
                  tabIndex={0}
                  aria-label={t('team.modal.openLabel', { name })}
                  onClick={handleOpen}
                  onKeyDown={handleKeyDown}
                  whileHover={{ y: -4 }}
                  whileTap={{ scale: 0.98 }}
                  transition={{ type: 'spring', stiffness: 260, damping: 24 }}
                  className={cn(
                    'group relative flex cursor-pointer items-center gap-4 overflow-hidden rounded-2xl border border-border/60 bg-card/60 p-4 text-left backdrop-blur transition-colors',
                    'sm:flex-col sm:items-center sm:gap-0 sm:p-8 sm:text-center',
                    'hover:border-primary/40 hover:shadow-glow',
                    'focus-visible:border-primary/60 focus-visible:shadow-glow focus-visible:outline-none',
                  )}
                >
                  {founder.photo ? (
                    <img
                      src={founder.photo}
                      alt={name}
                      loading="lazy"
                      decoding="async"
                      className="h-14 w-14 shrink-0 rounded-full object-cover shadow-glow ring-2 ring-primary/40 sm:h-20 sm:w-20"
                    />
                  ) : (
                    <div
                      aria-hidden
                      className="flex h-14 w-14 shrink-0 items-center justify-center rounded-full bg-gradient-brand text-xl font-bold text-primary-foreground shadow-glow sm:h-20 sm:w-20 sm:text-2xl"
                    >
                      {founder.initials}
                    </div>
                  )}

                  <div className="min-w-0 flex-1 sm:flex-none">
                    <h3 className="truncate text-base font-semibold sm:mt-5 sm:text-lg">
                      {name}
                    </h3>
                    <p className="truncate text-xs text-muted-foreground sm:mt-1 sm:text-sm">
                      {role}
                    </p>

                    <span className="mt-3 hidden items-center gap-1.5 rounded-full border border-primary/20 bg-primary/5 px-2.5 py-0.5 text-[10px] font-medium uppercase tracking-widest text-primary opacity-0 transition-opacity group-hover:opacity-100 sm:inline-flex">
                      <Sparkles className="h-2.5 w-2.5" />
                      {t('team.modal.openLabel', { name }).split(' ').slice(0, 2).join(' ')}
                    </span>
                  </div>

                  <div
                    className="ml-auto flex shrink-0 items-center gap-1.5 sm:ml-0 sm:mt-5 sm:gap-2"
                    onClick={stopProp}
                    onKeyDown={stopProp}
                  >
                    {founder.instagram && (
                      <a
                        href={founder.instagram}
                        target="_blank"
                        rel="noreferrer"
                        aria-label={`${name} ${t('team.socials.instagram')}`}
                        className="inline-flex h-8 w-8 items-center justify-center rounded-full border border-border/60 bg-background/40 text-muted-foreground transition-colors hover:border-primary/40 hover:text-primary sm:h-9 sm:w-9"
                      >
                        <InstagramIcon className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
                      </a>
                    )}
                    <a
                      href={founder.linkedin}
                      target="_blank"
                      rel="noreferrer"
                      aria-label={`${name} ${t('team.socials.linkedin')}`}
                      className="inline-flex h-8 w-8 items-center justify-center rounded-full border border-border/60 bg-background/40 text-muted-foreground transition-colors hover:border-primary/40 hover:text-primary sm:h-9 sm:w-9"
                    >
                      <LinkedinIcon className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
                    </a>
                  </div>
                </motion.div>
              </motion.li>
            )
          })}
        </motion.ul>
      </div>

      <Dialog
        open={openKey !== null}
        onOpenChange={(open) => !open && setOpenKey(null)}
      >
        {activeFounder && (
          <FounderDialogContent
            founderKey={activeFounder.key}
            initials={activeFounder.initials}
            instagram={activeFounder.instagram}
            linkedin={activeFounder.linkedin}
            photo={activeFounder.photo}
          />
        )}
      </Dialog>
    </section>
  )
}

interface FounderDialogContentProps {
  founderKey: string
  initials: string
  instagram?: string
  linkedin: string
  photo?: string
}

function FounderDialogContent({
  founderKey,
  initials,
  instagram,
  linkedin,
  photo,
}: FounderDialogContentProps) {
  const { t } = useTranslation()
  const name = t(`team.members.${founderKey}.name`)
  const role = t(`team.members.${founderKey}.role`)
  const location = t(`team.members.${founderKey}.location`)
  const expertise = t(`team.members.${founderKey}.expertise`)
  const bio = t(`team.members.${founderKey}.bio`, {
    returnObjects: true,
  }) as string[]

  return (
    <DialogContent className="max-w-md overflow-hidden border-border/60 bg-card/95 p-6 backdrop-blur-xl sm:p-7">
      <div
        aria-hidden
        className="absolute -inset-[1px] -z-10 rounded-lg bg-gradient-brand opacity-[0.12] blur-md"
      />

      <DialogHeader className="flex-row items-center gap-4 space-y-0 text-left">
        {photo ? (
          <img
            src={photo}
            alt={name}
            loading="lazy"
            decoding="async"
            className="h-14 w-14 shrink-0 rounded-full object-cover shadow-glow ring-2 ring-primary/40"
          />
        ) : (
          <div
            aria-hidden
            className="flex h-14 w-14 shrink-0 items-center justify-center rounded-full bg-gradient-brand text-lg font-bold text-primary-foreground shadow-glow"
          >
            {initials}
          </div>
        )}
        <div className="min-w-0 flex-1">
          <DialogTitle className="text-lg font-bold tracking-tight">
            {name}
          </DialogTitle>
          <DialogDescription className="text-xs text-primary">
            {role}
          </DialogDescription>
        </div>
      </DialogHeader>

      <div className="mt-4 flex flex-wrap items-center gap-1.5 text-xs">
        <span className="inline-flex items-center gap-1.5 rounded-full border border-border/60 bg-background/40 px-2.5 py-1 text-muted-foreground">
          <MapPin className="h-3 w-3" />
          {location}
        </span>
        <span className="inline-flex items-center gap-1.5 rounded-full border border-primary/30 bg-primary/10 px-2.5 py-1 font-medium text-primary">
          <Sparkles className="h-3 w-3" />
          {expertise}
        </span>
        <span className="inline-flex items-center gap-1.5 rounded-full border border-border/60 bg-background/40 px-2.5 py-1 text-muted-foreground">
          <Languages className="h-3 w-3" />
          {t('team.languages')}
        </span>
      </div>

      <div className="mt-4 space-y-2.5 text-sm leading-relaxed text-muted-foreground">
        {bio.map((paragraph, i) => (
          <p key={i}>{paragraph}</p>
        ))}
      </div>

      <div className="mt-5 flex items-center justify-end gap-2 border-t border-border/60 pt-4">
        {instagram && (
          <a
            href={instagram}
            target="_blank"
            rel="noreferrer"
            aria-label={`${name} ${t('team.socials.instagram')}`}
            className="inline-flex h-9 w-9 items-center justify-center rounded-full border border-border/60 bg-background/40 text-muted-foreground transition-colors hover:border-primary/40 hover:text-primary"
          >
            <InstagramIcon className="h-4 w-4" />
          </a>
        )}
        <a
          href={linkedin}
          target="_blank"
          rel="noreferrer"
          aria-label={`${name} ${t('team.socials.linkedin')}`}
          className="inline-flex h-9 w-9 items-center justify-center rounded-full border border-border/60 bg-background/40 text-muted-foreground transition-colors hover:border-primary/40 hover:text-primary"
        >
          <LinkedinIcon className="h-4 w-4" />
        </a>
      </div>
    </DialogContent>
  )
}
