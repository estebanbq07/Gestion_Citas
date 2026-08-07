import { AppointmentStatusBadge } from '@/components/data-display/AppointmentStatusBadge'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import {
  formatApiDate,
  formatApiTime,
  getApiDateKey,
  getApiTimeKey,
} from '@/lib/dateTimeUtils'
import {
  getEmployeeFullName,
  getUserFullName,
} from '@/lib/employeeUtils'
import {
  formatServiceDuration,
  formatServicePrice,
} from '@/lib/serviceUtils'

function getText(value) {
  return typeof value === 'string' ? value.trim() : ''
}

function formatMoney(value) {
  if (
    value === null ||
    value === undefined ||
    (typeof value === 'string' && !value.trim())
  ) {
    return ''
  }

  return formatServicePrice(value)
}

function formatDuration(value) {
  if (value === null || value === undefined || value === '') {
    return ''
  }

  return formatServiceDuration(value)
}

function DetailItem({ label, value, dateTime }) {
  if (!value) {
    return null
  }

  return (
    <div className="space-y-1">
      <dt className="text-sm text-muted-foreground">{label}</dt>
      <dd className="break-words text-sm font-medium">
        {dateTime ? <time dateTime={dateTime}>{value}</time> : value}
      </dd>
    </div>
  )
}

export function AppointmentDetail({ appointment, showClientEmail = false }) {
  const client =
    appointment?.cliente && typeof appointment.cliente === 'object'
      ? appointment.cliente
      : null
  const employee =
    appointment?.empleado && typeof appointment.empleado === 'object'
      ? appointment.empleado
      : null
  const service =
    appointment?.servicio && typeof appointment.servicio === 'object'
      ? appointment.servicio
      : null
  const status =
    appointment?.estadoCita &&
    typeof appointment.estadoCita === 'object'
      ? appointment.estadoCita
      : null
  const additionals = Array.isArray(appointment?.adicionales)
    ? appointment.adicionales.filter(
        (additional) =>
          additional !== null && typeof additional === 'object',
      )
    : []

  const clientName = client ? getUserFullName(client) : ''
  const clientEmail = showClientEmail ? getText(client?.correo) : ''
  const employeeName = employee ? getEmployeeFullName(employee) : ''
  const employeeCode = getText(employee?.codigoEmpleado)
  const specialtyName = getText(employee?.especialidad?.nombre)
  const serviceName = getText(service?.nombre) || 'Servicio principal'
  const statusName = getText(status?.nombre)
  const statusDescription = getText(status?.descripcion)
  const dateKey = getApiDateKey(appointment?.fecha)
  const dateLabel = formatApiDate(appointment?.fecha)
  const startTimeKey = getApiTimeKey(appointment?.horaInicio)
  const startTimeLabel = formatApiTime(appointment?.horaInicio)
  const endTimeKey = getApiTimeKey(appointment?.horaFin)
  const endTimeLabel = formatApiTime(appointment?.horaFin)
  const appointmentDuration = formatDuration(appointment?.duracionMinutos)
  const serviceDuration = formatDuration(
    service?.duracionMinutos ?? appointment?.duracionMinutos,
  )
  const servicePrice = formatMoney(
    appointment?.precioServicio ?? service?.precioBase,
  )
  const additionalCost = formatMoney(appointment?.costoAdicionales)
  const totalCost = formatMoney(appointment?.costoTotal)
  const observations = getText(appointment?.observaciones)
  const cancellationReason = getText(appointment?.motivoCancelacion)

  return (
    <Card>
      <CardHeader className="gap-4 border-b border-border">
        <div className="space-y-2">
          <CardTitle
            aria-level={2}
            className="text-2xl sm:text-3xl"
            role="heading"
          >
            {serviceName}
          </CardTitle>
          {statusDescription ? (
            <CardDescription>{statusDescription}</CardDescription>
          ) : null}
        </div>
        {statusName ? <AppointmentStatusBadge status={status} /> : null}
      </CardHeader>

      <CardContent className="space-y-8 pt-6">
        <section aria-labelledby="appointment-general-title" className="space-y-4">
          <h3 id="appointment-general-title" className="text-lg font-semibold">
            Información general
          </h3>
          <dl className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
            <DetailItem dateTime={dateKey} label="Fecha" value={dateLabel} />
            <DetailItem
              dateTime={startTimeKey}
              label="Hora de inicio"
              value={startTimeLabel}
            />
            <DetailItem
              dateTime={endTimeKey}
              label="Hora de finalización"
              value={endTimeLabel}
            />
            <DetailItem label="Duración" value={appointmentDuration} />
          </dl>
        </section>

        {clientName || clientEmail ? (
          <section
            aria-labelledby="appointment-client-title"
            className="space-y-4 border-t border-border pt-6"
          >
            <h3 id="appointment-client-title" className="text-lg font-semibold">
              Cliente
            </h3>
            <dl className="grid gap-5 sm:grid-cols-2">
              <DetailItem label="Nombre" value={clientName} />
              <DetailItem label="Correo electrónico" value={clientEmail} />
            </dl>
          </section>
        ) : null}

        {employeeName || specialtyName || employeeCode ? (
          <section
            aria-labelledby="appointment-employee-title"
            className="space-y-4 border-t border-border pt-6"
          >
            <h3
              id="appointment-employee-title"
              className="text-lg font-semibold"
            >
              Empleado
            </h3>
            <dl className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
              <DetailItem label="Nombre" value={employeeName} />
              <DetailItem label="Especialidad" value={specialtyName} />
              <DetailItem label="Código de empleado" value={employeeCode} />
            </dl>
          </section>
        ) : null}

        <section
          aria-labelledby="appointment-service-title"
          className="space-y-4 border-t border-border pt-6"
        >
          <h3 id="appointment-service-title" className="text-lg font-semibold">
            Servicio principal
          </h3>
          <dl className="grid gap-5 sm:grid-cols-3">
            <DetailItem label="Servicio" value={serviceName} />
            <DetailItem label="Precio registrado" value={servicePrice} />
            <DetailItem label="Duración" value={serviceDuration} />
          </dl>
        </section>

        <section
          aria-labelledby="appointment-additionals-title"
          className="space-y-4 border-t border-border pt-6"
        >
          <h3
            id="appointment-additionals-title"
            className="text-lg font-semibold"
          >
            Servicios adicionales
          </h3>
          {additionals.length ? (
            <ul className="grid gap-3 sm:grid-cols-2">
              {additionals.map((additional, index) => {
                const additionalName =
                  getText(additional?.nombre) || 'Servicio adicional'
                const additionalPrice = formatMoney(additional?.precio)

                return (
                  <li
                    key={additional.id ?? `${additionalName}-${index}`}
                    className="flex items-center justify-between gap-4 rounded-lg border border-border p-3"
                  >
                    <span className="min-w-0 break-words text-sm font-medium">
                      {additionalName}
                    </span>
                    {additionalPrice ? (
                      <span className="shrink-0 text-sm text-muted-foreground">
                        {additionalPrice}
                      </span>
                    ) : null}
                  </li>
                )
              })}
            </ul>
          ) : (
            <p className="text-sm text-muted-foreground">
              Esta cita no incluye servicios adicionales.
            </p>
          )}
        </section>

        {servicePrice || additionalCost || totalCost ? (
          <section
            aria-labelledby="appointment-cost-title"
            className="space-y-4 border-t border-border pt-6"
          >
            <h3 id="appointment-cost-title" className="text-lg font-semibold">
              Resumen de costos
            </h3>
            <dl className="grid gap-5 sm:grid-cols-3">
              <DetailItem label="Servicio principal" value={servicePrice} />
              <DetailItem label="Servicios adicionales" value={additionalCost} />
              <div className="space-y-1 rounded-lg bg-muted p-4">
                <dt className="text-sm text-muted-foreground">Costo total</dt>
                <dd className="text-xl font-semibold">{totalCost}</dd>
              </div>
            </dl>
          </section>
        ) : null}

        {observations || cancellationReason ? (
          <section
            aria-labelledby="appointment-notes-title"
            className="space-y-4 border-t border-border pt-6"
          >
            <h3 id="appointment-notes-title" className="text-lg font-semibold">
              Información adicional
            </h3>
            <dl className="grid gap-5 sm:grid-cols-2">
              <DetailItem label="Observaciones" value={observations} />
              <DetailItem
                label="Motivo de cancelación"
                value={cancellationReason}
              />
            </dl>
          </section>
        ) : null}
      </CardContent>
    </Card>
  )
}
