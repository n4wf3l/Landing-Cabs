import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { useTranslation } from 'react-i18next'
import { toast } from 'sonner'
import { motion, useReducedMotion } from 'framer-motion'
import { CheckCircle2, Mail, Send, Sparkles } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { SEO } from '@/components/common/SEO'
import { GlowEffect } from '@/components/common/GlowEffect'
import { submitContact } from '@/lib/api/contact'
import { BRAND } from '@/lib/constants'
import { track } from '@/lib/analytics'

const schema = z.object({
  name: z.string().min(2, 'contact.errors.name').max(80),
  email: z.string().email('contact.errors.email'),
  company: z.string().max(100).optional(),
  message: z.string().min(10, 'contact.errors.message').max(2000),
})
type FormValues = z.infer<typeof schema>

export default function Contact() {
  const { t } = useTranslation()
  const reduce = useReducedMotion()
  const [done, setDone] = useState(false)

  const form = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: { name: '', email: '', company: '', message: '' },
  })

  const onSubmit = async (v: FormValues) => {
    try {
      await submitContact({
        name: v.name,
        email: v.email,
        company: v.company,
        message: v.message,
      })
      track('contact_submitted', {})
      toast.success(t('contact.successToast'))
      setDone(true)
    } catch {
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

  return (
    <>
      <SEO
        path="/contact"
        title={t('nav.contact')}
        description={t('contact.subtitle')}
      />

      <section className="relative overflow-hidden pt-20 sm:pt-28">
        <GlowEffect color="mixed" className="opacity-70" />
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

      <section className="relative pb-24 pt-16 sm:pt-20">
        <div className="container relative mx-auto px-4 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-2xl">
            <motion.div
              initial={reduce ? false : { opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
            >
              {done ? (
                <SuccessCard onBack={() => setDone(false)} />
              ) : (
                <form
                  onSubmit={form.handleSubmit(onSubmit)}
                  className="relative overflow-hidden rounded-2xl border border-border/60 bg-card/60 p-6 shadow-card backdrop-blur sm:p-10"
                >
                  <div
                    aria-hidden
                    className="absolute -inset-[1px] -z-10 rounded-2xl bg-gradient-brand opacity-[0.08] blur-md"
                  />
                  <div className="grid gap-5">
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

                    <div className="flex flex-col items-stretch gap-3 pt-2 sm:flex-row sm:items-center sm:justify-between">
                      <a
                        href={`mailto:${BRAND.email}`}
                        className="inline-flex items-center gap-2 text-sm text-muted-foreground underline-offset-4 hover:text-foreground hover:underline"
                      >
                        <Mail className="h-4 w-4" />
                        {BRAND.email}
                      </a>
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
                  </div>
                </form>
              )}
            </motion.div>
          </div>
        </div>
      </section>
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
