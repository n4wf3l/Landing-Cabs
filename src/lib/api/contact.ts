import { api } from '../api'

export type ContactSubject =
  | 'beta'
  | 'demo'
  | 'pricing'
  | 'partnership'
  | 'press'
  | 'other'

export interface ContactPayload {
  name: string
  email: string
  company?: string
  subject: ContactSubject
  message: string
  locale?: string
  turnstileToken?: string | null
}

export const submitContact = (p: ContactPayload): Promise<{ ok: true; receivedAt: number }> =>
  api.post<{ ok: true; receivedAt: number }>('/api/public/contact', p).then((r) => r.data)
