import { RestrictionCard } from '@/components/data-display/RestrictionCard'

export function RestrictionList({ restrictions, onViewDetails }) {
  const validRestrictions = Array.isArray(restrictions)
    ? restrictions.filter(
        (restriction) =>
          restriction !== null && typeof restriction === 'object',
      )
    : []

  return (
    <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
      {validRestrictions.map((restriction) => (
        <RestrictionCard
          key={restriction.id}
          restriction={restriction}
          onViewDetails={onViewDetails}
        />
      ))}
    </div>
  )
}
