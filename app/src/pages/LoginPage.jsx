import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { CircleAlert } from 'lucide-react'

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
import { FormActions } from '@/components/forms/FormActions'
import { FormField } from '@/components/forms/FormField'
import { getErrorMessage } from '@/lib/getErrorMessage'
import * as authService from '@/services/authService'

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

function validateField(name, value) {
  if (name === 'correo') {
    const correo = value.trim()

    if (!correo) {
      return 'El correo electrónico es obligatorio.'
    }

    if (!EMAIL_PATTERN.test(correo)) {
      return 'Ingresa un correo electrónico válido.'
    }

    if (correo.length > 150) {
      return 'El correo no puede superar 150 caracteres.'
    }
  }

  if (name === 'password') {
    if (!value) {
      return 'La contraseña es obligatoria.'
    }

    if (value.length > 100) {
      return 'La contraseña no puede superar 100 caracteres.'
    }
  }

  return ''
}

function validateCredentials(credentials) {
  const errors = {}

  for (const field of ['correo', 'password']) {
    const error = validateField(field, credentials[field])

    if (error) {
      errors[field] = error
    }
  }

  return errors
}

export function LoginPage() {
  const navigate = useNavigate()
  const [credentials, setCredentials] = useState({
    correo: '',
    password: '',
  })
  const [validationErrors, setValidationErrors] = useState({})
  const [apiError, setApiError] = useState('')
  const [isLoading, setIsLoading] = useState(false)

  function handleChange(event) {
    const { name, value } = event.target

    setCredentials((currentCredentials) => ({
      ...currentCredentials,
      [name]: value,
    }))

    setValidationErrors((currentErrors) => {
      if (!currentErrors[name]) {
        return currentErrors
      }

      const nextErrors = { ...currentErrors }
      const updatedError = validateField(name, value)

      if (updatedError) {
        nextErrors[name] = updatedError
      } else {
        delete nextErrors[name]
      }

      return nextErrors
    })
  }

  async function handleSubmit(event) {
    event.preventDefault()

    if (isLoading) {
      return
    }

    const errors = validateCredentials(credentials)
    setValidationErrors(errors)

    if (Object.keys(errors).length > 0) {
      return
    }

    setApiError('')
    setIsLoading(true)

    try {
      const response = await authService.login({
        correo: credentials.correo.trim(),
        password: credentials.password,
      })
      const token = response?.data?.token

      if (typeof token !== 'string' || !token) {
        throw new Error('La respuesta del servidor no contiene un token válido.')
      }

      sessionStorage.setItem('auth_token', token)
      navigate('/')
    } catch (error) {
      setApiError(getErrorMessage(error))
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <section className="flex w-full flex-1 items-center justify-center py-4 sm:py-8">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl">Iniciar sesión</CardTitle>
          <CardDescription>
            Ingresa tus credenciales para acceder al sistema de citas.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form className="grid gap-5" noValidate onSubmit={handleSubmit}>
            {apiError ? (
              <Alert variant="destructive">
                <CircleAlert aria-hidden="true" />
                <AlertTitle>No fue posible iniciar sesión</AlertTitle>
                <AlertDescription>{apiError}</AlertDescription>
              </Alert>
            ) : null}

            <FormField
              htmlFor="correo"
              label={
                <>
                  Correo electrónico
                  <span className="text-destructive" aria-hidden="true">
                    *
                  </span>
                </>
              }
              error={validationErrors.correo}
            >
              <Input
                id="correo"
                name="correo"
                type="email"
                autoComplete="email"
                value={credentials.correo}
                onChange={handleChange}
                aria-invalid={Boolean(validationErrors.correo)}
                disabled={isLoading}
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
              error={validationErrors.password}
            >
              <Input
                id="password"
                name="password"
                type="password"
                autoComplete="current-password"
                value={credentials.password}
                onChange={handleChange}
                aria-invalid={Boolean(validationErrors.password)}
                disabled={isLoading}
                required
              />
            </FormField>

            <FormActions className="pt-1">
              <Button className="w-full" type="submit" disabled={isLoading}>
                {isLoading ? 'Iniciando sesión...' : 'Iniciar sesión'}
              </Button>
            </FormActions>

            <p className="text-center text-sm text-muted-foreground">
              ¿Aún no tienes una cuenta?{' '}
              <Link
                className="font-medium text-foreground underline-offset-4 hover:underline"
                to="/registro"
              >
                Regístrate
              </Link>
            </p>
          </form>
        </CardContent>
      </Card>
    </section>
  )
}
