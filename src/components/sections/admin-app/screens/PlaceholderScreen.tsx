import { Sparkles } from 'lucide-react'
import { useTranslation } from 'react-i18next'

interface PlaceholderScreenProps {
  title: string
  description?: string
}

export function PlaceholderScreen({ title, description }: PlaceholderScreenProps) {
  const { t } = useTranslation()
  return (
    <div className="flex h-full items-center justify-center p-8">
      <div className="text-center">
        <span className="inline-flex h-10 w-10 items-center justify-center rounded-full bg-primary/10 text-primary ring-1 ring-primary/20">
          <Sparkles className="h-4 w-4" />
        </span>
        <h3 className="mt-4 text-sm font-semibold tracking-tight">{title}</h3>
        <p className="mx-auto mt-1.5 max-w-xs text-[11px] leading-relaxed text-muted-foreground">
          {description ?? t('admin.placeholder.default')}
        </p>
        <span className="mt-4 inline-flex rounded-full border border-primary/30 bg-primary/10 px-2.5 py-0.5 text-[9px] font-semibold uppercase tracking-widest text-primary">
          {t('admin.placeholder.comingSoon')}
        </span>
      </div>
    </div>
  )
}
