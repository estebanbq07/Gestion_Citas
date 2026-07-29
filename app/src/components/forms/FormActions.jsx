import { cn } from '@/lib/utils'

export function FormActions({ children, className }) {
  return (
    <div
      className={cn(
        'flex flex-col-reverse gap-2 pt-4 sm:flex-row sm:justify-end',
        className,
      )}
    >
      {children}
    </div>
  )
}
