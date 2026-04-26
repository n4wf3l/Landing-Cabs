import { useEffect, useState } from 'react'

export function useTicker(intervalMs = 1000): number {
  const [tick, setTick] = useState(0)

  useEffect(() => {
    if (typeof window === 'undefined') return
    const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    if (reduce) return
    const id = window.setInterval(() => {
      setTick((t) => t + 1)
    }, intervalMs)
    return () => window.clearInterval(id)
  }, [intervalMs])

  return tick
}
