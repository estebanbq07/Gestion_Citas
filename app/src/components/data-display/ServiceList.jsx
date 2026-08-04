import { ServiceCard } from '@/components/data-display/ServiceCard'

export function ServiceList({ services, onViewDetails }) {
  return (
    <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
      {services.map((service) => (
        <ServiceCard key={service.id} service={service} onViewDetails={onViewDetails} />
      ))}
    </div>
  )
}
