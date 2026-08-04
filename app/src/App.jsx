import { AppLayout } from '@/components/layout/AppLayout'
import { LoadingState } from '@/components/feedback/LoadingState'
import { useAuth } from '@/context/useAuth'
import { AppRouter } from '@/AppRouter'

function App() {
  const { isLoading } = useAuth()

  if (isLoading) {
    return (
      <main className="flex min-h-svh items-center justify-center px-4">
        <LoadingState message="Verificando sesión…" />
      </main>
    )
  }

  return (
    <AppLayout>
      <AppRouter />
    </AppLayout>
  )
}

export default App
