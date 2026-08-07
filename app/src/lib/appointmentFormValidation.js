import { mapApiValidationErrors } from '@/lib/apiValidationUtils'
import { getApiDateKey } from '@/lib/dateTimeUtils'
import { getErrorMessage } from '@/lib/getErrorMessage'

const API_FIELDS = [
  'clienteId',
  'empleadoId',
  'servicioId',
  'estadoCitaId',
  'creadoPorUsuarioId',
  'fecha',
  'horaInicio',
  'horaFin',
  'duracionMinutos',
  'precioServicio',
  'costoAdicionales',
  'costoTotal',
  'observaciones',
  'adicionalIds',
]

const TIME_PATTERN = /^([01]\d|2[0-3]):[0-5]\d$/

export const INITIAL_APPOINTMENT_FORM_DATA = Object.freeze({
  clienteId: '',
  servicioId: '',
  empleadoId: '',
  adicionalIds: Object.freeze([]),
  fecha: '',
  horaInicio: '',
  observaciones: '',
})

function getPositiveInteger(value) {
  const number = Number(value)

  return Number.isInteger(number) && number > 0 ? number : null
}

function hasEntity(collection, id, predicate = () => true) {
  return (
    id !== null &&
    collection.some(
      (item) => getPositiveInteger(item?.id) === id && predicate(item),
    )
  )
}

function isValidMoney(value, { allowZero = false } = {}) {
  const number = Number(value)

  return (
    Number.isFinite(number) &&
    (allowZero ? number >= 0 : number > 0) &&
    number <= 99999999.99
  )
}

export function validateAppointmentForm(formData, context) {
  const errors = {}
  const clientId = getPositiveInteger(formData.clienteId)
  const serviceId = getPositiveInteger(formData.servicioId)
  const employeeId = getPositiveInteger(formData.empleadoId)
  const userId = getPositiveInteger(context.userId)
  const initialStatusId = getPositiveInteger(context.initialStatusId)
  const clients = Array.isArray(context.clients) ? context.clients : []
  const services = Array.isArray(context.services) ? context.services : []
  const employees = Array.isArray(context.employees) ? context.employees : []
  const additionals = Array.isArray(context.additionals)
    ? context.additionals
    : []
  const rawAdditionalIds = Array.isArray(formData.adicionalIds)
    ? formData.adicionalIds
    : []
  const selectedAdditionalIds = rawAdditionalIds
    .map(getPositiveInteger)
    .filter((id) => id !== null)
  const uniqueAdditionalIds = [...new Set(selectedAdditionalIds)]

  if (clientId === null) {
    errors.clienteId = 'Selecciona un cliente válido.'
  } else if (context.showClientSelector) {
    if (
      !hasEntity(
        clients,
        clientId,
        (client) =>
          client?.activo === true &&
          client?.rol?.nombre === 'Cliente' &&
          client?.rol?.activo === true,
      )
    ) {
      errors.clienteId = 'El cliente seleccionado no está disponible.'
    }
  } else if (clientId !== userId) {
    errors.clienteId = 'La cita debe registrarse para tu propia cuenta.'
  }

  if (serviceId === null) {
    errors.servicioId = 'Selecciona un servicio principal.'
  } else if (
    !hasEntity(services, serviceId, (service) => service?.activo === true)
  ) {
    errors.servicioId = 'El servicio seleccionado no está disponible.'
  }

  if (employeeId === null) {
    errors.empleadoId = 'Selecciona un empleado.'
  } else if (
    !hasEntity(
      employees,
      employeeId,
      (employee) => employee?.activo === true && employee?.usuario?.activo === true,
    )
  ) {
    errors.empleadoId =
      'El empleado seleccionado no está disponible para este servicio.'
  }

  const dateKey = getApiDateKey(formData.fecha)

  if (!dateKey) {
    errors.fecha = 'Selecciona una fecha válida.'
  } else if (dateKey < context.minimumDate) {
    errors.fecha = 'La fecha no puede ser pasada.'
  }

  if (!TIME_PATTERN.test(formData.horaInicio)) {
    errors.horaInicio = 'Selecciona una hora válida en formato HH:mm.'
  } else if (!context.estimate?.endTime) {
    errors.horaInicio =
      'La duración del servicio no puede extenderse más allá del día seleccionado.'
  } else if (
    context.schedulesLoaded &&
    Array.isArray(context.schedulesForDate) &&
    context.schedulesForDate.length === 0
  ) {
    errors.horaInicio = 'El establecimiento no atiende en la fecha seleccionada.'
  } else if (
    context.schedulesLoaded &&
    context.isWithinSchedule === false
  ) {
    errors.horaInicio =
      'Selecciona un intervalo completo dentro del horario de atención.'
  } else if (context.availabilityStatus !== 'available') {
    errors.horaInicio =
      context.availabilityStatus === 'checking'
        ? 'Espera a que finalice la consulta de disponibilidad.'
        : 'Selecciona y confirma un horario disponible.'
  }

  if (selectedAdditionalIds.length !== rawAdditionalIds.length) {
    errors.adicionalIds =
      'Uno de los identificadores de servicios adicionales no es válido.'
  } else if (selectedAdditionalIds.length !== uniqueAdditionalIds.length) {
    errors.adicionalIds = 'No se permiten servicios adicionales duplicados.'
  } else if (
    uniqueAdditionalIds.some(
      (id) =>
        !hasEntity(
          additionals,
          id,
          (additional) => additional?.activo === true,
        ),
    )
  ) {
    errors.adicionalIds =
      'Uno de los servicios adicionales seleccionados no está disponible.'
  }

  const observations = formData.observaciones.trim()

  if (observations && observations.length < 3) {
    errors.observaciones =
      'Las observaciones deben contener al menos 3 caracteres.'
  } else if (observations.length > 500) {
    errors.observaciones =
      'Las observaciones no pueden superar 500 caracteres.'
  }

  if (userId === null) {
    errors._form = 'No fue posible identificar al usuario autenticado.'
  } else if (initialStatusId === null) {
    errors._form =
      'No está disponible el estado inicial Pendiente para registrar la cita.'
  } else if (
    !Number.isInteger(Number(context.estimate?.durationMinutes)) ||
    Number(context.estimate.durationMinutes) <= 0 ||
    Number(context.estimate.durationMinutes) > 1440
  ) {
    errors.servicioId = 'La duración del servicio no es válida.'
  } else if (!isValidMoney(context.estimate?.servicePrice)) {
    errors.servicioId = 'El precio del servicio no es válido.'
  } else if (
    !isValidMoney(context.estimate?.additionalCost, { allowZero: true }) ||
    !isValidMoney(context.estimate?.total)
  ) {
    errors.adicionalIds = 'El costo estimado de la cita no es válido.'
  }

  return errors
}

export function buildAppointmentData(formData, context) {
  return {
    clienteId: Number(formData.clienteId),
    empleadoId: Number(formData.empleadoId),
    servicioId: Number(formData.servicioId),
    estadoCitaId: Number(context.initialStatusId),
    creadoPorUsuarioId: Number(context.userId),
    fecha: formData.fecha,
    horaInicio: formData.horaInicio,
    horaFin: context.estimate.endTime,
    duracionMinutos: Number(context.estimate.durationMinutes),
    precioServicio: Number(context.estimate.servicePrice),
    costoAdicionales: Number(context.estimate.additionalCost),
    costoTotal: Number(context.estimate.total),
    observaciones: formData.observaciones.trim() || null,
    adicionalIds: formData.adicionalIds.map(Number),
  }
}

export function getAppointmentApiErrorState(error) {
  const mappedErrors = mapApiValidationErrors(error, API_FIELDS)
  const fieldErrors = {}
  const fieldAliases = {
    horaFin: 'horaInicio',
    duracionMinutos: 'servicioId',
    precioServicio: 'servicioId',
    costoAdicionales: 'adicionalIds',
    costoTotal: 'adicionalIds',
  }

  for (const [field, message] of Object.entries(mappedErrors.fieldErrors)) {
    const targetField = fieldAliases[field] ?? field

    if (['estadoCitaId', 'creadoPorUsuarioId'].includes(targetField)) {
      mappedErrors.generalErrors.push(message)
    } else if (!fieldErrors[targetField]) {
      fieldErrors[targetField] = message
    }
  }

  return {
    fieldErrors,
    apiError: mappedErrors.generalErrors.length
      ? mappedErrors.generalErrors.join(' ')
      : getErrorMessage(error),
  }
}
