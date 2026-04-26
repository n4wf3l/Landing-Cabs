import { Bell, BookOpen, MessageSquareText, Search } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import { useAdminApp } from './useAdminApp'

export function AdminTopBar() {
  const { t } = useTranslation()
  const { screen, showDemoToast } = useAdminApp()

  const lock = (label: string) =>
    showDemoToast(t('admin.demoToast.actionLocked', { action: label }))

  return (
    <div className="flex items-center justify-between gap-3 border-b border-border/40 px-4 py-2.5">
      <h2 className="text-sm font-semibold tracking-tight">
        {t(`admin.titles.${screen}`)}
      </h2>
      <div className="flex items-center gap-2">
        <button
          type="button"
          onClick={() => lock(t('admin.topbar.search'))}
          className="relative hidden md:block"
          aria-label={t('admin.topbar.search')}
        >
          <Search
            aria-hidden
            className="pointer-events-none absolute left-2 top-1/2 h-3 w-3 -translate-y-1/2 text-muted-foreground"
          />
          <span className="flex h-7 w-44 items-center rounded-md border border-border/40 bg-background/40 pl-7 pr-2 text-left text-[11px] text-muted-foreground/60">
            {t('admin.topbar.search')}…
          </span>
        </button>
        <button
          type="button"
          onClick={() => lock(t('admin.topbar.feedback'))}
          className="hidden h-7 items-center gap-1.5 rounded-md border border-border/40 bg-background/40 px-2 text-[11px] text-muted-foreground hover:text-foreground sm:inline-flex"
        >
          <MessageSquareText className="h-3 w-3" />
          {t('admin.topbar.feedback')}
        </button>
        <button
          type="button"
          onClick={() => lock(t('admin.topbar.guide'))}
          className="hidden h-7 items-center gap-1.5 rounded-md border border-border/40 bg-background/40 px-2 text-[11px] text-muted-foreground hover:text-foreground sm:inline-flex"
        >
          <BookOpen className="h-3 w-3" />
          {t('admin.topbar.guide')}
        </button>
        <button
          type="button"
          onClick={() => lock(t('admin.demoToast.actions.notifications'))}
          aria-label={t('admin.demoToast.actions.notifications')}
          className="relative inline-flex h-7 w-7 items-center justify-center rounded-md border border-border/40 bg-background/40 text-muted-foreground hover:text-foreground"
        >
          <Bell className="h-3 w-3" />
          <span className="absolute right-1 top-1 h-1.5 w-1.5 rounded-full bg-rose-500" />
        </button>
        <button
          type="button"
          onClick={() => lock(t('admin.demoToast.actions.profile'))}
          aria-label={t('admin.demoToast.actions.profile')}
          className="inline-flex h-7 w-7 items-center justify-center rounded-full bg-gradient-brand text-[10px] font-bold text-primary-foreground hover:opacity-90"
        >
          NA
        </button>
      </div>
    </div>
  )
}
