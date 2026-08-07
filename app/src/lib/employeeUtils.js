import { ROLES } from '@/lib/permissions'

function getTextValue(value) {
  return typeof value === 'string' ? value.trim() : ''
}

function getNumericId(value) {
  const numericValue = Number(value)

  return Number.isInteger(numericValue) && numericValue > 0
    ? numericValue
    : null
}

function compareText(left, right) {
  return getTextValue(left).localeCompare(getTextValue(right), 'es')
}

export function isValidEmployeeId(id) {
  return /^[1-9]\d*$/.test(String(id ?? '').trim())
}

export function getUserFullName(user) {
  return [user?.nombre, user?.primerApellido, user?.segundoApellido]
    .map(getTextValue)
    .filter(Boolean)
    .join(' ')
}

export function getEmployeeFullName(employee) {
  return getUserFullName(employee?.usuario) || 'Empleado'
}

export function filterEmployees(employees, searchTerm) {
  const term = getTextValue(searchTerm).toLocaleLowerCase('es-CR')

  if (!term) {
    return employees
  }

  return employees.filter((employee) => {
    const searchableText = [
      employee?.codigoEmpleado,
      employee?.usuario?.nombre,
      employee?.usuario?.primerApellido,
      employee?.usuario?.segundoApellido,
      employee?.especialidad?.nombre,
    ]
      .map((value) => getTextValue(value).toLocaleLowerCase('es-CR'))
      .join(' ')

    return searchableText.includes(term)
  })
}

export function sortEmployees(employees, sortOption) {
  const sortedEmployees = [...employees]
  const comparisons = {
    nameAsc: (left, right) =>
      compareText(getEmployeeFullName(left), getEmployeeFullName(right)),
    nameDesc: (left, right) =>
      compareText(getEmployeeFullName(right), getEmployeeFullName(left)),
    codeAsc: (left, right) =>
      compareText(left?.codigoEmpleado, right?.codigoEmpleado),
    codeDesc: (left, right) =>
      compareText(right?.codigoEmpleado, left?.codigoEmpleado),
    specialtyAsc: (left, right) =>
      compareText(left?.especialidad?.nombre, right?.especialidad?.nombre),
  }

  return sortedEmployees.sort(
    comparisons[sortOption] ?? comparisons.nameAsc,
  )
}

export function getEligibleEmployeeUsers(users, currentEmployee = null) {
  const currentEmployeeId = getNumericId(currentEmployee?.id)
  const currentUser = currentEmployee?.usuario
  const candidates = users.filter((user) => {
    const userId = getNumericId(user?.id)
    const relatedEmployeeId = getNumericId(user?.empleado?.id)

    return (
      userId !== null &&
      user?.activo === true &&
      user?.rol?.nombre === ROLES.EMPLOYEE &&
      (relatedEmployeeId === null || relatedEmployeeId === currentEmployeeId)
    )
  })

  if (
    currentUser &&
    getNumericId(currentUser.id) !== null &&
    !candidates.some((user) => user.id === currentUser.id)
  ) {
    candidates.push(currentUser)
  }

  return candidates.sort((left, right) =>
    compareText(getUserFullName(left), getUserFullName(right)),
  )
}

export function mergeEmployeeServices(activeServices, assignedServices = []) {
  const servicesById = new Map()

  for (const service of [...assignedServices, ...activeServices]) {
    const id = getNumericId(service?.id)

    if (id !== null) {
      servicesById.set(id, service)
    }
  }

  return [...servicesById.values()].sort((left, right) =>
    compareText(left?.nombre, right?.nombre),
  )
}

export function getEmployeeSpecialties(services, currentEmployee = null) {
  const specialtiesById = new Map()

  for (const service of services) {
    const specialty = service?.especialidad
    const specialtyId = getNumericId(specialty?.id)

    if (specialtyId !== null && specialty?.activo === true) {
      specialtiesById.set(specialtyId, specialty)
    }
  }

  const currentSpecialty = currentEmployee?.especialidad
  const currentSpecialtyId = getNumericId(currentSpecialty?.id)

  if (
    currentSpecialtyId !== null &&
    !specialtiesById.has(currentSpecialtyId)
  ) {
    specialtiesById.set(currentSpecialtyId, currentSpecialty)
  }

  return [...specialtiesById.values()].sort((left, right) =>
    compareText(left?.nombre, right?.nombre),
  )
}

export function getServicesForSpecialty(
  services,
  specialtyId,
  selectedIds = [],
) {
  const normalizedSpecialtyId = getNumericId(specialtyId)
  const selectedIdSet = new Set(
    (Array.isArray(selectedIds) ? selectedIds : [])
      .map(getNumericId)
      .filter((id) => id !== null),
  )

  if (normalizedSpecialtyId === null) {
    return services.filter((service) =>
      selectedIdSet.has(getNumericId(service?.id)),
    )
  }

  return services.filter(
    (service) =>
      getNumericId(service?.especialidadId) === normalizedSpecialtyId ||
      selectedIdSet.has(getNumericId(service?.id)),
  )
}
