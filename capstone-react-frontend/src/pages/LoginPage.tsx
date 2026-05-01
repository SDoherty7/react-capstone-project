import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import './AuthPage.css'

interface UserForLogin {
  username: string
  password: string
}

function LoginPage() {
  const navigate = useNavigate()
  const { login } = useAuth()
  const [message, setMessage] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)
  const { register, handleSubmit } = useForm<UserForLogin>()

  async function onSubmit(data: UserForLogin) {
    setMessage(null)
    setError(null)

    try {
      await login(data.username, data.password)
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
      <form className="auth-form" onSubmit={handleSubmit(onSubmit)}>
        <label className="auth-field">
          <span>Username</span>
          <input {...register('username', { required: true })} />
        </label>
        <label className="auth-field">
          <span>Password</span>
          <input
            type="password"
            {...register('password', { required: true })}
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
