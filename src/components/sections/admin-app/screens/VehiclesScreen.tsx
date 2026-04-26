import { useMemo, useState } from 'react'
import {
  CarFront,
  Eye,
  Filter,
  Pencil,
  Plus,
  Sparkles,
  Trash2,
} from 'lucide-react'
import { useTranslation } from 'react-i18next'
import { motion } from 'framer-motion'
import { ActionIcon } from '../parts/ActionIcon'
import { KpiCard } from '../parts/KpiCard'
import { StatusBadge } from '../parts/StatusBadge'
import { KPI, VEHICLES } from '../mockData'
import type {
  VehicleFormPayload,
  VehicleRow,
  VehicleStateApi,
  VehicleStatus,
} from '../types'
import { useAdminApp } from '../useAdminApp'
import { cn } from '@/lib/utils'

const FILTER_KEYS = ['all', 'inService', 'maintenance', 'repair'] as const
type FilterKey = (typeof FILTER_KEYS)[number]

const STATUS_TONE: Record<VehicleStatus, Parameters<typeof StatusBadge>[0]['tone']> = {
  good: 'emerald',
  in_service: 'sky',
  maintenance: 'amber',
  repair: 'rose',
  off: 'zinc',
}

const STATE_TO_STATUS: Record<VehicleStateApi, VehicleStatus> = {
  IN_SERVICE: 'in_service',
  GOOD_CONDITION: 'good',
  MAINTENANCE: 'maintenance',
  REPAIR: 'repair',
  OUT_OF_SERVICE: 'off',
}

function matches(filter: FilterKey, status: VehicleStatus): boolean {
  if (filter === 'all') return true
  if (filter === 'inService') return status === 'in_service' || status === 'good'
  if (filter === 'maintenance') return status === 'maintenance'
  if (filter === 'repair') return status === 'repair'
  return true
}

function payloadToRow(p: VehicleFormPayload, i: number): VehicleRow {
  return {
    id: `added_v_${i}`,
    plate: p.licensePlate || '—',
    model: `${p.brand} ${p.model}`.trim() || '—',
    driverDay: null,
    driverNight: null,
    status: STATE_TO_STATUS[p.state],
    transmission: p.transmission === 'AUTOMATIC' ? 'auto' : 'manual',
  }
}

export function VehiclesScreen() {
  const { t } = useTranslation()
  const { addedVehicles, openModal, showDemoToast } = useAdminApp()
  const [filter, setFilter] = useState<FilterKey>('all')

  const allRows = useMemo<VehicleRow[]>(() => {
    const added = addedVehicles.map((p, i) => payloadToRow(p, i))
    return [...added, ...VEHICLES]
  }, [addedVehicles])

  const rows = allRows.filter((v) => matches(filter, v.status))

  return (
    <div className="grid h-full grid-rows-[auto_auto_1fr] gap-3 p-4">
      <div className="grid grid-cols-4 gap-2">
        <KpiCard
          label={t('admin.kpi.totalVehicles')}
          value={KPI.vehiclesTotal + addedVehicles.length}
          Icon={CarFront}
          accent="primary"
        />
        <KpiCard label={t('admin.kpi.inService')} value={KPI.vehiclesInService} accent="emerald" />
        <KpiCard label={t('admin.kpi.maintenance')} value={KPI.vehiclesMaintenance} accent="amber" />
        <KpiCard label={t('admin.kpi.repair')} value={KPI.vehiclesRepair} accent="rose" />
      </div>

      <div className="flex items-center justify-between gap-2">
        <div className="flex items-center gap-1 rounded-md bg-card/40 p-0.5">
          {FILTER_KEYS.map((f) => (
            <button
              key={f}
              type="button"
              onClick={() => setFilter(f)}
              className={cn(
                'rounded px-2 py-1 text-[10px] font-medium transition-colors',
                f === filter
                  ? 'bg-primary/20 text-primary'
                  : 'text-muted-foreground hover:text-foreground',
              )}
            >
              {t(`admin.vehicles.filters.${f}`)}
            </button>
          ))}
        </div>
        <div className="flex items-center gap-1.5">
          <button
            type="button"
            onClick={() =>
              showDemoToast(
                t('admin.demoToast.actionLocked', {
                  action: t('admin.vehicles.buttons.filters'),
                }),
              )
            }
            className="inline-flex h-7 items-center gap-1.5 rounded-md border border-border/40 bg-background/40 px-2 text-[10px] text-muted-foreground hover:text-foreground"
          >
            <Filter className="h-3 w-3" />
            {t('admin.vehicles.buttons.filters')}
          </button>
          <button
            type="button"
            onClick={() => openModal('addVehicle')}
            className="inline-flex h-7 items-center gap-1.5 rounded-md bg-primary px-2 text-[10px] font-semibold text-primary-foreground hover:opacity-95"
          >
            <Plus className="h-3 w-3" />
            {t('admin.vehicles.buttons.new')}
          </button>
        </div>
      </div>

      <div className="overflow-hidden rounded-md border border-border/40 bg-background/40">
        <table className="w-full text-[10px]">
          <thead>
            <tr className="border-b border-border/40 bg-card/30 text-left text-muted-foreground">
              <th className="px-3 py-2 font-medium">{t('admin.vehicles.table.plate')}</th>
              <th className="px-3 py-2 font-medium">{t('admin.vehicles.table.model')}</th>
              <th className="px-3 py-2 font-medium">{t('admin.vehicles.table.day')}</th>
              <th className="px-3 py-2 font-medium">{t('admin.vehicles.table.night')}</th>
              <th className="px-3 py-2 font-medium">{t('admin.vehicles.table.status')}</th>
              <th className="px-3 py-2 font-medium">{t('admin.vehicles.table.transmission')}</th>
              <th className="px-3 py-2 text-right font-medium">{t('admin.vehicles.table.actions')}</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((v) => {
              const isNew = v.id.startsWith('added_v_')
              return (
                <motion.tr
                  key={v.id}
                  layout
                  initial={isNew ? { opacity: 0, backgroundColor: 'rgba(34,197,94,0.18)' } : false}
                  animate={isNew ? { opacity: 1, backgroundColor: 'rgba(34,197,94,0)' } : { opacity: 1 }}
                  transition={{ duration: 1.4, ease: 'easeOut' }}
                  className="border-b border-border/30 last:border-b-0 hover:bg-card/30"
                >
                  <td className="px-3 py-1.5">
                    <div className="flex items-center gap-1.5">
                      <span className="font-mono font-semibold">{v.plate}</span>
                      {isNew && (
                        <span className="inline-flex items-center gap-0.5 rounded-full bg-emerald-500/15 px-1.5 py-0 text-[8px] font-bold uppercase tracking-wider text-emerald-300 ring-1 ring-emerald-500/30">
                          <Sparkles className="h-2 w-2" />
                          {t('admin.drivers.newBadge')}
                        </span>
                      )}
                    </div>
                  </td>
                  <td className="px-3 py-1.5">{v.model}</td>
                  <td className="px-3 py-1.5 text-muted-foreground">
                    {v.driverDay ?? '—'}
                  </td>
                  <td className="px-3 py-1.5 text-muted-foreground">
                    {v.driverNight ?? '—'}
                  </td>
                  <td className="px-3 py-1.5">
                    <StatusBadge
                      tone={STATUS_TONE[v.status]}
                      label={t(`admin.vehicles.status.${v.status}`)}
                    />
                  </td>
                  <td className="px-3 py-1.5">
                    <span className="rounded bg-zinc-500/15 px-1.5 py-0.5 font-mono text-[9px] uppercase text-muted-foreground">
                      {v.transmission === 'auto' ? 'A' : 'M'}
                    </span>
                  </td>
                  <td className="px-3 py-1.5">
                    <div className="flex items-center justify-end gap-1">
                      <ActionIcon Icon={Eye} accent="sky" actionKey="view" />
                      <ActionIcon Icon={Pencil} accent="amber" actionKey="edit" />
                      <ActionIcon Icon={Trash2} accent="rose" actionKey="delete" />
                    </div>
                  </td>
                </motion.tr>
              )
            })}
          </tbody>
        </table>
      </div>
    </div>
  )
}
