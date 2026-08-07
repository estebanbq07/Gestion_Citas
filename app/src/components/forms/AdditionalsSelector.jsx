import { formatAdditionalPrice } from '@/lib/additionalUtils'

function getAdditionalId(value) {
  const id = Number(value)

  return Number.isInteger(id) && id > 0 ? id : null
}

export function AdditionalsSelector({
  additionals,
  selectedIds,
  onChange,
  error,
  disabled = false,
  isLoading = false,
  id = 'adicionalIds',
}) {
  const availableAdditionals = Array.isArray(additionals)
    ? additionals.filter(
        (additional) =>
          getAdditionalId(additional?.id) !== null &&
          additional?.activo !== false,
      )
    : []
  const normalizedSelectedIds = Array.isArray(selectedIds)
    ? selectedIds
        .map(getAdditionalId)
        .filter((additionalId) => additionalId !== null)
    : []
  const descriptionId = `${id}-description`
  const errorId = `${id}-error`
  const describedBy = [descriptionId, error ? errorId : null]
    .filter(Boolean)
    .join(' ')

  function handleChange(additionalId, checked) {
    if (typeof onChange !== 'function') {
      return
    }

    const nextIds = checked
      ? [...new Set([...normalizedSelectedIds, additionalId])]
      : normalizedSelectedIds.filter(
          (selectedId) => selectedId !== additionalId,
        )

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
        Servicios adicionales
      </legend>
      <p id={descriptionId} className="text-xs text-muted-foreground">
        Son opcionales y aumentan el costo, pero no la duración de la cita.
      </p>

      {isLoading ? (
        <p className="text-sm text-muted-foreground">
          Cargando servicios adicionales...
        </p>
      ) : availableAdditionals.length ? (
        <div className="grid gap-2 sm:grid-cols-2">
          {availableAdditionals.map((additional) => {
            const additionalId = getAdditionalId(additional.id)
            const inputId = `${id}-${additionalId}`
            const isSelected = normalizedSelectedIds.includes(additionalId)
            const name =
              typeof additional.nombre === 'string' && additional.nombre.trim()
                ? additional.nombre.trim()
                : 'Servicio adicional'
            const formattedPrice = formatAdditionalPrice(additional.precio)

            return (
              <label
                key={additionalId}
                htmlFor={inputId}
                className="flex cursor-pointer items-start gap-3 rounded-md border border-border p-3 has-[:checked]:border-primary has-[:checked]:bg-primary/5 has-[:disabled]:cursor-not-allowed has-[:disabled]:opacity-60"
              >
                <input
                  id={inputId}
                  name={id}
                  type="checkbox"
                  value={additionalId}
                  checked={isSelected}
                  className="mt-0.5 size-4 accent-primary"
                  onChange={(event) =>
                    handleChange(additionalId, event.target.checked)
                  }
                />
                <span className="min-w-0 space-y-1">
                  <span className="block break-words text-sm font-medium">
                    {name}
                  </span>
                  {formattedPrice ? (
                    <span className="block text-xs text-muted-foreground">
                      {formattedPrice}
                    </span>
                  ) : null}
                </span>
              </label>
            )
          })}
        </div>
      ) : (
        <p className="text-sm text-muted-foreground">
          No hay servicios adicionales activos disponibles.
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
