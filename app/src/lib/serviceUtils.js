function getTextValue(value) {
  return typeof value === 'string' ? value.trim() : ''
}

function getNumericValue(value) {
  const number = Number(value)
  return Number.isFinite(number) ? number : 0
}

export function filterServices(services, searchTerm) {
  const term = getTextValue(searchTerm).toLocaleLowerCase('es-CR')

  if (!term) {
    return services
  }

  return services.filter((service) => {
    const searchableText = [service?.nombre, service?.descripcion]
      .map((value) => getTextValue(value).toLocaleLowerCase('es-CR'))
      .join(' ')

    return searchableText.includes(term)
  })
}

export function sortServices(services, sortOption) {
  const sortedServices = [...services]

  const comparisons = {
    nameAsc: (left, right) =>
      getTextValue(left?.nombre).localeCompare(getTextValue(right?.nombre), 'es'),
    nameDesc: (left, right) =>
      getTextValue(right?.nombre).localeCompare(getTextValue(left?.nombre), 'es'),
    priceAsc: (left, right) =>
      getNumericValue(left?.precioBase) - getNumericValue(right?.precioBase),
    priceDesc: (left, right) =>
      getNumericValue(right?.precioBase) - getNumericValue(left?.precioBase),
    durationAsc: (left, right) =>
      getNumericValue(left?.duracionMinutos) - getNumericValue(right?.duracionMinutos),
    durationDesc: (left, right) =>
      getNumericValue(right?.duracionMinutos) - getNumericValue(left?.duracionMinutos),
  }

  return sortedServices.sort(comparisons[sortOption] ?? comparisons.nameAsc)
}

export function formatServicePrice(price) {
  const numericPrice = Number(price)

  if (!Number.isFinite(numericPrice)) {
    return ''
  }

  return new Intl.NumberFormat('es-CR', {
    style: 'currency',
    currency: 'CRC',
  }).format(numericPrice)
}

export function formatServiceDuration(durationMinutes) {
  const minutes = Number(durationMinutes)

  if (!Number.isInteger(minutes) || minutes < 0) {
    return ''
  }

  const hours = Math.floor(minutes / 60)
  const remainingMinutes = minutes % 60
  const parts = []

  if (hours) {
    parts.push(`${hours} ${hours === 1 ? 'hora' : 'horas'}`)
  }

  if (remainingMinutes || !parts.length) {
    parts.push(`${remainingMinutes} minutos`)
  }

  return parts.join(' ')
}
