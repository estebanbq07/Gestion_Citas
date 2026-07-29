import { Button } from '@/components/ui/button'
import { PageHeader } from '@/components/common/PageHeader'

export function HomePage() {
  return (
    <section className="flex min-h-[60vh] flex-col items-center justify-center">
      <div className="flex max-w-xl flex-col items-center gap-6 text-center">
        <PageHeader
          title="Sistema de Gestión de Citas"
          description="Frontend configurado correctamente"
          align="center"
        />
        <Button type="button" size="lg">
          Comenzar
        </Button>
      </div>
    </section>
  )
}
