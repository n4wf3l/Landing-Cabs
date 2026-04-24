import { useCallback, useState } from 'react'

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

export function useFirstVisit(): readonly [boolean, () => void] {
  const [isFirst, setIsFirst] = useState<boolean>(readInitial)

  const markSeen = useCallback(() => {
    try {
      window.localStorage.setItem(KEY, '1')
    } catch {
      /* ignore quota errors */
    }
    setIsFirst(false)
  }, [])

  return [isFirst, markSeen] as const
}
