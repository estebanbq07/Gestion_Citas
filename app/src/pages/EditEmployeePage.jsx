import { useEffect, useMemo, useRef, useState } from 'react'
import { ArrowLeft } from 'lucide-react'
import { Link, useNavigate, useParams } from 'react-router-dom'

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
  getEmployeeChangeState,
  getEmployeeFormData,
  INITIAL_EMPLOYEE_FORM_DATA,
  validateEmployeeField,
  validateEmployeeForm,
} from '@/lib/employeeFormValidation'
import {
  getEligibleEmployeeUsers,
  getEmployeeSpecialties,
  getServicesForSpecialty,
  isValidEmployeeId,
  mergeEmployeeServices,
} from '@/lib/employeeUtils'
import {
  getEmployeeById,
  updateEmployee,
} from '@/services/employeesService'

function createInitialFormData() {
  return {
    ...INITIAL_EMPLOYEE_FORM_DATA,
    servicioIds: [],
  }
}

function copyFormData(formData) {
  return {
    ...formData,
    servicioIds: [...formData.servicioIds],
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

export function EditEmployeePage() {
  const { id } = useParams()
  const navigate = useNavigate()
  const { token } = useAuth()
  const normalizedId = String(id ?? '').trim()
  const hasValidId = isValidEmployeeId(normalizedId)
  const {
    users,
    services: activeServices,
    isLoading: areOptionsLoading,
    error: optionsError,
    retry: retryOptions,
  } = useEmployeeFormOptions({ enabled: hasValidId })
  const [employee, setEmployee] = useState(null)
  const [formData, setFormData] = useState(createInitialFormData)
  const [originalFormData, setOriginalFormData] = useState(null)
  const [fieldErrors, setFieldErrors] = useState({})
  const [isLoadingEmployee, setIsLoadingEmployee] = useState(hasValidId)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [loadError, setLoadError] = useState('')
  const [isUnavailable, setIsUnavailable] = useState(false)
  const [apiError, setApiError] = useState('')
  const [infoMessage, setInfoMessage] = useState('')
  const [retryCount, setRetryCount] = useState(0)
  const isMountedRef = useRef(true)
  const submittingRef = useRef(false)

  useEffect(() => {
    isMountedRef.current = true

    return () => {
      isMountedRef.current = false
    }
  }, [])

  useEffect(() => {
    if (!hasValidId) {
      return undefined
    }

    const controller = new AbortController()
    let isActive = true

    async function loadEmployee() {
      await Promise.resolve()

      if (!isActive) {
        return
      }

      setIsLoadingEmployee(true)
      setLoadError('')
      setIsUnavailable(false)
      setEmployee(null)
      setOriginalFormData(null)

      try {
        const response = await getEmployeeById(normalizedId, {
          token,
          signal: controller.signal,
        })

        if (!isActive) {
          return
        }

        if (
          !response?.data ||
          typeof response.data !== 'object' ||
          Array.isArray(response.data)
        ) {
          const responseError = new Error(
            'No fue posible obtener la información del empleado.',
          )
          responseError.code = 'INVALID_EMPLOYEE_RESPONSE'
          throw responseError
        }

        const initialData = getEmployeeFormData(response.data)

        setEmployee(response.data)
        setFormData(copyFormData(initialData))
        setOriginalFormData(copyFormData(initialData))
        setFieldErrors({})
        setApiError('')
        setInfoMessage('')
      } catch (requestError) {
        if (!isActive) {
          return
        }

        if (requestError?.status === 404) {
          setIsUnavailable(true)
        } else if (requestError?.code === 'INVALID_EMPLOYEE_RESPONSE') {
          setLoadError(requestError.message)
        } else {
          const errorState = getEmployeeApiErrorState(requestError)
          setLoadError(errorState.message)
        }
      } finally {
        if (isActive) {
          setIsLoadingEmployee(false)
        }
      }
    }

    void loadEmployee()

    return () => {
      isActive = false
      controller.abort()
    }
  }, [hasValidId, normalizedId, retryCount, token])

  const availableServices = useMemo(
    () => mergeEmployeeServices(activeServices, employee?.servicios),
    [activeServices, employee],
  )
  const eligibleUsers = useMemo(
    () => getEligibleEmployeeUsers(users, employee),
    [employee, users],
  )
  const specialties = useMemo(
    () => getEmployeeSpecialties(availableServices, employee),
    [availableServices, employee],
  )
  const specialtyServices = useMemo(
    () =>
      getServicesForSpecialty(
        availableServices,
        formData.especialidadId,
        formData.servicioIds,
      ),
    [availableServices, formData.especialidadId, formData.servicioIds],
  )
  const validationOptions = useMemo(
    () => ({
      users: eligibleUsers,
      specialties,
      services: availableServices,
      currentEmployeeId: employee?.id ?? normalizedId,
    }),
    [availableServices, eligibleUsers, employee, normalizedId, specialties],
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
    setInfoMessage('')
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
    setInfoMessage('')
    updateExistingFieldErrors(nextFormData, ['servicioIds'])
  }

  async function handleSubmit(event) {
    event.preventDefault()

    if (isSubmitting || submittingRef.current || !employee) {
      return
    }

    const errors = validateEmployeeForm(formData, validationOptions)
    setFieldErrors(errors)

    if (Object.keys(errors).length) {
      setInfoMessage('')
      return
    }

    const employeeData = buildEmployeeData(formData)
    const changeState = getEmployeeChangeState(
      originalFormData,
      employeeData,
    )

    if (!changeState.hasChanges) {
      setApiError('')
      setInfoMessage('No se realizaron cambios en el empleado.')
      return
    }

    submittingRef.current = true
    setApiError('')
    setInfoMessage('')
    setIsSubmitting(true)

    try {
      await updateEmployee(normalizedId, employeeData, { token })

      if (!isMountedRef.current) {
        return
      }

      navigate(`/empleados/${encodeURIComponent(normalizedId)}`, {
        replace: true,
        state: { successMessage: 'Empleado actualizado correctamente.' },
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

  function handleRetry() {
    if (loadError) {
      setIsLoadingEmployee(true)
      setLoadError('')
      setIsUnavailable(false)
      setRetryCount((currentCount) => currentCount + 1)
    }

    if (optionsError) {
      retryOptions()
    }
  }

  if (!hasValidId) {
    return (
      <ErrorState
        title="El identificador del empleado no es válido"
        message="Verifica la dirección e intenta abrir un empleado existente."
        action={<BackToEmployeesAction />}
      />
    )
  }

  if (isLoadingEmployee || areOptionsLoading) {
    return <LoadingState message="Cargando información del empleado..." />
  }

  if (isUnavailable) {
    return (
      <EmptyState
        title="El empleado solicitado no existe o no está disponible."
        description="Puede que el registro ya no exista o que la dirección no sea correcta."
        action={<BackToEmployeesAction />}
      />
    )
  }

  const combinedLoadError = [loadError, optionsError]
    .filter(Boolean)
    .filter((message, index, messages) => messages.indexOf(message) === index)
    .join(' ')

  if (combinedLoadError) {
    return (
      <ErrorState
        title="No fue posible cargar el empleado"
        message={combinedLoadError}
        action={
          <div className="flex flex-wrap justify-center gap-2">
            <Button type="button" onClick={handleRetry}>
              Intentar nuevamente
            </Button>
            <BackToEmployeesAction />
          </div>
        }
      />
    )
  }

  if (!employee) {
    return null
  }

  if (!eligibleUsers.length) {
    return (
      <EmptyState
        title="No hay usuarios disponibles para este empleado."
        description="No fue posible conservar ni seleccionar un usuario elegible."
        action={<BackToEmployeesAction />}
      />
    )
  }

  if (!availableServices.length) {
    return (
      <EmptyState
        title="No hay servicios disponibles para editar el empleado."
        description="Se necesita al menos un servicio activo o previamente asignado."
        action={<BackToEmployeesAction />}
      />
    )
  }

  if (!specialties.length) {
    return (
      <EmptyState
        title="No hay especialidades disponibles para este empleado."
        description="No fue posible conservar ni derivar una especialidad válida."
        action={<BackToEmployeesAction />}
      />
    )
  }

  return (
    <section className="w-full space-y-6">
      <PageHeader
        title="Editar empleado"
        description="Actualiza los datos laborales y los servicios asignados."
      />

      <EmployeeForm
        formData={formData}
        fieldErrors={fieldErrors}
        apiError={apiError}
        apiErrorTitle="No fue posible actualizar el empleado"
        infoMessage={infoMessage}
        isSubmitting={isSubmitting}
        submitText="Guardar cambios"
        submittingText="Guardando cambios..."
        users={eligibleUsers}
        specialties={specialties}
        services={specialtyServices}
        onChange={handleChange}
        onServicesChange={handleServicesChange}
        onSubmit={handleSubmit}
        onCancel={() =>
          navigate(`/empleados/${encodeURIComponent(normalizedId)}`)
        }
      />
    </section>
  )
}
