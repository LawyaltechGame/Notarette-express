 
 import React, { useEffect, useState } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { XCircle, Loader2, ArrowLeft } from 'lucide-react';
import { stripeService } from '../services/stripeService';
import { useAppDispatch } from '../hooks/useAppDispatch';
// cart removed
import Button from '../components/ui/Button';
import Card from '../components/ui/Card';

interface CheckSessionResponse {
  paid: boolean;
  reason?: string | null;
  amount: number | null;
  currency: string | null;
  items: { name: string; qty: number; priceId: string }[];
  customer: { email: string | null; name: string | null };
}

const PostCheckout: React.FC = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [sessionData, setSessionData] = useState<CheckSessionResponse | null>(null);

  useEffect(() => {
    const verifyPayment = async () => {
      try {
        const sessionId = searchParams.get('session_id');
        
        if (!sessionId) {
          setError('No session ID found in URL');
          setLoading(false);
          return;
        }

        // Call the payment verification service
        const data = await stripeService.checkSession(sessionId);
        setSessionData(data);

        if (data.paid) {
          // Payment successful - save to sessionStorage and redirect to thank you page
          sessionStorage.setItem('lastOrder', JSON.stringify(data));
          
          // Cart removed: skip removing paid service
          
          navigate(`/thank-you?session_id=${sessionId}`, { replace: true });
        } else {
          // Payment failed
          setLoading(false);
        }
      } catch (err: any) {
        console.error('Error verifying payment:', err);
        setError(err.message || 'Failed to verify payment');
        setLoading(false);
      }
    };

    verifyPayment();
  }, [searchParams, navigate, dispatch]);

  // Cart removed: no finder needed

  const formatCurrency = (amount: number | null, currency: string | null) => {
    if (!amount || !currency) return 'N/A';
    return stripeService.formatPrice(amount, currency);
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center"
        >
          <Loader2 className="w-12 h-12 text-teal-600 animate-spin mx-auto mb-4" />
          <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-2">
            Verifying Payment...
          </h2>
          <p className="text-gray-600 dark:text-gray-400">
            Please wait while we confirm your payment with Stripe.
          </p>
        </motion.div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="max-w-md w-full mx-auto text-center"
        >
          <XCircle className="w-16 h-16 text-red-500 mx-auto mb-4" />
          <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-2">
            Payment Verification Failed
          </h2>
          <p className="text-gray-600 dark:text-gray-400 mb-6">{error}</p>
          <Button
            onClick={() => navigate('/services')}
            variant="primary"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Services
          </Button>
        </motion.div>
      </div>
    );
  }

  if (sessionData && !sessionData.paid) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="max-w-md w-full mx-auto text-center"
        >
          <XCircle className="w-16 h-16 text-red-500 mx-auto mb-4" />
          <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-2">
            Payment Not Completed
          </h2>
          <p className="text-gray-600 dark:text-gray-400 mb-4">
            {sessionData.reason || 'Your payment was not successful.'}
          </p>
          
          <Card className="mb-6">
            <div className="p-4 text-left">
              <p className="text-sm text-gray-600 dark:text-gray-400">
                <strong>Amount:</strong> {formatCurrency(sessionData.amount, sessionData.currency)}
              </p>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                <strong>Items:</strong> {sessionData.items.length} item(s)
              </p>
            </div>
          </Card>
          
          <p className="text-sm text-gray-500 dark:text-gray-400 mb-6">
            You can try the payment again or contact support if you need assistance.
          </p>
          
          <div className="space-y-3">
            <Button
              onClick={() => navigate('/services')}
              variant="primary"
              className="w-full"
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Services
            </Button>
            
            <Button
              onClick={() => navigate('/checkout')}
              variant="ghost"
              className="w-full"
            >
              Return to Checkout
            </Button>
          </div>
        </motion.div>
      </div>
    );
  }

  return null;
};

export default PostCheckout;
