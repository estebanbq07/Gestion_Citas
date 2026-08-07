import { useState } from 'react'
import { CircleAlert } from 'lucide-react'
import { useNavigate } from 'react-router-dom'

import { PageHeader } from '@/components/common/PageHeader'
import { FormActions } from '@/components/forms/FormActions'
import { FormField } from '@/components/forms/FormField'
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
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
import { createService } from '@/services/servicesService'

export function CreateServicePage() {
  const navigate = useNavigate()
  const { token } = useAuth()
  const [formData, setFormData] = useState(INITIAL_SERVICE_FORM_DATA)
  const [fieldErrors, setFieldErrors] = useState({})
  const [apiError, setApiError] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)

  function handleChange(event) {
    const { name, value } = event.target
    const nextFormData = { ...formData, [name]: value }

    setFormData(nextFormData)
    setApiError('')

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

    const errors = validateServiceForm(formData)
    setFieldErrors(errors)

    if (Object.keys(errors).length) {
      return
    }

    const serviceData = {
      nombre: formData.nombre.trim(),
      descripcion: formData.descripcion.trim(),
      precioBase: Number(formData.precioBase),
      duracionMinutos: Number(formData.duracionMinutos),
      especialidadId: Number(formData.especialidadId),
    }
    const imageName = formData.imagen.trim()

    if (imageName) {
      serviceData.imagen = imageName
    }

    setApiError('')
    setIsSubmitting(true)

    try {
      const response = await createService(serviceData, token)
      const createdService = response?.data
      const successState = { successMessage: 'Servicio creado correctamente.' }

      if (createdService?.id != null) {
        navigate(`/servicios/${createdService.id}`, { replace: true, state: successState })
      } else {
        navigate('/servicios', { replace: true, state: successState })
      }
    } catch (requestError) {
      setFieldErrors(getServiceApiFieldErrors(requestError))
      setApiError(getErrorMessage(requestError))
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <section className="w-full space-y-6">
      <PageHeader title="Nuevo servicio" description="Registra la información general del servicio que se ofrecerá." />

      <Card className="mx-auto w-full max-w-3xl">
        <CardHeader>
          <CardTitle>Información del servicio</CardTitle>
          <CardDescription>Los campos marcados con * son obligatorios.</CardDescription>
        </CardHeader>
        <CardContent>
          <form className="grid gap-5" noValidate onSubmit={handleSubmit}>
            {apiError ? (
              <Alert variant="destructive">
                <CircleAlert aria-hidden="true" />
                <AlertTitle>No fue posible crear el servicio</AlertTitle>
                <AlertDescription>{apiError}</AlertDescription>
              </Alert>
            ) : null}

            <div className="grid gap-5 sm:grid-cols-2">
              <FormField className="sm:col-span-2" htmlFor="nombre" label={<>Nombre <span aria-hidden="true" className="text-destructive">*</span></>} error={fieldErrors.nombre}>
                <Input id="nombre" name="nombre" maxLength={120} value={formData.nombre} onChange={handleChange} aria-invalid={Boolean(fieldErrors.nombre)} disabled={isSubmitting} required />
              </FormField>

              <FormField htmlFor="precioBase" label={<>Precio base <span aria-hidden="true" className="text-destructive">*</span></>} error={fieldErrors.precioBase}>
                <Input id="precioBase" name="precioBase" type="number" min="0.01" max="99999999.99" step="0.01" inputMode="decimal" value={formData.precioBase} onChange={handleChange} aria-invalid={Boolean(fieldErrors.precioBase)} disabled={isSubmitting} required />
              </FormField>

              <FormField htmlFor="duracionMinutos" label={<>Duración (minutos) <span aria-hidden="true" className="text-destructive">*</span></>} error={fieldErrors.duracionMinutos}>
                <Input id="duracionMinutos" name="duracionMinutos" type="number" min="15" max="480" step="1" inputMode="numeric" value={formData.duracionMinutos} onChange={handleChange} aria-invalid={Boolean(fieldErrors.duracionMinutos)} disabled={isSubmitting} required />
              </FormField>

              <FormField htmlFor="especialidadId" label={<>ID de especialidad <span aria-hidden="true" className="text-destructive">*</span></>} error={fieldErrors.especialidadId}>
                <Input id="especialidadId" name="especialidadId" type="number" min="1" step="1" inputMode="numeric" value={formData.especialidadId} onChange={handleChange} aria-invalid={Boolean(fieldErrors.especialidadId)} disabled={isSubmitting} required />
              </FormField>

              <FormField htmlFor="imagen" label="Nombre de imagen (opcional)" description="Nombre de un archivo JPG, PNG o WEBP previamente cargado." error={fieldErrors.imagen}>
                <Input id="imagen" name="imagen" maxLength={255} placeholder="servicio-ejemplo.webp" value={formData.imagen} onChange={handleChange} aria-invalid={Boolean(fieldErrors.imagen)} disabled={isSubmitting} />
              </FormField>

              <FormField className="sm:col-span-2" htmlFor="descripcion" label={<>Descripción <span aria-hidden="true" className="text-destructive">*</span></>} error={fieldErrors.descripcion}>
                <Textarea id="descripcion" name="descripcion" maxLength={500} value={formData.descripcion} onChange={handleChange} aria-invalid={Boolean(fieldErrors.descripcion)} disabled={isSubmitting} required />
              </FormField>
            </div>

            <FormActions>
              <Button type="button" variant="outline" onClick={() => navigate('/servicios')} disabled={isSubmitting}>Cancelar</Button>
              <Button type="submit" disabled={isSubmitting}>{isSubmitting ? 'Creando servicio...' : 'Crear servicio'}</Button>
            </FormActions>
          </form>
        </CardContent>
      </Card>
    </section>
  )
}
