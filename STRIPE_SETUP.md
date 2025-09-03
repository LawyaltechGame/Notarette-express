# 🚀 Stripe Payment Links Integration Setup

This guide will help you set up Stripe Payment Links integration with Appwrite Functions and React.

## 📋 Prerequisites

- Appwrite project with Functions enabled
- Stripe account (test or live)
- React app with Appwrite Authentication already configured

## 🔧 Appwrite Functions Setup

### 1. Deploy the Stripe Function

1. **Navigate to the functions directory**:
   ```bash
   cd functions/Payments\ with\ Stripe/
   ```

2. **Install dependencies**:
   ```bash
   npm install
   ```

3. **Deploy to Appwrite**:
   ```bash
   # Using Appwrite CLI
   appwrite functions createDeployment --functionId=payments-with-stripe --code=.
   
   # Or deploy through Appwrite Console
   # 1. Go to Appwrite Console → Functions
   # 2. Create new function or update existing
   # 3. Upload the function code
   ```

### 2. Environment Configuration

Set these environment variables in your Appwrite Function:

```bash
STRIPE_SECRET_KEY=sk_test_your_test_key_here
STRIPE_WEBHOOK_SECRET=whsec_your_webhook_secret_here
APPWRITE_DATABASE_ID=orders
APPWRITE_COLLECTION_ID=orders
```

### 3. Function Permissions

Ensure your function has these permissions:
- `databases.read`
- `databases.write`
- `collections.read`
- `collections.write`

## 🎯 Stripe Configuration

### 1. Get Your Stripe Keys

1. Go to **Stripe Dashboard** → **Developers** → **API Keys**
2. Copy your **Secret Key** (starts with `sk_test_` or `sk_live_`)
3. Copy your **Publishable Key** (starts with `pk_test_` or `pk_live_`)

### 2. Set Up Webhooks (Optional)

1. Go to **Stripe Dashboard** → **Developers** → **Webhooks**
2. Add endpoint: `https://your-appwrite-endpoint/v1/functions/your-function-id/executions`
3. Select events: `checkout.session.completed`
4. Copy the webhook secret

## 🌐 Frontend Integration

### 1. Environment Variables

Add these to your `.env` file:

```env
VITE_APPWRITE_ENDPOINT=https://your-appwrite-endpoint
VITE_APPWRITE_PROJECT_ID=your-project-id
VITE_APPWRITE_FUNCTION_ID=payments-with-stripe
VITE_STRIPE_PUBLISHABLE_KEY=pk_test_your_stripe_key_here
```

### 2. Payment Flow

1. User clicks "Pay Now" → Calls Appwrite Function
2. Function creates Stripe Checkout Session
3. User completes payment → Stripe redirects to `/post-checkout`
4. `/post-checkout` verifies payment via Appwrite Function
5. If successful → Redirects to `/thank-you`

## 🔒 Security Features

- **Input Validation**: All Appwrite Functions validate input data
- **Error Handling**: Comprehensive error handling for Stripe API calls
- **Session Verification**: Payment verification via Appwrite Functions
- **No Client Secrets**: Stripe secret key only on server side

## 🚀 Deployment

### Frontend Deployment
```bash
npm run build
```

### Appwrite Function Deployment
```bash
# Using Appwrite CLI
appwrite functions createDeployment --functionId=payments-with-stripe --code=.

# Or through Appwrite Console
```

## 🧪 Testing

### 1. Test Payment Flow
- Use Stripe test cards: `4242 4242 4242 4242`
- Verify redirects work correctly
- Test payment failure scenarios

### 2. Test Appwrite Function
```bash
# Test function execution
curl -X POST "https://your-appwrite-endpoint/v1/functions/payments-with-stripe/executions" \
  -H "Content-Type: application/json" \
  -H "X-Appwrite-Project: your-project-id" \
  -d '{"successUrl": "https://yourdomain.com/success", "failureUrl": "https://yourdomain.com/failure"}'
```

### 3. Test Frontend Integration
- Verify payment button works
- Test payment link opening
- Verify post-payment flow

## 📱 User Experience

### Before Payment
- Services show pricing
- Clear pricing and service options
- One-click payment access

### After Payment
- Immediate payment verification
- Clear success/error messages
- Seamless Cal.com integration
- Order details and customer info

## 🔍 Troubleshooting

### Common Issues

1. **Function not found**
   - Check function ID in environment variables
   - Verify function is deployed
   - Check Appwrite Console for function status

2. **Payment verification fails**
   - Verify session ID format
   - Check Stripe webhook configuration
   - Review Appwrite Function logs

3. **Redirects not working**
   - Verify success URLs in function
   - Check frontend routing configuration
   - Ensure SPA routing is configured

### Debug Steps

1. Check browser console for errors
2. Review Appwrite Function logs
3. Verify Stripe Dashboard for payment status
4. Test with Stripe test mode first

## 📚 API Reference

### Appwrite Function Endpoints

#### `POST /checkout`
```typescript
Input: { 
  successUrl: string, 
  failureUrl: string, 
  items: CheckoutItemInput[] 
}
Output: { url: string }
```

#### `POST /webhook`
```typescript
Input: Stripe webhook event
Output: { success: boolean }
```

### Frontend Services

#### `stripeService.createCheckoutAndRedirect(items)`
Creates Stripe checkout session via Appwrite Function

#### `stripeService.checkSession(sessionId)`
Verifies payment session

#### `stripeService.openPaymentLink(url)`
Opens Stripe payment link

## 🎉 Success Criteria

✅ Services display pricing  
✅ "Pay Now" calls Appwrite Function  
✅ Post-payment redirects work correctly  
✅ Payment verification succeeds  
✅ Thank you page shows order details  
✅ Cal.com booking integration works  
✅ Works with Appwrite Functions  
✅ Deploys successfully  

## 📞 Support

For issues:
1. Check Appwrite Function logs
2. Verify Stripe Dashboard
3. Review browser console errors
4. Test with Stripe test mode

---

**Note**: This integration works with Appwrite Functions and makes outbound HTTPS calls to Stripe's API.
