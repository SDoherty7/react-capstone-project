import { useState, useEffect } from 'react'
import Orders from '../components/OrdersList'
import { getOrdersByUserId } from '../apis/ordersService'
import { useAuth } from '../context/AuthContext'
import type { OrdersList } from '../types'

function OrdersPage() {
  const { currentUser, isAuthenticated } = useAuth()
  const [orders, setOrders] = useState<OrdersList[]>([])
  const [loadedUserId, setLoadedUserId] = useState<number | null>(null)
  const [error, setError] = useState<string | null>(null)

  const loading = Boolean(isAuthenticated && (!currentUser || loadedUserId !== currentUser.id) && !error)

  useEffect(() => {
    if (!isAuthenticated || !currentUser) {
      return
    }

    getOrdersByUserId(currentUser.id)
      .then((nextOrders) => {
        setError(null)
        setOrders(nextOrders)
        setLoadedUserId(currentUser.id)
      })
      .catch((err: Error) => {
        setError(err.message)
        setLoadedUserId(currentUser.id)
      })
  }, [currentUser, isAuthenticated])

  if (loading) return <p>Loading your orders...</p>
  if (!isAuthenticated || !currentUser) return <p>Please log in to view your orders.</p>
  if (error) return <p>Error: {error}</p>

  //TODO reorder by created date so completed ones aren't at the top
  return (
    <div className="orders-grid">
      {orders.map((item) => (
        <Orders key={item.id} item={item} />
      ))}
    </div>
  )
}

export default OrdersPage
