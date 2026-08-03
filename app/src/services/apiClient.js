import { ApiError } from '@/services/ApiError'

const API_URL = import.meta.env.VITE_API_URL ?? ''

function buildUrl(endpoint) {
  const baseUrl = API_URL.replace(/\/+$/, '')
  const path = String(endpoint ?? '').replace(/^\/+/, '')

  return path ? `${baseUrl}/${path}` : baseUrl
}

function prepareRequestBody(body, headers) {
  if (body === undefined || body === null) {
    return undefined
  }

  if (body instanceof FormData) {
    headers.delete('Content-Type')
    return body
  }

  if (!headers.has('Content-Type')) {
    headers.set('Content-Type', 'application/json')
  }

  return typeof body === 'string' ? body : JSON.stringify(body)
}

async function parseResponse(response) {
  if (response.status === 204) {
    return null
  }

  const content = await response.text()

  if (!content) {
    return null
  }

  try {
    return JSON.parse(content)
  } catch {
    return content
  }
}

function getResponseErrorMessage(response, data) {
  if (
    data &&
    typeof data === 'object' &&
    typeof data.message === 'string' &&
    data.message.trim()
  ) {
    return data.message
  }

  if (typeof data === 'string' && data.trim()) {
    return data
  }

  return response.statusText || 'La solicitud no pudo completarse.'
}

export async function apiRequest(endpoint, options = {}) {
  const {
    method = 'GET',
    body,
    headers: customHeaders,
    token,
    ...fetchOptions
  } = options

  const headers = new Headers(customHeaders)

  if (token) {
    headers.set('Authorization', `Bearer ${token}`)
  }

  const requestBody = prepareRequestBody(body, headers)
  let response

  try {
    response = await fetch(buildUrl(endpoint), {
      ...fetchOptions,
      method: method.toUpperCase(),
      headers,
      body: requestBody,
    })
  } catch {
    throw new ApiError('No fue posible conectar con el servidor.', 0, null)
  }

  const data = await parseResponse(response)

  if (!response.ok) {
    throw new ApiError(
      getResponseErrorMessage(response, data),
      response.status,
      data,
    )
  }

  return data
}

export function get(endpoint, options = {}) {
  return apiRequest(endpoint, { ...options, method: 'GET' })
}

export function post(endpoint, body, options = {}) {
  return apiRequest(endpoint, { ...options, method: 'POST', body })
}

export function put(endpoint, body, options = {}) {
  return apiRequest(endpoint, { ...options, method: 'PUT', body })
}

export function patch(endpoint, body, options = {}) {
  return apiRequest(endpoint, { ...options, method: 'PATCH', body })
}

export function remove(endpoint, options = {}) {
  return apiRequest(endpoint, { ...options, method: 'DELETE' })
}
