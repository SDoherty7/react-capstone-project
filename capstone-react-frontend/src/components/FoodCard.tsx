import { useState } from 'react'
import { useCart } from '../context/CartContext'
import type { MenuItem } from '../types'
import './FoodCard.css'

interface FoodCardProps {
  item: MenuItem
}


function FoodCard({ item }: FoodCardProps) {
  const [expanded, setExpanded] = useState(false)
  // add cart context so we can add from here
  const { addToCart } = useCart()

  // the description for some items was pretty long so opting to collapse it
  const isLong = item.description.length > 250
  const displayedDescription =
    isLong && !expanded
      ? item.description.slice(0, 250) + '…'
      : item.description

  return (
    <div className="food-card">
      <img src={`${item.imageurl}`} alt={item.name} />
      <div className="food-card-body">
        <h3>{item.name}</h3>
        <p>
          {displayedDescription}
          {isLong && (
            <span
              className="expand-btn"
              onClick={() => setExpanded((prev) => !prev)}
            >
              {expanded ? ' Show less' : ' Show more'}
            </span>
          )}
        </p>
        <span className="food-card-price">${item.price}</span>
        <button type="button" onClick={() => addToCart(item)}>
          Add to Basket
        </button>
      </div>
    </div>
  )
}

export default FoodCard
