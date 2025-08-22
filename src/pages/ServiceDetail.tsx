import React from 'react'
import { useParams, Navigate, Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { Clock, Shield, CheckCircle, Plus, Minus, ArrowRight, Star } from 'lucide-react'
import { getServiceBySlug, Service } from '../data/services'
import { useAppDispatch } from '../hooks/useAppDispatch'
import { addItem } from '../store/slices/cartSlice'
import { addToast } from '../store/slices/uiSlice'
import Card from '../components/ui/Card'
import Button from '../components/ui/Button'
import Badge from '../components/ui/Badge'

const ServiceDetail: React.FC = () => {
  const { slug } = useParams<{ slug: string }>()
  const dispatch = useAppDispatch()
  const [extraPages, setExtraPages] = React.useState(0)
  const [includeCourier, setIncludeCourier] = React.useState(false)

  const service = slug ? getServiceBySlug(slug) : null

  if (!service) {
    return <Navigate to="/services" replace />
  }

  const formatPrice = (cents: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(cents / 100)
  }

  const getTotalPrice = () => {
    let total = service.priceCents
    total += extraPages * service.options.extraPagesPriceCents
    if (includeCourier) total += service.options.courierPriceCents
    return total
  }

  const handleAddToCart = () => {
    const cartItem = {
      id: service.id,
      name: service.name,
      priceCents: service.priceCents,
      quantity: 1,
      addOns: {
        extraPages: extraPages > 0 ? extraPages : undefined,
        courier: includeCourier || undefined,
      },
    }

    dispatch(addItem(cartItem))
    dispatch(addToast({
      type: 'success',
      title: 'Added to cart',
      message: `${service.name} has been added to your cart.`,
    }))
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Breadcrumb */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <nav className="text-sm">
            <ol className="flex space-x-2">
              <li><Link to="/" className="text-teal-600 hover:text-teal-700">Home</Link></li>
              <li className="text-gray-400">/</li>
              <li><Link to="/services" className="text-teal-600 hover:text-teal-700">Services</Link></li>
              <li className="text-gray-400">/</li>
              <li className="text-gray-600 dark:text-gray-400">{service.name}</li>
            </ol>
          </nav>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-8">
            {/* Header */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
            >
              <Card>
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
                      {service.name}
                    </h1>
                    <p className="text-lg text-gray-600 dark:text-gray-400">
                      {service.description}
                    </p>
                  </div>
                  <div className="text-right">
                    <div className="text-3xl font-bold text-teal-600">
                      {formatPrice(service.priceCents)}
                    </div>
                    <div className="text-sm text-gray-500">starting price</div>
                  </div>
                </div>

                <div className="flex items-center space-x-6 text-sm text-gray-600 dark:text-gray-400">
                  <div className="flex items-center space-x-1">
                    <Clock className="w-4 h-4" />
                    <span>{service.turnaroundTime}</span>
                  </div>
                  <div className="flex items-center space-x-1">
                    <Shield className="w-4 h-4" />
                    <span>Bank-grade security</span>
                  </div>
                  <div className="flex items-center space-x-1">
                    <Star className="w-4 h-4 text-amber-400" />
                    <span>4.9/5 rating</span>
                  </div>
                </div>
              </Card>
            </motion.div>

            {/* Description */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
            >
              <Card>
                <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-4">
                  Service Description
                </h2>
                <p className="text-gray-700 dark:text-gray-300 leading-relaxed">
                  {service.longDescription}
                </p>
              </Card>
            </motion.div>

            {/* Features */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
            >
              <Card>
                <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-6">
                  What's Included
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {service.features.map((feature, index) => (
                    <div key={index} className="flex items-center space-x-3">
                      <CheckCircle className="w-5 h-5 text-green-500 flex-shrink-0" />
                      <span className="text-gray-700 dark:text-gray-300">{feature}</span>
                    </div>
                  ))}
                </div>
              </Card>
            </motion.div>

            {/* FAQ */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
            >
              <Card>
                <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-6">
                  Frequently Asked Questions
                </h2>
                <div className="space-y-6">
                  {service.faqs.map((faq, index) => (
                    <div key={index}>
                      <h3 className="font-semibold text-gray-900 dark:text-white mb-2">
                        {faq.question}
                      </h3>
                      <p className="text-gray-700 dark:text-gray-300 leading-relaxed">
                        {faq.answer}
                      </p>
                    </div>
                  ))}
                </div>
              </Card>
            </motion.div>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Order Summary */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.2 }}
            >
              <Card className="sticky top-24">
                <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-6">
                  Customize Your Order
                </h3>

                {/* Base Service */}
                <div className="flex items-center justify-between mb-6 pb-4 border-b border-gray-200 dark:border-gray-700">
                  <div>
                    <div className="font-medium text-gray-900 dark:text-white">
                      {service.name}
                    </div>
                    <div className="text-sm text-gray-600 dark:text-gray-400">
                      Base service
                    </div>
                  </div>
                  <div className="font-semibold text-gray-900 dark:text-white">
                    {formatPrice(service.priceCents)}
                  </div>
                </div>

                {/* Add-ons */}
                <div className="space-y-6 mb-6">
                  <h4 className="font-medium text-gray-900 dark:text-white">Add-ons</h4>
                  
                  {/* Extra Pages */}
                  <div>
                    <div className="flex items-center justify-between mb-3">
                      <label className="text-sm text-gray-700 dark:text-gray-300">
                        Extra pages ({formatPrice(service.options.extraPagesPriceCents)} each)
                      </label>
                    </div>
                    <div className="flex items-center space-x-3">
                      <button
                        onClick={() => setExtraPages(Math.max(0, extraPages - 1))}
                        className="w-8 h-8 flex items-center justify-center rounded border border-gray-300 dark:border-gray-600 text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                      >
                        <Minus size={16} />
                      </button>
                      <span className="w-8 text-center text-sm font-medium text-gray-900 dark:text-white">
                        {extraPages}
                      </span>
                      <button
                        onClick={() => setExtraPages(extraPages + 1)}
                        className="w-8 h-8 flex items-center justify-center rounded border border-gray-300 dark:border-gray-600 text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                      >
                        <Plus size={16} />
                      </button>
                    </div>
                  </div>

                  {/* Courier */}
                  <div>
                    <label className="flex items-center space-x-3 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={includeCourier}
                        onChange={(e) => setIncludeCourier(e.target.checked)}
                        className="rounded border-gray-300 dark:border-gray-600 text-teal-600 focus:ring-teal-500"
                      />
                      <span className="text-sm text-gray-700 dark:text-gray-300">
                        Courier delivery ({formatPrice(service.options.courierPriceCents)})
                      </span>
                    </label>
                  </div>
                </div>

                {/* Total */}
                <div className="border-t border-gray-200 dark:border-gray-700 pt-4 mb-6">
                  <div className="flex items-center justify-between">
                    <span className="text-lg font-semibold text-gray-900 dark:text-white">
                      Total:
                    </span>
                    <span className="text-2xl font-bold text-teal-600">
                      {formatPrice(getTotalPrice())}
                    </span>
                  </div>
                </div>

                {/* Actions */}
                <div className="space-y-3">
                  <Button
                    onClick={handleAddToCart}
                    variant="primary"
                    className="w-full"
                    size="lg"
                  >
                    <Plus className="w-4 h-4 mr-2" />
                    Add to Cart
                  </Button>
                  
                  <Link to="/services">
                    <Button variant="ghost" className="w-full">
                      Browse Other Services
                      <ArrowRight className="w-4 h-4 ml-2" />
                    </Button>
                  </Link>
                </div>

                {/* Trust Badges */}
                <div className="mt-6 pt-4 border-t border-gray-200 dark:border-gray-700">
                  <div className="flex items-center justify-center space-x-4 text-xs text-gray-600 dark:text-gray-400">
                    <div className="flex items-center space-x-1">
                      <Shield className="w-3 h-3" />
                      <span>Secure</span>
                    </div>
                    <div className="flex items-center space-x-1">
                      <Clock className="w-3 h-3" />
                      <span>Fast</span>
                    </div>
                    <div className="flex items-center space-x-1">
                      <CheckCircle className="w-3 h-3" />
                      <span>Licensed</span>
                    </div>
                  </div>
                </div>
              </Card>
            </motion.div>

            {/* Contact Card */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.4 }}
            >
              <Card>
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                  Need Help?
                </h3>
                <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
                  Our support team is available 24/7 to help with any questions about our services.
                </p>
                <div className="space-y-2">
                  <Link to="/contact">
                    <Button variant="secondary" className="w-full" size="sm">
                      Contact Support
                    </Button>
                  </Link>
                  <Button variant="ghost" className="w-full" size="sm">
                    Schedule a Call
                  </Button>
                </div>
              </Card>
            </motion.div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default ServiceDetail