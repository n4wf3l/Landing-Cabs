import { useCallback, useEffect, useState } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import {
  BellRing,
  ChevronRight,
  LayoutDashboard,
  Mail,
  Menu,
  Smartphone,
  Users,
  X,
  type LucideIcon,
} from 'lucide-react'
import {
  AnimatePresence,
  motion,
  useReducedMotion,
  type Variants,
} from 'framer-motion'
import { useTranslation } from 'react-i18next'
import { Button } from '@/components/ui/button'
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

  const handleLogoClick = useCallback(
    (e: React.MouseEvent) => {
      // If already on home, just scroll to top instead of letting the Link no-op.
      if (location.pathname === '/') {
        e.preventDefault()
        window.scrollTo({ top: 0, behavior: 'smooth' })
      }
    },
    [location.pathname],
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
          onClick={handleLogoClick}
          className="flex items-center gap-2 rounded-md transition-opacity hover:opacity-80"
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
          <Button
            variant="ghost"
            size="icon"
            aria-label={t('nav.openMenu')}
            aria-expanded={open}
            onClick={() => setOpen(true)}
          >
            <Menu className="h-5 w-5" />
          </Button>
        </div>
      </div>

      <MobileMenu
        open={open}
        onClose={() => setOpen(false)}
        onAnchor={goToAnchor}
      />
    </header>
  )
}

interface MobileMenuProps {
  open: boolean
  onClose: () => void
  onAnchor: (href: string) => void
}

type MenuRow =
  | { kind: 'anchor'; href: string; key: string; Icon: LucideIcon }
  | { kind: 'route'; to: string; key: string; Icon: LucideIcon }

function MobileMenu({ open, onClose, onAnchor }: MobileMenuProps) {
  const { t } = useTranslation()
  const reduce = useReducedMotion()

  // Lock body scroll + close on Escape while the overlay is open.
  useEffect(() => {
    if (!open) return
    const previousOverflow = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose()
    }
    window.addEventListener('keydown', onKey)
    return () => {
      document.body.style.overflow = previousOverflow
      window.removeEventListener('keydown', onKey)
    }
  }, [open, onClose])

  const rows: MenuRow[] = [
    ...NAV_ANCHORS.map<MenuRow>((link) => ({
      kind: 'anchor',
      href: link.href,
      key: link.key,
      Icon: ANCHOR_ICONS[link.href] ?? Menu,
    })),
    { kind: 'route', to: '/contact', key: 'nav.contact', Icon: Mail },
  ]

  const listVariants: Variants = {
    hidden: {},
    show: {
      transition: {
        staggerChildren: reduce ? 0 : 0.05,
        delayChildren: reduce ? 0 : 0.18,
      },
    },
    exit: {
      transition: { staggerChildren: reduce ? 0 : 0.03, staggerDirection: -1 },
    },
  }

  const rowVariants: Variants = {
    hidden: reduce ? { opacity: 0 } : { opacity: 0, y: 12 },
    show: {
      opacity: 1,
      y: 0,
      transition: reduce
        ? { duration: 0.01 }
        : { type: 'spring', stiffness: 280, damping: 26 },
    },
    exit: reduce ? { opacity: 0 } : { opacity: 0, y: 8, transition: { duration: 0.18 } },
  }

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          key="mobile-menu"
          role="dialog"
          aria-modal="true"
          aria-label="Menu"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: reduce ? 0.01 : 0.3 }}
          className="fixed inset-0 z-50 flex items-center justify-center overflow-hidden bg-background/85 px-5 backdrop-blur-2xl md:hidden"
        >
          {/* Background blobs */}
          <div aria-hidden className="pointer-events-none absolute inset-0 -z-10">
            <motion.div
              initial={{ opacity: 0, scale: 0.7 }}
              animate={{ opacity: 0.5, scale: 1 }}
              exit={{ opacity: 0, scale: 0.7 }}
              transition={{ duration: 1.1, ease: [0.22, 1, 0.36, 1] }}
              className="absolute left-1/2 top-1/3 h-[420px] w-[420px] -translate-x-1/2 -translate-y-1/2 rounded-full"
              style={{
                background:
                  'radial-gradient(circle, hsl(217 91% 60% / 0.32), transparent 60%)',
              }}
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 0.35, scale: 1 }}
              exit={{ opacity: 0, scale: 0.8 }}
              transition={{
                duration: 1.3,
                ease: [0.22, 1, 0.36, 1],
                delay: reduce ? 0 : 0.1,
              }}
              className="absolute bottom-0 right-0 h-[360px] w-[360px] translate-x-1/4 translate-y-1/4 rounded-full"
              style={{
                background:
                  'radial-gradient(circle, hsl(280 80% 60% / 0.22), transparent 60%)',
              }}
            />
          </div>

          {/* Close button — fixed top-right of overlay */}
          <motion.button
            type="button"
            onClick={onClose}
            aria-label={t('nav.closeMenu')}
            initial={{ opacity: 0, rotate: -90, scale: 0.7 }}
            animate={{ opacity: 1, rotate: 0, scale: 1 }}
            exit={{ opacity: 0, rotate: 90, scale: 0.7 }}
            transition={{
              type: 'spring',
              stiffness: 240,
              damping: 22,
              delay: reduce ? 0 : 0.08,
            }}
            className="absolute right-5 top-5 z-10 inline-flex h-11 w-11 items-center justify-center rounded-full border border-border/60 bg-card/70 text-muted-foreground backdrop-blur transition-colors hover:border-primary/40 hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
          >
            <X className="h-5 w-5" />
          </motion.button>

          {/* Centered card */}
          <motion.div
            initial={
              reduce ? { opacity: 0 } : { opacity: 0, scale: 0.94, y: 12 }
            }
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={
              reduce ? { opacity: 0 } : { opacity: 0, scale: 0.96, y: 8 }
            }
            transition={
              reduce
                ? { duration: 0.01 }
                : { type: 'spring', stiffness: 220, damping: 26 }
            }
            className="relative w-full max-w-sm overflow-hidden rounded-3xl border border-border/60 bg-card/70 p-5 shadow-[0_20px_60px_-15px_rgba(0,0,0,0.7)] backdrop-blur-2xl"
          >
            {/* Brand header inside card */}
            <motion.div
              initial={{ opacity: 0, y: -6 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -6 }}
              transition={{ duration: 0.4, delay: reduce ? 0 : 0.08 }}
              className="flex items-center justify-center pb-4"
            >
              <Logo />
            </motion.div>

            <div className="h-px w-full bg-border/60" />

            <motion.nav
              aria-label="Mobile primary"
              variants={listVariants}
              initial="hidden"
              animate="show"
              exit="exit"
              className="my-3 space-y-1"
            >
              {rows.map((row) => (
                <CardNavRow
                  key={row.kind === 'anchor' ? row.href : row.to}
                  row={row}
                  rowVariants={rowVariants}
                  onClose={onClose}
                  onAnchor={onAnchor}
                />
              ))}
            </motion.nav>

            <div className="h-px w-full bg-border/60" />

            <motion.div
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 8 }}
              transition={{
                duration: 0.4,
                delay: reduce ? 0 : 0.18 + rows.length * 0.05,
              }}
              className="pt-4"
            >
              <Button
                onClick={() => {
                  onClose()
                  window.setTimeout(() => onAnchor('#notify'), 200)
                }}
                className="w-full gap-2 py-5 text-sm font-semibold shadow-glow"
              >
                <BellRing className="h-4 w-4" />
                {t('nav.notifyCta')}
              </Button>
            </motion.div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}

function CardNavRow({
  row,
  rowVariants,
  onClose,
  onAnchor,
}: {
  row: MenuRow
  rowVariants: Variants
  onClose: () => void
  onAnchor: (href: string) => void
}) {
  const { t } = useTranslation()
  const Icon = row.Icon

  const inner = (
    <>
      <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary ring-1 ring-primary/20 transition-all group-hover:bg-primary/20 group-hover:ring-primary/40">
        <Icon className="h-4 w-4" />
      </span>
      <span className="flex-1 truncate text-base font-semibold tracking-tight">
        {t(row.key)}
      </span>
      <ChevronRight className="h-4 w-4 shrink-0 text-muted-foreground/40 transition-all group-hover:translate-x-1 group-hover:text-primary" />
    </>
  )

  const className =
    'group flex w-full items-center gap-3 rounded-2xl px-3 py-3 text-left transition-colors hover:bg-accent/40'

  if (row.kind === 'route') {
    return (
      <motion.div variants={rowVariants}>
        <Link to={row.to} onClick={onClose} className={className}>
          {inner}
        </Link>
      </motion.div>
    )
  }

  return (
    <motion.button
      variants={rowVariants}
      type="button"
      onClick={() => {
        onClose()
        window.setTimeout(() => onAnchor(row.href), 200)
      }}
      className={className}
    >
      {inner}
    </motion.button>
  )
}
