import { get } from '@/services/apiClient'

const EMPLOYEE_ROLE = 'Empleado'
const CLIENT_ROLE = 'Cliente'

export function getEmployeeUsers(options = {}) {
  return get(`/usuarios?rol=${encodeURIComponent(EMPLOYEE_ROLE)}`, options)
}

export function getClientUsers(options = {}) {
  return get(`/usuarios?rol=${encodeURIComponent(CLIENT_ROLE)}`, options)
}
