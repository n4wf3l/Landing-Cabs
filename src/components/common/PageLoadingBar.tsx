import { useEffect, useState } from 'react'

// Persistent loading bar shown right under the navbar while the page
// is painting. The HTML pre-React spinner inside #root disappears the
// moment React mounts. On real mobile the page then paints progressively
// for several seconds (sections appearing one after another) — and
// during that window there's no visual feedback that anything is still
// happening. This bar fills that gap with a marquee-style indeterminate
// progress until the browser fires the `load` event (which only happens
// once every CSS / image / font has finished). After load, fade out.

const FALLBACK_HIDE_MS = 6000 // hard cut even if `load` never fires

export function PageLoadingBar() {
  const [done, setDone] = useState(false)

  useEffect(() => {
    if (typeof document === 'undefined') return

    // If the document is already fully loaded by the time React mounts
    // (rare on mobile, common on desktop), just hide immediately.
    if (document.readyState === 'complete') {
      setDone(true)
      return
    }

    const onLoad = () => setDone(true)
    window.addEventListener('load', onLoad, { once: true })

    // Hard cap: if `load` never fires (slow third-party assets like
    // Turnstile) we still hide the bar after 6 s so it doesn't sit
    // on screen forever.
    const timer = window.setTimeout(() => setDone(true), FALLBACK_HIDE_MS)

    return () => {
      window.removeEventListener('load', onLoad)
      window.clearTimeout(timer)
    }
  }, [])

  return (
    <div
      role="progressbar"
      aria-busy={!done}
      aria-label="Loading page"
      className={`pointer-events-none fixed inset-x-0 top-0 z-[150] h-[3px] overflow-hidden transition-opacity duration-500 ${
        done ? 'opacity-0' : 'opacity-100'
      }`}
    >
      <span
        aria-hidden
        className="absolute inset-y-0 left-0 w-1/3 animate-[loadingbar_1.1s_ease-in-out_infinite] rounded-full bg-primary"
      />
    </div>
  )
}
