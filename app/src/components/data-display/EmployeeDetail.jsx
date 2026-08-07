import { Badge } from '@/components/ui/badge'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import {
  getEmployeeFullName,
  getUserFullName,
} from '@/lib/employeeUtils'

function getText(value) {
  return typeof value === 'string' ? value.trim() : ''
}

function getCollectionCount(employee, field, alternativeField) {
  if (Array.isArray(employee?.[field])) {
    return employee[field].length
  }

  const count = Number(
    employee?.[alternativeField] ?? employee?._count?.[field],
  )

  return Number.isInteger(count) && count >= 0 ? count : null
}

function DetailItem({ label, value }) {
  if (!value) {
    return null
  }

  return (
    <div className="space-y-1">
      <dt className="text-sm text-muted-foreground">{label}</dt>
      <dd className="break-words text-sm font-medium">{value}</dd>
    </div>
  )
}

export function EmployeeDetail({ employee }) {
  const fullName = getEmployeeFullName(employee)
  const employeeCode = getText(employee?.codigoEmpleado)
  const description = getText(employee?.descripcion)
  const specialtyName = getText(employee?.especialidad?.nombre)
  const specialtyDescription = getText(
    employee?.especialidad?.descripcion,
  )
  const hasStatus = typeof employee?.activo === 'boolean'
  const user =
    employee?.usuario && typeof employee.usuario === 'object'
      ? employee.usuario
      : null
  const userFullName = user ? getUserFullName(user) : ''
  const userEmail = getText(user?.correo)
  const userPhone = getText(user?.telefono)
  const hasUserInformation = Boolean(userFullName || userEmail || userPhone)
  const services = Array.isArray(employee?.servicios)
    ? employee.servicios.filter(
        (service) => service !== null && typeof service === 'object',
      )
    : []
  const appointmentsCount = getCollectionCount(
    employee,
    'citas',
    'cantidadCitas',
  )
  const restrictionsCount = getCollectionCount(
    employee,
    'restricciones',
    'cantidadRestricciones',
  )
  const hasActivityCounts =
    appointmentsCount !== null || restrictionsCount !== null

  return (
    <Card>
      <CardHeader className="gap-4 border-b border-border">
        <div className="space-y-2">
          <CardTitle
            aria-level={2}
            className="text-2xl sm:text-3xl"
            role="heading"
          >
            {fullName}
          </CardTitle>
          {employeeCode ? (
            <CardDescription>
              Código de empleado: {employeeCode}
            </CardDescription>
          ) : null}
        </div>
        {hasStatus ? (
          <Badge variant={employee.activo ? 'default' : 'outline'}>
            {employee.activo ? 'Activo' : 'Inactivo'}
          </Badge>
        ) : null}
      </CardHeader>

      <CardContent className="space-y-8 pt-6">
        <section aria-labelledby="employee-work-title" className="space-y-4">
          <h3 id="employee-work-title" className="text-lg font-semibold">
            Información laboral
          </h3>
          <dl className="grid gap-5 sm:grid-cols-2">
            <DetailItem label="Código de empleado" value={employeeCode} />
            <DetailItem label="Especialidad" value={specialtyName} />
            <DetailItem
              label="Descripción de la especialidad"
              value={specialtyDescription}
            />
            <DetailItem label="Descripción" value={description} />
          </dl>
        </section>

        {hasUserInformation ? (
          <section
            aria-labelledby="employee-user-title"
            className="space-y-4 border-t border-border pt-6"
          >
            <h3 id="employee-user-title" className="text-lg font-semibold">
              Usuario asociado
            </h3>
            <dl className="grid gap-5 sm:grid-cols-2">
              <DetailItem label="Nombre" value={userFullName} />
              <DetailItem label="Correo electrónico" value={userEmail} />
              <DetailItem label="Teléfono" value={userPhone} />
            </dl>
          </section>
        ) : null}

        <section
          aria-labelledby="employee-services-title"
          className="space-y-4 border-t border-border pt-6"
        >
          <h3 id="employee-services-title" className="text-lg font-semibold">
            Servicios asignados
          </h3>
          {services.length ? (
            <ul className="grid gap-3 sm:grid-cols-2">
              {services.map((service, index) => {
                const serviceName =
                  getText(service?.nombre) || 'Servicio sin nombre'
                const hasServiceStatus = typeof service?.activo === 'boolean'

                return (
                  <li
                    key={service.id ?? `${serviceName}-${index}`}
                    className="flex items-center justify-between gap-3 rounded-lg border border-border p-3"
                  >
                    <span className="min-w-0 break-words text-sm font-medium">
                      {serviceName}
                    </span>
                    {hasServiceStatus ? (
                      <Badge variant={service.activo ? 'default' : 'outline'}>
                        {service.activo ? 'Activo' : 'Inactivo'}
                      </Badge>
                    ) : null}
                  </li>
                )
              })}
            </ul>
          ) : (
            <p className="text-sm text-muted-foreground">
              No hay servicios asignados.
            </p>
          )}
        </section>

        {hasActivityCounts ? (
          <section
            aria-labelledby="employee-activity-title"
            className="space-y-4 border-t border-border pt-6"
          >
            <h3 id="employee-activity-title" className="text-lg font-semibold">
              Resumen de actividad
            </h3>
            <dl className="grid gap-5 sm:grid-cols-2">
              <DetailItem
                label="Citas registradas"
                value={
                  appointmentsCount === null ? '' : String(appointmentsCount)
                }
              />
              <DetailItem
                label="Restricciones registradas"
                value={
                  restrictionsCount === null
                    ? ''
                    : String(restrictionsCount)
                }
              />
            </dl>
          </section>
        ) : null}
      </CardContent>
    </Card>
  )
}
