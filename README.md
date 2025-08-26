# Notarette Express - Remote Notarization Services

A modern React application for remote notarization services with Stripe payment processing and Cal.com appointment booking integration.

## Features

- **Service Selection**: Browse and select from 10 different notarization services
- **Document Type Selection**: Choose specific document types for each service
- **Add-ons**: Extra pages, courier service, and rush service options
- **Shopping Cart**: Add services to cart with real-time pricing
- **Real Stripe Checkout**: Secure payment processing with your Stripe test checkout link
- **Appointment Booking**: Automatic appointment booking with Cal.com integration
- **Meeting Links**: Integration with Whereby for remote notarization meetings
- **Email Confirmations**: Automatic confirmation emails
- **Calendar Integration**: Add appointments to customer and notary calendars

## Important Note

This application is designed as a **service-specific extension** to an existing WordPress website. The following pages are intentionally hidden from navigation since they already exist on the WordPress site:
- About Us
- Contact
- How It Works

**Authentication-First Approach**: The application now requires users to authenticate before accessing any services. This ensures a secure and personalized experience.

**User Flow**:
1. **Landing Page**: Users first see the Login/Signup page
2. **Authentication**: Users must sign in or create an account
3. **Services Access**: After successful authentication, users are redirected to the Services page
4. **Service Selection**: Browse and select notarization services
5. **Checkout**: Complete customer information and payment
7. **Appointment Booking**: Automatic booking with Cal.com
8. **Confirmation**: Email confirmation and calendar invitation sent

**Home Page Design**: The home page has been simplified and is only accessible after authentication. It serves as a minimal welcome page that directs users to the Services page.

This approach provides a secure, focused experience for users who come specifically for the notarization services while maintaining the existing WordPress content.

## Services Offered

1. **Power of Attorney** - $35.00
2. **Certified Copy of Document** - $20.00
3. **Certified Copy of Passport/ID** - $25.00
4. **Online Content Notarization** - $30.00
5. **Signature Notarization** - $25.00
6. **Apostille Services** - $50.00
7. **Contract Certification** - $40.00
8. **Notarized Sworn Translation** - $60.00
9. **Company Registration** - $80.00
10. **Vital Certificates Replacement** - $45.00

## Add-ons Available

- **Extra Pages**: $5.00 per additional page
- **Courier Service**: $15.00 for document delivery
- **Rush Service**: $20.00 for expedited processing

## Technology Stack

- **Frontend**: React 18, TypeScript, Vite
- **Styling**: Tailwind CSS, Framer Motion
- **State Management**: Redux Toolkit
- **Forms**: React Hook Form with Zod validation
- **Authentication**: Firebase Authentication
- **Database**: Firestore (Firebase)
- **Payment**: Stripe
- **Appointments**: Cal.com integration
- **Meetings**: Whereby integration

## Getting Started

### Prerequisites

- Node.js 18+ 
- npm or yarn
- Firebase account (for authentication and database)
- Stripe account (for payment processing)
- Cal.com account (for appointment booking)

### Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd notarette-express
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Firebase Setup**
   - Create a Firebase project at [firebase.google.com](https://firebase.google.com)
   - Enable Authentication (Email/Password)
   - Enable Firestore Database
   - Get your Firebase config from Project Settings
   - Update the Firebase configuration in `src/config/firebase.ts`

4. **Environment Setup**
   Create a `.env` file in the root directory:
   ```env
   VITE_STRIPE_PUBLISHABLE_KEY=pk_test_your_stripe_key_here
   VITE_CAL_MEETING_LINK=https://cal.com/marcus-whereby-xu25ac/remote-notarization-meeting-test
   ```

5. **Start the development server**
   ```bash
   npm run dev
   ```

6. **Open your browser**
   Navigate to `http://localhost:5173`

## Configuration

### Stripe Setup

1. Create a Stripe account at [stripe.com](https://stripe.com)
2. **Create a Checkout Link**:
   - Go to Stripe Dashboard → Checkout → Payment Links
   - Create a new payment link for your services
   - Set the success URL to: `https://yourdomain.com/payment-success?session_id={CHECKOUT_SESSION_ID}`
   - Copy the checkout link URL
3. **Update the Checkout URL** in `src/pages/Checkout.tsx`:
   ```typescript
   const STRIPE_CHECKOUT_URL = 'https://buy.stripe.com/your_checkout_link_here'
   ```
4. For production, set up webhook endpoints for payment confirmation

### Cal.com Integration

1. Create a Cal.com account at [cal.com](https://cal.com)
2. Set up your notary calendar
3. Update the meeting link in your `.env` file
4. Configure webhook endpoints for appointment confirmations

### Backend API (Production)

For production deployment, you'll need to implement the backend API endpoints:

- `POST /api/create-payment-intent` - Create Stripe payment intent
- `POST /api/confirm-payment` - Confirm payment with Stripe
- `POST /api/book-appointment` - Book appointment with Cal.com
- `POST /api/send-confirmation-email` - Send confirmation emails
- `POST /api/add-to-calendar` - Add to calendar
- `POST /api/create-cal-event` - Create Cal.com event

## Project Structure

```
src/
├── components/
│   ├── cart/           # Shopping cart components
│   ├── home/           # Home page components
│   ├── layout/         # Layout components (Header, Footer)
│   ├── services/       # Service-related components
│   └── ui/             # Reusable UI components
├── data/
│   └── services.ts     # Service definitions and data
├── hooks/              # Custom React hooks
├── pages/              # Page components
├── services/           # API and external service integrations
├── store/              # Redux store and slices
└── main.tsx           # Application entry point
```

## Usage Flow

1. **Browse Services**: Users visit the services page to view available notarization services
2. **Select Service**: Choose a service and document type
3. **Add Add-ons**: Select extra pages, courier, or rush service if needed
4. **Checkout**: Complete customer information and proceed to Stripe checkout
6. **Stripe Payment**: Complete payment securely on Stripe's hosted checkout page
7. **Success Redirect**: User is redirected back to your app after successful payment
8. **Thank You Page**: Display order summary and purchased services
9. **Book Appointment**: User clicks button to go to Cal.com for appointment scheduling
10. **Cal.com Booking**: User books their preferred appointment time on Cal.com
11. **Confirmation**: Email confirmation and calendar invitation sent
12. **Meeting**: Customer receives meeting link for remote notarization

## Customization

### Adding New Services

1. Update `src/data/services.ts` with new service details
2. Add document types and pricing options
3. Update the services grid in `src/pages/Services.tsx`

### Modifying Pricing

1. Update service prices in `src/data/services.ts`
2. Modify add-on pricing in the service options
3. Update cart calculations in `src/store/slices/cartSlice.ts`

### Styling Changes

1. Modify Tailwind classes in components
2. Update theme colors in `tailwind.config.js`
3. Add custom animations with Framer Motion

## Deployment

### Build for Production

```bash
npm run build
```

### Deploy to Vercel

1. Install Vercel CLI: `npm i -g vercel`
2. Deploy: `vercel --prod`

### Environment Variables for Production

```env
VITE_STRIPE_PUBLISHABLE_KEY=pk_live_your_production_stripe_key
VITE_CAL_MEETING_LINK=https://cal.com/your-production-meeting-link
```

## Security Considerations

- Never expose Stripe secret keys in frontend code
- Implement proper CORS policies for API endpoints
- Use HTTPS in production
- Validate all form inputs server-side
- Implement rate limiting for API endpoints

## Support

For support and questions:
- Check the documentation
- Review the code comments
- Contact the development team

## License

This project is licensed under the MIT License - see the LICENSE file for details.

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

---

**Note**: This is a demonstration application. For production use, ensure all security measures are properly implemented and all external services are properly configured.

