import { useEffect, useState } from 'react'
import { ArrowLeft } from 'lucide-react'
import { Link, useParams } from 'react-router-dom'

import { PageHeader } from '@/components/common/PageHeader'
import { AdditionalDetail } from '@/components/data-display/AdditionalDetail'
import { EmptyState } from '@/components/feedback/EmptyState'
import { ErrorState } from '@/components/feedback/ErrorState'
import { LoadingState } from '@/components/feedback/LoadingState'
import { Button } from '@/components/ui/button'
import { getErrorMessage } from '@/lib/getErrorMessage'
import { getAdditionalById } from '@/services/additionalsService'

const INVALID_RESPONSE_MESSAGE =
  'No fue posible obtener la información del servicio adicional.'

function getAdditionalData(response) {
  if (
    !response?.data ||
    typeof response.data !== 'object' ||
    Array.isArray(response.data)
  ) {
    throw new Error(INVALID_RESPONSE_MESSAGE)
  }

  return response.data
}

function BackToAdditionalsButton({ variant = 'outline' }) {
  return (
    <Button asChild type="button" variant={variant}>
      <Link to="/adicionales">
        <ArrowLeft aria-hidden="true" />
        Volver a adicionales
      </Link>
    </Button>
  )
}

export function AdditionalDetailPage() {
  const { id } = useParams()
  const [additional, setAdditional] = useState(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState('')
  const [isUnavailable, setIsUnavailable] = useState(false)
  const [isInvalidId, setIsInvalidId] = useState(false)
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
        setAdditional(null)
        setIsUnavailable(false)
        setIsInvalidId(false)

        return getAdditionalById(id)
      })
      .then((response) => {
        if (!isActive || response === null) {
          return
        }

        setAdditional(getAdditionalData(response))
      })
      .catch((requestError) => {
        if (!isActive) {
          return
        }

        if (requestError?.status === 404) {
          setIsUnavailable(true)
          return
        }

        if (requestError?.code === 'INVALID_ADDITIONAL_ID') {
          setIsInvalidId(true)
          setError(requestError.message)
          return
        }

        setError(
          requestError?.message === INVALID_RESPONSE_MESSAGE
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
    return <LoadingState message="Cargando servicio adicional..." />
  }

  if (isUnavailable) {
    return (
      <EmptyState
        title="El servicio adicional solicitado no existe o no está disponible."
        description="Puede que haya sido eliminado o que la dirección no sea correcta."
        action={<BackToAdditionalsButton variant="default" />}
      />
    )
  }

  if (error) {
    return (
      <ErrorState
        title={
          isInvalidId
            ? 'El identificador del servicio adicional no es válido'
            : 'No fue posible cargar el servicio adicional'
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
            <BackToAdditionalsButton />
          </div>
        }
      />
    )
  }

  if (!additional) {
    return null
  }

  return (
    <section className="w-full space-y-6">
      <PageHeader
        title="Detalle del servicio adicional"
        description="Consulta la información general y disponibilidad del complemento."
        actions={<BackToAdditionalsButton />}
      />
      <AdditionalDetail additional={additional} />
    </section>
  )
}
