import { createSlice, PayloadAction } from '@reduxjs/toolkit'

export interface AuthUser {
  uid: string
  email: string | null
  firstName: string
  lastName: string
  phone: string
  address?: string
  city?: string
  state?: string
  zipCode?: string
}

interface UserState {
  user: AuthUser | null
  isAuthenticated: boolean
  loading: boolean
  error: string | null
}

const initialState: UserState = {
  user: null,
  isAuthenticated: false,
  loading: false,
  error: null,
}

const userSlice = createSlice({
  name: 'user',
  initialState,
  reducers: {
    setLoading: (state, action: PayloadAction<boolean>) => {
      state.loading = action.payload
    },
    setError: (state, action: PayloadAction<string | null>) => {
      state.error = action.payload
    },
    loginSuccess: (state, action: PayloadAction<{ user: AuthUser; token?: string }>) => {
      state.user = action.payload.user
      state.isAuthenticated = true
      state.loading = false
      state.error = null
      try {
        if (typeof window !== 'undefined') {
          localStorage.setItem('LOCAL_USER', JSON.stringify(action.payload.user))
        }
      } catch {}
    },
    loginFailure: (state, action: PayloadAction<string>) => {
      state.user = null
      state.isAuthenticated = false
      state.loading = false
      state.error = action.payload
    },
    logout: (state) => {
      state.user = null
      state.isAuthenticated = false
      state.loading = false
      state.error = null
    },
    updateProfile: (state, action: PayloadAction<Partial<AuthUser>>) => {
      if (state.user) {
        state.user = { ...state.user, ...action.payload }
      }
    },
    clearError: (state) => {
      state.error = null
    },
  },
})

export const { 
  setLoading, 
  setError, 
  loginSuccess, 
  loginFailure, 
  logout, 
  updateProfile, 
  clearError 
} = userSlice.actions

export default userSlice.reducer