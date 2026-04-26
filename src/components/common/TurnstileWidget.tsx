import { forwardRef, useEffect, useImperativeHandle, useRef } from 'react'
import { Turnstile, type TurnstileInstance } from '@marsidev/react-turnstile'
import { useTheme } from '@/hooks/useTheme'

const SITE_KEY = import.meta.env.VITE_TURNSTILE_SITE_KEY ?? ''

export interface TurnstileWidgetHandle {
  /**
   * Returns the current verification token. Resolves once the user has
   * passed the (potentially invisible) challenge. Resolves with `null`
   * if Turnstile is not configured (no site key) — caller should treat
   * that as "skip verification".
   */
  getToken: () => Promise<string | null>
  reset: () => void
}

interface Props {
  /**
   * - `visible` (default): renders the standard widget inline. Best for
   *   conversion-critical forms (e.g. /contact) where a visible
   *   "verified human" badge increases user trust.
   * - `invisible`: runs verification silently in the background and
   *   collects the token without rendering UI. Best for surfaces where
   *   the widget would clutter the design (e.g. homepage hero).
   */
  mode?: 'visible' | 'invisible'
  onError?: () => void
}

export const TurnstileWidget = forwardRef<TurnstileWidgetHandle, Props>(
  function TurnstileWidget({ mode = 'visible', onError }, ref) {
    const { theme } = useTheme()
    const innerRef = useRef<TurnstileInstance | null>(null)
    const tokenRef = useRef<string | null>(null)
    const pendingResolvers = useRef<Array<(t: string | null) => void>>([])

    useImperativeHandle(ref, () => ({
      getToken: () => {
        if (!SITE_KEY) return Promise.resolve(null)
        if (tokenRef.current) return Promise.resolve(tokenRef.current)
        return new Promise<string | null>((resolve) => {
          pendingResolvers.current.push(resolve)
          // Force the widget to start verification if it hasn't yet.
          innerRef.current?.execute()
        })
      },
      reset: () => {
        tokenRef.current = null
        innerRef.current?.reset()
      },
    }))

    // Invisible mode doesn't auto-run on mount. Trigger an early
    // execute() so the token is ready by the time the user submits,
    // avoiding a noticeable delay on click.
    useEffect(() => {
      if (mode !== 'invisible' || !SITE_KEY) return
      const id = window.setTimeout(() => innerRef.current?.execute(), 50)
      return () => window.clearTimeout(id)
    }, [mode])

    if (!SITE_KEY) return null

    const onSuccess = (token: string) => {
      tokenRef.current = token
      const resolvers = pendingResolvers.current
      pendingResolvers.current = []
      resolvers.forEach((r) => r(token))
    }

    const onErrorInternal = () => {
      tokenRef.current = null
      const resolvers = pendingResolvers.current
      pendingResolvers.current = []
      resolvers.forEach((r) => r(null))
      onError?.()
    }

    const onExpire = () => {
      tokenRef.current = null
      innerRef.current?.reset()
    }

    if (mode === 'invisible') {
      return (
        <Turnstile
          ref={innerRef}
          siteKey={SITE_KEY}
          options={{
            theme: theme === 'dark' ? 'dark' : 'light',
            size: 'invisible',
            appearance: 'execute',
          }}
          onSuccess={onSuccess}
          onError={onErrorInternal}
          onExpire={onExpire}
        />
      )
    }

    return (
      <div className="flex justify-center pt-1">
        <Turnstile
          ref={innerRef}
          siteKey={SITE_KEY}
          options={{
            theme: theme === 'dark' ? 'dark' : 'light',
            size: 'flexible',
            appearance: 'always',
          }}
          onSuccess={onSuccess}
          onError={onErrorInternal}
          onExpire={onExpire}
        />
      </div>
    )
  },
)
