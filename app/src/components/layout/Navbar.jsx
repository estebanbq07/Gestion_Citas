import { CalendarDays } from 'lucide-react'

export function Navbar() {
  return (
    <header className="border-b border-border bg-background">
      <nav
        aria-label="Navegación principal"
        className="mx-auto flex h-16 w-full max-w-7xl items-center px-4 sm:px-6 lg:px-8"
      >
        <div className="flex items-center gap-3">
          <span className="flex size-9 items-center justify-center rounded-lg bg-primary text-primary-foreground">
            <CalendarDays aria-hidden="true" className="size-5" />
          </span>
          <span className="font-semibold tracking-tight">
            Sistema de Gestión de Citas
          </span>
        </div>
      </nav>
    </header>
  )
}
