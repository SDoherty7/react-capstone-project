import { useEffect, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { getOrderItems } from '../apis/ordersService'
import type { OrderItem } from '../types'
import './OrderDetailsPage.css'

function OrderDetailsPage() {
  const { orderId } = useParams()
  const [items, setItems] = useState<OrderItem[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const parsedOrderId = Number(orderId)

    if (!Number.isFinite(parsedOrderId)) {
      setError('Invalid order id')
      setLoading(false)
      return
    }

    getOrderItems(parsedOrderId)
      .then(setItems)
      .catch((err: Error) => setError(err.message))
      .finally(() => setLoading(false))
  }, [orderId])

  if (loading) return <p>Loading order details...</p>
  if (error) return <p>Error: {error}</p>

  return (
    <section className="order-details-page">
      <Link to="/orders" className="order-details-back">Back to orders</Link>
      <h1>Order #{orderId}</h1>
      {items.length === 0 ? (
        <p>No items found for this order.</p>
      ) : (
        <ul className="order-items-list">
          {items.map((item) => (
            <li key={item.id} className="order-item-card">
              <div className="order-item-header">
                <strong>Item #{item.itemid}</strong>
                <span>${item.price.toFixed(2)}</span>
              </div>
              <p><strong>For:</strong> {item.firstName}</p>
              <p><strong>Notes:</strong> {item.notes || 'No notes'}</p>
            </li>
          ))}
        </ul>
      )}
    </section>
  )
}

export default OrderDetailsPage