import React from 'react'
import { motion } from 'framer-motion'
import { useSearchParams, Link } from 'react-router-dom'
import { CheckCircle, Shield, Upload, Calendar, Copy, ExternalLink, Phone } from 'lucide-react'
import { useAppSelector } from '../hooks/useAppSelector'
import Button from '../components/ui/Button'
import Card from '../components/ui/Card'
import Badge from '../components/ui/Badge'

const ThankYou: React.FC = () => {
  const [searchParams] = useSearchParams()
  const orderId = searchParams.get('order')
  const currentOrder = useAppSelector(state => state.order.currentOrder)

  const [copiedOrderId, setCopiedOrderId] = React.useState(false)
  const [copiedEmail, setCopiedEmail] = React.useState(false)

  const formatPrice = (cents: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(cents / 100)
  }

  const copyToClipboard = (text: string, type: 'orderId' | 'email') => {
    navigator.clipboard.writeText(text)
    if (type === 'orderId') {
      setCopiedOrderId(true)
      setTimeout(() => setCopiedOrderId(false), 2000)
    } else {
      setCopiedEmail(true)
      setTimeout(() => setCopiedEmail(false), 2000)
    }
  }

  const submissionEmail = 'documents@notarette.com'

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-12">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Success Header */}
        <motion.div
          initial={{ opacity: 0, y: 20, scale: 0.95 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          transition={{ duration: 0.6 }}
          className="text-center mb-8"
        >
          <div className="w-20 h-20 bg-green-100 dark:bg-green-900 rounded-full flex items-center justify-center mx-auto mb-4">
            <CheckCircle className="w-12 h-12 text-green-600" />
          </div>
          <h1 className="text-3xl lg:text-4xl font-bold text-gray-900 dark:text-white mb-2">
            Payment Successful!
          </h1>
          <p className="text-lg text-gray-600 dark:text-gray-300">
            Thank you for choosing Notarette Express. Your order has been processed.
          </p>
        </motion.div>

        {/* Order Summary */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="mb-8"
        >
          <Card>
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
                Order Confirmation
              </h2>
              <Badge variant="success">Paid</Badge>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Order ID
                </label>
                <div className="flex items-center space-x-2">
                  <code className="flex-1 px-3 py-2 bg-gray-100 dark:bg-gray-800 rounded text-sm font-mono text-gray-900 dark:text-white">
                    {orderId || currentOrder?.id}
                  </code>
                  <button
                    onClick={() => copyToClipboard(orderId || currentOrder?.id || '', 'orderId')}
                    className="p-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
                    title="Copy Order ID"
                  >
                    <Copy size={16} />
                  </button>
                </div>
                {copiedOrderId && (
                  <p className="text-sm text-green-600 mt-1">Order ID copied!</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Total Paid
                </label>
                <div className="text-2xl font-bold text-teal-600">
                  {formatPrice(currentOrder?.amountCents || 0)}
                </div>
              </div>
            </div>

            {currentOrder && (
              <div>
                <h3 className="font-medium text-gray-900 dark:text-white mb-3">Services Ordered:</h3>
                <div className="space-y-2">
                  {currentOrder.items.map((item, index) => (
                    <div key={index} className="flex justify-between items-center">
                      <span className="text-gray-700 dark:text-gray-300">
                        {item.name} × {item.quantity}
                      </span>
                      <span className="font-medium text-gray-900 dark:text-white">
                        {formatPrice(item.priceCents * item.quantity)}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </Card>
        </motion.div>

        {/* Next Steps */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.4 }}
          className="mb-8"
        >
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6 text-center">
            What Happens Next
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Step 1: Identity Verification */}
            <Card hover>
              <div className="text-center">
                <div className="w-12 h-12 bg-blue-100 dark:bg-blue-900 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Shield className="w-6 h-6 text-blue-600" />
                </div>
                <h3 className="font-semibold text-gray-900 dark:text-white mb-2">
                  Step 1: Verify Identity
                </h3>
                <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
                  Complete secure identity verification using our trusted partner.
                </p>
                {currentOrder?.kycLink ? (
                  <Button
                    variant="primary"
                    size="sm"
                    className="w-full"
                    onClick={() => window.open(currentOrder.kycLink, '_blank')}
                  >
                    Start Verification
                    <ExternalLink className="w-4 h-4 ml-1" />
                  </Button>
                ) : (
                  <Button variant="secondary" size="sm" className="w-full" disabled>
                    Link will be sent via email
                  </Button>
                )}
              </div>
            </Card>

            {/* Step 2: Upload Documents */}
            <Card hover>
              <div className="text-center">
                <div className="w-12 h-12 bg-teal-100 dark:bg-teal-900 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Upload className="w-6 h-6 text-teal-600" />
                </div>
                <h3 className="font-semibold text-gray-900 dark:text-white mb-2">
                  Step 2: Send Signed Documents
                </h3>
                <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
                  Upload your signed documents or email them to us securely.
                </p>
                <div className="space-y-2">
                  <Link to="/portal">
                    <Button variant="primary" size="sm" className="w-full">
                      Upload Documents
                    </Button>
                  </Link>
                  <div className="text-xs text-gray-500 dark:text-gray-400">
                    or email to:
                  </div>
                  <div className="flex items-center space-x-2">
                    <code className="flex-1 px-2 py-1 bg-gray-100 dark:bg-gray-800 rounded text-xs text-gray-900 dark:text-white">
                      {submissionEmail}
                    </code>
                    <button
                      onClick={() => copyToClipboard(submissionEmail, 'email')}
                      className="p-1 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
                      title="Copy email address"
                    >
                      <Copy size={12} />
                    </button>
                  </div>
                  {copiedEmail && (
                    <p className="text-xs text-green-600">Email copied!</p>
                  )}
                </div>
              </div>
            </Card>

            {/* Step 3: Book Appointment */}
            <Card hover>
              <div className="text-center">
                <div className="w-12 h-12 bg-amber-100 dark:bg-amber-900 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Calendar className="w-6 h-6 text-amber-600" />
                </div>
                <h3 className="font-semibold text-gray-900 dark:text-white mb-2">
                  Step 3: Book Your Appointment
                </h3>
                <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
                  Schedule your remote notarization session with our licensed notary.
                </p>
                <div className="space-y-2">
                  <Button 
                    variant="primary" 
                    size="sm" 
                    className="w-full"
                    onClick={() => window.open('https://cal.com/notarette/remote-notarization', '_blank')}
                  >
                    Book Appointment
                    <ExternalLink className="w-4 h-4 ml-1" />
                  </Button>
                  <Link to="/portal">
                    <Button variant="ghost" size="sm" className="w-full">
                      Track Progress
                    </Button>
                  </Link>
                </div>
              </div>
            </Card>
          </div>
        </motion.div>

        {/* Process Timeline */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.6 }}
          className="mb-8"
        >
          <Card>
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
              Expected Timeline
            </h3>
            <div className="space-y-3">
              <div className="flex items-center space-x-3">
                <div className="w-8 h-8 bg-green-100 dark:bg-green-900 rounded-full flex items-center justify-center flex-shrink-0">
                  <CheckCircle className="w-4 h-4 text-green-600" />
                </div>
                <div>
                  <div className="font-medium text-gray-900 dark:text-white">Payment Completed</div>
                  <div className="text-sm text-gray-600 dark:text-gray-400">Just now</div>
                </div>
              </div>
              <div className="flex items-center space-x-3">
                <div className="w-8 h-8 bg-blue-100 dark:bg-blue-900 rounded-full flex items-center justify-center flex-shrink-0">
                  <span className="text-xs font-bold text-blue-600">2</span>
                </div>
                <div>
                  <div className="font-medium text-gray-900 dark:text-white">Identity Verification</div>
                  <div className="text-sm text-gray-600 dark:text-gray-400">Complete within 24 hours</div>
                </div>
              </div>
              <div className="flex items-center space-x-3">
                <div className="w-8 h-8 bg-gray-100 dark:bg-gray-700 rounded-full flex items-center justify-center flex-shrink-0">
                  <span className="text-xs font-bold text-gray-600">3</span>
                </div>
                <div>
                  <div className="font-medium text-gray-900 dark:text-white">Book Appointment</div>
                  <div className="text-sm text-gray-600 dark:text-gray-400">Schedule your remote notarization session</div>
                </div>
              </div>
              <div className="flex items-center space-x-3">
                <div className="w-8 h-8 bg-gray-100 dark:bg-gray-700 rounded-full flex items-center justify-center flex-shrink-0">
                  <span className="text-xs font-bold text-gray-600">4</span>
                </div>
                <div>
                  <div className="font-medium text-gray-900 dark:text-white">Remote Notarization</div>
                  <div className="text-sm text-gray-600 dark:text-gray-400">Complete your notarization via video call</div>
                </div>
              </div>
              <div className="flex items-center space-x-3">
                <div className="w-8 h-8 bg-gray-100 dark:bg-gray-700 rounded-full flex items-center justify-center flex-shrink-0">
                  <span className="text-xs font-bold text-gray-600">5</span>
                </div>
                <div>
                  <div className="font-medium text-gray-900 dark:text-white">Delivery</div>
                  <div className="text-sm text-gray-600 dark:text-gray-400">
                    {currentOrder?.deliveryMethod === 'courier' ? 'Courier delivery within 1-2 days' : 'Email delivery immediately after completion'}
                  </div>
                </div>
              </div>
            </div>
          </Card>
        </motion.div>

        {/* Support Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.8 }}
        >
          <Card>
            <div className="text-center">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                Need Help?
              </h3>
              <p className="text-gray-600 dark:text-gray-400 mb-6">
                Our support team is available 24/7 to assist you throughout the process.
              </p>
              <div className="flex flex-col sm:flex-row space-y-3 sm:space-y-0 sm:space-x-4 justify-center">
                <Button variant="secondary">
                  <Phone className="w-4 h-4 mr-2" />
                  1-800-NOTARY-24
                </Button>
                <Link to="/contact">
                  <Button variant="ghost">
                    Contact Support
                  </Button>
                </Link>
                <Link to="/portal">
                  <Button variant="primary">
                    Go to Portal
                  </Button>
                </Link>
              </div>
            </div>
          </Card>
        </motion.div>
      </div>
    </div>
  )
}

export default ThankYou