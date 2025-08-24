import React, { useState } from 'react'
import { motion } from 'framer-motion'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { useAppSelector } from '../hooks/useAppSelector'
import { useAppDispatch } from '../hooks/useAppDispatch'
import { selectCartItems, selectCartTotal, selectCartHasItems, clearCart } from '../store/slices/cartSlice'
import { addToast } from '../store/slices/uiSlice'
import Button from '../components/ui/Button'
import Card from '../components/ui/Card'
import { ArrowRight, CreditCard, Shield, Clock, CheckCircle, ExternalLink, AlertCircle } from 'lucide-react'
import { useNavigate } from 'react-router-dom'

const checkoutSchema = z.object({
  firstName: z.string().min(2, 'First name must be at least 2 characters'),
  lastName: z.string().min(2, 'Last name must be at least 2 characters'),
  email: z.string().email('Please enter a valid email address'),
  phone: z.string().min(10, 'Phone number must be at least 10 digits'),
  address: z.string().min(5, 'Address must be at least 5 characters'),
  city: z.string().min(2, 'City must be at least 2 characters'),
  state: z.string().min(2, 'State must be at least 2 characters'),
  zipCode: z.string().min(5, 'ZIP code must be at least 5 characters'),
})

type CheckoutFormData = z.infer<typeof checkoutSchema>

const Checkout: React.FC = () => {
  const dispatch = useAppDispatch()
  const navigate = useNavigate()
  const cartItems = useAppSelector(selectCartItems)
  const cartTotal = useAppSelector(selectCartTotal)
  const cartHasItems = useAppSelector(selectCartHasItems)
  const user = useAppSelector(state => state.user.user)
  
  const [isProcessing, setIsProcessing] = useState(false)
  const [customerInfo, setCustomerInfo] = useState<CheckoutFormData | null>(null)

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<CheckoutFormData>({
    resolver: zodResolver(checkoutSchema),
    defaultValues: {
      firstName: user?.firstName || '',
      lastName: user?.lastName || '',
      email: user?.email || '',
      phone: user?.phone || '',
    }
  })

  const formatPrice = (cents: number, currency: string) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: currency,
    }).format(cents / 100)
  }

  const handleCustomerInfoSubmit = async (data: CheckoutFormData) => {
    setCustomerInfo(data)
    
    // Store customer info for later use
    localStorage.setItem('notarette_customer_info', JSON.stringify(data))
    
    dispatch(addToast({
      type: 'success',
      title: 'Customer Info Saved',
      message: 'Now proceed to individual service payments.',
    }))
  }

  const handleServicePayment = async (item: any) => {
    try {
      setIsProcessing(true)
      
      if (!customerInfo) {
        dispatch(addToast({
          type: 'error',
          title: 'Customer Info Required',
          message: 'Please fill in customer information first.',
        }))
        return
      }

      // Store checkout data for this specific service
      const checkoutData = {
        customerInfo,
        cartItem: item,
        timestamp: new Date().toISOString()
      }
      localStorage.setItem('notarette_checkout_data', JSON.stringify(checkoutData))
      
      if (item.paymentLink) {
        // Service has a Stripe Payment Link - open it
        window.open(item.paymentLink, '_blank')
        
        dispatch(addToast({
          type: 'success',
          title: 'Payment Link Opened',
          message: `${item.name} payment opened in new tab.`,
        }))
      } else {
        // Service doesn't have a payment link - show message
        dispatch(addToast({
          type: 'warning',
          title: 'Payment Link Not Available',
          message: `${item.name} doesn't have a payment link yet. Contact support.`,
        }))
      }
      
    } catch (error) {
      console.error('Error opening payment link:', error)
      dispatch(addToast({
        type: 'error',
        title: 'Payment Error',
        message: 'Failed to open payment link. Please try again.',
      }))
    } finally {
      setIsProcessing(false)
    }
  }

  const getServiceStatus = (item: any) => {
    if (item.paymentLink) {
      return {
        status: 'ready',
        text: 'Ready for payment',
        color: 'text-green-600',
        icon: CheckCircle
      }
    } else {
      return {
        status: 'unavailable',
        text: 'Payment link not available',
        color: 'text-red-600',
        icon: AlertCircle
      }
    }
  }

  if (!cartHasItems) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-12">
        <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8">
          <Card>
            <div className="text-center py-12">
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
                Your cart is empty
              </h2>
              <p className="text-gray-600 dark:text-gray-400 mb-6">
                Add some services to your cart before proceeding to checkout.
              </p>
              <Button onClick={() => navigate('/services')} variant="primary">
                Browse Services
              </Button>
            </div>
          </Card>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-12">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="text-center mb-8"
        >
          <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-4">
            Complete Your Order
          </h1>
          <p className="text-xl text-gray-600 dark:text-gray-400">
            Individual service payments powered by Stripe
          </p>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Customer Information */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
          >
            <Card>
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">
                Customer Information
              </h2>
              
              {!customerInfo ? (
                <form onSubmit={handleSubmit(handleCustomerInfoSubmit)} className="space-y-4">
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

                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Address
                    </label>
                    <input
                      {...register('address')}
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-teal-500 focus:border-transparent"
                    />
                    {errors.address && (
                      <p className="text-red-600 text-sm mt-1">{errors.address.message}</p>
                    )}
                  </div>

                  <div className="grid grid-cols-3 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                        City
                      </label>
                      <input
                        {...register('city')}
                        className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-teal-500 focus:border-transparent"
                      />
                      {errors.city && (
                        <p className="text-red-600 text-sm mt-1">{errors.city.message}</p>
                      )}
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                        State
                      </label>
                      <input
                        {...register('state')}
                        className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-teal-500 focus:border-transparent"
                      />
                      {errors.state && (
                        <p className="text-red-600 text-sm mt-1">{errors.state.message}</p>
                      )}
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                        ZIP Code
                      </label>
                      <input
                        {...register('zipCode')}
                        className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-teal-500 focus:border-transparent"
                      />
                      {errors.zipCode && (
                        <p className="text-red-600 text-sm mt-1">{errors.zipCode.message}</p>
                      )}
                    </div>
                  </div>

                  <Button
                    type="submit"
                    variant="primary"
                    size="lg"
                    className="w-full"
                  >
                    <CreditCard className="w-4 h-4 mr-2" />
                    Save Customer Information
                    <ArrowRight className="w-4 h-4 ml-2" />
                  </Button>
                </form>
              ) : (
                <div className="space-y-4">
                  <div className="p-4 bg-green-50 dark:bg-green-900/20 rounded-lg">
                    <div className="flex items-center space-x-2 text-green-800 dark:text-green-200">
                      <CheckCircle className="w-5 h-5" />
                      <span className="font-medium">Customer Information Saved</span>
                    </div>
                    <p className="text-sm text-green-700 dark:text-green-300 mt-1">
                      {customerInfo.firstName} {customerInfo.lastName} - {customerInfo.email}
                    </p>
                  </div>
                  
                  <Button
                    onClick={() => setCustomerInfo(null)}
                    variant="ghost"
                    size="sm"
                    className="w-full"
                  >
                    Edit Information
                  </Button>
                </div>
              )}
            </Card>
          </motion.div>

          {/* Order Summary & Individual Payments */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6, delay: 0.4 }}
          >
            <Card>
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">
                Order Summary & Payments
              </h2>

              <div className="space-y-4 mb-6">
                {cartItems.map((item) => {
                  const status = getServiceStatus(item)
                  const StatusIcon = status.icon
                  
                  return (
                    <div key={item.id} className="p-4 border border-gray-200 dark:border-gray-700 rounded-lg">
                      <div className="flex justify-between items-start mb-3">
                        <div className="flex-1">
                          <h3 className="font-medium text-gray-900 dark:text-white">
                            {item.name}
                          </h3>
                          {item.addOns?.extraPages && (
                            <p className="text-sm text-gray-600 dark:text-gray-400">
                              Extra Pages: {item.addOns.extraPages}
                            </p>
                          )}
                          {item.addOns?.courier && (
                            <p className="text-sm text-gray-600 dark:text-gray-400">
                              Courier Service
                            </p>
                          )}
                          {item.addOns?.rushService && (
                            <p className="text-sm text-gray-600 dark:text-gray-400">
                              Rush Service
                            </p>
                          )}
                        </div>
                        <div className="text-right">
                          <p className="font-medium text-gray-900 dark:text-white">
                            {formatPrice(item.priceCents, item.currency)}
                          </p>
                          <div className={`flex items-center space-x-1 text-xs ${status.color}`}>
                            <StatusIcon className="w-3 h-3" />
                            <span>{status.text}</span>
                          </div>
                        </div>
                      </div>
                      
                      {customerInfo && (
                        <Button
                          onClick={() => handleServicePayment(item)}
                          variant={item.paymentLink ? "primary" : "ghost"}
                          size="sm"
                          className="w-full"
                          disabled={!item.paymentLink || isProcessing}
                        >
                          {item.paymentLink ? (
                            <>
                              <ExternalLink className="w-4 h-4 mr-2" />
                              Pay for {item.name}
                            </>
                          ) : (
                            <>
                              <AlertCircle className="w-4 h-4 mr-2" />
                              Payment Link Not Available
                            </>
                          )}
                        </Button>
                      )}
                    </div>
                  )
                })}
              </div>

              <div className="border-t border-gray-200 dark:border-gray-700 pt-4">
                <div className="flex justify-between items-center text-lg font-bold text-gray-900 dark:text-white">
                  <span>Total</span>
                  <span>{formatPrice(cartTotal, cartItems[0]?.currency || 'INR')}</span>
                </div>
              </div>

              {/* Instructions */}
              {customerInfo && (
                <div className="mt-6 p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                  <h3 className="font-medium text-blue-900 dark:text-blue-200 mb-2">
                    How to Complete Your Order
                  </h3>
                  <ol className="text-sm text-blue-800 dark:text-blue-300 space-y-1">
                    <li>1. Click "Pay for [Service Name]" for each service</li>
                    <li>2. Complete payment on Stripe in the new tab</li>
                    <li>3. Return here after each payment</li>
                    <li>4. All payments will be verified automatically</li>
                  </ol>
                </div>
              )}

              {/* Security & Trust Indicators */}
              <div className="mt-6 space-y-3">
                <div className="flex items-center space-x-2 text-sm text-gray-600 dark:text-gray-400">
                  <Shield className="w-4 h-4 text-green-500" />
                  <span>256-bit SSL encryption</span>
                </div>
                <div className="flex items-center space-x-2 text-sm text-gray-600 dark:text-gray-400">
                  <CheckCircle className="w-4 h-4 text-green-500" />
                  <span>PCI DSS compliant</span>
                </div>
                <div className="flex items-center space-x-2 text-sm text-gray-600 dark:text-gray-400">
                  <Clock className="w-4 h-4 text-green-500" />
                  <span>Individual service payments</span>
                </div>
              </div>
            </Card>
          </motion.div>
        </div>

        {/* Trust & Information Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.6 }}
          className="mt-12"
        >
          {/* Why Choose Notary24™ */}
          <Card className="mb-8">
            <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-8 text-center">
              Why Choose Notary24™
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              <div className="text-center">
                <div className="w-12 h-12 bg-blue-100 dark:bg-blue-900/30 rounded-full flex items-center justify-center mx-auto mb-4">
                  <span className="text-blue-600 dark:text-blue-400 text-xl font-bold">+</span>
                </div>
                <h3 className="font-bold text-gray-900 dark:text-white mb-2">No Hidden Fees Guarantee</h3>
                <p className="text-gray-600 dark:text-gray-400 text-sm">
                  All our services included in the selected product are completely covered by our fee.
                </p>
              </div>
              
              <div className="text-center">
                <div className="w-12 h-12 bg-blue-100 dark:bg-blue-900/30 rounded-full flex items-center justify-center mx-auto mb-4">
                  <span className="text-blue-600 dark:text-blue-400 text-xl font-bold">+</span>
                </div>
                <h3 className="font-bold text-gray-900 dark:text-white mb-2">Professional Team</h3>
                <p className="text-gray-600 dark:text-gray-400 text-sm">
                  Our experienced notaries and lawyers ensure fast and efficient execution of your order.
                </p>
              </div>
              
              <div className="text-center">
                <div className="w-12 h-12 bg-blue-100 dark:bg-blue-900/30 rounded-full flex items-center justify-center mx-auto mb-4">
                  <span className="text-blue-600 dark:text-blue-400 text-xl font-bold">+</span>
                </div>
                <h3 className="font-bold text-gray-900 dark:text-white mb-2">Fast Service</h3>
                <p className="text-gray-600 dark:text-gray-400 text-sm">
                  As soon as you place the order, you will receive email for order confirmation & we shall processing your order right after. Your will receive all instructions in a few hours.
                </p>
              </div>
              
              <div className="text-center">
                <div className="w-12 h-12 bg-blue-100 dark:bg-blue-900/30 rounded-full flex items-center justify-center mx-auto mb-4">
                  <span className="text-blue-600 dark:text-blue-400 text-xl font-bold">+</span>
                </div>
                <h3 className="font-bold text-gray-900 dark:text-white mb-2">100% Safe and Secure Payment</h3>
                <p className="text-gray-600 dark:text-gray-400 text-sm">
                  All the information that you submit here is 100% encrypted. This is 256 bit SSL encrypted payment.
                </p>
              </div>
              
              <div className="text-center">
                <div className="w-12 h-12 bg-blue-100 dark:bg-blue-900/30 rounded-full flex items-center justify-center mx-auto mb-4">
                  <span className="text-blue-600 dark:text-blue-400 text-xl font-bold">+</span>
                </div>
                <h3 className="font-bold text-gray-900 dark:text-white mb-2">No Visit Required</h3>
                <p className="text-gray-600 dark:text-gray-400 text-sm">
                  We are always happy to meet our customers. However, everything can be done online / from your home or office.
                </p>
              </div>
              
              <div className="text-center">
                <div className="w-12 h-12 bg-blue-100 dark:bg-blue-900/30 rounded-full flex items-center justify-center mx-auto mb-4">
                  <span className="text-blue-600 dark:text-blue-400 text-xl font-bold">+</span>
                </div>
                <h3 className="font-bold text-gray-900 dark:text-white mb-2">Video Reviews</h3>
                <p className="text-gray-600 dark:text-gray-400 text-sm">
                  Check our verified <span className="text-blue-600 dark:text-blue-400 cursor-pointer">Video Reviews</span>
                </p>
              </div>
            </div>
          </Card>

          {/* Policies and Trust */}
          <Card className="mb-8">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              {/* Trust Icons */}
              <div className="space-y-6">
                <div className="text-center">
                  <div className="w-16 h-16 bg-gray-100 dark:bg-gray-800 rounded-full flex items-center justify-center mx-auto mb-3">
                    <Shield className="w-8 h-8 text-gray-600 dark:text-gray-400" />
                  </div>
                  <p className="text-gray-700 dark:text-gray-300 font-medium">We Protect Your Privacy</p>
                </div>
                
                <div className="text-center">
                  <div className="w-16 h-16 bg-gray-100 dark:bg-gray-800 rounded-full flex items-center justify-center mx-auto mb-3">
                    <CheckCircle className="w-8 h-8 text-gray-600 dark:text-gray-400" />
                  </div>
                  <p className="text-gray-700 dark:text-gray-300 font-medium">100% Satisfaction Guaranteed</p>
                </div>
                
                <div className="text-center">
                  <div className="w-16 h-16 bg-gray-100 dark:bg-gray-800 rounded-full flex items-center justify-center mx-auto mb-3">
                    <CreditCard className="w-8 h-8 text-gray-600 dark:text-gray-400" />
                  </div>
                  <p className="text-gray-700 dark:text-gray-300 font-medium">Your Information Is Secure</p>
                </div>
              </div>

              {/* Policies */}
              <div className="space-y-6">
                <div>
                  <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-3">100% Refund Policy</h3>
                  <p className="text-gray-600 dark:text-gray-400 text-sm">
                    We offer a seven-day Money Back Guarantee. If you want to cancel your account and get back the money paid for our services, please contact our Customer Support. Our Money Back Guarantee gives you peace of mind that our services will meet the expectations.
                  </p>
                </div>
                
                <div>
                  <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-3">Privacy Protection</h3>
                  <p className="text-gray-600 dark:text-gray-400 text-sm">
                    We respect your privacy and will never share, sell, rent, lease or give away your personal information (name, address, email, etc.) to any third party for marketing, advertising or other purposes.
                  </p>
                </div>
                
                <div>
                  <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-3">Other Payment Methods</h3>
                  <p className="text-gray-600 dark:text-gray-400 text-sm">
                    Is it more convenient for you to pay in another way, for example, by bank transfer, e-currency or cash? Please contact us and we will find a solution. <strong>Tax Invoice will be provided for each payment.</strong>
                  </p>
                </div>
              </div>
            </div>
          </Card>

          {/* Payment Methods and Customer Support */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Payment Methods */}
            <Card>
              <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-6 text-center">
                WE ACCEPT
                <div className="w-24 h-1 bg-blue-500 mx-auto mt-2 rounded-full"></div>
              </h3>
              <div className="flex justify-center">
                <img 
                  src="/src/pages/Images/payment-methods We Accept image.png" 
                  alt="Payment Methods We Accept" 
                  className="max-w-full h-auto rounded-lg shadow-sm"
                  style={{ maxHeight: '300px' }}
                />
              </div>
            </Card>

            {/* Customer Support */}
            <Card>
              <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-2 text-center">Customer Support</h3>
              <p className="text-gray-600 dark:text-gray-400 text-center mb-6">OUR CUSTOMER SUPPORT IS HERE FOR YOU</p>
              
              <div className="text-center mb-6">
                <div className="w-20 h-20 bg-gray-300 dark:bg-gray-600 rounded-full mx-auto mb-3 flex items-center justify-center">
                  <span className="text-gray-600 dark:text-gray-400 text-2xl font-bold">DC</span>
                </div>
                <h4 className="font-bold text-gray-900 dark:text-white text-lg">Dennis Chung</h4>
                <p className="text-gray-600 dark:text-gray-400">Customer Happiness Manager</p>
                <p className="text-gray-500 dark:text-gray-500 italic mt-2">Dennis Chung</p>
              </div>
              
              <div className="space-y-3 text-sm">
                <div className="flex items-center space-x-2">
                  <CreditCard className="w-4 h-4 text-gray-500" />
                  <span className="text-gray-700 dark:text-gray-300">Contact our Support Team</span>
                </div>
                <div className="flex items-center space-x-2">
                  <CreditCard className="w-4 h-4 text-gray-500" />
                  <span className="text-gray-700 dark:text-gray-300">E-Mail: support@notary24.com</span>
                </div>
                <div className="flex items-center space-x-2">
                  <CreditCard className="w-4 h-4 text-gray-500" />
                  <span className="text-gray-700 dark:text-gray-300">Live Support: <span className="text-blue-600 dark:text-blue-400 cursor-pointer">LiveChat</span></span>
                </div>
                <div className="flex items-center space-x-2">
                  <CreditCard className="w-4 h-4 text-gray-500" />
                  <span className="text-gray-700 dark:text-gray-300">Business Hours: 24/7</span>
                </div>
              </div>
            </Card>
          </div>
        </motion.div>
      </div>
    </div>
  )
}

export default Checkout