import { useState } from 'react'
import { CircleAlert, CircleCheck, RefreshCw } from 'lucide-react'

import { PageHeader } from '@/components/common/PageHeader'
import { EmptyState } from '@/components/feedback/EmptyState'
import { ErrorState } from '@/components/feedback/ErrorState'
import { LoadingState } from '@/components/feedback/LoadingState'
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { useAuth } from '@/context/useAuth'
import { getErrorMessage } from '@/lib/getErrorMessage'

function getFullName({ nombre, primerApellido, segundoApellido } = {}) {
  return [nombre, primerApellido, segundoApellido]
    .filter((value) => typeof value === 'string' && value.trim())
    .map((value) => value.trim())
    .join(' ')
}

function displayValue(value) {
  return typeof value === 'string' && value.trim() ? value.trim() : 'No registrado'
}

function ProfileInfoItem({ label, value }) {
  return (
    <div className="space-y-1">
      <dt className="text-sm font-medium text-muted-foreground">{label}</dt>
      <dd className="break-words text-sm text-foreground">{value}</dd>
    </div>
  )
}

export function ProfilePage() {
  const { user, role, isLoading, error, refreshUser } = useAuth()
  const [isRefreshing, setIsRefreshing] = useState(false)
  const [refreshError, setRefreshError] = useState('')
  const [successMessage, setSuccessMessage] = useState('')

  async function handleRefresh() {
    if (isRefreshing) {
      return
    }

    setIsRefreshing(true)
    setRefreshError('')
    setSuccessMessage('')

    try {
      await refreshUser()
      setSuccessMessage('La información del perfil se actualizó correctamente.')
    } catch (requestError) {
      setRefreshError(getErrorMessage(requestError))
    } finally {
      setIsRefreshing(false)
    }
  }

  if (isLoading) {
    return <LoadingState message="Cargando tu perfil..." />
  }

  if (error && !user) {
    return (
      <ErrorState
        title="No fue posible cargar tu perfil"
        message={error}
        action={
          <Button type="button" onClick={handleRefresh} disabled={isRefreshing}>
            <RefreshCw
              aria-hidden="true"
              className={isRefreshing ? 'animate-spin' : undefined}
            />
            {isRefreshing ? 'Actualizando...' : 'Reintentar'}
          </Button>
        }
      />
    )
  }

  if (!user) {
    return (
      <EmptyState
        title="No hay información de perfil disponible"
        description="No encontramos datos del usuario autenticado."
      />
    )
  }

  const fullName = getFullName(user) || 'No registrado'
  const roleName = displayValue(role?.nombre ?? user.rol?.nombre)
  const hasPhone = Object.hasOwn(user, 'telefono')
  const employee = user.empleado
  const hasEmployeeInfo = employee && typeof employee === 'object'

  return (
    <section className="w-full space-y-6">
      <PageHeader
        title="Mi perfil"
        description="Consulta la información asociada a tu cuenta."
      />

      {refreshError ? (
        <Alert variant="destructive">
          <CircleAlert aria-hidden="true" />
          <AlertTitle>No fue posible actualizar la información</AlertTitle>
          <AlertDescription>{refreshError}</AlertDescription>
        </Alert>
      ) : null}

      {successMessage ? (
        <Alert>
          <CircleCheck aria-hidden="true" />
          <AlertTitle>Información actualizada</AlertTitle>
          <AlertDescription>{successMessage}</AlertDescription>
        </Alert>
      ) : null}

      <Card className="mx-auto w-full max-w-3xl">
        <CardHeader className="gap-4 border-b border-border">
          <div className="space-y-2">
            <CardTitle className="text-2xl">{fullName}</CardTitle>
            <CardDescription>{displayValue(user.correo)}</CardDescription>
          </div>
          <Badge variant="secondary">{roleName}</Badge>
        </CardHeader>

        <CardContent className="space-y-8 pt-6">
          <section aria-labelledby="personal-information-title" className="space-y-4">
            <h2 id="personal-information-title" className="text-lg font-semibold">
              Información personal
            </h2>
            <dl className="grid gap-5 sm:grid-cols-2">
              <ProfileInfoItem label="Nombre" value={displayValue(user.nombre)} />
              <ProfileInfoItem
                label="Primer apellido"
                value={displayValue(user.primerApellido)}
              />
              <ProfileInfoItem
                label="Segundo apellido"
                value={displayValue(user.segundoApellido)}
              />
              <ProfileInfoItem label="Correo electrónico" value={displayValue(user.correo)} />
              {hasPhone ? (
                <ProfileInfoItem label="Teléfono" value={displayValue(user.telefono)} />
              ) : null}
            </dl>
          </section>

          {hasEmployeeInfo ? (
            <section
              aria-labelledby="work-information-title"
              className="space-y-4 border-t border-border pt-6"
            >
              <h2 id="work-information-title" className="text-lg font-semibold">
                Información laboral
              </h2>
              <dl className="grid gap-5 sm:grid-cols-2">
                {Object.hasOwn(employee, 'codigoEmpleado') ? (
                  <ProfileInfoItem
                    label="Código de empleado"
                    value={displayValue(employee.codigoEmpleado)}
                  />
                ) : null}
                {Object.hasOwn(employee, 'descripcion') ? (
                  <ProfileInfoItem
                    label="Descripción laboral"
                    value={displayValue(employee.descripcion)}
                  />
                ) : null}
                {Object.hasOwn(employee, 'activo') ? (
                  <ProfileInfoItem
                    label="Estado"
                    value={employee.activo ? 'Activo' : 'Inactivo'}
                  />
                ) : null}
              </dl>
            </section>
          ) : null}

          <div className="flex justify-end border-t border-border pt-6">
            <Button type="button" onClick={handleRefresh} disabled={isRefreshing}>
              <RefreshCw
                aria-hidden="true"
                className={isRefreshing ? 'animate-spin' : undefined}
              />
              {isRefreshing ? 'Actualizando...' : 'Actualizar información'}
            </Button>
          </div>
        </CardContent>
      </Card>
    </section>
  )
}
