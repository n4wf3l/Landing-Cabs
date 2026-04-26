import { useCallback, useEffect, useState } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import {
  BellRing,
  LayoutDashboard,
  Mail,
  Smartphone,
  Users,
  type LucideIcon,
} from 'lucide-react'
import { useTranslation } from 'react-i18next'
import { AnimatePresence, motion } from 'framer-motion'
import { useScrollPosition } from '@/hooks/useScrollPosition'
import { useScrollDirection } from '@/hooks/useScrollDirection'
import { usePrefersReducedMotion } from '@/hooks/usePrefersReducedMotion'
import { cn } from '@/lib/utils'
import { LanguageSwitcher } from './LanguageSwitcher'
import { ThemeToggle } from './ThemeToggle'

const SHOW_AFTER_PX = 400
const COLLAPSED_WIDTH = 56
const EXPANDED_WIDTH = 200

interface AnchorItem {
  type: 'anchor'
  href: string
  key: string
  labelKey: string
  Icon: LucideIcon
}
interface RouteItem {
  type: 'route'
  to: string
  key: string
  labelKey: string
  Icon: LucideIcon
}
type Item = AnchorItem | RouteItem

const ITEMS: Item[] = [
  {
    type: 'anchor',
    href: '#admin',
    key: 'admin',
    labelKey: 'nav.admin',
    Icon: LayoutDashboard,
  },
  {
    type: 'anchor',
    href: '#app',
    key: 'app',
    labelKey: 'nav.app',
    Icon: Smartphone,
  },
  {
    type: 'anchor',
    href: '#team',
    key: 'team',
    labelKey: 'nav.team',
    Icon: Users,
  },
  {
    type: 'route',
    to: '/contact',
    key: 'contact',
    labelKey: 'nav.contact',
    Icon: Mail,
  },
]

const ANCHOR_IDS = ITEMS.filter(
  (i): i is AnchorItem => i.type === 'anchor',
).map((i) => i.href.replace('#', ''))

function useScrollSpy(ids: string[]): string | null {
  const [active, setActive] = useState<string | null>(null)

  useEffect(() => {
    const elements = ids
      .map((id) => document.getElementById(id))
      .filter((el): el is HTMLElement => el !== null)
    if (elements.length === 0) return

    const observer = new IntersectionObserver(
      (entries) => {
        const visible = entries
          .filter((e) => e.isIntersecting)
          .sort((a, b) => b.intersectionRatio - a.intersectionRatio)[0]
        if (visible) setActive(visible.target.id)
      },
      {
        rootMargin: '-30% 0px -50% 0px',
        threshold: [0, 0.25, 0.5, 0.75, 1],
      },
    )

    elements.forEach((el) => observer.observe(el))
    return () => observer.disconnect()
  }, [ids])

  return active
}

function scrollIntoView(id: string) {
  const el = document.getElementById(id)
  if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' })
}

export function SideNav() {
  const { t } = useTranslation()
  const scrollY = useScrollPosition()
  const direction = useScrollDirection()
  // Only show when the user is scrolling DOWN past the threshold.
  // Scrolling UP brings the navbar back and hides this floating nav.
  const visible = scrollY > SHOW_AFTER_PX && direction === 'down'
  const reduce = usePrefersReducedMotion()
  const location = useLocation()
  const navigate = useNavigate()
  const activeAnchor = useScrollSpy(ANCHOR_IDS)
  const [expanded, setExpanded] = useState(false)

  const goToAnchor = useCallback(
    (href: string) => {
      const id = href.replace('#', '')
      if (location.pathname === '/') {
        scrollIntoView(id)
      } else {
        navigate(`/${href}`)
        window.setTimeout(() => scrollIntoView(id), 80)
      }
    },
    [location.pathname, navigate],
  )

  const isItemActive = (item: Item): boolean => {
    if (item.type === 'route') return location.pathname === item.to
    return location.pathname === '/' && activeAnchor === item.key
  }

  return (
    <AnimatePresence>
      {visible && (
        <motion.aside
          aria-label="Secondary"
          onHoverStart={() => setExpanded(true)}
          onHoverEnd={() => setExpanded(false)}
          onFocus={() => setExpanded(true)}
          onBlur={() => setExpanded(false)}
          initial={
            reduce
              ? { opacity: 0, width: COLLAPSED_WIDTH }
              : { opacity: 0, x: -16, width: COLLAPSED_WIDTH }
          }
          animate={
            reduce
              ? { opacity: 1, width: expanded ? EXPANDED_WIDTH : COLLAPSED_WIDTH }
              : {
                  opacity: 1,
                  x: 0,
                  width: expanded ? EXPANDED_WIDTH : COLLAPSED_WIDTH,
                }
          }
          exit={reduce ? { opacity: 0 } : { opacity: 0, x: -16 }}
          transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
          className={cn(
            'fixed left-4 top-1/2 z-40 hidden -translate-y-1/2 overflow-hidden lg:block',
            'rounded-2xl border border-white/[0.06] bg-card/30 p-2 backdrop-blur-2xl',
            'shadow-[0_8px_32px_-12px_rgba(0,0,0,0.3),inset_0_1px_0_0_rgba(255,255,255,0.04)]',
          )}
        >
          <nav className="space-y-0.5" aria-label="Floating primary">
            {ITEMS.map((item) => {
              const active = isItemActive(item)
              const label = t(item.labelKey)
              const Icon = item.Icon

              const innerContent = (
                <>
                  {active && (
                    <motion.span
                      layoutId="sidenav-active"
                      aria-hidden
                      className="absolute inset-0 rounded-lg bg-primary/10"
                      transition={{
                        type: 'spring',
                        stiffness: 380,
                        damping: 32,
                      }}
                    />
                  )}
                  {active && (
                    <span
                      aria-hidden
                      className="absolute left-0 top-1/2 h-5 w-[3px] -translate-y-1/2 rounded-r-full bg-primary"
                    />
                  )}
                  <Icon
                    className={cn(
                      'relative h-4 w-4 shrink-0 transition-colors',
                      active
                        ? 'text-primary'
                        : 'text-muted-foreground group-hover:text-foreground',
                    )}
                  />
                  <AnimatePresence initial={false}>
                    {expanded && (
                      <motion.span
                        initial={{ opacity: 0, width: 0 }}
                        animate={{ opacity: 1, width: 'auto' }}
                        exit={{ opacity: 0, width: 0 }}
                        transition={{ duration: 0.2, ease: [0.22, 1, 0.36, 1] }}
                        className={cn(
                          'relative overflow-hidden whitespace-nowrap text-sm font-medium transition-colors',
                          active
                            ? 'text-foreground'
                            : 'text-muted-foreground group-hover:text-foreground',
                        )}
                      >
                        {label}
                      </motion.span>
                    )}
                  </AnimatePresence>
                </>
              )

              const baseClass =
                'group relative flex items-center gap-3 rounded-lg px-3 py-2 transition-colors'

              if (item.type === 'route') {
                return (
                  <Link
                    key={item.key}
                    to={item.to}
                    className={baseClass}
                    aria-label={label}
                    aria-current={active ? 'page' : undefined}
                    title={!expanded ? label : undefined}
                  >
                    {innerContent}
                  </Link>
                )
              }
              return (
                <button
                  key={item.key}
                  type="button"
                  onClick={() => goToAnchor(item.href)}
                  className={cn(baseClass, 'w-full text-left')}
                  aria-label={label}
                  aria-current={active ? 'true' : undefined}
                  title={!expanded ? label : undefined}
                >
                  {innerContent}
                </button>
              )
            })}
          </nav>

          {/*
            IMPORTANT: this block must stay mounted across collapse so that
            <LanguageSwitcher />'s React subtree (and its portal'd modal)
            survives. We just animate opacity / max-height / pointer-events.
          */}
          <div
            aria-hidden={!expanded}
            className={cn(
              'overflow-hidden transition-all duration-200 ease-out',
              expanded
                ? 'pointer-events-auto max-h-32 opacity-100'
                : 'pointer-events-none max-h-0 opacity-0',
            )}
          >
            <div className="my-2 mx-2 h-px bg-white/[0.06]" />
            <div className="flex items-center justify-between gap-1 px-1">
              <LanguageSwitcher />
              <ThemeToggle />
            </div>
            <div className="my-2 mx-2 h-px bg-white/[0.06]" />
          </div>

          <button
            type="button"
            onClick={() => goToAnchor('#notify')}
            aria-label={t('nav.notifyCta')}
            title={!expanded ? t('nav.notifyCta') : undefined}
            className={cn(
              'group mt-2 flex w-full items-center justify-center gap-1.5 rounded-lg py-2.5 text-sm font-semibold',
              'bg-primary text-primary-foreground shadow-glow',
              'transition-all hover:-translate-y-0.5 hover:shadow-[0_0_30px_-8px_rgba(59,130,246,0.6)]',
              'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background',
              expanded ? 'px-3' : 'px-0',
            )}
          >
            <BellRing className="h-3.5 w-3.5 shrink-0" />
            <AnimatePresence initial={false}>
              {expanded && (
                <motion.span
                  initial={{ opacity: 0, width: 0 }}
                  animate={{ opacity: 1, width: 'auto' }}
                  exit={{ opacity: 0, width: 0 }}
                  transition={{ duration: 0.2 }}
                  className="overflow-hidden whitespace-nowrap"
                >
                  {t('nav.notifyCta')}
                </motion.span>
              )}
            </AnimatePresence>
          </button>
        </motion.aside>
      )}
    </AnimatePresence>
  )
}
