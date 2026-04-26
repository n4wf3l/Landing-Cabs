import { useRef, useState, type FormEvent } from 'react'
import { useTranslation } from 'react-i18next'
import { AnimatePresence, motion } from 'framer-motion'
import { BellRing, CheckCircle2, Loader2, Mail } from 'lucide-react'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import {
  TurnstileWidget,
  type TurnstileWidgetHandle,
} from '@/components/common/TurnstileWidget'
import { subscribeToWaitlist } from '@/lib/api/notify'
import { track } from '@/lib/analytics'
import { cn } from '@/lib/utils'

interface NotifyMeFormProps {
  size?: 'default' | 'lg' | 'xl'
  className?: string
  align?: 'center' | 'start'
}

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

export function NotifyMeForm({
  size = 'lg',
  className,
  align = 'center',
}: NotifyMeFormProps) {
  const { t, i18n } = useTranslation()
  const [email, setEmail] = useState('')
  const [status, setStatus] = useState<'idle' | 'loading' | 'success'>('idle')
  const [error, setError] = useState<string | null>(null)
  const turnstileRef = useRef<TurnstileWidgetHandle | null>(null)

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault()
    setError(null)
    const value = email.trim()
    if (!EMAIL_RE.test(value)) {
      setError(t('notify.errors.invalidEmail'))
      return
    }
    setStatus('loading')
    try {
      const turnstileToken = (await turnstileRef.current?.getToken()) ?? null
      const res = await subscribeToWaitlist({
        email: value,
        locale: i18n.language,
        turnstileToken,
      })
      track('waitlist_signup', { email: value, alreadySubscribed: !!res.alreadySubscribed })
      setStatus('success')
      toast.success(
        res.alreadySubscribed
          ? t('notify.toast.alreadySubscribed')
          : t('notify.toast.success'),
      )
    } catch {
      turnstileRef.current?.reset()
      setStatus('idle')
      setError(t('notify.errors.network'))
    }
  }

  return (
    <div className={cn('w-full max-w-md', align === 'center' && 'mx-auto', className)}>
      <AnimatePresence mode="wait">
        {status === 'success' ? (
          <motion.div
            key="success"
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
            className={cn(
              'flex items-center gap-3 rounded-xl border border-primary/30 bg-primary/10 px-4 py-3 text-sm',
              align === 'center' && 'justify-center text-center',
            )}
          >
            <CheckCircle2 className="h-5 w-5 shrink-0 text-primary" />
            <div>
              <p className="font-medium text-foreground">
                {t('notify.success.title')}
              </p>
              <p className="text-muted-foreground">
                {t('notify.success.subtitle')}
              </p>
            </div>
          </motion.div>
        ) : (
          <motion.form
            key="form"
            onSubmit={handleSubmit}
            initial={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            noValidate
            className="w-full"
          >
            <div
              className={cn(
                'flex flex-col gap-2 sm:flex-row',
                align === 'center' && 'sm:items-center',
              )}
            >
              <div className="relative flex-1">
                <Mail
                  aria-hidden
                  className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground"
                />
                <Input
                  type="email"
                  inputMode="email"
                  autoComplete="email"
                  required
                  aria-label={t('notify.emailLabel')}
                  placeholder={t('notify.placeholder')}
                  value={email}
                  onChange={(e) => {
                    setEmail(e.target.value)
                    if (error) setError(null)
                  }}
                  disabled={status === 'loading'}
                  className={cn(
                    'h-12 pl-9 text-base',
                    error && 'border-destructive focus-visible:ring-destructive',
                  )}
                />
              </div>
              <Button
                type="submit"
                size={size}
                disabled={status === 'loading'}
                className="gap-2"
              >
                {status === 'loading' ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    {t('notify.loading')}
                  </>
                ) : (
                  <>
                    <BellRing className="h-4 w-4" />
                    {t('notify.cta')}
                  </>
                )}
              </Button>
            </div>
            <p
              className={cn(
                'mt-2 text-xs',
                error ? 'text-destructive' : 'text-muted-foreground',
                align === 'center' && 'text-center',
              )}
              role={error ? 'alert' : undefined}
            >
              {error ?? t('notify.privacyNote')}
            </p>
            <TurnstileWidget ref={turnstileRef} mode="invisible" />
          </motion.form>
        )}
      </AnimatePresence>
    </div>
  )
}
