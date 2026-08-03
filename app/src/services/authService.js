import { post } from '@/services/apiClient'

export function login(credentials) {
  return post('/usuarios/login', credentials)
}
