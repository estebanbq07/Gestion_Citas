import { useEffect, useState } from 'react'
import { ArrowLeft } from 'lucide-react'
import { Link, useParams } from 'react-router-dom'

import { PageHeader } from '@/components/common/PageHeader'
import { ScheduleDetail } from '@/components/data-display/ScheduleDetail'
import { EmptyState } from '@/components/feedback/EmptyState'
import { ErrorState } from '@/components/feedback/ErrorState'
import { LoadingState } from '@/components/feedback/LoadingState'
import { Button } from '@/components/ui/button'
import { getErrorMessage } from '@/lib/getErrorMessage'
import { isValidScheduleId } from '@/lib/scheduleUtils'
import { getScheduleById } from '@/services/schedulesService'

const INVALID_RESPONSE_MESSAGE =
  'No fue posible obtener la información del horario de atención.'
const INVALID_ID_MESSAGE = 'El identificador del horario no es válido.'

function getScheduleData(response) {
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

function BackToSchedulesButton({ variant = 'outline' }) {
  return (
    <Button asChild type="button" variant={variant}>
      <Link to="/horarios">
        <ArrowLeft aria-hidden="true" />
        Volver a horarios
      </Link>
    </Button>
  )
}

export function ScheduleDetailPage() {
  const { id } = useParams()
  const [schedule, setSchedule] = useState(null)
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
        setSchedule(null)
        setIsUnavailable(false)
        setIsInvalidId(false)

        if (!isValidScheduleId(id)) {
          setIsInvalidId(true)
          setError(INVALID_ID_MESSAGE)

          return null
        }

        return getScheduleById(id)
      })
      .then((response) => {
        if (isActive && response !== null) {
          setSchedule(getScheduleData(response))
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

  if (isLoading) {
    return <LoadingState message="Cargando horario de atención..." />
  }

  if (isUnavailable) {
    return (
      <EmptyState
        title="El horario de atención solicitado no existe o no está disponible."
        description="Puede que haya sido eliminado o que la dirección no sea correcta."
        action={<BackToSchedulesButton variant="default" />}
      />
    )
  }

  if (error) {
    return (
      <ErrorState
        title={
          isInvalidId
            ? 'El identificador del horario no es válido'
            : 'No fue posible cargar el horario de atención'
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
            <BackToSchedulesButton />
          </div>
        }
      />
    )
  }

  if (!schedule) {
    return null
  }

  return (
    <section className="w-full space-y-6">
      <PageHeader
        title="Detalle del horario de atención"
        description="Consulta el día, rango horario y estado del establecimiento."
        actions={<BackToSchedulesButton />}
      />

      <ScheduleDetail schedule={schedule} />
    </section>
  )
}
