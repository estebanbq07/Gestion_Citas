import { isValidRestrictionId } from '@/lib/restrictionUtils'
import { get } from '@/services/apiClient'

function createInvalidIdError() {
  const error = new Error(
    'El identificador de la restricción no es válido.',
  )
  error.code = 'INVALID_RESTRICTION_ID'

  return error
}

export function getRestrictions(options = {}) {
  return get('/restricciones-horario', options)
}

export function getRestrictionById(id, options = {}) {
  const normalizedId = String(id ?? '').trim()

  if (!isValidRestrictionId(normalizedId)) {
    throw createInvalidIdError()
  }

  return get(
    `/restricciones-horario/${encodeURIComponent(normalizedId)}`,
    options,
  )
}
