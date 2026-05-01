import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import './AuthPage.css'

function LoginPage() {
  const navigate = useNavigate()
  const { login } = useAuth()
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [message, setMessage] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setMessage(null)
    setError(null)

    try {
      await login(username, password)
      //TODO this is finishing really quick and just redirects. Add a clearer popup so its clear
      setMessage('Login successful.')
      navigate('/')
    } catch (submitError) {
      setError(submitError instanceof Error ? submitError.message : 'Login failed')
    }
  }

  return (
    <section className="auth-page">
      <h1>Login</h1>
      <form className="auth-form" onSubmit={handleSubmit}>
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
          <Link to="/register" className="auth-link">Need an account?</Link>
          <button type="submit" className="primary-button">Login</button>
        </div>
      </form>
    </section>
  )
}

export default LoginPage