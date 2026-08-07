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
  getEmployeeFullName,
  isValidEmployeeId,
} from '@/lib/employeeUtils'

function getText(value) {
  return typeof value === 'string' ? value.trim() : ''
}

function getServicesCount(employee) {
  if (Array.isArray(employee?.servicios)) {
    return employee.servicios.length
  }

  const count = Number(
    employee?.cantidadServicios ?? employee?._count?.servicios,
  )

  return Number.isInteger(count) && count >= 0 ? count : 0
}

export function EmployeeCard({ employee, onViewDetails }) {
  const fullName = getEmployeeFullName(employee)
  const employeeCode = getText(employee?.codigoEmpleado) || 'Sin código'
  const specialtyName =
    getText(employee?.especialidad?.nombre) || 'Sin especialidad registrada'
  const servicesCount = getServicesCount(employee)
  const hasStatus = typeof employee?.activo === 'boolean'
  const canViewDetails =
    typeof onViewDetails === 'function' && isValidEmployeeId(employee?.id)

  return (
    <Card className="flex h-full flex-col">
      <CardHeader className="gap-3 pb-3">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div className="space-y-2">
            <CardTitle aria-level={2} className="text-xl" role="heading">
              {fullName}
            </CardTitle>
            <p className="font-mono text-xs text-muted-foreground">
              {employeeCode}
            </p>
          </div>
          {hasStatus ? (
            <Badge variant={employee.activo ? 'default' : 'outline'}>
              {employee.activo ? 'Activo' : 'Inactivo'}
            </Badge>
          ) : null}
        </div>
      </CardHeader>

      <CardContent className="flex-1">
        <dl className="grid gap-4 text-sm">
          <div className="space-y-1">
            <dt className="text-muted-foreground">Especialidad</dt>
            <dd className="font-medium">{specialtyName}</dd>
          </div>
          <div className="space-y-1">
            <dt className="text-muted-foreground">Servicios asignados</dt>
            <dd className="font-medium">
              {servicesCount} {servicesCount === 1 ? 'servicio' : 'servicios'}
            </dd>
          </div>
        </dl>
      </CardContent>

      {canViewDetails ? (
        <CardFooter className="mt-auto">
          <Button
            aria-label={`Ver detalle de ${fullName}`}
            className="w-full"
            type="button"
            variant="outline"
            onClick={() => onViewDetails(employee)}
          >
            Ver detalle
          </Button>
        </CardFooter>
      ) : null}
    </Card>
  )
}
