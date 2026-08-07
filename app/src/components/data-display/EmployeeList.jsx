import { EmployeeCard } from '@/components/data-display/EmployeeCard'

export function EmployeeList({ employees, onViewDetails }) {
  const validEmployees = Array.isArray(employees)
    ? employees.filter(
        (employee) => employee !== null && typeof employee === 'object',
      )
    : []

  return (
    <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
      {validEmployees.map((employee, index) => (
        <EmployeeCard
          key={employee.id ?? employee.codigoEmpleado ?? index}
          employee={employee}
          onViewDetails={onViewDetails}
        />
      ))}
    </div>
  )
}
