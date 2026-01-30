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
      // Redirect directly to the Service Selection page for the submitted service
      navigate(`/services/${slug}/service-selection`, { replace: true })
    } else {
      // Fallback: if no slug found at all, just normalize URL
      navigate('/services', { replace: true })
    }
  }, [searchParams, navigate])

  const getServiceIcon = (serviceName: string) => {
    const name = serviceName.toLowerCase()

    if (name.includes('power of attorney')) return FaUserCheck
    if (name.includes('passport')) return FaIdCard
    if (name.includes('diploma') || name.includes('degree') || name.includes('academic transcript')) return FaCertificate
    if (name.includes('bank statement')) return FaFileAlt
    if (name.includes('deed') || name.includes('title transfer') || name.includes('real estate')) return FaFileContract
    if (name.includes('board') || name.includes('shareholder') || name.includes('resolution') || name.includes('company formation') || name.includes('business')) return FaBuilding
    if (name.includes('sale') || name.includes('purchase') || name.includes('agreement')) return FaFileContract
    if (name.includes('translation')) return FaLanguage
    if (name.includes('estate planning')) return FaCertificate

    return FaShieldAlt
  }

  // Fixed cards to match design
  const displayCards = [
    {
      title: 'Power of Attorney',
      slug: 'power-of-attorney',
      priceLabel: '€1',
      description: 'Create and notarize power of attorney documents for legal representation.',
      features: ['Legal drafting included', 'Multiple jurisdiction support', 'Express processing'],
      badge: 'Most Popular',
    },
    {
      title: 'Passport',
      slug: 'passport',
      priceLabel: '€1',
      description: 'Certified copy and notarization of passport documents with official notary seal.',
      features: ['Passport verification', 'Notarial certification', 'Digital copy provided'],
      badge: null,
    },
    {
      title: 'Diplomas and Degrees',
      slug: 'diplomas-and-degrees',
      priceLabel: '€1',
      description: 'Certified copy and notarization of academic diplomas and degrees.',
      features: ['Academic document verification', 'International recognition', 'Quick processing'],
      badge: null,
    },
    {
      title: 'Academic Transcripts',
      slug: 'academic-transcripts',
      priceLabel: '€1',
      description: 'Certified copy and notarization of academic transcripts and grade reports.',
      features: ['Transcript verification', 'Official seal', 'Digital copy provided'],
      badge: null,
    },
    {
      title: 'Bank Statements',
      slug: 'bank-statements',
      priceLabel: '€1',
      description: 'Certified copy and notarization of bank statements and financial documents.',
      features: ['Financial document verification', 'Privacy protection', 'Quick processing'],
      badge: null,
    },
    {
      title: 'Deeds of Title Transfer',
      slug: 'deeds-of-title-transfer',
      priceLabel: '€1',
      description: 'Notarization of property title transfer deeds and real estate transfers.',
      features: ['Property document expertise', 'Legal compliance', 'Same-day processing'],
      badge: null,
    },
    {
      title: 'Board and Shareholder Resolutions',
      slug: 'board-and-shareholder-resolutions',
      priceLabel: '€1',
      description: 'Notarization of corporate board and shareholder resolutions.',
      features: ['Corporate document expertise', 'Legal compliance', 'Same-day processing'],
      badge: null,
    },
    {
      title: 'Sale and Purchase Agreements',
      slug: 'sale-and-purchase-agreements',
      priceLabel: '€1',
      description: 'Notarization of sale and purchase agreements and commercial transactions.',
      features: ['Commercial document expertise', 'Legal compliance', 'Same-day processing'],
      badge: null,
    },
  ]

  return (
    <div className="relative min-h-screen">
      {/* Modern gradient background with mesh pattern */}
      <div className="absolute inset-0 bg-gradient-to-br from-primary-50 via-primary-50 to-primary-100">
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
      <div className="absolute top-20 left-10 w-32 h-32 bg-gradient-to-br from-primary-400/10 to-primary-200/10 rounded-full blur-xl"></div>
      <div className="absolute top-40 right-20 w-40 h-40 bg-gradient-to-br from-primary-500/10 to-primary-300/10 rounded-full blur-xl"></div>
      <div className="absolute bottom-20 left-1/4 w-28 h-28 bg-gradient-to-br from-primary-400/10 to-primary-200/10 rounded-full blur-xl"></div>

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
              className="inline-flex items-center px-4 py-2 rounded-full bg-gradient-to-r from-primary-50 to-primary-100 border border-primary-200 mb-6"
            >
              <span className="w-2 h-2 bg-primary-600 rounded-full mr-2 animate-pulse" />
              <span className="text-sm font-medium text-primary-700">
                Professional Notarial Services
              </span>
            </motion.div>

            {/* Main heading with improved typography */}
            <h1 className="text-5xl md:text-6xl lg:text-7xl font-bold bg-gradient-to-r from-gray-900 via-primary-900 to-primary-700 bg-clip-text text-transparent mb-6 leading-tight tracking-tight">
              <span>Choose Your</span>
              <br />
              <span className="bg-gradient-to-r from-primary-600 to-primary-400 bg-clip-text text-transparent">
                Notarial Service
              </span>
            </h1>

            {/* Enhanced description */}
            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.4 }}
              className="text-xl md:text-2xl text-gray-600 max-w-4xl mx-auto leading-relaxed font-light"
            >
              Professional notarization services tailored to your needs.{' '}
              <span className="font-medium text-gray-800">
                All services include certified notary review and legal compliance.
              </span>
            </motion.p>

            {/* Trust indicators */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.6 }}
              className="flex flex-wrap justify-center items-center gap-8 mt-12 text-sm text-gray-500"
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
              <h2 className="text-3xl font-bold text-gray-900 mb-4">Our Services</h2>
              <div className="w-24 h-1 bg-gradient-to-r from-primary-600 to-primary-400 mx-auto rounded-full" />
            </div>

            {/* Enhanced services grid container */}
            <div className="relative bg-white/70 backdrop-blur-xl rounded-3xl border border-white/20 shadow-2xl shadow-primary-500/5 p-8 md:p-12">
              {/* Subtle inner glow */}
              <div className="absolute inset-0 bg-gradient-to-r from-primary-500/5 via-transparent to-primary-400/5 rounded-3xl" />

              {/* Services Cards Grid */}
              <div className="relative z-10 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {displayCards.map((card, index) => (
                  <motion.div
                    key={card.slug}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.4, delay: 0.05 * index }}
                    className="relative overflow-hidden bg-white rounded-2xl shadow-sm border border-gray-200 p-6 text-center flex flex-col h-full"
                  >
                    {card.badge && (
                      <div className="absolute -left-12 top-4 w-40 -rotate-45">
                        <span className="block bg-red-500 text-white text-xs font-semibold text-center py-1 shadow-md">
                          {card.badge}
                        </span>
                      </div>
                    )}
                    <div className="w-20 h-20 mx-auto mb-4 rounded-full bg-primary-600 text-white flex items-center justify-center shadow-lg flex-shrink-0">
                      {React.createElement(getServiceIcon(card.title), { size: 36 })}
                    </div>
                    <h3 className="font-semibold text-gray-900 mb-2 flex-shrink-0">{card.title}</h3>
                    <p className="text-gray-600 text-sm mb-4 flex-shrink-0">{card.description}</p>
                    {card.priceLabel && (
                      <div className="flex-shrink-0">
                        <div className="text-2xl font-bold text-gray-900 mb-1">{card.priceLabel}</div>
                        <p className="text-xs text-gray-500 mb-4">starting from</p>
                      </div>
                    )}
                    <ul className="text-sm text-left mx-auto max-w-[260px] space-y-2 text-gray-600 mb-6 list-disc list-inside flex-grow">
                      {card.features.map((f, i) => (
                        <li key={i}>{f}</li>
                      ))}
                    </ul>
                    <button
                      type="button"
                      onClick={() => {
                        navigate(`/services/${card.slug}/start`)
                      }}
                      className={`w-full inline-flex items-center justify-center px-4 py-2 rounded-lg bg-primary-600 hover:bg-primary-700 text-white font-medium transition-colors flex-shrink-0 mt-auto`}
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
            className="text-center mt-20 pt-12 border-t border-gray-200/50"
          >
            <p className="text-gray-500 text-sm">
              Need assistance choosing the right service?{' '}
              <button className="text-primary-600 hover:text-primary-700 font-medium transition-colors underline decoration-dotted underline-offset-4">
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
