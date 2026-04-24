import { cn } from '@/lib/utils'
import type { ReactNode } from 'react'

interface PageContainerProps {
  children: ReactNode
  className?: string
  as?: 'div' | 'section' | 'main'
}

export function PageContainer({
  children,
  className,
  as: As = 'div',
}: PageContainerProps) {
  return (
    <As className={cn('container mx-auto px-4 sm:px-6 lg:px-8', className)}>
      {children}
    </As>
  )
}
