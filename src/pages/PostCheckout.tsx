import React, { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useAppDispatch, useAppSelector } from '../hooks/useAppDispatch';
import { removeItem, selectCartItems } from '../store/slices/cartSlice';
import { stripeService } from '../services/stripeService';

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
  const cartItems = useAppSelector(selectCartItems);
  
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [data, setData] = useState<CheckSessionResponse | null>(null);

  useEffect(() => {
    const sessionId = searchParams.get('session_id');
    
    if (!sessionId) {
      setError('No session ID provided');
      setIsLoading(false);
      return;
    }

    const verifyPayment = async () => {
      try {
        setIsLoading(true);
        setError(null);
        
        // Use mock service instead of Firebase Functions
        const result = await stripeService.checkSession(sessionId);
        setData(result);
        
        if (result.paid) {
          sessionStorage.setItem('lastOrder', JSON.stringify(result));
          
          // Find the paid service in cart and remove it
          const paidService = findPaidService(result);
          if (paidService) {
            dispatch(removeItem(paidService.id));
          }
          
          navigate(`/thank-you?session_id=${sessionId}`, { replace: true });
        } else {
          // Payment failed, restore cart and redirect to checkout
          console.log('Payment failed:', result.reason);
          navigate('/checkout');
        }
      } catch (error) {
        console.error('Error verifying payment:', error);
        setError('Failed to verify payment. Please contact support.');
        navigate('/checkout');
      } finally {
        setIsLoading(false);
      }
    };

    verifyPayment();
  }, [searchParams, navigate, dispatch]);

  const findPaidService = (sessionData: CheckSessionResponse) => {
    // Find the service in cart that matches the paid item
    return cartItems.find(item => 
      sessionData.items.some(sessionItem => 
        sessionItem.name === item.name
      )
    );
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Verifying your payment...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="text-red-500 text-6xl mb-4">❌</div>
          <h1 className="text-2xl font-bold text-gray-900 mb-4">Payment Verification Failed</h1>
          <p className="text-gray-600 mb-6">{error}</p>
          <button
            onClick={() => navigate('/checkout')}
            className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors"
          >
            Return to Checkout
          </button>
        </div>
      </div>
    );
  }

  return null; // This component should redirect, so this shouldn't render
};

export default PostCheckout;
