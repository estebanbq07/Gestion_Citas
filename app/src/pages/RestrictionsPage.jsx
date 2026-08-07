import {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react'
import { Search } from 'lucide-react'
import { useNavigate } from 'react-router-dom'

import { PageHeader } from '@/components/common/PageHeader'
import { RestrictionList } from '@/components/data-display/RestrictionList'
import { EmptyState } from '@/components/feedback/EmptyState'
import { ErrorState } from '@/components/feedback/ErrorState'
import { LoadingState } from '@/components/feedback/LoadingState'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { getErrorMessage } from '@/lib/getErrorMessage'
import {
  filterRestrictions,
  filterRestrictionsByScope,
  RESTRICTION_SCOPES,
  sortRestrictions,
} from '@/lib/restrictionUtils'
import { getRestrictions } from '@/services/restrictionsService'

const INVALID_RESPONSE_MESSAGE =
  'No fue posible obtener el listado de restricciones de horario.'

function getLoadErrorMessage(error) {
  return error?.message === INVALID_RESPONSE_MESSAGE
    ? error.message
    : getErrorMessage(error)
}

export function RestrictionsPage() {
  const navigate = useNavigate()
  const [restrictions, setRestrictions] = useState([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState('')
  const [searchTerm, setSearchTerm] = useState('')
  const [typeFilter, setTypeFilter] = useState(RESTRICTION_SCOPES.ALL)
  const [sortOption, setSortOption] = useState('dateDesc')
  const [retryCount, setRetryCount] = useState(0)
  const isRequestingRef = useRef(true)

  const requestRestrictions = useCallback(async () => {
    const response = await getRestrictions()

    if (!Array.isArray(response?.data)) {
      throw new Error(INVALID_RESPONSE_MESSAGE)
    }

    return response.data
  }, [])

  useEffect(() => {
    let isActive = true

    requestRestrictions()
      .then((data) => {
        if (isActive) {
          setRestrictions(data)
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
  }, [requestRestrictions, retryCount])

  const visibleRestrictions = useMemo(() => {
    const matchingRestrictions = filterRestrictions(
      restrictions,
      searchTerm,
    )
    const scopedRestrictions = filterRestrictionsByScope(
      matchingRestrictions,
      typeFilter,
    )

    return sortRestrictions(scopedRestrictions, sortOption)
  }, [restrictions, searchTerm, sortOption, typeFilter])

  function handleViewDetails(restriction) {
    navigate(
      `/restricciones/${encodeURIComponent(String(restriction.id))}`,
    )
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
    return <LoadingState message="Cargando restricciones de horario..." />
  }

  if (error) {
    return (
      <ErrorState
        title="No fue posible cargar las restricciones de horario"
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
        title="Restricciones de horario"
        description="Consulta los cierres del establecimiento y los bloqueos asignados a empleados."
      />

      {restrictions.length ? (
        <div className="grid gap-4 rounded-xl border border-border bg-card p-4 md:grid-cols-3 md:items-end">
          <div className="space-y-2">
            <label className="text-sm font-medium" htmlFor="restriction-search">
              Buscar restricciones
            </label>
            <div className="relative">
              <Search
                aria-hidden="true"
                className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground"
              />
              <Input
                id="restriction-search"
                type="search"
                placeholder="Motivo, tipo o empleado"
                className="pl-9"
                value={searchTerm}
                onChange={(event) => setSearchTerm(event.target.value)}
              />
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium" htmlFor="restriction-type">
              Alcance
            </label>
            <select
              id="restriction-type"
              className="flex h-9 w-full rounded-md border border-border bg-background px-3 py-1 text-sm shadow-xs outline-none focus-visible:ring-2 focus-visible:ring-ring"
              value={typeFilter}
              onChange={(event) => setTypeFilter(event.target.value)}
            >
              <option value={RESTRICTION_SCOPES.ALL}>Todas</option>
              <option value={RESTRICTION_SCOPES.ESTABLISHMENT}>
                Establecimiento
              </option>
              <option value={RESTRICTION_SCOPES.EMPLOYEE}>Empleado</option>
            </select>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium" htmlFor="restriction-sort">
              Ordenar por fecha
            </label>
            <select
              id="restriction-sort"
              className="flex h-9 w-full rounded-md border border-border bg-background px-3 py-1 text-sm shadow-xs outline-none focus-visible:ring-2 focus-visible:ring-ring"
              value={sortOption}
              onChange={(event) => setSortOption(event.target.value)}
            >
              <option value="dateDesc">Más recientes primero</option>
              <option value="dateAsc">Más antiguas primero</option>
            </select>
          </div>
        </div>
      ) : null}

      {!restrictions.length ? (
        <EmptyState
          title="No hay restricciones de horario disponibles."
          description="Cuando haya restricciones registradas, aparecerán en esta sección."
        />
      ) : !visibleRestrictions.length ? (
        <EmptyState
          title="No se encontraron restricciones con esos criterios."
          description="Prueba con otra búsqueda o selecciona un alcance diferente."
        />
      ) : (
        <RestrictionList
          restrictions={visibleRestrictions}
          onViewDetails={handleViewDetails}
        />
      )}
    </section>
  )
}
