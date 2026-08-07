import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import {
  formatAdditionalPrice,
  isValidAdditionalId,
} from '@/lib/additionalUtils'

export function AdditionalCard({ additional, onViewDetails }) {
  const name =
    typeof additional?.nombre === 'string' && additional.nombre.trim()
      ? additional.nombre.trim()
      : 'Servicio adicional'
  const description =
    typeof additional?.descripcion === 'string' &&
    additional.descripcion.trim()
      ? additional.descripcion.trim()
      : ''
  const price = formatAdditionalPrice(additional?.precio)
  const hasStatus = typeof additional?.activo === 'boolean'
  const canViewDetails =
    typeof onViewDetails === 'function' &&
    isValidAdditionalId(additional?.id)

  return (
    <Card className="flex h-full flex-col">
      <CardHeader className="gap-3 pb-3">
        <CardTitle aria-level={2} className="text-xl" role="heading">
          {name}
        </CardTitle>
        {hasStatus ? (
          <Badge variant={additional.activo ? 'default' : 'outline'}>
            {additional.activo ? 'Activo' : 'Inactivo'}
          </Badge>
        ) : null}
      </CardHeader>

      <CardContent className="flex-1 space-y-4">
        {description ? (
          <p className="text-sm text-muted-foreground">{description}</p>
        ) : null}
        {price ? (
          <div>
            <p className="text-sm text-muted-foreground">Precio</p>
            <p className="text-lg font-semibold">{price}</p>
          </div>
        ) : null}
      </CardContent>

      {canViewDetails ? (
        <CardFooter className="mt-auto">
          <Button
            aria-label={`Ver detalle de ${name}`}
            className="w-full"
            type="button"
            variant="outline"
            onClick={() => onViewDetails(additional)}
          >
            Ver detalle
          </Button>
        </CardFooter>
      ) : null}
    </Card>
  )
}
