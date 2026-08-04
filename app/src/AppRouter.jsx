import { Route, Routes } from 'react-router-dom'
import { ProtectedRoute } from '@/components/common/ProtectedRoute'
import { RoleRoute } from '@/components/common/RoleRoute'
import { ROUTE_PERMISSIONS } from '@/lib/permissions'
import { AccessDeniedPage } from '@/pages/AccessDeniedPage'
import { AdditionalsPage } from '@/pages/AdditionalsPage'
import { AppointmentsPage } from '@/pages/AppointmentsPage'
import { DailyAgendaPage } from '@/pages/DailyAgendaPage'
import { EmployeesPage } from '@/pages/EmployeesPage'
import { HomePage } from '@/pages/HomePage'
import { LoginPage } from '@/pages/LoginPage'
import { NotFoundPage } from '@/pages/NotFoundPage'
import { ProfilePage } from '@/pages/ProfilePage'
import { RegisterPage } from '@/pages/RegisterPage'
import { RestrictionsPage } from '@/pages/RestrictionsPage'
import { SchedulesPage } from '@/pages/SchedulesPage'
import { ServicesPage } from '@/pages/ServicesPage'
import { ServiceDetailPage } from '@/pages/ServiceDetailPage'
import { CreateServicePage } from '@/pages/CreateServicePage'

export function AppRouter() {
  return (
    <Routes>
      <Route path="/" element={<HomePage />} />
      <Route path="/login" element={<LoginPage />} />
      <Route path="/registro" element={<RegisterPage />} />
      <Route
        path="/perfil"
        element={
          <ProtectedRoute>
            <ProfilePage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/servicios"
        element={
          <RoleRoute allowedRoles={ROUTE_PERMISSIONS['/servicios']}>
            <ServicesPage />
          </RoleRoute>
        }
      />
      <Route
        path="/servicios/nuevo"
        element={
          <RoleRoute allowedRoles={ROUTE_PERMISSIONS['/servicios/nuevo']}>
            <CreateServicePage />
          </RoleRoute>
        }
      />
      <Route
        path="/servicios/:id"
        element={
          <RoleRoute allowedRoles={ROUTE_PERMISSIONS['/servicios']}>
            <ServiceDetailPage />
          </RoleRoute>
        }
      />
      <Route
        path="/adicionales"
        element={
          <RoleRoute allowedRoles={ROUTE_PERMISSIONS['/adicionales']}>
            <AdditionalsPage />
          </RoleRoute>
        }
      />
      <Route
        path="/empleados"
        element={
          <RoleRoute allowedRoles={ROUTE_PERMISSIONS['/empleados']}>
            <EmployeesPage />
          </RoleRoute>
        }
      />
      <Route
        path="/horarios"
        element={
          <RoleRoute allowedRoles={ROUTE_PERMISSIONS['/horarios']}>
            <SchedulesPage />
          </RoleRoute>
        }
      />
      <Route
        path="/restricciones"
        element={
          <RoleRoute allowedRoles={ROUTE_PERMISSIONS['/restricciones']}>
            <RestrictionsPage />
          </RoleRoute>
        }
      />
      <Route
        path="/citas"
        element={
          <RoleRoute allowedRoles={ROUTE_PERMISSIONS['/citas']}>
            <AppointmentsPage />
          </RoleRoute>
        }
      />
      <Route
        path="/agenda-diaria"
        element={
          <RoleRoute allowedRoles={ROUTE_PERMISSIONS['/agenda-diaria']}>
            <DailyAgendaPage />
          </RoleRoute>
        }
      />
      <Route
        path="/acceso-denegado"
        element={
          <ProtectedRoute>
            <AccessDeniedPage />
          </ProtectedRoute>
        }
      />
      <Route path="*" element={<NotFoundPage />} />
    </Routes>
  )
}
