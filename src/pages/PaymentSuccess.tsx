import React, { useEffect, useState } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { CheckCircle } from 'lucide-react'
import { useAppDispatch } from '../hooks/useAppDispatch'
import { addToast } from '../store/slices/uiSlice'
import { bookAppointment, createCalEvent, CAL_MEETING_LINK } from '../services/appointmentService'
import Button from '../components/ui/Button'
import Card from '../components/ui/Card'
import PageBackground from '../components/layout/PageBackground'

const PaymentSuccess: React.FC = () => {
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const dispatch = useAppDispatch()
  const [isProcessing, setIsProcessing] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const processPaymentSuccess = async () => {
      try {
        // Get checkout data from localStorage
        const checkoutDataStr = localStorage.getItem('notarette_checkout_data')
        if (!checkoutDataStr) {
          setError('Checkout data not found. Please contact support.')
          setIsProcessing(false)
          return
        }

        const checkoutData = JSON.parse(checkoutDataStr)
        const { customerInfo } = checkoutData

        // Check if payment was successful (you can add more validation here)
        const sessionId = searchParams.get('session_id')
        if (!sessionId) {
          setError('Payment session not found. Please contact support.')
          setIsProcessing(false)
          return
        }

        // Book appointment
        const appointmentData = {
          customerName: `${customerInfo.firstName} ${customerInfo.lastName}`,
          customerEmail: customerInfo.email,
          customerPhone: customerInfo.phone,
          customerAddress: `${customerInfo.address}, ${customerInfo.city}, ${customerInfo.state} ${customerInfo.zipCode}`,
          serviceIds: [],
          paymentSessionId: sessionId,
          totalAmount: 0,
          meetingLink: CAL_MEETING_LINK,
        }

        // Process the appointment booking
        await bookAppointment(appointmentData)
        await createCalEvent(appointmentData)

        // Clear checkout data from localStorage
        localStorage.removeItem('notarette_checkout_data')

        dispatch(addToast({
          type: 'success',
          title: 'Payment Successful!',
          message: 'Your appointment has been booked successfully.',
        }))

        // Store the order data for the Thank You page
        const orderData = {
          customerInfo,
          cartItems: [],
          cartTotal: 0,
          sessionId,
          appointmentData
        }
        localStorage.setItem('notarette_order_data', JSON.stringify(orderData))

        // Redirect to Thank You page
        navigate('/thank-you')

      } catch (error: any) {
        console.error('Error processing payment success:', error)
        setError(error.message || 'Failed to process payment success. Please contact support.')
      } finally {
        setIsProcessing(false)
      }
    }

    processPaymentSuccess()
  }, [dispatch, searchParams, navigate])

  if (isProcessing) {
    return (
      <PageBackground>
        <div className="flex items-center justify-center min-h-screen">
          <div className="text-center">
            <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-primary-600 mx-auto mb-4"></div>
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
            Processing Your Payment
          </h2>
          <p className="text-gray-600 dark:text-gray-400">
            Please wait while we confirm your payment and book your appointment...
          </p>
          </div>
        </div>
      </PageBackground>
    )
  }

  if (error) {
    return (
      <PageBackground>
        <div className="py-12">
          <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8">
          <Card>
            <div className="text-center py-12">
              <div className="mx-auto w-16 h-16 bg-red-100 dark:bg-red-900 rounded-full flex items-center justify-center mb-4">
                <CheckCircle className="w-8 h-8 text-red-600 dark:text-red-400" />
              </div>
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
                Payment Processing Error
              </h2>
              <p className="text-gray-600 dark:text-gray-400 mb-6">
                {error}
              </p>
              <div className="space-y-3">
                <Button onClick={() => navigate('/services')} variant="primary">
                  Return to Services
                </Button>
                <Button onClick={() => navigate('/checkout')} variant="ghost">
                  Try Checkout Again
                </Button>
              </div>
            </div>
          </Card>
          </div>
        </div>
      </PageBackground>
    )
  }

  return null
}

export default PaymentSuccess
