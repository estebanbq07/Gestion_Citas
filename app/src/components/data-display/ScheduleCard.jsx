import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { formatApiTime } from '@/lib/dateTimeUtils'
import {
  getScheduleDayName,
  isValidScheduleId,
} from '@/lib/scheduleUtils'

function TimeItem({ label, value }) {
  if (!value) {
    return null
  }

  return (
    <div className="space-y-1">
      <dt className="text-sm text-muted-foreground">{label}</dt>
      <dd className="text-lg font-semibold tabular-nums">{value}</dd>
    </div>
  )
}

export function ScheduleCard({ schedule, onViewDetails }) {
  const dayName = getScheduleDayName(schedule) || 'Horario de atención'
  const openingTime = formatApiTime(schedule?.horaInicio)
  const closingTime = formatApiTime(schedule?.horaFin)
  const hasStatus = typeof schedule?.activo === 'boolean'
  const canViewDetails =
    typeof onViewDetails === 'function' && isValidScheduleId(schedule?.id)

  return (
    <Card className="flex h-full flex-col">
      <CardHeader className="gap-3 pb-4">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <CardTitle aria-level={2} className="text-xl" role="heading">
            {dayName}
          </CardTitle>
          {hasStatus ? (
            <Badge variant={schedule.activo ? 'default' : 'outline'}>
              {schedule.activo ? 'Activo' : 'Inactivo'}
            </Badge>
          ) : null}
        </div>
      </CardHeader>

      <CardContent className="flex-1">
        <dl className="grid grid-cols-2 gap-4">
          <TimeItem label="Apertura" value={openingTime} />
          <TimeItem label="Cierre" value={closingTime} />
        </dl>
      </CardContent>

      {canViewDetails ? (
        <CardFooter className="mt-auto">
          <Button
            aria-label={`Ver detalle del horario de ${dayName}`}
            className="w-full"
            type="button"
            variant="outline"
            onClick={() => onViewDetails(schedule)}
          >
            Ver detalle
          </Button>
        </CardFooter>
      ) : null}
    </Card>
  )
}
