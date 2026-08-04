import { NavLink, useNavigate } from 'react-router-dom'

import { Button } from '@/components/ui/button'
import { useAuth } from '@/context/useAuth'
import {
  AUTHENTICATED_NAVIGATION_ITEMS,
  canAccessRoute,
} from '@/lib/permissions'

const unauthenticatedItems = Object.freeze([
  { label: 'Iniciar sesión', to: '/login' },
  { label: 'Registrarse', to: '/registro' },
])

const getLinkClassName = ({ isActive }) =>
  [
    'rounded-md px-3 py-2 text-center text-sm font-medium transition-colors',
    'hover:bg-primary/10 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring',
    isActive
      ? 'bg-primary text-primary-foreground shadow-sm'
      : 'text-foreground/70',
  ].join(' ')

export function Navbar() {
  const navigate = useNavigate()
  const { isAuthenticated, logout, role, user } = useAuth()
  const visibleNavigationItems = AUTHENTICATED_NAVIGATION_ITEMS.filter(
    ({ to }) => canAccessRoute(to, role?.nombre),
  )
  const displayName =
    typeof user?.nombre === 'string' && user.nombre.trim()
      ? user.nombre
      : user?.correo

  function handleLogout() {
    logout()
    navigate('/login')
  }

  return (
    <nav
      aria-label="Navegación principal"
      className="flex w-full flex-wrap items-center justify-center gap-2 lg:w-auto lg:justify-end"
    >
      <NavLink to="/" end className={getLinkClassName}>
        Inicio
      </NavLink>

      {isAuthenticated ? (
        <>
          {visibleNavigationItems.map(({ label, to }) => (
            <NavLink key={to} to={to} className={getLinkClassName}>
              {label}
            </NavLink>
          ))}
          <div className="flex w-full items-center justify-center gap-2 border-t pt-2 sm:w-auto sm:border-l sm:border-t-0 sm:pl-3 sm:pt-0">
            <span
              className="max-w-48 truncate text-sm font-medium text-foreground"
              title={displayName}
            >
              {displayName}
            </span>
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={handleLogout}
            >
              Cerrar sesión
            </Button>
          </div>
        </>
      ) : (
        unauthenticatedItems.map(({ label, to }) => (
          <NavLink key={to} to={to} className={getLinkClassName}>
            {label}
          </NavLink>
        ))
      )}
    </nav>
  )
}
