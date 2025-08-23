"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.createCheckoutSession = void 0;
const functions = require("firebase-functions");
const stripe_1 = require("stripe");
// Initialize Stripe with secret key
// Dev (emulator): STRIPE_SECRET_KEY=sk_test_*** available to the emulator
// Prod (cloud): firebase functions:config:set stripe.secret_key="sk_live_***"
const stripe = new stripe_1.default(process.env.STRIPE_SECRET_KEY || '', {
    apiVersion: '2023-10-16',
});
exports.createCheckoutSession = functions.https.onCall(async (data, context) => {
    try {
        const { cartItems, customerInfo, successUrl, cancelUrl } = data;
        if (!cartItems || cartItems.length === 0) {
            throw new functions.https.HttpsError('invalid-argument', 'Cart items are required');
        }
        if (!customerInfo.email) {
            throw new functions.https.HttpsError('invalid-argument', 'Customer email is required');
        }
        // Create line items for Stripe
        const lineItems = [];
        cartItems.forEach((item) => {
            var _a, _b, _c, _d, _e, _f;
            // Base service item
            const itemName = item.selectedDocument
                ? `${item.name} - ${item.selectedDocument}`
                : item.name;
            lineItems.push({
                price_data: {
                    currency: 'usd',
                    product_data: {
                        name: itemName,
                        description: `Notarization service for ${item.name}`,
                    },
                    unit_amount: item.priceCents, // Stripe expects amount in cents
                },
                quantity: item.quantity,
            });
            // Add rush service if selected
            if ((_a = item.addOns) === null || _a === void 0 ? void 0 : _a.rushService) {
                const rushPrice = ((_b = item.serviceOptions) === null || _b === void 0 ? void 0 : _b.rushServicePriceCents) || 2500; // Default $25.00
                lineItems.push({
                    price_data: {
                        currency: 'usd',
                        product_data: {
                            name: 'Rush Service',
                            description: `Rush service for ${item.name}`,
                        },
                        unit_amount: rushPrice,
                    },
                    quantity: item.quantity,
                });
            }
            // Add courier service if selected
            if ((_c = item.addOns) === null || _c === void 0 ? void 0 : _c.courier) {
                const courierPrice = ((_d = item.serviceOptions) === null || _d === void 0 ? void 0 : _d.courierPriceCents) || 1500; // Default $15.00
                lineItems.push({
                    price_data: {
                        currency: 'usd',
                        product_data: {
                            name: 'Courier Service',
                            description: `Courier service for ${item.name}`,
                        },
                        unit_amount: courierPrice,
                    },
                    quantity: 1, // Courier is per order, not per item
                });
            }
            // Add extra pages if selected
            if (((_e = item.addOns) === null || _e === void 0 ? void 0 : _e.extraPages) && item.addOns.extraPages > 0) {
                const extraPagePrice = ((_f = item.serviceOptions) === null || _f === void 0 ? void 0 : _f.extraPagesPriceCents) || 500; // Default $5.00
                lineItems.push({
                    price_data: {
                        currency: 'usd',
                        product_data: {
                            name: 'Extra Pages',
                            description: `${item.addOns.extraPages} extra pages for ${item.name}`,
                        },
                        unit_amount: extraPagePrice,
                    },
                    quantity: item.addOns.extraPages,
                });
            }
        });
        // Create Stripe checkout session
        const session = await stripe.checkout.sessions.create({
            payment_method_types: ['card'],
            line_items: lineItems,
            mode: 'payment',
            success_url: successUrl,
            cancel_url: cancelUrl,
            customer_email: customerInfo.email,
            metadata: {
                customerName: `${customerInfo.firstName} ${customerInfo.lastName}`,
                customerPhone: customerInfo.phone,
                cartItems: JSON.stringify(cartItems),
            },
            billing_address_collection: 'required',
            shipping_address_collection: {
                allowed_countries: ['US', 'CA'], // Adjust as needed
            },
            allow_promotion_codes: true,
        });
        return {
            sessionId: session.id,
            url: session.url || '',
        };
    }
    catch (error) {
        console.error('Error creating checkout session:', error);
        if (error instanceof stripe_1.default.errors.StripeError) {
            throw new functions.https.HttpsError('internal', `Stripe error: ${error.message}`);
        }
        throw new functions.https.HttpsError('internal', 'Failed to create checkout session');
    }
});
//# sourceMappingURL=createCheckoutSession.js.map