import { useCallback, useState } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import {
  BellRing,
  LayoutDashboard,
  Mail,
  Menu,
  Smartphone,
  Users,
  type LucideIcon,
} from 'lucide-react'
import { useTranslation } from 'react-i18next'
import { Button } from '@/components/ui/button'
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet'
import { Logo } from '@/components/common/Logo'
import { ThemeToggle } from './ThemeToggle'
import { LanguageSwitcher } from './LanguageSwitcher'
import { NAV_ANCHORS } from '@/lib/constants'
import { useScrollPosition } from '@/hooks/useScrollPosition'
import { useScrollDirection } from '@/hooks/useScrollDirection'
import { cn } from '@/lib/utils'

const ALWAYS_SHOW_TOP_PX = 50

const ANCHOR_ICONS: Record<string, LucideIcon> = {
  '#admin': LayoutDashboard,
  '#app': Smartphone,
  '#team': Users,
}

function scrollIntoView(id: string) {
  const el = document.getElementById(id)
  if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' })
}

export function Navbar() {
  const { t } = useTranslation()
  const [open, setOpen] = useState(false)
  const scrollY = useScrollPosition()
  const scrolled = scrollY > 16
  const direction = useScrollDirection()
  // Visible if at the very top OR last scroll was upward.
  // Hidden when scrolling down past the top zone — sidebar takes over.
  const hidden = scrollY > ALWAYS_SHOW_TOP_PX && direction === 'down'
  const location = useLocation()
  const navigate = useNavigate()

  const goToAnchor = useCallback(
    (href: string) => {
      const id = href.replace('#', '')
      if (location.pathname === '/') {
        scrollIntoView(id)
      } else {
        navigate(`/${href}`)
        // Wait for the home page to mount, then scroll
        window.setTimeout(() => scrollIntoView(id), 80)
      }
    },
    [location.pathname, navigate],
  )

  return (
    <header
      className={cn(
        'sticky top-0 z-40 w-full border-b transition-[opacity,transform,background-color,border-color] duration-300',
        scrolled
          ? 'border-border/60 bg-background/80 backdrop-blur-xl'
          : 'border-transparent bg-transparent',
        hidden && 'pointer-events-none -translate-y-2 opacity-0',
      )}
    >
      <div className="container mx-auto flex h-16 items-center justify-between px-4 sm:px-6 lg:px-8">
        <Link
          to="/"
          className="flex items-center gap-2 rounded-md"
          aria-label="Cabs"
        >
          <Logo layoutId="brand-logo" />
        </Link>

        <nav className="hidden items-center gap-1 md:flex" aria-label="Primary">
          {NAV_ANCHORS.map((link) => {
            const Icon = ANCHOR_ICONS[link.href]
            return (
              <button
                key={link.href}
                type="button"
                onClick={() => goToAnchor(link.href)}
                className="inline-flex items-center gap-1.5 rounded-md px-3 py-2 text-sm font-medium text-muted-foreground transition-colors hover:text-foreground"
              >
                {Icon && <Icon className="h-3.5 w-3.5" />}
                {t(link.key)}
              </button>
            )
          })}
          <Link
            to="/contact"
            className={cn(
              'inline-flex items-center gap-1.5 rounded-md px-3 py-2 text-sm font-medium transition-colors hover:text-foreground',
              location.pathname === '/contact'
                ? 'text-foreground'
                : 'text-muted-foreground',
            )}
          >
            <Mail className="h-3.5 w-3.5" />
            {t('nav.contact')}
          </Link>
        </nav>

        <div className="hidden items-center gap-2 md:flex">
          <LanguageSwitcher />
          <ThemeToggle />
          <Button
            size="sm"
            className="gap-1.5"
            onClick={() => goToAnchor('#notify')}
          >
            <BellRing className="h-3.5 w-3.5" />
            {t('nav.notifyCta')}
          </Button>
        </div>

        <div className="flex items-center gap-1 md:hidden">
          <LanguageSwitcher />
          <ThemeToggle />
          <Sheet open={open} onOpenChange={setOpen}>
            <SheetTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                aria-label={t('nav.openMenu')}
              >
                <Menu className="h-5 w-5" />
              </Button>
            </SheetTrigger>
            <SheetContent side="right" className="flex flex-col gap-6">
              <Logo />
              <nav
                className="mt-4 flex flex-col gap-1"
                aria-label="Mobile primary"
              >
                {NAV_ANCHORS.map((link) => {
                  const Icon = ANCHOR_ICONS[link.href]
                  return (
                    <button
                      key={link.href}
                      type="button"
                      onClick={() => {
                        setOpen(false)
                        window.setTimeout(() => goToAnchor(link.href), 120)
                      }}
                      className="flex items-center gap-3 rounded-md px-3 py-3 text-left text-base font-medium text-muted-foreground transition-colors hover:bg-accent hover:text-foreground"
                    >
                      {Icon && <Icon className="h-4 w-4" />}
                      {t(link.key)}
                    </button>
                  )
                })}
                <Link
                  to="/contact"
                  onClick={() => setOpen(false)}
                  className="flex items-center gap-3 rounded-md px-3 py-3 text-base font-medium text-muted-foreground transition-colors hover:bg-accent hover:text-foreground"
                >
                  <Mail className="h-4 w-4" />
                  {t('nav.contact')}
                </Link>
              </nav>
              <div className="mt-auto flex flex-col gap-2">
                <Button
                  onClick={() => {
                    setOpen(false)
                    window.setTimeout(() => goToAnchor('#notify'), 120)
                  }}
                  className="gap-1.5"
                >
                  <BellRing className="h-4 w-4" />
                  {t('nav.notifyCta')}
                </Button>
              </div>
            </SheetContent>
          </Sheet>
        </div>
      </div>
    </header>
  )
}
