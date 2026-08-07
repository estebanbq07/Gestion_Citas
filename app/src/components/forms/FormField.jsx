import { cn } from '@/lib/utils'
import { Label } from '@/components/ui/label'

export function FormField({
  label,
  htmlFor,
  description,
  error,
  children,
  className,
}) {
  const descriptionId =
    description && !error && htmlFor ? `${htmlFor}-description` : undefined
  const errorId = error && htmlFor ? `${htmlFor}-error` : undefined

  return (
    <div className={cn('grid gap-2', className)}>
      <Label htmlFor={htmlFor}>
        {label}
      </Label>
      {children}
      {description && !error ? (
        <p id={descriptionId} className="text-xs text-muted-foreground">
          {description}
        </p>
      ) : null}
      {error ? (
        <p id={errorId} className="text-xs text-destructive" role="alert">
          {error}
        </p>
      ) : null}
    </div>
  )
}
