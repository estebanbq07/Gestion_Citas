import { useId, useLayoutEffect, useRef } from 'react'
import { LoaderCircle } from 'lucide-react'

import { Button } from '@/components/ui/button'

export function ConfirmDialog({
  open,
  title,
  description,
  confirmText,
  cancelText,
  onConfirm,
  onCancel,
  isLoading,
  confirmVariant = 'default',
}) {
  const titleId = useId()
  const descriptionId = useId()
  const dialogRef = useRef(null)

  useLayoutEffect(() => {
    const dialog = dialogRef.current

    if (!dialog) {
      return undefined
    }

    if (open && !dialog.open) {
      dialog.showModal()
    } else if (!open && dialog.open) {
      dialog.close()
    }

    return () => {
      if (dialog.open) {
        dialog.close()
      }
    }
  }, [open])

  function handleCancel(event) {
    event.preventDefault()

    if (!isLoading) {
      onCancel()
    }
  }

  function handleBackdropClick(event) {
    if (event.target === event.currentTarget && !isLoading) {
      onCancel()
    }
  }

  return (
    <dialog
      ref={dialogRef}
      className="m-auto w-[calc(100%_-_2rem)] max-w-md border-0 bg-transparent p-0 text-foreground backdrop:bg-black/55"
      aria-labelledby={titleId}
      aria-describedby={descriptionId}
      onCancel={handleCancel}
      onClick={handleBackdropClick}
    >
      <div
        className="grid w-full gap-5 rounded-xl border bg-background p-6 shadow-xl"
      >
        <div className="grid gap-2">
          <h2 id={titleId} className="text-lg font-semibold">
            {title}
          </h2>
          <p id={descriptionId} className="text-sm text-muted-foreground">
            {description}
          </p>
        </div>

        <div className="flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
          <Button
            type="button"
            variant="outline"
            onClick={onCancel}
            disabled={isLoading}
            autoFocus
          >
            {cancelText}
          </Button>
          <Button
            type="button"
            variant={confirmVariant}
            onClick={onConfirm}
            disabled={isLoading}
            aria-busy={isLoading}
          >
            {isLoading ? (
              <LoaderCircle aria-hidden="true" className="animate-spin" />
            ) : null}
            {confirmText}
          </Button>
        </div>
      </div>
    </dialog>
  )
}
