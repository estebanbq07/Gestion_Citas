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
import { EmployeeDetail } from '@/components/data-display/EmployeeDetail'
import { EmptyState } from '@/components/feedback/EmptyState'
import { ErrorState } from '@/components/feedback/ErrorState'
import { LoadingState } from '@/components/feedback/LoadingState'
import { ConfirmDialog } from '@/components/modals/ConfirmDialog'
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import { Button } from '@/components/ui/button'
import { useAuth } from '@/context/useAuth'
import { isValidEmployeeId } from '@/lib/employeeUtils'
import { getErrorMessage } from '@/lib/getErrorMessage'
import { ROLES } from '@/lib/permissions'
import {
  changeEmployeeStatus,
  getEmployeeById,
} from '@/services/employeesService'

const INVALID_RESPONSE_MESSAGE =
  'No fue posible obtener la información del empleado.'
const INVALID_ID_MESSAGE = 'El identificador del empleado no es válido.'

function getEmployeeData(response) {
  if (
    !response?.data ||
    typeof response.data !== 'object' ||
    Array.isArray(response.data)
  ) {
    throw new Error(INVALID_RESPONSE_MESSAGE)
  }

  return response.data
}

function getLoadErrorMessage(error) {
  return error?.message === INVALID_RESPONSE_MESSAGE
    ? error.message
    : getErrorMessage(error)
}

function BackToEmployeesButton({ variant = 'outline' }) {
  return (
    <Button asChild type="button" variant={variant}>
      <Link to="/empleados">
        <ArrowLeft aria-hidden="true" />
        Volver a empleados
      </Link>
    </Button>
  )
}

export function EmployeeDetailPage() {
  const { id } = useParams()
  const location = useLocation()
  const navigate = useNavigate()
  const { role, token } = useAuth()
  const [employee, setEmployee] = useState(null)
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
  const isUpdatingStatusRef = useRef(false)

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
        setEmployee(null)
        setIsUnavailable(false)
        setIsInvalidId(false)
        setStatusError('')
        setIsStatusDialogOpen(false)

        if (!isValidEmployeeId(id)) {
          setIsInvalidId(true)
          setError(INVALID_ID_MESSAGE)

          return null
        }

        return getEmployeeById(id, { token })
      })
      .then((response) => {
        if (isActive && response !== null) {
          setEmployee(getEmployeeData(response))
        }
      })
      .catch((requestError) => {
        if (!isActive) {
          return
        }

        if (requestError?.status === 404) {
          setIsUnavailable(true)
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
  }, [id, retryCount, token])

  function openStatusDialog() {
    if (
      role?.nombre !== ROLES.ADMIN ||
      typeof employee?.activo !== 'boolean' ||
      isUpdatingStatus ||
      isUpdatingStatusRef.current
    ) {
      return
    }

    setStatusError('')
    setSuccessMessage('')
    setIsStatusDialogOpen(true)
  }

  function closeStatusDialog() {
    if (!isUpdatingStatus && !isUpdatingStatusRef.current) {
      setIsStatusDialogOpen(false)
    }
  }

  async function handleStatusChange() {
    if (
      role?.nombre !== ROLES.ADMIN ||
      isUpdatingStatus ||
      isUpdatingStatusRef.current ||
      !employee ||
      typeof employee.activo !== 'boolean'
    ) {
      return
    }

    const nextStatus = !employee.activo
    const employeeId = employee.id ?? id

    isUpdatingStatusRef.current = true
    setStatusError('')
    setIsUpdatingStatus(true)

    try {
      const statusResponse = await changeEmployeeStatus(
        employeeId,
        nextStatus,
        { token },
      )
      let refreshedEmployee =
        statusResponse?.data &&
        typeof statusResponse.data === 'object' &&
        !Array.isArray(statusResponse.data)
          ? { ...employee, ...statusResponse.data }
          : null

      try {
        const refreshedResponse = await getEmployeeById(employeeId, {
          token,
        })

        refreshedEmployee = getEmployeeData(refreshedResponse)
      } catch (refreshError) {
        if (!refreshedEmployee) {
          throw refreshError
        }
      }

      setEmployee(refreshedEmployee)
      setIsStatusDialogOpen(false)
      setSuccessMessage(
        nextStatus
          ? 'Empleado activado correctamente.'
          : 'Empleado desactivado correctamente.',
      )
    } catch (requestError) {
      setIsStatusDialogOpen(false)
      setStatusError(getLoadErrorMessage(requestError))
    } finally {
      isUpdatingStatusRef.current = false
      setIsUpdatingStatus(false)
    }
  }

  if (isLoading) {
    return <LoadingState message="Cargando empleado..." />
  }

  if (isUnavailable) {
    return (
      <EmptyState
        title="El empleado solicitado no existe o no está disponible."
        description="Puede que haya sido eliminado o que la dirección no sea correcta."
        action={<BackToEmployeesButton variant="default" />}
      />
    )
  }

  if (error) {
    return (
      <ErrorState
        title={
          isInvalidId
            ? 'El identificador del empleado no es válido'
            : 'No fue posible cargar el empleado'
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
            <BackToEmployeesButton />
          </div>
        }
      />
    )
  }

  if (!employee) {
    return null
  }

  return (
    <section className="w-full space-y-6">
      <PageHeader
        title="Detalle del empleado"
        description="Consulta la información general, especialidad y servicios asignados."
        actions={
          <div className="flex flex-wrap gap-2">
            {role?.nombre === ROLES.ADMIN ? (
              <>
                <Button asChild type="button">
                  <Link
                    to={`/empleados/${encodeURIComponent(String(employee.id ?? id))}/editar`}
                  >
                    <Pencil aria-hidden="true" />
                    Editar empleado
                  </Link>
                </Button>
                {typeof employee.activo === 'boolean' ? (
                  <Button
                    type="button"
                    variant={employee.activo ? 'destructive' : 'outline'}
                    onClick={openStatusDialog}
                    disabled={isUpdatingStatus}
                  >
                    {employee.activo ? (
                      <PowerOff aria-hidden="true" />
                    ) : (
                      <Power aria-hidden="true" />
                    )}
                    {employee.activo
                      ? 'Desactivar empleado'
                      : 'Activar empleado'}
                  </Button>
                ) : null}
              </>
            ) : null}
            <BackToEmployeesButton />
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

      <EmployeeDetail employee={employee} />

      <ConfirmDialog
        open={isStatusDialogOpen}
        title={employee.activo ? 'Desactivar empleado' : 'Activar empleado'}
        description={
          employee.activo
            ? '¿Está seguro de que desea desactivar este empleado?'
            : '¿Está seguro de que desea activar este empleado?'
        }
        confirmText={
          isUpdatingStatus
            ? employee.activo
              ? 'Desactivando...'
              : 'Activando...'
            : employee.activo
              ? 'Desactivar'
              : 'Activar'
        }
        cancelText="Cancelar"
        onConfirm={handleStatusChange}
        onCancel={closeStatusDialog}
        isLoading={isUpdatingStatus}
        confirmVariant={employee.activo ? 'destructive' : 'default'}
      />
    </section>
  )
}
