import {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react'
import { CircleCheck, Plus, Search } from 'lucide-react'
import { useLocation, useNavigate } from 'react-router-dom'

import { PageHeader } from '@/components/common/PageHeader'
import { AppointmentList } from '@/components/data-display/AppointmentList'
import { EmptyState } from '@/components/feedback/EmptyState'
import { ErrorState } from '@/components/feedback/ErrorState'
import { LoadingState } from '@/components/feedback/LoadingState'
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { useAuth } from '@/context/useAuth'
import {
  APPOINTMENT_SORT_OPTIONS,
  filterAppointments,
  isValidAppointmentId,
  sortAppointments,
} from '@/lib/appointmentUtils'
import { getErrorMessage } from '@/lib/getErrorMessage'
import { ROLES } from '@/lib/permissions'
import {
  getAppointmentStatuses,
  getAppointments,
  getAppointmentsByClient,
  getAppointmentsByEmployee,
} from '@/services/appointmentsService'

const INVALID_APPOINTMENTS_RESPONSE_MESSAGE =
  'No fue posible obtener el listado de citas.'
const INVALID_STATUSES_RESPONSE_MESSAGE =
  'No fue posible obtener los estados de las citas.'

function createLocalError(message, code) {
  const error = new Error(message)
  error.code = code

  return error
}

function getLoadErrorMessage(error) {
  return error?.code?.startsWith('INVALID_')
    ? error.message
    : getErrorMessage(error)
}

function isValidStatus(status) {
  return (
    status !== null &&
    typeof status === 'object' &&
    isValidAppointmentId(status.id) &&
    typeof status.nombre === 'string' &&
    Boolean(status.nombre.trim())
  )
}

export function AppointmentsPage() {
  const location = useLocation()
  const navigate = useNavigate()
  const { role, token, user } = useAuth()
  const [appointments, setAppointments] = useState([])
  const [statuses, setStatuses] = useState([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState('')
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState('')
  const [dateFilter, setDateFilter] = useState('')
  const [sortOption, setSortOption] = useState(
    APPOINTMENT_SORT_OPTIONS.DATE_ASC,
  )
  const [retryCount, setRetryCount] = useState(0)
  const [successMessage] = useState(() => {
    const message = location.state?.successMessage

    return typeof message === 'string' ? message.trim() : ''
  })
  const isRequestingRef = useRef(true)
  const roleName = role?.nombre

  useEffect(() => {
    if (successMessage) {
      navigate(location.pathname, { replace: true, state: null })
    }
  }, [location.pathname, navigate, successMessage])

  const requestAppointments = useCallback(
    async (signal) => {
      const options = { signal, token }
      let appointmentsRequest

      if (roleName === ROLES.ADMIN) {
        appointmentsRequest = getAppointments(options)
      } else if (roleName === ROLES.EMPLOYEE) {
        const employeeId = user?.empleado?.id

        if (!isValidAppointmentId(employeeId)) {
          throw createLocalError(
            'Tu usuario no tiene un empleado válido asociado.',
            'INVALID_CURRENT_EMPLOYEE',
          )
        }

        appointmentsRequest = getAppointmentsByEmployee(employeeId, options)
      } else if (roleName === ROLES.CLIENT) {
        if (!isValidAppointmentId(user?.id)) {
          throw createLocalError(
            'No fue posible identificar al cliente autenticado.',
            'INVALID_CURRENT_CLIENT',
          )
        }

        appointmentsRequest = getAppointmentsByClient(user.id, options)
      } else {
        throw createLocalError(
          'No fue posible determinar el alcance del listado de citas.',
          'INVALID_APPOINTMENT_ROLE',
        )
      }

      const [appointmentsResponse, statusesResponse] = await Promise.all([
        appointmentsRequest,
        getAppointmentStatuses(options),
      ])

      if (!Array.isArray(appointmentsResponse?.data)) {
        throw createLocalError(
          INVALID_APPOINTMENTS_RESPONSE_MESSAGE,
          'INVALID_APPOINTMENTS_RESPONSE',
        )
      }

      if (!Array.isArray(statusesResponse?.data)) {
        throw createLocalError(
          INVALID_STATUSES_RESPONSE_MESSAGE,
          'INVALID_APPOINTMENT_STATUSES_RESPONSE',
        )
      }

      return {
        appointments: appointmentsResponse.data,
        statuses: statusesResponse.data.filter(isValidStatus),
      }
    },
    [roleName, token, user],
  )

  useEffect(() => {
    const controller = new AbortController()
    let isActive = true

    async function loadAppointments() {
      await Promise.resolve()

      if (!isActive) {
        return
      }

      isRequestingRef.current = true
      setIsLoading(true)
      setError('')

      try {
        const data = await requestAppointments(controller.signal)

        if (isActive) {
          setAppointments(data.appointments)
          setStatuses(data.statuses)
        }
      } catch (requestError) {
        if (isActive) {
          setAppointments([])
          setStatuses([])
          setError(getLoadErrorMessage(requestError))
        }
      } finally {
        if (isActive) {
          isRequestingRef.current = false
          setIsLoading(false)
        }
      }
    }

    void loadAppointments()

    return () => {
      isActive = false
      controller.abort()
    }
  }, [requestAppointments, retryCount])

  const visibleAppointments = useMemo(
    () =>
      sortAppointments(
        filterAppointments(appointments, {
          searchTerm,
          statusFilter,
          dateFilter,
        }),
        sortOption,
      ),
    [appointments, dateFilter, searchTerm, sortOption, statusFilter],
  )

  const canCreateAppointment =
    roleName === ROLES.ADMIN ||
    roleName === ROLES.EMPLOYEE ||
    roleName === ROLES.CLIENT

  function handleViewDetails(appointment) {
    navigate(`/citas/${encodeURIComponent(String(appointment.id))}`)
  }

  function handleRetry() {
    if (isRequestingRef.current) {
      return
    }

    isRequestingRef.current = true
    setIsLoading(true)
    setError('')
    setRetryCount((currentCount) => currentCount + 1)
  }

  if (isLoading) {
    return <LoadingState message="Cargando citas..." />
  }

  if (error) {
    return (
      <ErrorState
        title="No fue posible cargar las citas"
        message={error}
        action={
          <Button type="button" onClick={handleRetry}>
            Intentar nuevamente
          </Button>
        }
      />
    )
  }

  return (
    <section className="w-full space-y-6">
      <PageHeader
        title="Citas"
        description="Consulta y administra las citas según tu perfil."
        actions={
          canCreateAppointment ? (
            <Button type="button" onClick={() => navigate('/citas/nueva')}>
              <Plus aria-hidden="true" />
              Nueva cita
            </Button>
          ) : null
        }
      />

      {successMessage ? (
        <Alert>
          <CircleCheck aria-hidden="true" />
          <AlertTitle>Operación completada</AlertTitle>
          <AlertDescription>{successMessage}</AlertDescription>
        </Alert>
      ) : null}

      {appointments.length ? (
        <div className="grid gap-4 rounded-xl border border-border bg-card p-4 sm:grid-cols-2 xl:grid-cols-4 xl:items-end">
          <div className="space-y-2 sm:col-span-2 xl:col-span-1">
            <label className="text-sm font-medium" htmlFor="appointment-search">
              Buscar citas
            </label>
            <div className="relative">
              <Search
                aria-hidden="true"
                className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground"
              />
              <Input
                id="appointment-search"
                type="search"
                placeholder="Servicio, cliente o empleado"
                className="pl-9"
                value={searchTerm}
                onChange={(event) => setSearchTerm(event.target.value)}
              />
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium" htmlFor="appointment-status">
              Estado
            </label>
            <select
              id="appointment-status"
              className="flex h-9 w-full rounded-md border border-border bg-background px-3 py-1 text-sm shadow-xs outline-none focus-visible:ring-2 focus-visible:ring-ring"
              value={statusFilter}
              onChange={(event) => setStatusFilter(event.target.value)}
            >
              <option value="">Todos</option>
              {statuses.map((status) => (
                <option key={status.id} value={status.id}>
                  {status.nombre.trim()}
                </option>
              ))}
            </select>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium" htmlFor="appointment-date">
              Fecha
            </label>
            <Input
              id="appointment-date"
              type="date"
              value={dateFilter}
              onChange={(event) => setDateFilter(event.target.value)}
            />
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium" htmlFor="appointment-sort">
              Ordenar por
            </label>
            <select
              id="appointment-sort"
              className="flex h-9 w-full rounded-md border border-border bg-background px-3 py-1 text-sm shadow-xs outline-none focus-visible:ring-2 focus-visible:ring-ring"
              value={sortOption}
              onChange={(event) => setSortOption(event.target.value)}
            >
              <option value={APPOINTMENT_SORT_OPTIONS.DATE_DESC}>
                Más lejanas primero
              </option>
              <option value={APPOINTMENT_SORT_OPTIONS.DATE_ASC}>
                Más próximas primero
              </option>
            </select>
          </div>

          {searchTerm || statusFilter || dateFilter ? (
            <div className="sm:col-span-2 xl:col-span-4">
              <Button
                type="button"
                variant="outline"
                onClick={() => {
                  setSearchTerm('')
                  setStatusFilter('')
                  setDateFilter('')
                }}
              >
                Limpiar filtros
              </Button>
            </div>
          ) : null}
        </div>
      ) : null}

      {!appointments.length ? (
        <EmptyState
          title="No hay citas registradas."
          description="Cuando haya citas disponibles para tu perfil, aparecerán en esta sección."
        />
      ) : !visibleAppointments.length ? (
        <EmptyState
          title="No se encontraron citas con los criterios seleccionados."
          description="Prueba con otra búsqueda, estado o fecha."
        />
      ) : (
        <AppointmentList
          appointments={visibleAppointments}
          onViewDetails={handleViewDetails}
        />
      )}
    </section>
  )
}
