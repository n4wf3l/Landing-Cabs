import { useEffect, useState } from 'react'
import { usePrefersReducedMotion } from '@/hooks/usePrefersReducedMotion'

export function CustomCursor() {
  const reduce = usePrefersReducedMotion()
  const [enabled, setEnabled] = useState(false)
  const [pos, setPos] = useState({ x: -100, y: -100 })
  const [hover, setHover] = useState(false)

  useEffect(() => {
    if (reduce) return
    const mql = window.matchMedia('(pointer: fine)')
    if (!mql.matches) return
    setEnabled(true)

    const onMove = (e: MouseEvent) => {
      setPos({ x: e.clientX, y: e.clientY })
      const t = e.target as HTMLElement | null
      const interactive =
        !!t?.closest('a, button, [role="button"], input, select, textarea, [data-cursor-hover]')
      setHover(interactive)
    }
    window.addEventListener('mousemove', onMove)
    return () => window.removeEventListener('mousemove', onMove)
  }, [reduce])

  if (!enabled) return null

  return (
    <div
      aria-hidden
      className="pointer-events-none fixed z-[100] hidden md:block"
      style={{
        left: pos.x,
        top: pos.y,
        transform: 'translate(-50%, -50%)',
      }}
    >
      <div
        className="rounded-full border-2 border-primary/70 bg-primary/20 transition-[width,height,opacity] duration-200"
        style={{
          width: hover ? 36 : 14,
          height: hover ? 36 : 14,
        }}
      />
    </div>
  )
}
