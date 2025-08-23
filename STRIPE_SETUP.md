# 🚀 Stripe Payment Links Integration Setup

This guide will help you set up Stripe Payment Links integration with Firebase Functions (Spark plan) and React.

## 📋 Prerequisites

- Firebase project with Functions and Hosting enabled
- Stripe account (test or live)
- React app with Firebase Authentication already configured

## 🔧 Firebase Functions Setup

### 1. Install Dependencies

```bash
cd functions
npm install stripe@^14.0.0
```

### 2. Environment Configuration

#### Development (Local Emulator)
Create `functions/.env.local`:
```bash
STRIPE_SECRET_KEY=sk_test_your_test_key_here
```

#### Production
```bash
firebase functions:config:set stripe.secret_key="sk_live_your_live_key_here"
```

### 3. Deploy Functions

```bash
# Development
firebase emulators:start --only functions,hosting

# Production
firebase deploy --only functions
```

## 🎯 Stripe Configuration

### 1. Create Payment Links

For each service, create a Payment Link in Stripe Dashboard:

1. Go to **Stripe Dashboard** → **Payment Links**
2. Click **Create payment link**
3. Set:
   - **Product**: Your service name
   - **Price**: Set your service price
   - **Success URL**: 
     - DEV: `http://localhost:5173/post-checkout?session_id={CHECKOUT_SESSION_ID}`
     - PROD: `https://notarette-express.vercel.app/post-checkout?session_id={CHECKOUT_SESSION_ID}`
   - **Cancel URL**: Your services page

### 2. Update Service Data

Update `src/data/services.ts` with your actual Stripe data:

```typescript
{
  id: '1',
  name: 'Power of Attorney',
  stripePriceId: 'price_actual_stripe_price_id',
  paymentLink: 'https://buy.stripe.com/actual_payment_link',
  // ... other fields
}
```

## 🌐 Frontend Integration

### 1. Service Cards

Service cards now show:
- Live prices from Stripe (if available)
- "Buy Now" button that opens Payment Links
- Fallback to local prices if Stripe fails

### 2. Payment Flow

1. User clicks "Buy Now" → Opens Stripe Payment Link
2. User completes payment → Stripe redirects to `/post-checkout`
3. `/post-checkout` verifies payment via Firebase Function
4. If successful → Redirects to `/thank-you`
5. `/thank-you` shows order details and Cal.com booking link

## 🔒 Security Features

- **Input Validation**: All Firebase Functions validate input data
- **Error Handling**: Comprehensive error handling for Stripe API calls
- **Session Verification**: Payment verification via Firebase Functions
- **No Client Secrets**: Stripe secret key only on server side

## 🚀 Deployment

### Firebase Hosting
```bash
npm run build
firebase deploy --only hosting
```

### Vercel
```bash
vercel --prod
```

## 🧪 Testing

### 1. Test Payment Links
- Use Stripe test cards: `4242 4242 4242 4242`
- Verify redirects work correctly
- Test payment failure scenarios

### 2. Test Firebase Functions
```bash
firebase emulators:start --only functions
# Test getPrices and checkSession functions
```

### 3. Test Frontend Integration
- Verify prices load from Stripe
- Test payment link opening
- Verify post-payment flow

## 📱 User Experience

### Before Payment
- Services show live Stripe prices
- Clear pricing and service options
- One-click payment link access

### After Payment
- Immediate payment verification
- Clear success/error messages
- Seamless Cal.com integration
- Order details and customer info

## 🔍 Troubleshooting

### Common Issues

1. **Prices not loading**
   - Check Stripe API key
   - Verify price IDs in services data
   - Check Firebase Functions logs

2. **Payment verification fails**
   - Verify session ID format
   - Check Stripe webhook configuration
   - Review Firebase Function logs

3. **Redirects not working**
   - Verify success URLs in Stripe
   - Check Firebase hosting configuration
   - Ensure SPA routing is configured

### Debug Steps

1. Check browser console for errors
2. Review Firebase Functions logs
3. Verify Stripe Dashboard for payment status
4. Test with Stripe test mode first

## 📚 API Reference

### Firebase Functions

#### `getPrices`
```typescript
Input: { priceIds: string[] }
Output: PriceResponse[]
```

#### `checkSession`
```typescript
Input: { sessionId: string }
Output: CheckSessionResponse
```

### Frontend Services

#### `stripeService.getPrices(priceIds)`
Fetches live prices from Stripe

#### `stripeService.checkSession(sessionId)`
Verifies payment session

#### `stripeService.openPaymentLink(url)`
Opens Stripe payment link

## 🎉 Success Criteria

✅ Services display live Stripe prices  
✅ "Buy Now" opens Payment Links  
✅ Post-payment redirects work correctly  
✅ Payment verification succeeds  
✅ Thank you page shows order details  
✅ Cal.com booking integration works  
✅ Works on Firebase Spark plan  
✅ Deploys to Vercel successfully  

## 📞 Support

For issues:
1. Check Firebase Functions logs
2. Verify Stripe Dashboard
3. Review browser console errors
4. Test with Stripe test mode

---

**Note**: This integration works entirely on Firebase's free Spark plan since it only makes outbound HTTPS calls to Stripe's API, which is allowed.
