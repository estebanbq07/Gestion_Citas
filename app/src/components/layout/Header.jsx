import { Navbar } from '@/components/layout/Navbar'

export function Header() {
  return (
    <header className="border-b bg-background">
      <div className="mx-auto flex w-full max-w-7xl flex-col gap-4 px-4 py-4 sm:px-6 md:py-5 lg:flex-row lg:items-center lg:justify-between lg:px-8">
        <p className="text-center text-lg font-bold tracking-tight lg:text-left">
          Gestión de Citas
        </p>
        <Navbar />
      </div>
    </header>
  )
}
