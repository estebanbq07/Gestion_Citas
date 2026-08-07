const TIME_PATTERN = /(?:^|T)([01]\d|2[0-3]):([0-5]\d)/
const DATE_PATTERN = /^(\d{4})-(\d{2})-(\d{2})/

const DATE_FORMATTER = new Intl.DateTimeFormat('es-CR', {
  day: 'numeric',
  month: 'long',
  year: 'numeric',
  timeZone: 'UTC',
})

export function getApiTimeKey(value) {
  if (typeof value !== 'string') {
    return ''
  }

  const match = value.trim().match(TIME_PATTERN)

  return match ? `${match[1]}:${match[2]}` : ''
}

export function formatApiTime(value) {
  return getApiTimeKey(value)
}

export function getApiDateKey(value) {
  if (typeof value !== 'string') {
    return ''
  }

  const match = value.trim().match(DATE_PATTERN)

  if (!match) {
    return ''
  }

  const year = Number(match[1])
  const month = Number(match[2])
  const day = Number(match[3])
  const date = new Date(Date.UTC(year, month - 1, day))

  if (
    date.getUTCFullYear() !== year ||
    date.getUTCMonth() !== month - 1 ||
    date.getUTCDate() !== day
  ) {
    return ''
  }

  return `${match[1]}-${match[2]}-${match[3]}`
}

export function formatApiDate(value) {
  const dateKey = getApiDateKey(value)

  if (!dateKey) {
    return ''
  }

  const [year, month, day] = dateKey.split('-').map(Number)

  return DATE_FORMATTER.format(new Date(Date.UTC(year, month - 1, day)))
}
