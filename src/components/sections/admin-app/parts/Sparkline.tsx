interface SparklineProps {
  values: number[]
  width?: number
  height?: number
  stroke?: string
  fill?: string
}

export function Sparkline({
  values,
  width = 320,
  height = 60,
  stroke = 'hsl(var(--primary))',
  fill = 'hsl(var(--primary) / 0.15)',
}: SparklineProps) {
  if (values.length < 2) return null
  const max = Math.max(...values)
  const min = Math.min(...values)
  const span = max - min || 1
  const stepX = width / (values.length - 1)

  const points = values.map((v, i) => {
    const x = i * stepX
    const y = height - ((v - min) / span) * height * 0.9 - height * 0.05
    return [x, y] as const
  })

  const path = points
    .map(([x, y], i) => (i === 0 ? `M${x.toFixed(1)} ${y.toFixed(1)}` : `L${x.toFixed(1)} ${y.toFixed(1)}`))
    .join(' ')

  const fillPath = `${path} L${width} ${height} L0 ${height} Z`

  return (
    <svg
      viewBox={`0 0 ${width} ${height}`}
      preserveAspectRatio="none"
      className="h-full w-full"
      aria-hidden
    >
      <path d={fillPath} fill={fill} />
      <path
        d={path}
        fill="none"
        stroke={stroke}
        strokeWidth={1.5}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  )
}
