import React, { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import { Search, Filter, Loader2 } from 'lucide-react'
import ServiceCard from '../components/services/ServiceCard'
import { services } from '../data/services'
import { stripeService, StripePrice } from '../services/stripeService'
import { addToast } from '../store/slices/uiSlice'
import { useAppDispatch } from '../hooks/useAppDispatch'

const Services: React.FC = () => {
  const dispatch = useAppDispatch()
  const [searchTerm, setSearchTerm] = useState('')
  const [filteredServices, setFilteredServices] = useState(services)
  const [stripePrices, setStripePrices] = useState<Record<string, StripePrice>>({})
  const [isLoadingPrices, setIsLoadingPrices] = useState(true)

  // Fetch Stripe prices on component mount
  useEffect(() => {
    const fetchPrices = async () => {
      try {
        setIsLoadingPrices(true)
        
        // Collect all Stripe price IDs from services (only those that have them)
        const priceIds = services
          .map(service => service.stripePriceId)
          .filter(id => id && id.trim() !== '' && id.startsWith('price_'))

        if (priceIds.length === 0) {
          console.log('No Stripe price IDs found - all services will use local pricing')
          setIsLoadingPrices(false)
          return
        }

        console.log('Fetching Stripe prices for:', priceIds)

        // Fetch prices from Stripe via Firebase Functions
        const prices = await stripeService.getPrices(priceIds)
        
        // Convert to dictionary for easy lookup
        const pricesDict = prices.reduce((acc, price) => {
          acc[price.priceId] = price
          return acc
        }, {} as Record<string, StripePrice>)
        
        setStripePrices(pricesDict)
        console.log('Stripe prices loaded:', pricesDict)
        
      } catch (error) {
        console.error('Error fetching Stripe prices:', error)
        dispatch(addToast({
          type: 'error',
          title: 'Price Loading Error',
          message: 'Failed to load live prices. Services will use default pricing.',
        }))
      } finally {
        setIsLoadingPrices(false)
      }
    }

    fetchPrices()
  }, [dispatch])

  // Filter services based on search term
  useEffect(() => {
    const filtered = services.filter(service =>
      service.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      service.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
      service.features.some(feature => 
        feature.toLowerCase().includes(searchTerm.toLowerCase())
      )
    )
    setFilteredServices(filtered)
  }, [searchTerm])

  // Get Stripe price for a service
  const getStripePrice = (service: any) => {
    return stripePrices[service.stripePriceId] || null
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="text-center mb-12"
        >
          <h1 className="text-4xl lg:text-5xl font-bold text-gray-900 dark:text-white mb-4">
            Our Notarization Services
          </h1>
          <p className="text-xl text-gray-600 dark:text-gray-300 max-w-3xl mx-auto">
            Professional remote notarization services available 24/7. 
            All services are backed by licensed notary publics and bank-grade security.
          </p>
          
          {/* Price Loading Status */}
          {isLoadingPrices && (
            <div className="flex items-center justify-center space-x-2 mt-4 text-sm text-gray-600 dark:text-gray-400">
              <Loader2 className="w-4 h-4 animate-spin" />
              <span>Loading live prices from Stripe...</span>
            </div>
          )}
          
          {!isLoadingPrices && (
            <div className="mt-4 text-sm text-center">
              {Object.keys(stripePrices).length > 0 ? (
                <div className="text-green-600 dark:text-green-400">
                  ✓ Live Stripe prices loaded for {Object.keys(stripePrices).length} service(s)
                  <br />
                  <span className="text-gray-500 dark:text-gray-400">
                    Services with Stripe links show live prices, others use local pricing
                  </span>
                </div>
              ) : (
                <div className="text-gray-600 dark:text-gray-400">
                  All services use local pricing - Stripe prices will load when payment links are added
                </div>
              )}
            </div>
          )}
        </motion.div>

        {/* Search and Filters */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="mb-8"
        >
          <div className="flex flex-col md:flex-row space-y-4 md:space-y-0 md:space-x-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input
                type="text"
                placeholder="Search services..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:ring-2 focus:ring-teal-500 focus:border-transparent"
              />
            </div>
            <button className="flex items-center space-x-2 px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors">
              <Filter className="w-5 h-5" />
              <span>Filters</span>
            </button>
          </div>
        </motion.div>

        {/* Services Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 items-start services-grid" style={{ alignItems: 'start' }}>
          {filteredServices.map((service, index) => (
            <motion.div
              key={service.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.1 * index }}
              className="h-fit w-full service-card"
              style={{ alignSelf: 'start' }}
            >
              <ServiceCard 
                service={service} 
                stripePrice={getStripePrice(service)}
              />
            </motion.div>
          ))}
        </div>

        {filteredServices.length === 0 && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-center py-16"
          >
            <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
              No services found
            </h3>
            <p className="text-gray-600 dark:text-gray-400">
              Try adjusting your search terms or clear the search to see all services.
            </p>
          </motion.div>
        )}

        {/* Bottom CTA */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.8 }}
          className="text-center mt-16 p-8 bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700"
        >
          <h3 className="text-2xl font-semibold text-gray-900 dark:text-white mb-4">
            Need a Custom Solution?
          </h3>
          <p className="text-gray-600 dark:text-gray-300 mb-6 max-w-2xl mx-auto">
            Have specific notarization needs that don't fit our standard services? 
            Our team can create a custom solution for your business or personal requirements.
          </p>
          <div className="flex flex-col sm:flex-row space-y-4 sm:space-y-0 sm:space-x-4 justify-center">
            <button className="px-6 py-3 bg-teal-600 text-white font-medium rounded-lg hover:bg-teal-700 transition-colors">
              Contact Our Team
            </button>
            <button className="px-6 py-3 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 font-medium rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors">
              Schedule a Call
            </button>
          </div>
        </motion.div>
      </div>
    </div>
  )
}

export default Services