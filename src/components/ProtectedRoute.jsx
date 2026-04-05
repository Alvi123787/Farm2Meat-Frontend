import React from 'react'
import { Navigate, useLocation } from 'react-router-dom'
import { useAuth } from '../contexts/authContextCore'

export default function ProtectedRoute({ children, role = 'admin' }) {
  const { token, role: userRole, loading } = useAuth()
  const location = useLocation()

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
      </div>
    )
  }

  const ok = Boolean(token) && userRole === role

  if (!ok) {
    return <Navigate to="/login" replace state={{ from: location.pathname }} />
  }

  return children
}
