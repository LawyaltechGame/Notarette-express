import { Client, Databases, ID } from 'node-appwrite';
import Stripe from 'stripe';

// Minimal service catalog to compute totals and booking link on the server
// Keep in sync with src/data/services.ts (only essentials used here)
const SERVICES = [
  {
    slug: 'power-of-attorney',
    name: 'Power of Attorney',
    priceCents: 100,
    currency: 'eur',
    calComBookingLink: 'https://cal.com/marcus-whereby-xu25ac/remote-notarization-meeting-test'
  },
  {
    slug: 'certified-copy-passport-id',
    name: 'Certified Copy of Passport/ID',
    priceCents: 100,
    currency: 'eur',
    calComBookingLink: 'https://cal.com/marcus-whereby-xu25ac/remote-notarization-meeting-test'
  },
  {
    slug: 'company-formation-documents',
    name: 'Company Formation Documents',
    priceCents: 100,
    currency: 'eur',
    calComBookingLink: 'https://cal.com/marcus-whereby-xu25ac/remote-notarization-meeting-test'
  },
  {
    slug: 'document-translation-notarization',
    name: 'Document Translation & Notarization',
    priceCents: 100,
    currency: 'eur',
    calComBookingLink: 'https://cal.com/marcus-whereby-xu25ac/remote-notarization-meeting-test'
  },
  {
    slug: 'real-estate-document-notarization',
    name: 'Real Estate Document Notarization',
    priceCents: 100,
    currency: 'eur',
    calComBookingLink: 'https://cal.com/marcus-whereby-xu25ac/remote-notarization-meeting-test'
  },
  {
    slug: 'estate-planning-document-notarization',
    name: 'Estate Planning Document Notarization',
    priceCents: 100,
    currency: 'eur',
    calComBookingLink: 'https://cal.com/marcus-whereby-xu25ac/remote-notarization-meeting-test'
  },
  {
    slug: 'passport',
    name: 'Passport',
    priceCents: 100,
    currency: 'eur',
    calComBookingLink: 'https://cal.com/marcus-whereby-xu25ac/remote-notarization-meeting-test'
  },
  {
    slug: 'diplomas-and-degrees',
    name: 'Diplomas and Degrees',
    priceCents: 100,
    currency: 'eur',
    calComBookingLink: 'https://cal.com/marcus-whereby-xu25ac/remote-notarization-meeting-test'
  },
  {
    slug: 'academic-transcripts',
    name: 'Academic Transcripts',
    priceCents: 100,
    currency: 'eur',
    calComBookingLink: 'https://cal.com/marcus-whereby-xu25ac/remote-notarization-meeting-test'
  },
  {
    slug: 'bank-statements',
    name: 'Bank Statements',
    priceCents: 100,
    currency: 'eur',
    calComBookingLink: 'https://cal.com/marcus-whereby-xu25ac/remote-notarization-meeting-test'
  },
  {
    slug: 'deeds-of-title-transfer',
    name: 'Deeds of Title Transfer',
    priceCents: 100,
    currency: 'eur',
    calComBookingLink: 'https://cal.com/marcus-whereby-xu25ac/remote-notarization-meeting-test'
  },
  {
    slug: 'board-and-shareholder-resolutions',
    name: 'Board and Shareholder Resolutions',
    priceCents: 100,
    currency: 'eur',
    calComBookingLink: 'https://cal.com/marcus-whereby-xu25ac/remote-notarization-meeting-test'
  },
  {
    slug: 'sale-and-purchase-agreements',
    name: 'Sale and Purchase Agreements',
    priceCents: 100,
    currency: 'eur',
    calComBookingLink: 'https://cal.com/marcus-whereby-xu25ac/remote-notarization-meeting-test'
  }
];

const findServiceBySlug = (slug) => SERVICES.find(s => s.slug === slug);

export default async ({ req, res, log, error }) => {
  log('Stripe Payment function: version 2025-09-03-1');
  const stripeSecret = process.env.STRIPE_SECRET_KEY;
  if (!stripeSecret) {
    error('Missing STRIPE_SECRET_KEY env');
    return res.json({ error: 'Server misconfigured' }, 500);
  }

  const stripe = new Stripe(stripeSecret, { apiVersion: '2024-06-20' });

  let body = {};
  try {
    const raw = typeof req.payload === 'string' && req.payload.length > 0
      ? req.payload
      : (typeof req.body === 'string' ? req.body : '');
    body = raw ? JSON.parse(raw) : {};
    log(`Parsed payload keys: ${Object.keys(body).join(', ') || 'none'}`);
  } catch (e) {
    log(`Payload parse error: ${e?.message || e}`);
    return res.json({ error: 'Invalid JSON body' }, 400);
  }

  // Health/test
  if (body.test) {
    log('Health check requested, responding ok:true');
    return res.json({ ok: true });
  }

  // Create a refund for a paid Checkout Session or Payment Intent
  if (body.refund && (body.sessionId || body.paymentIntentId)) {
    try {
      const stripe = new Stripe(stripeSecret, { apiVersion: '2024-06-20' });
      let paymentIntentId = body.paymentIntentId || null;
      if (!paymentIntentId && body.sessionId) {
        const session = await stripe.checkout.sessions.retrieve(body.sessionId, { expand: ['payment_intent'] });
        if (!session || !session.payment_intent) {
          error(`Refund: No payment_intent found for session ${body.sessionId}`);
          return res.json({ error: 'Payment not found for this session' }, 404);
        }
        paymentIntentId = typeof session.payment_intent === 'string' ? session.payment_intent : session.payment_intent.id;
      }

      if (!paymentIntentId) {
        return res.json({ error: 'Missing payment_intent for refund' }, 400);
      }

      const params = { payment_intent: paymentIntentId };
      // Optional partial refund amount in cents
      if (typeof body.amountCents === 'number' && body.amountCents > 0) {
        params.amount = Math.floor(body.amountCents);
      }
      // Optional reason: requested_by_customer | duplicate | fraudulent
      if (typeof body.reason === 'string' && body.reason) {
        params.reason = body.reason;
      }

      const refund = await stripe.refunds.create(params);
      log(`Refund created: ${refund.id} for payment_intent ${paymentIntentId}`);
      return res.json({ ok: true, refund });
    } catch (e) {
      error(`Refund error: ${e?.message || e}`);
      return res.json({ error: 'Failed to create refund' }, 500);
    }
  }

  // Verify a session and persist order
  if (body.sessionId) {
    try {
      const session = await stripe.checkout.sessions.retrieve(body.sessionId, {
        expand: ['line_items']
      });

      const paid = session.payment_status === 'paid';
      const amount = session.amount_total ?? null;
      const currency = session.currency ?? 'eur';
      const customerEmail = session.customer_details?.email ?? (session.customer_email || null);
      const serviceSlug = session.metadata?.serviceSlug ?? null;
      const calLink = session.metadata?.calLink ?? null;

      if (paid) {
        // Persist in Appwrite DB (best done via webhooks in production)
        const databaseId = process.env.APPWRITE_DATABASE_ID;
        const collectionId = process.env.APPWRITE_COLLECTION_ID;
        if (databaseId && collectionId) {
          try {
            await databases.createDocument(
              databaseId,
              collectionId,
              ID.unique(),
              {
                sessionId: body.sessionId,
                amount,
                currency,
                customerEmail,
                serviceSlug,
                calLink,
                status: 'paid',
                createdAt: new Date().toISOString()
              }
            );
          } catch (dbErr) {
            error(`DB write failed: ${dbErr?.message || dbErr}`);
          }
        }
      }

      const verifyResponse = {
        paid,
        amount,
        currency,
        customer: { email: customerEmail, name: session.customer_details?.name ?? null },
        items: (session.line_items?.data || []).map(li => ({
          name: li.description,
          qty: li.quantity || 1,
          priceId: li.price?.id || '',
          amountCents: (typeof li.amount_total === 'number' ? li.amount_total : (li.price?.unit_amount || 0) * (li.quantity || 1))
        })),
        subtotalCents: session.metadata?.subtotalCents ? Number(session.metadata.subtotalCents) : null,
        vatCents: session.metadata?.vatCents ? Number(session.metadata.vatCents) : null,
        totalCents: session.metadata?.totalCents ? Number(session.metadata.totalCents) : (typeof session.amount_total === 'number' ? session.amount_total : null),
        calLink
      };
      log(`Verify response: paid=${paid}, amount=${amount}, currency=${currency}, calLink=${calLink || 'none'}`);
      return res.json(verifyResponse);
    } catch (e) {
      error(`Session verify error: ${e?.message || e}`);
      return res.json({ error: 'Failed to verify session' }, 500);
    }
  }

  // Create checkout session
  try {
    const { successUrl: clientSuccessUrl, failureUrl, items, idempotencyKey: clientIdempotencyKey, userId, userEmail } = body;
    if (!Array.isArray(items) || items.length === 0) {
      log('No items provided in payload');
      return res.json({ error: 'No items provided' }, 400);
    }

    // For now we support single main service item from the client payload
    const first = items[0];
    const serviceSlug = first?.serviceId;
    const optionKeys = Array.isArray(first?.optionKeys) ? first.optionKeys : [];
    const extraCopies = Number(first?.extraCopies || 0);
    const addOnIds = Array.isArray(first?.addOnIds) ? first.addOnIds : [];
    const service = findServiceBySlug(serviceSlug);
    if (!service) {
      log(`Unknown service slug received: ${serviceSlug}`);
      return res.json({ error: 'Unknown service' }, 400);
    }

    const calLink = service.calComBookingLink;

    // Build a stable idempotency key to prevent duplicate sessions on retries
    const idempotencyKey = clientIdempotencyKey || `ck_${serviceSlug}_${Math.floor(Date.now() / 30000)}`; // 30s window fallback

    // Build dynamic line items based on UI pricing to keep parity
    const lineItems = [];
    let subtotalCents = 0;

    // Selected service types from Service Selection
    // base → service.priceCents, signature → 4900, true-content → 3900
    const selectedServiceTypes = new Set(optionKeys);
    if (selectedServiceTypes.has('base')) {
      lineItems.push({
        price_data: {
          currency: service.currency,
          product_data: { name: service.name },
          unit_amount: 100
        },
        quantity: 1
      });
      subtotalCents += 100;
    }
    if (selectedServiceTypes.has('signature')) {
      lineItems.push({
        price_data: {
          currency: service.currency,
          product_data: { name: 'Signature Notarization' },
          unit_amount: 100
        },
        quantity: 1
      });
      subtotalCents += 100;
    }
    if (selectedServiceTypes.has('true-content')) {
      lineItems.push({
        price_data: {
          currency: service.currency,
          product_data: { name: 'True Content Verification' },
          unit_amount: 100
        },
        quantity: 1
      });
      subtotalCents += 100;
    }

    // Extra certified copies: €15.00 per copy
    if (extraCopies > 0) {
      const amount = 100 * extraCopies;
      lineItems.push({
        price_data: {
          currency: service.currency,
          product_data: { name: `Extra Copies × ${extraCopies}` },
          unit_amount: amount
        },
        quantity: 1
      });
      subtotalCents += amount;
    }

    // Add-ons from AddOns page: courier 1500, apostille 8900, express 2500
    const addonPriceByKey = { courier: 100, apostille: 100, express: 100 };
    for (const addKey of addOnIds) {
      const amount = addonPriceByKey[addKey] || 0;
      if (amount > 0) {
        lineItems.push({
          price_data: {
            currency: service.currency,
            product_data: { name: addKey === 'courier' ? 'Courier Delivery' : addKey === 'apostille' ? 'Apostille Service' : 'Express 24h Processing' },
            unit_amount: amount
          },
          quantity: 1
        });
        subtotalCents += amount;
      }
    }

const vatCents = 0;

const successUrl = process.env.STRIPE_SUCCESS_URL || clientSuccessUrl || 'https://notarette-express.vercel.app/post-checkout?session_id={CHECKOUT_SESSION_ID}';
const cancelUrl = process.env.STRIPE_CANCEL_URL || failureUrl || 'https://notarette-express.vercel.app/payment-cancelled';

// If we have an email from the signed-in user, create a Customer so Checkout uses it
let customerId = undefined;
try {
  if (typeof userEmail === 'string' && userEmail) {
    const createdCustomer = await stripe.customers.create(
      { email: String(userEmail) },
      { idempotencyKey: `cust_${String(userEmail).toLowerCase()}_${new Date().toISOString().slice(0, 10)}` }
    );
    customerId = createdCustomer?.id;
    log(`Using Stripe customer ${customerId} for email ${userEmail}`);
  }
} catch (custErr) {
  error(`Customer create failed (continuing without): ${custErr?.message || custErr}`);
}

const session = await stripe.checkout.sessions.create({
  mode: 'payment',
  line_items: lineItems,
  success_url: successUrl,
  cancel_url: cancelUrl,
  payment_method_types: ['card', 'bancontact', 'eps'],
  // Prefer binding to a specific customer to ensure the correct email is shown
  customer: customerId,
  customer_creation: 'always',
  client_reference_id: typeof userId === 'string' && userId ? String(userId) : undefined,
  metadata: {
    serviceSlug,
    calLink,
    subtotalCents: String(subtotalCents),
    vatCents: String(vatCents),
    totalCents: String(subtotalCents + vatCents),
    optionKeys: optionKeys.join(','),
    extraCopies: String(extraCopies)
  }
}, { idempotencyKey });
log(`Created Stripe session: ${session.id}, url: ${session.url}`);
return res.json({ url: session.url });
  } catch (e) {
    error(`Checkout create error: ${e?.message || e}`);
    return res.json({ error: 'Failed to create checkout session' }, 500);
  }
};
