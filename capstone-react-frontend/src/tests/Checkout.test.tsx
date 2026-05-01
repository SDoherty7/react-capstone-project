import { afterEach, describe, expect, it, vi } from 'vitest'
import { cleanup, fireEvent, render, screen, waitFor } from '@testing-library/react'
import type { CartItem, } from '../context/CartContext'
import Checkout from '../components/Checkout'

const { createOrderMock, createOrderItemsMock, useAuthMock, useCartMock, navigateMock } = vi.hoisted(() => ({
  createOrderMock: vi.fn(),
  createOrderItemsMock: vi.fn(),
  useAuthMock: vi.fn(),
  useCartMock: vi.fn(),
  navigateMock: vi.fn(),
}))

vi.mock('../apis/ordersService', () => ({
  createOrder: createOrderMock,
  createOrderItems: createOrderItemsMock,
}))

vi.mock('../context/AuthContext', () => ({
  useAuth: useAuthMock,
}))

vi.mock('../context/CartContext', () => ({
  useCart: useCartMock,
}))

vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual<typeof import('react-router-dom')>('react-router-dom')

  return {
    ...actual,
    useNavigate: () => navigateMock,
  }
})

function buildCartItem(overrides: Partial<CartItem> = {}): CartItem {
  return {
    id: 1,
    name: "Bison Burger",
    description: "Packed with protein and a touch of sweetness, it's topped with your choice of cheese and classic burger fixings. Lean, humanely raised meat for those who are more health-conscious.",
    category: "entrees",
    price: 11.54,
    imageurl: "/images/food/burger_1.jpg",
    available: true,
    firstName: '',
    notes: '',
    quantity: 1,
    ...overrides,
  }
}

describe('Checkout', () => {
  afterEach(() => {
    cleanup()
    vi.clearAllMocks()
  })

  it('renders the empty cart state', () => {
    useAuthMock.mockReturnValue({
      currentUser: null,
      isAuthenticated: false,
    })
    useCartMock.mockReturnValue({
      items: [],
      total: 0,
      removeFromCart: vi.fn(),
      updateItemFirstName: vi.fn(),
      updateItemNotes: vi.fn(),
      clearCart: vi.fn(),
    })

    render(<Checkout />)

    expect(screen.getByText('Empty cart pls add something from the menu at the home page.')).toBeTruthy()
  })

  it('blocks submission if the user enteredan invalid cc num', async () => {
    useAuthMock.mockReturnValue({
      currentUser: {
        id: 3,
        first: 'Seamus',
      },
      isAuthenticated: true,
    })
    useCartMock.mockReturnValue({
      items: [buildCartItem()],
      total: 4.5,
      removeFromCart: vi.fn(),
      updateItemFirstName: vi.fn(),
      updateItemNotes: vi.fn(),
      clearCart: vi.fn(),
    })

    render(<Checkout />)

    fireEvent.change(screen.getByLabelText('PAN'), { target: { value: '1234' } })
    fireEvent.change(screen.getByLabelText('Expiry Month'), { target: { value: '12' } })
    fireEvent.change(screen.getByLabelText('Expiry Year'), { target: { value: '2028' } })
    fireEvent.change(screen.getByLabelText('CVV'), { target: { value: '123' } })
    fireEvent.submit(screen.getByRole('button', { name: 'Submit order' }).closest('form') as HTMLFormElement)

    expect(await screen.findByText('Enter a valid credit card number')).toBeTruthy()
    expect(createOrderMock).not.toHaveBeenCalled()
  })

  it('submits the orderand redirects to the order page to show the order details', async () => {
    const clearCartMock = vi.fn()

    useAuthMock.mockReturnValue({
      currentUser: {
        id: 9,
        first: 'Seamus',
      },
      isAuthenticated: true,
    })
    useCartMock.mockReturnValue({
      items: [
        buildCartItem({ id: 11, quantity: 2, notes: 'No pickles pls', firstName: '' }),
        buildCartItem({ id: 12, name: 'testing', price: 2.25, quantity: 1, firstName: 'Test' }),
      ],
      total: 11.25,
      removeFromCart: vi.fn(),
      updateItemFirstName: vi.fn(),
      updateItemNotes: vi.fn(),
      clearCart: clearCartMock,
    })
    createOrderMock.mockResolvedValue({ id: 42 })
    createOrderItemsMock.mockResolvedValue([])

    render(<Checkout />)

    fireEvent.change(screen.getByLabelText('PAN'), { target: { value: '4242424242424242' } })
    fireEvent.change(screen.getByLabelText('Expiry Month'), { target: { value: '12' } })
    fireEvent.change(screen.getByLabelText('Expiry Year'), { target: { value: '2028' } })
    fireEvent.change(screen.getByLabelText('CVV'), { target: { value: '123' } })
    fireEvent.change(screen.getByLabelText('Tip'), { target: { value: '2.5' } })
    fireEvent.submit(screen.getByRole('button', { name: 'Submit order' }).closest('form') as HTMLFormElement)

    await waitFor(() => {
      expect(createOrderMock).toHaveBeenCalledTimes(1)
    })

    expect(createOrderItemsMock).toHaveBeenCalledWith(42, [
      {
        itemid: 11,
        price: 11.54,
        notes: 'No pickles pls',
        firstName: 'Seamus',
      },
      {
        itemid: 11,
        price: 11.54,
        notes: 'No pickles pls',
        firstName: 'Seamus',
      },
      {
        itemid: 12,
        price: 2.25,
        notes: '',
        firstName: 'Test',
      },
    ])
    expect(clearCartMock).toHaveBeenCalledTimes(1)
    expect(navigateMock).toHaveBeenCalledWith('/orders/42')
  })
})