import React, { useMemo, useState } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import axios from 'axios'
import PageMeta from '../components/PageMeta'
import '../styles/Auth.css'

export default function ForgotPassword() {
  const [searchParams] = useSearchParams()
  const roleHint = searchParams.get('role') || 'patient'

  const initialAccountType = useMemo(() => {
    if (roleHint === 'dentist') return 'dentist'
    return 'user'
  }, [roleHint])

  const [email, setEmail] = useState('')
  const [accountType, setAccountType] = useState(initialAccountType)
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState('')
  const [error, setError] = useState('')

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setMessage('')
    setLoading(true)
    try {
      await axios.post('/api/auth/forgot-password', { email, accountType })
      setMessage('If an account exists for that email, we sent reset instructions.')
    } catch (err) {
      setError(err.response?.data?.message || 'Something went wrong.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="auth-container">
      <PageMeta title="Forgot password" description="Reset your DentalClinic account password." />
      <div className="auth-box">
        <h1>Forgot password</h1>
        <p className="auth-subtitle">We will email a reset link if we find your account.</p>

        {error ? <div className="alert alert-error">{error}</div> : null}
        {message ? <div className="alert alert-success">{message}</div> : null}

        <form onSubmit={handleSubmit} className="auth-form">
          <div className="form-group">
            <label htmlFor="acct">Account type</label>
            <select
              id="acct"
              value={accountType}
              onChange={(e) => setAccountType(e.target.value)}
            >
              <option value="user">Patient or reception</option>
              <option value="dentist">Dentist</option>
            </select>
          </div>
          <div className="form-group">
            <label htmlFor="email">Email</label>
            <input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              autoComplete="email"
            />
          </div>
          <button type="submit" className="btn btn-primary btn-full" disabled={loading}>
            {loading ? 'Sending…' : 'Send reset link'}
          </button>
        </form>

        <p className="auth-footer">
          <Link to="/login">Back to login</Link>
        </p>
      </div>
    </div>
  )
}
