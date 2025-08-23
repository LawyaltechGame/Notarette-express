"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.checkSession = void 0;
const functions = require("firebase-functions");
const stripe_1 = require("stripe");
// Initialize Stripe with secret key
// Dev (emulator): STRIPE_SECRET_KEY=sk_test_*** available to the emulator
// Prod (cloud): firebase functions:config:set stripe.secret_key="sk_live_***"
const stripe = new stripe_1.default(process.env.STRIPE_SECRET_KEY || '', {
    apiVersion: '2023-10-16',
});
exports.checkSession = functions.https.onCall(async (data, context) => {
    var _a, _b, _c, _d, _e;
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
        let reason = null;
        if (!paid && session.payment_intent && typeof session.payment_intent !== 'string') {
            const paymentIntent = session.payment_intent;
            if ((_a = paymentIntent.last_payment_error) === null || _a === void 0 ? void 0 : _a.message) {
                reason = paymentIntent.last_payment_error.message;
            }
            else {
                reason = `Payment status: ${session.payment_status}`;
            }
        }
        // Extract line items
        const items = ((_b = session.line_items) === null || _b === void 0 ? void 0 : _b.data.map((item) => {
            var _a;
            return ({
                name: item.description || 'Unknown item',
                qty: item.quantity || 1,
                priceId: ((_a = item.price) === null || _a === void 0 ? void 0 : _a.id) || '',
            });
        })) || [];
        // Extract customer information
        const customer = {
            email: ((_c = session.customer_details) === null || _c === void 0 ? void 0 : _c.email) || null,
            name: ((_d = session.customer_details) === null || _d === void 0 ? void 0 : _d.name) || null,
        };
        console.log(`Session ${sessionId} checked - Paid: ${paid}, Amount: ${session.amount_total}`);
        return {
            paid,
            reason,
            amount: session.amount_total,
            currency: ((_e = session.currency) === null || _e === void 0 ? void 0 : _e.toUpperCase()) || null,
            items,
            customer,
        };
    }
    catch (error) {
        console.error('Error checking session:', error);
        if (error instanceof stripe_1.default.errors.StripeError) {
            throw new functions.https.HttpsError('internal', `Stripe error: ${error.message}`);
        }
        if (error instanceof functions.https.HttpsError) {
            throw error;
        }
        throw new functions.https.HttpsError('internal', 'Failed to verify payment session');
    }
});
//# sourceMappingURL=checkSession.js.map