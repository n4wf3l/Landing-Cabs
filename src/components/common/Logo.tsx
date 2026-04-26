import { motion } from 'framer-motion'
import { useTheme } from '@/hooks/useTheme'
import { cn } from '@/lib/utils'
import { BRAND } from '@/lib/constants'

interface LogoProps {
  className?: string
  showWordmark?: boolean
  size?: 'sm' | 'md' | 'lg'
  layoutId?: string
}

const sizes = {
  sm: 'h-7',
  md: 'h-8',
  lg: 'h-10',
} as const

export function Logo({
  className,
  showWordmark = true,
  size = 'md',
  layoutId,
}: LogoProps) {
  const { theme } = useTheme()
  const base = import.meta.env.BASE_URL
  const src = theme === 'dark' ? `${base}tlogo_white.png` : `${base}tlogo_black.png`
  return (
    <div className={cn('flex items-center gap-2', className)}>
      <motion.img
        layoutId={layoutId}
        src={src}
        alt={BRAND.name}
        width={40}
        height={40}
        className={cn(sizes[size], 'w-auto')}
        decoding="async"
      />
      {showWordmark && (
        <span className="text-lg font-bold tracking-tight">{BRAND.name}</span>
      )}
    </div>
  )
}
