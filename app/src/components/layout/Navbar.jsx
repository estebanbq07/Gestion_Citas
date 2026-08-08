import { useState } from 'react'
import { Menu, X } from 'lucide-react'
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
    'w-full rounded-md px-3 py-2 text-center text-sm font-medium transition-colors lg:w-auto',
    'hover:bg-primary/10 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring',
    isActive
      ? 'bg-primary text-primary-foreground shadow-sm'
      : 'text-foreground/70',
  ].join(' ')

export function Navbar() {
  const navigate = useNavigate()
  const { isAuthenticated, logout, role, user } = useAuth()
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const visibleNavigationItems = AUTHENTICATED_NAVIGATION_ITEMS.filter(
    ({ to }) => canAccessRoute(to, role?.nombre),
  )
  const displayName =
    typeof user?.nombre === 'string' && user.nombre.trim()
      ? user.nombre
      : user?.correo

  function handleLogout() {
    setIsMenuOpen(false)
    logout()
    navigate('/login')
  }

  function closeMenu() {
    setIsMenuOpen(false)
  }

  return (
    <div className="w-full lg:w-auto">
      <div className="flex justify-center lg:hidden">
        <Button
          type="button"
          variant="outline"
          aria-controls="main-navigation"
          aria-expanded={isMenuOpen}
          onClick={() => setIsMenuOpen((currentValue) => !currentValue)}
        >
          {isMenuOpen ? (
            <X aria-hidden="true" />
          ) : (
            <Menu aria-hidden="true" />
          )}
          {isMenuOpen ? 'Cerrar menú' : 'Abrir menú'}
        </Button>
      </div>

      <nav
        id="main-navigation"
        aria-label="Navegación principal"
        className={[
          'mt-3 w-full flex-col items-stretch gap-2 lg:mt-0 lg:w-auto lg:flex-row lg:flex-wrap lg:items-center lg:justify-end',
          isMenuOpen ? 'flex' : 'hidden lg:flex',
        ].join(' ')}
      >
        <NavLink to="/" end className={getLinkClassName} onClick={closeMenu}>
          Inicio
        </NavLink>

        {isAuthenticated ? (
          <>
            {visibleNavigationItems.map(({ label, to }) => (
              <NavLink
                key={to}
                to={to}
                className={getLinkClassName}
                onClick={closeMenu}
              >
                {label}
              </NavLink>
            ))}
            <div className="flex w-full flex-col items-center justify-center gap-2 border-t pt-3 lg:w-auto lg:flex-row lg:border-l lg:border-t-0 lg:pl-3 lg:pt-0">
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
            <NavLink
              key={to}
              to={to}
              className={getLinkClassName}
              onClick={closeMenu}
            >
              {label}
            </NavLink>
          ))
        )}
      </nav>
    </div>
  )
}
