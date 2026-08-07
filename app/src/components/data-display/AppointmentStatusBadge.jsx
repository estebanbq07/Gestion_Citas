import { Badge } from '@/components/ui/badge'
import { APPOINTMENT_STATUS_NAMES } from '@/lib/appointmentUtils'

const STATUS_STYLES = Object.freeze({
  [APPOINTMENT_STATUS_NAMES.PENDING]:
    'border-amber-500/40 bg-amber-500/10 text-amber-800 dark:text-amber-300',
  [APPOINTMENT_STATUS_NAMES.CONFIRMED]:
    'border-primary/30 bg-primary/10 text-primary',
  [APPOINTMENT_STATUS_NAMES.IN_PROGRESS]:
    'border-violet-500/40 bg-violet-500/10 text-violet-800 dark:text-violet-300',
  [APPOINTMENT_STATUS_NAMES.FINALIZED]:
    'border-emerald-500/40 bg-emerald-500/10 text-emerald-800 dark:text-emerald-300',
  [APPOINTMENT_STATUS_NAMES.CANCELED]:
    'border-destructive/40 bg-destructive/5 text-destructive',
})

function getStatusName(status) {
  if (typeof status === 'string') {
    return status.trim()
  }

  return typeof status?.nombre === 'string' ? status.nombre.trim() : ''
}

export function AppointmentStatusBadge({ status }) {
  const statusName = getStatusName(status)

  if (!statusName) {
    return null
  }

  return (
    <Badge
      className={STATUS_STYLES[statusName]}
      variant="outline"
    >
      {statusName}
    </Badge>
  )
}
