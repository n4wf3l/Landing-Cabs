import { Outlet, useLocation } from 'react-router-dom'
import { AnimatePresence, motion, useReducedMotion } from 'framer-motion'
import { Navbar } from './Navbar'
import { Footer } from './Footer'
import { SideNav } from './SideNav'
import { SkipLink } from '@/components/common/SkipLink'
import { CustomCursor } from '@/components/common/CustomCursor'
import { ScrollToTopButton } from '@/components/common/ScrollToTopButton'

export function RootLayout() {
  const location = useLocation()
  const reduce = useReducedMotion()

  return (
    <div className="flex min-h-dvh flex-col">
      <SkipLink />
      <CustomCursor />
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
