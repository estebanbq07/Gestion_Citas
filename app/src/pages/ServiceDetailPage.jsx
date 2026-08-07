import { useEffect, useState } from 'react'
import {
  ArrowLeft,
  CircleAlert,
  CircleCheck,
  Pencil,
  Power,
  PowerOff,
} from 'lucide-react'
import { Link, useLocation, useNavigate, useParams } from 'react-router-dom'

import { PageHeader } from '@/components/common/PageHeader'
import { ServiceDetail } from '@/components/data-display/ServiceDetail'
import { EmptyState } from '@/components/feedback/EmptyState'
import { ErrorState } from '@/components/feedback/ErrorState'
import { LoadingState } from '@/components/feedback/LoadingState'
import { ConfirmDialog } from '@/components/modals/ConfirmDialog'
import { Button } from '@/components/ui/button'
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import { useAuth } from '@/context/useAuth'
import { getErrorMessage } from '@/lib/getErrorMessage'
import { ROLES } from '@/lib/permissions'
import {
  changeServiceStatus,
  getServiceById,
} from '@/services/servicesService'

function getServiceData(response) {
  if (!response?.data || typeof response.data !== 'object') {
    throw new Error('No fue posible obtener la información del servicio.')
  }

  return response.data
}

export function ServiceDetailPage() {
  const { id } = useParams()
  const location = useLocation()
  const navigate = useNavigate()
  const { role, token } = useAuth()
  const [service, setService] = useState(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState('')
  const [isUnavailable, setIsUnavailable] = useState(false)
  const [retryCount, setRetryCount] = useState(0)
  const [successMessage, setSuccessMessage] = useState(() => {
    const message = location.state?.successMessage

    return typeof message === 'string' ? message.trim() : ''
  })
  const [statusError, setStatusError] = useState('')
  const [isStatusDialogOpen, setIsStatusDialogOpen] = useState(false)
  const [isUpdatingStatus, setIsUpdatingStatus] = useState(false)

  useEffect(() => {
    if (typeof successMessage === 'string' && successMessage.trim()) {
      navigate(location.pathname, { replace: true, state: null })
    }
  }, [location.pathname, navigate, successMessage])

  useEffect(() => {
    let isActive = true

    Promise.resolve()
      .then(() => {
        if (!isActive) {
          return null
        }

        setIsLoading(true)
        setError('')
        setService(null)
        setIsUnavailable(false)

        return getServiceById(id)
      })
      .then((response) => {
        if (!isActive || response === null) {
          return
        }

        setService(getServiceData(response))
      })
      .catch((requestError) => {
        if (!isActive) {
          return
        }

        if (requestError?.status === 404) {
          setIsUnavailable(true)
          return
        }

        setError(
          requestError?.code === 'INVALID_SERVICE_ID'
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
  }, [id, retryCount])

  function openStatusDialog() {
    if (
      role?.nombre !== ROLES.ADMIN ||
      typeof service?.activo !== 'boolean' ||
      isUpdatingStatus
    ) {
      return
    }

    setStatusError('')
    setSuccessMessage('')
    setIsStatusDialogOpen(true)
  }

  function closeStatusDialog() {
    if (!isUpdatingStatus) {
      setIsStatusDialogOpen(false)
    }
  }

  async function handleStatusChange() {
    if (
      role?.nombre !== ROLES.ADMIN ||
      isUpdatingStatus ||
      !service ||
      typeof service.activo !== 'boolean'
    ) {
      return
    }

    const nextStatus = !service.activo

    setStatusError('')
    setIsUpdatingStatus(true)

    try {
      const statusResponse = await changeServiceStatus(
        service.id ?? id,
        nextStatus,
        token,
      )
      let updatedService =
        statusResponse?.data && typeof statusResponse.data === 'object'
          ? statusResponse.data
          : null

      try {
        const refreshedResponse = await getServiceById(service.id ?? id, {
          token,
        })

        updatedService = getServiceData(refreshedResponse)
      } catch (refreshError) {
        if (!updatedService) {
          throw refreshError
        }
      }

      setService(updatedService)
      setIsStatusDialogOpen(false)
      setSuccessMessage(
        nextStatus
          ? 'Servicio activado correctamente.'
          : 'Servicio desactivado correctamente.',
      )
    } catch (requestError) {
      setIsStatusDialogOpen(false)
      setStatusError(getErrorMessage(requestError))
    } finally {
      setIsUpdatingStatus(false)
    }
  }

  if (isLoading) {
    return <LoadingState message="Cargando servicio..." />
  }

  if (isUnavailable) {
    return (
      <EmptyState
        title="El servicio solicitado no existe o no está disponible"
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

  if (error) {
    return (
      <ErrorState
        title="No fue posible cargar el servicio"
        message={error}
        action={
          <div className="flex flex-wrap justify-center gap-2">
            <Button
              type="button"
              onClick={() => setRetryCount((currentCount) => currentCount + 1)}
              disabled={isLoading}
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
        title="Detalle del servicio"
        description="Consulta la información general y disponibilidad del servicio."
        actions={
          <div className="flex flex-wrap gap-2">
            {role?.nombre === ROLES.ADMIN ? (
              <>
                <Button asChild type="button">
                  <Link
                    to={`/servicios/${encodeURIComponent(String(service.id ?? id))}/editar`}
                  >
                    <Pencil aria-hidden="true" />
                    Editar servicio
                  </Link>
                </Button>
                {typeof service.activo === 'boolean' ? (
                  <Button
                    type="button"
                    variant={service.activo ? 'destructive' : 'outline'}
                    onClick={openStatusDialog}
                    disabled={isUpdatingStatus}
                  >
                    {service.activo ? (
                      <PowerOff aria-hidden="true" />
                    ) : (
                      <Power aria-hidden="true" />
                    )}
                    {service.activo
                      ? 'Desactivar servicio'
                      : 'Activar servicio'}
                  </Button>
                ) : null}
              </>
            ) : null}
            <Button asChild type="button" variant="outline">
              <Link to="/servicios">
                <ArrowLeft aria-hidden="true" />
                Volver a servicios
              </Link>
            </Button>
          </div>
        }
      />
      {successMessage ? (
        <Alert>
          <CircleCheck aria-hidden="true" />
          <AlertTitle>Operación completada</AlertTitle>
          <AlertDescription>{successMessage}</AlertDescription>
        </Alert>
      ) : null}
      {statusError ? (
        <Alert variant="destructive">
          <CircleAlert aria-hidden="true" />
          <AlertTitle>No fue posible cambiar el estado</AlertTitle>
          <AlertDescription>{statusError}</AlertDescription>
        </Alert>
      ) : null}
      <ServiceDetail service={service} />
      <ConfirmDialog
        open={isStatusDialogOpen}
        title={service.activo ? 'Desactivar servicio' : 'Activar servicio'}
        description={
          service.activo
            ? '¿Está seguro de que desea desactivar este servicio?'
            : '¿Está seguro de que desea activar este servicio?'
        }
        confirmText={
          isUpdatingStatus
            ? service.activo
              ? 'Desactivando...'
              : 'Activando...'
            : service.activo
              ? 'Desactivar'
              : 'Activar'
        }
        cancelText="Cancelar"
        onConfirm={handleStatusChange}
        onCancel={closeStatusDialog}
        isLoading={isUpdatingStatus}
        confirmVariant={service.activo ? 'destructive' : 'default'}
      />
    </section>
  )
}
