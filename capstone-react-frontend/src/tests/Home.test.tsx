import { afterEach, describe, expect, it, vi } from 'vitest'
import { cleanup, render, screen } from '@testing-library/react'
import type { MenuItem } from '../types'
import Home from '../pages/Home'

const { getMenuItemsMock } = vi.hoisted(() => ({
  getMenuItemsMock: vi.fn(),
}))

vi.mock('../apis/menuService', () => ({
  getMenuItems: getMenuItemsMock,
}))

vi.mock('../components/FoodCard', () => ({
  default: ({ item }: { item: MenuItem }) => <div>{item.name}</div>,
}))

describe('Home', () => {
  afterEach(() => {
    cleanup()
    vi.clearAllMocks()
  })

  it('renders fetched menu items', async () => {
    getMenuItemsMock.mockResolvedValue([
        {
    id: 1,
    name: "Bison Burger",
    description: "Packed with protein and a touch of sweetness, it's topped with your choice of cheese and classic burger fixings. Lean, humanely raised meat for those who are more health-conscious.",
    category: "entrees",
    price: 11.54,
    imageurl: "/images/food/burger_1.jpg",
    available: true
  },
  {
    id: 2,
    name: "Southwest Burger",
    description: "Inspired by the spices of Tex-Mex, this one will light you up! Juicy patty seasoned with chili, cumin, and coriander, topped with pepper jack cheese, chipotle mayo, and fresh pico de gallo.",
    category: "entrees",
    price: 10.7,
    imageurl: "/images/food/burger_2.jpg",
    available: true
  },
    ])

    render(<Home />)

    expect(screen.getByText('Loading menu...')).toBeTruthy()
    expect(await screen.findByText('Bison Burger')).toBeTruthy()
    expect(screen.getByText('Southwest Burger')).toBeTruthy()
    expect(getMenuItemsMock).toHaveBeenCalledTimes(1)
  })

  it('renders the API error state', async () => {
    getMenuItemsMock.mockRejectedValue(new Error('menu is down'))

    render(<Home />)

    expect(await screen.findByText('Error: menu is down')).toBeTruthy()
  })
})