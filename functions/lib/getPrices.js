"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getPrices = void 0;
const functions = require("firebase-functions");
const stripe_1 = require("stripe");
const stripe = new stripe_1.default(process.env.STRIPE_SECRET_KEY || '', {
    apiVersion: '2023-10-16',
});
exports.getPrices = functions.https.onCall(async (data, context) => {
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
                const product = price.product;
                return {
                    priceId: price.id,
                    unitAmount: price.unit_amount,
                    currency: price.currency,
                    productName: (product === null || product === void 0 ? void 0 : product.name) || null,
                };
            }
            catch (error) {
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
    }
    catch (error) {
        console.error('Error in getPrices function:', error);
        if (error instanceof stripe_1.default.errors.StripeError) {
            throw new functions.https.HttpsError('internal', `Stripe error: ${error.message}`);
        }
        if (error instanceof functions.https.HttpsError) {
            throw error;
        }
        throw new functions.https.HttpsError('internal', 'Failed to retrieve prices');
    }
});
//# sourceMappingURL=getPrices.js.map