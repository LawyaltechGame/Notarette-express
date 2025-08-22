import React, { useState } from 'react'
import { motion } from 'framer-motion'
import { Clock, Shield, CheckCircle, Plus } from 'lucide-react'
import { Service } from '../../data/services'
import { useAppDispatch } from '../../hooks/useAppDispatch'
import { addItem } from '../../store/slices/cartSlice'
import { addToast } from '../../store/slices/uiSlice'
import Card from '../ui/Card'
import Button from '../ui/Button'
import { Link } from 'react-router-dom'

interface ServiceCardProps {
  service: Service
}

const ServiceCard: React.FC<ServiceCardProps> = ({ service }) => {
  const dispatch = useAppDispatch()
  const [extraPages, setExtraPages] = useState(0)
  const [includeCourier, setIncludeCourier] = useState(false)

  const formatPrice = (cents: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(cents / 100)
  }

  const getTotalPrice = () => {
    let total = service.priceCents
    total += extraPages * service.options.extraPagesPriceCents
    if (includeCourier) total += service.options.courierPriceCents
    return total
  }

  const handleAddToCart = () => {
    const cartItem = {
      id: service.id,
      name: service.name,
      priceCents: service.priceCents,
      quantity: 1,
      addOns: {
        extraPages: extraPages > 0 ? extraPages : undefined,
        courier: includeCourier || undefined,
      },
    }

    dispatch(addItem(cartItem))
    dispatch(addToast({
      type: 'success',
      title: 'Added to cart',
      message: `${service.name} has been added to your cart.`,
    }))
  }

  return (
    <Card hover className="h-full">
      <div className="flex flex-col h-full">
        {/* Header */}
        <div className="flex items-start justify-between mb-3">
          <div className="flex-1">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-1">
              {service.name}
            </h3>
            <p className="text-gray-600 dark:text-gray-400 text-xs">
              {service.description}
            </p>
          </div>
          <div className="text-right ml-3">
            <div className="text-xl font-bold text-teal-600">
              {formatPrice(service.priceCents)}
            </div>
            <div className="text-xs text-gray-500">starting</div>
          </div>
        </div>

        {/* Features - Compact */}
        <div className="mb-4">
          <div className="space-y-1 mb-3">
            {service.features.slice(0, 2).map((feature, index) => (
              <div key={index} className="flex items-center space-x-2 text-xs">
                <CheckCircle className="w-3 h-3 text-green-500 flex-shrink-0" />
                <span className="text-gray-700 dark:text-gray-300">{feature}</span>
              </div>
            ))}
          </div>

          <div className="flex items-center justify-between text-xs text-gray-600 dark:text-gray-400">
            <div className="flex items-center space-x-1">
              <Clock className="w-3 h-3" />
              <span>{service.turnaroundTime}</span>
            </div>
            <div className="flex items-center space-x-1">
              <Shield className="w-3 h-3" />
              <span>Secure</span>
            </div>
          </div>
        </div>

        {/* Add-ons - Compact */}
        <div className="mb-4 space-y-2">
          <h4 className="font-medium text-gray-900 dark:text-white text-sm">Add-ons</h4>
          
          {/* Extra Pages */}
          <div className="flex items-center justify-between">
            <label className="text-xs text-gray-700 dark:text-gray-300">
              Extra pages ({formatPrice(service.options.extraPagesPriceCents)} each)
            </label>
            <div className="flex items-center space-x-1">
              <button
                onClick={() => setExtraPages(Math.max(0, extraPages - 1))}
                className="w-6 h-6 flex items-center justify-center rounded border border-gray-300 dark:border-gray-600 text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors text-xs"
              >
                -
              </button>
              <span className="w-6 text-center text-xs font-medium text-gray-900 dark:text-white">
                {extraPages}
              </span>
              <button
                onClick={() => setExtraPages(extraPages + 1)}
                className="w-6 h-6 flex items-center justify-center rounded border border-gray-300 dark:border-gray-600 text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors text-xs"
              >
                +
              </button>
            </div>
          </div>

          {/* Courier */}
          <div className="flex items-center justify-between">
            <label className="flex items-center space-x-2 cursor-pointer">
              <input
                type="checkbox"
                checked={includeCourier}
                onChange={(e) => setIncludeCourier(e.target.checked)}
                className="rounded border-gray-300 dark:border-gray-600 text-teal-600 focus:ring-teal-500 w-3 h-3"
              />
              <span className="text-xs text-gray-700 dark:text-gray-300">
                Courier ({formatPrice(service.options.courierPriceCents)})
              </span>
            </label>
          </div>
        </div>

        {/* Total Price */}
        {(extraPages > 0 || includeCourier) && (
          <div className="mb-4 p-2 bg-gray-50 dark:bg-gray-800 rounded text-sm">
            <div className="flex items-center justify-between">
              <span className="font-medium text-gray-900 dark:text-white">Total:</span>
              <span className="font-bold text-teal-600">
                {formatPrice(getTotalPrice())}
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
            className="w-full"
          >
            <Plus className="w-3 h-3 mr-1" />
            Add to Cart
          </Button>
          
          <Link to={`/services/${service.slug}`}>
            <Button variant="ghost" size="sm" className="w-full text-xs">
              View Details
            </Button>
          </Link>
        </div>
      </div>
    </Card>
  )
}

export default ServiceCard