import React, { useEffect, useState } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { useAppSelector } from '../hooks/useAppSelector';
import { selectCartItems } from '../store/slices/cartSlice';

import { motion } from 'framer-motion';
import { CheckCircle, Calendar, ExternalLink, ArrowRight } from 'lucide-react';

interface OrderData {
  paid: boolean;
  amount: number | null;
  currency: string | null;
  items: { name: string; qty: number; priceId: string }[];
  customer: { email: string | null; name: string | null };
}

const ThankYou: React.FC = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const cartItems = useAppSelector(selectCartItems);
  
  const [orderData, setOrderData] = useState<OrderData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const hasMoreItems = cartItems.length > 0;

  useEffect(() => {
    const sessionId = searchParams.get('session_id');
    
    if (!sessionId) {
      setIsLoading(false);
      return;
    }

    const loadOrderData = async () => {
      try {
        // Load from sessionStorage since we're no longer using Stripe
        const savedOrder = sessionStorage.getItem('lastOrder');
        if (savedOrder) {
          try {
            setOrderData(JSON.parse(savedOrder));
          } catch (parseError) {
            console.error('Error parsing saved order:', parseError);
          }
        }
      } catch (error) {
        console.error('Error loading order data:', error);
      } finally {
        setIsLoading(false);
      }
    };

    loadOrderData();
  }, [searchParams]);

  useEffect(() => {
    // Clear storage if all items are paid
    if (!hasMoreItems) {
      sessionStorage.removeItem('lastOrder');
      localStorage.removeItem('notarette_checkout_data');
    }
  }, [hasMoreItems]);

  const handleBookAppointment = () => {
    // Open Cal.com booking link
    window.open('https://cal.com/marcus-whereby-xu25ac/remote-notarization-meeting-test', '_blank');
  };

  const handleContinueServices = () => {
    navigate('/services');
  };

  const handleBrowseMore = () => {
    navigate('/services');
  };

  const formatPrice = (cents: number, currency: string) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: currency,
    }).format(cents / 100)
  }

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading your order details...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-12"
        >
          <CheckCircle className="w-20 h-20 text-green-500 mx-auto mb-6" />
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            Thank You for Your Order!
          </h1>
          <p className="text-xl text-gray-600">
            Your payment has been processed successfully.
          </p>
        </motion.div>

        {orderData && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="bg-white rounded-lg shadow-lg p-8 mb-8"
          >
            <h2 className="text-2xl font-semibold text-gray-900 mb-6">Order Summary</h2>
            
            <div className="space-y-4 mb-6">
              {orderData.items.map((item, index) => (
                <div key={index} className="flex justify-between items-center py-3 border-b border-gray-200">
                  <div>
                    <p className="font-medium text-gray-900">{item.name}</p>
                    <p className="text-sm text-gray-500">Quantity: {item.qty}</p>
                  </div>
                  <span className="text-gray-900 font-medium">
                    {formatPrice(orderData.amount || 0, orderData.currency || 'INR')}
                  </span>
                </div>
              ))}
            </div>

            <div className="flex justify-between items-center pt-4 border-t border-gray-200">
              <span className="text-lg font-semibold text-gray-900">Total</span>
              <span className="text-2xl font-bold text-blue-600">
                {formatPrice(orderData.amount || 0, orderData.currency || 'INR')}
              </span>
            </div>
          </motion.div>
        )}

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="bg-white rounded-lg shadow-lg p-8 mb-8"
        >
          <div className="text-center mb-6">
            <Calendar className="w-16 h-16 text-blue-600 mx-auto mb-4" />
            <h2 className="text-2xl font-semibold text-gray-900 mb-2">
              Book Your Appointment
            </h2>
            <p className="text-gray-600">
              Schedule your notarization session with our certified notary.
            </p>
          </div>

          <div className="text-center">
            <button
              onClick={handleBookAppointment}
              className="inline-flex items-center px-8 py-4 bg-blue-600 text-white text-lg font-semibold rounded-lg hover:bg-blue-700 transition-colors mb-4"
            >
              <Calendar className="w-5 h-5 mr-2" />
              Book Appointment
              <ExternalLink className="w-5 h-5 ml-2" />
            </button>
            
            <p className="text-sm text-gray-500">
              You'll be redirected to Cal.com to select your preferred time slot.
            </p>
          </div>
        </motion.div>

        {hasMoreItems ? (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6 }}
            className="bg-blue-50 rounded-lg p-6 text-center"
          >
            <h3 className="text-lg font-semibold text-blue-900 mb-2">
              Continue with Remaining Services
            </h3>
            <p className="text-blue-700 mb-4">
              You have {cartItems.length} more service(s) in your cart to complete.
            </p>
            <button
              onClick={handleContinueServices}
              className="inline-flex items-center px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              Complete Remaining Services
              <ArrowRight className="w-4 h-4 ml-2" />
            </button>
          </motion.div>
        ) : (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6 }}
            className="text-center"
          >
            <button
              onClick={handleBrowseMore}
              className="inline-flex items-center px-6 py-3 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors"
            >
              Browse More Services
              <ArrowRight className="w-4 h-4 ml-2" />
            </button>
          </motion.div>
        )}
      </div>
    </div>
  );
};

export default ThankYou;