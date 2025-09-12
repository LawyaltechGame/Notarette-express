// Stripe service integrated with Appwrite Functions

import { client, appwriteAccount } from '../lib/appwrite';
import { Functions } from 'appwrite';
import { ENVObj } from '../lib/constant';

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
  calLink?: string | null;
}

class StripeService {
  // For now, we'll use mock data since direct Stripe API calls require server-side implementation
  
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
          unitAmount: 100, // €1.00 in cents
          currency: 'EUR',
          productName: 'Power of Attorney',
        },
        {
          priceId: 'price_placeholder_2',
          unitAmount: 100, // €1.00 in cents
          currency: 'EUR',
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

  async checkSession(sessionId: string): Promise<StripeSession> {
    try {
      const functionId = ENVObj.VITE_APPWRITE_FUNCTION_ID || 'payments-with-stripe';
      const functions = new Functions(client);

      const response = await functions.createExecution(
        functionId,
        JSON.stringify({ sessionId }),
        false
      );

      if (!response.responseBody) {
        throw new Error('Empty response from verification function');
      }

      const result = JSON.parse(response.responseBody);
      if (result.error) {
        throw new Error(result.error);
      }

      return {
        paid: !!result.paid,
        amount: result.amount ?? null,
        currency: (result.currency || 'eur').toUpperCase(),
        items: Array.isArray(result.items) ? result.items : [],
        customer: result.customer || { email: null, name: null },
        calLink: result.calLink || null,
      };
    } catch (error) {
      console.error('Error checking session:', error);
      throw new Error('Failed to verify payment session');
    }
  }

  formatPrice(cents: number, currency: string): string {
    return new Intl.NumberFormat('en-IE', {
      style: 'currency',
      currency: currency,
    }).format(cents / 100);
  }

  openPaymentLink(paymentLink: string): void {
    if (paymentLink) {
      window.open(paymentLink, '_blank');
    }
  }

  async refundBySessionId(sessionId: string, amountCents?: number, reason?: string) {
    const functionId = ENVObj.VITE_APPWRITE_FUNCTION_ID || 'payments-with-stripe'
    const functions = new Functions(client)
    const payload: any = { refund: true, sessionId }
    if (typeof amountCents === 'number') payload.amountCents = amountCents
    if (reason) payload.reason = reason
    const exec = await functions.createExecution(functionId, JSON.stringify(payload), false)
    let result: any = {}
    try { result = JSON.parse(exec.responseBody || '{}') } catch {}
    if (!result.ok) throw new Error(result.error || 'Refund failed')
    return result
  }

  async refundByPaymentIntentId(paymentIntentId: string, amountCents?: number, reason?: string) {
    const functionId = ENVObj.VITE_APPWRITE_FUNCTION_ID || 'payments-with-stripe'
    const functions = new Functions(client)
    const payload: any = { refund: true, paymentIntentId }
    if (typeof amountCents === 'number') payload.amountCents = amountCents
    if (reason) payload.reason = reason
    const exec = await functions.createExecution(functionId, JSON.stringify(payload), false)
    let result: any = {}
    try { result = JSON.parse(exec.responseBody || '{}') } catch {}
    if (!result.ok) throw new Error(result.error || 'Refund failed')
    return result
  }
}

export const stripeService = new StripeService();
export type CheckoutItemInput = {
  serviceId: string
  quantity: number
  addOnIds?: string[]
  optionKeys?: string[]
  extraCopies?: number
}

// Connect to Appwrite Function for Stripe Checkout
export async function createCheckoutAndRedirect(items: CheckoutItemInput[]) {
  try {
    // Get the current user session
    const session = await appwriteAccount.getSession('current');
    
    if (!session) {
      throw new Error('User not authenticated. Please log in first.');
    }

    // Get the function ID from environment or use a default
    const functionId = ENVObj.VITE_APPWRITE_FUNCTION_ID || 'payments-with-stripe';
    
    // Get current account details for email/id mapping
    let userId: string | null = null;
    let userEmail: string | null = null;
    try {
      const acct = await appwriteAccount.get();
      userId = acct.$id || null;
      // prefer verified email if available
      userEmail = (acct.email || null) as any;
    } catch (_) {}

    // Fallback: read from local storage user (our app's auth)
    if (!userEmail && typeof window !== 'undefined') {
      try {
        const stored = localStorage.getItem('LOCAL_USER');
        if (stored) {
          const parsed = JSON.parse(stored);
          // tolerate shapes like { user: { email } } or { email }
          userEmail = parsed?.user?.email || parsed?.email || null;
          userId = userId || parsed?.user?.id || parsed?.id || null;
        }
      } catch {}
    }

    // Finalize the email to prefill: allow override via env (for debugging), else current userEmail
    const prefillEmail = (ENVObj as any).VITE_STRIPE_PREFILL_EMAIL || userEmail || null;

    // Prepare the request payload
    const payload = {
      successUrl: `${window.location.origin}/post-checkout?session_id={CHECKOUT_SESSION_ID}`,
      failureUrl: `${window.location.origin}/checkout`,
      items: items,
      idempotencyKey: `fe_${Date.now()}_${Math.random().toString(36).slice(2)}`,
      userId,
      userEmail: prefillEmail
    };

    // Call the Appwrite Function
    const functions = new Functions(client);
    console.log('Calling Appwrite Function:', functionId);
    console.log('Payload:', payload);
    
    // First try synchronous execution (fast path)
    try {
      const syncResp = await functions.createExecution(
        functionId,
        JSON.stringify(payload),
        false // sync
      );
      if (syncResp && typeof syncResp.responseBody === 'string' && syncResp.responseBody.length > 0) {
        try {
          const parsed = JSON.parse(syncResp.responseBody);
          const redirectUrl = parsed.url || parsed.checkoutUrl;
          if (redirectUrl) {
            window.location.href = redirectUrl;
            return;
          }
        } catch (_) {
          // Not JSON; ignore and try async fallback
        }
      }
      // If sync returns but without usable body, fall through to async
    } catch (e) {
      // Likely timeout; proceed to async fallback
    }

    // Fallback: run asynchronously and poll up to ~25s
    const exec = await functions.createExecution(
      functionId,
      JSON.stringify(payload),
      true // async
    );
    const start = Date.now();
    let latest = exec;
    while (Date.now() - start < 25000) {
      if (latest.status === 'completed') break;
      if (latest.status === 'failed') {
        throw new Error(latest.responseBody || 'Payment function failed');
      }
      await new Promise(r => setTimeout(r, 1000));
      latest = await functions.getExecution(functionId, latest.$id as any);
    }
    if (latest.status !== 'completed') {
      throw new Error('Payment function did not complete in time. Please try again.');
    }
    let result: any = {};
    try { result = JSON.parse(latest.responseBody || '{}'); } catch { }
    const redirectUrl = result && (result.url || result.checkoutUrl);
    if (redirectUrl) {
      window.location.href = redirectUrl;
      return;
    }
    throw new Error('Invalid response from payment function');
  } catch (error) {
    console.error('Error creating checkout session:', error);
    throw new Error('Failed to create checkout session. Please try again.');
  }
}

// Test function to verify Appwrite Function connection
export async function testAppwriteFunction() {
  try {
    const functionId = ENVObj.VITE_APPWRITE_FUNCTION_ID || 'payments-with-stripe';
    const functions = new Functions(client);
    
    console.log('Testing Appwrite Function connection...');
    console.log('Function ID:', functionId);
    console.log('Appwrite Endpoint:', ENVObj.VITE_APPWRITE_ENDPOINT);
    console.log('Project ID:', ENVObj.VITE_APPWRITE_PROJECT_ID);
    
    const response = await functions.createExecution(
      functionId,
      JSON.stringify({ test: true }),
      false
    );
    
    console.log('Test Response:', response);
    console.log('Response Body:', response.responseBody);
    return response;
  } catch (error) {
    console.error('Test failed:', error);
    throw error;
  }
}

// Debug function to test checkout specifically
export async function debugCheckout() {
  try {
    const testItems = [{
      serviceId: 'test-service',
      quantity: 1,
      addOnIds: [],
      optionKeys: [],
      extraCopies: 0
    }];
    
    console.log('Debugging checkout with items:', testItems);
    await createCheckoutAndRedirect(testItems);
  } catch (error) {
    console.error('Debug checkout failed:', error);
    throw error;
  }
}

