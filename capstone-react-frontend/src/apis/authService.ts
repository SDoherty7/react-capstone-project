import type { RegisterUserInput, UserProfile } from '../types'

const AUTH_TOKEN_KEY = 'food-app-auth-token'

function normalizeToken(rawToken: string) {
  const trimmedToken = rawToken.trim()

  if (trimmedToken.startsWith('"') && trimmedToken.endsWith('"')) {
    return trimmedToken.slice(1, -1)
  }

  return trimmedToken
}

function decodeJwtPayload(token: string) {
  try {
    const [, payload] = token.split('.')
    if (!payload) {
      return null
    }

    const normalizedPayload = payload.replace(/-/g, '+').replace(/_/g, '/')
    const decodedPayload = atob(normalizedPayload)
    return JSON.parse(decodedPayload) as { username?: string; sub?: string } | null
  } catch {
    return null
  }
}

export function getAuthToken() {
  return localStorage.getItem(AUTH_TOKEN_KEY)
}

export function setAuthToken(token: string) {
  localStorage.setItem(AUTH_TOKEN_KEY, token)
}

export function clearAuthToken() {
  localStorage.removeItem(AUTH_TOKEN_KEY)
}

export function buildAuthHeaders() {
  const token = getAuthToken()

  const headers: Record<string, string> = {}

  if (token) {
    headers.Authorization = `Bearer ${token}`
  }

  return headers
}

export function getAuthenticatedUsername() {
  const token = getAuthToken()

  if (!token) {
    return null
  }

  const payload = decodeJwtPayload(token)
  return payload?.username ?? payload?.sub ?? null
}

export async function getCurrentUserProfile(): Promise<UserProfile | null> {
  const username = getAuthenticatedUsername()
  const token = getAuthToken()

  if (!username || !token) {
    return null
  }

  const response = await fetch('/api/users', {
    headers: buildAuthHeaders(),
  })

  if (!response.ok) {
    throw new Error(`Failed to load the current user: ${response.status}`)
  }

  const users: UserProfile[] = await response.json()
  return users.find((user) => user.username === username) ?? null
}

export async function registerUser(payload: RegisterUserInput) {
  const response = await fetch('/api/users', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(payload),
  })

  if (!response.ok) {
    throw new Error(`Registration failed: ${response.status}`)
  }

  return response.json()
}

export async function loginUser(username: string, password: string) {
  const credentials = btoa(`${username}:${password}`)
  const response = await fetch('/auth/login', {
    method: 'POST',
    headers: {
      Authorization: `Basic ${credentials}`,
    },
  })

  if (response.status === 401) {
    throw new Error('Login failed: invalid username or password.')
  }

  if (!response.ok) {
    throw new Error(`Login failed: ${response.status}`)
  }

  const rawToken = await response.text()
  const token = normalizeToken(rawToken)
  setAuthToken(token)
  return token
}