"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.createPaymentLink = void 0;
const functions = require("firebase-functions");
const stripe_1 = require("stripe");
// Initialize Stripe with secret key
const stripe = new stripe_1.default(process.env.STRIPE_SECRET_KEY || 'sk_test_51RzArkGTuyVGItJwSanfj2QFq1qbCAfN0to2K6GeWh9kR1R764pTI4m6w1wcMP7N8S62pXua9IZxatUvikg8V6gQ00xpJ2XW5Q', {
    apiVersion: '2023-10-16',
});
exports.createPaymentLink = functions.https.onCall(async (data, context) => {
    try {
        const { cartItems, customerInfo, successUrl, cancelUrl } = data;
        if (!cartItems || cartItems.length === 0) {
            throw new functions.https.HttpsError('invalid-argument', 'Cart items are required');
        }
        // Create line items for Stripe
        const lineItems = cartItems.map(item => {
            const lineItem = {
                price_data: {
                    currency: 'usd',
                    product_data: {
                        name: item.name,
                        description: item.selectedDocument ? `Document: ${item.selectedDocument}` : undefined,
                    },
                    unit_amount: item.priceCents, // Stripe expects amount in cents
                },
                quantity: item.quantity,
            };
            // Add add-ons as separate line items
            if (item.addOns) {
                if (item.addOns.extraPages && item.addOns.extraPages > 0) {
                    lineItems.push({
                        price_data: {
                            currency: 'usd',
                            product_data: {
                                name: `${item.name} - Extra Pages`,
                                description: `${item.addOns.extraPages} additional pages`,
                            },
                            unit_amount: 500, // $5.00 per extra page
                        },
                        quantity: item.addOns.extraPages,
                    });
                }
                if (item.addOns.courier) {
                    lineItems.push({
                        price_data: {
                            currency: 'usd',
                            product_data: {
                                name: `${item.name} - Courier Service`,
                                description: 'Express courier delivery',
                            },
                            unit_amount: 1500, // $15.00 for courier
                        },
                        quantity: 1,
                    });
                }
                if (item.addOns.rushService) {
                    lineItems.push({
                        price_data: {
                            currency: 'usd',
                            product_data: {
                                name: `${item.name} - Rush Service`,
                                description: 'Same-day processing',
                            },
                            unit_amount: 2500, // $25.00 for rush service
                        },
                        quantity: 1,
                    });
                }
            }
            return lineItem;
        });
        // Create Stripe checkout session
        const session = await stripe.checkout.sessions.create({
            payment_method_types: [
                'card',
                'link',
                'apple_pay',
                'google_pay',
                'us_bank_account',
                'sepa_debit',
                'ideal',
                'bancontact',
                'sofort',
                'giropay',
                'eps',
                'p24',
                'blik',
                'affirm',
                'klarna',
                'afterpay_clearpay'
            ],
            line_items: lineItems.flat(),
            mode: 'payment',
            success_url: successUrl,
            cancel_url: cancelUrl,
            customer_email: customerInfo.email,
            metadata: {
                customerName: `${customerInfo.firstName} ${customerInfo.lastName}`,
                customerPhone: customerInfo.phone,
                serviceIds: cartItems.map(item => item.id).join(','),
            },
            billing_address_collection: 'required',
        });
        return { url: session.url };
    }
    catch (error) {
        console.error('Error creating payment link:', error);
        if (error instanceof stripe_1.default.errors.StripeError) {
            throw new functions.https.HttpsError('internal', `Stripe error: ${error.message}`);
        }
        throw new functions.https.HttpsError('internal', 'Failed to create payment link');
    }
});
//# sourceMappingURL=createPaymentLink.js.map