import React, { useState } from 'react'
import { motion } from 'framer-motion'
import { Clock, Shield, CheckCircle, Plus, Zap, ArrowRight } from 'lucide-react'
import { Service } from '../../data/services'
import { useAppDispatch } from '../../hooks/useAppDispatch'
import { addItem } from '../../store/slices/cartSlice'
import { addToast } from '../../store/slices/uiSlice'
import Card from '../ui/Card'
import Button from '../ui/Button'
import { Link } from 'react-router-dom'

interface ServiceCardProps {
  service: Service
  stripePrice?: {
    priceId: string
    unitAmount: number | null
    currency: string | null
    productName: string | null
  }
}

const ServiceCard: React.FC<ServiceCardProps> = ({ service, stripePrice }) => {
  const dispatch = useAppDispatch()
  const [extraPages, setExtraPages] = useState(0)
  const [includeCourier, setIncludeCourier] = useState(false)
  const [includeRushService, setIncludeRushService] = useState(false)

  const getDisplayPrice = () => {
    // Use Stripe price if available, otherwise fall back to local price
    if (stripePrice?.unitAmount && stripePrice?.currency) {
      return stripePrice.unitAmount / 100 // Convert cents to main unit
    }
    return service.priceCents / 100 // Convert cents to main unit
  }

  const getDisplayCurrency = () => {
    // Use Stripe currency if available, otherwise fall back to local currency
    if (stripePrice?.currency) {
      return stripePrice.currency
    }
    return service.currency
  }

  const getDisplayPriceLabel = () => {
    if (stripePrice?.unitAmount && stripePrice?.currency) {
      return 'Live Price'
    }
    return 'Base Price'
  }

  const getTotalPrice = () => {
    let total = getDisplayPrice() * 100 // Convert back to cents for calculations
    total += extraPages * service.options.extraPagesPriceCents
    if (includeCourier) total += service.options.courierPriceCents
    if (includeRushService) total += service.options.rushServicePriceCents
    return total
  }

  const formatPrice = (cents: number, currency: string) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: currency,
    }).format(cents / 100)
  }

  const handleAddToCart = () => {
    const cartItem = {
      id: service.id,
      name: service.name,
      priceCents: getTotalPrice(), // Use total price including add-ons
      quantity: 1,
      currency: getDisplayCurrency(), // Include the currency
      addOns: {
        extraPages: extraPages > 0 ? extraPages : undefined,
        courier: includeCourier || undefined,
        rushService: includeRushService || undefined,
      },
      // Store Stripe info for checkout
      stripePriceId: service.stripePriceId || undefined,
      paymentLink: service.paymentLink || undefined,
    }

    dispatch(addItem(cartItem))
    dispatch(addToast({
      type: 'success',
      title: 'Added to cart',
      message: `${service.name} has been added to your cart.`,
    }))
  }

  return (
    <Card hover className="h-full flex flex-col service-card group">
      <div className="flex flex-col h-full">
        {/* Header with Price */}
        <div className="flex items-start justify-between mb-4">
          <div className="flex-1 pr-4">
            <h3 className="text-lg font-bold text-gray-900 dark:text-white group-hover:text-teal-600 transition-colors leading-tight">
              {service.name}
            </h3>
          </div>
          <div className="text-right flex-shrink-0 ml-2">
            <div className="text-xl font-bold text-teal-600">
              {formatPrice(getDisplayPrice() * 100, getDisplayCurrency())}
            </div>
            <div className="text-xs text-gray-500 bg-gray-100 dark:bg-gray-800 px-2 py-1 rounded-full whitespace-nowrap">
              {getDisplayPriceLabel()}
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

        {/* Add-ons - Simplified */}
        <div className="mb-4 space-y-2">
          <h4 className="text-xs font-semibold text-gray-700 dark:text-gray-300 uppercase tracking-wide">
            Add-ons
          </h4>
          
          {/* Extra Pages - Compact */}
          <div className="flex items-center justify-between">
            <span className="text-xs text-gray-600 dark:text-gray-400">
              +{formatPrice(service.options.extraPagesPriceCents, service.currency)} per page
            </span>
            <div className="flex items-center space-x-1">
              <button
                onClick={() => setExtraPages(Math.max(0, extraPages - 1))}
                className="w-5 h-5 flex items-center justify-center rounded border border-gray-300 dark:border-gray-600 text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors text-xs"
              >
                -
              </button>
              <span className="w-6 text-center text-xs font-medium text-gray-900 dark:text-white">
                {extraPages}
              </span>
              <button
                onClick={() => setExtraPages(extraPages + 1)}
                className="w-5 h-5 flex items-center justify-center rounded border border-gray-300 dark:border-gray-600 text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors text-xs"
              >
                +
              </button>
            </div>
          </div>

          {/* Quick Add-ons */}
          <div className="flex space-x-2">
            <label className="flex items-center space-x-1.5 cursor-pointer">
              <input
                type="checkbox"
                checked={includeCourier}
                onChange={(e) => setIncludeCourier(e.target.checked)}
                className="rounded border-gray-300 dark:border-gray-600 text-teal-600 focus:ring-teal-500 w-3 h-3"
              />
              <span className="text-xs text-gray-600 dark:text-gray-400">
                Courier
              </span>
            </label>
            
            <label className="flex items-center space-x-1.5 cursor-pointer">
              <input
                type="checkbox"
                checked={includeRushService}
                onChange={(e) => setIncludeRushService(e.target.checked)}
                className="rounded border-gray-300 dark:border-gray-600 text-teal-600 focus:ring-teal-500 w-3 h-3"
              />
              <span className="text-xs text-gray-600 dark:text-gray-400">
                Rush
              </span>
            </label>
          </div>
        </div>

        {/* Total Price - Only show when add-ons selected */}
        {(extraPages > 0 || includeCourier || includeRushService) && (
          <div className="mb-4 p-2 bg-teal-50 dark:bg-teal-900/20 rounded-lg border border-teal-200 dark:border-teal-800">
            <div className="flex items-center justify-between text-sm">
              <span className="font-medium text-teal-800 dark:text-teal-200">Total:</span>
              <span className="font-bold text-teal-600">
                {formatPrice(getTotalPrice(), getDisplayCurrency())}
              </span>
            </div>
          </div>
        )}

        {/* Actions */}
        <div className="mt-auto space-y-2">
          <Button
            onClick={handleAddToCart}
            variant="primary"
            size="sm"
            className="w-full group-hover:bg-teal-700 transition-colors"
          >
            <Plus className="w-4 h-4 mr-2" />
            Add to Cart
          </Button>
          
          <Link to={`/services/${service.slug}`}>
            <Button 
              variant="ghost" 
              size="sm" 
              className="w-full text-xs group-hover:text-teal-600 group-hover:bg-teal-50 dark:group-hover:bg-teal-900/20 transition-colors"
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