import React, { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { CheckCircle, Calendar, ExternalLink, Home, ShoppingCart, Loader2, XCircle } from 'lucide-react'
import { stripeService } from '../services/stripeService'
// import { useAppSelector } from '../hooks/useAppSelector'
// cart removed
import Button from '../components/ui/Button'
import Card from '../components/ui/Card'

interface CheckSessionResponse {
  paid: boolean;
  reason?: string | null;
  amount: number | null;
  currency: string | null;
  items: { name: string; qty: number; priceId: string }[];
  customer: { email: string | null; name: string | null };
}

const ThankYou: React.FC = () => {
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const [orderData, setOrderData] = useState<CheckSessionResponse | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const loadOrderData = async () => {
      try {
        const sessionId = searchParams.get('session_id')
        
        // First try to get data from sessionStorage
        const cachedData = sessionStorage.getItem('lastOrder')
        
        if (cachedData) {
          const data = JSON.parse(cachedData)
          setOrderData(data)
          setIsLoading(false)
          return
        }

        // If no cached data but we have session_id, fetch from Firebase Function
        if (sessionId) {
          const data = await stripeService.checkSession(sessionId)

          if (data.paid) {
            setOrderData(data)
            // Cache the data
            sessionStorage.setItem('lastOrder', JSON.stringify(data))
          } else {
            setError('Payment was not successful')
          }
        } else {
          setError('No order data found')
        }
      } catch (err: any) {
        console.error('Error loading order data:', err)
        setError('Failed to load order details')
      } finally {
        setIsLoading(false)
      }
    }

    loadOrderData()
  }, [searchParams])

  const handleBookAppointment = () => {
    const sessionId = searchParams.get('session_id')
    const calUrl = `https://cal.com/marcus-whereby-xu25ac/remote-notarization-meeting-test?orderId=${sessionId}`
    window.open(calUrl, '_blank')
  }

  const formatCurrency = (amount: number | null, currency: string | null) => {
    if (!amount || !currency) return 'N/A'
    return stripeService.formatPrice(amount, currency)
  }

  // Check if there are more items in cart
  const hasMoreItems = false

  // Clear session storage if cart is empty (all services paid for)
  useEffect(() => {
    if (!hasMoreItems) {
      sessionStorage.removeItem('lastOrder')
      localStorage.removeItem('notarette_checkout_data')
    }
  }, [hasMoreItems])

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-12 h-12 text-teal-600 animate-spin mx-auto mb-4" />
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
            Loading Your Order Details
          </h2>
        </div>
      </div>
    )
  }

  if (error || !orderData) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-12">
        <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8">
          <Card>
            <div className="text-center py-12">
              <XCircle className="w-16 h-16 text-red-500 mx-auto mb-4" />
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
                Order Not Found
              </h2>
              <p className="text-gray-600 dark:text-gray-400 mb-6">
                {error || 'Unable to load your order details.'}
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
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Success Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="text-center mb-12"
        >
          <div className="inline-flex items-center justify-center w-20 h-20 bg-green-100 dark:bg-green-900/20 rounded-full mb-6">
            <CheckCircle className="w-10 h-10 text-green-600 dark:text-green-400" />
          </div>
          <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-4">
            Payment Confirmed!
          </h1>
          <p className="text-xl text-gray-600 dark:text-gray-300">
            Thank you for your purchase. Your payment has been processed successfully.
          </p>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-12">
          {/* Order Summary */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
          >
            <Card>
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">
                Order Summary
              </h2>
              
              <div className="space-y-4 mb-6">
                {orderData.items.map((item, index) => (
                  <div key={index} className="p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
                    <div className="flex justify-between items-start mb-2">
                      <h3 className="font-semibold text-gray-900 dark:text-white">
                        {item.name}
                      </h3>
                      <span className="font-bold text-teal-600">
                        Qty: {item.qty}
                      </span>
                    </div>
                  </div>
                ))}
              </div>

              <div className="border-t border-gray-200 dark:border-gray-700 pt-4">
                <div className="flex justify-between items-center text-xl font-bold text-gray-900 dark:text-white">
                  <span>Total</span>
                  <span className="text-teal-600">{formatCurrency(orderData.amount, orderData.currency)}</span>
                </div>
              </div>
            </Card>
          </motion.div>

          {/* Customer Information */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6, delay: 0.4 }}
          >
            <Card>
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">
                Customer Information
              </h2>
              
              <div className="space-y-4">
                {orderData.customer.name && (
                  <div>
                    <label className="text-sm font-medium text-gray-500 dark:text-gray-400">Name</label>
                    <p className="text-gray-900 dark:text-white">{orderData.customer.name}</p>
                  </div>
                )}
                
                {orderData.customer.email && (
                  <div>
                    <label className="text-sm font-medium text-gray-500 dark:text-gray-400">Email</label>
                    <p className="text-gray-900 dark:text-white">{orderData.customer.email}</p>
                  </div>
                )}
                
                <div>
                  <label className="text-sm font-medium text-gray-500 dark:text-gray-400">Order ID</label>
                  <p className="text-gray-900 dark:text-white font-mono text-sm">
                    {searchParams.get('session_id')}
                  </p>
                </div>
              </div>
            </Card>
          </motion.div>
        </div>

        {/* Next Steps */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.6 }}
          className="text-center mb-12"
        >
          <Card className="bg-gradient-to-r from-teal-50 to-blue-50 dark:from-teal-900/20 dark:to-blue-900/20">
            <div className="p-8">
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
                Next Step: Book Your Appointment
              </h2>
              <p className="text-gray-600 dark:text-gray-300 mb-6 max-w-2xl mx-auto">
                Your payment has been processed successfully! Now it's time to schedule your notarization appointment. 
                Click the button below to book your preferred time slot.
              </p>
              
              <Button
                onClick={handleBookAppointment}
                variant="primary"
                size="lg"
                className="mb-6"
              >
                <Calendar className="w-5 h-5 mr-2" />
                Book Your Appointment Now
                <ExternalLink className="w-5 h-5 ml-2" />
              </Button>
              
              <p className="text-sm text-gray-500 dark:text-gray-400">
                You'll receive a confirmation email with your appointment details and meeting link.
              </p>
            </div>
          </Card>
        </motion.div>

        {/* Action Buttons */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.8 }}
          className="flex flex-col sm:flex-row gap-4 justify-center"
        >
          {hasMoreItems ? (
            <Button
              onClick={() => navigate('/checkout')}
              variant="primary"
              size="lg"
            >
              <ShoppingCart className="w-5 h-5 mr-2" />
              Continue with Remaining Services
            </Button>
          ) : (
            <Button
              onClick={() => navigate('/services')}
              variant="ghost"
              size="lg"
            >
              <ShoppingCart className="w-5 h-5 mr-2" />
              Browse More Services
            </Button>
          )}
          
          <Button
            onClick={() => navigate('/home')}
            variant="ghost"
            size="lg"
          >
            <Home className="w-5 h-5 mr-2" />
            Go to Home
          </Button>
        </motion.div>
      </div>
    </div>
  )
}

export default ThankYou
