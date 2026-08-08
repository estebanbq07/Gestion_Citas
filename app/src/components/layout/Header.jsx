import { Link } from 'react-router-dom'

import { Navbar } from '@/components/layout/Navbar'

export function Header() {
  return (
    <header className="border-b bg-background">
      <div className="mx-auto flex w-full max-w-7xl flex-col gap-4 px-4 py-4 sm:px-6 md:py-5 lg:flex-row lg:items-center lg:justify-between lg:px-8">
        <Link
          className="text-center text-lg font-bold tracking-tight outline-none hover:text-primary focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 lg:text-left"
          to="/"
        >
          Gestión de Citas
        </Link>
        <Navbar />
      </div>
    </header>
  )
}
