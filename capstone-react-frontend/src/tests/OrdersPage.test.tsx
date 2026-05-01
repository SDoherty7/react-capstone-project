import { afterEach, describe, expect, it, vi } from 'vitest'
import { cleanup, render, screen } from '@testing-library/react'
import type { OrdersList, UserProfile } from '../types'
import OrdersPage from '../pages/OrdersPage'

const { getOrdersByUserIdMock, useAuthMock } = vi.hoisted(() => ({
  getOrdersByUserIdMock: vi.fn(),
  useAuthMock: vi.fn(),
}))

vi.mock('../apis/ordersService', () => ({
  getOrdersByUserId: getOrdersByUserIdMock,
}))

vi.mock('../context/AuthContext', () => ({
  useAuth: useAuthMock,
}))

vi.mock('../components/OrdersList', () => ({
  default: ({ item }: { item: OrdersList }) => <div>{`Order ${item.id}`}</div>,
}))

describe('OrdersPage', () => {
  afterEach(() => {
    cleanup()
    vi.clearAllMocks()
  })

  it('asks the user to log in if they arent', () => {
    useAuthMock.mockReturnValue({
      currentUser: null,
      isAuthenticated: false,
    })

    render(<OrdersPage />)

    expect(screen.getByText('Please log in to view your orders.')).toBeTruthy()
    expect(getOrdersByUserIdMock).not.toHaveBeenCalled()
  })

  it('shows the loading state for an authenticated user without a profile yet', () => {
    useAuthMock.mockReturnValue({
      currentUser: null,
      isAuthenticated: true,
    })

    render(<OrdersPage />)

    expect(screen.getByText('Loading your orders...')).toBeTruthy()
  })

  it('loads and renders the signed-in user orders', async () => {
    const user: UserProfile = {
      id: 7,
      username: 'sdoherty',
      first: 'Seamus',
      last: 'Doherty',
      roles: 'USER',
    }

    getOrdersByUserIdMock.mockResolvedValue([
      {
        id: 101,
        userid: 7,
        ordertime: '2026-04-30T18:00:00.000Z',
        pickuptime: '2026-04-30T18:15:00.000Z',
        area: 'Theater 1',
        location: 'Table 1',
        tax: 2,
        tip: 3,
        pan: '1111',
        expiryMonth: 12,
        expiryYear: 2028,
        status: 'submitted',
      },
    ])

    useAuthMock.mockReturnValue({
      currentUser: user,
      isAuthenticated: true,
    })

    render(<OrdersPage />)

    expect(screen.getByText('Loading your orders...')).toBeTruthy()
    expect(await screen.findByText('Order 101')).toBeTruthy()
    expect(getOrdersByUserIdMock).toHaveBeenCalledWith(7)
  })

  it('renders the orders API error', async () => {
    useAuthMock.mockReturnValue({
      currentUser: {
        id: 5,
        username: 'appsupportman',
        first: 'App',
        last: 'Support',
        roles: 'USER',
      },
      isAuthenticated: true,
    })
    getOrdersByUserIdMock.mockRejectedValue(new Error('orders failed'))

    render(<OrdersPage />)

    expect(await screen.findByText('Error: orders failed')).toBeTruthy()
  })
})