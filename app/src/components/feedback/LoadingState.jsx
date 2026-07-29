import { LoaderCircle } from 'lucide-react'

export function LoadingState({ message = 'Cargando información…' }) {
  return (
    <div
      aria-live="polite"
      className="flex min-h-40 flex-col items-center justify-center gap-3 text-muted-foreground"
      role="status"
    >
      <LoaderCircle aria-hidden="true" className="size-6 animate-spin" />
      <p className="text-sm">{message}</p>
    </div>
  )
}
