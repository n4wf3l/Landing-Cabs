import { motion, useReducedMotion, type Variants } from 'framer-motion'
import type { ReactNode } from 'react'

interface ScrollRevealProps {
  children: ReactNode
  delay?: number
  y?: number
  className?: string
  as?: 'div' | 'section' | 'li' | 'article'
}

// Content stays at opacity:1 in `hidden` so a slow main thread that
// delays the IntersectionObserver can't strand a section invisible.
// The translate is the only motion left — gentle enter cue for users
// who do see the animation. Trade-off: no fade-in, but no risk of
// "the section never appeared" on slow mobiles.
export function ScrollReveal({
  children,
  delay = 0,
  y = 16,
  className,
}: ScrollRevealProps) {
  const reduce = useReducedMotion()
  const variants: Variants = {
    hidden: { opacity: 1, y: reduce ? 0 : y },
    show: {
      opacity: 1,
      y: 0,
      transition: { duration: reduce ? 0 : 0.5, delay, ease: [0.22, 1, 0.36, 1] },
    },
  }
  return (
    <motion.div
      initial="hidden"
      whileInView="show"
      viewport={{ once: true, margin: '-15%' }}
      variants={variants}
      className={className}
    >
      {children}
    </motion.div>
  )
}

export const staggerContainer: Variants = {
  hidden: {},
  show: { transition: { staggerChildren: 0.08 } },
}

export const staggerItem: Variants = {
  hidden: { opacity: 1, y: 12 },
  show: { opacity: 1, y: 0, transition: { duration: 0.5 } },
}
