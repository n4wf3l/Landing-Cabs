import { Toaster as SonnerToaster } from 'sonner'
import { useTheme } from '@/hooks/useTheme'

export function Toaster() {
  const { theme } = useTheme()
  return (
    <SonnerToaster
      theme={theme}
      richColors
      position="top-right"
      toastOptions={{
        classNames: {
          toast:
            'group bg-card text-card-foreground border-border shadow-lg',
        },
      }}
    />
  )
}
