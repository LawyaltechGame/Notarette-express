import { createSlice, PayloadAction } from '@reduxjs/toolkit'

export interface CartItem {
  id: string
  name: string
  priceCents: number
  quantity: number
  currency: string
  addOns: {
    extraPages?: number
    courier?: boolean
    rushService?: boolean
  }
}

interface CartState {
  items: CartItem[]
  isOpen: boolean
  couponCode: string | null
  discountCents: number
}

const initialState: CartState = {
  items: [],
  isOpen: false,
  couponCode: null,
  discountCents: 0,
}

const cartSlice = createSlice({
  name: 'cart',
  initialState,
  reducers: {
    addItem: (state, action: PayloadAction<CartItem>) => {
      const existingItem = state.items.find(item => 
        item.id === action.payload.id && 
        JSON.stringify(item.addOns) === JSON.stringify(action.payload.addOns)
      )
      
      if (existingItem) {
        existingItem.quantity += action.payload.quantity
      } else {
        state.items.push(action.payload)
      }
    },
    removeItem: (state, action: PayloadAction<string>) => {
      state.items = state.items.filter(item => item.id !== action.payload)
    },
    updateQuantity: (state, action: PayloadAction<{ id: string; quantity: number }>) => {
      const item = state.items.find(item => item.id === action.payload.id)
      if (item) {
        item.quantity = action.payload.quantity
      }
    },
    clearCart: (state) => {
      state.items = []
      state.couponCode = null
      state.discountCents = 0
    },
    toggleCart: (state) => {
      state.isOpen = !state.isOpen
    },
    closeCart: (state) => {
      state.isOpen = false
    },
    applyCoupon: (state, action: PayloadAction<{ code: string; discountCents: number }>) => {
      state.couponCode = action.payload.code
      state.discountCents = action.payload.discountCents
    },
    // Action to restore cart from checkout data
    restoreCart: (state, action: PayloadAction<CartItem[]>) => {
      state.items = action.payload
    },
    // Action to restore cart from localStorage on app initialization
    restoreFromStorage: (state, action: PayloadAction<CartState>) => {
      state.items = action.payload.items || []
      state.couponCode = action.payload.couponCode || null
      state.discountCents = action.payload.discountCents || 0
      // Don't restore isOpen state - always start with closed cart
    },
  },
})

export const { addItem, removeItem, updateQuantity, clearCart, toggleCart, closeCart, applyCoupon, restoreCart, restoreFromStorage } = cartSlice.actions
export default cartSlice.reducer

export const selectCartItems = (state: { cart: CartState }) => state.cart.items
export const selectCartTotal = (state: { cart: CartState }) => {
  const subtotal = state.cart.items.reduce((total, item) => {
    let itemTotal = item.priceCents * item.quantity
    if (item.addOns.extraPages) {
      itemTotal += item.addOns.extraPages * 500 // $5 per extra page
    }
    if (item.addOns.courier) {
      itemTotal += 1500 // $15 for courier
    }
    if (item.addOns.rushService) {
      itemTotal += 2000 // $20 for rush service
    }
    return total + itemTotal
  }, 0)
  return Math.max(0, subtotal - state.cart.discountCents)
}
export const selectCartItemCount = (state: { cart: CartState }) => 
  state.cart.items.reduce((total, item) => total + item.quantity, 0)
export const selectCartHasItems = (state: { cart: CartState }) => state.cart.items.length > 0
export const selectCartIsOpen = (state: { cart: CartState }) => state.cart.isOpen