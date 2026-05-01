import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { createOrder, createOrderItems } from '../apis/ordersService'
import { useAuth } from '../context/AuthContext'
import { useCart } from '../context/CartContext'
import './Checkout.css'

function getDefaultPickupTime() {
  // add 15 mins for defualt pickup
  const pickupTime = new Date(Date.now() + 15 * 60 * 1000)
  const timezoneOffset = pickupTime.getTimezoneOffset() * 60 * 1000
  return new Date(pickupTime.getTime() - timezoneOffset).toISOString().slice(0, 16)
}

// logic for this was pulled from https://stackoverflow.com/questions/12310837/implementation-of-luhn-algorithm
function passesLuhn(value: string) {
  const digits = value.replace(/\D/g, '')

  if (digits.length < 12) {
    return false
  }

  let sum = 0
  let shouldDouble = false

  for (let index = digits.length - 1; index >= 0; index -= 1) {
    let digit = Number(digits[index])

    if (shouldDouble) {
      digit *= 2
      if (digit > 9) {
        digit -= 9
      }
    }

    sum += digit
    shouldDouble = !shouldDouble
  }

  return sum % 10 === 0
}

function isCardExpired(expiryMonth: string, expiryYear: string) {
  const month = Number(expiryMonth)
  const year = Number(expiryYear)

  if (!month || !year) {
    return true
  }

  const now = new Date()
  const currentMonth = now.getMonth() + 1
  const currentYear = now.getFullYear()

  return year < currentYear || (year === currentYear && month < currentMonth)
}

function Checkout() {
  const navigate = useNavigate()
  const { currentUser, isAuthenticated } = useAuth()
  const { items, total, removeFromCart, updateItemFirstName, updateItemNotes, clearCart } = useCart()
  const [pan, setPan] = useState('')
  const [expiryMonth, setExpiryMonth] = useState('')
  const [expiryYear, setExpiryYear] = useState('')
  const [cvv, setCvv] = useState('')
  const [pickupTime, setPickupTime] = useState(getDefaultPickupTime)
  const [tip, setTip] = useState('0')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [submitError, setSubmitError] = useState<string | null>(null)

  const tipAmount = Number(tip || 0)
  const tax = Number((total * 0.15).toFixed(2))
  const grandTotal = total + tax + tipAmount

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()

    // TODO try validate this before they get to the form
    if (!isAuthenticated || !currentUser) {
      setSubmitError('Guests cannot order, please login!')
      return
    }

    if (items.length === 0) {
      setSubmitError('Item list is empty')
      return
    }

    if (!passesLuhn(pan)) {
      setSubmitError('Enter a valid credit card number')
      return
    }

    if (isCardExpired(expiryMonth, expiryYear)) {
      setSubmitError('The card expiry date is in the past.')
      return
    }

    if (!/^\d{3}$/.test(cvv)) {
      setSubmitError('the cvv should be 3 numbers long')
      return
    }

    // TODO anymore checks??

    setIsSubmitting(true)
    setSubmitError(null)

    try {
      const now = new Date()
      const selectedPickupTime = new Date(pickupTime)

      // TODO fix the location stuff
      const createdOrder = await createOrder({
        userid: currentUser.id,
        ordertime: now.toISOString(),
        pickuptime: selectedPickupTime.toISOString(),
        area: 'Theater 1',
        location: 'Table 1',
        tax,
        tip: tipAmount,
        pan,
        expiryMonth: Number(expiryMonth),
        expiryYear: Number(expiryYear),
        status: 'submitted',
      })

      const orderItems = items.flatMap((item) =>
        Array.from({ length: item.quantity }, () => ({
          itemid: item.id,
          price: item.price,
          notes: item.notes,
          firstName: item.firstName || currentUser.first,
        })),
      )

      await createOrderItems(createdOrder.id, orderItems)
      clearCart()
      navigate(`/orders/${createdOrder.id}`)
    } catch (error) {
      setSubmitError(error instanceof Error ? error.message : 'There was an issue submitting the order');
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <section className="page-shell">
      <h1>Your Food Basket</h1>
      {items.length === 0 ? (
        <p className="cart-empty">Empty cart pls add something from the menu at the home page.</p>
      ) : (
        <>
          <ul className="cart-list">
            {items.map((item) => (
              <li key={item.id}>
                <div className="cart-item-meta">
                  <strong>{item.name}</strong>
                  <span>Quantity: {item.quantity}</span>
                  <span>${(item.price * item.quantity).toFixed(2)}</span>
                  <label className="checkout-field checkout-notes-field">
                    <span>For</span>
                    <input
                      type="text"
                      value={item.firstName}
                      onChange={(event) => updateItemFirstName(item.id, event.target.value)}
                      placeholder="Guest first name"
                    />
                  </label>
                  <label className="checkout-field checkout-notes-field">
                    <span>Notes</span>
                    <textarea
                      value={item.notes}
                      onChange={(event) => updateItemNotes(item.id, event.target.value)}
                      placeholder="Defintiely no pickles!..."
                      rows={2}
                    />
                  </label>
                </div>
                <div className="cart-actions">
                  <span>${item.price.toFixed(2)} each</span>
                  <button
                    type="button"
                    className="ghost-button"
                    onClick={() => removeFromCart(item.id)}
                  >
                    Remove
                  </button>
                </div>
              </li>
            ))}
          </ul>
          <div className="cart-summary">
            <span>Subtotal</span>
            <span>${total.toFixed(2)}</span>
          </div>
          <form className="checkout-form" onSubmit={handleSubmit}>
            <h2>Payment</h2>
            <label className="checkout-field">
              <span>Tip</span>
              <input
                type="number"
                min="0"
                step="0.01"
                value={tip}
                onChange={(event) => setTip(event.target.value)}
                required
              />
            </label>
            <label className="checkout-field">
              <span>Pickup Time</span>
              <input
                type="datetime-local"
                value={pickupTime}
                onChange={(event) => setPickupTime(event.target.value)}
                required
              />
            </label>
            <label className="checkout-field">
              <span>PAN</span>
              <input
                type="text"
                inputMode="numeric"
                value={pan}
                onChange={(event) => setPan(event.target.value)}
                required
              />
            </label>
            <div className="checkout-row">
              <label className="checkout-field">
                <span>Expiry Month</span>
                <input
                  type="number"
                  min="1"
                  max="12"
                  value={expiryMonth}
                  onChange={(event) => setExpiryMonth(event.target.value)}
                  required
                />
              </label>
              <label className="checkout-field">
                <span>Expiry Year</span>
                <input
                  type="number"
                  min="2026"
                  value={expiryYear}
                  onChange={(event) => setExpiryYear(event.target.value)}
                  required
                />
              </label>
              <label className="checkout-field">
                <span>CVV</span>
                <input
                  type="password"
                  inputMode="numeric"
                  value={cvv}
                  onChange={(event) => setCvv(event.target.value)}
                  required
                />
              </label>
            </div>
            <div className="checkout-totals">
              <span>Tax: ${tax.toFixed(2)}</span>
              <span>Tip: ${tipAmount.toFixed(2)}</span>
              <strong>Total: ${grandTotal.toFixed(2)}</strong>
            </div>
            {submitError && <p className="checkout-error">{submitError}</p>}
            <div className="checkout-buttons">
              <button type="button" className="ghost-button" onClick={clearCart}>
                Clear cart
              </button>
              <button type="submit" className="primary-button" disabled={isSubmitting}>
                {isSubmitting ? 'Submitting...' : 'Submit order'}
              </button>
            </div>
          </form>
        </>
      )}
    </section>
  )
}

export default Checkout