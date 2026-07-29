import { NavLink } from 'react-router-dom'

const navigationItems = [
  { label: 'Inicio', to: '/', end: true },
  { label: 'Servicios', to: '/servicios' },
  { label: 'Adicionales', to: '/adicionales' },
  { label: 'Empleados', to: '/empleados' },
  { label: 'Horarios', to: '/horarios' },
  { label: 'Restricciones', to: '/restricciones' },
  { label: 'Citas', to: '/citas' },
  { label: 'Agenda', to: '/agenda-diaria' },
  { label: 'Iniciar sesión', to: '/login' },
]

const getLinkClassName = ({ isActive }) =>
  [
    'rounded-md px-3 py-2 text-center text-sm font-medium transition-colors',
    'hover:bg-primary/10 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring',
    isActive
      ? 'bg-primary text-primary-foreground shadow-sm'
      : 'text-foreground/70',
  ].join(' ')

export function Navbar() {
  return (
    <nav
      aria-label="Navegación principal"
      className="grid w-full grid-cols-2 gap-2 sm:grid-cols-3 md:grid-cols-5 lg:flex lg:w-auto lg:flex-wrap lg:justify-end"
    >
      {navigationItems.map(({ label, to, end }) => (
        <NavLink key={to} to={to} end={end} className={getLinkClassName}>
          {label}
        </NavLink>
      ))}
    </nav>
  )
}
