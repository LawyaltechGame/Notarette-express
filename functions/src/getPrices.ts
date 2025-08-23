import * as functions from 'firebase-functions';
import Stripe from 'stripe';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || '', {
  apiVersion: '2023-10-16',
});

interface GetPricesRequest {
  priceIds: string[];
}

interface PriceResponse {
  priceId: string;
  unitAmount: number | null;
  currency: string | null;
  productName: string | null;
}

export const getPrices = functions.https.onCall(
  async (data: GetPricesRequest, context): Promise<PriceResponse[]> => {
    try {
      const { priceIds } = data;
      
      if (!priceIds || !Array.isArray(priceIds) || priceIds.length === 0) {
        throw new functions.https.HttpsError('invalid-argument', 'Price IDs array is required');
      }

      // Validate price IDs format
      if (!priceIds.every(id => id.startsWith('price_'))) {
        throw new functions.https.HttpsError('invalid-argument', 'Invalid price ID format');
      }

      // Fetch prices from Stripe
      const pricePromises = priceIds.map(async (priceId) => {
        try {
          const price = await stripe.prices.retrieve(priceId, {
            expand: ['product'],
          });

          const product = price.product as Stripe.Product;
          
          return {
            priceId: price.id,
            unitAmount: price.unit_amount,
            currency: price.currency,
            productName: product?.name || null,
          };
        } catch (error) {
          console.error(`Error retrieving price ${priceId}:`, error);
          return {
            priceId,
            unitAmount: null,
            currency: null,
            productName: null,
          };
        }
      });

      const prices = await Promise.all(pricePromises);
      
      console.log(`Retrieved ${prices.length} prices from Stripe`);
      return prices;
      
    } catch (error) {
      console.error('Error in getPrices function:', error);
      
      if (error instanceof Stripe.errors.StripeError) {
        throw new functions.https.HttpsError('internal', `Stripe error: ${error.message}`);
      }
      
      if (error instanceof functions.https.HttpsError) {
        throw error;
      }
      
      throw new functions.https.HttpsError('internal', 'Failed to retrieve prices');
    }
  }
);

