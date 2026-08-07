import { isValidAppointmentId } from '@/lib/appointmentUtils'
import { get, patch, post, put } from '@/services/apiClient'

function createInvalidIdError(resourceName, code) {
  const error = new Error(`El identificador ${resourceName} no es válido.`)
  error.code = code

  return error
}

function normalizeRequiredId(id, resourceName, code) {
  const normalizedId = String(id ?? '').trim()

  if (!isValidAppointmentId(normalizedId)) {
    throw createInvalidIdError(resourceName, code)
  }

  return normalizedId
}

export function getAppointments(options = {}) {
  return get('/citas', options)
}

export function getAppointmentsByClient(clientId, options = {}) {
  const normalizedId = normalizeRequiredId(
    clientId,
    'del cliente',
    'INVALID_CLIENT_ID',
  )

  return get(`/citas/cliente/${encodeURIComponent(normalizedId)}`, options)
}

export function getAppointmentsByEmployee(employeeId, options = {}) {
  const normalizedId = normalizeRequiredId(
    employeeId,
    'del empleado',
    'INVALID_EMPLOYEE_ID',
  )

  return get(`/citas/empleado/${encodeURIComponent(normalizedId)}`, options)
}

export function getAppointmentById(id, options = {}) {
  const normalizedId = normalizeRequiredId(
    id,
    'de la cita',
    'INVALID_APPOINTMENT_ID',
  )

  return get(`/citas/${encodeURIComponent(normalizedId)}`, options)
}

export function getAppointmentStatuses(options = {}) {
  return get('/estados-cita', options)
}

export function checkAppointmentAvailability(availabilityData, options = {}) {
  const data =
    availabilityData &&
    typeof availabilityData === 'object' &&
    !Array.isArray(availabilityData)
      ? availabilityData
      : {}
  const employeeId = normalizeRequiredId(
    data.empleadoId,
    'del empleado',
    'INVALID_EMPLOYEE_ID',
  )
  const serviceId = normalizeRequiredId(
    data.servicioId,
    'del servicio',
    'INVALID_SERVICE_ID',
  )
  const requestBody = {
    empleadoId: Number(employeeId),
    servicioId: Number(serviceId),
    fecha: data.fecha,
    horaInicio: data.horaInicio,
    horaFin: data.horaFin,
  }

  if (Object.hasOwn(data, 'citaIdExcluir')) {
    if (data.citaIdExcluir === null) {
      requestBody.citaIdExcluir = null
    } else {
      const excludedAppointmentId = normalizeRequiredId(
        data.citaIdExcluir,
        'de la cita por excluir',
        'INVALID_EXCLUDED_APPOINTMENT_ID',
      )

      requestBody.citaIdExcluir = Number(excludedAppointmentId)
    }
  }

  return post('/citas/disponibilidad', requestBody, options)
}

export function getAvailability(availabilityData, token) {
  return checkAppointmentAvailability(availabilityData, { token })
}

export function createAppointment(appointmentData, token) {
  return post('/citas', appointmentData, { token })
}

export function updateAppointment(id, appointmentData, token) {
  const normalizedId = normalizeRequiredId(
    id,
    'de la cita',
    'INVALID_APPOINTMENT_ID',
  )

  return put(
    `/citas/${encodeURIComponent(normalizedId)}`,
    appointmentData,
    { token },
  )
}

export function cancelAppointment(id, cancellationData, token) {
  const normalizedId = normalizeRequiredId(
    id,
    'de la cita',
    'INVALID_APPOINTMENT_ID',
  )

  return patch(
    `/citas/${encodeURIComponent(normalizedId)}/cancelar`,
    { motivoCancelacion: cancellationData?.motivoCancelacion },
    { token },
  )
}

export function changeAppointmentStatus(id, statusId, token) {
  const normalizedId = normalizeRequiredId(
    id,
    'de la cita',
    'INVALID_APPOINTMENT_ID',
  )
  const normalizedStatusId = normalizeRequiredId(
    statusId,
    'del estado de la cita',
    'INVALID_APPOINTMENT_STATUS_ID',
  )

  return patch(
    `/citas/${encodeURIComponent(normalizedId)}/estado`,
    { estadoCitaId: Number(normalizedStatusId) },
    { token },
  )
}
