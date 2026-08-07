// Coincide con la validación práctica de correo utilizada por z.email() en el API.
export const EMAIL_PATTERN = /^(?!\.)(?!.*\.\.)([A-Za-z0-9_'+.-]*)[A-Za-z0-9_+-]@([A-Za-z0-9][A-Za-z0-9-]*\.)+[A-Za-z]{2,}$/
