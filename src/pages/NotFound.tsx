import { Link } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { Button } from '@/components/ui/button'
import { SEO } from '@/components/common/SEO'

export default function NotFound() {
  const { t } = useTranslation()
  return (
    <>
      <SEO path="/404" title={t('notFound.title')} />
      <section className="flex min-h-[60vh] items-center justify-center px-4 py-20">
        <div className="max-w-md text-center">
          <p className="text-6xl font-extrabold tracking-tighter text-primary">
            404
          </p>
          <h1 className="mt-4 text-2xl font-bold sm:text-3xl">
            {t('notFound.title')}
          </h1>
          <p className="mt-2 text-muted-foreground">
            {t('notFound.subtitle')}
          </p>
          <Button asChild size="lg" className="mt-8">
            <Link to="/">{t('notFound.cta')}</Link>
          </Button>
        </div>
      </section>
    </>
  )
}
