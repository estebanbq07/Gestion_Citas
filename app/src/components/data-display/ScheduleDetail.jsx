import { Badge } from '@/components/ui/badge'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { formatApiTime } from '@/lib/dateTimeUtils'
import { getScheduleDayName } from '@/lib/scheduleUtils'

function DetailItem({ label, value }) {
  if (!value) {
    return null
  }

  return (
    <div className="space-y-1">
      <dt className="text-sm text-muted-foreground">{label}</dt>
      <dd className="text-2xl font-semibold tabular-nums">{value}</dd>
    </div>
  )
}

export function ScheduleDetail({ schedule }) {
  const dayName = getScheduleDayName(schedule) || 'Horario de atención'
  const openingTime = formatApiTime(schedule?.horaInicio)
  const closingTime = formatApiTime(schedule?.horaFin)
  const hasStatus = typeof schedule?.activo === 'boolean'

  return (
    <Card>
      <CardHeader className="gap-4 border-b border-border">
        <div className="space-y-2">
          <CardTitle
            aria-level={2}
            className="text-2xl sm:text-3xl"
            role="heading"
          >
            {dayName}
          </CardTitle>
          <CardDescription>Horario de atención del establecimiento</CardDescription>
        </div>
        {hasStatus ? (
          <Badge variant={schedule.activo ? 'default' : 'outline'}>
            {schedule.activo ? 'Activo' : 'Inactivo'}
          </Badge>
        ) : null}
      </CardHeader>

      <CardContent className="pt-6">
        <dl className="grid gap-6 sm:grid-cols-2">
          <DetailItem label="Hora de apertura" value={openingTime} />
          <DetailItem label="Hora de cierre" value={closingTime} />
        </dl>
      </CardContent>
    </Card>
  )
}
