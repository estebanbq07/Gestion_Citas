import { useEffect, useRef, useState } from 'react'
import { ArrowLeft } from 'lucide-react'
import { Link, useNavigate, useParams } from 'react-router-dom'

import { PageHeader } from '@/components/common/PageHeader'
import { EmptyState } from '@/components/feedback/EmptyState'
import { ErrorState } from '@/components/feedback/ErrorState'
import { LoadingState } from '@/components/feedback/LoadingState'
import { AdditionalForm } from '@/components/forms/AdditionalForm'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import {
  buildAdditionalData,
  getAdditionalApiErrorState,
  getAdditionalFormData,
  hasAdditionalChanges,
  INITIAL_ADDITIONAL_FORM_DATA,
  validateAdditionalField,
  validateAdditionalForm,
} from '@/lib/additionalFormValidation'
import { isValidAdditionalId } from '@/lib/additionalUtils'
import { getErrorMessage } from '@/lib/getErrorMessage'
import {
  getAdditionalById,
  updateAdditional,
} from '@/services/additionalsService'

const INVALID_RESPONSE_MESSAGE =
  'No fue posible obtener la información del servicio adicional.'

function getAdditionalData(response) {
  if (
    !response?.data ||
    typeof response.data !== 'object' ||
    Array.isArray(response.data)
  ) {
    throw new Error(INVALID_RESPONSE_MESSAGE)
  }

  return response.data
}

export function EditAdditionalPage() {
  const { id } = useParams()
  const navigate = useNavigate()
  const normalizedId = String(id ?? '').trim()
  const [additional, setAdditional] = useState(null)
  const [formData, setFormData] = useState(INITIAL_ADDITIONAL_FORM_DATA)
  const [originalFormData, setOriginalFormData] = useState(null)
  const [fieldErrors, setFieldErrors] = useState({})
  const [isLoading, setIsLoading] = useState(true)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [loadError, setLoadError] = useState('')
  const [apiError, setApiError] = useState('')
  const [infoMessage, setInfoMessage] = useState('')
  const [isUnavailable, setIsUnavailable] = useState(false)
  const [retryCount, setRetryCount] = useState(0)
  const isMountedRef = useRef(true)

  useEffect(() => {
    isMountedRef.current = true

    return () => {
      isMountedRef.current = false
    }
  }, [])

  useEffect(() => {
    let isActive = true

    Promise.resolve()
      .then(() => {
        if (!isActive) {
          return null
        }

        setIsLoading(true)
        setLoadError('')
        setApiError('')
        setInfoMessage('')
        setFieldErrors({})
        setAdditional(null)
        setOriginalFormData(null)
        setIsUnavailable(false)

        if (!isValidAdditionalId(normalizedId)) {
          const invalidIdError = new Error(
            'El identificador del servicio adicional no es válido.',
          )
          invalidIdError.code = 'INVALID_ADDITIONAL_ID'
          throw invalidIdError
        }

        return getAdditionalById(normalizedId)
      })
      .then((response) => {
        if (!isActive || response === null) {
          return
        }

        const loadedAdditional = getAdditionalData(response)
        const loadedFormData = getAdditionalFormData(loadedAdditional)

        setAdditional(loadedAdditional)
        setFormData(loadedFormData)
        setOriginalFormData({ ...loadedFormData })
      })
      .catch((requestError) => {
        if (!isActive) {
          return
        }

        if (requestError?.status === 404) {
          setIsUnavailable(true)
          return
        }

        setLoadError(
          requestError?.code === 'INVALID_ADDITIONAL_ID' ||
            requestError?.message === INVALID_RESPONSE_MESSAGE
            ? requestError.message
            : getErrorMessage(requestError),
        )
      })
      .finally(() => {
        if (isActive) {
          setIsLoading(false)
        }
      })

    return () => {
      isActive = false
    }
  }, [normalizedId, retryCount])

  function handleChange(event) {
    const { name, value } = event.target

    setFormData((currentFormData) => ({
      ...currentFormData,
      [name]: value,
    }))
    setApiError('')
    setInfoMessage('')

    setFieldErrors((currentErrors) => {
      if (!currentErrors[name]) {
        return currentErrors
      }

      const nextErrors = { ...currentErrors }
      const fieldError = validateAdditionalField(name, value)

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

    const errors = validateAdditionalForm(formData)
    setFieldErrors(errors)

    if (Object.keys(errors).length) {
      return
    }

    const additionalData = buildAdditionalData(formData)

    if (!hasAdditionalChanges(originalFormData, additionalData)) {
      setInfoMessage(
        'No se realizaron cambios en el servicio adicional.',
      )
      return
    }

    setIsSubmitting(true)

    try {
      await updateAdditional(normalizedId, additionalData)

      if (!isMountedRef.current) {
        return
      }

      navigate(
        `/adicionales/${encodeURIComponent(normalizedId)}`,
        {
          replace: true,
          state: {
            successMessage:
              'Servicio adicional actualizado correctamente.',
          },
        },
      )
    } catch (requestError) {
      if (!isMountedRef.current) {
        return
      }

      const { fieldErrors: apiFieldErrors, message } =
        getAdditionalApiErrorState(requestError)

      setFieldErrors(apiFieldErrors)
      setApiError(message)
    } finally {
      if (isMountedRef.current) {
        setIsSubmitting(false)
      }
    }
  }

  if (isLoading) {
    return (
      <LoadingState message="Cargando información del servicio adicional..." />
    )
  }

  if (isUnavailable) {
    return (
      <EmptyState
        title="El servicio adicional solicitado no existe o no está disponible."
        description="Puede que haya sido eliminado o que la dirección no sea correcta."
        action={
          <Button asChild type="button">
            <Link to="/adicionales">
              <ArrowLeft aria-hidden="true" />
              Volver a adicionales
            </Link>
          </Button>
        }
      />
    )
  }

  if (loadError) {
    const isInvalidId = !isValidAdditionalId(normalizedId)

    return (
      <ErrorState
        title="No fue posible cargar el servicio adicional"
        message={loadError}
        action={
          <div className="flex flex-wrap justify-center gap-2">
            {!isInvalidId ? (
              <Button
                type="button"
                onClick={() =>
                  setRetryCount((currentCount) => currentCount + 1)
                }
              >
                Intentar nuevamente
              </Button>
            ) : null}
            <Button asChild type="button" variant="outline">
              <Link to="/adicionales">
                <ArrowLeft aria-hidden="true" />
                Volver a adicionales
              </Link>
            </Button>
          </div>
        }
      />
    )
  }

  if (!additional) {
    return null
  }

  return (
    <section className="w-full space-y-6">
      <PageHeader
        title="Editar servicio adicional"
        description="Actualiza el nombre, la descripción y el precio del complemento."
      />

      {typeof additional.activo === 'boolean' ? (
        <div className="flex flex-col gap-2 rounded-lg border bg-muted/30 p-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="text-sm font-medium">Estado actual</p>
            <p className="text-xs text-muted-foreground">
              El estado se administra mediante una acción separada.
            </p>
          </div>
          <Badge variant={additional.activo ? 'default' : 'outline'}>
            {additional.activo ? 'Activo' : 'Inactivo'}
          </Badge>
        </div>
      ) : null}

      <AdditionalForm
        formData={formData}
        fieldErrors={fieldErrors}
        apiError={apiError}
        apiErrorTitle="No fue posible actualizar el servicio adicional"
        infoMessage={infoMessage}
        isSubmitting={isSubmitting}
        submitText="Guardar cambios"
        submittingText="Guardando cambios..."
        onChange={handleChange}
        onSubmit={handleSubmit}
        onCancel={() =>
          navigate(`/adicionales/${encodeURIComponent(normalizedId)}`)
        }
      />
    </section>
  )
}
