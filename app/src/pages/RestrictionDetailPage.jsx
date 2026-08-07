import { useEffect, useState } from 'react'
import { ArrowLeft } from 'lucide-react'
import { Link, useParams } from 'react-router-dom'

import { PageHeader } from '@/components/common/PageHeader'
import { RestrictionDetail } from '@/components/data-display/RestrictionDetail'
import { EmptyState } from '@/components/feedback/EmptyState'
import { ErrorState } from '@/components/feedback/ErrorState'
import { LoadingState } from '@/components/feedback/LoadingState'
import { Button } from '@/components/ui/button'
import { getErrorMessage } from '@/lib/getErrorMessage'
import { isValidRestrictionId } from '@/lib/restrictionUtils'
import { getRestrictionById } from '@/services/restrictionsService'

const INVALID_RESPONSE_MESSAGE =
  'No fue posible obtener la información de la restricción de horario.'
const INVALID_ID_MESSAGE =
  'El identificador de la restricción no es válido.'

function getRestrictionData(response) {
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

function BackToRestrictionsButton({ variant = 'outline' }) {
  return (
    <Button asChild type="button" variant={variant}>
      <Link to="/restricciones">
        <ArrowLeft aria-hidden="true" />
        Volver a restricciones
      </Link>
    </Button>
  )
}

export function RestrictionDetailPage() {
  const { id } = useParams()
  const [restriction, setRestriction] = useState(null)
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
        setRestriction(null)
        setIsUnavailable(false)
        setIsInvalidId(false)

        if (!isValidRestrictionId(id)) {
          setIsInvalidId(true)
          setError(INVALID_ID_MESSAGE)

          return null
        }

        return getRestrictionById(id)
      })
      .then((response) => {
        if (isActive && response !== null) {
          setRestriction(getRestrictionData(response))
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
  }, [id, retryCount])

  function handleRetry() {
    setIsLoading(true)
    setError('')
    setRetryCount((currentCount) => currentCount + 1)
  }

  if (isLoading) {
    return <LoadingState message="Cargando restricción de horario..." />
  }

  if (isUnavailable) {
    return (
      <EmptyState
        title="La restricción solicitada no existe o no está disponible."
        description="Puede que la dirección no sea correcta."
        action={<BackToRestrictionsButton variant="default" />}
      />
    )
  }

  if (error) {
    return (
      <ErrorState
        title={
          isInvalidId
            ? 'El identificador de la restricción no es válido'
            : 'No fue posible cargar la restricción de horario'
        }
        message={error}
        action={
          <div className="flex flex-wrap justify-center gap-2">
            {!isInvalidId ? (
              <Button type="button" onClick={handleRetry}>
                Intentar nuevamente
              </Button>
            ) : null}
            <BackToRestrictionsButton />
          </div>
        }
      />
    )
  }

  if (!restriction) {
    return null
  }

  return (
    <section className="w-full space-y-6">
      <PageHeader
        title="Detalle de la restricción"
        description="Consulta el alcance, fecha, horario y motivo de la restricción."
        actions={<BackToRestrictionsButton />}
      />
      <RestrictionDetail restriction={restriction} />
    </section>
  )
}
