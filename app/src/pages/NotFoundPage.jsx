import { ArrowLeft } from 'lucide-react'
import { Link } from 'react-router-dom'

import { PageHeader } from '@/components/common/PageHeader'
import { Button } from '@/components/ui/button'

export function NotFoundPage() {
  return (
    <section className="mx-auto flex w-full max-w-2xl flex-col items-center gap-8 py-8 text-center sm:py-16">
      <PageHeader
        align="center"
        title="Página no encontrada"
        description="La dirección solicitada no corresponde a una página disponible."
      />
      <Button asChild>
        <Link to="/">
          <ArrowLeft aria-hidden="true" />
          Volver al inicio
        </Link>
      </Button>
    </section>
  )
}
