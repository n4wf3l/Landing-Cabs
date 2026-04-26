interface ProgressRingProps {
  value: number
  max: number
  size?: number
  stroke?: number
  color?: string
  trackColor?: string
}

export function ProgressRing({
  value,
  max,
  size = 36,
  stroke = 4,
  color = 'hsl(var(--primary))',
  trackColor = 'hsl(var(--border))',
}: ProgressRingProps) {
  const radius = (size - stroke) / 2
  const circumference = 2 * Math.PI * radius
  const ratio = Math.max(0, Math.min(1, value / max))
  const dashOffset = circumference * (1 - ratio)

  return (
    <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} aria-hidden>
      <circle
        cx={size / 2}
        cy={size / 2}
        r={radius}
        fill="none"
        stroke={trackColor}
        strokeWidth={stroke}
        opacity={0.3}
      />
      <circle
        cx={size / 2}
        cy={size / 2}
        r={radius}
        fill="none"
        stroke={color}
        strokeWidth={stroke}
        strokeLinecap="round"
        strokeDasharray={circumference}
        strokeDashoffset={dashOffset}
        transform={`rotate(-90 ${size / 2} ${size / 2})`}
      />
    </svg>
  )
}
