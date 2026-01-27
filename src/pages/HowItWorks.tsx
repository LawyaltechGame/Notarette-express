import React from 'react'
import { motion } from 'framer-motion'
import HowItWorks from '../components/home/HowItWorks'
import PageBackground from '../components/layout/PageBackground'
import Button from '../components/ui/Button'
import { Link } from 'react-router-dom'
import { ArrowRight } from 'lucide-react'

const HowItWorksPage: React.FC = () => {
  return (
    <PageBackground>
      {/* Hero Section */}
      <section className="relative py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center"
          >
            <h1 className="text-4xl lg:text-5xl font-bold text-gray-900 mb-6">
              How It Works
            </h1>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Get your documents notarized in four simple steps. 
              Our streamlined process makes remote notarization fast, secure, and convenient.
            </p>
          </motion.div>
        </div>
      </section>

      {/* How It Works Component */}
      <HowItWorks />

      {/* Additional Information */}
      <section className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
            >
              <h2 className="text-3xl font-bold text-gray-900 mb-6">
                Why Choose Remote Notarization?
              </h2>
              <div className="space-y-4">
                <div className="flex items-start space-x-3">
                  <div className="w-6 h-6 bg-primary-600 rounded-full flex items-center justify-center flex-shrink-0 mt-1">
                    <span className="text-white text-sm font-bold">1</span>
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900 mb-1">
                      Convenience
                    </h3>
                    <p className="text-gray-600">
                      No need to travel to a notary office. Get notarized from anywhere with an internet connection.
                    </p>
                  </div>
                </div>
                <div className="flex items-start space-x-3">
                  <div className="w-6 h-6 bg-primary-600 rounded-full flex items-center justify-center flex-shrink-0 mt-1">
                    <span className="text-white text-sm font-bold">2</span>
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900 mb-1">
                      Speed
                    </h3>
                    <p className="text-gray-600">
                      Complete the entire process in minutes, not hours. Same-day processing available.
                    </p>
                  </div>
                </div>
                <div className="flex items-start space-x-3">
                  <div className="w-6 h-6 bg-primary-600 rounded-full flex items-center justify-center flex-shrink-0 mt-1">
                    <span className="text-white text-sm font-bold">3</span>
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900 mb-1">
                      Security
                    </h3>
                    <p className="text-gray-600">
                      Bank-grade encryption and identity verification ensure your documents are secure.
                    </p>
                  </div>
                </div>
                <div className="flex items-start space-x-3">
                  <div className="w-6 h-6 bg-primary-600 rounded-full flex items-center justify-center flex-shrink-0 mt-1">
                    <span className="text-white text-sm font-bold">4</span>
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900 mb-1">
                      Legality
                    </h3>
                    <p className="text-gray-600">
                      Fully compliant with state and federal regulations. Legally binding in all 50 states.
                    </p>
                  </div>
                </div>
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, x: 20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              className="bg-white rounded-2xl p-8 shadow-xl"
            >
              <h3 className="text-2xl font-bold text-gray-900 mb-6">
                Ready to Get Started?
              </h3>
              <p className="text-gray-600 mb-6">
                Choose from our range of notarization services and get started in minutes.
              </p>
              <div className="space-y-4">
                <Link to="/services">
                  <Button variant="primary" className="w-full">
                    Browse Services
                    <ArrowRight className="w-4 h-4 ml-2" />
                  </Button>
                </Link>
                <Link to="/contact">
                  <Button variant="secondary" className="w-full">
                    Contact Support
                  </Button>
                </Link>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section className="py-20 bg-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <h2 className="text-3xl font-bold text-gray-900 mb-4">
              Frequently Asked Questions
            </h2>
            <p className="text-xl text-gray-600">
              Common questions about our remote notarization process
            </p>
          </motion.div>

          <div className="space-y-6">
            {[
              {
                question: 'Is remote notarization legally valid?',
                answer: 'Yes, remote online notarization is legally recognized in most jurisdictions. We ensure full compliance with applicable state and federal regulations.',
              },
              {
                question: 'What documents can be notarized remotely?',
                answer: 'Most legal documents can be notarized remotely, including contracts, affidavits, powers of attorney, and more. Some restrictions may apply based on your jurisdiction.',
              },
              {
                question: 'How long does the process take?',
                answer: 'Most documents are processed within 2-4 hours during business hours. Rush processing is available for urgent requests.',
              },
              {
                question: 'What technology do I need?',
                answer: 'You need a computer or mobile device with a camera, microphone, and internet connection. We support all major browsers and devices.',
              },
              {
                question: 'Is my information secure?',
                answer: 'Yes, we use bank-grade encryption and secure identity verification. Your documents and personal information are protected with the highest security standards.',
              },
            ].map((faq, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 10 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
                className="bg-gray-50 rounded-lg p-6"
              >
                <h3 className="font-semibold text-gray-900 mb-2">
                  {faq.question}
                </h3>
                <p className="text-gray-600">
                  {faq.answer}
                </p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>
    </PageBackground>
  )
}

export default HowItWorksPage
