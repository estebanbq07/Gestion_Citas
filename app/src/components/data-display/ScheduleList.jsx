import { ScheduleCard } from '@/components/data-display/ScheduleCard'

export function ScheduleList({ schedules, onViewDetails }) {
  const validSchedules = Array.isArray(schedules)
    ? schedules.filter(
        (schedule) => schedule !== null && typeof schedule === 'object',
      )
    : []

  return (
    <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-3">
      {validSchedules.map((schedule, index) => (
        <ScheduleCard
          key={
            schedule.id ??
            `${schedule.diaSemana?.numeroOrden ?? 'day'}-${schedule.horaInicio ?? index}`
          }
          schedule={schedule}
          onViewDetails={onViewDetails}
        />
      ))}
    </div>
  )
}
