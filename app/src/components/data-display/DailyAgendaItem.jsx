import { Clock3 } from 'lucide-react'

import { AppointmentStatusBadge } from '@/components/data-display/AppointmentStatusBadge'
import { Button } from '@/components/ui/button'
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import {
  formatAppointmentDuration,
  formatAppointmentTimeRange,
  getAppointmentClientName,
  getAppointmentEmployeeName,
  getAppointmentServiceName,
  isValidAppointmentId,
} from '@/lib/appointmentUtils'

function getText(value) {
  return typeof value === 'string' ? value.trim() : ''
}

function DetailItem({ label, value }) {
  if (!value) {
    return null
  }

  return (
    <div className="space-y-1">
      <dt className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
        {label}
      </dt>
      <dd className="break-words text-sm font-medium">{value}</dd>
    </div>
  )
}

export function DailyAgendaItem({ appointment, onViewDetails }) {
  const timeRange = formatAppointmentTimeRange(appointment)
  const clientName = getAppointmentClientName(appointment)
  const employeeName = getAppointmentEmployeeName(appointment)
  const serviceName = getAppointmentServiceName(appointment)
  const specialtyName = getText(appointment?.empleado?.especialidad?.nombre)
  const duration = formatAppointmentDuration(appointment?.duracionMinutos)
  const additionalNames = (
    Array.isArray(appointment?.adicionales) ? appointment.adicionales : []
  )
    .map((additional) => getText(additional?.nombre))
    .filter(Boolean)
  const canViewDetails =
    typeof onViewDetails === 'function' &&
    isValidAppointmentId(appointment?.id)

  return (
    <li className="relative pl-0 md:pl-32">
      <div className="mb-2 flex items-center gap-2 font-semibold tabular-nums text-primary md:absolute md:left-0 md:top-6 md:mb-0 md:w-28 md:justify-end">
        <Clock3 aria-hidden="true" className="size-4 shrink-0" />
        <span>{timeRange}</span>
      </div>

      <Card className="overflow-hidden border-l-4 border-l-primary/70">
        <CardHeader className="gap-3 pb-4">
          <div className="flex flex-wrap items-start justify-between gap-3">
            <CardTitle className="text-lg">
              {serviceName || 'Servicio principal'}
            </CardTitle>
            <AppointmentStatusBadge status={appointment?.estadoCita} />
          </div>
        </CardHeader>

        <CardContent className="space-y-4">
          <dl className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            <DetailItem label="Cliente" value={clientName} />
            <DetailItem label="Empleado" value={employeeName} />
            <DetailItem label="Especialidad" value={specialtyName} />
            <DetailItem label="Duración" value={duration} />
          </dl>

          {additionalNames.length ? (
            <p className="text-sm text-muted-foreground">
              <span className="font-medium text-foreground">Adicionales:</span>{' '}
              {additionalNames.join(', ')}
            </p>
          ) : null}
        </CardContent>

        {canViewDetails ? (
          <CardFooter className="justify-end border-t bg-muted/30 pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => onViewDetails(appointment)}
            >
              Ver detalle
            </Button>
          </CardFooter>
        ) : null}
      </Card>
    </li>
  )
}
