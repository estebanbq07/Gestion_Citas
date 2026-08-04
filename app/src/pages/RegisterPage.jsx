import { useState } from 'react'
import { Link, Navigate, useNavigate } from 'react-router-dom'
import { CircleAlert, CircleCheck } from 'lucide-react'

import { FormActions } from '@/components/forms/FormActions'
import { FormField } from '@/components/forms/FormField'
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import { Button } from '@/components/ui/button'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { useAuth } from '@/context/useAuth'
import { getErrorMessage } from '@/lib/getErrorMessage'
import * as authService from '@/services/authService'

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
const PHONE_PATTERN = /^[0-9+\-()\s]+$/

const INITIAL_FORM_DATA = Object.freeze({
  nombre: '',
  primerApellido: '',
  segundoApellido: '',
  correo: '',
  telefono: '',
  password: '',
  confirmarPassword: '',
})

const FORM_FIELDS = Object.freeze(Object.keys(INITIAL_FORM_DATA))

function validatePersonName(value, fieldName) {
  const normalizedValue = value.trim()

  if (!normalizedValue) {
    return `${fieldName} es obligatorio.`
  }

  if (normalizedValue.length < 2) {
    return `${fieldName} debe contener al menos 2 caracteres.`
  }

  if (normalizedValue.length > 100) {
    return `${fieldName} no puede superar 100 caracteres.`
  }

  return ''
}

function validateField(name, value, formData) {
  if (name === 'nombre') {
    return validatePersonName(value, 'El nombre')
  }

  if (name === 'primerApellido') {
    return validatePersonName(value, 'El primer apellido')
  }

  if (name === 'segundoApellido') {
    const segundoApellido = value.trim()

    if (segundoApellido && segundoApellido.length < 2) {
      return 'El segundo apellido debe contener al menos 2 caracteres.'
    }

    if (segundoApellido.length > 100) {
      return 'El segundo apellido no puede superar 100 caracteres.'
    }
  }

  if (name === 'correo') {
    const correo = value.trim()

    if (!correo) {
      return 'El correo electrónico es obligatorio.'
    }

    if (correo.length > 150) {
      return 'El correo no puede superar 150 caracteres.'
    }

    if (!EMAIL_PATTERN.test(correo)) {
      return 'Ingresa un correo electrónico válido.'
    }
  }

  if (name === 'telefono') {
    const telefono = value.trim()

    if (telefono && telefono.length < 8) {
      return 'El teléfono debe contener al menos 8 caracteres.'
    }

    if (telefono.length > 25) {
      return 'El teléfono no puede superar 25 caracteres.'
    }

    if (telefono && !PHONE_PATTERN.test(telefono)) {
      return 'El teléfono contiene caracteres no permitidos.'
    }
  }

  if (name === 'password') {
    if (!value) {
      return 'La contraseña es obligatoria.'
    }

    if (value.length < 8) {
      return 'La contraseña debe tener al menos 8 caracteres.'
    }

    if (value.length > 100) {
      return 'La contraseña no puede superar 100 caracteres.'
    }

    if (!/[A-Z]/.test(value)) {
      return 'La contraseña debe contener al menos una letra mayúscula.'
    }

    if (!/[a-z]/.test(value)) {
      return 'La contraseña debe contener al menos una letra minúscula.'
    }

    if (!/[0-9]/.test(value)) {
      return 'La contraseña debe contener al menos un número.'
    }
  }

  if (name === 'confirmarPassword') {
    if (!value) {
      return 'La confirmación de contraseña es obligatoria.'
    }

    if (value !== formData.password) {
      return 'Las contraseñas no coinciden.'
    }
  }

  return ''
}

function validateForm(formData) {
  const errors = {}

  for (const field of FORM_FIELDS) {
    const error = validateField(field, formData[field], formData)

    if (error) {
      errors[field] = error
    }
  }

  return errors
}

function getApiFieldErrors(error) {
  const validationErrors = error?.data?.validationErrors

  if (!Array.isArray(validationErrors)) {
    return {}
  }

  return validationErrors.reduce((errors, validationError) => {
    const field = validationError?.field?.split('.')[0]
    const message = validationError?.message

    if (
      Object.hasOwn(INITIAL_FORM_DATA, field) &&
      typeof message === 'string' &&
      message.trim()
    ) {
      errors[field] = message
    }

    return errors
  }, {})
}

export function RegisterPage() {
  const navigate = useNavigate()
  const { isAuthenticated } = useAuth()
  const [formData, setFormData] = useState(INITIAL_FORM_DATA)
  const [fieldErrors, setFieldErrors] = useState({})
  const [apiError, setApiError] = useState('')
  const [successMessage, setSuccessMessage] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)

  if (isAuthenticated && !isSubmitting) {
    return <Navigate to="/" replace />
  }

  function handleChange(event) {
    const { name, value } = event.target
    const nextFormData = { ...formData, [name]: value }

    setFormData(nextFormData)
    setApiError('')
    setSuccessMessage('')
    setFieldErrors((currentErrors) => {
      const fieldsToUpdate = [name]

      if (name === 'password' && currentErrors.confirmarPassword) {
        fieldsToUpdate.push('confirmarPassword')
      }

      if (!fieldsToUpdate.some((field) => currentErrors[field])) {
        return currentErrors
      }

      const nextErrors = { ...currentErrors }

      for (const field of fieldsToUpdate) {
        if (!currentErrors[field]) {
          continue
        }

        const updatedError = validateField(
          field,
          nextFormData[field],
          nextFormData,
        )

        if (updatedError) {
          nextErrors[field] = updatedError
        } else {
          delete nextErrors[field]
        }
      }

      return nextErrors
    })
  }

  async function handleSubmit(event) {
    event.preventDefault()

    if (isSubmitting) {
      return
    }

    const errors = validateForm(formData)
    setFieldErrors(errors)

    if (Object.keys(errors).length > 0) {
      return
    }

    setApiError('')
    setSuccessMessage('')
    setIsSubmitting(true)

    try {
      const response = await authService.registerClient({
        nombre: formData.nombre.trim(),
        primerApellido: formData.primerApellido.trim(),
        segundoApellido: formData.segundoApellido.trim() || null,
        correo: formData.correo.trim(),
        telefono: formData.telefono.trim() || null,
        password: formData.password,
      })
      const message = response?.message || 'Cliente registrado correctamente.'

      setSuccessMessage(message)
      navigate('/login', {
        replace: true,
        state: { registrationSuccess: true },
      })
    } catch (error) {
      setFieldErrors(getApiFieldErrors(error))
      setApiError(getErrorMessage(error))
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <section className="flex w-full flex-1 items-center justify-center py-4 sm:py-8">
      <Card className="w-full max-w-2xl">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl">Crear cuenta</CardTitle>
          <CardDescription>
            Registra tus datos para acceder al sistema como cliente.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form className="grid gap-5" noValidate onSubmit={handleSubmit}>
            {apiError ? (
              <Alert variant="destructive">
                <CircleAlert aria-hidden="true" />
                <AlertTitle>No fue posible completar el registro</AlertTitle>
                <AlertDescription>{apiError}</AlertDescription>
              </Alert>
            ) : null}

            {successMessage ? (
              <Alert>
                <CircleCheck aria-hidden="true" />
                <AlertTitle>Registro completado</AlertTitle>
                <AlertDescription>{successMessage}</AlertDescription>
              </Alert>
            ) : null}

            <div className="grid gap-5 sm:grid-cols-2">
              <FormField
                htmlFor="nombre"
                label={
                  <>
                    Nombre
                    <span className="text-destructive" aria-hidden="true">
                      *
                    </span>
                  </>
                }
                error={fieldErrors.nombre}
              >
                <Input
                  id="nombre"
                  name="nombre"
                  autoComplete="given-name"
                  maxLength={100}
                  value={formData.nombre}
                  onChange={handleChange}
                  aria-invalid={Boolean(fieldErrors.nombre)}
                  disabled={isSubmitting}
                  required
                />
              </FormField>

              <FormField
                htmlFor="primerApellido"
                label={
                  <>
                    Primer apellido
                    <span className="text-destructive" aria-hidden="true">
                      *
                    </span>
                  </>
                }
                error={fieldErrors.primerApellido}
              >
                <Input
                  id="primerApellido"
                  name="primerApellido"
                  autoComplete="family-name"
                  maxLength={100}
                  value={formData.primerApellido}
                  onChange={handleChange}
                  aria-invalid={Boolean(fieldErrors.primerApellido)}
                  disabled={isSubmitting}
                  required
                />
              </FormField>

              <FormField
                htmlFor="segundoApellido"
                label="Segundo apellido (opcional)"
                error={fieldErrors.segundoApellido}
              >
                <Input
                  id="segundoApellido"
                  name="segundoApellido"
                  autoComplete="additional-name"
                  maxLength={100}
                  value={formData.segundoApellido}
                  onChange={handleChange}
                  aria-invalid={Boolean(fieldErrors.segundoApellido)}
                  disabled={isSubmitting}
                />
              </FormField>

              <FormField
                htmlFor="telefono"
                label="Teléfono (opcional)"
                error={fieldErrors.telefono}
              >
                <Input
                  id="telefono"
                  name="telefono"
                  type="tel"
                  autoComplete="tel"
                  maxLength={25}
                  value={formData.telefono}
                  onChange={handleChange}
                  aria-invalid={Boolean(fieldErrors.telefono)}
                  disabled={isSubmitting}
                />
              </FormField>

              <FormField
                className="sm:col-span-2"
                htmlFor="correo"
                label={
                  <>
                    Correo electrónico
                    <span className="text-destructive" aria-hidden="true">
                      *
                    </span>
                  </>
                }
                error={fieldErrors.correo}
              >
                <Input
                  id="correo"
                  name="correo"
                  type="email"
                  autoComplete="email"
                  maxLength={150}
                  value={formData.correo}
                  onChange={handleChange}
                  aria-invalid={Boolean(fieldErrors.correo)}
                  disabled={isSubmitting}
                  required
                />
              </FormField>

              <FormField
                htmlFor="password"
                label={
                  <>
                    Contraseña
                    <span className="text-destructive" aria-hidden="true">
                      *
                    </span>
                  </>
                }
                description="Mínimo 8 caracteres, con mayúscula, minúscula y número."
                error={fieldErrors.password}
              >
                <Input
                  id="password"
                  name="password"
                  type="password"
                  autoComplete="new-password"
                  maxLength={100}
                  value={formData.password}
                  onChange={handleChange}
                  aria-invalid={Boolean(fieldErrors.password)}
                  disabled={isSubmitting}
                  required
                />
              </FormField>

              <FormField
                htmlFor="confirmarPassword"
                label={
                  <>
                    Confirmar contraseña
                    <span className="text-destructive" aria-hidden="true">
                      *
                    </span>
                  </>
                }
                error={fieldErrors.confirmarPassword}
              >
                <Input
                  id="confirmarPassword"
                  name="confirmarPassword"
                  type="password"
                  autoComplete="new-password"
                  maxLength={100}
                  value={formData.confirmarPassword}
                  onChange={handleChange}
                  aria-invalid={Boolean(fieldErrors.confirmarPassword)}
                  disabled={isSubmitting}
                  required
                />
              </FormField>
            </div>

            <FormActions className="pt-1">
              <Button
                className="w-full"
                type="submit"
                disabled={isSubmitting}
              >
                {isSubmitting ? 'Registrando...' : 'Crear cuenta'}
              </Button>
            </FormActions>

            <p className="text-center text-sm text-muted-foreground">
              ¿Ya tienes una cuenta?{' '}
              <Link
                className="font-medium text-foreground underline-offset-4 hover:underline"
                to="/login"
              >
                Inicia sesión
              </Link>
            </p>
          </form>
        </CardContent>
      </Card>
    </section>
  )
}
