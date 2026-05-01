import { NavLink } from 'react-router-dom'
import logo from '../assets/logo.svg'
import { useAuth } from '../context/AuthContext'
import { useCart } from '../context/CartContext'
import './Header.css'

function Header() {
  const { itemCount } = useCart()
  const { currentUser, isAuthenticated, logout, username } = useAuth()

  return (
    <header className="header">
      <div className="header-logo">
        <img className="header-logo-image" src={logo} alt="Greggs Gourmet logo" />
        <span>GREGGS GOURMET</span>
      </div>
      <nav className="header-nav">
        <NavLink to="/" end>Food Menu</NavLink>
        <NavLink to="/checkout">
          Checkout
          <span className="header-cart-count">{itemCount}</span>
        </NavLink>
        <NavLink to="/orders">Orders</NavLink>
        {isAuthenticated ? (
          <>
            <span className="header-greeting">
              Logged in as, {currentUser?.first || username || 'there'}
            </span>
            <button type="button" className="header-logout" onClick={logout}>
              Log out
            </button>
          </>
        ) : (
          <NavLink to="/login">Login</NavLink>
        )}
      </nav>
    </header>
  )
}

export default Header
