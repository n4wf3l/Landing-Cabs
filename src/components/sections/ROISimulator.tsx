import { useMemo, useState } from 'react'
import { motion } from 'framer-motion'
import { Calculator, Clock, Coins, FileWarning, Sparkles } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import { SectionHeading } from '@/components/common/SectionHeading'
import { cn } from '@/lib/utils'

// Conservative estimates derived from typical Brussels taxi-fleet admin time:
// — 0.5h/week per vehicle (maintenance log, document upkeep, planning)
// — 1.5h/week per driver (ride reconciliation, WhatsApp tickets, commission verification)
// — 18€/month per driver in commission errors caught early (Bolt/Heetch/Uber rate changes)
const HOURS_PER_VEHICLE = 0.5
const HOURS_PER_DRIVER = 1.5
const EUR_PER_DRIVER_PER_MONTH = 18

const MIN_VEHICLES = 1
const MAX_VEHICLES = 50
const MIN_DRIVERS = 1
const MAX_DRIVERS = 100

interface Metric {
  Icon: typeof Clock
  labelKey: string
  value: string
  hintKey: string
}

export function ROISimulator() {
  const { t } = useTranslation()
  const [vehicles, setVehicles] = useState(8)
  const [drivers, setDrivers] = useState(12)

  const metrics = useMemo(() => {
    const hoursWeek = vehicles * HOURS_PER_VEHICLE + drivers * HOURS_PER_DRIVER
    const hoursMonth = hoursWeek * 4.33
    const daysMonth = hoursMonth / 8
    const eurMonth = drivers * EUR_PER_DRIVER_PER_MONTH
    const errorsMonth = drivers * 2

    const m: Metric[] = [
      {
        Icon: Clock,
        labelKey: 'roi.metrics.hoursWeek',
        value: `${Math.round(hoursWeek)} h`,
        hintKey: 'roi.metrics.hoursWeekHint',
      },
      {
        Icon: Sparkles,
        labelKey: 'roi.metrics.daysMonth',
        value: `${daysMonth.toFixed(1)} j`,
        hintKey: 'roi.metrics.daysMonthHint',
      },
      {
        Icon: Coins,
        labelKey: 'roi.metrics.eurMonth',
        value: `€${eurMonth.toLocaleString('fr-BE')}`,
        hintKey: 'roi.metrics.eurMonthHint',
      },
      {
        Icon: FileWarning,
        labelKey: 'roi.metrics.errorsMonth',
        value: `${errorsMonth}`,
        hintKey: 'roi.metrics.errorsMonthHint',
      },
    ]
    return m
  }, [vehicles, drivers])

  return (
    <section
      id="roi"
      className="relative scroll-mt-20 py-24 sm:py-32"
    >
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <SectionHeading
          eyebrow={t('roi.eyebrow')}
          title={t('roi.title')}
          subtitle={t('roi.subtitle')}
        />

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-15%' }}
          transition={{ duration: 0.5 }}
          className="relative mx-auto mt-12 max-w-4xl"
        >
          <div
            aria-hidden
            className="absolute -inset-6 -z-10 rounded-[2rem] bg-gradient-brand opacity-15 blur-3xl"
          />

          <div className="overflow-hidden rounded-2xl border border-border/60 bg-card/60 shadow-glow-lg backdrop-blur">
            {/* Header */}
            <div className="flex items-center gap-2 border-b border-border/40 bg-card/40 px-6 py-3">
              <span className="inline-flex h-7 w-7 items-center justify-center rounded-md bg-primary/15 text-primary">
                <Calculator className="h-3.5 w-3.5" />
              </span>
              <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                {t('roi.header')}
              </span>
            </div>

            {/* Inputs */}
            <div className="grid grid-cols-1 gap-5 border-b border-border/40 p-6 sm:grid-cols-2 sm:gap-8">
              <Slider
                label={t('roi.inputs.vehicles')}
                value={vehicles}
                min={MIN_VEHICLES}
                max={MAX_VEHICLES}
                onChange={setVehicles}
                accent="primary"
              />
              <Slider
                label={t('roi.inputs.drivers')}
                value={drivers}
                min={MIN_DRIVERS}
                max={MAX_DRIVERS}
                onChange={setDrivers}
                accent="emerald"
              />
            </div>

            {/* Output metrics */}
            <div className="grid grid-cols-2 divide-x divide-y divide-border/40 sm:grid-cols-4 sm:divide-y-0">
              {metrics.map(({ Icon, labelKey, value, hintKey }) => (
                <div key={labelKey} className="p-5">
                  <div className="flex items-center gap-1.5 text-[10px] font-medium uppercase tracking-wider text-muted-foreground">
                    <Icon className="h-3 w-3" />
                    {t(labelKey)}
                  </div>
                  <p className="mt-2 text-2xl font-extrabold tabular-nums tracking-tight text-foreground">
                    {value}
                  </p>
                  <p className="mt-1 text-[10px] leading-relaxed text-muted-foreground">
                    {t(hintKey)}
                  </p>
                </div>
              ))}
            </div>

            {/* Footer disclaimer */}
            <div className="border-t border-border/40 bg-card/40 px-6 py-3">
              <p className="text-[10px] leading-relaxed text-muted-foreground/80">
                {t('roi.disclaimer')}
              </p>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  )
}

interface SliderProps {
  label: string
  value: number
  min: number
  max: number
  onChange: (v: number) => void
  accent: 'primary' | 'emerald'
}

function Slider({ label, value, min, max, onChange, accent }: SliderProps) {
  const percent = ((value - min) / (max - min)) * 100
  const trackColor =
    accent === 'primary' ? 'hsl(var(--primary))' : 'hsl(150 70% 50%)'

  return (
    <div>
      <div className="flex items-baseline justify-between gap-2">
        <label
          htmlFor={`roi-${label}`}
          className="text-xs font-medium uppercase tracking-wider text-muted-foreground"
        >
          {label}
        </label>
        <span
          className={cn(
            'text-3xl font-extrabold tabular-nums leading-none',
            accent === 'primary' ? 'text-primary' : 'text-emerald-400',
          )}
        >
          {value}
        </span>
      </div>

      <input
        id={`roi-${label}`}
        type="range"
        min={min}
        max={max}
        value={value}
        onChange={(e) => onChange(Number(e.target.value))}
        aria-label={label}
        className="mt-3 h-1.5 w-full cursor-pointer appearance-none rounded-full bg-zinc-700/50 outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background [&::-moz-range-thumb]:h-4 [&::-moz-range-thumb]:w-4 [&::-moz-range-thumb]:cursor-grab [&::-moz-range-thumb]:rounded-full [&::-moz-range-thumb]:border-2 [&::-moz-range-thumb]:border-background [&::-moz-range-thumb]:bg-current [&::-moz-range-thumb]:shadow-glow [&::-webkit-slider-thumb]:h-4 [&::-webkit-slider-thumb]:w-4 [&::-webkit-slider-thumb]:cursor-grab [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:border-2 [&::-webkit-slider-thumb]:border-background [&::-webkit-slider-thumb]:bg-current [&::-webkit-slider-thumb]:shadow-glow"
        style={{
          background: `linear-gradient(to right, ${trackColor} 0%, ${trackColor} ${percent}%, hsl(var(--muted)) ${percent}%, hsl(var(--muted)) 100%)`,
          color: trackColor,
        }}
      />

      <div className="mt-1 flex justify-between text-[10px] text-muted-foreground/60">
        <span>{min}</span>
        <span>{max}</span>
      </div>
    </div>
  )
}
