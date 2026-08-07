import {
  CheckCircle2,
  CircleX,
  Flag,
  Pencil,
  Play,
  RotateCcw,
} from 'lucide-react'
import { Link } from 'react-router-dom'

import { Button } from '@/components/ui/button'
import { APPOINTMENT_STATUS_NAMES } from '@/lib/appointmentUtils'

const STATUS_ACTION_CONFIG = Object.freeze({
  [APPOINTMENT_STATUS_NAMES.PENDING]: {
    label: 'Marcar como pendiente',
    icon: RotateCcw,
    variant: 'outline',
  },
  [APPOINTMENT_STATUS_NAMES.CONFIRMED]: {
    label: 'Confirmar cita',
    icon: CheckCircle2,
    variant: 'default',
  },
  [APPOINTMENT_STATUS_NAMES.IN_PROGRESS]: {
    label: 'Iniciar atención',
    icon: Play,
    variant: 'default',
  },
  [APPOINTMENT_STATUS_NAMES.FINALIZED]: {
    label: 'Finalizar cita',
    icon: Flag,
    variant: 'default',
  },
})

function getAppointmentStatusActionConfig(statusName) {
  return STATUS_ACTION_CONFIG[statusName] ?? null
}

export function AppointmentActions({
  appointmentId,
  availableActions,
  statusTargets,
  isLoading,
  onCancel,
  onStatusChange,
}) {
  const actionSet = new Set(
    Array.isArray(availableActions) ? availableActions : [],
  )
  const targets = Array.isArray(statusTargets) ? statusTargets : []
  const hasActions =
    actionSet.has('edit') ||
    actionSet.has('cancel') ||
    (actionSet.has('changeStatus') && targets.length > 0)

  if (!hasActions) {
    return null
  }

  return (
    <section
      aria-labelledby="appointment-actions-title"
      className="space-y-3 rounded-xl border border-border bg-card p-4 shadow-sm"
    >
      <div>
        <h2 id="appointment-actions-title" className="font-semibold">
          Acciones disponibles
        </h2>
        <p className="text-sm text-muted-foreground">
          Las opciones dependen del estado actual y de tu acceso a la cita.
        </p>
      </div>

      <div className="flex w-full flex-col gap-2 sm:flex-row sm:flex-wrap">
        {actionSet.has('edit') ? (
          <Button asChild type="button" variant="outline">
            <Link
              to={`/citas/${encodeURIComponent(String(appointmentId))}/editar`}
            >
              <Pencil aria-hidden="true" />
              Editar cita
            </Link>
          </Button>
        ) : null}

        {actionSet.has('cancel') ? (
          <Button
            type="button"
            variant="destructive"
            onClick={onCancel}
            disabled={isLoading}
          >
            <CircleX aria-hidden="true" />
            Cancelar cita
          </Button>
        ) : null}

        {actionSet.has('changeStatus')
          ? targets.map((status) => {
              const config = getAppointmentStatusActionConfig(status?.nombre)

              if (!config) {
                return null
              }

              const Icon = config.icon

              return (
                <Button
                  key={status.id}
                  type="button"
                  variant={config.variant}
                  onClick={() => onStatusChange(status)}
                  disabled={isLoading}
                >
                  <Icon aria-hidden="true" />
                  {config.label}
                </Button>
              )
            })
          : null}
      </div>
    </section>
  )
}
