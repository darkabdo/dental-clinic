import React, { useMemo, useState } from 'react'
import { Link, useNavigate, useSearchParams } from 'react-router-dom'
import axios from 'axios'
import PageMeta from '../components/PageMeta'
import '../styles/Auth.css'

export default function ResetPassword() {
  const [searchParams] = useSearchParams()
  const navigate = useNavigate()
  const token = searchParams.get('token') || ''
  const type = searchParams.get('type') || 'user'

  const accountType = useMemo(() => (type === 'dentist' ? 'dentist' : 'user'), [type])

  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [message, setMessage] = useState('')

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setMessage('')
    if (password.length < 8) {
      setError('Password must be at least 8 characters.')
      return
    }
    setLoading(true)
    try {
      await axios.post('/api/auth/reset-password', {
        token,
        password,
        accountType,
      })
      setMessage('Password updated. You can sign in now.')
      setTimeout(() => navigate('/login'), 1600)
    } catch (err) {
      setError(err.response?.data?.message || 'Reset failed. The link may have expired.')
    } finally {
      setLoading(false)
    }
  }

  if (!token) {
    return (
      <div className="auth-container">
        <PageMeta title="Reset password" description="Invalid or missing reset link." />
        <div className="auth-box">
          <h1>Invalid link</h1>
          <p className="auth-subtitle">This reset link is missing a token.</p>
          <p className="auth-footer">
            <Link to="/forgot-password">Request a new link</Link>
          </p>
        </div>
      </div>
    )
  }

  return (
    <div className="auth-container">
      <PageMeta title="Reset password" description="Choose a new password for your account." />
      <div className="auth-box">
        <h1>New password</h1>
        <p className="auth-subtitle">Use at least 8 characters.</p>

        {error ? <div className="alert alert-error">{error}</div> : null}
        {message ? <div className="alert alert-success">{message}</div> : null}

        <form onSubmit={handleSubmit} className="auth-form">
          <div className="form-group">
            <label htmlFor="password">New password</label>
            <input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              minLength={8}
              autoComplete="new-password"
            />
          </div>
          <button type="submit" className="btn btn-primary btn-full" disabled={loading}>
            {loading ? 'Saving…' : 'Update password'}
          </button>
        </form>

        <p className="auth-footer">
          <Link to="/login">Back to login</Link>
        </p>
      </div>
    </div>
  )
}
