import { get, post } from '@/services/apiClient'

export function login(credentials) {
  return post('/usuarios/login', credentials)
}

export function getCurrentUser(token) {
  return get('/usuarios/perfil', { token })
}
