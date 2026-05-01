import type { RegisterUserInput, UserProfile } from '../types'

const AUTH_TOKEN_KEY = 'food-app-auth-token'
//TODO is there a better way to store the user with auth?
const AUTH_USERNAME_KEY = 'food-app-auth-username'

export function getAuthToken() {
  return localStorage.getItem(AUTH_TOKEN_KEY)
}

export function setAuthToken(token: string) {
  localStorage.setItem(AUTH_TOKEN_KEY, token)
}

export function getAuthenticatedUsername() {
  return localStorage.getItem(AUTH_USERNAME_KEY)
}

export function setAuthenticatedUsername(username: string) {
  localStorage.setItem(AUTH_USERNAME_KEY, username)
}

export function clearAuthToken() {
  localStorage.removeItem(AUTH_TOKEN_KEY)
  localStorage.removeItem(AUTH_USERNAME_KEY)
}

export function buildAuthHeaders() {
  const token = getAuthToken()

  const headers: Record<string, string> = {}

  if (token) {
    headers.Authorization = `Bearer ${token}`
  }

  return headers
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
  // Doing this with base64 for now
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

  const token = await response.text()
  setAuthToken(token)
  setAuthenticatedUsername(username)
  return token
}
