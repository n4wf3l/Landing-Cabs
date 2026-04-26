import { useEffect, useState } from 'react'

export type ScrollDirection = 'up' | 'down'

/**
 * Returns the user's last meaningful scroll direction.
 * Small jitter under `threshold` pixels does NOT change the direction —
 * this prevents flicker when the user pauses or makes tiny movements.
 *
 * Initial direction is 'up' so the navbar shows on first paint.
 */
export function useScrollDirection(threshold = 8): ScrollDirection {
  const [direction, setDirection] = useState<ScrollDirection>('up')

  useEffect(() => {
    if (typeof window === 'undefined') return
    let lastY = window.scrollY
    let ticking = false

    const onScroll = () => {
      if (ticking) return
      ticking = true
      requestAnimationFrame(() => {
        const y = window.scrollY
        const delta = y - lastY
        if (Math.abs(delta) > threshold) {
          setDirection((prev) => {
            const next: ScrollDirection = delta > 0 ? 'down' : 'up'
            return next === prev ? prev : next
          })
          lastY = y
        }
        ticking = false
      })
    }

    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [threshold])

  return direction
}
