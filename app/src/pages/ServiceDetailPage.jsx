import { useEffect, useState } from 'react'
import { ArrowLeft } from 'lucide-react'
import { Link, useParams } from 'react-router-dom'

import { PageHeader } from '@/components/common/PageHeader'
import { ServiceDetail } from '@/components/data-display/ServiceDetail'
import { EmptyState } from '@/components/feedback/EmptyState'
import { ErrorState } from '@/components/feedback/ErrorState'
import { LoadingState } from '@/components/feedback/LoadingState'
import { Button } from '@/components/ui/button'
import { getErrorMessage } from '@/lib/getErrorMessage'
import { getServiceById } from '@/services/servicesService'

export function ServiceDetailPage() {
  const { id } = useParams()
  const [service, setService] = useState(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState('')
  const [isUnavailable, setIsUnavailable] = useState(false)
  const [retryCount, setRetryCount] = useState(0)

  useEffect(() => {
    let isActive = true

    Promise.resolve()
      .then(() => {
        if (!isActive) {
          return null
        }

        setIsLoading(true)
        setError('')
        setService(null)
        setIsUnavailable(false)

        return getServiceById(id)
      })
      .then((response) => {
        if (!isActive || response === null) {
          return
        }

        if (!response?.data || typeof response.data !== 'object') {
          throw new Error('No fue posible obtener la información del servicio.')
        }

        setService(response.data)
      })
      .catch((requestError) => {
        if (!isActive) {
          return
        }

        if (requestError?.status === 404) {
          setIsUnavailable(true)
          return
        }

        setError(
          requestError?.code === 'INVALID_SERVICE_ID'
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

  if (isLoading) {
    return <LoadingState message="Cargando servicio..." />
  }

  if (isUnavailable) {
    return (
      <EmptyState
        title="El servicio solicitado no existe o no está disponible"
        description="Puede que haya sido eliminado o que la dirección no sea correcta."
        action={
          <Button asChild type="button">
            <Link to="/servicios">
              <ArrowLeft aria-hidden="true" />
              Volver a servicios
            </Link>
          </Button>
        }
      />
    )
  }

  if (error) {
    return (
      <ErrorState
        title="No fue posible cargar el servicio"
        message={error}
        action={
          <div className="flex flex-wrap justify-center gap-2">
            <Button
              type="button"
              onClick={() => setRetryCount((currentCount) => currentCount + 1)}
              disabled={isLoading}
            >
              Intentar nuevamente
            </Button>
            <Button asChild type="button" variant="outline">
              <Link to="/servicios">
                <ArrowLeft aria-hidden="true" />
                Volver a servicios
              </Link>
            </Button>
          </div>
        }
      />
    )
  }

  if (!service) {
    return null
  }

  return (
    <section className="w-full space-y-6">
      <PageHeader
        title="Detalle del servicio"
        description="Consulta la información general y disponibilidad del servicio."
        actions={
          <Button asChild type="button" variant="outline">
            <Link to="/servicios">
              <ArrowLeft aria-hidden="true" />
              Volver a servicios
            </Link>
          </Button>
        }
      />
      <ServiceDetail service={service} />
    </section>
  )
}
