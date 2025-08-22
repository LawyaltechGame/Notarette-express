import React from 'react'
import { motion, useInView } from 'framer-motion'
import { CreditCard, ShieldCheck, FileText, CheckCircle } from 'lucide-react'

const HowItWorks: React.FC = () => {
  const ref = React.useRef(null)
  const isInView = useInView(ref, { once: true, margin: "-100px" })

  const steps = [
    {
      icon: CreditCard,
      title: 'Pay for your service',
      description: 'Select and purchase the notarization service you need. Secure checkout with multiple payment options.',
      color: 'bg-blue-500',
    },
    {
      icon: ShieldCheck,
      title: 'Complete identity verification',
      description: 'Quick and secure identity verification using bank-grade technology. Takes just a few minutes.',
      color: 'bg-teal-500',
    },
    {
      icon: FileText,
      title: 'Send signed documents',
      description: 'Upload your signed documents securely. Our licensed notaries will review and process them immediately.',
      color: 'bg-amber-500',
    },
    {
      icon: CheckCircle,
      title: 'Receive notarized documents',
      description: 'Get your notarized documents delivered by email or courier. Fast, secure, and legally compliant.',
      color: 'bg-green-500',
    },
  ]

  return (
    <section id="how-it-works" className="py-20 bg-white dark:bg-gray-900">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          ref={ref}
          initial={{ opacity: 0, y: 20 }}
          animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
          transition={{ duration: 0.6 }}
          className="text-center mb-16"
        >
          <h2 className="text-3xl lg:text-4xl font-bold text-gray-900 dark:text-white mb-4">
            How It Works
          </h2>
          <p className="text-xl text-gray-600 dark:text-gray-300 max-w-3xl mx-auto">
            Get your documents notarized in four simple steps. 
            Fast, secure, and fully compliant with legal requirements.
          </p>
        </motion.div>

        <div className="relative">
          {/* Connection Lines */}
          <div className="hidden lg:block absolute top-24 left-0 right-0 h-0.5 bg-gradient-to-r from-blue-200 via-teal-200 via-amber-200 to-green-200 dark:from-blue-800 dark:via-teal-800 dark:via-amber-800 dark:to-green-800" />

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {steps.map((step, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
                transition={{ duration: 0.6, delay: index * 0.2 }}
                className="relative text-center"
              >
                {/* Step Number */}
                <div className="absolute -top-4 left-1/2 transform -translate-x-1/2 w-8 h-8 bg-gray-100 dark:bg-gray-800 rounded-full flex items-center justify-center border-4 border-white dark:border-gray-900 z-10">
                  <span className="text-sm font-bold text-gray-600 dark:text-gray-300">
                    {index + 1}
                  </span>
                </div>

                {/* Icon */}
                <div className={`w-16 h-16 ${step.color} rounded-xl flex items-center justify-center mx-auto mb-6 shadow-lg`}>
                  <step.icon className="w-8 h-8 text-white" />
                </div>

                {/* Content */}
                <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-3">
                  {step.title}
                </h3>
                <p className="text-gray-600 dark:text-gray-300 leading-relaxed">
                  {step.description}
                </p>
              </motion.div>
            ))}
          </div>
        </div>

        {/* CTA */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
          transition={{ duration: 0.6, delay: 0.8 }}
          className="text-center mt-16"
        >
          <p className="text-lg text-gray-600 dark:text-gray-300 mb-6">
            Ready to get started? It only takes a few minutes.
          </p>
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="inline-flex items-center px-8 py-4 bg-teal-600 text-white text-lg font-semibold rounded-lg hover:bg-teal-700 transition-colors shadow-lg"
          >
            Start Notarization Process
          </motion.button>
        </motion.div>
      </div>
    </section>
  )
}

export default HowItWorks