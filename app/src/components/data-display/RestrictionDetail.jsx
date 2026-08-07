import { Badge } from '@/components/ui/badge'
import {
  Card,
  CardContent,
  CardDescription,
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
  RESTRICTION_SCOPES,
} from '@/lib/restrictionUtils'

function getText(value) {
  return typeof value === 'string' ? value.trim() : ''
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

export function RestrictionDetail({ restriction }) {
  const typeName =
    getText(restriction?.tipoRestriccion?.nombre) ||
    'Restricción de horario'
  const typeDescription = getText(
    restriction?.tipoRestriccion?.descripcion,
  )
  const reason = getText(restriction?.motivo)
  const dateKey = getApiDateKey(restriction?.fecha)
  const dateLabel = formatApiDate(restriction?.fecha)
  const timeLabel = getRestrictionTimeLabel(restriction)
  const scope = getRestrictionScope(restriction)
  const scopeLabel = getRestrictionScopeLabel(restriction)
  const employeeName = getRestrictionEmployeeName(restriction)
  const employeeCode = getText(restriction?.empleado?.codigoEmpleado)
  const hasStatus = typeof restriction?.activo === 'boolean'

  return (
    <Card>
      <CardHeader className="gap-4 border-b border-border">
        <div className="space-y-2">
          <CardTitle
            aria-level={2}
            className="text-2xl sm:text-3xl"
            role="heading"
          >
            {typeName}
          </CardTitle>
          {typeDescription ? (
            <CardDescription>{typeDescription}</CardDescription>
          ) : null}
        </div>
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
      </CardHeader>

      <CardContent className="space-y-8 pt-6">
        <section
          aria-labelledby="restriction-information-title"
          className="space-y-4"
        >
          <h3
            id="restriction-information-title"
            className="text-lg font-semibold"
          >
            Información de la restricción
          </h3>
          <dl className="grid gap-5 sm:grid-cols-2">
            <DetailItem
              dateTime={dateKey}
              label="Fecha"
              value={dateLabel}
            />
            <DetailItem label="Horario" value={timeLabel} />
            <DetailItem label="Alcance" value={scopeLabel} />
          </dl>
        </section>

        {scope === RESTRICTION_SCOPES.EMPLOYEE &&
        (employeeName || employeeCode) ? (
          <section
            aria-labelledby="restriction-employee-title"
            className="space-y-4 border-t border-border pt-6"
          >
            <h3
              id="restriction-employee-title"
              className="text-lg font-semibold"
            >
              Empleado relacionado
            </h3>
            <dl className="grid gap-5 sm:grid-cols-2">
              <DetailItem label="Nombre" value={employeeName} />
              <DetailItem label="Código de empleado" value={employeeCode} />
            </dl>
          </section>
        ) : null}

        {reason ? (
          <section
            aria-labelledby="restriction-reason-title"
            className="space-y-3 border-t border-border pt-6"
          >
            <h3
              id="restriction-reason-title"
              className="text-lg font-semibold"
            >
              Motivo
            </h3>
            <p className="break-words text-sm leading-6">{reason}</p>
          </section>
        ) : null}
      </CardContent>
    </Card>
  )
}
