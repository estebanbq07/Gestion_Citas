import { cn } from '@/lib/utils'

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
      <label className="text-sm font-medium" htmlFor={htmlFor}>
        {label}
      </label>
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
