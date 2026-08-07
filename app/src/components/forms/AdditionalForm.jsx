import { CircleAlert, Info } from 'lucide-react'

import { FormActions } from '@/components/forms/FormActions'
import { FormField } from '@/components/forms/FormField'
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import { Button } from '@/components/ui/button'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'

export function AdditionalForm({
  formData,
  fieldErrors,
  apiError,
  apiErrorTitle,
  infoMessage,
  isSubmitting,
  submitText,
  submittingText,
  onChange,
  onSubmit,
  onCancel,
}) {
  return (
    <Card className="mx-auto w-full max-w-3xl">
      <CardHeader>
        <CardTitle aria-level={2} role="heading">
          Información del servicio adicional
        </CardTitle>
        <CardDescription>
          Todos los campos son obligatorios.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form className="grid gap-5" noValidate onSubmit={onSubmit}>
          {apiError ? (
            <Alert variant="destructive">
              <CircleAlert aria-hidden="true" />
              <AlertTitle>{apiErrorTitle}</AlertTitle>
              <AlertDescription>{apiError}</AlertDescription>
            </Alert>
          ) : null}

          {infoMessage ? (
            <Alert>
              <Info aria-hidden="true" />
              <AlertTitle>Sin cambios pendientes</AlertTitle>
              <AlertDescription>{infoMessage}</AlertDescription>
            </Alert>
          ) : null}

          <div className="grid gap-5 sm:grid-cols-2">
            <FormField
              className="sm:col-span-2"
              htmlFor="nombre"
              label={
                <>
                  Nombre{' '}
                  <span aria-hidden="true" className="text-destructive">
                    *
                  </span>
                </>
              }
              error={fieldErrors.nombre}
            >
              <Input
                id="nombre"
                name="nombre"
                minLength={3}
                maxLength={120}
                value={formData.nombre}
                onChange={onChange}
                aria-describedby={
                  fieldErrors.nombre ? 'nombre-error' : undefined
                }
                aria-invalid={Boolean(fieldErrors.nombre)}
                disabled={isSubmitting}
                required
              />
            </FormField>

            <FormField
              htmlFor="precio"
              label={
                <>
                  Precio{' '}
                  <span aria-hidden="true" className="text-destructive">
                    *
                  </span>
                </>
              }
              description="Monto en colones costarricenses."
              error={fieldErrors.precio}
            >
              <Input
                id="precio"
                name="precio"
                type="number"
                min="0"
                max="99999999.99"
                step="0.01"
                inputMode="decimal"
                value={formData.precio}
                onChange={onChange}
                aria-describedby={
                  fieldErrors.precio
                    ? 'precio-error'
                    : 'precio-description'
                }
                aria-invalid={Boolean(fieldErrors.precio)}
                disabled={isSubmitting}
                required
              />
            </FormField>

            <FormField
              className="sm:col-span-2"
              htmlFor="descripcion"
              label={
                <>
                  Descripción{' '}
                  <span aria-hidden="true" className="text-destructive">
                    *
                  </span>
                </>
              }
              error={fieldErrors.descripcion}
            >
              <Textarea
                id="descripcion"
                name="descripcion"
                minLength={10}
                maxLength={500}
                rows={5}
                value={formData.descripcion}
                onChange={onChange}
                aria-describedby={
                  fieldErrors.descripcion ? 'descripcion-error' : undefined
                }
                aria-invalid={Boolean(fieldErrors.descripcion)}
                disabled={isSubmitting}
                required
              />
            </FormField>
          </div>

          <FormActions>
            <Button
              type="button"
              variant="outline"
              onClick={onCancel}
              disabled={isSubmitting}
            >
              Cancelar
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? submittingText : submitText}
            </Button>
          </FormActions>
        </form>
      </CardContent>
    </Card>
  )
}
