import {
  CalendarDays,
  CarFront,
  ChevronLeft,
  ChevronRight,
  Clock,
  Coins,
  LayoutDashboard,
  LogOut,
  MapPin,
  Settings,
  Users,
  type LucideIcon,
} from 'lucide-react'
import { useTranslation } from 'react-i18next'
import { Logo } from '@/components/common/Logo'
import { useAdminApp } from './useAdminApp'
import { IMPLEMENTED_SCREENS, type AdminScreen } from './types'
import { cn } from '@/lib/utils'

interface NavItem {
  id: AdminScreen
  Icon: LucideIcon
}

const ITEMS: NavItem[] = [
  { id: 'dashboard', Icon: LayoutDashboard },
  { id: 'vehicles', Icon: CarFront },
  { id: 'drivers', Icon: Users },
  { id: 'planning', Icon: CalendarDays },
  { id: 'shifts', Icon: Clock },
  { id: 'map', Icon: MapPin },
  { id: 'revenue', Icon: Coins },
  { id: 'settings', Icon: Settings },
]

export function AdminSidebar() {
  const { t } = useTranslation()
  const { screen, setScreen, showDemoToast, sidebarCollapsed, toggleSidebar } =
    useAdminApp()

  return (
    <aside
      className={cn(
        'flex h-full shrink-0 flex-col border-r border-border/40 bg-card/40 backdrop-blur transition-[width] duration-200',
        sidebarCollapsed ? 'w-12' : 'w-44',
      )}
    >
      <div
        className={cn(
          'flex items-center border-b border-border/40 py-3',
          sidebarCollapsed ? 'justify-center px-1' : 'gap-2 px-3',
        )}
      >
        {!sidebarCollapsed && <Logo />}
        <button
          type="button"
          onClick={toggleSidebar}
          aria-label={
            sidebarCollapsed
              ? t('admin.sidebar.expand')
              : t('admin.sidebar.collapse')
          }
          className={cn(
            'inline-flex h-6 w-6 items-center justify-center rounded-md text-muted-foreground transition-colors hover:bg-accent/40 hover:text-foreground',
            !sidebarCollapsed && 'ml-auto',
          )}
        >
          {sidebarCollapsed ? (
            <ChevronRight className="h-3.5 w-3.5" />
          ) : (
            <ChevronLeft className="h-3.5 w-3.5" />
          )}
        </button>
      </div>

      <nav
        aria-label="Admin navigation"
        className="flex-1 space-y-0.5 overflow-y-auto p-2"
      >
        {ITEMS.map(({ id, Icon }) => {
          const isActive = id === screen
          const isImplemented = IMPLEMENTED_SCREENS.has(id)
          const label = t(`admin.sidebar.${id}`)
          return (
            <button
              key={id}
              type="button"
              onClick={() => setScreen(id)}
              aria-current={isActive ? 'page' : undefined}
              title={sidebarCollapsed ? label : undefined}
              className={cn(
                'group flex w-full items-center rounded-md text-[11px] font-medium transition-colors',
                sidebarCollapsed
                  ? 'justify-center px-0 py-2'
                  : 'gap-2 px-2.5 py-1.5 text-left',
                isActive
                  ? 'bg-primary/15 text-primary'
                  : 'text-muted-foreground hover:bg-accent/40 hover:text-foreground',
              )}
            >
              <Icon className="h-3.5 w-3.5 shrink-0" />
              {!sidebarCollapsed && (
                <>
                  <span className="truncate">{label}</span>
                  {!isImplemented && !isActive && (
                    <span className="ml-auto rounded-full bg-zinc-500/20 px-1 py-0 text-[8px] font-semibold uppercase tracking-wider text-muted-foreground/80">
                      •••
                    </span>
                  )}
                </>
              )}
            </button>
          )
        })}
      </nav>

      <div className={cn('border-t border-border/40', sidebarCollapsed ? 'p-1' : 'p-2')}>
        <button
          type="button"
          onClick={() =>
            showDemoToast(
              t('admin.demoToast.actionLocked', {
                action: t('admin.sidebar.logout'),
              }),
            )
          }
          title={sidebarCollapsed ? t('admin.sidebar.logout') : undefined}
          className={cn(
            'flex w-full items-center rounded-md bg-rose-500/10 text-[11px] font-medium text-rose-300/90 ring-1 ring-rose-500/20 transition-colors hover:bg-rose-500/15',
            sidebarCollapsed
              ? 'justify-center px-0 py-2'
              : 'gap-2 px-2.5 py-1.5 text-left',
          )}
        >
          <LogOut className="h-3.5 w-3.5" />
          {!sidebarCollapsed && <span>{t('admin.sidebar.logout')}</span>}
        </button>
      </div>
    </aside>
  )
}
