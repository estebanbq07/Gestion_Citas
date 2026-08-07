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
import { EmployeeList } from '@/components/data-display/EmployeeList'
import { EmptyState } from '@/components/feedback/EmptyState'
import { ErrorState } from '@/components/feedback/ErrorState'
import { LoadingState } from '@/components/feedback/LoadingState'
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { useAuth } from '@/context/useAuth'
import { filterEmployees, sortEmployees } from '@/lib/employeeUtils'
import { getErrorMessage } from '@/lib/getErrorMessage'
import { ROLES } from '@/lib/permissions'
import { getEmployees } from '@/services/employeesService'

const INVALID_RESPONSE_MESSAGE =
  'No fue posible obtener el listado de empleados.'

function getLoadErrorMessage(error) {
  return error?.message === INVALID_RESPONSE_MESSAGE
    ? error.message
    : getErrorMessage(error)
}

export function EmployeesPage() {
  const location = useLocation()
  const navigate = useNavigate()
  const { role, token } = useAuth()
  const [employees, setEmployees] = useState([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState('')
  const [searchTerm, setSearchTerm] = useState('')
  const [sortOption, setSortOption] = useState('nameAsc')
  const [retryCount, setRetryCount] = useState(0)
  const [successMessage] = useState(() => {
    const message = location.state?.successMessage

    return typeof message === 'string' ? message.trim() : ''
  })
  const isRequestingRef = useRef(true)

  useEffect(() => {
    if (successMessage) {
      navigate(location.pathname, { replace: true, state: null })
    }
  }, [location.pathname, navigate, successMessage])

  const requestEmployees = useCallback(async () => {
    const response = await getEmployees({ token })

    if (!Array.isArray(response?.data)) {
      throw new Error(INVALID_RESPONSE_MESSAGE)
    }

    return response.data
  }, [token])

  useEffect(() => {
    let isActive = true

    Promise.resolve()
      .then(() => {
        if (!isActive) {
          return null
        }

        setError('')

        return requestEmployees()
      })
      .then((data) => {
        if (isActive && data !== null) {
          setEmployees(data)
        }
      })
      .catch((requestError) => {
        if (isActive) {
          setError(getLoadErrorMessage(requestError))
        }
      })
      .finally(() => {
        isRequestingRef.current = false

        if (isActive) {
          setIsLoading(false)
        }
      })

    return () => {
      isActive = false
    }
  }, [requestEmployees, retryCount])

  const visibleEmployees = useMemo(
    () => sortEmployees(filterEmployees(employees, searchTerm), sortOption),
    [employees, searchTerm, sortOption],
  )

  function handleViewDetails(employee) {
    navigate(`/empleados/${encodeURIComponent(String(employee.id))}`)
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
    return <LoadingState message="Cargando empleados..." />
  }

  if (error) {
    return (
      <ErrorState
        title="No fue posible cargar los empleados"
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
        title="Empleados"
        description="Consulta el personal, sus especialidades y servicios asignados."
        actions={
          role?.nombre === ROLES.ADMIN ? (
            <Button
              type="button"
              onClick={() => navigate('/empleados/nuevo')}
            >
              <Plus aria-hidden="true" />
              Nuevo empleado
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

      {employees.length ? (
        <div className="grid gap-4 rounded-xl border border-border bg-card p-4 sm:grid-cols-[1fr_auto] sm:items-end">
          <div className="space-y-2">
            <label className="text-sm font-medium" htmlFor="employee-search">
              Buscar empleados
            </label>
            <div className="relative">
              <Search
                aria-hidden="true"
                className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground"
              />
              <Input
                id="employee-search"
                type="search"
                placeholder="Código, nombre o especialidad"
                className="pl-9"
                value={searchTerm}
                onChange={(event) => setSearchTerm(event.target.value)}
              />
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium" htmlFor="employee-sort">
              Ordenar por
            </label>
            <select
              id="employee-sort"
              className="flex h-9 w-full rounded-md border border-border bg-background px-3 py-1 text-sm shadow-xs outline-none focus-visible:ring-2 focus-visible:ring-ring sm:w-56"
              value={sortOption}
              onChange={(event) => setSortOption(event.target.value)}
            >
              <option value="nameAsc">Nombre: A a Z</option>
              <option value="nameDesc">Nombre: Z a A</option>
              <option value="codeAsc">Código: A a Z</option>
              <option value="codeDesc">Código: Z a A</option>
              <option value="specialtyAsc">Especialidad: A a Z</option>
            </select>
          </div>
        </div>
      ) : null}

      {!employees.length ? (
        <EmptyState
          title="No hay empleados registrados."
          description="Cuando haya empleados registrados, aparecerán en esta sección."
        />
      ) : !visibleEmployees.length ? (
        <EmptyState
          title="No se encontraron empleados con ese criterio."
          description="Prueba con otro código, nombre o especialidad."
        />
      ) : (
        <EmployeeList
          employees={visibleEmployees}
          onViewDetails={handleViewDetails}
        />
      )}
    </section>
  )
}
