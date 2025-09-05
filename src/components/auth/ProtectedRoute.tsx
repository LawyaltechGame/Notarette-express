import React from 'react'
import { Navigate, useLocation } from 'react-router-dom'
import { useAppSelector } from '../../hooks/useAppSelector'
import { useAuth } from '../../contexts/AuthContext'
import { Loader2 } from 'lucide-react'
import { ENVObj } from '../../lib/constant'
import { appwriteAccount } from '../../lib/appwrite'

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
  const user = useAppSelector(state => state.user.user)
  const [isNotary, setIsNotary] = React.useState<boolean | null>(null)
  const location = useLocation()

  // Role-gate for notary-only paths
  const isNotaryRoute = location.pathname.startsWith('/notary')
  React.useEffect(() => {
    let cancelled = false
    const checkTeam = async () => {
      if (!isNotaryRoute || !isAuthenticated || !ENVObj.VITE_NOTARY_TEAM_ID) {
        setIsNotary(null)
        return
      }
      try {
        const memberships = await appwriteAccount.listMemberships()
        const inTeam = memberships.memberships?.some(m => m.teamId === ENVObj.VITE_NOTARY_TEAM_ID)
        if (!cancelled) setIsNotary(!!inTeam)
      } catch (e) {
        // Fallback to allowlist if no Appwrite session or API denied
        const emailList = String(ENVObj.VITE_NOTARY_EMAILS || '')
          .toLowerCase().split(',').map(s => s.trim()).filter(Boolean)
        const email = (user?.email || '').toLowerCase()
        if (!cancelled) setIsNotary(emailList.includes(email))
      }
    }
    checkTeam()
    return () => { cancelled = true }
  }, [isAuthenticated, isNotaryRoute, user?.email])

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

  if (isNotaryRoute) {
    if (!isAuthenticated) {
      return <Navigate to="/login" state={{ from: location }} replace />
    }
    if (isNotary === false) {
      return <Navigate to="/services" replace />
    }
    if (isNotary === null) {
      return (
        <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900">
          <div className="text-center">
            <Loader2 className="w-12 h-12 text-teal-600 animate-spin mx-auto mb-4" />
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">Checking access…</h2>
          </div>
        </div>
      )
    }
  }

  // User is authenticated and can access the route
  return <>{children}</>
}

export default ProtectedRoute
