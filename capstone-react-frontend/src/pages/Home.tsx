import { useState, useEffect } from 'react'
import FoodCard from '../components/FoodCard'
import { getMenuItems } from '../apis/menuService'
import type { MenuItem } from '../types'

function Home() {
  const [menuItems, setMenuItems] = useState<MenuItem[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    getMenuItems()
      .then(setMenuItems)
      .catch((err: Error) => setError(err.message))
      .finally(() => setLoading(false))
  }, [])

  if (loading) return <p>Loading menu...</p>
  if (error) return <p>Error: {error}</p>

  return (
    <div className="menu-grid">
      {menuItems.map((item) => (
        <FoodCard key={item.id} item={item} />
      ))}
    </div>
  )
}

export default Home
