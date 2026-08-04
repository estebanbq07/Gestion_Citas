import { get } from '@/services/apiClient'

export function getServices() {
  return get('/servicios')
}
