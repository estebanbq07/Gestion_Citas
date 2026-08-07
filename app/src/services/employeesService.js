import { isValidEmployeeId } from '@/lib/employeeUtils'
import { get, patch, post, put } from '@/services/apiClient'

function createInvalidIdError() {
  const error = new Error('El identificador del empleado no es válido.')
  error.code = 'INVALID_EMPLOYEE_ID'

  return error
}

export function getEmployees(options = {}) {
  return get('/empleados', options)
}

export function getEmployeeById(id, options = {}) {
  const normalizedId = String(id ?? '').trim()

  if (!isValidEmployeeId(normalizedId)) {
    throw createInvalidIdError()
  }

  return get(`/empleados/${encodeURIComponent(normalizedId)}`, options)
}

export function createEmployee(employeeData, options = {}) {
  return post('/empleados', employeeData, options)
}

export function updateEmployee(id, employeeData, options = {}) {
  const normalizedId = String(id ?? '').trim()

  if (!isValidEmployeeId(normalizedId)) {
    throw createInvalidIdError()
  }

  return put(
    `/empleados/${encodeURIComponent(normalizedId)}`,
    employeeData,
    options,
  )
}

export function changeEmployeeStatus(id, status, options = {}) {
  const normalizedId = String(id ?? '').trim()

  if (!isValidEmployeeId(normalizedId)) {
    throw createInvalidIdError()
  }

  if (typeof status !== 'boolean') {
    const error = new Error('El estado del empleado no es válido.')
    error.code = 'INVALID_EMPLOYEE_STATUS'
    throw error
  }

  return patch(
    `/empleados/${encodeURIComponent(normalizedId)}/estado`,
    { activo: status },
    options,
  )
}
