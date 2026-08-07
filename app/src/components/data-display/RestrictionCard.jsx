import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import {
  formatApiDate,
  getApiDateKey,
} from '@/lib/dateTimeUtils'
import {
  getRestrictionEmployeeName,
  getRestrictionScope,
  getRestrictionScopeLabel,
  getRestrictionTimeLabel,
  isValidRestrictionId,
  RESTRICTION_SCOPES,
} from '@/lib/restrictionUtils'

function getText(value) {
  return typeof value === 'string' ? value.trim() : ''
}

export function RestrictionCard({ restriction, onViewDetails }) {
  const typeName =
    getText(restriction?.tipoRestriccion?.nombre) ||
    'Restricción de horario'
  const reason = getText(restriction?.motivo)
  const dateKey = getApiDateKey(restriction?.fecha)
  const dateLabel = formatApiDate(restriction?.fecha)
  const timeLabel = getRestrictionTimeLabel(restriction)
  const scope = getRestrictionScope(restriction)
  const scopeLabel = getRestrictionScopeLabel(restriction)
  const employeeName = getRestrictionEmployeeName(restriction)
  const hasStatus = typeof restriction?.activo === 'boolean'
  const canViewDetails =
    typeof onViewDetails === 'function' &&
    isValidRestrictionId(restriction?.id)

  return (
    <Card className="flex h-full flex-col">
      <CardHeader className="gap-3 pb-3">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <CardTitle aria-level={2} className="text-xl" role="heading">
            {typeName}
          </CardTitle>
          <div className="flex flex-wrap gap-2">
            {scopeLabel ? (
              <Badge variant="secondary">{scopeLabel}</Badge>
            ) : null}
            {hasStatus ? (
              <Badge variant={restriction.activo ? 'default' : 'outline'}>
                {restriction.activo ? 'Activo' : 'Inactivo'}
              </Badge>
            ) : null}
          </div>
        </div>
      </CardHeader>

      <CardContent className="flex-1 space-y-5">
        <dl className="grid gap-4 text-sm">
          {dateLabel ? (
            <div className="space-y-1">
              <dt className="text-muted-foreground">Fecha</dt>
              <dd className="font-medium">
                <time dateTime={dateKey}>{dateLabel}</time>
              </dd>
            </div>
          ) : null}
          {timeLabel ? (
            <div className="space-y-1">
              <dt className="text-muted-foreground">Horario</dt>
              <dd className="font-medium">{timeLabel}</dd>
            </div>
          ) : null}
          {scope === RESTRICTION_SCOPES.EMPLOYEE && employeeName ? (
            <div className="space-y-1">
              <dt className="text-muted-foreground">Empleado</dt>
              <dd className="break-words font-medium">{employeeName}</dd>
            </div>
          ) : null}
        </dl>

        {reason ? (
          <div className="space-y-1">
            <p className="text-sm text-muted-foreground">Motivo</p>
            <p className="break-words text-sm">{reason}</p>
          </div>
        ) : null}
      </CardContent>

      {canViewDetails ? (
        <CardFooter className="mt-auto">
          <Button
            aria-label={`Ver detalle de ${typeName}`}
            className="w-full"
            type="button"
            variant="outline"
            onClick={() => onViewDetails(restriction)}
          >
            Ver detalle
          </Button>
        </CardFooter>
      ) : null}
    </Card>
  )
}
