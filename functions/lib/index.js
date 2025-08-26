"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.seedCatalog = exports.stripeWebhook = exports.createCheckout = void 0;
const https_1 = require("firebase-functions/v2/https");
const v2_1 = require("firebase-functions/v2");
const logger = require("firebase-functions/logger");
const admin = require("firebase-admin");
const firestore_1 = require("firebase-admin/firestore");
const stripe_1 = require("stripe");
(0, v2_1.setGlobalOptions)({ region: 'us-central1', maxInstances: 10 });
if (!admin.apps.length) {
    admin.initializeApp();
}
const db = (0, firestore_1.getFirestore)();
// ==== TEMP SECRETS (DEV ONLY) ====
const STRIPE_SECRET_KEY = 'sk_test_51RzArkGTuyVGItJwSanfj2QFq1qbCAfN0to2K6GeWh9kR1R764pTI4m6w1wcMP7N8S62pXua9IZxatUvikg8V6gQ00xpJ2XW5Q';
const WEBHOOK_SIGNING_SECRET = 'whsec_HuSUU5KJrLSRxW1jIH7W9nX8UcOr8kmm';
const SUCCESS_URL_BASE = 'https://cal.com/marcus-whereby-xu25ac/notarization-session-meeting-test';
const DEV_CANCEL_URL = 'http://localhost:5173/checkout';
const PROD_CANCEL_URL = 'https://notarette-express.vercel.app/checkout';
const IS_EMULATOR = process.env.FUNCTIONS_EMULATOR === 'true';
const CANCEL_URL = IS_EMULATOR ? DEV_CANCEL_URL : PROD_CANCEL_URL;
const stripe = new stripe_1.default(STRIPE_SECRET_KEY, { apiVersion: '2023-10-16' });
async function recalcFromFirestore(items) {
    var _a, _b;
    const serviceIds = Array.from(new Set(items.map(i => i.serviceId)));
    const serviceSnaps = await db.getAll(...serviceIds.map(id => db.collection('services').doc(id)));
    const serviceMap = new Map();
    for (const s of serviceSnaps) {
        if (!s.exists)
            throw new https_1.HttpsError('failed-precondition', `Service ${s.id} not found`);
        serviceMap.set(s.id, s.data());
    }
    const allAddOnIds = Array.from(new Set(items.flatMap(i => { var _a; return (_a = i.addOnIds) !== null && _a !== void 0 ? _a : []; })));
    const addOnMap = new Map();
    if (allAddOnIds.length > 0) {
        const addOnSnaps = await db.getAll(...allAddOnIds.map(id => db.collection('addons').doc(id)));
        for (const a of addOnSnaps) {
            if (!a.exists)
                throw new https_1.HttpsError('failed-precondition', `Add-on ${a.id} not found`);
            addOnMap.set(a.id, a.data());
        }
    }
    const currency = 'INR';
    const computed = { lines: [], total: 0, currency, normalized: [] };
    for (const ci of items) {
        const svc = serviceMap.get(ci.serviceId);
        const qty = Math.max(1, ci.quantity || 1);
        const baseAmount = Number(svc.priceCents || 0);
        computed.lines.push({ name: svc.name, amount: baseAmount, currency, quantity: qty });
        computed.total += baseAmount * qty;
        for (const addOnId of (_a = ci.addOnIds) !== null && _a !== void 0 ? _a : []) {
            const addon = addOnMap.get(addOnId);
            const addAmount = Number(addon.priceCents || 0);
            computed.lines.push({ name: addon.name, amount: addAmount, currency, quantity: qty });
            computed.total += addAmount * qty;
        }
        computed.normalized.push({ serviceId: ci.serviceId, quantity: qty, addOnIds: (_b = ci.addOnIds) !== null && _b !== void 0 ? _b : [] });
    }
    // Apply VAT similar to frontend (21%)
    const vatCents = Math.round(computed.total * 0.21);
    if (vatCents > 0) {
        computed.lines.push({ name: 'VAT (21%)', amount: vatCents, currency, quantity: 1 });
        computed.total += vatCents;
    }
    return computed;
}
exports.createCheckout = (0, https_1.onCall)(async (req) => {
    var _a;
    try {
        if (!((_a = req.data) === null || _a === void 0 ? void 0 : _a.items) || !Array.isArray(req.data.items) || req.data.items.length === 0) {
            throw new https_1.HttpsError('invalid-argument', 'items[] required');
        }
        const { lines, total, currency, normalized } = await recalcFromFirestore(req.data.items);
        const orderRef = db.collection('orders').doc();
        const orderId = orderRef.id;
        await orderRef.set({
            status: 'pending',
            createdAt: firestore_1.FieldValue.serverTimestamp(),
            currency,
            totalCents: total,
            items: normalized,
        });
        const line_items = lines.map(l => ({
            quantity: l.quantity,
            price_data: {
                currency: l.currency.toLowerCase(),
                unit_amount: l.amount,
                product_data: { name: l.name },
            },
        }));
        const session = await stripe.checkout.sessions.create({
            mode: 'payment',
            line_items,
            success_url: `${SUCCESS_URL_BASE}?orderId=${orderId}`,
            cancel_url: CANCEL_URL,
            metadata: { orderId },
        });
        return { url: session.url };
    }
    catch (err) {
        logger.error('createCheckout error', err);
        if (err instanceof https_1.HttpsError)
            throw err;
        throw new https_1.HttpsError('internal', (err === null || err === void 0 ? void 0 : err.message) || 'createCheckout failed');
    }
});
exports.stripeWebhook = (0, https_1.onRequest)({ maxInstances: 10 }, async (req, res) => {
    var _a, _b, _c, _d;
    try {
        const sig = req.headers['stripe-signature'];
        if (!sig || Array.isArray(sig)) {
            res.status(400).send('Missing signature');
            return;
        }
        const buf = await getRawBody(req);
        let event;
        try {
            event = stripe.webhooks.constructEvent(buf, sig, WEBHOOK_SIGNING_SECRET);
        }
        catch (err) {
            logger.error('Webhook signature verification failed', err);
            res.status(400).send(`Webhook Error: ${err.message}`);
            return;
        }
        if (event.type === 'checkout.session.completed') {
            const session = event.data.object;
            const orderId = (_a = session.metadata) === null || _a === void 0 ? void 0 : _a.orderId;
            if (orderId) {
                await db.collection('orders').doc(orderId).set({
                    status: 'paid',
                    paidAt: firestore_1.FieldValue.serverTimestamp(),
                    amount_total: (_b = session.amount_total) !== null && _b !== void 0 ? _b : null,
                    currency: (_c = session.currency) !== null && _c !== void 0 ? _c : null,
                    payment_intent: (_d = session.payment_intent) !== null && _d !== void 0 ? _d : null,
                    session_id: session.id,
                }, { merge: true });
            }
        }
        res.status(200).send({ received: true });
    }
    catch (err) {
        logger.error('stripeWebhook error', err);
        res.status(500).send('Internal error');
    }
});
function getRawBody(req) {
    return new Promise((resolve, reject) => {
        try {
            const chunks = [];
            req.on('data', (chunk) => chunks.push(chunk));
            req.on('end', () => resolve(Buffer.concat(chunks)));
            req.on('error', reject);
        }
        catch (e) {
            reject(e);
        }
    });
}
// Emulator-only: seed Firestore with minimal services/addons so createCheckout works
exports.seedCatalog = (0, https_1.onRequest)({ maxInstances: 1 }, async (req, res) => {
    try {
        if (!IS_EMULATOR) {
            res.status(403).send('Forbidden');
            return;
        }
        const batch = db.batch();
        const services = [
            { id: 'certified-copy-document', name: 'Certified Copy', priceCents: 2900, currency: 'INR' },
            { id: 'power-of-attorney', name: 'Power of Attorney', priceCents: 8900, currency: 'INR' },
            { id: 'signature-verification', name: 'Signature Verification', priceCents: 4900, currency: 'INR' },
            { id: 'apostille-services', name: 'Apostille Service', priceCents: 11900, currency: 'INR' },
        ];
        for (const s of services) {
            batch.set(db.collection('services').doc(s.id), { name: s.name, priceCents: s.priceCents, currency: s.currency });
        }
        const addons = [
            { id: 'courier', name: 'Courier Delivery', priceCents: 1500 },
            { id: 'apostille', name: 'Apostille Service Add-on', priceCents: 8900 },
            { id: 'express', name: 'Express 24h Processing', priceCents: 2500 },
        ];
        for (const a of addons) {
            batch.set(db.collection('addons').doc(a.id), { name: a.name, priceCents: a.priceCents });
        }
        await batch.commit();
        res.status(200).send({ ok: true });
    }
    catch (e) {
        logger.error('seedCatalog error', e);
        res.status(500).send('seed failed');
    }
});
//# sourceMappingURL=index.js.map