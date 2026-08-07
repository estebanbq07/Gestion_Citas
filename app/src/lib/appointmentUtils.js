import {
  formatApiDate,
  formatApiTime,
  getApiDateKey,
  getApiTimeKey,
} from '@/lib/dateTimeUtils'
import { getUserFullName } from '@/lib/employeeUtils'
import {
  formatServiceDuration,
  formatServicePrice,
} from '@/lib/serviceUtils'

export const APPOINTMENT_STATUS_NAMES = Object.freeze({
  PENDING: 'Pendiente',
  CONFIRMED: 'Confirmada',
  IN_PROGRESS: 'En proceso',
  FINALIZED: 'Finalizada',
  CANCELED: 'Cancelada',
})

export const INITIAL_APPOINTMENT_STATUS = APPOINTMENT_STATUS_NAMES.PENDING

export const APPOINTMENT_SORT_OPTIONS = Object.freeze({
  DATE_DESC: 'dateDesc',
  DATE_ASC: 'dateAsc',
})

function getTextValue(value) {
  return typeof value === 'string' ? value.trim() : ''
}

function normalizeSearchValue(value) {
  return getTextValue(value).toLocaleLowerCase('es-CR')
}

function getPositiveInteger(value) {
  const normalizedValue = String(value ?? '').trim()

  if (!/^[1-9]\d*$/.test(normalizedValue)) {
    return null
  }

  const numericValue = Number(normalizedValue)

  return Number.isSafeInteger(numericValue) ? numericValue : null
}

function getNonNegativeNumber(value) {
  if (value === null || value === undefined || value === '') {
    return 0
  }

  const numericValue = Number(value)

  return Number.isFinite(numericValue) && numericValue >= 0
    ? numericValue
    : 0
}

function roundCurrency(value) {
  return Math.round((value + Number.EPSILON) * 100) / 100
}

function getTimeMinutes(value) {
  const timeKey = getApiTimeKey(value)

  if (!timeKey) {
    return null
  }

  const [hours, minutes] = timeKey.split(':').map(Number)

  return hours * 60 + minutes
}

function getAppointmentDateTimeKey(appointment) {
  const dateKey = getApiDateKey(appointment?.fecha)

  if (!dateKey) {
    return ''
  }

  const timeKey = getApiTimeKey(appointment?.horaInicio) || '00:00'

  return `${dateKey}T${timeKey}`
}

function getRelatedUser(relation) {
  if (!relation || typeof relation !== 'object') {
    return null
  }

  return relation.usuario && typeof relation.usuario === 'object'
    ? relation.usuario
    : relation
}

export function isValidAppointmentId(value) {
  return getPositiveInteger(value) !== null
}

export function getAppointmentClientName(appointment) {
  return getUserFullName(getRelatedUser(appointment?.cliente))
}

export function getAppointmentEmployeeName(appointment) {
  return getUserFullName(getRelatedUser(appointment?.empleado))
}

export function getAppointmentServiceName(appointment) {
  return getTextValue(appointment?.servicio?.nombre)
}

export function getAppointmentStatusName(appointment) {
  return getTextValue(appointment?.estadoCita?.nombre)
}

export function formatAppointmentDate(value) {
  return formatApiDate(value)
}

export function formatAppointmentTimeRange(appointment) {
  const startTime = formatApiTime(appointment?.horaInicio)
  const endTime = formatApiTime(appointment?.horaFin)

  return startTime && endTime ? `${startTime} – ${endTime}` : ''
}

export function formatAppointmentDuration(value) {
  return formatServiceDuration(value)
}

export function formatAppointmentPrice(value) {
  return formatServicePrice(value)
}

export function filterAppointments(
  appointments,
  { searchTerm = '', statusFilter = '', dateFilter = '' } = {},
) {
  const items = Array.isArray(appointments) ? appointments : []
  const normalizedSearchTerm = normalizeSearchValue(searchTerm)
  const normalizedDateFilter = getApiDateKey(dateFilter)
  const statusId = getPositiveInteger(statusFilter)
  const normalizedStatusName = statusId
    ? ''
    : normalizeSearchValue(statusFilter === 'all' ? '' : statusFilter)

  return items.filter((appointment) => {
    if (normalizedSearchTerm) {
      const searchableText = [
        getAppointmentServiceName(appointment),
        getAppointmentClientName(appointment),
        getAppointmentEmployeeName(appointment),
        getAppointmentStatusName(appointment),
        appointment?.observaciones,
        appointment?.motivoCancelacion,
      ]
        .map(normalizeSearchValue)
        .join(' ')

      if (!searchableText.includes(normalizedSearchTerm)) {
        return false
      }
    }

    if (statusId !== null) {
      const appointmentStatusId = getPositiveInteger(
        appointment?.estadoCitaId ?? appointment?.estadoCita?.id,
      )

      if (appointmentStatusId !== statusId) {
        return false
      }
    } else if (
      normalizedStatusName &&
      normalizeSearchValue(getAppointmentStatusName(appointment)) !==
        normalizedStatusName
    ) {
      return false
    }

    return (
      !normalizedDateFilter ||
      getApiDateKey(appointment?.fecha) === normalizedDateFilter
    )
  })
}

export function sortAppointments(
  appointments,
  sortOption = APPOINTMENT_SORT_OPTIONS.DATE_DESC,
) {
  const items = Array.isArray(appointments) ? [...appointments] : []
  const direction =
    sortOption === APPOINTMENT_SORT_OPTIONS.DATE_ASC ? 1 : -1

  return items.sort((firstAppointment, secondAppointment) => {
    const firstKey = getAppointmentDateTimeKey(firstAppointment)
    const secondKey = getAppointmentDateTimeKey(secondAppointment)

    if (!firstKey && !secondKey) {
      return 0
    }

    if (!firstKey) {
      return 1
    }

    if (!secondKey) {
      return -1
    }

    return firstKey.localeCompare(secondKey) * direction
  })
}

export function calculateAppointmentEstimate(
  service,
  additionals,
  selectedIds,
) {
  const durationValue = Number(service?.duracionMinutos)
  const durationMinutes =
    Number.isInteger(durationValue) && durationValue > 0 ? durationValue : 0
  const servicePrice = roundCurrency(
    getNonNegativeNumber(service?.precioBase),
  )
  const selectedIdSet = new Set(
    (Array.isArray(selectedIds) ? selectedIds : [])
      .map(getPositiveInteger)
      .filter((id) => id !== null),
  )
  const additionalCost = roundCurrency(
    (Array.isArray(additionals) ? additionals : []).reduce(
      (total, additional) =>
        selectedIdSet.has(getPositiveInteger(additional?.id))
          ? total + getNonNegativeNumber(additional?.precio)
          : total,
      0,
    ),
  )

  return {
    durationMinutes,
    servicePrice,
    additionalCost,
    total: roundCurrency(servicePrice + additionalCost),
  }
}

export function addMinutesToTime(time, duration) {
  const startMinutes = getTimeMinutes(time)
  const durationValue = Number(duration)

  if (
    startMinutes === null ||
    !Number.isInteger(durationValue) ||
    durationValue <= 0
  ) {
    return ''
  }

  const endMinutes = startMinutes + durationValue

  if (endMinutes >= 24 * 60) {
    return ''
  }

  const hours = Math.floor(endMinutes / 60)
  const minutes = endMinutes % 60

  return `${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}`
}

export function getTodayDateKey(date = new Date()) {
  if (!(date instanceof Date) || Number.isNaN(date.getTime())) {
    return ''
  }

  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const day = String(date.getDate()).padStart(2, '0')

  return `${year}-${month}-${day}`
}

export function getSchedulesForDate(schedules, date) {
  const dateKey = getApiDateKey(date)

  if (!dateKey || !Array.isArray(schedules)) {
    return []
  }

  const [year, month, day] = dateKey.split('-').map(Number)
  const weekDay = new Date(Date.UTC(year, month - 1, day)).getUTCDay()
  const dayOrder = weekDay === 0 ? 7 : weekDay

  return schedules
    .filter(
      (schedule) =>
        schedule?.activo === true &&
        Number(schedule?.diaSemana?.numeroOrden) === dayOrder,
    )
    .sort((firstSchedule, secondSchedule) =>
      getApiTimeKey(firstSchedule?.horaInicio).localeCompare(
        getApiTimeKey(secondSchedule?.horaInicio),
      ),
    )
}

export function isIntervalWithinSchedules(startTime, endTime, schedules) {
  const startMinutes = getTimeMinutes(startTime)
  const endMinutes = getTimeMinutes(endTime)

  if (
    startMinutes === null ||
    endMinutes === null ||
    startMinutes >= endMinutes ||
    !Array.isArray(schedules)
  ) {
    return false
  }

  return schedules.some((schedule) => {
    if (schedule?.activo !== true) {
      return false
    }

    const scheduleStart = getTimeMinutes(schedule?.horaInicio)
    const scheduleEnd = getTimeMinutes(schedule?.horaFin)

    return (
      scheduleStart !== null &&
      scheduleEnd !== null &&
      startMinutes >= scheduleStart &&
      endMinutes <= scheduleEnd
    )
  })
}
