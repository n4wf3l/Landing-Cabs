import axios, { AxiosError, type InternalAxiosRequestConfig } from 'axios'
import { mockHandlers } from './mocks/handlers'

const USE_MOCK = import.meta.env.VITE_USE_MOCK_API !== 'false'
const FAIL_RATE = Number(import.meta.env.VITE_MOCK_FAILURE_RATE ?? 0)

export const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL ?? 'http://localhost:8080',
  timeout: 15000,
  headers: { 'Content-Type': 'application/json' },
})

if (USE_MOCK) {
  api.interceptors.request.use((config: InternalAxiosRequestConfig) => {
    const url = config.url ?? ''
    if (!url.startsWith('/api/public/')) return config

    const key = `${(config.method ?? 'get').toUpperCase()} ${url.split('?')[0]}`
    const handler = mockHandlers[key]
    if (!handler) return config

    config.adapter = async () => {
      const delay = 600 + Math.random() * 600
      await new Promise((r) => setTimeout(r, delay))

      if (FAIL_RATE > 0 && Math.random() < FAIL_RATE) {
        const err = new AxiosError(
          'Mock failure',
          'ERR_MOCK',
          config,
          null,
          {
            status: 500,
            statusText: 'Internal Server Error',
            data: { message: 'Mock random failure' },
            headers: {},
            config,
          } as never,
        )
        throw err
      }

      const data =
        typeof config.data === 'string' ? safeJsonParse(config.data) : config.data
      const body = handler(data)
      return {
        data: body,
        status: 200,
        statusText: 'OK',
        headers: {},
        config,
      } as never
    }
    return config
  })
}

function safeJsonParse(s: string): unknown {
  try {
    return JSON.parse(s)
  } catch {
    return s
  }
}
