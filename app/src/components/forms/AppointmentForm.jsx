import {
  CalendarClock,
  CheckCircle2,
  CircleAlert,
  Clock3,
  Info,
  LoaderCircle,
  WalletCards,
} from 'lucide-react'

import { AdditionalsSelector } from '@/components/forms/AdditionalsSelector'
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
import { getEmployeeFullName, getUserFullName } from '@/lib/employeeUtils'
import { formatServiceDuration, formatServicePrice } from '@/lib/serviceUtils'

const SELECT_CLASS_NAME =
  'flex h-9 w-full rounded-md border border-border bg-background px-3 py-1 text-sm shadow-xs outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50'

function RequiredLabel({ children }) {
  return (
    <>
      {children}{' '}
      <span aria-hidden="true" className="text-destructive">
        *
      </span>
    </>
  )
}

function SummaryItem({ icon: Icon, label, value }) {
  return (
    <div className="flex items-start gap-3 rounded-lg border border-border p-3">
      <Icon aria-hidden="true" className="mt-0.5 size-4 text-primary" />
      <div className="min-w-0 space-y-1">
        <dt className="text-xs font-medium text-muted-foreground">{label}</dt>
        <dd className="break-words text-sm font-semibold">{value}</dd>
      </div>
    </div>
  )
}

function AvailabilityMessage({ status, message }) {
  if (status === 'idle' || !message) {
    return null
  }

  const isUnavailable = status === 'unavailable' || status === 'error'
  const title =
    status === 'checking'
      ? 'Consultando disponibilidad'
      : status === 'available'
        ? 'Horario disponible'
        : 'Horario no disponible'
  const Icon =
    status === 'checking'
      ? LoaderCircle
      : status === 'available'
        ? CheckCircle2
        : CircleAlert

  return (
    <Alert variant={isUnavailable ? 'destructive' : 'default'}>
      <Icon
        aria-hidden="true"
        className={status === 'checking' ? 'animate-spin' : undefined}
      />
      <AlertTitle>{title}</AlertTitle>
      <AlertDescription>{message}</AlertDescription>
    </Alert>
  )
}

export function AppointmentForm({
  mode = 'create',
  formData,
  fieldErrors,
  apiError,
  apiErrorTitle,
  infoMessage = '',
  clients,
  services,
  employees,
  additionals,
  showClientSelector,
  currentClientName,
  isLoadingClients,
  isLoadingServices,
  isLoadingEmployees,
  isLoadingAdditionals,
  isPreparing,
  isSubmitting,
  availabilityStatus,
  availabilityMessage,
  scheduleMessage,
  minimumDate,
  estimate,
  onFieldChange,
  onAdditionalsChange,
  onSubmit,
  onCancel,
  submitText,
  submittingText,
}) {
  const controlsDisabled = isSubmitting
  const isEditMode = mode === 'edit'
  const resolvedApiErrorTitle =
    apiErrorTitle ||
    (isEditMode
      ? 'No fue posible actualizar la cita'
      : 'No fue posible crear la cita')
  const resolvedSubmitText =
    submitText || (isEditMode ? 'Guardar cambios' : 'Crear cita')
  const resolvedSubmittingText =
    submittingText ||
    (isEditMode ? 'Guardando cambios...' : 'Creando cita...')
  const selectedService = services.find(
    (service) => Number(service?.id) === Number(formData.servicioId),
  )
  const durationText = formatServiceDuration(estimate.durationMinutes)
  const totalText = formatServicePrice(estimate.total)
  const additionalCostText = formatServicePrice(estimate.additionalCost)

  return (
    <form
      className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_20rem]"
      noValidate
      onSubmit={onSubmit}
      aria-busy={isSubmitting}
    >
      <Card>
        <CardHeader>
          <CardTitle aria-level={2} role="heading">
            Información de la cita
          </CardTitle>
          <CardDescription>
            Los campos marcados con * son obligatorios.
          </CardDescription>
        </CardHeader>
        <CardContent className="grid gap-6">
          {apiError ? (
            <Alert variant="destructive">
              <CircleAlert aria-hidden="true" />
              <AlertTitle>{resolvedApiErrorTitle}</AlertTitle>
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

          <section className="grid gap-4" aria-labelledby="appointment-client-title">
            <h2 id="appointment-client-title" className="text-base font-semibold">
              Cliente
            </h2>
            {showClientSelector ? (
              <FormField
                htmlFor="clienteId"
                label={<RequiredLabel>Cliente</RequiredLabel>}
                error={fieldErrors.clienteId}
              >
                <select
                  id="clienteId"
                  name="clienteId"
                  className={SELECT_CLASS_NAME}
                  value={formData.clienteId}
                  onChange={(event) =>
                    onFieldChange('clienteId', event.target.value)
                  }
                  aria-describedby={fieldErrors.clienteId ? 'clienteId-error' : undefined}
                  aria-invalid={Boolean(fieldErrors.clienteId)}
                  disabled={controlsDisabled || isLoadingClients}
                  required
                >
                  <option value="">
                    {isLoadingClients ? 'Cargando clientes...' : 'Selecciona un cliente'}
                  </option>
                  {clients.map((client) => (
                    <option
                      key={client.id}
                      value={client.id}
                      disabled={
                        client?.activo !== true ||
                        client?.rol?.nombre !== 'Cliente' ||
                        client?.rol?.activo !== true
                      }
                    >
                      {getUserFullName(client) || client.correo || 'Cliente'}
                      {client?.activo !== true ? ' · No disponible' : ''}
                    </option>
                  ))}
                </select>
              </FormField>
            ) : (
              <div className="rounded-lg border border-border bg-muted/40 p-4">
                <p className="text-xs font-medium text-muted-foreground">
                  {isEditMode ? 'Cliente de la cita' : 'La cita se registrará para'}
                </p>
                <p className="mt-1 text-sm font-semibold">
                  {currentClientName || 'Usuario autenticado'}
                </p>
              </div>
            )}
          </section>

          <section className="grid gap-4 border-t border-border pt-6" aria-labelledby="appointment-service-title">
            <h2 id="appointment-service-title" className="text-base font-semibold">
              Servicio y profesional
            </h2>
            <div className="grid gap-4 sm:grid-cols-2">
              <FormField
                htmlFor="servicioId"
                label={<RequiredLabel>Servicio principal</RequiredLabel>}
                error={fieldErrors.servicioId}
              >
                <select
                  id="servicioId"
                  name="servicioId"
                  className={SELECT_CLASS_NAME}
                  value={formData.servicioId}
                  onChange={(event) =>
                    onFieldChange('servicioId', event.target.value)
                  }
                  aria-describedby={fieldErrors.servicioId ? 'servicioId-error' : undefined}
                  aria-invalid={Boolean(fieldErrors.servicioId)}
                  disabled={controlsDisabled || isLoadingServices}
                  required
                >
                  <option value="">
                    {isLoadingServices ? 'Cargando servicios...' : 'Selecciona un servicio'}
                  </option>
                  {services.map((service) => (
                    <option
                      key={service.id}
                      value={service.id}
                      disabled={service?.activo !== true}
                    >
                      {service.nombre} · {formatServicePrice(service.precioBase)} ·{' '}
                      {formatServiceDuration(service.duracionMinutos)}
                      {service?.activo !== true ? ' · No disponible' : ''}
                    </option>
                  ))}
                </select>
              </FormField>

              <FormField
                htmlFor="empleadoId"
                label={<RequiredLabel>Empleado</RequiredLabel>}
                description={
                  !formData.servicioId
                    ? 'Selecciona primero el servicio principal.'
                    : undefined
                }
                error={fieldErrors.empleadoId}
              >
                <select
                  id="empleadoId"
                  name="empleadoId"
                  className={SELECT_CLASS_NAME}
                  value={formData.empleadoId}
                  onChange={(event) =>
                    onFieldChange('empleadoId', event.target.value)
                  }
                  aria-describedby={
                    fieldErrors.empleadoId
                      ? 'empleadoId-error'
                      : !formData.servicioId
                        ? 'empleadoId-description'
                        : undefined
                  }
                  aria-invalid={Boolean(fieldErrors.empleadoId)}
                  disabled={
                    controlsDisabled ||
                    !formData.servicioId ||
                    isLoadingEmployees
                  }
                  required
                >
                  <option value="">
                    {isLoadingEmployees
                      ? 'Cargando empleados...'
                      : formData.servicioId && !employees.length
                        ? 'No hay empleados disponibles'
                        : 'Selecciona un empleado'}
                  </option>
                  {employees.map((employee) => (
                    <option
                      key={employee.id}
                      value={employee.id}
                      disabled={
                        employee?.activo !== true ||
                        employee?.usuario?.activo !== true
                      }
                    >
                      {getEmployeeFullName(employee)}
                      {employee.especialidad?.nombre
                        ? ` · ${employee.especialidad.nombre}`
                        : ''}
                      {employee?.activo !== true ||
                      employee?.usuario?.activo !== true
                        ? ' · No disponible'
                        : ''}
                    </option>
                  ))}
                </select>
              </FormField>
            </div>

            <AdditionalsSelector
              additionals={additionals}
              selectedIds={formData.adicionalIds}
              onChange={onAdditionalsChange}
              error={fieldErrors.adicionalIds}
              disabled={controlsDisabled}
              isLoading={isLoadingAdditionals}
            />
          </section>

          <section className="grid gap-4 border-t border-border pt-6" aria-labelledby="appointment-date-title">
            <h2 id="appointment-date-title" className="text-base font-semibold">
              Fecha y hora
            </h2>
            <div className="grid gap-4 sm:grid-cols-2">
              <FormField
                htmlFor="fecha"
                label={<RequiredLabel>Fecha</RequiredLabel>}
                error={fieldErrors.fecha}
              >
                <Input
                  id="fecha"
                  name="fecha"
                  type="date"
                  min={minimumDate}
                  value={formData.fecha}
                  onChange={(event) => onFieldChange('fecha', event.target.value)}
                  aria-describedby={fieldErrors.fecha ? 'fecha-error' : undefined}
                  aria-invalid={Boolean(fieldErrors.fecha)}
                  disabled={controlsDisabled}
                  required
                />
              </FormField>

              <FormField
                htmlFor="horaInicio"
                label={<RequiredLabel>Hora de inicio</RequiredLabel>}
                description={scheduleMessage || 'Selecciona una hora en formato HH:mm.'}
                error={fieldErrors.horaInicio}
              >
                <Input
                  id="horaInicio"
                  name="horaInicio"
                  type="time"
                  step="60"
                  value={formData.horaInicio}
                  onChange={(event) =>
                    onFieldChange('horaInicio', event.target.value)
                  }
                  aria-describedby={
                    fieldErrors.horaInicio
                      ? 'horaInicio-error'
                      : 'horaInicio-description'
                  }
                  aria-invalid={Boolean(fieldErrors.horaInicio)}
                  disabled={
                    controlsDisabled ||
                    !formData.fecha ||
                    !formData.empleadoId ||
                    !selectedService
                  }
                  required
                />
              </FormField>
            </div>

            <AvailabilityMessage
              status={availabilityStatus}
              message={availabilityMessage}
            />
          </section>

          <section className="grid gap-4 border-t border-border pt-6" aria-labelledby="appointment-notes-title">
            <h2 id="appointment-notes-title" className="text-base font-semibold">
              Observaciones
            </h2>
            <FormField
              htmlFor="observaciones"
              label="Observaciones (opcional)"
              description="Si agregas observaciones, deben tener entre 3 y 500 caracteres."
              error={fieldErrors.observaciones}
            >
              <Textarea
                id="observaciones"
                name="observaciones"
                rows={4}
                minLength={3}
                maxLength={500}
                value={formData.observaciones}
                onChange={(event) =>
                  onFieldChange('observaciones', event.target.value)
                }
                aria-describedby={
                  fieldErrors.observaciones
                    ? 'observaciones-error'
                    : 'observaciones-description'
                }
                aria-invalid={Boolean(fieldErrors.observaciones)}
                disabled={controlsDisabled}
              />
            </FormField>
          </section>

          <FormActions>
            <Button
              type="button"
              variant="outline"
              onClick={onCancel}
              disabled={isSubmitting}
            >
              Cancelar
            </Button>
            <Button type="submit" disabled={isSubmitting || isPreparing}>
              {isSubmitting
                ? resolvedSubmittingText
                : isPreparing
                  ? 'Cargando opciones...'
                  : resolvedSubmitText}
            </Button>
          </FormActions>
        </CardContent>
      </Card>

      <Card className="h-fit lg:sticky lg:top-24">
        <CardHeader>
          <CardTitle aria-level={2} role="heading">
            Resumen estimado
          </CardTitle>
          <CardDescription>
            Se calcula con los catálogos actuales y se envía al guardar.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <dl className="grid gap-3">
            <SummaryItem
              icon={WalletCards}
              label="Costo estimado"
              value={selectedService ? totalText : 'Selecciona un servicio'}
            />
            <SummaryItem
              icon={Clock3}
              label="Duración estimada"
              value={
                selectedService ? durationText : 'Selecciona un servicio'
              }
            />
            <SummaryItem
              icon={CalendarClock}
              label="Hora estimada de finalización"
              value={estimate.endTime || 'Selecciona una hora'}
            />
          </dl>
          {selectedService ? (
            <div className="mt-4 space-y-2 border-t border-border pt-4 text-xs text-muted-foreground">
              <p>
                Servicio: {formatServicePrice(estimate.servicePrice)}
              </p>
              <p>
                Adicionales: {additionalCostText || formatServicePrice(0)}
              </p>
            </div>
          ) : null}
        </CardContent>
      </Card>
    </form>
  )
}
