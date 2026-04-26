import { cn } from '@/lib/utils'

interface AvatarProps {
  initials: string
  hue?: number
  size?: 'sm' | 'md' | 'lg'
  className?: string
}

const SIZES: Record<NonNullable<AvatarProps['size']>, string> = {
  sm: 'h-7 w-7 text-[10px]',
  md: 'h-9 w-9 text-xs',
  lg: 'h-12 w-12 text-sm',
}

export function Avatar({ initials, hue = 220, size = 'sm', className }: AvatarProps) {
  return (
    <span
      aria-hidden
      className={cn(
        'inline-flex shrink-0 items-center justify-center rounded-full font-semibold text-white shadow-inner',
        SIZES[size],
        className,
      )}
      style={{
        background: `linear-gradient(135deg, hsl(${hue} 70% 55%), hsl(${(hue + 40) % 360} 65% 45%))`,
      }}
    >
      {initials}
    </span>
  )
}
