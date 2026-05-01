import { buildAuthHeaders } from './authService'
import type { MenuItem } from '../types'

// Fetch all the menu items
export async function getMenuItems(): Promise<MenuItem[]> {
  const response = await fetch('/api/menuitems', {
    headers: buildAuthHeaders(),
  })
  if (!response.ok) {
    throw new Error(`Failed to fetch the menu items via API: ${response.status}`)
  }
  return response.json()
}
