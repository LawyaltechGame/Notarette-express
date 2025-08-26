// Direct Stripe API calls (works with Firebase free plan)
// We'll use the Stripe publishable key for client-side calls

// const STRIPE_PUBLISHABLE_KEY = 'pk_test_51RzArkGTuyVGItJwSanfj2QFq1qbCAfN0to2K6GeWh9kR1R764pTI4m6w1wcMP7N8S62pXua9IZxatUvikg8V6gQ00xpJ2XW5Q';

export interface StripePrice {
  priceId: string;
  unitAmount: number | null;
  currency: string | null;
  productName: string | null;
}

export interface StripeSession {
  paid: boolean;
  reason?: string | null;
  amount: number | null;
  currency: string | null;
  items: { name: string; qty: number; priceId: string }[];
  customer: { email: string | null; name: string | null };
}

class StripeService {
  // For now, we'll use mock data since direct Stripe API calls require server-side implementation
  // This avoids CORS issues and works with your free Firebase plan
  
  async getPrices(priceIds: string[]): Promise<StripePrice[]> {
    try {
      // Since we can't make direct Stripe API calls from frontend due to CORS,
      // we'll return mock data for now
      // In production, you'd want to use a free backend service like Vercel
      
      console.log('Using mock price data for development');
      
      // Return mock prices based on your service data
      const mockPrices: StripePrice[] = [
        {
          priceId: 'price_1NxY0000000000000000000000000001',
          unitAmount: 3000, // ₹30.00 in cents
          currency: 'INR',
          productName: 'Power of Attorney',
        },
        {
          priceId: 'price_placeholder_2',
          unitAmount: 4000, // ₹40.00 in cents (real Stripe price)
          currency: 'INR',
          productName: 'Certified Copy of Document',
        },
        // Add more mock prices as needed
      ];
      
      return mockPrices.filter(price => priceIds.includes(price.priceId));
    } catch (error) {
      console.error('Error fetching prices:', error);
      throw new Error('Failed to fetch prices from Stripe');
    }
  }

  async checkSession(_sessionId: string): Promise<StripeSession> {
    try {
      // For now, return mock session data
      // In production, you'd implement this with a free backend service
      
      console.log('Using mock session data for development');
      
      return {
        paid: true, // Mock successful payment
        amount: 4000, // ₹40.00 for Certified Copy of Document
        currency: 'INR',
        items: [
          {
            name: 'Certified Copy of Document',
            qty: 1,
            priceId: 'price_placeholder_2',
          },
        ],
        customer: {
          email: 'test@example.com',
          name: 'Test Customer',
        },
      };
    } catch (error) {
      console.error('Error checking session:', error);
      throw new Error('Failed to verify payment session');
    }
  }

  formatPrice(cents: number, currency: string): string {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: currency,
    }).format(cents / 100);
  }

  openPaymentLink(paymentLink: string): void {
    if (paymentLink) {
      window.open(paymentLink, '_blank');
    }
  }
}

export const stripeService = new StripeService();

// === Frontend helper to call callable and redirect ===
import { getFunctions, httpsCallable, connectFunctionsEmulator } from 'firebase/functions'
import { app } from '../config/firebase'

export type CheckoutItemInput = {
  serviceId: string
  quantity: number
  addOnIds?: string[]
  optionKeys?: string[]
  extraCopies?: number
}

export async function createCheckoutAndRedirect(items: CheckoutItemInput[]) {
  const functions = getFunctions(app, 'us-central1')
  if (typeof window !== 'undefined' && window.location.hostname === 'localhost') {
    try {
      connectFunctionsEmulator(functions, '127.0.0.1', 5001)
    } catch {}
  }
  const callable = httpsCallable<{ items: CheckoutItemInput[] }, { url: string }>(functions, 'createCheckout')
  const { data } = await callable({ items })
  if (!data?.url) throw new Error('No checkout URL returned')
  window.location.assign(data.url)
}

