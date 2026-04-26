import { useEffect, useState } from 'react'
import { Signal, Wifi, BatteryFull } from 'lucide-react'

function formatTime(d: Date): string {
  const hh = d.getHours().toString().padStart(2, '0')
  const mm = d.getMinutes().toString().padStart(2, '0')
  return `${hh}:${mm}`
}

export function StatusBar() {
  const [now, setNow] = useState<string>(() => formatTime(new Date()))

  useEffect(() => {
    const id = window.setInterval(() => setNow(formatTime(new Date())), 30_000)
    return () => window.clearInterval(id)
  }, [])

  return (
    <div className="relative flex h-7 items-center justify-between px-5 pt-1.5 text-[11px] font-semibold tabular-nums text-white phone-light:text-zinc-900">
      <span>{now}</span>
      <div className="flex items-center gap-1 text-white/90 phone-light:text-zinc-800">
        <Signal className="h-3 w-3" />
        <Wifi className="h-3 w-3" />
        <BatteryFull className="h-3.5 w-3.5" />
      </div>
    </div>
  )
}
