import {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react'
import { useNavigate } from 'react-router-dom'

import { PageHeader } from '@/components/common/PageHeader'
import { ScheduleList } from '@/components/data-display/ScheduleList'
import { EmptyState } from '@/components/feedback/EmptyState'
import { ErrorState } from '@/components/feedback/ErrorState'
import { LoadingState } from '@/components/feedback/LoadingState'
import { Button } from '@/components/ui/button'
import { getErrorMessage } from '@/lib/getErrorMessage'
import {
  SCHEDULE_SORT_OPTIONS,
  sortSchedules,
} from '@/lib/scheduleUtils'
import { getSchedules } from '@/services/schedulesService'

const INVALID_RESPONSE_MESSAGE =
  'No fue posible obtener el listado de horarios de atención.'

function getLoadErrorMessage(error) {
  return error?.message === INVALID_RESPONSE_MESSAGE
    ? error.message
    : getErrorMessage(error)
}

export function SchedulesPage() {
  const navigate = useNavigate()
  const [schedules, setSchedules] = useState([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState('')
  const [sortOption, setSortOption] = useState(
    SCHEDULE_SORT_OPTIONS.DAY_AND_TIME,
  )
  const [retryCount, setRetryCount] = useState(0)
  const isRequestingRef = useRef(true)

  const requestSchedules = useCallback(async () => {
    const response = await getSchedules()

    if (!Array.isArray(response?.data)) {
      throw new Error(INVALID_RESPONSE_MESSAGE)
    }

    return response.data
  }, [])

  useEffect(() => {
    let isActive = true

    Promise.resolve()
      .then(() => {
        if (!isActive) {
          return null
        }

        setError('')

        return requestSchedules()
      })
      .then((data) => {
        if (isActive && data !== null) {
          setSchedules(data)
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
  }, [requestSchedules, retryCount])

  const sortedSchedules = useMemo(
    () => sortSchedules(schedules, sortOption),
    [schedules, sortOption],
  )

  function handleViewDetails(schedule) {
    navigate(`/horarios/${encodeURIComponent(String(schedule.id))}`)
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
    return <LoadingState message="Cargando horarios de atención..." />
  }

  if (error) {
    return (
      <ErrorState
        title="No fue posible cargar los horarios de atención"
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
        title="Horarios de atención"
        description="Consulta los días y rangos de atención del establecimiento."
      />

      {schedules.length ? (
        <div className="flex flex-col gap-2 rounded-xl border border-border bg-card p-4 sm:ml-auto sm:w-fit">
          <label className="text-sm font-medium" htmlFor="schedule-sort">
            Ordenar por
          </label>
          <select
            id="schedule-sort"
            className="flex h-9 w-full rounded-md border border-border bg-background px-3 py-1 text-sm shadow-xs outline-none focus-visible:ring-2 focus-visible:ring-ring sm:w-64"
            value={sortOption}
            onChange={(event) => setSortOption(event.target.value)}
          >
            <option value={SCHEDULE_SORT_OPTIONS.DAY_AND_TIME}>
              Día de la semana y hora
            </option>
            <option value={SCHEDULE_SORT_OPTIONS.OPENING_TIME}>
              Hora de apertura
            </option>
          </select>
        </div>
      ) : null}

      {!schedules.length ? (
        <EmptyState
          title="No hay horarios de atención disponibles."
          description="Cuando existan horarios configurados, aparecerán en esta sección."
        />
      ) : (
        <ScheduleList
          schedules={sortedSchedules}
          onViewDetails={handleViewDetails}
        />
      )}
    </section>
  )
}
