export function mapApiValidationErrors(error, allowedFields) {
  const validationErrors = error?.data?.validationErrors
  const allowedFieldSet = new Set(allowedFields)
  const fieldErrors = {}
  const generalErrors = []

  if (!Array.isArray(validationErrors)) {
    return { fieldErrors, generalErrors }
  }

  for (const validationError of validationErrors) {
    const message = validationError?.message

    if (typeof message !== 'string' || !message.trim()) {
      continue
    }

    const fieldPath =
      typeof validationError?.field === 'string'
        ? validationError.field.split('.')
        : []
    const field = fieldPath.find((segment) => allowedFieldSet.has(segment))
    const normalizedMessage = message.trim()

    if (field) {
      if (!fieldErrors[field]) {
        fieldErrors[field] = normalizedMessage
      }
    } else if (!generalErrors.includes(normalizedMessage)) {
      generalErrors.push(normalizedMessage)
    }
  }

  return { fieldErrors, generalErrors }
}
