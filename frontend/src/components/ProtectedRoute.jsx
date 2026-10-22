import React from 'react'
import { Navigate, useLocation } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { dashboardPathForRole } from '../auth/rbac'

/**
 * Requires authentication and a role in `allowedRoles`.
 * Wrong role → /unauthorized (with return path). Not logged in → /login.
 */
export default function ProtectedRoute({ children, allowedRoles = [] }) {
  const { isAuthenticated, auth } = useAuth()
  const location = useLocation()

  if (!isAuthenticated) {
    return <Navigate to="/login" state={{ from: location.pathname }} replace />
  }

  const role = auth.role
  if (!allowedRoles.length || !allowedRoles.includes(role)) {
    return (
      <Navigate
        to="/unauthorized"
        state={{ from: location.pathname, role }}
        replace
      />
    )
  }

  return children
}
