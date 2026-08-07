import { useId } from 'react'
import { CircleAlert } from 'lucide-react'

import { ConfirmDialog } from '@/components/modals/ConfirmDialog'
import { FormField } from '@/components/forms/FormField'
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import { Textarea } from '@/components/ui/textarea'

const MIN_REASON_LENGTH = 5
const MAX_REASON_LENGTH = 255

export function CancelAppointmentDialog({
  open,
  reason,
  error,
  apiError,
  isLoading,
  onReasonChange,
  onConfirm,
  onCancel,
}) {
  const reasonId = useId()
  const safeReason = typeof reason === 'string' ? reason : ''
  const normalizedReason = safeReason.trim()
  const isReasonValid =
    normalizedReason.length >= MIN_REASON_LENGTH &&
    normalizedReason.length <= MAX_REASON_LENGTH
  const describedBy = error ? `${reasonId}-error` : `${reasonId}-description`

  return (
    <ConfirmDialog
      open={open}
      title="Cancelar cita"
      description="¿Está seguro de que desea cancelar esta cita?"
      confirmText="Cancelar cita"
      cancelText="Volver"
      loadingText="Cancelando..."
      confirmVariant="destructive"
      confirmDisabled={!isReasonValid}
      isLoading={isLoading}
      onConfirm={onConfirm}
      onCancel={onCancel}
    >
      {apiError ? (
        <Alert variant="destructive">
          <CircleAlert aria-hidden="true" />
          <AlertTitle>No fue posible cancelar la cita</AlertTitle>
          <AlertDescription>{apiError}</AlertDescription>
        </Alert>
      ) : null}

      <FormField
        label="Motivo de cancelación"
        htmlFor={reasonId}
        description="Debe contener entre 5 y 255 caracteres."
        error={error}
      >
        <Textarea
          id={reasonId}
          name="motivoCancelacion"
          value={safeReason}
          onChange={(event) => onReasonChange(event.target.value)}
          minLength={MIN_REASON_LENGTH}
          maxLength={MAX_REASON_LENGTH}
          placeholder="Explique brevemente el motivo de la cancelación"
          aria-describedby={describedBy}
          aria-invalid={Boolean(error)}
          disabled={isLoading}
          required
        />
      </FormField>
    </ConfirmDialog>
  )
}
