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
import { useNavigate, useSearchParams } from 'react-router-dom'

const Services: React.FC = () => {
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const [submittedForSlug, setSubmittedForSlug] = useState<string | null>(() => {
    return localStorage.getItem('intake_form_submitted_for') || null
  })

  // Detect Google Form return (?status=submitted) and store flag for the pending service only
  useEffect(() => {
    const status = searchParams.get('status')
    if (status !== 'submitted') return

    const pending = localStorage.getItem('intake_form_pending')
    const submitted = localStorage.getItem('intake_form_submitted_for')
    const slug = pending || submitted

    if (slug) {
      // normalize storage: if there was a pending slug, persist it as submitted_for and clear pending
      if (pending) {
        localStorage.setItem('intake_form_submitted_for', pending)
        localStorage.removeItem('intake_form_pending')
      }
      setSubmittedForSlug(slug)
      // Redirect directly to the Document Type page for the submitted service
      navigate(`/services/${slug}/document-type`, { replace: true })
    } else {
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
      priceLabel: '€1',
      description: 'Get legally certified copies of your important documents with official notary seal.',
      features: ['Official notary seal', 'Digital & physical copies', 'EU-wide recognition'],
      badge: null,
    },
    {
      title: 'Power of Attorney',
      slug: 'power-of-attorney',
      priceLabel: '€1',
      description: 'Create and notarize power of attorney documents for legal representation.',
      features: ['Legal drafting included', 'Multiple jurisdiction support', 'Express processing'],
      badge: 'Most Popular',
    },
    {
      title: 'Signature Verification',
      slug: 'signature-verification',
      priceLabel: '€1',
      description: 'Verify signatures on contracts and legal documents with notarial authentication.',
      features: ['Identity verification', 'Digital signature support', 'Fraud protection'],
      badge: null,
    },
    {
      title: 'Apostille Service',
      slug: 'apostille-services',
      priceLabel: '€1',
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
    <div className="relative min-h-screen">
      {/* Modern gradient background with mesh pattern */}
      <div className="absolute inset-0 bg-gradient-to-br from-slate-50 via-blue-50/30 to-indigo-50/50 dark:from-slate-900 dark:via-slate-800/50 dark:to-indigo-950/30">
        <div
          className="absolute inset-0 opacity-40"
          style={{
            backgroundImage:
              "url('data:image/svg+xml,%3Csvg width=\'60\' height=\'60\' viewBox=\'0 0 60 60\' xmlns=\'http://www.w3.org/2000/svg\'%3E%3Cg fill=\'none\' fill-rule=\'evenodd\'%3E%3Cg fill=\'%236366f1\' fill-opacity=\'0.03\'%3E%3Cpath d=\'M30 30c0-16.569 13.431-30 30-30v30H30zm30 30c-16.569 0-30-13.431-30-30h30v30z\'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E')",
            backgroundRepeat: 'repeat',
          }}
        ></div>
      </div>

      {/* Floating geometric elements */}
      <div className="absolute top-20 left-10 w-32 h-32 bg-gradient-to-br from-blue-400/10 to-purple-500/10 rounded-full blur-xl"></div>
      <div className="absolute top-40 right-20 w-40 h-40 bg-gradient-to-br from-indigo-400/10 to-blue-500/10 rounded-full blur-xl"></div>
      <div className="absolute bottom-20 left-1/4 w-28 h-28 bg-gradient-to-br from-teal-400/10 to-cyan-500/10 rounded-full blur-xl"></div>

      <div className="relative z-10">
        {/* Modern hero section with enhanced typography */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-20 pb-16">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, ease: 'easeOut' }}
            className="text-center mb-20"
          >
            {/* Badge */}
            <motion.div
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="inline-flex items-center px-4 py-2 rounded-full bg-gradient-to-r from-blue-100 to-indigo-100 dark:from-blue-900/30 dark:to-indigo-900/30 border border-blue-200 dark:border-blue-800 mb-6"
            >
              <span className="w-2 h-2 bg-blue-500 rounded-full mr-2 animate-pulse" />
              <span className="text-sm font-medium text-blue-700 dark:text-blue-300">
                Professional Notarial Services
              </span>
            </motion.div>

            {/* Main heading with improved typography */}
            <h1 className="text-5xl md:text-6xl lg:text-7xl font-bold bg-gradient-to-r from-gray-900 via-blue-900 to-indigo-900 dark:from-white dark:via-blue-100 dark:to-indigo-100 bg-clip-text text-transparent mb-6 leading-tight tracking-tight">
              <span>Choose Your</span>
              <br />
              <span className="bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
                Notarial Service
              </span>
            </h1>

            {/* Enhanced description */}
            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.4 }}
              className="text-xl md:text-2xl text-gray-600 dark:text-gray-300 max-w-4xl mx-auto leading-relaxed font-light"
            >
              Professional notarization services tailored to your needs.{' '}
              <span className="font-medium text-gray-800 dark:text-gray-200">
                All services include certified notary review and legal compliance.
              </span>
            </motion.p>

            {/* Trust indicators */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.6 }}
              className="flex flex-wrap justify-center items-center gap-8 mt-12 text-sm text-gray-500 dark:text-gray-400"
            >
              <div className="flex items-center space-x-2">
                <div className="w-2 h-2 bg-green-500 rounded-full" />
                <span>EU Compliant</span>
              </div>
              <div className="flex items-center space-x-2">
                <div className="w-2 h-2 bg-blue-500 rounded-full" />
                <span>Secure Processing</span>
              </div>
              <div className="flex items-center space-x-2">
                <div className="w-2 h-2 bg-purple-500 rounded-full" />
                <span>24/7 Support</span>
              </div>
              <div className="flex items-center space-x-2">
                <div className="w-2 h-2 bg-orange-500 rounded-full" />
                <span>Express Options</span>
              </div>
            </motion.div>
          </motion.div>

          {/* Services section with enhanced container */}
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.3 }}
            className="relative"
          >
            {/* Section header */}
            <div className="text-center mb-12">
              <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">Our Services</h2>
              <div className="w-24 h-1 bg-gradient-to-r from-blue-500 to-indigo-500 mx-auto rounded-full" />
            </div>

            {/* Enhanced services grid container */}
            <div className="relative bg-white/70 dark:bg-gray-800/70 backdrop-blur-xl rounded-3xl border border-white/20 dark:border-gray-700/50 shadow-2xl shadow-blue-500/5 p-8 md:p-12">
              {/* Subtle inner glow */}
              <div className="absolute inset-0 bg-gradient-to-r from-blue-500/5 via-transparent to-indigo-500/5 rounded-3xl" />

              {/* Services Cards Grid */}
              <div className="relative z-10 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
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
                      <>
                        <div className="text-2xl font-bold text-gray-900 dark:text-white mb-1">{card.priceLabel}</div>
                        <p className="text-xs text-gray-500 mb-4">starting from</p>
                      </>
                    )}
                    <ul className="text-sm text-left mx-auto max-w-[260px] space-y-2 text-gray-600 dark:text-gray-400 mb-6 list-disc list-inside">
                      {card.features.map((f, i) => (
                        <li key={i}>{f}</li>
                      ))}
                    </ul>
                    <button
                      type="button"
                      onClick={() => {
                        navigate(`/services/${card.slug}/start`)
                      }}
                      className={`w-full inline-flex items-center justify-center px-4 py-2 rounded-lg ${
                        index === 1 ? 'bg-red-500 hover:bg-red-600' : 'bg-blue-600 hover:bg-blue-700'
                      } text-white font-medium transition-colors`}
                    >
                      {card.slug === 'other-documents' ? 'Start Other Service' : 'Start Service'}
                      <span className="ml-2">→</span>
                    </button>
                  </motion.div>
                ))}
              </div>
            </div>
          </motion.div>

          {/* New footer section with additional professional touches */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.8 }}
            className="text-center mt-20 pt-12 border-t border-gray-200/50 dark:border-gray-700/50"
          >
            <p className="text-gray-500 dark:text-gray-400 text-sm">
              Need assistance choosing the right service?{' '}
              <button className="text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 font-medium transition-colors underline decoration-dotted underline-offset-4">
                Contact our Team
              </button>
            </p>
          </motion.div>
        </div>
      </div>
    </div>
  )
}

export default Services
