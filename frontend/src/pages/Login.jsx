import React, { useState } from 'react'
import { useNavigate, Link, useLocation } from 'react-router-dom'
import axios from 'axios'
import { useAuth } from '../context/AuthContext'
import { safePostLoginRedirect } from '../auth/rbac'
import PageMeta from '../components/PageMeta'
import '../styles/Auth.css'

/** Email/password only — backend resolves role (patient, doctor, receptionist, admin) and returns JWT. */
const Login = () => {
  const navigate = useNavigate()
  const location = useLocation()
  const { login } = useAuth()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [formData, setFormData] = useState({
    email: '',
    password: '',
  })

  const handleChange = (e) => {
    const { name, value } = e.target
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setLoading(true)

    try {
      const response = await axios.post('/api/auth/login', formData)
      const resolvedRole = response.data.role

      const userPayload =
        resolvedRole === 'doctor' ? response.data.dentist : response.data.user

      if (!userPayload) {
        setError('Login response was incomplete. Try again.')
        setLoading(false)
        return
      }

      login(response.data.token, userPayload, resolvedRole)
      setLoading(false)

      const target = safePostLoginRedirect(resolvedRole, location.state?.from)
      navigate(target, { replace: true })
    } catch (err) {
      setError(err.response?.data?.message || 'Login failed')
      setLoading(false)
    }
  }

  return (
    <div className="auth-container">
      <PageMeta title="Sign in" description="Sign in to DentalClinic." />
      <div className="auth-box">
        <h1>Sign in</h1>
        <p className="auth-subtitle">
          Enter your email and password. You will be routed to the right workspace based on your account (patient,
          doctor, reception, or admin).
        </p>

        {error && <div className="alert alert-error">{error}</div>}

        {import.meta.env.DEV && (
          <p className="auth-inline-hint text-secondary" style={{ marginBottom: '0.75rem' }}>
            Dev default admin (MongoDB + backend running): <strong>admin@example.com</strong> /{' '}
            <strong>admin12345</strong>
          </p>
        )}

        <form onSubmit={handleSubmit} className="auth-form">
          <div className="form-group">
            <label htmlFor="email">Email</label>
            <input
              type="email"
              id="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              required
              placeholder="john@example.com"
              autoComplete="username"
            />
          </div>

          <div className="form-group">
            <label htmlFor="password">Password</label>
            <input
              type="password"
              id="password"
              name="password"
              value={formData.password}
              onChange={handleChange}
              required
              placeholder="••••••••"
              autoComplete="current-password"
            />
            <p className="auth-inline-hint">
              <Link to="/forgot-password">Forgot password?</Link> — choose account type on the next screen if unsure.
            </p>
          </div>

          <button type="submit" className="btn btn-primary btn-full" disabled={loading}>
            {loading ? 'Signing in…' : 'Sign in'}
          </button>
        </form>

        <p className="auth-footer">
          New patient? <Link to="/register">Create patient account</Link>
        </p>
        <p className="auth-footer" style={{ fontSize: '0.85rem' }}>
          Staff and doctors: your account is issued by an administrator.
        </p>
      </div>
    </div>
  )
}

export default Login
