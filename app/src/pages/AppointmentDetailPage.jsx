import { useEffect, useState } from 'react'
import { ArrowLeft, CircleCheck } from 'lucide-react'
import {
  Link,
  useLocation,
  useNavigate,
  useParams,
} from 'react-router-dom'

import { PageHeader } from '@/components/common/PageHeader'
import { AppointmentDetail } from '@/components/data-display/AppointmentDetail'
import { EmptyState } from '@/components/feedback/EmptyState'
import { ErrorState } from '@/components/feedback/ErrorState'
import { LoadingState } from '@/components/feedback/LoadingState'
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import { Button } from '@/components/ui/button'
import { useAuth } from '@/context/useAuth'
import { getErrorMessage } from '@/lib/getErrorMessage'
import { isValidAppointmentId } from '@/lib/appointmentUtils'
import { ROLES } from '@/lib/permissions'
import {
  getAppointmentById,
  getAppointmentsByClient,
  getAppointmentsByEmployee,
} from '@/services/appointmentsService'

const INVALID_RESPONSE_MESSAGE =
  'No fue posible obtener la información de la cita.'
const INVALID_ID_MESSAGE = 'El identificador de la cita no es válido.'
const INVALID_SCOPE_RESPONSE_MESSAGE =
  'No fue posible verificar el acceso a la cita.'

function getAppointmentData(response) {
  if (
    !response?.data ||
    typeof response.data !== 'object' ||
    Array.isArray(response.data)
  ) {
    throw new Error(INVALID_RESPONSE_MESSAGE)
  }

  return response.data
}

function getNumericId(value) {
  const numericValue = Number(value)

  return Number.isInteger(numericValue) && numericValue > 0
    ? numericValue
    : null
}

function canViewAppointment(appointment, roleName, user) {
  if (roleName === ROLES.ADMIN) {
    return true
  }

  if (roleName === ROLES.EMPLOYEE) {
    const currentEmployeeId = getNumericId(user?.empleado?.id)

    return (
      currentEmployeeId !== null &&
      getNumericId(appointment?.empleadoId) === currentEmployeeId
    )
  }

  if (roleName === ROLES.CLIENT) {
    const currentUserId = getNumericId(user?.id)

    return (
      currentUserId !== null &&
      getNumericId(appointment?.clienteId) === currentUserId
    )
  }

  return false
}

async function verifyAppointmentAccess(appointmentId, roleName, user, token) {
  if (roleName === ROLES.ADMIN) {
    return
  }

  let response

  if (roleName === ROLES.EMPLOYEE) {
    const employeeId = getNumericId(user?.empleado?.id)

    if (employeeId === null) {
      const error = new Error('Tu usuario no tiene un empleado válido asociado.')
      error.code = 'INVALID_CURRENT_EMPLOYEE'
      throw error
    }

    response = await getAppointmentsByEmployee(employeeId, { token })
  } else if (roleName === ROLES.CLIENT) {
    const clientId = getNumericId(user?.id)

    if (clientId === null) {
      const error = new Error(
        'No fue posible identificar al cliente autenticado.',
      )
      error.code = 'INVALID_CURRENT_CLIENT'
      throw error
    }

    response = await getAppointmentsByClient(clientId, { token })
  } else {
    const error = new Error('No tienes permiso para consultar esta cita.')
    error.code = 'FORBIDDEN_APPOINTMENT'
    throw error
  }

  if (!Array.isArray(response?.data)) {
    const error = new Error(INVALID_SCOPE_RESPONSE_MESSAGE)
    error.code = 'INVALID_SCOPE_RESPONSE'
    throw error
  }

  const numericAppointmentId = getNumericId(appointmentId)
  const isIncluded = response.data.some(
    (appointment) => getNumericId(appointment?.id) === numericAppointmentId,
  )

  if (!isIncluded) {
    const error = new Error('No tienes permiso para consultar esta cita.')
    error.code = 'FORBIDDEN_APPOINTMENT'
    throw error
  }
}

function getLoadErrorMessage(error) {
  return error?.message === INVALID_RESPONSE_MESSAGE ||
    error?.code?.startsWith('INVALID_')
    ? error.message
    : getErrorMessage(error)
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
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState('')
  const [isUnavailable, setIsUnavailable] = useState(false)
  const [isForbidden, setIsForbidden] = useState(false)
  const [isInvalidId, setIsInvalidId] = useState(false)
  const [retryCount, setRetryCount] = useState(0)
  const [successMessage] = useState(() => {
    const message = location.state?.successMessage

    return typeof message === 'string' ? message.trim() : ''
  })

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
        setAppointment(null)
        setIsUnavailable(false)
        setIsForbidden(false)
        setIsInvalidId(false)

        if (!isValidAppointmentId(id)) {
          setIsInvalidId(true)
          setError(INVALID_ID_MESSAGE)

          return null
        }

        return verifyAppointmentAccess(id, role?.nombre, user, token).then(() =>
          getAppointmentById(id, { token }),
        )
      })
      .then((response) => {
        if (!isActive || response === null) {
          return
        }

        const nextAppointment = getAppointmentData(response)

        if (!canViewAppointment(nextAppointment, role?.nombre, user)) {
          setIsForbidden(true)
          return
        }

        setAppointment(nextAppointment)
      })
      .catch((requestError) => {
        if (!isActive) {
          return
        }

        if (requestError?.status === 404) {
          setIsUnavailable(true)
          return
        }

        if (
          requestError?.status === 403 ||
          requestError?.code === 'FORBIDDEN_APPOINTMENT'
        ) {
          setIsForbidden(true)
          return
        }

        setError(getLoadErrorMessage(requestError))
      })
      .finally(() => {
        if (isActive) {
          setIsLoading(false)
        }
      })

    return () => {
      isActive = false
    }
  }, [id, retryCount, role?.nombre, token, user])

  function handleRetry() {
    setIsLoading(true)
    setError('')
    setRetryCount((currentCount) => currentCount + 1)
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

  const roleName = role?.nombre
  const showClientEmail =
    roleName === ROLES.ADMIN ||
    roleName === ROLES.EMPLOYEE ||
    (roleName === ROLES.CLIENT &&
      getNumericId(appointment.clienteId) === getNumericId(user?.id))

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

      <AppointmentDetail
        appointment={appointment}
        showClientEmail={showClientEmail}
      />
    </section>
  )
}
