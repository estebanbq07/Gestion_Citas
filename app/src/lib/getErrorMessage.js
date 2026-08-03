const ERROR_MESSAGES = {
  0: 'No fue posible conectar con el servidor. Revisa tu conexión.',
  400: 'La solicitud no es válida. Revisa la información enviada.',
  401: 'Tu sesión no es válida o ha expirado.',
  403: 'No tienes permiso para realizar esta acción.',
  404: 'No se encontró el recurso solicitado.',
  409: 'La solicitud entra en conflicto con información existente.',
  422: 'No fue posible procesar la información enviada.',
  500: 'Ocurrió un error interno en el servidor.',
}

const GENERIC_ERROR_MESSAGE =
  'Ocurrió un error inesperado. Intenta nuevamente más tarde.'

export function getErrorMessage(error) {
  const responseMessage = error?.data?.message

  if (typeof responseMessage === 'string' && responseMessage.trim()) {
    return responseMessage
  }

  const status = typeof error === 'number' ? error : error?.status

  return ERROR_MESSAGES[status] ?? GENERIC_ERROR_MESSAGE
}
