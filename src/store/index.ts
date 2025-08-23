import { configureStore } from '@reduxjs/toolkit'
import cartReducer from './slices/cartSlice'
import userReducer from './slices/userSlice'
import orderReducer from './slices/orderSlice'
import uiReducer from './slices/uiSlice'

// Redux persistence middleware
const persistenceMiddleware = (store: any) => (next: any) => (action: any) => {
  const result = next(action)
  
  // Only persist cart state for certain actions
  if (action.type?.startsWith('cart/')) {
    const cartState = store.getState().cart
    try {
      localStorage.setItem('notarette_cart', JSON.stringify(cartState))
    } catch (error) {
      console.error('Error persisting cart to localStorage:', error)
    }
  }
  
  return result
}

export const store = configureStore({
  reducer: {
    cart: cartReducer,
    user: userReducer,
    order: orderReducer,
    ui: uiReducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware().concat(persistenceMiddleware),
})

// Load cart state from localStorage on store initialization
const savedCart = localStorage.getItem('notarette_cart')
if (savedCart) {
  try {
    const parsedCart = JSON.parse(savedCart)
    console.log('Loading saved cart from localStorage:', parsedCart)
    store.dispatch({ type: 'cart/restoreFromStorage', payload: parsedCart })
  } catch (error) {
    console.error('Error loading cart from localStorage:', error)
  }
} else {
  console.log('No saved cart found in localStorage')
}

// Log initial store state
console.log('Initial store state:', store.getState())

export type RootState = ReturnType<typeof store.getState>
export type AppDispatch = typeof store.dispatch