import { Navigate, useLocation } from 'react-router-dom'

import { LoadingState } from '@/components/feedback/LoadingState'
import { useAuth } from '@/context/useAuth'
import { hasRole } from '@/lib/permissions'

export function RoleRoute({ allowedRoles, children }) {
  const location = useLocation()
  const { isAuthenticated, isLoading, role } = useAuth()

  if (isLoading) {
    return <LoadingState message="Verificando permisos…" />
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace state={{ from: location }} />
  }

  if (!hasRole(role?.nombre, allowedRoles)) {
    return <Navigate to="/acceso-denegado" replace />
  }

  return children
}
