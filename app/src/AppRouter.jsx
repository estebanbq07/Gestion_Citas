import { Route, Routes } from 'react-router-dom'
import { ProtectedRoute } from '@/components/common/ProtectedRoute'
import { RoleRoute } from '@/components/common/RoleRoute'
import { ROUTE_PERMISSIONS } from '@/lib/permissions'
import { AccessDeniedPage } from '@/pages/AccessDeniedPage'
import { AdditionalDetailPage } from '@/pages/AdditionalDetailPage'
import { AdditionalsPage } from '@/pages/AdditionalsPage'
import { CreateAdditionalPage } from '@/pages/CreateAdditionalPage'
import { AppointmentsPage } from '@/pages/AppointmentsPage'
import { AppointmentDetailPage } from '@/pages/AppointmentDetailPage'
import { CreateAppointmentPage } from '@/pages/CreateAppointmentPage'
import { EditAppointmentPage } from '@/pages/EditAppointmentPage'
import { DailyAgendaPage } from '@/pages/DailyAgendaPage'
import { EditServicePage } from '@/pages/EditServicePage'
import { EditAdditionalPage } from '@/pages/EditAdditionalPage'
import { EmployeesPage } from '@/pages/EmployeesPage'
import { CreateEmployeePage } from '@/pages/CreateEmployeePage'
import { EditEmployeePage } from '@/pages/EditEmployeePage'
import { EmployeeDetailPage } from '@/pages/EmployeeDetailPage'
import { HomePage } from '@/pages/HomePage'
import { LoginPage } from '@/pages/LoginPage'
import { NotFoundPage } from '@/pages/NotFoundPage'
import { ProfilePage } from '@/pages/ProfilePage'
import { RegisterPage } from '@/pages/RegisterPage'
import { RestrictionDetailPage } from '@/pages/RestrictionDetailPage'
import { RestrictionsPage } from '@/pages/RestrictionsPage'
import { ScheduleDetailPage } from '@/pages/ScheduleDetailPage'
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
        path="/servicios/:id/editar"
        element={
          <RoleRoute
            allowedRoles={ROUTE_PERMISSIONS['/servicios/:id/editar']}
          >
            <EditServicePage />
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
        path="/adicionales/nuevo"
        element={
          <RoleRoute allowedRoles={ROUTE_PERMISSIONS['/adicionales/nuevo']}>
            <CreateAdditionalPage />
          </RoleRoute>
        }
      />
      <Route
        path="/adicionales/:id/editar"
        element={
          <RoleRoute
            allowedRoles={ROUTE_PERMISSIONS['/adicionales/:id/editar']}
          >
            <EditAdditionalPage />
          </RoleRoute>
        }
      />
      <Route
        path="/adicionales/:id"
        element={
          <RoleRoute allowedRoles={ROUTE_PERMISSIONS['/adicionales/:id']}>
            <AdditionalDetailPage />
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
        path="/empleados/nuevo"
        element={
          <RoleRoute allowedRoles={ROUTE_PERMISSIONS['/empleados/nuevo']}>
            <CreateEmployeePage />
          </RoleRoute>
        }
      />
      <Route
        path="/empleados/:id/editar"
        element={
          <RoleRoute
            allowedRoles={ROUTE_PERMISSIONS['/empleados/:id/editar']}
          >
            <EditEmployeePage />
          </RoleRoute>
        }
      />
      <Route
        path="/empleados/:id"
        element={
          <RoleRoute allowedRoles={ROUTE_PERMISSIONS['/empleados/:id']}>
            <EmployeeDetailPage />
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
        path="/horarios/:id"
        element={
          <RoleRoute allowedRoles={ROUTE_PERMISSIONS['/horarios/:id']}>
            <ScheduleDetailPage />
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
        path="/restricciones/:id"
        element={
          <RoleRoute allowedRoles={ROUTE_PERMISSIONS['/restricciones/:id']}>
            <RestrictionDetailPage />
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
        path="/citas/nueva"
        element={
          <RoleRoute allowedRoles={ROUTE_PERMISSIONS['/citas/nueva']}>
            <CreateAppointmentPage />
          </RoleRoute>
        }
      />
      <Route
        path="/citas/:id/editar"
        element={
          <RoleRoute allowedRoles={ROUTE_PERMISSIONS['/citas/:id/editar']}>
            <EditAppointmentPage />
          </RoleRoute>
        }
      />
      <Route
        path="/citas/:id"
        element={
          <RoleRoute allowedRoles={ROUTE_PERMISSIONS['/citas/:id']}>
            <AppointmentDetailPage />
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
