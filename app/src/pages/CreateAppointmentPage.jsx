import { useEffect, useMemo, useRef, useState } from 'react'
import { ArrowLeft, CircleAlert, RefreshCw } from 'lucide-react'
import { Link, useNavigate } from 'react-router-dom'

import { PageHeader } from '@/components/common/PageHeader'
import { AppointmentForm } from '@/components/forms/AppointmentForm'
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import { Button } from '@/components/ui/button'
import { useAuth } from '@/context/useAuth'
import {
  buildAppointmentData,
  getAppointmentApiErrorState,
  INITIAL_APPOINTMENT_FORM_DATA,
  validateAppointmentForm,
} from '@/lib/appointmentFormValidation'
import {
  addMinutesToTime,
  calculateAppointmentEstimate,
  getSchedulesForDate,
  getTodayDateKey,
  INITIAL_APPOINTMENT_STATUS,
  isIntervalWithinSchedules,
} from '@/lib/appointmentUtils'
import { formatApiTime } from '@/lib/dateTimeUtils'
import { getUserFullName } from '@/lib/employeeUtils'
import { getErrorMessage } from '@/lib/getErrorMessage'
import { ROLES } from '@/lib/permissions'
import { getActiveAdditionals } from '@/services/additionalsService'
import {
  createAppointment,
  getAppointmentStatuses,
  getAvailability,
} from '@/services/appointmentsService'
import { getActiveEmployeesByService } from '@/services/employeesService'
import { getSchedules } from '@/services/schedulesService'
import { getActiveServices } from '@/services/servicesService'
import { getClientUsers } from '@/services/usersService'

const INVALID_RESPONSE_CODE = 'INVALID_APPOINTMENT_OPTIONS_RESPONSE'
const MINIMUM_DATE = getTodayDateKey()

function createInitialFormData(userId) {
  return {
    ...INITIAL_APPOINTMENT_FORM_DATA,
    clienteId: userId ? String(userId) : '',
    adicionalIds: [],
  }
}

function getArrayResponse(response, resourceName) {
  if (!Array.isArray(response?.data)) {
    const error = new Error(
      `No fue posible obtener ${resourceName} desde el servidor.`,
    )
    error.code = INVALID_RESPONSE_CODE
    throw error
  }

  return response.data
}

function getLoadErrorMessage(error) {
  return error?.code === INVALID_RESPONSE_CODE
    ? error.message
    : getErrorMessage(error)
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

export function CreateAppointmentPage() {
  const navigate = useNavigate()
  const { user, role, token } = useAuth()
  const roleName = role?.nombre
  const showClientSelector = [ROLES.ADMIN, ROLES.EMPLOYEE].includes(roleName)
  const [formData, setFormData] = useState(() =>
    createInitialFormData(showClientSelector ? null : user?.id),
  )
  const [fieldErrors, setFieldErrors] = useState({})
  const [apiError, setApiError] = useState('')
  const [clients, setClients] = useState([])
  const [services, setServices] = useState([])
  const [employees, setEmployees] = useState([])
  const [additionals, setAdditionals] = useState([])
  const [statuses, setStatuses] = useState([])
  const [schedules, setSchedules] = useState([])
  const [catalogErrors, setCatalogErrors] = useState({})
  const [isLoadingClients, setIsLoadingClients] = useState(showClientSelector)
  const [isLoadingServices, setIsLoadingServices] = useState(true)
  const [isLoadingEmployees, setIsLoadingEmployees] = useState(false)
  const [isLoadingAdditionals, setIsLoadingAdditionals] = useState(true)
  const [isLoadingStatuses, setIsLoadingStatuses] = useState(true)
  const [isLoadingSchedules, setIsLoadingSchedules] = useState(true)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [availability, setAvailability] = useState({
    status: 'idle',
    message: '',
  })
  const [retryCount, setRetryCount] = useState(0)
  const submittingRef = useRef(false)
  const minimumDate = MINIMUM_DATE
  const effectiveFormData = showClientSelector
    ? formData
    : { ...formData, clienteId: user?.id ? String(user.id) : '' }

  useEffect(() => {
    let isActive = true

    Promise.resolve()
      .then(async () => {
        if (!isActive) {
          return null
        }

        setCatalogErrors({})
        setIsLoadingClients(showClientSelector)
        setIsLoadingServices(true)
        setIsLoadingAdditionals(true)
        setIsLoadingStatuses(true)
        setIsLoadingSchedules(true)

        const requests = [
          showClientSelector
            ? getClientUsers({ token })
            : Promise.resolve({ data: [] }),
          getActiveServices({ token }),
          getActiveAdditionals({ token }),
          getAppointmentStatuses({ token }),
          getSchedules({ token }),
        ]

        return Promise.allSettled(requests)
      })
      .then((results) => {
        if (!isActive || results === null) {
          return
        }

        const resourceNames = [
          'los clientes',
          'los servicios activos',
          'los servicios adicionales activos',
          'los estados de cita',
          'los horarios de atención',
        ]
        const keys = ['clients', 'services', 'additionals', 'statuses', 'schedules']
        const nextErrors = {}
        const dataByKey = {}

        results.forEach((result, index) => {
          const key = keys[index]

          if (result.status === 'fulfilled') {
            try {
              dataByKey[key] = getArrayResponse(
                result.value,
                resourceNames[index],
              )
            } catch (responseError) {
              nextErrors[key] = getLoadErrorMessage(responseError)
            }
          } else {
            nextErrors[key] = getLoadErrorMessage(result.reason)
          }
        })

        if (dataByKey.clients) {
          setClients(
            dataByKey.clients.filter(
              (client) =>
                client?.activo === true &&
                client?.rol?.nombre === ROLES.CLIENT &&
                client?.rol?.activo === true,
            ),
          )
        }
        if (dataByKey.services) {
          setServices(
            dataByKey.services.filter((service) => service?.activo === true),
          )
        }
        if (dataByKey.additionals) {
          setAdditionals(
            dataByKey.additionals.filter(
              (additional) => additional?.activo === true,
            ),
          )
        }
        if (dataByKey.statuses) {
          setStatuses(
            dataByKey.statuses.filter((status) => status?.activo === true),
          )
        }
        if (dataByKey.schedules) {
          setSchedules(dataByKey.schedules)
        }
        setCatalogErrors(nextErrors)
      })
      .finally(() => {
        if (isActive) {
          setIsLoadingClients(false)
          setIsLoadingServices(false)
          setIsLoadingAdditionals(false)
          setIsLoadingStatuses(false)
          setIsLoadingSchedules(false)
        }
      })

    return () => {
      isActive = false
    }
  }, [retryCount, showClientSelector, token])

  useEffect(() => {
    let isActive = true
    const serviceId = effectiveFormData.servicioId

    Promise.resolve()
      .then(() => {
        if (!isActive || !/^[1-9]\d*$/.test(serviceId)) {
          return null
        }

        setIsLoadingEmployees(true)

        return getActiveEmployeesByService(serviceId, { token })
      })
      .then((response) => {
        if (!isActive || response === null) {
          return
        }

        const nextEmployees = getArrayResponse(
          response,
          'los empleados disponibles',
        ).filter(
          (employee) =>
            employee?.activo === true &&
            employee?.usuario?.activo === true &&
            (roleName !== ROLES.EMPLOYEE ||
              Number(employee?.id) === Number(user?.empleado?.id)),
        )

        setEmployees(nextEmployees)
        if (roleName === ROLES.EMPLOYEE && nextEmployees.length === 1) {
          setFormData((currentData) => ({
            ...currentData,
            empleadoId: String(nextEmployees[0].id),
            horaInicio: '',
          }))
          setFieldErrors((currentErrors) => {
            const nextErrors = { ...currentErrors }
            delete nextErrors.empleadoId
            delete nextErrors.horaInicio
            return nextErrors
          })
        }
        setCatalogErrors((currentErrors) => {
          const remainingErrors = { ...currentErrors }
          delete remainingErrors.employees
          return remainingErrors
        })
      })
      .catch((requestError) => {
        if (isActive) {
          setEmployees([])
          setCatalogErrors((currentErrors) => ({
            ...currentErrors,
            employees: getLoadErrorMessage(requestError),
          }))
        }
      })
      .finally(() => {
        if (isActive) {
          setIsLoadingEmployees(false)
        }
      })

    return () => {
      isActive = false
    }
  }, [
    effectiveFormData.servicioId,
    retryCount,
    roleName,
    token,
    user?.empleado?.id,
  ])

  const selectedService = useMemo(
    () =>
      services.find(
        (service) =>
          Number(service?.id) === Number(effectiveFormData.servicioId),
      ) ?? null,
    [effectiveFormData.servicioId, services],
  )
  const estimateBase = useMemo(
    () =>
      calculateAppointmentEstimate(
        selectedService,
        additionals,
        effectiveFormData.adicionalIds,
      ),
    [additionals, effectiveFormData.adicionalIds, selectedService],
  )
  const estimate = useMemo(
    () => ({
      ...estimateBase,
      endTime: addMinutesToTime(
        effectiveFormData.horaInicio,
        estimateBase.durationMinutes,
      ),
    }),
    [effectiveFormData.horaInicio, estimateBase],
  )
  const schedulesForDate = useMemo(
    () => getSchedulesForDate(schedules, effectiveFormData.fecha),
    [effectiveFormData.fecha, schedules],
  )
  const scheduleText = formatSchedules(schedulesForDate)
  const scheduleMessage = effectiveFormData.fecha
    ? scheduleText
      ? `Horario de atención: ${scheduleText}.`
      : isLoadingSchedules
        ? 'Cargando horario de atención...'
        : 'No hay horario de atención activo para esta fecha.'
    : 'Selecciona una fecha para consultar el horario de atención.'
  const isWithinSchedule =
    effectiveFormData.horaInicio && estimate.endTime
      ? isIntervalWithinSchedules(
          effectiveFormData.horaInicio,
          estimate.endTime,
          schedulesForDate,
        )
      : null

  useEffect(() => {
    let isActive = true
    const employeeId = Number(effectiveFormData.empleadoId)
    const serviceId = Number(effectiveFormData.servicioId)
    const canCheck =
      Number.isInteger(employeeId) &&
      employeeId > 0 &&
      Number.isInteger(serviceId) &&
      serviceId > 0 &&
      Boolean(effectiveFormData.fecha) &&
      Boolean(effectiveFormData.horaInicio) &&
      Boolean(estimate.endTime)

    Promise.resolve()
      .then(() => {
        if (!isActive) {
          return null
        }

        if (!canCheck) {
          setAvailability({ status: 'idle', message: '' })
          return null
        }

        if (
          !isLoadingSchedules &&
          !catalogErrors.schedules &&
          schedulesForDate.length === 0
        ) {
          setAvailability({
            status: 'unavailable',
            message: 'No hay horarios disponibles para la fecha seleccionada.',
          })
          return null
        }

        setAvailability({
          status: 'checking',
          message: 'Consultando el intervalo seleccionado con el servidor...',
        })

        return getAvailability(
          {
            empleadoId: employeeId,
            servicioId: serviceId,
            fecha: effectiveFormData.fecha,
            horaInicio: effectiveFormData.horaInicio,
            horaFin: estimate.endTime,
          },
          token,
        )
      })
      .then((response) => {
        if (!isActive || response === null) {
          return
        }

        const result = response?.data

        if (
          !result ||
          typeof result !== 'object' ||
          typeof result.disponible !== 'boolean'
        ) {
          throw new Error('La respuesta de disponibilidad no es válida.')
        }

        setAvailability({
          status: result.disponible ? 'available' : 'unavailable',
          message:
            typeof result.motivo === 'string' && result.motivo.trim()
              ? result.motivo.trim()
              : result.disponible
                ? 'El horario seleccionado está disponible.'
                : 'El horario seleccionado no está disponible.',
        })
      })
      .catch((requestError) => {
        if (isActive) {
          setAvailability({
            status: 'error',
            message:
              requestError?.message ===
              'La respuesta de disponibilidad no es válida.'
                ? requestError.message
                : getErrorMessage(requestError),
          })
        }
      })

    return () => {
      isActive = false
    }
  }, [
    catalogErrors.schedules,
    effectiveFormData.empleadoId,
    effectiveFormData.fecha,
    effectiveFormData.horaInicio,
    effectiveFormData.servicioId,
    estimate.endTime,
    isLoadingSchedules,
    schedulesForDate,
    token,
  ])

  const initialStatus = statuses.find(
    (status) => status?.nombre === INITIAL_APPOINTMENT_STATUS,
  )
  const catalogErrorMessage = Object.values(catalogErrors)
    .filter((message) => typeof message === 'string' && message.trim())
    .join(' ')
  const missingInitialStatus =
    !isLoadingStatuses &&
    !catalogErrors.statuses &&
    !initialStatus

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

    if (field === 'servicioId') {
      setFormData((currentData) => ({
        ...currentData,
        servicioId: value,
        empleadoId: '',
        horaInicio: '',
      }))
      setEmployees([])
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
    clearFieldErrors('adicionalIds')
  }

  function getValidationContext(availabilityStatus = availability.status) {
    return {
      userId: user?.id,
      initialStatusId: initialStatus?.id,
      showClientSelector,
      clients,
      services,
      employees,
      additionals,
      estimate,
      minimumDate,
      availabilityStatus,
      schedulesLoaded: !isLoadingSchedules && !catalogErrors.schedules,
      schedulesForDate,
      isWithinSchedule,
    }
  }

  async function handleSubmit(event) {
    event.preventDefault()

    if (isSubmitting || submittingRef.current) {
      return
    }

    const validationContext = getValidationContext()
    const validationErrors = validateAppointmentForm(
      effectiveFormData,
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
    setApiError('')

    try {
      const availabilityResponse = await getAvailability(
        {
          empleadoId: Number(effectiveFormData.empleadoId),
          servicioId: Number(effectiveFormData.servicioId),
          fecha: effectiveFormData.fecha,
          horaInicio: effectiveFormData.horaInicio,
          horaFin: estimate.endTime,
        },
        token,
      )
      const availabilityResult = availabilityResponse?.data

      if (availabilityResult?.disponible !== true) {
        const message =
          typeof availabilityResult?.motivo === 'string' &&
          availabilityResult.motivo.trim()
            ? availabilityResult.motivo.trim()
            : 'El horario seleccionado ya no está disponible.'

        setAvailability({ status: 'unavailable', message })
        setFieldErrors({ horaInicio: message })
        return
      }

      const appointmentData = buildAppointmentData(
        effectiveFormData,
        validationContext,
      )
      const response = await createAppointment(appointmentData, token)
      const appointmentId = Number(response?.data?.id)
      const destination =
        Number.isInteger(appointmentId) && appointmentId > 0
          ? `/citas/${encodeURIComponent(String(appointmentId))}`
          : '/citas'

      navigate(destination, {
        state: { successMessage: 'Cita creada correctamente.' },
      })
    } catch (requestError) {
      const errorState = getAppointmentApiErrorState(requestError)
      setFieldErrors(errorState.fieldErrors)
      setApiError(errorState.apiError)
    } finally {
      submittingRef.current = false
      setIsSubmitting(false)
    }
  }

  function handleRetry() {
    setCatalogErrors({})
    setRetryCount((currentCount) => currentCount + 1)
  }

  return (
    <section className="w-full space-y-6">
      <PageHeader
        title="Nueva cita"
        description="Selecciona el servicio, profesional, fecha y hora para registrar la cita."
        actions={
          <Button asChild type="button" variant="outline">
            <Link to="/citas">
              <ArrowLeft aria-hidden="true" />
              Volver a citas
            </Link>
          </Button>
        }
      />

      {catalogErrorMessage || missingInitialStatus ? (
        <Alert variant="destructive">
          <CircleAlert aria-hidden="true" />
          <AlertTitle>No fue posible cargar todas las opciones</AlertTitle>
          <AlertDescription>
            <p>
              {catalogErrorMessage ||
                'No está disponible el estado inicial Pendiente para registrar citas.'}
            </p>
            <Button
              type="button"
              variant="outline"
              onClick={handleRetry}
              disabled={
                isLoadingClients ||
                isLoadingServices ||
                isLoadingAdditionals ||
                isLoadingStatuses ||
                isLoadingSchedules
              }
            >
              <RefreshCw aria-hidden="true" />
              Intentar nuevamente
            </Button>
          </AlertDescription>
        </Alert>
      ) : null}

      <AppointmentForm
        formData={effectiveFormData}
        fieldErrors={fieldErrors}
        apiError={apiError}
        clients={clients}
        services={services}
        employees={employees}
        additionals={additionals}
        showClientSelector={showClientSelector}
        currentClientName={getUserFullName(user)}
        isLoadingClients={isLoadingClients}
        isLoadingServices={isLoadingServices}
        isLoadingEmployees={isLoadingEmployees}
        isLoadingAdditionals={isLoadingAdditionals}
        isPreparing={
          isLoadingClients ||
          isLoadingServices ||
          isLoadingEmployees ||
          isLoadingAdditionals ||
          isLoadingStatuses ||
          isLoadingSchedules
        }
        isSubmitting={isSubmitting}
        availabilityStatus={availability.status}
        availabilityMessage={availability.message}
        scheduleMessage={scheduleMessage}
        minimumDate={minimumDate}
        estimate={estimate}
        onFieldChange={handleFieldChange}
        onAdditionalsChange={handleAdditionalsChange}
        onSubmit={handleSubmit}
        onCancel={() => navigate('/citas')}
      />
    </section>
  )
}
