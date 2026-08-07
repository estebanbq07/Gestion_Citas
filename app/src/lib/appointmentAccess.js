import {
  isAppointmentInRoleScope,
  isValidAppointmentId,
} from '@/lib/appointmentUtils'
import { ROLES } from '@/lib/permissions'
import {
  getAppointmentById,
  getAppointmentsByClient,
  getAppointmentsByEmployee,
} from '@/services/appointmentsService'

const INVALID_SCOPE_RESPONSE_MESSAGE =
  'No fue posible verificar el acceso a la cita.'
const INVALID_APPOINTMENT_RESPONSE_MESSAGE =
  'No fue posible obtener la información de la cita.'
const FORBIDDEN_APPOINTMENT_MESSAGE =
  'No tienes permiso para consultar esta cita.'

function createAccessError(message, code) {
  const error = new Error(message)
  error.code = code

  return error
}

function normalizePositiveId(value, message, code) {
  const normalizedId = String(value ?? '').trim()

  if (!isValidAppointmentId(normalizedId)) {
    throw createAccessError(message, code)
  }

  return normalizedId
}

function getRequestOptions(token, options) {
  return { ...options, token }
}

export async function verifyAppointmentAccess(
  appointmentId,
  roleName,
  user,
  token,
  options = {},
) {
  const normalizedAppointmentId = normalizePositiveId(
    appointmentId,
    'El identificador de la cita no es válido.',
    'INVALID_APPOINTMENT_ID',
  )

  if (roleName === ROLES.ADMIN) {
    return true
  }

  let response

  if (roleName === ROLES.EMPLOYEE) {
    const employeeId = normalizePositiveId(
      user?.empleado?.id,
      'Tu usuario no tiene un empleado válido asociado.',
      'INVALID_CURRENT_EMPLOYEE',
    )

    response = await getAppointmentsByEmployee(
      employeeId,
      getRequestOptions(token, options),
    )
  } else if (roleName === ROLES.CLIENT) {
    const clientId = normalizePositiveId(
      user?.id,
      'No fue posible identificar al cliente autenticado.',
      'INVALID_CURRENT_CLIENT',
    )

    response = await getAppointmentsByClient(
      clientId,
      getRequestOptions(token, options),
    )
  } else {
    throw createAccessError(
      FORBIDDEN_APPOINTMENT_MESSAGE,
      'FORBIDDEN_APPOINTMENT',
    )
  }

  if (!Array.isArray(response?.data)) {
    throw createAccessError(
      INVALID_SCOPE_RESPONSE_MESSAGE,
      'INVALID_SCOPE_RESPONSE',
    )
  }

  const numericAppointmentId = Number(normalizedAppointmentId)
  const isIncluded = response.data.some(
    (appointment) => Number(appointment?.id) === numericAppointmentId,
  )

  if (!isIncluded) {
    throw createAccessError(
      FORBIDDEN_APPOINTMENT_MESSAGE,
      'FORBIDDEN_APPOINTMENT',
    )
  }

  return true
}

export async function loadScopedAppointment(
  appointmentId,
  roleName,
  user,
  token,
  options = {},
) {
  const normalizedAppointmentId = normalizePositiveId(
    appointmentId,
    'El identificador de la cita no es válido.',
    'INVALID_APPOINTMENT_ID',
  )

  await verifyAppointmentAccess(
    normalizedAppointmentId,
    roleName,
    user,
    token,
    options,
  )

  const response = await getAppointmentById(
    normalizedAppointmentId,
    getRequestOptions(token, options),
  )
  const appointment = response?.data

  if (
    !appointment ||
    typeof appointment !== 'object' ||
    Array.isArray(appointment)
  ) {
    throw createAccessError(
      INVALID_APPOINTMENT_RESPONSE_MESSAGE,
      'INVALID_APPOINTMENT_RESPONSE',
    )
  }

  if (!isAppointmentInRoleScope(appointment, roleName, user)) {
    throw createAccessError(
      FORBIDDEN_APPOINTMENT_MESSAGE,
      'FORBIDDEN_APPOINTMENT',
    )
  }

  return appointment
}
