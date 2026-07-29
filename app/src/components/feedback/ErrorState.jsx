import { CircleAlert } from 'lucide-react'

export function ErrorState({
  title = 'No fue posible completar la solicitud',
  message = 'Intenta nuevamente más tarde.',
  action,
}) {
  return (
    <div
      className="flex min-h-40 flex-col items-center justify-center gap-3 rounded-lg border border-destructive/30 bg-destructive/5 p-6 text-center"
      role="alert"
    >
      <CircleAlert aria-hidden="true" className="size-6 text-destructive" />
      <div className="space-y-1">
        <h2 className="font-semibold">{title}</h2>
        <p className="text-sm text-muted-foreground">{message}</p>
      </div>
      {action}
    </div>
  )
}
