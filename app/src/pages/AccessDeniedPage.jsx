import { Link } from 'react-router-dom'

import { PageHeader } from '@/components/common/PageHeader'
import { Button } from '@/components/ui/button'

export function AccessDeniedPage() {
  return (
    <section className="mx-auto flex w-full max-w-2xl flex-col items-center gap-8 py-8 text-center sm:py-16">
      <PageHeader
        align="center"
        title="Acceso denegado"
        description="No tienes permisos para acceder a esta sección del sistema."
      />
      <p className="max-w-xl text-sm text-muted-foreground sm:text-base">
        Puedes volver al inicio y continuar utilizando los módulos disponibles
        para tu cuenta.
      </p>
      <Button asChild>
        <Link to="/">Volver al inicio</Link>
      </Button>
    </section>
  )
}
