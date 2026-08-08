import { useState } from 'react'
import { Clock3, ImageOff } from 'lucide-react'

import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import { getImageUrl, PLACEHOLDER_IMAGE } from '@/lib/imageUtils'
import { formatServiceDuration, formatServicePrice } from '@/lib/serviceUtils'

export function ServiceCard({ service, onViewDetails }) {
  const [imageSource, setImageSource] = useState(() => getImageUrl(service?.imagen))
  const name = typeof service?.nombre === 'string' && service.nombre.trim()
    ? service.nombre.trim()
    : 'Servicio'
  const description = typeof service?.descripcion === 'string' && service.descripcion.trim()
    ? service.descripcion.trim()
    : ''
  const price = formatServicePrice(service?.precioBase)
  const duration = formatServiceDuration(service?.duracionMinutos)
  const hasStatus = typeof service?.activo === 'boolean'
  const canViewDetails = typeof onViewDetails === 'function' && service?.id != null

  function handleImageError() {
    if (imageSource !== PLACEHOLDER_IMAGE) {
      setImageSource(PLACEHOLDER_IMAGE)
    }
  }

  return (
    <Card className="flex h-full flex-col overflow-hidden">
      <div className="relative aspect-[16/9] bg-muted">
        <img
          src={imageSource}
          alt={`Imagen del servicio ${name}`}
          className="size-full object-cover"
          onError={handleImageError}
        />
        {imageSource === PLACEHOLDER_IMAGE ? (
          <ImageOff
            aria-hidden="true"
            className="absolute right-3 top-3 size-4 text-muted-foreground"
          />
        ) : null}
      </div>

      <CardHeader className="gap-3 pb-3">
        <CardTitle className="text-xl">{name}</CardTitle>
        {hasStatus ? (
          <Badge variant={service.activo ? 'default' : 'outline'}>
            {service.activo ? 'Activo' : 'Inactivo'}
          </Badge>
        ) : null}
      </CardHeader>

      <CardContent className="flex-1 space-y-4">
        {description ? <p className="text-sm text-muted-foreground">{description}</p> : null}
        <dl className="grid gap-3 text-sm sm:grid-cols-2">
          {duration ? (
            <div className="flex items-center gap-2">
              <Clock3 aria-hidden="true" className="size-4 text-muted-foreground" />
              <div>
                <dt className="sr-only">Duración</dt>
                <dd>{duration}</dd>
              </div>
            </div>
          ) : null}
          {price ? (
            <div>
              <dt className="text-muted-foreground">Precio</dt>
              <dd className="font-medium">{price}</dd>
            </div>
          ) : null}
        </dl>
      </CardContent>

      {canViewDetails ? (
        <CardFooter className="mt-auto">
          <Button
            className="w-full"
            type="button"
            variant="outline"
            onClick={() => onViewDetails(service)}
          >
            Ver detalle
          </Button>
        </CardFooter>
      ) : null}
    </Card>
  )
}
