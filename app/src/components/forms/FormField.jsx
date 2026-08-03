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
  return (
    <div className={cn('grid gap-2', className)}>
      <Label htmlFor={htmlFor}>
        {label}
      </Label>
      {children}
      {description && !error ? (
        <p className="text-xs text-muted-foreground">{description}</p>
      ) : null}
      {error ? (
        <p className="text-xs text-destructive" role="alert">
          {error}
        </p>
      ) : null}
    </div>
  )
}
