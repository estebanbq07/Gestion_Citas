import { Route, Routes } from 'react-router-dom'
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

export function AppRouter() {
  return (
    <Routes>
      <Route path="/" element={<HomePage />} />
      <Route path="/login" element={<LoginPage />} />
      <Route path="/registro" element={<RegisterPage />} />
      <Route path="/perfil" element={<ProfilePage />} />
      <Route path="/servicios" element={<ServicesPage />} />
      <Route path="/adicionales" element={<AdditionalsPage />} />
      <Route path="/empleados" element={<EmployeesPage />} />
      <Route path="/horarios" element={<SchedulesPage />} />
      <Route path="/restricciones" element={<RestrictionsPage />} />
      <Route path="/citas" element={<AppointmentsPage />} />
      <Route path="/agenda-diaria" element={<DailyAgendaPage />} />
      <Route path="*" element={<NotFoundPage />} />
    </Routes>
  )
}
