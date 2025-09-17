import React from 'react'
import { useNavigate } from 'react-router-dom'
import Card from '../components/ui/Card'
import Button from '../components/ui/Button'

const PaymentCancelled: React.FC = () => {
  const navigate = useNavigate()
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-12">
      <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8">
        <Card padding="lg">
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white mb-2">Payment not completed</h1>
          <p className="text-gray-600 dark:text-gray-400 mb-6">
            Your Stripe Checkout session was cancelled or could not be completed. You can return to checkout to try again, or go back to services.
          </p>

          <div className="flex items-center gap-3">
            <Button variant="primary" onClick={() => navigate('/checkout')}>Return to Checkout</Button>
            <Button variant="secondary" onClick={() => navigate('/services')}>Back to Services</Button>
          </div>
        </Card>
      </div>
    </div>
  )
}

export default PaymentCancelled


