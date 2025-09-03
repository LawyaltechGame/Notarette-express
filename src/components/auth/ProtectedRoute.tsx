import React from 'react'
import { Navigate, useLocation } from 'react-router-dom'
import { useAppSelector } from '../../hooks/useAppSelector'
import { useAuth } from '../../contexts/AuthContext'
import { Loader2 } from 'lucide-react'

interface ProtectedRouteProps {
  children: React.ReactNode
  requireAuth?: boolean
  redirectTo?: string
  redirectIfAuthenticated?: boolean
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ 
  children, 
  requireAuth = true, 
  redirectTo = '/services',
  redirectIfAuthenticated = true
}) => {
  const { loading } = useAuth()
  const isAuthenticated = useAppSelector(state => state.user.isAuthenticated)
  const location = useLocation()

  // Show loading spinner while checking authentication
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900">
        <div className="text-center">
          <Loader2 className="w-12 h-12 text-teal-600 animate-spin mx-auto mb-4" />
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
            Loading...
          </h2>
        </div>
      </div>
    )
  }

  // If route requires authentication and user is not authenticated
  if (requireAuth && !isAuthenticated) {
    // Redirect to login, but save the intended destination
    return <Navigate to="/login" state={{ from: location }} replace />
  }

  // If route is intended for guests only (e.g., login/register) and user is authenticated
  if (!requireAuth && isAuthenticated && redirectIfAuthenticated) {
    return <Navigate to={redirectTo} replace />
  }

  // User is authenticated and can access the route
  return <>{children}</>
}

export default ProtectedRoute
