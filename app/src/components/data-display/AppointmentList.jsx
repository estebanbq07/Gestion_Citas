import { AppointmentCard } from '@/components/data-display/AppointmentCard'

export function AppointmentList({ appointments, onViewDetails }) {
  const validAppointments = Array.isArray(appointments)
    ? appointments.filter(
        (appointment) =>
          appointment !== null && typeof appointment === 'object',
      )
    : []

  return (
    <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
      {validAppointments.map((appointment, index) => (
        <AppointmentCard
          key={appointment.id ?? index}
          appointment={appointment}
          onViewDetails={onViewDetails}
        />
      ))}
    </div>
  )
}
