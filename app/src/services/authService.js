import { get, post } from '@/services/apiClient'

export function login(credentials) {
  return post('/usuarios/login', credentials)
}

export function getCurrentUser(token) {
  return get('/usuarios/perfil', { token })
}

export function registerClient(data) {
  return post('/usuarios/registro', {
    nombre: data.nombre,
    primerApellido: data.primerApellido,
    segundoApellido: data.segundoApellido ?? null,
    correo: data.correo,
    telefono: data.telefono ?? null,
    password: data.password,
  })
}
