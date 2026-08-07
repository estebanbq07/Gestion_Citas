import { mapApiValidationErrors } from '@/lib/apiValidationUtils'
import { getErrorMessage } from '@/lib/getErrorMessage'

export const INITIAL_ADDITIONAL_FORM_DATA = Object.freeze({
  nombre: '',
  descripcion: '',
  precio: '',
})

export const ADDITIONAL_FORM_FIELDS = Object.freeze(
  Object.keys(INITIAL_ADDITIONAL_FORM_DATA),
)

export function validateAdditionalField(name, value) {
  const normalizedValue = String(value ?? '').trim()

  if (name === 'nombre') {
    if (!normalizedValue) return 'El nombre es obligatorio.'
    if (normalizedValue.length < 3) {
      return 'El nombre debe contener al menos 3 caracteres.'
    }
    if (normalizedValue.length > 120) {
      return 'El nombre no puede superar 120 caracteres.'
    }
  }

  if (name === 'descripcion') {
    if (!normalizedValue) return 'La descripción es obligatoria.'
    if (normalizedValue.length < 10) {
      return 'La descripción debe contener al menos 10 caracteres.'
    }
    if (normalizedValue.length > 500) {
      return 'La descripción no puede superar 500 caracteres.'
    }
  }

  if (name === 'precio') {
    const price = Number(normalizedValue)

    if (!normalizedValue) return 'El precio es obligatorio.'
    if (!Number.isFinite(price)) {
      return 'El precio debe ser un número válido.'
    }
    if (price < 0) {
      return 'El precio debe ser mayor o igual a cero.'
    }
    if (price > 99999999.99) {
      return 'El precio no puede superar 99,999,999.99.'
    }
  }

  return ''
}

export function validateAdditionalForm(formData) {
  return ADDITIONAL_FORM_FIELDS.reduce((errors, field) => {
    const error = validateAdditionalField(field, formData[field])

    if (error) {
      errors[field] = error
    }

    return errors
  }, {})
}

export function getAdditionalFormData(additional) {
  return {
    nombre:
      typeof additional?.nombre === 'string' ? additional.nombre : '',
    descripcion:
      typeof additional?.descripcion === 'string'
        ? additional.descripcion
        : '',
    precio:
      additional?.precio === null || additional?.precio === undefined
        ? ''
        : String(additional.precio),
  }
}

export function buildAdditionalData(formData) {
  return {
    nombre: formData.nombre.trim(),
    descripcion: formData.descripcion.trim(),
    precio: Number(formData.precio),
  }
}

export function hasAdditionalChanges(originalFormData, currentData) {
  if (!originalFormData) {
    return false
  }

  const originalData = buildAdditionalData(originalFormData)

  return ADDITIONAL_FORM_FIELDS.some(
    (field) => originalData[field] !== currentData[field],
  )
}

export function getAdditionalApiValidationErrors(error) {
  return mapApiValidationErrors(error, ADDITIONAL_FORM_FIELDS)
}

export function getAdditionalApiErrorState(error) {
  const { fieldErrors, generalErrors } =
    getAdditionalApiValidationErrors(error)
  const message = [getErrorMessage(error), ...generalErrors]
    .filter((item, index, items) => items.indexOf(item) === index)
    .join(' ')

  return { fieldErrors, message }
}
