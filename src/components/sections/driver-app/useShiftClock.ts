import { useEffect, useState } from 'react'

export function useShiftClock(startedAt: number | null): string {
  const [now, setNow] = useState(() => Date.now())

  useEffect(() => {
    if (startedAt == null) return
    const id = window.setInterval(() => setNow(Date.now()), 1000)
    return () => window.clearInterval(id)
  }, [startedAt])

  if (startedAt == null) return '00:00'
  const elapsed = Math.max(0, Math.floor((now - startedAt) / 1000))
  const h = Math.floor(elapsed / 3600)
  const m = Math.floor((elapsed % 3600) / 60)
  const s = elapsed % 60
  if (h > 0) {
    return `${h}h ${m.toString().padStart(2, '0')}m`
  }
  return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`
}
