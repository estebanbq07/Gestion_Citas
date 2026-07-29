import { cn } from '@/lib/utils'

export function PageHeader({
  title,
  description,
  actions,
  align = 'start',
}) {
  return (
    <header
      className={cn(
        'flex w-full flex-col gap-4 sm:flex-row sm:items-start sm:justify-between',
        align === 'center' && 'items-center text-center sm:flex-col sm:items-center',
      )}
    >
      <div className="space-y-1">
        <h1 className="text-3xl font-bold tracking-tight sm:text-4xl">
          {title}
        </h1>
        {description ? (
          <p className="text-muted-foreground">{description}</p>
        ) : null}
      </div>
      {actions ? <div className="flex items-center gap-2">{actions}</div> : null}
    </header>
  )
}
