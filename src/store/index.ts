import { configureStore } from '@reduxjs/toolkit'
import userReducer from './slices/userSlice'
import orderReducer from './slices/orderSlice'
import uiReducer from './slices/uiSlice'

// Redux persistence middleware
const persistenceMiddleware = (store: any) => (next: any) => (action: any) => {
  const result = next(action)
  
  // cart persistence removed
  
  return result
}

export const store = configureStore({
  reducer: {
    user: userReducer,
    order: orderReducer,
    ui: uiReducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware().concat(persistenceMiddleware),
})

export type RootState = ReturnType<typeof store.getState>
export type AppDispatch = typeof store.dispatch