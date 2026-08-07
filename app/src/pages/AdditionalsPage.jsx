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
import { AdditionalList } from '@/components/data-display/AdditionalList'
import { EmptyState } from '@/components/feedback/EmptyState'
import { ErrorState } from '@/components/feedback/ErrorState'
import { LoadingState } from '@/components/feedback/LoadingState'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import {
  filterAdditionals,
  sortAdditionals,
} from '@/lib/additionalUtils'
import { getErrorMessage } from '@/lib/getErrorMessage'
import { getAdditionals } from '@/services/additionalsService'

const INVALID_RESPONSE_MESSAGE =
  'No fue posible obtener el listado de servicios adicionales.'

function getLoadErrorMessage(error) {
  return error?.message === INVALID_RESPONSE_MESSAGE
    ? error.message
    : getErrorMessage(error)
}

export function AdditionalsPage() {
  const navigate = useNavigate()
  const [additionals, setAdditionals] = useState([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState('')
  const [searchTerm, setSearchTerm] = useState('')
  const [sortOption, setSortOption] = useState('nameAsc')
  const [retryCount, setRetryCount] = useState(0)
  const isRequestingRef = useRef(true)

  const requestAdditionals = useCallback(async () => {
    const response = await getAdditionals()

    if (!Array.isArray(response?.data)) {
      throw new Error(INVALID_RESPONSE_MESSAGE)
    }

    return response.data
  }, [])

  useEffect(() => {
    let isActive = true

    requestAdditionals()
      .then((data) => {
        if (isActive) {
          setAdditionals(data)
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
  }, [requestAdditionals, retryCount])

  const visibleAdditionals = useMemo(
    () =>
      sortAdditionals(
        filterAdditionals(additionals, searchTerm),
        sortOption,
      ),
    [additionals, searchTerm, sortOption],
  )

  function handleViewDetails(additional) {
    navigate(
      `/adicionales/${encodeURIComponent(String(additional.id))}`,
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
    return <LoadingState message="Cargando servicios adicionales..." />
  }

  if (error) {
    return (
      <ErrorState
        title="No fue posible cargar los servicios adicionales"
        message={error}
        action={
          <Button
            type="button"
            onClick={handleRetry}
          >
            Intentar nuevamente
          </Button>
        }
      />
    )
  }

  return (
    <section className="w-full space-y-6">
      <PageHeader
        title="Servicios adicionales"
        description="Consulta los complementos disponibles y su información general."
      />

      {additionals.length ? (
        <div className="grid gap-4 rounded-xl border border-border bg-card p-4 sm:grid-cols-[1fr_auto] sm:items-end">
          <div className="space-y-2">
            <label className="text-sm font-medium" htmlFor="additional-search">
              Buscar servicios adicionales
            </label>
            <div className="relative">
              <Search
                aria-hidden="true"
                className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground"
              />
              <Input
                id="additional-search"
                type="search"
                placeholder="Nombre o descripción"
                className="pl-9"
                value={searchTerm}
                onChange={(event) => setSearchTerm(event.target.value)}
              />
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium" htmlFor="additional-sort">
              Ordenar por
            </label>
            <select
              id="additional-sort"
              className="flex h-9 w-full rounded-md border border-border bg-background px-3 py-1 text-sm shadow-xs outline-none focus-visible:ring-2 focus-visible:ring-ring sm:w-56"
              value={sortOption}
              onChange={(event) => setSortOption(event.target.value)}
            >
              <option value="nameAsc">Nombre: A a Z</option>
              <option value="nameDesc">Nombre: Z a A</option>
              <option value="priceAsc">Precio: menor a mayor</option>
              <option value="priceDesc">Precio: mayor a menor</option>
            </select>
          </div>
        </div>
      ) : null}

      {!additionals.length ? (
        <EmptyState
          title="No hay servicios adicionales disponibles."
          description="Cuando haya servicios adicionales registrados, aparecerán en esta sección."
        />
      ) : !visibleAdditionals.length ? (
        <EmptyState
          title="No se encontraron servicios adicionales con ese criterio."
          description="Prueba con otro nombre o descripción."
        />
      ) : (
        <AdditionalList
          additionals={visibleAdditionals}
          onViewDetails={handleViewDetails}
        />
      )}
    </section>
  )
}
