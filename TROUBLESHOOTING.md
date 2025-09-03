# 🔧 Troubleshooting Appwrite Function Integration

## Current Error: "Not Found" Response

The error `SyntaxError: Unexpected token 'N', "Not Found" is not valid JSON` indicates that the Appwrite Function is not found or not properly deployed.

## 🔍 Step-by-Step Debugging

### 1. Check Function Deployment

1. **Go to Appwrite Console** → **Functions**
2. **Verify the function exists** with ID: `payments-with-stripe`
3. **Check deployment status** - should show "Deployed"
4. **Verify the function ID** matches your environment variable

### 2. Check Environment Variables

Verify your `.env` file has the correct values:

```env
VITE_APPWRITE_ENDPOINT=https://your-appwrite-endpoint
VITE_APPWRITE_PROJECT_ID=your-project-id
VITE_APPWRITE_FUNCTION_ID=payments-with-stripe
```

### 3. Deploy the Function

If the function doesn't exist, deploy it:

```bash
# Navigate to function directory
cd functions/Payments\ with\ Stripe/

# Install dependencies
npm install

# Deploy using Appwrite CLI
appwrite functions createDeployment --functionId=payments-with-stripe --code=.

# Or deploy through Appwrite Console:
# 1. Go to Functions → Create Function
# 2. Name: "payments-with-stripe"
# 3. Runtime: Node.js 18.0
# 4. Entrypoint: src/main.js
# 5. Upload the function code
```

### 4. Set Function Environment Variables

In Appwrite Console → Functions → Your Function → Settings → Environment Variables:

```env
STRIPE_SECRET_KEY=sk_test_your_test_key_here
STRIPE_WEBHOOK_SECRET=whsec_your_webhook_secret_here
APPWRITE_DATABASE_ID=orders
APPWRITE_COLLECTION_ID=orders
```

### 5. Set Function Permissions

In Appwrite Console → Functions → Your Function → Settings → Permissions:

- ✅ `databases.read`
- ✅ `databases.write`
- ✅ `collections.read`
- ✅ `collections.write`

### 6. Test Function Directly

Test the function using curl or Postman:

```bash
curl -X POST "https://your-appwrite-endpoint/v1/functions/payments-with-stripe/executions" \
  -H "Content-Type: application/json" \
  -H "X-Appwrite-Project: your-project-id" \
  -H "X-Appwrite-User-ID: your-user-id" \
  -d '{
    "successUrl": "https://yourdomain.com/success",
    "failureUrl": "https://yourdomain.com/failure",
    "items": [{"serviceId": "test", "quantity": 1}]
  }'
```

## 🚨 Common Issues & Solutions

### Issue 1: Function Not Found
**Error**: `"Not Found" response
**Solution**: 
- Verify function ID in environment variables
- Check if function is deployed
- Ensure function name matches exactly

### Issue 2: Authentication Error
**Error**: `401 Unauthorized`
**Solution**:
- Check if user is logged in
- Verify Appwrite project ID
- Check API keys

### Issue 3: Function Execution Error
**Error**: `500 Internal Server Error`
**Solution**:
- Check function logs in Appwrite Console
- Verify environment variables are set
- Check Stripe API key validity

### Issue 4: CORS Error
**Error**: `CORS policy blocked`
**Solution**:
- Add your domain to Appwrite project platforms
- Go to Appwrite Console → Settings → Platforms → Add Platform

## 🔄 Alternative: Quick Test Setup

If you want to test the payment flow quickly, you can temporarily use a mock implementation:

```typescript
// In stripeService.ts, temporarily replace createCheckoutAndRedirect with:
export async function createCheckoutAndRedirect(items: CheckoutItemInput[]) {
  // Mock implementation for testing
  console.log('Mock checkout with items:', items);
  
  // Simulate redirect to Stripe
  const mockStripeUrl = 'https://checkout.stripe.com/pay/cs_test_mock#fidkdWxOYHwnP';
  window.location.href = mockStripeUrl;
}
```

## 📞 Getting Help

1. **Check Appwrite Function Logs** in the Console
2. **Verify Stripe Dashboard** for API key status
3. **Test with Stripe test mode** first
4. **Check browser console** for detailed error messages

## ✅ Success Checklist

- [ ] Function deployed in Appwrite Console
- [ ] Environment variables set correctly
- [ ] Function permissions configured
- [ ] User authenticated before payment
- [ ] Stripe API keys valid
- [ ] Function returns valid JSON response
