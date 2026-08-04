import { useState } from 'react'
import { Clock3, ImageOff } from 'lucide-react'

import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { getImageUrl, PLACEHOLDER_IMAGE } from '@/lib/imageUtils'
import { formatServiceDuration, formatServicePrice } from '@/lib/serviceUtils'

export function ServiceDetail({ service }) {
  const [imageSource, setImageSource] = useState(() => getImageUrl(service?.imagen))
  const name = typeof service?.nombre === 'string' && service.nombre.trim()
    ? service.nombre.trim()
    : 'Servicio'
  const description = typeof service?.descripcion === 'string' && service.descripcion.trim()
    ? service.descripcion.trim()
    : ''
  const price = formatServicePrice(service?.precioBase) || 'Precio no disponible'
  const duration = formatServiceDuration(service?.duracionMinutos) || 'Duración no disponible'
  const hasStatus = typeof service?.activo === 'boolean'

  function handleImageError() {
    if (imageSource !== PLACEHOLDER_IMAGE) {
      setImageSource(PLACEHOLDER_IMAGE)
    }
  }

  return (
    <Card className="overflow-hidden">
      <div className="grid lg:grid-cols-2">
        <div className="relative aspect-[4/3] bg-muted lg:aspect-auto">
          <img
            src={imageSource}
            alt={`Imagen del servicio ${name}`}
            className="size-full object-cover"
            onError={handleImageError}
          />
          {imageSource === PLACEHOLDER_IMAGE ? (
            <ImageOff
              aria-hidden="true"
              className="absolute right-4 top-4 size-5 text-muted-foreground"
            />
          ) : null}
        </div>

        <div className="flex flex-col">
          <CardHeader className="gap-4">
            <div className="space-y-2">
              <CardTitle className="text-2xl sm:text-3xl">{name}</CardTitle>
              {description ? <CardDescription>{description}</CardDescription> : null}
            </div>
            {hasStatus ? (
              <Badge variant={service.activo ? 'default' : 'outline'}>
                {service.activo ? 'Activo' : 'Inactivo'}
              </Badge>
            ) : null}
          </CardHeader>

          <CardContent className="mt-auto grid gap-5 sm:grid-cols-2">
            <div className="space-y-1">
              <p className="text-sm text-muted-foreground">Precio</p>
              <p className="text-lg font-semibold">{price}</p>
            </div>
            <div className="space-y-1">
              <p className="flex items-center gap-2 text-sm text-muted-foreground">
                <Clock3 aria-hidden="true" className="size-4" />
                Duración
              </p>
              <p className="text-lg font-semibold">{duration}</p>
            </div>
          </CardContent>
        </div>
      </div>
    </Card>
  )
}
