import { api } from '../api'

export interface ContactPayload {
  name: string
  email: string
  company?: string
  message: string
}

export const submitContact = (p: ContactPayload): Promise<{ ok: true; receivedAt: number }> =>
  api.post<{ ok: true; receivedAt: number }>('/api/public/contact', p).then((r) => r.data)
