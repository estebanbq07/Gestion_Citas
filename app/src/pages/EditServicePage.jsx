import { useEffect, useState } from 'react'
import { ArrowLeft, CircleAlert, Info } from 'lucide-react'
import { Link, useNavigate, useParams } from 'react-router-dom'

import { PageHeader } from '@/components/common/PageHeader'
import { EmptyState } from '@/components/feedback/EmptyState'
import { ErrorState } from '@/components/feedback/ErrorState'
import { LoadingState } from '@/components/feedback/LoadingState'
import { FormActions } from '@/components/forms/FormActions'
import { FormField } from '@/components/forms/FormField'
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { useAuth } from '@/context/useAuth'
import { getErrorMessage } from '@/lib/getErrorMessage'
import {
  getServiceApiFieldErrors,
  INITIAL_SERVICE_FORM_DATA,
  validateServiceField,
  validateServiceForm,
} from '@/lib/serviceFormValidation'
import { getServiceById, updateService } from '@/services/servicesService'

const EDITABLE_FIELDS = Object.freeze([
  'nombre',
  'descripcion',
  'precioBase',
  'duracionMinutos',
  'especialidadId',
  'imagen',
])

function normalizeServiceId(id) {
  return String(id ?? '').trim()
}

function isValidServiceId(id) {
  return /^[1-9]\d*$/.test(normalizeServiceId(id))
}

function getFormDataFromService(service) {
  return {
    nombre: typeof service?.nombre === 'string' ? service.nombre : '',
    descripcion:
      typeof service?.descripcion === 'string' ? service.descripcion : '',
    precioBase:
      service?.precioBase === null || service?.precioBase === undefined
        ? ''
        : String(service.precioBase),
    duracionMinutos:
      service?.duracionMinutos === null ||
      service?.duracionMinutos === undefined
        ? ''
        : String(service.duracionMinutos),
    especialidadId:
      service?.especialidadId === null || service?.especialidadId === undefined
        ? ''
        : String(service.especialidadId),
    imagen: typeof service?.imagen === 'string' ? service.imagen : '',
  }
}

function buildServiceData(formData) {
  const imageName = formData.imagen.trim()

  return {
    nombre: formData.nombre.trim(),
    descripcion: formData.descripcion.trim(),
    precioBase: Number(formData.precioBase),
    duracionMinutos: Number(formData.duracionMinutos),
    especialidadId: Number(formData.especialidadId),
    imagen: imageName || null,
  }
}

function hasEditableChanges(originalFormData, currentServiceData) {
  if (!originalFormData) {
    return false
  }

  const originalServiceData = buildServiceData(originalFormData)

  return EDITABLE_FIELDS.some(
    (field) => originalServiceData[field] !== currentServiceData[field],
  )
}

export function EditServicePage() {
  const { id } = useParams()
  const navigate = useNavigate()
  const { token } = useAuth()
  const [formData, setFormData] = useState(INITIAL_SERVICE_FORM_DATA)
  const [originalFormData, setOriginalFormData] = useState(null)
  const [fieldErrors, setFieldErrors] = useState({})
  const [isLoading, setIsLoading] = useState(true)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [loadError, setLoadError] = useState('')
  const [apiError, setApiError] = useState('')
  const [infoMessage, setInfoMessage] = useState('')
  const [isUnavailable, setIsUnavailable] = useState(false)
  const [service, setService] = useState(null)
  const [retryCount, setRetryCount] = useState(0)
  const normalizedId = normalizeServiceId(id)

  useEffect(() => {
    let isActive = true

    async function loadService() {
      setIsLoading(true)
      setLoadError('')
      setApiError('')
      setInfoMessage('')
      setFieldErrors({})
      setIsUnavailable(false)
      setService(null)
      setOriginalFormData(null)

      if (!isValidServiceId(id)) {
        setLoadError('El identificador del servicio no es válido.')
        setIsLoading(false)
        return
      }

      try {
        const response = await getServiceById(normalizedId, { token })

        if (!isActive) {
          return
        }

        if (!response?.data || typeof response.data !== 'object') {
          throw new Error(
            'No fue posible obtener la información del servicio.',
          )
        }

        const loadedFormData = getFormDataFromService(response.data)

        setFormData(loadedFormData)
        setOriginalFormData({ ...loadedFormData })
        setService(response.data)
      } catch (requestError) {
        if (!isActive) {
          return
        }

        if (requestError?.status === 404) {
          setIsUnavailable(true)
          return
        }

        setLoadError(
          requestError?.code === 'INVALID_SERVICE_ID' ||
            requestError?.message ===
              'No fue posible obtener la información del servicio.'
            ? requestError.message
            : getErrorMessage(requestError),
        )
      } finally {
        if (isActive) {
          setIsLoading(false)
        }
      }
    }

    loadService()

    return () => {
      isActive = false
    }
  }, [id, normalizedId, retryCount, token])

  function handleChange(event) {
    const { name, value } = event.target

    setFormData((currentFormData) => ({
      ...currentFormData,
      [name]: value,
    }))
    setApiError('')
    setInfoMessage('')

    if (!fieldErrors[name]) {
      return
    }

    const fieldError = validateServiceField(name, value)

    setFieldErrors((currentErrors) => {
      if (!currentErrors[name]) {
        return currentErrors
      }

      const nextErrors = { ...currentErrors }

      if (fieldError) {
        nextErrors[name] = fieldError
      } else {
        delete nextErrors[name]
      }

      return nextErrors
    })
  }

  async function handleSubmit(event) {
    event.preventDefault()

    if (isSubmitting) {
      return
    }

    setApiError('')
    setInfoMessage('')

    const errors = validateServiceForm(formData)
    setFieldErrors(errors)

    if (Object.keys(errors).length) {
      return
    }

    const serviceData = buildServiceData(formData)

    if (!hasEditableChanges(originalFormData, serviceData)) {
      setInfoMessage('No se realizaron cambios en el servicio.')
      return
    }

    setIsSubmitting(true)

    try {
      await updateService(normalizedId, serviceData, token)
      navigate(`/servicios/${encodeURIComponent(normalizedId)}`, {
        replace: true,
        state: { successMessage: 'Servicio actualizado correctamente.' },
      })
    } catch (requestError) {
      setFieldErrors(getServiceApiFieldErrors(requestError))
      setApiError(getErrorMessage(requestError))
    } finally {
      setIsSubmitting(false)
    }
  }

  if (isLoading) {
    return (
      <LoadingState message="Cargando información del servicio..." />
    )
  }

  if (isUnavailable) {
    return (
      <EmptyState
        title="El servicio solicitado no existe"
        description="Puede que haya sido eliminado o que la dirección no sea correcta."
        action={
          <Button asChild type="button">
            <Link to="/servicios">
              <ArrowLeft aria-hidden="true" />
              Volver a servicios
            </Link>
          </Button>
        }
      />
    )
  }

  if (loadError) {
    return (
      <ErrorState
        title="No fue posible cargar el servicio"
        message={loadError}
        action={
          <div className="flex flex-wrap justify-center gap-2">
            <Button
              type="button"
              onClick={() =>
                setRetryCount((currentCount) => currentCount + 1)
              }
            >
              Intentar nuevamente
            </Button>
            <Button asChild type="button" variant="outline">
              <Link to="/servicios">
                <ArrowLeft aria-hidden="true" />
                Volver a servicios
              </Link>
            </Button>
          </div>
        }
      />
    )
  }

  if (!service) {
    return null
  }

  return (
    <section className="w-full space-y-6">
      <PageHeader
        title="Editar servicio"
        description="Actualiza los datos generales del servicio."
      />

      <Card className="mx-auto w-full max-w-3xl">
        <CardHeader>
          <CardTitle>Información del servicio</CardTitle>
          <CardDescription>
            Los campos marcados con * son obligatorios.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form className="grid gap-5" noValidate onSubmit={handleSubmit}>
            {apiError ? (
              <Alert variant="destructive">
                <CircleAlert aria-hidden="true" />
                <AlertTitle>No fue posible actualizar el servicio</AlertTitle>
                <AlertDescription>{apiError}</AlertDescription>
              </Alert>
            ) : null}

            {infoMessage ? (
              <Alert>
                <Info aria-hidden="true" />
                <AlertTitle>Sin cambios pendientes</AlertTitle>
                <AlertDescription>{infoMessage}</AlertDescription>
              </Alert>
            ) : null}

            {typeof service.activo === 'boolean' ? (
              <div className="flex flex-col gap-2 rounded-lg border bg-muted/30 p-4 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <p className="text-sm font-medium">Estado actual</p>
                  <p className="text-xs text-muted-foreground">
                    El estado se administra mediante una acción separada.
                  </p>
                </div>
                <Badge variant={service.activo ? 'default' : 'outline'}>
                  {service.activo ? 'Activo' : 'Inactivo'}
                </Badge>
              </div>
            ) : null}

            <div className="grid gap-5 sm:grid-cols-2">
              <FormField
                className="sm:col-span-2"
                htmlFor="nombre"
                label={
                  <>
                    Nombre{' '}
                    <span aria-hidden="true" className="text-destructive">
                      *
                    </span>
                  </>
                }
                error={fieldErrors.nombre}
              >
                <Input
                  id="nombre"
                  name="nombre"
                  maxLength={120}
                  value={formData.nombre}
                  onChange={handleChange}
                  aria-invalid={Boolean(fieldErrors.nombre)}
                  disabled={isSubmitting}
                  required
                />
              </FormField>

              <FormField
                htmlFor="precioBase"
                label={
                  <>
                    Precio base{' '}
                    <span aria-hidden="true" className="text-destructive">
                      *
                    </span>
                  </>
                }
                error={fieldErrors.precioBase}
              >
                <Input
                  id="precioBase"
                  name="precioBase"
                  type="number"
                  min="0.01"
                  max="99999999.99"
                  step="0.01"
                  inputMode="decimal"
                  value={formData.precioBase}
                  onChange={handleChange}
                  aria-invalid={Boolean(fieldErrors.precioBase)}
                  disabled={isSubmitting}
                  required
                />
              </FormField>

              <FormField
                htmlFor="duracionMinutos"
                label={
                  <>
                    Duración (minutos){' '}
                    <span aria-hidden="true" className="text-destructive">
                      *
                    </span>
                  </>
                }
                error={fieldErrors.duracionMinutos}
              >
                <Input
                  id="duracionMinutos"
                  name="duracionMinutos"
                  type="number"
                  min="15"
                  max="480"
                  step="1"
                  inputMode="numeric"
                  value={formData.duracionMinutos}
                  onChange={handleChange}
                  aria-invalid={Boolean(fieldErrors.duracionMinutos)}
                  disabled={isSubmitting}
                  required
                />
              </FormField>

              <FormField
                htmlFor="especialidadId"
                label={
                  <>
                    ID de especialidad{' '}
                    <span aria-hidden="true" className="text-destructive">
                      *
                    </span>
                  </>
                }
                error={fieldErrors.especialidadId}
              >
                <Input
                  id="especialidadId"
                  name="especialidadId"
                  type="number"
                  min="1"
                  step="1"
                  inputMode="numeric"
                  value={formData.especialidadId}
                  onChange={handleChange}
                  aria-invalid={Boolean(fieldErrors.especialidadId)}
                  disabled={isSubmitting}
                  required
                />
              </FormField>

              <FormField
                htmlFor="imagen"
                label="Nombre de imagen (opcional)"
                description="Nombre de un archivo JPG, PNG o WEBP previamente cargado. Déjalo vacío para dejar el servicio sin imagen."
                error={fieldErrors.imagen}
              >
                <Input
                  id="imagen"
                  name="imagen"
                  maxLength={255}
                  placeholder="servicio-ejemplo.webp"
                  value={formData.imagen}
                  onChange={handleChange}
                  aria-invalid={Boolean(fieldErrors.imagen)}
                  disabled={isSubmitting}
                />
              </FormField>

              <FormField
                className="sm:col-span-2"
                htmlFor="descripcion"
                label={
                  <>
                    Descripción{' '}
                    <span aria-hidden="true" className="text-destructive">
                      *
                    </span>
                  </>
                }
                error={fieldErrors.descripcion}
              >
                <Textarea
                  id="descripcion"
                  name="descripcion"
                  maxLength={500}
                  value={formData.descripcion}
                  onChange={handleChange}
                  aria-invalid={Boolean(fieldErrors.descripcion)}
                  disabled={isSubmitting}
                  required
                />
              </FormField>
            </div>

            <FormActions>
              <Button
                type="button"
                variant="outline"
                onClick={() =>
                  navigate(`/servicios/${encodeURIComponent(normalizedId)}`)
                }
                disabled={isSubmitting}
              >
                Cancelar
              </Button>
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting ? 'Guardando cambios...' : 'Guardar cambios'}
              </Button>
            </FormActions>
          </form>
        </CardContent>
      </Card>
    </section>
  )
}
