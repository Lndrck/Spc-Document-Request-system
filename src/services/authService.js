// Authentication service for handling login, logout, and token management
// Use the full URL from environment variables, not relative paths
const API_BASE_URL = import.meta.env.VITE_API_URL 
  ? `${import.meta.env.VITE_API_URL}/auth` 
  : '/api/auth'

// Simple JWT-like token verification (for basic validation)
const verifyToken = (token) => {
  try {
    // Basic check if token exists and has correct format
    if (!token || typeof token !== 'string') return null

    const parts = token.split('.')
    if (parts.length !== 3) return null

    // Try to decode payload (basic validation)
    const payload = JSON.parse(atob(parts[1]))
    return payload
  } catch (error) {
    console.error('Token verification error:', error)
    return null
  }
}

// Check if token is expired
const isTokenExpired = (token) => {
  try {
    const payload = verifyToken(token)
    if (!payload) return true

    // Check expiration (with some tolerance for clock skew)
    const currentTime = Math.floor(Date.now() / 1000)
    return (payload.exp && payload.exp < currentTime)
  } catch (error) {
    console.error('Token expiration check error:', error)
    return true
  }
}

// Get stored token
const getStoredToken = () => {
  return localStorage.getItem('adminToken') || localStorage.getItem('staffToken')
}

// Get user type from storage
const getUserType = () => {
  return localStorage.getItem('userType')
}

// Store authentication data
const storeAuthData = (token, userType, user) => {
  const tokenKey = userType === 'admin' ? 'adminToken' : 'staffToken'
  localStorage.setItem(tokenKey, token)
  localStorage.setItem('userType', userType)
  localStorage.setItem('user', JSON.stringify(user))
}

// Clear authentication data
const clearAuthData = () => {
  localStorage.removeItem('adminToken')
  localStorage.removeItem('staffToken')
  localStorage.removeItem('userType')
  localStorage.removeItem('user')
}

// Get current user from storage
const getCurrentUser = () => {
  const userStr = localStorage.getItem('user')
  return userStr ? JSON.parse(userStr) : null
}

// Check if user is authenticated
const isAuthenticated = () => {
  const token = getStoredToken()
  const userType = getUserType()

  if (!token || !userType) return false

  return !isTokenExpired(token)
}

// Check if user has specific role
const hasRole = (role) => {
  const user = getCurrentUser()
  return user && user.role === role
}

// Login function
const login = async (email, password) => {
  try {
    console.log('🔐 Attempting login for:', email)

    const response = await fetch(`${API_BASE_URL}/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ email, password }),
    })

    console.log('📡 Login response status:', response.status)
    const data = await response.json()
    console.log('📋 Login response data:', data)

    if (response.ok && data.success) {
      console.log('✅ Login successful, storing auth data')
      // Store authentication data
      storeAuthData(data.token, data.user.role, data.user)

      return {
        success: true,
        user: data.user,
        message: data.message
      }
    } else {
      console.error('❌ Login failed:', data.message)
      return {
        success: false,
        message: data.message || 'Login failed'
      }
    }
  } catch (error) {
    console.error('❌ Login network error:', error)
    return {
      success: false,
      message: 'Network error. Please check if the server is running'
    }
  }
}

// Logout function
const logout = async () => {
  try {
    const token = getStoredToken()
    if (token) {
      // Call logout endpoint
      await fetch(`${API_BASE_URL}/logout`, {
        method: 'POST',
        credentials: 'include',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      })
    }
  } catch (error) {
    console.error('Logout error:', error)
  } finally {
    // Clear local storage regardless of API call result
    clearAuthData()
  }
}

// Get user profile
const getProfile = async () => {
  try {
    const token = getStoredToken()
    if (!token) {
      return {
        success: false,
        message: 'No authentication token found'
      }
    }

    const response = await fetch(`${API_BASE_URL}/profile`, {
      method: 'GET',
      credentials: 'include',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
    })

    const data = await response.json()

    if (response.ok && data.success) {
      return {
        success: true,
        user: data.user
      }
    } else {
      return {
        success: false,
        message: data.message || 'Failed to get profile'
      }
    }
  } catch (error) {
    console.error('Get profile error:', error)
    return {
      success: false,
      message: 'Network error. Please try again.'
    }
  }
}

// Change password
const changePassword = async (currentPassword, newPassword) => {
  try {
    const token = getStoredToken()
    if (!token) {
      return {
        success: false,
        message: 'No authentication token found'
      }
    }

    const response = await fetch(`${API_BASE_URL}/change-password`, {
      method: 'POST',
      credentials: 'include',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ currentPassword, newPassword }),
    })

    const data = await response.json()

    if (response.ok && data.success) {
      return {
        success: true,
        message: data.message
      }
    } else {
      return {
        success: false,
        message: data.message || 'Failed to change password'
      }
    }
  } catch (error) {
    console.error('Change password error:', error)
    return {
      success: false,
      message: 'Network error. Please try again.'
    }
  }
}

// Forgot password
const forgotPassword = async (email) => {
  try {
    console.log('🔐 Attempting forgot password for:', email)

    const response = await fetch(`${API_BASE_URL}/forgot-password`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ email }),
    })

    console.log('📡 Forgot password response status:', response.status)
    const data = await response.json()
    console.log('📋 Forgot password response data:', data)

    if (response.ok && data.success) {
      console.log('✅ Forgot password request successful')
      return {
        success: true,
        message: data.message
      }
    } else {
      console.error('❌ Forgot password failed:', data.message)
      return {
        success: false,
        message: data.message || 'Failed to process request'
      }
    }
  } catch (error) {
    console.error('❌ Forgot password network error:', error)
    return {
      success: false,
      message: 'Network error. Please check if the server is running'
    }
  }
}

// Reset password
const resetPassword = async (token, newPassword) => {
  try {
    console.log('🔐 Attempting password reset')

    const response = await fetch(`${API_BASE_URL}/reset-password`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ token, newPassword }),
    })

    console.log('📡 Reset password response status:', response.status)
    const data = await response.json()
    console.log('📋 Reset password response data:', data)

    if (response.ok && data.success) {
      console.log('✅ Password reset successful')
      return {
        success: true,
        message: data.message
      }
    } else {
      console.error('❌ Password reset failed:', data.message)
      return {
        success: false,
        message: data.message || 'Failed to reset password'
      }
    }
  } catch (error) {
    console.error('❌ Reset password network error:', error)
    return {
      success: false,
      message: 'Network error. Please check if the server is running'
    }
  }
}

// Initialize authentication state
const initializeAuth = () => {
  const token = getStoredToken()
  const userType = getUserType()
  const user = getCurrentUser()

  if (token && userType && user && !isTokenExpired(token)) {
    return {
      isAuthenticated: true,
      userType,
      user
    }
  } else {
    // Clear invalid tokens
    clearAuthData()
    return {
      isAuthenticated: false,
      userType: null,
      user: null
    }
  }
}

export {
  login,
  logout,
  getProfile,
  changePassword,
  forgotPassword,
  resetPassword,
  isAuthenticated,
  hasRole,
  getCurrentUser,
  getUserType,
  initializeAuth,
  verifyToken,
  isTokenExpired
}
