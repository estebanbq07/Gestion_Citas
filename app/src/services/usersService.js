import { get } from '@/services/apiClient'

const EMPLOYEE_ROLE = 'Empleado'

export function getEmployeeUsers(options = {}) {
  return get(`/usuarios?rol=${encodeURIComponent(EMPLOYEE_ROLE)}`, options)
}
