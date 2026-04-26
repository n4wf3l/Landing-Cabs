import { useCallback, useSyncExternalStore } from 'react'

const KEY = 'cabs-splash-seen'

function readInitial(): boolean {
  if (typeof window === 'undefined') return false
  try {
    const forced = new URLSearchParams(window.location.search).get('splash')
    if (forced === '1') return true
    return window.localStorage.getItem(KEY) !== '1'
  } catch {
    return false
  }
}

// Module-level store so SplashScreen and Hero (and anyone else) share the
// same value and re-render together when the splash is dismissed.
let cachedValue: boolean | null = null
const listeners = new Set<() => void>()

function getSnapshot(): boolean {
  if (cachedValue === null) cachedValue = readInitial()
  return cachedValue
}

function getServerSnapshot(): boolean {
  return false
}

function subscribe(listener: () => void): () => void {
  listeners.add(listener)
  return () => {
    listeners.delete(listener)
  }
}

function notify(): void {
  listeners.forEach((l) => l())
}

export function useFirstVisit(): readonly [boolean, () => void] {
  const isFirst = useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot)

  const markSeen = useCallback(() => {
    if (cachedValue === false) return
    try {
      window.localStorage.setItem(KEY, '1')
    } catch {
      /* ignore quota errors */
    }
    cachedValue = false
    notify()
  }, [])

  return [isFirst, markSeen] as const
}
