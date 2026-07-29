import { Footer } from '@/components/layout/Footer'
import { Header } from '@/components/layout/Header'

export function AppLayout({ children }) {
  return (
    <div className="flex min-h-svh flex-col bg-background text-foreground">
      <Header />
      <main className="mx-auto flex w-full max-w-7xl flex-1 items-start px-4 py-8 sm:px-6 sm:py-10 md:py-12 lg:px-8">
        {children}
      </main>
      <Footer />
    </div>
  )
}
