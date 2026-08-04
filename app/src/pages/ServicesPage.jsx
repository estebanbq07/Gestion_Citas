import { useCallback, useEffect, useMemo, useState } from 'react'
import { Search } from 'lucide-react'
import { useNavigate } from 'react-router-dom'

import { PageHeader } from '@/components/common/PageHeader'
import { ServiceList } from '@/components/data-display/ServiceList'
import { EmptyState } from '@/components/feedback/EmptyState'
import { ErrorState } from '@/components/feedback/ErrorState'
import { LoadingState } from '@/components/feedback/LoadingState'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { useAuth } from '@/context/useAuth'
import { getErrorMessage } from '@/lib/getErrorMessage'
import { filterServices, sortServices } from '@/lib/serviceUtils'
import { getServices } from '@/services/servicesService'

export function ServicesPage() {
  const { isAuthenticated } = useAuth()
  const navigate = useNavigate()
  const [services, setServices] = useState([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState('')
  const [searchTerm, setSearchTerm] = useState('')
  const [sortOption, setSortOption] = useState('nameAsc')

  const requestServices = useCallback(async () => {
    const response = await getServices()

    if (!Array.isArray(response?.data)) {
      throw new Error('No fue posible obtener el listado de servicios.')
    }

    return response.data
  }, [])

  useEffect(() => {
    if (!isAuthenticated) {
      return undefined
    }

    let isActive = true

    requestServices()
      .then((data) => {
        if (isActive) {
          setServices(data)
        }
      })
      .catch((requestError) => {
        if (isActive) {
          setError(getErrorMessage(requestError))
        }
      })
      .finally(() => {
        if (isActive) {
          setIsLoading(false)
        }
      })

    return () => {
      isActive = false
    }
  }, [isAuthenticated, requestServices])

  const visibleServices = useMemo(
    () => sortServices(filterServices(services, searchTerm), sortOption),
    [services, searchTerm, sortOption],
  )

  function handleViewDetails(service) {
    navigate(`/servicios/${service.id}`)
  }

  function handleRetry() {
    setIsLoading(true)
    setError('')
    requestServices()
      .then(setServices)
      .catch((requestError) => setError(getErrorMessage(requestError)))
      .finally(() => setIsLoading(false))
  }

  if (isLoading) {
    return <LoadingState message="Cargando servicios..." />
  }

  if (error) {
    return (
      <ErrorState
        title="No fue posible cargar los servicios"
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
        title="Servicios"
        description="Consulta los servicios disponibles y su información general."
      />

      {services.length ? (
        <div className="grid gap-4 rounded-xl border border-border bg-card p-4 sm:grid-cols-[1fr_auto] sm:items-end">
          <div className="space-y-2">
            <label className="text-sm font-medium" htmlFor="service-search">
              Buscar servicios
            </label>
            <div className="relative">
              <Search
                aria-hidden="true"
                className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground"
              />
              <Input
                id="service-search"
                type="search"
                placeholder="Nombre o descripción"
                className="pl-9"
                value={searchTerm}
                onChange={(event) => setSearchTerm(event.target.value)}
              />
            </div>
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium" htmlFor="service-sort">
              Ordenar por
            </label>
            <select
              id="service-sort"
              className="flex h-9 w-full rounded-md border border-border bg-background px-3 py-1 text-sm shadow-xs outline-none focus-visible:ring-2 focus-visible:ring-ring sm:w-56"
              value={sortOption}
              onChange={(event) => setSortOption(event.target.value)}
            >
              <option value="nameAsc">Nombre: A a Z</option>
              <option value="nameDesc">Nombre: Z a A</option>
              <option value="priceAsc">Precio: menor a mayor</option>
              <option value="priceDesc">Precio: mayor a menor</option>
              <option value="durationAsc">Duración: menor a mayor</option>
              <option value="durationDesc">Duración: mayor a menor</option>
            </select>
          </div>
        </div>
      ) : null}

      {!services.length ? (
        <EmptyState
          title="No hay servicios disponibles."
          description="Cuando haya servicios registrados, aparecerán en esta sección."
        />
      ) : !visibleServices.length ? (
        <EmptyState
          title="No se encontraron servicios con ese criterio."
          description="Prueba con otro nombre o descripción."
        />
      ) : (
        <ServiceList services={visibleServices} onViewDetails={handleViewDetails} />
      )}
    </section>
  )
}
