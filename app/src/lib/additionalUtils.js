function getTextValue(value) {
  return typeof value === 'string' ? value.trim() : ''
}

function getNumericValue(value) {
  if (value === null || value === undefined || value === '') {
    return 0
  }

  const number = Number(value)

  return Number.isFinite(number) ? number : 0
}

export function isValidAdditionalId(id) {
  return /^[1-9]\d*$/.test(String(id ?? '').trim())
}

export function filterAdditionals(additionals, searchTerm) {
  const term = getTextValue(searchTerm).toLocaleLowerCase('es-CR')

  if (!term) {
    return additionals
  }

  return additionals.filter((additional) => {
    const searchableText = [additional?.nombre, additional?.descripcion]
      .map((value) => getTextValue(value).toLocaleLowerCase('es-CR'))
      .join(' ')

    return searchableText.includes(term)
  })
}

export function sortAdditionals(additionals, sortOption) {
  const sortedAdditionals = [...additionals]
  const comparisons = {
    nameAsc: (left, right) =>
      getTextValue(left?.nombre).localeCompare(
        getTextValue(right?.nombre),
        'es',
      ),
    nameDesc: (left, right) =>
      getTextValue(right?.nombre).localeCompare(
        getTextValue(left?.nombre),
        'es',
      ),
    priceAsc: (left, right) =>
      getNumericValue(left?.precio) - getNumericValue(right?.precio),
    priceDesc: (left, right) =>
      getNumericValue(right?.precio) - getNumericValue(left?.precio),
  }

  return sortedAdditionals.sort(
    comparisons[sortOption] ?? comparisons.nameAsc,
  )
}

export function formatAdditionalPrice(price) {
  if (
    price === null ||
    price === undefined ||
    (typeof price === 'string' && !price.trim())
  ) {
    return ''
  }

  const numericPrice = Number(price)

  if (!Number.isFinite(numericPrice)) {
    return ''
  }

  return new Intl.NumberFormat('es-CR', {
    style: 'currency',
    currency: 'CRC',
  }).format(numericPrice)
}
