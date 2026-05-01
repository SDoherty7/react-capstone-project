import { createContext, useContext, useMemo, useState, type ReactNode } from 'react'
import type { MenuItem } from '../types'

export interface CartItem extends MenuItem {
  firstName: string
  notes: string
  quantity: number
}

interface CartContextValue {
  items: CartItem[]
  itemCount: number
  total: number
  addToCart: (item: MenuItem) => void
  removeFromCart: (itemId: number) => void
  updateItemFirstName: (itemId: number, firstName: string) => void
  updateItemNotes: (itemId: number, notes: string) => void
  clearCart: () => void
}

const CartContext = createContext<CartContextValue | undefined>(undefined)

export function CartProvider({ children }: { children: ReactNode }) {
  const [items, setItems] = useState<CartItem[]>([])

  const addToCart = (item: MenuItem) => {
    setItems((currentItems) => {
      const existingItem = currentItems.find((cartItem) => cartItem.id === item.id)

      if (existingItem) {
        return currentItems.map((cartItem) =>
          cartItem.id === item.id
            ? { ...cartItem, quantity: cartItem.quantity + 1 }
            : cartItem,
        )
      }

      return [...currentItems, { ...item, firstName: '', notes: '', quantity: 1 }]
    })
  }

  const removeFromCart = (itemId: number) => {
    setItems((currentItems) => currentItems.filter((item) => item.id !== itemId))
  }

  const updateItemFirstName = (itemId: number, firstName: string) => {
    setItems((currentItems) =>
      currentItems.map((item) => (item.id === itemId ? { ...item, firstName } : item)),
    )
  }

  const updateItemNotes = (itemId: number, notes: string) => {
    setItems((currentItems) =>
      currentItems.map((item) => (item.id === itemId ? { ...item, notes } : item)),
    )
  }

  const clearCart = () => {
    setItems([])
  }

  // I think this makes sense to avoid full rerendering ?
  const value = useMemo(
    () => ({
      items,
      itemCount: items.reduce((count, item) => count + item.quantity, 0),
      total: items.reduce((sum, item) => sum + item.price * item.quantity, 0),
      addToCart,
      removeFromCart,
      updateItemFirstName,
      updateItemNotes,
      clearCart,
    }),
    [items],
  )

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>
}

// TODO fix this error
export function useCart() {
  const context = useContext(CartContext)

  if (!context) {
    throw new Error('useCart must be used within a CartProvider')
  }

  return context
}
