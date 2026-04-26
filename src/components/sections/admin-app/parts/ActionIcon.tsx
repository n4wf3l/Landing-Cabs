import type { LucideIcon } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import { useAdminApp } from '../useAdminApp'
import { cn } from '@/lib/utils'

type Accent = 'sky' | 'amber' | 'rose'
type ActionKey = 'view' | 'edit' | 'delete'

interface ActionIconProps {
  Icon: LucideIcon
  accent: Accent
  actionKey: ActionKey
}

const TONE: Record<Accent, string> = {
  sky: 'text-sky-400 hover:bg-sky-500/15',
  amber: 'text-amber-400 hover:bg-amber-500/15',
  rose: 'text-rose-400 hover:bg-rose-500/15',
}

export function ActionIcon({ Icon, accent, actionKey }: ActionIconProps) {
  const { t } = useTranslation()
  const { showDemoToast } = useAdminApp()

  const label = t(`admin.demoToast.actions.${actionKey}`)

  return (
    <button
      type="button"
      onClick={() =>
        showDemoToast(t('admin.demoToast.actionLocked', { action: label }))
      }
      aria-label={label}
      title={label}
      className={cn(
        'inline-flex h-5 w-5 items-center justify-center rounded transition-colors',
        TONE[accent],
      )}
    >
      <Icon className="h-3 w-3" />
    </button>
  )
}
