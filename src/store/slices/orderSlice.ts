import { createSlice, PayloadAction } from '@reduxjs/toolkit'

export type OrderStatus = 'pending' | 'paid' | 'processing' | 'completed' | 'failed'
export type KYCStatus = 'required' | 'started' | 'verified' | 'failed'

export interface OrderItem {
  serviceId: string
  name: string
  priceCents: number
  quantity: number
  addOns: Record<string, any>
}

export interface Order {
  id: string
  userId: string
  items: OrderItem[]
  amountCents: number
  currency: string
  status: OrderStatus
  kycStatus: KYCStatus
  deliveryMethod: 'email' | 'courier'
  createdAt: string
  updatedAt: string
  kycLink?: string
  uploadedFiles?: string[]
  completedFiles?: string[]
}

interface OrderState {
  currentOrder: Order | null
  orders: Order[]
  loading: boolean
  error: string | null
}

const initialState: OrderState = {
  currentOrder: null,
  orders: [],
  loading: false,
  error: null,
}

const orderSlice = createSlice({
  name: 'order',
  initialState,
  reducers: {
    createOrderStart: (state) => {
      state.loading = true
      state.error = null
    },
    createOrderSuccess: (state, action: PayloadAction<Order>) => {
      state.currentOrder = action.payload
      state.orders.unshift(action.payload)
      state.loading = false
    },
    createOrderFailure: (state, action: PayloadAction<string>) => {
      state.loading = false
      state.error = action.payload
    },
    updateOrderStatus: (state, action: PayloadAction<{ orderId: string; status: OrderStatus; kycStatus?: KYCStatus }>) => {
      const order = state.orders.find(o => o.id === action.payload.orderId)
      if (order) {
        order.status = action.payload.status
        if (action.payload.kycStatus) {
          order.kycStatus = action.payload.kycStatus
        }
        order.updatedAt = new Date().toISOString()
      }
      if (state.currentOrder?.id === action.payload.orderId) {
        state.currentOrder.status = action.payload.status
        if (action.payload.kycStatus) {
          state.currentOrder.kycStatus = action.payload.kycStatus
        }
        state.currentOrder.updatedAt = new Date().toISOString()
      }
    },
    setOrders: (state, action: PayloadAction<Order[]>) => {
      state.orders = action.payload
    },
    clearCurrentOrder: (state) => {
      state.currentOrder = null
    },
  },
})

export const {
  createOrderStart,
  createOrderSuccess,
  createOrderFailure,
  updateOrderStatus,
  setOrders,
  clearCurrentOrder,
} = orderSlice.actions

export default orderSlice.reducer