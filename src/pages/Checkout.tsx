import React from 'react'
import { motion } from 'framer-motion'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { CreditCard, Shield, Lock } from 'lucide-react'
import { useAppSelector } from '../hooks/useAppSelector'
import { useAppDispatch } from '../hooks/useAppDispatch'
import { selectCartItems, selectCartTotal, clearCart } from '../store/slices/cartSlice'
import { createOrderStart, createOrderSuccess } from '../store/slices/orderSlice'
import { addToast } from '../store/slices/uiSlice'
import Button from '../components/ui/Button'
import Card from '../components/ui/Card'
import { useNavigate } from 'react-router-dom'

const checkoutSchema = z.object({
  firstName: z.string().min(2, 'First name is required'),
  lastName: z.string().min(2, 'Last name is required'),
  email: z.string().email('Please enter a valid email address'),
  phone: z.string().min(10, 'Please enter a valid phone number'),
  acceptTerms: z.boolean().refine(val => val === true, 'You must accept the terms and conditions'),
  acceptPrivacy: z.boolean().refine(val => val === true, 'You must accept the privacy policy'),
})

type CheckoutFormData = z.infer<typeof checkoutSchema>

const Checkout: React.FC = () => {
  const dispatch = useAppDispatch()
  const navigate = useNavigate()
  const cartItems = useAppSelector(selectCartItems)
  const cartTotal = useAppSelector(selectCartTotal)
  const loading = useAppSelector(state => state.order.loading)

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<CheckoutFormData>({
    resolver: zodResolver(checkoutSchema),
  })

  React.useEffect(() => {
    if (cartItems.length === 0) {
      navigate('/services')
    }
  }, [cartItems, navigate])

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

  const onSubmit = async (data: CheckoutFormData) => {
    dispatch(createOrderStart())

    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 2000))

      const order = {
        id: `order_${Date.now()}`,
        userId: 'user_123', // This would come from auth
        items: cartItems.map(item => ({
          serviceId: item.id,
          name: item.name,
          priceCents: item.priceCents,
          quantity: item.quantity,
          addOns: item.addOns,
        })),
        amountCents: cartTotal,
        currency: 'USD',
        status: 'paid' as const,
        kycStatus: 'required' as const,
        deliveryMethod: cartItems.some(item => item.addOns.courier) ? 'courier' as const : 'email' as const,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        kycLink: `https://verify.stripe.com/start/test_${Date.now()}`, // Mock Stripe Identity link
      }

      dispatch(createOrderSuccess(order))
      dispatch(clearCart())
      dispatch(addToast({
        type: 'success',
        title: 'Order placed successfully!',
        message: 'Redirecting to next steps...',
      }))

      // Redirect to thank you page
      navigate(`/thank-you?order=${order.id}`)
    } catch (error) {
      dispatch(addToast({
        type: 'error',
        title: 'Payment failed',
        message: 'Please try again or contact support.',
      }))
    }
  }

  if (cartItems.length === 0) {
    return null
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-12">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-8"
        >
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
            Complete Your Order
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            Just a few more steps to get your documents notarized
          </p>
        </motion.div>

        <form onSubmit={handleSubmit(onSubmit)} className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Customer Information */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.1 }}
          >
            <Card>
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-6">
                Customer Information
              </h2>

              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      First Name
                    </label>
                    <input
                      {...register('firstName')}
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-teal-500 focus:border-transparent"
                    />
                    {errors.firstName && (
                      <p className="text-red-600 text-sm mt-1">{errors.firstName.message}</p>
                    )}
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Last Name
                    </label>
                    <input
                      {...register('lastName')}
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-teal-500 focus:border-transparent"
                    />
                    {errors.lastName && (
                      <p className="text-red-600 text-sm mt-1">{errors.lastName.message}</p>
                    )}
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Email Address
                  </label>
                  <input
                    type="email"
                    {...register('email')}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-teal-500 focus:border-transparent"
                  />
                  {errors.email && (
                    <p className="text-red-600 text-sm mt-1">{errors.email.message}</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Phone Number
                  </label>
                  <input
                    type="tel"
                    {...register('phone')}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-teal-500 focus:border-transparent"
                  />
                  {errors.phone && (
                    <p className="text-red-600 text-sm mt-1">{errors.phone.message}</p>
                  )}
                </div>
              </div>

              {/* Terms and Conditions */}
              <div className="mt-6 pt-6 border-t border-gray-200 dark:border-gray-700 space-y-3">
                <label className="flex items-start space-x-3">
                  <input
                    type="checkbox"
                    {...register('acceptTerms')}
                    className="mt-1 rounded border-gray-300 dark:border-gray-600 text-teal-600 focus:ring-teal-500"
                  />
                  <span className="text-sm text-gray-700 dark:text-gray-300">
                    I accept the{' '}
                    <a href="/legal/terms" className="text-teal-600 hover:text-teal-700">
                      Terms and Conditions
                    </a>
                  </span>
                </label>
                {errors.acceptTerms && (
                  <p className="text-red-600 text-sm ml-6">{errors.acceptTerms.message}</p>
                )}

                <label className="flex items-start space-x-3">
                  <input
                    type="checkbox"
                    {...register('acceptPrivacy')}
                    className="mt-1 rounded border-gray-300 dark:border-gray-600 text-teal-600 focus:ring-teal-500"
                  />
                  <span className="text-sm text-gray-700 dark:text-gray-300">
                    I accept the{' '}
                    <a href="/legal/privacy" className="text-teal-600 hover:text-teal-700">
                      Privacy Policy
                    </a>
                  </span>
                </label>
                {errors.acceptPrivacy && (
                  <p className="text-red-600 text-sm ml-6">{errors.acceptPrivacy.message}</p>
                )}
              </div>
            </Card>
          </motion.div>

          {/* Order Summary */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.2 }}
          >
            <Card>
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-6">
                Order Summary
              </h2>

              <div className="space-y-4 mb-6">
                {cartItems.map((item, index) => (
                  <div key={index} className="flex justify-between items-start">
                    <div className="flex-1">
                      <h3 className="font-medium text-gray-900 dark:text-white">
                        {item.name} × {item.quantity}
                      </h3>
                      {(item.addOns.extraPages || item.addOns.courier) && (
                        <div className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                          {item.addOns.extraPages && (
                            <div>• Extra pages: {item.addOns.extraPages}</div>
                          )}
                          {item.addOns.courier && <div>• Courier delivery</div>}
                        </div>
                      )}
                    </div>
                    <div className="font-semibold text-gray-900 dark:text-white">
                      {formatPrice(getItemTotal(item))}
                    </div>
                  </div>
                ))}
              </div>

              <div className="border-t border-gray-200 dark:border-gray-700 pt-4 mb-6">
                <div className="flex justify-between items-center text-lg font-semibold">
                  <span className="text-gray-900 dark:text-white">Total:</span>
                  <span className="text-gray-900 dark:text-white">{formatPrice(cartTotal)}</span>
                </div>
              </div>

              {/* Payment Method */}
              <div className="mb-6">
                <h3 className="font-medium text-gray-900 dark:text-white mb-4">Payment Method</h3>
                <div className="border border-gray-300 dark:border-gray-600 rounded-lg p-4 bg-gray-50 dark:bg-gray-800">
                  <div className="flex items-center space-x-3 mb-2">
                    <CreditCard className="w-5 h-5 text-teal-600" />
                    <span className="font-medium text-gray-900 dark:text-white">
                      Secure Card Payment
                    </span>
                  </div>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    Payment will be processed securely via Stripe
                  </p>
                </div>
              </div>

              {/* Submit Button */}
              <Button
                type="submit"
                variant="primary"
                size="lg"
                className="w-full"
                loading={loading}
              >
                <Lock className="w-4 h-4 mr-2" />
                Complete Payment - {formatPrice(cartTotal)}
              </Button>

              {/* Security Notice */}
              <div className="mt-4 flex items-center justify-center space-x-2 text-xs text-gray-600 dark:text-gray-400">
                <Shield className="w-3 h-3" />
                <span>256-bit SSL encryption • PCI DSS compliant</span>
              </div>
            </Card>
          </motion.div>
        </form>
      </div>
    </div>
  )
}

export default Checkout