import { useState } from 'react'
import { Link } from 'react-router-dom'
import { registerUser } from '../apis/authService'
import './AuthPage.css'

function RegisterPage() {
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [first, setFirst] = useState('')
  const [last, setLast] = useState('')
  const [message, setMessage] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setMessage(null)
    setError(null)
    setIsSubmitting(true)

    try {
      await registerUser({
        username,
        password,
        first,
        last,
        roles: 'USER',
      })
      setMessage('Registration successful! Pleae return to the login page and login')
      setUsername('')
      setPassword('')
      setFirst('')
      setLast('')
    } catch (submitError) {
      setError(submitError instanceof Error ? submitError.message : 'Registration failed.')
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <section className="auth-page">
      <h1>Register</h1>
      <form className="auth-form" onSubmit={handleSubmit}>
        <div className="auth-grid">
          <label className="auth-field">
            <span>First Name</span>
            <input value={first} onChange={(event) => setFirst(event.target.value)} required />
          </label>
          <label className="auth-field">
            <span>Last Name</span>
            <input value={last} onChange={(event) => setLast(event.target.value)} required />
          </label>
        </div>
        <label className="auth-field">
          <span>Username</span>
          <input value={username} onChange={(event) => setUsername(event.target.value)} required />
        </label>
        <label className="auth-field">
          <span>Password</span>
          <input
            type="password"
            value={password}
            onChange={(event) => setPassword(event.target.value)}
            required
          />
        </label>
        {message && <p className="auth-message">{message}</p>}
        {error && <p className="auth-error">{error}</p>}
        <div className="auth-actions">
          <Link to="/login" className="auth-link">Already have an account? Login here</Link>
          <button type="submit" className="primary-button" disabled={isSubmitting}>
            {isSubmitting ? 'Registering...' : 'Create account'}
          </button>
        </div>
      </form>
    </section>
  )
}

export default RegisterPage