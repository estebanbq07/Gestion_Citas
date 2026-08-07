import { mapApiValidationErrors } from '@/lib/apiValidationUtils'
import { getErrorMessage } from '@/lib/getErrorMessage'
import { ROLES } from '@/lib/permissions'

export const INITIAL_EMPLOYEE_FORM_DATA = Object.freeze({
  usuarioId: '',
  especialidadId: '',
  codigoEmpleado: '',
  descripcion: '',
  servicioIds: Object.freeze([]),
})

export const EMPLOYEE_FORM_FIELDS = Object.freeze(
  Object.keys(INITIAL_EMPLOYEE_FORM_DATA),
)

const EMPLOYEE_CODE_PATTERN = /^[A-Za-z0-9_-]+$/

function getPositiveInteger(value) {
  const numericValue = Number(value)

  return Number.isInteger(numericValue) && numericValue > 0
    ? numericValue
    : null
}

function validateRelation(name, value, options) {
  const id = getPositiveInteger(value)

  if (id === null) {
    return name === 'usuarioId'
      ? 'Selecciona un usuario válido.'
      : 'Selecciona una especialidad válida.'
  }

  const collection = name === 'usuarioId' ? options.users : options.specialties
  const selectedItem = collection.find((item) => Number(item?.id) === id)

  if (!selectedItem) {
    return name === 'usuarioId'
      ? 'El usuario seleccionado no está disponible.'
      : 'La especialidad seleccionada no está disponible.'
  }

  if (selectedItem.activo !== true) {
    return name === 'usuarioId'
      ? 'El usuario seleccionado se encuentra inactivo.'
      : 'La especialidad seleccionada se encuentra inactiva.'
  }

  if (
    name === 'usuarioId' &&
    selectedItem?.rol?.nombre !== ROLES.EMPLOYEE
  ) {
    return 'El usuario seleccionado no tiene el rol Empleado.'
  }

  if (
    name === 'usuarioId' &&
    selectedItem.empleado &&
    Number(selectedItem.empleado.id) !== Number(options.currentEmployeeId)
  ) {
    return 'El usuario ya está asociado a otro empleado.'
  }

  return ''
}

export function validateEmployeeField(
  name,
  value,
  formData,
  options,
) {
  const normalizedValue = String(value ?? '').trim()

  if (name === 'usuarioId' || name === 'especialidadId') {
    return validateRelation(name, value, options)
  }

  if (name === 'codigoEmpleado') {
    if (!normalizedValue) return 'El código del empleado es obligatorio.'
    if (normalizedValue.length < 3) {
      return 'El código debe contener al menos 3 caracteres.'
    }
    if (normalizedValue.length > 30) {
      return 'El código no puede superar 30 caracteres.'
    }
    if (!EMPLOYEE_CODE_PATTERN.test(normalizedValue)) {
      return 'El código solo puede contener letras, números, guiones y guiones bajos.'
    }
  }

  if (name === 'descripcion' && normalizedValue) {
    if (normalizedValue.length < 3) {
      return 'La descripción debe contener al menos 3 caracteres.'
    }
    if (normalizedValue.length > 500) {
      return 'La descripción no puede superar 500 caracteres.'
    }
  }

  if (name === 'servicioIds') {
    if (!Array.isArray(value) || value.length === 0) {
      return 'Selecciona al menos un servicio.'
    }

    const ids = value.map(getPositiveInteger)

    if (ids.some((id) => id === null) || new Set(ids).size !== ids.length) {
      return 'La selección de servicios no es válida.'
    }

    const selectedSpecialtyId = getPositiveInteger(formData.especialidadId)

    for (const serviceId of ids) {
      const service = options.services.find(
        (item) => Number(item?.id) === serviceId,
      )

      if (!service) {
        return 'Uno o más servicios seleccionados no están disponibles.'
      }
      if (service.activo !== true) {
        return 'Los servicios inactivos deben retirarse antes de guardar.'
      }
      if (Number(service.especialidadId) !== selectedSpecialtyId) {
        return 'Todos los servicios deben pertenecer a la especialidad seleccionada.'
      }
    }
  }

  return ''
}

export function validateEmployeeForm(formData, options) {
  return EMPLOYEE_FORM_FIELDS.reduce((errors, field) => {
    const error = validateEmployeeField(
      field,
      formData[field],
      formData,
      options,
    )

    if (error) {
      errors[field] = error
    }

    return errors
  }, {})
}

export function getEmployeeFormData(employee) {
  return {
    usuarioId:
      employee?.usuarioId === null || employee?.usuarioId === undefined
        ? ''
        : String(employee.usuarioId),
    especialidadId:
      employee?.especialidadId === null ||
      employee?.especialidadId === undefined
        ? ''
        : String(employee.especialidadId),
    codigoEmpleado:
      typeof employee?.codigoEmpleado === 'string'
        ? employee.codigoEmpleado
        : '',
    descripcion:
      typeof employee?.descripcion === 'string' ? employee.descripcion : '',
    servicioIds: Array.isArray(employee?.servicios)
      ? employee.servicios
          .map((service) => getPositiveInteger(service?.id))
          .filter((id) => id !== null)
      : [],
  }
}

export function buildEmployeeData(formData) {
  const description = formData.descripcion.trim()

  return {
    usuarioId: Number(formData.usuarioId),
    especialidadId: Number(formData.especialidadId),
    codigoEmpleado: formData.codigoEmpleado.trim().toUpperCase(),
    descripcion: description || null,
    servicioIds: formData.servicioIds.map(Number),
  }
}

function haveSameIds(leftIds, rightIds) {
  const left = [...leftIds].map(Number).sort((a, b) => a - b)
  const right = [...rightIds].map(Number).sort((a, b) => a - b)

  return (
    left.length === right.length &&
    left.every((id, index) => id === right[index])
  )
}

export function getEmployeeChangeState(originalFormData, currentData) {
  if (!originalFormData) {
    return { detailsChanged: false, servicesChanged: false, hasChanges: false }
  }

  const originalData = buildEmployeeData(originalFormData)
  const detailsChanged = [
    'usuarioId',
    'especialidadId',
    'codigoEmpleado',
    'descripcion',
  ].some((field) => originalData[field] !== currentData[field])
  const servicesChanged = !haveSameIds(
    originalData.servicioIds,
    currentData.servicioIds,
  )

  return {
    detailsChanged,
    servicesChanged,
    hasChanges: detailsChanged || servicesChanged,
  }
}

export function getEmployeeApiErrorState(error) {
  const { fieldErrors, generalErrors } = mapApiValidationErrors(
    error,
    EMPLOYEE_FORM_FIELDS,
  )
  const message = getErrorMessage(error)

  if (!Object.keys(fieldErrors).length) {
    if (message === 'El código de empleado ya está registrado') {
      fieldErrors.codigoEmpleado = message
    } else if (
      message === 'El usuario ya está asociado a otro empleado' ||
      message.startsWith('El usuario indicado')
    ) {
      fieldErrors.usuarioId = message
    } else if (message.startsWith('La especialidad indicada')) {
      fieldErrors.especialidadId = message
    } else if (message.startsWith('Los siguientes servicios')) {
      fieldErrors.servicioIds = message
    }
  }

  const combinedMessage = [message, ...generalErrors]
    .filter((item, index, items) => items.indexOf(item) === index)
    .join(' ')

  return { fieldErrors, message: combinedMessage }
}
