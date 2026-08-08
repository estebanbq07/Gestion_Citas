import { useEffect, useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'

import { PageHeader } from '@/components/common/PageHeader'
import { AdditionalForm } from '@/components/forms/AdditionalForm'
import {
  buildAdditionalData,
  getAdditionalApiErrorState,
  INITIAL_ADDITIONAL_FORM_DATA,
  validateAdditionalField,
  validateAdditionalForm,
} from '@/lib/additionalFormValidation'
import { isValidAdditionalId } from '@/lib/additionalUtils'
import { createAdditional } from '@/services/additionalsService'

export function CreateAdditionalPage() {
  const navigate = useNavigate()
  const [formData, setFormData] = useState(INITIAL_ADDITIONAL_FORM_DATA)
  const [fieldErrors, setFieldErrors] = useState({})
  const [apiError, setApiError] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const isMountedRef = useRef(true)
  const submittingRef = useRef(false)

  useEffect(() => {
    isMountedRef.current = true

    return () => {
      isMountedRef.current = false
    }
  }, [])

  function handleChange(event) {
    const { name, value } = event.target

    setFormData((currentFormData) => ({
      ...currentFormData,
      [name]: value,
    }))
    setApiError('')

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

    if (isSubmitting || submittingRef.current) {
      return
    }

    const errors = validateAdditionalForm(formData)
    setFieldErrors(errors)

    if (Object.keys(errors).length) {
      return
    }

    setApiError('')
    submittingRef.current = true
    setIsSubmitting(true)

    try {
      const response = await createAdditional(buildAdditionalData(formData))
      const createdId = response?.data?.id
      const successState = {
        successMessage: 'Servicio adicional creado correctamente.',
      }

      if (!isMountedRef.current) {
        return
      }

      if (isValidAdditionalId(createdId)) {
        navigate(
          `/adicionales/${encodeURIComponent(String(createdId))}`,
          { replace: true, state: successState },
        )
      } else {
        navigate('/adicionales', { replace: true, state: successState })
      }
    } catch (requestError) {
      if (!isMountedRef.current) {
        return
      }

      const { fieldErrors: apiFieldErrors, message } =
        getAdditionalApiErrorState(requestError)

      setFieldErrors(apiFieldErrors)
      setApiError(message)
    } finally {
      submittingRef.current = false

      if (isMountedRef.current) {
        setIsSubmitting(false)
      }
    }
  }

  return (
    <section className="w-full space-y-6">
      <PageHeader
        title="Nuevo servicio adicional"
        description="Registra un complemento que aumentará el costo de una cita."
      />

      <AdditionalForm
        formData={formData}
        fieldErrors={fieldErrors}
        apiError={apiError}
        apiErrorTitle="No fue posible crear el servicio adicional"
        isSubmitting={isSubmitting}
        submitText="Crear adicional"
        submittingText="Creando adicional..."
        onChange={handleChange}
        onSubmit={handleSubmit}
        onCancel={() => navigate('/adicionales')}
      />
    </section>
  )
}
