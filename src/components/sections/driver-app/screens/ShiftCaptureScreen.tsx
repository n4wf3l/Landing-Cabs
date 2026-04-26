import { useMemo, useState } from 'react'
import { AnimatePresence, motion, useReducedMotion } from 'framer-motion'
import {
  ArrowLeft,
  Camera,
  Check,
  FileText,
  Loader2,
  Zap,
} from 'lucide-react'
import { useTranslation } from 'react-i18next'
import { cn } from '@/lib/utils'
import { usePhoneSim } from '../usePhoneSim'

type SideKey = 'front' | 'back' | 'left' | 'right'
type StepKey = SideKey | 'ticket'

const SIDE_STEPS: SideKey[] = ['front', 'back', 'left', 'right']

interface Props {
  mode: 'start' | 'end'
}

function isNightTime(): boolean {
  const h = new Date().getHours()
  return h >= 18 || h < 6
}

function generateMockKm(): number {
  // Plausible mileage for a fleet Clio in service: 180k-200k km.
  return 184_562 + Math.floor(Math.random() * 2_000)
}

export function ShiftCaptureScreen({ mode }: Props) {
  const { t } = useTranslation()
  const { state, dispatch } = usePhoneSim()
  const reduce = useReducedMotion()
  const isNight = useMemo(isNightTime, [])

  const STEPS = useMemo<StepKey[]>(
    () => (mode === 'start' ? [...SIDE_STEPS, 'ticket'] : [...SIDE_STEPS]),
    [mode],
  )

  const [stepIndex, setStepIndex] = useState(0)
  const [captured, setCaptured] = useState<Record<string, boolean>>({})
  const [phase, setPhase] = useState<
    'capture' | 'flash' | 'ocr-scanning' | 'review'
  >('capture')
  const [km, setKm] = useState<string>('')

  const currentStep = STEPS[stepIndex]
  const isTicket = currentStep === 'ticket'
  const allDone = STEPS.every((s) => captured[s])

  const goBack = () => {
    if (mode === 'start') {
      dispatch({ type: 'NAV', screen: 'home' })
    } else {
      dispatch({ type: 'NAV', screen: 'shift-active' })
    }
  }

  const handleCapture = () => {
    setPhase('flash')
    window.setTimeout(() => {
      setCaptured((c) => ({ ...c, [currentStep]: true }))
      if (isTicket) {
        setPhase('ocr-scanning')
        window.setTimeout(() => {
          setKm(String(generateMockKm()))
          setPhase('review')
        }, 1300)
      } else if (stepIndex < STEPS.length - 1) {
        setStepIndex(stepIndex + 1)
        setPhase('capture')
      } else {
        // End-mode last side — go straight to review
        setPhase('review')
      }
    }, 220)
  }

  const handleConfirm = () => {
    if (mode === 'start') {
      const parsed = parseInt(km.replace(/\D/g, ''), 10)
      const finalKm = Number.isFinite(parsed) && parsed > 0 ? parsed : 0
      dispatch({ type: 'START_SHIFT', startKm: finalKm })
    } else {
      dispatch({ type: 'END_SHIFT' })
    }
  }

  return (
    <div className="flex h-full flex-col">
      <header className="flex items-center justify-between px-3 pb-2 pt-2">
        <button
          type="button"
          onClick={goBack}
          aria-label={t('common.back')}
          className="flex h-8 w-8 items-center justify-center rounded-full bg-white/[0.04] text-zinc-300 transition-colors hover:bg-white/[0.08] phone-light:bg-zinc-900/[0.05] phone-light:text-zinc-700"
        >
          <ArrowLeft className="h-4 w-4" />
        </button>
        <div className="flex-1 px-3 text-center">
          <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-zinc-500">
            {t(
              mode === 'start'
                ? 'driverApp.sim.shiftCapture.title.start'
                : 'driverApp.sim.shiftCapture.title.end',
            )}
          </p>
          <p className="mt-0.5 text-[11px] tabular-nums text-zinc-400 phone-light:text-zinc-600">
            {phase === 'review' && allDone
              ? t('driverApp.sim.shiftCapture.allCaptured')
              : t('driverApp.sim.shiftCapture.progress', {
                  current: Math.min(stepIndex + 1, STEPS.length),
                  total: STEPS.length,
                })}
          </p>
        </div>
        {isNight && (
          <span className="inline-flex items-center gap-1 rounded-full bg-amber-400/10 px-2 py-1 text-[9px] font-semibold text-amber-300 ring-1 ring-amber-400/30 phone-light:bg-amber-500/15 phone-light:text-amber-700">
            <Zap className="h-3 w-3" />
            {t('driverApp.sim.shiftCapture.flashOn')}
          </span>
        )}
        {!isNight && <span className="w-8" />}
      </header>

      <ProgressDots steps={STEPS} captured={captured} stepIndex={stepIndex} />

      <div className="relative flex-1 px-4 pb-4 pt-2">
        <AnimatePresence mode="wait">
          {phase === 'review' ? (
            <ReviewPanel
              key="review"
              mode={mode}
              isStart={mode === 'start'}
              km={km}
              setKm={setKm}
              captured={captured}
              onConfirm={handleConfirm}
            />
          ) : phase === 'ocr-scanning' ? (
            <OcrScanning key="ocr" />
          ) : (
            <CaptureViewfinder
              key={currentStep}
              step={currentStep}
              onCapture={handleCapture}
              isFlash={phase === 'flash'}
              isNight={isNight}
              reduce={!!reduce}
            />
          )}
        </AnimatePresence>
      </div>

      {/* Re-show shift state hint at top while capturing end */}
      {mode === 'end' && state.shiftActive && phase !== 'review' && (
        <p className="px-4 pb-2 text-center text-[10px] text-zinc-500">
          {t('driverApp.sim.shiftCapture.endNote')}
        </p>
      )}
    </div>
  )
}

function ProgressDots({
  steps,
  captured,
  stepIndex,
}: {
  steps: StepKey[]
  captured: Record<string, boolean>
  stepIndex: number
}) {
  return (
    <div className="flex items-center justify-center gap-1.5 pt-1">
      {steps.map((s, i) => {
        const done = captured[s]
        const active = i === stepIndex && !done
        return (
          <span
            key={s}
            className={cn(
              'h-1 rounded-full transition-all',
              done
                ? 'w-6 bg-emerald-500'
                : active
                  ? 'w-6 bg-primary'
                  : 'w-1.5 bg-white/20 phone-light:bg-zinc-900/[0.15]',
            )}
          />
        )
      })}
    </div>
  )
}

function CaptureViewfinder({
  step,
  onCapture,
  isFlash,
  isNight,
  reduce,
}: {
  step: StepKey
  onCapture: () => void
  isFlash: boolean
  isNight: boolean
  reduce: boolean
}) {
  const { t } = useTranslation()
  const isTicket = step === 'ticket'

  return (
    <motion.div
      initial={reduce ? false : { opacity: 0, y: 6 }}
      animate={{ opacity: 1, y: 0 }}
      exit={reduce ? undefined : { opacity: 0, y: -6 }}
      transition={{ duration: 0.2 }}
      className="flex h-full flex-col"
    >
      <div className="relative flex-1 overflow-hidden rounded-2xl border border-white/[0.08] bg-zinc-900/80 phone-light:border-zinc-900/[0.1] phone-light:bg-zinc-900">
        <CornerBrackets />
        <div
          aria-hidden
          className="absolute inset-0 opacity-60"
          style={{
            backgroundImage: isNight
              ? 'radial-gradient(circle at 50% 60%, rgba(255,255,255,0.04), transparent 70%), repeating-linear-gradient(90deg, rgba(255,255,255,0.012) 0 1px, transparent 1px 4px)'
              : 'radial-gradient(circle at 50% 50%, rgba(255,255,255,0.06), transparent 70%)',
          }}
        />
        <div className="absolute inset-x-0 top-3 flex items-center justify-center">
          <span className="inline-flex items-center gap-1.5 rounded-full bg-zinc-950/70 px-2.5 py-1 text-[10px] font-semibold text-zinc-100 ring-1 ring-white/10 backdrop-blur">
            {isTicket ? (
              <FileText className="h-3 w-3 text-primary" />
            ) : (
              <Camera className="h-3 w-3 text-primary" />
            )}
            {t(`driverApp.sim.shiftCapture.steps.${step}`)}
          </span>
        </div>
        {!reduce && (
          <motion.span
            aria-hidden
            className="absolute inset-x-8 top-1/2 h-px -translate-y-1/2 bg-primary/60"
            initial={{ scaleX: 0.4, opacity: 0.7 }}
            animate={{ scaleX: 1, opacity: 0.3 }}
            transition={{
              duration: 1.6,
              repeat: Infinity,
              repeatType: 'reverse',
              ease: 'easeInOut',
            }}
          />
        )}
        <p className="absolute inset-x-0 bottom-3 px-4 text-center text-[10px] text-zinc-400">
          {t(`driverApp.sim.shiftCapture.hint.${step}`)}
        </p>

        <AnimatePresence>
          {isFlash && (
            <motion.span
              aria-hidden
              className="absolute inset-0 bg-white"
              initial={{ opacity: 0 }}
              animate={{ opacity: 0.85 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.18 }}
            />
          )}
        </AnimatePresence>
      </div>

      <div className="mt-3 flex items-center justify-center">
        <button
          type="button"
          onClick={onCapture}
          aria-label={t('driverApp.sim.shiftCapture.captureCta')}
          className="relative flex h-14 w-14 items-center justify-center rounded-full border-[3px] border-white/30 bg-white/[0.06] transition-transform active:scale-95 phone-light:border-zinc-900/30 phone-light:bg-zinc-900/[0.05]"
        >
          <span className="h-9 w-9 rounded-full bg-primary shadow-glow" />
        </button>
      </div>
    </motion.div>
  )
}

function CornerBrackets() {
  return (
    <>
      <span className="absolute left-3 top-3 h-4 w-4 rounded-tl-md border-l-2 border-t-2 border-primary/70" />
      <span className="absolute right-3 top-3 h-4 w-4 rounded-tr-md border-r-2 border-t-2 border-primary/70" />
      <span className="absolute bottom-3 left-3 h-4 w-4 rounded-bl-md border-b-2 border-l-2 border-primary/70" />
      <span className="absolute bottom-3 right-3 h-4 w-4 rounded-br-md border-b-2 border-r-2 border-primary/70" />
    </>
  )
}

function OcrScanning() {
  const { t } = useTranslation()
  return (
    <motion.div
      key="ocr"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="flex h-full flex-col items-center justify-center gap-3 rounded-2xl border border-white/[0.08] bg-zinc-900/60 px-4 text-center phone-light:border-zinc-900/[0.1] phone-light:bg-zinc-900/[0.04]"
    >
      <span className="flex h-12 w-12 items-center justify-center rounded-full bg-primary/15 text-primary">
        <Loader2 className="h-6 w-6 animate-spin" />
      </span>
      <div>
        <p className="text-sm font-semibold text-white phone-light:text-zinc-900">
          {t('driverApp.sim.shiftCapture.ocr.scanning')}
        </p>
        <p className="mt-1 text-[11px] text-zinc-500">
          {t('driverApp.sim.shiftCapture.ocr.scanningHint')}
        </p>
      </div>
    </motion.div>
  )
}

function ReviewPanel({
  isStart,
  km,
  setKm,
  captured,
  onConfirm,
}: {
  mode: 'start' | 'end'
  isStart: boolean
  km: string
  setKm: (v: string) => void
  captured: Record<string, boolean>
  onConfirm: () => void
}) {
  const { t } = useTranslation()
  return (
    <motion.div
      key="review"
      initial={{ opacity: 0, y: 6 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.22 }}
      className="flex h-full flex-col gap-3"
    >
      <div className="grid grid-cols-2 gap-2">
        {SIDE_STEPS.map((s) => {
          const done = captured[s]
          const Icon = s === 'front' || s === 'back' ? Camera : Camera
          return (
            <div
              key={s}
              className={cn(
                'relative flex aspect-[4/3] items-end overflow-hidden rounded-xl border bg-zinc-900/70 p-2',
                done
                  ? 'border-emerald-500/30 phone-light:border-emerald-500/40'
                  : 'border-white/10 phone-light:border-zinc-900/[0.1]',
                'phone-light:bg-zinc-900/[0.05]',
              )}
            >
              <CornerBrackets />
              <span className="absolute right-2 top-2 inline-flex h-5 w-5 items-center justify-center rounded-full bg-emerald-500 text-zinc-950">
                <Check className="h-3 w-3" />
              </span>
              <p className="relative z-10 text-[10px] font-semibold uppercase tracking-wider text-white">
                <Icon className="mr-1 inline h-3 w-3 text-primary" />
                {t(`driverApp.sim.shiftCapture.steps.${s}`)}
              </p>
            </div>
          )
        })}
      </div>

      {isStart && (
        <div className="rounded-xl border border-primary/30 bg-primary/[0.06] p-3 phone-light:border-primary/40 phone-light:bg-primary/[0.08]">
          <div className="flex items-center justify-between gap-2">
            <span className="inline-flex items-center gap-1.5 text-[10px] font-semibold uppercase tracking-wider text-primary">
              <FileText className="h-3 w-3" />
              {t('driverApp.sim.shiftCapture.ocr.label')}
            </span>
            <span className="rounded-full bg-emerald-500/15 px-2 py-0.5 text-[9px] font-semibold uppercase text-emerald-400 ring-1 ring-emerald-500/30 phone-light:text-emerald-700">
              {t('driverApp.sim.shiftCapture.ocr.detected')}
            </span>
          </div>
          <div className="mt-2 flex items-center gap-2">
            <input
              type="text"
              inputMode="numeric"
              value={km}
              onChange={(e) => setKm(e.target.value.replace(/[^\d\s]/g, ''))}
              className="flex-1 rounded-lg border border-white/[0.1] bg-zinc-950/40 px-2.5 py-2 text-base font-bold tabular-nums text-white outline-none ring-primary/40 transition-shadow focus:ring-2 phone-light:border-zinc-900/[0.12] phone-light:bg-white phone-light:text-zinc-900"
              aria-label={t('driverApp.sim.shiftCapture.ocr.label')}
            />
            <span className="text-sm font-semibold text-zinc-400 phone-light:text-zinc-600">
              {t('driverApp.sim.shiftCapture.ocr.unit')}
            </span>
          </div>
          <p className="mt-2 text-[10px] text-zinc-500">
            {t('driverApp.sim.shiftCapture.ocr.editHint')}
          </p>
        </div>
      )}

      <button
        type="button"
        onClick={onConfirm}
        className="mt-auto flex w-full items-center justify-center gap-2 rounded-xl bg-primary py-3 text-sm font-semibold text-primary-foreground shadow-glow transition-transform hover:-translate-y-0.5 active:scale-[0.98]"
      >
        {t(
          isStart
            ? 'driverApp.sim.shiftCapture.confirm.start'
            : 'driverApp.sim.shiftCapture.confirm.end',
        )}
      </button>
    </motion.div>
  )
}
