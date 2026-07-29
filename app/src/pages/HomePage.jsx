import { Button } from '@/components/ui/button'

export function HomePage() {
  return (
    <main className="flex min-h-svh items-center justify-center bg-background px-6">
      <section className="flex max-w-xl flex-col items-center gap-6 text-center">
        <div className="space-y-2">
          <h1 className="text-3xl font-bold tracking-tight sm:text-4xl">
            Sistema de Gestión de Citas
          </h1>
          <p className="text-base text-foreground/70">
            Frontend configurado correctamente
          </p>
        </div>
        <Button type="button" size="lg">
          Comenzar
        </Button>
      </section>
    </main>
  )
}
