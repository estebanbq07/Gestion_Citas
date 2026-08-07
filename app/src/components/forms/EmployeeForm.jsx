import { CircleAlert, Info } from 'lucide-react'

import { FormActions } from '@/components/forms/FormActions'
import { FormField } from '@/components/forms/FormField'
import { ServicesSelector } from '@/components/forms/ServicesSelector'
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
import { getUserFullName } from '@/lib/employeeUtils'

const SELECT_CLASS_NAME =
  'flex h-9 w-full rounded-md border border-border bg-background px-3 py-1 text-sm shadow-xs outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50'

function getText(value) {
  return typeof value === 'string' ? value.trim() : ''
}

function RequiredMark() {
  return (
    <span aria-hidden="true" className="text-destructive">
      {' '}
      *
    </span>
  )
}

export function EmployeeForm({
  formData,
  fieldErrors,
  apiError,
  apiErrorTitle = 'No fue posible guardar el empleado',
  infoMessage,
  isSubmitting,
  disabled = false,
  submitText = 'Guardar empleado',
  submittingText = 'Guardando empleado...',
  users,
  specialties,
  services,
  onChange,
  onServicesChange,
  onSubmit,
  onCancel,
}) {
  const safeFormData = formData ?? {}
  const safeFieldErrors = fieldErrors ?? {}
  const availableUsers = Array.isArray(users) ? users : []
  const availableSpecialties = Array.isArray(specialties) ? specialties : []
  const controlsDisabled = disabled || isSubmitting

  return (
    <Card className="mx-auto w-full max-w-3xl">
      <CardHeader>
        <CardTitle aria-level={2} role="heading">
          Información del empleado
        </CardTitle>
        <CardDescription>
          Los campos marcados con * son obligatorios.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form
          aria-busy={isSubmitting}
          className="grid gap-5"
          noValidate
          onSubmit={onSubmit}
        >
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
              htmlFor="usuarioId"
              label={
                <>
                  Usuario asociado
                  <RequiredMark />
                </>
              }
              error={safeFieldErrors.usuarioId}
            >
              <select
                id="usuarioId"
                name="usuarioId"
                className={SELECT_CLASS_NAME}
                value={safeFormData.usuarioId ?? ''}
                onChange={onChange}
                aria-describedby={
                  safeFieldErrors.usuarioId ? 'usuarioId-error' : undefined
                }
                aria-invalid={Boolean(safeFieldErrors.usuarioId)}
                disabled={controlsDisabled}
                required
              >
                <option value="">Selecciona un usuario</option>
                {availableUsers.map((user) => {
                  const fullName = getUserFullName(user) || 'Usuario sin nombre'
                  const email = getText(user?.correo)
                  const userLabel = email
                    ? `${fullName} — ${email}`
                    : fullName

                  return (
                    <option key={user.id} value={user.id}>
                      {user.activo === false
                        ? `${userLabel} (inactivo)`
                        : userLabel}
                    </option>
                  )
                })}
              </select>
            </FormField>

            <FormField
              htmlFor="especialidadId"
              label={
                <>
                  Especialidad
                  <RequiredMark />
                </>
              }
              error={safeFieldErrors.especialidadId}
            >
              <select
                id="especialidadId"
                name="especialidadId"
                className={SELECT_CLASS_NAME}
                value={safeFormData.especialidadId ?? ''}
                onChange={onChange}
                aria-describedby={
                  safeFieldErrors.especialidadId
                    ? 'especialidadId-error'
                    : undefined
                }
                aria-invalid={Boolean(safeFieldErrors.especialidadId)}
                disabled={controlsDisabled}
                required
              >
                <option value="">Selecciona una especialidad</option>
                {availableSpecialties.map((specialty) => {
                  const specialtyName =
                    getText(specialty?.nombre) || 'Especialidad sin nombre'

                  return (
                    <option key={specialty.id} value={specialty.id}>
                      {specialty.activo === false
                        ? `${specialtyName} (inactiva)`
                        : specialtyName}
                    </option>
                  )
                })}
              </select>
            </FormField>

            <FormField
              htmlFor="codigoEmpleado"
              label={
                <>
                  Código de empleado
                  <RequiredMark />
                </>
              }
              description="Entre 3 y 30 caracteres: letras, números, guiones o guiones bajos."
              error={safeFieldErrors.codigoEmpleado}
            >
              <Input
                id="codigoEmpleado"
                name="codigoEmpleado"
                minLength={3}
                maxLength={30}
                pattern="[A-Za-z0-9_-]+"
                autoComplete="off"
                value={safeFormData.codigoEmpleado ?? ''}
                onChange={onChange}
                aria-describedby={
                  safeFieldErrors.codigoEmpleado
                    ? 'codigoEmpleado-error'
                    : 'codigoEmpleado-description'
                }
                aria-invalid={Boolean(safeFieldErrors.codigoEmpleado)}
                disabled={controlsDisabled}
                required
              />
            </FormField>

            <FormField
              className="sm:col-span-2"
              htmlFor="descripcion"
              label="Descripción laboral (opcional)"
              description="Describe brevemente las funciones del empleado."
              error={safeFieldErrors.descripcion}
            >
              <Textarea
                id="descripcion"
                name="descripcion"
                minLength={3}
                maxLength={500}
                rows={5}
                value={safeFormData.descripcion ?? ''}
                onChange={onChange}
                aria-describedby={
                  safeFieldErrors.descripcion
                    ? 'descripcion-error'
                    : 'descripcion-description'
                }
                aria-invalid={Boolean(safeFieldErrors.descripcion)}
                disabled={controlsDisabled}
              />
            </FormField>
          </div>

          <ServicesSelector
            services={services}
            selectedIds={safeFormData.servicioIds}
            onChange={onServicesChange}
            error={safeFieldErrors.servicioIds}
            disabled={controlsDisabled}
          />

          <FormActions>
            <Button
              type="button"
              variant="outline"
              onClick={onCancel}
              disabled={controlsDisabled}
            >
              Cancelar
            </Button>
            <Button type="submit" disabled={controlsDisabled}>
              {isSubmitting ? submittingText : submitText}
            </Button>
          </FormActions>
        </form>
      </CardContent>
    </Card>
  )
}
