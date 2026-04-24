type Handler = (payload: unknown) => unknown

export const mockHandlers: Record<string, Handler> = {
  'POST /api/public/contact': () => ({
    ok: true,
    receivedAt: Date.now(),
  }),
  'POST /api/public/notify': () => ({
    ok: true,
    receivedAt: Date.now(),
  }),
}
