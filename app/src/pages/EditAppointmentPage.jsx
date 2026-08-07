import { useEffect, useMemo, useRef, useState } from 'react'
import { ArrowLeft } from 'lucide-react'
import { Link, useNavigate, useParams } from 'react-router-dom'

import { PageHeader } from '@/components/common/PageHeader'
import { EmptyState } from '@/components/feedback/EmptyState'
import { ErrorState } from '@/components/feedback/ErrorState'
import { LoadingState } from '@/components/feedback/LoadingState'
import { AppointmentForm } from '@/components/forms/AppointmentForm'
import { Button } from '@/components/ui/button'
import { useAuth } from '@/context/useAuth'
import { loadScopedAppointment } from '@/lib/appointmentAccess'
import {
  buildAppointmentUpdateData,
  getAppointmentApiErrorState,
  getAppointmentFormData,
  hasAppointmentFormChanges,
  validateAppointmentForm,
} from '@/lib/appointmentFormValidation'
import {
  addMinutesToTime,
  calculateAppointmentEstimate,
  getAvailableAppointmentActions,
  getSchedulesForDate,
  getTodayDateKey,
  isIntervalWithinSchedules,
  isValidAppointmentId,
} from '@/lib/appointmentUtils'
import { formatApiTime } from '@/lib/dateTimeUtils'
import { getUserFullName } from '@/lib/employeeUtils'
import { getErrorMessage } from '@/lib/getErrorMessage'
import { ROLES } from '@/lib/permissions'
import { getActiveAdditionals } from '@/services/additionalsService'
import {
  checkAppointmentAvailability,
  updateAppointment,
} from '@/services/appointmentsService'
import { getActiveEmployeesByService } from '@/services/employeesService'
import { getSchedules } from '@/services/schedulesService'
import { getActiveServices } from '@/services/servicesService'
import { getClientUsers } from '@/services/usersService'

const INVALID_OPTIONS_RESPONSE_CODE =
  'INVALID_APPOINTMENT_OPTIONS_RESPONSE'
const INVALID_ID_MESSAGE = 'El identificador de la cita no es válido.'
const NOT_FOUND_MESSAGE =
  'La cita solicitada no existe o no está disponible.'

function createLocalError(message, code = INVALID_OPTIONS_RESPONSE_CODE) {
  const error = new Error(message)
  error.code = code

  return error
}

function getArrayResponse(response, resourceName) {
  if (!Array.isArray(response?.data)) {
    throw createLocalError(
      `No fue posible obtener ${resourceName} desde el servidor.`,
    )
  }

  return response.data
}

function getLoadErrorMessage(error) {
  return error?.code?.startsWith('INVALID_')
    ? error.message
    : getErrorMessage(error)
}

function getActiveClients(response) {
  return getArrayResponse(response, 'los clientes').filter(
    (client) =>
      client?.activo === true &&
      client?.rol?.nombre === ROLES.CLIENT &&
      client?.rol?.activo === true,
  )
}

function getActiveServicesFromResponse(response) {
  return getArrayResponse(response, 'los servicios activos').filter(
    (service) => service?.activo === true,
  )
}

function getActiveAdditionalsFromResponse(response) {
  return getArrayResponse(
    response,
    'los servicios adicionales activos',
  ).filter((additional) => additional?.activo === true)
}

function getAvailableEmployees(response, roleName, user) {
  return getArrayResponse(response, 'los empleados disponibles').filter(
    (employee) =>
      employee?.activo === true &&
      employee?.usuario?.activo === true &&
      (roleName !== ROLES.EMPLOYEE ||
        Number(employee?.id) === Number(user?.empleado?.id)),
  )
}

function mergeCurrentEntity(items, currentEntity) {
  const collection = Array.isArray(items) ? items : []
  const currentId = Number(currentEntity?.id)

  if (!Number.isInteger(currentId) || currentId <= 0) {
    return collection
  }

  return collection.some((item) => Number(item?.id) === currentId)
    ? collection
    : [currentEntity, ...collection]
}

function mergeCurrentAdditionals(items, currentAdditionals) {
  return (Array.isArray(currentAdditionals) ? currentAdditionals : []).reduce(
    (mergedItems, additional) =>
      mergeCurrentEntity(mergedItems, additional),
    items,
  )
}

function formatSchedules(schedules) {
  return schedules
    .map((schedule) => {
      const start = formatApiTime(schedule?.horaInicio)
      const end = formatApiTime(schedule?.horaFin)

      return start && end ? `${start} – ${end}` : ''
    })
    .filter(Boolean)
    .join(', ')
}

function BackToAppointmentsButton() {
  return (
    <Button asChild type="button">
      <Link to="/citas">
        <ArrowLeft aria-hidden="true" />
        Volver a citas
      </Link>
    </Button>
  )
}

function BackToAppointmentButton({ appointmentId, variant = 'outline' }) {
  return (
    <Button asChild type="button" variant={variant}>
      <Link
        to={`/citas/${encodeURIComponent(String(appointmentId))}`}
      >
        <ArrowLeft aria-hidden="true" />
        Volver al detalle
      </Link>
    </Button>
  )
}

export function EditAppointmentPage() {
  const { id } = useParams()
  const navigate = useNavigate()
  const { role, token, user } = useAuth()
  const roleName = role?.nombre
  const normalizedId = String(id ?? '').trim()
  const hasValidId = isValidAppointmentId(normalizedId)
  const showClientSelector = [ROLES.ADMIN, ROLES.EMPLOYEE].includes(
    roleName,
  )
  const [minimumDate] = useState(() => getTodayDateKey())
  const [appointment, setAppointment] = useState(null)
  const [formData, setFormData] = useState(null)
  const [originalFormData, setOriginalFormData] = useState(null)
  const [fieldErrors, setFieldErrors] = useState({})
  const [apiError, setApiError] = useState('')
  const [infoMessage, setInfoMessage] = useState('')
  const [clients, setClients] = useState([])
  const [services, setServices] = useState([])
  const [employees, setEmployees] = useState([])
  const [additionals, setAdditionals] = useState([])
  const [schedules, setSchedules] = useState([])
  const [isLoading, setIsLoading] = useState(true)
  const [isLoadingEmployees, setIsLoadingEmployees] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [loadError, setLoadError] = useState('')
  const [isUnavailable, setIsUnavailable] = useState(false)
  const [isForbidden, setIsForbidden] = useState(false)
  const [isNotEditable, setIsNotEditable] = useState(false)
  const [retryCount, setRetryCount] = useState(0)
  const [availability, setAvailability] = useState({
    status: 'idle',
    message: '',
  })
  const submittingRef = useRef(false)
  const loadedEmployeesServiceIdRef = useRef('')

  useEffect(() => {
    if (!hasValidId) {
      return undefined
    }

    const controller = new AbortController()
    let isActive = true

    async function loadAppointmentForm() {
      setIsLoading(true)
      setLoadError('')
      setIsUnavailable(false)
      setIsForbidden(false)
      setIsNotEditable(false)
      setAppointment(null)
      setFormData(null)
      setOriginalFormData(null)
      setApiError('')
      setInfoMessage('')
      setFieldErrors({})
      setAvailability({ status: 'idle', message: '' })
      setIsLoadingEmployees(false)
      loadedEmployeesServiceIdRef.current = ''

      try {
        const requestOptions = { signal: controller.signal, token }
        const nextAppointment = await loadScopedAppointment(
          normalizedId,
          roleName,
          user,
          token,
          { signal: controller.signal },
        )

        if (!isActive) {
          return
        }

        setAppointment(nextAppointment)

        if (nextAppointment?.estadoCita?.permiteEdicion !== true) {
          setIsNotEditable(true)
          return
        }

        if (!isValidAppointmentId(nextAppointment.servicioId)) {
          throw createLocalError(
            'La cita no contiene un servicio válido para editar.',
            'INVALID_APPOINTMENT_SERVICE',
          )
        }

        const [
          clientsResponse,
          servicesResponse,
          additionalsResponse,
          schedulesResponse,
        ] = await Promise.all([
          showClientSelector
            ? getClientUsers(requestOptions)
            : Promise.resolve({ data: [] }),
          getActiveServices(requestOptions),
          getActiveAdditionals(requestOptions),
          getSchedules(requestOptions),
        ])

        if (!isActive) {
          return
        }

        const nextClients = showClientSelector
          ? mergeCurrentEntity(
              getActiveClients(clientsResponse),
              nextAppointment.cliente,
            )
          : []
        const nextServices = mergeCurrentEntity(
          getActiveServicesFromResponse(servicesResponse),
          nextAppointment.servicio,
        )
        const nextAdditionals = mergeCurrentAdditionals(
          getActiveAdditionalsFromResponse(additionalsResponse),
          nextAppointment.adicionales,
        )
        const nextSchedules = getArrayResponse(
          schedulesResponse,
          'los horarios de atención',
        )

        const employeesResponse = await getActiveEmployeesByService(
          nextAppointment.servicioId,
          requestOptions,
        )

        if (!isActive) {
          return
        }

        const nextEmployees = mergeCurrentEntity(
          getAvailableEmployees(employeesResponse, roleName, user),
          nextAppointment.empleado,
        )
        const nextFormData = getAppointmentFormData(nextAppointment)

        setClients(nextClients)
        setServices(nextServices)
        setAdditionals(nextAdditionals)
        setSchedules(nextSchedules)
        setEmployees(nextEmployees)
        setIsLoadingEmployees(false)
        setFormData(nextFormData)
        setOriginalFormData(nextFormData)
        loadedEmployeesServiceIdRef.current = String(
          nextAppointment.servicioId,
        )
      } catch (requestError) {
        if (!isActive) {
          return
        }

        if (requestError?.status === 404) {
          setIsUnavailable(true)
        } else if (
          requestError?.status === 403 ||
          requestError?.code === 'FORBIDDEN_APPOINTMENT'
        ) {
          setIsForbidden(true)
        } else {
          setLoadError(getLoadErrorMessage(requestError))
        }
      } finally {
        if (isActive) {
          setIsLoading(false)
        }
      }
    }

    void loadAppointmentForm()

    return () => {
      isActive = false
      controller.abort()
    }
  }, [
    hasValidId,
    normalizedId,
    retryCount,
    roleName,
    showClientSelector,
    token,
    user,
  ])

  useEffect(() => {
    const serviceId = String(formData?.servicioId ?? '').trim()

    if (
      isLoading ||
      isNotEditable ||
      !isValidAppointmentId(serviceId) ||
      loadedEmployeesServiceIdRef.current === serviceId
    ) {
      return undefined
    }

    const controller = new AbortController()
    let isActive = true

    async function loadEmployees() {
      setIsLoadingEmployees(true)
      setApiError('')

      try {
        const response = await getActiveEmployeesByService(serviceId, {
          signal: controller.signal,
          token,
        })
        const nextEmployees = getAvailableEmployees(
          response,
          roleName,
          user,
        )

        if (isActive) {
          setEmployees(nextEmployees)
          loadedEmployeesServiceIdRef.current = serviceId
        }
      } catch (requestError) {
        if (isActive) {
          setEmployees([])
          setApiError(getLoadErrorMessage(requestError))
        }
      } finally {
        if (isActive) {
          setIsLoadingEmployees(false)
        }
      }
    }

    void loadEmployees()

    return () => {
      isActive = false
      controller.abort()
    }
  }, [
    formData?.servicioId,
    isLoading,
    isNotEditable,
    roleName,
    token,
    user,
  ])

  const selectedService = useMemo(
    () =>
      services.find(
        (service) =>
          Number(service?.id) === Number(formData?.servicioId),
      ) ?? null,
    [formData?.servicioId, services],
  )
  const estimateBase = useMemo(
    () =>
      calculateAppointmentEstimate(
        selectedService,
        additionals,
        formData?.adicionalIds,
      ),
    [additionals, formData?.adicionalIds, selectedService],
  )
  const estimate = useMemo(
    () => ({
      ...estimateBase,
      endTime: addMinutesToTime(
        formData?.horaInicio,
        estimateBase.durationMinutes,
      ),
    }),
    [estimateBase, formData?.horaInicio],
  )
  const schedulesForDate = useMemo(
    () => getSchedulesForDate(schedules, formData?.fecha),
    [formData?.fecha, schedules],
  )
  const scheduleText = formatSchedules(schedulesForDate)
  const scheduleMessage = formData?.fecha
    ? scheduleText
      ? `Horario de atención: ${scheduleText}.`
      : 'No hay horario de atención activo para esta fecha.'
    : 'Selecciona una fecha para consultar el horario de atención.'
  const isWithinSchedule =
    formData?.horaInicio && estimate.endTime
      ? isIntervalWithinSchedules(
          formData.horaInicio,
          estimate.endTime,
          schedulesForDate,
        )
      : null
  const selectedEmployeeId = formData?.empleadoId
  const selectedServiceId = formData?.servicioId
  const selectedDate = formData?.fecha
  const selectedStartTime = formData?.horaInicio

  useEffect(() => {
    if (
      isLoading ||
      isNotEditable ||
      !hasValidId
    ) {
      return undefined
    }

    const employeeId = Number(selectedEmployeeId)
    const serviceId = Number(selectedServiceId)
    const canCheck =
      Number.isInteger(employeeId) &&
      employeeId > 0 &&
      Number.isInteger(serviceId) &&
      serviceId > 0 &&
      Boolean(selectedDate) &&
      Boolean(selectedStartTime) &&
      Boolean(estimate.endTime)

    const controller = new AbortController()
    let isActive = true

    async function checkAvailability() {
      await Promise.resolve()

      if (!isActive) {
        return
      }

      if (!canCheck) {
        setAvailability({ status: 'idle', message: '' })
        return
      }

      if (schedulesForDate.length === 0) {
        setAvailability({
          status: 'unavailable',
          message: 'No hay horarios disponibles para la fecha seleccionada.',
        })
        return
      }

      setAvailability({
        status: 'checking',
        message: 'Consultando disponibilidad...',
      })

      try {
        const response = await checkAppointmentAvailability(
          {
            empleadoId: employeeId,
            servicioId: serviceId,
            fecha: selectedDate,
            horaInicio: selectedStartTime,
            horaFin: estimate.endTime,
            citaIdExcluir: Number(normalizedId),
          },
          { signal: controller.signal, token },
        )
        const result = response?.data

        if (
          !result ||
          typeof result !== 'object' ||
          typeof result.disponible !== 'boolean'
        ) {
          throw createLocalError(
            'La respuesta de disponibilidad no es válida.',
            'INVALID_AVAILABILITY_RESPONSE',
          )
        }

        if (isActive) {
          setAvailability({
            status: result.disponible ? 'available' : 'unavailable',
            message:
              typeof result.motivo === 'string' && result.motivo.trim()
                ? result.motivo.trim()
                : result.disponible
                  ? 'El horario seleccionado está disponible.'
                  : 'El horario seleccionado no está disponible.',
          })
        }
      } catch (requestError) {
        if (isActive) {
          setAvailability({
            status: 'error',
            message: requestError?.code?.startsWith('INVALID_')
              ? requestError.message
              : getErrorMessage(requestError),
          })
        }
      }
    }

    void checkAvailability()

    return () => {
      isActive = false
      controller.abort()
    }
  }, [
    estimate.endTime,
    hasValidId,
    isLoading,
    isNotEditable,
    normalizedId,
    schedulesForDate,
    selectedDate,
    selectedEmployeeId,
    selectedServiceId,
    selectedStartTime,
    token,
  ])

  function clearFieldErrors(...fields) {
    setFieldErrors((currentErrors) => {
      const nextErrors = { ...currentErrors }

      fields.forEach((field) => delete nextErrors[field])
      delete nextErrors._form

      return nextErrors
    })
  }

  function handleFieldChange(field, value) {
    setApiError('')
    setInfoMessage('')

    if (field === 'servicioId') {
      loadedEmployeesServiceIdRef.current = ''
      setEmployees([])
      setFormData((currentData) => ({
        ...currentData,
        servicioId: value,
        empleadoId: '',
        horaInicio: '',
      }))
      setAvailability({ status: 'idle', message: '' })
      clearFieldErrors('servicioId', 'empleadoId', 'horaInicio')
      return
    }

    if (field === 'empleadoId' || field === 'fecha') {
      setFormData((currentData) => ({
        ...currentData,
        [field]: value,
        horaInicio: '',
      }))
      setAvailability({ status: 'idle', message: '' })
      clearFieldErrors(field, 'horaInicio')
      return
    }

    setFormData((currentData) => ({ ...currentData, [field]: value }))

    if (field === 'horaInicio') {
      setAvailability({ status: 'idle', message: '' })
    }

    clearFieldErrors(field)
  }

  function handleAdditionalsChange(additionalIds) {
    setFormData((currentData) => ({
      ...currentData,
      adicionalIds: additionalIds,
    }))
    setApiError('')
    setInfoMessage('')
    clearFieldErrors('adicionalIds')
  }

  function getValidationContext(
    availabilityStatus = availability.status,
  ) {
    return {
      mode: 'edit',
      userId: user?.id,
      showClientSelector,
      clients,
      services,
      employees,
      additionals,
      estimate,
      minimumDate,
      availabilityStatus,
      schedulesLoaded: true,
      schedulesForDate,
      isWithinSchedule,
    }
  }

  async function handleSubmit(event) {
    event.preventDefault()

    if (
      isSubmitting ||
      submittingRef.current ||
      !formData ||
      !appointment
    ) {
      return
    }

    setApiError('')
    setInfoMessage('')

    if (!hasAppointmentFormChanges(originalFormData, formData)) {
      setFieldErrors({})
      setInfoMessage('No se realizaron cambios en la cita.')
      return
    }

    const validationContext = getValidationContext()
    const validationErrors = validateAppointmentForm(
      formData,
      validationContext,
    )

    if (Object.keys(validationErrors).length) {
      setFieldErrors(validationErrors)
      setApiError(validationErrors._form ?? '')
      return
    }

    submittingRef.current = true
    setIsSubmitting(true)
    setFieldErrors({})

    try {
      const currentAppointment = await loadScopedAppointment(
        normalizedId,
        roleName,
        user,
        token,
      )
      const currentActions = getAvailableAppointmentActions({
        appointment: currentAppointment,
        roleName,
        user,
      })

      if (!currentActions.includes('edit')) {
        throw createLocalError(
          'El estado actual de la cita no permite modificarla.',
          'LOCAL_APPOINTMENT_EDIT_STATE',
        )
      }

      const availabilityResponse = await checkAppointmentAvailability(
        {
          empleadoId: Number(formData.empleadoId),
          servicioId: Number(formData.servicioId),
          fecha: formData.fecha,
          horaInicio: formData.horaInicio,
          horaFin: estimate.endTime,
          citaIdExcluir: Number(normalizedId),
        },
        { token },
      )
      const availabilityResult = availabilityResponse?.data

      if (
        !availabilityResult ||
        typeof availabilityResult !== 'object' ||
        typeof availabilityResult.disponible !== 'boolean'
      ) {
        throw createLocalError(
          'La respuesta de disponibilidad no es válida.',
          'INVALID_AVAILABILITY_RESPONSE',
        )
      }

      if (availabilityResult.disponible !== true) {
        const message =
          typeof availabilityResult.motivo === 'string' &&
          availabilityResult.motivo.trim()
            ? availabilityResult.motivo.trim()
            : 'El horario seleccionado ya no está disponible.'

        setAvailability({ status: 'unavailable', message })
        setFieldErrors({ horaInicio: message })
        return
      }

      const updateData = buildAppointmentUpdateData(
        formData,
        validationContext,
      )

      await updateAppointment(normalizedId, updateData, token)
      navigate(`/citas/${encodeURIComponent(normalizedId)}`, {
        replace: true,
        state: { successMessage: 'Cita actualizada correctamente.' },
      })
    } catch (requestError) {
      const errorState = getAppointmentApiErrorState(requestError)

      setFieldErrors(errorState.fieldErrors)
      setApiError(
        requestError?.code?.startsWith('INVALID_') ||
          requestError?.code === 'LOCAL_APPOINTMENT_EDIT_STATE'
          ? requestError.message
          : errorState.apiError,
      )
    } finally {
      submittingRef.current = false
      setIsSubmitting(false)
    }
  }

  function handleRetry() {
    setIsLoading(true)
    setLoadError('')
    setRetryCount((currentCount) => currentCount + 1)
  }

  if (!hasValidId) {
    return (
      <ErrorState
        title="El identificador de la cita no es válido"
        message={INVALID_ID_MESSAGE}
        action={<BackToAppointmentsButton />}
      />
    )
  }

  if (isLoading) {
    return <LoadingState message="Cargando información de la cita..." />
  }

  if (isForbidden) {
    return (
      <ErrorState
        title="Acceso denegado"
        message="No tienes permiso para editar esta cita."
        action={<BackToAppointmentsButton />}
      />
    )
  }

  if (isUnavailable) {
    return (
      <EmptyState
        title={NOT_FOUND_MESSAGE}
        description="Puede que la dirección no sea correcta."
        action={<BackToAppointmentsButton />}
      />
    )
  }

  if (isNotEditable) {
    return (
      <ErrorState
        title="Edición no disponible"
        message="Esta cita no puede editarse en su estado actual."
        action={
          <BackToAppointmentButton
            appointmentId={normalizedId}
            variant="default"
          />
        }
      />
    )
  }

  if (loadError) {
    return (
      <ErrorState
        title="No fue posible cargar la cita"
        message={loadError}
        action={
          <div className="flex flex-wrap justify-center gap-2">
            <Button type="button" onClick={handleRetry}>
              Intentar nuevamente
            </Button>
            <BackToAppointmentButton appointmentId={normalizedId} />
          </div>
        }
      />
    )
  }

  if (!appointment || !formData) {
    return null
  }

  return (
    <section className="w-full space-y-6">
      <PageHeader
        title="Editar cita"
        description="Actualiza la programación y los servicios de la cita."
        actions={
          <BackToAppointmentButton appointmentId={normalizedId} />
        }
      />

      <AppointmentForm
        mode="edit"
        formData={formData}
        fieldErrors={fieldErrors}
        apiError={apiError}
        apiErrorTitle="No fue posible actualizar la cita"
        infoMessage={infoMessage}
        clients={clients}
        services={services}
        employees={employees}
        additionals={additionals}
        showClientSelector={showClientSelector}
        currentClientName={
          getUserFullName(appointment.cliente) || getUserFullName(user)
        }
        isLoadingClients={false}
        isLoadingServices={false}
        isLoadingEmployees={isLoadingEmployees}
        isLoadingAdditionals={false}
        isPreparing={isLoadingEmployees}
        isSubmitting={isSubmitting}
        availabilityStatus={availability.status}
        availabilityMessage={availability.message}
        scheduleMessage={scheduleMessage}
        minimumDate={minimumDate}
        estimate={estimate}
        submitText="Guardar cambios"
        submittingText="Guardando cambios..."
        onFieldChange={handleFieldChange}
        onAdditionalsChange={handleAdditionalsChange}
        onSubmit={handleSubmit}
        onCancel={() =>
          navigate(`/citas/${encodeURIComponent(normalizedId)}`)
        }
      />
    </section>
  )
}
