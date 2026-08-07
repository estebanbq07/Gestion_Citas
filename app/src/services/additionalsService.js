import { isValidAdditionalId } from '@/lib/additionalUtils'
import { get, patch, post, put } from '@/services/apiClient'

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

export function getActiveAdditionals(options = {}) {
  return get('/servicios-adicionales/activos', options)
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

export function createAdditional(additionalData, options = {}) {
  return post('/servicios-adicionales', additionalData, options)
}

export function updateAdditional(id, additionalData, options = {}) {
  const normalizedId = String(id ?? '').trim()

  if (!isValidAdditionalId(normalizedId)) {
    throw createInvalidIdError()
  }

  return put(
    `/servicios-adicionales/${encodeURIComponent(normalizedId)}`,
    additionalData,
    options,
  )
}

export function changeAdditionalStatus(id, status, options = {}) {
  const normalizedId = String(id ?? '').trim()

  if (!isValidAdditionalId(normalizedId)) {
    throw createInvalidIdError()
  }

  if (typeof status !== 'boolean') {
    const error = new Error(
      'El estado del servicio adicional no es válido.',
    )
    error.code = 'INVALID_ADDITIONAL_STATUS'
    throw error
  }

  return patch(
    `/servicios-adicionales/${encodeURIComponent(normalizedId)}/estado`,
    { activo: status },
    options,
  )
}
