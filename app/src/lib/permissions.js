export const ROLES = Object.freeze({
  ADMIN: 'Administrador',
  EMPLOYEE: 'Empleado',
  CLIENT: 'Cliente',
})

const ALL_ROLES = Object.freeze([
  ROLES.ADMIN,
  ROLES.EMPLOYEE,
  ROLES.CLIENT,
])

const STAFF_ROLES = Object.freeze([ROLES.ADMIN, ROLES.EMPLOYEE])
const ADMIN_ROLES = Object.freeze([ROLES.ADMIN])

export const ROUTE_PERMISSIONS = Object.freeze({
  '/perfil': ALL_ROLES,
  '/servicios': ALL_ROLES,
  '/servicios/nuevo': ADMIN_ROLES,
  '/servicios/:id/editar': ADMIN_ROLES,
  '/adicionales': ALL_ROLES,
  '/adicionales/nuevo': ADMIN_ROLES,
  '/adicionales/:id': ALL_ROLES,
  '/adicionales/:id/editar': ADMIN_ROLES,
  '/empleados': ALL_ROLES,
  '/empleados/nuevo': ADMIN_ROLES,
  '/empleados/:id': ALL_ROLES,
  '/empleados/:id/editar': ADMIN_ROLES,
  '/horarios': ALL_ROLES,
  '/restricciones': STAFF_ROLES,
  '/citas': ALL_ROLES,
  '/agenda-diaria': ADMIN_ROLES,
  '/acceso-denegado': ALL_ROLES,
})

export const AUTHENTICATED_NAVIGATION_ITEMS = Object.freeze([
  { label: 'Mi perfil', to: '/perfil' },
  { label: 'Servicios', to: '/servicios' },
  { label: 'Adicionales', to: '/adicionales' },
  { label: 'Empleados', to: '/empleados' },
  { label: 'Horarios', to: '/horarios' },
  { label: 'Restricciones', to: '/restricciones' },
  { label: 'Citas', to: '/citas' },
  { label: 'Agenda diaria', to: '/agenda-diaria' },
])

export function hasRole(roleName, allowedRoles) {
  return (
    typeof roleName === 'string' &&
    Array.isArray(allowedRoles) &&
    allowedRoles.includes(roleName)
  )
}

export function canAccessRoute(path, roleName) {
  return hasRole(roleName, ROUTE_PERMISSIONS[path])
}
