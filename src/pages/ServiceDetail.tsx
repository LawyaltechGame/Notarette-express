import React from 'react'
import { useParams, Navigate, Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { Clock, Shield, CheckCircle, ArrowRight, Star } from 'lucide-react'
import { getServiceBySlug } from '../data/services'
import Card from '../components/ui/Card'
import Button from '../components/ui/Button'

const ServiceDetail: React.FC = () => {
  const { slug } = useParams<{ slug: string }>()

  const service = slug ? getServiceBySlug(slug) : null

  if (!service) {
    return <Navigate to="/services" replace />
  }

  const formatPrice = (cents: number, currency: string) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: currency,
    }).format(cents / 100)
  }

  const getDisplayPrice = () => {
    return service.priceCents / 100 // Convert cents to main unit
  }

  const getDisplayCurrency = () => {
    return service.currency
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
                      {formatPrice(getDisplayPrice() * 100, getDisplayCurrency())}
                    </div>
                    <div className="text-sm text-gray-500">
                      Base Price
                    </div>
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

          {/* Sidebar (simplified) */}
          <div className="space-y-6">
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.2 }}
            >
              <Card className="sticky top-24">
                <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
                  Next Steps
                </h3>
                <p className="text-sm text-gray-600 dark:text-gray-400 mb-6">
                  Start the service configuration to choose document type, notarization options, and add-ons.
                </p>
                <Link to={`/services/${service.slug}/document-type`}>
                  <Button variant="primary" className="w-full">
                    Continue
                    <ArrowRight className="w-4 h-4 ml-2" />
                  </Button>
                </Link>
                <Link to="/services">
                  <Button variant="ghost" className="w-full mt-2">
                    Browse Other Services
                    <ArrowRight className="w-4 h-4 ml-2" />
                  </Button>
                </Link>
              </Card>
            </motion.div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default ServiceDetail