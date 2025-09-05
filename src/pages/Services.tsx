import React, { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
 
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
  const [submittedForSlug, setSubmittedForSlug] = useState<string | null>(() => {
    return localStorage.getItem('intake_form_submitted_for') || null
  })
  
  // Detect Google Form return (?status=submitted) and store flag for the pending service only
  useEffect(() => {
    if (searchParams.get('status') === 'submitted') {
      const pending = localStorage.getItem('intake_form_pending')
      const submitted = localStorage.getItem('intake_form_submitted_for')
      const slug = pending || submitted
      if (slug) {
        if (pending) {
          localStorage.setItem('intake_form_submitted_for', pending)
          localStorage.removeItem('intake_form_pending')
        }
        setSubmittedForSlug(slug)
        // Redirect directly to the Document Type page for the submitted service
        navigate(`/services/${slug}/document-type`, { replace: true })
        return
      }
      // Fallback: if no slug found at all, just normalize URL
      navigate('/services', { replace: true })
    }
  }, [searchParams, navigate])
  
  

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

        {/* Search and Filters removed */}

        {/* Services Cards - simplified style */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {displayCards.map((card, index) => (
            <motion.div
              key={card.slug}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: 0.05 * index }}
              className="relative overflow-hidden bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-200 dark:border-gray-700 p-6 text-center"
            >
              {card.badge && (
                <div className="absolute -left-12 top-4 w-40 -rotate-45">
                  <span className="block bg-red-500 text-white text-xs font-semibold text-center py-1 shadow-md">
                    {card.badge}
                  </span>
                </div>
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
                  navigate(`/services/${card.slug}/start`)
                }}
                className={`w-full inline-flex items-center justify-center px-4 py-2 rounded-lg ${index===1 ? 'bg-red-500 hover:bg-red-600' : 'bg-blue-600 hover:bg-blue-700'} text-white font-medium transition-colors`}
              >
                {card.slug === 'other-documents' ? 'Start Other Service' : 'Start Service'}
                <span className="ml-2">→</span>
              </button>
            </motion.div>
          ))}
        </div>

        {/* No empty-state since filtering/search removed */}
      </div>
    </div>
  )
}

export default Services