import React, { createContext, useContext, useEffect, useState } from 'react'
import { User as FirebaseUser } from 'firebase/auth'
import { useAppDispatch } from '../hooks/useAppDispatch'
import { useAppSelector } from '../hooks/useAppSelector'
import { loginSuccess, logout } from '../store/slices/userSlice'
import { onAuthStateChange, getCurrentUserProfile } from '../services/firebaseAuth'

interface AuthContextType {
  loading: boolean
  isAuthenticated: boolean
}

const AuthContext = createContext<AuthContextType>({
  loading: true,
  isAuthenticated: false
})

export const useAuth = () => useContext(AuthContext)

interface AuthProviderProps {
  children: React.ReactNode
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const dispatch = useAppDispatch()
  const [loading, setLoading] = useState(true)
  
  // Get authentication state from Redux store
  const isAuthenticated = useAppSelector(state => state.user.isAuthenticated)

  useEffect(() => {
    const unsubscribe = onAuthStateChange(async (firebaseUser: FirebaseUser | null) => {
      if (firebaseUser) {
        try {
          // Get user profile from Firestore
          const userProfile = await getCurrentUserProfile(firebaseUser.uid)
          
          if (userProfile) {
            dispatch(loginSuccess({ user: userProfile }))
          } else {
            dispatch(logout())
          }
        } catch (error) {
          console.error('Error getting user profile:', error)
          dispatch(logout())
        }
      } else {
        dispatch(logout())
      }
      setLoading(false)
    })

    return () => unsubscribe()
  }, [dispatch])

  const value = {
    loading,
    isAuthenticated
  }

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  )
}
