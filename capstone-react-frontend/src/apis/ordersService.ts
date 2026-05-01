import type {
  CreateOrderInput,
  CreateOrderItemInput,
  OrderItem,
  OrdersList,
} from '../types'
import { buildAuthHeaders } from './authService'

// Fetch all the orders
export async function getOrders(): Promise<OrdersList[]> {
  const response = await fetch('/api/orders', {
    headers: buildAuthHeaders(),
  })
  if (!response.ok) {
    throw new Error(`Failed to fetch the orders list via API: ${response.status}`)
  }
  return response.json()
}

export async function getOrdersByUserId(userId: number): Promise<OrdersList[]> {
  const response = await fetch(`/api/orders/user/${userId}`, {
    headers: buildAuthHeaders(),
  })
  if (!response.ok) {
    throw new Error(`Failed to fetch the user's orders: ${response.status}`)
  }
  return response.json()
}

export async function getOrderItems(orderId: number): Promise<OrderItem[]> {
  const response = await fetch(`/api/items/order/${orderId}`, {
    headers: buildAuthHeaders(),
  })
  if (!response.ok) {
    throw new Error(`Failed to fetch the order items via API: ${response.status}`)
  }
  return response.json()
}

export async function createOrder(order: CreateOrderInput): Promise<OrdersList> {
  const response = await fetch('/api/orders', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      ...buildAuthHeaders(),
    },
    body: JSON.stringify(order),
  })

  if (!response.ok) {
    throw new Error(`Failed to create order: ${response.status}`)
  }

  return response.json()
}

export async function createOrderItems(
  orderId: number,
  items: CreateOrderItemInput[],
): Promise<OrderItem[]> {
  const response = await fetch(`/api/items/order/${orderId}`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      ...buildAuthHeaders(),
    },
    body: JSON.stringify(items),
  })

  if (!response.ok) {
    throw new Error(`Failed to create the order items: ${response.status}`)
  }

  return response.json()
}
