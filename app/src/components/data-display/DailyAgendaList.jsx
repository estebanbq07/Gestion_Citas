import { DailyAgendaItem } from '@/components/data-display/DailyAgendaItem'

export function DailyAgendaList({ appointments, onViewDetails }) {
  return (
    <ol className="relative space-y-4 md:before:absolute md:before:bottom-6 md:before:left-[7.45rem] md:before:top-6 md:before:w-px md:before:bg-border">
      {appointments.map((appointment) => (
        <DailyAgendaItem
          key={appointment.id}
          appointment={appointment}
          onViewDetails={onViewDetails}
        />
      ))}
    </ol>
  )
}
