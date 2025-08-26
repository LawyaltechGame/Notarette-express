import React from 'react'
import { motion } from 'framer-motion'
import { X, Minus, Plus, Trash2, ShoppingCart } from 'lucide-react'
import { useAppSelector } from '../../hooks/useAppSelector'
import { useAppDispatch } from '../../hooks/useAppDispatch'
import { removeItem, updateQuantity, closeCart, selectCartItems, selectCartTotal, selectCartItemCount, selectCartIsOpen } from '../../store/slices/cartSlice'
import Button from '../ui/Button'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../../contexts/AuthContext'

const CartDrawer: React.FC = () => {
  const { isAuthenticated } = useAuth()
  const dispatch = useAppDispatch()
  const navigate = useNavigate()
  const isOpen = useAppSelector(selectCartIsOpen)
  const cartItems = useAppSelector(selectCartItems)
  const cartTotal = useAppSelector(selectCartTotal)
  const cartItemCount = useAppSelector(selectCartItemCount)

  // Debug logging
  console.log('CartDrawer render:', { isAuthenticated, isOpen, cartItemCount, cartItems })

  // Don't render anything if not authenticated or cart is closed
  if (!isAuthenticated || !isOpen) {
    console.log('CartDrawer not rendering:', { isAuthenticated, isOpen })
    return null
  }

  const formatPrice = (cents: number, currency: string) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: currency,
    }).format(cents / 100)
  }

  const getItemTotal = (item: any) => {
    let itemTotal = item.priceCents * item.quantity
    if (item.addOns?.extraPages) {
      itemTotal += item.addOns.extraPages * 500
    }
    if (item.addOns?.courier) {
      itemTotal += 1500
    }
    if (item.addOns?.rushService) {
      itemTotal += 2000
    }
    return itemTotal
  }

  const handleQuantityChange = (itemId: string, newQuantity: number) => {
    if (newQuantity <= 0) {
      dispatch(removeItem(itemId))
    } else {
      dispatch(updateQuantity({ id: itemId, quantity: newQuantity }))
    }
  }

  const handleRemoveItem = (itemId: string) => {
    dispatch(removeItem(itemId))
  }


  const handleProceedToCheckout = () => {
    dispatch(closeCart()) // Close the cart automatically
    navigate('/checkout')
  }

  const handleContinueShopping = () => {
    navigate('/services')
  }

  console.log('CartDrawer rendering cart content')

  return (
    <>
      {/* Backdrop */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={() => dispatch(closeCart())}
        className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50"
      />

      {/* Drawer */}
      <motion.div
        initial={{ x: '100%' }}
        animate={{ x: 0 }}
        exit={{ x: '100%' }}
        transition={{ type: 'spring', damping: 25, stiffness: 200 }}
        className="fixed right-0 top-0 h-full w-full max-w-md bg-white dark:bg-gray-900 shadow-xl z-50"
      >
        <div className="flex flex-col h-full">
          {/* Header */}
          <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-800">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
              Shopping Cart ({cartItemCount})
            </h2>
            <button
              onClick={() => dispatch(closeCart())}
              className="p-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
            >
              <X size={20} />
            </button>
          </div>

          {/* Content */}
          <div className="flex-1 overflow-y-auto p-6">
            {cartItems.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-full text-center">
                <ShoppingCart className="w-16 h-16 text-gray-300 dark:text-gray-600 mb-4" />
                <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
                  Your cart is empty
                </h3>
                <p className="text-gray-600 dark:text-gray-400 mb-6">
                  Add some services to get started
                </p>
                <Button
                  onClick={() => dispatch(closeCart())}
                  variant="primary"
                >
                  Browse Services
                </Button>
              </div>
            ) : (
              <div className="space-y-6">
                {cartItems.map((item) => (
                  <div key={`${item.id}-${JSON.stringify(item.addOns)}`} className="border-b border-gray-200 dark:border-gray-800 pb-6">
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex-1">
                        <h3 className="font-medium text-gray-900 dark:text-white">
                          {item.name}
                        </h3>
                        <p className="text-sm text-gray-600 dark:text-gray-400">
                          {formatPrice(item.priceCents, item.currency || 'INR')} each
                        </p>
                        
                        {/* Add-ons */}
                        <div className="mt-2 text-sm text-gray-600 dark:text-gray-400">
                          {item.addOns?.extraPages && (
                            <div>Extra pages: {item.addOns.extraPages} × {formatPrice(500, item.currency || 'INR')}</div>
                          )}
                          {item.addOns?.courier && (
                            <div>Courier delivery: {formatPrice(1500, item.currency || 'INR')}</div>
                          )}
                          {item.addOns?.rushService && (
                            <div>Rush service: {formatPrice(2000, item.currency || 'INR')}</div>
                          )}
                        </div>
                      </div>
                      
                      <div className="ml-4 flex flex-col items-end">
                        {/* Quantity controls */}
                        <div className="flex items-center space-x-2 mb-2">
                          <button
                            onClick={() => handleQuantityChange(item.id, item.quantity - 1)}
                            className="p-1 text-gray-500 hover:text-gray-700 dark:hover:text-gray-300"
                          >
                            <Minus size={16} />
                          </button>
                          <span className="text-sm text-gray-900 dark:text-white min-w-[2rem] text-center">
                            {item.quantity}
                          </span>
                          <button
                            onClick={() => handleQuantityChange(item.id, item.quantity + 1)}
                            className="p-1 text-gray-500 hover:text-gray-700 dark:hover:text-gray-300"
                          >
                            <Plus size={16} />
                          </button>
                        </div>
                        
                        {/* Remove button */}
                        <button
                          onClick={() => handleRemoveItem(item.id)}
                          className="p-1 text-red-500 hover:text-red-700 dark:hover:text-red-400"
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </div>
                    
                    <div className="font-semibold text-gray-900 dark:text-white">
                      {formatPrice(getItemTotal(item), item.currency || 'INR')}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Footer */}
          {cartItems.length > 0 && (
            <div className="border-t border-gray-200 dark:border-gray-800 p-6 space-y-4">
              <div className="flex items-center justify-between text-lg font-semibold">
                <span className="text-gray-900 dark:text-white">Total:</span>
                <span className="text-gray-900 dark:text-white">{formatPrice(cartTotal, cartItems[0]?.currency || 'INR')}</span>
              </div>
              
              <Button
                variant="primary"
                className="w-full"
                size="lg"
                onClick={handleProceedToCheckout}
              >
                Proceed to Checkout
              </Button>
              
              <Button
                variant="ghost"
                className="w-full"
                onClick={handleContinueShopping}
              >
                Continue Shopping
              </Button>
            </div>
          )}
        </div>
      </motion.div>
    </>
  )
}

export default CartDrawer