import { Link } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { Mail } from 'lucide-react'
import { Logo } from '@/components/common/Logo'
import { InstagramIcon, LinkedinIcon } from '@/components/common/SocialIcons'
import { BRAND } from '@/lib/constants'

export function Footer() {
  const { t } = useTranslation()
  const year = new Date().getFullYear()

  return (
    <footer className="border-t border-border/60 bg-background/60">
      <div className="container mx-auto px-4 py-14 sm:px-6 lg:px-8">
        <div className="grid gap-10 md:grid-cols-[1.5fr_1fr_1fr_1fr]">
          <div className="space-y-4">
            <Logo />
            <p className="max-w-sm text-sm text-muted-foreground">
              {t('footer.tagline')}
            </p>
            <p className="inline-flex items-center gap-2 rounded-full border border-primary/30 bg-primary/10 px-3 py-1 text-xs font-medium text-primary">
              <span className="inline-block h-1.5 w-1.5 animate-pulse rounded-full bg-primary" />
              {t('footer.status')}
            </p>
            <div>
              <a
                href={`mailto:${BRAND.email}`}
                className="inline-flex items-center gap-2 text-sm text-muted-foreground transition-colors hover:text-foreground"
              >
                <Mail className="h-4 w-4" />
                {BRAND.email}
              </a>
            </div>
            <div className="flex gap-2 pt-2">
              <a
                href={BRAND.instagram}
                target="_blank"
                rel="noreferrer"
                aria-label="Instagram"
                className="inline-flex h-9 w-9 items-center justify-center rounded-full border border-border/60 bg-background/40 text-muted-foreground transition-colors hover:border-primary/40 hover:text-primary"
              >
                <InstagramIcon className="h-4 w-4" />
              </a>
              <a
                href={BRAND.linkedin}
                target="_blank"
                rel="noreferrer"
                aria-label="LinkedIn"
                className="inline-flex h-9 w-9 items-center justify-center rounded-full border border-border/60 bg-background/40 text-muted-foreground transition-colors hover:border-primary/40 hover:text-primary"
              >
                <LinkedinIcon className="h-4 w-4" />
              </a>
            </div>
          </div>

          <div>
            <h3 className="mb-3 text-sm font-semibold">
              {t('footer.columns.product')}
            </h3>
            <ul className="space-y-2 text-sm">
              <li>
                <a
                  href="#features"
                  className="text-muted-foreground transition-colors hover:text-foreground"
                >
                  {t('footer.links.features')}
                </a>
              </li>
              <li>
                <a
                  href="#product"
                  className="text-muted-foreground transition-colors hover:text-foreground"
                >
                  {t('footer.links.showcase')}
                </a>
              </li>
            </ul>
          </div>

          <div>
            <h3 className="mb-3 text-sm font-semibold">
              {t('footer.columns.company')}
            </h3>
            <ul className="space-y-2 text-sm">
              <li>
                <a
                  href="#team"
                  className="text-muted-foreground transition-colors hover:text-foreground"
                >
                  {t('footer.links.team')}
                </a>
              </li>
              <li>
                <Link
                  to="/contact"
                  className="text-muted-foreground transition-colors hover:text-foreground"
                >
                  {t('footer.links.contact')}
                </Link>
              </li>
            </ul>
          </div>

          <div>
            <h3 className="mb-3 text-sm font-semibold">
              {t('footer.columns.legal')}
            </h3>
            <ul className="space-y-2 text-sm">
              <li>
                <Link
                  to="/legal/terms"
                  className="text-muted-foreground transition-colors hover:text-foreground"
                >
                  {t('footer.links.terms')}
                </Link>
              </li>
              <li>
                <Link
                  to="/legal/privacy"
                  className="text-muted-foreground transition-colors hover:text-foreground"
                >
                  {t('footer.links.privacy')}
                </Link>
              </li>
            </ul>
          </div>
        </div>

        <div className="mt-10 space-y-2 border-t border-border/60 pt-6 text-xs text-muted-foreground">
          <p className="max-w-3xl">{t('footer.preIncorporationNotice')}</p>
          <div className="flex flex-col justify-between gap-2 sm:flex-row">
            <p>{t('footer.copyright', { year })}</p>
            <p>{t('footer.madeIn')}</p>
          </div>
        </div>
      </div>
    </footer>
  )
}
