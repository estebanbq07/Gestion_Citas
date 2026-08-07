export const INITIAL_SERVICE_FORM_DATA = Object.freeze({
  nombre: '',
  descripcion: '',
  precioBase: '',
  duracionMinutos: '',
  especialidadId: '',
  imagen: '',
})

const SERVICE_FORM_FIELDS = Object.freeze(
  Object.keys(INITIAL_SERVICE_FORM_DATA),
)

const IMAGE_NAME_PATTERN = /^[a-zA-Z0-9._-]+\.(jpg|jpeg|png|webp)$/i

export function validateServiceField(name, value) {
  const normalizedValue = String(value).trim()

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

  if (name === 'precioBase') {
    const price = Number(normalizedValue)

    if (!normalizedValue) return 'El precio es obligatorio.'
    if (!Number.isFinite(price)) return 'El precio debe ser un número válido.'
    if (price <= 0) return 'El precio debe ser mayor a cero.'
    if (price > 99999999.99) {
      return 'El precio no puede superar 99,999,999.99.'
    }
  }

  if (name === 'duracionMinutos') {
    const duration = Number(normalizedValue)

    if (!normalizedValue) return 'La duración es obligatoria.'
    if (!Number.isInteger(duration)) {
      return 'La duración debe ser un número entero.'
    }
    if (duration < 15) return 'La duración mínima es de 15 minutos.'
    if (duration > 480) return 'La duración no puede superar 8 horas.'
  }

  if (name === 'especialidadId') {
    const specialtyId = Number(normalizedValue)

    if (!normalizedValue) {
      return 'El identificador de especialidad es obligatorio.'
    }
    if (!Number.isInteger(specialtyId) || specialtyId <= 0) {
      return 'Ingresa un identificador de especialidad válido.'
    }
  }

  if (name === 'imagen' && normalizedValue) {
    if (normalizedValue.length > 255) {
      return 'El nombre de la imagen no puede superar 255 caracteres.'
    }
    if (!IMAGE_NAME_PATTERN.test(normalizedValue)) {
      return 'El nombre de la imagen debe corresponder a un archivo JPG, PNG o WEBP.'
    }
  }

  return ''
}

export function validateServiceForm(formData) {
  return SERVICE_FORM_FIELDS.reduce((errors, field) => {
    const error = validateServiceField(field, formData[field])

    if (error) {
      errors[field] = error
    }

    return errors
  }, {})
}

export function getServiceApiFieldErrors(error) {
  const validationErrors = error?.data?.validationErrors

  if (!Array.isArray(validationErrors)) {
    return {}
  }

  return validationErrors.reduce((errors, validationError) => {
    const field = validationError?.field?.split('.')[0]
    const message = validationError?.message

    if (
      Object.hasOwn(INITIAL_SERVICE_FORM_DATA, field) &&
      typeof message === 'string' &&
      message.trim()
    ) {
      errors[field] = message
    }

    return errors
  }, {})
}
