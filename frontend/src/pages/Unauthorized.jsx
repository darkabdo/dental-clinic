import React from 'react'
import { Link, useLocation } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import PageMeta from '../components/PageMeta'
import { dashboardPathForRole } from '../auth/rbac'

export default function Unauthorized() {
  const { auth, isAuthenticated } = useAuth()
  const location = useLocation()
  const tried = location.state?.from || 'that page'
  const home = isAuthenticated ? dashboardPathForRole(auth.role) : '/login'

  return (
    <div className="container text-center" style={{ padding: '3rem 1rem' }}>
      <PageMeta title="Unauthorized" description="You do not have access to this area." />
      <h1 style={{ fontSize: '1.5rem', marginBottom: '0.5rem' }}>Access denied</h1>
      <p className="text-secondary" style={{ marginBottom: '0.35rem' }}>
        Your role does not allow opening <strong>{tried}</strong>.
      </p>
      {isAuthenticated ? (
        <p className="text-secondary" style={{ marginBottom: '1.25rem' }}>
          Signed in as <strong>{auth.user?.email}</strong> ({auth.role}).
        </p>
      ) : null}
      <Link to={home} className="btn btn-primary">
        {isAuthenticated ? 'Go to your dashboard' : 'Sign in'}
      </Link>
      <p style={{ marginTop: '1rem' }}>
        <Link to="/">Home</Link>
      </p>
    </div>
  )
}
