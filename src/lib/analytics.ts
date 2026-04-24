export type AnalyticsEvent =
  | 'pricing_toggle_cycle'
  | 'pricing_plan_selected'
  | 'signup_step_completed'
  | 'signup_completed'
  | 'contact_submitted'
  | 'waitlist_signup'

export function track(event: AnalyticsEvent, props: Record<string, unknown> = {}): void {
  if (import.meta.env.DEV) {
    console.log('[analytics]', event, props)
  }
}
