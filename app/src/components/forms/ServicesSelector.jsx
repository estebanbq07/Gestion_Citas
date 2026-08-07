import { Badge } from '@/components/ui/badge'

function getServiceId(value) {
  const id = Number(value)

  return Number.isInteger(id) && id > 0 ? id : null
}

function getText(value) {
  return typeof value === 'string' ? value.trim() : ''
}

export function ServicesSelector({
  services,
  selectedIds,
  onChange,
  error,
  disabled = false,
  id = 'servicioIds',
}) {
  const availableServices = Array.isArray(services)
    ? services.filter(
        (service) =>
          service !== null &&
          typeof service === 'object' &&
          getServiceId(service.id) !== null,
      )
    : []
  const normalizedSelectedIds = Array.isArray(selectedIds)
    ? selectedIds
        .map(getServiceId)
        .filter((serviceId) => serviceId !== null)
    : []
  const descriptionId = `${id}-description`
  const errorId = `${id}-error`
  const describedBy = [descriptionId, error ? errorId : null]
    .filter(Boolean)
    .join(' ')

  function handleServiceChange(serviceId, checked) {
    if (typeof onChange !== 'function') {
      return
    }

    const nextIds = checked
      ? [...new Set([...normalizedSelectedIds, serviceId])]
      : normalizedSelectedIds.filter((selectedId) => selectedId !== serviceId)

    onChange(nextIds)
  }

  return (
    <fieldset
      aria-describedby={describedBy}
      aria-invalid={Boolean(error)}
      className="grid gap-3 rounded-lg border border-border p-4"
      disabled={disabled}
    >
      <legend className="px-1 text-sm font-medium">
        Servicios asignados
        <span aria-hidden="true" className="text-destructive">
          {' '}
          *
        </span>
      </legend>
      <p id={descriptionId} className="text-xs text-muted-foreground">
        Selecciona al menos un servicio de la especialidad elegida.
      </p>

      {availableServices.length ? (
        <div className="grid gap-2 sm:grid-cols-2">
          {availableServices.map((service) => {
            const serviceId = getServiceId(service.id)
            const isSelected = normalizedSelectedIds.includes(serviceId)
            const isInactive = service.activo === false
            const isOptionDisabled = disabled || (isInactive && !isSelected)
            const inputId = `${id}-${serviceId}`
            const serviceName = getText(service.nombre) || 'Servicio sin nombre'

            return (
              <label
                key={serviceId}
                htmlFor={inputId}
                className="flex cursor-pointer items-start gap-3 rounded-md border border-border p-3 has-[:checked]:border-primary has-[:checked]:bg-primary/5 has-[:disabled]:cursor-not-allowed has-[:disabled]:opacity-60"
              >
                <input
                  id={inputId}
                  name={id}
                  type="checkbox"
                  value={serviceId}
                  checked={isSelected}
                  disabled={isOptionDisabled}
                  className="mt-0.5 size-4 accent-primary"
                  onChange={(event) =>
                    handleServiceChange(serviceId, event.target.checked)
                  }
                />
                <span className="min-w-0 flex-1 space-y-1">
                  <span className="block break-words text-sm font-medium">
                    {serviceName}
                  </span>
                  {isInactive && isSelected ? (
                    <span className="block text-xs text-muted-foreground">
                      Está inactivo; puede retirarlo de la selección.
                    </span>
                  ) : null}
                </span>
                {typeof service.activo === 'boolean' ? (
                  <Badge variant={service.activo ? 'default' : 'outline'}>
                    {service.activo ? 'Activo' : 'Inactivo'}
                  </Badge>
                ) : null}
              </label>
            )
          })}
        </div>
      ) : (
        <p className="text-sm text-muted-foreground">
          No hay servicios disponibles para la especialidad seleccionada.
        </p>
      )}

      {error ? (
        <p id={errorId} className="text-xs text-destructive" role="alert">
          {error}
        </p>
      ) : null}
    </fieldset>
  )
}
