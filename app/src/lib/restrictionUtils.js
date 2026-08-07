import {
  formatApiTime,
  getApiDateKey,
} from '@/lib/dateTimeUtils'

export const RESTRICTION_SCOPES = Object.freeze({
  ALL: 'all',
  ESTABLISHMENT: 'establishment',
  EMPLOYEE: 'employee',
})

function getTextValue(value) {
  return typeof value === 'string' ? value.trim() : ''
}

function normalizeSearchValue(value) {
  return getTextValue(value).toLocaleLowerCase('es-CR')
}

export function isValidRestrictionId(id) {
  const normalizedId = String(id ?? '').trim()

  if (!/^[1-9]\d*$/.test(normalizedId)) {
    return false
  }

  return Number.isSafeInteger(Number(normalizedId))
}

export function getRestrictionScope(restriction) {
  if (restriction?.empleadoId === null) {
    return RESTRICTION_SCOPES.ESTABLISHMENT
  }

  const employeeId = Number(restriction?.empleadoId)

  return Number.isInteger(employeeId) && employeeId > 0
    ? RESTRICTION_SCOPES.EMPLOYEE
    : ''
}

export function getRestrictionScopeLabel(restriction) {
  const scope = getRestrictionScope(restriction)

  if (scope === RESTRICTION_SCOPES.ESTABLISHMENT) {
    return 'Establecimiento'
  }

  if (scope === RESTRICTION_SCOPES.EMPLOYEE) {
    return 'Empleado'
  }

  return ''
}

export function getRestrictionEmployeeName(restriction) {
  const user = restriction?.empleado?.usuario

  return [user?.nombre, user?.primerApellido, user?.segundoApellido]
    .map(getTextValue)
    .filter(Boolean)
    .join(' ')
}

export function getRestrictionTimeLabel(restriction) {
  if (restriction?.todoElDia === true) {
    return 'Todo el día'
  }

  const startTime = formatApiTime(restriction?.horaInicio)
  const endTime = formatApiTime(restriction?.horaFin)

  return startTime && endTime ? `${startTime} – ${endTime}` : ''
}

export function filterRestrictions(restrictions, searchTerm) {
  const items = Array.isArray(restrictions) ? restrictions : []
  const term = normalizeSearchValue(searchTerm)

  if (!term) {
    return [...items]
  }

  return items.filter((restriction) => {
    const searchableText = [
      restriction?.motivo,
      restriction?.tipoRestriccion?.nombre,
      restriction?.tipoRestriccion?.descripcion,
      restriction?.empleado?.codigoEmpleado,
      getRestrictionEmployeeName(restriction),
    ]
      .map(normalizeSearchValue)
      .join(' ')

    return searchableText.includes(term)
  })
}

export function filterRestrictionsByScope(restrictions, scopeFilter) {
  const items = Array.isArray(restrictions) ? restrictions : []

  if (
    scopeFilter !== RESTRICTION_SCOPES.ESTABLISHMENT &&
    scopeFilter !== RESTRICTION_SCOPES.EMPLOYEE
  ) {
    return [...items]
  }

  return items.filter(
    (restriction) => getRestrictionScope(restriction) === scopeFilter,
  )
}

export function sortRestrictions(restrictions, sortOption) {
  const sortedRestrictions = Array.isArray(restrictions)
    ? [...restrictions]
    : []
  const direction = sortOption === 'dateAsc' ? 1 : -1

  return sortedRestrictions.sort((left, right) => {
    const leftDate = getApiDateKey(left?.fecha)
    const rightDate = getApiDateKey(right?.fecha)

    if (!leftDate && !rightDate) {
      return 0
    }

    if (!leftDate) {
      return 1
    }

    if (!rightDate) {
      return -1
    }

    return leftDate.localeCompare(rightDate) * direction
  })
}
