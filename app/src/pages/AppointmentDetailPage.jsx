import { useEffect, useMemo, useRef, useState } from 'react'
import { ArrowLeft, CircleAlert, CircleCheck } from 'lucide-react'
import { Link, useLocation, useNavigate, useParams } from 'react-router-dom'

import { AppointmentActions } from '@/components/data-display/AppointmentActions'
import { AppointmentDetail } from '@/components/data-display/AppointmentDetail'
import { PageHeader } from '@/components/common/PageHeader'
import { EmptyState } from '@/components/feedback/EmptyState'
import { ErrorState } from '@/components/feedback/ErrorState'
import { LoadingState } from '@/components/feedback/LoadingState'
import { CancelAppointmentDialog } from '@/components/modals/CancelAppointmentDialog'
import { ConfirmDialog } from '@/components/modals/ConfirmDialog'
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import { Button } from '@/components/ui/button'
import { useAuth } from '@/context/useAuth'
import { loadScopedAppointment } from '@/lib/appointmentAccess'
import {
  APPOINTMENT_STATUS_NAMES,
  canTransitionAppointment,
  getAvailableAppointmentActions,
  isAppointmentInRoleScope,
  isValidAppointmentId,
} from '@/lib/appointmentUtils'
import { getErrorMessage } from '@/lib/getErrorMessage'
import { ROLES } from '@/lib/permissions'
import {
  cancelAppointment,
  changeAppointmentStatus,
  getAppointmentStatuses,
} from '@/services/appointmentsService'

const INVALID_ID_MESSAGE = 'El identificador de la cita no es válido.'

function getStatusCatalog(response) {
  if (!Array.isArray(response?.data)) {
    const error = new Error(
      'No fue posible obtener los estados de cita desde el servidor.',
    )
    error.code = 'INVALID_APPOINTMENT_STATUS_RESPONSE'
    throw error
  }

  return response.data.filter((status) => status?.activo === true)
}

function getLoadErrorMessage(error) {
  return error?.code?.startsWith('INVALID_')
    ? error.message
    : getErrorMessage(error)
}

function createActionError(message) {
  const error = new Error(message)
  error.code = 'LOCAL_APPOINTMENT_ACTION_ERROR'

  return error
}

function getActionErrorMessage(error) {
  return error?.code === 'LOCAL_APPOINTMENT_ACTION_ERROR'
    ? error.message
    : getErrorMessage(error)
}

function getMutationAppointment(response, roleName, user) {
  const appointment = response?.data

  return appointment &&
    typeof appointment === 'object' &&
    !Array.isArray(appointment) &&
    isAppointmentInRoleScope(appointment, roleName, user)
    ? appointment
    : null
}

function getStatusDialogConfig(statusName) {
  if (statusName === APPOINTMENT_STATUS_NAMES.CONFIRMED) {
    return {
      title: 'Confirmar cita',
      description: '¿Está seguro de que desea confirmar esta cita?',
      confirmText: 'Confirmar cita',
      loadingText: 'Confirmando...',
      successMessage: 'Cita confirmada correctamente.',
    }
  }

  if (statusName === APPOINTMENT_STATUS_NAMES.FINALIZED) {
    return {
      title: 'Finalizar cita',
      description:
        '¿Está seguro de que desea marcar esta cita como finalizada?',
      confirmText: 'Finalizar cita',
      loadingText: 'Finalizando...',
      successMessage: 'Cita finalizada correctamente.',
    }
  }

  if (statusName === APPOINTMENT_STATUS_NAMES.IN_PROGRESS) {
    return {
      title: 'Iniciar atención',
      description:
        '¿Está seguro de que desea marcar esta cita como en proceso?',
      confirmText: 'Iniciar atención',
      loadingText: 'Actualizando...',
      successMessage: 'Cita marcada en proceso correctamente.',
    }
  }

  return {
    title: 'Cambiar estado de la cita',
    description: '¿Está seguro de que desea marcar esta cita como pendiente?',
    confirmText: 'Marcar como pendiente',
    loadingText: 'Actualizando...',
    successMessage: 'Cita marcada como pendiente correctamente.',
  }
}

function BackToAppointmentsButton({ variant = 'outline' }) {
  return (
    <Button asChild type="button" variant={variant}>
      <Link to="/citas">
        <ArrowLeft aria-hidden="true" />
        Volver a citas
      </Link>
    </Button>
  )
}

export function AppointmentDetailPage() {
  const { id } = useParams()
  const location = useLocation()
  const navigate = useNavigate()
  const { role, token, user } = useAuth()
  const [appointment, setAppointment] = useState(null)
  const [statuses, setStatuses] = useState([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState('')
  const [statusCatalogError, setStatusCatalogError] = useState('')
  const [isUnavailable, setIsUnavailable] = useState(false)
  const [isForbidden, setIsForbidden] = useState(false)
  const [isInvalidId, setIsInvalidId] = useState(false)
  const [retryCount, setRetryCount] = useState(0)
  const [successMessage, setSuccessMessage] = useState(() => {
    const message = location.state?.successMessage

    return typeof message === 'string' ? message.trim() : ''
  })
  const [isCancellationOpen, setIsCancellationOpen] = useState(false)
  const [cancellationReason, setCancellationReason] = useState('')
  const [cancellationReasonError, setCancellationReasonError] = useState('')
  const [cancellationApiError, setCancellationApiError] = useState('')
  const [pendingStatus, setPendingStatus] = useState(null)
  const [statusActionError, setStatusActionError] = useState('')
  const [isActionLoading, setIsActionLoading] = useState(false)
  const actionLoadingRef = useRef(false)
  const roleName = role?.nombre

  useEffect(() => {
    if (location.state?.successMessage) {
      navigate(location.pathname, { replace: true, state: null })
    }
  }, [location.pathname, location.state?.successMessage, navigate])

  useEffect(() => {
    let isActive = true

    async function loadAppointment() {
      setIsLoading(true)
      setError('')
      setStatusCatalogError('')
      setAppointment(null)
      setStatuses([])
      setIsUnavailable(false)
      setIsForbidden(false)
      setIsInvalidId(false)

      if (!isValidAppointmentId(id)) {
        setIsInvalidId(true)
        setError(INVALID_ID_MESSAGE)
        setIsLoading(false)
        return
      }

      const results = await Promise.allSettled([
        loadScopedAppointment(id, roleName, user, token),
        [ROLES.ADMIN, ROLES.EMPLOYEE].includes(roleName)
          ? getAppointmentStatuses({ token })
          : Promise.resolve({ data: [] }),
      ])

      if (!isActive) {
        return
      }

      const [appointmentResult, statusesResult] = results

      if (appointmentResult.status === 'rejected') {
        const requestError = appointmentResult.reason

        if (requestError?.status === 404) {
          setIsUnavailable(true)
        } else if (
          requestError?.status === 403 ||
          requestError?.code === 'FORBIDDEN_APPOINTMENT'
        ) {
          setIsForbidden(true)
        } else {
          setError(getLoadErrorMessage(requestError))
        }
      } else {
        setAppointment(appointmentResult.value)
      }

      if (statusesResult.status === 'fulfilled') {
        try {
          setStatuses(getStatusCatalog(statusesResult.value))
        } catch (statusResponseError) {
          setStatusCatalogError(getLoadErrorMessage(statusResponseError))
        }
      } else {
        setStatusCatalogError(getLoadErrorMessage(statusesResult.reason))
      }

      setIsLoading(false)
    }

    loadAppointment()

    return () => {
      isActive = false
    }
  }, [id, retryCount, roleName, token, user])

  const availableActions = useMemo(
    () =>
      getAvailableAppointmentActions({
        appointment,
        roleName,
        user,
      }),
    [appointment, roleName, user],
  )
  const statusTargets = useMemo(
    () =>
      statuses.filter(
        (status) =>
          status?.nombre !== APPOINTMENT_STATUS_NAMES.CANCELED &&
          canTransitionAppointment(appointment?.estadoCita, status),
      ),
    [appointment?.estadoCita, statuses],
  )
  const statusDialogConfig = pendingStatus
    ? getStatusDialogConfig(pendingStatus.nombre)
    : null

  function handleRetry() {
    setError('')
    setRetryCount((currentCount) => currentCount + 1)
  }

  function openCancellationDialog() {
    if (
      !availableActions.includes('cancel') ||
      isActionLoading ||
      actionLoadingRef.current
    ) {
      return
    }

    setSuccessMessage('')
    setCancellationReason('')
    setCancellationReasonError('')
    setCancellationApiError('')
    setIsCancellationOpen(true)
  }

  function closeCancellationDialog() {
    if (!isActionLoading && !actionLoadingRef.current) {
      setIsCancellationOpen(false)
      setCancellationReason('')
      setCancellationReasonError('')
      setCancellationApiError('')
    }
  }

  function handleCancellationReasonChange(value) {
    setCancellationReason(value)
    setCancellationReasonError('')
    setCancellationApiError('')
  }

  async function handleCancellation() {
    if (isActionLoading || actionLoadingRef.current) {
      return
    }

    const normalizedReason = cancellationReason.trim()

    if (normalizedReason.length < 5 || normalizedReason.length > 255) {
      setCancellationReasonError(
        'El motivo debe contener entre 5 y 255 caracteres.',
      )
      return
    }

    actionLoadingRef.current = true
    setIsActionLoading(true)
    setCancellationReasonError('')
    setCancellationApiError('')

    try {
      const currentAppointment = await loadScopedAppointment(
        id,
        roleName,
        user,
        token,
      )
      const currentActions = getAvailableAppointmentActions({
        appointment: currentAppointment,
        roleName,
        user,
      })

      if (!currentActions.includes('cancel')) {
        throw createActionError(
          'El estado actual de la cita no permite cancelarla.',
        )
      }

      const cancellationResponse = await cancelAppointment(
        id,
        { motivoCancelacion: normalizedReason },
        token,
      )
      let refreshedAppointment = getMutationAppointment(
        cancellationResponse,
        roleName,
        user,
      )

      try {
        refreshedAppointment = await loadScopedAppointment(
          id,
          roleName,
          user,
          token,
        )
      } catch (refreshError) {
        if (!refreshedAppointment) {
          throw refreshError
        }
      }

      setAppointment(refreshedAppointment)
      setIsCancellationOpen(false)
      setCancellationReason('')
      setSuccessMessage('Cita cancelada correctamente.')
    } catch (requestError) {
      setCancellationApiError(getActionErrorMessage(requestError))
    } finally {
      actionLoadingRef.current = false
      setIsActionLoading(false)
    }
  }

  function openStatusDialog(status) {
    if (
      !availableActions.includes('changeStatus') ||
      !canTransitionAppointment(appointment?.estadoCita, status) ||
      isActionLoading ||
      actionLoadingRef.current
    ) {
      return
    }

    setSuccessMessage('')
    setStatusActionError('')
    setPendingStatus(status)
  }

  function closeStatusDialog() {
    if (!isActionLoading && !actionLoadingRef.current) {
      setPendingStatus(null)
      setStatusActionError('')
    }
  }

  async function handleStatusChange() {
    if (
      !pendingStatus ||
      isActionLoading ||
      actionLoadingRef.current
    ) {
      return
    }

    actionLoadingRef.current = true
    setIsActionLoading(true)
    setStatusActionError('')

    try {
      const currentAppointment = await loadScopedAppointment(
        id,
        roleName,
        user,
        token,
      )
      const currentActions = getAvailableAppointmentActions({
        appointment: currentAppointment,
        roleName,
        user,
      })

      if (
        !currentActions.includes('changeStatus') ||
        !canTransitionAppointment(currentAppointment.estadoCita, pendingStatus)
      ) {
        throw createActionError(
          'El estado actual de la cita no permite realizar esta acción.',
        )
      }

      const currentDialogConfig = getStatusDialogConfig(pendingStatus.nombre)

      const statusResponse = await changeAppointmentStatus(
        id,
        pendingStatus.id,
        token,
      )
      let refreshedAppointment = getMutationAppointment(
        statusResponse,
        roleName,
        user,
      )

      try {
        refreshedAppointment = await loadScopedAppointment(
          id,
          roleName,
          user,
          token,
        )
      } catch (refreshError) {
        if (!refreshedAppointment) {
          throw refreshError
        }
      }

      setAppointment(refreshedAppointment)
      setPendingStatus(null)
      setSuccessMessage(currentDialogConfig.successMessage)
    } catch (requestError) {
      setStatusActionError(getActionErrorMessage(requestError))
    } finally {
      actionLoadingRef.current = false
      setIsActionLoading(false)
    }
  }

  if (isLoading) {
    return <LoadingState message="Cargando cita..." />
  }

  if (isForbidden) {
    return (
      <ErrorState
        title="Acceso denegado"
        message="No tienes permiso para consultar la información de esta cita."
        action={<BackToAppointmentsButton variant="default" />}
      />
    )
  }

  if (isUnavailable) {
    return (
      <EmptyState
        title="La cita solicitada no existe o no está disponible."
        description="Puede que la dirección no sea correcta."
        action={<BackToAppointmentsButton variant="default" />}
      />
    )
  }

  if (error) {
    return (
      <ErrorState
        title={
          isInvalidId
            ? 'El identificador de la cita no es válido'
            : 'No fue posible cargar la cita'
        }
        message={error}
        action={
          <div className="flex flex-wrap justify-center gap-2">
            {!isInvalidId ? (
              <Button type="button" onClick={handleRetry}>
                Intentar nuevamente
              </Button>
            ) : null}
            <BackToAppointmentsButton />
          </div>
        }
      />
    )
  }

  if (!appointment) {
    return null
  }

  const showClientEmail =
    roleName === ROLES.ADMIN ||
    roleName === ROLES.EMPLOYEE ||
    roleName === ROLES.CLIENT

  return (
    <section className="w-full space-y-6">
      <PageHeader
        title="Detalle de la cita"
        description="Consulta la programación, las personas relacionadas y el resumen de costos."
        actions={<BackToAppointmentsButton />}
      />

      {successMessage ? (
        <Alert>
          <CircleCheck aria-hidden="true" />
          <AlertTitle>Operación completada</AlertTitle>
          <AlertDescription>{successMessage}</AlertDescription>
        </Alert>
      ) : null}

      {statusCatalogError ? (
        <Alert variant="destructive">
          <CircleAlert aria-hidden="true" />
          <AlertTitle>No fue posible cargar las acciones de estado</AlertTitle>
          <AlertDescription>
            <p>{statusCatalogError}</p>
            <Button
              type="button"
              variant="outline"
              onClick={handleRetry}
              disabled={isActionLoading}
            >
              Intentar nuevamente
            </Button>
          </AlertDescription>
        </Alert>
      ) : null}

      <AppointmentActions
        appointmentId={appointment.id ?? id}
        availableActions={availableActions}
        statusTargets={statusTargets}
        isLoading={isActionLoading}
        onCancel={openCancellationDialog}
        onStatusChange={openStatusDialog}
      />

      <AppointmentDetail
        appointment={appointment}
        showClientEmail={showClientEmail}
      />

      <CancelAppointmentDialog
        open={isCancellationOpen}
        reason={cancellationReason}
        error={cancellationReasonError}
        apiError={cancellationApiError}
        isLoading={isActionLoading}
        onReasonChange={handleCancellationReasonChange}
        onConfirm={handleCancellation}
        onCancel={closeCancellationDialog}
      />

      <ConfirmDialog
        open={Boolean(pendingStatus)}
        title={statusDialogConfig?.title ?? 'Cambiar estado de la cita'}
        description={
          statusDialogConfig?.description ??
          '¿Está seguro de que desea cambiar el estado de esta cita?'
        }
        confirmText={statusDialogConfig?.confirmText ?? 'Cambiar estado'}
        cancelText="Volver"
        loadingText={statusDialogConfig?.loadingText}
        onConfirm={handleStatusChange}
        onCancel={closeStatusDialog}
        isLoading={isActionLoading}
      >
        {statusActionError ? (
          <Alert variant="destructive">
            <CircleAlert aria-hidden="true" />
            <AlertTitle>No fue posible cambiar el estado</AlertTitle>
            <AlertDescription>{statusActionError}</AlertDescription>
          </Alert>
        ) : null}
      </ConfirmDialog>
    </section>
  )
}
