import React from 'react'
import { 
  Clock, 
  Shield, 
  CheckCircle, 
  ArrowRight
} from 'lucide-react'
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
import { Service } from '../../data/services'
import Card from '../ui/Card'
import Button from '../ui/Button'
import { Link } from 'react-router-dom'

interface ServiceCardProps {
  service: Service
}

const ServiceCard: React.FC<ServiceCardProps> = ({ service }) => {
  

  const getDisplayPrice = () => {
    return service.priceCents / 100 // Convert cents to main unit
  }

  const getDisplayCurrency = () => {
    return service.currency
  }

  

  const formatPrice = (cents: number, currency: string) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: currency,
    }).format(cents / 100)
  }

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
    
    return FaShieldAlt // Default icon for notary services (represents trust/security)
  }

  

  return (
    <Card hover className="h-full flex flex-col service-card group">
      <div className="flex flex-col h-full">
        {/* Service Icon/Image Placeholder */}
        <div className="flex items-center justify-center mb-4 p-6 bg-gradient-to-br from-primary-50 to-primary-100 dark:from-primary-900/20 dark:to-primary-900/10 rounded-lg">
          {service.imageUrl ? (
            // If actual image is provided, use it
            <div className="w-20 h-20 rounded-full overflow-hidden shadow-lg group-hover:scale-110 transition-transform duration-300">
              <img 
                src={service.imageUrl} 
                alt={service.name}
                className="w-full h-full object-cover"
                onError={(e) => {
                  // Fallback to icon if image fails to load
                  const target = e.target as HTMLImageElement
                  target.style.display = 'none'
                  target.nextElementSibling?.classList.remove('hidden')
                }}
              />
              <div className="w-20 h-20 bg-gradient-to-br from-primary-500 to-blue-600 rounded-full items-center justify-center text-white hidden">
                {React.createElement(getServiceIcon(service.name), { size: 36 })}
              </div>
            </div>
          ) : (
            // Use icon placeholder
          <div className="w-20 h-20 bg-primary-600 rounded-full flex items-center justify-center text-white shadow-lg group-hover:scale-110 transition-transform duration-300">
              {React.createElement(getServiceIcon(service.name), { size: 36 })}
            </div>
          )}
        </div>

        {/* Header with Price */}
        <div className="flex items-start justify-between mb-4">
          <div className="flex-1 pr-4">
            <h3 className="text-lg font-bold text-gray-900 dark:text-white group-hover:text-primary-600 transition-colors leading-tight">
              {service.name}
            </h3>
          </div>
          <div className="text-right flex-shrink-0 ml-2">
            <div className="text-xl font-bold text-primary-600">
              {formatPrice(getDisplayPrice() * 100, getDisplayCurrency())}
            </div>
            <div className="text-xs text-gray-500 bg-gray-100 dark:bg-gray-800 px-2 py-1 rounded-full whitespace-nowrap">
              Base Price
            </div>
          </div>
        </div>

        {/* Description */}
        <div className="mb-4">
          <p className="text-sm text-gray-600 dark:text-gray-400 leading-relaxed">
            {service.description}
          </p>
        </div>

        {/* Key Features - Compact */}
        <div className="mb-4">
          <div className="flex items-center space-x-4 text-xs text-gray-600 dark:text-gray-400 mb-3">
            <div className="flex items-center space-x-1">
              <Clock className="w-3 h-3 text-blue-500" />
              <span>{service.turnaroundTime}</span>
            </div>
            <div className="flex items-center space-x-1">
              <Shield className="w-3 h-3 text-green-500" />
              <span>Secure</span>
            </div>
          </div>
          
          {/* Top 2 Features */}
          <div className="space-y-1.5">
            {service.features.slice(0, 2).map((feature, index) => (
              <div key={index} className="flex items-center space-x-2 text-xs">
                <CheckCircle className="w-3 h-3 text-green-500 flex-shrink-0" />
                <span className="text-gray-700 dark:text-gray-300">{feature}</span>
              </div>
            ))}
          </div>
        </div>

        

        {/* Actions */}
        <div className="mt-auto space-y-2">
          <Link to={`/services/${service.slug}`}>
            <Button 
              variant="ghost" 
              size="sm" 
              className="w-full text-xs group-hover:text-primary-600 group-hover:bg-primary-50 dark:group-hover:bg-primary-900/20 transition-colors"
            >
              View Details
              <ArrowRight className="w-3 h-3 ml-1 group-hover:translate-x-1 transition-transform" />
            </Button>
          </Link>
        </div>
      </div>
    </Card>
  )
}

export default ServiceCard