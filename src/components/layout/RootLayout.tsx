import { useEffect, useLayoutEffect } from 'react'
import { Outlet, useLocation } from 'react-router-dom'
import { AnimatePresence, motion, useReducedMotion } from 'framer-motion'
import { Navbar } from './Navbar'
import { Footer } from './Footer'
import { SideNav } from './SideNav'
import { SkipLink } from '@/components/common/SkipLink'
import { ScrollToTopButton } from '@/components/common/ScrollToTopButton'

export function RootLayout() {
  const location = useLocation()
  const reduce = useReducedMotion()

  // Reset scroll on route change. Using useLayoutEffect so the page paints
  // already at the top — no flash of "previous scroll position" between
  // routes. Skipped when the URL has a hash, which is handled below.
  useLayoutEffect(() => {
    if (!location.hash) {
      window.scrollTo({ top: 0, behavior: 'instant' as ScrollBehavior })
    }
  }, [location.pathname, location.hash])

  // If the URL points to an anchor (e.g. /#admin), scroll to it after the
  // target page has mounted. Small delay lets lazy-loaded pages render
  // their sections before we look up the element.
  useEffect(() => {
    if (!location.hash) return
    const id = location.hash.replace('#', '')
    const id2 = window.setTimeout(() => {
      const el = document.getElementById(id)
      if (el) {
        el.scrollIntoView({
          behavior: reduce ? 'auto' : 'smooth',
          block: 'start',
        })
      }
    }, 80)
    return () => window.clearTimeout(id2)
  }, [location.pathname, location.hash, reduce])

  return (
    <div className="flex min-h-dvh flex-col">
      <SkipLink />
      <Navbar />
      <AnimatePresence mode="wait">
        <motion.main
          key={location.pathname}
          id="main"
          initial={reduce ? false : { opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          exit={reduce ? undefined : { opacity: 0, y: -4 }}
          transition={{ duration: 0.2, ease: 'easeOut' }}
          className="flex-1"
        >
          <Outlet />
        </motion.main>
      </AnimatePresence>
      <Footer />
      <SideNav />
      <ScrollToTopButton />
    </div>
  )
}
