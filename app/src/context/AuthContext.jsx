import {
  createContext,
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react'

import { getErrorMessage } from '@/lib/getErrorMessage'
import * as authService from '@/services/authService'

const AUTH_TOKEN_KEY = 'auth_token'

// eslint-disable-next-line react-refresh/only-export-components
export const AuthContext = createContext(undefined)

function isInvalidSessionError(error) {
  return error?.status === 401
}

function getUserFromResponse(response) {
  const currentUser = response?.data

  if (!currentUser || typeof currentUser !== 'object') {
    throw new Error('La respuesta del servidor no contiene un usuario válido.')
  }

  return currentUser
}

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null)
  const [token, setToken] = useState(() =>
    sessionStorage.getItem(AUTH_TOKEN_KEY),
  )
  const [role, setRole] = useState(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState(null)
  const requestIdRef = useRef(0)

  const clearSession = useCallback(() => {
    requestIdRef.current += 1
    sessionStorage.removeItem(AUTH_TOKEN_KEY)
    setUser(null)
    setToken(null)
    setRole(null)
    setError(null)
  }, [])

  const fetchCurrentUser = useCallback(
    async (sessionToken) => {
      const requestId = requestIdRef.current + 1
      requestIdRef.current = requestId

      try {
        const response = await authService.getCurrentUser(sessionToken)
        const currentUser = getUserFromResponse(response)

        if (requestId !== requestIdRef.current) {
          return null
        }

        setUser(currentUser)
        setToken(sessionToken)
        setRole(currentUser.rol ?? null)
        setError(null)

        return currentUser
      } catch (requestError) {
        if (requestId !== requestIdRef.current) {
          return null
        }

        if (isInvalidSessionError(requestError)) {
          clearSession()
        } else {
          setError(getErrorMessage(requestError))
        }

        throw requestError
      }
    },
    [clearSession],
  )

  const login = useCallback(
    async (credentials) => {
      setError(null)

      const response = await authService.login(credentials)
      const nextToken = response?.data?.token

      if (typeof nextToken !== 'string' || !nextToken) {
        throw new Error('La respuesta del servidor no contiene un token válido.')
      }

      sessionStorage.setItem(AUTH_TOKEN_KEY, nextToken)
      setToken(nextToken)

      return fetchCurrentUser(nextToken)
    },
    [fetchCurrentUser],
  )

  const logout = useCallback(() => {
    clearSession()
  }, [clearSession])

  const refreshUser = useCallback(async () => {
    if (!token) {
      setUser(null)
      setRole(null)
      setError(null)
      return null
    }

    return fetchCurrentUser(token)
  }, [fetchCurrentUser, token])

  useEffect(() => {
    let isActive = true

    async function restoreSession() {
      const storedToken = sessionStorage.getItem(AUTH_TOKEN_KEY)

      if (!storedToken) {
        if (isActive) {
          setUser(null)
          setToken(null)
          setRole(null)
          setIsLoading(false)
        }
        return
      }

      setToken(storedToken)

      try {
        await fetchCurrentUser(storedToken)
      } catch {
        // fetchCurrentUser centraliza el estado de los errores de sesión.
      } finally {
        if (isActive) {
          setIsLoading(false)
        }
      }
    }

    restoreSession()

    return () => {
      isActive = false
      requestIdRef.current += 1
    }
  }, [fetchCurrentUser])

  const value = useMemo(
    () => ({
      user,
      token,
      role,
      isAuthenticated: Boolean(user && token),
      isLoading,
      error,
      login,
      logout,
      refreshUser,
    }),
    [user, token, role, isLoading, error, login, logout, refreshUser],
  )

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}
