import React, { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useAppDispatch } from '../hooks/useAppDispatch';
// cart removed
import { stripeService } from '../services/stripeService';
import { useFormSubmission } from '../hooks/useFormSubmission';

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
  const { updateSubmission } = useFormSubmission();
  
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [, setData] = useState<CheckSessionResponse | null>(null);

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
        
        // Use mock service instead of backend API
        const result = await stripeService.checkSession(sessionId);
        setData(result);
        
        if (result.paid) {
          sessionStorage.setItem('lastOrder', JSON.stringify(result));
          
          // Update form submission to mark as completed
          try {
            console.log('Attempting to update form submission to completed...')
            const updateResult = await updateSubmission({
              currentStep: 'completed',
              status: 'completed',
              sessionId: sessionId,
              orderId: sessionId // Using sessionId as orderId for now
            })
            console.log('Form submission marked as completed in Appwrite:', updateResult)
          } catch (error) {
            console.error('Error updating form submission completion:', error)
            // Try to find and update the most recent submission for this user
            try {
              console.log('Trying fallback: find most recent submission...')
              const { formService } = await import('../services/formService')
              const userEmail = result.customer?.email
              if (userEmail) {
                const submissions = await formService.getSubmissionsByEmail(userEmail)
                if (submissions.length > 0) {
                  const latestSubmission = submissions[0]
                  console.log('Found latest submission:', latestSubmission.$id)
                  await formService.updateSubmission(latestSubmission.$id!, {
                    currentStep: 'completed',
                    status: 'completed',
                    sessionId: sessionId,
                    orderId: sessionId
                  })
                  console.log('Fallback update successful')
                }
              }
            } catch (fallbackError) {
              console.error('Fallback update also failed:', fallbackError)
            }
          }
          
          // Cart removed: skip removing paid service
          
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

  // Cart removed: no finder needed

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
