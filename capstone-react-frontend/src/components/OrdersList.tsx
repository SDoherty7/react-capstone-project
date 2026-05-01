import { Link } from 'react-router-dom'
import type { OrdersList } from '../types'
import './OrderList.css'

interface OrderListProps {
  item: OrdersList
}


// TODO clean this up more its still not showing a date thats nicely formatted

function formatOrderTime(value: string | null) {
  if (!value) {
    return 'Pending'
  }

  const date = new Date(value)

  if (Number.isNaN(date.getTime())) {
    return value
  }

  return date.toLocaleString()
}

function OrderList({ item }: OrderListProps) {
  return (
    <Link to={`/orders/${item.id}`} className="orders-card-link">
      <div className="orders-card">
        <div className="orders-card-body">
          <div className="orders-card-header">
            <h3>Order #{item.id}</h3>
            <span className="order-status">{item.status}</span>
          </div>

          <p><strong>Ordered:</strong> {formatOrderTime(item.ordertime)}</p>
          <p><strong>Pickup:</strong> {formatOrderTime(item.pickuptime)}</p>
          <p><strong>Location:</strong> {item.area} - {item.location}</p>
          <p><strong>Tax:</strong> ${item.tax}</p>
          <p><strong>Tip:</strong> ${item.tip}</p>
        </div>
      </div>
    </Link>
  )
}

export default OrderList
