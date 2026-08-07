import { useCallback, useEffect, useState } from 'react'

import { useAuth } from '@/context/useAuth'
import { getErrorMessage } from '@/lib/getErrorMessage'
import { getActiveServices } from '@/services/servicesService'
import { getEmployeeUsers } from '@/services/usersService'

function createInvalidOptionsResponseError(message) {
  const error = new Error(message)
  error.code = 'INVALID_EMPLOYEE_OPTIONS_RESPONSE'

  return error
}

function getOptionsErrorMessage(error) {
  return error?.code === 'INVALID_EMPLOYEE_OPTIONS_RESPONSE'
    ? error.message
    : getErrorMessage(error)
}

export function useEmployeeFormOptions({ enabled = true } = {}) {
  const { token } = useAuth()
  const [users, setUsers] = useState([])
  const [services, setServices] = useState([])
  const [isLoadingUsers, setIsLoadingUsers] = useState(enabled)
  const [isLoadingServices, setIsLoadingServices] = useState(enabled)
  const [usersError, setUsersError] = useState('')
  const [servicesError, setServicesError] = useState('')
  const [retryCount, setRetryCount] = useState(0)

  const retry = useCallback(() => {
    if (!enabled) {
      return
    }

    setUsers([])
    setServices([])
    setUsersError('')
    setServicesError('')
    setIsLoadingUsers(true)
    setIsLoadingServices(true)
    setRetryCount((currentCount) => currentCount + 1)
  }, [enabled])

  useEffect(() => {
    if (!enabled) {
      return undefined
    }

    const controller = new AbortController()
    let isActive = true

    async function loadUsers() {
      try {
        const response = await getEmployeeUsers({
          token,
          signal: controller.signal,
        })

        if (!Array.isArray(response?.data)) {
          throw createInvalidOptionsResponseError(
            'No fue posible obtener los usuarios disponibles.',
          )
        }

        if (isActive) {
          setUsers(response.data)
        }
      } catch (requestError) {
        if (isActive) {
          setUsers([])
          setUsersError(getOptionsErrorMessage(requestError))
        }
      } finally {
        if (isActive) {
          setIsLoadingUsers(false)
        }
      }
    }

    async function loadServices() {
      try {
        const response = await getActiveServices({
          token,
          signal: controller.signal,
        })

        if (!Array.isArray(response?.data)) {
          throw createInvalidOptionsResponseError(
            'No fue posible obtener los servicios disponibles.',
          )
        }

        if (isActive) {
          setServices(response.data)
        }
      } catch (requestError) {
        if (isActive) {
          setServices([])
          setServicesError(getOptionsErrorMessage(requestError))
        }
      } finally {
        if (isActive) {
          setIsLoadingServices(false)
        }
      }
    }

    async function startLoading() {
      await Promise.resolve()

      if (!isActive) {
        return
      }

      setUsers([])
      setServices([])
      setUsersError('')
      setServicesError('')
      setIsLoadingUsers(true)
      setIsLoadingServices(true)

      void loadUsers()
      void loadServices()
    }

    void startLoading()

    return () => {
      isActive = false
      controller.abort()
    }
  }, [enabled, retryCount, token])

  const effectiveUsersError = enabled ? usersError : ''
  const effectiveServicesError = enabled ? servicesError : ''
  const effectiveIsLoadingUsers = enabled && isLoadingUsers
  const effectiveIsLoadingServices = enabled && isLoadingServices
  const isLoading = effectiveIsLoadingUsers || effectiveIsLoadingServices
  const error = [effectiveUsersError, effectiveServicesError]
    .filter(Boolean)
    .filter((message, index, messages) => messages.indexOf(message) === index)
    .join(' ')

  return {
    users: enabled ? users : [],
    services: enabled ? services : [],
    isLoading,
    error,
    isLoadingUsers: effectiveIsLoadingUsers,
    isLoadingServices: effectiveIsLoadingServices,
    isLoadingSpecialties: effectiveIsLoadingServices,
    usersError: effectiveUsersError,
    servicesError: effectiveServicesError,
    specialtiesError: effectiveServicesError,
    retry,
  }
}
