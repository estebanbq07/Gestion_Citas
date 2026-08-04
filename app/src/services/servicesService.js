import { get, post } from '@/services/apiClient'

function createInvalidIdError() {
  const error = new Error('El identificador del servicio no es válido.')
  error.code = 'INVALID_SERVICE_ID'

  return error
}

export function getServices(options = {}) {
  return get('/servicios', options)
}

export function getServiceById(id, options = {}) {
  const normalizedId = String(id ?? '').trim()

  if (!/^[1-9]\d*$/.test(normalizedId)) {
    throw createInvalidIdError()
  }

  return get(`/servicios/${encodeURIComponent(normalizedId)}`, options)
}

export function createService(serviceData, token) {
  return post('/servicios', serviceData, { token })
}
