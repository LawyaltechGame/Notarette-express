import React, { useEffect, useState } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
// import { useAppSelector } from '../hooks/useAppSelector';

import { motion } from 'framer-motion';
import { CheckCircle, Calendar, ExternalLink, ArrowRight } from 'lucide-react';
import { useFormSubmission } from '../hooks/useFormSubmission';

interface OrderData {
  paid: boolean;
  amount: number | null;
  currency: string | null;
  items: { name: string; qty: number; priceId: string; amountCents?: number }[];
  customer: { email: string | null; name: string | null };
  calLink?: string | null;
  subtotalCents?: number | null;
  vatCents?: number | null;
  totalCents?: number | null;
}

const ThankYou: React.FC = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const cartItems: any[] = []
  const { updateSubmission } = useFormSubmission();
  
  const [orderData, setOrderData] = useState<OrderData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const hasMoreItems = false;

  useEffect(() => {
    const sessionId = searchParams.get('session_id');
    // Guard: only allow after successful payment (we expect lastOrder or session_id)
    const hasOrder = !!sessionStorage.getItem('lastOrder')
    if (!sessionId && !hasOrder) {
      navigate('/services', { replace: true })
      return
    }
    
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
            const order = JSON.parse(savedOrder);
            setOrderData(order);
            
            // Update form submission to mark as completed
            console.log('ThankYou page - Updating form submission to completed...');
            try {
              const totalCents = (order.totalCents ?? order.amount ?? 0) as number
              const currency = order.currency || 'EUR'
              const total = Number((totalCents / 100).toFixed(2))
              const updateResult = await updateSubmission({
                currentStep: 'completed',
                status: 'completed',
                sessionId: sessionId,
                orderId: sessionId,
                totalAmountCents: totalCents,
                currency: currency,
                totalAmount: total
              });
              console.log('ThankYou page - Form submission marked as completed:', updateResult);
            } catch (updateError) {
              console.error('ThankYou page - Error updating form submission:', updateError);
              // Try fallback method
              try {
                console.log('ThankYou page - Trying fallback: find most recent submission...');
                const { formService } = await import('../services/formService');
                const userEmail = order.customer?.email;
                if (userEmail) {
                  const submissions = await formService.getSubmissionsByEmail(userEmail);
                  if (submissions.length > 0) {
                    const latestSubmission = submissions[0];
                    console.log('ThankYou page - Found latest submission:', latestSubmission.$id);
                    await formService.updateSubmission(latestSubmission.$id!, {
                      currentStep: 'completed',
                      status: 'completed',
                      sessionId: sessionId,
                      orderId: sessionId,
                      totalAmountCents: (order.totalCents ?? order.amount ?? 0) as number,
                      currency: order.currency || 'EUR',
                      totalAmount: Number(((order.totalCents ?? order.amount ?? 0) / 100).toFixed(2))
                    });
                    console.log('ThankYou page - Fallback update successful');
                  }
                }
              } catch (fallbackError) {
                console.error('ThankYou page - Fallback update also failed:', fallbackError);
              }
            }
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
    sessionStorage.removeItem('lastOrder');
    localStorage.removeItem('notarette_checkout_data');
  }, []);

  const handleBookAppointment = () => {
    const url = 'https://cal.com/marcus-whereby-xu25ac/meeting-appointment-with-notary-for-notarization'
    window.open(url, '_blank')
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
    <div className="min-h-screen bg-[#111827] py-12">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-12"
        >
          <CheckCircle className="w-20 h-20 text-green-500 mx-auto mb-6" />
          <h1 className="text-4xl font-bold text-green-500 mb-4">
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
              {orderData.items.map((item, index) => {
                const showQty = !(item.name || '').toLowerCase().startsWith('vat');
                return (
                  <div key={index} className="flex justify-between items-center py-3 border-b border-gray-200">
                    <div>
                      <p className="font-medium text-gray-900">{item.name}</p>
                      {showQty && (
                        <p className="text-sm text-gray-500">Quantity: {item.qty}</p>
                      )}
                    </div>
                    <span className="text-gray-900 font-medium">
                      {formatPrice(item.amountCents ?? 0, orderData.currency || 'EUR')}
                    </span>
                  </div>
                );
              })}
            </div>

            <div className="space-y-2 borde-t border-gray-200 pt-4">
              {/* <div className="flex justify-between items-center">
                <span className="text-gray-700">Subtotal</span>
                <span className="text-gray-900 font-medium">{formatPrice(orderData.subtotalCents ?? 0, orderData.currency || 'EUR')}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-700">VAT (21%)</span>
                <span className="text-gray-900 font-medium">{formatPrice(orderData.vatCents ?? 0, orderData.currency || 'EUR')}</span>
              </div> */}
              <div className="flex justify-between items-center">
                <span className="text-lg font-semibold text-gray-900">Total</span>
                <span className="text-2xl font-bold text-blue-600">{formatPrice((orderData.totalCents ?? (orderData.amount || 0)), orderData.currency || 'EUR')}</span>
              </div>
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
            <h2 className="text-2xl font-semibold text-gray-900 mb-2">Book Your Appointment</h2>
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
            {/* {orderData?.calLink && (
              <div className="text-sm text-blue-600 underline break-all">
                <a href={orderData.calLink} target="_blank" rel="noreferrer">{orderData.calLink}</a>
              </div>
            )} */}
            
            <p className="text-sm text-gray-500">
              You'll be redirected to Cal.com to select your preferred time slot.
            </p>
          </div>
        </motion.div>

        {
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
        }
      </div>
    </div>
  );
};

export default ThankYou;