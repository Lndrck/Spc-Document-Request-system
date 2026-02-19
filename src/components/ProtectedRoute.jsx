import React, { useState, useEffect } from 'react'
import { Navigate, useLocation } from 'react-router-dom'
import { isAuthenticated, hasRole, getCurrentUser, getUserType } from '../services/authService'

const ProtectedRoute = ({
  children,
  requiredRole = null,
  redirectTo = '/login',
  adminRedirect = '/admin',
  staffRedirect = '/staff'
}) => {
  const [authState, setAuthState] = useState({
    isLoading: true,
    isAuthenticated: false,
    user: null,
    userType: null
  })

  const location = useLocation()

  useEffect(() => {
    const checkAuth = () => {
      const authenticated = isAuthenticated()
      const user = getCurrentUser()
      const userType = getUserType()

      setAuthState({
        isLoading: false,
        isAuthenticated: authenticated,
        user,
        userType
      })
    }

    checkAuth()
  }, [])

  // Show loading spinner while checking authentication
  if (authState.isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading...</p>
        </div>
      </div>
    )
  }

  // If not authenticated, redirect to login
  if (!authState.isAuthenticated) {
    return <Navigate to={redirectTo} state={{ from: location }} replace />
  }

  // If specific role is required, check if user has that role
  if (requiredRole && !hasRole(requiredRole)) {
    // Redirect based on user's actual role
    if (authState.userType === 'admin') {
      return <Navigate to={adminRedirect} replace />
    } else if (authState.userType === 'staff') {
      return <Navigate to={staffRedirect} replace />
    } else {
      return <Navigate to="/unauthorized" replace />
    }
  }

  // If user is authenticated and has required role (or no role required), render children
  return children
}

export default ProtectedRoute