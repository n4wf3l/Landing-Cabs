import { useCallback, useSyncExternalStore } from 'react'

export type Theme = 'light' | 'dark'

const KEY = 'cabs-theme'

function readStored(): Theme {
  if (typeof window === 'undefined') return 'dark'
  const stored = localStorage.getItem(KEY) as Theme | null
  if (stored === 'light' || stored === 'dark') return stored
  return 'dark'
}

function apply(theme: Theme) {
  if (typeof document !== 'undefined') {
    document.documentElement.classList.toggle('dark', theme === 'dark')
  }
  if (typeof localStorage !== 'undefined') {
    localStorage.setItem(KEY, theme)
  }
}

let current: Theme = readStored()
const listeners = new Set<() => void>()

function subscribe(cb: () => void) {
  listeners.add(cb)
  return () => {
    listeners.delete(cb)
  }
}

function getSnapshot(): Theme {
  return current
}

function setThemeGlobal(next: Theme) {
  if (current === next) return
  current = next
  apply(next)
  listeners.forEach((l) => l())
}

if (typeof document !== 'undefined') {
  apply(current)
}

if (typeof window !== 'undefined') {
  window.addEventListener('storage', (e) => {
    if (e.key !== KEY) return
    const value = e.newValue
    if (value === 'light' || value === 'dark') {
      setThemeGlobal(value)
    }
  })
}

export function useTheme() {
  const theme = useSyncExternalStore(subscribe, getSnapshot, getSnapshot)

  const setTheme = useCallback((next: Theme) => {
    setThemeGlobal(next)
  }, [])

  const toggle = useCallback(() => {
    setThemeGlobal(current === 'dark' ? 'light' : 'dark')
  }, [])

  return { theme, setTheme, toggle }
}
