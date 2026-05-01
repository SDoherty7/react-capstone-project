import {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react'
import {
  clearAuthToken,
  getAuthToken,
  getAuthenticatedUsername,
  getCurrentUserProfile,
  loginUser,
} from '../apis/authService'
import type { UserProfile } from '../types'

interface AuthContextValue {
  currentUser: UserProfile | null
  isAuthenticated: boolean
  username: string | null
  login: (username: string, password: string) => Promise<void>
  logout: () => void
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [currentUser, setCurrentUser] = useState<UserProfile | null>(null)
  const [token, setToken] = useState<string | null>(getAuthToken())

  // TODO figure out how to fix this error
  useEffect(() => {
    if (!token) {
      setCurrentUser(null)
      return
    }

    // fetch the logged in user info
    getCurrentUserProfile()
      .then((user) => {
        setCurrentUser(user)
      })
      .catch(() => {
        setCurrentUser(null)
      })
  }, [token])

  async function login(username: string, password: string) {
    const nextToken = await loginUser(username, password)
    setToken(nextToken)
    const user = await getCurrentUserProfile()
    setCurrentUser(user)
  }

  function logout() {
    clearAuthToken()
    setToken(null)
    setCurrentUser(null)
  }

  const value = useMemo(
    () => ({
      currentUser,
      isAuthenticated: Boolean(token),
      username: getAuthenticatedUsername(),
      login,
      logout,
    }),
    [currentUser, token],
  )

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth() {
  const context = useContext(AuthContext)

  if (!context) {
    throw new Error('an error occurred ')
  }

  return context
}