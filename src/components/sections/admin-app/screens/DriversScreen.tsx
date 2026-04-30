import { useMemo } from 'react'
import {
  Eye,
  Pencil,
  Plus,
  Sparkles,
  Trash2,
  UserCheck,
  UserMinus,
  Users,
} from 'lucide-react'
import { useTranslation } from 'react-i18next'
import { motion } from 'framer-motion'
import { ActionIcon } from '../parts/ActionIcon'
import { Avatar } from '../parts/Avatar'
import { ProgressRing } from '../parts/ProgressRing'
import { StatusBadge } from '../parts/StatusBadge'
import { DRIVERS, KPI } from '../mockData'
import type { DriverFormPayload, DriverRow, DriverStatus } from '../types'
import { useAdminApp } from '../useAdminApp'
import { cn } from '@/lib/utils'

const STATUS_TONE: Record<DriverStatus, Parameters<typeof StatusBadge>[0]['tone']> = {
  active: 'emerald',
  leave: 'amber',
  sick: 'rose',
  inactive: 'zinc',
}

function payloadToRow(p: DriverFormPayload, i: number): DriverRow {
  const initials = `${p.user.firstName.charAt(0)}${p.user.lastName.charAt(0)}`.toUpperCase() || '??'
  return {
    id: `added_${i}`,
    initials,
    firstName: p.user.firstName || '—',
    lastName: p.user.lastName || '',
    email: p.user.email || '—',
    phone: p.user.phoneNumber || '—',
    city: p.user.city || '—',
    postcode: p.user.postalCode || '—',
    status: 'active',
    shiftStartedAt: '—',
    shiftDurationMinutes: 0,
    paymentEnabled: p.acceptedPayments.length > 0,
    avatarHue: ((p.user.firstName.charCodeAt(0) || 0) * 7) % 360,
  }
}

export function DriversScreen() {
  const { t } = useTranslation()
  const { addedDrivers, openModal, openConditionsFor } = useAdminApp()

  const rows = useMemo<DriverRow[]>(() => {
    const added = addedDrivers.map((p, i) => payloadToRow(p, i))
    return [...added, ...DRIVERS].slice(0, 8 + added.length)
  }, [addedDrivers])

  const totalDrivers = KPI.driversTotal + addedDrivers.length
  const activeDrivers = KPI.driversActive + addedDrivers.length

  return (
    <div className="relative h-full">
      <div className="grid h-full grid-rows-[auto_auto_1fr] gap-3 p-4">
        <div className="grid grid-cols-3 gap-2">
          <DriverKpi
            label={t('admin.kpi.totalDrivers')}
            value={totalDrivers}
            progress={totalDrivers}
            max={totalDrivers}
            color="hsl(var(--primary))"
            Icon={Users}
          />
          <DriverKpi
            label={t('admin.kpi.activeDrivers')}
            value={activeDrivers}
            progress={activeDrivers}
            max={totalDrivers}
            color="hsl(150 70% 50%)"
            Icon={UserCheck}
          />
          <DriverKpi
            label={t('admin.kpi.onLeave')}
            value={KPI.driversOnLeave + KPI.driversSick}
            progress={KPI.driversOnLeave + KPI.driversSick}
            max={totalDrivers}
            color="hsl(40 90% 55%)"
            Icon={UserMinus}
          />
        </div>

        <div className="flex items-center justify-between">
          <p className="text-[10px] text-muted-foreground">
            {t('admin.drivers.tableHint', { count: rows.length })}
          </p>
          <button
            type="button"
            onClick={() => openModal('addDriver')}
            className="inline-flex h-7 items-center gap-1.5 rounded-md bg-primary px-2 text-[10px] font-semibold text-primary-foreground hover:opacity-95"
          >
            <Plus className="h-3 w-3" />
            {t('admin.drivers.newDriver')}
          </button>
        </div>

        <div className="overflow-hidden rounded-md border border-border/40 bg-background/40">
          <table className="w-full text-[10px]">
            <thead>
              <tr className="border-b border-border/40 bg-card/30 text-left text-muted-foreground">
                <th className="px-3 py-2 font-medium">{t('admin.drivers.table.name')}</th>
                <th className="px-3 py-2 font-medium">{t('admin.drivers.table.email')}</th>
                <th className="px-3 py-2 font-medium">{t('admin.drivers.table.phone')}</th>
                <th className="px-3 py-2 font-medium">{t('admin.drivers.table.address')}</th>
                <th className="px-3 py-2 font-medium">{t('admin.drivers.table.payments')}</th>
                <th className="px-3 py-2 font-medium">{t('admin.drivers.table.status')}</th>
                <th className="px-3 py-2 text-right font-medium">{t('admin.drivers.table.actions')}</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((d, idx) => {
                const isNew = d.id.startsWith('added_')
                return (
                  <motion.tr
                    key={d.id}
                    layout
                    initial={isNew ? { opacity: 0, backgroundColor: 'rgba(34,197,94,0.18)' } : false}
                    animate={isNew ? { opacity: 1, backgroundColor: 'rgba(34,197,94,0)' } : { opacity: 1 }}
                    transition={{ duration: 1.4, ease: 'easeOut' }}
                    className="border-b border-border/30 last:border-b-0 hover:bg-card/30"
                  >
                    <td className="px-3 py-1.5">
                      <div className="flex items-center gap-2">
                        <Avatar initials={d.initials} hue={d.avatarHue} />
                        <div>
                          <p className="flex items-center gap-1.5 font-semibold leading-tight">
                            {d.firstName} {d.lastName}
                            {isNew && (
                              <span className="inline-flex items-center gap-0.5 rounded-full bg-emerald-500/15 px-1.5 py-0 text-[8px] font-bold uppercase tracking-wider text-emerald-300 ring-1 ring-emerald-500/30">
                                <Sparkles className="h-2 w-2" />
                                {t('admin.drivers.newBadge')}
                              </span>
                            )}
                          </p>
                          <p className="text-[9px] text-muted-foreground">{d.city}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-3 py-1.5 text-muted-foreground">{d.email}</td>
                    <td className="px-3 py-1.5 font-mono text-muted-foreground">{d.phone}</td>
                    <td className="px-3 py-1.5 text-muted-foreground">{d.postcode}</td>
                    <td className="px-3 py-1.5">
                      <StatusBadge
                        tone={d.paymentEnabled ? 'emerald' : 'zinc'}
                        label={t(
                          d.paymentEnabled
                            ? 'admin.drivers.payments.enabled'
                            : 'admin.drivers.payments.disabled',
                        )}
                      />
                    </td>
                    <td className="px-3 py-1.5">
                      <StatusBadge
                        tone={STATUS_TONE[d.status]}
                        label={t(`admin.drivers.status.${d.status}`)}
                      />
                    </td>
                    <td className="px-3 py-1.5">
                      <div className="flex items-center justify-end gap-1">
                        <button
                          type="button"
                          onClick={() => openConditionsFor(d)}
                          aria-label={t('admin.driverConditions.openLabel', {
                            name: `${d.firstName} ${d.lastName}`.trim(),
                          })}
                          title={t('admin.driverConditions.openLabel', {
                            name: `${d.firstName} ${d.lastName}`.trim(),
                          })}
                          className={cn(
                            'inline-flex h-5 w-5 items-center justify-center rounded transition-colors',
                            'text-sky-400 hover:bg-sky-500/15',
                          )}
                        >
                          <Eye className="h-3 w-3" />
                        </button>
                        <ActionIcon Icon={Pencil} accent="amber" actionKey="edit" />
                        <ActionIcon Icon={Trash2} accent="rose" actionKey="delete" />
                      </div>
                    </td>
                    {/* keep idx referenced for stable lint */}
                    <td className="hidden">{idx}</td>
                  </motion.tr>
                )
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}

function DriverKpi({
  label,
  value,
  progress,
  max,
  color,
  Icon,
}: {
  label: string
  value: number
  progress: number
  max: number
  color: string
  Icon: typeof Users
}) {
  return (
    <div className="rounded-lg border border-border/60 bg-card/60 p-3 backdrop-blur">
      <div className="flex items-center justify-between gap-3">
        <div>
          <p className="text-[10px] font-medium uppercase tracking-wider text-muted-foreground">
            {label}
          </p>
          <p className="mt-0.5 text-xl font-bold tabular-nums tracking-tight">
            {value}
          </p>
        </div>
        <div className="relative">
          <ProgressRing value={progress} max={max} color={color} />
          <Icon
            className="absolute left-1/2 top-1/2 h-3 w-3 -translate-x-1/2 -translate-y-1/2"
            style={{ color }}
          />
        </div>
      </div>
    </div>
  )
}

