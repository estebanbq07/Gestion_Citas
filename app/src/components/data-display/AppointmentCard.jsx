import { AppointmentStatusBadge } from '@/components/data-display/AppointmentStatusBadge'
import { Button } from '@/components/ui/button'
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { getApiDateKey } from '@/lib/dateTimeUtils'
import {
  formatAppointmentDate,
  formatAppointmentDuration,
  formatAppointmentPrice,
  formatAppointmentTimeRange,
  getAppointmentClientName,
  getAppointmentEmployeeName,
  getAppointmentServiceName,
  isValidAppointmentId,
} from '@/lib/appointmentUtils'

function DetailItem({ label, value, dateTime }) {
  if (!value) {
    return null
  }

  return (
    <div className="space-y-1">
      <dt className="text-xs text-muted-foreground">{label}</dt>
      <dd className="break-words text-sm font-medium">
        {dateTime ? <time dateTime={dateTime}>{value}</time> : value}
      </dd>
    </div>
  )
}

export function AppointmentCard({ appointment, onViewDetails }) {
  const serviceName = getAppointmentServiceName(appointment) || 'Cita'
  const clientName = getAppointmentClientName(appointment)
  const employeeName = getAppointmentEmployeeName(appointment)
  const dateKey = getApiDateKey(appointment?.fecha)
  const dateLabel = formatAppointmentDate(appointment?.fecha)
  const timeRange = formatAppointmentTimeRange(appointment)
  const duration = formatAppointmentDuration(appointment?.duracionMinutos)
  const total = formatAppointmentPrice(appointment?.costoTotal)
  const canViewDetails =
    typeof onViewDetails === 'function' &&
    isValidAppointmentId(appointment?.id)

  return (
    <Card className="flex h-full flex-col">
      <CardHeader className="gap-3 pb-3">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <CardTitle aria-level={2} className="text-xl" role="heading">
            {serviceName}
          </CardTitle>
          <AppointmentStatusBadge status={appointment?.estadoCita} />
        </div>
      </CardHeader>

      <CardContent className="flex-1 space-y-5">
        <dl className="grid gap-4 sm:grid-cols-2">
          <DetailItem label="Fecha" value={dateLabel} dateTime={dateKey} />
          <DetailItem label="Horario" value={timeRange} />
          <DetailItem label="Duración" value={duration} />
          <DetailItem label="Costo total" value={total} />
          <DetailItem label="Cliente" value={clientName} />
          <DetailItem label="Empleado" value={employeeName} />
        </dl>
      </CardContent>

      {canViewDetails ? (
        <CardFooter className="mt-auto">
          <Button
            aria-label={`Ver detalle de la cita de ${serviceName}`}
            className="w-full"
            type="button"
            variant="outline"
            onClick={() => onViewDetails(appointment)}
          >
            Ver detalle
          </Button>
        </CardFooter>
      ) : null}
    </Card>
  )
}
