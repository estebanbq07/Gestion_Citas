import { useEffect, useRef, useState } from 'react'
import {
  ArrowLeft,
  CircleAlert,
  CircleCheck,
  Pencil,
  Power,
  PowerOff,
} from 'lucide-react'
import {
  Link,
  useLocation,
  useNavigate,
  useParams,
} from 'react-router-dom'

import { PageHeader } from '@/components/common/PageHeader'
import { AdditionalDetail } from '@/components/data-display/AdditionalDetail'
import { EmptyState } from '@/components/feedback/EmptyState'
import { ErrorState } from '@/components/feedback/ErrorState'
import { LoadingState } from '@/components/feedback/LoadingState'
import { ConfirmDialog } from '@/components/modals/ConfirmDialog'
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import { Button } from '@/components/ui/button'
import { useAuth } from '@/context/useAuth'
import { getErrorMessage } from '@/lib/getErrorMessage'
import { ROLES } from '@/lib/permissions'
import {
  changeAdditionalStatus,
  getAdditionalById,
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

function BackToAdditionalsButton({ variant = 'outline' }) {
  return (
    <Button asChild type="button" variant={variant}>
      <Link to="/adicionales">
        <ArrowLeft aria-hidden="true" />
        Volver a adicionales
      </Link>
    </Button>
  )
}

export function AdditionalDetailPage() {
  const { id } = useParams()
  const location = useLocation()
  const navigate = useNavigate()
  const { role } = useAuth()
  const [additional, setAdditional] = useState(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState('')
  const [isUnavailable, setIsUnavailable] = useState(false)
  const [isInvalidId, setIsInvalidId] = useState(false)
  const [retryCount, setRetryCount] = useState(0)
  const [successMessage, setSuccessMessage] = useState(() => {
    const message = location.state?.successMessage

    return typeof message === 'string' ? message.trim() : ''
  })
  const [statusError, setStatusError] = useState('')
  const [isStatusDialogOpen, setIsStatusDialogOpen] = useState(false)
  const [isUpdatingStatus, setIsUpdatingStatus] = useState(false)
  const updatingStatusRef = useRef(false)

  useEffect(() => {
    if (successMessage) {
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
        setAdditional(null)
        setIsUnavailable(false)
        setIsInvalidId(false)
        setStatusError('')
        setIsStatusDialogOpen(false)

        return getAdditionalById(id)
      })
      .then((response) => {
        if (!isActive || response === null) {
          return
        }

        setAdditional(getAdditionalData(response))
      })
      .catch((requestError) => {
        if (!isActive) {
          return
        }

        if (requestError?.status === 404) {
          setIsUnavailable(true)
          return
        }

        if (requestError?.code === 'INVALID_ADDITIONAL_ID') {
          setIsInvalidId(true)
          setError(requestError.message)
          return
        }

        setError(
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
  }, [id, retryCount])

  function openStatusDialog() {
    if (
      role?.nombre !== ROLES.ADMIN ||
      typeof additional?.activo !== 'boolean' ||
      isUpdatingStatus ||
      updatingStatusRef.current
    ) {
      return
    }

    setStatusError('')
    setSuccessMessage('')
    setIsStatusDialogOpen(true)
  }

  function closeStatusDialog() {
    if (!isUpdatingStatus && !updatingStatusRef.current) {
      setIsStatusDialogOpen(false)
    }
  }

  async function handleStatusChange() {
    if (
      role?.nombre !== ROLES.ADMIN ||
      isUpdatingStatus ||
      updatingStatusRef.current ||
      !additional ||
      typeof additional.activo !== 'boolean'
    ) {
      return
    }

    const nextStatus = !additional.activo
    const additionalId = additional.id ?? id

    updatingStatusRef.current = true
    setStatusError('')
    setIsUpdatingStatus(true)

    try {
      const statusResponse = await changeAdditionalStatus(
        additionalId,
        nextStatus,
      )
      let updatedAdditional =
        statusResponse?.data &&
        typeof statusResponse.data === 'object' &&
        !Array.isArray(statusResponse.data)
          ? statusResponse.data
          : null

      try {
        const refreshedResponse = await getAdditionalById(additionalId)

        updatedAdditional = getAdditionalData(refreshedResponse)
      } catch (refreshError) {
        if (!updatedAdditional) {
          throw refreshError
        }
      }

      setAdditional(updatedAdditional)
      setIsStatusDialogOpen(false)
      setSuccessMessage(
        nextStatus
          ? 'Servicio adicional activado correctamente.'
          : 'Servicio adicional desactivado correctamente.',
      )
    } catch (requestError) {
      setIsStatusDialogOpen(false)
      setStatusError(
        requestError?.message === INVALID_RESPONSE_MESSAGE
          ? requestError.message
          : getErrorMessage(requestError),
      )
    } finally {
      updatingStatusRef.current = false
      setIsUpdatingStatus(false)
    }
  }

  if (isLoading) {
    return <LoadingState message="Cargando servicio adicional..." />
  }

  if (isUnavailable) {
    return (
      <EmptyState
        title="El servicio adicional solicitado no existe o no está disponible."
        description="Puede que haya sido eliminado o que la dirección no sea correcta."
        action={<BackToAdditionalsButton variant="default" />}
      />
    )
  }

  if (error) {
    return (
      <ErrorState
        title={
          isInvalidId
            ? 'El identificador del servicio adicional no es válido'
            : 'No fue posible cargar el servicio adicional'
        }
        message={error}
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
            <BackToAdditionalsButton />
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
        title="Detalle del servicio adicional"
        description="Consulta la información general y disponibilidad del complemento."
        actions={
          <div className="flex flex-wrap gap-2">
            {role?.nombre === ROLES.ADMIN ? (
              <>
                <Button asChild type="button">
                  <Link
                    to={`/adicionales/${encodeURIComponent(String(additional.id ?? id))}/editar`}
                  >
                    <Pencil aria-hidden="true" />
                    Editar adicional
                  </Link>
                </Button>
                {typeof additional.activo === 'boolean' ? (
                  <Button
                    type="button"
                    variant={additional.activo ? 'destructive' : 'outline'}
                    onClick={openStatusDialog}
                    disabled={isUpdatingStatus}
                  >
                    {additional.activo ? (
                      <PowerOff aria-hidden="true" />
                    ) : (
                      <Power aria-hidden="true" />
                    )}
                    {additional.activo
                      ? 'Desactivar adicional'
                      : 'Activar adicional'}
                  </Button>
                ) : null}
              </>
            ) : null}
            <BackToAdditionalsButton />
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
      <AdditionalDetail additional={additional} />
      <ConfirmDialog
        open={isStatusDialogOpen}
        title={
          additional.activo
            ? 'Desactivar servicio adicional'
            : 'Activar servicio adicional'
        }
        description={
          additional.activo
            ? '¿Está seguro de que desea desactivar este servicio adicional? Dejará de estar disponible para nuevas citas.'
            : '¿Está seguro de que desea activar este servicio adicional? Volverá a estar disponible para nuevas citas.'
        }
        confirmText={
          isUpdatingStatus
            ? additional.activo
              ? 'Desactivando...'
              : 'Activando...'
            : additional.activo
              ? 'Desactivar'
              : 'Activar'
        }
        cancelText="Cancelar"
        onConfirm={handleStatusChange}
        onCancel={closeStatusDialog}
        isLoading={isUpdatingStatus}
        confirmVariant={additional.activo ? 'destructive' : 'default'}
      />
    </section>
  )
}
