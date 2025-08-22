import React from 'react'
import Hero from '../components/home/Hero'
import { motion } from 'framer-motion'
import Button from '../components/ui/Button'
import { Link } from 'react-router-dom'
import { ArrowRight, Shield, Clock, Users, CheckCircle } from 'lucide-react'

const Home: React.FC = () => {
  const features = [
    {
      icon: Shield,
      text: 'Bank-grade Security',
      description: '256-bit encryption'
    },
    {
      icon: Clock,
      text: 'Same Day Service',
      description: '2-4 hour turnaround'
    },
    {
      icon: Users,
      text: 'Licensed Notaries',
      description: 'State-certified professionals'
    },
    {
      icon: CheckCircle,
      text: '100% Compliant',
      description: 'Legal in all 50 states'
    }
  ]

  return (
    <div>
      <Hero />
      
      {/* Quick Overview */}
      <section className="py-20 bg-white dark:bg-gray-900">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-100px" }}
            transition={{ duration: 0.6 }}
            className="text-center mb-16"
          >
            <h2 className="text-3xl lg:text-4xl font-bold text-gray-900 dark:text-white mb-4">
              Why Choose Notarette Express?
            </h2>
            <p className="text-xl text-gray-600 dark:text-gray-300 max-w-3xl mx-auto">
              Professional remote notarization services that are fast, secure, and legally compliant.
            </p>
          </motion.div>

          <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
            {features.map((feature, index) => (
              <motion.div
                key={feature.text}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-100px" }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
                className="text-center group"
              >
                <div className="w-12 h-12 bg-teal-100 dark:bg-teal-900 rounded-lg flex items-center justify-center mx-auto mb-3 group-hover:bg-teal-200 dark:group-hover:bg-teal-800 transition-colors">
                  <feature.icon className="w-6 h-6 text-teal-600 dark:text-teal-400" />
                </div>
                <h3 className="font-semibold text-gray-900 dark:text-white mb-1">
                  {feature.text}
                </h3>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  {feature.description}
                </p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Quick Links */}
      <section className="py-20 bg-gray-50 dark:bg-gray-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-100px" }}
            transition={{ duration: 0.6 }}
            className="text-center mb-12"
          >
            <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">
              Get Started Today
            </h2>
            <p className="text-xl text-gray-600 dark:text-gray-300">
              Everything you need to know about our notarization services
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-100px" }}
              transition={{ duration: 0.6, delay: 0.1 }}
              className="text-center"
            >
              <Link to="/services">
                <div className="bg-white dark:bg-gray-900 rounded-lg p-6 shadow-lg hover:shadow-xl transition-shadow">
                  <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
                    Browse Services
                  </h3>
                  <p className="text-gray-600 dark:text-gray-300 mb-4">
                    View our complete range of notarization services
                  </p>
                  <Button variant="primary" size="sm">
                    View Services
                    <ArrowRight className="w-4 h-4 ml-2" />
                  </Button>
                </div>
              </Link>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-100px" }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="text-center"
            >
              <Link to="/how-it-works">
                <div className="bg-white dark:bg-gray-900 rounded-lg p-6 shadow-lg hover:shadow-xl transition-shadow">
                  <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
                    How It Works
                  </h3>
                  <p className="text-gray-600 dark:text-gray-300 mb-4">
                    Learn about our simple 4-step process
                  </p>
                  <Button variant="secondary" size="sm">
                    Learn More
                    <ArrowRight className="w-4 h-4 ml-2" />
                  </Button>
                </div>
              </Link>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-100px" }}
              transition={{ duration: 0.6, delay: 0.3 }}
              className="text-center"
            >
              <Link to="/testimonials">
                <div className="bg-white dark:bg-gray-900 rounded-lg p-6 shadow-lg hover:shadow-xl transition-shadow">
                  <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
                    Customer Reviews
                  </h3>
                  <p className="text-gray-600 dark:text-gray-300 mb-4">
                    See what our customers are saying
                  </p>
                  <Button variant="secondary" size="sm">
                    Read Reviews
                    <ArrowRight className="w-4 h-4 ml-2" />
                  </Button>
                </div>
              </Link>
            </motion.div>
          </div>
        </div>
      </section>
    </div>
  )
}

export default Home