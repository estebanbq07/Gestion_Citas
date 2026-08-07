import { Badge } from '@/components/ui/badge'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { formatAdditionalPrice } from '@/lib/additionalUtils'

export function AdditionalDetail({ additional }) {
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

  return (
    <Card>
      <CardHeader className="gap-4">
        <div className="space-y-2">
          <CardTitle
            aria-level={2}
            className="text-2xl sm:text-3xl"
            role="heading"
          >
            {name}
          </CardTitle>
          {description ? (
            <CardDescription>{description}</CardDescription>
          ) : null}
        </div>
        {hasStatus ? (
          <Badge variant={additional.activo ? 'default' : 'outline'}>
            {additional.activo ? 'Activo' : 'Inactivo'}
          </Badge>
        ) : null}
      </CardHeader>

      {price ? (
        <CardContent>
          <div>
            <p className="text-sm text-muted-foreground">Precio</p>
            <p className="text-2xl font-semibold">{price}</p>
          </div>
        </CardContent>
      ) : null}
    </Card>
  )
}
