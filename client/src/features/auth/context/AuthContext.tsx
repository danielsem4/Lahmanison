import { createContext, useState, useCallback, useEffect } from 'react'
import type { AuthUser } from '../types/auth.types'
import { getMe, logoutUser } from '../api/auth.api'

interface AuthContextValue {
  user: AuthUser | null
  isAuthenticated: boolean
  isLoading: boolean
  setUser: (user: AuthUser) => void
  clearAuth: () => Promise<void>
}

export const AuthContext = createContext<AuthContextValue | null>(null)

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUserState] = useState<AuthUser | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    let ignore = false
    const controller = new AbortController()

    getMe(controller.signal)
      .then((user) => {
        if (!ignore) setUserState(user)
      })
      .catch(() => {
        if (!ignore) setUserState(null)
      })
      .finally(() => {
        if (!ignore) setIsLoading(false)
      })

    return () => {
      ignore = true
      controller.abort()
    }
  }, [])

  const setUser = useCallback((newUser: AuthUser) => {
    setUserState(newUser)
  }, [])

  const clearAuth = useCallback(async () => {
    await logoutUser()
    setUserState(null)
  }, [])

  const value: AuthContextValue = {
    user,
    isAuthenticated: user !== null,
    isLoading,
    setUser,
    clearAuth,
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}
