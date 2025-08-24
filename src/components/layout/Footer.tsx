import React from 'react'
import { Link } from 'react-router-dom'
import { Shield, Clock, Award, MapPin, Phone, Mail } from 'lucide-react'
import { useAppSelector } from '../../hooks/useAppSelector'

const Footer: React.FC = () => {
  const currentYear = new Date().getFullYear()
  const isAuthenticated = useAppSelector(state => state.user.isAuthenticated)

  // Don't show footer on login page
  if (!isAuthenticated) {
    return null
  }

  const trustBadges = [
    { icon: Shield, text: 'Bank-Grade Security' },
    { icon: Clock, text: '24/7 Available' },
    { icon: Award, text: 'Licensed Notaries' },
  ]

  const footerLinks = {
    services: [
      { name: 'Certified Signature', href: '/services/certified-signature' },
      { name: 'Document Witnessing', href: '/services/document-witnessing' },
      { name: 'Apostille Services', href: '/services/apostille-services' },
      { name: 'All Services', href: '/services' },
    ],
    support: [
      { name: 'Help Center', href: '/help' },
      { name: 'FAQs', href: '/faqs' },
      { name: 'Client Portal', href: '/portal' },
      // { name: 'Book a Call', href: '/contact' }, // Hidden - exists on WordPress
    ],
    legal: [
      { name: 'Privacy Policy', href: '/legal/privacy' },
      { name: 'Terms of Service', href: '/legal/terms' },
      { name: 'Refund Policy', href: '/legal/refund' },
      { name: 'KYC Policy', href: '/legal/kyc' },
    ],
  }

  return (
    <footer className="bg-gray-50 dark:bg-gray-900 border-t border-gray-200 dark:border-gray-800">
      {/* Trust Badges Section */}
      <div className="border-b border-gray-200 dark:border-gray-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {trustBadges.map((badge, index) => (
              <div key={index} className="flex items-center justify-center space-x-3">
                <badge.icon className="h-6 w-6 text-teal-600" />
                <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                  {badge.text}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Main Footer Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-6 gap-8">
          {/* Brand Section */}
          <div className="lg:col-span-2">
            <Link to="/services" className="flex items-center space-x-2 mb-4">
              <div className="w-8 h-8 bg-teal-600 rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-xs">NE</span>
              </div>
              <span className="font-bold text-xl text-gray-900 dark:text-white">
                Notarette Express
              </span>
            </Link>
            <p className="text-gray-600 dark:text-gray-400 text-sm mb-6 max-w-md">
              Secure, fast, and compliant remote online notarization services. 
              Licensed notary publics available 24/7 to help with your document needs.
            </p>
            
            {/* Contact Info */}
            <div className="space-y-2 text-sm text-gray-600 dark:text-gray-400">
              <div className="flex items-center space-x-2">
                <Phone size={16} />
                <span>1-800-NOTARY-24</span>
              </div>
              <div className="flex items-center space-x-2">
                <Mail size={16} />
                <span>support@notarette.com</span>
              </div>
              <div className="flex items-center space-x-2">
                <MapPin size={16} />
                <span>Available in all 50 states</span>
              </div>
            </div>
          </div>

          {/* Services Links */}
          <div>
            <h3 className="font-semibold text-gray-900 dark:text-white mb-4">Services</h3>
            <ul className="space-y-2">
              {footerLinks.services.map((link) => (
                <li key={link.name}>
                  <Link
                    to={link.href}
                    className="text-sm text-gray-600 hover:text-teal-600 dark:text-gray-400 dark:hover:text-teal-400 transition-colors"
                  >
                    {link.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

         

          {/* Support Links */}
          <div>
            <h3 className="font-semibold text-gray-900 dark:text-white mb-4">Support</h3>
            <ul className="space-y-2">
              {footerLinks.support.map((link) => (
                <li key={link.name}>
                  <Link
                    to={link.href}
                    className="text-sm text-gray-600 hover:text-teal-600 dark:text-gray-400 dark:hover:text-teal-400 transition-colors"
                  >
                    {link.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Legal Links */}
          <div>
            <h3 className="font-semibold text-gray-900 dark:text-white mb-4">Legal</h3>
            <ul className="space-y-2">
              {footerLinks.legal.map((link) => (
                <li key={link.name}>
                  <Link
                    to={link.href}
                    className="text-sm text-gray-600 hover:text-teal-600 dark:text-gray-400 dark:hover:text-teal-400 transition-colors"
                  >
                    {link.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Bottom Section */}
        <div className="border-t border-gray-200 dark:border-gray-800 mt-12 pt-8">
          <div className="flex flex-col md:flex-row justify-between items-center space-y-4 md:space-y-0">
            <p className="text-sm text-gray-600 dark:text-gray-400">
              © {currentYear} Notarette Express. All rights reserved.
            </p>
            
            <div className="text-sm text-gray-600 dark:text-gray-400 text-center md:text-right">
              <p className="mb-1">
                <strong>Disclaimer:</strong> Remote notarization availability varies by jurisdiction.
              </p>
              <p>
                Licensed notary services provided in compliance with applicable state and federal regulations.
              </p>
            </div>
          </div>
        </div>
      </div>
    </footer>
  )
}

export default Footer