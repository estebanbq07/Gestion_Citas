import { CalendarDays, CalendarPlus, LogIn, UserPlus } from 'lucide-react'
import { Link } from 'react-router-dom'

import { Button } from '@/components/ui/button'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
} from '@/components/ui/card'
import { useAuth } from '@/context/useAuth'
import { canAccessRoute } from '@/lib/permissions'

export function HomePage() {
  const { isAuthenticated, role, user } = useAuth()
  const roleName = role?.nombre
  const userName =
    typeof user?.nombre === 'string' && user.nombre.trim()
      ? user.nombre.trim()
      : ''

  return (
    <section className="mx-auto flex w-full max-w-5xl flex-1 items-center py-4 sm:py-10">
      <Card className="w-full overflow-hidden">
        <CardHeader className="gap-4 border-b border-border bg-muted/30 p-6 sm:p-10">
          <p className="text-sm font-semibold uppercase tracking-wider text-primary">
            Sistema de Gestión de Citas
          </p>
          <h1 className="max-w-3xl text-3xl font-semibold leading-tight tracking-tight sm:text-5xl">
            Organiza servicios, profesionales y citas desde un solo lugar.
          </h1>
          <CardDescription className="max-w-2xl text-base sm:text-lg">
            Consulta la disponibilidad del establecimiento y administra tus
            citas según las funciones permitidas para tu cuenta.
          </CardDescription>
        </CardHeader>

        <CardContent className="space-y-5 p-6 sm:p-10">
          {isAuthenticated ? (
            <>
              <div className="space-y-1">
                <h2 className="text-xl font-semibold">
                  {userName ? `Bienvenido, ${userName}` : 'Bienvenido'}
                </h2>
                <p className="text-sm text-muted-foreground">
                  Continúa con una de las secciones disponibles para tu perfil.
                </p>
              </div>
              <div className="flex flex-col gap-3 sm:flex-row sm:flex-wrap">
                {canAccessRoute('/servicios', roleName) ? (
                  <Button asChild>
                    <Link to="/servicios">
                      <CalendarDays aria-hidden="true" />
                      Ver servicios
                    </Link>
                  </Button>
                ) : null}
                {canAccessRoute('/citas', roleName) ? (
                  <Button asChild variant="outline">
                    <Link to="/citas">
                      <CalendarPlus aria-hidden="true" />
                      Ver citas
                    </Link>
                  </Button>
                ) : null}
                {canAccessRoute('/agenda-diaria', roleName) ? (
                  <Button asChild variant="outline">
                    <Link to="/agenda-diaria">Ver agenda diaria</Link>
                  </Button>
                ) : null}
              </div>
            </>
          ) : (
            <>
              <div className="space-y-1">
                <h2 className="text-xl font-semibold">Comienza ahora</h2>
                <p className="text-sm text-muted-foreground">
                  Inicia sesión o crea una cuenta de cliente para gestionar tus
                  citas.
                </p>
              </div>
              <div className="flex flex-col gap-3 sm:flex-row">
                <Button asChild>
                  <Link to="/login">
                    <LogIn aria-hidden="true" />
                    Iniciar sesión
                  </Link>
                </Button>
                <Button asChild variant="outline">
                  <Link to="/registro">
                    <UserPlus aria-hidden="true" />
                    Registrarse
                  </Link>
                </Button>
              </div>
            </>
          )}
        </CardContent>
      </Card>
    </section>
  )
}
