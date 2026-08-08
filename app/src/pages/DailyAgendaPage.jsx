import {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react'
import { CalendarDays, RefreshCw, Search } from 'lucide-react'
import { useNavigate } from 'react-router-dom'

import { PageHeader } from '@/components/common/PageHeader'
import { DailyAgendaList } from '@/components/data-display/DailyAgendaList'
import { EmptyState } from '@/components/feedback/EmptyState'
import { ErrorState } from '@/components/feedback/ErrorState'
import { LoadingState } from '@/components/feedback/LoadingState'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { useAuth } from '@/context/useAuth'
import {
  APPOINTMENT_SORT_OPTIONS,
  APPOINTMENT_STATUS_NAMES,
  filterAppointments,
  getAppointmentEmployeeName,
  getAppointmentStatusName,
  getTodayDateKey,
  isValidAppointmentId,
  sortAppointments,
} from '@/lib/appointmentUtils'
import { formatApiDate, getApiDateKey } from '@/lib/dateTimeUtils'
import { getErrorMessage } from '@/lib/getErrorMessage'
import { getDailyAgenda } from '@/services/appointmentsService'

const INVALID_AGENDA_RESPONSE_MESSAGE =
  'No fue posible obtener la agenda diaria.'

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

function getRelationId(item, idField, relationField) {
  const value = item?.[idField] ?? item?.[relationField]?.id

  return isValidAppointmentId(value) ? String(value) : ''
}

function normalizeAgendaResponse(response, requestedDate) {
  const agenda = response?.data

  if (
    !agenda ||
    typeof agenda !== 'object' ||
    Array.isArray(agenda) ||
    getApiDateKey(agenda.fecha) !== requestedDate ||
    !Array.isArray(agenda.empleados)
  ) {
    throw createLocalError(
      INVALID_AGENDA_RESPONSE_MESSAGE,
      'INVALID_DAILY_AGENDA_RESPONSE',
    )
  }

  return agenda.empleados.flatMap((employee) => {
    if (!employee || typeof employee !== 'object') {
      return []
    }

    return (Array.isArray(employee.citas) ? employee.citas : []).filter(
      (appointment) =>
        appointment !== null &&
        typeof appointment === 'object' &&
        getApiDateKey(appointment.fecha) === requestedDate,
    )
  })
}

function getPresentEmployees(appointments) {
  const employeesById = new Map()

  appointments.forEach((appointment) => {
    const id = getRelationId(appointment, 'empleadoId', 'empleado')
    const name = getAppointmentEmployeeName(appointment)

    if (id && name && !employeesById.has(id)) {
      employeesById.set(id, name)
    }
  })

  return [...employeesById.entries()]
    .map(([id, name]) => ({ id, name }))
    .sort((first, second) =>
      first.name.localeCompare(second.name, 'es', { sensitivity: 'base' }),
    )
}

function getPresentStatuses(appointments) {
  const statusesById = new Map()

  appointments.forEach((appointment) => {
    const id = getRelationId(appointment, 'estadoCitaId', 'estadoCita')
    const name = getAppointmentStatusName(appointment)

    if (id && name && !statusesById.has(id)) {
      statusesById.set(id, name)
    }
  })

  return [...statusesById.entries()]
    .map(([id, name]) => ({ id, name }))
    .sort((first, second) =>
      first.name.localeCompare(second.name, 'es', { sensitivity: 'base' }),
    )
}

export function DailyAgendaPage() {
  const navigate = useNavigate()
  const { token } = useAuth()
  const [selectedDate, setSelectedDate] = useState(() => getTodayDateKey())
  const [appointments, setAppointments] = useState([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState('')
  const [employeeFilter, setEmployeeFilter] = useState('')
  const [statusFilter, setStatusFilter] = useState('')
  const [searchTerm, setSearchTerm] = useState('')
  const [isRefreshing, setIsRefreshing] = useState(false)
  const activeControllerRef = useRef(null)

  const loadAgenda = useCallback(
    async (date, { refreshing = false } = {}) => {
      const normalizedDate = getApiDateKey(date)

      activeControllerRef.current?.abort()

      if (!normalizedDate) {
        setAppointments([])
        setIsLoading(false)
        setIsRefreshing(false)
        setError('Selecciona una fecha válida para consultar la agenda.')
        return
      }

      const controller = new AbortController()
      activeControllerRef.current = controller
      setError('')
      setIsRefreshing(refreshing)
      setIsLoading(!refreshing)

      if (!refreshing) {
        setAppointments([])
      }

      try {
        const response = await getDailyAgenda(normalizedDate, {
          signal: controller.signal,
          token,
        })
        const nextAppointments = normalizeAgendaResponse(
          response,
          normalizedDate,
        )

        if (!controller.signal.aborted) {
          setAppointments(nextAppointments)
        }
      } catch (requestError) {
        if (!controller.signal.aborted) {
          setAppointments([])
          setError(getLoadErrorMessage(requestError))
        }
      } finally {
        if (!controller.signal.aborted) {
          setIsLoading(false)
          setIsRefreshing(false)
        }
      }
    },
    [token],
  )

  useEffect(() => {
    let isActive = true

    async function beginLoading() {
      await Promise.resolve()

      if (isActive) {
        await loadAgenda(selectedDate)
      }
    }

    void beginLoading()

    return () => {
      isActive = false
      activeControllerRef.current?.abort()
    }
  }, [loadAgenda, selectedDate])

  const employeeOptions = useMemo(
    () => getPresentEmployees(appointments),
    [appointments],
  )
  const statusOptions = useMemo(
    () => getPresentStatuses(appointments),
    [appointments],
  )
  const visibleAppointments = useMemo(() => {
    const filteredAppointments = filterAppointments(appointments, {
      searchTerm,
      statusFilter,
    }).filter(
      (appointment) =>
        !employeeFilter ||
        getRelationId(appointment, 'empleadoId', 'empleado') ===
          employeeFilter,
    )

    return sortAppointments(
      filteredAppointments,
      APPOINTMENT_SORT_OPTIONS.DATE_ASC,
    )
  }, [appointments, employeeFilter, searchTerm, statusFilter])
  const summary = useMemo(() => {
    const knownStatusNames = new Set(Object.values(APPOINTMENT_STATUS_NAMES))
    const counts = new Map()

    appointments.forEach((appointment) => {
      const statusName = getAppointmentStatusName(appointment)

      if (knownStatusNames.has(statusName)) {
        counts.set(statusName, (counts.get(statusName) ?? 0) + 1)
      }
    })

    return {
      total: appointments.length,
      statuses: Object.values(APPOINTMENT_STATUS_NAMES)
        .filter((statusName) => counts.has(statusName))
        .map((statusName) => ({
          name: statusName,
          count: counts.get(statusName),
        })),
    }
  }, [appointments])
  const formattedSelectedDate = formatApiDate(selectedDate)
  const hasActiveFilters = Boolean(
    employeeFilter || statusFilter || searchTerm,
  )

  function handleDateChange(event) {
    setAppointments([])
    setError('')
    setIsLoading(true)
    setSelectedDate(event.target.value)
  }

  function handleViewDetails(appointment) {
    navigate(`/citas/${encodeURIComponent(String(appointment.id))}`)
  }

  function clearFilters() {
    setEmployeeFilter('')
    setStatusFilter('')
    setSearchTerm('')
  }

  return (
    <section className="w-full space-y-6">
      <PageHeader
        title="Agenda diaria"
        description="Consulta la organización cronológica de las citas activas del establecimiento."
        actions={
          <Button
            type="button"
            variant="outline"
            disabled={isLoading || isRefreshing || !getApiDateKey(selectedDate)}
            onClick={() => loadAgenda(selectedDate, { refreshing: true })}
          >
            <RefreshCw
              aria-hidden="true"
              className={isRefreshing ? 'animate-spin' : ''}
            />
            {isRefreshing ? 'Actualizando...' : 'Actualizar agenda'}
          </Button>
        }
      />

      <Card>
        <CardContent className="grid gap-4 pt-6 md:grid-cols-[minmax(0,18rem)_1fr] md:items-end">
          <div className="space-y-2">
            <label className="text-sm font-medium" htmlFor="agenda-date">
              Fecha de la agenda
            </label>
            <Input
              id="agenda-date"
              type="date"
              required
              value={selectedDate}
              onChange={handleDateChange}
            />
          </div>
          {formattedSelectedDate ? (
            <div className="flex items-center gap-2 text-sm text-muted-foreground md:pb-2">
              <CalendarDays aria-hidden="true" className="size-4" />
              <span>Agenda del {formattedSelectedDate}</span>
            </div>
          ) : null}
        </CardContent>
      </Card>

      {isLoading ? (
        <LoadingState message="Cargando agenda del día..." />
      ) : error ? (
        <ErrorState
          title="No fue posible cargar la agenda"
          message={error}
          action={
            <Button
              type="button"
              disabled={!getApiDateKey(selectedDate)}
              onClick={() => loadAgenda(selectedDate)}
            >
              Intentar nuevamente
            </Button>
          }
        />
      ) : !appointments.length ? (
        <EmptyState title="No hay citas programadas para esta fecha." />
      ) : (
        <>
          <section aria-labelledby="agenda-summary-title" className="space-y-3">
            <h2 id="agenda-summary-title" className="text-lg font-semibold">
              Resumen del día
            </h2>
            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
              <Card>
                <CardContent className="pt-6">
                  <p className="text-sm text-muted-foreground">Total de citas</p>
                  <p className="mt-1 text-3xl font-bold">{summary.total}</p>
                </CardContent>
              </Card>
              {summary.statuses.map((status) => (
                <Card key={status.name}>
                  <CardContent className="pt-6">
                    <p className="text-sm text-muted-foreground">
                      {status.name}
                    </p>
                    <p className="mt-1 text-3xl font-bold">{status.count}</p>
                  </CardContent>
                </Card>
              ))}
            </div>
          </section>

          <div className="grid gap-4 rounded-xl border border-border bg-card p-4 sm:grid-cols-2 lg:grid-cols-3 lg:items-end">
            <div className="space-y-2 sm:col-span-2 lg:col-span-1">
              <label className="text-sm font-medium" htmlFor="agenda-search">
                Buscar en la agenda
              </label>
              <div className="relative">
                <Search
                  aria-hidden="true"
                  className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground"
                />
                <Input
                  id="agenda-search"
                  type="search"
                  className="pl-9"
                  placeholder="Cliente, empleado o servicio"
                  value={searchTerm}
                  onChange={(event) => setSearchTerm(event.target.value)}
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium" htmlFor="agenda-employee">
                Empleado
              </label>
              <select
                id="agenda-employee"
                className="flex h-9 w-full rounded-md border border-border bg-background px-3 py-1 text-sm shadow-xs outline-none focus-visible:ring-2 focus-visible:ring-ring"
                value={employeeFilter}
                onChange={(event) => setEmployeeFilter(event.target.value)}
              >
                <option value="">Todos</option>
                {employeeOptions.map((employee) => (
                  <option key={employee.id} value={employee.id}>
                    {employee.name}
                  </option>
                ))}
              </select>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium" htmlFor="agenda-status">
                Estado
              </label>
              <select
                id="agenda-status"
                className="flex h-9 w-full rounded-md border border-border bg-background px-3 py-1 text-sm shadow-xs outline-none focus-visible:ring-2 focus-visible:ring-ring"
                value={statusFilter}
                onChange={(event) => setStatusFilter(event.target.value)}
              >
                <option value="">Todos</option>
                {statusOptions.map((status) => (
                  <option key={status.id} value={status.id}>
                    {status.name}
                  </option>
                ))}
              </select>
            </div>

            {hasActiveFilters ? (
              <div className="sm:col-span-2 lg:col-span-3">
                <Button type="button" variant="outline" onClick={clearFilters}>
                  Limpiar filtros
                </Button>
              </div>
            ) : null}
          </div>

          {!visibleAppointments.length ? (
            <EmptyState
              title="No se encontraron citas con los filtros seleccionados."
              description="Prueba con otra búsqueda, empleado o estado."
              action={
                <Button type="button" variant="outline" onClick={clearFilters}>
                  Limpiar filtros
                </Button>
              }
            />
          ) : (
            <DailyAgendaList
              appointments={visibleAppointments}
              onViewDetails={handleViewDetails}
            />
          )}
        </>
      )}
    </section>
  )
}
