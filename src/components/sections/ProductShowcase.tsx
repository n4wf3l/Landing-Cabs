import { motion } from 'framer-motion'
import { useTranslation } from 'react-i18next'
import { SectionHeading } from '@/components/common/SectionHeading'
import { AdminShell } from './admin-app/AdminShell'
import { AdminAppProvider } from './admin-app/useAdminApp'
import { AdminResetButton } from './admin-app/parts/AdminResetButton'

export function ProductShowcase() {
  const { t } = useTranslation()

  return (
    <section className="relative pb-20 pt-0 sm:pb-24">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <SectionHeading
          eyebrow={t('showcase.eyebrow')}
          title={t('showcase.title')}
          subtitle={t('showcase.subtitle')}
        />

        <motion.div
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-15%' }}
          transition={{ duration: 0.6 }}
          className="relative mx-auto mt-10 max-w-5xl"
          style={{ perspective: 1600 }}
        >
          <div
            aria-hidden
            className="absolute -inset-6 -z-10 rounded-[2rem] bg-gradient-brand opacity-20 blur-3xl"
          />

          <AdminAppProvider>
            <motion.div
              initial={{ rotateX: 0 }}
              whileInView={{ rotateX: 3 }}
              viewport={{ once: true, margin: '-15%' }}
              transition={{ duration: 0.8, delay: 0.2, ease: [0.22, 1, 0.36, 1] }}
              style={{ transformOrigin: 'top center' }}
              className="relative overflow-hidden rounded-2xl border border-border/60 bg-card/80 shadow-glow-lg backdrop-blur"
            >
              <BrowserChrome />

              <div className="relative h-[480px] w-full sm:h-[540px]">
                <AdminShell />
              </div>
            </motion.div>

            <p className="mx-auto mt-6 max-w-2xl text-center text-xs text-muted-foreground">
              {t(
                'showcase.interactiveHint',
                'Cliquez dans la barre latérale pour explorer les écrans.',
              )}
            </p>

            <AdminResetButton />
          </AdminAppProvider>
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
        app.joincabs.com
      </div>
      <div className="w-[46px]" />
    </div>
  )
}
