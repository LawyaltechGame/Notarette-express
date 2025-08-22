import React from 'react'
import { X, Plus, Minus, ShoppingBag } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import { useAppSelector } from '../../hooks/useAppSelector'
import { useAppDispatch } from '../../hooks/useAppDispatch'
import { closeCart, removeItem, updateQuantity, selectCartItems, selectCartTotal } from '../../store/slices/cartSlice'
import Button from '../ui/Button'
import { Link } from 'react-router-dom'

const CartDrawer: React.FC = () => {
  const dispatch = useAppDispatch()
  const isOpen = useAppSelector(state => state.cart.isOpen)
  const items = useAppSelector(selectCartItems)
  const total = useAppSelector(selectCartTotal)

  const formatPrice = (cents: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(cents / 100)
  }

  const getItemTotal = (item: any) => {
    let itemTotal = item.priceCents * item.quantity
    if (item.addOns.extraPages) {
      itemTotal += item.addOns.extraPages * 500
    }
    if (item.addOns.courier) {
      itemTotal += 1500
    }
    return itemTotal
  }

  return (
    <AnimatePresence>
      {isOpen && (
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
                  Shopping Cart ({items.length})
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
                {items.length === 0 ? (
                  <div className="flex flex-col items-center justify-center h-full text-center">
                    <ShoppingBag className="w-16 h-16 text-gray-300 dark:text-gray-600 mb-4" />
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
                      <Link to="/services">Browse Services</Link>
                    </Button>
                  </div>
                ) : (
                  <div className="space-y-6">
                    {items.map((item) => (
                      <div key={`${item.id}-${JSON.stringify(item.addOns)}`} className="border-b border-gray-200 dark:border-gray-800 pb-6">
                        <div className="flex items-start justify-between mb-3">
                          <div className="flex-1">
                            <h3 className="font-medium text-gray-900 dark:text-white">
                              {item.name}
                            </h3>
                            <p className="text-sm text-gray-600 dark:text-gray-400">
                              {formatPrice(item.priceCents)} each
                            </p>
                            
                            {/* Add-ons */}
                            {(item.addOns.extraPages || item.addOns.courier) && (
                              <div className="mt-2 text-sm text-gray-600 dark:text-gray-400">
                                {item.addOns.extraPages && (
                                  <div>Extra pages: {item.addOns.extraPages} × {formatPrice(500)}</div>
                                )}
                                {item.addOns.courier && (
                                  <div>Courier delivery: {formatPrice(1500)}</div>
                                )}
                              </div>
                            )}
                          </div>
                          
                          <button
                            onClick={() => dispatch(removeItem(item.id))}
                            className="text-red-500 hover:text-red-700 transition-colors"
                          >
                            <X size={16} />
                          </button>
                        </div>

                        <div className="flex items-center justify-between">
                          <div className="flex items-center space-x-3">
                            <button
                              onClick={() => dispatch(updateQuantity({ id: item.id, quantity: Math.max(1, item.quantity - 1) }))}
                              className="p-1 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
                            >
                              <Minus size={16} />
                            </button>
                            <span className="font-medium text-gray-900 dark:text-white">
                              {item.quantity}
                            </span>
                            <button
                              onClick={() => dispatch(updateQuantity({ id: item.id, quantity: item.quantity + 1 }))}
                              className="p-1 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
                            >
                              <Plus size={16} />
                            </button>
                          </div>
                          
                          <div className="font-semibold text-gray-900 dark:text-white">
                            {formatPrice(getItemTotal(item))}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Footer */}
              {items.length > 0 && (
                <div className="border-t border-gray-200 dark:border-gray-800 p-6 space-y-4">
                  <div className="flex items-center justify-between text-lg font-semibold">
                    <span className="text-gray-900 dark:text-white">Total:</span>
                    <span className="text-gray-900 dark:text-white">{formatPrice(total)}</span>
                  </div>
                  
                  <Link 
                    to="/checkout"
                    onClick={() => dispatch(closeCart())}
                    className="block"
                  >
                    <Button variant="primary" className="w-full" size="lg">
                      Proceed to Checkout
                    </Button>
                  </Link>
                  
                  <Button
                    variant="ghost"
                    className="w-full"
                    onClick={() => dispatch(closeCart())}
                  >
                    Continue Shopping
                  </Button>
                </div>
              )}
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  )
}

export default CartDrawer