import { get, patch, post, put } from '@/services/apiClient'

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

export function updateService(id, serviceData, token) {
  const normalizedId = String(id ?? '').trim()

  if (!/^[1-9]\d*$/.test(normalizedId)) {
    throw createInvalidIdError()
  }

  return put(
    `/servicios/${encodeURIComponent(normalizedId)}`,
    serviceData,
    { token },
  )
}

export function changeServiceStatus(id, status, token) {
  const normalizedId = String(id ?? '').trim()

  if (!/^[1-9]\d*$/.test(normalizedId)) {
    throw createInvalidIdError()
  }

  if (typeof status !== 'boolean') {
    const error = new Error('El estado del servicio no es válido.')
    error.code = 'INVALID_SERVICE_STATUS'
    throw error
  }

  return patch(
    `/servicios/${encodeURIComponent(normalizedId)}/estado`,
    { activo: status },
    { token },
  )
}
