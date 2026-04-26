import { useRef, useState } from 'react'
import { Link } from 'react-router-dom'
import { useForm, Controller } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Trans, useTranslation } from 'react-i18next'
import { toast } from 'sonner'
import { motion, useReducedMotion } from 'framer-motion'
import {
  CheckCircle2,
  Clock,
  Mail,
  MapPin,
  MessageCircle,
  Send,
  Shield,
  Sparkles,
} from 'lucide-react'
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion'
import { Button } from '@/components/ui/button'
import { Checkbox } from '@/components/ui/checkbox'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { SEO } from '@/components/common/SEO'
import { GlowEffect } from '@/components/common/GlowEffect'
import {
  TurnstileWidget,
  type TurnstileWidgetHandle,
} from '@/components/common/TurnstileWidget'
import { InstagramIcon, LinkedinIcon } from '@/components/common/SocialIcons'
import {
  staggerContainer,
  staggerItem,
} from '@/components/common/ScrollReveal'
import { submitContact, type ContactSubject } from '@/lib/api/contact'
import { BRAND, FOUNDERS } from '@/lib/constants'
import { breadcrumbJsonLd, faqPageJsonLd } from '@/lib/seo'
import { track } from '@/lib/analytics'
import { cn } from '@/lib/utils'

const SUBJECTS: ContactSubject[] = [
  'beta',
  'demo',
  'pricing',
  'partnership',
  'press',
  'other',
]

const FAQ_KEYS = [
  'when',
  'timing',
  'minimum',
  'regions',
  'integrations',
  'drivers',
  'migration',
  'accounting',
  'hosting',
  'portability',
  'pricing',
] as const

const schema = z
  .object({
    name: z.string().min(2, 'contact.errors.name').max(80),
    email: z.string().email('contact.errors.email'),
    company: z.string().max(100).optional(),
    subject: z.enum(['beta', 'demo', 'pricing', 'partnership', 'press', 'other']),
    message: z.string().min(10, 'contact.errors.message').max(2000),
    consent: z.boolean(),
  })
  .refine((d) => d.consent === true, {
    path: ['consent'],
    message: 'contact.errors.consent',
  })

type FormValues = z.infer<typeof schema>

export default function Contact() {
  const { t, i18n } = useTranslation()
  const reduce = useReducedMotion()
  const [done, setDone] = useState(false)
  const turnstileRef = useRef<TurnstileWidgetHandle | null>(null)

  const form = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: {
      name: '',
      email: '',
      company: '',
      subject: 'beta',
      message: '',
      consent: false,
    },
  })

  const onSubmit = async (v: FormValues) => {
    try {
      const turnstileToken = (await turnstileRef.current?.getToken()) ?? null
      await submitContact({
        name: v.name,
        email: v.email,
        company: v.company,
        subject: v.subject,
        message: v.message,
        locale: i18n.language,
        turnstileToken,
      })
      track('contact_submitted', { subject: v.subject })
      toast.success(t('contact.successToast'))
      setDone(true)
    } catch {
      turnstileRef.current?.reset()
      toast.error(t('contact.errorToast'), {
        action: {
          label: t('contact.retry'),
          onClick: () => void onSubmit(v),
        },
      })
    }
  }

  const err = (k: keyof FormValues): string | undefined => {
    const e = form.formState.errors[k]
    if (!e) return undefined
    const msg = (e as { message?: string }).message
    return msg ? t(msg) : undefined
  }

  const faqItems = FAQ_KEYS.map((k) => ({
    question: t(`contact.faq.items.${k}.q`),
    answer: t(`contact.faq.items.${k}.a`),
  }))

  return (
    <>
      <SEO
        path="/contact"
        title={t('nav.contact')}
        description={t('contact.subtitle')}
        jsonLd={[
          breadcrumbJsonLd([
            { name: BRAND.name, path: '/' },
            { name: t('nav.contact'), path: '/contact' },
          ]),
          faqPageJsonLd(faqItems),
        ]}
      />

      {/*
        Hero + form sit on a single shared backdrop so the GlowEffect can
        span both without a hard seam. The mask-image fades the glow at
        the bottom so it dissolves smoothly into the FAQ section below.
      */}
      <div className="relative overflow-hidden">
        <div
          aria-hidden
          className="absolute inset-0 [mask-image:linear-gradient(to_bottom,black_55%,transparent_100%)]"
        >
          <GlowEffect color="mixed" className="opacity-70" />
        </div>

        <section className="relative pt-20 sm:pt-28">
          <div className="container relative mx-auto px-4 sm:px-6 lg:px-8">
            <div className="mx-auto max-w-3xl text-center">
              <span className="inline-flex items-center gap-2 rounded-full border border-primary/30 bg-primary/10 px-3 py-1 text-xs font-medium text-primary">
                <Sparkles className="h-3 w-3" />
                {t('contact.eyebrow')}
              </span>
              <h1 className="mt-6 text-balance text-4xl font-extrabold tracking-tight sm:text-5xl lg:text-6xl">
                {t('contact.title')}
              </h1>
              <p className="mx-auto mt-4 max-w-2xl text-balance text-muted-foreground sm:text-lg">
                {t('contact.subtitle')}
              </p>
            </div>
          </div>
        </section>

        <section className="relative pb-24 pt-14 sm:pt-20">
          <div className="container relative mx-auto px-4 sm:px-6 lg:px-8">
          <div className="mx-auto grid max-w-6xl gap-8 lg:grid-cols-[1.4fr_1fr]">
            <motion.div
              initial={reduce ? false : { opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
            >
              {done ? (
                <SuccessCard onBack={() => setDone(false)} />
              ) : (
                <div className="relative overflow-hidden rounded-2xl border border-border/60 bg-card/60 p-6 shadow-card backdrop-blur sm:p-10">
                  <div
                    aria-hidden
                    className="absolute -inset-[1px] -z-10 rounded-2xl bg-gradient-brand opacity-[0.08] blur-md"
                  />

                  <FoundersInline />

                  <form
                    onSubmit={form.handleSubmit(onSubmit)}
                    className="mt-8 grid gap-5"
                  >
                    <Field
                      label={t('contact.fields.name.label')}
                      error={err('name')}
                    >
                      <Input
                        {...form.register('name')}
                        autoComplete="name"
                        placeholder={t('contact.fields.name.placeholder')}
                      />
                    </Field>

                    <div className="grid gap-5 sm:grid-cols-2">
                      <Field
                        label={t('contact.fields.email.label')}
                        error={err('email')}
                      >
                        <Input
                          type="email"
                          {...form.register('email')}
                          autoComplete="email"
                          placeholder={t('contact.fields.email.placeholder')}
                        />
                      </Field>
                      <Field
                        label={t('contact.fields.company.label')}
                        error={err('company')}
                      >
                        <Input
                          {...form.register('company')}
                          autoComplete="organization"
                          placeholder={t('contact.fields.company.placeholder')}
                        />
                      </Field>
                    </div>

                    <Field
                      label={t('contact.subjects.label')}
                      error={err('subject')}
                    >
                      <Controller
                        control={form.control}
                        name="subject"
                        render={({ field }) => (
                          <Select
                            value={field.value}
                            onValueChange={(v) =>
                              field.onChange(v as ContactSubject)
                            }
                          >
                            <SelectTrigger>
                              <SelectValue
                                placeholder={t('contact.subjects.placeholder')}
                              />
                            </SelectTrigger>
                            <SelectContent>
                              {SUBJECTS.map((s) => (
                                <SelectItem key={s} value={s}>
                                  {t(`contact.subjects.${s}`)}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        )}
                      />
                    </Field>

                    <Field
                      label={t('contact.fields.message.label')}
                      error={err('message')}
                    >
                      <textarea
                        rows={6}
                        {...form.register('message')}
                        placeholder={t('contact.fields.message.placeholder')}
                        className="flex w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background"
                      />
                    </Field>

                    <Controller
                      control={form.control}
                      name="consent"
                      render={({ field }) => (
                        <div className="space-y-1.5">
                          <div className="flex items-start gap-3 rounded-lg border border-border/40 bg-background/30 p-3">
                            <Checkbox
                              id="contact-consent"
                              checked={!!field.value}
                              onCheckedChange={(v) => field.onChange(v === true)}
                              className="mt-0.5"
                            />
                            <Label
                              htmlFor="contact-consent"
                              className="text-xs font-normal leading-relaxed text-muted-foreground"
                            >
                              <Trans
                                i18nKey="contact.consent"
                                components={{
                                  1: (
                                    <Link
                                      to="/legal/privacy"
                                      className="text-primary underline-offset-2 hover:underline"
                                    />
                                  ),
                                }}
                              />
                            </Label>
                          </div>
                          {err('consent') && (
                            <p className="text-xs text-destructive">
                              {err('consent')}
                            </p>
                          )}
                        </div>
                      )}
                    />

                    <div className="flex flex-col-reverse items-stretch gap-3 pt-2 sm:flex-row sm:items-center sm:justify-between">
                      <p className="flex items-center gap-2 text-xs text-muted-foreground">
                        <Shield className="h-3.5 w-3.5" />
                        {t('contact.noCommercialUse')}
                      </p>
                      <Button
                        type="submit"
                        size="lg"
                        disabled={form.formState.isSubmitting}
                        className="gap-2"
                      >
                        <Send className="h-4 w-4" />
                        {form.formState.isSubmitting
                          ? t('common.loading')
                          : t('contact.submit')}
                      </Button>
                    </div>
                    <TurnstileWidget ref={turnstileRef} />
                  </form>
                </div>
              )}
            </motion.div>

            <motion.aside
              initial={reduce ? false : { opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.08 }}
              className="space-y-4 lg:sticky lg:top-24 lg:self-start"
            >
              <ChannelsCard />
              <ResponseTimeCard />
              <LocationCard />
            </motion.aside>
          </div>
        </div>
        </section>
      </div>

      <FAQSection />
    </>
  )
}

interface FieldProps {
  label: string
  error?: string
  children: React.ReactNode
}

function Field({ label, error, children }: FieldProps) {
  return (
    <div className="space-y-1.5">
      <Label className="text-sm font-medium">{label}</Label>
      {children}
      {error && <p className="text-xs text-destructive">{error}</p>}
    </div>
  )
}

function FoundersInline() {
  const { t } = useTranslation()
  return (
    <div className="flex items-start gap-4 rounded-xl border border-primary/20 bg-primary/[0.04] p-4">
      <div className="flex shrink-0 -space-x-2">
        {FOUNDERS.map((f, i) => (
          <span
            key={f.key}
            className={cn(
              'inline-flex h-9 w-9 items-center justify-center overflow-hidden rounded-full ring-2 ring-card',
              !f.photo &&
                'bg-gradient-brand text-xs font-bold text-primary-foreground',
              i === 0 && 'z-30',
              i === 1 && 'z-20',
              i === 2 && 'z-10',
            )}
          >
            {f.photo ? (
              <img
                src={f.photo}
                alt={f.initials}
                loading="lazy"
                decoding="async"
                className="h-full w-full object-cover"
              />
            ) : (
              f.initials
            )}
          </span>
        ))}
      </div>
      <div className="flex-1">
        <p className="text-sm font-semibold tracking-tight">
          {t('contact.founders.title')}
        </p>
        <p className="mt-0.5 text-xs leading-relaxed text-muted-foreground">
          {t('contact.founders.description')}
        </p>
      </div>
    </div>
  )
}

interface InfoCardProps {
  title: string
  children: React.ReactNode
}

function InfoCard({ title, children }: InfoCardProps) {
  return (
    <div className="rounded-2xl border border-border/60 bg-card/40 p-5 backdrop-blur">
      <h3 className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">
        {title}
      </h3>
      <div className="mt-4">{children}</div>
    </div>
  )
}

function ChannelsCard() {
  const { t } = useTranslation()
  const channels = [
    {
      key: 'email',
      Icon: Mail,
      href: `mailto:${BRAND.email}`,
      external: false,
      pending: false,
    },
    {
      key: 'linkedin',
      Icon: LinkedinIcon,
      href: BRAND.linkedin,
      external: true,
      pending: !BRAND.socialsLive,
    },
    {
      key: 'instagram',
      Icon: InstagramIcon,
      href: BRAND.instagram,
      external: true,
      pending: !BRAND.socialsLive,
    },
    {
      key: 'whatsapp',
      Icon: MessageCircle,
      href: 'https://wa.me/3220000000',
      external: true,
      pending: false,
    },
  ] as const

  return (
    <InfoCard title={t('contact.channels.title')}>
      <motion.ul
        initial="hidden"
        whileInView="show"
        viewport={{ once: true }}
        variants={staggerContainer}
        className="space-y-1"
      >
        {channels.map(({ key, Icon, href, external, pending }) => {
          const label = t(`contact.channels.${key}.label`)
          const value = pending
            ? t('contact.channels.comingSoon')
            : t(`contact.channels.${key}.value`)

          const inner = (
            <>
              <span
                className={cn(
                  'flex h-9 w-9 items-center justify-center rounded-lg ring-1 transition-colors',
                  pending
                    ? 'bg-muted/40 text-muted-foreground/70 ring-border/40'
                    : 'bg-primary/10 text-primary ring-primary/20 group-hover:bg-primary/20',
                )}
              >
                <Icon className="h-4 w-4" />
              </span>
              <span className="flex min-w-0 flex-1 flex-col leading-tight">
                <span className="flex items-center gap-2 text-sm font-medium">
                  <span>{label}</span>
                  {pending && (
                    <span className="inline-flex items-center gap-1 rounded-full border border-primary/30 bg-primary/10 px-1.5 py-0.5 text-[10px] font-semibold uppercase tracking-wider text-primary">
                      <Sparkles className="h-2.5 w-2.5" />
                      {t('contact.channels.comingSoonShort')}
                    </span>
                  )}
                </span>
                <span
                  className={cn(
                    'truncate text-xs',
                    pending ? 'text-muted-foreground/70' : 'text-muted-foreground',
                  )}
                >
                  {value}
                </span>
              </span>
            </>
          )

          return (
            <motion.li key={key} variants={staggerItem}>
              {pending ? (
                <span
                  aria-disabled="true"
                  title={t('contact.channels.comingSoon')}
                  className="flex cursor-not-allowed items-center gap-3 rounded-lg p-2 opacity-80"
                >
                  {inner}
                </span>
              ) : (
                <a
                  href={href}
                  target={external ? '_blank' : undefined}
                  rel={external ? 'noreferrer' : undefined}
                  className="group flex items-center gap-3 rounded-lg p-2 transition-colors hover:bg-accent/60"
                >
                  {inner}
                </a>
              )}
            </motion.li>
          )
        })}
      </motion.ul>
    </InfoCard>
  )
}

function ResponseTimeCard() {
  const { t } = useTranslation()
  return (
    <InfoCard title={t('contact.responseTime.title')}>
      <div className="flex items-start gap-3">
        <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary ring-1 ring-primary/20">
          <Clock className="h-4 w-4" />
        </span>
        <div className="flex-1">
          <p className="text-sm font-semibold">
            {t('contact.responseTime.value')}
          </p>
          <p className="mt-1 text-xs leading-relaxed text-muted-foreground">
            {t('contact.responseTime.description')}
          </p>
        </div>
      </div>
    </InfoCard>
  )
}

function LocationCard() {
  const { t } = useTranslation()
  return (
    <InfoCard title={t('contact.location.title')}>
      <div className="flex items-start gap-3">
        <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary ring-1 ring-primary/20">
          <MapPin className="h-4 w-4" />
        </span>
        <div className="flex-1">
          <p className="text-sm font-semibold">
            {t('contact.location.value')}
          </p>
          <p className="mt-1 text-xs leading-relaxed text-muted-foreground">
            {t('contact.location.description')}
          </p>
        </div>
      </div>
    </InfoCard>
  )
}

function FAQSection() {
  const { t } = useTranslation()
  return (
    <section
      id="faq"
      className="scroll-mt-24 border-t border-border/60 bg-background/40 py-20 sm:py-24"
    >
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-3xl text-center">
          <h2 className="text-balance text-3xl font-bold tracking-tight sm:text-4xl">
            {t('contact.faq.title')}
          </h2>
          <p className="mt-3 text-balance text-muted-foreground">
            {t('contact.faq.subtitle')}
          </p>
        </div>
        <div className="mx-auto mt-10 max-w-3xl rounded-xl border border-border/60 bg-card/40 px-6 backdrop-blur">
          <Accordion type="single" collapsible>
            {FAQ_KEYS.map((k) => (
              <AccordionItem key={k} value={k}>
                <AccordionTrigger>
                  {t(`contact.faq.items.${k}.q`)}
                </AccordionTrigger>
                <AccordionContent>
                  {t(`contact.faq.items.${k}.a`)}
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </div>
      </div>
    </section>
  )
}

function SuccessCard({ onBack }: { onBack: () => void }) {
  const { t } = useTranslation()
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.96 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ type: 'spring', stiffness: 240, damping: 22 }}
      className="relative overflow-hidden rounded-2xl border border-primary/40 bg-card/70 p-10 text-center backdrop-blur sm:p-14"
    >
      <div
        aria-hidden
        className="absolute -inset-[1px] -z-10 rounded-2xl bg-gradient-brand opacity-30 blur-md"
      />
      <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-primary/15 text-primary ring-2 ring-primary/30">
        <CheckCircle2 className="h-8 w-8" />
      </div>
      <h2 className="mt-6 text-2xl font-bold tracking-tight sm:text-3xl">
        {t('contact.success.title')}
      </h2>
      <p className="mt-3 text-muted-foreground">
        {t('contact.success.subtitle')}
      </p>
      <div className="mt-8 flex justify-center">
        <Button size="lg" variant="outline" onClick={onBack}>
          {t('contact.success.sendAnother')}
        </Button>
      </div>
    </motion.div>
  )
}
