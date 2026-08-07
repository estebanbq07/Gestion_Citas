import { get } from '@/services/apiClient'
import { isValidAdditionalId } from '@/lib/additionalUtils'

function createInvalidIdError() {
  const error = new Error(
    'El identificador del servicio adicional no es válido.',
  )
  error.code = 'INVALID_ADDITIONAL_ID'

  return error
}

export function getAdditionals(options = {}) {
  return get('/servicios-adicionales', options)
}

export function getAdditionalById(id, options = {}) {
  const normalizedId = String(id ?? '').trim()

  if (!isValidAdditionalId(normalizedId)) {
    throw createInvalidIdError()
  }

  return get(
    `/servicios-adicionales/${encodeURIComponent(normalizedId)}`,
    options,
  )
}
