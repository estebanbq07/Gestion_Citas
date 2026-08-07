import { isValidScheduleId } from '@/lib/scheduleUtils'
import { get } from '@/services/apiClient'

function createInvalidIdError() {
  const error = new Error('El identificador del horario no es válido.')
  error.code = 'INVALID_SCHEDULE_ID'

  return error
}

export function getSchedules(options = {}) {
  return get('/horarios-atencion', options)
}

export function getScheduleById(id, options = {}) {
  const normalizedId = String(id ?? '').trim()

  if (!isValidScheduleId(normalizedId)) {
    throw createInvalidIdError()
  }

  return get(
    `/horarios-atencion/${encodeURIComponent(normalizedId)}`,
    options,
  )
}
