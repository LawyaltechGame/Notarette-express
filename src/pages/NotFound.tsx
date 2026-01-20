import React from 'react'
import { motion } from 'framer-motion'
import { FileQuestion, Home, ArrowLeft } from 'lucide-react'
import Button from '../components/ui/Button'
import { Link, useNavigate } from 'react-router-dom'
import PageBackground from '../components/layout/PageBackground'

const NotFound: React.FC = () => {
  const navigate = useNavigate()

  return (
    <PageBackground>
      <div className="flex items-center justify-center min-h-screen px-4">
        <div className="max-w-md w-full text-center">
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.6 }}
          className="mb-8"
        >
          <div className="w-24 h-24 bg-primary-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <FileQuestion className="w-12 h-12 text-primary-600" />
          </div>
          
          <h1 className="text-6xl font-bold text-gray-900 mb-4">
            404
          </h1>
          
          <h2 className="text-2xl font-semibold text-gray-900 mb-4">
            Page Not Found
          </h2>
          
          <p className="text-gray-600 mb-8 leading-relaxed">
            The page you're looking for doesn't exist or has been moved. 
            Let's get you back on track with our notarization services.
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="space-y-4"
        >
          <div className="flex flex-col sm:flex-row space-y-3 sm:space-y-0 sm:space-x-3">
            <Link to="/" className="flex-1">
              <Button variant="primary" className="w-full">
                <Home className="w-4 h-4 mr-2" />
                Go Home
              </Button>
            </Link>
            
            <Button
              variant="secondary"
              className="flex-1"
              onClick={() => navigate(-1)}
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Go Back
            </Button>
          </div>

          <Link to="/services">
            <Button variant="ghost" className="w-full">
              Browse Services
            </Button>
          </Link>
        </motion.div>

        {/* Quick Links */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.4 }}
          className="mt-12 pt-8 border-t border-gray-200"
        >
          <h3 className="text-sm font-medium text-gray-900 mb-4">
            Popular Pages
          </h3>
          
          <div className="grid grid-cols-2 gap-3 text-sm">
            <Link 
              to="/services" 
              className="text-primary-600 hover:text-primary-700 transition-colors"
            >
              Our Services
            </Link>
            <Link 
              to="/pricing" 
              className="text-primary-600 hover:text-primary-700 transition-colors"
            >
              Pricing
            </Link>
            <Link 
              to="/about" 
              className="text-primary-600 hover:text-primary-700 transition-colors"
            >
              About Us
            </Link>
            <Link 
              to="/contact" 
              className="text-teal-600 hover:text-teal-700 transition-colors"
            >
              Contact
            </Link>
          </div>
        </motion.div>

        {/* Support */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.6 }}
          className="mt-8 p-4 bg-white rounded-lg border border-gray-200"
        >
          <h4 className="text-sm font-medium text-gray-900 mb-2">
            Need Help?
          </h4>
          <p className="text-xs text-gray-600 mb-3">
            Our support team is available 24/7 to assist you.
          </p>
          <Link to="/contact">
            <Button variant="secondary" size="sm" className="w-full">
              Contact Support
            </Button>
          </Link>
        </motion.div>
        </div>
      </div>
    </PageBackground>
  )
}

export default NotFound