import { motion } from 'framer-motion'
import { Info } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import { Avatar } from '../parts/Avatar'
import { MAP_PINS } from '../mockData'

export function MapScreen() {
  const { t } = useTranslation()
  const available = MAP_PINS.filter((p) => p.status === 'available').length
  const onRide = MAP_PINS.filter((p) => p.status === 'on_ride').length

  return (
    <div className="grid h-full grid-rows-[auto_1fr_auto] gap-3 p-4">
      <div className="flex items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-500/10 px-2.5 py-1 text-[10px] font-medium text-emerald-300 ring-1 ring-emerald-500/20">
            <span className="relative flex h-2 w-2">
              <span className="absolute inset-0 animate-ping rounded-full bg-emerald-500/60" />
              <span className="relative h-2 w-2 rounded-full bg-emerald-500" />
            </span>
            {t('admin.map.live')}
          </span>
          <span className="text-[10px] text-muted-foreground">
            {t('admin.map.summary', { available, onRide })}
          </span>
        </div>
        <span className="inline-flex items-center gap-1 rounded-full border border-amber-500/30 bg-amber-500/10 px-2 py-0.5 text-[9px] font-semibold uppercase tracking-wider text-amber-300">
          <Info className="h-2.5 w-2.5" />
          {t('admin.map.preview')}
        </span>
      </div>

      <div className="relative overflow-hidden rounded-md border border-border/40 bg-gradient-to-br from-slate-900 via-[#0f172a] to-[#0a1226]">
        <FakeMapBackground />

        {MAP_PINS.map((pin, i) => (
          <motion.div
            key={pin.id}
            initial={{ opacity: 0, scale: 0.5 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.05 * i, duration: 0.3 }}
            className="absolute"
            style={{
              left: `${pin.lng}%`,
              top: `${pin.lat}%`,
              transform: 'translate(-50%, -50%)',
            }}
          >
            <div className="relative">
              {pin.status === 'on_ride' && (
                <span className="absolute inset-0 -m-2 animate-ping rounded-full bg-amber-500/40" />
              )}
              <div
                className={
                  pin.status === 'available'
                    ? 'rounded-full ring-2 ring-emerald-500/60'
                    : 'rounded-full ring-2 ring-amber-500/60'
                }
              >
                <Avatar
                  initials={pin.initials}
                  hue={pin.status === 'available' ? 150 : 40}
                />
              </div>
            </div>
          </motion.div>
        ))}

        <div className="absolute bottom-2 left-2 flex flex-col gap-1 rounded-md border border-white/10 bg-black/40 px-2 py-1.5 backdrop-blur">
          <Legend swatch="bg-emerald-500" label={t('admin.map.available')} />
          <Legend swatch="bg-amber-500" label={t('admin.map.onRide')} />
        </div>
      </div>

      <p className="rounded-md border border-amber-500/20 bg-amber-500/5 px-3 py-2 text-[10px] leading-relaxed text-amber-200/80">
        <Info className="mr-1.5 inline h-3 w-3 align-text-top" aria-hidden />
        {t('admin.map.previewNotice')}
      </p>
    </div>
  )
}

function Legend({ swatch, label }: { swatch: string; label: string }) {
  return (
    <div className="flex items-center gap-1.5 text-[9px] text-zinc-300">
      <span className={`h-1.5 w-1.5 rounded-full ${swatch}`} />
      {label}
    </div>
  )
}

function FakeMapBackground() {
  return (
    <svg
      aria-hidden
      viewBox="0 0 100 100"
      preserveAspectRatio="none"
      className="absolute inset-0 h-full w-full opacity-50"
    >
      <defs>
        <pattern id="grid-map" width="8" height="8" patternUnits="userSpaceOnUse">
          <path
            d="M 8 0 L 0 0 0 8"
            fill="none"
            stroke="rgba(148,163,184,0.08)"
            strokeWidth="0.3"
          />
        </pattern>
      </defs>
      <rect width="100" height="100" fill="url(#grid-map)" />

      <path
        d="M 5 50 Q 20 30, 35 45 T 70 35 Q 85 30, 95 50"
        stroke="rgba(99,102,241,0.4)"
        strokeWidth="0.4"
        fill="none"
        strokeDasharray="2 2"
      />
      <path
        d="M 10 80 Q 30 60, 50 70 T 90 60"
        stroke="rgba(99,102,241,0.3)"
        strokeWidth="0.4"
        fill="none"
      />
      <path
        d="M 50 5 Q 55 30, 45 50 T 55 95"
        stroke="rgba(99,102,241,0.3)"
        strokeWidth="0.4"
        fill="none"
      />
      <path
        d="M 0 25 Q 25 35, 50 30 T 100 40"
        stroke="rgba(99,102,241,0.25)"
        strokeWidth="0.4"
        fill="none"
        strokeDasharray="1 1"
      />
    </svg>
  )
}
