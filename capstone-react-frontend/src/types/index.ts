export interface MenuItem {
  id: number
  name: string
  description: string
  category: string
  price: number
  imageurl: string
  available: boolean
}

export interface OrdersList {
  id: number
  userid: number
  ordertime: string | null
  pickuptime: string | null
  area: string
  location: string
  tax: number
  tip: number
  pan: string
  expiryMonth: number
  expiryYear: number
  status: string
}

export interface OrderItem {
  id: number
  orderid: number
  itemid: number
  price: number
  notes: string
  firstName: string
}

export interface CreateOrderInput {
  userid: number
  ordertime: string
  pickuptime: string
  area: string
  location: string
  tax: number
  tip: number
  pan: string
  expiryMonth: number
  expiryYear: number
  status: string
}

export interface CreateOrderItemInput {
  itemid: number
  price: number
  notes: string
  firstName: string
}

export interface UserProfile {
  id: number
  username: string
  first: string
  last: string
  roles: string
  email?: string
  phone?: string
  imageUrl?: string
}

export interface RegisterUserInput {
  username: string
  password: string
  first: string
  last: string
  roles: string
}

