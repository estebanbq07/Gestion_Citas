import { AdditionalCard } from '@/components/data-display/AdditionalCard'

export function AdditionalList({ additionals, onViewDetails }) {
  const validAdditionals = additionals.filter(
    (additional) =>
      additional !== null && typeof additional === 'object',
  )

  return (
    <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
      {validAdditionals.map((additional) => (
        <AdditionalCard
          key={additional.id}
          additional={additional}
          onViewDetails={onViewDetails}
        />
      ))}
    </div>
  )
}
