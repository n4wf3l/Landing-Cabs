import { api } from '../api'

export interface NotifyPayload {
  email: string
  locale?: string
  turnstileToken?: string | null
}

export interface NotifyResponse {
  ok: true
  receivedAt: number
  alreadySubscribed?: boolean
}

const STORAGE_KEY = 'cabs-waitlist'

function readLocal(): string[] {
  if (typeof localStorage === 'undefined') return []
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    return raw ? (JSON.parse(raw) as string[]) : []
  } catch {
    return []
  }
}

function writeLocal(list: string[]) {
  if (typeof localStorage === 'undefined') return
  localStorage.setItem(STORAGE_KEY, JSON.stringify(list))
}

export async function subscribeToWaitlist(p: NotifyPayload): Promise<NotifyResponse> {
  const existing = readLocal()
  const alreadySubscribed = existing.includes(p.email.toLowerCase())
  if (!alreadySubscribed) {
    writeLocal([...existing, p.email.toLowerCase()])
  }
  const res = await api.post<NotifyResponse>('/api/public/notify', p)
  return { ...res.data, alreadySubscribed }
}

export function isSubscribed(email: string): boolean {
  return readLocal().includes(email.toLowerCase())
}
