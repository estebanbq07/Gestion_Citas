import { useParams } from 'react-router-dom'

import { PageHeader } from '@/components/common/PageHeader'

export function ServiceDetailPage() {
  const { id } = useParams()

  return (
    <section className="w-full space-y-4">
      <PageHeader
        title="Detalle del servicio"
        description="El detalle completo del servicio se implementará en una próxima etapa."
      />
      <p className="text-sm text-muted-foreground">Servicio seleccionado: {id}</p>
    </section>
  )
}
