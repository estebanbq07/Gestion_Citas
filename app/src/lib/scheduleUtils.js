import { getApiTimeKey } from '@/lib/dateTimeUtils'

export const SCHEDULE_SORT_OPTIONS = Object.freeze({
  DAY_AND_TIME: 'dayAndTime',
  OPENING_TIME: 'openingTime',
})

export function isValidScheduleId(value) {
  const normalizedValue = String(value ?? '').trim()

  if (!/^\d+$/.test(normalizedValue)) {
    return false
  }

  const numericValue = Number(normalizedValue)

  return Number.isSafeInteger(numericValue) && numericValue > 0
}

export function getScheduleDayName(schedule) {
  const dayName = schedule?.diaSemana?.nombre

  return typeof dayName === 'string' ? dayName.trim() : ''
}

export function getScheduleDayOrder(schedule) {
  const dayOrder = Number(schedule?.diaSemana?.numeroOrden)

  return Number.isInteger(dayOrder) && dayOrder > 0
    ? dayOrder
    : Number.POSITIVE_INFINITY
}

function compareText(firstValue, secondValue) {
  if (!firstValue && !secondValue) {
    return 0
  }

  if (!firstValue) {
    return 1
  }

  if (!secondValue) {
    return -1
  }

  return firstValue.localeCompare(secondValue, 'es', {
    numeric: true,
    sensitivity: 'base',
  })
}

function compareByDayAndTime(firstSchedule, secondSchedule) {
  const firstDayOrder = getScheduleDayOrder(firstSchedule)
  const secondDayOrder = getScheduleDayOrder(secondSchedule)

  if (firstDayOrder !== secondDayOrder) {
    return firstDayOrder < secondDayOrder ? -1 : 1
  }

  const dayNameDifference = compareText(
    getScheduleDayName(firstSchedule),
    getScheduleDayName(secondSchedule),
  )

  if (dayNameDifference !== 0) {
    return dayNameDifference
  }

  return compareText(
    getApiTimeKey(firstSchedule?.horaInicio),
    getApiTimeKey(secondSchedule?.horaInicio),
  )
}

function compareByOpeningTime(firstSchedule, secondSchedule) {
  const timeDifference = compareText(
    getApiTimeKey(firstSchedule?.horaInicio),
    getApiTimeKey(secondSchedule?.horaInicio),
  )

  return timeDifference || compareByDayAndTime(firstSchedule, secondSchedule)
}

export function sortSchedules(
  schedules,
  sortOption = SCHEDULE_SORT_OPTIONS.DAY_AND_TIME,
) {
  if (!Array.isArray(schedules)) {
    return []
  }

  const sortedSchedules = [...schedules]
  const compareSchedules =
    sortOption === SCHEDULE_SORT_OPTIONS.OPENING_TIME
      ? compareByOpeningTime
      : compareByDayAndTime

  return sortedSchedules.sort(compareSchedules)
}
