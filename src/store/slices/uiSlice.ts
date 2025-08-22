import { createSlice, PayloadAction } from '@reduxjs/toolkit'

export interface Toast {
  id: string
  type: 'success' | 'error' | 'info' | 'warning'
  title: string
  message?: string
}

interface UIState {
  theme: 'light' | 'dark'
  toasts: Toast[]
  isModalOpen: boolean
  modalContent: React.ReactNode | null
}

const initialState: UIState = {
  theme: 'light',
  toasts: [],
  isModalOpen: false,
  modalContent: null,
}

const uiSlice = createSlice({
  name: 'ui',
  initialState,
  reducers: {
    toggleTheme: (state) => {
      state.theme = state.theme === 'light' ? 'dark' : 'light'
    },
    addToast: (state, action: PayloadAction<Omit<Toast, 'id'>>) => {
      const toast: Toast = {
        id: Date.now().toString(),
        ...action.payload,
      }
      state.toasts.push(toast)
    },
    removeToast: (state, action: PayloadAction<string>) => {
      state.toasts = state.toasts.filter(toast => toast.id !== action.payload)
    },
    openModal: (state, action: PayloadAction<React.ReactNode>) => {
      state.isModalOpen = true
      state.modalContent = action.payload
    },
    closeModal: (state) => {
      state.isModalOpen = false
      state.modalContent = null
    },
  },
})

export const { toggleTheme, addToast, removeToast, openModal, closeModal } = uiSlice.actions
export default uiSlice.reducer