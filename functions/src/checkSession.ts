import * as functions from 'firebase-functions';
import Stripe from 'stripe';

// Initialize Stripe with secret key
// Dev (emulator): STRIPE_SECRET_KEY=sk_test_*** available to the emulator
// Prod (cloud): firebase functions:config:set stripe.secret_key="sk_live_***"
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || '', {
  apiVersion: '2023-10-16',
});

interface CheckSessionRequest {
  sessionId: string;
}

interface CheckSessionResponse {
  paid: boolean;
  reason?: string | null;
  amount: number | null;
  currency: string | null;
  items: { name: string; qty: number; priceId: string }[];
  customer: { email: string | null; name: string | null };
}

export const checkSession = functions.https.onCall(
  async (data: CheckSessionRequest, context): Promise<CheckSessionResponse> => {
    try {
      const { sessionId } = data;
      
      if (!sessionId) {
        throw new functions.https.HttpsError('invalid-argument', 'Session ID is required');
      }

      // Validate session ID format
      if (!sessionId.startsWith('cs_')) {
        throw new functions.https.HttpsError('invalid-argument', 'Invalid session ID format');
      }

      // Retrieve checkout session from Stripe
      const session = await stripe.checkout.sessions.retrieve(sessionId, {
        expand: ['payment_intent', 'line_items.data.price.product', 'customer'],
      });

      const paid = session.payment_status === 'paid';
      let reason: string | null = null;
      
      if (!paid && session.payment_intent && typeof session.payment_intent !== 'string') {
        const paymentIntent = session.payment_intent as Stripe.PaymentIntent;
        if (paymentIntent.last_payment_error?.message) {
          reason = paymentIntent.last_payment_error.message;
        } else {
          reason = `Payment status: ${session.payment_status}`;
        }
      }

      // Extract line items
      const items = session.line_items?.data.map((item) => ({
        name: item.description || 'Unknown item',
        qty: item.quantity || 1,
        priceId: item.price?.id || '',
      })) || [];

      // Extract customer information
      const customer = {
        email: session.customer_details?.email || null,
        name: session.customer_details?.name || null,
      };

      console.log(`Session ${sessionId} checked - Paid: ${paid}, Amount: ${session.amount_total}`);
      
      return {
        paid,
        reason,
        amount: session.amount_total,
        currency: session.currency?.toUpperCase() || null,
        items,
        customer,
      };
      
    } catch (error) {
      console.error('Error checking session:', error);
      
      if (error instanceof Stripe.errors.StripeError) {
        throw new functions.https.HttpsError('internal', `Stripe error: ${error.message}`);
      }
      
      if (error instanceof functions.https.HttpsError) {
        throw error;
      }
      
      throw new functions.https.HttpsError('internal', 'Failed to verify payment session');
    }
  }
);
