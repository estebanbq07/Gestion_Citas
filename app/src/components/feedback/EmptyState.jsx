import { Inbox } from 'lucide-react'

export function EmptyState({
  title = 'No hay información disponible',
  description,
  action,
}) {
  return (
    <div className="flex min-h-40 flex-col items-center justify-center gap-3 rounded-lg border border-dashed border-border p-6 text-center">
      <Inbox aria-hidden="true" className="size-7 text-muted-foreground" />
      <div className="space-y-1">
        <h2 className="font-semibold">{title}</h2>
        {description ? (
          <p className="text-sm text-muted-foreground">{description}</p>
        ) : null}
      </div>
      {action}
    </div>
  )
}
