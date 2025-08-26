import React, { useEffect, useState, useMemo, useCallback } from 'react'
import { motion } from 'framer-motion'
import { Search, Filter, X, DollarSign, Clock, Globe, FileText } from 'lucide-react'
import { services } from '../data/services'
import {
  FaFileAlt,
  FaUserCheck,
  FaBuilding,
  FaLanguage,
  FaFileContract,
  FaIdCard,
  FaCertificate,
  FaStamp,
  FaShieldAlt
} from 'react-icons/fa'
// import { useAppDispatch } from '../hooks/useAppDispatch'
import { useNavigate, useSearchParams } from 'react-router-dom'

const Services: React.FC = () => {
  // const dispatch = useAppDispatch()
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const [searchTerm, setSearchTerm] = useState('')
  const [filteredServices, setFilteredServices] = useState(services)
  const [submittedForSlug, setSubmittedForSlug] = useState<string | null>(() => {
    return localStorage.getItem('intake_form_submitted_for') || null
  })
  
  // Detect Google Form return (?status=submitted) and store flag for the pending service only
  useEffect(() => {
    if (searchParams.get('status') === 'submitted') {
      const pending = localStorage.getItem('intake_form_pending')
      if (pending) {
        localStorage.setItem('intake_form_submitted_for', pending)
        localStorage.removeItem('intake_form_pending')
        setSubmittedForSlug(pending)
      }
      navigate('/services', { replace: true })
    }
  }, [searchParams, navigate])
  
  // Filter states
  const [showFilters, setShowFilters] = useState(false)
  const [priceRange, setPriceRange] = useState<[number, number]>([0, 10000]) // in cents
  const [turnaroundTime, setTurnaroundTime] = useState<string>('all')
  const [serviceCategory, setServiceCategory] = useState<string>('all')
  const [currency, setCurrency] = useState<string>('all')

  // Memoize expensive computations
  const uniqueCurrencies = useMemo(() => [...new Set(services.map(service => service.currency))], [])
  // const uniqueTurnaroundTimes = useMemo(() => [...new Set(services.map(service => service.turnaroundTime))], [])
  
  // Memoize active filters count
  const activeFiltersCount = useMemo(() => {
    let count = 0
    if (searchTerm) count++
    if (priceRange[0] > 0 || priceRange[1] < 10000) count++
    if (turnaroundTime !== 'all') count++
    if (serviceCategory !== 'all') count++
    if (currency !== 'all') count++
    return count
  }, [searchTerm, priceRange, turnaroundTime, serviceCategory, currency])

  // Memoize filtered services
  const filteredServicesMemo = useMemo(() => {
    return services.filter(service => {
      const matchesSearch = 
        service.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        service.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
        service.features.some(feature => feature.toLowerCase().includes(searchTerm.toLowerCase()))

      const servicePrice = service.priceCents
      const matchesPrice = servicePrice >= priceRange[0] && servicePrice <= priceRange[1]

      const matchesTurnaround = turnaroundTime === 'all' || 
        (turnaroundTime === 'same-day' && service.turnaroundTime.includes('1-2')) ||
        (turnaroundTime === 'next-day' && service.turnaroundTime.includes('2-4')) ||
        (turnaroundTime === 'week' && service.turnaroundTime.includes('business days'))

      const matchesCategory = serviceCategory === 'all' || 
        (serviceCategory === 'legal' && (service.name.includes('Power of Attorney') || service.name.includes('Contract'))) ||
        (serviceCategory === 'documents' && service.name.includes('Certified Copy')) ||
        (serviceCategory === 'identification' && (service.name.includes('Passport') || service.name.includes('ID'))) ||
        (serviceCategory === 'business' && (service.name.includes('Company') || service.name.includes('Business'))) ||
        (serviceCategory === 'international' && (service.name.includes('Apostille') || service.name.includes('Translation')))

      const matchesCurrency = currency === 'all' || service.currency === currency

      return matchesSearch && matchesPrice && matchesTurnaround && matchesCategory && matchesCurrency
    })
  }, [searchTerm, priceRange, turnaroundTime, serviceCategory, currency])

  // Update filtered services when memoized value changes
  useEffect(() => {
    setFilteredServices(filteredServicesMemo)
  }, [filteredServicesMemo])

  const formatPrice = useCallback((cents: number, currency: string) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: currency,
    }).format(cents / 100)
  }, [])

  const getServiceIcon = (serviceName: string) => {
    const name = serviceName.toLowerCase()

    if (name.includes('power of attorney')) return FaUserCheck
    if (name.includes('certified copy')) return FaFileAlt
    if (name.includes('passport') || name.includes('id')) return FaIdCard
    if (name.includes('company formation') || name.includes('business')) return FaBuilding
    if (name.includes('apostille')) return FaStamp
    if (name.includes('translation')) return FaLanguage
    if (name.includes('real estate')) return FaFileContract
    if (name.includes('estate planning')) return FaCertificate

    return FaShieldAlt
  }

  const clearAllFilters = useCallback(() => {
    setSearchTerm('')
    setPriceRange([0, 10000])
    setTurnaroundTime('all')
    setServiceCategory('all')
    setCurrency('all')
  }, [])

  const toggleFilters = useCallback(() => {
    setShowFilters(prev => !prev)
  }, [])

  // Fixed cards to match design
  const displayCards = [
    {
      title: 'Certified Copy',
      slug: 'certified-copy-document',
      priceLabel: '€29',
      description: 'Get legally certified copies of your important documents with official notary seal.',
      features: ['Official notary seal', 'Digital & physical copies', 'EU-wide recognition'],
      badge: null,
    },
    {
      title: 'Power of Attorney',
      slug: 'power-of-attorney',
      priceLabel: '€89',
      description: 'Create and notarize power of attorney documents for legal representation.',
      features: ['Legal drafting included', 'Multiple jurisdiction support', 'Express processing'],
      badge: 'Most Popular',
    },
    {
      title: 'Signature Verification',
      slug: 'signature-verification',
      priceLabel: '€49',
      description: 'Verify signatures on contracts and legal documents with notarial authentication.',
      features: ['Identity verification', 'Digital signature support', 'Fraud protection'],
      badge: null,
    },
    {
      title: 'Apostille Service',
      slug: 'apostille-services',
      priceLabel: '€119',
      description: 'International document authentication for use in Hague Convention countries.',
      features: ['Hague Convention compliant', 'Express 24h option', 'Worldwide acceptance'],
      badge: null,
    },
    {
      title: 'Other Documents',
      slug: 'other-documents',
      priceLabel: '',
      description: 'If your document type is not listed, select this option to proceed.',
      features: ['Custom assessments', 'Expert guidance', 'Fast turnaround'],
      badge: null,
    },
  ]

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
            Choose Your Notarial Service
          </h1>
          <p className="text-xl text-gray-600 dark:text-gray-300 max-w-3xl mx-auto">
            Professional notarization services tailored to your needs. All services include certified notary review and legal compliance.
          </p>
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
            <button 
              onClick={toggleFilters}
              className="flex items-center space-x-2 px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
            >
              <Filter className="w-5 h-5" />
              <span>Filters</span>
              {activeFiltersCount > 0 && (
                <span className="bg-teal-600 text-white text-xs rounded-full px-2 py-1 min-w-[20px] text-center">
                  {activeFiltersCount}
                </span>
              )}
            </button>
            {activeFiltersCount > 0 && (
              <button 
                onClick={clearAllFilters}
                className="flex items-center space-x-2 px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
              >
                <X className="w-5 h-5" />
                <span>Clear All</span>
              </button>
            )}
          </div>

          {showFilters && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.2 }}
              className="mt-4 p-6 bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700"
            >
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
                    <DollarSign className="w-4 h-4 inline mr-2" />
                    Price Range
                  </label>
                  <div className="space-y-2">
                    <div className="flex justify-between text-xs text-gray-500">
                      <span>{formatPrice(priceRange[0], 'INR')}</span>
                      <span>{formatPrice(priceRange[1], 'INR')}</span>
                    </div>
                    <input
                      type="range"
                      min="0"
                      max="10000"
                      step="500"
                      value={priceRange[1]}
                      onChange={(e) => setPriceRange([priceRange[0], parseInt(e.target.value)])}
                      className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer slider"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
                    <Clock className="w-4 h-4 inline mr-2" />
                    Turnaround Time
                  </label>
                  <select
                    value={turnaroundTime}
                    onChange={(e) => setTurnaroundTime(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-teal-500 focus:border-transparent"
                  >
                    <option value="all">All Times</option>
                    <option value="same-day">Same Day (1-2 hours)</option>
                    <option value="next-day">Next Day (2-4 hours)</option>
                    <option value="week">Within Week</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
                    <FileText className="w-4 h-4 inline mr-2" />
                    Service Category
                  </label>
                  <select
                    value={serviceCategory}
                    onChange={(e) => setServiceCategory(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-teal-500 focus:border-transparent"
                  >
                    <option value="all">All Categories</option>
                    <option value="legal">Legal Documents</option>
                    <option value="documents">Document Certification</option>
                    <option value="identification">ID & Passport</option>
                    <option value="business">Business Services</option>
                    <option value="international">International</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
                    <Globe className="w-4 h-4 inline mr-2" />
                    Currency
                  </label>
                  <select
                    value={currency}
                    onChange={(e) => setCurrency(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-teal-500 focus:border-transparent"
                  >
                    <option value="all">All Currencies</option>
                    {uniqueCurrencies.map(curr => (
                      <option key={curr} value={curr}>{curr}</option>
                    ))}
                  </select>
                </div>
              </div>
            </motion.div>
          )}
        </motion.div>

        {/* Services Cards - simplified style */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {displayCards.map((card, index) => (
            <motion.div
              key={card.slug}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: 0.05 * index }}
              className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-200 dark:border-gray-700 p-6 text-center"
            >
              {card.badge && (
                <div className="inline-block text-xs font-semibold px-2 py-1 rounded-full bg-red-100 text-red-600 mb-3">{card.badge}</div>
              )}
              <div className="w-20 h-20 mx-auto mb-4 rounded-full bg-gradient-to-br from-teal-500 to-blue-600 text-white flex items-center justify-center shadow-lg">
                {React.createElement(getServiceIcon(card.title), { size: 36 })}
              </div>
              <h3 className="font-semibold text-gray-900 dark:text-white mb-2">{card.title}</h3>
              <p className="text-gray-600 dark:text-gray-400 text-sm mb-4 min-h-[40px]">{card.description}</p>
              {card.priceLabel && (
                <div className="text-2xl font-bold text-gray-900 dark:text-white mb-1">
                  {card.priceLabel}
                </div>
              )}
              {card.priceLabel && <p className="text-xs text-gray-500 mb-4">starting from</p>}
              <ul className="text-sm text-left mx-auto max-w-[260px] space-y-2 text-gray-600 dark:text-gray-400 mb-6 list-disc list-inside">
                {card.features.map((f, i) => (
                  <li key={i}>{f}</li>
                ))}
              </ul>
              <button
                onClick={() => {
                  if (submittedForSlug === card.slug) {
                    navigate(`/services/${card.slug}/document-type`)
                  } else {
                    localStorage.setItem('intake_form_pending', card.slug)
                    window.open('https://forms.gle/3ZN3BcZXqpiLR8Kx6', '_blank', 'noopener,noreferrer')
                  }
                }}
                className={`w-full inline-flex items-center justify-center px-4 py-2 rounded-lg ${index===1 ? 'bg-red-500 hover:bg-red-600' : 'bg-blue-600 hover:bg-blue-700'} text-white font-medium transition-colors`}
              >
                {card.slug === 'other-documents' ? 'Start Other Service' : 'Start Service'}
                <span className="ml-2">→</span>
              </button>
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
      </div>
    </div>
  )
}

export default Services