import React from 'react'
import { motion } from 'framer-motion'
import { Link } from 'react-router-dom'
import { ArrowRight, Shield, CheckCircle } from 'lucide-react'
import Button from '../ui/Button'

const Hero: React.FC = () => {
  // Features array removed - no longer displaying features grid below hero
  
  return (
    <section className="relative overflow-hidden bg-gradient-to-br from-primary-50 via-white to-blue-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
      {/* Background Pattern */}
      <div className="absolute inset-0 bg-grid-pattern opacity-5"></div>
      
      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 lg:py-32">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          {/* Left Column - Content */}
          <motion.div
            initial={{ opacity: 0, x: -50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8, ease: "easeOut" }}
            className="space-y-8"
          >
            {/* Badge */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="inline-flex items-center px-4 py-2 rounded-full bg-primary-50 text-primary-800 dark:bg-primary-900/40 dark:text-primary-200 text-sm font-medium"
            >
                             <Shield className="w-4 h-4 mr-2" />
               Powered by Notarette
            </motion.div>

            {/* Main Heading */}
            <motion.h1
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.3 }}
              className="text-4xl lg:text-6xl font-bold text-gray-900 dark:text-white leading-tight"
            >
                             Notarette Express -{' '}
               <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary-600 to-primary-400">
                 Online Notarization
               </span>{' '}
               Platform
            </motion.h1>

            {/* Subtitle */}
            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.4 }}
              className="text-xl text-gray-600 dark:text-gray-300 leading-relaxed"
            >
                             The digital extension of Notarette - your trusted notarization partner. 
               Get documents notarized online in minutes with our licensed notaries. 
               Secure, legally binding services available 24/7 worldwide.
            </motion.p>

            {/* CTA Buttons */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.5 }}
              className="flex flex-col sm:flex-row gap-4"
            >
              <Link to="/services">
                <Button size="lg" className="w-full sm:w-auto">
                  Start Notarization
                  <ArrowRight className="w-5 h-5 ml-2" />
                </Button>
              </Link>
              <Link to="/services">
                <Button variant="secondary" size="lg" className="w-full sm:w-auto">
                  Browse Services
                </Button>
              </Link>
            </motion.div>

            {/* Trust Indicators */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.6 }}
              className="pt-8"
            >
              <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">
                Trusted by leading companies:
              </p>
              <div className="flex items-center space-x-6 opacity-60">
                <div className="h-8 w-20 bg-gray-300 dark:bg-gray-600 rounded"></div>
                <div className="h-8 w-16 bg-gray-300 dark:bg-gray-600 rounded"></div>
                <div className="h-8 w-24 bg-gray-300 dark:bg-gray-600 rounded"></div>
                <div className="h-8 w-18 bg-gray-300 dark:bg-gray-600 rounded"></div>
              </div>
            </motion.div>
          </motion.div>

          {/* Right Column - Visual */}
          <motion.div
            initial={{ opacity: 0, x: 50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8, delay: 0.2, ease: "easeOut" }}
            className="relative"
          >
            {/* Main Visual */}
            <div className="relative bg-white dark:bg-gray-800 rounded-2xl shadow-2xl p-8 border border-gray-200 dark:border-gray-700">
              {/* Document Mockup */}
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <div className="w-3 h-3 bg-red-500 rounded-full"></div>
                    <div className="w-3 h-3 bg-yellow-500 rounded-full"></div>
                    <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                  </div>
                                     <div className="text-sm text-gray-500">Notarette Express</div>
                </div>
                
                <div className="space-y-3">
                  <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-3/4"></div>
                  <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-1/2"></div>
                  <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-5/6"></div>
                </div>

                {/* Signature Area */}
                <div className="border-2 border-dashed border-primary-300 dark:border-primary-600 rounded-lg p-4 mt-6">
                  <div className="flex items-center justify-between">
                                         <div className="text-sm text-gray-600 dark:text-gray-400">
                       Notarette Digital Sign
                     </div>
                    <div className="w-8 h-8 bg-primary-100 dark:bg-primary-900/40 rounded-full flex items-center justify-center">
                      <CheckCircle className="w-5 h-5 text-primary-600 dark:text-primary-400" />
                    </div>
                  </div>
                </div>

                {/* Notary Seal */}
                <div className="flex justify-center mt-4">
                                     <div className="w-16 h-16 bg-gradient-to-br from-primary-500 to-blue-600 rounded-full flex items-center justify-center text-white font-bold text-xs">
                     NOTARETTE
                   </div>
                </div>
              </div>
            </div>

            {/* Floating Elements */}
            <motion.div
              animate={{ y: [-10, 10, -10] }}
              transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
              className="absolute -top-4 -right-4 w-16 h-16 bg-primary-100 dark:bg-primary-900/40 rounded-full flex items-center justify-center"
              >
              <Shield className="w-8 h-8 text-primary-600 dark:text-primary-400" />
            </motion.div>

            <motion.div
              animate={{ y: [10, -10, 10] }}
              transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
              className="absolute -bottom-4 -left-4 w-12 h-12 bg-blue-100 dark:bg-blue-900 rounded-full flex items-center justify-center"
            >
              <div className="w-6 h-6 bg-blue-600 rounded-full"></div>
            </motion.div>
          </motion.div>
        </div>

        {/* Features Grid - Removed to keep page clean and focused */}
        {/* <motion.div
          initial={{ opacity: 0, y: 50 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.8 }}
          className="grid grid-cols-2 lg:grid-cols-4 gap-6 mt-20"
        >
          {features.map((feature, index) => (
            <motion.div
              key={feature.text}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.9 + index * 0.1 }}
              className="text-center group"
            >
              <div className="w-12 h-12 bg-primary-100 dark:bg-primary-900/40 rounded-lg flex items-center justify-center mx-auto mb-3 group-hover:bg-primary-200 dark:group-hover:bg-primary-800 transition-colors">
                <feature.icon className="w-6 h-6 text-primary-600 dark:text-primary-400" />
              </div>
              <h3 className="font-semibold text-gray-900 dark:text-white mb-1">
                {feature.text}
              </h3>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                {feature.description}
              </p>
            </motion.div>
          ))}
        </motion.div> */}
      </div>

                                                                                                               {/* Bottom Divider */}
          <div className="absolute bottom-0 left-0 right-0">
            <div className="h-16 bg-gradient-to-t from-white dark:from-gray-900 to-transparent"></div>
          </div>
    </section>
  )
}

export default Hero
