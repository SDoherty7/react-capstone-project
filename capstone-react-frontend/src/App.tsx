import { BrowserRouter, Routes, Route } from 'react-router-dom'
import Checkout from './components/Checkout'
import Header from './components/Header'
import { AuthProvider } from './context/AuthContext'
import { CartProvider } from './context/CartContext'
import Home from './pages/Home'
import LoginPage from './pages/LoginPage'
import OrderDetailsPage from './pages/OrderDetailsPage'
import OrdersPage from './pages/OrdersPage'
import RegisterPage from './pages/RegisterPage'
import './App.css'

function App() {
  return (
    <AuthProvider>
      <CartProvider>
        <BrowserRouter>
          <Header />
          <main>
            <Routes>
              <Route path="/" element={<Home />} />
              <Route path="/checkout" element={<Checkout />} />
              <Route path="/orders" element={<OrdersPage />} />
              <Route path="/orders/:orderId" element={<OrderDetailsPage />} />
              <Route path="/login" element={<LoginPage />} />
              <Route path="/register" element={<RegisterPage />} />
            </Routes>
          </main>
        </BrowserRouter>
      </CartProvider>
    </AuthProvider>
  )
}

export default App

