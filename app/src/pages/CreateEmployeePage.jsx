import { useEffect, useMemo, useRef, useState } from 'react'
import { ArrowLeft } from 'lucide-react'
import { Link, useNavigate } from 'react-router-dom'

import { PageHeader } from '@/components/common/PageHeader'
import { EmployeeForm } from '@/components/forms/EmployeeForm'
import { EmptyState } from '@/components/feedback/EmptyState'
import { ErrorState } from '@/components/feedback/ErrorState'
import { LoadingState } from '@/components/feedback/LoadingState'
import { Button } from '@/components/ui/button'
import { useAuth } from '@/context/useAuth'
import { useEmployeeFormOptions } from '@/hooks/useEmployeeFormOptions'
import {
  buildEmployeeData,
  getEmployeeApiErrorState,
  INITIAL_EMPLOYEE_FORM_DATA,
  validateEmployeeField,
  validateEmployeeForm,
} from '@/lib/employeeFormValidation'
import {
  getEligibleEmployeeUsers,
  getEmployeeSpecialties,
  getServicesForSpecialty,
  isValidEmployeeId,
} from '@/lib/employeeUtils'
import { createEmployee } from '@/services/employeesService'

function createInitialFormData() {
  return {
    ...INITIAL_EMPLOYEE_FORM_DATA,
    servicioIds: [],
  }
}

function BackToEmployeesAction() {
  return (
    <Button asChild type="button" variant="outline">
      <Link to="/empleados">
        <ArrowLeft aria-hidden="true" />
        Volver a empleados
      </Link>
    </Button>
  )
}

export function CreateEmployeePage() {
  const navigate = useNavigate()
  const { token } = useAuth()
  const {
    users,
    services,
    isLoading,
    error,
    retry,
  } = useEmployeeFormOptions()
  const [formData, setFormData] = useState(createInitialFormData)
  const [fieldErrors, setFieldErrors] = useState({})
  const [apiError, setApiError] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const isMountedRef = useRef(true)
  const submittingRef = useRef(false)

  useEffect(() => {
    isMountedRef.current = true

    return () => {
      isMountedRef.current = false
    }
  }, [])

  const eligibleUsers = useMemo(
    () => getEligibleEmployeeUsers(users),
    [users],
  )
  const specialties = useMemo(
    () => getEmployeeSpecialties(services),
    [services],
  )
  const specialtyServices = useMemo(
    () => getServicesForSpecialty(services, formData.especialidadId),
    [formData.especialidadId, services],
  )
  const validationOptions = useMemo(
    () => ({
      users: eligibleUsers,
      specialties,
      services,
      currentEmployeeId: null,
    }),
    [eligibleUsers, services, specialties],
  )

  function updateExistingFieldErrors(nextFormData, fields) {
    setFieldErrors((currentErrors) => {
      const fieldsWithErrors = fields.filter((field) => currentErrors[field])

      if (!fieldsWithErrors.length) {
        return currentErrors
      }

      const nextErrors = { ...currentErrors }

      for (const field of fieldsWithErrors) {
        const nextError = validateEmployeeField(
          field,
          nextFormData[field],
          nextFormData,
          validationOptions,
        )

        if (nextError) {
          nextErrors[field] = nextError
        } else {
          delete nextErrors[field]
        }
      }

      return nextErrors
    })
  }

  function handleChange(event) {
    const { name, value } = event.target
    const nextFormData = {
      ...formData,
      [name]: value,
      ...(name === 'especialidadId' ? { servicioIds: [] } : {}),
    }

    setFormData(nextFormData)
    setApiError('')
    updateExistingFieldErrors(
      nextFormData,
      name === 'especialidadId' ? ['especialidadId', 'servicioIds'] : [name],
    )
  }

  function handleServicesChange(nextIds) {
    const nextFormData = {
      ...formData,
      servicioIds: Array.isArray(nextIds) ? nextIds : [],
    }

    setFormData(nextFormData)
    setApiError('')
    updateExistingFieldErrors(nextFormData, ['servicioIds'])
  }

  async function handleSubmit(event) {
    event.preventDefault()

    if (isSubmitting || submittingRef.current) {
      return
    }

    const errors = validateEmployeeForm(formData, validationOptions)
    setFieldErrors(errors)

    if (Object.keys(errors).length) {
      return
    }

    submittingRef.current = true
    setApiError('')
    setIsSubmitting(true)

    try {
      const response = await createEmployee(buildEmployeeData(formData), {
        token,
      })

      if (!isMountedRef.current) {
        return
      }

      const employeeId = response?.data?.id
      const destination = isValidEmployeeId(employeeId)
        ? `/empleados/${encodeURIComponent(String(employeeId))}`
        : '/empleados'

      navigate(destination, {
        replace: true,
        state: { successMessage: 'Empleado creado correctamente.' },
      })
    } catch (requestError) {
      if (!isMountedRef.current) {
        return
      }

      const errorState = getEmployeeApiErrorState(requestError)
      setFieldErrors(errorState.fieldErrors)
      setApiError(errorState.message)
    } finally {
      submittingRef.current = false

      if (isMountedRef.current) {
        setIsSubmitting(false)
      }
    }
  }

  if (isLoading) {
    return <LoadingState message="Cargando opciones del empleado..." />
  }

  if (error) {
    return (
      <ErrorState
        title="No fue posible cargar las opciones del empleado"
        message={error}
        action={
          <div className="flex flex-wrap justify-center gap-2">
            <Button type="button" onClick={retry}>
              Intentar nuevamente
            </Button>
            <BackToEmployeesAction />
          </div>
        }
      />
    )
  }

  if (!eligibleUsers.length) {
    return (
      <EmptyState
        title="No hay usuarios elegibles para crear un empleado."
        description="Se necesita un usuario activo con rol Empleado que todavía no esté asociado."
        action={<BackToEmployeesAction />}
      />
    )
  }

  if (!services.length) {
    return (
      <EmptyState
        title="No hay servicios activos disponibles."
        description="Debe existir al menos un servicio activo antes de crear un empleado."
        action={<BackToEmployeesAction />}
      />
    )
  }

  if (!specialties.length) {
    return (
      <EmptyState
        title="No hay especialidades disponibles."
        description="Los servicios activos no pertenecen a una especialidad activa disponible."
        action={<BackToEmployeesAction />}
      />
    )
  }

  return (
    <section className="w-full space-y-6">
      <PageHeader
        title="Nuevo empleado"
        description="Registra los datos laborales y los servicios que puede atender."
      />

      <EmployeeForm
        formData={formData}
        fieldErrors={fieldErrors}
        apiError={apiError}
        apiErrorTitle="No fue posible crear el empleado"
        infoMessage=""
        isSubmitting={isSubmitting}
        submitText="Crear empleado"
        submittingText="Creando empleado..."
        users={eligibleUsers}
        specialties={specialties}
        services={specialtyServices}
        onChange={handleChange}
        onServicesChange={handleServicesChange}
        onSubmit={handleSubmit}
        onCancel={() => navigate('/empleados')}
      />
    </section>
  )
}
